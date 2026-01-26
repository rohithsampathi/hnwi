// app/api/decision-memo/payment/verify/route.ts
// Verify Razorpay payment signature and trigger memo generation

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intake_id, payment_id, order_id, signature } = body;

    // Validate required fields
    if (!intake_id || !payment_id || !order_id || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Call Python backend to verify payment
    const response = await fetch(`${API_BASE_URL}/api/decision-memo/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intake_id,
        payment_id,
        order_id,
        signature
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Backend returns: { success: true }
    // After verification, backend triggers memo generation and sends SSE events:
    // 1. memo_generating (progress updates)
    // 2. memo_ready (with download URL)

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment. Please contact support.' },
      { status: 500 }
    );
  }
}
