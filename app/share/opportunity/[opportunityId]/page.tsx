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
async function getSharedOpportunity(shareId: string): Promise<string | null> {
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

    // CRITICAL: Stringify the opportunity data HERE in the async function
    // This ensures the object never enters the component scope
    // JSON.stringify automatically strips functions, undefined, and other non-serializable values
    const opportunityString = JSON.stringify(sharedOpp.opportunityData)

    return opportunityString

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
    const opportunityString = await getSharedOpportunity(params.opportunityId)

    if (!opportunityString) {
      console.log(`[Share Page] No opportunity found for ${params.opportunityId}, using default metadata`)
      return defaultMetadata
    }

    // Parse the string back to object for metadata generation
    // CRITICAL: Extract ONLY the values we need as primitives, then discard the object
    // This prevents Next.js from serializing the full object in the function closure
    const parsed = JSON.parse(opportunityString) as Opportunity
    const title = parsed.title || ''
    const description = parsed.description || ''
    const subtitle = parsed.subtitle || ''
    const type = parsed.type || ''
    const region = parsed.region || ''
    const minInvestment = parsed.minimum_investment_display || ''
    const returnLow = parsed.expected_return_annual_low || 0
    const returnHigh = parsed.expected_return_annual_high || 0
    const investmentThesisText = parsed.investment_thesis?.what_youre_buying || ''

    // Create title from opportunity title (max 60 chars for SEO) - following Rohith pattern
    const rawTitle = title || 'Exclusive Investment Opportunity'
    const metaTitle = rawTitle.length > 60
      ? `${rawTitle.substring(0, 57)}...`
      : rawTitle

    // Create description from investment thesis or description (max 160 chars for SEO) - following Rohith pattern
    let rawDescription = ''

    // Use investment thesis (what you're buying) as primary description
    if (investmentThesisText) {
      rawDescription = investmentThesisText
    } else if (description) {
      rawDescription = description
    } else if (subtitle) {
      rawDescription = subtitle
    } else {
      // Fallback: Create description from key details
      const details = []
      if (type) details.push(type)
      if (region) details.push(region)
      if (minInvestment) details.push(`Min: ${minInvestment}`)
      if (returnLow && returnHigh) {
        details.push(`${returnLow}-${returnHigh}% annual return`)
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
  // Fetch opportunity - returns PRE-STRINGIFIED data to avoid serialization issues
  // The async function stringifies the object internally, so only the string enters this scope
  const opportunityString = await getSharedOpportunity(params.opportunityId)

  if (!opportunityString) {
    notFound()
  }

  return <SharedOpportunityClient opportunityString={opportunityString} opportunityId={params.opportunityId} />
}
