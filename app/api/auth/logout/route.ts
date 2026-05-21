// API route for logout
import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/config/api'
import { CSRFProtection } from '@/lib/csrf-protection'
import { withRateLimit } from '@/lib/security/api-auth'
import { clearAuthCookies } from '@/lib/auth-cookie-cleanup'

export const dynamic = 'force-dynamic'

async function handlePost(request: NextRequest) {
  try {
    // Forward logout request to backend
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    })

    const result = await response.json().catch(() => ({ success: true }))

    // Local logout is terminal even if the backend rejects an already-expired session.
    // Propagating backend 401 here re-enters the auth recovery loop while cookies are
    // being cleared.
    const nextResponse = NextResponse.json(
      response.ok ? result : { success: true, backend_status: response.status },
      { status: 200 }
    )

    // Clear ALL auth cookies across the paths used by the backend bridge.
    clearAuthCookies(nextResponse, request, { includeMfa: true })

    return nextResponse
  } catch (error) {
    // Even on error, attempt to clear cookies
    const errorResponse = NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
    clearAuthCookies(errorResponse, request, { includeMfa: true })
    return errorResponse
  }
}

export const POST = withRateLimit('api', CSRFProtection.withCSRFProtection(handlePost));
