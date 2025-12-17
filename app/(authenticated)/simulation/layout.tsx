// app/(authenticated)/assessment/layout.tsx
// Layout with premium metadata for assessment pages

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Strategic Wealth DNA Assessment | HNWI Chronicles - Discover Your $10M+ Decision Pattern",
  description: "The only assessment calibrated against 1,850+ HNWI developments and 140K+ wealth movements. Discover if you're an Architect, Operator, or Observer. Used by verified HNWIs managing $10M-$100M+ portfolios. 10 scenarios. 8 minutes. Your exact wealth archetype.",
  keywords: "HNWI assessment, wealth DNA test, strategic archetype analysis, wealth psychology assessment, family office intelligence, ultra-high-net-worth profiling, investment personality test, wealth preservation strategy, Digital Twin simulation, crisis response modeling",
  authors: [{ name: "HNWI Chronicles Intelligence Division" }],
  creator: "HNWI Chronicles",
  publisher: "HNWI Chronicles - Crown Intelligence Platform",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Strategic Wealth DNA Assessment | Exclusive HNWI Intelligence",
    description: "Join the 0.1% HNWIs discovering their strategic archetype. Calibrated against 1,900+ intelligence briefs. See how you'd navigate $10M+ decisions, crisis scenarios, and global wealth shifts. Free for verified members.",
    type: "website",
    locale: "en_US",
    url: "https://app.hnwichronicles.com/assessment",
    siteName: "HNWI Chronicles",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles Strategic Assessment - Wealth DNA Analysis",
      },
      {
        url: "/images/assessment-preview.png",
        width: 1200,
        height: 630,
        alt: "Discover Your Strategic Archetype - Architect, Operator, or Observer",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@HNWIChronicles",
    creator: "@HNWIChronicles",
    title: "Strategic Wealth DNA Assessment",
    description: "The only assessment calibrated against real HNWI data. Discover your $10M+ decision pattern in 8 minutes.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://app.hnwichronicles.com/assessment",
  },
  category: "Wealth Intelligence",
  classification: "Strategic Assessment",
  other: {
    "og:rich_attachment": "true",
    "article:author": "HNWI Chronicles Intelligence Division",
    "article:section": "Strategic Assessment",
    "og:see_also": "https://app.hnwichronicles.com/dashboard",
    "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID || "",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}