// app/api/payment/verify/route.ts
// Verify Razorpay payment signature

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentConfirmation } from '@/lib/email/email-service';
import { withAuth, withCSRF, withRateLimit, withValidation } from '@/lib/security/api-auth';
import { paymentVerifySchema } from '@/lib/security/validation-schemas';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Tier pricing for email confirmation (monthly)
const TIER_AMOUNTS = {
  operator: 599,
  observer: 199
};

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, order_id, signature, tier, session_id, user_email } = body;

    if (!RAZORPAY_KEY_SECRET) {
      logger.error('[Payment Verify] Razorpay secret not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${order_id}|${payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === signature;

    logger.info('[Payment Verify] Signature verification:', {
      payment_id,
      order_id,
      verified: isValid
    });

    if (!isValid) {
      return NextResponse.json(
        { verified: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay to get customer email
    let customerEmail = user_email; // Fallback to provided email
    try {
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        // Extract email from payment details
        if (paymentData.email) {
          customerEmail = paymentData.email;
          logger.info('[Payment Verify] Email fetched from Razorpay:', customerEmail);
        } else if (paymentData.contact) {
          logger.info('[Payment Verify] Contact found:', paymentData.contact);
        }
      } else {
        logger.error('[Payment Verify] Failed to fetch payment details from Razorpay');
      }
    } catch (fetchError) {
      logger.error('[Payment Verify] Error fetching payment details:', fetchError);
      // Continue anyway - we'll use provided email or skip email
    }

    // Record payment in backend
    let backendRecorded = false;
    try {
      const backendResponse = await fetch(`${API_BASE_URL}/api/payments/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          payment_id,
          order_id,
          tier,
          session_id,
          verified_at: new Date().toISOString()
        })
      });

      if (!backendResponse.ok) {
        logger.error('[Payment Verify] Failed to record payment in backend');
        // Continue anyway - payment is verified
      } else {
        backendRecorded = true;
        logger.info('[Payment Verify] Payment recorded successfully in backend');
      }
    } catch (backendError) {
      logger.error('[Payment Verify] Backend recording error:', backendError);
      // Continue anyway - payment is verified
    }

    // Send payment confirmation email (don't block response if this fails)
    if (backendRecorded && customerEmail) {
      sendPaymentConfirmation({
        tier: tier as 'operator' | 'observer',
        amount: TIER_AMOUNTS[tier as keyof typeof TIER_AMOUNTS],
        currency: 'USD',
        payment_id,
        order_id,
        session_id,
        user_email: customerEmail,
        transaction_date: new Date().toISOString()
      }).then(success => {
        if (success) {
          logger.info('[Payment Verify] Confirmation email sent to:', customerEmail);
        } else {
          logger.error('[Payment Verify] Failed to send confirmation email');
        }
      }).catch(error => {
        logger.error('[Payment Verify] Email error:', error);
      });
    } else if (backendRecorded && !customerEmail) {
      logger.info('[Payment Verify] No email available - skipping confirmation email');
    }

    return NextResponse.json({
      verified: true,
      payment_id,
      order_id
    });

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withRateLimit('payment', withValidation(paymentVerifySchema, handlePost))));
