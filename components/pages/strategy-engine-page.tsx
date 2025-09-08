// components/pages/strategy-engine-page.tsx

"use client"

import { TacticsLab } from "@/components/tactics-lab"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useEffect } from "react"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Beaker } from "lucide-react"
import { motion } from "framer-motion"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { MetaTags } from "../meta-tags"
import { PageWrapper } from "@/components/ui/page-wrapper"

export function StrategyEnginePage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { markStepAsCompleted } = useOnboarding()

  useEffect(() => {
    markStepAsCompleted("strategyEngine")
  }, [markStepAsCompleted])

  const pulseAnimation = {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  }

  return (
    <>
      <MetaTags
        title="Tactics Lab: Strategic Intelligence Engine | HNWI Chronicles"
        description="Where smart wealth goes for strategic intelligence. AI-powered analysis engine delivering institutional-grade insights and strategic implications before markets catch up."
        image="https://app.hnwichronicles.com/images/tactics-lab-og.png"
        url="https://app.hnwichronicles.com/tactics-lab"
      />
        <TacticsLab />
    </>
  )
}

