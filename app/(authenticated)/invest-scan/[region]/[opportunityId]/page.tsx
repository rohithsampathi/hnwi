
// app/invest-scan/[region]/[opportunityId]/page.tsx

import type { Metadata } from "next"
import { OpportunityPage } from "@/components/pages/opportunity-page"
import { getOpportunityById } from "@/lib/api"

interface PageProps {
  params: { region: string; opportunityId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { opportunityId, region } = params
  
  try {
    const opportunity = await getOpportunityById(opportunityId)
    
    if (!opportunity) {
      return {
        title: "Opportunity Not Found - Invest Scan | HNWI Chronicles",
        description: "The requested investment opportunity could not be found. Discover other investment opportunities through our global Invest Scan platform.",
        openGraph: {
          title: "Opportunity Not Found - Invest Scan",
          description: "The requested investment opportunity could not be found. Discover other investment opportunities through our global Invest Scan platform.",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: "Opportunity Not Found - Invest Scan",
          description: "The requested investment opportunity could not be found. Discover other investment opportunities through our global Invest Scan platform.",
        },
      }
    }

    // Determine the base URL for canonical and og:url
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"
    
    // Create a more suitable OG image URL with fallback
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(opportunity.title)}&type=${encodeURIComponent(opportunity.type || 'Investment')}`
    const fallbackImageUrl = `${baseUrl}/logo.png`

    const title = `${opportunity.title} | Invest Scan - HNWI Chronicles`
    const description = opportunity.description 
      ? `${opportunity.description.slice(0, 155)}${opportunity.description.length > 155 ? '...' : ''}`
      : `Investment opportunity in ${opportunity.region}. ${opportunity.type ? `Asset type: ${opportunity.type}.` : ''} ${opportunity.value ? `Investment size: ${opportunity.value}.` : ''} ${opportunity.expectedReturn ? `Target return: ${opportunity.expectedReturn}.` : ''}`

    return {
      title,
      description,
      keywords: [
        opportunity.type || "investment",
        opportunity.region,
        opportunity.country,
        "investment opportunity",
        "HNWI",
        "global markets",
        "invest scan"
      ].filter(Boolean),
      openGraph: {
        title: opportunity.title,
        description,
        url: `${baseUrl}/invest-scan/${region}/${opportunityId}`,
        siteName: "HNWI Chronicles",
        type: "website",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: opportunity.title,
          },
          {
            url: fallbackImageUrl,
            width: 1200,
            height: 630,
            alt: opportunity.title,
          }
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: opportunity.title,
        description,
        images: [ogImageUrl],
      },
      alternates: {
        canonical: `${baseUrl}/invest-scan/${region}/${opportunityId}`,
      },
    }
  } catch (error) {
    
    return {
      title: "Investment Opportunity - Invest Scan | HNWI Chronicles",
      description: "Discover global investment opportunities with comprehensive market analysis and strategic insights for high-net-worth individuals.",
      openGraph: {
        title: "Investment Opportunity - Invest Scan",
        description: "Discover global investment opportunities with comprehensive market analysis and strategic insights for high-net-worth individuals.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Investment Opportunity - Invest Scan",
        description: "Discover global investment opportunities with comprehensive market analysis and strategic insights for high-net-worth individuals.",
      },
    }
  }
}

export default function Page({
  params: { region, opportunityId },
}: PageProps) {
  return <OpportunityPage region={region} opportunityId={opportunityId} />
}

