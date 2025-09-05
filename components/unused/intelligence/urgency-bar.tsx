// components/intelligence/urgency-bar.tsx
// Urgency Dashboard Bar - Presidential Brief Style Action Required Bar

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  Timer
} from "lucide-react"
import { 
  parseRuschaIntelligence, 
  type ParsedIntelligence,
  getUrgencyColor
} from "@/lib/intelligence-parser"

interface UrgencyBarProps {
  intelligence: any
  onUrgencyClick?: (urgency: 'urgent' | 'medium' | 'strategic') => void
  className?: string
}

export function UrgencyBar({ intelligence, onUrgencyClick, className }: UrgencyBarProps) {
  const [parsedData, setParsedData] = useState<ParsedIntelligence | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    console.log('🎯 UrgencyBar: Intelligence received:', {
      hasIntelligence: !!intelligence,
      hasOpportunityAlignment: !!intelligence?.opportunity_alignment,
      hasElitePulse: !!intelligence?.elite_pulse,
      hasPeerSignals: !!intelligence?.peer_signals
    })
    
    // Use actual JSON structure from backend
    if (intelligence?.opportunity_alignment || intelligence?.elite_pulse || intelligence?.peer_signals) {
      const opportunities = intelligence?.opportunity_alignment?.victor_analysis?.analyzed_opportunities || []
      const peerSignals = intelligence?.peer_signals
      const elitePulse = intelligence?.elite_pulse
      
      // Build timing windows from opportunities and peer signals
      const timingWindows = [
        // From opportunities marked as BUY or HOLD
        ...opportunities
          .filter((opp: any) => opp.victor_action === 'BUY' || opp.victor_action === 'HOLD')
          .map((opp: any) => ({
            opportunity: opp.title || "Market Opportunity",
            urgency: opp.victor_rating === 'juicy' ? 'urgent' :
                    opp.victor_rating === 'moderate' ? 'medium' : 'strategic',
            duration: opp.investmentHorizon || "Strategic timeline"
          })),
        
        // From peer signals timing
        ...(peerSignals?.timing_signals ? [{
          opportunity: "Peer Network Action Window",
          urgency: peerSignals.timing_signals.urgency_level === 'HIGH' ? 'urgent' : 'medium',
          duration: peerSignals.timing_signals.window_closing || "60-90 days"
        }] : []),
        
        // From elite pulse arbitrage gap
        ...(elitePulse?.arbitrage_gap ? [{
          opportunity: "Elite Arbitrage Window",
          urgency: elitePulse.arbitrage_gap.closing_velocity?.includes('18-24') ? 'urgent' : 'medium',
          duration: elitePulse.arbitrage_gap.capture_window || "24-42 months"
        }] : [])
      ]
      
      const structuredParsed = {
        timingWindows,
        opportunities: opportunities.map((opp: any, index: number) => ({
          title: opp.title || `Strategic Opportunity ${index + 1}`,
          juiciness: opp.victor_rating?.toUpperCase() || 'MODERATE'
        })),
        confidence: intelligence?.ruscha_intelligence?.confidence || 0.9,
        generatedAt: new Date().toISOString(),
        expertsAnalyzed: 6,
        hoursInvested: "120+ hours",
        executiveSummary: "",
        wealthMigration: null,
        marketAssessment: {
          juicy: opportunities.filter((o: any) => o.victor_rating === 'juicy').map((o: any) => o.title),
          moderate: opportunities.filter((o: any) => o.victor_rating === 'moderate').map((o: any) => o.title),
          farFetched: opportunities.filter((o: any) => o.victor_rating === 'far_fetched').map((o: any) => o.title)
        }
      }
      
      console.log('🎯 UrgencyBar: Structured timing windows:', timingWindows)
      setParsedData(structuredParsed)
    }
  }, [intelligence])

  if (!parsedData || parsedData.timingWindows.length === 0) {
    return (
      <Card className={`border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <Timer className="h-5 w-5 animate-pulse" />
            <span className="font-medium">Analyzing timing intelligence...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const urgentActions = parsedData.timingWindows.filter(w => w.urgency === 'urgent')
  const mediumActions = parsedData.timingWindows.filter(w => w.urgency === 'medium')
  const strategicActions = parsedData.timingWindows.filter(w => w.urgency === 'strategic')

  const getTimeWindow = (duration: string): string => {
    if (duration.includes('4-week') || duration.includes('72')) return '72h remaining'
    if (duration.includes('3-month')) return '3mo window'
    if (duration.includes('6-month')) return '6mo planning'
    return duration
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-amber-600" />
      case 'strategic': return <TrendingUp className="h-4 w-4 text-muted-foreground" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className={className}>
      {/* Main Urgency Bar */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-red-500/5 sticky top-0 z-10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left: Main Alert */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <AlertTriangle className="h-6 w-6 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              </div>
              <div>
                <div className="font-bold text-primary text-lg">ACTION REQUIRED</div>
                <div className="text-sm text-muted-foreground">
                  {urgentActions.length + mediumActions.length + strategicActions.length} opportunities require attention
                </div>
              </div>
            </div>

            {/* Center: Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => onUrgencyClick?.('urgent')}
                className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{urgentActions.length}</div>
                  <div className="text-xs text-red-500">URGENT</div>
                </div>
                <div className="text-xs text-red-600">72h</div>
              </button>

              <button
                onClick={() => onUrgencyClick?.('medium')}
                className="flex items-center space-x-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">{mediumActions.length}</div>
                  <div className="text-xs text-amber-600">MEDIUM</div>
                </div>
                <div className="text-xs text-amber-600">3mo</div>
              </button>

              <button
                onClick={() => onUrgencyClick?.('strategic')}
                className="flex items-center space-x-2 p-2 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <div className="text-center">
                  <div className="text-lg font-bold text-muted-foreground">{strategicActions.length}</div>
                  <div className="text-xs text-muted-foreground">STRATEGIC</div>
                </div>
                <div className="text-xs text-muted-foreground">6mo</div>
              </button>
            </div>

            {/* Right: Expand Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Details</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Mobile Quick Stats */}
          <div className="md:hidden mt-4 flex justify-between">
            <button
              onClick={() => onUrgencyClick?.('urgent')}
              className="flex-1 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 mr-2"
            >
              <div className="text-lg font-bold text-red-600">{urgentActions.length}</div>
              <div className="text-xs text-red-500">URGENT (72h)</div>
            </button>
            <button
              onClick={() => onUrgencyClick?.('medium')}
              className="flex-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mx-1"
            >
              <div className="text-lg font-bold text-amber-600">{mediumActions.length}</div>
              <div className="text-xs text-amber-600">MEDIUM (3mo)</div>
            </button>
            <button
              onClick={() => onUrgencyClick?.('strategic')}
              className="flex-1 p-2 rounded-lg bg-muted/30 border border-border ml-2"
            >
              <div className="text-lg font-bold text-muted-foreground">{strategicActions.length}</div>
              <div className="text-xs text-muted-foreground">STRATEGIC (6mo)</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-t-0 rounded-t-none border-primary/20">
              <CardContent className="p-4 pt-6">
                <div className="space-y-6">
                  
                  {/* Urgent Actions */}
                  {urgentActions.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-red-600">Urgent Actions</h3>
                        <Badge variant="destructive">{urgentActions.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {urgentActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <div>
                                <div className="font-medium text-red-700 dark:text-red-400">
                                  {action.opportunity}
                                </div>
                                <div className="text-sm text-red-600 dark:text-red-500">
                                  {getTimeWindow(action.duration)}
                                </div>
                              </div>
                            </div>
                            <Zap className="h-4 w-4 text-red-500" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium-term Actions */}
                  {mediumActions.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-700">Medium-term Planning</h3>
                        <Badge variant="outline" className="border-amber-300 text-amber-700">
                          {mediumActions.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {mediumActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              <div>
                                <div className="font-medium text-amber-700 dark:text-amber-400">
                                  {action.opportunity}
                                </div>
                                <div className="text-sm text-amber-600 dark:text-amber-500">
                                  {getTimeWindow(action.duration)}
                                </div>
                              </div>
                            </div>
                            <Clock className="h-4 w-4 text-amber-500" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strategic Actions */}
                  {strategicActions.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-muted-foreground">Strategic Positioning</h3>
                        <Badge variant="outline">{strategicActions.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {strategicActions.map((action, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {action.opportunity}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {getTimeWindow(action.duration)}
                                </div>
                              </div>
                            </div>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}