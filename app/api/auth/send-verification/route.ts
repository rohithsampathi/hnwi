// app/api/auth/send-verification/route.ts
// API endpoint to send email verification link
// Uses JWT-based tokens (no database storage needed)

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailVerification } from '@/lib/email/email-templates';
import { generateVerificationToken, getTokenExpiryHours } from '@/lib/email/verification-token';

interface SendVerificationRequest {
  user_email: string;
  user_name?: string;
  user_id: string;
}

/**
 * POST /api/auth/send-verification
 * Send email verification link to user using JWT tokens
 * No backend database storage required - tokens are self-verifying
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendVerificationRequest = await request.json();
    const { user_email, user_name, user_id } = body;

    // Validate required fields
    if (!user_email || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_email, user_id' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!user_email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate JWT verification token (self-contained, cryptographically signed)
    const verificationToken = await generateVerificationToken(user_id, user_email);
    const expiresInHours = getTokenExpiryHours();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    console.log('[Send Verification] 🔐 Generated JWT token for user:', user_id);

    // Generate verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    // Send verification email
    const emailSent = await sendEmailVerification({
      user_name: user_name || user_email.split('@')[0],
      user_email,
      verification_url: verificationUrl,
      expires_in_hours: expiresInHours,
    });

    if (!emailSent) {
      console.error('[Send Verification] Failed to send email to:', user_email);
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          message: 'Email service error. Please try again later.'
        },
        { status: 500 }
      );
    }

    console.log('[Send Verification] ✅ Verification email sent to:', user_email);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      expires_at: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('[Send Verification] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
