// app/(authenticated)/assessment/layout.tsx
// Layout with premium metadata for assessment pages

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Strategic Wealth DNA Simulation",
  description: "Calibrated against 1,850+ HNWI developments and 92K+ wealth signals — discover your strategic archetype (Architect, Operator, or Observer). See how you'd navigate $10M+ decisions and crisis scenarios. 10 scenarios. 10 minutes.",
  keywords: [
    "HNWI simulation",
    "wealth DNA test",
    "strategic archetype analysis",
    "wealth psychology simulation",
    "family office intelligence",
    "ultra-high-net-worth profiling",
    "investment personality test",
    "wealth preservation strategy",
    "Digital Twin simulation",
    "crisis response modeling",
  ],
  authors: [{ name: "Montaigne Smart Business Solutions Pvt Ltd" }],
  creator: "Montaigne Smart Business Solutions Pvt Ltd",
  publisher: "Montaigne Smart Business Solutions Pvt Ltd",
  category: "Finance",
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
    type: "website",
    locale: "en_US",
    url: "https://app.hnwichronicles.com/simulation",
    siteName: "HNWI Chronicles",
    title: "Strategic Wealth DNA Simulation",
    description: "Calibrated against 1,850+ HNWI developments — discover your strategic archetype and see how you'd navigate $10M+ decisions, crisis scenarios, and global wealth shifts.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles — Strategic Wealth DNA Simulation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    title: "Strategic Wealth DNA Simulation",
    description: "Calibrated against 1,850+ HNWI developments — discover your strategic archetype and see how you'd navigate $10M+ decisions in 10 minutes.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/simulation",
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