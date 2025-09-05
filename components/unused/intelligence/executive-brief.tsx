// components/intelligence/executive-brief.tsx
// Executive Intelligence Brief - Presidential Daily Brief Style

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  Zap
} from "lucide-react"
import { parseRuschaIntelligence, type ParsedIntelligence } from "@/lib/intelligence-parser"

interface ExecutiveBriefProps {
  intelligence: any
  onRefresh?: () => void
  className?: string
}

export function ExecutiveBrief({ intelligence, onRefresh, className }: ExecutiveBriefProps) {
  const [parsedData, setParsedData] = useState<ParsedIntelligence | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    console.log('🎯 ExecutiveBrief: Intelligence data received:', {
      hasIntelligence: !!intelligence,
      hasRuschaIntelligence: !!intelligence?.ruscha_intelligence,
      hasOpportunityAlignment: !!intelligence?.opportunity_alignment,
      hasElitePulse: !!intelligence?.elite_pulse
    })
    
    // Use actual JSON structure from backend
    if (intelligence?.ruscha_intelligence || intelligence?.opportunity_alignment || intelligence?.elite_pulse) {
      console.log('🎯 ExecutiveBrief: Processing structured JSON data')
      
      const ruscha = intelligence?.ruscha_intelligence
      const opportunities = intelligence?.opportunity_alignment?.victor_analysis?.analyzed_opportunities || []
      const elitePulse = intelligence?.elite_pulse
      
      // Extract executive summary from ruscha analysis
      let executiveSummary = ''
      if (ruscha?.ruscha_analysis) {
        const summaryMatch = ruscha.ruscha_analysis.match(/\*\*EXECUTIVE INTELLIGENCE SUMMARY\*\*\n\n([^*]+)/i)
        if (summaryMatch) {
          executiveSummary = summaryMatch[1].trim()
        }
      }
      
      // Build parsed data from actual JSON structure
      const structuredParsed = {
        executiveSummary: executiveSummary || 
          "Crown Vault intelligence identifies critical wealth optimization patterns emerging from current market developments.",
        
        opportunities: opportunities.map((opp: any, index: number) => ({
          tier: opp.victor_rating === 'juicy' ? 1 : opp.victor_rating === 'moderate' ? 2 : 3,
          title: opp.title || `Strategic Opportunity ${index + 1}`,
          juiciness: opp.victor_rating?.toUpperCase() || 'MODERATE',
          reasoning: opp.victor_reasoning || "Strategic positioning opportunity identified"
        })),
        
        timingWindows: opportunities.filter((opp: any) => opp.victor_action === 'BUY').map((opp: any) => ({
          opportunity: opp.title || "Market Window",
          urgency: opp.victor_rating === 'juicy' ? 'urgent' : 
                  opp.victor_rating === 'moderate' ? 'medium' : 'strategic',
          duration: opp.investmentHorizon || "Strategic timeline"
        })),
        
        wealthMigration: elitePulse?.wealth_migration ? {
          volume: elitePulse.wealth_migration.volume || "Significant capital movement",
          from: elitePulse.wealth_migration.from || "Traditional Markets",
          to: elitePulse.wealth_migration.to || "Alternative Assets"
        } : null,
        
        marketAssessment: {
          juicy: opportunities.filter((o: any) => o.victor_rating === 'juicy').map((o: any) => o.title),
          moderate: opportunities.filter((o: any) => o.victor_rating === 'moderate').map((o: any) => o.title),
          farFetched: opportunities.filter((o: any) => o.victor_rating === 'far_fetched').map((o: any) => o.title)
        },
        
        confidence: ruscha?.confidence || intelligence?.elite_pulse?.confidence || 0.9,
        generatedAt: ruscha?.generated_at || new Date().toISOString(),
        expertsAnalyzed: 6,
        hoursInvested: "120+ hours"
      }
      
      console.log('🎯 ExecutiveBrief: Structured data processed:', {
        opportunitiesCount: structuredParsed.opportunities.length,
        timingWindowsCount: structuredParsed.timingWindows.length,
        hasWealthMigration: !!structuredParsed.wealthMigration,
        marketAssessment: {
          juicy: structuredParsed.marketAssessment.juicy.length,
          moderate: structuredParsed.marketAssessment.moderate.length,
          farFetched: structuredParsed.marketAssessment.farFetched.length
        }
      })
      
      setParsedData(structuredParsed)
    } else {
      console.log('🎯 ExecutiveBrief: No intelligence data found')
      setParsedData(null)
    }
  }, [intelligence])

  if (!parsedData) {
    return (
      <Card className={`border-border/40 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Brain className="h-5 w-5 animate-pulse" />
            <span>Preparing intelligence brief...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const urgentOpportunities = parsedData.timingWindows.filter(w => w.urgency === 'urgent').length
  const mediumOpportunities = parsedData.timingWindows.filter(w => w.urgency === 'medium').length
  const strategicOpportunities = parsedData.timingWindows.filter(w => w.urgency === 'strategic').length

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Executive Brief Header */}
      <Card className="bg-gradient-to-r from-background to-muted/20 border-2 border-primary/20 relative overflow-hidden">
        {/* Subtle watermark */}
        <div className="absolute top-4 right-4 text-[0.7rem] font-mono text-muted-foreground/30 uppercase tracking-wider">
          HNWI INTELLIGENCE
        </div>
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Elite Intelligence Brief
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="default" className="text-xs">
                    Confidence: {(parsedData.confidence * 100).toFixed(0)}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Generated {getTimeAgo(parsedData.generatedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex"
              >
                <Eye className="h-4 w-4 mr-2" />
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Executive Summary */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                Executive Summary
              </h3>
              <p className="text-foreground leading-relaxed">
                {parsedData.executiveSummary}
              </p>
              {parsedData.wealthMigration && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-primary">
                    {parsedData.wealthMigration.volume} detected from {parsedData.wealthMigration.from} to {parsedData.wealthMigration.to}
                  </p>
                </div>
              )}
            </div>

            {/* Analysis Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {parsedData.expertsAnalyzed}/6
                </div>
                <div className="text-xs text-muted-foreground">
                  Expert Consensus
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-amber-600">
                  {parsedData.hoursInvested}
                </div>
                <div className="text-xs text-muted-foreground">
                  Deep Analysis
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ${intelligence?.processing_metadata?.cost_usd ? (25000).toLocaleString() : '25,000'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly Value
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Required Bar */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">ACTION REQUIRED</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-600 font-medium">{urgentOpportunities} Urgent</span>
                <span className="text-muted-foreground">(72h window)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-amber-600 font-medium">{mediumOpportunities} Medium</span>
                <span className="text-muted-foreground">(3mo)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="text-muted-foreground">{strategicOpportunities} Strategic</span>
                <span className="text-muted-foreground">(6mo)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Timing Intelligence
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedData.timingWindows.map((window, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{window.opportunity}</div>
                        <div className="text-sm text-muted-foreground">{window.duration} implementation window</div>
                      </div>
                    </div>
                    <Badge variant={window.urgency === 'urgent' ? 'default' : 'outline'}>
                      {window.urgency.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Intelligence Assessment */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Market Intelligence Assessment
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parsedData.marketAssessment.juicy.length > 0 && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="font-semibold text-green-700 dark:text-green-400 mb-2">
                      JUICY Opportunities
                    </div>
                    <div className="space-y-1 text-sm text-green-600 dark:text-green-300">
                      {parsedData.marketAssessment.juicy.map((item, index) => (
                        <div key={index}>• {item}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {parsedData.marketAssessment.moderate.length > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      MODERATE Opportunities
                    </div>
                    <div className="space-y-1 text-sm text-amber-600 dark:text-amber-300">
                      {parsedData.marketAssessment.moderate.map((item, index) => (
                        <div key={index}>• {item}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {parsedData.marketAssessment.farFetched.length > 0 && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-muted-foreground/20">
                    <div className="font-semibold text-muted-foreground mb-2">
                      FAR-FETCHED Opportunities
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {parsedData.marketAssessment.farFetched.map((item, index) => (
                        <div key={index}>• {item}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}