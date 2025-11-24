// app/api/auth/login/route.ts
// Updated for login fix

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'
import { validateInput, loginSchema } from '@/lib/validation'
import { RateLimiter } from '@/lib/rate-limiter'
import { ApiAuth } from '@/lib/api-auth'
import { secureApi } from '@/lib/secure-api'
import { SessionEncryption } from '@/lib/session-encryption'
import { createSafeErrorResponse, sanitizeLoggingContext } from '@/lib/security/sanitization'
import { CSRFProtection } from '@/lib/csrf-protection'

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

// Helper to forward backend cookies to client with PWA-compatible settings
function forwardBackendCookies(response: NextResponse, backendCookieHeader: string | null) {
  if (!backendCookieHeader) return;

  const cookieDomain = getCookieDomain();
  const cookies = backendCookieHeader.split(',').map(c => c.trim());
  cookies.forEach(cookie => {
    const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
    const [name, value] = nameValue.split('=');

    // PWA-compatible cookie configuration
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions: any = {
      name,
      value,
      httpOnly: cookie.includes('HttpOnly'),
      // Always secure in production for PWA
      secure: isProd || cookie.includes('Secure'),
      // Use 'none' in production for PWA cross-context support
      // Requires secure: true
      sameSite: isProd ? 'none' : (
        cookie.includes('SameSite=Strict') ? 'strict' :
        cookie.includes('SameSite=Lax') ? 'lax' :
        cookie.includes('SameSite=None') ? 'none' : 'lax'
      ),
      path: '/',
      // Set to 7 days (before iOS Safari auto-clear)
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    };

    // Add domain for cross-subdomain support (only in production)
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }

    // Add partitioned attribute for Chrome's cookie partitioning
    // This helps with cross-context scenarios
    if (isProd) {
      cookieOptions.partitioned = true;
    }

    response.cookies.set(cookieOptions);
  });
}

async function handlePost(request: NextRequest) {
  try {
    logger.debug("Login API endpoint called");

    // Check if IP is blocked
    if (RateLimiter.isBlocked(request)) {
      const context = sanitizeLoggingContext({
        ip: ApiAuth.getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      logger.warn("Login attempt from blocked IP", context);
      return NextResponse.json(
        createSafeErrorResponse('Access temporarily blocked'),
        { status: 429 }
      );
    }

    // SECURITY: Production rate limiting (disabled only in development)
    let rateLimitResult;
    if (process.env.NODE_ENV === 'production') {
      rateLimitResult = await RateLimiter.checkLimit(request, 'LOGIN');
      if (!rateLimitResult.allowed) {
        const context = sanitizeLoggingContext({
          ip: ApiAuth.getClientIP(request),
          userAgent: request.headers.get('user-agent'),
          attempts: rateLimitResult.totalHits
        });
        logger.warn("Login rate limit exceeded", context);

        // Block IP after 8 consecutive rate limit violations
        if (rateLimitResult.totalHits > 8) {
          RateLimiter.blockIP(ApiAuth.getClientIP(request), 30 * 60 * 1000); // 30 minutes
        }

        const response = NextResponse.json(
          createSafeErrorResponse('Too many login attempts'),
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
        createSafeErrorResponse('Request too large'),
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
        createSafeErrorResponse('Invalid input data'),
        { status: 400 }
      );
    }

    logger.debug("Login request received", {
      email: validation.data!.email,
      hasPassword: !!validation.data!.password
    });

    // Call backend directly from server-side - no CORS issue here
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const backendUrl = `${API_BASE_URL}/api/auth/login`;

      // Get cookies from request to forward to backend
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

      // Add timeout to prevent hanging on slow/unreachable backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      let backendFetchResponse;
      try {
        backendFetchResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader && { 'Cookie': cookieHeader }),
          },
          credentials: 'include',
          body: JSON.stringify(validation.data!),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // Check if it's a timeout error
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          logger.warn("Backend login request timed out", {
            email: validation.data!.email,
            backendUrl
          });

          const response = NextResponse.json(
            createSafeErrorResponse('Authentication service is taking too long to respond. Please try again.'),
            { status: 504 }
          );
          return ApiAuth.addSecurityHeaders(response);
        }

        // Other fetch errors
        throw fetchError;
      }

      const backendResponse = await backendFetchResponse.json();

      // Forward Set-Cookie headers from backend
      const backendCookies = backendFetchResponse.headers.get('set-cookie');

      logger.info("Backend login response received", {
        success: !!backendResponse.success,
        requiresMfa: !!backendResponse.requires_mfa,
        hasBackendToken: !!backendResponse.mfa_token,
        hasMessage: !!backendResponse.message,
        message: backendResponse.message,
        email: validation.data!.email
      });

      // Check if backend call was successful
      if (!backendFetchResponse.ok && !backendResponse.requires_mfa) {
        logger.warn("Backend login failed", {
          status: backendFetchResponse.status,
          error: backendResponse.error || backendResponse.message
        });

        const response = NextResponse.json(
          createSafeErrorResponse(backendResponse.error || backendResponse.message || 'Authentication failed'),
          { status: backendFetchResponse.status }
        );

        return ApiAuth.addSecurityHeaders(response);
      }

      // PRODUCTION FIX: Check for MFA token FIRST before checking errors
      // Backend may send both error message AND MFA token for security
      // MFA flow - proceed if backend sends MFA token OR explicitly requires MFA
      if ((backendResponse.requires_mfa || backendResponse.mfa_token) && backendResponse.mfa_token) {
      logger.info("Processing MFA flow from backend", {
        email: validation.data!.email,
        challengeAvailable: !!backendResponse.mfa_token,
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
              createSafeErrorResponse('Authentication failed'),
              { status: 401 }
            );

            return ApiAuth.addSecurityHeaders(response);
          }
          
          // Basic token structure validation (no payload logging in production)
          if (process.env.NODE_ENV !== 'production') {
            try {
              const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString());
              logger.debug("MFA token structure validated", {
                email: validation.data!.email,
                hasSubject: !!payload.sub,
                hasExpiry: !!payload.exp,
                tokenType: payload.type ? 'mfa' : 'unknown'
              });
            } catch (payloadError) {
              logger.debug("Token payload validation skipped", {
                email: validation.data!.email
              });
            }
          }
          
        } catch (tokenError) {
          logger.warn("MFA token basic validation failed", {
            email: validation.data!.email,
            error: tokenError instanceof Error ? tokenError.message : String(tokenError)
          });
          
          const response = NextResponse.json(
            createSafeErrorResponse('Authentication failed'),
            { status: 401 }
          );

          return ApiAuth.addSecurityHeaders(response);
        }
        // SECURITY: Generate secure frontend session token
        const frontendToken = SessionEncryption.generateSecureToken();

        const proxySession = {
          email: validation.data!.email,
          frontendToken,
          backendMfaToken: backendResponse.mfa_token, // Store backend's MFA token
          backendSessionData: backendResponse, // Store full backend response
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          attempts: 0
        };

        // SECURITY: Encrypt session data and store in HTTP-only cookie
        const encryptedSession = SessionEncryption.encrypt(proxySession);
        
        logger.info("Created proxy MFA session", {
          email: validation.data!.email,
          challengeStored: true
        });

        // Return frontend-friendly response with frontend token
        const response = NextResponse.json({
          requires_mfa: true,
          mfa_token: frontendToken, // Frontend gets local token
          message: backendResponse.message || "MFA code sent"
        });

        // Forward backend cookies
        forwardBackendCookies(response, backendCookies);

        // Store encrypted session in HTTP-only cookie for serverless persistence
        // PWA-compatible configuration
        const isProd = process.env.NODE_ENV === 'production';
        const cookieDomain = getCookieDomain();
        const mfaCookieOptions = {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? ('none' as const) : ('lax' as const), // 'none' for PWA in production
          maxAge: 5 * 60, // 5 minutes
          path: '/',
          ...(cookieDomain ? { domain: cookieDomain } : {}),
          ...(isProd ? { partitioned: true } : {})
        };

        response.cookies.set('mfa_session', encryptedSession, mfaCookieOptions);

        // Also store the token mapping in cookie
        response.cookies.set(`mfa_token_${frontendToken.substring(0, 8)}`, encryptedSession, mfaCookieOptions);

        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      }

      // Check for errors AFTER MFA check - only reject if no MFA token was provided
      if (backendResponse.error && !backendResponse.mfa_token) {
        logger.warn("Backend login failed with no MFA token", {
          email: validation.data!.email,
          error: backendResponse.error
        });
        
        const response = NextResponse.json(
          createSafeErrorResponse(backendResponse.error),
          { status: 401 }
        );
        
        return ApiAuth.addSecurityHeaders(response);
      }

      // Direct login success (no MFA) - check for access token or success indicator
      if (backendResponse.access_token || (backendResponse.success && !backendResponse.requires_mfa)) {
        const response = NextResponse.json(backendResponse);

        // Forward backend cookies
        forwardBackendCookies(response, backendCookies);

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
          createSafeErrorResponse('Authentication service error'),
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
          createSafeErrorResponse('Too many login attempts'),
          { status: 429 }
        );
        // Add retry-after header for rate limit
        response.headers.set('Retry-After', '60');
        return ApiAuth.addSecurityHeaders(response);
      }
      
      const response = NextResponse.json(
        createSafeErrorResponse('Authentication failed'),
        { status: 401 }
      );
      
      return ApiAuth.addSecurityHeaders(response);
    }
    
  } catch (error) {
    const context = sanitizeLoggingContext({
      ip: ApiAuth.getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      endpoint: '/api/auth/login'
    });
    logger.error("Login API error", {
      error: error instanceof Error ? error.message : String(error),
      ...context
    });

    const response = NextResponse.json(
      createSafeErrorResponse(error),
      { status: 500 }
    );

    return ApiAuth.addSecurityHeaders(response);
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
