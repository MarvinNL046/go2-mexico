/**
 * scripts/verify-links.ts - Check for orphan pages and broken internal links
 *
 * Checks:
 *  - Reads all MD/MDX files and extracts internal links
 *  - Verifies each linked path corresponds to an existing page or content file
 *  - Reports broken links with file:line references
 *  - Checks that every detail page is linked from at least one other page
 *  - Reports orphan pages (pages not linked from anywhere except their list page)
 *
 * Run: npx tsx scripts/verify-links.ts
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');

const CONTENT_TYPES = [
  'regions',
  'cities',
  'destinations',
  'experiences',
  'itineraries',
  'blog',
] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

// Static pages that exist as routes
const STATIC_PATHS = new Set([
  '/',
  '/about/',
  '/contact/',
  '/editorial-policy/',
  '/how-we-research/',
  '/affiliate-disclosure/',
  '/privacy/',
  '/terms/',
]);

// List pages
const LIST_PATHS = new Set([
  '/regions/',
  '/cities/',
  '/destinations/',
  '/experiences/',
  '/itineraries/',
  '/blog/',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ContentFile {
  type: ContentType;
  slug: string;
  filePath: string;       // Absolute path
  relativePath: string;   // e.g. content/regions/yucatan-peninsula.md
  routePath: string;      // e.g. /regions/yucatan-peninsula/
}

interface LinkReference {
  target: string;          // The path extracted from the link
  sourceFile: string;      // Relative path of the source file
  line: number;            // Line number in the source file
}

/**
 * Collect all content files across all content types.
 */
function getAllContentFiles(): ContentFile[] {
  const files: ContentFile[] = [];

  for (const type of CONTENT_TYPES) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;

    const dirFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

    for (const file of dirFiles) {
      const slug = file.replace(/\.mdx?$/, '');
      files.push({
        type,
        slug,
        filePath: path.join(dir, file),
        relativePath: path.join('content', type, file),
        routePath: `/${type}/${slug}/`,
      });
    }
  }

  return files;
}

/**
 * Build a set of all known valid paths (static + list + detail pages).
 */
function buildKnownPaths(contentFiles: ContentFile[]): Set<string> {
  const paths = new Set<string>();

  // Static pages
  for (const p of STATIC_PATHS) paths.add(p);

  // List pages
  for (const p of LIST_PATHS) paths.add(p);

  // Detail pages
  for (const cf of contentFiles) {
    paths.add(cf.routePath);
  }

  return paths;
}

/**
 * Extract all internal markdown links from file content.
 * Matches patterns like [text](/path/) and [text](/path/to/page/)
 * Also matches bare reference-style links and inline HTML href attributes.
 */
function extractInternalLinks(content: string, relativePath: string): LinkReference[] {
  const links: LinkReference[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Match markdown links: [text](/path/)
    const mdLinkRegex = /\[([^\]]*)\]\((\/?[^)#\s]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = mdLinkRegex.exec(line)) !== null) {
      const target = match[2];

      // Only check internal links (starting with /)
      if (!target.startsWith('/')) continue;

      // Skip image/asset links
      if (target.match(/\.(png|jpg|jpeg|webp|gif|svg|pdf|css|js)$/i)) continue;

      // Normalize: ensure trailing slash
      const normalized = target.endsWith('/') ? target : `${target}/`;

      links.push({
        target: normalized,
        sourceFile: relativePath,
        line: lineNumber,
      });
    }

    // Match HTML href attributes: href="/path/"
    const hrefRegex = /href="(\/?[^"#]+)"/g;
    while ((match = hrefRegex.exec(line)) !== null) {
      const target = match[1];
      if (!target.startsWith('/')) continue;
      if (target.match(/\.(png|jpg|jpeg|webp|gif|svg|pdf|css|js)$/i)) continue;

      const normalized = target.endsWith('/') ? target : `${target}/`;

      links.push({
        target: normalized,
        sourceFile: relativePath,
        line: lineNumber,
      });
    }
  }

  return links;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('Internal link verification');
  console.log('==========================');
  console.log('');

  const contentFiles = getAllContentFiles();
  const knownPaths = buildKnownPaths(contentFiles);

  // Collect all links from all content files
  const allLinks: LinkReference[] = [];
  // Track inbound links per path (excluding self-links)
  const inboundLinks = new Map<string, Set<string>>();

  // Initialize inbound tracking for every detail page
  for (const cf of contentFiles) {
    inboundLinks.set(cf.routePath, new Set());
  }

  for (const cf of contentFiles) {
    const raw = fs.readFileSync(cf.filePath, 'utf8');
    const links = extractInternalLinks(raw, cf.relativePath);
    allLinks.push(...links);

    for (const link of links) {
      // Record inbound link (the source links to this target)
      const existing = inboundLinks.get(link.target);
      if (existing) {
        existing.add(cf.routePath);
      }
    }
  }

  console.log(`Content files scanned: ${contentFiles.length}`);
  console.log(`Internal links found:  ${allLinks.length}`);
  console.log('');

  // 1. Check for broken links
  const brokenLinks: LinkReference[] = [];
  for (const link of allLinks) {
    if (!knownPaths.has(link.target)) {
      brokenLinks.push(link);
    }
  }

  if (brokenLinks.length > 0) {
    console.log(`BROKEN LINKS (${brokenLinks.length}):`);
    for (const bl of brokenLinks) {
      console.log(`  ${bl.sourceFile}:${bl.line} -> ${bl.target}`);
    }
    console.log('');
  } else {
    console.log('No broken internal links found.');
    console.log('');
  }

  // 2. Check for orphan pages
  // A page is orphan if it has no inbound links from any page other than
  // its own list page (e.g. /regions/ linking to /regions/yucatan-peninsula/
  // does not count as a "real" inbound link for orphan detection).
  const orphans: ContentFile[] = [];

  for (const cf of contentFiles) {
    const linkers = inboundLinks.get(cf.routePath);
    if (!linkers || linkers.size === 0) {
      orphans.push(cf);
      continue;
    }

    // Filter out links that come from the same content type's own list page
    // (i.e. pages in the same type directory are considered sibling-links, not external refs)
    const externalLinkers = Array.from(linkers).filter((source) => {
      // If the source is in the same content type, it still counts as a real link
      // Only the list page itself doesn't count, but list pages are not in content/
      // So any link from content files counts.
      return true;
    });

    if (externalLinkers.length === 0) {
      orphans.push(cf);
    }
  }

  if (orphans.length > 0) {
    console.log(`ORPHAN PAGES (${orphans.length}) - no inbound links from other content:`);
    for (const cf of orphans) {
      console.log(`  ${cf.relativePath} (${cf.routePath})`);
    }
    console.log('');
  } else {
    console.log('No orphan pages found.');
    console.log('');
  }

  // Summary
  console.log('--------------------');
  console.log(`Broken links:  ${brokenLinks.length}`);
  console.log(`Orphan pages:  ${orphans.length}`);

  if (brokenLinks.length > 0) {
    console.log('');
    console.log('Link verification FAILED (broken links found).');
    process.exit(1);
  } else {
    console.log('');
    if (orphans.length > 0) {
      console.log('Link verification completed with warnings (orphan pages detected).');
    } else {
      console.log('Link verification passed.');
    }
  }
}

main();
