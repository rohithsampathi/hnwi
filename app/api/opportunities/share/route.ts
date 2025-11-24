// API route for public opportunity sharing (for social media crawlers)
// Similar pattern to /api/conversations/share - publicly accessible GET endpoint

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET - Retrieve a single opportunity for sharing (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get('id')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      )
    }

    const backendApiUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const apiKey = process.env.API_SECRET_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Fetch from backend with server-side auth
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`${backendApiUrl}/api/opportunities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      cache: 'no-store',
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    const opportunities = await response.json()
    const opportunity = opportunities.find((opp: any) =>
      opp.id === opportunityId || opp._id === opportunityId
    )

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Return the opportunity data (public data for sharing)
    return NextResponse.json({
      success: true,
      opportunity
    }, {
      headers: {
        // Cache for 5 minutes to reduce backend load
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
