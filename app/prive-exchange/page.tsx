// app/prive-exchange/page.tsx

import type { Metadata } from "next"
import { PriveExchangePageWrapper } from "./prive-exchange-page-wrapper"

export const metadata: Metadata = {
  title: "Privé Exchange | Exclusive Investment Opportunities - HNWI Chronicles",
  description: "Access exclusive, curated investment opportunities for high-net-worth individuals. Premium marketplace featuring strategic investments across global markets with comprehensive analysis and risk assessment.",
  keywords: ["exclusive investments", "private equity", "HNWI", "premium opportunities", "wealth management", "strategic investments"],
  openGraph: {
    title: "Privé Exchange | Exclusive Investment Opportunities",
    description: "Access exclusive, curated investment opportunities for high-net-worth individuals. Premium marketplace featuring strategic investments across global markets.",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
        width: 1200,
        height: 630,
        alt: "Privé Exchange - Exclusive Investment Opportunities",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privé Exchange | Exclusive Investment Opportunities",
    description: "Access exclusive, curated investment opportunities for high-net-worth individuals. Premium marketplace featuring strategic investments across global markets.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
  },
}

export default function Page() {
  return <PriveExchangePageWrapper />
}
