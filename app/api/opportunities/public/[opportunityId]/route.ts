// Public opportunity endpoint for shared opportunities
// This endpoint works without authentication for social media previews
// Only accepts shareId (UUID format) created via share API

import { NextRequest, NextResponse } from 'next/server'
import { getSharedOpportunity } from '@/lib/mongodb-shared-opportunities'

// Force dynamic runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { opportunityId: string } }
) {
  try {
    const shareId = params.opportunityId // Route param is named opportunityId but we treat it as shareId

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: 'Share ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format (8-4-4-4-12 hexadecimal with dashes)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shareId)

    if (!isValidUUID) {
      return NextResponse.json(
        { success: false, error: 'Invalid share ID format' },
        { status: 400 }
      )
    }


    // Retrieve from MongoDB
    const sharedOpp = await getSharedOpportunity(shareId)

    if (!sharedOpp || !sharedOpp.opportunityData) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found or has expired' },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      opportunity: sharedOpp.opportunityData
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable' },
      { status: 500 }
    )
  }
}
