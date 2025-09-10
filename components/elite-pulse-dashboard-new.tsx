// components/elite-pulse-dashboard-new.tsx
// NEW Elite Pulse Dashboard - Redesigned for Intelligence Dashboard Backend

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Brain, 
  Crown,
  Target,
  Users,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Sparkles,
  Shield,
  Eye,
  Zap
} from "lucide-react"
import { 
  useElitePulse, 
  useElitePulseData,
  useCrownVaultImpact,
  useOpportunityAlignment, 
  usePeerIntelligence,
  useIntelligenceLoading,
  useIntelligenceError
} from "@/contexts/elite-pulse-context"
import { useAuth } from "@/components/auth-provider"
import { CrownLoader } from "@/components/ui/crown-loader"

interface ElitePulseDashboardNewProps {
  onLoadingComplete?: () => void
  userData?: any
}

export function ElitePulseDashboardNew({ onLoadingComplete, userData }: ElitePulseDashboardNewProps = {}) {
  // Authentication state
  const { user, isAuthenticated } = useAuth()
  
  // New Intelligence Dashboard hooks
  const { state, refreshIntelligence, trackIntelligenceView, trackIntelligenceAction, fetchIntelligenceDashboard } = useElitePulse()
  const elitePulseData = useElitePulseData()
  const crownVaultImpact = useCrownVaultImpact()
  const opportunityAlignment = useOpportunityAlignment()
  const peerIntelligence = usePeerIntelligence()
  const isLoading = useIntelligenceLoading()
  const error = useIntelligenceError()


  // Show raw ruscha intelligence data
  const ruschaData = (state?.intelligence?.dashboard?.intelligence as any)?.ruscha_intelligence?.data

  // UI State
  const [activeSection, setActiveSection] = useState('overview')
  const [showFullDashboard, setShowFullDashboard] = useState(false)

  // Refs for scrolling
  const overviewRef = useRef<HTMLDivElement>(null)
  const wealthMigrationRef = useRef<HTMLDivElement>(null)
  const arbitrageRef = useRef<HTMLDivElement>(null)
  const patternRef = useRef<HTMLDivElement>(null)
  const hundredKMoveRef = useRef<HTMLDivElement>(null)
  const whisperRef = useRef<HTMLDivElement>(null)
  const crownVaultRef = useRef<HTMLDivElement>(null)
  const opportunitiesRef = useRef<HTMLDivElement>(null)
  const peerIntelRef = useRef<HTMLDivElement>(null)

  // Handle loading completion
  useEffect(() => {
    if (!isLoading && onLoadingComplete) {
      onLoadingComplete()
    }
  }, [isLoading, onLoadingComplete])

  // Debug logging
  useEffect(() => {
    const effectiveUser = userData || user;
  }, [userData, user, elitePulseData, isLoading, error, state.intelligence])

  // Manual fetch with userData
  const handleManualFetch = () => {
    const effectiveUser = userData || user;
    const userId = effectiveUser?.user_id || effectiveUser?.id;
    
    
    if (userId) {
      // Use the hook that was called at component level
      fetchIntelligenceDashboard(userId, { force: true });
    } else {
      refreshIntelligence();
    }
  }

  // Track intelligence view when data loads
  useEffect(() => {
    if (elitePulseData && state.intelligence.dashboard) {
      trackIntelligenceView('elite_pulse', state.intelligence.dashboard.user_id)
    }
  }, [elitePulseData, state.intelligence.dashboard, trackIntelligenceView])

  // Show loading state only when actually loading
  if (isLoading && !elitePulseData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <CrownLoader 
          size="lg" 
          text="Loading Elite Pulse Intelligence..." 
        />
      </div>
    )
  }

  // Show error state
  if (error && !elitePulseData) {
    return (
      <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-muted-foreground">Elite Pulse Intelligence temporarily unavailable</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refreshIntelligence()}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show empty state
  if (!elitePulseData) {
    return (
      <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Brain className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-muted-foreground">No Elite Pulse Intelligence available</p>
              <p className="text-sm text-muted-foreground mt-2">Intelligence will be generated based on your portfolio and market conditions.</p>
            </div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={handleManualFetch}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Intelligence
              </Button>
              <div className="text-xs text-muted-foreground">
                UserData: {userData ? 'Yes' : 'No'} | Auth: {user ? 'Yes' : 'No'} | Loading: {isLoading ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get confidence score from intelligence result
  const intelligenceResult = state.intelligence.dashboard?.intelligence?.elite_pulse
  const confidenceScore = intelligenceResult?.confidence ? (intelligenceResult.confidence * 100).toFixed(0) : '85'
  const generatedAt = intelligenceResult?.generated_at ? new Date(intelligenceResult.generated_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'GMT'
  }) : new Date().toLocaleString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'GMT'
  })

  // Generate headline from elite pulse data
  const getHeadline = () => {
    if (!elitePulseData.wealth_migration) return "ELITE PULSE INTELLIGENCE: IMMEDIATE ACTION WINDOW"
    
    const volume = elitePulseData.wealth_migration.volume
    const discount = elitePulseData.arbitrage_gap?.current_discount
    const trend = elitePulseData.pattern_recognition?.mega_trend

    // Extract meaningful amounts from volume text
    const billionMatch = volume?.match(/[€$£]?(\d+(?:[.,]\d+)?)\s*[Bb]illion?/i)
    const millionMatch = volume?.match(/(\d+(?:,\d+)?)\s*(?:UK\s+)?millionaires?/i)
    
    if (billionMatch) {
      const amount = billionMatch[1]
      const discountPercent = discount?.match(/(\d+(?:-\d+)?)%/)?.[1]
      if (discountPercent) {
        return `${volume.includes('€') ? '€' : '$'}${amount}B WEALTH SHIFT: ${discountPercent}% ARBITRAGE WINDOW`
      }
      return `${volume.includes('€') ? '€' : '$'}${amount}B CAPITAL MIGRATION: IMMEDIATE OPPORTUNITY`
    }
    
    if (millionMatch && trend) {
      const count = millionMatch[1]
      const trendKeyword = trend.split(' ')[0].toUpperCase()
      return `${count} HNW EXODUS: ${trendKeyword} ACCELERATION`
    }
    
    if (trend) {
      const mainTrend = trend.split(' ').slice(0, 3).join(' ').toUpperCase()
      return `${mainTrend}: ELITE POSITIONING REQUIRED`
    }
    
    return "ELITE INTELLIGENCE: IMMEDIATE ACTION WINDOW"
  }

  const headline = getHeadline()

  return (
    <div className="space-y-6">
      {/* Intelligence Overview Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {headline}
          </h1>
          {elitePulseData.pattern_recognition?.mega_trend && (
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {elitePulseData.pattern_recognition.mega_trend}
            </p>
          )}
        </div>
        
        {/* Intelligence Metadata */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Generated: {generatedAt} GMT</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">{confidenceScore}% Confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>4 Intelligence Types</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowFullDashboard(!showFullDashboard)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showFullDashboard ? 'Hide' : 'Show'} Full Analysis
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            refreshIntelligence()
            trackIntelligenceAction('manual_refresh', { timestamp: Date.now() })
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wealth Migration Card */}
        {elitePulseData.wealth_migration && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Wealth Migration</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">From</p>
                    <p className="text-sm font-medium">
                      {elitePulseData.wealth_migration.from_ || elitePulseData.wealth_migration.from || "Traditional markets"}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 text-primary animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">To</p>
                    <p className="text-sm font-medium text-primary">
                      {elitePulseData.wealth_migration.to}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Volume</p>
                    <p className="text-sm font-semibold">{elitePulseData.wealth_migration.volume}</p>
                  </div>
                  {elitePulseData.wealth_migration.timeline && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Timeline</p>
                      <p className="text-sm italic">{elitePulseData.wealth_migration.timeline}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Arbitrage Gap Card */}
        {elitePulseData.arbitrage_gap && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Arbitrage Opportunity</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Discount</p>
                    <p className="text-lg font-bold text-green-600">
                      {elitePulseData.arbitrage_gap.current_discount}
                    </p>
                  </div>
                  {elitePulseData.arbitrage_gap.closing_velocity && (
                    <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Velocity</p>
                      <p className="text-lg font-bold text-orange-600">
                        {elitePulseData.arbitrage_gap.closing_velocity}
                      </p>
                    </div>
                  )}
                </div>
                
                {elitePulseData.arbitrage_gap.capture_window && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Capture Window</p>
                    <p className="text-sm">{elitePulseData.arbitrage_gap.capture_window}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pattern Recognition Card */}
        {elitePulseData.pattern_recognition && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pattern Recognition</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Mega Trend</p>
                  <p className="text-sm font-medium">{elitePulseData.pattern_recognition.mega_trend}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Conviction Level</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${(elitePulseData.pattern_recognition.conviction || 0) * 10}%` }}
                      />
                    </div>
                    <Badge variant={(elitePulseData.pattern_recognition.conviction || 0) > 0.7 ? 'default' : 'secondary'}>
                      {((elitePulseData.pattern_recognition.conviction || 0) * 10).toFixed(0)}/10
                    </Badge>
                  </div>
                </div>
                
                {elitePulseData.pattern_recognition.frequency && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Frequency</p>
                    <p className="text-sm">{elitePulseData.pattern_recognition.frequency}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* The 100K Move Card */}
        {elitePulseData.the_100k_move && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">The £100K Move</h3>
                <Badge variant="default">Executive Action</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Action</p>
                  <p className="text-sm font-medium leading-relaxed">
                    {elitePulseData.the_100k_move.action}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Entry Capital</p>
                    <p className="text-lg font-bold text-primary">
                      {elitePulseData.the_100k_move.entry_capital?.replace('100000 USD', '$100K')}
                    </p>
                  </div>
                  {elitePulseData.the_100k_move.projected_return && (
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Projected Return</p>
                      <p className="text-lg font-bold text-green-600">
                        {elitePulseData.the_100k_move.projected_return.match(/(\d+(?:-\d+)?)%/)?.[0] || "28-35% IRR"}
                      </p>
                    </div>
                  )}
                </div>

                {elitePulseData.the_100k_move.execution_timeline && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Timeline</p>
                    <p className="text-sm">{elitePulseData.the_100k_move.execution_timeline}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Whisper Intelligence - Full Width */}
      {elitePulseData.whisper_intelligence && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Whisper Intelligence</h3>
              <Badge variant="outline" className="border-amber-300 text-amber-700">Insider Perspectives</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <blockquote className="text-base leading-relaxed italic font-medium text-amber-800 dark:text-amber-300">
              "{elitePulseData.whisper_intelligence}"
            </blockquote>
            <div className="flex items-center justify-center space-x-2 pt-4 mt-4 border-t border-amber-200 dark:border-amber-800">
              <Brain className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Family offices • Sovereign funds • Private banks
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Dashboard Expansion */}
      <AnimatePresence>
        {showFullDashboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Crown Vault Intelligence */}
            {crownVaultImpact && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Crown Vault Impact Analysis</h3>
                    <Badge variant="outline">Katherine Sterling-Chen</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">{crownVaultImpact.executive_summary}</p>
                    
                    {crownVaultImpact.immediate_threats && crownVaultImpact.immediate_threats.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Immediate Threats</h4>
                        <div className="space-y-2">
                          {crownVaultImpact.immediate_threats.slice(0, 2).map((threat: any, index: number) => (
                            <div key={index} className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{threat.asset}</span>
                                <Badge variant="destructive" size="sm">{threat.risk_level}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{threat.thirty_day_impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Opportunity Alignment */}
            {opportunityAlignment && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Opportunity Alignment</h3>
                    <Badge variant="outline">Viktor Rajesh-Volkov</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunityAlignment.high_conviction && opportunityAlignment.high_conviction.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">High Conviction Opportunities</h4>
                        <div className="space-y-2">
                          {opportunityAlignment.high_conviction.slice(0, 2).map((opp: any, index: number) => (
                            <div key={index} className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm">{opp.opportunity}</span>
                                <Badge variant="default" size="sm">{Math.round(opp.alignment_score * 100)}%</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{opp.thesis}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Peer Intelligence */}
            {peerIntelligence && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Peer Intelligence</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{peerIntelligence.active_members_today}</p>
                      <p className="text-xs text-muted-foreground">Active Today</p>
                    </div>
                    <div className="text-center">
                      <Badge variant={peerIntelligence.activity_level === 'HIGH' ? 'default' : 'secondary'}>
                        {peerIntelligence.activity_level}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Activity Level</p>
                    </div>
                    <div className="text-center">
                      <Badge variant={peerIntelligence.timing_signals?.urgency_level === 'HIGH' ? 'destructive' : 'outline'}>
                        {peerIntelligence.timing_signals?.urgency_level || 'NORMAL'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Urgency</p>
                    </div>
                  </div>
                  
                  {peerIntelligence.whisper_network && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm italic">"{peerIntelligence.whisper_network}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intelligence Attribution */}
      <div className="mt-8 pt-6 border-t border-border/40">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Analysis powered by <span className="font-medium text-primary">Elite Pulse Intelligence System</span>
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <span>Katherine Sterling-Chen • Crown Vault Analysis</span>
            <span>•</span>
            <span>Viktor Rajesh-Volkov • Opportunity Scoring</span>
          </div>
        </div>
      </div>
    </div>
  )
}