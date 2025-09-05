// components/intelligence/crown-vault-impact.tsx
// Katherine Sterling-Chen Crown Vault Impact Analysis Component
// Harvard MBA '14, Family Office Advisory, TEDx Speaker

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target,
  Crown,
  Brain,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useCrownVaultImpact, useElitePulse } from "@/contexts/elite-pulse-context"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface CrownVaultImpactProps {
  className?: string
  onActionClick?: (action: string, context: any) => void
}

export function CrownVaultImpact({ className, onActionClick }: CrownVaultImpactProps) {
  const crownVaultData = useCrownVaultImpact()
  const { trackIntelligenceAction } = useElitePulse()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
    
    trackIntelligenceAction('crown_vault_impact', 'section_toggle', { section: sectionId })
  }

  const handleActionClick = (action: string, context: any) => {
    trackIntelligenceAction('crown_vault_impact', action, context)
    onActionClick?.(action, context)
  }

  const threatLevelConfig = useMemo(() => {
    const config: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
      HIGH: {
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: AlertTriangle,
        label: "High Risk"
      },
      MEDIUM: {
        color: "text-orange-600", 
        bgColor: "bg-orange-50 border-orange-200",
        icon: Clock,
        label: "Medium Risk"
      },
      LOW: {
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200", 
        icon: Shield,
        label: "Low Risk"
      }
    }
    return config
  }, [])

  if (!crownVaultData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Crown Vault Impact Analysis</h3>
            <Badge variant="outline" className="text-xs">Katherine Sterling-Chen</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Crown className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>Crown Vault impact analysis not available</p>
            <p className="text-sm">Ensure you have portfolio assets configured</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full intelligence-card persona-katherine", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative intelligence-pulse">
              <Crown className="h-6 w-6 text-primary" />
              <Brain className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold intelligence-accent-gold">Crown Vault Impact Analysis</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs intelligence-badge">Katherine Sterling-Chen</Badge>
                <Badge variant="outline" className="text-xs">Harvard MBA '14</Badge>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground score-animation">
                    Confidence: {(crownVaultData.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleActionClick('refresh_analysis', {})}
            className="text-xs"
          >
            Refresh Analysis
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Executive Summary Section */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Executive Summary</h4>
            </div>
            {expandedSections.has('summary') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has('summary') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="leading-relaxed text-foreground font-medium">
                  {crownVaultData.executive_summary}
                </p>
                <div className="flex items-center mt-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Family Office Advisory • Total Exposure: {crownVaultData.total_exposure}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Immediate Threats Section */}
        {crownVaultData.immediate_threats && crownVaultData.immediate_threats.length > 0 && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('threats')}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-semibold">Immediate Threats</h4>
                <Badge variant="destructive" className="text-xs">
                  {crownVaultData.immediate_threats.length} Assets At Risk
                </Badge>
              </div>
              {expandedSections.has('threats') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('threats') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {crownVaultData.immediate_threats.map((threat, index) => {
                  const config = threatLevelConfig[threat.risk_level]
                  const ThreatIcon = config.icon

                  return (
                    <div
                      key={index}
                      className={cn("p-4 rounded-lg border-2", config.bgColor)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <ThreatIcon className={cn("h-5 w-5", config.color)} />
                          <div>
                            <h5 className="font-semibold">{threat.asset}</h5>
                            <Badge variant="outline" className={cn("text-xs mt-1", config.color)}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{threat.exposure_amount}</p>
                          <p className="text-sm text-muted-foreground">Exposure</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">30-Day Impact:</p>
                          <p className="text-sm">{threat.thirty_day_impact}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Required Action:</p>
                          <p className="text-sm font-semibold">{threat.action_required}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => handleActionClick('threat_action', {
                          asset: threat.asset,
                          risk_level: threat.risk_level,
                          action: threat.action_required
                        })}
                      >
                        Take Action
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* Hedging Opportunities Section */}
        {crownVaultData.hedging_opportunities && crownVaultData.hedging_opportunities.length > 0 && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('hedging')}
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold">Hedging Opportunities</h4>
                <Badge variant="secondary" className="text-xs">
                  {crownVaultData.hedging_opportunities.length} Strategies
                </Badge>
              </div>
              {expandedSections.has('hedging') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('hedging') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {crownVaultData.hedging_opportunities.map((opportunity, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-green-50 border-2 border-green-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold">{opportunity.strategy}</h5>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {opportunity.timeline}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Rationale:</p>
                        <p className="text-sm">{opportunity.rationale}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Implementation:</p>
                        <p className="text-sm font-semibold">{opportunity.implementation}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="mt-3 w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleActionClick('hedging_opportunity', {
                        strategy: opportunity.strategy,
                        timeline: opportunity.timeline
                      })}
                    >
                      Explore Strategy
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Peer Intelligence Section */}
        {crownVaultData.peer_intelligence && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('peer')}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">Peer Intelligence</h4>
                <Badge variant="outline" className="text-xs">Family Offices</Badge>
              </div>
              {expandedSections.has('peer') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('peer') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Market Movement:</p>
                    <p className="text-sm font-semibold">{crownVaultData.peer_intelligence.market_move}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Family Office Activity:</p>
                    <p className="text-sm font-semibold">{crownVaultData.peer_intelligence.family_office_activity}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Timing Advantage:</p>
                    <p className="text-sm font-semibold text-blue-600">{crownVaultData.peer_intelligence.timing_advantage}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Whisper Intelligence Section */}
        {crownVaultData.whisper_intelligence && (
          <div className="space-y-3">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => toggleSection('whisper')}
            >
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">Whisper Intelligence</h4>
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  Insider Perspective
                </Badge>
              </div>
              {expandedSections.has('whisper') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {expandedSections.has('whisper') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200">
                  <div className="relative">
                    <div className="absolute -left-1 top-0 w-0.5 h-full bg-gradient-to-b from-purple-600 to-purple-400 rounded-full"></div>
                    <blockquote className="text-base leading-relaxed italic font-medium text-foreground pl-4">
                      "{crownVaultData.whisper_intelligence}"
                    </blockquote>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 pt-3 mt-3 border-t border-purple-200">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">
                      Katherine Sterling-Chen • TEDx Speaker
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleActionClick('view_full_analysis', {})}
          >
            View Full Analysis
          </Button>
          <Button
            size="sm"
            onClick={() => handleActionClick('schedule_consultation', {})}
            className="bg-primary hover:bg-primary/90"
          >
            Schedule Consultation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}