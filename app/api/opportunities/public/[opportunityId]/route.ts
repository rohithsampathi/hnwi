// Public opportunity endpoint for shared opportunities
// This endpoint works without authentication for social media previews
// Uses MongoDB as primary source, with backend as fallback

import { NextRequest, NextResponse } from 'next/server'
import { getSharedOpportunityByOpportunityId, storeSharedOpportunity } from '@/lib/mongodb-shared-opportunities'

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

    // STEP 1: Try to get from MongoDB cache (fast, no backend dependency)
    try {
      const sharedOpp = await getSharedOpportunityByOpportunityId(opportunityId)
      if (sharedOpp && sharedOpp.opportunityData) {
        // Found in cache - return immediately without any backend calls
        return NextResponse.json({
          success: true,
          opportunity: sharedOpp.opportunityData
        }, {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
          },
        })
      }
    } catch (mongoError) {
      // MongoDB lookup failed - continue to backend fallback
      // DO NOT log error details to avoid exposing infrastructure
    }

    // STEP 2: Try to fetch from backend (requires env vars)
    // SECURITY: Never expose backend URL or configuration details
    const backendApiUrl = process.env.API_BASE_URL
    const apiKey = process.env.API_SECRET_KEY

    if (!backendApiUrl || !apiKey) {
      // Backend not configured - return generic error
      return NextResponse.json(
        {
          success: false,
          error: 'Opportunity not found'
        },
        { status: 404 }
      )
    }

    // Fetch from backend using server-side API key with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(`${backendApiUrl}/api/opportunities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'User-Agent': 'NextJS-Server/1.0',
        },
        cache: 'no-store', // Fresh data for social crawlers
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Backend error - return generic error without exposing details
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to fetch opportunity data'
          },
          { status: 503 } // Service Unavailable
        )
      }

      const opportunities = await response.json()

      // Find the specific opportunity
      const opportunity = opportunities.find((opp: any) =>
        opp.id === opportunityId || opp._id === opportunityId || opp.opportunity_id === opportunityId
      )

      if (!opportunity) {
        return NextResponse.json(
          { success: false, error: 'Opportunity not found' },
          { status: 404 }
        )
      }

      // STEP 3: Cache in MongoDB for future requests
      try {
        await storeSharedOpportunity({
          shareId: opportunityId, // Use opportunityId as shareId for direct access
          opportunityId: opportunityId,
          userId: 'system',
          opportunityData: opportunity,
          sharedBy: 'auto_cache'
        })
      } catch (cacheError) {
        // Cache failed - continue anyway (data still returned to user)
        // DO NOT log error details to avoid exposing infrastructure
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

    } catch (fetchError: any) {
      clearTimeout(timeoutId)

      if (fetchError.name === 'AbortError') {
        // Timeout - return generic error without exposing backend details
        return NextResponse.json(
          {
            success: false,
            error: 'Service temporarily unavailable'
          },
          { status: 503 }
        )
      }

      // Generic error - never expose internal details
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to fetch opportunity data'
        },
        { status: 503 }
      )
    }

  } catch (error) {
    // Log error server-side only (not exposed to client)
    console.error('[Opportunities Public API] Error:', error)

    // SECURITY: Never expose internal error details to client
    return NextResponse.json(
      {
        success: false,
        error: 'Service temporarily unavailable'
      },
      { status: 503 }
    )
  }
}
