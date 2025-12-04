// app/api/payment/verify/route.ts
// Verify Razorpay payment signature

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentConfirmation } from '@/lib/email/email-service';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

// Tier pricing for email confirmation
const TIER_AMOUNTS = {
  operator: 599,
  observer: 199
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, order_id, signature, tier, session_id, user_email } = body;

    if (!RAZORPAY_KEY_SECRET) {
      console.error('[Payment Verify] Razorpay secret not configured');
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

    console.log('[Payment Verify] Signature verification:', {
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
          console.log('[Payment Verify] Email fetched from Razorpay:', customerEmail);
        } else if (paymentData.contact) {
          console.log('[Payment Verify] Contact found:', paymentData.contact);
        }
      } else {
        console.error('[Payment Verify] Failed to fetch payment details from Razorpay');
      }
    } catch (fetchError) {
      console.error('[Payment Verify] Error fetching payment details:', fetchError);
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
        console.error('[Payment Verify] Failed to record payment in backend');
        // Continue anyway - payment is verified
      } else {
        backendRecorded = true;
        console.log('[Payment Verify] Payment recorded successfully in backend');
      }
    } catch (backendError) {
      console.error('[Payment Verify] Backend recording error:', backendError);
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
          console.log('[Payment Verify] Confirmation email sent to:', customerEmail);
        } else {
          console.error('[Payment Verify] Failed to send confirmation email');
        }
      }).catch(error => {
        console.error('[Payment Verify] Email error:', error);
      });
    } else if (backendRecorded && !customerEmail) {
      console.log('[Payment Verify] No email available - skipping confirmation email');
    }

    return NextResponse.json({
      verified: true,
      payment_id,
      order_id
    });

  } catch (error) {
    console.error('[Payment Verify] Error:', error);
    return NextResponse.json(
      {
        verified: false,
        error: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
