// app/share/rohith/[shareId]/page.tsx
// Server component for shared Audelle conversations

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import SharedConversationClient from "./shared-conversation-client"
import { serverApi } from "@/lib/server-api"

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

function compactText(value: string) {
  return String(value || '')
    .replace(/—/g, ', ')
    .replace(/–/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function sharedConversationDescription(conversation: any) {
  const text = compactText([
    conversation?.title,
    conversation?.positioningLine,
    (conversation?.messages || []).slice(0, 3).map((message: any) => message?.content || '').join(' ')
  ].filter(Boolean).join(' '))

  if (/dubai|difc|adgm|uae/i.test(text)) {
    return 'A public Audelle conversation on what a Dubai-linked family route must still carry before it hardens.'
  }
  if (/hyderabad/i.test(text)) {
    return 'A public Audelle conversation on when a city becomes useful enough to carry family life, capital and continuity.'
  }
  if (/uk|london|europe|non-?dom/i.test(text)) {
    return 'A public Audelle conversation on route pressure, proof burden and timing for UK or Europe-linked families.'
  }

  return 'A public Audelle conversation on the proof, authority, liquidity, timing and fallback questions before a family wealth route hardens.'
}

// Server-side fetch for shared conversation. Read backend contracts directly;
// self-fetching the frontend host can resolve to the wrong deployment/runtime.
async function getSharedConversation(shareId: string) {
  try {
    const audelle = await serverApi.get(`/api/audelle/share/${shareId}`)
    const conversation = audelle.success && audelle.conversation
      ? normalizeSharedConversation(audelle.conversation, shareId)
      : null
    if (sharedConversationHasMessages(conversation)) {
      return conversation
    }
  } catch {
    // Fall through to the existing shared_conversations registry for old links.
  }

  try {
    const data = await serverApi.get(`/api/sharing/conversations/${shareId}`)
    const conversation = data.success && data.conversation
      ? normalizeSharedConversation(data.conversation, shareId)
      : null
    return sharedConversationHasMessages(conversation) ? conversation : null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ shareId: string }>
}): Promise<Metadata> {
  const { shareId } = await params
  const conversation = await getSharedConversation(shareId)

  if (!conversation) {
    return {
      title: "Conversation Not Found | HNWI Chronicles",
      description: "This conversation is no longer available or has expired."
    }
  }

  const title = `${conversation.title || "Audelle Conversation"} | Audelle by HNWI Chronicles`
  const description = sharedConversationDescription(conversation)
  const siteUrl = "https://app.hnwichronicles.com"
  const ogImage = `${siteUrl}/logo.png?v=20241220e`

  return {
    title: {
      absolute: title,
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/share/audelle/${shareId}`,
      siteName: "HNWI Chronicles",
      images: [{ url: ogImage, width: 650, height: 650, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  }
}

export default async function SharedConversationPage({
  params
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params
  const conversation = await getSharedConversation(shareId)

  if (!conversation) {
    notFound()
  }

  return <SharedConversationClient conversation={conversation} shareId={shareId} />
}
