// components/home-dashboard-v3.tsx
// Clean rebuild of MoE v4 Presidential Intelligence Dashboard
// Built specifically for actual JSON data structure from backend

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Shield,
  RefreshCw,
  Crown,
  Target,
  Globe,
  BarChart3,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  Eye,
  Zap,
  ArrowRight
} from "lucide-react"

import { CrownLoader } from "@/components/ui/crown-loader"
import { useTheme } from "@/contexts/theme-context"

interface HomeDashboardV3Props {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  onNavigate: (route: string) => void
  isFromSignupFlow?: boolean
  userData?: any
}

export function HomeDashboardV3({ 
  user, 
  onNavigate, 
  isFromSignupFlow, 
  userData 
}: HomeDashboardV3Props) {
  const { theme } = useTheme()
  
  // State for intelligence data
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('executive-brief')

  // Fetch intelligence data from backend
  const fetchIntelligence = async (forceRefresh = false) => {
    if (!userData?.id && !userData?.user_id) {
      console.log('🎯 HomeDashboardV3: No user ID available')
      setLoading(false)
      return
    }

    try {
      setRefreshing(forceRefresh)
      const userId = userData?.id || userData?.user_id
      console.log('🎯 HomeDashboardV3: Fetching intelligence for user:', userId)
      
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const fullUrl = `${apiBaseUrl}/api/hnwi/intelligence/dashboard/${userId}`
      console.log('🎯 HomeDashboardV3: API URL:', fullUrl)
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`Intelligence API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('🎯 HomeDashboardV3: Raw data received:', data)
      
      setIntelligenceData(data)
      setError(null)
      
    } catch (error: any) {
      console.error('🎯 HomeDashboardV3: Intelligence fetch failed:', error)
      setError(error.message)
      setIntelligenceData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load intelligence on mount
  useEffect(() => {
    fetchIntelligence(true)
  }, [userData])

  const handleRefresh = () => {
    fetchIntelligence(true)
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Late Night Intelligence Brief"
    if (hour < 12) return "Morning Intelligence Brief"  
    if (hour < 17) return "Midday Intelligence Update"
    if (hour < 22) return "Evening Intelligence Brief"
    return "Night Watch Intelligence"
  }

  // Loading state
  if (loading && !intelligenceData) {
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

  // Parse intelligence data for UI
  const parseIntelligenceData = () => {
    if (!intelligenceData?.intelligence) return null

    const intel = intelligenceData.intelligence
    
    // Extract opportunities from victor_analysis
    const opportunities = intel?.opportunity_alignment?.victor_analysis?.analyzed_opportunities || []
    
    // Extract wealth migration from elite_pulse
    const wealthMigration = intel?.elite_pulse?.wealth_migration
    
    // Extract executive summary from ruscha_analysis
    let executiveSummary = ''
    if (intel?.ruscha_intelligence?.ruscha_analysis) {
      const summaryMatch = intel.ruscha_intelligence.ruscha_analysis.match(
        /\*\*EXECUTIVE INTELLIGENCE SUMMARY\*\*\n\n([^*]+)/i
      )
      if (summaryMatch) {
        executiveSummary = summaryMatch[1].trim()
      }
    }

    // Create timing windows from opportunities
    const timingWindows = opportunities
      .filter((opp: any) => opp.victor_action === 'BUY' || opp.victor_action === 'HOLD')
      .map((opp: any) => ({
        opportunity: opp.title,
        urgency: opp.victor_rating === 'juicy' ? 'urgent' :
                opp.victor_rating === 'moderate' ? 'medium' : 'strategic',
        duration: opp.investmentHorizon || 'Strategic timeline'
      }))

    return {
      executiveSummary,
      opportunities,
      timingWindows,
      wealthMigration,
      confidence: intel?.ruscha_intelligence?.confidence || 0.9,
      generatedAt: intel?.ruscha_intelligence?.generated_at || new Date().toISOString()
    }
  }

  const parsedData = parseIntelligenceData()
  
  if (!parsedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">No Intelligence Data Available</h3>
            <p className="text-muted-foreground">Intelligence system is initializing</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Intelligence
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Count urgency levels
  const urgentCount = parsedData.timingWindows.filter(w => w.urgency === 'urgent').length
  const mediumCount = parsedData.timingWindows.filter(w => w.urgency === 'medium').length
  const strategicCount = parsedData.timingWindows.filter(w => w.urgency === 'strategic').length

  // Count opportunities by rating
  const juicyOpportunities = parsedData.opportunities.filter((o: any) => o.victor_rating === 'juicy')
  const moderateOpportunities = parsedData.opportunities.filter((o: any) => o.victor_rating === 'moderate')
  const farFetchedOpportunities = parsedData.opportunities.filter((o: any) => o.victor_rating === 'far_fetched')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Urgency Bar */}
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <AlertTriangle className="h-6 w-6 text-primary animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">ACTION REQUIRED</div>
                  <div className="text-sm text-muted-foreground">
                    {parsedData.timingWindows.length} opportunities require attention
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{urgentCount}</div>
                    <div className="text-xs text-red-500">URGENT</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{mediumCount}</div>
                    <div className="text-xs text-amber-600">MEDIUM</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-2 rounded-lg bg-muted/30 border border-border">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-muted-foreground">{strategicCount}</div>
                    <div className="text-xs text-muted-foreground">STRATEGIC</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive-brief">
              <Shield className="h-3 w-3 mr-1" />
              Executive Brief
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <Target className="h-3 w-3 mr-1" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="wealth-flow">
              <Globe className="h-3 w-3 mr-1" />
              Wealth Flow
            </TabsTrigger>
            <TabsTrigger value="quality">
              <BarChart3 className="h-3 w-3 mr-1" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="crown-vault">
              <Crown className="h-3 w-3 mr-1" />
              Crown Vault
            </TabsTrigger>
          </TabsList>

          {/* Executive Brief Tab */}
          <TabsContent value="executive-brief" className="mt-6">
            <Card className="bg-gradient-to-r from-background to-muted/20 border-2 border-primary/20">
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
                          Generated recently
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Executive Summary
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {parsedData.executiveSummary || "Elite intelligence analysis reveals significant market opportunities requiring immediate attention."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-primary">
                        6/6
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Expert Consensus
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        120+ hours
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deep Analysis
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        $25,000
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Monthly Value
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* JUICY Opportunities */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <h3 className="font-semibold text-green-700 dark:text-green-400 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    JUICY ({juicyOpportunities.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {juicyOpportunities.map((opp: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="font-medium text-green-700 dark:text-green-400 text-sm">
                          {opp.title}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                          {opp.value} • {opp.investmentHorizon}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* MODERATE Opportunities */}
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <h3 className="font-semibold text-amber-700 dark:text-amber-400 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    MODERATE ({moderateOpportunities.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moderateOpportunities.map((opp: any, index: number) => (
                      <div key={index} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                        <div className="font-medium text-amber-700 dark:text-amber-400 text-sm">
                          {opp.title}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                          {opp.value} • {opp.investmentHorizon}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAR-FETCHED Opportunities */}
              <Card className="border-muted-foreground/20">
                <CardHeader>
                  <h3 className="font-semibold text-muted-foreground flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    FAR-FETCHED ({farFetchedOpportunities.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {farFetchedOpportunities.map((opp: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/20 rounded-lg">
                        <div className="font-medium text-sm">
                          {opp.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {opp.value} • {opp.investmentHorizon}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wealth Flow Tab */}
          <TabsContent value="wealth-flow" className="mt-6">
            {parsedData.wealthMigration ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Wealth Migration Intelligence</h2>
                      <p className="text-sm text-muted-foreground">Real-time capital flow analysis</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-primary mb-2">
                      {parsedData.wealthMigration.volume}
                    </h3>
                    <p className="text-muted-foreground">
                      Capital movement detected across multiple sectors
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full">
                          <TrendingUp className="h-8 w-8 text-red-600" />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground uppercase mb-2">
                        Exiting From
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {parsedData.wealthMigration.from}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowRight className="h-12 w-12 text-primary" />
                    </div>

                    <div className="text-center">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full">
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-muted-foreground uppercase mb-2">
                        Moving Into
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {parsedData.wealthMigration.to}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Wealth Migration Data</h3>
                  <p className="text-muted-foreground">Wealth flow analysis not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Intelligence Quality Metrics</h3>
                <p className="text-muted-foreground">
                  Trust and validation metrics for MoE v4 intelligence system
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {(parsedData.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Confidence Score</div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {parsedData.opportunities.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Opportunities Analyzed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crown Vault Tab */}
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
                
                {intelligenceData?.intelligence?.crown_vault_impact ? (
                  <div className="mt-6 p-4 bg-muted/20 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Portfolio Impact Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      {intelligenceData.intelligence.crown_vault_impact.executive_summary || 
                       "Advanced portfolio analysis available"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-left">
                    <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Crown Vault Initialization</h4>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      Portfolio impact analysis will be available once you connect your Crown Vault assets.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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