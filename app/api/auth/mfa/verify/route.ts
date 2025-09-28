import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { secureApi } from "@/lib/secure-api"
import { SessionEncryption } from "@/lib/session-encryption"

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET environment variable must be set")
  }
  return new TextEncoder().encode(secret)
}

// Removed frontend session management - backend handles all cookies now
// function getSecureCookieName(baseName: string): string {
//   if (process.env.NODE_ENV === 'production') {
//     return `__Host-${baseName}`
//   } else {
//     return `__Secure-${baseName}`
//   }
// }

// const COOKIE_OPTIONS = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "strict" as const,
//   maxAge: 60 * 60 * 24, // 24 hours
// }

// async function createToken(user: any): Promise<string> {
//   return await new SignJWT({ ...user })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("24h")
//     .sign(getJWTSecret())
// }

export async function POST(request: NextRequest) {
  try {
    const { email, mfa_code, mfa_token, rememberMe = false } = await request.json()

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
      const cookieStore = cookies();
      
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
        errorResponse.cookies.delete('mfa_session');
        errorResponse.cookies.delete(`mfa_token_${mfa_token.substring(0, 8)}`);
        
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
        
        return NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        )
      }

      // Verify email matches
      if (proxySession.email !== email) {
        logger.warn('MFA verification failed - email mismatch', {
          providedEmail: email,
          sessionEmail: proxySession.email
        })
        
        return NextResponse.json(
          { success: false, error: "Invalid session. Please try logging in again." },
          { status: 401 }
        )
      }

      // Check if session is expired
      if (proxySession.expiresAt < Date.now()) {
        // Clear cookies on expiry
        const expiredResponse = NextResponse.json(
          { success: false, error: "Session expired. Please try logging in again." },
          { status: 401 }
        );
        expiredResponse.cookies.delete('mfa_session');
        expiredResponse.cookies.delete(`mfa_token_${mfa_token.substring(0, 8)}`);
        
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
        blockedResponse.cookies.delete('mfa_session');
        blockedResponse.cookies.delete(`mfa_token_${mfa_token.substring(0, 8)}`);
        
        logger.warn('MFA verification failed - too many attempts', {
          email: proxySession.email
        })
        
        return blockedResponse;
      }

      // Use secureApi to verify with backend - backend validates via email + MFA code
      try {
        const backendVerifyRequest = {
          email: email,
          mfa_code: mfa_code,
          mfa_token: proxySession.backendMfaToken // Include for backend compatibility but validation is via email + code
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
        
        const fetchResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendVerifyRequest),
        });

        // Get all headers including Set-Cookie
        const setCookieHeaders: string[] = [];
        // @ts-ignore - accessing raw headers
        const rawHeaders = fetchResponse.headers.raw?.() || {};
        if (rawHeaders['set-cookie']) {
          setCookieHeaders.push(...rawHeaders['set-cookie']);
        } else {
          // Try alternative method for getting cookies
          const setCookieHeader = fetchResponse.headers.get('set-cookie');
          if (setCookieHeader) {
            setCookieHeaders.push(setCookieHeader);
          }
        }

        const backendResponse = await fetchResponse.json();

        // Log the full response structure (without sensitive data)
        logger.info('Backend MFA verification response received', {
          status: fetchResponse.status,
          success: backendResponse.success,
          hasUser: !!backendResponse.user,
          hasAccessToken: !!backendResponse.access_token,
          hasRefreshToken: !!backendResponse.refresh_token,
          responseKeys: Object.keys(backendResponse),
          error: backendResponse.error,
          message: backendResponse.message
        })

        // Handle different response statuses
        if (fetchResponse.status === 200 && backendResponse.success) {
          // Normalize user object to ensure consistent id presence
          const backendUser = backendResponse.user || {}
          const normalizedUserId = backendUser.user_id || backendUser.id || backendUser._id
          const normalizedUser = {
            ...backendUser,
            id: normalizedUserId || backendUser.id,
            user_id: normalizedUserId || backendUser.user_id
          }

          // DON'T create our own session cookie - backend already set cookies!
          // Just pass through the backend response
          const successResponse = NextResponse.json({
            success: true,
            user: normalizedUser,
            message: backendResponse.message || "Login successful"
          });

          // Forward backend cookies to the browser
          logger.info('Setting cookies from backend response', {
            hasSetCookieHeaders: setCookieHeaders.length > 0,
            setCookieCount: setCookieHeaders.length,
            hasAccessTokenInBody: !!backendResponse.access_token,
            hasRefreshTokenInBody: !!backendResponse.refresh_token
          });

          // First, try to forward Set-Cookie headers from backend
          if (setCookieHeaders.length > 0) {
            setCookieHeaders.forEach(cookieString => {
              // Parse the cookie to extract name and value
              const [nameValue, ...options] = cookieString.split(';').map(s => s.trim());
              const [name, value] = nameValue.split('=');

              if (name === 'access_token' || name === 'refresh_token') {
                const accessTokenAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days if remember me, 1 hour otherwise
                const maxAge = name === 'access_token' ? accessTokenAge : 7 * 24 * 60 * 60; // Refresh token always 7 days
                successResponse.cookies.set(name, value, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'strict',
                  path: '/',
                  maxAge
                });
                logger.info(`Cookie ${name} set from backend header with secure=false`);
              }
            });
          }

          // Fallback: If no cookies in headers but tokens in body, set them manually
          if (backendResponse.access_token) {
            const accessTokenAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days if remember me, 1 hour otherwise
            successResponse.cookies.set('access_token', backendResponse.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
              maxAge: accessTokenAge
            });
            logger.info('access_token cookie set from response body', {
              tokenLength: backendResponse.access_token.length,
              secure: process.env.NODE_ENV === 'production'
            });
          }

          if (backendResponse.refresh_token) {
            successResponse.cookies.set('refresh_token', backendResponse.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/',
              maxAge: 7 * 24 * 60 * 60 // 7 days
            });
            logger.info('refresh_token cookie set from response body', {
              tokenLength: backendResponse.refresh_token.length,
              secure: process.env.NODE_ENV === 'production'
            });
          }

          // Store remember me preference for future token refreshes
          if (rememberMe) {
            successResponse.cookies.set('remember_me', 'true', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60 // 7 days - same as refresh token
            });
          } else {
            // Ensure the cookie is cleared if not remembering
            successResponse.cookies.delete('remember_me');
          }

          // Clean up the frontend MFA session cookies
          successResponse.cookies.delete('mfa_session');
          successResponse.cookies.delete(`mfa_token_${mfa_token.substring(0, 8)}`);

          logger.info('MFA verification successful via backend', {
            email,
            userId: normalizedUser.id,
            hasAccessToken: !!backendResponse.access_token,
            hasRefreshToken: !!backendResponse.refresh_token
          })

          return successResponse;
        } else {
          // Backend verification failed - increment attempts
          proxySession.attempts++
          
          // Update the session in cookie with incremented attempts
          const updatedEncryptedSession = SessionEncryption.encrypt(proxySession);
          
          const failResponse = NextResponse.json(
            { success: false, error: backendResponse.error || backendResponse.message || "Invalid verification code" },
            { status: 401 }
          );
          
          // Update cookies with new attempt count
          failResponse.cookies.set('mfa_session', updatedEncryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60, // 5 minutes
            path: '/'
          });
          failResponse.cookies.set(`mfa_token_${mfa_token.substring(0, 8)}`, updatedEncryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60, // 5 minutes
            path: '/'
          });
          
          logger.warn('Backend MFA verification failed', {
            email,
            attempts: proxySession.attempts,
            backendStatus: fetchResponse.status,
            backendError: backendResponse.error,
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
        
        // Update cookies with new attempt count
        errorResponse.cookies.set('mfa_session', updatedEncryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 5 * 60, // 5 minutes
          path: '/'
        });
        errorResponse.cookies.set(`mfa_token_${mfa_token.substring(0, 8)}`, updatedEncryptedSession, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 5 * 60, // 5 minutes
          path: '/'
        });
        
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