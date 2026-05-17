import crypto from 'crypto';

/**
 * Generate a cryptographically secure hex token for email verification or password reset.
 * Returns both the raw token (sent to user) and hashed version (stored in DB).
 */
export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hash a token the same way generateSecureToken hashes it, for lookup comparison.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate an expiry date from now + minutes.
 */
export const tokenExpiry = (minutes: number): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
