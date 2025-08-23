import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

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
    const { sessionToken, code } = await request.json()

    if (!sessionToken || !code) {
      return NextResponse.json(
        { success: false, error: "Session token and code are required" },
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
      // Call the backend MFA verify endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: sessionToken, code }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Create user object for frontend compatibility
        const user = {
          id: data.user_id || data.id,
          email: data.email,
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          role: "user",
          user_id: data.user_id,
          profile: data.profile || {}
        }

        // Create JWT token and set secure cookie
        const token = data.access_token || await createToken(user)
        const sessionCookieName = getSecureCookieName("session")
        cookies().set(sessionCookieName, token, COOKIE_OPTIONS)

        logger.info('MFA verification successful', { 
          userId: user.id,
          email: user.email 
        })

        return NextResponse.json({
          success: true,
          token,
          user,
          message: "Elite authentication successful"
        })
      } else {
        // Record failed verification attempt
        await RateLimiter.recordViolation(request, 'MFA_VERIFY')
        
        logger.warn('MFA verification failed', { 
          error: data.error,
          sessionToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json(
          { success: false, error: data.error || "Invalid verification code" },
          { status: response.status }
        )
      }
    } catch (apiError) {
      logger.error('MFA verify API error', {
        error: apiError instanceof Error ? apiError.message : String(apiError)
      })
      
      return NextResponse.json(
        { success: false, error: "Verification service temporarily unavailable" },
        { status: 503 }
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