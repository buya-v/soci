import type { VercelRequest, VercelResponse } from '@vercel/node';

// Twitter OAuth 2.0 Token endpoint
const TWITTER_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TWITTER_USER_URL = 'https://api.twitter.com/2/users/me';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = value;
    return cookies;
  }, {} as Record<string, string>);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error, error_description } = req.query;

  // Handle authorization errors
  if (error) {
    return res.redirect(`/?error=${encodeURIComponent(error_description as string || error as string)}`);
  }

  if (!code || !state) {
    return res.redirect('/?error=Missing authorization code or state');
  }

  // Verify state matches
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies.twitter_state;
  const codeVerifier = cookies.twitter_code_verifier;

  if (!storedState || storedState !== state) {
    return res.redirect('/?error=Invalid state parameter');
  }

  if (!codeVerifier) {
    return res.redirect('/?error=Missing code verifier');
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return res.redirect('/?error=Twitter credentials not configured');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(TWITTER_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.redirect('/?error=Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(TWITTER_USER_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    let userData = { data: { username: 'unknown', id: '' } };
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    // Clear the OAuth cookies
    res.setHeader('Set-Cookie', [
      'twitter_code_verifier=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      'twitter_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    ]);

    // Store tokens securely (in a cookie or return to frontend)
    // For now, we'll pass tokens to frontend via URL fragment (not ideal for production)
    // In production, you should store in a database and use session management

    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      username: userData.data.username,
      user_id: userData.data.id,
    };

    // Redirect back to app with success
    // Using localStorage on frontend to store tokens
    const encodedData = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    res.redirect(`/?twitter_auth=success&data=${encodedData}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/?error=Authentication failed');
  }
}
