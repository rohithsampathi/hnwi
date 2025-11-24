// app/share/opportunity/[opportunityId]/page.tsx
// Server component for shared investment opportunities with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function to fetch opportunity directly from backend
// Uses server-side API key - only runs during SSR, never exposed to client
async function getOpportunity(opportunityId: string): Promise<Opportunity | null> {
  try {
    const backendApiUrl = process.env.API_BASE_URL || 'http://localhost:8000'
    const apiKey = process.env.API_SECRET_KEY

    if (!apiKey) {
      console.error('[Share] API_SECRET_KEY not configured')
      return null
    }

    // Add timeout to prevent hanging during SSR
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      // Fetch directly from backend using server-side API key
      // This runs server-to-server during page generation
      const response = await fetch(`${backendApiUrl}/api/opportunities`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        cache: 'no-store',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const opportunities = await response.json()
        const opportunity = opportunities.find((opp: any) =>
          opp.id === opportunityId || opp._id === opportunityId
        )
        return opportunity || null
      }

      console.error(`[Share] Backend returned ${response.status} for opportunities`)
      return null
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error) {
        console.error(`[Share] Failed to fetch opportunity: ${fetchError.message}`)
      }
      return null
    }
  } catch (error) {
    console.error('[Share] Error in getOpportunity:', error)
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { opportunityId: string }
}): Promise<Metadata> {
  const baseUrl = 'https://app.hnwichronicles.com'
  const shareUrl = `${baseUrl}/share/opportunity/${params.opportunityId}`
  const imageUrl = `${baseUrl}/logo.png`

  const defaultMetadata: Metadata = {
    title: 'Exclusive Investment Opportunity | HNWI Chronicles',
    description: 'Exclusive investment opportunity for the world\'s top 1%',
    openGraph: {
      title: 'Exclusive Investment Opportunity | HNWI Chronicles',
      description: 'Exclusive investment opportunity for the world\'s top 1%',
      url: shareUrl,
      siteName: 'HNWI Chronicles',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'HNWI Chronicles',
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Exclusive Investment Opportunity | HNWI Chronicles',
      description: 'Exclusive investment opportunity for the world\'s top 1%',
      images: [imageUrl],
    },
    alternates: {
      canonical: shareUrl
    }
  }

  try {
    const opportunity = await getOpportunity(params.opportunityId)

    if (!opportunity) {
      return defaultMetadata
    }

    // Create title from opportunity title (max 60 chars for SEO) - following Rohith pattern
    const rawTitle = opportunity.title || 'Exclusive Investment Opportunity'
    const metaTitle = rawTitle.length > 60
      ? `${rawTitle.substring(0, 57)}...`
      : rawTitle

    // Create description from investment thesis or description (max 160 chars for SEO) - following Rohith pattern
    let rawDescription = ''

    // Use investment thesis (what you're buying) as primary description
    if (opportunity.investment_thesis?.what_youre_buying) {
      rawDescription = opportunity.investment_thesis.what_youre_buying
    } else if (opportunity.description) {
      rawDescription = opportunity.description
    } else if (opportunity.subtitle) {
      rawDescription = opportunity.subtitle
    } else {
      // Fallback: Create description from key details
      const details = []
      if (opportunity.type) details.push(opportunity.type)
      if (opportunity.region) details.push(opportunity.region)
      if (opportunity.minimum_investment_display) details.push(`Min: ${opportunity.minimum_investment_display}`)
      if (opportunity.expected_return_annual_low && opportunity.expected_return_annual_high) {
        details.push(`${opportunity.expected_return_annual_low}-${opportunity.expected_return_annual_high}% annual return`)
      }
      rawDescription = details.join(' · ') || 'Exclusive investment opportunity for the world\'s top 1%'
    }

    // Clean markdown formatting and special characters (following Rohith pattern)
    const cleanDescription = rawDescription
      .replace(/[*_~`#]/g, '')  // Remove markdown
      .replace(/\n+/g, ' ')      // Replace newlines with spaces
      .trim()

    // Truncate to SEO-friendly length (160 chars)
    const metaDescription = cleanDescription.length > 160
      ? `${cleanDescription.substring(0, 157)}...`
      : cleanDescription

    return {
      title: `${metaTitle} | HNWI Chronicles`,
      description: metaDescription,
      openGraph: {
        title: `${metaTitle} | HNWI Chronicles`,
        description: metaDescription,
        url: shareUrl,
        siteName: 'HNWI Chronicles',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${metaTitle} - HNWI Chronicles`,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${metaTitle} | HNWI Chronicles`,
        description: metaDescription,
        images: [imageUrl],
      },
      alternates: {
        canonical: shareUrl
      }
    }
  } catch (error) {
    return defaultMetadata
  }
}

// Server component
export default async function SharedOpportunityPage({
  params
}: {
  params: { opportunityId: string }
}) {
  // Client component will fetch opportunity data same way as Privé Exchange
  // We still generate metadata on server for SEO
  return <SharedOpportunityClient opportunityId={params.opportunityId} />
}
