import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { appendCookie, clearMfaCookies } from '@/lib/auth-cookie-cleanup'
import { resolveAuthCookieDomain, shouldUseSecureAuthCookies } from '@/lib/auth-cookie-security'
import { CSRFProtection } from '@/lib/csrf-protection'
import { RateLimiter } from '@/lib/rate-limiter'
import { logger } from '@/lib/secure-logger'
import { SessionEncryption } from '@/lib/session-encryption'

function getBackendError(data: any): string {
  if (!data || typeof data !== 'object') {
    return 'Failed to resend code. Please try again.'
  }

  return (
    data.error ||
    data.detail ||
    data.message ||
    'Failed to resend code. Please try again.'
  )
}

async function handlePost(request: NextRequest) {
  let sessionToken: string | null = null

  try {
    const body = await request.json().catch(() => ({}))
    sessionToken =
      typeof body?.sessionToken === 'string'
        ? body.sessionToken
        : typeof body?.mfa_token === 'string'
          ? body.mfa_token
          : typeof body?.mfaToken === 'string'
            ? body.mfaToken
            : null

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'MFA session token is required' },
        { status: 400 },
      )
    }

    const resendRateLimit = await RateLimiter.checkLimit(request, 'MFA_RESEND')
    if (!resendRateLimit.allowed) {
      const retryAfter = Math.ceil((resendRateLimit.resetTime - Date.now()) / 1000)
      const rateLimitError = RateLimiter.getRateLimitError('MFA_RESEND', retryAfter)
      const response = NextResponse.json(
        { success: false, error: rateLimitError.message },
        { status: 429 },
      )
      response.headers.set('Retry-After', String(retryAfter))
      return response
    }

    const cookieStore = await cookies()
    const encryptedSession =
      cookieStore.get(`mfa_token_${sessionToken.substring(0, 8)}`)?.value ||
      cookieStore.get('mfa_session')?.value

    let proxySession: any
    try {
      proxySession = encryptedSession ? SessionEncryption.decrypt(encryptedSession) : null
    } catch (error) {
      logger.warn('MFA resend failed - session decryption failed', {
        frontendToken: `${sessionToken.substring(0, 8)}...`,
        error: error instanceof Error ? error.message : String(error),
      })

      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please try logging in again.' },
        { status: 401 },
      )
      clearMfaCookies(response, request, sessionToken)
      return response
    }

    if (
      !proxySession ||
      proxySession.frontendToken !== sessionToken ||
      !proxySession.email ||
      !proxySession.backendMfaToken
    ) {
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please try logging in again.' },
        { status: 401 },
      )
      clearMfaCookies(response, request, sessionToken)
      return response
    }

    if (proxySession.expiresAt < Date.now()) {
      const response = NextResponse.json(
        { success: false, error: 'Session expired. Please try logging in again.' },
        { status: 401 },
      )
      clearMfaCookies(response, request, sessionToken)
      return response
    }

    const { API_BASE_URL } = await import('@/config/api')
    const backendUrl = `${API_BASE_URL}/api/auth/mfa/resend`
    const allCookies = request.cookies.getAll()
    const cookieHeader = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
    const csrfHeader = request.headers.get('x-csrf-token')

    logger.info('Calling backend MFA resend', {
      email: proxySession.email,
      frontendToken: `${sessionToken.substring(0, 8)}...`,
    })

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
        ...(csrfHeader && { 'X-CSRF-Token': csrfHeader }),
      },
      credentials: 'include',
      body: JSON.stringify({
        email: proxySession.email,
        mfa_token: proxySession.backendMfaToken,
      }),
    })

    const data = await backendResponse.json().catch(() => null)

    if (!backendResponse.ok || data?.success === false) {
      const response = NextResponse.json(
        { success: false, error: getBackendError(data), data },
        { status: backendResponse.ok ? 409 : backendResponse.status },
      )
      return response
    }

    const secureAuthCookies = shouldUseSecureAuthCookies(request)
    const authCookieDomain = resolveAuthCookieDomain(request)
    const updatedSession = {
      ...proxySession,
      expiresAt: Date.now() + 5 * 60 * 1000,
    }
    const updatedEncryptedSession = SessionEncryption.encrypt(updatedSession)
    const cookieOptions = {
      httpOnly: true,
      secure: secureAuthCookies,
      sameSite: 'lax' as const,
      maxAge: 5 * 60,
      path: '/',
      ...(authCookieDomain ? { domain: authCookieDomain } : {}),
    }

    const response = NextResponse.json({
      success: true,
      message: data?.message || 'A new authentication code has been sent to your email.',
      expires_in_seconds: data?.expires_in_seconds || 300,
    })

    appendCookie(response, 'mfa_session', updatedEncryptedSession, cookieOptions)
    appendCookie(response, `mfa_token_${sessionToken.substring(0, 8)}`, updatedEncryptedSession, cookieOptions)
    response.headers.set('X-RateLimit-Remaining', resendRateLimit.remainingRequests.toString())
    return response
  } catch (error) {
    logger.error('MFA resend endpoint error', {
      frontendToken: sessionToken ? `${sessionToken.substring(0, 8)}...` : undefined,
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      { success: false, error: 'Failed to resend code. Please try again.' },
      { status: 500 },
    )
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost)
