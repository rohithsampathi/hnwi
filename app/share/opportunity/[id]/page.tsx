// app/share/opportunity/[id]/page.tsx
// Server component for shared investment opportunities

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Server-side function to fetch shared opportunity
async function getSharedOpportunity(opportunityId: string): Promise<Opportunity | null> {
  try {
    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'

    // In development: use localhost Next.js server (which has the API routes)
    // In production: use the production URL
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'  // Use Next.js dev server, not backend

    console.log(`[Share Page] Environment: ${process.env.NODE_ENV}`)
    console.log(`[Share Page] Fetching opportunity ${opportunityId} from ${apiBaseUrl}`)

    // Call the Next.js API route (works in both dev and production)
    const response = await fetch(`${apiBaseUrl}/api/opportunities/public/${opportunityId}`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.opportunity) {
        console.log(`[Share Page] Successfully fetched opportunity ${opportunityId}`)
        return data.opportunity as Opportunity
      }
    }

    console.error(`[Share Page] Failed to fetch opportunity: ${response.status} ${response.statusText}`)

    // Try to get error details
    try {
      const errorData = await response.json()
      console.error(`[Share Page] Error details:`, errorData)
    } catch (e) {
      // Ignore JSON parse errors
    }

    return null
  } catch (error) {
    console.error('[Share Page] Error fetching shared opportunity:', error)
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const opportunity = await getSharedOpportunity(params.id)

  if (!opportunity) {
    return {
      title: "Opportunity Not Found | HNWI Chronicles",
      description: "This investment opportunity is no longer available."
    }
  }

  const title = `${opportunity.title} | Privé Exchange Off Market`
  const description = opportunity.description || `Exclusive ${opportunity.type || 'investment'} opportunity available through Privé Exchange.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://app.hnwichronicles.com/share/opportunity/${params.id}`,
      siteName: "HNWI Chronicles",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"]
    }
  }
}

// Server component
export default async function SharedOpportunityPage({
  params
}: {
  params: { id: string }
}) {
  const opportunity = await getSharedOpportunity(params.id)

  if (!opportunity) {
    notFound()
  }

  return <SharedOpportunityClient opportunity={opportunity} opportunityId={params.id} />
}
