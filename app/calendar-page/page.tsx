// app/calendar-page/page.tsx

import type { Metadata } from "next"
import { CalendarPageWrapper } from "./calendar-page-wrapper"

export const metadata: Metadata = {
  title: "Social Hub | Elite Events & Networking - HNWI Chronicles",
  description: "Access exclusive high-net-worth events, elite networking opportunities, and premium social gatherings. Connect with fellow HNWIs at carefully curated events worldwide.",
  keywords: ["HNWI events", "elite networking", "exclusive events", "high-net-worth social", "premium gatherings", "luxury events"],
  openGraph: {
    title: "Social Hub | Elite Events & Networking",
    description: "Access exclusive high-net-worth events, elite networking opportunities, and premium social gatherings. Connect with fellow HNWIs at carefully curated events worldwide.",
    type: "website",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png",
        width: 1200,
        height: 630,
        alt: "Social Hub - Elite Events & Networking",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Hub | Elite Events & Networking",
    description: "Access exclusive high-net-worth events, elite networking opportunities, and premium social gatherings. Connect with fellow HNWIs at carefully curated events worldwide.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"],
  },
}

export default function Page() {
  return <CalendarPageWrapper />
}