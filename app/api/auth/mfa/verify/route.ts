import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { cookies } from "next/headers"
import { SessionEncryption } from "@/lib/session-encryption"
import { CSRFProtection } from "@/lib/csrf-protection"
import {
  resolveAuthSessionMaxAge,
  REMEMBERED_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-cookie-policy"
import { appendCookie, clearAuthCookies, clearMfaCookies } from "@/lib/auth-cookie-cleanup"
import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from "@/lib/auth-cookie-security"
import { applyBackendAuthCookies, getSetCookieHeaders } from '@/lib/security/backend-set-cookie'
import { normalizeAuthUser } from "@/lib/auth-user-normalization"

function isTerminalMfaBackendFailure(errorMessage: string): boolean {
  const normalized = errorMessage.toLowerCase()
  return (
    (normalized.includes('expired') && !normalized.includes('code')) ||
    normalized.includes('session') ||
    normalized.includes('token') ||
    normalized.includes('challenge') ||
    normalized.includes('try logging in')
  )
}

async function handlePost(request: NextRequest) {
  try {
    const { email, mfa_code, mfa_token, rememberMe = false } = await request.json()
    const secureAuthCookies = shouldUseSecureAuthCookies(request)
    const authCookieDomain = resolveAuthCookieDomain(request)

    if (!email || !mfa_code || !mfa_token) {
      return NextResponse.json(
        { success: false, error: "Email, MFA code, and MFA token are required" },
        { status: 400 }
      )
    }

    // Rate limiting for MFA verification attempts
    const verifyRateLimit = await RateLimiter.checkLimit(request, 'MFA_VERIFY')
    if (!verifyRateLimit.allowed) {
      const rateLimitError = RateLimiter.getRateLimitError('MFA_VERIFY', 
        Math.ceil((verifyRateLimit.resetTime - Date.now()) / 1000))
      
      logger.warn('MFA verify rate limit exceeded', {
        ip: RateLimiter.getClientIP(request).replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        retryAfter: rateLimitError.retryAfter
      })
      
      return NextResponse.json(
        { success: false, error: rateLimitError.message },
        { status: 429 }
      )
    }

    try {
      // Retrieve the proxy MFA session from cookies (serverless-safe)
      // Note: In Next.js 15+, cookies() returns a Promise
      const cookieStore = await cookies();

      // Try to get session from token-specific cookie first
      let encryptedSession = cookieStore.get(`mfa_token_${mfa_token.substring(0, 8)}`)?.value;
      
      // Fallback to general mfa_session cookie if not found
      if (!encryptedSession) {
        encryptedSession = cookieStore.get('mfa_session')?.value;
      }
      
      // SECURITY: Decrypt the encrypted session
      let proxySession;
      
      try {
        proxySession = encryptedSession ? SessionEncryption.decrypt(encryptedSession) : null;
      } catch (error) {
        logger.warn('MFA verification failed - session decryption failed', {
          frontendToken: mfa_token.substring(0, 8) + "...",
          email,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Clear corrupted session cookies
        const errorResponse = NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        );
        clearMfaCookies(errorResponse, request, mfa_token);
        
        return errorResponse;
      }
      
      logger.info('MFA verification debug', {
        providedFrontendToken: mfa_token.substring(0, 8) + "...",
        email,
        sessionExists: !!proxySession,
        sessionSource: encryptedSession ? 'cookie' : 'not found'
      })
      
      if (!proxySession) {
        logger.warn('MFA verification failed - invalid frontend token', {
          frontendToken: mfa_token.substring(0, 8) + "...",
          email,
        })
        
        const invalidTokenResponse = NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        )
        clearMfaCookies(invalidTokenResponse, request, mfa_token)
        return invalidTokenResponse
      }

      // Verify email matches
      if (proxySession.email !== email) {
        logger.warn('MFA verification failed - email mismatch', {
          providedEmail: email,
          sessionEmail: proxySession.email
        })
        
        const mismatchResponse = NextResponse.json(
          { success: false, error: "Invalid session. Please try logging in again." },
          { status: 401 }
        )
        clearMfaCookies(mismatchResponse, request, mfa_token)
        return mismatchResponse
      }

      // Check if session is expired
      if (proxySession.expiresAt < Date.now()) {
        // Clear cookies on expiry
        const expiredResponse = NextResponse.json(
          { success: false, error: "Session expired. Please try logging in again." },
          { status: 401 }
        );
        clearMfaCookies(expiredResponse, request, mfa_token);
        
        logger.warn('MFA verification failed - session expired', {
          email: proxySession.email
        })
        
        return expiredResponse;
      }

      // Check attempt limit
      if (proxySession.attempts >= 5) {
        await RateLimiter.recordViolation(request, 'MFA_VERIFY')
        
        // Clear cookies on too many attempts
        const blockedResponse = NextResponse.json(
          { success: false, error: "Too many failed attempts. Please try logging in again." },
          { status: 429 }
        );
        clearMfaCookies(blockedResponse, request, mfa_token);
        
        logger.warn('MFA verification failed - too many attempts', {
          email: proxySession.email
        })
        
        return blockedResponse;
      }

      // Verify with backend using the proxied MFA session.
      try {
        const backendVerifyRequest = {
          email: email,
          mfa_code: mfa_code,
          mfa_token: proxySession.backendMfaToken, // Include for backend compatibility but validation is via email + code
          remember_me: rememberMe
        }

        logger.info('Calling backend MFA verification', {
          email,
          backendToken: proxySession.backendMfaToken.substring(0, 8) + "...",
          frontendToken: mfa_token.substring(0, 8) + "...",
          requestPayload: JSON.stringify(backendVerifyRequest, null, 2)
        })

        logger.info('About to call backend MFA verification endpoint')
        
        // Use direct fetch for auth endpoints to handle error responses properly
        const { API_BASE_URL } = await import("@/config/api");
        const backendUrl = `${API_BASE_URL}/api/auth/mfa/verify`;

        // Forward all cookies from request to backend
        const allCookies = request.cookies.getAll();
        const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
        const csrfHeader = request.headers.get('x-csrf-token');

        const fetchResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader && { 'Cookie': cookieHeader }),
            ...(csrfHeader && { 'X-CSRF-Token': csrfHeader }),
          },
          credentials: 'include',
          body: JSON.stringify(backendVerifyRequest),
        });

        // Get all headers including Set-Cookie
        const setCookieHeaders = getSetCookieHeaders(fetchResponse.headers);

        const backendResponse = await fetchResponse.json();

        // Log the full response structure (without sensitive data)
        logger.info('Backend MFA verification response received', {
          status: fetchResponse.status,
          success: backendResponse.success,
          hasUser: !!backendResponse.user,
          responseKeys: Object.keys(backendResponse),
          error: backendResponse.error,
          message: backendResponse.message
        })

        // Handle different response statuses
        if (fetchResponse.status === 200 && backendResponse.success) {
          const normalizedUser = normalizeAuthUser(backendResponse.user || {})

          // DON'T create our own session cookie - backend already set cookies!
          // Just pass through the backend response
          const successResponse = NextResponse.json({
            success: true,
            user: normalizedUser,
            message: backendResponse.message || "Login successful"
          });

          clearAuthCookies(successResponse, request, {
            includeMfa: true,
            mfaToken: mfa_token,
          });

          // Forward backend cookies to the browser
          logger.info('Setting cookies from backend response', {
            hasSetCookieHeaders: setCookieHeaders.length > 0,
            setCookieCount: setCookieHeaders.length,
            hasBackendCookies: setCookieHeaders.length > 0
          });

          // First, try to forward Set-Cookie headers from backend
          applyBackendAuthCookies(successResponse, setCookieHeaders, rememberMe, {
            cookieDomain: authCookieDomain,
            secureDefault: secureAuthCookies,
          });

          // CRITICAL FIX: Set session_user cookie for immediate session recovery
          // This ensures /api/auth/session can validate the user before backend cookies propagate
          const mfaFirstName = normalizedUser.firstName || normalizedUser.first_name || '';
          const mfaLastName = normalizedUser.lastName || normalizedUser.last_name || '';
          const sessionUserData = JSON.stringify({
            id: normalizedUser.id,
            user_id: normalizedUser.user_id,
            email: normalizedUser.email,
            name: normalizedUser.name || `${mfaFirstName} ${mfaLastName}`.trim() || undefined,
            firstName: mfaFirstName,
            lastName: mfaLastName,
            role: normalizedUser.role || 'user',
            timestamp: Date.now()
          });

          const sessionUserOptions: any = {
            httpOnly: true,
            secure: secureAuthCookies,
            sameSite: 'lax' as const,
            path: '/',
            maxAge: resolveAuthSessionMaxAge(rememberMe)
          };
          if (authCookieDomain) sessionUserOptions.domain = authCookieDomain;

          appendCookie(successResponse, 'session_user', sessionUserData, sessionUserOptions);

          logger.info('session_user cookie set for immediate session recovery', {
            userId: normalizedUser.id,
            email: normalizedUser.email
          });

          // Store remember me preference for future token refreshes
          if (rememberMe) {
            const rememberOptions: any = {
              httpOnly: true,
              secure: secureAuthCookies,
              sameSite: 'lax' as const,
              path: '/',
              maxAge: REMEMBERED_SESSION_MAX_AGE_SECONDS
            };
            if (authCookieDomain) rememberOptions.domain = authCookieDomain;

            appendCookie(successResponse, 'remember_me', 'true', rememberOptions);
          }

          logger.info('MFA verification successful via backend', {
            email,
            userId: normalizedUser.id,
            hasBackendCookies: setCookieHeaders.length > 0
          })

          return successResponse;
        } else {
          // Backend verification failed - increment attempts
          proxySession.attempts++

          // Update the session in cookie with incremented attempts
          const updatedEncryptedSession = SessionEncryption.encrypt(proxySession);

          const backendErrorMessage =
            backendResponse.error ||
            backendResponse.detail ||
            backendResponse.message ||
            "Invalid verification code";

          const failResponse = NextResponse.json(
            {
              success: false,
              error: backendErrorMessage
            },
            { status: 401 }
          );

          if (isTerminalMfaBackendFailure(String(backendErrorMessage))) {
            clearMfaCookies(failResponse, request, mfa_token);
            return failResponse;
          }

          const mfaFailOptions: any = {
            httpOnly: true,
            secure: secureAuthCookies,
            sameSite: 'lax' as const,
            maxAge: 5 * 60,
            path: '/',
          };
          if (authCookieDomain) mfaFailOptions.domain = authCookieDomain;

          // Update cookies with new attempt count
          failResponse.cookies.set('mfa_session', updatedEncryptedSession, mfaFailOptions);
          failResponse.cookies.set(`mfa_token_${mfa_token.substring(0, 8)}`, updatedEncryptedSession, mfaFailOptions);
          
          logger.warn('Backend MFA verification failed', {
            email,
            attempts: proxySession.attempts,
            backendStatus: fetchResponse.status,
            backendError: backendResponse.error || backendResponse.detail,
            backendMessage: backendResponse.message
          })
          
          return failResponse;
        }

      } catch (backendError) {
        proxySession.attempts++

        // Update the session in cookie with incremented attempts
        const updatedEncryptedSession = SessionEncryption.encrypt(proxySession);

        const errorResponse = NextResponse.json(
          { success: false, error: "Network error during verification. Please try again." },
          { status: 500 }
        );

        const mfaErrOptions: any = {
          httpOnly: true,
          secure: secureAuthCookies,
          sameSite: 'lax' as const,
          maxAge: 5 * 60,
          path: '/',
        };
        if (authCookieDomain) mfaErrOptions.domain = authCookieDomain;

        // Update cookies with new attempt count
        errorResponse.cookies.set('mfa_session', updatedEncryptedSession, mfaErrOptions);
        errorResponse.cookies.set(`mfa_token_${mfa_token.substring(0, 8)}`, updatedEncryptedSession, mfaErrOptions);
        
        logger.error('Backend MFA verification network/parsing error', {
          email,
          attempts: proxySession.attempts,
          error: backendError instanceof Error ? backendError.message : String(backendError)
        })
        
        return errorResponse;
      }
    } catch (processingError) {
      logger.error('MFA verify processing error', {
        error: processingError instanceof Error ? processingError.message : String(processingError)
      })
      
      return NextResponse.json(
        { success: false, error: "Verification processing failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('MFA verify endpoint error', {
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
