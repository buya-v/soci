import { describe, it, expect } from 'vitest';
import { isDuplicateError } from './errorDedup';
import type { StoreError } from '../types';

function makeError(message: string, timestampMs: number): StoreError {
  return {
    id: crypto.randomUUID(),
    message,
    timestamp: new Date(timestampMs).toISOString(),
    resolved: false,
  };
}

describe('isDuplicateError', () => {
  it('returns false when no existing errors', () => {
    expect(isDuplicateError([], 'Some error', Date.now())).toBe(false);
  });

  it('returns true for identical message within 5 seconds', () => {
    const now = Date.now();
    const errors = [makeError('Connection failed', now - 2000)];
    expect(isDuplicateError(errors, 'Connection failed', now)).toBe(true);
  });

  it('returns false for identical message after 5 seconds', () => {
    const now = Date.now();
    const errors = [makeError('Connection failed', now - 6000)];
    expect(isDuplicateError(errors, 'Connection failed', now)).toBe(false);
  });

  it('returns false for different message within 5 seconds', () => {
    const now = Date.now();
    const errors = [makeError('Error A', now - 1000)];
    expect(isDuplicateError(errors, 'Error B', now)).toBe(false);
  });

  it('detects duplicates among multiple errors', () => {
    const now = Date.now();
    const errors = [
      makeError('Error A', now - 10000),
      makeError('Error B', now - 3000),
      makeError('Error C', now - 1000),
    ];
    expect(isDuplicateError(errors, 'Error B', now)).toBe(true);
    expect(isDuplicateError(errors, 'Error A', now)).toBe(false);
  });

  it('returns false at exactly the 5-second boundary', () => {
    const now = Date.now();
    const errors = [makeError('Boundary test', now - 5000)];
    expect(isDuplicateError(errors, 'Boundary test', now)).toBe(false);
  });
});
