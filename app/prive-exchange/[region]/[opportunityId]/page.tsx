// app/prive-exchange/[region]/[opportunityId]/page.tsx

import type { Metadata } from "next"
import { getOpportunityById } from "@/lib/api"
import ClientPage from "./client"

interface PageProps {
  params: { region: string; opportunityId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { opportunityId } = params
  
  try {
    const opportunity = await getOpportunityById(opportunityId)
    
    if (!opportunity) {
      return {
        title: "Opportunity Not Found - Privé Exchange | HNWI Chronicles",
        description: "The requested investment opportunity could not be found. Explore other exclusive investment opportunities in our Privé Exchange.",
        openGraph: {
          title: "Opportunity Not Found - Privé Exchange",
          description: "The requested investment opportunity could not be found. Explore other exclusive investment opportunities in our Privé Exchange.",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: "Opportunity Not Found - Privé Exchange",
          description: "The requested investment opportunity could not be found. Explore other exclusive investment opportunities in our Privé Exchange.",
        },
      }
    }

    const title = `${opportunity.title} | Privé Exchange - HNWI Chronicles`
    const description = opportunity.description 
      ? `${opportunity.description.slice(0, 155)}${opportunity.description.length > 155 ? '...' : ''}`
      : `Exclusive ${opportunity.type || 'investment'} opportunity in ${opportunity.region}. ${opportunity.value ? `Investment size: ${opportunity.value}.` : ''} ${opportunity.expectedReturn ? `Target return: ${opportunity.expectedReturn}.` : ''}`

    return {
      title,
      description,
      keywords: [
        opportunity.type || "investment",
        opportunity.region,
        opportunity.country,
        "exclusive opportunity",
        "HNWI",
        "private investment",
        "wealth management"
      ].filter(Boolean),
      openGraph: {
        title: opportunity.title,
        description,
        type: "website",
        images: [
          {
            url: "/logo.png",
            width: 1200,
            height: 630,
            alt: `${opportunity.title} - Exclusive Investment Opportunity`,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: opportunity.title,
        description,
        images: ["/logo.png"],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for opportunity:', error)
    
    return {
      title: "Investment Opportunity - Privé Exchange | HNWI Chronicles",
      description: "Exclusive investment opportunity for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
      openGraph: {
        title: "Investment Opportunity - Privé Exchange",
        description: "Exclusive investment opportunity for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Investment Opportunity - Privé Exchange",
        description: "Exclusive investment opportunity for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
      },
    }
  }
}

export default function Page({
  params: { region, opportunityId },
}: PageProps) {
  return <ClientPage region={region} opportunityId={opportunityId} />
}

