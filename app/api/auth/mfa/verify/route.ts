import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import { secureApi } from "@/lib/secure-api"

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

      const proxySession = global.mfaSessions.get(mfa_token)
      
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

        logger.info('About to call secureApi.post with endpoint /api/auth/mfa/verify')
        
        const backendResponse = await secureApi.post('/api/auth/mfa/verify', backendVerifyRequest, false)
        logger.info('Backend response received', { response: backendResponse })

        // Backend verification successful
        if (backendResponse.success) {
          // Create JWT token and set secure cookie  
          const token = backendResponse.access_token || await createToken(backendResponse.user)
          const sessionCookieName = getSecureCookieName("session")
          cookies().set(sessionCookieName, token, COOKIE_OPTIONS)

          // Clean up the proxy session
          global.mfaSessions.delete(mfa_token)

          logger.info('MFA verification successful via backend', { 
            email,
            userId: backendResponse.user?.id
          })

          return NextResponse.json({
            success: true,
            access_token: token,
            user: backendResponse.user,
            message: backendResponse.message || "Login successful"
          })
        } else {
          // Backend verification failed - increment attempts
          proxySession.attempts++
          
          logger.warn('Backend MFA verification failed', {
            email,
            attempts: proxySession.attempts,
            backendError: backendResponse.error
          })
          
          return NextResponse.json(
            { success: false, error: backendResponse.error || "Invalid verification code" },
            { status: 401 }
          )
        }

      } catch (backendError) {
        proxySession.attempts++
        
        logger.error('Backend MFA verification error', {
          email,
          attempts: proxySession.attempts,
          error: backendError instanceof Error ? backendError.message : String(backendError),
          backendErrorDetails: backendError
        })
        
        return NextResponse.json(
          { success: false, error: "Verification failed. Please try again." },
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