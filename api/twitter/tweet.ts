import type { VercelRequest, VercelResponse } from '@vercel/node';

const TWITTER_TWEET_URL = 'https://api.twitter.com/2/tweets';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authHeader.substring(7);
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Tweet text is required' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Tweet exceeds 280 character limit' });
  }

  try {
    const response = await fetch(TWITTER_TWEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Tweet failed:', data);
      return res.status(response.status).json({
        error: data.detail || data.title || 'Failed to post tweet',
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      tweet: data.data,
    });

  } catch (error) {
    console.error('Tweet error:', error);
    return res.status(500).json({ error: 'Failed to post tweet' });
  }
}
