// app/api/decision-memo/session/[intakeId]/route.ts
// Session status endpoint - Proxies to backend for audit session status

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';
import { clearReportAuthCookie, getReportAuthTokenFromRequest } from '@/lib/security/report-auth';

export const maxDuration = 60; // 1 minute

interface RouteParams {
  params: Promise<{
    intakeId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { intakeId } = await context.params;

  try {
    logger.info('Session status fetch', { intakeId });
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

    // Call backend preview endpoint (returns session status + artifact when unlocked)
    const backendUrl = `${API_BASE_URL}/api/decision-memo/preview/${intakeId}`;

    // Forward report-access bearer token and platform session cookies so
    // authenticated app users can open audits without a separate report token.
    const authHeader = getReportAuthTokenFromRequest(request, intakeId);
    const cookieHeader = request.headers.get('cookie');
    const backendHeaders: Record<string, string> = { 'Accept': 'application/json' };

    if (authHeader) {
      backendHeaders['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      backendHeaders['Cookie'] = cookieHeader;
    }
    if (clientIp) {
      backendHeaders['x-forwarded-for'] = clientIp;
      backendHeaders['x-real-ip'] = clientIp;
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
      const unauthorizedResponse = NextResponse.json(data, {
        status: 401,
        headers: { 'Cache-Control': 'no-store' },
      });
      clearReportAuthCookie(unauthorizedResponse, intakeId);
      return unauthorizedResponse;
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
