// Twitter/X API Service for Soci

const STORAGE_KEY = 'soci_twitter_auth';

export interface TwitterAuth {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp
  username: string;
  user_id: string;
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
  return auth !== null && auth.expires_at > Date.now();
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

// Initiate Twitter OAuth flow
export function connectTwitter(): void {
  window.location.href = '/api/auth/twitter/authorize';
}

// Handle OAuth callback (call this on app load)
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
      };
      setTwitterAuth(auth);
      return { success: true, username: auth.username };
    } catch (e) {
      return { success: false, error: 'Failed to parse authentication data' };
    }
  }

  return { success: false };
}

// Refresh access token if needed
async function refreshTokenIfNeeded(): Promise<string | null> {
  const auth = getTwitterAuth();
  if (!auth) return null;

  // If token expires in less than 5 minutes, refresh it
  if (auth.expires_at - Date.now() < 5 * 60 * 1000) {
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
      return newAuth.access_token;
    } catch {
      return auth.access_token; // Try with existing token
    }
  }

  return auth.access_token;
}

// Post a tweet
export async function postTweet(text: string): Promise<TweetResult> {
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
      // If unauthorized, clear auth and prompt reconnection
      if (response.status === 401) {
        clearTwitterAuth();
        return { success: false, error: 'Session expired. Please reconnect your Twitter account.' };
      }
      return { success: false, error: data.error || 'Failed to post tweet' };
    }

    return { success: true, tweet: data.tweet };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
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
