#!/usr/bin/env node
/**
 * Translate English blog posts to Dutch with NL SEO optimization.
 *
 * Usage:
 *   node scripts/translate-blog-nl.mjs              # translate up to 50
 *   node scripts/translate-blog-nl.mjs --limit 10   # custom limit
 *   node scripts/translate-blog-nl.mjs --all        # all remaining
 *   node scripts/translate-blog-nl.mjs --concurrency 5
 *
 * Reads ANTHROPIC_API_KEY from .env.local
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const argsRaw = process.argv.slice(2);
const getArgRaw = (flag, def) => { const i = argsRaw.indexOf(flag); return i >= 0 ? argsRaw[i + 1] : def; };
const EN_DIR = path.join(ROOT, getArgRaw('--src-dir', 'content/blog/en'));
const NL_DIR = path.join(ROOT, getArgRaw('--out-dir', 'content/blog/nl'));

// Load .env.local
const envPath = path.join(ROOT, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in env or .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const all = args.includes('--all');
const limit = all ? Infinity : parseInt(getArg('--limit', '50'), 10);
const concurrency = parseInt(getArg('--concurrency', '5'), 10);
const provider = getArg('--provider', 'openrouter'); // 'anthropic' | 'openrouter'
const model = getArg('--model', provider === 'anthropic' ? 'claude-haiku-4-5-20251001' : 'x-ai/grok-4-fast');

// Per-million-token pricing (USD)
const PRICING = {
  'claude-haiku-4-5-20251001': { in: 1, out: 5 },
  'x-ai/grok-4-fast':          { in: 0.20, out: 0.50 },
  'x-ai/grok-4.1-fast':        { in: 0.20, out: 0.50 },
  'openai/gpt-4.1-mini':       { in: 0.40, out: 1.60 },
  'google/gemini-2.5-flash-lite': { in: 0.10, out: 0.40 },
};

let anthropicClient, openrouterClient;
if (provider === 'anthropic') {
  anthropicClient = new Anthropic();
} else {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY in env or .env.local');
    process.exit(1);
  }
  openrouterClient = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://go2-thailand.com',
      'X-Title': 'go2thailand-translation',
    },
  });
}

const SYSTEM_PROMPT = `You translate English Thailand-travel blog posts to natural, idiomatic Dutch (NL) for go2thailand.com.

Output ONLY the translated markdown file content. No explanations, no fences, no preamble.

DUTCH SEO RULES:
- Translate \`title\` (~60 chars) using keywords NL travelers actually search: "Bangkok streetfood", "beste tijd Thailand", "Thailand vakantie", "tips Bangkok", "{stad} bezienswaardigheden". Primary keyword early.
- Translate \`description\` (140-155 chars), action-oriented, with primary NL keyword.
- Translate \`tags\` and ADD 2-3 extra NL search keywords.
- Convert USD prices to € equivalent (keep THB intact). Use NL number format (€1.500 not $1,500).
- Use Dutch travel terms: "vakantie", "reisgids", "bezienswaardigheden", "gids", "tips", "ervaring", "review".
- Where natural, mention NL context: "vanuit Nederland", "directe vlucht vanaf Schiphol", KLM.
- Address NL traveler concerns: regenseizoen, beste reistijd, veiligheid.

PRESERVE EXACTLY (do NOT translate or modify):
- YAML keys: slug, date, lastUpdated, author name, category, image, featured, readingTime, sources URLs
- All URLs (affiliate links, image paths, source URLs)
- Markdown formatting: headers, bold, italics, lists, tables, code blocks, link syntax
- Only translate the visible link text, never the URL

CRITICAL URL RULE — zero tolerance:
- EVERY http/https URL present in the English source MUST appear in the Dutch output, unchanged.
- Do NOT drop any source citations or sources block entries.
- Do NOT invent new URLs or extend existing URLs with paths that weren't in the source.
- Do NOT rewrite affiliate URLs (tpo.lv links, etc.). Keep them byte-identical.
- The \`sources:\` YAML block MUST have the same number of entries as the source with identical \`url:\` values.

Sound like a Dutch travel writer, not a translation tool. Natural idiom over literal accuracy.`;

async function translateOne(filename) {
  const enPath = path.join(EN_DIR, filename);
  const nlPath = path.join(NL_DIR, filename);
  if (fs.existsSync(nlPath)) return { filename, status: 'skipped' };

  const source = fs.readFileSync(enPath, 'utf8');

  let out, inputTokens, outputTokens;
  if (provider === 'anthropic') {
    const msg = await anthropicClient.messages.create({
      model,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Translate this blog post to Dutch:\n\n${source}` }],
    });
    out = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    inputTokens = msg.usage.input_tokens;
    outputTokens = msg.usage.output_tokens;
  } else {
    const resp = await openrouterClient.chat.completions.create({
      model,
      max_tokens: 16000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Translate this blog post to Dutch:\n\n${source}` },
      ],
    });
    out = resp.choices?.[0]?.message?.content || '';
    inputTokens = resp.usage?.prompt_tokens || 0;
    outputTokens = resp.usage?.completion_tokens || 0;
  }

  // Strip accidental code-fence wrapping
  const cleaned = out.replace(/^```(?:markdown|md|yaml)?\n?/, '').replace(/\n?```\s*$/, '').trim();

  if (!cleaned.startsWith('---')) {
    throw new Error(`Output missing frontmatter for ${filename}`);
  }

  fs.writeFileSync(nlPath, cleaned + '\n');
  return { filename, status: 'done', inputTokens, outputTokens };
}

async function pool(items, size, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        const r = await worker(items[idx]);
        results[idx] = r;
        const tag = r.status === 'done' ? '✓' : r.status === 'skipped' ? '·' : '✗';
        console.log(`${tag} [${idx + 1}/${items.length}] ${items[idx]}`);
      } catch (e) {
        results[idx] = { filename: items[idx], status: 'error', error: e.message };
        console.error(`✗ [${idx + 1}/${items.length}] ${items[idx]}: ${e.message}`);
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  if (!fs.existsSync(NL_DIR)) fs.mkdirSync(NL_DIR, { recursive: true });

  const enFiles = fs.readdirSync(EN_DIR).filter(f => f.endsWith('.md')).sort();
  const nlFiles = new Set(fs.readdirSync(NL_DIR).filter(f => f.endsWith('.md')));
  const todo = enFiles.filter(f => !nlFiles.has(f)).slice(0, limit);

  console.log(`Found ${enFiles.length} EN posts, ${nlFiles.size} NL exist, ${enFiles.length - nlFiles.size} missing.`);
  console.log(`Translating ${todo.length} with model ${model} (concurrency ${concurrency})\n`);

  const start = Date.now();
  const results = await pool(todo, concurrency, translateOne);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  const done = results.filter(r => r.status === 'done');
  const errors = results.filter(r => r.status === 'error');
  const inTok = done.reduce((s, r) => s + (r.inputTokens || 0), 0);
  const outTok = done.reduce((s, r) => s + (r.outputTokens || 0), 0);
  const price = PRICING[model] || { in: 0, out: 0 };
  const cost = (inTok / 1e6) * price.in + (outTok / 1e6) * price.out;

  console.log(`\nDone: ${done.length}  Errors: ${errors.length}  Time: ${elapsed}s`);
  console.log(`Tokens: ${inTok.toLocaleString()} in / ${outTok.toLocaleString()} out  ≈ $${cost.toFixed(3)}`);
  if (errors.length) {
    console.log('\nErrors:');
    for (const e of errors) console.log(`  - ${e.filename}: ${e.error}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
