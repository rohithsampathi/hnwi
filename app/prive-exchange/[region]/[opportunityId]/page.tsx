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

    // Determine the base URL for canonical and og:url
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"
    
    // Create a more suitable OG image URL with fallback
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(opportunity.title)}&type=${encodeURIComponent(opportunity.type || 'Investment')}`
    const fallbackImageUrl = `${baseUrl}/logo.png`

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
        url: `${baseUrl}/prive-exchange/${region}/${opportunityId}`,
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
        canonical: `${baseUrl}/prive-exchange/${region}/${opportunityId}`,
      },
    }
  } catch (error) {
    
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

