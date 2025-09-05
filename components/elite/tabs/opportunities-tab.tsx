// components/elite/tabs/opportunities-tab.tsx
// Opportunities tab with categorized investment opportunities

"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, TrendingDown, ExternalLink, ArrowRight } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface OpportunitiesTabProps {
  data: ProcessedIntelligenceData
  onNavigate?: (route: string) => void
}

export function OpportunitiesTab({ data, onNavigate }: OpportunitiesTabProps) {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  const OpportunityCard = ({ opportunity, index }: { opportunity: any, index: number }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="p-4 border border-border rounded-lg cursor-pointer hover:shadow-md transition-all bg-background"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-foreground text-sm leading-tight">
            {opportunity.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
            <span>{opportunity.value}</span>
            <span>•</span>
            <span>{opportunity.investmentHorizon}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
{opportunity.victor_reasoning?.substring(0, 100) || opportunity.description?.substring(0, 100) || 'Strategic investment analysis available'}...
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
      </div>
    </motion.div>
  )

  const EmptyState = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <div className="text-sm">No {title} opportunities available</div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Star className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Privé Exchange Updates</h2>
            <p className="text-sm text-muted-foreground">Latest opportunities available on the exclusive marketplace</p>
          </div>
        </div>
      </div>

      {/* Featured Opportunities (Same as Overview) */}
      {data.opportunities && data.opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >

          <div className="space-y-3">
            {/* Show top 3 opportunities as metallic cards (same style as Overview) */}
            {[...data.juicyOpportunities, ...data.moderateOpportunities.slice(0, Math.max(0, 3 - data.juicyOpportunities.length))]
              .slice(0, 3).map((opp: any, idx: number) => (
              <motion.div
                key={opp._id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`${metallicStyle.className} p-4 hover:shadow-lg transition-all cursor-pointer`}
                style={metallicStyle.style}
                onClick={() => {
                  if (onNavigate) {
                    // Navigate to specific opportunity page
                    onNavigate(`opportunity/${opp._id || opp.id || idx}`)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      theme === 'dark' 
                        ? 'bg-primary text-black'
                        : 'bg-primary text-white'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {opp.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {opp.victor_rating === 'juicy' ? 'High Priority' : 
                         opp.victor_rating === 'moderate' ? 'Moderate' : 'Watchlist'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {opp.victor_rating === 'juicy' ? 'HIGH PRIORITY' : 
                     opp.victor_rating === 'moderate' ? 'MODERATE' : 'WATCHLIST'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                  <div>
                    <span className="font-medium text-foreground">Value: </span>
                    <span className="text-muted-foreground">{opp.value}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Horizon: </span>
                    <span className="text-muted-foreground">{opp.investmentHorizon}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Risk: </span>
                    <span className={`${
                      opp.riskLevel === 'Low' ? 'text-green-600 dark:text-green-400' :
                      opp.riskLevel === 'Medium' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {opp.riskLevel}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Return: </span>
                    <span className="text-muted-foreground">{opp.expectedReturn}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {opp.victor_reasoning || opp.description || 'Strategic investment opportunity with favorable risk-return profile.'}
                </p>
              </motion.div>
            ))}
            
            {/* Far-fetched preview if no juicy/moderate */}
            {data.juicyOpportunities.length === 0 && data.moderateOpportunities.length === 0 && data.farFetchedOpportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className={`${metallicStyle.className} p-4 hover:shadow-lg transition-all cursor-pointer`}
                style={metallicStyle.style}
                onClick={() => {
                  if (onNavigate) {
                    const opp = data.farFetchedOpportunities[0]
                    onNavigate(`opportunity/${opp._id || opp.id || 'watchlist-1'}`)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                      theme === 'dark' 
                        ? 'bg-primary text-black'
                        : 'bg-primary text-white'
                    }`}>
                      #1
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {data.farFetchedOpportunities[0].title}
                      </h4>
                      <p className="text-xs text-muted-foreground">Watchlist</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    WATCHLIST
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {data.farFetchedOpportunities[0].victor_reasoning || data.farFetchedOpportunities[0].description || 'Long-term strategic consideration with potential upside.'}
                </p>
              </motion.div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing featured opportunities from {data.opportunities.length} available on Privé Exchange
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
      {(!data.opportunities || data.opportunities.length === 0) && (
        <EmptyState icon={Clock} title="Privé Exchange" />
      )}

    </motion.div>
  )
}