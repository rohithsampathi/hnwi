// app/share/rohith/[shareId]/page.tsx
// Server component for shared Rohith conversations with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedConversationClient from "./shared-conversation-client"
import type { ConversationWithMessages } from "@/types/rohith"

// Server-side function to fetch shared conversation
async function getSharedConversation(shareId: string): Promise<ConversationWithMessages | null> {
  try {
    // Use the backend API URL for server-side fetches
    const apiBaseUrl = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app'

    // First try the MongoDB-backed endpoint
    const response = await fetch(`${apiBaseUrl}/api/conversations/share?shareId=${shareId}`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.conversation) {
        return data.conversation as ConversationWithMessages
      }
    }

    // Fallback to the original endpoint
    const fallbackResponse = await fetch(`${apiBaseUrl}/api/rohith/share?shareId=${shareId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json()
      if (fallbackData.success && fallbackData.conversation) {
        return fallbackData.conversation
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching shared conversation:', error)
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { shareId: string }
}): Promise<Metadata> {
  const conversation = await getSharedConversation(params.shareId)

  if (!conversation) {
    return {
      title: 'Conversation Not Found | HNWI Chronicles',
      description: 'This shared conversation could not be found or has expired.'
    }
  }

  // Extract first question and response for meta tags
  const firstUserMessage = conversation.messages.find(msg => msg.role === "user")
  const firstAssistantMessage = conversation.messages.find(msg => msg.role === "assistant")

  // Create title from first question (max 60 chars for SEO)
  const question = firstUserMessage?.content || conversation.title
  const metaTitle = question.length > 60
    ? `${question.substring(0, 57)}...`
    : question

  // Create description from first response (max 160 chars for SEO)
  const response = firstAssistantMessage?.content || "View this exclusive conversation with Rohith, your private intelligence ally for HNWI investment insights."

  // Remove markdown formatting and citations for cleaner meta description
  const cleanResponse = response
    .replace(/\[Dev ID:\s*[^\]]+\]/g, '')
    .replace(/\[DEVID\s*-\s*[^\]]+\]/g, '')
    .replace(/[*_~`#]/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  const metaDescription = cleanResponse.length > 160
    ? `${cleanResponse.substring(0, 157)}...`
    : cleanResponse

  const shareUrl = `https://app.hnwichronicles.com/share/rohith/${params.shareId}`
  const imageUrl = "https://app.hnwichronicles.com/images/ask-rohith-og.png"

  return {
    title: `${metaTitle} | Ask Rohith - HNWI Chronicles`,
    description: metaDescription,
    openGraph: {
      title: `${metaTitle} | Ask Rohith`,
      description: metaDescription,
      url: shareUrl,
      siteName: 'HNWI Chronicles',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Ask Rohith - HNWI Chronicles',
          type: 'image/png',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${metaTitle} | Ask Rohith`,
      description: metaDescription,
      images: [imageUrl],
    },
    alternates: {
      canonical: shareUrl
    }
  }
}

// Server component
export default async function SharedConversationPage({
  params
}: {
  params: { shareId: string }
}) {
  const conversation = await getSharedConversation(params.shareId)

  if (!conversation) {
    notFound()
  }

  return <SharedConversationClient conversation={conversation} shareId={params.shareId} />
}
