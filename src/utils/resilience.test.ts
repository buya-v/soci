import { describe, it, expect } from 'vitest';
import { safeList, safeString, safeNumber, simulateApiCall } from './resilience';

describe('resilience utilities', () => {
  describe('safeList', () => {
    it('returns the array when given a valid array', () => {
      const data = [1, 2, 3];
      expect(safeList(data)).toBe(data);
    });

    it('returns empty array for null', () => {
      expect(safeList(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
      expect(safeList(undefined)).toEqual([]);
    });

    it('returns empty array for non-array values', () => {
      // @ts-expect-error testing invalid input
      expect(safeList('not an array')).toEqual([]);
      // @ts-expect-error testing invalid input
      expect(safeList(42)).toEqual([]);
    });

    it('preserves empty arrays', () => {
      expect(safeList([])).toEqual([]);
    });

    it('preserves arrays of objects', () => {
      const data = [{ id: 1 }, { id: 2 }];
      expect(safeList(data)).toBe(data);
    });
  });

  describe('safeString', () => {
    it('returns the string when given a valid string', () => {
      expect(safeString('hello')).toBe('hello');
    });

    it('returns empty string for null', () => {
      expect(safeString(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(safeString(undefined)).toBe('');
    });

    it('returns custom fallback when provided', () => {
      expect(safeString(null, 'fallback')).toBe('fallback');
    });

    it('returns empty string for non-string values', () => {
      // @ts-expect-error testing invalid input
      expect(safeString(42)).toBe('');
      // @ts-expect-error testing invalid input
      expect(safeString({})).toBe('');
    });

    it('preserves empty strings', () => {
      expect(safeString('')).toBe('');
    });
  });

  describe('safeNumber', () => {
    it('returns the number when given a valid number', () => {
      expect(safeNumber(42)).toBe(42);
    });

    it('returns 0 for null', () => {
      expect(safeNumber(null)).toBe(0);
    });

    it('returns 0 for undefined', () => {
      expect(safeNumber(undefined)).toBe(0);
    });

    it('returns 0 for NaN', () => {
      expect(safeNumber(NaN)).toBe(0);
    });

    it('returns custom fallback when provided', () => {
      expect(safeNumber(null, -1)).toBe(-1);
    });

    it('preserves zero', () => {
      expect(safeNumber(0)).toBe(0);
    });

    it('preserves negative numbers', () => {
      expect(safeNumber(-5)).toBe(-5);
    });

    it('preserves floating point numbers', () => {
      expect(safeNumber(3.14)).toBe(3.14);
    });
  });

  describe('simulateApiCall', () => {
    it('resolves with data after delay', async () => {
      const data = { id: 1, name: 'test' };
      const result = await simulateApiCall(data, 10);
      expect(result).toEqual(data);
    });

    it('rejects with structured error when shouldFail is true', async () => {
      await expect(simulateApiCall('data', 10, true)).rejects.toEqual({
        status: 'error',
        code: 'DATA_DENSITY_MISMATCH',
        message: "Required field 'uuid' missing from demo-soci payload.",
      });
    });
  });
});
