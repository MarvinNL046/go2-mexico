#!/usr/bin/env node
/**
 * IndexNow submission script
 * Submits URLs to search engines for instant indexing.
 *
 * Usage:
 *   node scripts/indexnow.js                    # Submit all URLs from sitemap
 *   node scripts/indexnow.js /blog/new-post/    # Submit specific URL
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://go2-mexico.com';
const API_KEY = '963f5657e9e7857db4501a427786ea14';

async function submitUrls(urls) {
  const payload = JSON.stringify({
    host: 'go2-mexico.com',
    key: API_KEY,
    keyLocation: `${SITE_URL}/${API_KEY}.txt`,
    urlList: urls,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.indexnow.org',
        path: '/IndexNow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          console.log(`IndexNow response: ${res.statusCode}`);
          if (res.statusCode === 200 || res.statusCode === 202) {
            console.log(`Successfully submitted ${urls.length} URLs`);
          } else {
            console.log(`Response: ${data}`);
          }
          resolve(res.statusCode);
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getUrlsFromSitemap() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('sitemap.xml not found. Run build first.');
    process.exit(1);
  }
  const content = fs.readFileSync(sitemapPath, 'utf8');
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function main() {
  const specificUrl = process.argv[2];

  let urls;
  if (specificUrl) {
    urls = [specificUrl.startsWith('http') ? specificUrl : `${SITE_URL}${specificUrl}`];
  } else {
    urls = await getUrlsFromSitemap();
  }

  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  // IndexNow has a limit of 10,000 URLs per submission
  const batchSize = 10000;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await submitUrls(batch);
  }
}

main().catch(console.error);
