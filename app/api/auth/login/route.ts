// app/api/auth/login/route.ts
// Updated for login fix

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/secure-logger'
import { validateInput, loginSchema } from '@/lib/validation'
import { RateLimiter } from '@/lib/rate-limiter'
import { ApiAuth } from '@/lib/api-auth'
import { SessionEncryption } from '@/lib/session-encryption'
import { createSafeErrorResponse, sanitizeLoggingContext } from '@/lib/security/sanitization'
import { CSRFProtection } from '@/lib/csrf-protection'
import {
  resolveAuthSessionMaxAge,
  REMEMBERED_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth-cookie-policy'
import { applyBackendAuthCookies, getSetCookieHeaders } from '@/lib/security/backend-set-cookie'

const DEFAULT_AUTH_LOGIN_TIMEOUT_MS = 120_000

function resolveAuthLoginTimeoutMs(): number {
  const rawValue = process.env.AUTH_LOGIN_TIMEOUT_MS
  if (!rawValue) return DEFAULT_AUTH_LOGIN_TIMEOUT_MS

  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) && parsed >= 5_000
    ? parsed
    : DEFAULT_AUTH_LOGIN_TIMEOUT_MS
}

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
function forwardBackendCookies(
  response: NextResponse,
  backendCookieHeaders: string[],
  rememberDevice: boolean,
) {
  if (backendCookieHeaders.length === 0) return;

  const cookieDomain = getCookieDomain();
  applyBackendAuthCookies(response, backendCookieHeaders, rememberDevice, {
    cookieDomain,
    secureDefault: process.env.NODE_ENV === 'production',
  });
}

async function handlePost(request: NextRequest) {
  try {
    logger.debug("Login API endpoint called");

    // Check if IP is blocked
    if (RateLimiter.isBlocked(request)) {
        const context = sanitizeLoggingContext({
          ip: ApiAuth.getClientIP(request),
          userAgent: request.headers.get('user-agent') ?? undefined
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
          userAgent: request.headers.get('user-agent') ?? undefined,
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

    const rememberDevice = validation.data?.rememberDevice === true;

    logger.debug("Login request received", {
      email: validation.data!.email,
      hasPassword: !!validation.data!.password
    });

    // Call backend directly from server-side - no CORS issue here
    try {
      const { API_BASE_URL } = await import("@/config/api");
      const backendUrl = `${API_BASE_URL}/api/auth/login`;
      const authLoginTimeoutMs = resolveAuthLoginTimeoutMs()
      const backendRequestStartedAt = Date.now()

      // Get cookies from request to forward to backend
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
      const csrfHeader = request.headers.get('x-csrf-token');

      // MFA login can legitimately take time because the backend sends the email
      // before returning the challenge. Keep a bounded timeout, but not one so
      // short that a healthy provider round-trip becomes a frontend failure.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), authLoginTimeoutMs);

      let backendFetchResponse;
      try {
        backendFetchResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader && { 'Cookie': cookieHeader }),
            ...(csrfHeader && { 'X-CSRF-Token': csrfHeader }),
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
            backendUrl,
            timeoutMs: authLoginTimeoutMs,
            elapsedMs: Date.now() - backendRequestStartedAt
          });

          const response = NextResponse.json(
            createSafeErrorResponse('Authentication is still processing. MFA email delivery is taking longer than expected. Please wait a moment and try again.'),
            { status: 504 }
          );
          return ApiAuth.addSecurityHeaders(response);
        }

        // Other fetch errors
        throw fetchError;
      }

      const backendResponse = await backendFetchResponse.json();

      // Forward Set-Cookie headers from backend
      const backendCookies = getSetCookieHeaders(backendFetchResponse.headers);

      logger.info("Backend login response received", {
        success: !!backendResponse.success,
        requiresMfa: !!backendResponse.requires_mfa,
        hasBackendToken: !!backendResponse.mfa_token,
        hasMessage: !!backendResponse.message,
        message: backendResponse.message,
        email: validation.data!.email,
        elapsedMs: Date.now() - backendRequestStartedAt
      });

      // Check if backend call was successful
      if (!backendFetchResponse.ok && !backendResponse.requires_mfa) {
        logger.warn("Backend login failed", {
          status: backendFetchResponse.status,
          error: backendResponse.error || backendResponse.message
        });

        const backendError =
          backendResponse.error ||
          backendResponse.detail ||
          backendResponse.message ||
          'Authentication failed';

        const response = NextResponse.json(
          createSafeErrorResponse(backendError),
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
        forwardBackendCookies(response, backendCookies, rememberDevice);

        // Store encrypted MFA session in same-site HTTP-only cookies.
        const isProd = process.env.NODE_ENV === 'production';
        const cookieDomain = getCookieDomain();
        const mfaCookieOptions = {
          httpOnly: true,
          secure: isProd,
          sameSite: 'lax' as const,
          maxAge: 5 * 60, // 5 minutes
          path: '/',
          ...(cookieDomain ? { domain: cookieDomain } : {})
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
          error: backendResponse.error || backendResponse.detail
        });
        
        const response = NextResponse.json(
          createSafeErrorResponse(backendResponse.error || backendResponse.detail || 'Authentication failed'),
          { status: 401 }
        );
        
        return ApiAuth.addSecurityHeaders(response);
      }

      // Direct login success (no MFA) - rely on backend-set cookies, not tokens in JSON.
      if (!backendResponse.requires_mfa && (backendResponse.success || backendResponse.user || backendCookies.length > 0)) {
        const response = NextResponse.json(backendResponse);

        // Forward backend cookies
        forwardBackendCookies(response, backendCookies, rememberDevice);

        // CRITICAL FIX: Set session_user cookie for immediate session recovery
        // This ensures /api/auth/session can validate the user before backend cookies propagate
        if (backendResponse.user) {
          const userFirstName = backendResponse.user.firstName || backendResponse.user.first_name || '';
          const userLastName = backendResponse.user.lastName || backendResponse.user.last_name || '';
          const sessionUserData = JSON.stringify({
            id: backendResponse.user.id || backendResponse.user.user_id,
            user_id: backendResponse.user.id || backendResponse.user.user_id,
            email: backendResponse.user.email,
            name: backendResponse.user.name || `${userFirstName} ${userLastName}`.trim() || undefined,
            firstName: userFirstName,
            lastName: userLastName,
            role: backendResponse.user.role || 'user',
            timestamp: Date.now()
          });

          const isProd = process.env.NODE_ENV === 'production';
          const cookieDomain = getCookieDomain();

          const sessionUserOptions: any = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax' as const,
            maxAge: resolveAuthSessionMaxAge(rememberDevice),
            path: '/'
          };
          if (cookieDomain) sessionUserOptions.domain = cookieDomain;

          response.cookies.set('session_user', sessionUserData, sessionUserOptions);

          logger.info('Set session_user cookie for immediate recovery', {
            userId: backendResponse.user.id || backendResponse.user.user_id,
            email: backendResponse.user.email
          });
        }

        const isProd = process.env.NODE_ENV === 'production';
        const cookieDomain = getCookieDomain();

        if (rememberDevice) {
          const rememberOptions: any = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax' as const,
            maxAge: REMEMBERED_SESSION_MAX_AGE_SECONDS,
            path: '/'
          };
          if (cookieDomain) rememberOptions.domain = cookieDomain;

          response.cookies.set('remember_me', 'true', rememberOptions);
        } else {
          response.cookies.delete('remember_me');
        }

        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      } else {
        // This should not happen if backend is working correctly
        // Backend provided neither MFA flow nor direct login success
        logger.warn("Backend response missing both MFA and direct login indicators", {
          email: validation.data!.email,
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
      userAgent: request.headers.get('user-agent') ?? undefined,
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
