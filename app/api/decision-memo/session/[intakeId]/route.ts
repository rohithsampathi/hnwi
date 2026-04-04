// app/api/decision-memo/session/[intakeId]/route.ts
// Session status endpoint - Proxies to backend for audit session status

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

export const maxDuration = 60; // 1 minute

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
    logger.info('Session status fetch', { intakeId });

    // Call backend preview endpoint (returns session status + artifact when unlocked)
    const backendUrl = `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`;

    // Forward auth headers and cookies to backend
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('cookie');
    const backendHeaders: Record<string, string> = { 'Accept': 'application/json' };

    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      backendHeaders['Cookie'] = cookieHeader;
      logger.info('Forwarding cookies to backend', {
        intakeId,
        cookieCount: cookieHeader.split(';').length,
        hasSessionToken: cookieHeader.includes('session_token'),
        hasAccessToken: cookieHeader.includes('access_token')
      });
    } else {
      logger.warn('No cookies to forward to backend', { intakeId });
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: backendHeaders,
      signal: AbortSignal.timeout(60000), // 1 minute
    });

    // CRITICAL: Pass through 401 status code directly
    // Frontend expects 401 to trigger ReportAuthRequiredError and show auth popup
    if (response.status === 401) {
      const data = await response.json().catch(() => ({ error: 'Authentication required' }));
      return NextResponse.json(data, {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // Pass through 404 if audit not found
    if (response.status === 404) {
      return NextResponse.json(
        { error: 'Session not found' },
        {
          status: 404,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Backend error in session endpoint', {
        status: response.status,
        intakeId
      });
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        {
          status: response.status,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const data = await response.json();
    logger.info('Session status retrieved', { intakeId, status: data.status });

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    logger.error('Error fetching session status', {
      error: error instanceof Error ? error.message : String(error),
      intakeId
    });
    return safeError(error);
  }
}
