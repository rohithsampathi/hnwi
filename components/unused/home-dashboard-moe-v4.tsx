// components/home-dashboard-moe-v4.tsx
// MoE v4 Presidential Intelligence Dashboard
// Transforms HNWI Chronicles into an intelligence command center

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

interface HNWIIntelligenceDashboardProps {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  onNavigate: (route: string) => void
  isFromSignupFlow?: boolean
  userData?: any
}

export function HNWIIntelligenceDashboard({ 
  user, 
  onNavigate, 
  isFromSignupFlow, 
  userData 
}: HNWIIntelligenceDashboardProps) {
  const { theme } = useTheme()
  
  // State for intelligence data
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('executive-brief')

  // Fetch intelligence data from new backend endpoint
  const fetchIntelligence = async (forceRefresh = false) => {
    if (!userData?.id && !userData?.user_id) {
      console.log('🎯 MoE v4: No user ID available for intelligence fetch')
      setLoading(false)
      return
    }

    try {
      setRefreshing(forceRefresh)
      const userId = userData?.id || userData?.user_id
      console.log('🎯 MoE v4: Fetching intelligence for user:', userId)
      
      const response = await fetch(`/api/hnwi/intelligence/dashboard/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error(`MoE v4 Intelligence API error: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('🎯 MoE v4: Intelligence received:', {
        hasRuschaData: !!data.intelligence?.ruscha_intelligence?.data,
        hasCrownVault: !!data.intelligence?.crown_vault_impact?.data,
        hasOpportunities: !!data.intelligence?.opportunity_alignment?.data,
        hasPeerSignals: !!data.intelligence?.peer_signals?.data,
        confidence: data.intelligence?.ruscha_intelligence?.confidence || 'N/A'
      })
      
      setIntelligenceData(data)
      setError(null)
      
    } catch (error: any) {
      console.error('🎯 MoE v4: Intelligence fetch failed:', error)
      setError(error.message)
      setIntelligenceData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load intelligence on mount
  useEffect(() => {
    fetchIntelligence(true) // Force refresh on first load
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
          intelligence={intelligenceData}
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
            <ExecutiveBrief 
              intelligence={intelligenceData}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="opportunities" className="mt-6">
            <OpportunityTiers
              intelligence={intelligenceData}
              onOpportunitySelect={(opportunity) => {
                console.log('🎯 Opportunity selected:', opportunity)
                // Could trigger navigation to detailed view
              }}
            />
          </TabsContent>

          <TabsContent value="wealth-flow" className="mt-6">
            <WealthFlow intelligence={intelligenceData} />
          </TabsContent>

          <TabsContent value="trust-metrics" className="mt-6">
            <TrustMeters intelligence={intelligenceData} />
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
                
                {/* Preview Crown Vault Impact */}
                {intelligenceData?.intelligence?.crown_vault_impact?.data && (
                  <div className="mt-6 p-4 bg-muted/20 rounded-lg text-left">
                    <h4 className="font-semibold mb-2">Portfolio Impact Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      {intelligenceData.intelligence.crown_vault_impact.data.portfolio_effects?.immediate_impact?.[0]?.estimated_benefit || "Advanced analysis available"}
                    </p>
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