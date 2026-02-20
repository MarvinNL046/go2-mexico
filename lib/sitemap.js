const fs = require('fs');
const path = require('path');

// =============================================================================
// SITE CONFIGURATION - Update these for each destination
// =============================================================================
// These values should match your site.config.ts
const SITE_URL = 'https://go2-mexico.com';
const DESTINATION_SLUG = 'mexico'; // Used for /thailand-in/january/ style pages
const LOCALES = ['en'];
const DEFAULT_LOCALE = 'en';

// =============================================================================
// Data directory scanner
// =============================================================================
const dataDir = path.join(__dirname, '..', 'data');
const contentDir = path.join(__dirname, '..', 'content');
const publicDir = path.join(__dirname, '..', 'public');

/**
 * Read an index.json from a data subdirectory and return slugs.
 * Returns empty array if file doesn't exist.
 */
function getSlugsFromIndex(type) {
  try {
    const indexPath = path.join(dataDir, type, 'index.json');
    if (!fs.existsSync(indexPath)) return [];
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!Array.isArray(data)) return [];
    return data.map(item => item.slug).filter(Boolean);
  } catch (error) {
    console.warn(`  Warning: Could not read ${type}/index.json`);
    return [];
  }
}

/**
 * Scan a data subdirectory for individual JSON files (excluding index.json).
 * Useful for types that have per-slug JSON files.
 */
function getJsonSlugsFromDir(type) {
  try {
    const dir = path.join(dataDir, type);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json') && f !== 'index.json')
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

/**
 * Get blog post slugs from content/blog/*.md files.
 */
function getBlogSlugs() {
  try {
    const blogDir = path.join(contentDir, 'blog');
    if (!fs.existsSync(blogDir)) return [];
    return fs.readdirSync(blogDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  } catch {
    return [];
  }
}

/**
 * Get transport route slugs from data/transport-routes.json.
 */
function getTransportSlugs() {
  try {
    const routesPath = path.join(dataDir, 'transport-routes.json');
    if (!fs.existsSync(routesPath)) return [];
    const data = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
    if (data.routes && Array.isArray(data.routes)) {
      return data.routes.map(r => r.slug).filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Get Top 10 guide slugs by scanning data/top10/ directory.
 */
function getTop10Slugs() {
  try {
    const top10Dir = path.join(dataDir, 'top10');
    if (!fs.existsSync(top10Dir)) return [];
    return fs.readdirSync(top10Dir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

/**
 * Scan for attractions per city (data/attractions/{city-slug}/*.json).
 */
function getAttractions() {
  const results = [];
  try {
    const attractionsDir = path.join(dataDir, 'attractions');
    if (!fs.existsSync(attractionsDir)) return results;

    const cityDirs = fs.readdirSync(attractionsDir);
    cityDirs.forEach(citySlug => {
      const cityAttrDir = path.join(attractionsDir, citySlug);
      if (!fs.statSync(cityAttrDir).isDirectory()) return;

      const files = fs.readdirSync(cityAttrDir)
        .filter(f => f.endsWith('.json') && f !== 'index.json');

      files.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(cityAttrDir, file), 'utf8'));
          results.push({
            city: citySlug,
            slug: data.slug || file.replace('.json', ''),
          });
        } catch {
          // Skip malformed files
        }
      });
    });
  } catch {
    // No attractions directory
  }
  return results;
}

/**
 * Scan for comparison page slugs (data/comparisons/*.json).
 */
function getComparisonSlugs() {
  try {
    const dir = path.join(dataDir, 'comparisons');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json') && f !== 'index.json')
      .map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

// =============================================================================
// URL collection
// =============================================================================

function collectAllUrls() {
  const urls = [];

  // --- Static pages (always present) ---
  urls.push({ path: '/', priority: '1.0', changefreq: 'daily' });

  // --- Cities ---
  const citySlugs = getSlugsFromIndex('cities');
  if (citySlugs.length > 0) {
    urls.push({ path: '/city/', priority: '0.9', changefreq: 'daily' });
    citySlugs.forEach(slug => {
      urls.push({ path: `/city/${slug}/`, priority: '0.8', changefreq: 'weekly' });
      // City subpages
      urls.push({ path: `/city/${slug}/food/`, priority: '0.6', changefreq: 'monthly' });
      urls.push({ path: `/city/${slug}/hotels/`, priority: '0.6', changefreq: 'monthly' });
      urls.push({ path: `/city/${slug}/attractions/`, priority: '0.6', changefreq: 'monthly' });
      urls.push({ path: `/city/${slug}/weather/`, priority: '0.6', changefreq: 'monthly' });
    });
  }

  // --- Attractions (per city) ---
  const attractions = getAttractions();
  attractions.forEach(attr => {
    urls.push({ path: `/city/${attr.city}/attractions/${attr.slug}/`, priority: '0.7', changefreq: 'monthly' });
  });

  // --- Food ---
  const foodSlugs = getSlugsFromIndex('food');
  if (foodSlugs.length > 0) {
    urls.push({ path: '/food/', priority: '0.9', changefreq: 'daily' });
    foodSlugs.forEach(slug => {
      urls.push({ path: `/food/${slug}/`, priority: '0.7', changefreq: 'weekly' });
    });
  }

  // --- Drinks ---
  const drinkSlugs = getSlugsFromIndex('drinks');
  if (drinkSlugs.length > 0) {
    urls.push({ path: '/drinks/', priority: '0.9', changefreq: 'daily' });
    drinkSlugs.forEach(slug => {
      urls.push({ path: `/drinks/${slug}/`, priority: '0.7', changefreq: 'weekly' });
    });
  }

  // --- Islands ---
  const islandSlugs = getSlugsFromIndex('islands');
  if (islandSlugs.length > 0) {
    urls.push({ path: '/islands/', priority: '0.9', changefreq: 'daily' });
    islandSlugs.forEach(slug => {
      urls.push({ path: `/islands/${slug}/`, priority: '0.8', changefreq: 'weekly' });
    });
  }

  // --- Regions ---
  const regionSlugs = getSlugsFromIndex('regions');
  if (regionSlugs.length > 0) {
    urls.push({ path: '/region/', priority: '0.9', changefreq: 'weekly' });
    regionSlugs.forEach(slug => {
      urls.push({ path: `/region/${slug}/`, priority: '0.8', changefreq: 'weekly' });
    });
  }

  // --- Visa ---
  const visaSlugs = getSlugsFromIndex('visas');
  if (visaSlugs.length > 0) {
    urls.push({ path: '/visa/', priority: '0.9', changefreq: 'weekly' });
    visaSlugs.forEach(slug => {
      urls.push({ path: `/visa/${slug}/`, priority: '0.8', changefreq: 'monthly' });
    });
  }

  // --- Transport ---
  urls.push({ path: '/transport/', priority: '0.9', changefreq: 'weekly' });
  const transportSlugs = getTransportSlugs();
  transportSlugs.forEach(slug => {
    urls.push({ path: `/transport/${slug}/`, priority: '0.7', changefreq: 'weekly' });
  });

  // --- Practical Info ---
  const practicalSlugs = getSlugsFromIndex('practical-info');
  if (practicalSlugs.length > 0) {
    urls.push({ path: '/practical-info/', priority: '0.9', changefreq: 'weekly' });
    practicalSlugs.forEach(slug => {
      urls.push({ path: `/practical-info/${slug}/`, priority: '0.7', changefreq: 'monthly' });
    });
  }

  // --- Weather ---
  urls.push({ path: '/weather/', priority: '0.9', changefreq: 'weekly' });
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  // Monthly destination pages (e.g. /thailand-in/january/)
  months.forEach(month => {
    urls.push({ path: `/${DESTINATION_SLUG}-in/${month}/`, priority: '0.7', changefreq: 'monthly' });
  });

  // City weather per month
  citySlugs.forEach(citySlug => {
    months.forEach(month => {
      urls.push({ path: `/city/${citySlug}/weather/${month}/`, priority: '0.5', changefreq: 'monthly' });
    });
  });

  // --- Top 10 guides ---
  const top10Slugs = getTop10Slugs();
  if (top10Slugs.length > 0) {
    urls.push({ path: '/top-10/', priority: '0.9', changefreq: 'weekly' });
    // Category index pages
    ['restaurants', 'hotels', 'attractions'].forEach(cat => {
      urls.push({ path: `/top-10/${cat}/`, priority: '0.8', changefreq: 'weekly' });
    });
    // Individual Top 10 guides are typically at /city/{slug}/top-10-{category}/
    top10Slugs.forEach(slug => {
      // slug format is typically "bangkok-restaurants"
      const parts = slug.split('-');
      const category = parts.pop();
      const city = parts.join('-');
      if (city && category) {
        urls.push({ path: `/city/${city}/top-10-${category}/`, priority: '0.8', changefreq: 'weekly' });
      }
    });
  }

  // --- Comparisons ---
  const comparisonSlugs = getComparisonSlugs();
  if (comparisonSlugs.length > 0) {
    urls.push({ path: '/compare/', priority: '0.9', changefreq: 'weekly' });
    comparisonSlugs.forEach(slug => {
      urls.push({ path: `/compare/${slug}/`, priority: '0.7', changefreq: 'weekly' });
    });
  }

  // --- Blog ---
  const blogSlugs = getBlogSlugs();
  if (blogSlugs.length > 0) {
    urls.push({ path: '/blog/', priority: '0.9', changefreq: 'daily' });
    blogSlugs.forEach(slug => {
      urls.push({ path: `/blog/${slug}/`, priority: '0.7', changefreq: 'monthly' });
    });
  }

  // --- Other static pages ---
  urls.push({ path: '/esim/', priority: '0.8', changefreq: 'monthly' });
  urls.push({ path: '/travel-insurance/', priority: '0.8', changefreq: 'monthly' });

  return urls;
}

// =============================================================================
// XML generation
// =============================================================================

function generateSitemapXML(urls, locale) {
  const currentDate = new Date().toISOString();

  const urlElements = urls.map(url => {
    const fullPath = locale === DEFAULT_LOCALE
      ? url.path
      : (url.path === '/' ? `/${locale}/` : `/${locale}${url.path}`);

    return `  <url>
    <loc>${SITE_URL}${fullPath}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateSitemapIndexXML(sitemaps) {
  const sitemapElements = sitemaps.map(sitemap => {
    return `  <sitemap>
    <loc>${SITE_URL}/${sitemap.filename}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

// =============================================================================
// Main generator
// =============================================================================

function generateSitemap() {
  console.log('Generating dynamic sitemap...');
  console.log(`Site: ${SITE_URL}`);
  console.log(`Locales: ${LOCALES.join(', ')}`);

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Collect all URLs
  const urls = collectAllUrls();
  console.log(`\nCollected ${urls.length} base URLs`);

  // Generate per-locale sitemaps
  const sitemapIndexes = [];
  let totalUrls = 0;

  LOCALES.forEach(locale => {
    const sitemapFilename = locale === DEFAULT_LOCALE ? 'sitemap.xml' : `sitemap-${locale}.xml`;
    const xml = generateSitemapXML(urls, locale);

    const sitemapPath = path.join(publicDir, sitemapFilename);
    fs.writeFileSync(sitemapPath, xml);

    sitemapIndexes.push({
      filename: sitemapFilename,
      lastmod: new Date().toISOString(),
      locale,
    });

    console.log(`  ${sitemapFilename}: ${urls.length} URLs (${locale.toUpperCase()})`);
    totalUrls += urls.length;
  });

  // Generate sitemap index
  const indexXml = generateSitemapIndexXML(sitemapIndexes);
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), indexXml);
  console.log(`  sitemap-index.xml: ${sitemapIndexes.length} sitemaps`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
`;
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('  robots.txt: generated');

  console.log(`\nTotal URLs: ${totalUrls}`);
  console.log('Sitemap generation complete!');

  return totalUrls;
}

module.exports = { generateSitemap, collectAllUrls };

// Run if called directly: node lib/sitemap.js
if (require.main === module) {
  generateSitemap();
}
