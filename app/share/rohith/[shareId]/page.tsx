// app/share/rohith/[shareId]/page.tsx
// Server component for shared Rohith conversations

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import SharedConversationClient from "./shared-conversation-client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side fetch for shared conversation
async function getSharedConversation(shareId: string) {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'

    const response = await fetch(`${apiBaseUrl}/api/conversations/share?shareId=${shareId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.conversation) {
        return data.conversation
      }
    }
    return null
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

  const title = `${conversation.title || "Conversation"} | Ask Rohith`
  const description = `Shared intelligence conversation with ${conversation.messageCount || conversation.messages?.length || 0} messages.`
  const siteUrl = "https://app.hnwichronicles.com"
  const ogImage = `${siteUrl}/logo.png?v=20241220e`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/share/rohith/${shareId}`,
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
