// app/api/decision-memo/war-room/route.ts
// War Room endpoint - Shows all audits with access control

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    logger.info('War Room fetch - all audits with access control');

    // Call backend war-room endpoint
    const backendUrl = `${API_BASE_URL}/api/decision-memo/war-room`;

    // Forward cookies for authentication check
    const cookieHeader = request.headers.get('cookie');
    const backendHeaders: Record<string, string> = { 'Accept': 'application/json' };

    if (cookieHeader) {
      backendHeaders['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: backendHeaders,
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      logger.error('Backend error in war-room endpoint', { status: response.status });
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    logger.info('War Room data retrieved', {
      total: data.total_count,
      accessible: data.accessible_count,
      locked: data.locked_count
    });

    return NextResponse.json(data);

  } catch (error) {
    logger.error('Error fetching war room data', {
      error: error instanceof Error ? error.message : String(error)
    });
    return safeError(error);
  }
}
