// app/api/conversations/share/route.ts
// API endpoint for sharing conversations

import { NextRequest, NextResponse } from 'next/server'
import { storeSharedConversation, getSharedConversation } from '@/lib/mongodb-shared-conversations'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId, conversationData } = await request.json()

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Generate a unique share ID
    const shareId = uuidv4()

    // For now, if conversationData is not provided, create a simple structure
    // In production, you would fetch this from your existing database
    const dataToStore = conversationData || {
      id: conversationId,
      title: 'Shared Conversation',
      userId: userId || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      isActive: true,
      messages: []
    }

    // Store in MongoDB
    await storeSharedConversation({
      shareId,
      conversationId,
      userId: userId || 'anonymous',
      conversationData: dataToStore,
      sharedBy: userId || 'anonymous'
    })

    // Generate the share URL - always use production URL for sharing
    // This ensures share links work from any environment
    const shareBaseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://app.hnwichronicles.com'
    const shareUrl = `${shareBaseUrl}/share/rohith/${shareId}`

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresIn: '30 days'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to share conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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

    const sharedConversation = await getSharedConversation(shareId)

    if (!sharedConversation) {
      return NextResponse.json(
        { error: 'Shared conversation not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: sharedConversation.conversationData,
      sharedBy: sharedConversation.sharedBy,
      viewCount: sharedConversation.viewCount
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get shared conversation' },
      { status: 500 }
    )
  }
}