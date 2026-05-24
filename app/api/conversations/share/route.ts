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

function sharedConversationHasMessages(conversation: any) {
  return Array.isArray(conversation?.messages) && conversation.messages.length > 0
}

function normalizeSharedConversation(conversation: any, shareId: string) {
  const rawMessages = Array.isArray(conversation?.messages) ? conversation.messages : []
  const messages = rawMessages.map((message: any, index: number) => ({
    ...message,
    id: String(message?.id || message?.message_id || message?._id || `${shareId}-${index}`),
    role: message?.role === 'user' ? 'user' : 'assistant',
    content: String(message?.content || message?.message || ''),
    timestamp: message?.timestamp || message?.createdAt || message?.created_at || conversation?.createdAt || conversation?.created_at || ''
  }))

  return {
    ...conversation,
    id: conversation?.id || conversation?.conversationId || conversation?.conversation_id || shareId,
    conversationId: conversation?.conversationId || conversation?.conversation_id || conversation?.id || shareId,
    title: conversation?.title || 'Shared Conversation',
    messages,
    messageCount: conversation?.messageCount || conversation?.total_messages || messages.length,
    createdAt: conversation?.createdAt || conversation?.created_at || conversation?.created_at_iso || ''
  }
}

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

    try {
      const audelle = await serverApi.get(`/api/audelle/share/${shareId}`)
      const conversation = audelle.success && audelle.conversation
        ? normalizeSharedConversation(audelle.conversation, shareId)
        : null

      if (sharedConversationHasMessages(conversation)) {
        return NextResponse.json({
          success: true,
          conversation
        })
      }
    } catch {
      // Fall through to legacy shared_conversations for old links.
    }

    const data = await serverApi.get(`/api/sharing/conversations/${shareId}`)

    const legacyConversation = data.success && data.conversation
      ? normalizeSharedConversation(data.conversation, shareId)
      : null

    if (!sharedConversationHasMessages(legacyConversation)) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or has expired' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation: legacyConversation
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

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
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

    try {
      const audelle = await serverApi.post(
        `/api/audelle/share/${conversationId}`,
        {},
        request.headers
      )
      if (audelle.success && audelle.shareId) {
        const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
        const protocol = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_PRODUCTION_URL || (host ? `${protocol}://${host}` : '')

        if (!baseUrl) {
          return NextResponse.json(
            { error: 'Unable to generate share URL. Please configure NEXT_PUBLIC_BASE_URL.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          shareUrl: `${baseUrl}/share/audelle/${audelle.shareId}`,
          shareId: audelle.shareId
        })
      }
    } catch {
      // Fall through to legacy client-supplied snapshot for older conversations.
    }

    if (!conversationData) {
      return NextResponse.json(
        { error: 'Conversation data is required for legacy sharing' },
        { status: 400 }
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

    const shareUrl = `${baseUrl}/share/audelle/${shareId}`

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
