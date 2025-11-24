// components/opportunity-expanded-content.tsx
// Reusable expanded opportunity content component
// Used in both OpportunityAtlasNew and share pages

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/theme-context"
import type { Opportunity } from "@/lib/api"

interface OpportunityExpandedContentProps {
  opportunity: Opportunity
  scoring?: {
    score: number
    conviction: 'high' | 'medium' | 'watch' | 'avoid'
    thesis: string
    reasoning?: string
  } | null
}

export function OpportunityExpandedContent({ opportunity, scoring }: OpportunityExpandedContentProps) {
  const { theme } = useTheme()

  // Get conviction styling
  const getConvictionStyle = (conviction: string) => {
    switch (conviction) {
      case 'high':
        return {
          color: '#22c55e', // green-500
          backgroundColor: '#22c55e20',
          borderColor: '#22c55e'
        }
      case 'medium':
        return {
          color: '#f59e0b', // amber-500
          backgroundColor: '#f59e0b20',
          borderColor: '#f59e0b'
        }
      case 'watch':
        return {
          color: '#3b82f6', // blue-500
          backgroundColor: '#3b82f620',
          borderColor: '#3b82f6'
        }
      case 'avoid':
        return {
          color: '#ef4444', // red-500
          backgroundColor: '#ef444420',
          borderColor: '#ef4444'
        }
      default:
        return {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Deal Capsule - Premium metrics container */}
      <div className="relative p-6 rounded-2xl border border-border/30 bg-muted/20">
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

          {/* Time Horizon - Using backend time_horizon_display structure */}
          <div className="text-center">
            <div className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
              Time Horizon
            </div>
            <div className={`text-2xl md:text-3xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
              {(opportunity as any).time_horizon_display?.time_horizon ||
               opportunity.investmentHorizon ||
               opportunity.riskLevel ||
               'Medium-term'}
            </div>
            {((opportunity as any).time_horizon_display?.liquidity || opportunity.liquidity_level) && (
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                {(opportunity as any).time_horizon_display?.liquidity ||
                 `${opportunity.liquidity_level} Liquidity`}
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

      {/* Main Content Card */}
      <Card className="border border-border/30 bg-card">
        <CardContent className="space-y-8 pt-8">

          {/* Viktor Rajesh-Volkov Intelligence Analysis */}
          {scoring && (
            <div className="p-4 rounded-lg" style={{
              backgroundColor: getConvictionStyle(scoring.conviction).backgroundColor,
              border: `1px solid ${getConvictionStyle(scoring.conviction).borderColor}30`
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getConvictionStyle(scoring.conviction).color }}
                />
                <h6 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  VIKTOR RAJESH-VOLKOV ANALYSIS
                </h6>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    ...getConvictionStyle(scoring.conviction),
                    borderWidth: '1px'
                  }}
                >
                  {scoring.conviction.toUpperCase()} CONVICTION
                </Badge>
              </div>
              <div className="space-y-3">
                {/* Alignment Score Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Portfolio Alignment Score</span>
                    <span className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                      {Math.round(scoring.score)}/100
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${scoring.score}%`,
                        backgroundColor: getConvictionStyle(scoring.conviction).color
                      }}
                    />
                  </div>
                </div>

                {/* Investment Thesis */}
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'}`}>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold text-primary">Viktor's Thesis:</span><br />
                    {scoring.thesis}
                  </p>
                </div>

                {/* Detailed Analysis */}
                {scoring.reasoning && (
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/10' : 'bg-gray-50/80'}`}>
                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-semibold">Strategic Analysis:</span><br />
                      {scoring.reasoning}
                    </p>
                  </div>
                )}

                {/* Entry Window Timing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Entry Window</p>
                    <p className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                      {scoring.conviction === 'high' ? 'Immediate' :
                       scoring.conviction === 'medium' ? 'Q1-Q2 2024' :
                       scoring.conviction === 'watch' ? 'Monitor' : 'Avoid'}
                    </p>
                  </div>
                  <div className={`p-2 rounded text-center ${theme === 'dark' ? 'bg-black/20' : 'bg-white/40'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Peer Signals</p>
                    <p className="text-xs font-bold" style={{ color: getConvictionStyle(scoring.conviction).color }}>
                      {scoring.conviction === 'high' ? 'Strong Buy' :
                       scoring.conviction === 'medium' ? 'Accumulate' :
                       scoring.conviction === 'watch' ? 'Hold' : 'Sell'}
                    </p>
                  </div>
                </div>

                {/* Elite Pulse Intelligence Attribution */}
                <div className="border-t border-muted-foreground/20 pt-2">
                  <p className="text-xs text-muted-foreground italic">
                    Analysis powered by Elite Pulse Intelligence System
                  </p>
                </div>
              </div>
            </div>
          )}

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
                        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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

                    {/* Investment Considerations (using dynamic label from API) */}
                    {opportunity.investment_thesis.the_catch && opportunity.investment_thesis.the_catch.length > 0 && (
                      <div className="pt-4 border-t border-border/30">
                        <p className={`text-xs font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2`}>
                          {opportunity.investment_thesis.the_catch_label || "Investment Considerations"}
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
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
                      <p className={`text-sm italic ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
                    {opportunity.pricing.price_breakdown?.per_acre_inr && (
                      <div className="pt-2 border-t border-border/30">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-muted-foreground">Per Acre</span>
                          <span className="text-sm font-medium text-foreground">
                            ₹{opportunity.pricing.price_breakdown.per_acre_inr.toLocaleString()}
                          </span>
                        </div>
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

          {/* Return Analysis Scenarios */}
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

          {/* Asset-Specific Details (Soil, Water, Climate for Agricultural) */}
          {opportunity.asset_details?.soil_climate && (
            <div className="border-l-2 border-primary pl-6">
              <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                Land & Climate Details
              </h2>
              <div className="space-y-3">
                {opportunity.asset_details.soil_climate.soil_type && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Type</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      {opportunity.asset_details.soil_climate.soil_type}
                    </p>
                    {opportunity.asset_details.soil_climate.soil_note && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                        {opportunity.asset_details.soil_climate.soil_note}
                      </p>
                    )}
                  </div>
                )}
                {opportunity.asset_details.soil_climate.climate && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Climate</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      {opportunity.asset_details.soil_climate.climate}
                    </p>
                  </div>
                )}
                {opportunity.asset_details.soil_climate.annual_rainfall && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Rainfall</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      {opportunity.asset_details.soil_climate.annual_rainfall}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Water Resources (Critical for Agricultural) */}
          {opportunity.asset_details?.water_resources && (
            <div className="border-l-2 border-primary pl-6">
              <h2 className={`text-xs font-bold tracking-widest uppercase mb-4 text-muted-foreground`}>
                Water Resources
              </h2>
              <div className="space-y-2">
                {opportunity.asset_details.water_resources.primary_source && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Primary Source</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      {opportunity.asset_details.water_resources.primary_source}
                    </p>
                  </div>
                )}
                {opportunity.asset_details.water_resources.note && (
                  <p className="text-xs text-muted-foreground italic">
                    {opportunity.asset_details.water_resources.note}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Red Flags (using dynamic label from API) */}
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

          {/* Risk Factors (using dynamic label from API) */}
          {(opportunity.risk_analysis || opportunity.cons) && (
            <div className="border-l-2 border-primary pl-6">
              <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                {opportunity.risk_analysis?.risk_factors_label || "Key Risks"}
              </h2>
              <div className="space-y-2">
                {opportunity.risk_analysis?.risk_factors && opportunity.risk_analysis.risk_factors.length > 0 ? (
                  opportunity.risk_analysis.risk_factors.map((factor: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">·</span>
                      <p className="text-sm text-muted-foreground">
                        {typeof factor === 'object' ? factor.factor_name || String(factor) : String(factor)}
                      </p>
                    </div>
                  ))
                ) : opportunity.cons ? (
                  opportunity.cons.map((con, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">·</span>
                      <p className="text-sm text-muted-foreground">{con}</p>
                    </div>
                  ))
                ) : null}
              </div>
            </div>
          )}

          {/* Next Steps / Due Diligence Process */}
          {opportunity.next_steps && opportunity.next_steps.length > 0 && (
            <div className="border-l-2 border-primary pl-6">
              <h2 className={`text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4`}>
                Next Steps
              </h2>
              <div className="space-y-3">
                {opportunity.next_steps.map((step: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800/10 border-gray-700/30' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        theme === 'dark' ? 'bg-primary/20' : 'bg-black/10'
                      }`}>
                        <span className={`text-xs font-bold ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                          {step.step || idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {step.action}
                        </p>
                        {step.details && (
                          <p className="text-xs text-muted-foreground">
                            {step.details}
                          </p>
                        )}
                        {step.estimated_time && (
                          <p className="text-xs text-primary">
                            ⏱️ {step.estimated_time}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
