import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Facebook OAuth 2.0 Authorization endpoint
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return res.status(500).json({ error: 'Facebook credentials not configured' });
  }

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  // Store state in a cookie for validation in callback
  res.setHeader('Set-Cookie', [
    `facebook_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  ]);

  // Required scopes for page posting
  // - pages_show_list: List user's pages
  // - pages_manage_posts: Post to pages
  // - pages_read_engagement: Read engagement metrics
  const scopes = [
    'pages_show_list',
    'pages_manage_posts',
    'pages_read_engagement',
  ].join(',');

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: state,
    scope: scopes,
    response_type: 'code',
  });

  const authUrl = `${FACEBOOK_AUTH_URL}?${params.toString()}`;

  // Redirect to Facebook authorization page
  res.redirect(302, authUrl);
}
