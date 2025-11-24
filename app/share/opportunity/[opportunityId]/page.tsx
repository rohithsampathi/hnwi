// app/share/opportunity/[opportunityId]/page.tsx
// Server component for shared investment opportunities with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function to fetch shared opportunity
// This function should NEVER throw errors - always return null on failure
async function getSharedOpportunity(opportunityId: string): Promise<Opportunity | null> {
  try {
    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'

    // In development: use localhost Next.js server (which has the API routes)
    // In production: use internal API call (same server)
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'  // Use Next.js dev server, not backend

    // SECURITY: Only log opportunityId, never URLs or infrastructure details
    // This prevents exposing backend configuration in logs

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    // Call the Next.js API route (works in both dev and production)
    const response = await fetch(`${apiBaseUrl}/api/opportunities/public/${opportunityId}`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).catch((fetchError) => {
      // Handle fetch errors gracefully
      // DO NOT log error details to avoid exposing infrastructure
      return null
    })

    clearTimeout(timeoutId)

    if (!response) {
      // No response - return null without logging details
      return null
    }

    if (response.ok) {
      const data = await response.json().catch(() => null)
      if (data && data.success && data.opportunity) {
        // Success - return opportunity data
        return data.opportunity as Opportunity
      }
    }

    // Failed to fetch - return null without exposing details
    return null
  } catch (error) {
    // Catch all errors and return null to prevent page crashes
    // DO NOT log error details to avoid exposing infrastructure
    return null
  }
}

// Generate dynamic metadata for social sharing
// IMPORTANT: This function MUST NEVER throw errors - it should always return valid metadata
export async function generateMetadata({
  params
}: {
  params: { opportunityId: string }
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com'
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
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000) // 5 second timeout
    })

    const opportunityPromise = getSharedOpportunity(params.opportunityId)
    const opportunity = await Promise.race([opportunityPromise, timeoutPromise])

    if (!opportunity) {
      // No opportunity found - use default metadata for preview
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

    // Successfully generated custom metadata with opportunity data
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
    console.error('[Share Page] Error generating metadata:', error)
    return defaultMetadata
  }
}

// Server component
// This component should render even if opportunity fetch fails
export default async function SharedOpportunityPage({
  params
}: {
  params: { opportunityId: string }
}) {
  try {
    const opportunity = await getSharedOpportunity(params.opportunityId)

    if (!opportunity) {
      // Opportunity not found - show 404 page
      notFound()
    }

    return <SharedOpportunityClient opportunity={opportunity} opportunityId={params.opportunityId} />
  } catch (error) {
    // If anything goes wrong, show not found page instead of crashing
    // DO NOT log error details to avoid exposing infrastructure
    notFound()
  }
}
