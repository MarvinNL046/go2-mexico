import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { generateContent } from '../../../lib/pipeline/ai-provider';
import { commitFiles, CommitFile } from '../../../lib/pipeline/github-commit';

// ---------------------------------------------------------------------------
// Translation pipeline: translates recent English blog posts to Dutch (NL)
// ---------------------------------------------------------------------------

const TRANSLATION_PROMPT_SYSTEM = `You are a professional translator specializing in travel content. Translate English travel articles to Dutch (Netherlands Dutch, not Belgian).
Keep the following unchanged:
- Markdown formatting (headings, links, bold, lists)
- Proper nouns (city names, restaurant names, etc.)
- URLs and affiliate links
- Frontmatter YAML structure
- Prices in MXN and USD (but you may add approximate EUR equivalents)
Translate naturally - not word-for-word. Use informal "je/jij" style.`;

function getRecentUntranslatedPosts(): string[] {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const nlDir = path.join(process.cwd(), 'content', 'blog', 'nl');

  if (!fs.existsSync(blogDir)) return [];

  const enPosts = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));

  const nlPosts = new Set<string>();
  if (fs.existsSync(nlDir)) {
    fs.readdirSync(nlDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''))
      .forEach(f => nlPosts.add(f));
  }

  // Find posts not yet translated, sorted by most recent first
  const untranslated = enPosts.filter(slug => !nlPosts.has(slug));

  // Get file stats to sort by modification time
  return untranslated
    .map(slug => ({
      slug,
      mtime: fs.statSync(path.join(blogDir, `${slug}.md`)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(entry => entry.slug);
}

async function translatePost(slug: string): Promise<{ slug: string; success: boolean; error?: string }> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const filePath = path.join(blogDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return { slug, success: false, error: 'Source file not found' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Translate
  const translated = await generateContent(
    `Translate the following English travel blog post to Dutch. Keep all markdown formatting, frontmatter, links, and proper nouns intact.\n\n${content}`,
    {
      maxTokens: 4096,
      temperature: 0.3,
      systemPrompt: TRANSLATION_PROMPT_SYSTEM,
    }
  );

  // Commit the translated file
  const files: CommitFile[] = [
    {
      path: `content/blog/nl/${slug}.md`,
      content: translated,
      encoding: 'utf-8',
    },
  ];

  const result = await commitFiles(files, `blog(nl): translate "${slug}" to Dutch`);

  console.log(`[translate-blog] Translated ${slug}, commit: ${result.sha}`);

  return { slug, success: true };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({ error: 'CRON_SECRET not configured' });
  }

  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const token = authHeader?.replace('Bearer ', '') ?? queryToken;

  if (token !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[cron/translate-blog] Starting translation run...');

    const untranslated = getRecentUntranslatedPosts();

    if (untranslated.length === 0) {
      console.log('[cron/translate-blog] All posts already translated');
      return res.status(200).json({
        success: true,
        message: 'All posts already translated',
        translated: [],
      });
    }

    // Translate 1 post per run to stay within execution limits
    const slug = untranslated[0];
    console.log(`[cron/translate-blog] Translating: ${slug}`);

    const result = await translatePost(slug);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error,
        slug: result.slug,
      });
    }

    return res.status(200).json({
      success: true,
      translated: [result.slug],
      remaining: untranslated.length - 1,
    });
  } catch (err) {
    console.error('[cron/translate-blog] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
