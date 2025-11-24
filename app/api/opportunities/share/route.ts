// API route to share an opportunity
// Creates shareable links for opportunities using MongoDB storage

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRFProtection } from '@/lib/csrf-protection'
import { storeSharedOpportunity } from '@/lib/mongodb-shared-opportunities'
import type { Opportunity } from '@/lib/api'

// Force dynamic runtime
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Create a new shared opportunity
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()
    const { opportunityId, userId, opportunityData } = body

    if (!opportunityId || !opportunityData) {
      return NextResponse.json(
        { error: 'Opportunity ID and data are required' },
        { status: 400 }
      )
    }

    // Get the access token from cookies for authentication check
    const cookieStore = cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Security: Use random UUID instead of predictable opportunityId
    // This prevents enumeration attacks and URL guessing
    const crypto = require('crypto')
    const shareId = crypto.randomUUID()

    // Store the opportunity in MongoDB
    await storeSharedOpportunity({
      shareId,
      opportunityId,
      userId: userId || 'anonymous',
      opportunityData: opportunityData as Opportunity,
      sharedBy: userId || 'anonymous'
    })

    // Generate the shareable URL
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
    const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_PRODUCTION_URL || (host ? `${protocol}://${host}` : '')

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Unable to generate share URL. Please configure NEXT_PUBLIC_BASE_URL.' },
        { status: 500 }
      )
    }

    const shareUrl = `${baseUrl}/share/opportunity/${shareId}`

    return NextResponse.json({
      success: true,
      shareUrl,
      shareId
    })

  } catch (error) {
    console.error('Error sharing opportunity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
