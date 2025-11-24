// app/share/opportunity/[opportunityId]/shared-opportunity-client.tsx
// Client component for shared investment opportunities

"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Header } from "@/components/layout/header"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
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

export default function SharedOpportunityClient({ opportunity, opportunityId }: SharedOpportunityClientProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [showAccessGate, setShowAccessGate] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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
                          <div className="space-y-4">
                            {opportunity.investment_thesis.why_this_makes_money.map((item, idx) => (
                              <div key={idx} className={`p-4 rounded-lg border ${
                                theme === 'dark' ? 'bg-gray-800/20 border-gray-700/30' : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="space-y-2">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                      theme === 'dark' ? 'bg-primary/20' : 'bg-black/10'
                                    }`}>
                                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                                        {idx + 1}
                                      </span>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                        <span className="text-muted-foreground text-sm">Driver: </span>
                                        {item.driver}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">Mechanism: </span>
                                        {item.mechanism}
                                      </p>
                                      {(item.value_creation || item.value_creation_display) && (
                                        <p className="text-sm text-foreground">
                                          <span className="text-muted-foreground">Value Creation: </span>
                                          {item.value_creation_display || item.value_creation}
                                        </p>
                                      )}
                                      {item.evidence && (
                                        <p className="text-sm text-muted-foreground italic">
                                          Evidence: {item.evidence}
                                        </p>
                                      )}
                                    </div>
                                  </div>
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
                        {opportunity.pricing.total_investment_required && (
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm text-muted-foreground">Total Required</span>
                            <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              ${opportunity.pricing.total_investment_required.toLocaleString()}
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
                        {opportunity.pricing.transaction_costs && (
                          <div className="pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground mb-2">Transaction Costs</p>
                            {opportunity.pricing.transaction_costs.stamp_duty && (
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs text-muted-foreground">Stamp Duty ({opportunity.pricing.transaction_costs.stamp_duty_percentage}%)</span>
                                <span className="text-sm font-medium text-foreground">
                                  ${opportunity.pricing.transaction_costs.stamp_duty.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {opportunity.pricing.transaction_costs.registration_fee && (
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs text-muted-foreground">Registration Fee ({opportunity.pricing.transaction_costs.registration_fee_percentage}%)</span>
                                <span className="text-sm font-medium text-foreground">
                                  ${opportunity.pricing.transaction_costs.registration_fee.toLocaleString()}
                                </span>
                              </div>
                            )}
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
                        {opportunity.exit_strategy.holding_costs && (
                          <div className="pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Holding Costs</p>
                            {opportunity.exit_strategy.holding_costs.monthly_total && (
                              <div className="flex justify-between items-baseline mb-1">
                                <span className="text-xs text-muted-foreground">Monthly</span>
                                <span className="text-sm font-medium text-foreground">
                                  ${opportunity.exit_strategy.holding_costs.monthly_total.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {opportunity.exit_strategy.holding_costs.annual_total && (
                              <div className="flex justify-between items-baseline">
                                <span className="text-xs text-muted-foreground">Annual</span>
                                <span className="text-sm font-medium text-foreground">
                                  ${opportunity.exit_strategy.holding_costs.annual_total.toLocaleString()}
                                </span>
                              </div>
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

              {/* Return Scenarios */}
              {opportunity.return_analysis?.scenarios && (
                <div className="border-l-2 border-primary pl-6">
                  <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                    Return Scenarios
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {opportunity.return_analysis.scenarios.conservative && (
                      <div className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-muted/20 border-border/30' : 'bg-muted/50 border-border/40'
                      }`}>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Conservative</p>
                        {opportunity.return_analysis.scenarios.conservative.annualized_return && (
                          <p className="text-2xl font-bold text-foreground mb-1">
                            {opportunity.return_analysis.scenarios.conservative.annualized_return}%
                          </p>
                        )}
                        {opportunity.return_analysis.scenarios.conservative.assumptions && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {opportunity.return_analysis.scenarios.conservative.assumptions}
                          </p>
                        )}
                      </div>
                    )}
                    {opportunity.return_analysis.scenarios.base_case && (
                      <div className={`p-4 rounded-lg border-2 ${
                        theme === 'dark' ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/40'
                      }`}>
                        <p className={`text-xs font-bold uppercase mb-2 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                          Base Case ✨
                        </p>
                        {opportunity.return_analysis.scenarios.base_case.annualized_return && (
                          <p className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                            {opportunity.return_analysis.scenarios.base_case.annualized_return}%
                          </p>
                        )}
                        {opportunity.return_analysis.scenarios.base_case.assumptions && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {opportunity.return_analysis.scenarios.base_case.assumptions}
                          </p>
                        )}
                      </div>
                    )}
                    {opportunity.return_analysis.scenarios.optimistic && (
                      <div className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-muted/20 border-border/30' : 'bg-muted/50 border-border/40'
                      }`}>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Optimistic</p>
                        {opportunity.return_analysis.scenarios.optimistic.annualized_return && (
                          <p className="text-2xl font-bold text-foreground mb-1">
                            {opportunity.return_analysis.scenarios.optimistic.annualized_return}%
                          </p>
                        )}
                        {opportunity.return_analysis.scenarios.optimistic.assumptions && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {opportunity.return_analysis.scenarios.optimistic.assumptions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Red Flags (Risk Warnings) */}
              {opportunity.risk_analysis?.red_flags && opportunity.risk_analysis.red_flags.length > 0 && (
                <div className="border-l-2 border-primary pl-6">
                  <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                    {opportunity.risk_analysis?.red_flags_label || "Risk Warnings"}
                  </h2>
                  <div className="space-y-2">
                    {opportunity.risk_analysis.red_flags.map((flag: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">·</span>
                        <p className="text-sm text-muted-foreground">{flag.replace(/⚠️/g, '').trim()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factors (Key Risks) - Enhanced with full factor details */}
              {(opportunity.risk_analysis || opportunity.cons) && (
                <div className="border-l-2 border-amber-600 dark:border-amber-400 pl-6">
                  <h2 className={`text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-4`}>
                    {opportunity.risk_analysis?.risk_factors_label || "Key Risks"}
                  </h2>
                  <div className="space-y-4">
                    {opportunity.risk_analysis?.risk_factors && opportunity.risk_analysis.risk_factors.length > 0 ? (
                      opportunity.risk_analysis.risk_factors.map((factor: any, idx: number) => (
                        <div key={idx} className={`p-4 rounded-lg border ${
                          theme === 'dark' ? 'bg-amber-900/10 border-amber-700/30' : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                theme === 'dark' ? 'bg-amber-600/20' : 'bg-amber-600/10'
                              }`}>
                                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                                  {idx + 1}
                                </span>
                              </div>
                              <div className="flex-1 space-y-2">
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {typeof factor === 'object' ? factor.factor_name || String(factor) : String(factor)}
                                </p>

                                {/* Probability and Impact */}
                                {typeof factor === 'object' && (factor.probability_percentage || factor.impact) && (
                                  <div className="flex gap-3 text-xs">
                                    {factor.probability_percentage && (
                                      <div className={`px-2 py-1 rounded ${
                                        theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-100'
                                      }`}>
                                        <span className="text-muted-foreground">Probability: </span>
                                        <span className="font-semibold text-foreground">{factor.probability_percentage}%</span>
                                      </div>
                                    )}
                                    {factor.impact && (
                                      <div className={`px-2 py-1 rounded ${
                                        theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-100'
                                      }`}>
                                        <span className="text-muted-foreground">Impact: </span>
                                        <span className="font-semibold text-foreground">{factor.impact}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* What Could Happen */}
                                {typeof factor === 'object' && factor.what_could_happen && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">What Could Happen: </span>
                                    {factor.what_could_happen}
                                  </p>
                                )}

                                {/* Financial Impact */}
                                {typeof factor === 'object' && factor.financial_impact && (
                                  <p className="text-sm text-amber-600 dark:text-amber-400">
                                    <span className="font-medium">Financial Impact: </span>
                                    {factor.financial_impact}
                                  </p>
                                )}

                                {/* Mitigation */}
                                {typeof factor === 'object' && factor.mitigation && (
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Mitigation: </span>
                                    {factor.mitigation}
                                  </p>
                                )}

                                {/* Residual Risk */}
                                {typeof factor === 'object' && factor.residual_risk && (
                                  <p className="text-sm text-muted-foreground italic">
                                    Residual Risk: {factor.residual_risk}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : opportunity.cons ? (
                      opportunity.cons.map((con, idx) => (
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
  )
}
