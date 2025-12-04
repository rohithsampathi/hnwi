// lib/email/verification-token.ts
// JWT-based email verification tokens (no database needed)
// Uses industry-standard signed JWTs for secure, self-verifying tokens

import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.EMAIL_VERIFICATION_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production';
const TOKEN_EXPIRY = '24h'; // 24 hours

interface VerificationTokenPayload {
  user_id: string;
  user_email: string;
  purpose: 'email_verification';
}

interface VerifiedTokenPayload extends VerificationTokenPayload {
  exp?: number;
  iat?: number;
}

/**
 * Generate a signed JWT for email verification
 * The token is self-contained and doesn't require database storage
 */
export async function generateVerificationToken(
  userId: string,
  userEmail: string
): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({
    user_id: userId,
    user_email: userEmail,
    purpose: 'email_verification',
  } as VerificationTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT email verification token
 * Returns the payload if valid, throws error if invalid/expired
 */
export async function verifyVerificationToken(
  token: string
): Promise<VerifiedTokenPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    // Validate payload structure
    if (
      !payload.user_id ||
      !payload.user_email ||
      payload.purpose !== 'email_verification'
    ) {
      throw new Error('Invalid token payload');
    }

    return payload as VerifiedTokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      // JWT expired
      if (error.message.includes('expired')) {
        throw new Error('EXPIRED');
      }
      // Invalid signature or malformed token
      throw new Error('INVALID');
    }
    throw new Error('INVALID');
  }
}

/**
 * Decode token without verification (for debugging/inspection)
 * NEVER use this for authentication - use verifyVerificationToken instead
 */
export function decodeTokenUnsafe(token: string): VerifiedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );

    return payload;
  } catch {
    return null;
  }
}

/**
 * Get token expiry time in hours from now
 */
export function getTokenExpiryHours(): number {
  return 24;
}
