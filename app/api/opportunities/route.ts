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

    // Fetch from backend API with cache busting
    const response = await fetch(`${backendApiUrl}/api/opportunities`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

    if (!response.ok) {
      console.error('[Opportunities API] Backend returned error:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch opportunities from backend' },
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

  } catch (error) {
    console.error('[Opportunities API] Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
