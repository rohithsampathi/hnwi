// app/invest-scan/page.tsx

import type { Metadata } from "next"
import { InvestScanPage } from "@/components/pages/invest-scan-page"

export const metadata: Metadata = {
  title: "Invest Scan",
  description: "Discover curated investment opportunities across global markets with interactive geographic analysis — explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
  keywords: [
    "global investments",
    "investment discovery",
    "HNWI opportunities",
    "market analysis",
    "geographic investing",
    "emerging markets",
    "alternative assets",
    "real assets",
  ],
  authors: [{ name: "Montaigne Smart Business Solutions Pvt Ltd" }],
  creator: "Montaigne Smart Business Solutions Pvt Ltd",
  publisher: "Montaigne Smart Business Solutions Pvt Ltd",
  category: "Finance",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HNWI Chronicles",
    title: "Invest Scan",
    description: "Discover curated investment opportunities across global markets with interactive geographic analysis — explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HNWI Chronicles — Invest Scan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    title: "Invest Scan",
    description: "Discover curated investment opportunities across global markets with interactive geographic analysis — explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "/invest-scan",
  },
}

export default function Page() {
  return <InvestScanPage />
}
