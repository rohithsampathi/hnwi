// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { withRateLimit } from '@/lib/security/api-auth'
import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from '@/lib/auth-cookie-security'
import { clearAuthCookies } from '@/lib/auth-cookie-cleanup'
import { applyBackendAuthCookies, getSetCookieHeaders } from '@/lib/security/backend-set-cookie'

// POST handler for token refresh
async function handlePost(request: NextRequest) {
  try {
    // Note: In Next.js 15+, cookies() returns a Promise
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const rememberMe = cookieStore.get('remember_me')?.value === 'true';

    logger.info('Token refresh attempt', {
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length || 0,
      rememberMe
    });

    if (!refreshToken) {
      logger.info('No refresh token found');
      const response = NextResponse.json({
        success: false,
        error: 'No refresh token available',
        reason: 'missing_refresh_token'
      }, { status: 200 });
      clearAuthCookies(response, request, { includeMfa: true });
      return response;
    }

    try {
      // Call backend to refresh the token
      const { API_BASE_URL } = await import("@/config/api");

      // Forward all cookies from request to backend
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      const backendResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader
        },
        credentials: 'include'
      });

      if (!backendResponse.ok) {
        logger.warn('Backend token refresh failed', {
          status: backendResponse.status,
          statusText: backendResponse.statusText
        });
        const response = NextResponse.json({
          success: false,
          error: 'Token refresh failed',
          reason: 'backend_refresh_rejected'
        }, { status: 200 });
        clearAuthCookies(response, request, { includeMfa: true });
        return response;
      }

      await backendResponse.json();

      // Get Set-Cookie headers from backend
      const backendCookies = getSetCookieHeaders(backendResponse.headers);
      if (backendCookies.length === 0) {
        logger.warn('No auth cookies in refresh response');
        const response = NextResponse.json({
          success: false,
          error: 'Invalid refresh response',
          reason: 'missing_backend_cookies'
        }, { status: 200 });
        clearAuthCookies(response, request, { includeMfa: true });
        return response;
      }

      // Create response with new tokens
      const response = NextResponse.json({
        success: true,
        message: 'Token refreshed successfully'
      });

      clearAuthCookies(response, request, { includeMfa: true });

      // Forward backend cookies with PWA-compatible settings
      applyBackendAuthCookies(response, backendCookies, rememberMe, {
        cookieDomain: resolveAuthCookieDomain(request),
        secureDefault: shouldUseSecureAuthCookies(request),
      });

      logger.info('Token refresh successful', {
        hasNewCookies: backendCookies.length > 0,
        rememberMe
      });

      return response;

    } catch (backendError) {
      logger.error('Backend token refresh error', {
        error: backendError instanceof Error ? backendError.message : String(backendError)
      });
      return NextResponse.json({
        success: false,
        error: 'Token refresh service unavailable'
      }, { status: 503 });
    }

  } catch (error) {
    logger.error('Token refresh processing error', {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({
      success: false,
      error: 'Token refresh failed'
    }, { status: 500 });
  }
}

const rateLimitedPost = withRateLimit('api', handlePost);

// Refresh endpoint uses httpOnly cookies (SameSite protected) so CSRF is optional.
// Do not count anonymous "no refresh cookie" probes against the API limiter; stale
// client auth markers can otherwise rate-limit the page before it can clear itself.
export async function POST(request: NextRequest) {
  if (!request.cookies.get('refresh_token')?.value) {
    return handlePost(request);
  }

  return rateLimitedPost(request);
}
