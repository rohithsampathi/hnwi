// types/dashboard.ts
// TypeScript interfaces for Elite Dashboard

export interface User {
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  name?: string
  email: string
  id?: string
  user_id?: string
  userId?: string
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
  // Dashboard Summary Data (for metrics cards)
  confidence: number
  opportunities: any[]
  totalOpportunityValue: number
  totalOpportunityValueDelta?: number
  peerSignals: any
  dashboardSummary?: any

  // Victor Opportunities Data (for Opportunities tab)
  victorOpportunities: any[]
  juicyOpportunities: any[]
  moderateOpportunities: any[]
  farFetchedOpportunities: any[]

  // Katherine Crown Vault Data (for Crown Vault Impact tab)
  crownVaultAnalysis: any
  crownVaultSummary: string
  totalExposure: string
  impactedAssets: any[]

  // Intelligence Content Data (for Overview and display)
  intelligenceSummary: any
  dashboardFormat: any
  executiveSummary: string
  marketIntelligence: string
  timingAnalysis: string
  assetAllocation: string
  implementationRoadmap: string
  fullRuschaData: string
  generatedAt: string

  // Structured Tier Opportunities
  tier1Opportunities: any[]
  tier2Opportunities: any[]
  tier3Opportunities: any[]

  // Elite Pulse Data
  elitePulseData: any

  // Legacy/Raw Data
  rawIntelligence: any
  rawIntelligenceData: any
  networkData: any
  wealthFlowData: any
}

export interface EliteMetricsData {
  activeOpportunities: number
  juicyCount: number
  totalValue: number
  peerNetworkActive: number
  wealthMigrationVolume: string
  confidence: number
}