// API route for logout
import { NextRequest, NextResponse } from 'next/server'
import { CSRFProtection } from '@/lib/csrf-protection'

export const dynamic = 'force-dynamic'

async function handlePost(request: NextRequest) {
  try {
    const backendApiUrl = process.env.API_BASE_URL || 'http://localhost:8000'

    // Forward logout request to backend
    const response = await fetch(`${backendApiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    })

    const result = await response.json().catch(() => ({ success: true }))

    // Create response
    const nextResponse = NextResponse.json(result, {
      status: response.status
    })

    // Clear ALL auth cookies — leaving any behind creates ghost sessions
    const cookiesToClear = [
      'access_token',
      'refresh_token',
      'csrf_token',
      'session_user',
      'session_token',
      'remember_me',
      'mfa_session',
    ]
    const isProd = process.env.NODE_ENV === 'production'
    for (const name of cookiesToClear) {
      nextResponse.cookies.set(name, '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const,
        path: '/',
        maxAge: 0,
        ...(isProd ? { domain: '.hnwichronicles.com' } : {}),
      })
    }
    // Also clear __Host- prefixed CSRF cookie used in production
    if (isProd) {
      nextResponse.cookies.set('__Host-csrf_token', '', {
        httpOnly: false,
        secure: true,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0,
      })
    }

    return nextResponse
  } catch (error) {
    // Even on error, attempt to clear cookies
    const errorResponse = NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
    const isProd = process.env.NODE_ENV === 'production'
    for (const name of ['access_token', 'refresh_token', 'csrf_token', 'session_user', 'session_token', 'remember_me']) {
      errorResponse.cookies.set(name, '', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' as const : 'lax' as const,
        path: '/',
        maxAge: 0,
        ...(isProd ? { domain: '.hnwichronicles.com' } : {}),
      })
    }
    return errorResponse
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
