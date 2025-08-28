// app/api/auth/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'
import { RateLimiter } from '@/lib/rate-limiter'
import { ApiAuth } from '@/lib/api-auth'
import { secureApi } from '@/lib/secure-api'

export async function POST(request: NextRequest) {
  try {
    logger.debug("Reset password API endpoint called");

    // Check if IP is blocked
    if (RateLimiter.isBlocked(request)) {
      logger.warn("Reset password attempt from blocked IP", {
        ip: ApiAuth.getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      return NextResponse.json(
        { success: false, error: 'Access temporarily blocked' },
        { status: 429 }
      );
    }

    // Apply rate limiting for password reset (more restrictive)
    const rateLimitResult = await RateLimiter.checkLimit(request, 'RESET_PASSWORD', 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
    if (!rateLimitResult.allowed) {
      logger.warn("Reset password rate limit exceeded", {
        ip: ApiAuth.getClientIP(request),
        attempts: rateLimitResult.totalHits,
        userAgent: request.headers.get('user-agent')
      });
      
      const response = NextResponse.json(
        { success: false, error: 'Too many password reset attempts. Please wait before trying again.' },
        { status: 429 }
      );
      
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
      return ApiAuth.addSecurityHeaders(response);
    }

    // Validate request size
    if (!ApiAuth.validateRequestSize(request)) {
      return NextResponse.json(
        { success: false, error: 'Request too large' },
        { status: 413 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    
    if (!body.token || typeof body.token !== 'string') {
      logger.warn("Reset password validation failed - missing token");
      return NextResponse.json(
        { success: false, error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!body.new_password || typeof body.new_password !== 'string') {
      logger.warn("Reset password validation failed - missing new password");
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    // Password validation
    if (body.new_password.length < 6) {
      logger.warn("Reset password validation failed - password too short");
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    logger.debug("Reset password request received", {
      tokenPrefix: body.token.substring(0, 8) + "...",
      hasNewPassword: !!body.new_password
    });

    try {
      // Use secureApi to call backend
      const backendResponse = await secureApi.post('/api/auth/reset-password', {
        token: body.token,
        new_password: body.new_password
      }, false);

      logger.info("Backend reset password response received", {
        tokenPrefix: body.token.substring(0, 8) + "...",
        success: backendResponse.success !== false
      });

      // Return the backend response
      const response = NextResponse.json({
        success: true,
        message: backendResponse.message || "Password has been reset successfully"
      });

      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
      return ApiAuth.addSecurityHeaders(response);
      
    } catch (apiError) {
      logger.warn("Backend reset password request failed", { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        tokenPrefix: body.token.substring(0, 8) + "..."
      });
      
      // Handle specific error messages from backend
      const errorMessage = apiError instanceof Error ? apiError.message : 'Password reset failed';
      let statusCode = 400;
      let userMessage = 'Invalid or expired reset token';

      if (errorMessage.includes('expired')) {
        userMessage = 'Reset token has expired. Please request a new password reset.';
      } else if (errorMessage.includes('invalid')) {
        userMessage = 'Invalid reset token. Please request a new password reset.';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        userMessage = 'Invalid reset token. Please request a new password reset.';
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        statusCode = 429;
        userMessage = 'Too many attempts. Please wait before trying again.';
      }
      
      const response = NextResponse.json(
        { success: false, error: userMessage },
        { status: statusCode }
      );
      
      return ApiAuth.addSecurityHeaders(response);
    }
    
  } catch (error) {
    logger.error("Reset password API error", { 
      error: error instanceof Error ? error.message : String(error),
      ip: ApiAuth.getClientIP(request),
      userAgent: request.headers.get('user-agent')
    });
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset password. Please try again.'
      },
      { status: 500 }
    );
    
    return ApiAuth.addSecurityHeaders(response);
  }
}