// app/share/opportunity/[id]/shared-opportunity-client.tsx
// Client component for shared investment opportunities
// Receives opportunity data from server and renders with shared expanded content component

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/contexts/theme-context"
import { OpportunityExpandedContent } from "@/components/opportunity-expanded-content"
import {
  Share2,
  Check
} from "lucide-react"
import type { Opportunity } from "@/lib/api"

interface SharedOpportunityClientProps {
  opportunity: Opportunity
  opportunityId: string
}

export default function SharedOpportunityClient({ opportunity: initialOpportunity, opportunityId }: SharedOpportunityClientProps) {
  const { theme } = useTheme()
  const [isCopied, setIsCopied] = useState(false)

  // Enrich opportunity with Victor analysis data if needed
  const opportunity = React.useMemo(() => {
    if ((initialOpportunity as any).victor_analysis) {
      const va = (initialOpportunity as any).victor_analysis
      return {
        ...initialOpportunity,
        victor_score: va.score || va.victor_score,
        victor_rating: va.rating || va.victor_rating,
        victor_reasoning: va.verdict || va.one_line_thesis || va.hnwi_thesis_alignment || va.reasoning,
        victor_action: va.verdict || va.one_line_thesis,
        confidence_level: va.confidence || va.confidence_level,
        pros: va.pros,
        cons: va.cons,
        risk_assessment: va.risk_assessment,
        opportunity_window: va.opportunity_window,
        strategic_insights: va.pattern_match || va.hnwi_thesis_alignment,
        hnwi_alignment: va.hnwi_thesis_alignment || va.pattern_match
      }
    }
    return initialOpportunity
  }, [initialOpportunity])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Same as main app */}
      <div className="sticky top-0 z-50">
        <Header
          showBackButton={false}
          onNavigate={(route) => {
            if (route === "dashboard") {
              window.location.href = "https://www.hnwichronicles.com"
            }
          }}
        >
          <ThemeToggle />
          <Button
            onClick={handleShare}
            variant={isCopied ? "default" : "outline"}
            size="sm"
            className={`gap-2 hidden sm:flex transition-all ${
              isCopied
                ? theme === "light"
                  ? "bg-black text-white border-black"
                  : "bg-primary text-primary-foreground"
                : theme === "light"
                  ? "hover:bg-black hover:text-white hover:border-black"
                  : ""
            }`}
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3" />
                Link Copied
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                Share
              </>
            )}
          </Button>
        </Header>
      </div>

      {/* Main Content - Premium Intelligence Briefing */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        {/* HNWI Chronicles Brand Mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Privé Exchange Opportunity
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title Section */}
          <div className="text-center space-y-3">
            <h1 className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight ${theme === "dark" ? "text-white" : "text-black"}`}>
              {opportunity.title}
            </h1>
            {opportunity.type && (
              <div className="flex justify-center">
                <PremiumBadge className="font-semibold px-4 py-1.5 text-xs tracking-wider">
                  {opportunity.type}
                </PremiumBadge>
              </div>
            )}
          </div>

          {/* Use shared expanded content component (same as Privé Exchange) */}
          <OpportunityExpandedContent opportunity={opportunity} scoring={null} />

          {/* Legal Disclaimer */}
          <div className="pt-8 text-center border-t border-border/30 mt-8">
            <p className="text-xs text-muted-foreground">
              Information only · Not broker-dealer advice · Members access only
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
