// Public opportunity endpoint for shared opportunities
// This endpoint works without authentication for social media previews

import { NextRequest, NextResponse } from 'next/server'

// Force dynamic runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { opportunityId: string } }
) {
  try {
    const { opportunityId } = params

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    // Use server-side environment variables to call backend
    const backendApiUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const apiKey = process.env.API_SECRET_KEY

    if (!apiKey) {
      console.error('[Opportunities Public API] API_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Fetch from backend using server-side API key
    const response = await fetch(`${backendApiUrl}/api/opportunities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'NextJS-Server/1.0',
      },
      cache: 'no-store', // Fresh data for social crawlers
    })

    if (!response.ok) {
      console.error(`[Opportunities Public API] Backend returned ${response.status}`)
      return NextResponse.json(
        { error: 'Failed to fetch opportunity data' },
        { status: response.status }
      )
    }

    const opportunities = await response.json()

    // Find the specific opportunity
    const opportunity = opportunities.find((opp: any) =>
      opp.id === opportunityId || opp._id === opportunityId
    )

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      opportunity
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })

  } catch (error) {
    console.error('[Opportunities Public API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
