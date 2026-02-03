import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login, hashPassword, verifyPassword } from './auth';

// Mock fetch
global.fetch = vi.fn();

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login (server-side authentication)', () => {
    it('should return success true when login is successful', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, sessionToken: 'test-token-123' }),
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

      const result = await login('correct-password');

      expect(result.success).toBe(true);
      expect(result.sessionToken).toBe('test-token-123');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'correct-password' }),
        })
      );
    });

    it('should return success false when password is incorrect', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Invalid password',
          remainingAttempts: 4,
        }),
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

      const result = await login('wrong-password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
      expect(result.remainingAttempts).toBe(4);
    });

    it('should handle rate limiting errors', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({
          error: 'Too many login attempts. Please try again in 900 seconds.',
          resetIn: 900,
        }),
      };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

      const result = await login('any-password');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many login attempts');
      expect(result.resetIn).toBe(900);
    });

    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await login('password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('hashPassword (deprecated - SHA-256)', () => {
    it('should return a 64-character hex string', async () => {
      const hash = await hashPassword('test123');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should return consistent hash for same input', async () => {
      const hash1 = await hashPassword('mypassword');
      const hash2 = await hashPassword('mypassword');
      expect(hash1).toBe(hash2);
    });

    it('should return different hash for different inputs', async () => {
      const hash1 = await hashPassword('password1');
      const hash2 = await hashPassword('password2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword (deprecated)', () => {
    it('should return true for matching password', async () => {
      const hash = await hashPassword('correctpassword');
      const result = await verifyPassword('correctpassword', hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hashPassword('correctpassword');
      const result = await verifyPassword('wrongpassword', hash);
      expect(result).toBe(false);
    });
  });
});
