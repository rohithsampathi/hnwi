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

function getSecureCookieName(baseName: string): string {
  if (process.env.NODE_ENV === 'production') {
    return `__Host-${baseName}`
  } else {
    return `__Secure-${baseName}`
  }
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24, // 24 hours
}

async function createToken(user: any): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJWTSecret())
}

export async function POST(request: NextRequest) {
  try {
    const { email, mfa_code, mfa_token } = await request.json()

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
      // Retrieve the proxy MFA session using frontend token
      if (!global.mfaSessions) {
        global.mfaSessions = new Map()
      }

      // SECURITY: Decrypt the encrypted session
      const encryptedSession = global.mfaSessions.get(mfa_token)
      let proxySession;
      
      try {
        proxySession = encryptedSession ? SessionEncryption.decrypt(encryptedSession) : null;
      } catch (error) {
        logger.warn('MFA verification failed - session decryption failed', {
          frontendToken: mfa_token.substring(0, 8) + "...",
          email,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Remove corrupted session
        global.mfaSessions.delete(mfa_token);
        
        return NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        )
      }
      
      logger.info('MFA verification debug', {
        providedFrontendToken: mfa_token.substring(0, 8) + "...",
        email,
        totalSessions: global.mfaSessions.size,
        sessionExists: !!proxySession,
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
        global.mfaSessions.delete(mfa_token)
        
        logger.warn('MFA verification failed - session expired', {
          email: proxySession.email
        })
        
        return NextResponse.json(
          { success: false, error: "Session expired. Please try logging in again." },
          { status: 401 }
        )
      }

      // Check attempt limit
      if (proxySession.attempts >= 5) {
        global.mfaSessions.delete(mfa_token)
        await RateLimiter.recordViolation(request, 'MFA_VERIFY')
        
        logger.warn('MFA verification failed - too many attempts', {
          email: proxySession.email
        })
        
        return NextResponse.json(
          { success: false, error: "Too many failed attempts. Please try logging in again." },
          { status: 429 }
        )
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

        const backendResponse = await fetchResponse.json();
        
        logger.info('Backend MFA verification response received', { 
          status: fetchResponse.status,
          success: backendResponse.success,
          hasUser: !!backendResponse.user,
          hasAccessToken: !!backendResponse.access_token,
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

          // Create JWT token and set secure cookie  
          const token = backendResponse.access_token || await createToken(normalizedUser)
          const sessionCookieName = getSecureCookieName("session")
          cookies().set(sessionCookieName, token, COOKIE_OPTIONS)

          // Clean up the proxy session
          global.mfaSessions.delete(mfa_token)

          logger.info('MFA verification successful via backend', { 
            email,
            userId: normalizedUser.id
          })

          return NextResponse.json({
            success: true,
            access_token: token,
            user: normalizedUser,
            message: backendResponse.message || "Login successful"
          })
        } else {
          // Backend verification failed - increment attempts
          proxySession.attempts++
          
          logger.warn('Backend MFA verification failed', {
            email,
            attempts: proxySession.attempts,
            backendStatus: fetchResponse.status,
            backendError: backendResponse.error,
            backendMessage: backendResponse.message
          })
          
          // Return the specific error from backend, or a default message
          const errorMessage = backendResponse.error || backendResponse.message || "Invalid verification code";
          
          return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 401 }
          )
        }

      } catch (backendError) {
        proxySession.attempts++
        
        logger.error('Backend MFA verification network/parsing error', {
          email,
          attempts: proxySession.attempts,
          error: backendError instanceof Error ? backendError.message : String(backendError)
        })
        
        return NextResponse.json(
          { success: false, error: "Network error during verification. Please try again." },
          { status: 500 }
        )
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