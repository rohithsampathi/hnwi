// app/api/decision-memo/verify-payment/route.ts
// Verify Razorpay payment and queue memo generation

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withCSRF, withRateLimit } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      preview_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate required fields
    if (!preview_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend to verify payment
    const backendResponse = await fetch(`${API_BASE_URL}/api/decision-memo/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preview_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error('Backend error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: backendResponse.status }
      );
    }

    const verificationData = await backendResponse.json();
    return NextResponse.json(verificationData);
  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withRateLimit('payment', handlePost)));
