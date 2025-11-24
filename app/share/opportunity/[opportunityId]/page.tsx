// app/share/opportunity/[opportunityId]/page.tsx
// Server component for shared investment opportunities with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"
import { getSharedOpportunity as getSharedOpportunityFromDB } from "@/lib/mongodb-shared-opportunities"

// Force dynamic rendering for metadata generation
// CRITICAL: This ensures the page is rendered at request time, not build time
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Ensure Node.js runtime for MongoDB
export const revalidate = 0

// Server-side function to fetch shared opportunity directly from MongoDB
// Following Next.js best practices: Server Components should NOT fetch their own API routes
async function getSharedOpportunity(shareId: string): Promise<Opportunity | null> {
  try {
    // Validate UUID format before database access
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shareId)

    if (!isValidUUID) {
      console.log(`[Opportunity Share] Invalid UUID format: ${shareId}`)
      return null
    }

    console.log(`[Opportunity Share] Fetching ${shareId} directly from MongoDB`)

    // Direct MongoDB access (proper Next.js server component pattern)
    const sharedOpp = await getSharedOpportunityFromDB(shareId)

    if (!sharedOpp || !sharedOpp.opportunityData) {
      console.log(`[Opportunity Share] Not found or expired: ${shareId}`)
      return null
    }

    console.log(`[Opportunity Share] Successfully fetched opportunity`)
    return sharedOpp.opportunityData as Opportunity

  } catch (error) {
    console.error('[Opportunity Share] MongoDB error:', error)
    // Return null instead of throwing to show 404 page gracefully
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { opportunityId: string }
}): Promise<Metadata> {
  // Use production URL for metadata (crawlers can't access localhost)
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
    const opportunity = await getSharedOpportunity(params.opportunityId)

    if (!opportunity) {
      console.log(`[Share Page] No opportunity found for ${params.opportunityId}, using default metadata`)
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

    console.log(`[Share Page] Generated metadata for ${params.opportunityId}:`, {
      title: metaTitle,
      description: metaDescription.substring(0, 50) + '...'
    })

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
export default async function SharedOpportunityPage({
  params
}: {
  params: { opportunityId: string }
}) {
  const opportunity = await getSharedOpportunity(params.opportunityId)

  if (!opportunity) {
    notFound()
  }

  // Serialize opportunity data to remove non-serializable values (Date objects, functions, etc.)
  // This is required when passing data from Server Component to Client Component
  const serializedOpportunity = JSON.parse(JSON.stringify(opportunity))

  return <SharedOpportunityClient opportunity={serializedOpportunity} opportunityId={params.opportunityId} />
}
