/**
 * scripts/verify-content.ts - QA verification for content files
 *
 * Checks:
 *  - Every MD/MDX file has required frontmatter fields
 *  - Every content file's slug matches its filename
 *  - No duplicate slugs within a content type
 *  - Reports counts per type
 *  - Exits with code 1 if any validation fails
 *
 * Run: npx tsx scripts/verify-content.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

const REQUIRED_FIELDS = [
  'title',
  'description',
  'slug',
  'updatedAt',
  'author',
  'heroImage',
  'tags',
];

// ---------------------------------------------------------------------------
// Verification logic
// ---------------------------------------------------------------------------

interface Issue {
  file: string;
  message: string;
}

function verifyContentType(type: ContentType): {
  issues: Issue[];
  count: number;
  slugs: string[];
} {
  const dir = path.join(CONTENT_DIR, type);
  const issues: Issue[] = [];
  const slugs: string[] = [];

  if (!fs.existsSync(dir)) {
    return { issues, count: 0, slugs };
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const relativePath = path.join('content', type, file);
    const raw = fs.readFileSync(filePath, 'utf8');

    let data: Record<string, unknown>;
    try {
      const parsed = matter(raw);
      data = parsed.data;
    } catch (err) {
      issues.push({
        file: relativePath,
        message: `Failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        issues.push({
          file: relativePath,
          message: `Missing required frontmatter field: "${field}"`,
        });
      }
    }

    // Validate tags is an array
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      issues.push({
        file: relativePath,
        message: `"tags" must be an array, got ${typeof data.tags}`,
      });
    }

    // Check slug matches filename
    const filenameSlug = file.replace(/\.mdx?$/, '');
    const frontmatterSlug = data.slug as string | undefined;
    if (frontmatterSlug && frontmatterSlug !== filenameSlug) {
      issues.push({
        file: relativePath,
        message: `Slug mismatch: frontmatter slug "${frontmatterSlug}" does not match filename "${filenameSlug}"`,
      });
    }

    slugs.push(frontmatterSlug || filenameSlug);
  }

  // Check duplicate slugs
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      issues.push({
        file: `content/${type}/`,
        message: `Duplicate slug: "${slug}"`,
      });
    }
    seen.add(slug);
  }

  return { issues, count: files.length, slugs };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('Content verification');
  console.log('====================');
  console.log('');

  let totalIssues = 0;
  let totalFiles = 0;

  for (const type of CONTENT_TYPES) {
    const { issues, count } = verifyContentType(type);
    totalFiles += count;

    const status = issues.length === 0 ? 'OK' : 'ISSUES';
    console.log(`[${status}] ${type}: ${count} file(s)`);

    for (const issue of issues) {
      console.log(`  ERROR  ${issue.file}: ${issue.message}`);
    }

    totalIssues += issues.length;
  }

  console.log('');
  console.log('--------------------');
  console.log(`Total files:  ${totalFiles}`);
  console.log(`Total issues: ${totalIssues}`);

  if (totalIssues > 0) {
    console.log('');
    console.log('Verification FAILED.');
    process.exit(1);
  } else {
    console.log('');
    console.log('All content verified successfully.');
  }
}

main();
