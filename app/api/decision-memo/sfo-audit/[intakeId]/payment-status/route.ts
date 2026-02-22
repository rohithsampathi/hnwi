// app/api/decision-memo/sfo-audit/[intakeId]/payment-status/route.ts
// Check payment status for SFO Pattern Audit

import { NextResponse } from 'next/server';
import { logger } from '@/lib/secure-logger';

const API_BASE_URL = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app';

export async function GET(
  request: Request,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;

    // Call backend to check payment status
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/payment-status`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error('Backend error checking payment status', { status: backendResponse.status });
      return NextResponse.json(
        { success: false, error: 'Failed to check payment status' },
        { status: backendResponse.status }
      );
    }

    const statusData = await backendResponse.json();
    logger.info('SFO payment status fetched', { intakeId });
    return NextResponse.json(statusData);
  } catch (error) {
    logger.error('Error checking SFO audit payment status', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
