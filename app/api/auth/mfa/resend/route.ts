import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { secureApi } from "@/lib/secure-api"

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Session token is required" },
        { status: 400 }
      )
    }

    // Stricter rate limiting for resend attempts (3 per hour)
    const resendRateLimit = await RateLimiter.checkLimit(request, 'MFA_RESEND', 3, 3600)
    if (!resendRateLimit.allowed) {
      const rateLimitError = RateLimiter.getRateLimitError('MFA_RESEND', 
        Math.ceil((resendRateLimit.resetTime - Date.now()) / 1000))
      
      logger.warn('MFA resend rate limit exceeded', {
        ip: RateLimiter.getClientIP(request).replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        retryAfter: rateLimitError.retryAfter
      })
      
      return NextResponse.json(
        { success: false, error: "Too many resend attempts. Please wait before requesting another code." },
        { status: 429 }
      )
    }

    try {
      // Retrieve the proxy MFA session using frontend token
      if (!global.mfaSessions) {
        global.mfaSessions = new Map()
      }

      const proxySession = global.mfaSessions.get(sessionToken)
      
      if (!proxySession) {
        logger.warn('MFA resend failed - invalid frontend session token', {
          frontendToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        )
      }

      // Check if session is expired
      if (proxySession.expiresAt < Date.now()) {
        global.mfaSessions.delete(sessionToken)
        
        logger.warn('MFA resend failed - proxy session expired', {
          email: proxySession.email
        })
        
        return NextResponse.json(
          { success: false, error: "Session expired. Please try logging in again." },
          { status: 401 }
        )
      }

      // Use secureApi to call backend resend - backend accepts email + optional mfa_token
      try {
        const backendResendRequest = {
          email: proxySession.email,
          mfa_token: proxySession.backendMfaToken // Optional for backend compatibility
        }

        logger.info('Calling backend MFA resend', {
          email: proxySession.email,
          frontendToken: sessionToken.substring(0, 8) + "..."
        })

        const backendResponse = await secureApi.post('/api/auth/mfa/resend', backendResendRequest, false)

        if (backendResponse.success) {
          // Reset attempts and extend expiry on successful backend resend
          proxySession.attempts = 0
          proxySession.expiresAt = Date.now() + 5 * 60 * 1000 // Extend expiry by 5 minutes

          logger.info('MFA resend successful via backend', {
            email: proxySession.email
          })

          return NextResponse.json({
            success: true,
            message: backendResponse.message || "New security code sent to your email"
          })
        } else {
          logger.warn('Backend MFA resend failed', {
            email: proxySession.email,
            backendError: backendResponse.error
          })

          return NextResponse.json(
            { success: false, error: backendResponse.error || "Resend failed. Please try again." },
            { status: 400 }
          )
        }

      } catch (backendError) {
        logger.error('Backend MFA resend error', {
          email: proxySession.email,
          error: backendError instanceof Error ? backendError.message : String(backendError)
        })
        
        return NextResponse.json(
          { success: false, error: "Resend failed. Please try again." },
          { status: 500 }
        )
      }
    } catch (processingError) {
      logger.error('MFA resend processing error', {
        error: processingError instanceof Error ? processingError.message : String(processingError)
      })
      
      return NextResponse.json(
        { success: false, error: "Resend processing failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('MFA resend endpoint error', {
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}