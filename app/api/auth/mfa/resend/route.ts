import { NextRequest, NextResponse } from "next/server"
import { RateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/secure-logger"
import { secureApi } from "@/lib/secure-api"
import { SessionEncryption } from "@/lib/session-encryption"
import { cookies } from "next/headers"
import { CSRFProtection } from "@/lib/csrf-protection"

async function handlePost(request: NextRequest) {
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
      // Retrieve the proxy MFA session from cookies (serverless-safe)
      const cookieStore = cookies();
      
      // Try to get session from token-specific cookie first
      let encryptedSession = cookieStore.get(`mfa_token_${sessionToken.substring(0, 8)}`)?.value;
      
      // Fallback to general mfa_session cookie if not found
      if (!encryptedSession) {
        encryptedSession = cookieStore.get('mfa_session')?.value;
      }
      
      if (!encryptedSession) {
        logger.warn('MFA resend failed - no session found in cookies', {
          frontendToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json(
          { success: false, error: "Invalid or expired session. Please try logging in again." },
          { status: 401 }
        )
      }
      
      let proxySession;
      try {
        proxySession = SessionEncryption.decrypt(encryptedSession);
      } catch (error) {
        logger.warn('MFA resend failed - session decryption failed', {
          frontendToken: sessionToken.substring(0, 8) + "..."
        })
        
        return NextResponse.json(
          { success: false, error: "Invalid session. Please try logging in again." },
          { status: 401 }
        )
      }

      // Check if session is expired
      if (proxySession.expiresAt < Date.now()) {
        const expiredResponse = NextResponse.json(
          { success: false, error: "Session expired. Please try logging in again." },
          { status: 401 }
        );
        
        // Clear expired cookies
        expiredResponse.cookies.delete('mfa_session');
        expiredResponse.cookies.delete(`mfa_token_${sessionToken.substring(0, 8)}`);
        
        logger.warn('MFA resend failed - proxy session expired', {
          email: proxySession.email
        })
        
        return expiredResponse;
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
          
          // Update the session in cookies
          const updatedEncryptedSession = SessionEncryption.encrypt(proxySession);
          
          const successResponse = NextResponse.json({
            success: true,
            message: backendResponse.message || "New security code sent to your email"
          });
          
          // Update cookies with reset session
          successResponse.cookies.set('mfa_session', updatedEncryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' for PWA compatibility
            maxAge: 5 * 60, // 5 minutes
            path: '/'
          });
          successResponse.cookies.set(`mfa_token_${sessionToken.substring(0, 8)}`, updatedEncryptedSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' for PWA compatibility
            maxAge: 5 * 60, // 5 minutes
            path: '/'
          });

          logger.info('MFA resend successful via backend', {
            email: proxySession.email
          })

          return successResponse;
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

export const POST = CSRFProtection.withCSRFProtection(handlePost);
