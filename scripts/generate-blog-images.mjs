#!/usr/bin/env node

/**
 * Generate hero images for go2-bali.com blog posts via Gemini's image model.
 * Adapted from go2-thailand's generate-missing-blog-images.mjs.
 *
 * Each post needs an image at /public/images/blog/<slug>.webp (1024x576 webp).
 * Reads frontmatter `image:` field; if missing or file doesn't exist, generates one.
 *
 * Usage:
 *   node scripts/generate-blog-images.mjs                      # all missing images
 *   node scripts/generate-blog-images.mjs --only slug1,slug2   # specific posts
 *   node scripts/generate-blog-images.mjs --regenerate         # overwrite existing
 *   node scripts/generate-blog-images.mjs --limit 5            # cap at 5
 *   node scripts/generate-blog-images.mjs --dry-run            # show plan, no API
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog', 'en');
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'blog');
const MODEL = 'gemini-3.1-flash-image-preview';
const TARGET_WIDTH = 1024;
const TARGET_HEIGHT = 576;
const DELAY_MS = 2500;

// Bali-specific location/scene hints
const LOCATION_HINTS = [
  ['ubud', 'Ubud rice terraces of Tegallalang, lush jungle valleys, Sacred Monkey Forest, traditional Balinese architecture and water temples'],
  ['canggu', 'Canggu beach surf scene, palm-lined coastal road, beachfront cafes with surfboards, sunset bonfires'],
  ['seminyak', 'Seminyak chic beach club at sunset, infinity pool overlooking ocean, designer boutique street, sophisticated dining'],
  ['sanur', 'Sanur calm beach with traditional jukung fishing boats, sunrise over the water, palm-lined promenade, family-friendly atmosphere'],
  ['kuta', 'Kuta beach with surfers and bonfires at golden hour, busy nightlife strip, traditional warung scenes'],
  ['uluwatu', 'Uluwatu Temple perched on dramatic clifftops above Indian Ocean, Kecak fire dance at sunset, world-class surf break'],
  ['nusa dua', 'Nusa Dua luxury resort beach with white sand and turquoise water, manicured gardens, infinity pools'],
  ['jimbaran', 'Jimbaran Bay seafood beach restaurants at sunset, candlelit tables on sand, traditional fishing boats offshore'],
  ['denpasar', 'Denpasar bustling local market with tropical fruit, colonial Dutch architecture, Bali traditional ceremony'],
  ['amed', 'Amed black sand fishing beach with traditional jukung boats, Mount Agung volcano in background, peaceful diving spot'],
  ['lovina', 'Lovina north Bali black sand beach at dawn, dolphin watching boats, peaceful village atmosphere'],
  ['sidemen', 'Sidemen lush rice paddies and tropical valleys, traditional village weaving, Mount Agung in distance'],
  ['nusa penida', 'Nusa Penida dramatic Kelingking Beach cliff in shape of T-rex, turquoise water, off-the-grid island vibe'],
  ['nusa lembongan', 'Nusa Lembongan secluded coves, mangrove kayak tours, beach cafes overlooking turquoise water'],
  ['rice terrace', 'classic Tegallalang or Jatiluwih rice terraces in golden morning light, layered green steps, palm trees'],
  ['temple', 'Balinese Hindu temple with split gates, ceremonial offerings, ornate carved stone, lush surroundings'],
  ['surf', 'Bali surf scene with offshore wave at Uluwatu or Padang Padang, sunset color palette, surfer paddling out'],
  ['visa', 'travel documents, passport with Indonesian VOA stamp, Ngurah Rai airport immigration counter, modern terminal'],
  ['nomad', 'modern Bali coworking space in Canggu with palm view, laptop on rattan table, tropical greenery, latte art'],
  ['backpacking', 'young traveler with backpack on Bali scooter, hostel courtyard, beach trail, jungle hike'],
  ['food', 'authentic Balinese warung scene with nasi campur plate, satay grilling, fresh tropical fruit, palm leaf decoration'],
  ['hotel', 'Balinese villa interior with private pool, thatched roof, tropical garden view, indoor-outdoor design'],
  ['budget', 'simple warung meal scene, hostel pool, scooter on Bali road, affordable beachfront vibe'],
  ['1000', 'budget traveler at Balinese morning market, counting rupiah notes, simple but vibrant scene'],
  ['vpn', 'modern laptop with secure connection at Bali coworking cafe, evening palm-lit setting through window'],
  ['safety', 'busy but pleasant Ubud or Seminyak street scene, well-lit walkways, scooters, calm tropical atmosphere'],
  ['itinerary', 'map of Bali island with key beach areas and inland villages, traveler planning at scenic viewpoint'],
];

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseArgs() {
  const args = process.argv.slice(2);
  const getValue = flag => {
    const exact = args.indexOf(flag);
    if (exact >= 0) return args[exact + 1];
    const inline = args.find(a => a.startsWith(`${flag}=`));
    return inline ? inline.split('=').slice(1).join('=') : undefined;
  };
  return {
    dryRun: args.includes('--dry-run'),
    limit: Number(getValue('--limit') || 0) || null,
    only: (getValue('--only') || '').split(',').map(s => s.trim()).filter(Boolean),
    regenerate: args.includes('--regenerate'),
  };
}

function getPostsMissingImages({ regenerate = false } = {}) {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const slug = file.replace(/\.md$/, '');
    const fullPath = path.join(CONTENT_DIR, file);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    const slugImage = `/images/blog/${slug}.webp`;
    const slugPath = path.join(ROOT, 'public', slugImage.replace(/^\/+/, ''));
    return {
      slug,
      title: data.title || slug,
      category: data.category || 'travel',
      tags: Array.isArray(data.tags) ? data.tags : [],
      slugImage,
      slugExists: fs.existsSync(slugPath),
    };
  }).filter(p => regenerate ? true : !p.slugExists);
}

function buildPrompt(post) {
  const title = String(post.title || '');
  const titleLower = title.toLowerCase();
  const tags = post.tags.length ? post.tags.slice(0, 5).join(', ') : 'Bali travel';

  const locationHints = LOCATION_HINTS
    .filter(([needle]) => titleLower.includes(needle))
    .map(([, hint]) => hint);

  const isPolicy = /(visa|rule|transit|hour|policy|permit)/i.test(title);
  const isFood = /(food|restaurant|dining|street|hotpot|tea|coffee|drink)/i.test(title);
  const isTransport = /(train|transport|metro|bullet|airport|flight)/i.test(title);
  const isBudget = /(budget|cost|cheap|backpack|nomad|\$|money|expense)/i.test(title);

  let sceneDirection = 'a visually specific Bali travel scene matching the article topic';
  if (isFood) sceneDirection = 'a vivid Balinese / Indonesian food scene with steam, color and authentic kitchen or street-vendor atmosphere';
  else if (isTransport) sceneDirection = 'a modern Bali transit scene — high-speed rail, subway station, airport interior — clean and contemporary';
  else if (isPolicy) sceneDirection = 'an editorial scene suggesting travel documentation, immigration or border crossing — calm, professional, not bureaucratic';
  else if (isBudget) sceneDirection = 'a thoughtful budget-travel scene — local market, hostel rooftop, simple meal — convey "smart spending" not poverty';

  const peopleDirection = isFood || isTransport
    ? 'If people appear, keep them secondary, natural and documentary-like, never posing for camera.'
    : 'Avoid prominent people unless absolutely necessary to convey the scene.';

  const specificity = locationHints.length
    ? `Location cues: ${locationHints.join('; ')}.`
    : 'Location cues: use recognizably Balinese architecture, streetscape, calligraphy, lanterns, modern infrastructure or landscape — not generic Asian aesthetic.';

  return `Create a high-end photorealistic editorial travel image for a blog article.

Article title: "${title}"
Category: ${post.category}
Themes: ${tags}

Scene goal: ${sceneDirection}.
${specificity}

Visual style:
- premium travel magazine photography
- realistic lens behavior and natural lighting
- rich but believable colors
- authentic tropical Bali atmosphere (avoid stock-photo cliches)
- strong depth, texture and environmental detail
- cinematic but realistic, not fantasy

Composition:
- horizontal 16:9 hero image for a blog header
- one clear main scene, not a collage
- avoid empty center space and avoid flat stock-photo framing
- show distinct foreground, midground and background when possible

Quality constraints:
- avoid plastic skin, uncanny faces, distorted hands, malformed objects, duplicate elements
- avoid over-smoothed surfaces, fake HDR, excessive glow, surreal symmetry
- avoid generic AI travel poster aesthetics
- ${peopleDirection}

Hard constraints:
- zero text
- zero letters
- zero numbers
- zero Indonesian or Balinese script
- zero logos
- zero watermarks
- zero UI elements
- zero split screen
- zero collage`;
}

async function generateImage(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData || p.inline_data);
  const inline = imagePart?.inlineData || imagePart?.inline_data;
  if (!inline?.data) throw new Error('No image returned');
  return Buffer.from(inline.data, 'base64');
}

async function processAndSave(buffer, outputPath) {
  await sharp(buffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(outputPath);
}

async function main() {
  loadEnv();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not found in .env.local');

  const options = parseArgs();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let posts = getPostsMissingImages({ regenerate: options.regenerate });
  if (options.only.length) {
    const onlySet = new Set(options.only);
    posts = posts.filter(p => onlySet.has(p.slug));
  }
  if (options.limit) posts = posts.slice(0, options.limit);

  console.log(`[gen-images] model=${MODEL} | candidates=${posts.length}${options.dryRun ? ' (dry-run)' : ''}`);
  for (const p of posts) console.log(`  - ${p.slug}`);
  if (options.dryRun || posts.length === 0) return;

  let success = 0, fail = 0;
  for (const post of posts) {
    const outputPath = path.join(OUTPUT_DIR, `${post.slug}.webp`);
    process.stdout.write(`  generating ${post.slug} ... `);
    try {
      const prompt = buildPrompt(post);
      const buffer = await generateImage(prompt, apiKey);
      await processAndSave(buffer, outputPath);
      console.log(`OK (${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB)`);
      success++;
    } catch (e) {
      console.log(`FAIL: ${e.message}`);
      fail++;
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nDone. ${success} succeeded, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
