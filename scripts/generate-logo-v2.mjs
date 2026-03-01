#!/usr/bin/env node
/**
 * Generate Go2Mexico logo via xAI Grok Imagine API.
 * Reads XAI_API_KEY from this project's .env.local.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Load key from .env.local
const envPath = path.join(root, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/XAI_API_KEY=["']?([a-zA-Z0-9_-]+)["']?/);
if (!match) { console.error('XAI_API_KEY not found'); process.exit(1); }
const apiKey = match[1];
console.log(`Using XAI_API_KEY: ${apiKey.substring(0, 10)}...`);

const API_URL = 'https://api.x.ai/v1/images/generations';

const prompt = `Create a sleek, modern logo for "Go2Mexico" — a premium travel guide website.

DESIGN REQUIREMENTS:
- The word "Go2Mexico" written as one word in a bold, modern sans-serif typeface
- "Go" in deep Mexican green (#006847)
- "2" in vibrant warm orange (#FF6B35), slightly larger or stylized to stand out
- "Mexico" in deep Mexican green (#006847)
- A small, elegant Mexican accent element integrated into the design — such as a tiny saguaro cactus, a subtle Aztec sun motif, or a small stylized eagle
- The accent should be minimal and sophisticated, not cartoonish
- MUST have a completely transparent/white clean background
- Horizontal layout suitable for a website header
- Professional, clean, trustworthy aesthetic — like a luxury travel brand
- Flat design, no gradients, no shadows, no 3D effects
- Vector-style clean edges

CRITICAL RULES:
- Only the word "Go2Mexico" — no tagline, no extra text
- No background patterns or decorations
- No photographic elements
- Crisp, clean lines suitable for small and large display`;

async function generate() {
  console.log('Generating logo...');

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
    console.error(`API Error: ${res.status}`, err);
    process.exit(1);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) { console.error('No URL in response'); process.exit(1); }

  console.log('Downloading...');
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  // Save raw
  const rawPath = path.join(root, 'public/images/logo-v2-raw.png');
  fs.writeFileSync(rawPath, buffer);
  console.log(`Raw saved: ${rawPath} (${buffer.length} bytes)`);

  // Process with sharp
  const sharp = (await import('sharp')).default;

  // Get image info
  const meta = await sharp(buffer).metadata();
  console.log(`Image: ${meta.width}x${meta.height}, ${meta.format}`);

  // Header logo (WebP, transparent)
  await sharp(buffer)
    .resize(400, null, { fit: 'inside' })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(root, 'public/images/logo.webp'));
  console.log('Saved: logo.webp');

  // Header logo PNG (transparent)
  await sharp(buffer)
    .resize(800, null, { fit: 'inside' })
    .png()
    .toFile(path.join(root, 'public/images/logo.png'));
  console.log('Saved: logo.png');

  // Favicon (32x32)
  await sharp(buffer)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, 'public/favicon.ico'));
  console.log('Saved: favicon.ico');

  // Favicon PNG (192x192)
  await sharp(buffer)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(root, 'public/favicon.png'));
  console.log('Saved: favicon.png');

  // Apple touch icon
  await sharp(buffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(root, 'public/apple-touch-icon.png'));
  console.log('Saved: apple-touch-icon.png');

  // OG image (1200x630, white bg)
  await sharp(buffer)
    .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 85 })
    .toFile(path.join(root, 'public/images/og-default.jpg'));
  console.log('Saved: og-default.jpg');

  console.log('\nDone!');
}

generate().catch(e => { console.error(e); process.exit(1); });
