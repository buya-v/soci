import type { StoreError } from '../types';

export function isDuplicateError(
  existingErrors: StoreError[],
  newMessage: string,
  now: number = Date.now()
): boolean {
  return existingErrors.some(
    (e) =>
      e.message === newMessage &&
      now - new Date(e.timestamp).getTime() < 5000
  );
}
