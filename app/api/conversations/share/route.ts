// API route to share a conversation
// Creates and retrieves shareable links for Rohith conversations using MongoDB storage

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CSRFProtection } from '@/lib/csrf-protection'
import { storeSharedConversation, getSharedConversation } from '@/lib/mongodb-shared-conversations'
import crypto from 'crypto'

// Force dynamic runtime - don't pre-render during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Retrieve a shared conversation
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

    // Retrieve the shared conversation from MongoDB
    const sharedConversation = await getSharedConversation(shareId)

    if (!sharedConversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: sharedConversation.conversationData
    })

  } catch (error) {
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

    // Get the access token from cookies for authentication check
    const cookieStore = cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate a unique share ID
    const shareId = crypto.randomUUID()

    // Store the conversation in MongoDB
    await storeSharedConversation({
      shareId,
      conversationId,
      userId: userId || 'anonymous',
      conversationData,
      sharedBy: userId || 'anonymous'
    })

    // Generate the shareable URL - use environment variable or dynamically detect from request headers
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
