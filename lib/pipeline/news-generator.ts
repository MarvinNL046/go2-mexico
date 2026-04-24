/**
 * News article generator (EN + NL) for content/news/.
 *
 * Flow:
 *  1. Scrape a list of Thailand-news source URLs and harvest candidate
 *     headlines from the resulting markdown.
 *  2. Pick one headline that we have NOT already published (de-dupe by slug
 *     and by fuzzy title match against existing news files).
 *  3. Ask Grok 4.1 Fast to write an EN news article (~500-800 words) about
 *     that headline, using the scraped source content as reference data.
 *  4. Ask Grok 4 Fast to translate the EN article to NL.
 *  5. Caller commits both files to content/news/{en,nl}/.
 *
 * The result format mirrors existing news articles:
 *   ---
 *   title, slug (date-prefixed), date, category, source, tags, description
 *   ---
 *   2-4 H2 sections, total ~500-800 words.
 */

import fs from 'fs';
import path from 'path';
import { generateContent } from './ai-provider';
import { scrapeUrl, scrapeTravelNews } from './scraper';
import { getGoogleNews } from './serp';
import { loadPipelineConfig } from './pipeline-config';

// -------------------------------------------------------------------
// Thailand fallback sources. Sister sites should normally use Google News via
// cfg.newsQuery, or provide their own scrapeNewsSources in pipeline.config.json.
// We include a mix of English-language news + ThailandBlog.nl (Dutch source
// that translates regional news, often picks up stories the others miss).
// -------------------------------------------------------------------

const NEWS_SOURCES = [
  'https://thethaiger.com/news/thailand',
  'https://www.bangkokpost.com/thailand',
  'https://www.bangkokpost.com/travel',
  'https://www.thailandblog.nl/en/',
  'https://www.tatnews.org/',
];

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

export interface NewsCandidate {
  rawTitle: string;
  sourceUrl: string;
  sourceName: string;
  sourceContent: string;     // first ~3KB of scraped markdown around the headline
}

export interface GeneratedNewsArticle {
  locale: 'en' | 'nl';
  slug: string;              // e.g. 2026-04-14-bangkok-airport-extension
  title: string;
  date: string;
  category: string;
  sourceUrl: string;
  sourceName: string;
  description: string;
  content: string;           // full markdown with frontmatter
}

// -------------------------------------------------------------------
// Slug helpers
// -------------------------------------------------------------------

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','to','of','for','on','in','at','by','with',
  'from','about','as','into','over','after','before','is','are','was','were',
  'be','been','being','this','that','these','those','it','its','his','her',
]);

function slugifyTitle(title: string, dateIso: string): string {
  const dateOnly = dateIso.slice(0, 10);
  const slug = title
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .filter(w => w && !STOP_WORDS.has(w))
    .slice(0, 8)
    .join('-')
    .slice(0, 70);
  return `${dateOnly}-${slug || 'thailand-news'}`;
}

// -------------------------------------------------------------------
// Candidate harvesting — pull headlines from a scraped markdown blob.
// Heuristic: look for lines that look like headlines (10-150 chars, no
// trailing punctuation other than ?!. and that contain "Thailand", a city,
// or a clearly news-y verb).
// -------------------------------------------------------------------

const HEADLINE_HINTS = [
  'thailand','bangkok','phuket','chiang mai','pattaya','krabi','koh ',
  'tat ','tourism','baht','songkran','minister','flight','airport','visa',
  'ferry','train','election','floods','heatwave','monsoon','protest',
];

function extractHeadlinesFromContent(content: string, sourceUrl: string): string[] {
  const hostname = new URL(sourceUrl).hostname;
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const headlines = new Set<string>();

  for (const line of lines) {
    // Markdown headers — most likely real headlines
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      const t = headerMatch[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      if (t.length >= 10 && t.length <= 200 && /[a-z]/i.test(t)) headlines.add(t);
      continue;
    }
    // Markdown link lines like "[Title](url)"
    const linkMatch = line.match(/\[(.+?)\]\((https?:\/\/[^)]+)\)/);
    if (linkMatch) {
      const t = linkMatch[1].trim();
      if (t.length >= 15 && t.length <= 200) {
        const lower = t.toLowerCase();
        if (HEADLINE_HINTS.some(h => lower.includes(h))) headlines.add(t);
      }
    }
  }

  // De-dupe near-identical (case + whitespace differences)
  const seen = new Set<string>();
  const out: string[] = [];
  for (const h of headlines) {
    const k = h.toLowerCase().replace(/\s+/g, ' ').trim();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(h);
  }
  // Re-rank — prefer those with a Thailand keyword + verb-y tone.
  return out.sort((a, b) => {
    const score = (s: string) => {
      const l = s.toLowerCase();
      let n = 0;
      for (const h of HEADLINE_HINTS) if (l.includes(h)) n++;
      return n;
    };
    return score(b) - score(a);
  }).slice(0, 8);
}

// -------------------------------------------------------------------
// Candidate selection — skip anything we already published
// -------------------------------------------------------------------

function existingNewsTitles(): string[] {
  try {
    const dir = path.join(process.cwd(), 'content', 'news', 'en');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const c = fs.readFileSync(path.join(dir, f), 'utf8');
        const m = c.match(/^title:\s*["']?(.+?)["']?\s*$/m);
        return m ? m[1].toLowerCase() : '';
      })
      .filter(Boolean);
  } catch { return []; }
}

function existingNewsSlugs(): Set<string> {
  try {
    const dir = path.join(process.cwd(), 'content', 'news', 'en');
    if (!fs.existsSync(dir)) return new Set();
    return new Set(
      fs.readdirSync(dir).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, '')),
    );
  } catch { return new Set(); }
}

function fuzzyMatchExisting(candidate: string, existing: string[]): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const c = norm(candidate);
  if (c.length < 20) return false;
  for (const e of existing) {
    const en = norm(e);
    // Word-overlap fraction
    const cWords = new Set(c.split(' ').filter(w => w.length > 3));
    const eWords = new Set(en.split(' ').filter(w => w.length > 3));
    if (cWords.size === 0) continue;
    let overlap = 0;
    for (const w of cWords) if (eWords.has(w)) overlap++;
    const ratio = overlap / cWords.size;
    if (ratio >= 0.6) return true;
  }
  return false;
}

// -------------------------------------------------------------------
// Public: harvest candidates from sources
// -------------------------------------------------------------------

export async function harvestCandidates(): Promise<NewsCandidate[]> {
  const existing = existingNewsTitles();
  const candidates: NewsCandidate[] = [];

  const cfg = loadPipelineConfig();
  // PRIMARY: Google News via SerpAPI (one query, ~20 fresh headlines from
  // many sources — much higher signal than scraping HTML pages and
  // counts as 1 SerpAPI call against our 250/month budget).
  if (process.env.SERPAPI_KEY) {
    try {
      const articles = await getGoogleNews(cfg.newsQuery, { hl: 'en', gl: 'us' });
      for (const a of articles.slice(0, 12)) {
        if (!a.title || !a.link) continue;
        if (fuzzyMatchExisting(a.title, existing)) continue;
        // We still scrape the actual story page to give Grok a reference
        // body — Google News only returns title + snippet.
        let body = '';
        try { body = await scrapeUrl(a.link); } catch { /* fall back to snippet only */ }
        candidates.push({
          rawTitle: a.title,
          sourceUrl: a.link,
          sourceName: a.source?.name || new URL(a.link).hostname,
          sourceContent: (body || a.snippet || '').slice(0, 6000),
        });
      }
    } catch (err) {
      console.warn('[news-generator] Google News (SerpAPI) failed, falling back to HTML scrape:', err);
    }
  }

  if (candidates.length > 0) return candidates;

  // FALLBACK: scrape source pages directly when SerpAPI is unavailable.
  const fallbackSources = cfg.scrapeNewsSources?.length
    ? cfg.scrapeNewsSources
    : cfg.country.toLowerCase() === 'thailand'
      ? NEWS_SOURCES
      : [];
  for (const sourceUrl of fallbackSources) {
    try {
      const content = await scrapeUrl(sourceUrl);
      const headlines = extractHeadlinesFromContent(content, sourceUrl);
      const hostname = new URL(sourceUrl).hostname;

      for (const headline of headlines) {
        if (fuzzyMatchExisting(headline, existing)) continue;
        candidates.push({
          rawTitle: headline,
          sourceUrl,
          sourceName: hostname,
          sourceContent: content.slice(0, 6000),
        });
      }
    } catch (err) {
      console.warn(`[news-generator] Scrape failed for ${sourceUrl}:`, err);
    }
  }

  return candidates;
}

// -------------------------------------------------------------------
// Article generation prompts
// -------------------------------------------------------------------

const NEWS_CATEGORIES = ['general', 'politics', 'tourism', 'transport', 'weather', 'culture', 'food', 'business', 'safety'];

function buildEnNewsPrompt(candidate: NewsCandidate, today: string): string {
  const cfg = loadPipelineConfig();
  const siteUrl = `https://${cfg.hostname}`;

  return `You are a ${cfg.country} news writer for ${cfg.hostname}. Write a clear, factual English news article — 500 to 800 words — about this story:

HEADLINE: "${candidate.rawTitle}"
SOURCE: ${candidate.sourceName} (${candidate.sourceUrl})

REFERENCE DATA — your only source of truth (do NOT invent facts beyond this):
${candidate.sourceContent}

REQUIREMENTS:

1. FRONTMATTER (YAML — fill the values exactly):
\`\`\`yaml
---
title: "Compelling, accurate English title (max 90 chars)"
slug: "${today}-url-friendly-slug"
date: "${today}"
category: "one of: ${NEWS_CATEGORIES.join(', ')}"
source:
  name: "${candidate.sourceName}"
  url: "${candidate.sourceUrl}"
  originalTitle: "${candidate.rawTitle.replace(/"/g, '\\"')}"
tags: ["tag1", "tag2", "tag3", "tag4"]
description: "1-2 sentence meta description (140-155 chars) summarising the news"
---
\`\`\`
The slug after the date prefix should be 4-8 lowercase words separated by hyphens, no stop words.

2. BODY (~500-800 words of Markdown):
- Open with the lede — one tight paragraph: who, what, when, where, why.
- 2-4 H2 sections covering: background, what it means for travelers, what's next.
- Use **bold** sparingly, only on names or critical numbers.
- Be honest about what is known vs. speculation. If the source contradicts itself, acknowledge it.
- Do NOT invent quotes, prices, or dates that are not in the source above.
- Do NOT mention Booking.com, Klook, GetYourGuide, 12Go, Saily, or Trip.com — affiliate links are added automatically downstream.
- End with a brief "What This Means for Visitors" or "What's Next" section.

3. INTERNAL LINKS (3-5):
Link relevant entities to existing pages where natural:
- Destinations/cities → ${siteUrl}/city/<slug>/ when that page exists
- Beaches/islands/regions → relevant ${cfg.hostname} guide pages when they exist
- Visa topics → ${siteUrl}/visa/ when relevant
- Practical info → ${siteUrl}/practical-info/ when relevant

4. EXTERNAL LINK:
Link the source name once in the body (e.g. "according to ${candidate.sourceName}").

ANTI-HALLUCINATION:
- Every fact must be in the reference data above OR be widely-known public knowledge.
- If the source mentions an exact number, use it verbatim. Otherwise write "around" or "approximately".
- No fabricated venues, people, or quotes.

OUTPUT:
Reply ONLY with the complete Markdown file — frontmatter + body. No explanations, no preamble.`;
}

function buildNlTranslatePrompt(enContent: string, today: string, candidate: NewsCandidate): string {
  const cfg = loadPipelineConfig();

  return `You translate a ${cfg.country} news article from English to natural, idiomatic Dutch for ${cfg.hostname}.

RULES:
- Preserve frontmatter structure. Translate title and description to NL. Keep slug/date/source/url unchanged.
- Translate \`category\` value to one of: algemeen, politiek, toerisme, vervoer, weer, cultuur, eten, zakelijk, veiligheid (matching the EN value).
- Translate body to natural NL — not literal. Use Dutch news-writing voice.
- Add a short "Wat betekent dit voor reizigers vanuit Nederland?" angle in the closing section if relevant (flights from the Netherlands, EUR-prijzen).
- Translate tags to NL where natural ("tourism" → "toerisme", "transport" → "vervoer"). Keep proper nouns and place names.
- Keep all URLs (internal and external) unchanged.
- Convert any USD prices in the body to € equivalent (≈ €1 = $1.10). Keep THB intact.
- Keep the date "${today}".

Original EN article:

${enContent}

Output ONLY the complete translated Markdown file — frontmatter + body. No preamble.`;
}

// -------------------------------------------------------------------
// Frontmatter parsing helper
// -------------------------------------------------------------------

function extractFrontmatterField(raw: string, field: string): string {
  const m = raw.match(new RegExp(`^${field}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
  return m ? m[1].trim() : '';
}

// -------------------------------------------------------------------
// Public: pick the next candidate + generate EN + NL articles.
// -------------------------------------------------------------------

export interface GenerateNewsResult {
  candidate: NewsCandidate;
  en: GeneratedNewsArticle;
  nl?: GeneratedNewsArticle;
}

export async function generateNextNewsArticle(): Promise<GenerateNewsResult | null> {
  const cfg = loadPipelineConfig();
  const candidates = await harvestCandidates();
  if (candidates.length === 0) {
    console.warn('[news-generator] No candidates harvested.');
    return null;
  }

  const taken = existingNewsSlugs();
  const today = new Date().toISOString().slice(0, 10);

  // Pick the first candidate whose slug we don't already have.
  let chosen: NewsCandidate | null = null;
  for (const c of candidates) {
    const slug = slugifyTitle(c.rawTitle, today);
    if (!taken.has(slug)) { chosen = c; break; }
  }
  if (!chosen) {
    console.log('[news-generator] All candidates already published.');
    return null;
  }

  console.log(`[news-generator] Writing news for: "${chosen.rawTitle}"`);

  // 1. Generate EN article
  const enRaw = await generateContent(buildEnNewsPrompt(chosen, today), {
    model: 'grok-writer',
    maxTokens: 4000,
    temperature: 0.4,
  });

  const enTitle = extractFrontmatterField(enRaw, 'title') || chosen.rawTitle;
  const enSlug = extractFrontmatterField(enRaw, 'slug') || slugifyTitle(chosen.rawTitle, today);
  const enCategory = extractFrontmatterField(enRaw, 'category') || 'general';
  const enDescription = extractFrontmatterField(enRaw, 'description') || '';

  const en: GeneratedNewsArticle = {
    locale: 'en',
    slug: enSlug,
    title: enTitle,
    date: today,
    category: enCategory,
    sourceUrl: chosen.sourceUrl,
    sourceName: chosen.sourceName,
    description: enDescription,
    content: enRaw,
  };

  // 2. Translate to NL via Grok 4 Fast (cheaper than 4.1 for translation,
  //    proven on 250+ blog translations).
  if (!cfg.locales.includes('nl')) {
    return { candidate: chosen, en };
  }

  const nlRaw = await generateContent(buildNlTranslatePrompt(enRaw, today, chosen), {
    model: 'grok-translator',
    maxTokens: 4000,
    temperature: 0.3,
  });

  const nlTitle = extractFrontmatterField(nlRaw, 'title') || enTitle;
  const nlDescription = extractFrontmatterField(nlRaw, 'description') || enDescription;
  const nlCategory = extractFrontmatterField(nlRaw, 'category') || enCategory;

  const nl: GeneratedNewsArticle = {
    locale: 'nl',
    slug: enSlug,        // keep same slug as EN so URLs map cleanly
    title: nlTitle,
    date: today,
    category: nlCategory,
    sourceUrl: chosen.sourceUrl,
    sourceName: chosen.sourceName,
    description: nlDescription,
    content: nlRaw,
  };

  return { candidate: chosen, en, nl };
}
