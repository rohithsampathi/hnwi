// app/api/auth/login/route.ts
// Updated for login fix

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'
import { validateInput, loginSchema } from '@/lib/validation'
import { RateLimiter } from '@/lib/rate-limiter'
import { ApiAuth } from '@/lib/api-auth'
import { secureApi } from '@/lib/secure-api'
import { SessionEncryption } from '@/lib/session-encryption'

export async function POST(request: NextRequest) {
  try {
    logger.debug("Login API endpoint called");

    // Check if IP is blocked
    if (RateLimiter.isBlocked(request)) {
      logger.warn("Login attempt from blocked IP", {
        ip: ApiAuth.getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      return NextResponse.json(
        { success: false, error: 'Access temporarily blocked' },
        { status: 429 }
      );
    }

    // SECURITY: Production rate limiting (disabled only in development)
    let rateLimitResult;
    if (process.env.NODE_ENV === 'production') {
      rateLimitResult = await RateLimiter.checkLimit(request, 'LOGIN');
      if (!rateLimitResult.allowed) {
        logger.warn("Login rate limit exceeded", {
          ip: ApiAuth.getClientIP(request),
          attempts: rateLimitResult.totalHits,
          userAgent: request.headers.get('user-agent')
        });
        
        // Block IP after 8 consecutive rate limit violations
        if (rateLimitResult.totalHits > 8) {
          RateLimiter.blockIP(ApiAuth.getClientIP(request), 30 * 60 * 1000); // 30 minutes
        }
        
        const response = NextResponse.json(
          { success: false, error: 'Too many login attempts' },
          { status: 429 }
        );
        
        // Add rate limit headers
        response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString());
        return ApiAuth.addSecurityHeaders(response);
      }
    } else {
      // Development mode - relaxed rate limiting for testing
      rateLimitResult = { remainingRequests: 999 };
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
    
    // Validate input data
    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      logger.warn("Login validation failed", { errors: validation.errors });
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: validation.errors },
        { status: 400 }
      );
    }

    logger.debug("Login request received", {
      email: validation.data!.email,
      hasPassword: !!validation.data!.password
    });

    // Use secureApi to call backend - never expose backend URL
    try {
      const backendResponse = await secureApi.post('/api/auth/login', validation.data!, false);

      logger.info("Backend login response received", {
        success: !!backendResponse.success,
        requiresMfa: !!backendResponse.requires_mfa,
        hasBackendToken: !!backendResponse.mfa_token,
        hasMessage: !!backendResponse.message,
        message: backendResponse.message,
        email: validation.data!.email
      });

      // PRODUCTION FIX: If backend sends MFA token, always proceed to MFA flow
      // Backend validates email and sends MFA token for valid accounts
      // Don't block on error messages if MFA token is present
      if (backendResponse.error && !backendResponse.mfa_token) {
        // Only reject if no MFA token is provided
        logger.warn("Backend login failed with no MFA token", {
          email: validation.data!.email,
          error: backendResponse.error
        });
        
        const response = NextResponse.json(
          { success: false, error: backendResponse.error },
          { status: 401 }
        );
        
        return ApiAuth.addSecurityHeaders(response);
      }

      // MFA flow - proceed if backend sends MFA token OR explicitly requires MFA
      if ((backendResponse.requires_mfa || backendResponse.mfa_token) && backendResponse.mfa_token) {
        logger.info("Processing MFA flow from backend", {
          email: validation.data!.email,
          hasToken: !!backendResponse.mfa_token,
          tokenLength: backendResponse.mfa_token ? backendResponse.mfa_token.length : 0,
          message: backendResponse.message
        });
        
        // Basic JWT format validation only
        try {
          const tokenParts = backendResponse.mfa_token.split('.');
          if (tokenParts.length !== 3) {
            logger.warn("Invalid MFA token format from backend", {
              email: validation.data!.email
            });
            
            const response = NextResponse.json(
              { success: false, error: 'Authentication failed. Please try again.' },
              { status: 401 }
            );
            
            return ApiAuth.addSecurityHeaders(response);
          }
          
          // Log the JWT payload for debugging but don't validate strictly
          try {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString());
            logger.info("MFA token payload received", {
              email: validation.data!.email,
              hasSubject: !!payload.sub,
              hasMfaCode: !!payload.mfa_code,
              hasExpiry: !!payload.exp,
              tokenType: payload.type,
              expiryTimestamp: payload.exp
            });
          } catch (payloadError) {
            logger.warn("Could not parse MFA token payload for debugging", {
              email: validation.data!.email
            });
          }
          
        } catch (tokenError) {
          logger.warn("MFA token basic validation failed", {
            email: validation.data!.email,
            error: tokenError instanceof Error ? tokenError.message : String(tokenError)
          });
          
          const response = NextResponse.json(
            { success: false, error: 'Authentication failed. Please try again.' },
            { status: 401 }
          );
          
          return ApiAuth.addSecurityHeaders(response);
        }
        // SECURITY: Generate secure frontend session token
        const frontendToken = SessionEncryption.generateSecureToken();

        // SECURITY: Create encrypted MFA session
        if (!global.mfaSessions) {
          global.mfaSessions = new Map();
        }

        const proxySession = {
          email: validation.data!.email,
          frontendToken,
          backendMfaToken: backendResponse.mfa_token, // Store backend's MFA token
          backendSessionData: backendResponse, // Store full backend response
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          attempts: 0
        };

        // SECURITY: Encrypt session data before storing
        const encryptedSession = SessionEncryption.encrypt(proxySession);
        global.mfaSessions.set(frontendToken, encryptedSession);

        // SECURITY: Clean up expired encrypted sessions
        for (const [key, encryptedSessionData] of global.mfaSessions.entries()) {
          try {
            const session = SessionEncryption.decrypt(encryptedSessionData);
            if (session.expiresAt < Date.now()) {
              global.mfaSessions.delete(key);
            }
          } catch (error) {
            // Remove corrupted/invalid encrypted sessions
            global.mfaSessions.delete(key);
          }
        }

        logger.info("Created proxy MFA session", {
          email: validation.data!.email,
          frontendToken: frontendToken.substring(0, 8) + "...",
          backendToken: backendResponse.mfa_token.substring(0, 8) + "..."
        });

        // Return frontend-friendly response with frontend token
        const response = NextResponse.json({
          requires_mfa: true,
          mfa_token: frontendToken, // Frontend gets local token
          message: backendResponse.message || "MFA code sent"
        });

        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      }

      // Direct login success (no MFA) - check for access token or success indicator
      if (backendResponse.access_token || (backendResponse.success && !backendResponse.requires_mfa)) {
        const response = NextResponse.json(backendResponse);
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      } else {
        // This should not happen if backend is working correctly
        // Backend provided neither MFA flow nor direct login success
        logger.warn("Backend response missing both MFA and direct login indicators", {
          email: validation.data!.email,
          hasAccessToken: !!backendResponse.access_token,
          requiresMfa: !!backendResponse.requires_mfa,
          hasMfaToken: !!backendResponse.mfa_token,
          hasError: !!backendResponse.error
        });
        
        const response = NextResponse.json(
          { success: false, error: 'Authentication service error. Please try again.' },
          { status: 500 }
        );
        
        return ApiAuth.addSecurityHeaders(response);
      }
      
    } catch (apiError) {
      logger.warn("Backend login request failed", { 
        error: apiError instanceof Error ? apiError.message : String(apiError),
        email: validation.data!.email
      });
      
      // Check if this is a rate limit error (429)
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.toLowerCase().includes('too many')) {
        const response = NextResponse.json(
          { success: false, error: 'Too many login attempts. Please wait before trying again.' },
          { status: 429 }
        );
        // Add retry-after header for rate limit
        response.headers.set('Retry-After', '60');
        return ApiAuth.addSecurityHeaders(response);
      }
      
      const response = NextResponse.json(
        { success: false, error: 'Authentication failed. Please try again.' },
        { status: 401 }
      );
      
      return ApiAuth.addSecurityHeaders(response);
    }
    
  } catch (error) {
    logger.error("Login API error", { 
      error: error instanceof Error ? error.message : String(error),
      ip: ApiAuth.getClientIP(request),
      userAgent: request.headers.get('user-agent')
    });
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      },
      { status: 500 }
    );
    
    return ApiAuth.addSecurityHeaders(response);
  }
}