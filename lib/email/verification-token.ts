// lib/email/verification-token.ts
// JWT-based email verification tokens (no database needed)
// Uses industry-standard signed JWTs for secure, self-verifying tokens

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.EMAIL_VERIFICATION_SECRET || process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error('EMAIL_VERIFICATION_SECRET or NEXTAUTH_SECRET must be set. Cannot use a hardcoded default for token signing.');
}
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

type VerificationJWTPayload = JWTPayload & VerificationTokenPayload;

/**
 * Generate a signed JWT for email verification
 * The token is self-contained and doesn't require database storage
 */
export async function generateVerificationToken(
  userId: string,
  userEmail: string
): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const payload: VerificationJWTPayload = {
    user_id: userId,
    user_email: userEmail,
    purpose: 'email_verification',
  };

  const token = await new SignJWT(payload)
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

    const userId = typeof payload.user_id === 'string' ? payload.user_id : null;
    const userEmail = typeof payload.user_email === 'string' ? payload.user_email : null;

    // Validate payload structure
    if (
      !userId ||
      !userEmail ||
      payload.purpose !== 'email_verification'
    ) {
      throw new Error('Invalid token payload');
    }

    return {
      user_id: userId,
      user_email: userEmail,
      purpose: 'email_verification',
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
    };
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

    if (
      typeof payload?.user_id !== 'string' ||
      typeof payload?.user_email !== 'string' ||
      payload?.purpose !== 'email_verification'
    ) {
      return null;
    }

    const userId = payload.user_id;
    const userEmail = payload.user_email;

    return {
      user_id: userId,
      user_email: userEmail,
      purpose: 'email_verification',
      exp: typeof payload.exp === 'number' ? payload.exp : undefined,
      iat: typeof payload.iat === 'number' ? payload.iat : undefined,
    };
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
