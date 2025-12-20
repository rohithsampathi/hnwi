// app/(authenticated)/map/page.tsx

import type { Metadata } from "next"
import { MapPage } from "@/components/pages/map-page"

export const metadata: Metadata = {
  title: "Global Opportunity Map",
  description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns — tracked signals across markets worldwide.",
  keywords: [
    "global investments",
    "opportunity map",
    "HNWI assets",
    "world map",
    "investment geography",
    "wealth mapping",
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
    title: "Global Opportunity Map",
    description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns — tracked signals across markets worldwide.",
    images: [
      {
        url: "https://app.hnwichronicles.com/logo.png?v=20241220",
        width: 1024,
        height: 1024,
        alt: "HNWI Chronicles — Global Opportunity Map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hnwichronicles",
    creator: "@hnwichronicles",
    title: "Global Opportunity Map",
    description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns — tracked signals across markets worldwide.",
    images: ["https://app.hnwichronicles.com/logo.png?v=20241220"],
  },
  alternates: {
    canonical: "/map",
  },
}

export default function Page() {
  return <MapPage />
}
