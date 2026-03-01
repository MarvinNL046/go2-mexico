/**
 * scripts/verify-sitemap.ts - Compare sitemap.xml against expected pages
 *
 * Checks:
 *  - Counts pages in the generated sitemap.xml
 *  - Counts expected pages from content/ dirs + static pages + list pages
 *  - Flags missing pages (expected but not in sitemap)
 *  - Flags extra pages (in sitemap but not expected)
 *
 * Run: npx tsx scripts/verify-sitemap.ts
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'public', 'sitemap.xml');

let SITE_URL = 'https://go2-mexico.com';
try {
  const cfg = require('../site.config');
  const config = cfg.siteConfig || cfg.default || cfg;
  if (config?.seo?.siteUrl) {
    SITE_URL = config.seo.siteUrl;
  }
} catch {
  // Fallback already set
}

const CONTENT_TYPES = [
  'regions',
  'cities',
  'destinations',
  'experiences',
  'itineraries',
  'blog',
] as const;

const STATIC_PAGES = [
  '/',
  '/about/',
  '/contact/',
  '/editorial-policy/',
  '/how-we-research/',
  '/affiliate-disclosure/',
  '/privacy/',
  '/terms/',
];

const LIST_PAGES = [
  '/regions/',
  '/cities/',
  '/destinations/',
  '/experiences/',
  '/itineraries/',
  '/blog/',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSlugsFromDir(type: string): string[] {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx?$/, ''));
}

function extractUrlsFromSitemap(xml: string): string[] {
  const urls: string[] = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function urlToPath(url: string): string {
  return url.replace(SITE_URL, '') || '/';
}

// ---------------------------------------------------------------------------
// Expected URLs
// ---------------------------------------------------------------------------

function collectExpectedPaths(): string[] {
  const paths: string[] = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    paths.push(page);
  }

  // List pages
  for (const page of LIST_PAGES) {
    paths.push(page);
  }

  // Detail pages
  for (const type of CONTENT_TYPES) {
    const slugs = getSlugsFromDir(type);
    for (const slug of slugs) {
      paths.push(`/${type}/${slug}/`);
    }
  }

  return paths;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('Sitemap verification');
  console.log('====================');
  console.log('');

  // Read sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.log(`ERROR: Sitemap not found at ${SITEMAP_PATH}`);
    console.log('Run "npm run sitemap" first to generate it.');
    process.exit(1);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const sitemapUrls = extractUrlsFromSitemap(xml);
  const sitemapPaths = new Set(sitemapUrls.map(urlToPath));

  // Expected pages
  const expectedPaths = collectExpectedPaths();
  const expectedSet = new Set(expectedPaths);

  console.log(`Sitemap URLs: ${sitemapPaths.size}`);
  console.log(`Expected URLs: ${expectedSet.size}`);
  console.log('');

  // Missing from sitemap
  const missing: string[] = [];
  for (const p of expectedPaths) {
    if (!sitemapPaths.has(p)) {
      missing.push(p);
    }
  }

  // Extra in sitemap
  const extra: string[] = [];
  for (const p of sitemapPaths) {
    if (!expectedSet.has(p)) {
      extra.push(p);
    }
  }

  let hasIssues = false;

  if (missing.length > 0) {
    hasIssues = true;
    console.log(`MISSING from sitemap (${missing.length}):`);
    for (const p of missing) {
      console.log(`  - ${p}`);
    }
    console.log('');
  }

  if (extra.length > 0) {
    hasIssues = true;
    console.log(`EXTRA in sitemap (${extra.length}):`);
    for (const p of extra) {
      console.log(`  - ${p}`);
    }
    console.log('');
  }

  // Content breakdown
  console.log('Content breakdown:');
  for (const type of CONTENT_TYPES) {
    const slugs = getSlugsFromDir(type);
    console.log(`  ${type}: ${slugs.length} items`);
  }
  console.log('');

  if (hasIssues) {
    console.log('Sitemap verification FAILED.');
    process.exit(1);
  } else {
    console.log('Sitemap matches expected pages. All good.');
  }
}

main();
