#!/usr/bin/env node

/**
 * Image Download Script for Go2Mexico
 *
 * Downloads and processes images for all content types from:
 *   1. Curated Unsplash photos (direct URLs, no API key needed)
 *   2. xAI Grok Imagine API fallback (requires XAI_API_KEY)
 *
 * Usage:
 *   node scripts/download-images.mjs [options]
 *
 * Options:
 *   --cities         Process city images only
 *   --destinations   Process destination images only
 *   --experiences    Process experience images only
 *   --itineraries    Process itinerary images only
 *   --regions        Process region images only
 *   --blog           Process blog images only
 *   --hero           Generate hero image only
 *   --force          Overwrite existing images (skip size check)
 *   (no flags)       Process all types + hero
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const FLAG_FORCE = args.includes('--force');
const FLAG_CITIES = args.includes('--cities');
const FLAG_DESTINATIONS = args.includes('--destinations');
const FLAG_EXPERIENCES = args.includes('--experiences');
const FLAG_ITINERARIES = args.includes('--itineraries');
const FLAG_REGIONS = args.includes('--regions');
const FLAG_BLOG = args.includes('--blog');
const FLAG_HERO = args.includes('--hero');

const NO_TYPE_FLAGS =
  !FLAG_CITIES &&
  !FLAG_DESTINATIONS &&
  !FLAG_EXPERIENCES &&
  !FLAG_ITINERARIES &&
  !FLAG_REGIONS &&
  !FLAG_BLOG &&
  !FLAG_HERO;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CARD_WIDTH = 800;
const CARD_HEIGHT = 600;
const HERO_WIDTH = 1600;
const HERO_HEIGHT = 900;
const WEBP_QUALITY = 82;
const MIN_IMAGE_BYTES = 1000; // skip 1x1 placeholders (typically < 100 bytes)

const UNSPLASH_DELAY_MS = 200;
const GROK_DELAY_MS = 500;

const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images');

// ---------------------------------------------------------------------------
// Curated Unsplash photo IDs
// ---------------------------------------------------------------------------
const CURATED_PHOTOS = {
  cities: {
    'cancun': ['photo-1552074284-5e88ef1aef18', 'photo-1510097467424-192d713fd8b2'],
    'mexico-city': ['photo-1585464231875-d9ef1f5ad396', 'photo-1518659526286-ce2b18a3deaf'],
    'playa-del-carmen': ['photo-1504019347908-b45f9b0b8dd5', 'photo-1552074284-5e88ef1aef18'],
    'tulum': ['photo-1682553064839-9f97119a2bba', 'photo-1504019347908-b45f9b0b8dd5'],
    'oaxaca-city': ['photo-1568402102990-bc541580b59f', 'photo-1547995886-6dc09384c6e6'],
    'guadalajara': ['photo-1585464231875-d9ef1f5ad396', 'photo-1547995886-6dc09384c6e6'],
    'san-miguel-de-allende': ['photo-1585464231875-d9ef1f5ad396', 'photo-1568402102990-bc541580b59f'],
    'puerto-vallarta': ['photo-1510097467424-192d713fd8b2', 'photo-1504019347908-b45f9b0b8dd5'],
    'merida': ['photo-1568402102990-bc541580b59f', 'photo-1547995886-6dc09384c6e6'],
    'guanajuato': ['photo-1568402102990-bc541580b59f', 'photo-1585464231875-d9ef1f5ad396'],
  },
  destinations: {
    'chichen-itza': ['photo-1518638150340-f706e86654de', 'photo-1570737543098-427f04c20e3f'],
    'teotihuacan': ['photo-1564410267841-915d8e4d71ea', 'photo-1585464231875-d9ef1f5ad396'],
    'tulum-ruins': ['photo-1682553064839-9f97119a2bba', 'photo-1504019347908-b45f9b0b8dd5'],
    'cenotes-yucatan': ['photo-1534258936925-c58bed479fcb', 'photo-1504019347908-b45f9b0b8dd5'],
    'cozumel': ['photo-1552074284-5e88ef1aef18', 'photo-1510097467424-192d713fd8b2'],
    'frida-kahlo-museum': ['photo-1585464231875-d9ef1f5ad396', 'photo-1518659526286-ce2b18a3deaf'],
  },
  regions: {
    'yucatan-peninsula': ['photo-1518638150340-f706e86654de', 'photo-1552074284-5e88ef1aef18'],
    'central-mexico': ['photo-1585464231875-d9ef1f5ad396', 'photo-1518659526286-ce2b18a3deaf'],
    'pacific-coast': ['photo-1510097467424-192d713fd8b2', 'photo-1504019347908-b45f9b0b8dd5'],
    'oaxaca-chiapas': ['photo-1568402102990-bc541580b59f', 'photo-1547995886-6dc09384c6e6'],
    'baja-california': ['photo-1510097467424-192d713fd8b2', 'photo-1504019347908-b45f9b0b8dd5'],
  },
  themes: {
    'mexico-beach': ['photo-1552074284-5e88ef1aef18', 'photo-1510097467424-192d713fd8b2', 'photo-1504019347908-b45f9b0b8dd5'],
    'mexico-ruins': ['photo-1518638150340-f706e86654de', 'photo-1570737543098-427f04c20e3f', 'photo-1564410267841-915d8e4d71ea'],
    'mexico-food': ['photo-1613514785940-daed07799d9b', 'photo-1599974579688-8dbdd335c77f', 'photo-1551504734-5ee1c4a1479b'],
    'mexico-culture': ['photo-1568402102990-bc541580b59f', 'photo-1547995886-6dc09384c6e6', 'photo-1585464231875-d9ef1f5ad396'],
    'mexico-nature': ['photo-1534258936925-c58bed479fcb', 'photo-1504019347908-b45f9b0b8dd5', 'photo-1682553064839-9f97119a2bba'],
    'mexico-adventure': ['photo-1534258936925-c58bed479fcb', 'photo-1552074284-5e88ef1aef18'],
    'mexico-landscape': ['photo-1518659526286-ce2b18a3deaf', 'photo-1585464231875-d9ef1f5ad396'],
  },
};

// Theme keywords for matching content without curated photos
const THEME_KEYWORDS = {
  'mexico-beach': ['beach', 'coast', 'ocean', 'caribbean', 'shore', 'seaside', 'coastal', 'playa', 'island', 'isla', 'snorkeling', 'coral', 'reef'],
  'mexico-ruins': ['ruins', 'temple', 'pyramid', 'archaeological', 'archaeology', 'mayan', 'aztec', 'zapotec', 'ancient', 'mesoamerican'],
  'mexico-food': ['food', 'cuisine', 'cooking', 'taco', 'mezcal', 'tequila', 'mole', 'street-food', 'chocolate', 'culinary', 'restaurant', 'market', 'tlayuda'],
  'mexico-culture': ['culture', 'festival', 'art', 'museum', 'tradition', 'music', 'mariachi', 'lucha', 'day-of-the-dead', 'dia-de-muertos', 'colonial', 'architecture', 'pottery', 'talavera', 'artisan'],
  'mexico-nature': ['cenote', 'nature', 'jungle', 'wildlife', 'canyon', 'lagoon', 'waterfall', 'bioluminescence', 'whale', 'cave', 'underground', 'river', 'natural'],
  'mexico-adventure': ['adventure', 'hiking', 'diving', 'surfing', 'zip-line', 'zip-lining', 'kayaking', 'balloon', 'sailing', 'adrenaline', 'extreme'],
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(msg) {
  console.log(`  ${msg}`);
}

function logSection(msg) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${msg}`);
  console.log('='.repeat(60));
}

/**
 * Parse YAML-ish frontmatter from markdown content.
 * We do a lightweight parse to avoid importing gray-matter (it's CommonJS).
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Array continuation line
    const arrayItem = line.match(/^\s+-\s+"?([^"]*)"?\s*$/);
    if (arrayItem && currentKey && currentArray) {
      currentArray.push(arrayItem[1].replace(/^["']|["']$/g, ''));
      continue;
    }

    // Key: value line
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*?)\s*$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let value = kvMatch[2];

      // Inline array: ["a", "b", "c"]
      if (value.startsWith('[') && value.endsWith(']')) {
        currentArray = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        fm[currentKey] = currentArray;
        continue;
      }

      // Start of multi-line array
      if (value === '' || value === '[]') {
        currentArray = [];
        fm[currentKey] = currentArray;
        continue;
      }

      // Scalar value
      currentArray = null;
      fm[currentKey] = value.replace(/^["']|["']$/g, '');
    }
  }

  return fm;
}

/**
 * Determine best theme for a content item based on tags and title.
 */
function matchTheme(title, tags) {
  const searchText = [
    title.toLowerCase(),
    ...(tags || []).map((t) => t.toLowerCase()),
  ].join(' ');

  let bestTheme = 'mexico-landscape';
  let bestScore = 0;

  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (searchText.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  return bestTheme;
}

/**
 * Get all candidate Unsplash URLs for a slug within a given type.
 * Returns an array of { url, source } objects to try in order.
 * First tries direct curated matches (all IDs), then theme-based fallbacks.
 */
function getCuratedUrls(type, slug, title, tags) {
  const candidates = [];

  // Direct curated matches -- try all IDs in order
  const typePhotos = CURATED_PHOTOS[type];
  if (typePhotos && typePhotos[slug]) {
    for (const id of typePhotos[slug]) {
      candidates.push({
        url: `https://images.unsplash.com/${id}?w=${CARD_WIDTH * 2}&q=80&fit=crop`,
        source: 'unsplash-curated',
      });
    }
  }

  // Theme-based fallbacks from Unsplash
  const theme = matchTheme(title, tags);
  const themePhotos = CURATED_PHOTOS.themes[theme];
  if (themePhotos && themePhotos.length > 0) {
    // Use a deterministic ordering based on slug hash to vary across items
    const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let i = 0; i < themePhotos.length; i++) {
      const id = themePhotos[(hash + i) % themePhotos.length];
      // Avoid duplicates if curated and theme share IDs
      const url = `https://images.unsplash.com/${id}?w=${CARD_WIDTH * 2}&q=80&fit=crop`;
      if (!candidates.some((c) => c.url === url)) {
        candidates.push({ url, source: `unsplash-theme(${theme})` });
      }
    }
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// API key loading
// ---------------------------------------------------------------------------

function loadXaiApiKey() {
  const envPaths = [
    path.join(PROJECT_ROOT, '.env.local'),
    path.join(PROJECT_ROOT, '.env'),
  ];

  // Also try sibling go2 projects
  const siblings = ['go2-bali', 'go2-china', 'go2-vietnam', 'go2-india'];
  const projectsDir = path.dirname(PROJECT_ROOT);
  for (const sibling of siblings) {
    envPaths.push(path.join(projectsDir, `${sibling}.com`, '.env.local'));
  }

  for (const envPath of envPaths) {
    try {
      const env = fs.readFileSync(envPath, 'utf8');
      const match = env.match(/XAI_API_KEY=["']?([a-zA-Z0-9_-]+)["']?/);
      if (match) {
        log(`Loaded XAI_API_KEY from ${path.relative(projectsDir, envPath)}`);
        return match[1];
      }
    } catch {
      // file not found, continue
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Image downloading
// ---------------------------------------------------------------------------

/**
 * Download an image from a URL. Returns a Buffer or null on failure.
 */
async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Go2Mexico-ImageDownloader/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      log(`  HTTP ${res.status} from ${url.substring(0, 80)}...`);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) {
      log(`  Response too small (${buffer.length} bytes), likely not an image`);
      return null;
    }

    return buffer;
  } catch (err) {
    log(`  Download error: ${err.message}`);
    return null;
  }
}

/**
 * Generate an image using xAI Grok Imagine API.
 */
async function generateWithGrok(title, apiKey) {
  const prompt = `Professional travel photography of ${title} in Mexico. Wide landscape format (16:9), high resolution, magazine quality travel photography. Natural golden hour lighting, vivid colors, evocative of Mexico travel. CRITICAL: No text, no letters, no numbers, no watermarks. Only photographic visual elements.`;

  try {
    const res = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt,
        n: 1,
        response_format: 'url',
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      log(`  Grok API error ${res.status}: ${errText.substring(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      log('  Grok API returned no image URL');
      return null;
    }

    // Download the generated image
    return await downloadImage(imageUrl);
  } catch (err) {
    log(`  Grok API error: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Image processing
// ---------------------------------------------------------------------------

/**
 * Process raw image buffer into a WebP at the specified dimensions.
 */
async function processImage(buffer, width, height) {
  return sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

/**
 * Check if an image already exists and is "real" (> MIN_IMAGE_BYTES).
 */
function imageExists(filepath) {
  try {
    const stat = fs.statSync(filepath);
    return stat.size > MIN_IMAGE_BYTES;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Content scanning
// ---------------------------------------------------------------------------

/**
 * Read all markdown files from a content type directory and extract metadata.
 */
function scanContent(type) {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) {
    log(`Content directory not found: ${type}`);
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const items = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = parseFrontmatter(content);
    const slug = fm.slug || file.replace(/\.md$/, '');
    const title = fm.title || slug;
    const tags = Array.isArray(fm.tags) ? fm.tags : [];

    items.push({ slug, title, tags, type, file });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Main processing pipeline
// ---------------------------------------------------------------------------

async function processContentType(type, items, xaiKey) {
  const outputDir = path.join(IMAGES_DIR, type);
  fs.mkdirSync(outputDir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  let grokUsed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const outputPath = path.join(outputDir, `${item.slug}.webp`);
    const progress = `[${i + 1}/${items.length}]`;

    // Skip if image already exists (unless --force)
    if (!FLAG_FORCE && imageExists(outputPath)) {
      log(`${progress} SKIP ${item.slug} (already exists)`);
      skipped++;
      continue;
    }

    log(`${progress} Processing: ${item.title}`);

    let buffer = null;
    let source = '';

    // 1. Try curated Unsplash photos (all candidates in order)
    const candidates = getCuratedUrls(type, item.slug, item.title, item.tags);
    for (const candidate of candidates) {
      log(`  Trying ${candidate.source}...`);
      buffer = await downloadImage(candidate.url);
      if (buffer) {
        source = candidate.source;
        break;
      }
      await sleep(UNSPLASH_DELAY_MS);
    }

    // 2. Fall back to Grok Imagine API
    if (!buffer && xaiKey) {
      log('  Falling back to Grok Imagine API...');
      buffer = await generateWithGrok(item.title, xaiKey);
      if (buffer) {
        source = 'grok-imagine';
        grokUsed++;
      }
      await sleep(GROK_DELAY_MS);
    }

    // 3. Process and save
    if (buffer) {
      try {
        const processed = await processImage(buffer, CARD_WIDTH, CARD_HEIGHT);
        fs.writeFileSync(outputPath, processed);
        const sizeKb = (processed.length / 1024).toFixed(1);
        log(`  Saved: ${item.slug}.webp (${sizeKb} KB) [${source}]`);
        downloaded++;
      } catch (err) {
        log(`  Sharp processing error: ${err.message}`);
        failed++;
      }
    } else {
      log(`  FAILED: No image source available for ${item.slug}`);
      failed++;
    }
  }

  return { downloaded, skipped, failed, grokUsed };
}

async function generateHeroImage(xaiKey) {
  logSection('Hero Image');

  const outputDir = path.join(IMAGES_DIR, 'heroes');
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'mexico-hero.webp');

  if (!FLAG_FORCE && imageExists(outputPath)) {
    log('SKIP mexico-hero.webp (already exists)');
    return;
  }

  log('Generating hero image (1600x900)...');

  let buffer = null;

  // Try a scenic Mexico landscape from Unsplash
  const heroId = 'photo-1518659526286-ce2b18a3deaf';
  const heroUrl = `https://images.unsplash.com/${heroId}?w=${HERO_WIDTH * 2}&q=80&fit=crop`;
  log('  Trying Unsplash curated hero...');
  buffer = await downloadImage(heroUrl);

  if (!buffer && xaiKey) {
    log('  Falling back to Grok Imagine API...');
    buffer = await generateWithGrok(
      'Stunning panoramic Mexico landscape with ancient pyramids, turquoise Caribbean coast, and colorful colonial architecture',
      xaiKey,
    );
    await sleep(GROK_DELAY_MS);
  }

  if (buffer) {
    try {
      const processed = await processImage(buffer, HERO_WIDTH, HERO_HEIGHT);
      fs.writeFileSync(outputPath, processed);
      const sizeKb = (processed.length / 1024).toFixed(1);
      log(`  Saved: mexico-hero.webp (${sizeKb} KB)`);
    } catch (err) {
      log(`  Sharp processing error: ${err.message}`);
    }
  } else {
    log('  FAILED: No image source available for hero');
  }
}

async function generatePlaceholder() {
  logSection('Placeholder Image');

  const outputPath = path.join(IMAGES_DIR, 'placeholder.webp');

  if (!FLAG_FORCE && imageExists(outputPath)) {
    log('SKIP placeholder.webp (already exists)');
    return;
  }

  log('Generating placeholder image (800x600)...');

  try {
    const width = CARD_WIDTH;
    const height = CARD_HEIGHT;

    // Create a subtle gradient placeholder using SVG rendered through sharp
    const svgGradient = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(220,220,225);stop-opacity:1" />
            <stop offset="50%" style="stop-color:rgb(195,195,200);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(180,180,185);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)" />
        <text x="50%" y="50%" text-anchor="middle" dy=".3em"
              font-family="Arial, sans-serif" font-size="24" fill="rgb(160,160,165)"
              font-weight="300">
          Go2Mexico
        </text>
      </svg>
    `;

    const processed = await sharp(Buffer.from(svgGradient))
      .resize(width, height)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    fs.writeFileSync(outputPath, processed);
    const sizeKb = (processed.length / 1024).toFixed(1);
    log(`Saved: placeholder.webp (${sizeKb} KB)`);
  } catch (err) {
    log(`Error generating placeholder: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  console.log('\nGo2Mexico Image Download Script');
  console.log('================================\n');

  if (FLAG_FORCE) {
    log('Force mode: will overwrite existing images\n');
  }

  // Load API key
  const xaiKey = loadXaiApiKey();
  if (!xaiKey) {
    log('WARNING: No XAI_API_KEY found. Grok fallback will be unavailable.');
    log('Checked: .env.local, .env, and sibling go2-* projects\n');
  }

  // Always generate placeholder
  await generatePlaceholder();

  // Define content types to process
  const contentTypes = [
    { type: 'cities', flag: FLAG_CITIES },
    { type: 'destinations', flag: FLAG_DESTINATIONS },
    { type: 'experiences', flag: FLAG_EXPERIENCES },
    { type: 'itineraries', flag: FLAG_ITINERARIES },
    { type: 'regions', flag: FLAG_REGIONS },
    { type: 'blog', flag: FLAG_BLOG },
  ];

  const totals = { downloaded: 0, skipped: 0, failed: 0, grokUsed: 0 };

  for (const { type, flag } of contentTypes) {
    if (!NO_TYPE_FLAGS && !flag) continue;

    logSection(`${type.charAt(0).toUpperCase() + type.slice(1)}`);

    const items = scanContent(type);
    if (items.length === 0) {
      log('No content files found.');
      continue;
    }

    log(`Found ${items.length} content files\n`);

    const stats = await processContentType(type, items, xaiKey);
    totals.downloaded += stats.downloaded;
    totals.skipped += stats.skipped;
    totals.failed += stats.failed;
    totals.grokUsed += stats.grokUsed;

    log(`\nResults: ${stats.downloaded} downloaded, ${stats.skipped} skipped, ${stats.failed} failed`);
    if (stats.grokUsed > 0) {
      log(`  (${stats.grokUsed} used Grok Imagine API)`);
    }
  }

  // Hero image
  if (NO_TYPE_FLAGS || FLAG_HERO) {
    await generateHeroImage(xaiKey);
  }

  // Summary
  logSection('Summary');
  log(`Downloaded: ${totals.downloaded}`);
  log(`Skipped:    ${totals.skipped}`);
  log(`Failed:     ${totals.failed}`);
  if (totals.grokUsed > 0) {
    log(`Grok used:  ${totals.grokUsed}`);
  }
  log('');

  if (totals.failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
