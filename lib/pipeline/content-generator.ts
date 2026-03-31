// =============================================================================
// content-generator.ts - Main blog content pipeline orchestrator
// =============================================================================

import fs from 'fs';
import path from 'path';
import { generateContent } from './ai-provider';
import { researchTopic } from './scraper';
import { generateBlogImage } from './image-generator';
import { factCheckContent } from './fact-checker';
import { injectAffiliateLinks } from './affiliate-injector';
import { commitFiles, CommitFile } from './github-commit';

// ---------------------------------------------------------------------------
// Topic bank (fallback when queue is exhausted)
// ---------------------------------------------------------------------------

const TOPIC_BANK: TopicEntry[] = [
  { id: 'mexico-city-hidden-gems', title: 'Hidden Gems in Mexico City: 15 Spots Tourists Miss', category: 'city-guide', keywords: ['mexico city hidden gems', 'secret spots cdmx'], city: 'Mexico City', region: 'Central Mexico' },
  { id: 'yucatan-food-trail', title: 'Yucatan Food Trail: From Cochinita Pibil to Papadzules', category: 'food', keywords: ['yucatan food', 'cochinita pibil'], region: 'Yucatan Peninsula' },
  { id: 'oaxaca-artisan-markets', title: 'Oaxaca Artisan Markets: Complete Shopping Guide', category: 'culture', keywords: ['oaxaca markets', 'oaxaca shopping'], city: 'Oaxaca', region: 'Oaxaca & Chiapas' },
  { id: 'mexico-wellness-retreats', title: 'Best Wellness Retreats in Mexico: Yoga, Temazcal & Spa', category: 'activities', keywords: ['mexico wellness retreat', 'yoga retreat mexico'], region: 'Central Mexico' },
  { id: 'cabo-snorkeling-guide', title: 'Snorkeling in Los Cabos: Best Spots & What to Expect', category: 'beaches', keywords: ['cabo snorkeling', 'los cabos underwater'], city: 'Los Cabos', region: 'Baja California' },
  { id: 'mexico-train-travel', title: 'Train Travel in Mexico: Chepe, Tren Maya & More', category: 'practical', keywords: ['mexico train', 'chepe train', 'tren maya'], region: 'Central Mexico' },
  { id: 'puebla-day-trip-cdmx', title: 'Puebla Day Trip from Mexico City: What to See & Eat', category: 'city-guide', keywords: ['puebla day trip', 'puebla from mexico city'], city: 'Puebla', region: 'Central Mexico' },
  { id: 'mexico-cenote-types', title: 'Open, Semi-Open & Cave Cenotes: Which Type Is Right for You?', category: 'nature', keywords: ['cenote types', 'best cenotes mexico'], region: 'Yucatan Peninsula' },
  { id: 'guadalajara-tequila-express', title: 'Tequila Express: Guadalajara to Tequila Town by Train', category: 'food', keywords: ['tequila express', 'guadalajara tequila tour'], city: 'Guadalajara', region: 'Central Mexico' },
  { id: 'mexico-volcano-hikes', title: 'Volcano Hiking in Mexico: From Nevado de Toluca to Iztaccihuatl', category: 'nature', keywords: ['mexico volcano hiking', 'nevado de toluca'], region: 'Central Mexico' },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TopicEntry {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  scrapeUrls?: string[];
  city?: string;
  region?: string;
  priority?: number;
  status?: string;
}

interface QueueFile {
  topics: TopicEntry[];
  metadata?: Record<string, unknown>;
}

export interface PipelineResult {
  slug: string;
  title: string;
  category: string;
  factCheckScore: number;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Authors rotation
// ---------------------------------------------------------------------------

const AUTHORS = ['go2mexico-team', 'carlos-mendoza', 'sarah-mitchell'];

function pickAuthor(): string {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

// ---------------------------------------------------------------------------
// Topic selection
// ---------------------------------------------------------------------------

function getQueuePath(): string {
  return path.join(process.cwd(), 'content', 'topic-queue.json');
}

function loadQueue(): QueueFile {
  const queuePath = getQueuePath();
  if (!fs.existsSync(queuePath)) {
    return { topics: [] };
  }
  const raw = fs.readFileSync(queuePath, 'utf-8');
  return JSON.parse(raw) as QueueFile;
}

function getExistingSlugs(): Set<string> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  if (!fs.existsSync(blogDir)) return new Set();
  return new Set(
    fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
  );
}

export function selectNextTopic(): TopicEntry | null {
  const existingSlugs = getExistingSlugs();
  const queue = loadQueue();

  // Find pending topics from queue, sorted by priority
  const pending = queue.topics
    .filter(t => t.status === 'pending' && !existingSlugs.has(t.id))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  if (pending.length > 0) {
    return pending[0];
  }

  // Fallback to topic bank
  const bankPending = TOPIC_BANK.filter(t => !existingSlugs.has(t.id));
  if (bankPending.length > 0) {
    return bankPending[Math.floor(Math.random() * bankPending.length)];
  }

  return null;
}

function markTopicUsed(topicId: string): void {
  const queuePath = getQueuePath();
  if (!fs.existsSync(queuePath)) return;

  const queue = loadQueue();
  const topic = queue.topics.find(t => t.id === topicId);
  if (topic) {
    topic.status = 'published';
    // Don't write to filesystem in production (Vercel is read-only)
    // The topic will be tracked by the existence of the blog .md file
    try {
      fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
    } catch {
      // Expected to fail on Vercel's read-only filesystem
      console.log(`[content-generator] Could not update queue file (read-only fs)`);
    }
  }
}

// ---------------------------------------------------------------------------
// Sitemap internal link loader
// ---------------------------------------------------------------------------

async function loadSitemapLinks(): Promise<string> {
  const siteUrl = 'https://go2-mexico.com';

  try {
    // Try to read from local sitemap.xml file first (faster than HTTP)
    const localSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    let xml: string;

    if (fs.existsSync(localSitemapPath)) {
      xml = fs.readFileSync(localSitemapPath, 'utf-8');
    } else {
      // Fallback to HTTP fetch
      const response = await fetch(`${siteUrl}/sitemap.xml`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return FALLBACK_INTERNAL_LINKS;
      xml = await response.text();
    }

    const urlMatches = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    const allUrls = urlMatches
      .map((m) => m.replace(/<\/?loc>/g, ''))
      .filter((url) => url.startsWith(siteUrl))
      // Keep only English (no locale prefix)
      .filter((url) => {
        const p = url.replace(siteUrl, '');
        return !p.match(/^\/(es|de|fr|zh|ja|ko)\//);
      });

    // Group by section and limit per section
    const groups: Record<string, string[]> = {};
    for (const url of allUrls) {
      const p = url.replace(siteUrl, '');
      if (!p || p === '/') continue;
      const section = p.split('/')[1] || 'other';
      if (!groups[section]) groups[section] = [];
      if (groups[section].length < 15) {
        groups[section].push(url);
      }
    }

    // Build descriptive anchor text from URL structure
    const buildAnchor = (url: string, section: string): string => {
      const parts = url.split('/').filter(Boolean);
      const lastPart = parts[parts.length - 1] || section;
      const name = lastPart.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      // Add section context for richer anchor text
      const sectionLabels: Record<string, string> = {
        cities: 'travel guide',
        destinations: 'destination guide',
        food: 'food guide',
        blog: '',
        regions: 'region guide',
        experiences: 'experience guide',
        itineraries: 'itinerary',
      };
      const label = sectionLabels[section];
      if (label && !name.toLowerCase().includes('guide') && !name.toLowerCase().includes(section)) {
        return `${name} ${label}`;
      }
      return name;
    };

    let result = '';
    for (const [section, urls] of Object.entries(groups)) {
      if (urls.length === 0) continue;
      result += `${section}:\n`;
      for (const url of urls) {
        const anchor = buildAnchor(url, section);
        result += `- [${anchor}](${url})\n`;
      }
      result += '\n';
    }
    return result || FALLBACK_INTERNAL_LINKS;
  } catch {
    return FALLBACK_INTERNAL_LINKS;
  }
}

// Fallback internal links if sitemap can't be read
const FALLBACK_INTERNAL_LINKS = `
cities:
- [Mexico City travel guide](https://go2-mexico.com/cities/mexico-city/)
- [Cancun travel guide](https://go2-mexico.com/cities/cancun/)
- [Oaxaca City travel guide](https://go2-mexico.com/cities/oaxaca-city/)
- [Playa Del Carmen travel guide](https://go2-mexico.com/cities/playa-del-carmen/)
- [Tulum travel guide](https://go2-mexico.com/cities/tulum/)
- [Guadalajara travel guide](https://go2-mexico.com/cities/guadalajara/)
- [Merida travel guide](https://go2-mexico.com/cities/merida/)
- [Puerto Vallarta travel guide](https://go2-mexico.com/cities/puerto-vallarta/)
- [San Miguel De Allende travel guide](https://go2-mexico.com/cities/san-miguel-de-allende/)
- [Guanajuato travel guide](https://go2-mexico.com/cities/guanajuato/)

regions:
- [Baja California region guide](https://go2-mexico.com/regions/baja-california/)
- [Central Mexico region guide](https://go2-mexico.com/regions/central-mexico/)
- [Oaxaca Chiapas region guide](https://go2-mexico.com/regions/oaxaca-chiapas/)
- [Pacific Coast region guide](https://go2-mexico.com/regions/pacific-coast/)
- [Yucatan Peninsula region guide](https://go2-mexico.com/regions/yucatan-peninsula/)

destinations:
- [Chichen Itza destination guide](https://go2-mexico.com/destinations/chichen-itza/)
- [Teotihuacan destination guide](https://go2-mexico.com/destinations/teotihuacan/)
- [Tulum Ruins destination guide](https://go2-mexico.com/destinations/tulum-ruins/)
- [Cenotes Yucatan destination guide](https://go2-mexico.com/destinations/cenotes-yucatan/)
- [Copper Canyon destination guide](https://go2-mexico.com/destinations/copper-canyon/)

food:
- [Mexican Food Guide](https://go2-mexico.com/food/)

experiences:
- [Cenote Swimming experience guide](https://go2-mexico.com/experiences/cenote-swimming/)
- [Day Of The Dead experience guide](https://go2-mexico.com/experiences/day-of-the-dead/)
- [Cooking Class Oaxaca experience guide](https://go2-mexico.com/experiences/cooking-class-oaxaca/)

blog:
- [Best Beaches Mexico](https://go2-mexico.com/blog/best-beaches-mexico/)
- [Mexico Travel Costs 2026](https://go2-mexico.com/blog/mexico-travel-costs-2026/)
- [Is Mexico Safe For Tourists](https://go2-mexico.com/blog/is-mexico-safe-for-tourists/)
- [Getting Around Mexico](https://go2-mexico.com/blog/getting-around-mexico/)
- [Best Time To Visit Mexico](https://go2-mexico.com/blog/best-time-to-visit-mexico/)
`;

// ---------------------------------------------------------------------------
// Content generation prompt
// ---------------------------------------------------------------------------

function buildBlogPrompt(topic: TopicEntry, research: string, sitemapLinks: string): string {
  const cityContext = topic.city ? ` focusing on ${topic.city}` : '';
  const regionContext = topic.region ? ` in the ${topic.region} region` : '';
  const today = new Date().toISOString().split('T')[0];

  let widgetReference = '';
  try {
    const refPath = path.join(process.cwd(), 'content', 'writer-reference.md');
    if (fs.existsSync(refPath)) {
      widgetReference = fs.readFileSync(refPath, 'utf-8');
    }
    const affRefPath = path.join(process.cwd(), 'content', 'affiliate-reference.txt');
    if (fs.existsSync(affRefPath)) {
      widgetReference += '\n\n---\nFULL AFFILIATE & WIDGET REFERENCE:\n' + fs.readFileSync(affRefPath, 'utf-8');
    }
  } catch { /* ignore */ }

  const categoryInstructions: Record<string, string> = {
    'city-guide': 'Write an in-depth city/destination guide. Cover neighborhoods, top sights, where to eat, where to stay, and practical tips. Structure chronologically or by area. Include a 1-day and 3-day itinerary suggestion.',
    food: 'Write a comprehensive Mexican food guide. Explain the dish/cuisine with cultural context, regional variations, where to find the best versions, and how to order like a local. Include a comparison table of similar dishes.',
    activities: 'Write a detailed activities/experiences guide. Compare options (operators, prices, locations), give honest pros/cons, and include a practical booking guide at the end.',
    practical: 'Write a thorough practical travel guide. Cover all scenarios, give exact prices and steps, and anticipate common questions. Accuracy is critical — cite official sources where possible.',
    budget: 'Write a realistic budget travel guide with exact costs in Mexican Pesos and USD. Include sample day budgets, money-saving tips, and where to splurge vs. save.',
    seasonal: 'Write a seasonal/festival travel guide. Cover what happens, when, where the best locations are, and how to plan. Include practical tips for crowds and booking.',
    beaches: 'Write a comprehensive beach/coastal guide. Cover water conditions, activities, accommodation options, how to get there, and who each beach suits best.',
    culture: 'Write a rich cultural guide. Cover historical context, local traditions, artisan crafts, markets, and practical visitor tips.',
    nature: 'Write a detailed nature/outdoors guide. Cover trail conditions, difficulty levels, safety, permits, best seasons, and gear recommendations.',
  };

  const catInstruction = categoryInstructions[topic.category] || categoryInstructions['city-guide'];

  const contextSection = research
    ? `\nREFERENCE DATA — THIS IS YOUR PRIMARY SOURCE OF TRUTH:
Use ONLY the facts, prices, statistics, and details from the data below. If a fact is NOT in this reference data, do NOT include it — leave it out rather than guess.
Every price, statistic, and specific claim MUST come from this data or a cited external source. When in doubt, say "prices vary" rather than inventing a number.
CRITICAL: Any proper noun (restaurant name, hotel name, person's name, shop name) that does NOT appear in the data below is FORBIDDEN. Do not use names from your training data. If you want to mention a specific venue, it must be named in the data below — otherwise describe it generically.

${research.slice(0, 6000)}\n`
    : `\nNO REFERENCE DATA AVAILABLE: Write only in general terms. Do NOT name any specific restaurants, hotels, venues, or people. Use generic descriptions only (e.g. "a rooftop restaurant in Condesa", "a local posada", "a market vendor").\n`;

  return `You are a senior Mexico travel writer for go2-mexico.com, a comprehensive Mexico travel resource.
You and your team have lived in and traveled Mexico extensively — Mexico City for 3 years, explored the Yucatan coast, hiked Oaxaca's mountains, and navigated Guadalajara as locals. You write from genuine first-hand experience.

Write a comprehensive, SEO-optimized blog post about: "${topic.title}"${cityContext}${regionContext}.

${catInstruction}

---

CONTENT REQUIREMENTS:

1. FRONTMATTER (YAML):
Generate valid YAML frontmatter with these exact fields:
\`\`\`yaml
---
title: "${topic.title}"
slug: "${topic.id}"
date: "${today}"
author:
  name: "Go2Mexico Team"
category: "${topic.category}"
tags: [${topic.keywords.map(k => `"${k}"`).join(', ')}]
image: "/images/blog/${topic.id}.webp"
description: "Compelling meta description under 155 characters"
featured: false
readingTime: 10
lastUpdated: "${today}"
sources:
  - name: "Mexico Tourism Board"
    url: "https://www.visitmexico.com/"
  - name: "Lonely Planet Mexico"
    url: "https://www.lonelyplanet.com/mexico"
---
\`\`\`
Replace SLUG in the image path with the actual slug value.
Add 2-3 more relevant sources. Include 4-6 specific, relevant tags.

2. OPENING PARAGRAPH:
Hook the reader immediately. Start with a compelling fact, scene-setting description, or provocative question. **Bold the primary keyword** on first mention. 2-3 sentences max before the Key Takeaways table.

3. KEY TAKEAWAYS TABLE (immediately after intro):
\`\`\`markdown
## Key Takeaways

| Question | Answer |
|----------|--------|
| **What is the best time to visit?** | Answer with **bold keyword** |
| **How much does it cost?** | Average costs in MXN and USD |
| **How do I get there?** | Best transport option |
| **Is it safe?** | Honest safety assessment |
| **What should I book in advance?** | Specific recommendations |
\`\`\`
5-7 rows covering the key questions readers have.

4. BODY SECTIONS (8-10 numbered H2 sections):
Each section must have:
- Numbered H2: ## 1. Section Title
- 2 opening paragraphs with **bold keywords** on first mention
- 2 H3 subheadings (### Subheading) with 1-2 paragraphs each
- At least half the sections: a bullet list with 3-5 items. Start each item with a bold descriptive label like: **Best Spot:** or **Pro Tip:** or **Budget Option:** (use a REAL descriptive label, NEVER write the literal words "Bold Label")
- First-person experience signals ("When we visited...", "In our experience...", "During our time in...")

5. DID YOU KNOW CALLOUTS (2-3 throughout the article):
\`\`\`markdown
> **Did You Know?** The actual interesting fact with a specific statistic here.
>
> *Source: [Source Name](https://source-url.com)*
\`\`\`

6. COMPARISON TABLE (at least one):
\`\`\`markdown
| Option | Best For | Cost | Rating |
|--------|----------|------|--------|
| **Option A** | Description | MXN X | ⭐⭐⭐⭐⭐ |
| **Option B** | Description | MXN X | ⭐⭐⭐⭐ |
\`\`\`

7. FAQ SECTION (end of article — optimized for Google rich snippets):
\`\`\`markdown
## Frequently Asked Questions

### Question one here?
Answer here in 2-3 concise sentences. Include a specific detail or number.

### Question two here?
Answer here. Link to a relevant internal page for more detail.
\`\`\`
5-7 questions matching REAL Google "People Also Ask" queries for this topic. Write questions as users would actually type them (e.g., "How much does it cost to visit Cancun?" not "Cost information"). Keep answers concise (2-4 sentences) but include at least one specific fact per answer.

8. CONCLUSION:
Summarize key points, include a clear CTA linking to a relevant go2-mexico.com page, and a trust statement.

---

INTERNAL LINKING (critical for SEO — MANDATORY: include 10-15 internal links naturally woven throughout the body):
- Spread links EVENLY across ALL sections — every H2 section should have at least 1 internal link
- Use DESCRIPTIVE, keyword-rich anchor text — e.g., "our Mexico City travel guide" or "top things to do in Cancun", NOT just "Mexico City" or "click here"
- Vary anchor text: mix exact city names with longer phrases like "plan your trip to [city]" or "read our [topic] guide"
- EVERY internal link MUST have a full URL starting with https://go2-mexico.com/. If you're unsure of the URL, use the closest match from the sitemap below or omit the link entirely.
- Link city mentions to city guide pages: e.g., [explore our Mexico City travel guide](https://go2-mexico.com/cities/mexico-city/)
- Link food mentions to food pages: e.g., [Mexican food guide](https://go2-mexico.com/food/)
- Link destination mentions to destination pages: e.g., [Chichen Itza destination guide](https://go2-mexico.com/destinations/chichen-itza/)
- Link region mentions to region pages: e.g., [Yucatan Peninsula region guide](https://go2-mexico.com/regions/yucatan-peninsula/)
- Link experience mentions: e.g., [cenote swimming guide](https://go2-mexico.com/experiences/cenote-swimming/)
- Link to RELEVANT blog posts from the sitemap — e.g., if discussing budget, link to a budget blog post
- DO NOT link the same URL twice with the same anchor text — vary it

Available internal links (use the most relevant ones):
${sitemapLinks}
${widgetReference ? `\nWRITER REFERENCE (additional context):\n${widgetReference}\n` : ''}
---

E-E-A-T SIGNALS (critical for Google trust and AdSense approval):
- EXPERIENCE: Every 2-3 sections, include a specific first-person observation ("When we explored...", "Our team spent a week...", "During our last visit in [month]..."). Make these SPECIFIC, not generic — mention weather, crowds, a particular moment.
- EXPERTISE: Use precise, accurate details — prices in MXN and USD, distances in km, travel times. Show deep knowledge of the topic.
- AUTHORITATIVENESS: Cite 3-5 credible external sources throughout (Visit Mexico, Lonely Planet, local news, UNESCO, official sites). Each "Did You Know" callout MUST have a verifiable source.
- TRUSTWORTHINESS: Be honest about negatives, tourist traps, and when something is overrated. Include a "What to avoid" or "Common mistakes" paragraph. Transparency builds trust.
- Every statistic MUST have a source cited inline or in a callout.
- DISCLOSURE: If the article mentions booking anything, include one sentence like: "We may earn a small commission from bookings made through our links, at no extra cost to you. This helps us keep creating free travel guides."

EXTERNAL LINKING:
Include 3-5 credible external links (Visit Mexico, Lonely Planet, local news, UNESCO, official venue websites). Open external links in new tabs with target="_blank".

---

ANTI-HALLUCINATION RULES (CRITICAL — FOLLOW EXACTLY):
1. NEVER invent prices, statistics, percentages, or specific numbers. Use ONLY data from the REFERENCE DATA section below or well-known public facts.
2. If you don't have a specific price from the reference data, write "prices vary" or "check the latest prices" with a link. Do NOT guess.
3. NEVER fabricate quotes, testimonials, or specific venue details you're unsure about.
4. PROPER NOUNS ARE FORBIDDEN unless they appear verbatim in the REFERENCE DATA above. This means: restaurant names, hotel names, bar names, shop names, guide names, staff names, chef names — if it's not in the reference data, do NOT name it. Write "a local taqueria near the zocalo" instead of inventing a name. Write "our guide" instead of inventing a name. This rule has NO exceptions.
5. Specific addresses and opening hours MUST come verbatim from the reference data. If not in the data, omit them or link to Google Maps generically.
6. For historical facts and cultural context, use only widely known, verifiable information.
7. If the reference data contradicts common assumptions, ALWAYS prefer the reference data.
8. Every "Did You Know" callout MUST have a real, verifiable source link — not a made-up one.
9. Be honest: "Based on our research..." is better than fabricating a firsthand experience you don't have data for.
10. NEVER output meta-instructions, content strategy notes, or behind-the-scenes commentary. Your output must be ONLY the blog post that a reader would see. Do NOT include sections like "Affiliate Integration Points", "Internal linking notes", or "Examples in context".
11. NEVER mention affiliate brand names explicitly. Just describe the travel action naturally — the brand names and links are added automatically after your writing.

STATISTICS & NUMBERS FACT-CHECK (MANDATORY — apply to EVERY number you write):
12. Before writing ANY statistic, percentage, or number, ask yourself: "Can I name the EXACT source this comes from?" If not, DO NOT include it.
13. FORBIDDEN number patterns — these are commonly hallucinated and MUST NOT appear unless from reference data:
    - "X% of travelers/tourists/visitors" — these survey numbers are almost always fabricated
    - "X million visitors per year" — only use the EXACT official number if you know it with certainty
    - "X% cheaper/more expensive than..." — unless you have both prices from reference data to calculate
    - "ranked #X in the world" — only if you can name the ranking organization
    - "X out of Y travelers recommend..." — satisfaction surveys are never general knowledge
    - "dating back X years/centuries" — only for well-documented historical facts (e.g., Teotihuacan built ~100 BCE-250 CE)
14. SAFE statistics you CAN use (well-documented public knowledge):
    - Mexico has 35 UNESCO World Heritage Sites (as of 2024)
    - Mexico City is one of the largest cities in the Americas
    - Mexico's official currency is the Mexican Peso (MXN)
    - Specific UNESCO World Heritage Sites and their inscription years
    - Geographic facts (country area, coastline length, number of states: 31 + CDMX)
15. When in doubt, describe QUALITATIVELY instead of QUANTITATIVELY. Write "Mexico is one of the world's most visited destinations" instead of inventing a fake visitor number.
16. Every "Did You Know" callout MUST pass this test: could a reader Google the exact claim and find it on a reputable site within 30 seconds? If not, rewrite it without the specific number.

---

TARGET LENGTH: 2500-3500 words of body content (excluding frontmatter). Longer posts rank better — aim for comprehensive coverage.
TONE: Knowledgeable, warm, practical — like advice from a well-traveled friend who knows Mexico deeply. Avoid generic AI-sounding phrases like "Whether you're a budget backpacker or luxury traveler" or "Mexico has something for everyone". Be specific and opinionated.
ANTI-AI WRITING RULES: Vary sentence length (mix short punchy sentences with longer descriptive ones). Use contractions naturally. Start some sentences with "And" or "But". Include occasional sentence fragments for emphasis. Avoid predictable list-style paragraphs where every sentence follows the same structure. Never use the phrases: "vibrant tapestry", "nestled in", "hidden gem", "a testament to", "whether you're", "offers something for everyone", "rich history", "embark on", "unveil", "breathtaking". Write like a real human travel writer, not a language model.
${contextSection}

RESPOND WITH THE COMPLETE BLOG POST — frontmatter + Markdown body only. No preamble, no explanation.`;
}

// ---------------------------------------------------------------------------
// Frontmatter generation
// ---------------------------------------------------------------------------

function buildFrontmatter(topic: TopicEntry, author: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tags = generateTags(topic);

  const lines = [
    '---',
    `title: "${topic.title}"`,
    `description: "Complete guide to ${topic.title.toLowerCase()}. Practical tips, costs, and insider advice for your Mexico trip."`,
    `slug: "${topic.id}"`,
    `updatedAt: "${today}"`,
    `author: "${author}"`,
    `heroImage: "/images/blog/${topic.id}.webp"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    `category: "${topic.category}"`,
  ];

  if (topic.region) {
    lines.push(`region: "${topic.region}"`);
  }
  if (topic.city) {
    lines.push(`city: "${topic.city}"`);
  }

  lines.push('---');
  return lines.join('\n');
}

function generateTags(topic: TopicEntry): string[] {
  const tags = new Set<string>();

  // Category as tag
  tags.add(topic.category);

  // City and region
  if (topic.city) tags.add(topic.city.toLowerCase().replace(/\s+/g, '-'));
  if (topic.region) tags.add(topic.region.toLowerCase().replace(/\s+/g, '-'));

  // Extract meaningful words from keywords
  for (const kw of topic.keywords) {
    const words = kw.split(/\s+/).filter(w => w.length > 3);
    for (const w of words.slice(0, 2)) {
      tags.add(w.toLowerCase());
    }
  }

  return Array.from(tags).slice(0, 8);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

export async function generateBlogPost(
  topic?: TopicEntry
): Promise<PipelineResult> {
  // 1. Topic selection
  const selectedTopic = topic ?? selectNextTopic();
  if (!selectedTopic) {
    return {
      slug: '',
      title: '',
      category: '',
      factCheckScore: 0,
      error: 'No topics available - queue and topic bank are exhausted',
    };
  }

  console.log(`[pipeline] Starting: "${selectedTopic.title}" (${selectedTopic.id})`);

  const author = pickAuthor();

  // 2. Research phase
  console.log('[pipeline] Researching topic...');
  let research = '';
  try {
    research = await researchTopic(
      selectedTopic.title,
      selectedTopic.scrapeUrls ?? []
    );
    console.log(`[pipeline] Research collected: ${research.length} chars`);
  } catch (err) {
    console.warn('[pipeline] Research failed, continuing with AI knowledge only:', err);
  }

  // 3. Load sitemap links for internal linking
  console.log('[pipeline] Loading sitemap links...');
  let sitemapLinks = FALLBACK_INTERNAL_LINKS;
  try {
    sitemapLinks = await loadSitemapLinks();
    console.log(`[pipeline] Sitemap links loaded: ${sitemapLinks.length} chars`);
  } catch (err) {
    console.warn('[pipeline] Failed to load sitemap links, using fallback:', err);
  }

  // 4. Content generation
  console.log('[pipeline] Generating content...');
  const prompt = buildBlogPrompt(selectedTopic, research, sitemapLinks);
  let content: string;
  try {
    content = await generateContent(prompt, {
      maxTokens: 6000,
      temperature: 0.7,
      systemPrompt: 'You are an expert Mexico travel writer for go2-mexico.com. Write engaging, accurate, and helpful travel content with 2500-3500 words. Always include specific prices in MXN and USD, practical details, and internal links to go2-mexico.com pages.',
    });
  } catch (err) {
    return {
      slug: selectedTopic.id,
      title: selectedTopic.title,
      category: selectedTopic.category,
      factCheckScore: 0,
      error: `Content generation failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 5. Fact checking
  console.log('[pipeline] Fact checking...');
  let factCheckScore = 100;
  try {
    const factResult = await factCheckContent(content, selectedTopic.title);
    factCheckScore = factResult.score;
    content = factResult.cleanedContent;

    const flagged = factResult.claims.filter(c => c.flagged);
    if (flagged.length > 0) {
      console.warn(`[pipeline] Fact check flagged ${flagged.length} claims:`);
      flagged.forEach(c => console.warn(`  - [${c.type}] "${c.text}": ${c.suggestion}`));
    }
    console.log(`[pipeline] Fact check score: ${factCheckScore}/100`);
  } catch (err) {
    console.warn('[pipeline] Fact checking failed, continuing:', err);
  }

  // 6. Affiliate link injection
  console.log('[pipeline] Injecting affiliate links...');
  content = injectAffiliateLinks(content, selectedTopic.category, selectedTopic.city);

  // 7. Build final markdown
  const frontmatter = buildFrontmatter(selectedTopic, author);
  const markdown = `${frontmatter}\n\n${content}`;

  // 8. Image generation
  console.log('[pipeline] Generating hero image...');
  let imageBuffer: Buffer | null = null;
  try {
    imageBuffer = await generateBlogImage(selectedTopic.title, selectedTopic.category);
    if (imageBuffer) {
      console.log(`[pipeline] Image generated: ${imageBuffer.length} bytes`);
    }
  } catch (err) {
    console.warn('[pipeline] Image generation failed:', err);
  }

  // 9. Commit to GitHub
  console.log('[pipeline] Committing to GitHub...');
  const files: CommitFile[] = [
    {
      path: `content/blog/${selectedTopic.id}.md`,
      content: markdown,
      encoding: 'utf-8',
    },
  ];

  if (imageBuffer) {
    files.push({
      path: `public/images/blog/${selectedTopic.id}.webp`,
      content: imageBuffer,
      encoding: 'base64',
    });
  }

  let commitSha: string | undefined;
  let commitUrl: string | undefined;

  try {
    const result = await commitFiles(
      files,
      `blog: add "${selectedTopic.title}"`
    );
    commitSha = result.sha;
    commitUrl = result.url;
    console.log(`[pipeline] Committed: ${commitSha}`);
  } catch (err) {
    return {
      slug: selectedTopic.id,
      title: selectedTopic.title,
      category: selectedTopic.category,
      factCheckScore,
      error: `GitHub commit failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 10. Mark topic as used
  markTopicUsed(selectedTopic.id);

  console.log(`[pipeline] Done: "${selectedTopic.title}"`);

  return {
    slug: selectedTopic.id,
    title: selectedTopic.title,
    category: selectedTopic.category,
    factCheckScore,
    commitSha,
    commitUrl,
  };
}
