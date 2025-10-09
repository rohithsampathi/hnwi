// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'
import { CSRFProtection } from '@/lib/csrf-protection'

// POST handler for token refresh
async function handlePost(request: NextRequest) {
  try {
    const cookieStore = cookies();
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

      // Forward backend cookies if any
      if (backendCookies) {
        const cookies = backendCookies.split(',').map(c => c.trim());
        cookies.forEach(cookie => {
          const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
          const [name, value] = nameValue.split('=');

          response.cookies.set({
            name,
            value,
            httpOnly: cookie.includes('HttpOnly'),
            secure: cookie.includes('Secure') || process.env.NODE_ENV === 'production',
            sameSite: cookie.includes('SameSite=Strict') ? 'strict' :
                      cookie.includes('SameSite=Lax') ? 'lax' :
                      cookie.includes('SameSite=None') ? 'none' : 'lax',
            path: '/',
          });
        });
      }

      // Set new access token cookie with appropriate lifespan based on remember me preference
      const accessTokenAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days if remember me, 1 hour otherwise
      response.cookies.set('access_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' to allow cookies on navigation/retry requests
        path: '/',
        maxAge: accessTokenAge
      });

      // Update refresh token if provided
      if (tokenData.refresh_token) {
        response.cookies.set('refresh_token', tokenData.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        });
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

// Refresh endpoint doesn't need CSRF protection since it uses httpOnly cookies
// which are already CSRF-protected by SameSite and browser security
export const POST = handlePost;
