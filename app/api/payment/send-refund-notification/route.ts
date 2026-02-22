// app/api/payment/send-refund-notification/route.ts
// API endpoint to send refund notification email

import { NextRequest, NextResponse } from 'next/server';
import { sendRefundNotification } from '@/lib/email/email-templates';
import { withAuth, withCSRF, withRateLimit, withValidation } from '@/lib/security/api-auth';
import { refundNotificationSchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';

interface SendRefundNotificationRequest {
  user_email: string;
  refund_amount: number;
  currency: string;
  payment_id: string;
  refund_id: string;
  reason?: string;
}

/**
 * POST /api/payment/send-refund-notification
 * Send refund notification email to user
 */
async function handlePost(request: NextRequest) {
  try {
    const body: SendRefundNotificationRequest = await request.json();
    const {
      user_email,
      refund_amount,
      currency,
      payment_id,
      refund_id,
      reason
    } = body;

    // Validate required fields
    if (!user_email || !refund_amount || !currency || !payment_id || !refund_id) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['user_email', 'refund_amount', 'currency', 'payment_id', 'refund_id']
        },
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

    // Validate refund amount
    if (refund_amount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Send refund notification email
    const emailSent = await sendRefundNotification({
      user_email,
      refund_amount,
      currency,
      payment_id,
      refund_id,
      reason,
    });

    if (!emailSent) {
      return NextResponse.json(
        {
          error: 'Failed to send refund notification',
          message: 'Email service error. Please try again later.'
        },
        { status: 500 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'Refund notification sent successfully',
    });

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withRateLimit('payment', withValidation(refundNotificationSchema, handlePost))));
