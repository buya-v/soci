/**
 * Defensive Data Utilities
 * 
 * Prevents "Unknown issue..." loops by validating data structures before rendering.
 */

// Generic fallback for list data
export function safeList<T>(data: T[] | undefined | null): T[] {
  return Array.isArray(data) ? data : [];
}

// Generic fallback for string data
export function safeString(data: string | undefined | null, fallback: string = ''): string {
  return (data && typeof data === 'string') ? data : fallback;
}

// Generic fallback for numeric data
export function safeNumber(data: number | undefined | null, fallback: number = 0): number {
  return (typeof data === 'number' && !isNaN(data)) ? data : fallback;
}

// Simulate API delay with potential failure for robust testing
export function simulateApiCall<T>(data: T, delay: number = 800, shouldFail: boolean = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject({
          status: "error",
          code: "DATA_DENSITY_MISMATCH",
          message: "Required field 'uuid' missing from demo-soci payload."
        });
      } else {
        resolve(data);
      }
    }, delay);
  });
}