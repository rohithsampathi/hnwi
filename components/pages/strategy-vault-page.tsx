// components/pages/strategy-vault-page.tsx

"use client"

import { MarketIntelligenceDashboard } from "@/components/market-intelligence-dashboard"
import { Globe } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { MetaTags } from "../meta-tags"
import { PageWrapper } from "@/components/ui/page-wrapper"

export function StrategyVaultPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { theme } = useTheme()

  return (
    <>
      <MetaTags
        title="HNWI World: Private Wealth Intelligence, Every Day | HNWI Chronicles"
        description="Morning intelligence for the top 1%. What 312 family offices are discussing privately."
        image="https://app.hnwichronicles.com/images/hnwi-world-og.png"
        url="https://app.hnwichronicles.com/hnwi-world"
      />
      <MarketIntelligenceDashboard onNavigate={onNavigate} />
    </>
  )
}