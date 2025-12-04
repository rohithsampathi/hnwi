// app/api/auth/verify-email/route.ts
// API endpoint to verify email with JWT token
// No backend required - tokens are self-verifying

import { NextRequest, NextResponse } from 'next/server';
import { verifyVerificationToken } from '@/lib/email/verification-token';

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify email with JWT token (self-verifying, no backend needed)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Validate token parameter
    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Verify JWT token (cryptographically signed, self-contained)
    try {
      const payload = await verifyVerificationToken(token);

      console.log('[Verify Email] ✅ Email verified successfully for user:', payload.user_id);

      // At this point, you could call your backend to update the user's email_verified status
      // For now, we'll just return success with the verified data
      const verified_at = new Date().toISOString();

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user_id: payload.user_id,
        user_email: payload.user_email,
        verified_at,
      });

    } catch (verificationError) {
      const errorMessage = verificationError instanceof Error ? verificationError.message : 'INVALID';

      // Handle expired tokens
      if (errorMessage === 'EXPIRED') {
        console.error('[Verify Email] Token expired');
        return NextResponse.json(
          {
            error: 'Verification token expired',
            message: 'This verification link has expired. Please request a new one.'
          },
          { status: 410 }
        );
      }

      // Handle invalid tokens
      console.error('[Verify Email] Invalid token:', errorMessage);
      return NextResponse.json(
        {
          error: 'Invalid verification token',
          message: 'This verification link is invalid or has been tampered with.'
        },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('[Verify Email] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Alternative endpoint that accepts token in body
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token parameter
    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      );
    }

    // Verify JWT token (cryptographically signed, self-contained)
    try {
      const payload = await verifyVerificationToken(token);

      console.log('[Verify Email] ✅ Email verified successfully for user:', payload.user_id);

      // At this point, you could call your backend to update the user's email_verified status
      // For now, we'll just return success with the verified data
      const verified_at = new Date().toISOString();

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully',
        user_id: payload.user_id,
        user_email: payload.user_email,
        verified_at,
      });

    } catch (verificationError) {
      const errorMessage = verificationError instanceof Error ? verificationError.message : 'INVALID';

      // Handle expired tokens
      if (errorMessage === 'EXPIRED') {
        console.error('[Verify Email] Token expired');
        return NextResponse.json(
          {
            error: 'Verification token expired',
            message: 'This verification link has expired. Please request a new one.'
          },
          { status: 410 }
        );
      }

      // Handle invalid tokens
      console.error('[Verify Email] Invalid token:', errorMessage);
      return NextResponse.json(
        {
          error: 'Invalid verification token',
          message: 'This verification link is invalid or has been tampered with.'
        },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('[Verify Email] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
