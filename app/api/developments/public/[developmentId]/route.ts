// Public development endpoint for shared citations
// This endpoint should work without authentication for shared conversations

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
        { error: 'Development ID is required' },
        { status: 400 }
      )
    }

    // Call backend without authentication - this should be a public endpoint
    const backendUrl = `${API_BASE_URL}/api/developments/public/${developmentId}`

    // Fetching from backend public endpoint

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Proxy/1.0',
      },
    })

    // Backend response received

    if (!response.ok) {
      const errorText = await response.text()
      // Backend returned error

      return NextResponse.json(
        {
          error: 'Failed to fetch development data',
          details: response.status === 401 ? 'Backend requires authentication for public endpoint' : errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })

  } catch (error) {
    // Error occurred during fetch

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}