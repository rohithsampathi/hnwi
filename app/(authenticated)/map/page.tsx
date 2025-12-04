// app/(authenticated)/map/page.tsx

import type { Metadata } from "next"
import { MapPage } from "@/components/pages/map-page"

export const metadata: Metadata = {
  title: "Global Opportunity Map | HNWI Chronicles",
  description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns across markets worldwide.",
  keywords: ["global investments", "opportunity map", "HNWI assets", "world map", "investment geography", "wealth mapping"],
  openGraph: {
    title: "Global Opportunity Map | HNWI Chronicles",
    description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns across markets worldwide.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Global Opportunity Map - HNWI Chronicles",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Opportunity Map | HNWI Chronicles",
    description: "Interactive global map of exclusive investment opportunities, Crown Vault assets, and HNWI intelligence patterns across markets worldwide.",
    images: ["/logo.png"],
  },
}

export default function Page() {
  return <MapPage />
}
