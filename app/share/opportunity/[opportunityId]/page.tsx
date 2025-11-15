// app/share/opportunity/[opportunityId]/page.tsx
// Public page for viewing shared investment opportunities

"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Paragraph } from "@/components/ui/typography"
import { CrownLoader } from "@/components/ui/crown-loader"
import { MetaTags } from "@/components/meta-tags"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import {
  Lock,
  Share2,
  Sparkles,
  Check,
  X
} from "lucide-react"
import { getOpportunities, type Opportunity } from "@/lib/api"

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

export default function SharedOpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const opportunityId = params.opportunityId as string

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAccessGate, setShowAccessGate] = useState(false)

  useEffect(() => {
    loadOpportunity()
  }, [opportunityId])

  const loadOpportunity = async () => {
    try {
      setIsLoading(true)
      const opportunities = await getOpportunities()
      const found = opportunities.find(o => o.id === opportunityId)

      if (found) {
        setOpportunity(found)
      } else {
        setError("Opportunity not found or no longer available")
      }
    } catch (err) {
      setError("Failed to load opportunity details")
    } finally {
      setIsLoading(false)
    }
  }

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
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  // Calculate risk level for gradient bar
  const getRiskPosition = (riskLevel: string | undefined) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 15
      case 'medium': return 50
      case 'high': return 85
      default: return 50
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader size="lg" text="Loading opportunity..." />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-2xl font-bold text-foreground">Opportunity Not Found</h2>
          <p className="text-muted-foreground">{error || "This opportunity is no longer available"}</p>
          <Button onClick={handleBack} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <MetaTags
        title={`${opportunity.title} - Investment Opportunity | HNWI Chronicles`}
        description={opportunity.description || "Exclusive investment opportunity available on Privé Exchange"}
        image="https://app.hnwichronicles.com/images/prive-exchange-og.png"
        url={`https://app.hnwichronicles.com/share/opportunity/${opportunityId}`}
      />

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

        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <PageHeaderWithBack onBack={handleBack} />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </Button>

                <Button
                  onClick={handleGetAccess}
                  size="sm"
                  className="gap-2"
                >
                  <Lock className="h-3 w-3" />
                  Get Access
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Premium Intelligence Briefing */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto">
          {/* HNWI Chronicles Brand Mark */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                Intelligence Briefing
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero: Deal Capsule */}
            <div className="space-y-6">
              {/* Title */}
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

              {/* Deal Capsule - Premium metrics container */}
              <div
                className="relative p-8 rounded-2xl border"
                style={{
                  background: theme === "dark"
                    ? "linear-gradient(135deg, rgba(218, 165, 32, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)"
                    : "linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(255, 255, 255, 0.8) 100%)",
                  borderColor: theme === "dark" ? "rgba(218, 165, 32, 0.2)" : "rgba(192, 192, 192, 0.3)",
                  boxShadow: theme === "dark"
                    ? "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(218, 165, 32, 0.1)"
                    : "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                }}
              >
                {/* Top bar - Essential metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-border/30">
                  {/* Minimum Ticket */}
                  {(opportunity.minimum_investment_display || opportunity.value) && (
                    <div className="text-center">
                      <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                        Minimum Ticket
                      </div>
                      <div className="text-2xl md:text-3xl font-bold" style={{ color: '#DAA520' }}>
                        {opportunity.minimum_investment_display || opportunity.value}
                      </div>
                      {opportunity.tier && (
                        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                          {opportunity.tier.replace('tier_', '')} Access
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expected Yield */}
                  {(opportunity.expected_return_annual_low || opportunity.expectedReturn) && (
                    <div className="text-center">
                      <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                        Projected Yield
                      </div>
                      <div className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                        {opportunity.expected_return_annual_low && opportunity.expected_return_annual_high
                          ? `${opportunity.expected_return_annual_low}–${opportunity.expected_return_annual_high}%`
                          : opportunity.expectedReturn
                        }
                      </div>
                      {opportunity.risk_free_multiple && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {opportunity.risk_free_multiple}× Risk-Free Rate
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Horizon / Risk */}
                  <div className="text-center">
                    <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                      {opportunity.investmentHorizon ? 'Time Horizon' : 'Risk Profile'}
                    </div>
                    <div className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                      {opportunity.investmentHorizon || opportunity.riskLevel}
                    </div>
                    {opportunity.liquidity_level && (
                      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                        {opportunity.liquidity_level} Liquidity
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom bar - Geographic + Sector */}
                {(opportunity.region || opportunity.industry) && (
                  <div className="grid grid-cols-2 gap-6 text-center">
                    {opportunity.region && (
                      <div>
                        <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                          Geography
                        </div>
                        <div className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.region}
                          {opportunity.country && <span className="text-muted-foreground"> · {opportunity.country}</span>}
                        </div>
                      </div>
                    )}
                    {opportunity.industry && (
                      <div>
                        <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                          Sector
                        </div>
                        <div className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.industry}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Card
              className={`border-none ${getMetallicCardStyle(theme).className}`}
              style={{
                ...getMetallicCardStyle(theme).style,
                color: theme === "dark" ? "white" : "black",
              }}
            >

              <CardContent className="space-y-8 pt-8">

                {/* Investment Thesis */}
                {(opportunity.investment_thesis || opportunity.description) && (
                  <div className="space-y-6">
                    <div className="border-l-2 border-primary pl-6">
                      <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                        Investment Thesis
                      </h2>

                      {opportunity.investment_thesis ? (
                        <div className="space-y-5">
                          {/* What You're Buying */}
                          {opportunity.investment_thesis.what_youre_buying && (
                            <div>
                              <p className={`text-base font-medium leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                {opportunity.investment_thesis.what_youre_buying}
                              </p>
                            </div>
                          )}

                          {/* Value Drivers */}
                          {opportunity.investment_thesis.why_this_makes_money && opportunity.investment_thesis.why_this_makes_money.length > 0 && (
                            <div className="space-y-2">
                              {opportunity.investment_thesis.why_this_makes_money.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  <div>
                                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                      {item.driver}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {item.mechanism}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Key Considerations */}
                          {opportunity.investment_thesis.the_catch && opportunity.investment_thesis.the_catch.length > 0 && (
                            <div className="pt-4 border-t border-border/30">
                              <p className={`text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2`}>
                                Key Considerations
                              </p>
                              <div className="space-y-1">
                                {opportunity.investment_thesis.the_catch.slice(0, 3).map((item, idx) => (
                                  <p key={idx} className="text-sm text-muted-foreground">
                                    · {item}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {opportunity.description}
                        </p>
                      )}
                    </div>

                    {/* Victor's Assessment */}
                    {opportunity.investment_thesis?.victor_verdict_one_line && (
                      <div
                        className="relative p-6 rounded-xl border-l-4"
                        style={{
                          borderLeftColor: '#DAA520',
                          background: theme === "dark"
                            ? "rgba(218, 165, 32, 0.05)"
                            : "rgba(218, 165, 32, 0.08)"
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">V</span>
                            </div>
                          </div>
                          <div>
                            <p className={`text-sm font-medium italic ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              "{opportunity.investment_thesis.victor_verdict_one_line}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">— Intelligence Assessment</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Financial Structure */}
                {(opportunity.pricing || opportunity.exit_strategy) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pricing */}
                    {opportunity.pricing && (
                      <div className="border-l-2 border-primary pl-6">
                        <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                          Structure
                        </h2>
                        <div className="space-y-3">
                          {opportunity.pricing.base_price_usd && (
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Base</span>
                              <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                ${opportunity.pricing.base_price_usd.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {opportunity.pricing.discount_percentage && (
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Discount</span>
                              <span className="text-base font-semibold text-primary">
                                {opportunity.pricing.discount_percentage}%
                              </span>
                            </div>
                          )}
                          {opportunity.payment_plan?.payment_type && (
                            <div className="pt-2 border-t border-border/30">
                              <p className="text-sm text-muted-foreground">
                                {opportunity.payment_plan.payment_type}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exit */}
                    {opportunity.exit_strategy && (
                      <div className="border-l-2 border-primary pl-6">
                        <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                          Exit Path
                        </h2>
                        <div className="space-y-3">
                          {opportunity.exit_strategy.primary_exit && typeof opportunity.exit_strategy.primary_exit === 'object' && (
                            <div>
                              {opportunity.exit_strategy.primary_exit.name && (
                                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {opportunity.exit_strategy.primary_exit.name}
                                </p>
                              )}
                              {opportunity.exit_strategy.primary_exit.timeline_display && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {opportunity.exit_strategy.primary_exit.timeline_display}
                                </p>
                              )}
                              {opportunity.exit_strategy.primary_exit.expected_recovery_percentage && (
                                <p className="text-sm text-primary mt-1">
                                  {opportunity.exit_strategy.primary_exit.expected_recovery_percentage}% recovery
                                </p>
                              )}
                            </div>
                          )}
                          {opportunity.exit_strategy.secondary_exit && typeof opportunity.exit_strategy.secondary_exit === 'object' && (
                            <div className="pt-2 border-t border-border/30">
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Alternative</p>
                              <p className="text-sm font-medium">
                                {opportunity.exit_strategy.secondary_exit.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Asset Specifics */}
                {opportunity.asset_details && (
                  <div className="border-l-2 border-primary pl-6">
                    <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                      Asset Specifics
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                      {opportunity.asset_details.property_type && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {opportunity.asset_details.property_type}
                          </p>
                        </div>
                      )}
                      {opportunity.asset_details.total_area_sqft && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Area</p>
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {opportunity.asset_details.total_area_sqft.toLocaleString()} sqft
                          </p>
                        </div>
                      )}
                      {opportunity.asset_details.bedrooms && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Config</p>
                          <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {opportunity.asset_details.bedrooms} BR
                          </p>
                        </div>
                      )}
                    </div>
                    {opportunity.asset_details.location?.full_address && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-sm text-muted-foreground">
                          {opportunity.asset_details.location.full_address}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Risk Factors */}
                {(opportunity.risk_analysis || opportunity.cons) && (
                  <div className="border-l-2 border-amber-600 dark:border-amber-400 pl-6">
                    <h2 className={`text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-4`}>
                      Key Considerations
                    </h2>
                    <div className="space-y-2">
                      {opportunity.risk_analysis?.risk_factors && opportunity.risk_analysis.risk_factors.length > 0 ? (
                        opportunity.risk_analysis.risk_factors.slice(0, 3).map((factor: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-1">·</span>
                            <p className="text-sm text-muted-foreground">
                              {typeof factor === 'object' ? factor.factor_name || String(factor) : String(factor)}
                            </p>
                          </div>
                        ))
                      ) : opportunity.cons ? (
                        opportunity.cons.slice(0, 3).map((con, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-1">·</span>
                            <p className="text-sm text-muted-foreground">{con}</p>
                          </div>
                        ))
                      ) : null}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

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
    </>
  )
}
