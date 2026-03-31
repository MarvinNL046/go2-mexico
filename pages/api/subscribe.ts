import type { NextApiRequest, NextApiResponse } from 'next';

const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL || 'https://formal-tern-925.eu-west-1.convex.site';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, site, locale } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch(`${CONVEX_SITE_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        site: site || 'go2mexico',
        locale: locale || 'en',
      }),
    });

    if (!response.ok) {
      throw new Error(`Convex responded with ${response.status}`);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
