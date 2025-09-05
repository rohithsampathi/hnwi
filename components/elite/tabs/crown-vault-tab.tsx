// components/elite/tabs/crown-vault-tab.tsx
// Crown Vault portfolio impact analysis tab

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Activity, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import type { ProcessedIntelligenceData, User } from "@/types/dashboard"

interface CrownVaultTabProps {
  data: ProcessedIntelligenceData
  onNavigate: (route: string) => void
  user: User
}

export function CrownVaultTab({ data, onNavigate, user }: CrownVaultTabProps) {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  
  // Use the mapped data from HomeDashboardElite
  const executiveSummary = data?.crownVaultSummary
  const totalExposure = data?.totalExposure  
  const threats = data?.impactedAssets || []
  
  const hasImpactedAssets = threats && threats.length > 0

  // Placeholder assets for demonstration when no real data
  const placeholderAssets = [
    {
      asset: "Manhattan Penthouse",
      asset_category: "Real Estate",
      risk_level: "MEDIUM",
      exposure_amount: "$12.5M",
      thirty_day_impact: "NYC real estate showing signs of correction with 15-20% downside risk due to rising interest rates",
      action_required: "Monitor market closely and consider partial hedging through REITs",
      intelligence_match: "Correlates with Federal Reserve policy shifts affecting luxury real estate markets"
    },
    {
      asset: "Rare Art Collection",
      asset_category: "Alternative Assets",
      risk_level: "LOW",
      exposure_amount: "$3.8M",
      thirty_day_impact: "Art market remains stable with consistent appreciation despite economic uncertainty",
      action_required: "Maintain current position, consider insurance review",
      intelligence_match: "Alternative assets showing resilience during market volatility periods"
    }
  ]

  // Use placeholder assets if no real assets exist
  const displayAssets = hasImpactedAssets ? threats : placeholderAssets
  const shouldShowPlaceholder = !hasImpactedAssets

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Crown Vault Integration</h2>
            <p className="text-sm text-muted-foreground">Advanced portfolio impact analysis</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Executive Summary */}
        {(executiveSummary || totalExposure || shouldShowPlaceholder) && (
          <div className="mt-6 p-4 bg-muted/20 rounded-lg text-left max-w-4xl mx-auto">
            {executiveSummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {executiveSummary}
              </p>
            )}
            {totalExposure && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium">Total Exposure: <span className="font-bold text-primary">{totalExposure}</span></p>
              </div>
            )}
            {shouldShowPlaceholder && !executiveSummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Portfolio impact analysis demonstrates how current intelligence opportunities affect your specific asset holdings. 
                Below are examples of how your Crown Vault assets would be analyzed for market impact and risk assessment.
              </p>
            )}
            {shouldShowPlaceholder && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <p className="text-sm font-medium">Total Portfolio Value: <span className="font-bold text-primary">$16.3M</span></p>
                <Badge variant="outline" className="text-xs">Demo Mode</Badge>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 space-y-4 max-w-4xl mx-auto">
          <h4 className="font-semibold mb-4 flex items-center text-foreground text-left">
            <Activity className="h-4 w-4 mr-2" />
            {shouldShowPlaceholder ? "Portfolio Impact Preview" : "Impacted Assets"} ({displayAssets.length})
            {shouldShowPlaceholder && (
              <Badge variant="outline" className="text-xs ml-2">Preview</Badge>
            )}
          </h4>
          
          <div className="grid gap-4">
            {displayAssets.map((threat: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    metallicStyle.className,
                    "text-left hover:shadow-lg transition-all cursor-pointer",
                    threat.risk_level === 'HIGH' ? "border-l-red-500 border-l-4" :
                    threat.risk_level === 'MEDIUM' ? "border-l-primary border-l-4" :
                    "border-l-green-500 border-l-4"
                  )}
                  style={metallicStyle.style}
                  onClick={() => {
                    if (!shouldShowPlaceholder) {
                      onNavigate(`crown-vault?asset=${threat.asset_id || threat.asset}`)
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          theme === 'dark' 
                            ? 'bg-primary text-black'
                            : 'bg-primary text-white'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {threat.asset || threat.name || 'Asset'}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {threat.category || threat.asset_category || 'Investment Asset'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        threat.risk_level === 'HIGH' ? 'destructive' : 
                        threat.risk_level === 'MEDIUM' ? 'secondary' : 
                        'default'
                      } className="text-xs">
                        {threat.risk_level || 'LOW'} RISK
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                      <div>
                        <span className="font-medium text-foreground">Exposure: </span>
                        <span className="text-muted-foreground">{threat.exposure_amount || threat.exposure || 'TBD'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Category: </span>
                        <span className="text-muted-foreground">{threat.category || threat.asset_category || 'Asset'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Impact: </span>
                        <span className={`${
                          threat.risk_level === 'HIGH' ? 'text-red-600 dark:text-red-400' :
                          threat.risk_level === 'MEDIUM' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {threat.risk_level === 'HIGH' ? 'High' :
                           threat.risk_level === 'MEDIUM' ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Action: </span>
                        <span className="text-muted-foreground">
                          {threat.action_required ? 'Required' : 'Monitor'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {threat.thirty_day_impact || threat.impact || 'Portfolio impact analysis demonstrates how current intelligence opportunities affect this specific asset holding.'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        {/* Access Crown Vault Button at Bottom */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {shouldShowPlaceholder 
                ? `Preview showing ${displayAssets.length} example assets with portfolio impact analysis`
                : `${threats.length} assets analyzed for portfolio impact`
              }
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onNavigate('crown-vault')}
              disabled={shouldShowPlaceholder}
              className="hover:text-white"
            >
              <Crown className="h-3 w-3 mr-1" />
              {shouldShowPlaceholder ? "View All Assets" : "View All Assets"}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          {shouldShowPlaceholder && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Connect your Crown Vault to see real portfolio impact analysis
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}