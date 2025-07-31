
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
        type: "website",
        images: [
          {
            url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
            width: 1200,
            height: 630,
            alt: `${opportunity.title} - Investment Opportunity`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: opportunity.title,
        description,
        images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for opportunity:', error)
    
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

