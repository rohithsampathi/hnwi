// components/home-dashboard.tsx
// MoE v4 Presidential Intelligence Dashboard
// Transforms HNWI Chronicles into an intelligence command center

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { secureApi } from "@/lib/secure-api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield,
  RefreshCw,
  Crown,
  Target,
  Globe,
  BarChart3,
  AlertTriangle
} from "lucide-react"

// Import our new MoE v4 components
import { ExecutiveBrief } from "@/components/intelligence/executive-brief"
import { OpportunityTiers } from "@/components/intelligence/opportunity-tiers"
import { UrgencyBar } from "@/components/intelligence/urgency-bar"
import { TrustMeters } from "@/components/intelligence/trust-meters"
import { WealthFlow } from "@/components/intelligence/wealth-flow"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/components/auth-provider"
import { useElitePulse } from "@/contexts/elite-pulse-context"

// Intelligence Report Component
function IntelligenceReport({ data }: { data: any }) {
  // Extract intelligence and other data from the complete response
  const intelligence = data?.intelligence
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {/* Elite Pulse Analysis */}
      {intelligence?.elite_pulse?.data && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Elite Pulse Analysis
          </h4>
          
          {intelligence.elite_pulse.data.wealth_migration && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Wealth Migration Intelligence</h5>
              <p className="mb-2">
                <strong>Migration Pattern:</strong> {intelligence.elite_pulse.data.wealth_migration.from} → {intelligence.elite_pulse.data.wealth_migration.to}
              </p>
              <p className="mb-2">
                <strong>Volume:</strong> {intelligence.elite_pulse.data.wealth_migration.volume}
              </p>
              <p className="mb-2">
                <strong>Timeline:</strong> {intelligence.elite_pulse.data.wealth_migration.timeline}
              </p>
              <p className="mb-2">
                <strong>Confidence Score:</strong> {Math.round((intelligence.elite_pulse.data.wealth_migration.confidence_score || 0) * 100)}%
              </p>
              {intelligence.elite_pulse.data.wealth_migration.catalyst_dependencies && (
                <div className="mb-2">
                  <strong>Key Catalysts:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {intelligence.elite_pulse.data.wealth_migration.catalyst_dependencies.map((catalyst: string, i: number) => (
                      <li key={i}>{catalyst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {intelligence.elite_pulse.data.arbitrage_gap && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Arbitrage Opportunity Analysis</h5>
              <p className="mb-2">
                <strong>Current Discount:</strong> {intelligence.elite_pulse.data.arbitrage_gap.current_discount}
              </p>
              <p className="mb-2">
                <strong>Closing Velocity:</strong> {intelligence.elite_pulse.data.arbitrage_gap.closing_velocity}
              </p>
              <p className="mb-2">
                <strong>Optimal Entry Window:</strong> {intelligence.elite_pulse.data.arbitrage_gap.capture_window}
              </p>
              <p className="mb-2">
                <strong>Required Capital:</strong> {intelligence.elite_pulse.data.arbitrage_gap.required_capital_usd}
              </p>
              {intelligence.elite_pulse.data.arbitrage_gap.risk_factors && (
                <div className="mb-2">
                  <strong>Risk Factors:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {intelligence.elite_pulse.data.arbitrage_gap.risk_factors.map((risk: string, i: number) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {intelligence.elite_pulse.data.pattern_recognition && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Pattern Recognition</h5>
              <p className="mb-2">
                <strong>Mega Trend:</strong> {intelligence.elite_pulse.data.pattern_recognition.mega_trend}
              </p>
              <p className="mb-2">
                <strong>Conviction Level:</strong> {intelligence.elite_pulse.data.pattern_recognition.conviction}/10
              </p>
              <p className="mb-2">
                <strong>Statistical Significance:</strong> {intelligence.elite_pulse.data.pattern_recognition.frequency}
              </p>
            </div>
          )}

          {/* The $100K Move */}
          {intelligence.elite_pulse.data.the_100k_move && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">The $100K Strategic Move</h5>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="mb-3 text-green-800 dark:text-green-200">
                  <strong>Action:</strong> {intelligence.elite_pulse.data.the_100k_move.action}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="mb-2"><strong>Entry Capital:</strong> {intelligence.elite_pulse.data.the_100k_move.entry_capital}</p>
                    <p className="mb-2"><strong>Projected Return:</strong> {intelligence.elite_pulse.data.the_100k_move.projected_return}</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Timeline:</strong> {intelligence.elite_pulse.data.the_100k_move.execution_timeline}</p>
                  </div>
                </div>
                {intelligence.elite_pulse.data.the_100k_move.exit_strategy && (
                  <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                    <p className="text-sm"><strong>Exit Strategy:</strong> {intelligence.elite_pulse.data.the_100k_move.exit_strategy}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expensive Problem */}
          {intelligence.elite_pulse.data.expensive_problem && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Expensive Problem Alert</h5>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {intelligence.elite_pulse.data.expensive_problem}
                </p>
              </div>
            </div>
          )}

          {/* Whisper Intelligence */}
          {intelligence.elite_pulse.data.whisper_intelligence && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Whisper Intelligence</h5>
              <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-200 text-sm">
                  {intelligence.elite_pulse.data.whisper_intelligence}
                </p>
              </div>
            </div>
          )}

          {/* Regulatory Compliance Summary */}
          {intelligence.elite_pulse.data.regulatory_compliance && (
            <div className="mb-6">
              <h5 className="font-semibold mb-2">Global Regulatory Compliance</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(intelligence.elite_pulse.data.regulatory_compliance).map(([jurisdiction, details]: [string, any]) => {
                  if (jurisdiction === 'cross_border_considerations' || jurisdiction === 'optimal_structure') return null;
                  return (
                    <div key={jurisdiction} className="bg-muted/20 p-3 rounded-lg">
                      <h6 className="font-medium mb-2 capitalize">{jurisdiction.replace('_', ' ')}</h6>
                      <p className="text-sm mb-1"><strong>Setup Cost:</strong> {details.costs_usd}</p>
                      <p className="text-sm mb-1"><strong>Timeline:</strong> {details.timeline}</p>
                      <p className="text-xs text-muted-foreground">{details.recent_changes}</p>
                    </div>
                  );
                })}
              </div>
              
              {intelligence.elite_pulse.data.regulatory_compliance.optimal_structure && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h6 className="font-medium mb-2">Optimal Structure Recommendation</h6>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    {intelligence.elite_pulse.data.regulatory_compliance.optimal_structure.recommended_jurisdiction}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    {intelligence.elite_pulse.data.regulatory_compliance.optimal_structure.cost_benefit_analysis}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Crown Vault Impact */}
      {intelligence?.crown_vault_impact?.data && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Crown Vault Portfolio Impact
          </h4>
          
          {/* Executive Summary */}
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h5 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Executive Summary</h5>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {intelligence.crown_vault_impact.data.executive_summary.replace(/\*\*/g, '')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-300">
                  {intelligence.crown_vault_impact.data.total_exposure}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Total Exposure</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-300">
                  {Math.round((intelligence.crown_vault_impact.data.confidence_score || 0) * 100)}%
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Confidence Score</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-300">
                  {intelligence.crown_vault_impact.data.portfolio_metadata?.asset_count || 0}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Assets Analyzed</p>
              </div>
            </div>
          </div>

          {/* Immediate Threats */}
          {intelligence.crown_vault_impact.data.immediate_threats && (
            <div className="mb-6">
              <h5 className="font-semibold mb-3">Immediate Portfolio Threats</h5>
              <div className="space-y-3">
                {intelligence.crown_vault_impact.data.immediate_threats.filter((threat: any) => threat.threat_title !== '**').map((threat: any, i: number) => (
                  <div key={i} className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex justify-between items-start mb-2">
                      <h6 className="font-medium text-red-800 dark:text-red-200">{threat.threat_title}</h6>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        threat.urgency === 'HIGH' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                        threat.urgency === 'MEDIUM' ? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200' :
                        'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                      }`}>
                        {threat.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      {threat.threat_description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong>Exposure:</strong> {threat.exposure_amount}
                      </div>
                      <div>
                        <strong>Mitigation:</strong> {threat.mitigation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hedging Opportunities */}
          {intelligence.crown_vault_impact.data.hedging_opportunities && (
            <div className="mb-6">
              <h5 className="font-semibold mb-3">Portfolio Hedging Opportunities</h5>
              <div className="space-y-3">
                {intelligence.crown_vault_impact.data.hedging_opportunities.filter((hedge: any) => hedge.strategy_description !== '**').map((hedge: any, i: number) => (
                  <div key={i} className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h6 className="font-medium text-green-800 dark:text-green-200 mb-2">{hedge.hedging_strategy}</h6>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                      {hedge.strategy_description}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <strong>Timeline:</strong> {hedge.implementation_timeline}
                      </div>
                      <div>
                        <strong>Protection:</strong> {hedge.expected_protection}
                      </div>
                      <div>
                        <strong>Cost:</strong> {hedge.cost_estimate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Katherine's Analysis */}
          {intelligence.crown_vault_impact.data.whisper_intelligence && (
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">Katherine Sterling-Chen Analysis</h5>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                {intelligence.crown_vault_impact.data.whisper_intelligence}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Opportunity Alignment */}
      {intelligence?.opportunity_alignment?.data && Object.keys(intelligence.opportunity_alignment.data).length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Opportunity Alignment
          </h4>
          <div className="bg-muted/20 p-4 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {JSON.stringify(intelligence.opportunity_alignment.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Peer Intelligence */}
      {intelligence?.peer_intelligence?.data && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Peer Intelligence Signals
          </h4>
          <div className="bg-muted/20 p-4 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {JSON.stringify(intelligence.peer_intelligence.data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      {data?.summary && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Executive Summary
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Intelligence Types</h5>
              <p className="text-sm">{data.summary.intelligence_types_available?.length || 0} Available</p>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {data.summary.intelligence_types_available?.map((type: string) => (
                  <span key={type} className="block">• {type.replace('_', ' ')}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-semibold text-green-700 dark:text-green-400 mb-2">Confidence Score</h5>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                {Math.round((data.summary.overall_confidence || 0) * 100)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">Overall Assessment</p>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h5 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Action Required</h5>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-300">
                    {data.summary.action_items || 0} Items
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-300">Immediate Actions</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-300">
                    {data.summary.risk_alerts || 0} Alerts
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">Risk Warnings</p>
                </div>
              </div>
            </div>
          </div>
          
          {data.summary.key_insights && (
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">Key Strategic Insights</h5>
              {data.summary.key_insights.map((insight: string, i: number) => (
                <div key={i} className="mb-3 p-3 bg-background/50 rounded border-l-4 border-primary">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance Metrics */}
      {data?.performance && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            System Performance
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Response Time</h5>
              <p className="text-2xl font-bold text-primary">
                {Math.round(data.performance.response_time_ms)}ms
              </p>
              <p className="text-xs text-muted-foreground">API Response</p>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Data Freshness</h5>
              <p className="text-2xl font-bold text-primary">
                {Math.round(data.performance.data_freshness_hours)}h
              </p>
              <p className="text-xs text-muted-foreground">Last Updated</p>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Last Generation</h5>
              <p className="text-sm">
                {new Date(data.performance.last_generation).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Intelligence Refresh</p>
            </div>
          </div>
        </div>
      )}

      {/* HNWI World Integration */}
      {data?.hnwi_world_integration && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            HNWI World Integration
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Analysis Scope</h5>
              <p className="mb-2">
                <strong>Briefs Analyzed:</strong> {data.hnwi_world_integration.total_briefs_analyzed}
              </p>
              <p className="mb-2">
                <strong>Intelligence Providence:</strong> {data.hnwi_world_integration.intelligence_providence ? 'Enabled' : 'Disabled'}
              </p>
              <p className="mb-2">
                <strong>Tagging System:</strong> {data.hnwi_world_integration.tagging_enabled ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Source Documentation</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Based on {data.hnwi_world_integration.source_brief_ids?.length || 0} source intelligence briefs
              </p>
              <div className="max-h-24 overflow-y-auto text-xs font-mono">
                {data.hnwi_world_integration.source_brief_ids?.slice(0, 5).map((id: string, i: number) => (
                  <div key={i} className="text-muted-foreground">{id}</div>
                ))}
                {data.hnwi_world_integration.source_brief_ids?.length > 5 && (
                  <div className="text-muted-foreground">... +{data.hnwi_world_integration.source_brief_ids.length - 5} more</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Metadata */}
      <div className="mt-8 pt-4 border-t border-border text-sm text-muted-foreground">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p><strong>Request ID:</strong> {data?.request_id}</p>
            <p><strong>User ID:</strong> {data?.user_id?.slice(0, 8)}...</p>
          </div>
          <div>
            <p><strong>Generated:</strong> {new Date(data?.timestamp || Date.now()).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">{data?.status || 'Unknown'}</span></p>
          </div>
          <div>
            <p><strong>Intelligence Confidence:</strong> {Math.round((intelligence?.elite_pulse?.confidence || 0) * 100)}%</p>
            {intelligence?.generated_at && (
              <p><strong>Intelligence Generated:</strong> {new Date(intelligence.generated_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface HomeDashboardProps {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  onNavigate: (route: string) => void
  isFromSignupFlow?: boolean
  userData?: any
}

export function HomeDashboard({ 
  user, 
  onNavigate, 
  isFromSignupFlow, 
  userData 
}: HomeDashboardProps) {
  const { theme } = useTheme()
  const { user: authUser, isAuthenticated } = useAuth()
  const { state: elitePulseState, refreshIntelligence } = useElitePulse()
  
  // Use Elite Pulse context data instead of local state
  const intelligenceData = elitePulseState.intelligence.dashboard
  const loading = elitePulseState.intelligence.loading
  const error = elitePulseState.intelligence.error
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('executive-brief')

  // Intelligence data is handled by Elite Pulse context

  // Load intelligence on mount - handled by Elite Pulse context
  useEffect(() => {
    // Elite Pulse context handles automatic loading
  }, [userData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshIntelligence()
    setRefreshing(false)
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Late Night Intelligence Brief"
    if (hour < 12) return "Morning Intelligence Brief"  
    if (hour < 17) return "Midday Intelligence Update"
    if (hour < 22) return "Evening Intelligence Brief"
    return "Night Watch Intelligence"
  }

  // Debug loading state
  console.log('🎯 MoE v4: Current render state:', { 
    loading, 
    hasIntelligenceData: !!intelligenceData,
    error,
    refreshing,
    userData: !!userData,
    userDataKeys: userData ? Object.keys(userData) : [],
    timestamp: new Date().toISOString()
  })

  // Loading state
  if (loading && !intelligenceData) {
    console.log('🎯 MoE v4: Showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CrownLoader size="lg" text="Loading MoE v4 Intelligence System..." />
      </div>
    )
  }

  // Error state
  if (error && !intelligenceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
            <h3 className="text-lg font-semibold">Intelligence System Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Intelligence Load
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Presidential Brief Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {getTimeBasedGreeting()}, <span className="text-primary">{user.firstName}</span>
              </h1>
              <p className="text-muted-foreground">
                What elite intelligence requires your immediate attention
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {refreshing && (
                <div className="flex items-center space-x-2 text-primary">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Updating...</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Intelligence
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Urgency Bar - Always visible */}
        <UrgencyBar 
          intelligence={intelligenceData?.intelligence}
          onUrgencyClick={(urgency) => {
            console.log('🎯 Urgency clicked:', urgency)
            setActiveTab('opportunities')
          }}
        />

        {/* Intelligence Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive-brief" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Executive Brief
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="wealth-flow" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Wealth Flow
            </TabsTrigger>
            <TabsTrigger value="trust-metrics" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="crown-vault" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Crown Vault
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive-brief" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">Executive Intelligence Summary</h3>
                
                {/* Raw Data Overview */}
                {intelligenceData && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-primary mb-4">Complete Endpoint Response</h4>
                    <div className="bg-muted/20 p-4 rounded-lg border">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Raw JSON Data</span>
                        <span className="text-xs text-muted-foreground">
                          Size: {JSON.stringify(intelligenceData).length.toLocaleString()} characters
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                          {JSON.stringify(intelligenceData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Structured Intelligence Report */}
                {intelligenceData ? (
                  <IntelligenceReport data={intelligenceData} />
                ) : (
                  <p className="text-muted-foreground">No intelligence data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <OpportunityTiers
              intelligence={intelligenceData?.intelligence}
              onOpportunitySelect={(opportunity) => {
                console.log('🎯 Opportunity selected:', opportunity)
                // Could trigger navigation to detailed view
              }}
            />
          </TabsContent>

          <TabsContent value="wealth-flow" className="mt-6">
            <WealthFlow intelligence={intelligenceData?.intelligence} />
          </TabsContent>

          <TabsContent value="trust-metrics" className="mt-6">
            <TrustMeters intelligence={intelligenceData?.intelligence} />
          </TabsContent>

          <TabsContent value="crown-vault" className="mt-6">
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <Crown className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Crown Vault Integration</h3>
                <p className="text-muted-foreground">
                  Advanced portfolio impact analysis powered by Katherine Sterling-Chen
                </p>
                <Button 
                  onClick={() => onNavigate('crown-vault')}
                  className="mt-4"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Access Crown Vault
                </Button>
                
                {/* Crown Vault Impact Preview */}
                {console.log('🔍 HOME DASHBOARD Crown Vault Tab Check:', {
                  hasIntelligenceData: !!intelligenceData,
                  intelligenceDataKeys: intelligenceData ? Object.keys(intelligenceData) : [],
                  hasIntelligence: !!intelligenceData?.intelligence,
                  intelligenceKeys: intelligenceData?.intelligence ? Object.keys(intelligenceData.intelligence) : [],
                  hasCrownVaultImpact: !!intelligenceData?.intelligence?.crown_vault_impact,
                  crownVaultImpact: intelligenceData?.intelligence?.crown_vault_impact,
                  hasCrownVaultData: !!intelligenceData?.intelligence?.crown_vault_impact?.data,
                  crownVaultData: intelligenceData?.intelligence?.crown_vault_impact?.data,
                  executiveSummary: intelligenceData?.intelligence?.crown_vault_impact?.data?.executive_summary
                })}
                {intelligenceData?.intelligence?.crown_vault_impact?.data ? (
                  <div className="mt-6 p-4 bg-muted/20 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Portfolio Impact Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      {intelligenceData.intelligence.crown_vault_impact.data.executive_summary ||
                       "Advanced portfolio analysis available"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-left">
                    <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Crown Vault Initialization</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      Portfolio impact analysis will be available once you connect your Crown Vault assets. 
                      Our AI will analyze how intelligence opportunities affect your specific holdings.
                    </p>
                    <div className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                      • Real-time portfolio impact scoring<br/>
                      • Risk-adjusted opportunity matching<br/>
                      • Katherine Sterling-Chen AI guidance
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Navigation */}
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <h3 className="font-semibold">Quick Access</h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('prive-exchange')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Privé Exchange
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('strategy-vault')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Strategy Vault
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('social-hub')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Social Hub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Footer */}
        <Card className="border-muted-foreground/20">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Intelligence powered by <span className="font-medium text-primary">MoE v4 Presidential Brief System</span>
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <span>6 Expert Specialists</span>
                <span>•</span>
                <span>Real-time Analysis</span>
                <span>•</span>
                <span>$25K Monthly Value</span>
                <span>•</span>
                <span>83:1 ROI</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Generated for: {user.firstName} {user.lastName} • Classification: HNWI Intelligence
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}