// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { CSRFProtection } from '@/lib/csrf-protection'
import { withRateLimit } from '@/lib/security/api-auth'

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

      const tokenData = await backendResponse.json();

      // Get Set-Cookie headers from backend
      const backendCookies = backendResponse.headers.get('set-cookie');

      if (!tokenData.access_token) {
        logger.warn('No access token in refresh response');
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
      const isProd = process.env.NODE_ENV === 'production';
      const cookieDomain = getCookieDomain();

      if (backendCookies) {
        const cookies = backendCookies.split(',').map(c => c.trim());
        cookies.forEach(cookie => {
          const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
          const [name, value] = nameValue.split('=');

          const cookieOptions: any = {
            name,
            value,
            httpOnly: cookie.includes('HttpOnly'),
            secure: isProd || cookie.includes('Secure'),
            // Use 'none' in production for PWA cross-context support
            sameSite: isProd ? 'none' : (
              cookie.includes('SameSite=Strict') ? 'strict' :
              cookie.includes('SameSite=Lax') ? 'lax' :
              cookie.includes('SameSite=None') ? 'none' : 'lax'
            ),
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days (before iOS Safari auto-clear)
          };

          // Add domain for cross-subdomain support (only in production)
          if (cookieDomain) {
            cookieOptions.domain = cookieDomain;
          }

          // Add partitioned attribute for Chrome's cookie partitioning
          if (isProd) {
            cookieOptions.partitioned = true;
          }

          response.cookies.set(cookieOptions);
        });
      }

      // Set new access token cookie with PWA-compatible configuration
      // Remember Me = 7 days, otherwise 1 day (matches production refresh token expiry in security config)
      const accessTokenAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
      const accessTokenOptions: any = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const, // 'none' for PWA in production
        path: '/',
        maxAge: accessTokenAge
      };
      if (cookieDomain) accessTokenOptions.domain = cookieDomain;
      if (isProd) accessTokenOptions.partitioned = true;

      response.cookies.set('access_token', tokenData.access_token, accessTokenOptions);

      // Update refresh token if provided
      if (tokenData.refresh_token) {
        const refreshTokenAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
        const refreshTokenOptions: any = {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' as const : 'lax' as const,
          path: '/',
          maxAge: refreshTokenAge
        };
        if (cookieDomain) refreshTokenOptions.domain = cookieDomain;
        if (isProd) refreshTokenOptions.partitioned = true;

        response.cookies.set('refresh_token', tokenData.refresh_token, refreshTokenOptions);
      }

      logger.info('Token refresh successful', {
        hasNewAccessToken: !!tokenData.access_token,
        hasNewRefreshToken: !!tokenData.refresh_token,
        accessTokenLength: tokenData.access_token?.length || 0
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
