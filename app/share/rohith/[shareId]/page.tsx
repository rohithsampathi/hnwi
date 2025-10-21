// app/share/rohith/[shareId]/page.tsx
// Server component for shared Rohith conversations with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedConversationClient from "./shared-conversation-client"
import type { ConversationWithMessages } from "@/types/rohith"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function to fetch shared conversation
async function getSharedConversation(shareId: string): Promise<ConversationWithMessages | null> {
  try {
    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'

    // In development: use localhost Next.js server (which has the API routes)
    // In production: use the production URL
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'  // Use Next.js dev server, not backend

    console.log(`[Share Page] Environment: ${process.env.NODE_ENV}`)
    console.log(`[Share Page] Fetching conversation ${shareId} from ${apiBaseUrl}`)

    // Call the Next.js API route (works in both dev and production)
    const response = await fetch(`${apiBaseUrl}/api/conversations/share?shareId=${shareId}`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.conversation) {
        console.log(`[Share Page] Successfully fetched conversation ${shareId}`)
        return data.conversation as ConversationWithMessages
      }
    }

    console.error(`[Share Page] Failed to fetch conversation: ${response.status} ${response.statusText}`)

    // Try to get error details
    try {
      const errorData = await response.json()
      console.error(`[Share Page] Error details:`, errorData)
    } catch (e) {
      // Ignore JSON parse errors
    }

    return null
  } catch (error) {
    console.error('[Share Page] Error fetching shared conversation:', error)
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { shareId: string }
}): Promise<Metadata> {
  // Use production URL for metadata (crawlers can't access localhost)
  const baseUrl = 'https://app.hnwichronicles.com'
  const shareUrl = `${baseUrl}/share/rohith/${params.shareId}`
  const imageUrl = `${baseUrl}/logo.png`

  const defaultMetadata: Metadata = {
    title: 'Ask Rohith - HNWI Chronicles',
    description: 'View this exclusive conversation with Rohith, your private intelligence ally for HNWI investment insights and wealth strategies.',
    openGraph: {
      title: 'Ask Rohith - HNWI Chronicles',
      description: 'View this exclusive conversation with Rohith, your private intelligence ally for HNWI investment insights and wealth strategies.',
      url: shareUrl,
      siteName: 'HNWI Chronicles',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Ask Rohith - HNWI Chronicles',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Ask Rohith - HNWI Chronicles',
      description: 'View this exclusive conversation with Rohith, your private intelligence ally for HNWI investment insights and wealth strategies.',
      images: [imageUrl],
    },
    alternates: {
      canonical: shareUrl
    }
  }

  try {
    const conversation = await getSharedConversation(params.shareId)

    if (!conversation) {
      console.log(`[Share Page] No conversation found for ${params.shareId}, using default metadata`)
      return defaultMetadata
    }

    // Extract first question and response for meta tags
    const firstUserMessage = conversation.messages.find(msg => msg.role === "user")
    const firstAssistantMessage = conversation.messages.find(msg => msg.role === "assistant")

    // Create title from first question (max 60 chars for SEO)
    const question = firstUserMessage?.content || conversation.title || "Ask Rohith Conversation"
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

    console.log(`[Share Page] Generated metadata for ${params.shareId}:`, {
      title: metaTitle,
      description: metaDescription.substring(0, 50) + '...'
    })

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
  } catch (error) {
    console.error('[Share Page] Error generating metadata:', error)
    return defaultMetadata
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
