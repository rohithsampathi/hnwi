// app/share/rohith/[shareId]/page.tsx
// Server component for shared Audelle conversations

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import SharedConversationClient from "./shared-conversation-client"
import { serverApi } from "@/lib/server-api"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const siteUrl = "https://app.hnwichronicles.com"
const audelleDubaiRouteOgImage = `${siteUrl}/assets/og/audelle-dubai-principal-room-og.jpg?v=20260527b`
const audelleLondonHeritageOgImage = `${siteUrl}/assets/og/audelle-london-heritage-property-w1.jpg?v=20260604b`

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

function sharedConversationMetadataText(conversation: any) {
  return compactText([
    conversation?.title,
    conversation?.public_meta_title,
    conversation?.positioningLine,
    (conversation?.sourceBasis || []).join(' '),
    (conversation?.whatAudelleUsed || conversation?.whatAskRohithUsed || []).join(' '),
    (conversation?.messages || []).map((message: any) => message?.content || '').join(' ')
  ].filter(Boolean).join(' '))
}

function isUkUsDubaiBaseConversation(text: string) {
  return /\buk\b|london|britain|non-?dom/i.test(text)
    && /\bus\b|united states|american/i.test(text)
    && /dubai|difc|adgm|uae|gulf/i.test(text)
    && /base|residen|route|family/i.test(text)
}

function isLondonHostedTrophyAuctionConversation(text: string) {
  return /london/i.test(text)
    && /heritage|trophy|auction|property|concierge|crown bel air/i.test(text)
}

function sharedConversationTitle(conversation: any) {
  const text = sharedConversationMetadataText(conversation)

  if (isLondonHostedTrophyAuctionConversation(text)) {
    return 'London-Hosted Trophy Auction. Before The Room Says Yes.'
  }

  if (isUkUsDubaiBaseConversation(text)) {
    return 'UK Ties. US Exposure. Dubai On The Table.'
  }

  return compactText(
    conversation?.public_meta_title ||
    conversation?.title ||
    'Shared Wealth Conversation'
  )
}

function sharedConversationDescription(conversation: any) {
  const text = sharedConversationMetadataText(conversation)

  if (isLondonHostedTrophyAuctionConversation(text)) {
    return 'Audelle pressure-tests a London-hosted global trophy-property auction before a family says yes: auction-house reported bids, recorded-close proof, price versus ask, failed-lot context, fallback and family purpose.'
  }

  if (isUkUsDubaiBaseConversation(text)) {
    return 'A family-base move with UK ties, US exposure and Dubai on the table. The route test is proof, authority, liquidity, fallback and family explanation before yes.'
  }

  if (/dubai|difc|adgm|uae/i.test(text)) {
    return 'A family-wealth conversation on what a cross-border base decision must still carry before it hardens.'
  }
  if (/hyderabad/i.test(text)) {
    return 'A family-wealth conversation on when a city becomes useful enough to carry family life, capital and continuity.'
  }
  if (/uk|london|europe|non-?dom/i.test(text)) {
    return 'A family-wealth conversation on route pressure, proof burden and timing for UK or Europe-linked families.'
  }

  return 'A family-wealth conversation on the proof, authority, liquidity, timing and fallback questions before a route hardens.'
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

  const title = `${sharedConversationTitle(conversation)} | HNWI Chronicles`
  const description = sharedConversationDescription(conversation)
  const metadataText = sharedConversationMetadataText(conversation)
  const isLondonHeritage = isLondonHostedTrophyAuctionConversation(metadataText)
  const ogImage = isLondonHeritage ? audelleLondonHeritageOgImage : audelleDubaiRouteOgImage
  const ogAlt = isLondonHeritage
    ? "Sketch for an HNWI Chronicles Audelle conversation on a London-hosted trophy-property auction"
    : "HNWI Chronicles family wealth decision conversation"

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
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ]
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
