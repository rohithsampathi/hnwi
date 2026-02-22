// app/api/decision-memo/sfo-audit/[intakeId]/create-order/route.ts
// Create Razorpay order for SFO Pattern Audit payment

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withCSRF, withRateLimit } from '@/lib/security/api-auth';
import { safeError } from '@/lib/security/api-response';
import { logger } from '@/lib/secure-logger';

const API_BASE_URL = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app';

async function handlePost(
  request: NextRequest,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    const body = await request.json();
    const { currency = 'INR' } = body;

    // Call backend to create Razorpay order
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/create-order`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error('Backend error creating order:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment order' },
        { status: backendResponse.status }
      );
    }

    const orderData = await backendResponse.json();
    logger.info('📦 [SFO Create Order] Backend response:', JSON.stringify(orderData, null, 2));
    logger.info('📦 [SFO Create Order] Keys present:', Object.keys(orderData));
    return NextResponse.json(orderData);
  } catch (error) {
    return safeError(error);
  }
}

export const POST = withAuth(withCSRF(withRateLimit('payment', handlePost)));
