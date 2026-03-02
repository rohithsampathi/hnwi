// app/api/decision-memo/request-access/route.ts
// Request access to locked Decision Memo audit

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('Access request', { intake_id: body.intake_id, email: body.requester_email });

    // Call backend request-access endpoint
    const backendUrl = `${API_BASE_URL}/api/decision-memo/request-access`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Backend error in request-access', { status: response.status });
      return NextResponse.json(data, { status: response.status });
    }

    logger.info('Access request submitted', {
      intake_id: body.intake_id,
      success: data.success
    });

    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error submitting access request', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError(error);
  }
}
