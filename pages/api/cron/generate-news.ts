import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNextNewsArticle } from '../../../lib/pipeline/news-generator';
import { commitFilesToGitHub } from '../../../lib/pipeline/github-commit';

export const config = {
  maxDuration: 300,
};

/**
 * Daily Thailand-news cron.
 *
 * Scrapes a few major Thailand news sources, picks one fresh story we have
 * not yet published, writes a 500-800 word EN article with Grok 4.1 Fast,
 * translates it to NL with Grok 4 Fast, and commits both to:
 *   content/news/en/<date>-<slug>.md
 *   content/news/nl/<date>-<slug>.md
 *
 * Schedule via vercel.json.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[cron/generate-news] Starting news harvest + write...');

    const result = await generateNextNewsArticle();
    if (!result) {
      return res.status(200).json({ message: 'No fresh news candidates today.' });
    }

    const { en, nl, candidate } = result;

    const filesToCommit = [
      {
        path: `content/news/en/${en.slug}.md`,
        content: en.content,
        encoding: 'utf-8' as const,
      },
    ];

    if (nl) {
      filesToCommit.push({
        path: `content/news/nl/${nl.slug}.md`,
        content: nl.content,
        encoding: 'utf-8' as const,
      });
    }

    const commitMessage = `${nl ? 'Add news (EN + NL)' : 'Add news'}: ${en.title}\n\nSource: ${candidate.sourceName} (${candidate.sourceUrl})\nAuto-generated via Grok writer${nl ? ' + translator' : ''}.`;

    const commitResult = await commitFilesToGitHub(filesToCommit, commitMessage);
    console.log(`[cron/generate-news] Committed: ${commitResult.sha}`);

    return res.status(200).json({
      success: true,
      slug: en.slug,
      title: en.title,
      sourceName: candidate.sourceName,
      commitSha: commitResult.sha,
    });
  } catch (error) {
    console.error('[cron/generate-news] Error:', error);
    return res.status(500).json({
      error: 'News cron failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
