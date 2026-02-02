// =============================================================================
// AUDIT PAYMENT — Create Order
// Proxies full intake to backend → backend validates, creates Razorpay order
// Route: POST /api/decision-memo/audit-payment/create-order
// =============================================================================

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export const maxDuration = 30; // Order creation should be fast

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward full intake to backend — backend handles validation + Razorpay
    const backendUrl = `${API_BASE_URL}/api/decision-memo/audit/create-order`;
    console.log('💳 [Audit] Creating order via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ [Audit] Backend create-order error:', response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ [Audit] Order created:', data.order_id, 'intake:', data.intake_id);
    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 [Audit] Create order failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
