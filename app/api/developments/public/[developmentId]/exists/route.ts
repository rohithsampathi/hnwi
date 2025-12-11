// Check if a public development exists without fetching full data
// Returns 200 with exists: true/false instead of 404 to avoid console errors

import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/config/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { developmentId: string } }
) {
  try {
    const { developmentId } = params

    if (!developmentId) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      )
    }

    // Call backend to check if development exists
    const backendUrl = `${API_BASE_URL}/api/developments/public/${developmentId}`

    const response = await fetch(backendUrl, {
      method: 'HEAD', // Use HEAD to check existence without fetching body
      headers: {
        'User-Agent': 'NextJS-Proxy/1.0',
      },
    })

    // Return exists status without triggering 404 errors
    return NextResponse.json(
      { exists: response.ok },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    )

  } catch (error) {
    // Network error - assume doesn't exist
    return NextResponse.json(
      { exists: false },
      { status: 200 }
    )
  }
}