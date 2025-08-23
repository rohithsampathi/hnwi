// components/pages/strategy-vault-page.tsx

"use client"

import { Layout } from "@/components/layout/layout"
import { MarketIntelligenceDashboard } from "@/components/market-intelligence-dashboard"
import { Globe } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Heading2 } from "@/components/ui/typography"
import { MetaTags } from "../meta-tags"

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
      <Layout
        currentPage="strategy-vault"
        title={
          <div className="flex items-center space-x-2">
            <Globe className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
            <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>HNWI World</Heading2>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <div className="font-body">
          <div className="w-full mb-4 overflow-hidden">
            <div className="px-4 py-2 -mt-2">
              <p className="text-muted-foreground text-base leading-tight">
                What you need to know before your wealth advisor calls
              </p>
            </div>
            
            {/* Unified Market Intelligence Dashboard */}
            <div className="px-4">
              <MarketIntelligenceDashboard onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}