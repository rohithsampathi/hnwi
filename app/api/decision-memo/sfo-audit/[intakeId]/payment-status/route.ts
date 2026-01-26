// app/api/decision-memo/sfo-audit/[intakeId]/payment-status/route.ts
// Check payment status for SFO Pattern Audit

import { NextResponse } from 'next/server';

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
      console.error('Backend error checking payment status:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to check payment status' },
        { status: backendResponse.status }
      );
    }

    const statusData = await backendResponse.json();
    console.log('💳 [SFO Payment Status] Backend response:', JSON.stringify(statusData, null, 2));
    return NextResponse.json(statusData);
  } catch (error) {
    console.error('Error checking SFO audit payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
