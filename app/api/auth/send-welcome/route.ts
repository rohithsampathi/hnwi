// app/api/auth/send-welcome/route.ts
// API endpoint to send welcome email to new users

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email/email-templates';

interface SendWelcomeRequest {
  user_email: string;
  user_name?: string;
  verification_url?: string;
}

/**
 * POST /api/auth/send-welcome
 * Send welcome email to new user
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendWelcomeRequest = await request.json();
    const { user_email, user_name, verification_url } = body;

    // Validate required fields
    if (!user_email) {
      return NextResponse.json(
        { error: 'Missing required field: user_email' },
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

    // Send welcome email
    const emailSent = await sendWelcomeEmail({
      user_name: user_name || user_email.split('@')[0],
      user_email,
      verification_url,
    });

    if (!emailSent) {
      console.error('[Send Welcome] Failed to send email to:', user_email);
      return NextResponse.json(
        {
          error: 'Failed to send welcome email',
          message: 'Email service error. Please try again later.'
        },
        { status: 500 }
      );
    }

    console.log('[Send Welcome] ✅ Welcome email sent to:', user_email);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
    });

  } catch (error) {
    console.error('[Send Welcome] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
