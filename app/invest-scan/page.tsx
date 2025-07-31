// app/invest-scan/page.tsx

import type { Metadata } from "next"
import { InvestScanPage } from "@/components/pages/invest-scan-page"

export const metadata: Metadata = {
  title: "Invest Scan | Global Investment Discovery - HNWI Chronicles",
  description: "Discover investment opportunities across global markets with interactive geographic analysis. Explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
  keywords: ["global investments", "investment discovery", "HNWI opportunities", "market analysis", "geographic investing", "emerging markets"],
  openGraph: {
    title: "Invest Scan | Global Investment Discovery",
    description: "Discover investment opportunities across global markets with interactive geographic analysis. Explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
        width: 1200,
        height: 630,
        alt: "Invest Scan - Global Investment Discovery",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invest Scan | Global Investment Discovery",
    description: "Discover investment opportunities across global markets with interactive geographic analysis. Explore emerging markets, developed economies, and strategic investment regions tailored for HNWIs.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
  },
}

export default function Page() {
  return <InvestScanPage />
}
