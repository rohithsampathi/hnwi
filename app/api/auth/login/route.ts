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
import { appendCookie, clearAuthCookies } from '@/lib/auth-cookie-cleanup'
import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from '@/lib/auth-cookie-security'
import { applyBackendAuthCookies, getSetCookieHeaders } from '@/lib/security/backend-set-cookie'
import { normalizeAuthUser } from '@/lib/auth-user-normalization'

const DEFAULT_AUTH_LOGIN_TIMEOUT_MS = 120_000

function resolveAuthLoginTimeoutMs(): number {
  const rawValue = process.env.AUTH_LOGIN_TIMEOUT_MS
  if (!rawValue) return DEFAULT_AUTH_LOGIN_TIMEOUT_MS

  const parsed = Number.parseInt(rawValue, 10)
  return Number.isFinite(parsed) && parsed >= 5_000
    ? parsed
    : DEFAULT_AUTH_LOGIN_TIMEOUT_MS
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonLikeValue(value: unknown): unknown {
  let current = value;

  for (let depth = 0; depth < 3; depth++) {
    if (typeof current !== 'string' || !current.trim()) {
      return current;
    }

    const text = current.trim();
    const isJsonObjectOrArray =
      (text.startsWith('{') && text.endsWith('}')) ||
      (text.startsWith('[') && text.endsWith(']'));
    const isQuotedJson =
      text.startsWith('"') &&
      text.endsWith('"') &&
      (text.includes('{') || text.includes('['));

    if (!isJsonObjectOrArray && !isQuotedJson) {
      return current;
    }

    try {
      current = JSON.parse(text);
    } catch {
      return current;
    }
  }

  return current;
}

function hasAuthResponseMarker(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return [
    'success',
    'error',
    'detail',
    'message',
    'user',
    'requires_mfa',
    'requiresMFA',
    'mfa_required',
    'mfaRequired',
    'mfa_token',
    'mfaToken',
    'sessionToken',
    'session_token',
    'challenge',
    'access_token',
    'refresh_token',
  ].some((key) => key in value);
}

function normalizeBackendLoginResponse(value: unknown, depth = 0): Record<string, any> {
  const parsed = parseJsonLikeValue(value);

  if (!isRecord(parsed) || depth > 8) {
    return {};
  }

  const response = parsed as Record<string, any>;
  const envelopeKeys = ['response', 'payload', 'result', 'data', 'body'];

  for (const key of envelopeKeys) {
    const child = parseJsonLikeValue(response[key]);
    if (!isRecord(child) && !Array.isArray(child)) {
      continue;
    }

    const normalizedChild = normalizeBackendLoginResponse(child, depth + 1);
    if (hasAuthResponseMarker(normalizedChild)) {
      return {
        ...response,
        ...normalizedChild,
      };
    }
  }

  return response;
}

// Helper to forward backend cookies to client with PWA-compatible settings
function forwardBackendCookies(
  response: NextResponse,
  backendCookieHeaders: string[],
  rememberDevice: boolean,
  secureDefault: boolean,
  cookieDomain?: string,
) {
  if (backendCookieHeaders.length === 0) return;

  applyBackendAuthCookies(response, backendCookieHeaders, rememberDevice, {
    cookieDomain,
    secureDefault,
  });
}

function getBackendMfaToken(response: Record<string, any>): string | null {
  const token =
    response.mfa_token ||
    response.mfaToken ||
    response.sessionToken ||
    response.session_token ||
    response.challenge?.mfa_token ||
    response.challenge?.mfaToken ||
    response.challenge?.sessionToken ||
    response.challenge?.session_token ||
    response.challenge?.token ||
    response.mfa?.mfa_token ||
    response.mfa?.mfaToken ||
    response.mfa?.sessionToken ||
    response.mfa?.session_token ||
    response.mfa?.token;

  return typeof token === 'string' && token.trim() ? token.trim() : null;
}

function backendRequiresMfa(response: Record<string, any>): boolean {
  return Boolean(
    response.requires_mfa ||
    response.requiresMFA ||
    response.mfa_required ||
    response.mfaRequired ||
    response.two_factor_required ||
    response.twoFactorRequired ||
    getBackendMfaToken(response)
  );
}

function isUnsafeKingdomDirectLogin(response: Record<string, any>): boolean {
  return Boolean(
    response.kingdom_native === true &&
    !backendRequiresMfa(response) &&
    !response.mfa_verified &&
    !response.mfaVerified &&
    !response.trusted_device &&
    !response.trustedDevice
  );
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
    const secureAuthCookies = shouldUseSecureAuthCookies(request);
    const authCookieDomain = resolveAuthCookieDomain(request);

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

      const backendJson = await backendFetchResponse.json().catch(() => ({}));
      const backendResponse = normalizeBackendLoginResponse(backendJson);

      // Forward Set-Cookie headers from backend
      const backendCookies = getSetCookieHeaders(backendFetchResponse.headers);

      logger.info("Backend login response received", {
        success: !!backendResponse.success,
        requiresMfa: backendRequiresMfa(backendResponse),
        hasBackendToken: !!getBackendMfaToken(backendResponse),
        hasMessage: !!backendResponse.message,
        message: backendResponse.message,
        email: validation.data!.email,
        elapsedMs: Date.now() - backendRequestStartedAt
      });

      // Check if backend call was successful
      if (!backendFetchResponse.ok && !backendRequiresMfa(backendResponse)) {
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
      const backendMfaToken = getBackendMfaToken(backendResponse);
      if (backendRequiresMfa(backendResponse) && backendMfaToken) {
      logger.info("Processing MFA flow from backend", {
        email: validation.data!.email,
        challengeAvailable: true,
        message: backendResponse.message
      });

        if (process.env.NODE_ENV !== 'production') {
          const tokenParts = backendMfaToken.split('.');
          logger.debug("MFA token accepted from backend", {
            email: validation.data!.email,
            tokenFormat: tokenParts.length === 3 ? 'jwt' : 'opaque'
          });
        }

        // SECURITY: Generate secure frontend session token
        const frontendToken = SessionEncryption.generateSecureToken();

        const proxySession = {
          email: validation.data!.email,
          frontendToken,
          backendMfaToken, // Store backend's MFA token
          expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
          attempts: 0
        };

        // SECURITY: Encrypt session data and store in HTTP-only cookie
        const encryptedSession = SessionEncryption.encrypt(proxySession);
        
        logger.info("Created proxy MFA session", {
          email: validation.data!.email,
          challengeStored: true,
          encryptedSessionBytes: Buffer.byteLength(encryptedSession, 'utf8')
        });

        // Return frontend-friendly response with frontend token
        const response = NextResponse.json({
          requires_mfa: true,
          mfa_token: frontendToken, // Frontend gets local token
          message: backendResponse.message || "MFA code sent"
        });

        // A validated-password MFA challenge supersedes stale auth and prior MFA cookies.
        // Keep the CSRF cookie because the next request is MFA verify.
        clearAuthCookies(response, request, {
          includeCsrf: false,
          includeMfa: true,
          mfaToken: frontendToken,
        });

        // Forward backend cookies
        forwardBackendCookies(response, backendCookies, rememberDevice, secureAuthCookies, authCookieDomain);

        // Store encrypted MFA session in same-site HTTP-only cookies.
        const mfaCookieOptions = {
          httpOnly: true,
          secure: secureAuthCookies,
          sameSite: 'lax' as const,
          maxAge: 5 * 60, // 5 minutes
          path: '/',
          ...(authCookieDomain ? { domain: authCookieDomain } : {})
        };

        appendCookie(response, 'mfa_session', encryptedSession, mfaCookieOptions);

        // Also store the token mapping in cookie
        appendCookie(response, `mfa_token_${frontendToken.substring(0, 8)}`, encryptedSession, mfaCookieOptions);

        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      }

      // Check for errors AFTER MFA check - only reject if no MFA token was provided
      if (backendResponse.error && !getBackendMfaToken(backendResponse)) {
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

      if (isUnsafeKingdomDirectLogin(backendResponse)) {
        logger.warn("Kingdom login response missing MFA proof", {
          email: validation.data!.email,
          success: !!backendResponse.success,
          hasUser: !!backendResponse.user,
          hasCookies: backendCookies.length > 0,
        });

        const response = NextResponse.json(
          createSafeErrorResponse('MFA challenge unavailable from authentication service'),
          { status: 502 }
        );

        return ApiAuth.addSecurityHeaders(response);
      }

      // Direct login success (no MFA) - rely on backend-set cookies, not tokens in JSON.
      if (!backendRequiresMfa(backendResponse) && (backendResponse.success || backendResponse.user || backendCookies.length > 0)) {
        const normalizedUser = backendResponse.user
          ? normalizeAuthUser(backendResponse.user)
          : null;
        const response = NextResponse.json(
          normalizedUser ? { ...backendResponse, user: normalizedUser } : backendResponse
        );

        clearAuthCookies(response, request, { includeMfa: true });

        // Forward backend cookies
        forwardBackendCookies(response, backendCookies, rememberDevice, secureAuthCookies, authCookieDomain);

        // CRITICAL FIX: Set session_user cookie for immediate session recovery
        // This ensures /api/auth/session can validate the user before backend cookies propagate
        if (normalizedUser) {
          const userFirstName = normalizedUser.firstName || normalizedUser.first_name || '';
          const userLastName = normalizedUser.lastName || normalizedUser.last_name || '';
          const sessionUserData = JSON.stringify({
            id: normalizedUser.id,
            user_id: normalizedUser.user_id,
            email: normalizedUser.email,
            name: normalizedUser.name || `${userFirstName} ${userLastName}`.trim() || undefined,
            firstName: userFirstName,
            lastName: userLastName,
            role: normalizedUser.role || 'user',
            timestamp: Date.now()
          });

          const sessionUserOptions: any = {
            httpOnly: true,
            secure: secureAuthCookies,
            sameSite: 'lax' as const,
            maxAge: resolveAuthSessionMaxAge(rememberDevice),
            path: '/'
          };
          if (authCookieDomain) sessionUserOptions.domain = authCookieDomain;

          appendCookie(response, 'session_user', sessionUserData, sessionUserOptions);

          logger.info('Set session_user cookie for immediate recovery', {
            userId: normalizedUser.user_id || normalizedUser.id,
            email: normalizedUser.email
          });
        }

        if (rememberDevice) {
          const rememberOptions: any = {
            httpOnly: true,
            secure: secureAuthCookies,
            sameSite: 'lax' as const,
            maxAge: REMEMBERED_SESSION_MAX_AGE_SECONDS,
            path: '/'
          };
          if (authCookieDomain) rememberOptions.domain = authCookieDomain;

          appendCookie(response, 'remember_me', 'true', rememberOptions);
        }

        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
        return ApiAuth.addSecurityHeaders(response);
      } else {
        // This should not happen if backend is working correctly
        // Backend provided neither MFA flow nor direct login success
        logger.warn("Backend response missing both MFA and direct login indicators", {
          email: validation.data!.email,
          requiresMfa: backendRequiresMfa(backendResponse),
          hasMfaToken: !!getBackendMfaToken(backendResponse),
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
        createSafeErrorResponse('Authentication service unavailable'),
        { status: 503 }
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
