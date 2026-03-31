import { NextRequest, NextResponse } from 'next/server'
import { ApiAuth } from '@/lib/api-auth'
import { CSRFProtection } from '@/lib/csrf-protection'
import { logger } from '@/lib/secure-logger'

export async function GET(request: NextRequest) {
  try {
    const { token, expires } = await CSRFProtection.refreshCSRFToken(request)

    const response = NextResponse.json(
      {
        success: true,
        csrfToken: token,
        expires
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      }
    )

    return ApiAuth.addSecurityHeaders(response)
  } catch (error) {
    logger.error('Failed to issue CSRF token', {
      error: error instanceof Error ? error.message : String(error)
    })

    return ApiAuth.addSecurityHeaders(
      NextResponse.json(
        { success: false, error: 'Failed to initialize security token.' },
        { status: 500 }
      )
    )
  }
}
