// app/share/opportunity/[id]/page.tsx
// Server component for shared investment opportunities

import { notFound } from "next/navigation"
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

// Metadata disabled - was causing 500 error
// Will add back after page works

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
