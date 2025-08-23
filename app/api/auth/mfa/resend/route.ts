import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"

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
      // Call the backend MFA resend endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/mfa/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: sessionToken }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        logger.info('MFA code resent successfully', {
          sessionToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json({
          success: true,
          message: "New security code sent to your email"
        })
      } else {
        logger.warn('MFA resend failed', { 
          error: data.error,
          sessionToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json(
          { success: false, error: data.error || "Failed to resend code" },
          { status: response.status }
        )
      }
    } catch (apiError) {
      logger.error('MFA resend API error', {
        error: apiError instanceof Error ? apiError.message : String(apiError)
      })
      
      return NextResponse.json(
        { success: false, error: "Resend service temporarily unavailable" },
        { status: 503 }
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