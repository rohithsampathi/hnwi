// app/share/opportunity/[opportunityId]/page.tsx
// Server component for shared investment opportunities with dynamic metadata

import { Metadata } from "next"
import { notFound } from "next/navigation"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function to fetch opportunity
async function getOpportunity(opportunityId: string): Promise<Opportunity | null> {
  try {
    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'

    console.log(`[Share Opportunity] Fetching opportunity ${opportunityId} from ${apiBaseUrl}`)

    const response = await fetch(`${apiBaseUrl}/api/opportunities`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const opportunities = await response.json()
      const opportunity = opportunities.find((o: Opportunity) => o.id === opportunityId)

      if (opportunity) {
        console.log(`[Share Opportunity] Successfully fetched opportunity ${opportunityId}`)
        return opportunity
      }
    }

    console.error(`[Share Opportunity] Opportunity not found: ${opportunityId}`)
    return null
  } catch (error) {
    console.error('[Share Opportunity] Error fetching opportunity:', error)
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
      card: 'summary_large_image',
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
      console.log(`[Share Opportunity] No opportunity found for ${params.opportunityId}, using default metadata`)
      return defaultMetadata
    }

    // Create dynamic description from opportunity data
    const descriptionParts = []

    // Use investment thesis or description (prioritize investment thesis)
    if (opportunity.investment_thesis?.what_youre_buying) {
      descriptionParts.push(opportunity.investment_thesis.what_youre_buying)
    } else if (opportunity.description) {
      descriptionParts.push(opportunity.description)
    } else {
      // If no thesis or description, use title with type
      descriptionParts.push(`${opportunity.title}${opportunity.type ? ` - ${opportunity.type}` : ''}`)
    }

    // Add key metrics
    const metrics = []
    if (opportunity.minimum_investment_display || opportunity.value) {
      metrics.push(`Min: ${opportunity.minimum_investment_display || opportunity.value}`)
    }
    if (opportunity.expected_return_annual_low && opportunity.expected_return_annual_high) {
      metrics.push(`${opportunity.expected_return_annual_low}-${opportunity.expected_return_annual_high}% annual return`)
    } else if (opportunity.expectedReturn) {
      metrics.push(`${opportunity.expectedReturn} return`)
    }
    if (opportunity.region) {
      metrics.push(opportunity.region)
    }

    if (metrics.length > 0) {
      descriptionParts.push(metrics.join(' · '))
    }

    const metaDescription = descriptionParts.join(' | ')

    // Create dynamic title
    const metaTitle = `${opportunity.title}${opportunity.type ? ` - ${opportunity.type}` : ''}`

    console.log(`[Share Opportunity] Generated metadata for ${params.opportunityId}:`, {
      title: metaTitle,
      description: metaDescription.substring(0, 100) + '...'
    })

    return {
      title: `${metaTitle} | HNWI Chronicles`,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: shareUrl,
        siteName: 'HNWI Chronicles',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${opportunity.title} - HNWI Chronicles`,
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [imageUrl],
      },
      alternates: {
        canonical: shareUrl
      }
    }
  } catch (error) {
    console.error('[Share Opportunity] Error generating metadata:', error)
    return defaultMetadata
  }
}

// Server component
export default async function SharedOpportunityPage({
  params
}: {
  params: { opportunityId: string }
}) {
  const opportunity = await getOpportunity(params.opportunityId)

  if (!opportunity) {
    notFound()
  }

  return <SharedOpportunityClient opportunity={opportunity} opportunityId={params.opportunityId} />
}
