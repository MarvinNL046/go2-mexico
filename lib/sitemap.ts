/**
 * lib/sitemap.ts - Static XML sitemap generator for go2-mexico.com
 *
 * Reads all content directories, static pages, and list pages to produce
 * a complete sitemap.xml written to public/sitemap.xml.
 *
 * Run: npx tsx lib/sitemap.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

// Import siteUrl at runtime so this file stays self-contained when executed
// directly with tsx. We read the value from site.config.ts dynamically.
let SITE_URL = 'https://go2-mexico.com';
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cfg = require('../site.config');
  const config = cfg.siteConfig || cfg.default || cfg;
  if (config?.seo?.siteUrl) {
    SITE_URL = config.seo.siteUrl;
  }
} catch {
  // Fallback already set above
}

// Content types that live under content/<type>/*.md(x)
const CONTENT_TYPES = [
  'regions',
  'cities',
  'destinations',
  'experiences',
  'itineraries',
  'blog',
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

// Static pages (no dynamic data)
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

// List / index pages for each content type
const LIST_PAGES = [
  '/regions/',
  '/cities/',
  '/destinations/',
  '/experiences/',
  '/itineraries/',
  '/blog/',
];

// Priority mapping
const PRIORITY: Record<string, number> = {
  home: 1.0,
  static: 0.5,
  list: 0.8,
  blog: 0.7,
  detail: 0.6,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SitemapEntry {
  loc: string;
  lastmod: string;
  priority: number;
  changefreq: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Read all markdown files from a content type directory and return their
 * slug and updatedAt date from frontmatter.
 */
function getContentEntries(type: ContentType): Array<{ slug: string; updatedAt: string }> {
  const dir = path.join(CONTENT_DIR, type);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  return files.map((file) => {
    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    const slug = data.slug || file.replace(/\.mdx?$/, '');
    const updatedAt = data.updatedAt || data.date || new Date().toISOString().split('T')[0];
    return { slug, updatedAt };
  });
}

/**
 * Build the full URL for a locale-prefixed path.
 * Currently the site only has 'en' (defaultLocale), so no prefix is added.
 * When additional locales are introduced, pass the locale here and non-default
 * locales will get a /<locale> prefix.
 */
function buildUrl(urlPath: string, locale?: string): string {
  if (locale && locale !== 'en') {
    const prefixed = urlPath === '/' ? `/${locale}/` : `/${locale}${urlPath}`;
    return `${SITE_URL}${prefixed}`;
  }
  return `${SITE_URL}${urlPath}`;
}

// ---------------------------------------------------------------------------
// Sitemap collection
// ---------------------------------------------------------------------------

function collectEntries(): SitemapEntry[] {
  const today = new Date().toISOString().split('T')[0];
  const entries: SitemapEntry[] = [];

  // 1. Static pages
  for (const page of STATIC_PAGES) {
    entries.push({
      loc: buildUrl(page),
      lastmod: today,
      priority: page === '/' ? PRIORITY.home : PRIORITY.static,
      changefreq: page === '/' ? 'daily' : 'monthly',
    });
  }

  // 2. List / index pages
  for (const page of LIST_PAGES) {
    entries.push({
      loc: buildUrl(page),
      lastmod: today,
      priority: PRIORITY.list,
      changefreq: 'weekly',
    });
  }

  // 3. Detail pages from content directories
  for (const type of CONTENT_TYPES) {
    const contentEntries = getContentEntries(type);
    const priorityValue = type === 'blog' ? PRIORITY.blog : PRIORITY.detail;
    const changefreq = type === 'blog' ? 'weekly' : 'monthly';

    for (const entry of contentEntries) {
      entries.push({
        loc: buildUrl(`/${type}/${entry.slug}/`),
        lastmod: entry.updatedAt,
        priority: priorityValue,
        changefreq,
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// XML generation
// ---------------------------------------------------------------------------

function generateXml(entries: SitemapEntry[]): string {
  const urlElements = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>
`;
}

// ---------------------------------------------------------------------------
// Public API (importable by other modules)
// ---------------------------------------------------------------------------

export { SITE_URL, STATIC_PAGES, LIST_PAGES, CONTENT_TYPES };
export type { SitemapEntry, ContentType };

export function generateSitemap(): { entries: SitemapEntry[]; xml: string } {
  const entries = collectEntries();
  const xml = generateXml(entries);
  return { entries, xml };
}

export function writeSitemap(): number {
  const { entries, xml } = generateSitemap();

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');

  return entries.length;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function main(): void {
  console.log('Generating sitemap...');
  console.log(`Site URL: ${SITE_URL}`);
  console.log('');

  const { entries, xml } = generateSitemap();

  // Summarise by category
  const staticCount = STATIC_PAGES.length;
  const listCount = LIST_PAGES.length;
  const detailCounts: Record<string, number> = {};
  for (const type of CONTENT_TYPES) {
    detailCounts[type] = entries.filter((e) => e.loc.includes(`/${type}/`) && !LIST_PAGES.some((lp) => e.loc.endsWith(lp))).length;
  }

  console.log(`Static pages:   ${staticCount}`);
  console.log(`List pages:     ${listCount}`);
  for (const type of CONTENT_TYPES) {
    if (detailCounts[type] > 0) {
      console.log(`  ${type}: ${detailCounts[type]}`);
    }
  }
  console.log(`Total URLs:     ${entries.length}`);
  console.log('');

  // Write
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Written to: ${outputPath}`);
  console.log('Sitemap generation complete.');
}

// Run when executed directly
if (require.main === module || process.argv[1]?.endsWith('sitemap.ts')) {
  main();
}
