// API route for opportunities
// Proxies requests to backend API for server-side rendering and social media crawlers

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic runtime - don't pre-render during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Retrieve opportunities from backend
export async function GET(request: NextRequest) {
  try {
    // Get backend API URL from environment
    const backendApiUrl = process.env.API_BASE_URL || 'http://localhost:8000'

    // GET /api/opportunities - requires authentication
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    // Forward authentication headers from the client request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }

    // Forward cookies for authentication
    const cookies = request.headers.get('cookie')
    if (cookies) {
      headers['Cookie'] = cookies
    }

    // Forward API secret key for server-to-server auth
    const apiSecretKey = process.env.API_SECRET_KEY
    if (apiSecretKey) {
      headers['X-API-Key'] = apiSecretKey
    }

    const response = await fetch(`${backendApiUrl}/api/opportunities`, {
      cache: 'no-store',
      signal: controller.signal,
      headers
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      return NextResponse.json(
        {
          error: 'Failed to fetch opportunities from backend',
          details: `Backend returned ${response.status}: ${response.statusText}`,
          backendUrl: backendApiUrl
        },
        { status: response.status }
      )
    }

    const opportunities = await response.json()

    // Normalize opportunity IDs (ensure every opportunity has an id field)
    const normalized = Array.isArray(opportunities) ? opportunities.map((opp: any) => ({
      ...opp,
      id: opp.id || opp._id || opp.opportunity_id || String(Math.random())
    })) : []

    // Return with no-cache headers to prevent Next.js from caching
    return new NextResponse(JSON.stringify(normalized), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    // Handle different error types
    const errorMessage = error?.message || 'Unknown error'
    const isTimeout = error?.name === 'AbortError'
    const isNetworkError = errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')

    // Return user-friendly error message
    return NextResponse.json(
      {
        error: 'Failed to load opportunities',
        details: isTimeout
          ? 'Request timed out - backend may be slow or unavailable'
          : isNetworkError
          ? 'Cannot connect to backend API - check network or API_BASE_URL'
          : `Internal error: ${errorMessage}`,
        type: isTimeout ? 'timeout' : isNetworkError ? 'network' : 'internal'
      },
      { status: 500 }
    )
  }
}
