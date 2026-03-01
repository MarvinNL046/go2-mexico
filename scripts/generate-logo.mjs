#!/usr/bin/env node
/**
 * Generate Go2Mexico logo via xAI Grok Imagine API.
 * Reads XAI_API_KEY from .env.local (this project or sibling go2 projects).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Find XAI API key
let apiKey = null;
const projects = ['.', '../go2-bali.com', '../go2-vietnam.com', '../go2-china.com', '../go2-india.com'];
for (const p of projects) {
  try {
    const envPath = path.resolve(root, p, '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/XAI_API_KEY=["']?([a-zA-Z0-9_-]+)["']?/);
    if (match) {
      apiKey = match[1].trim().replace(/^["']|["']$/g, '').replace(/[\r\n"']/g, '').trim();
      console.log(`Found XAI_API_KEY in ${p}/.env.local (${apiKey.substring(0,10)}...)`);
      break;
    }
  } catch (e) {}
}

if (!apiKey) {
  console.error('XAI_API_KEY not found in any .env.local');
  process.exit(1);
}

const API_URL = 'https://api.x.ai/v1/images/generations';

const prompt = `Design a clean, modern, professional logo for a travel website called "Go2Mexico".
The logo should:
- Feature the text "Go2Mexico" in a modern, bold sans-serif font
- Include a subtle Mexican-inspired design element like an Aztec sun pattern, a small cactus silhouette, or stylized sombrero
- Use colors: deep green (#006847 like the Mexican flag), white, and warm accent orange (#FF6B35)
- Be suitable for a website header (horizontal/landscape layout)
- Have a clean white or transparent background
- Look professional, trustworthy, and modern (2026 aesthetic)
- NO photographic elements, only clean vector-style graphic design
- Simple enough to work at small sizes
- Travel brand feel, inviting and adventurous`;

async function main() {
  console.log('Generating logo via xAI Grok Imagine...');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt,
      n: 1,
      response_format: 'url',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`API Error: HTTP ${res.status}`, err);
    process.exit(1);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    console.error('No image URL in response');
    process.exit(1);
  }

  console.log('Image generated, downloading...');

  // Download image
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Save original PNG
  const origPath = path.join(root, 'public/images/logo-generated.png');
  fs.writeFileSync(origPath, buffer);
  console.log(`Saved original: ${origPath} (${buffer.length} bytes)`);

  // Process with sharp
  const sharp = (await import('sharp')).default;

  // Logo WebP (header size, ~400px wide)
  await sharp(buffer)
    .resize(400, null, { fit: 'inside', withoutEnlargement: false })
    .webp({ quality: 90 })
    .toFile(path.join(root, 'public/images/logo.webp'));
  console.log('Saved: public/images/logo.webp');

  // Favicon PNG 192x192
  await sharp(buffer)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(root, 'public/favicon.png'));
  console.log('Saved: public/favicon.png');

  // Favicon ICO (32x32 PNG saved as .ico)
  await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(root, 'public/favicon.ico'));
  console.log('Saved: public/favicon.ico');

  // Apple touch icon (180x180)
  await sharp(buffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(root, 'public/apple-touch-icon.png'));
  console.log('Saved: public/apple-touch-icon.png');

  // OG image (1200x630 with white background)
  await sharp(buffer)
    .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 85 })
    .toFile(path.join(root, 'public/images/og-default.jpg'));
  console.log('Saved: public/images/og-default.jpg');

  console.log('\nDone! Logo generated and processed into all formats.');
}

main().catch(e => { console.error(e); process.exit(1); });
