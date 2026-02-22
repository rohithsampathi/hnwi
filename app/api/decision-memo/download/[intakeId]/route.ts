// app/api/decision-memo/download/[intakeId]/route.ts
// Proxy endpoint to fetch decision memo from Python backend

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

interface RouteParams {
  params: {
    intakeId: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { intakeId } = await Promise.resolve(context.params);

  try {
    logger.info('Fetching decision memo', { intakeId });

    // Call Python backend
    const backendUrl = `${API_BASE_URL}/api/decision-memo/download/${intakeId}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Backend error fetching decision memo', { status: response.status });
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info('Decision memo fetched successfully', { intakeId });

    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error fetching decision memo', { error: error instanceof Error ? error.message : String(error) });
    return safeError(error);
  }
}
