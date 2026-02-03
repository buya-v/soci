// Facebook Page API Service for Soci
// Supports OAuth 2.0 for Facebook Page posting

const STORAGE_KEY = 'soci_facebook_auth';

export interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
  category: string;
  pictureUrl?: string;
}

export interface FacebookAuth {
  userAccessToken: string;
  userId: string;
  userName: string;
  expiresAt: number;
  pages: FacebookPage[];
  selectedPageId: string | null;
}

export interface FacebookPostResult {
  success: boolean;
  post?: {
    id: string;
    scheduled?: boolean;
  };
  error?: string;
}

export interface FacebookPostParams {
  message?: string;
  link?: string;
  photoUrl?: string;
  scheduledPublishTime?: number; // Unix timestamp
}

// Check if user is connected to Facebook
export function isFacebookConnected(): boolean {
  const auth = getFacebookAuth();
  if (!auth) return false;

  // Check if token is still valid (with 5 min buffer)
  return !!(auth.userAccessToken && auth.expiresAt && auth.expiresAt > Date.now() + 5 * 60 * 1000);
}

// Get stored Facebook auth
export function getFacebookAuth(): FacebookAuth | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Store Facebook auth
export function setFacebookAuth(auth: FacebookAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

// Clear Facebook auth
export function clearFacebookAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Initiate Facebook OAuth flow
export function connectFacebook(): void {
  window.location.href = '/api/auth/facebook/authorize';
}

// Handle OAuth callback (call this on app/page load)
export function handleFacebookCallback(): { success: boolean; pageName?: string; error?: string } {
  const params = new URLSearchParams(window.location.search);
  const authStatus = params.get('facebook_auth');
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

      // Map pages from callback response
      const pages: FacebookPage[] = (decoded.pages || []).map((page: {
        id: string;
        name: string;
        access_token: string;
        category: string;
      }) => ({
        id: page.id,
        name: page.name,
        accessToken: page.access_token,
        category: page.category,
      }));

      // Select first page by default if available
      const selectedPageId = pages.length > 0 ? pages[0].id : null;

      const auth: FacebookAuth = {
        userAccessToken: decoded.user_access_token,
        userId: decoded.user_id,
        userName: decoded.user_name,
        expiresAt: Date.now() + (decoded.expires_in * 1000),
        pages,
        selectedPageId,
      };

      setFacebookAuth(auth);

      const selectedPage = pages.find(p => p.id === selectedPageId);
      return {
        success: true,
        pageName: selectedPage?.name || decoded.user_name,
      };
    } catch {
      return { success: false, error: 'Failed to parse authentication data' };
    }
  }

  return { success: false };
}

// Get user's Facebook pages
export function getFacebookPages(): FacebookPage[] {
  const auth = getFacebookAuth();
  return auth?.pages || [];
}

// Get currently selected page
export function getSelectedFacebookPage(): FacebookPage | null {
  const auth = getFacebookAuth();
  if (!auth || !auth.selectedPageId) return null;
  return auth.pages.find(p => p.id === auth.selectedPageId) || null;
}

// Select a page for posting
export function setSelectedFacebookPage(pageId: string): void {
  const auth = getFacebookAuth();
  if (!auth) return;

  const page = auth.pages.find(p => p.id === pageId);
  if (!page) return;

  auth.selectedPageId = pageId;
  setFacebookAuth(auth);
}

// Refresh Facebook pages list from API
export async function refreshFacebookPages(): Promise<FacebookPage[]> {
  const auth = getFacebookAuth();
  if (!auth) {
    return [];
  }

  try {
    const response = await fetch('/api/facebook/pages', {
      headers: {
        Authorization: `Bearer ${auth.userAccessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearFacebookAuth();
      }
      return [];
    }

    const data = await response.json();
    const pages: FacebookPage[] = data.pages || [];

    // Update stored auth with new pages
    auth.pages = pages;
    if (auth.selectedPageId && !pages.find(p => p.id === auth.selectedPageId)) {
      // Previously selected page no longer available
      auth.selectedPageId = pages.length > 0 ? pages[0].id : null;
    }
    setFacebookAuth(auth);

    return pages;
  } catch {
    return auth.pages || [];
  }
}

// Refresh token if needed
async function refreshTokenIfNeeded(): Promise<string | null> {
  const auth = getFacebookAuth();
  if (!auth) return null;

  // If token expires in less than 7 days, refresh it
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (auth.expiresAt && auth.expiresAt - Date.now() < sevenDays) {
    try {
      const response = await fetch('/api/auth/facebook/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: auth.userAccessToken }),
      });

      if (!response.ok) {
        // Token couldn't be refreshed but may still be valid
        if (auth.expiresAt > Date.now()) {
          return auth.userAccessToken;
        }
        clearFacebookAuth();
        return null;
      }

      const data = await response.json();
      const newAuth: FacebookAuth = {
        ...auth,
        userAccessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      };
      setFacebookAuth(newAuth);
      return newAuth.userAccessToken;
    } catch {
      return auth.userAccessToken;
    }
  }

  return auth.userAccessToken;
}

// Post to Facebook Page
export async function postToFacebook(params: FacebookPostParams): Promise<FacebookPostResult> {
  const auth = getFacebookAuth();

  if (!auth) {
    return { success: false, error: 'Not connected to Facebook. Please connect your account.' };
  }

  const selectedPage = getSelectedFacebookPage();
  if (!selectedPage) {
    return { success: false, error: 'No Facebook Page selected. Please select a page to post to.' };
  }

  // Ensure token is fresh
  await refreshTokenIfNeeded();

  try {
    const response = await fetch('/api/facebook/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageId: selectedPage.id,
        pageAccessToken: selectedPage.accessToken,
        message: params.message,
        link: params.link,
        photoUrl: params.photoUrl,
        scheduledPublishTime: params.scheduledPublishTime,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        clearFacebookAuth();
        return { success: false, error: 'Session expired. Please reconnect your Facebook account.' };
      }
      return { success: false, error: data.error || 'Failed to post to Facebook' };
    }

    return {
      success: true,
      post: data.post,
    };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Disconnect Facebook
export function disconnectFacebook(): void {
  clearFacebookAuth();
}

// Get connected page name for display
export function getFacebookPageName(): string | null {
  const page = getSelectedFacebookPage();
  return page?.name || null;
}

// Get user name (for when no page is selected)
export function getFacebookUserName(): string | null {
  const auth = getFacebookAuth();
  return auth?.userName || null;
}

// Get number of connected pages
export function getFacebookPagesCount(): number {
  const auth = getFacebookAuth();
  return auth?.pages?.length || 0;
}
