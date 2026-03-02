// app/api/auth/csrf-token/route.ts - CSRF Token endpoint

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/csrf-protection';
import { ApiAuth } from '@/lib/api-auth';
import { logger } from '@/lib/secure-logger';

export async function GET(request: NextRequest) {
  try {
    // Generate or refresh CSRF token
    const { token, cookie } = await CSRFProtection.setCSRFToken(request);
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour

    const response = NextResponse.json({
      csrfToken: token,
      expires,
      timestamp: Date.now()
    });

    // CRITICAL: Manually set the CSRF cookie in the response
    // This ensures the cookie is actually sent to the client
    const secureCookieName = process.env.NODE_ENV === 'production' ? '__Host-csrf_token' : 'csrf_token';
    response.cookies.set(secureCookieName, cookie, {
      httpOnly: false, // Must be readable by client-side JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour in seconds
      path: '/'
    });

    // Add security headers
    return ApiAuth.addSecurityHeaders(response);

  } catch (error) {
    logger.error('CSRF token generation error', {
      error: error instanceof Error ? error.message : String(error),
      userAgent: request.headers.get('user-agent')
    });

    const response = NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );

    return ApiAuth.addSecurityHeaders(response);
  }
}

// OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return ApiAuth.addSecurityHeaders(response);
}