// =============================================================================
// REPORT AUTH PROXY — Catch-all for /api/decision-memo/auth/* endpoints
// Proxies login, MFA verify, MFA resend to the FastAPI backend
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/lib/secure-logger';

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const { path } = await Promise.resolve(context.params);
  const subPath = path.join('/');
  const backendUrl = `${API_BASE_URL}/api/decision-memo/auth/${subPath}`;

  try {
    const body = await request.json();

    // Forward real client IP so backend can geolocate the actual user (not the Vercel server).
    // Use platform-verified sources only (not raw client headers which can be spoofed).
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const clientIp = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
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

    const nextResponse = NextResponse.json(data, { status: response.status });

    // If the backend issued platform session cookies (skip_mfa viewer accounts),
    // set them as httpOnly cookies so the browser can use them for subsequent
    // platform API calls (War Room, crisis intelligence, HNWI World, etc.)
    if (data.access_token) {
      const isProd = process.env.NODE_ENV === 'production';
      const cookieOpts = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? ('none' as const) : ('lax' as const),
        maxAge: 7 * 24 * 60 * 60, // 7 days (matches remember_me=True on backend)
        path: '/',
      };
      nextResponse.cookies.set('access_token', data.access_token, cookieOpts);
      if (data.refresh_token) {
        nextResponse.cookies.set('refresh_token', data.refresh_token, cookieOpts);
      }
    }

    return nextResponse;
  } catch (error) {
    logger.error('Report Auth proxy error', { subPath, error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { detail: 'Failed to connect to authentication service' },
      { status: 502 }
    );
  }
}
