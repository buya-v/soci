import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TWITTER_TWEET_URL = 'https://api.twitter.com/2/tweets';

// Generate OAuth 1.0a signature
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

// Generate OAuth 1.0a header
function generateOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessSecret: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  };

  // Generate signature
  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    consumerSecret,
    accessSecret
  );

  oauthParams.oauth_signature = signature;

  // Build OAuth header
  const headerParams = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  return `OAuth ${headerParams}`;
}

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

  const { text, accessToken, accessSecret } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Tweet text is required' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Tweet exceeds 280 character limit' });
  }

  if (!accessToken || !accessSecret) {
    return res.status(400).json({ error: 'Access token and secret are required' });
  }

  const consumerKey = process.env.TWITTER_API_KEY;
  const consumerSecret = process.env.TWITTER_API_SECRET;

  if (!consumerKey || !consumerSecret) {
    return res.status(500).json({ error: 'Twitter API credentials not configured' });
  }

  try {
    const oauthHeader = generateOAuthHeader(
      'POST',
      TWITTER_TWEET_URL,
      consumerKey,
      consumerSecret,
      accessToken,
      accessSecret
    );

    const response = await fetch(TWITTER_TWEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: oauthHeader,
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Tweet failed:', data);
      return res.status(response.status).json({
        error: data.detail || data.title || data.errors?.[0]?.message || 'Failed to post tweet',
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
