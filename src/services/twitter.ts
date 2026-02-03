// Twitter/X API Service for Soci
// Supports both OAuth 2.0 (callback flow) and OAuth 1.0a (direct tokens)

const STORAGE_KEY = 'soci_twitter_auth';

export interface TwitterAuth {
  // OAuth 2.0 fields
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  // OAuth 1.0a fields
  oauth1_access_token?: string;
  oauth1_access_secret?: string;
  // Common fields
  username: string;
  user_id?: string;
  auth_type: 'oauth2' | 'oauth1';
}

export interface TweetResult {
  success: boolean;
  tweet?: {
    id: string;
    text: string;
  };
  error?: string;
}

// Check if user is connected to Twitter
export function isTwitterConnected(): boolean {
  const auth = getTwitterAuth();
  if (!auth) return false;

  if (auth.auth_type === 'oauth1') {
    return !!(auth.oauth1_access_token && auth.oauth1_access_secret);
  }

  // OAuth 2.0
  return !!(auth.access_token && auth.expires_at && auth.expires_at > Date.now());
}

// Get stored Twitter auth
export function getTwitterAuth(): TwitterAuth | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Store Twitter auth
export function setTwitterAuth(auth: TwitterAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

// Clear Twitter auth
export function clearTwitterAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Store OAuth 1.0a credentials directly (for single-user apps)
export function setOAuth1Credentials(
  accessToken: string,
  accessSecret: string,
  username: string
): void {
  const auth: TwitterAuth = {
    oauth1_access_token: accessToken,
    oauth1_access_secret: accessSecret,
    username,
    auth_type: 'oauth1',
  };
  setTwitterAuth(auth);
}

// Initiate Twitter OAuth 2.0 flow
export function connectTwitter(): void {
  window.location.href = '/api/auth/twitter/authorize';
}

// Handle OAuth 2.0 callback (call this on app load)
export function handleTwitterCallback(): { success: boolean; username?: string; error?: string } {
  const params = new URLSearchParams(window.location.search);
  const authStatus = params.get('twitter_auth');
  const data = params.get('data');
  const error = params.get('error');

  // Clear URL params
  if (authStatus || error) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  if (error) {
    return { success: false, error: decodeURIComponent(error) };
  }

  if (authStatus === 'success' && data) {
    try {
      const decoded = JSON.parse(atob(data));
      const auth: TwitterAuth = {
        access_token: decoded.access_token,
        refresh_token: decoded.refresh_token,
        expires_at: Date.now() + (decoded.expires_in * 1000),
        username: decoded.username,
        user_id: decoded.user_id,
        auth_type: 'oauth2',
      };
      setTwitterAuth(auth);
      return { success: true, username: auth.username };
    } catch {
      return { success: false, error: 'Failed to parse authentication data' };
    }
  }

  return { success: false };
}

// Post a tweet using OAuth 1.0a
async function postTweetOAuth1(text: string, auth: TwitterAuth): Promise<TweetResult> {
  try {
    const response = await fetch('/api/twitter/tweet-oauth1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        accessToken: auth.oauth1_access_token,
        accessSecret: auth.oauth1_access_secret,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to post tweet' };
    }

    return { success: true, tweet: data.tweet };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Refresh OAuth 2.0 access token if needed
async function refreshTokenIfNeeded(): Promise<string | null> {
  const auth = getTwitterAuth();
  if (!auth || auth.auth_type !== 'oauth2') return null;

  // If token expires in less than 5 minutes, refresh it
  if (auth.expires_at && auth.expires_at - Date.now() < 5 * 60 * 1000) {
    try {
      const response = await fetch('/api/twitter/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      });

      if (!response.ok) {
        clearTwitterAuth();
        return null;
      }

      const data = await response.json();
      const newAuth: TwitterAuth = {
        ...auth,
        access_token: data.access_token,
        refresh_token: data.refresh_token || auth.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000),
      };
      setTwitterAuth(newAuth);
      return newAuth.access_token || null;
    } catch {
      return auth.access_token || null;
    }
  }

  return auth.access_token || null;
}

// Post a tweet using OAuth 2.0
async function postTweetOAuth2(text: string): Promise<TweetResult> {
  const accessToken = await refreshTokenIfNeeded();

  if (!accessToken) {
    return { success: false, error: 'Not connected to Twitter. Please connect your account.' };
  }

  try {
    const response = await fetch('/api/twitter/tweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        clearTwitterAuth();
        return { success: false, error: 'Session expired. Please reconnect your Twitter account.' };
      }
      return { success: false, error: data.error || 'Failed to post tweet' };
    }

    return { success: true, tweet: data.tweet };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Post a tweet (auto-detects auth type)
export async function postTweet(text: string): Promise<TweetResult> {
  const auth = getTwitterAuth();

  if (!auth) {
    return { success: false, error: 'Not connected to Twitter. Please connect your account.' };
  }

  if (auth.auth_type === 'oauth1') {
    return postTweetOAuth1(text, auth);
  }

  return postTweetOAuth2(text);
}

// Disconnect Twitter
export function disconnectTwitter(): void {
  clearTwitterAuth();
}

// Get connected username
export function getTwitterUsername(): string | null {
  const auth = getTwitterAuth();
  return auth?.username || null;
}

// Get auth type
export function getTwitterAuthType(): 'oauth1' | 'oauth2' | null {
  const auth = getTwitterAuth();
  return auth?.auth_type || null;
}
