// =============================================================================
// AUDIT PAYMENT — Create Order
// Proxies full intake to backend → backend validates, creates Razorpay order
// Route: POST /api/decision-memo/audit-payment/create-order
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { withAuth, withCSRF, withRateLimit } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

export const maxDuration = 30; // Order creation should be fast

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward full intake to backend — backend handles validation + Razorpay
    const backendUrl = `${API_BASE_URL}/api/decision-memo/audit/create-order`;
    logger.info('💳 [Audit] Creating order via backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('❌ [Audit] Backend create-order error:', response.status, data);
      return NextResponse.json(data, { status: response.status });
    }

    logger.info('✅ [Audit] Order created:', data.order_id, 'intake:', data.intake_id);
    return NextResponse.json(data);

  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withRateLimit('payment', handlePost)));
