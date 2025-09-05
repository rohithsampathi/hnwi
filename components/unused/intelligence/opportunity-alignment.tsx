// components/intelligence/opportunity-alignment.tsx
// Viktor Rajesh-Volkov Opportunity Alignment Analysis Component
// Stanford CS '10, Quantitative Hedge Fund Founder, TEDx Speaker

"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Brain,
  Users,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Eye,
  Timer,
  DollarSign,
  Lightbulb,
  XCircle
} from "lucide-react"
import { useOpportunityAlignment, useElitePulse } from "@/contexts/elite-pulse-context"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface OpportunityAlignmentProps {
  className?: string
  onOpportunityClick?: (opportunity: any) => void
}

export function OpportunityAlignment({ className, onOpportunityClick }: OpportunityAlignmentProps) {
  const opportunityData = useOpportunityAlignment()
  const { trackIntelligenceAction } = useElitePulse()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['high_conviction']))
  const [selectedConvictionLevel, setSelectedConvictionLevel] = useState<'high_conviction' | 'medium_conviction' | 'watch_list' | 'avoid'>('high_conviction')

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
    
    trackIntelligenceAction('opportunity_alignment', 'section_toggle', { section: sectionId })
  }

  const handleOpportunityClick = (opportunity: any, action: string) => {
    trackIntelligenceAction('opportunity_alignment', action, opportunity)
    onOpportunityClick?.(opportunity)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 80) return "text-blue-600 bg-blue-100"
    if (score >= 70) return "text-orange-600 bg-orange-100"
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const convictionLevels = useMemo(() => {
    if (!opportunityData) return []
    
    return [
      {
        id: 'high_conviction',
        label: 'High Conviction',
        count: opportunityData.high_conviction?.length || 0,
        description: 'Mortgage the house',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: Target
      },
      {
        id: 'medium_conviction', 
        label: 'Medium Conviction',
        count: opportunityData.medium_conviction?.length || 0,
        description: 'Strong allocation',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: TrendingUp
      },
      {
        id: 'watch_list',
        label: 'Watch List',
        count: opportunityData.watch_list?.length || 0,
        description: 'Worth watching',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: Eye
      },
      {
        id: 'avoid',
        label: 'Avoid',
        count: opportunityData.avoid?.length || 0,
        description: 'Wealth destruction',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: XCircle
      }
    ]
  }, [opportunityData])

  if (!opportunityData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Opportunity Alignment</h3>
            <Badge variant="outline" className="text-xs">Viktor Rajesh-Volkov</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p>Opportunity alignment analysis not available</p>
            <p className="text-sm">Elite Pulse data required for scoring</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Target className="h-6 w-6 text-primary" />
              <Brain className="h-3 w-3 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Opportunity Alignment</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">Viktor Rajesh-Volkov</Badge>
                <Badge variant="outline" className="text-xs">Stanford CS '10</Badge>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {opportunityData.total_opportunities} opportunities analyzed
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpportunityClick(null, 'refresh_scoring')}
            className="text-xs"
          >
            Refresh Scoring
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Conviction Level Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {convictionLevels.map((level) => {
            const Icon = level.icon
            return (
              <button
                key={level.id}
                className={cn(
                  "p-3 rounded-lg border-2 text-left transition-all",
                  selectedConvictionLevel === level.id
                    ? `${level.bgColor} border-current ${level.color}`
                    : "bg-muted/30 border-muted hover:bg-muted/50"
                )}
                onClick={() => {
                  setSelectedConvictionLevel(level.id as any)
                  trackIntelligenceAction('opportunity_alignment', 'conviction_filter', { level: level.id })
                }}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Icon className={cn("h-4 w-4", selectedConvictionLevel === level.id ? level.color : "text-muted-foreground")} />
                  <span className="text-sm font-semibold">{level.count}</span>
                </div>
                <p className="text-xs font-medium">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </button>
            )
          })}
        </div>

        {/* Selected Conviction Level Opportunities */}
        <div className="space-y-4">
          {selectedConvictionLevel === 'high_conviction' && opportunityData.high_conviction && (
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>High Conviction Opportunities (90-100 Score)</span>
              </h4>
              
              {opportunityData.high_conviction.map((opp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-green-50 border-2 border-green-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-bold text-lg">{opp.opportunity}</h5>
                        <div className={cn("px-3 py-1 rounded-full text-sm font-bold", getScoreColor(opp.alignment_score))}>
                          {opp.alignment_score}/100
                        </div>
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-2">{opp.thesis}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Information Edge:</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{opp.information_asymmetry}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Entry Window:</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{opp.entry_window}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Position Size:</span>
                      </div>
                      <p className="text-sm font-bold text-green-600 pl-6">{opp.position_size}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Peer Signals:</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">{opp.peer_signals}</p>
                    </div>
                  </div>

                  {opp.risks && opp.risks.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Key Risks:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {opp.risks.map((risk, riskIndex) => (
                          <div key={riskIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            <span className="text-xs text-muted-foreground">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {opp.exit_triggers && opp.exit_triggers.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Exit Triggers:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        {opp.exit_triggers.map((trigger, triggerIndex) => (
                          <div key={triggerIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span className="text-xs text-muted-foreground">{trigger}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleOpportunityClick(opp, 'view_opportunity')}
                    >
                      View Details
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpportunityClick(opp, 'track_opportunity')}
                    >
                      Track Opportunity
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {selectedConvictionLevel === 'medium_conviction' && opportunityData.medium_conviction && (
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Medium Conviction Opportunities (70-89 Score)</span>
              </h4>
              
              {opportunityData.medium_conviction.map((opp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-bold text-lg">{opp.opportunity}</h5>
                        <div className={cn("px-3 py-1 rounded-full text-sm font-bold", getScoreColor(opp.alignment_score))}>
                          {opp.alignment_score}/100
                        </div>
                      </div>
                      <p className="text-sm font-medium text-blue-700 mb-2">{opp.thesis}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium">Information Edge:</span>
                      <p className="text-sm text-muted-foreground">{opp.information_asymmetry}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Entry Window:</span>
                      <p className="text-sm text-muted-foreground">{opp.entry_window}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Position Size:</span>
                      <p className="text-sm font-bold text-blue-600">{opp.position_size}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Peer Signals:</span>
                      <p className="text-sm text-muted-foreground">{opp.peer_signals}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpportunityClick(opp, 'view_opportunity')}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpportunityClick(opp, 'add_to_watchlist')}
                    >
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedConvictionLevel === 'watch_list' && opportunityData.watch_list && (
            <div className="space-y-3">
              <h4 className="font-semibold text-orange-600 flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Watch List (50-69 Score)</span>
              </h4>
              
              {opportunityData.watch_list.map((opp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-orange-50 border-2 border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-semibold">{opp.opportunity}</h5>
                        <div className={cn("px-2 py-1 rounded-full text-xs font-bold", getScoreColor(opp.alignment_score))}>
                          {opp.alignment_score}/100
                        </div>
                      </div>
                      <p className="text-sm font-medium text-orange-700">{opp.thesis}</p>
                      <p className="text-sm text-muted-foreground mt-1">{opp.reasoning}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpportunityClick(opp, 'monitor_opportunity')}
                    >
                      Monitor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedConvictionLevel === 'avoid' && opportunityData.avoid && (
            <div className="space-y-3">
              <h4 className="font-semibold text-red-600 flex items-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Avoid List (0-49 Score)</span>
              </h4>
              
              {opportunityData.avoid.map((opp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-red-50 border-2 border-red-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="font-semibold">{opp.opportunity}</h5>
                        <div className={cn("px-2 py-1 rounded-full text-xs font-bold", getScoreColor(opp.score))}>
                          {opp.score}/100
                        </div>
                      </div>
                      <p className="text-sm font-medium text-red-700">{opp.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market Insights */}
        <div className="border-t pt-4 space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-purple-900">Market Insight</span>
            </div>
            <p className="text-sm text-purple-800 font-medium">
              {opportunityData.market_insight}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-900">Timing Edge</span>
            </div>
            <p className="text-sm text-orange-800 font-medium">
              {opportunityData.timing_edge}
            </p>
          </div>
        </div>

        {/* Viktor's Signature */}
        <div className="text-center pt-4 border-t">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Viktor Rajesh-Volkov • Stanford CS '10 • TEDx Speaker
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            "The 18-Month Window: Why Timing Beats Everything"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}