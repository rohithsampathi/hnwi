// app/share/opportunity/[id]/page.tsx
// Server component for shared investment opportunities

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import SharedOpportunityClient from "./shared-opportunity-client"
import type { Opportunity } from "@/lib/api"

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Extract clean UUID from potentially malformed IDs (e.g., "UUID Check out this..." from navigator.share)
function extractUUID(rawId: string): string | null {
  const decoded = decodeURIComponent(rawId)
  const match = decoded.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
  return match ? match[1] : null
}

// Server-side function to fetch shared opportunity
async function getSharedOpportunity(opportunityId: string): Promise<Opportunity | null> {
  try {
    const cleanId = extractUUID(opportunityId)
    if (!cleanId) return null

    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production'

    // In development: use localhost Next.js server (which has the API routes)
    // In production: use the production URL
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3000'  // Use Next.js dev server, not backend


    // Call the Next.js API route (works in both dev and production)
    const response = await fetch(`${apiBaseUrl}/api/opportunities/public/${cleanId}`, {
      cache: 'no-store', // Always get fresh data for social crawlers
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.opportunity) {
        return data.opportunity as Opportunity
      }
    }


    // Try to get error details
    try {
      const errorData = await response.json()
    } catch (e) {
      // Ignore JSON parse errors
    }

    return null
  } catch (error) {
    return null
  }
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const cleanId = extractUUID(params.id)
  const opportunity = cleanId ? await getSharedOpportunity(params.id) : null

  if (!opportunity) {
    return {
      title: "Opportunity Not Found | HNWI Chronicles",
      description: "This investment opportunity is no longer available."
    }
  }

  const title = `${opportunity.title} | Privé Exchange Off Market`
  const description = opportunity.description || `Exclusive ${opportunity.type || 'investment'} opportunity available through Privé Exchange.`

  // Use absolute URL with cache-busting for social media OG images
  const siteUrl = "https://app.hnwichronicles.com"
  const ogImage = `${siteUrl}/logo.png?v=20241220e`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl}/share/opportunity/${cleanId}`,
      siteName: "HNWI Chronicles",
      images: [
        {
          url: ogImage,
          width: 650,
          height: 650,
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  }
}

// Server component
export default async function SharedOpportunityPage({
  params
}: {
  params: { id: string }
}) {
  const cleanId = extractUUID(params.id)
  if (!cleanId) notFound()

  const opportunity = await getSharedOpportunity(params.id)

  if (!opportunity) {
    notFound()
  }

  return <SharedOpportunityClient opportunity={opportunity} opportunityId={cleanId} />
}
