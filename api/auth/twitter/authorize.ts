import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Twitter OAuth 2.0 Authorization endpoint
const TWITTER_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Twitter credentials not configured' });
  }

  // Generate PKCE code verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Generate state for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  // Store code verifier and state in a cookie (encrypted in production)
  res.setHeader('Set-Cookie', [
    `twitter_code_verifier=${codeVerifier}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    `twitter_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  ]);

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'tweet.read tweet.write users.read offline.access',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${TWITTER_AUTH_URL}?${params.toString()}`;

  // Redirect to Twitter authorization page
  res.redirect(302, authUrl);
}
