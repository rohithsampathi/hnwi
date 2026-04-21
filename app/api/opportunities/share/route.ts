// API route to share an opportunity
// Proxies to backend /api/sharing/opportunities endpoints

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRFProtection } from '@/lib/csrf-protection'
import { serverApi } from '@/lib/server-api'
import crypto from 'crypto'

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

    // Auth check
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Security: Use random UUID instead of predictable opportunityId
    const shareId = crypto.randomUUID()

    // Store via backend (sanitization happens on backend)
    await serverApi.post('/api/sharing/opportunities', {
      shareId,
      opportunityId,
      userId: userId || 'anonymous',
      opportunityData,
      sharedBy: userId || 'anonymous'
    }, request.headers)

    // Generate the shareable URL
    const isProduction = process.env.NODE_ENV === 'production'
    const baseUrl = isProduction
      ? process.env.NEXT_PUBLIC_PRODUCTION_URL || process.env.NEXT_PUBLIC_BASE_URL
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = CSRFProtection.withCSRFProtection(handlePost);
