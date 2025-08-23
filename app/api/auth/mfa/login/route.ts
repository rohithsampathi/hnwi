import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { FastSecureAPI } from "@/lib/fast-secure-api"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Rate limiting for MFA login attempts
    const loginRateLimit = await RateLimiter.checkLimit(request, 'LOGIN')
    if (!loginRateLimit.allowed) {
      const rateLimitError = RateLimiter.getRateLimitError('LOGIN', 
        Math.ceil((loginRateLimit.resetTime - Date.now()) / 1000))
      
      logger.warn('MFA login rate limit exceeded', {
        email,
        ip: RateLimiter.getClientIP(request).replace(/\d+\.\d+\.\d+\.\d+/, '***'),
        retryAfter: rateLimitError.retryAfter
      })
      
      return NextResponse.json(
        { success: false, error: rateLimitError.message },
        { status: 429 }
      )
    }

    try {
      // Call the backend MFA login endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/mfa/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        logger.info('MFA code sent successfully', { email })
        
        return NextResponse.json({
          success: true,
          sessionToken: data.session_token,
          message: "Security code sent to your email"
        })
      } else {
        // Record failed login attempt
        await RateLimiter.recordViolation(request, 'LOGIN')
        
        logger.warn('MFA login failed', { email, error: data.error })
        
        return NextResponse.json(
          { success: false, error: data.error || "Login failed" },
          { status: response.status }
        )
      }
    } catch (apiError) {
      logger.error('MFA login API error', {
        error: apiError instanceof Error ? apiError.message : String(apiError),
        email
      })
      
      return NextResponse.json(
        { success: false, error: "Authentication service temporarily unavailable" },
        { status: 503 }
      )
    }
  } catch (error) {
    logger.error('MFA login endpoint error', {
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}