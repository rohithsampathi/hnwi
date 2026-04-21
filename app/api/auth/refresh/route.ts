// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { withRateLimit } from '@/lib/security/api-auth'
import { applyBackendAuthCookies, getSetCookieHeaders } from '@/lib/security/backend-set-cookie'

// Helper to get cookie domain for PWA cross-subdomain support
function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== 'production') return undefined;

  const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || '';
  if (!productionUrl) return undefined;

  try {
    const url = new URL(productionUrl);
    // Extract root domain (e.g., 'hnwichronicles.com' from 'app.hnwichronicles.com')
    const hostParts = url.hostname.split('.');
    if (hostParts.length >= 2) {
      return `.${hostParts.slice(-2).join('.')}`; // '.hnwichronicles.com'
    }
  } catch (e) {
    logger.warn('Failed to parse production URL for cookie domain', { url: productionUrl });
  }

  return undefined;
}

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
      return NextResponse.json({
        success: false,
        error: 'No refresh token available'
      }, { status: 401 });
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
        return NextResponse.json({
          success: false,
          error: 'Token refresh failed'
        }, { status: 401 });
      }

      await backendResponse.json();

      // Get Set-Cookie headers from backend
      const backendCookies = getSetCookieHeaders(backendResponse.headers);
      if (backendCookies.length === 0) {
        logger.warn('No auth cookies in refresh response');
        return NextResponse.json({
          success: false,
          error: 'Invalid refresh response'
        }, { status: 401 });
      }

      // Create response with new tokens
      const response = NextResponse.json({
        success: true,
        message: 'Token refreshed successfully'
      });

      // Forward backend cookies with PWA-compatible settings
      applyBackendAuthCookies(response, backendCookies, rememberMe, {
        cookieDomain: getCookieDomain(),
        secureDefault: process.env.NODE_ENV === 'production',
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

// Refresh endpoint uses httpOnly cookies (SameSite protected) so CSRF is optional,
// but we add rate limiting to prevent brute-force token rotation attacks.
export const POST = withRateLimit('api', handlePost);
