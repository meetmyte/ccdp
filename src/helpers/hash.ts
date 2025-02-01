import * as crypto from 'crypto';

/**
 * Generates a SHA-256 hash of the given value.
 * @param value The string value to be hashed.
 * @returns A hashed string using SHA-256.
 */
export function generateHash(value: string): string {
  if (!value) throw new Error('Value for hashing cannot be empty');
  return crypto.createHash('sha256').update(value).digest('hex');
}
