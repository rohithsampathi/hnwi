// components/elite/tabs/opportunities-tab.tsx
// Opportunities tab with categorized investment opportunities

"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gem, Clock, TrendingDown, ExternalLink, ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { CitationText } from "../citation-text"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface OpportunitiesTabProps {
  data: ProcessedIntelligenceData
  onNavigate?: (route: string) => void
  onCitationClick?: (citationId: string) => void
  citations?: Array<{ id: string; number: number; originalText: string }>
  citationMap?: Map<string, number>
}

export function OpportunitiesTab({ data, onNavigate, onCitationClick, citations = [], citationMap: citationMapProp }: OpportunitiesTabProps) {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  // Create citation map from global citations
  const fallbackCitationMap = useMemo(() => {
    const map = new Map<string, number>()
    citations.forEach(citation => {
      map.set(citation.id, citation.number)
    })
    return map
  }, [citations])

  const citationMap = citationMapProp ?? fallbackCitationMap


  // Use ONLY Victor analysis opportunities
  const allOpportunities = (() => {
    // Use victorOpportunities from analysis exclusively
    if (data.victorOpportunities && data.victorOpportunities.length > 0) {
      return data.victorOpportunities
    }
    // Fallback to categorized Victor opportunities
    return [...(data.juicyOpportunities || []), ...(data.moderateOpportunities || []), ...(data.farFetchedOpportunities || [])]
  })()

  // Filter for HIGH/MEDIUM impact (JUICY/MODERATE) and take top 3
  // If no JUICY/MODERATE opportunities, show any available opportunities
  const opportunitiesWithScore = allOpportunities
    .filter((opp: any) => {
      // Check victor_score - handle case variations
      const score = opp.victor_score?.toUpperCase()
      const includesJuicy = score === 'JUICY' || opp.score === 'JUICY'
      const includesModerate = score === 'MODERATE' || opp.score === 'MODERATE'
      return includesJuicy || includesModerate
    })
    .sort((a: any, b: any) => {
      // Prioritize JUICY over MODERATE
      const scoreOrder = { 'JUICY': 0, 'MODERATE': 1 }
      const aScore = scoreOrder[a.victor_score?.toUpperCase() as keyof typeof scoreOrder] ?? 2
      const bScore = scoreOrder[b.victor_score?.toUpperCase() as keyof typeof scoreOrder] ?? 2
      return aScore - bScore
    })

  // If we have scored opportunities, use them; otherwise fall back to any opportunities
  const primaryOpportunities = opportunitiesWithScore.length > 0
    ? opportunitiesWithScore.slice(0, 3)
    : allOpportunities.slice(0, 3)


  const EmptyState = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <div className="text-sm">No {title} opportunities available</div>
    </div>
  )

  return (
    <div className="h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide pr-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <Gem className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Privé Exchange Updates</h2>
              <p className="text-sm text-muted-foreground">Latest opportunities available on the exclusive marketplace</p>
            </div>
          </div>
        </div>

      {/* Featured Opportunities from MongoDB or Victor Analysis */}
      {(primaryOpportunities && primaryOpportunities.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >

          <div className="space-y-4">
            {/* Show top 3 opportunities as metallic cards with Victor Analysis */}
            {primaryOpportunities.map((opp: any, idx: number) => {
              const isExpanded = expandedItems.has(idx)
              return (
              <div key={opp._id || idx} className="space-y-3">
                {/* Main Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`${metallicStyle.className} p-4 hover:shadow-lg transition-all cursor-pointer`}
                  style={metallicStyle.style}
                  onClick={() => {
                    if (onNavigate) {
                      // Navigate to Prive Exchange page with opportunity ID or title in URL
                      const opportunityParam = opp._id || opp.id || encodeURIComponent(opp.title || opp.name || '')
                      onNavigate(`prive-exchange?opportunity=${opportunityParam}`)
                    }
                  }}
                >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      {opp.start_date && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(opp.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      <h4 className="font-semibold text-foreground text-sm">
                        {opp.title || opp.name || 'Investment Opportunity'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {opp.type || opp.industry ||
                         (opp.victor_score === 'JUICY' ? 'High Priority' :
                          opp.victor_score === 'MODERATE' ? 'Moderate' : 'Strategic Investment')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Elite Score Badge with metallic colors */}
                    {opp.victor_score && (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                        style={{
                          background: opp.victor_score === 'JUICY'
                            ? "linear-gradient(135deg, #DC143C 0%, #FF1744 25%, #B71C1C 50%, #FF1744 75%, #DC143C 100%)" // Metallic ruby
                            : opp.victor_score === 'MODERATE'
                            ? "linear-gradient(135deg, #FFB300 0%, #FFC107 25%, #FF8F00 50%, #FFC107 75%, #FFB300 100%)" // Metallic topaz
                            : "linear-gradient(135deg, #10B981 0%, #34D399 25%, #059669 50%, #34D399 75%, #10B981 100%)", // Metallic emerald for FAR_FETCHED
                          border: opp.victor_score === 'JUICY'
                            ? "2px solid rgba(220, 20, 60, 0.5)"
                            : opp.victor_score === 'MODERATE'
                            ? "2px solid rgba(255, 193, 7, 0.5)"
                            : "2px solid rgba(16, 185, 129, 0.5)",
                          boxShadow: opp.victor_score === 'JUICY'
                            ? "0 2px 8px rgba(220, 20, 60, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                            : opp.victor_score === 'MODERATE'
                            ? "0 2px 8px rgba(255, 193, 7, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                            : "0 2px 8px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                          color: "#ffffff",
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)"
                        }}
                      >
                        {opp.victor_score === 'JUICY' ? 'JUICY' :
                         opp.victor_score === 'MODERATE' ? 'MODERATE' :
                         'FAR FETCHED'}
                      </div>
                    )}
                    {!opp.victor_score && (opp.is_active || opp.region) && (
                      <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                        {opp.is_active ? 'ACTIVE' : opp.region || 'OPPORTUNITY'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                  <div>
                    <span className="font-medium text-foreground">Value: </span>
                    <span className="text-muted-foreground">{opp.value || opp.investment_amount || 'TBD'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Horizon: </span>
                    <span className="text-muted-foreground">{opp.investmentHorizon || opp.time_horizon || 'Medium-term'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Risk: </span>
                    <Badge variant="outline" className={`text-xs ml-1 ${
                      (opp.riskLevel || opp.risk_level) === 'Low' ? 'border-primary/30 text-primary' :
                      (opp.riskLevel || opp.risk_level) === 'Medium' ? 'border-primary/50 text-primary' :
                      'border-primary/70 text-primary'
                    }`}>
                      {opp.riskLevel || opp.risk_level || 'Medium'}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Return: </span>
                    <span className="text-muted-foreground">{opp.expectedReturn || opp.expected_return || 'Market Rate'}</span>
                  </div>
                </div>

                {/* Action & Expand Button */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {opp.victor_action && (
                        <Badge
                          variant={opp.victor_action === 'BUY' ? 'default' :
                                  opp.victor_action === 'SELL' ? 'destructive' :
                                  'secondary'}
                          className="text-xs font-bold"
                        >
                          {opp.victor_action}
                        </Badge>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedItems(prev => {
                            const newSet = new Set(prev)
                            if (newSet.has(idx)) {
                              newSet.delete(idx)
                            } else {
                              newSet.add(idx)
                            }
                            return newSet
                          })
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        {isExpanded ? 'Hide' : 'Show'} Details
                      </button>
                    </div>
                    {opp.confidence_level && (
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-medium text-foreground">{Math.round(opp.confidence_level * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>

                {/* Expanded Details in Bordered Shell */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-border rounded-lg p-4 bg-transparent"
                    >
                    <div className="space-y-3">

                    {/* Elite Pulse Analysis */}
                    <div className="text-xs">
                      <span className="font-semibold text-foreground block mb-2">Elite Pulse Analysis</span>
                      <div className="text-muted-foreground leading-relaxed">
                        <CitationText
                          text={opp.victor_reasoning || opp.reasoning || opp.analysis || opp.description || 'Strategic investment opportunity with favorable risk-return profile.'}
                          onCitationClick={onCitationClick}
                          citationMap={citationMap}
                        />
                      </div>
                    </div>

                    {/* Strategic Insights */}
                    {opp.strategic_insights && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Strategic Insights</span>
                        <div className="text-muted-foreground leading-relaxed">
                          <CitationText
                            text={opp.strategic_insights}
                            onCitationClick={onCitationClick}
                            citationMap={citationMap}
                          />
                        </div>
                      </div>
                    )}

                    {/* Opportunity Window */}
                    {opp.opportunity_window && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Timing Window</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opp.opportunity_window}
                        </div>
                      </div>
                    )}

                    {/* Pros and Cons */}
                    {(opp.pros || opp.cons) && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {opp.pros && opp.pros.length > 0 && (
                          <div>
                            <span className="font-semibold text-primary block mb-1">Pros</span>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                              {opp.pros.slice(0, 3).map((pro: string, idx: number) => (
                                <li key={idx} className="text-[10px]">{pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {opp.cons && opp.cons.length > 0 && (
                          <div>
                            <span className="font-semibold text-primary opacity-80 block mb-1">Cons</span>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                              {opp.cons.slice(0, 3).map((con: string, idx: number) => (
                                <li key={idx} className="text-[10px]">{con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Risk Assessment - Highlighted */}
                    {(opp.risk_assessment || opp.hnwi_alignment) && (
                      <div className="text-xs p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <span className="font-semibold text-primary block mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                          Risk Assessment
                        </span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opp.risk_assessment || opp.hnwi_alignment || 'Standard market risk applies. Monitor position regularly.'}
                        </div>
                      </div>
                    )}

                    {/* Market Pulse Alignment */}
                    {opp.elite_pulse_alignment && (
                      <div className="text-xs">
                        <span className="font-semibold text-primary block mb-1">Market Pulse</span>
                        <div className="text-muted-foreground leading-relaxed">
                          {opp.elite_pulse_alignment}
                        </div>
                      </div>
                    )}

                    {/* Legacy fields */}
                    {opp.key_factors && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Key Factors</span>
                        <div className="text-muted-foreground leading-relaxed">
                          <CitationText
                            text={opp.key_factors}
                            onCitationClick={onCitationClick}
                            citationMap={citationMap}
                          />
                        </div>
                      </div>
                    )}

                    {opp.implementation && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground block mb-1">Implementation</span>
                        <div className="text-muted-foreground leading-relaxed">
                          <CitationText
                            text={opp.implementation}
                            onCitationClick={onCitationClick}
                            citationMap={citationMap}
                          />
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Bottom Actions - Hide Details and View Full */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedItems(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(idx)
                            return newSet
                          })
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        <ChevronUp className="h-3 w-3" />
                        Hide Details
                      </button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onNavigate) {
                            const opportunityParam = opp._id || opp.id || encodeURIComponent(opp.title || opp.name || '')
                            onNavigate(`prive-exchange?opportunity=${opportunityParam}`)
                          }
                        }}
                        className="text-xs gap-1 px-3 py-1.5 h-7"
                      >
                        View Full Opportunity
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )
            })}
            
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing top 3 featured opportunities from {allOpportunities.length} available on Privé Exchange
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('prive-exchange')
                  }
                }}
                className="hover:text-white"
              >
                View All Opportunities
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

        {/* Empty state if no opportunities */}
        {(!primaryOpportunities || primaryOpportunities.length === 0) && (
          <EmptyState icon={Clock} title="Privé Exchange" />
        )}
      </motion.div>
    </div>
  )
}
