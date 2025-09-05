// components/elite/tabs/overview-tab.tsx
// Overview tab with full intelligence analysis

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Large } from "@/components/ui/typography"
import { Briefcase, AlertCircle, ArrowRight, Gem, ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { EliteMetrics } from "../elite-metrics"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface OverviewTabProps {
  data: ProcessedIntelligenceData
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function OverviewTab({ data, setActiveTab }: OverviewTabProps) {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  
  return (
    <div className="space-y-8">
      {/* Intelligence Centre Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Intelligence Centre Summary</h2>
              <p className="text-sm text-muted-foreground">Presidential brief intelligence</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Executive Summary */}
            {data.executiveSummary && (
              <div className="leading-relaxed text-foreground">
                <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {data.executiveSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Elite Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <EliteMetrics data={data} />
      </motion.div>

      {/* Capital Deployment Tiers */}
      {(data.tier1Opportunities?.length > 0 || data.tier2Opportunities?.length > 0 || data.tier3Opportunities?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Capital Deployment Tiers</h2>
              <p className="text-sm text-muted-foreground">Systematically analyzed opportunities across capital deployment tiers</p>
            </div>
          </div>

          {/* Tier 1: $100K Opportunities */}
          {data.tier1Opportunities?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-lg font-semibold text-foreground">Tier 1: $100K Opportunities</h3>
                <Badge variant="outline" className="text-xs">
                  {data.tier1Opportunities.length} Available
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tier1Opportunities.slice(0, 3).map((opp: any, index: number) => (
                  <TierOpportunityCard key={index} opportunity={opp} index={index} tier={1} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 2: $500K Opportunities */}
          {data.tier2Opportunities?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-lg font-semibold text-foreground">Tier 2: $500K Opportunities</h3>
                <Badge variant="outline" className="text-xs">
                  {data.tier2Opportunities.length} Available
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tier2Opportunities.slice(0, 3).map((opp: any, index: number) => (
                  <TierOpportunityCard key={index} opportunity={opp} index={index} tier={2} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 3: $1M+ Opportunities */}
          {data.tier3Opportunities?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <h3 className="text-lg font-semibold text-foreground">Tier 3: $1M+ Opportunities</h3>
                <Badge variant="outline" className="text-xs">
                  {data.tier3Opportunities.length} Available
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.tier3Opportunities.slice(0, 3).map((opp: any, index: number) => (
                  <TierOpportunityCard key={index} opportunity={opp} index={index} tier={3} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Required Alert */}
      {data.juicyOpportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-6 w-6 text-primary animate-pulse" />
                  <div>
                    <div className="font-semibold text-foreground">
                      IMMEDIATE ACTION REQUIRED
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data.juicyOpportunities.length} high-priority opportunities need your attention
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setActiveTab('opportunities')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Review Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  )
}

// TierOpportunityCard component with full detailed information
const TierOpportunityCard = ({ opportunity, index, tier }: { opportunity: any, index: number, tier: 1 | 2 | 3 }) => {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`${metallicStyle.className} p-5 hover:shadow-lg transition-all`}
      style={metallicStyle.style}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h4 className="text-sm font-semibold text-primary">{opportunity.title}</h4>
            </div>
          </div>
        </div>
        
        {/* Always Visible Details */}
        <div className="grid grid-cols-1 gap-3">
          {/* Total Capital Required */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Capital Required</span>
            <div className="text-sm font-semibold text-primary">{opportunity.totalCapitalRequired || opportunity.capital}</div>
          </div>
          
          {/* Risk Rating */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Rating</span>
            <div className="text-sm text-foreground">{opportunity.riskRating || opportunity.risk}</div>
          </div>
          
          {/* Minimum Net Worth */}
          {opportunity.minimumNetWorth && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Minimum Net Worth</span>
              <div className="text-sm text-foreground">{opportunity.minimumNetWorth}</div>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {(opportunity.taxEfficiency || opportunity.professionalTimeline || opportunity.implementation || opportunity.frameworkNote) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border"
          >
            {isExpanded ? (
              <>
                <span className="mr-1">Show Less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span className="mr-1">Show More Details</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}

        {/* Collapsible Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Tax Efficiency */}
            {opportunity.taxEfficiency && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tax Efficiency</span>
                <div className="text-sm text-foreground">{opportunity.taxEfficiency}</div>
              </div>
            )}
            
            {/* Professional Timeline */}
            {opportunity.professionalTimeline && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Professional Timeline</span>
                <div className="text-sm text-foreground">{opportunity.professionalTimeline}</div>
              </div>
            )}
            
            {/* Implementation */}
            {opportunity.implementation && (
              <div className="pt-3 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Implementation</span>
                <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {opportunity.implementation}
                </div>
              </div>
            )}
            
            {/* Framework Note */}
            {opportunity.frameworkNote && (
              <div className="pt-3 border-t border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Framework Note</span>
                <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {opportunity.frameworkNote}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}