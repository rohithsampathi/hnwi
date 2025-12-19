// app/shared-results/[sessionId]/page.tsx
// Server component for shared assessment results with premium metadata

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SharedResultsClient from "./shared-results-client";

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params
}: {
  params: { sessionId: string }
}): Promise<Metadata> {
  // Try to get some basic info about the assessment from the API
  let tierName = "Strategic";

  try {
    // Determine the correct base URL based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const apiBaseUrl = isProduction
      ? (process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://app.hnwichronicles.com')
      : 'http://localhost:3001'; // Use the running dev server port

    // Try to fetch assessment results to get tier for metadata
    const response = await fetch(`${apiBaseUrl}/api/assessment/results/${params.sessionId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.tier) {
        tierName = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
      }
    }
  } catch (error) {
    // Silently fall back to default tier name
  }

  // Premium HNWI-standard metadata
  const title = `${tierName} Wealth DNA Profile | Exclusive HNWI Assessment Results`;
  const description = `Discover how this ${tierName} archetype navigates $10M+ wealth decisions. Access their personalized opportunity map, Digital Twin simulation, and strategic intelligence gaps. Only for verified HNWIs.`;

  return {
    title,
    description,
    keywords: "HNWI assessment, wealth DNA, strategic archetype, wealth psychology, ultra-high-net-worth, family office intelligence, wealth preservation strategy, investment DNA profile",
    authors: [{ name: "HNWI Chronicles Intelligence Division" }],
    creator: "HNWI Chronicles",
    publisher: "HNWI Chronicles",
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      title: `${tierName} Wealth DNA | HNWI Strategic Profile`,
      description: `This ${tierName} profile reveals how ultra-wealthy individuals with this DNA pattern identify opportunities worth $100K-$10M+. View their command centre intelligence map.`,
      type: "article",
      url: `https://app.hnwichronicles.com/shared-results/${params.sessionId}`,
      siteName: "HNWI Chronicles",
      locale: "en_US",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: `${tierName} Wealth DNA Profile - HNWI Chronicles`,
          type: "image/png",
        }
      ],
      article: {
        publishedTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        section: "Wealth Intelligence",
        tags: ["HNWI", "Wealth DNA", tierName, "Strategic Assessment", "Ultra-Wealthy"],
      }
    },
    twitter: {
      card: "summary_large_image",
      site: "@HNWIChronicles",
      creator: "@HNWIChronicles",
      title: `${tierName} Wealth DNA Profile`,
      description: `Exclusive: How ${tierName} archetypes identify $100K-$10M+ opportunities. View their strategic DNA analysis.`,
      images: {
        url: "/logo.png",
        alt: `${tierName} Wealth DNA - HNWI Chronicles`
      }
    },
    alternates: {
      canonical: `https://app.hnwichronicles.com/shared-results/${params.sessionId}`,
    },
    category: "Finance",
    classification: "Wealth Intelligence",
    other: {
      "article:author": "HNWI Chronicles Intelligence Division",
      "article:section": "Strategic Assessment",
      "og:rich_attachment": "true",
      "og:see_also": "https://app.hnwichronicles.com/simulation",
      "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID || "",
    }
  };
}

// Server component
export default function SharedResultsPage({
  params
}: {
  params: { sessionId: string }
}) {
  // Pass through to client component
  // The client component handles all the data fetching and display
  return <SharedResultsClient />;
}