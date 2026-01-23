import type { VercelRequest, VercelResponse } from '@vercel/node';

const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: 'Facebook credentials not configured' });
  }

  try {
    // Exchange current token for a new long-lived token
    // Note: This only works if the current token is still valid
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: access_token,
    });

    const response = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Token refresh failed:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Failed to refresh token',
      });
    }

    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in || 5184000, // ~60 days default
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
}
