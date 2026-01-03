import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('auth utilities', () => {
  describe('hashPassword', () => {
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

  describe('verifyPassword', () => {
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
