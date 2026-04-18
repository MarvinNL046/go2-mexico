#!/usr/bin/env node

/**
 * Search-intent discovery for go2-china.com — SerpAPI edition.
 *
 * For each seed keyword:
 *   1. Google SERP → top-10 organic + PAA + related + featured snippet +
 *      "things to know" + knowledge graph + short videos
 *   2. Google Autocomplete → 10 typing-suggestion expansions
 *   3. Google Trends → 12-month interest curve + is the query growing
 *   4. For each PAA: recurse once to fetch its own SERP (intent tree)
 *
 * Output:
 *   - data/keyword-research/intent-YYYY-MM-DD.json   (full raw data)
 *   - data/keyword-research/intent-YYYY-MM-DD.md     (human-readable summary)
 *
 * No pages are generated. This is pure discovery. User reviews the MD,
 * picks which queries to target, then we build content for those.
 *
 * Run: node scripts/discover-search-intent.mjs
 *      node scripts/discover-search-intent.mjs --seed "specific query"
 *      node scripts/discover-search-intent.mjs --skip-trends   (faster, saves 1 call/seed)
 *      node scripts/discover-search-intent.mjs --skip-autocomplete
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');

// -------------------------------------------------------------------
// Env loading
// -------------------------------------------------------------------
const envPath = path.join(PROJECT_ROOT, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_0-9]+)=(?:"(.+?)"|(.+))$/s);
    if (m) process.env[m[1]] = (m[2] ?? m[3] ?? '').replace(/\\n/g, '\n');
  }
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;
if (!SERPAPI_KEY) { console.error('Missing SERPAPI_KEY in .env.local'); process.exit(1); }

// -------------------------------------------------------------------
// Config
// -------------------------------------------------------------------
const SEED_GROUPS = {
  'blog-intent': [
    'usa travel 2026',
    'is usa expensive for tourists',
    'best time to visit usa 2026',
    'esta application guide',
    'driving in usa for europeans',
    'amtrak cross country',
    'tipping in usa how much',
    'usa road trip 2 weeks',
    'is new york safe 2026',
    'nyc vs la for tourists',
  ],
  'pillar-intent': [
    'statue of liberty tickets',
    'empire state building tickets',
    'grand canyon helicopter tour',
    'yellowstone tickets',
    'disney world tickets',
    'universal studios orlando tickets',
    'broadway tickets new york',
    'las vegas helicopter tour',
    'new york hop on hop off',
    'jfk airport transfer manhattan',
  ],
};

const argIndex = process.argv.indexOf('--seed');
const groupIdx = process.argv.indexOf('--group');
const customSeedsIdx = process.argv.indexOf('--seeds');

let SEEDS;
let LABEL = 'research';
if (argIndex >= 0) {
  SEEDS = [process.argv[argIndex + 1]];
  LABEL = 'custom';
} else if (groupIdx >= 0) {
  LABEL = process.argv[groupIdx + 1];
  SEEDS = SEED_GROUPS[LABEL];
  if (!SEEDS) { console.error(`Unknown group: ${LABEL}. Available: ${Object.keys(SEED_GROUPS).join(', ')}`); process.exit(1); }
} else if (customSeedsIdx >= 0) {
  SEEDS = process.argv[customSeedsIdx + 1].split(',').map(s => s.trim());
  LABEL = 'custom';
} else {
  SEEDS = SEED_GROUPS.research;
}

const SKIP_TRENDS = process.argv.includes('--skip-trends');
const SKIP_AUTOCOMPLETE = process.argv.includes('--skip-autocomplete');
const HL = 'en';
const GL = 'us';
const PAA_DEPTH = 1;

// -------------------------------------------------------------------
// SerpAPI helpers
// -------------------------------------------------------------------
const SERPAPI_BASE = 'https://serpapi.com/search.json';

async function serpapi(params) {
  const url = new URL(SERPAPI_BASE);
  for (const [k, v] of Object.entries({ ...params, api_key: SERPAPI_KEY })) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SerpAPI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function fetchSearch(query) {
  const d = await serpapi({ engine: 'google', q: query, hl: HL, gl: GL });

  const organic = (d.organic_results || []).slice(0, 10).map((r, i) => {
    let domain = null;
    if (r.link) {
      try { domain = new URL(r.link).hostname.replace(/^www\./, ''); } catch {}
    }
    return {
      position: r.position ?? i + 1,
      title: r.title,
      url: r.link,
      domain,
      snippet: r.snippet,
      sitelinks: (r.sitelinks?.inline || []).map(s => s.title),
    };
  });

  const paa = (d.related_questions || [])
    .map(q => q.question)
    .filter(Boolean);

  const related = (d.related_searches || [])
    .map(r => r.query || r.text)
    .filter(Boolean);

  const featured = d.answer_box ? {
    type: d.answer_box.type,
    title: d.answer_box.title,
    snippet: d.answer_box.snippet || d.answer_box.answer || d.answer_box.result,
    url: d.answer_box.link,
  } : null;

  const knowledge = d.knowledge_graph ? {
    title: d.knowledge_graph.title,
    type: d.knowledge_graph.type,
    description: d.knowledge_graph.description,
    source: d.knowledge_graph.source?.link,
  } : null;

  const thingsToKnow = (d.things_to_know?.list || []).map(t => t.title).filter(Boolean);

  const videos = (d.short_videos || d.inline_videos || []).slice(0, 5).map(v => ({
    title: v.title,
    channel: v.channel,
    url: v.link,
  }));

  return { organic, paa, related, featured, knowledge, thingsToKnow, videos };
}

async function fetchAutocomplete(query) {
  try {
    const d = await serpapi({ engine: 'google_autocomplete', q: query, hl: HL, gl: GL });
    return (d.suggestions || []).map(s => s.value).filter(Boolean).slice(0, 15);
  } catch (e) {
    return [];
  }
}

async function fetchTrends(query) {
  try {
    const d = await serpapi({ engine: 'google_trends', q: query, data_type: 'TIMESERIES', date: 'today 12-m', geo: 'US' });
    const timeline = d.interest_over_time?.timeline_data || [];
    if (!timeline.length) return null;
    // Compare last 3 months avg vs previous 3 months avg to detect trend
    const values = timeline.map(t => t.values?.[0]?.extracted_value ?? 0);
    const n = values.length;
    if (n < 6) return { peak: Math.max(...values), avg: Math.round(values.reduce((a, b) => a + b, 0) / n), direction: 'unknown' };
    const recent = values.slice(-Math.floor(n / 4));
    const prior = values.slice(-Math.floor(n / 2), -Math.floor(n / 4));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length || 1;
    const pctChange = Math.round(((recentAvg - priorAvg) / priorAvg) * 100);
    let direction = 'stable';
    if (pctChange >= 20) direction = 'rising';
    else if (pctChange <= -20) direction = 'declining';
    return {
      peak: Math.max(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / n),
      recentAvg: Math.round(recentAvg),
      priorAvg: Math.round(priorAvg),
      pctChange,
      direction,
    };
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------------
// Main
// -------------------------------------------------------------------
async function main() {
  console.log(`[discover] SerpAPI | ${SEEDS.length} seed(s) | PAA depth=${PAA_DEPTH} | trends=${!SKIP_TRENDS} | autocomplete=${!SKIP_AUTOCOMPLETE}\n`);

  const seen = new Set();
  const results = [];

  async function processQuery(query, depth, kind = 'seed') {
    const normalized = query.trim().toLowerCase();
    if (seen.has(normalized)) return null;
    seen.add(normalized);
    process.stdout.write(`  [d=${depth} ${kind}] ${query} ... `);
    let search;
    try {
      search = await fetchSearch(query);
    } catch (e) {
      console.log(`FAIL (${e.message})`);
      return null;
    }

    // Only fetch autocomplete + trends for seed queries (depth 0), not PAA children
    let autocomplete = [];
    let trends = null;
    if (depth === 0) {
      if (!SKIP_AUTOCOMPLETE) autocomplete = await fetchAutocomplete(query);
      if (!SKIP_TRENDS) trends = await fetchTrends(query);
    }

    const trendTag = trends ? ` trend=${trends.direction}(${trends.pctChange > 0 ? '+' : ''}${trends.pctChange}%)` : '';
    console.log(`${search.organic.length} orgs, ${search.paa.length} PAA, ${search.related.length} rel, ${autocomplete.length} ac${trendTag}`);

    return { query, depth, ...search, autocomplete, trends };
  }

  for (const seed of SEEDS) {
    console.log(`[seed] ${seed}`);
    const top = await processQuery(seed, 0, 'seed');
    if (!top) { console.log(''); continue; }
    results.push(top);

    if (PAA_DEPTH >= 1) {
      for (const paaQ of top.paa) {
        const child = await processQuery(paaQ, 1, 'paa');
        if (child) results.push(child);
      }
    }
    console.log('');
  }

  // Save
  const today = new Date().toISOString().split('T')[0];
  const outDir = path.join(PROJECT_ROOT, 'data', 'keyword-research');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `intent-${LABEL}-${today}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({
    capturedAt: new Date().toISOString(),
    provider: 'serpapi',
    seeds: SEEDS,
    totalQueries: results.length,
    results,
  }, null, 2));

  const mdPath = path.join(outDir, `intent-${LABEL}-${today}.md`);
  fs.writeFileSync(mdPath, renderMarkdown(results, SEEDS, today));

  console.log(`JSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}`);
  console.log(`\n${results.length} unique queries analysed across ${seen.size} SERPs.`);
}

function renderMarkdown(results, seeds, date) {
  const seedLookup = results.filter(r => r.depth === 0);
  const paaLookup = results.filter(r => r.depth === 1);

  const lines = [];
  lines.push(`# China search-intent discovery — ${date}`);
  lines.push('');
  lines.push(`**Provider:** SerpAPI · **Seeds:** ${seeds.length} · **Unique SERPs:** ${results.length}`);
  lines.push('');
  lines.push('Use this to decide what content to build. Signals that matter:');
  lines.push('- **Trend direction**: `rising` = build now, `declining` = skip unless evergreen');
  lines.push('- **Top-10 domains**: all gov/wiki = hard; mix of blogs = we can compete');
  lines.push('- **Content gaps**: PAA questions whose answers AREN\'T in top-10');
  lines.push('- **Autocomplete**: shows the exact wording Google users type');
  lines.push('- **Featured snippet**: Google\'s preferred format — mirror it');
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const s of seedLookup) {
    lines.push(`## 🌱 ${s.query}`);
    lines.push('');

    if (s.trends) {
      const icon = s.trends.direction === 'rising' ? '📈' : s.trends.direction === 'declining' ? '📉' : '➖';
      lines.push(`**Trend (12m, US):** ${icon} ${s.trends.direction} (${s.trends.pctChange > 0 ? '+' : ''}${s.trends.pctChange}% last-3m vs prior-3m · peak ${s.trends.peak}/100 · avg ${s.trends.avg}/100)`);
      lines.push('');
    }

    if (s.featured) {
      lines.push(`**Featured snippet (${s.featured.type || 'generic'}):** _${(s.featured.snippet || '').slice(0, 220)}_`);
      lines.push(`   Source: ${s.featured.url || 'n/a'}`);
      lines.push('');
    }

    if (s.knowledge) {
      lines.push(`**Knowledge graph:** ${s.knowledge.title}${s.knowledge.type ? ` (${s.knowledge.type})` : ''} — _${(s.knowledge.description || '').slice(0, 180)}_`);
      lines.push('');
    }

    if (s.thingsToKnow.length) {
      lines.push(`**Things to know (Google-curated entities):** ${s.thingsToKnow.slice(0, 8).join(' · ')}`);
      lines.push('');
    }

    lines.push('**Top-10 domains:**');
    const domains = [...new Set(s.organic.map(o => o.domain).filter(Boolean))].slice(0, 10);
    for (const d of domains) lines.push(`- ${d}`);
    lines.push('');

    lines.push('**Top-3 with snippets:**');
    for (const o of s.organic.slice(0, 3)) {
      lines.push(`${o.position}. **${o.title}** — ${o.domain}`);
      if (o.snippet) lines.push(`   > ${o.snippet.slice(0, 200)}`);
    }
    lines.push('');

    if (s.autocomplete.length) {
      lines.push('**Google Autocomplete (exact wording users type):**');
      lines.push(s.autocomplete.map(a => `- ${a}`).join('\n'));
      lines.push('');
    }

    if (s.paa.length) {
      lines.push('**People Also Ask (with drill-down):**');
      for (const q of s.paa) {
        const child = paaLookup.find(p => p.query.toLowerCase() === q.toLowerCase());
        const marker = child ? ` ↪ _${child.organic.length} orgs, ${child.paa.length} PAA_` : '';
        lines.push(`- ${q}${marker}`);
      }
      lines.push('');
    }

    if (s.related.length) {
      lines.push('**Related searches:**');
      lines.push(s.related.map(r => `\`${r}\``).join(' · '));
      lines.push('');
    }

    if (s.videos.length) {
      lines.push('**Top videos in SERP:**');
      for (const v of s.videos) lines.push(`- ${v.title}${v.channel ? ` (${v.channel})` : ''}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  // Aggregate: hot PAA + rising trends
  const paaCounts = new Map();
  for (const q of results.flatMap(r => r.paa)) {
    const k = q.toLowerCase();
    paaCounts.set(k, (paaCounts.get(k) || 0) + 1);
  }
  const hotPaa = [...paaCounts.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  if (hotPaa.length) {
    lines.push('## 🔥 High-signal questions (appear in 2+ SERPs)');
    lines.push('');
    for (const [q, count] of hotPaa) lines.push(`- (${count}×) ${q}`);
    lines.push('');
  }

  const rising = seedLookup.filter(s => s.trends?.direction === 'rising');
  if (rising.length) {
    lines.push('## 📈 Rising queries (build these FIRST)');
    lines.push('');
    for (const s of rising.sort((a, b) => b.trends.pctChange - a.trends.pctChange)) {
      lines.push(`- **${s.query}** — ${s.trends.pctChange > 0 ? '+' : ''}${s.trends.pctChange}% trend`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
