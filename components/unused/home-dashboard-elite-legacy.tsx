// components/home-dashboard-elite.tsx
// Elite HNWI Intelligence Dashboard - State of the Art Implementation
// Designed to rival Goldman Sachs Private Wealth and JP Morgan Private Bank interfaces

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { secureApi } from "@/lib/secure-api"
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
  ArrowRight,
  ArrowUpRight,
  Activity,
  PieChart,
  Users,
  Calendar,
  Star,
  Award,
  Briefcase,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from "lucide-react"

import { CrownLoader } from "@/components/ui/crown-loader"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface HomeDashboardEliteProps {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  onNavigate: (route: string) => void
  isFromSignupFlow?: boolean
  userData?: any
}

export function HomeDashboardElite({ 
  user, 
  onNavigate, 
  isFromSignupFlow, 
  userData 
}: HomeDashboardEliteProps) {
  const { theme } = useTheme()
  
  // State management
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  // Animation states
  const [metricsAnimated, setMetricsAnimated] = useState(false)

  // Real-time clock
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Authentication successful - user ID and token available

  // Fetch intelligence data
  const fetchIntelligence = async (forceRefresh = false) => {
    // Try multiple sources for user ID (following app-content.tsx pattern)
    const userId = userData?.id || userData?.user_id || userData?.userId || userData?._id || localStorage.getItem('userId')
    
    if (!userId) {
      console.log('⚠️ No user ID found, skipping intelligence fetch')
      setLoading(false)
      return
    }

    try {
      setRefreshing(forceRefresh)
      
      const data = await secureApi.get(`/api/hnwi/intelligence/dashboard/${userId}`)
      
      console.log('🔍 FULL API RESPONSE:', data)
      console.log('🔍 TOP LEVEL KEYS:', Object.keys(data || {}))
      console.log('🔍 Intelligence keys:', Object.keys(data?.intelligence || {}))
      
      setIntelligenceData(data)
      setError(null)
      setMetricsAnimated(true)
      
    } catch (error: any) {
      console.error('Elite Dashboard: Intelligence fetch failed:', error)
      setError(error.message)
      setIntelligenceData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchIntelligence(true)
  }, [userData])

  // Handle debug logging flag to prevent spam
  useEffect(() => {
    if (intelligenceData?.intelligence && !(window as any).__dataLogged) {
      ;(window as any).__dataLogged = true
    }
  }, [intelligenceData])

  const handleRefresh = () => {
    fetchIntelligence(true)
  }

  // Data processing functions
  const processIntelligenceData = () => {
    if (!intelligenceData?.intelligence) {
      return null
    }

    const intel = intelligenceData.intelligence
    
    // Extract opportunities from MoE v4 structure
    let opportunities = []
    
    // Based on debug info, opportunities are in opportunity_alignment.data
    if (intel?.opportunity_alignment?.data) {
      const opportunityData = intel.opportunity_alignment.data
      // Found data structure
      
      // Try different possible structures within data
      if (Array.isArray(opportunityData)) {
        opportunities = opportunityData
      } else if (opportunityData.opportunities) {
        opportunities = opportunityData.opportunities
      } else if (opportunityData.analyzed_opportunities) {
        opportunities = opportunityData.analyzed_opportunities
      } else if (opportunityData.victor_analysis?.analyzed_opportunities) {
        opportunities = opportunityData.victor_analysis.analyzed_opportunities
      } else {
        // Log the structure to understand the format
        console.log('🔍 opportunity_alignment.data structure:', opportunityData)
      }
    }
    
    // Extract Crown Vault impacted assets
    let impactedAssets = []
    if (intel?.crown_vault_impact?.data) {
      const crownVaultData = intel.crown_vault_impact.data
      if (crownVaultData.immediate_threats) {
        impactedAssets = crownVaultData.immediate_threats
      }
    }

    // Extract Network/Peer Intelligence data
    let networkData = null
    if (intel?.crown_vault_impact?.data?.peer_intelligence) {
      networkData = intel.crown_vault_impact.data.peer_intelligence
    }

    // Extract Wealth Flow data
    let wealthFlowData = null
    if (intel?.wealth_flow?.data) {
      wealthFlowData = intel.wealth_flow.data
    }
    // Elite Pulse data removed as requested


    
    // Extract peer signals
    const peerSignals = intel?.peer_signals
    
    // Extract comprehensive Ruscha intelligence data
    const ruschaData = intelligenceData?.intelligence?.ruscha_intelligence
    console.log('🔧 RUSCHA DATA ACCESS:', ruschaData)
    console.log('🔧 RUSCHA DATA KEYS:', Object.keys(ruschaData || {}))
    console.log('🔧 RUSCHA DATA LENGTH:', ruschaData?.data?.length)
    let executiveSummary = ''
    let tier1Opportunities = []
    let tier2Opportunities = []
    let tier3Opportunities = []
    let marketIntelligence = ''
    let timingAnalysis = ''
    let implementationRoadmap = ''

    if (ruschaData?.data) {
      const analysisText = ruschaData.data
      
      // Extract executive summary
      const summaryMatch = analysisText.match(
        /\*\*EXECUTIVE INTELLIGENCE SUMMARY\*\*\s*\n\n(.*?)(?=\n\n\*\*|$)/s
      )
      if (summaryMatch) {
        executiveSummary = summaryMatch[1].trim()
      }

      // Extract Tier 1 opportunities ($100K)
      const tier1Match = analysisText.match(
        /\*\*TIER 1: \$100K OPPORTUNITIES\*\*.*?\n\n(.*?)(?=\n\n\*\*TIER 2|$)/s
      )
      if (tier1Match) {
        // Parse individual tier 1 opportunities
        const tier1Text = tier1Match[1]
        const opportunityMatches = tier1Text.match(/\d+\.\s\*\*([^*]+)\*\*[^1-9]*?(?=\n\s*\d+\.|$)/gs)
        if (opportunityMatches) {
          tier1Opportunities = opportunityMatches.slice(0, 3).map(match => {
            const titleMatch = match.match(/\d+\.\s\*\*([^*]+)\*\*/) || []
            const capitalMatch = match.match(/Total Capital Required: ([^-\n]+)/) || []
            const riskMatch = match.match(/Risk Rating: ([^-\n]+)/) || []
            return {
              title: titleMatch[1]?.trim(),
              capital: capitalMatch[1]?.trim(),
              risk: riskMatch[1]?.trim(),
              content: match.trim()
            }
          }).filter(opp => opp.title)
        }
      }

      // Extract market intelligence
      const marketMatch = analysisText.match(
        /\*\*MARKET INTELLIGENCE ASSESSMENT\*\*\s*\n\n(.*?)(?=\n\n\*\*|$)/s
      )
      if (marketMatch) {
        marketIntelligence = marketMatch[1].trim()
      }

      // Extract timing analysis
      const timingMatch = analysisText.match(
        /\*\*TIMING CATALYST ANALYSIS\*\*\s*\n\n(.*?)(?=\n\n\*\*|$)/s
      )
      if (timingMatch) {
        timingAnalysis = timingMatch[1].trim()
      }
    }

    // Elite Pulse processing removed as requested

    // Debug logging simplified
    if (opportunities?.length > 0 && !window.__dataDebugLogged) {
      window.__dataDebugLogged = true
      console.log('🎯 SUCCESS: Found', opportunities.length, 'opportunities!')
      console.log('👑 Crown Vault data available:', !!intel?.crown_vault_impact)
      console.log('💰 Impacted assets found:', impactedAssets.length)
    }
    

    // Ensure opportunities is an array
    opportunities = Array.isArray(opportunities) ? opportunities : []
    
    // Categorize opportunities
    const juicyOpportunities = opportunities.filter((o: any) => o.victor_rating === 'juicy')
    const moderateOpportunities = opportunities.filter((o: any) => o.victor_rating === 'moderate')
    const farFetchedOpportunities = opportunities.filter((o: any) => o.victor_rating === 'far_fetched')
    
    
    // Calculate total values
    const totalOpportunityValue = opportunities.reduce((sum: number, opp: any) => {
      const value = parseFloat(opp.value?.replace(/[$,]/g, '') || '0')
      return sum + value
    }, 0)

    return {
      executiveSummary,
      opportunities,
      juicyOpportunities,
      moderateOpportunities, 
      farFetchedOpportunities,
      peerSignals,
      totalOpportunityValue,
      confidence: (intel?.ruscha_intelligence?.confidence || 85) / 100,
      generatedAt: intel?.ruscha_intelligence?.generated_at || intelligenceData?.processing_metadata?.timestamp || new Date().toISOString(),
      // New data
      impactedAssets,
      networkData,
      wealthFlowData,
      // Elite Pulse data removed
      // Ruscha intelligence data
      tier1Opportunities,
      tier2Opportunities,
      tier3Opportunities,
      marketIntelligence,
      timingAnalysis
    }
  }

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Late Night Intelligence Brief"
    if (hour < 12) return "Morning Intelligence Brief"  
    if (hour < 17) return "Midday Intelligence Update"
    if (hour < 22) return "Evening Intelligence Brief"
    return "Night Watch Intelligence"
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Loading state
  if (loading && !intelligenceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CrownLoader size="lg" text="Initializing Elite Intelligence System..." />
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error && !intelligenceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md border-red-200 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Intelligence System Error</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Intelligence Load
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const processedData = processIntelligenceData()
  
  if (!processedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="max-w-md bg-background/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Intelligence Initializing</h3>
            <p className="text-muted-foreground">Preparing your personalized intelligence brief</p>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Intelligence
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { 
    opportunities = [], 
    juicyOpportunities = [], 
    moderateOpportunities = [], 
    farFetchedOpportunities = [],
    peerSignals = {},
    totalOpportunityValue = 0,
    executiveSummary = '',
    confidence = 0,
    // Ruscha intelligence data
    tier1Opportunities = [],
    tier2Opportunities = [],
    tier3Opportunities = [],
    marketIntelligence = '',
    timingAnalysis = ''
  } = processedData

  return (
    <div className="min-h-screen bg-background">
      {/* Elite Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-background" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {getTimeBasedGreeting()}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.firstName} {user.lastName} • {formatTime(currentTime)} UTC • Live Intelligence
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground pl-12">
                Elite intelligence system analyzing {opportunities.length} opportunities across global markets
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right text-xs text-muted-foreground">
                <div>Confidence: {(confidence * 100).toFixed(1)}%</div>
                <div>Last Update: Live</div>
              </div>
              {refreshing && (
                <div className="flex items-center space-x-2 text-primary">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-mono">UPDATING</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-background/50 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Elite Metrics Bar */}
      <div className="max-w-7xl mx-auto p-6 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                
                {/* Active Opportunities */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: metricsAnimated ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-center"
                >
                  <div className="relative inline-block">
                    <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{juicyOpportunities.length}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{opportunities.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Opportunities</div>
                  <Progress value={(juicyOpportunities.length / Math.max(opportunities.length, 1)) * 100} className="mt-2 h-1" />
                </motion.div>

                {/* Total Opportunity Value */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: metricsAnimated ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(totalOpportunityValue)}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Opportunity Value</div>
                  <div className="text-xs text-muted-foreground mt-1">+{((totalOpportunityValue / 10000000) * 100).toFixed(1)}% potential</div>
                </motion.div>

                {/* Peer Network Activity */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: metricsAnimated ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-center"
                >
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{peerSignals?.active_members_today || 0}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Peer Network Active</div>
                  <div className="text-xs text-muted-foreground mt-1">Elite members online</div>
                </motion.div>

                {/* Wealth Migration */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: metricsAnimated ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-center"
                >
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">
                    {processedData.wealthFlowData?.volume?.match(/\$[\d.-]+[BM]/)?.[0] || '$0'}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Capital in Motion</div>
                  <div className="text-xs text-muted-foreground mt-1">Migration detected</div>
                </motion.div>

                {/* System Confidence */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: metricsAnimated ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-center"
                >
                  <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{(confidence * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">AI Confidence</div>
                  <div className="text-xs text-muted-foreground mt-1">System reliability</div>
                </motion.div>

              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-xs data-[state=active]:text-primary">
              <BarChart3 className="h-3 w-3 mr-1 text-primary" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="text-xs data-[state=active]:text-primary">
              <Target className="h-3 w-3 mr-1 text-primary" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="wealth-flow" className="text-xs data-[state=active]:text-primary">
              <Globe className="h-3 w-3 mr-1 text-primary" />
              Wealth Flow
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs data-[state=active]:text-primary">
              <Users className="h-3 w-3 mr-1 text-primary" />
              Network
            </TabsTrigger>
            <TabsTrigger value="crown-vault" className="text-xs data-[state=active]:text-primary">
              <Crown className="h-3 w-3 mr-1 text-primary" />
              Crown Vault
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            
            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Executive Intelligence Summary</h2>
                      <p className="text-sm text-muted-foreground">Presidential brief intelligence</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border text-foreground">
                    Classification: Elite
                  </Badge>
                </div>
                <div>
                  <div className="leading-relaxed text-foreground">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {intelligenceData?.intelligence?.ruscha_intelligence?.data || "No intelligence data available"}
                    </pre>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg">
                      <div className="text-sm font-medium text-foreground">JUICY Opportunities</div>
                      <div className="text-2xl font-bold text-foreground">{juicyOpportunities.length}</div>
                      <div className="text-xs text-muted-foreground">Immediate action required</div>
                    </div>
                    <div className="p-3 rounded-lg">
                      <div className="text-sm font-medium text-foreground">MODERATE Opportunities</div>
                      <div className="text-2xl font-bold text-foreground">{moderateOpportunities.length}</div>
                      <div className="text-xs text-muted-foreground">Medium-term focus</div>
                    </div>
                    <div className="p-3 rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">FAR-FETCHED Opportunities</div>
                      <div className="text-2xl font-bold text-muted-foreground">{farFetchedOpportunities.length}</div>
                      <div className="text-xs text-muted-foreground">Strategic consideration</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>


                  {/* Wealth Migration Pattern */}
                  {processedData.wealthFlowData && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold">Wealth Migration Pattern</h4>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">From:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.from}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">To:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.to}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Volume:</p>
                              <p className="text-sm font-semibold text-blue-600">{processedData.wealthFlowData.volume}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Timeline:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.timeline}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Arbitrage Gap */}
                  {processedData.wealthFlowData?.arbitrageGap && (
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <h4 className="font-semibold">Arbitrage Opportunity</h4>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Discount:</p>
                              <p className="text-sm font-semibold text-green-600">{processedData.wealthFlowData.arbitrageGap.current_discount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Capture Window:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.arbitrageGap.capture_window}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Pattern Recognition */}
                  {processedData.wealthFlowData?.patternRecognition && (
                    <Card className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold">Pattern Recognition</h4>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Mega Trend:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.patternRecognition.mega_trend}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-muted-foreground">Conviction:</p>
                              <div className="flex items-center space-x-2 flex-1">
                                <Progress value={(processedData.wealthFlowData.patternRecognition.conviction / 10) * 100} className="h-2" />
                                <span className="text-sm font-semibold text-purple-600">{processedData.wealthFlowData.patternRecognition.conviction}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* The $100K Move */}
                  {processedData.wealthFlowData?.the100kMove && (
                    <Card className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-orange-600" />
                              <h4 className="font-semibold">The $100K Move</h4>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              High Priority
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Action:</p>
                              <p className="text-sm font-semibold">{processedData.wealthFlowData.the100kMove.action}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Entry Capital:</p>
                                <p className="text-sm font-semibold text-orange-600">{processedData.wealthFlowData.the100kMove.entry_capital}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Projected Return:</p>
                                <p className="text-sm font-semibold text-orange-600">{processedData.wealthFlowData.the100kMove.projected_return}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Whisper Intelligence */}
                  {processedData.wealthFlowData?.whisperIntelligence && (
                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-red-600" />
                            <h4 className="font-semibold">Whisper Intelligence</h4>
                            <Badge variant="destructive" className="text-xs">
                              Confidential
                            </Badge>
                          </div>
                          <div className="relative">
                            <div className="absolute -left-1 top-0 w-0.5 h-full bg-gradient-to-b from-red-600 to-red-400 rounded-full"></div>
                            <blockquote className="text-sm leading-relaxed italic font-medium text-foreground pl-4">
                              "{processedData.wealthFlowData.whisperIntelligence}"
                            </blockquote>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}

            {/* Action Required Alert */}
            {juicyOpportunities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-border bg-muted">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-6 w-6 text-foreground animate-pulse" />
                        <div>
                          <div className="font-semibold text-foreground">
                            IMMEDIATE ACTION REQUIRED
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {juicyOpportunities.length} high-priority opportunities need your attention
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('opportunities')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Review Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">Investment Opportunities</h2>
                    <p className="text-sm text-muted-foreground">AI-analyzed opportunities ranked by potential</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* JUICY Opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="card-premium-gold dark:card-metallic-gold h-full rounded-3xl p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        JUICY
                      </h3>
                      <Badge className="bg-primary text-primary-foreground">
                        {juicyOpportunities.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {juicyOpportunities.length > 0 ? juicyOpportunities.map((opp: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-foreground text-sm leading-tight">
                              {opp.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                              <span>{opp.value}</span>
                              <span>•</span>
                              <span>{opp.investmentHorizon}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {opp.victor_reasoning?.substring(0, 100)}...
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No JUICY opportunities available</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* MODERATE Opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="card-premium-platinum dark:card-metallic-carbon h-full rounded-3xl p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        MODERATE
                      </h3>
                      <Badge className="bg-secondary text-secondary-foreground">
                        {moderateOpportunities.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {moderateOpportunities.length > 0 ? moderateOpportunities.map((opp: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-foreground text-sm leading-tight">
                              {opp.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                              <span>{opp.value}</span>
                              <span>•</span>
                              <span>{opp.investmentHorizon}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {opp.victor_reasoning?.substring(0, 100)}...
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No MODERATE opportunities available</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* FAR-FETCHED Opportunities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="h-full rounded-3xl p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-muted-foreground flex items-center">
                        <TrendingDown className="h-5 w-5 mr-2" />
                        FAR-FETCHED
                      </h3>
                      <Badge variant="outline">
                        {farFetchedOpportunities.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {farFetchedOpportunities.length > 0 ? farFetchedOpportunities.map((opp: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="p-4 border border-border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm leading-tight">
                              {opp.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                              <span>{opp.value}</span>
                              <span>•</span>
                              <span>{opp.investmentHorizon}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {opp.victor_reasoning?.substring(0, 100)}...
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No FAR-FETCHED opportunities available</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

            </div>
          </TabsContent>

          {/* Wealth Flow Tab */}
          <TabsContent value="wealth-flow" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="text-center py-8">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Wealth Flow Analysis</h3>
                <p className="text-muted-foreground">Wealth flow intelligence will appear here when data becomes available</p>
              </div>
            </motion.div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Elite Peer Network</h2>
                      <p className="text-sm text-muted-foreground">Real-time network intelligence</p>
                    </div>
                  </div>
                </div>
                <div>
                  {(peerSignals || processedData?.networkData) ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 ">
                          <div className="text-2xl font-bold text-foreground">{peerSignals.active_members_today}</div>
                          <div className="text-xs text-muted-foreground">Members Active</div>
                        </div>
                        <div className="text-center p-4 ">
                          <div className="text-2xl font-bold text-foreground">{peerSignals.social_proof?.similar_profiles_active || 12}</div>
                          <div className="text-xs text-muted-foreground">Similar Profiles</div>
                        </div>
                        <div className="text-center p-4 ">
                          <div className="text-2xl font-bold text-foreground">
                            {peerSignals.social_proof?.average_portfolio_size?.split(' - ')[0] || '£0'}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Portfolio</div>
                        </div>
                        <div className="text-center p-4 ">
                          <div className="text-2xl font-bold text-foreground">
                            {peerSignals.timing_signals?.window_closing?.split(' ')[0] || '0'}d
                          </div>
                          <div className="text-xs text-muted-foreground">Action Window</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Trending Opportunities</h4>
                        <div className="space-y-2">
                          {peerSignals.trending_opportunities?.map((opp: string, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 ">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-foreground"></div>
                                <span className="font-medium">{opp}</span>
                              </div>
                              <TrendingUp className="h-4 w-4 text-foreground" />
                            </div>
                          )) || <div className="text-muted-foreground">No trending opportunities</div>}
                        </div>
                      </div>

                      <div className="p-4 ">
                        <div className="font-medium text-foreground mb-2">Network Intelligence</div>
                        <p className="text-sm text-muted-foreground">
                          {peerSignals?.whisper_network || "No network intelligence available"}
                        </p>
                      </div>

                      {/* Additional Network Intelligence from Crown Vault */}
                      {processedData?.networkData && (
                        <div className="space-y-4">
                          <h4 className="font-semibold mb-3">Family Office Intelligence</h4>
                          
                          <div className="grid gap-4">
                            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                              <CardContent className="p-0">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Market Movement:</p>
                                    <p className="text-sm font-semibold">{processedData.networkData.market_move}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Family Office Activity:</p>
                                    <p className="text-sm font-semibold">{processedData.networkData.family_office_activity}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Timing Advantage:</p>
                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{processedData.networkData.timing_advantage}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Network Intelligence Initializing</h4>
                      <p className="text-muted-foreground">Peer network data will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Crown Vault Tab */}
          <TabsContent value="crown-vault" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <div className="mb-6">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-primary" />
                    <div>
                      <h2 className="text-xl font-bold">Crown Vault Integration</h2>
                      <p className="text-sm text-muted-foreground">Advanced portfolio impact analysis</p>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-6">
                  
                  <Button 
                    onClick={() => onNavigate('crown-vault')}
                    size="lg"
                    className="bg-primary text-primary-foreground px-8 py-3"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Access Crown Vault
                  </Button>
                  
                  {processedData?.impactedAssets?.length > 0 ? (
                    <div className="mt-6 space-y-4 max-w-4xl mx-auto">
                      <h4 className="font-semibold mb-4 flex items-center text-foreground text-left">
                        <Activity className="h-4 w-4 mr-2" />
                        Impacted Assets ({processedData.impactedAssets.length})
                      </h4>
                      
                      <div className="grid gap-4">
                        {processedData.impactedAssets.map((asset: any, index: number) => (
                          <Card key={index} className={cn(
                            "text-left border-l-4",
                            asset.risk_level === 'HIGH' ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" :
                            asset.risk_level === 'MEDIUM' ? "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20" :
                            "border-l-green-500 bg-green-50 dark:bg-green-950/20"
                          )}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-semibold text-lg">{asset.asset}</h5>
                                  <Badge variant={asset.risk_level === 'HIGH' ? 'destructive' : asset.risk_level === 'MEDIUM' ? 'secondary' : 'default'} className="text-xs mt-1">
                                    {asset.risk_level} Risk
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">{asset.exposure_amount}</p>
                                  <p className="text-sm text-muted-foreground">Exposure</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">30-Day Impact:</p>
                                  <p className="text-sm">{asset.thirty_day_impact}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Required Action:</p>
                                  <p className="text-sm font-semibold">{asset.action_required}</p>
                                </div>
                              </div>
                              
                              <Button size="sm" variant="outline" className="mt-3 w-full">
                                View Asset Details
                                <ArrowRight className="h-3 w-3 ml-2" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-muted/20 rounded-lg text-center">
                        <h5 className="font-semibold mb-2">Executive Summary</h5>
                        <p className="text-sm text-muted-foreground">
                          {intelligenceData.intelligence.crown_vault_impact.data?.executive_summary || 
                           intelligenceData.intelligence.crown_vault_impact.executive_summary || 
                           "Portfolio analysis complete. Review impacted assets above for detailed insights."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-6  border border-border text-left max-w-2xl mx-auto">
                      <h4 className="font-semibold mb-3 text-foreground flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Crown Vault Initialization
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        Portfolio impact analysis will be available once you connect your Crown Vault assets. 
                        Our AI will analyze how each intelligence opportunity affects your specific holdings.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Real-time portfolio impact scoring</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Risk-adjusted opportunity matching</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Katherine Sterling-Chen AI guidance</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </TabsContent>

        </Tabs>

        {/* Elite Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center space-y-3 py-6"
        >
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>6 Expert Specialists</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Real-time Analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span>25K Monthly Value</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>83:1 ROI</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Generated for: <span className="font-medium">{user.firstName} {user.lastName}</span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}