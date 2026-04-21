import type { Metadata } from "next"

import { HomePageClientEnhancements } from "@/components/home-page-client-enhancements"
import { SplashLanding } from "@/components/splash-landing"

export const metadata: Metadata = {
  title: "HNWI Chronicles – Private Intelligence for Modern Wealth",
  description:
    "Private intelligence platform for modern wealth. Real-time market intelligence, exclusive opportunities, and AI-powered strategic planning for $1M+ net worth individuals.",
}

export default function HomePage() {
  return (
    <SplashLanding ambient={<HomePageClientEnhancements />} />
  )
}
