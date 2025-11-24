// app/share/opportunity/[id]/shared-opportunity-client.tsx
// Client component for shared investment opportunities
// Receives opportunity data from server and renders with shared expanded content component

"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/contexts/theme-context"
import { OpportunityExpandedContent } from "@/components/opportunity-expanded-content"
import {
  Lock,
  Share2,
  Sparkles,
  Check,
  X
} from "lucide-react"
import type { Opportunity } from "@/lib/api"

// Access gate component for non-authenticated users
function AccessGate({ onGetAccess, onClose }: { onGetAccess: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-md p-8 text-center space-y-6 bg-card rounded-xl border border-border shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Premium Access Required</h2>
          <p className="text-muted-foreground">
            Join HNWI Chronicles to express interest and access exclusive investment opportunities.
          </p>
        </div>

        <Button
          onClick={onGetAccess}
          className="w-full gap-2"
          size="lg"
        >
          <Sparkles className="h-4 w-4" />
          View Membership Plans
        </Button>
      </div>
    </motion.div>
  )
}

interface SharedOpportunityClientProps {
  opportunity: Opportunity
  opportunityId: string
}

export default function SharedOpportunityClient({ opportunity: initialOpportunity, opportunityId }: SharedOpportunityClientProps) {
  const { theme } = useTheme()
  const [showAccessGate, setShowAccessGate] = useState(false)
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

  const handleGetAccess = () => {
    window.open("https://www.hnwichronicles.com/pricing", "_blank")
  }

  const handleBack = () => {
    window.location.href = "https://www.hnwichronicles.com"
  }

  const handleExpressInterest = () => {
    setShowAccessGate(true)
  }

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
      {/* Access Gate Overlay */}
      <AnimatePresence>
        {showAccessGate && (
          <AccessGate
            onGetAccess={handleGetAccess}
            onClose={() => setShowAccessGate(false)}
          />
        )}
      </AnimatePresence>

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
          <Button
            onClick={handleGetAccess}
            size="sm"
            className="gap-2"
          >
            <Lock className="h-3 w-3" />
            Get Access
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
          {/* Final Section: Express Interest */}
          <div className="space-y-8 pt-4">
            {/* Divider */}
            <div className="border-t border-border/30"></div>

            {/* CTA */}
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                  Limited Allocation Available
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Access to this opportunity requires membership. Express interest to receive allocation details.
                </p>
              </div>

              <Button
                onClick={handleExpressInterest}
                size="lg"
                className="px-10 py-6 text-base font-semibold"
                style={{
                  background: theme === "dark"
                    ? "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)"
                    : "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)",
                  color: theme === "dark" ? "#000" : "#FFF",
                  boxShadow: theme === "dark"
                    ? "0 4px 20px rgba(218, 165, 32, 0.3)"
                    : "0 4px 20px rgba(192, 192, 192, 0.3)"
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Express Interest
              </Button>

              {/* Legal Disclaimer */}
              <div className="pt-6">
                <p className="text-xs text-muted-foreground">
                  Information only · Not broker-dealer advice · Members access only
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
