// types/dashboard.ts
// TypeScript interfaces for Elite Dashboard

export interface User {
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  email: string
  id?: string
  user_id?: string
}

export interface HomeDashboardEliteProps {
  user: User
  onNavigate: (route: string) => void
  isFromSignupFlow?: boolean
  userData?: any
}

export interface IntelligenceData {
  intelligence: {
    opportunity_alignment?: {
      data: any[]
    }
    crown_vault_impact?: {
      data: {
        immediate_threats?: any[]
        peer_intelligence?: any
        executive_summary?: string
      }
    }
    peer_signals?: any
    ruscha_intelligence?: {
      data: string
      confidence?: number
      generated_at?: string
    }
    wealth_flow?: {
      data: any
    }
  }
  processing_metadata?: {
    timestamp: string
  }
}

export interface ProcessedIntelligenceData {
  opportunities: any[]
  juicyOpportunities: any[]
  moderateOpportunities: any[]
  farFetchedOpportunities: any[]
  peerSignals: any
  totalOpportunityValue: number
  executiveSummary: string
  confidence: number
  generatedAt: string
  impactedAssets: any[]
  networkData: any
  wealthFlowData: any
  tier1Opportunities: any[]
  tier2Opportunities: any[]
  tier3Opportunities: any[]
  marketIntelligence: string
  timingAnalysis: string
  assetAllocation: string
  implementationRoadmap: string
  fullRuschaData: string
}

export interface EliteMetricsData {
  activeOpportunities: number
  juicyCount: number
  totalValue: number
  peerNetworkActive: number
  wealthMigrationVolume: string
  confidence: number
}