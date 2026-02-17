// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'
import { RateLimiter } from '@/lib/rate-limiter'
import { ApiAuth } from '@/lib/api-auth'
import { secureApi } from '@/lib/secure-api'
import { CSRFProtection } from '@/lib/csrf-protection'

async function handlePost(request: NextRequest) {
  try {
    logger.debug("Forgot password API endpoint called");

    // Check if IP is blocked
    if (RateLimiter.isBlocked(request)) {
      logger.warn("Forgot password attempt from blocked IP", {
        ip: ApiAuth.getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      return NextResponse.json(
        { success: false, error: 'Access temporarily blocked' },
        { status: 429 }
      );
    }

    // Apply rate limiting for forgot password (more restrictive)
    const rateLimitResult = await RateLimiter.checkLimit(request, 'FORGOT_PASSWORD');
    if (!rateLimitResult.allowed) {
      logger.warn("Forgot password rate limit exceeded", {
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
    
    if (!body.email || typeof body.email !== 'string') {
      logger.warn("Forgot password validation failed - missing email");
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      logger.warn("Forgot password validation failed - invalid email format", { email: body.email });
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    logger.debug("Forgot password request received", {
      email: body.email
    });

    try {
      // Use secureApi to call backend
      const backendResponse = await secureApi.post('/api/auth/forgot-password', { email: body.email }, false);

      logger.info("Backend forgot password response received", {
        email: body.email,
        success: backendResponse.success !== false
      });

      // Always return success to avoid email enumeration attacks
      const response = NextResponse.json({
        success: true,
        message: "If an account with this email exists, you will receive a password reset link."
      });

      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
      return ApiAuth.addSecurityHeaders(response);
      
    } catch (apiError) {
      logger.warn("Backend forgot password request failed", { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        email: body.email
      });
      
      // Still return success to avoid email enumeration
      const response = NextResponse.json({
        success: true,
        message: "If an account with this email exists, you will receive a password reset link."
      });
      
      return ApiAuth.addSecurityHeaders(response);
    }
    
  } catch (error) {
    logger.error("Forgot password API error", { 
      error: error instanceof Error ? error.message : String(error),
      ip: ApiAuth.getClientIP(request),
      userAgent: request.headers.get('user-agent')
    });
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process password reset request. Please try again.'
      },
      { status: 500 }
    );
    
    return ApiAuth.addSecurityHeaders(response);
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
