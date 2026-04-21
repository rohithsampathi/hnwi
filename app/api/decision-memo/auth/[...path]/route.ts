// =============================================================================
// REPORT AUTH PROXY — Catch-all for /api/decision-memo/auth/* endpoints
// Proxies login, MFA verify, MFA resend to the FastAPI backend
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';
import { getSetCookieHeaders, parseSetCookieHeader } from '@/lib/security/backend-set-cookie';
import { setReportAuthCookie } from '@/lib/security/report-auth';

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const { path } = await context.params;
  const subPath = path.join('/');
  const backendUrl = `${API_BASE_URL}/api/decision-memo/auth/${subPath}`;

  try {
    const body = await request.json();
    const intakeId = typeof body.slug === 'string' ? body.slug : '';
    const rememberDevice = body.remember_device === true;

    // Forward real client IP so backend can geolocate the actual user (not the Vercel server).
    // Use platform-verified sources only (not raw client headers which can be spoofed).
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
      headers['x-real-ip'] = clientIp;
    }
    const ua = request.headers.get('user-agent');
    if (ua) headers['user-agent'] = ua;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const backendCookies = getSetCookieHeaders(response.headers);
    const sanitizedResponseBody = { ...data };

    let reportSessionToken: string | null = null;

    if (backendCookies.length > 0) {
      for (const cookie of backendCookies) {
        const parsedCookie = parseSetCookieHeader(cookie);

        if (parsedCookie.name === 'report_access_token' && parsedCookie.value && !reportSessionToken) {
          const value = parsedCookie.value;
          reportSessionToken = value;
          sanitizedResponseBody.report_session = true;
        }
      }
    }

    const nextResponse = NextResponse.json(sanitizedResponseBody, { status: response.status });

    if (reportSessionToken && intakeId) {
      setReportAuthCookie(nextResponse, intakeId, reportSessionToken, rememberDevice);
    }

    nextResponse.headers.set('Cache-Control', 'no-store');
    return nextResponse;
  } catch (error) {
    logger.error('Report Auth proxy error', { subPath, error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { detail: 'Failed to connect to authentication service' },
      { status: 502 }
    );
  }
}
