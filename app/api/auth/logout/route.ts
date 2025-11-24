// API route for logout
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

    // Clear auth cookies
    nextResponse.cookies.delete('access_token')
    nextResponse.cookies.delete('refresh_token')
    nextResponse.cookies.delete('csrf_token')

    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
