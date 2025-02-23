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
        title="Tactics Lab | HNWI Chronicles"
        description="Experiment with AI-powered strategies in the Tactics Lab. Develop and test cutting-edge wealth management tactics for high-net-worth individuals."
        image="https://hnwichronicles.com/tactics-lab-og-image.jpg" // Replace with actual image URL
        url="https://hnwichronicles.com/tactics-lab" // Replace with actual URL
      />
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <motion.div animate={pulseAnimation}>
              <Beaker className="w-6 h-6 text-primary" />
            </motion.div>
            <Heading2 className="font-heading text-2xl">Tactics Lab</Heading2>
            <Badge variant="secondary">Beta</Badge>
            <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight font-body">
              Experiment. Master. Dominate.
            </Paragraph>
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

