#!/usr/bin/env node
/**
 * Drop sitemap entries that 404 on the live site.
 *
 * lib/sitemap.js already refuses to emit URLs with no matching page route,
 * which catches whole page types that were designed and never built. It cannot
 * catch the other case: a route that exists but has no data for that slug, so
 * getStaticPaths never generates it. Only the live site knows, so this asks it.
 *
 *   node lib/verify-sitemap.js            # report only
 *   node lib/verify-sitemap.js --write    # rewrite public/sitemap.xml
 *
 * Run after deploying, so the site being checked is the one the sitemap
 * describes.
 */
const fs = require('fs');
const path = require('path');

const WRITE = process.argv.includes('--write');
const CONCURRENCY = 12;
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'manual' });
    return res.status;
  } catch (e) {
    return 0;
  }
}

async function main() {
  if (!fs.existsSync(sitemapPath)) {
    console.error('geen public/sitemap.xml gevonden'); process.exit(1);
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log(`${urls.length} URLs in de sitemap, controleren...`);

  const dead = [];
  const failed = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      const status = await head(url);
      if (status === 404) dead.push(url);
      else if (status === 0) failed.push(url);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (failed.length) {
    console.log(`\n${failed.length} URL(s) niet te bereiken - niet verwijderd, wel melden:`);
    failed.slice(0, 5).forEach(u => console.log('  ' + u));
  }

  if (!dead.length) {
    console.log('\nGeen dode URLs. Niets te doen.');
    return;
  }

  console.log(`\n${dead.length} URL(s) geven 404:`);
  dead.slice(0, 10).forEach(u => console.log('  ' + u));
  if (dead.length > 10) console.log(`  ... en nog ${dead.length - 10}`);

  if (!WRITE) {
    console.log('\nDraai met --write om ze uit public/sitemap.xml te halen.');
    process.exit(1);
  }

  const deadSet = new Set(dead);
  const cleaned = xml.replace(/\s*<url>[\s\S]*?<\/url>/g, block => {
    const m = block.match(/<loc>([^<]+)<\/loc>/);
    return m && deadSet.has(m[1]) ? '' : block;
  });
  fs.writeFileSync(sitemapPath, cleaned);
  const left = [...cleaned.matchAll(/<loc>/g)].length;
  console.log(`\npublic/sitemap.xml herschreven: ${left} URLs over.`);
}

main();
