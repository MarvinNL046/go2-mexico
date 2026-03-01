import type { NextApiRequest, NextApiResponse } from 'next';
import { generateBlogPost } from '../../../lib/pipeline/content-generator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET (Vercel cron) and POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth: check CRON_SECRET
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
    console.log('[cron/generate-blog] Starting blog generation...');

    const result = await generateBlogPost();

    if (result.error) {
      console.error('[cron/generate-blog] Pipeline error:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        slug: result.slug,
      });
    }

    console.log(`[cron/generate-blog] Success: ${result.slug}`);

    return res.status(200).json({
      success: true,
      slug: result.slug,
      title: result.title,
      category: result.category,
      factCheckScore: result.factCheckScore,
      commitSha: result.commitSha,
      commitUrl: result.commitUrl,
    });
  } catch (err) {
    console.error('[cron/generate-blog] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
