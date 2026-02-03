import type { VercelRequest, VercelResponse } from '@vercel/node';

// Facebook Graph API endpoints
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const FACEBOOK_ME_URL = 'https://graph.facebook.com/v18.0/me';
const FACEBOOK_ACCOUNTS_URL = 'https://graph.facebook.com/v18.0/me/accounts';

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = value;
    return cookies;
  }, {} as Record<string, string>);
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error, error_description } = req.query;

  // Handle authorization errors
  if (error) {
    return res.redirect(`/automation?error=${encodeURIComponent(error_description as string || error as string)}`);
  }

  if (!code || !state) {
    return res.redirect('/automation?error=Missing authorization code or state');
  }

  // Verify state matches
  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies.facebook_state;

  if (!storedState || storedState !== state) {
    return res.redirect('/automation?error=Invalid state parameter');
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    return res.redirect('/automation?error=Facebook credentials not configured');
  }

  try {
    // Step 1: Exchange code for short-lived user access token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code as string,
    });

    const tokenResponse = await fetch(`${FACEBOOK_TOKEN_URL}?${tokenParams.toString()}`);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.redirect('/automation?error=Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const userAccessToken = tokenData.access_token;

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: userAccessToken,
    });

    const longLivedResponse = await fetch(`${FACEBOOK_TOKEN_URL}?${longLivedParams.toString()}`);

    let longLivedToken = userAccessToken;
    let expiresIn = 3600; // Default 1 hour for short-lived

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      longLivedToken = longLivedData.access_token;
      expiresIn = longLivedData.expires_in || 5184000; // ~60 days
    }

    // Step 3: Get user info
    const userResponse = await fetch(`${FACEBOOK_ME_URL}?access_token=${longLivedToken}&fields=id,name`);

    let userData = { id: '', name: 'Unknown User' };
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    // Step 4: Get user's Facebook Pages
    const pagesResponse = await fetch(`${FACEBOOK_ACCOUNTS_URL}?access_token=${longLivedToken}&fields=id,name,access_token,category`);

    let pages: FacebookPage[] = [];
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      pages = pagesData.data || [];
    }

    // Clear the OAuth cookie
    res.setHeader('Set-Cookie', [
      'facebook_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    ]);

    // Prepare response data
    // If user has pages, use the first page by default
    // Page access tokens don't expire as long as the user's long-lived token is valid
    const responseData = {
      user_access_token: longLivedToken,
      user_id: userData.id,
      user_name: userData.name,
      expires_in: expiresIn,
      pages: pages.map(page => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        category: page.category,
      })),
    };

    // Redirect back to app with encoded data
    const encodedData = Buffer.from(JSON.stringify(responseData)).toString('base64');
    res.redirect(`/automation?facebook_auth=success&data=${encodedData}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect('/automation?error=Authentication failed');
  }
}
