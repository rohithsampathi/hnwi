// app/api/auth/refresh/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/secure-logger'

// POST handler for token refresh
export async function POST() {
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
      const backendResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `refresh_token=${refreshToken}`
        }
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