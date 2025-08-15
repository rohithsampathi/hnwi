// app/opportunity/[id]/page.tsx

import { Metadata } from "next"
import { getOpportunityById } from "@/lib/api"
import ClientPage from "./client"

// Generate dynamic metadata based on the opportunity
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const id = params.id
  
  try {
    // Fetch the opportunity data
    const opportunity = await getOpportunityById(id)
    
    if (!opportunity) {
      return {
        title: "Investment Opportunity - HNWI Chronicles",
        description: "Explore exclusive investment opportunities for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
        openGraph: {
          title: "Investment Opportunity - HNWI Chronicles",
          description: "Explore exclusive investment opportunities for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
          type: "website",
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"}/logo.png`,
              width: 1200,
              height: 630,
              alt: "HNWI Chronicles - Investment Opportunities",
              type: "image/png",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: "Investment Opportunity - HNWI Chronicles",
          description: "Explore exclusive investment opportunities for high-net-worth individuals. Access premium deals with comprehensive analysis and risk assessment.",
          images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"}/logo.png`],
        },
      }
    }
    
    // Determine the base URL for canonical and og:url
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"
    
    // Create a more suitable OG image URL with fallback
    const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(opportunity.title)}&type=${encodeURIComponent(opportunity.type || 'Investment')}`
    const fallbackImageUrl = `${baseUrl}/logo.png`
    
    const title = `${opportunity.title} | HNWI Chronicles`
    const description = opportunity.description 
      ? `${opportunity.description.slice(0, 155)}${opportunity.description.length > 155 ? '...' : ''}`
      : "Exclusive investment opportunity for high-net-worth individuals."

    return {
      title,
      description,
      openGraph: {
        title: opportunity.title,
        description,
        url: `${baseUrl}/opportunity/${id}`,
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
        canonical: `${baseUrl}/opportunity/${id}`,
      },
    }
  } catch (error) {
    return {
      title: "Investment Opportunity | HNWI Chronicles",
      description: "Explore exclusive investment opportunities for high-net-worth individuals.",
    }
  }
}

// Server component that renders the client component
export default function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  return <ClientPage id={id} />
}