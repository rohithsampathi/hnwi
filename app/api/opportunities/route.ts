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

    console.log('[Opportunities API] Fetching from:', `${backendApiUrl}/api/opportunities`)

    // Fetch from backend API with cache busting and timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(`${backendApiUrl}/api/opportunities`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Opportunities API] Backend returned error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500)
      })
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

    console.error('[Opportunities API] Error fetching opportunities:', {
      error: errorMessage,
      type: error?.name,
      isTimeout,
      isNetworkError,
      stack: error?.stack?.substring(0, 500)
    })

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
