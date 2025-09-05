// components/intelligence-dashboard.tsx
// Master Intelligence Dashboard - Orchestrates all Elite Pulse Intelligence
// World-Class Centralized Intelligence Display

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Crown,
  Target,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
  Eye
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
import { CrownVaultAssetsTags } from "./unused/intelligence/crown-vault-assets-tags"
import { OpportunityAlignment } from "./intelligence/opportunity-alignment"
import { PeerIntelligence } from "./intelligence/peer-intelligence"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface IntelligenceDashboardProps {
  className?: string
  defaultTab?: 'overview' | 'crown_vault' | 'opportunities' | 'peer'
  onIntelligenceAction?: (action: string, context: any) => void
}

export function IntelligenceDashboard({ 
  className, 
  defaultTab = 'overview',
  onIntelligenceAction 
}: IntelligenceDashboardProps) {
  const { 
    state, 
    refreshIntelligence, 
    hasIntelligence, 
    isStale, 
    lastUpdateTime,
    performanceMetrics,
    trackIntelligenceAction
  } = useElitePulse()
  
  const elitePulseData = useElitePulseData()
  const crownVaultData = useCrownVaultImpact()
  const opportunityData = useOpportunityAlignment()
  const peerData = usePeerIntelligence()
  const isLoading = useIntelligenceLoading()
  const error = useIntelligenceError()
  
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleIntelligenceAction = (action: string, context: any) => {
    trackIntelligenceAction('intelligence_dashboard', action, context)
    onIntelligenceAction?.(action, context)
  }

  const handleRefresh = async () => {
    handleIntelligenceAction('manual_refresh', { timestamp: Date.now() })
    await refreshIntelligence()
  }

  // Intelligence availability summary
  const intelligenceSummary = useMemo(() => {
    return {
      elitePulse: {
        available: !!elitePulseData,
        confidence: elitePulseData?.pattern_recognition?.conviction || 0,
        status: !!elitePulseData ? 'active' : 'unavailable'
      },
      crownVault: {
        available: !!crownVaultData,
        confidence: crownVaultData?.confidence_score || 0,
        threatsCount: crownVaultData?.immediate_threats?.length || 0,
        opportunitiesCount: crownVaultData?.hedging_opportunities?.length || 0,
        status: !!crownVaultData ? 'active' : 'unavailable'
      },
      opportunities: {
        available: !!opportunityData,
        totalOpportunities: opportunityData?.total_opportunities || 0,
        highConviction: opportunityData?.high_conviction?.length || 0,
        mediumConviction: opportunityData?.medium_conviction?.length || 0,
        status: !!opportunityData ? 'active' : 'unavailable'
      },
      peer: {
        available: !!peerData,
        activeMembers: peerData?.active_members_today || 0,
        activityLevel: peerData?.activity_level || 'UNKNOWN',
        urgencyLevel: peerData?.timing_signals?.urgency_level || 'NORMAL',
        status: !!peerData ? 'active' : 'unavailable'
      }
    }
  }, [elitePulseData, crownVaultData, opportunityData, peerData])

  if (isLoading && !hasIntelligence) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-xl font-bold">Loading Intelligence Dashboard...</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                <div className="text-lg font-medium">Processing Intelligence</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                {[
                  { label: "Elite Pulse", icon: Brain },
                  { label: "Crown Vault", icon: Crown },
                  { label: "Opportunities", icon: Target },
                  { label: "Peer Intel", icon: Users }
                ].map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                      <Icon className={cn("h-5 w-5 mx-auto mb-1", 
                        index === 0 ? "text-primary animate-pulse" : "text-muted-foreground"
                      )} />
                      <div className="text-xs text-center">{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !hasIntelligence) {
    return (
      <Card className={cn("w-full border-red-200", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold">Intelligence System Error</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              Intelligence dashboard is temporarily unavailable
            </p>
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              onClick={handleRefresh}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Intelligence Load
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Intelligence Dashboard Header */}
      <Card className="intelligence-card border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative intelligence-pulse">
                <Brain className="h-7 w-7 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold intelligence-accent-gold">Elite Pulse Intelligence</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant="secondary" className="text-xs intelligence-glow">
                    Real-time Analysis
                  </Badge>
                  {isStale && (
                    <Badge variant="outline" className="text-xs text-orange-600 alert-slide">
                      Data Stale
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Last Updated: {lastUpdateTime}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {performanceMetrics && (
                <div className="text-right text-xs text-muted-foreground">
                  <div>Processing: {performanceMetrics.total_processing_time_ms}ms</div>
                  <div>Cost: ${performanceMetrics.total_cost_usd.toFixed(3)}</div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Intelligence Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 intelligence-card neural-flow">
              <Brain className={cn("h-5 w-5 mx-auto mb-1 score-animation", 
                intelligenceSummary.elitePulse.available ? "text-green-600" : "text-muted-foreground"
              )} />
              <div className="text-sm font-semibold">Elite Pulse</div>
              <div className="text-xs text-muted-foreground">
                {intelligenceSummary.elitePulse.available 
                  ? `${(intelligenceSummary.elitePulse.confidence * 10).toFixed(0)}/10 Confidence`
                  : 'Unavailable'
                }
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-purple/5 border border-purple/20 intelligence-card persona-katherine">
              <Crown className={cn("h-5 w-5 mx-auto mb-1 score-animation",
                intelligenceSummary.crownVault.available ? "text-purple-600" : "text-muted-foreground"  
              )} />
              <div className="text-sm font-semibold">Crown Vault</div>
              <div className="text-xs text-muted-foreground">
                {intelligenceSummary.crownVault.available 
                  ? `${intelligenceSummary.crownVault.threatsCount} Threats • ${intelligenceSummary.crownVault.opportunitiesCount} Hedges`
                  : 'Unavailable'
                }
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-blue/5 border border-blue/20 intelligence-card persona-viktor">
              <Target className={cn("h-5 w-5 mx-auto mb-1 score-animation",
                intelligenceSummary.opportunities.available ? "text-blue-600" : "text-muted-foreground"
              )} />
              <div className="text-sm font-semibold">Opportunities</div>
              <div className="text-xs text-muted-foreground">
                {intelligenceSummary.opportunities.available 
                  ? `${intelligenceSummary.opportunities.highConviction} High • ${intelligenceSummary.opportunities.mediumConviction} Medium`
                  : 'Unavailable'
                }
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-orange/5 border border-orange/20 intelligence-card data-flow">
              <Users className={cn("h-5 w-5 mx-auto mb-1 score-animation",
                intelligenceSummary.peer.available ? "text-orange-600" : "text-muted-foreground"
              )} />
              <div className="text-sm font-semibold">Peer Intel</div>
              <div className="text-xs text-muted-foreground">
                {intelligenceSummary.peer.available 
                  ? `${intelligenceSummary.peer.activeMembers} Active • ${intelligenceSummary.peer.activityLevel} Activity`
                  : 'Unavailable'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value as any)
        handleIntelligenceAction('tab_change', { tab: value })
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className={cn("text-xs intelligence-tab", activeTab === "overview" && "active")}>
            <Eye className="h-3 w-3 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="crown_vault" className={cn("text-xs intelligence-tab", activeTab === "crown_vault" && "active")}>
            <Crown className="h-3 w-3 mr-1" />
            Crown Vault
          </TabsTrigger>
          <TabsTrigger value="opportunities" className={cn("text-xs intelligence-tab", activeTab === "opportunities" && "active")} disabled={!intelligenceSummary.opportunities.available}>
            <Target className="h-3 w-3 mr-1" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="peer" className={cn("text-xs intelligence-tab", activeTab === "peer" && "active")} disabled={!intelligenceSummary.peer.available}>
            <Users className="h-3 w-3 mr-1" />
            Peer Intel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <motion.div
            key={`overview-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Grid - All Intelligence Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Elite Pulse Intelligence - Core Data */}
              {intelligenceSummary.elitePulse.available && (
                <Card className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Elite Pulse Intelligence</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(intelligenceSummary.elitePulse.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Wealth Migration */}
                    {elitePulseData?.wealth_migration && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <h4 className="text-sm font-semibold text-primary mb-2">Wealth Migration</h4>
                        <div className="text-sm">
                          <p><strong>From:</strong> {elitePulseData.wealth_migration.from}</p>
                          <p><strong>To:</strong> {elitePulseData.wealth_migration.to}</p>
                          {elitePulseData.wealth_migration.volume && (
                            <p><strong>Volume:</strong> {elitePulseData.wealth_migration.volume}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Arbitrage Gap */}
                    {elitePulseData?.arbitrage_gap && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <h4 className="text-sm font-semibold text-primary mb-2">Arbitrage Opportunity</h4>
                        <div className="text-sm">
                          <p><strong>Current Discount:</strong> {elitePulseData.arbitrage_gap.current_discount}</p>
                          {elitePulseData.arbitrage_gap.closing_velocity && (
                            <p><strong>Velocity:</strong> {elitePulseData.arbitrage_gap.closing_velocity}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Pattern Recognition */}
                    {elitePulseData?.pattern_recognition && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <h4 className="text-sm font-semibold text-primary mb-2">Pattern Recognition</h4>
                        <div className="text-sm">
                          <p><strong>Mega Trend:</strong> {elitePulseData.pattern_recognition.mega_trend}</p>
                          {elitePulseData.pattern_recognition.conviction && (
                            <div className="flex items-center mt-2">
                              <span className="text-xs font-medium mr-2">Conviction:</span>
                              <Badge variant={elitePulseData.pattern_recognition.conviction > 0.7 ? 'default' : 'secondary'}>
                                {(elitePulseData.pattern_recognition.conviction * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* The 100K Move */}
                    {elitePulseData?.the_100k_move && (
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <h4 className="text-sm font-semibold text-primary mb-2">💎 The £100K Move</h4>
                        <div className="text-sm">
                          <p><strong>Action:</strong> {elitePulseData.the_100k_move.action}</p>
                          <p><strong>Entry Capital:</strong> {elitePulseData.the_100k_move.entry_capital}</p>
                          {elitePulseData.the_100k_move.projected_return && (
                            <p><strong>Projected Return:</strong> {elitePulseData.the_100k_move.projected_return}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Whisper Intelligence */}
                    {elitePulseData?.whisper_intelligence && (
                      <div className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">🤫 Whisper Intelligence</h4>
                        <p className="text-sm italic text-amber-700 dark:text-amber-300">
                          {elitePulseData.whisper_intelligence}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Crown Vault Assets Tags */}
              <CrownVaultAssetsTags 
                key="crown-vault-assets-overview"
                onActionClick={(action, context) => handleIntelligenceAction(`crown_vault_${action}`, context)}
              />

              {/* Opportunity Alignment */}
              {intelligenceSummary.opportunities.available && (
                <OpportunityAlignment 
                  key="opportunities-overview"
                  onOpportunityClick={(opportunity) => handleIntelligenceAction('opportunity_selected', opportunity)}
                />
              )}

              {/* Peer Intelligence */}
              {intelligenceSummary.peer.available && (
                <PeerIntelligence 
                  key="peer-overview"
                  onPeerActionClick={(action, context) => handleIntelligenceAction(`peer_${action}`, context)}
                />
              )}

              {/* Elite Pulse Core Data */}
              {intelligenceSummary.elitePulse.available && (
                <Card key="elite-pulse-overview">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Core Elite Pulse</h3>
                      <Badge variant="outline" className="text-xs">
                        Confidence: {(intelligenceSummary.elitePulse.confidence * 10).toFixed(0)}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Wealth Migration:</span>
                        <p className="text-sm font-semibold">
                          {elitePulseData?.wealth_migration?.from_ || elitePulseData?.wealth_migration?.from} → {elitePulseData?.wealth_migration?.to}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Arbitrage Gap:</span>
                        <p className="text-sm font-semibold">{elitePulseData?.arbitrage_gap?.current_discount}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Pattern:</span>
                        <p className="text-sm">{elitePulseData?.pattern_recognition?.mega_trend}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => handleIntelligenceAction('view_full_elite_pulse', {})}
                      >
                        View Full Elite Pulse Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="crown_vault" className="mt-6">
          <motion.div
            key={`crown-vault-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CrownVaultAssetsTags 
              onActionClick={(action, context) => handleIntelligenceAction(`crown_vault_${action}`, context)}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <motion.div
            key={`opportunities-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <OpportunityAlignment 
              onOpportunityClick={(opportunity) => handleIntelligenceAction('opportunity_selected', opportunity)}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="peer" className="mt-6">
          <motion.div
            key={`peer-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PeerIntelligence 
              onPeerActionClick={(action, context) => handleIntelligenceAction(`peer_${action}`, context)}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}