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
        title: "Opportunity Not Found | HNWI Chronicles",
        description: "The requested investment opportunity could not be found."
      }
    }
    
    // Determine the base URL for canonical and og:url
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://app.hnwichronicles.com"
    
    return {
      title: opportunity.title,
      description: opportunity.description || "Exclusive investment opportunity for high-net-worth individuals.",
      openGraph: {
        title: opportunity.title,
        description: opportunity.description || "Exclusive investment opportunity for high-net-worth individuals.",
        url: `${baseUrl}/opportunity/${id}`,
        siteName: "HNWI Chronicles",
        type: "website",
        images: [{
          url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png", // Default image
          width: 1200,
          height: 630,
          alt: opportunity.title,
        }],
      },
      twitter: {
        card: "summary_large_image",
        title: opportunity.title,
        description: opportunity.description || "Exclusive investment opportunity for high-net-worth individuals.",
        images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
      },
      alternates: {
        canonical: `${baseUrl}/opportunity/${id}`,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
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