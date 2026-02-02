// =============================================================================
// AUDIT PAYMENT — Verify Payment
// Proxies Razorpay callback to backend → backend verifies HMAC, sends emails,
// triggers background report generation
// Route: POST /api/decision-memo/audit-payment/verify
// =============================================================================

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export const maxDuration = 30; // Verification should be fast (generation is background)

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to backend for verification + email sending + generation trigger
    const backendUrl = `${API_BASE_URL}/api/decision-memo/audit/verify-payment`;
    console.log('🔒 [Audit] Verifying payment via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [Audit] Backend verify error:', response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [Audit] Payment verified:', data.payment_id, 'intake:', data.intake_id);
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 [Audit] Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
