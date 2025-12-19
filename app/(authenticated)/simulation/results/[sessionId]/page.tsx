// app/(authenticated)/simulation/results/[sessionId]/page.tsx
// Server component for simulation results with premium metadata

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AssessmentResultsClient from "./assessment-results-client";

// Force dynamic rendering for metadata generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate dynamic metadata for assessment results
export async function generateMetadata({
  params
}: {
  params: { sessionId: string }
}): Promise<Metadata> {
  const { sessionId } = params;

  // Use default values - client will update title dynamically via usePageTitle
  // This prevents server-side fetch from interfering with SSE completion
  const tierName = "Strategic";
  const confidenceScore = 85;

  // Premium HNWI-standard metadata for results page
  const title = `Your ${tierName} DNA Results | HNWI Strategic Assessment Complete`;
  const description = `Congratulations. You're a verified ${tierName} archetype. ${confidenceScore}% confidence score. View your personalized opportunity map, Digital Twin crisis simulation, and strategic gaps. Download your intelligence brief.`;

  return {
    title,
    description,
    keywords: `${tierName} archetype, HNWI assessment results, wealth DNA profile, strategic classification, Digital Twin simulation, personalized opportunities, wealth psychology, investment personality`,
    authors: [{ name: "HNWI Chronicles Intelligence Division" }],
    creator: "HNWI Chronicles",
    publisher: "HNWI Chronicles - Crown Intelligence Platform",
    robots: {
      index: false, // Private results page
      follow: false,
      noarchive: true,
      "max-snippet": -1,
    },
    openGraph: {
      title: `${tierName} Strategic DNA Profile | HNWI Assessment Complete`,
      description: `Verified ${tierName} archetype with ${confidenceScore}% confidence. Access your personalized opportunities, Digital Twin simulation, and strategic intelligence gaps.`,
      type: "website",
      url: `https://app.hnwichronicles.com/simulation/results/${sessionId}`,
      siteName: "HNWI Chronicles",
      locale: "en_US",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: `${tierName} DNA Profile - HNWI Chronicles Assessment Results`,
          type: "image/png",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@HNWIChronicles",
      creator: "@HNWIChronicles",
      title: `${tierName} DNA Profile Unlocked`,
      description: `Strategic archetype identified. ${confidenceScore}% confidence. View personalized opportunities and Digital Twin simulation.`,
      images: {
        url: "/logo.png",
        alt: `${tierName} DNA - HNWI Chronicles`
      }
    },
    alternates: {
      canonical: `https://app.hnwichronicles.com/simulation/results/${sessionId}`,
    },
    category: "Wealth Intelligence",
    classification: "Simulation Results",
    other: {
      "article:author": "HNWI Chronicles Intelligence Division",
      "article:section": "Strategic Simulation Results",
      "og:rich_attachment": "true",
      "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID || "",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

// Server component
export default function AssessmentResultsPage({
  params
}: {
  params: { sessionId: string }
}) {
  // Pass through to client component
  // The client component handles all the data fetching and display
  return <AssessmentResultsClient />;
}