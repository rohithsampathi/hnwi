// API route to share a conversation
// Proxies to backend /api/sharing/conversations endpoints

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRFProtection } from '@/lib/csrf-protection'
import { serverApi } from '@/lib/server-api'
import crypto from 'crypto'

// Force dynamic runtime - don't pre-render during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Retrieve a shared conversation (public, no auth)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    const data = await serverApi.get(`/api/sharing/conversations/${shareId}`)

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: data.conversation
    })

  } catch (error) {
    // Backend returns 404 for not found — surface it
    const message = error instanceof Error ? error.message : ''
    if (message.includes('404')) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or has expired' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new shared conversation
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, userId, conversationData } = body

    if (!conversationId || !conversationData) {
      return NextResponse.json(
        { error: 'Conversation ID and data are required' },
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

    // Generate share ID on frontend (we own the URL)
    const shareId = crypto.randomUUID()

    // Store via backend
    await serverApi.post('/api/sharing/conversations', {
      shareId,
      conversationId,
      userId: userId || 'anonymous',
      conversationData,
      sharedBy: userId || 'anonymous'
    }, request.headers)

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

    const shareUrl = `${baseUrl}/share/rohith/${shareId}`

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
