// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface LoginResponse {
  success: boolean;
  sessionToken?: string;
  error?: string;
  remainingAttempts?: number;
  resetIn?: number;
}

/**
 * Authenticate user via server-side endpoint with bcrypt
 */
export async function login(password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        sessionToken: data.sessionToken,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Login failed',
        remainingAttempts: data.remainingAttempts,
        resetIn: data.resetIn,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// DEPRECATED: Old SHA-256 functions kept for backward compatibility
export async function hashPassword(password: string): Promise<string> {
  console.warn('hashPassword is deprecated. Use server-side login endpoint instead.');
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(
  input: string,
  hash: string
): Promise<boolean> {
  console.warn('verifyPassword is deprecated. Use server-side login endpoint instead.');
  const inputHash = await hashPassword(input);
  return inputHash === hash;
}
