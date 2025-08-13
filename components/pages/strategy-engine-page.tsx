// components/pages/strategy-engine-page.tsx

"use client"

import { TacticsLab } from "@/components/tactics-lab"
import { Layout } from "@/components/layout/layout"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Beaker } from "lucide-react"
import { motion } from "framer-motion"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "../meta-tags"

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
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <motion.div animate={pulseAnimation}>
              <Beaker className="w-6 h-6 text-primary" />
            </motion.div>
            <Heading2 className="font-heading text-2xl">Tactics Lab</Heading2>
            <Badge variant="secondary">Beta</Badge>
            <p className="text-muted-foreground text-base leading-tight -mt-1">
              Experiment. Master. Dominate.
            </p>
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <TacticsLab />
      </Layout>
    </>
  )
}

