// types/dashboard.ts
// TypeScript interfaces for Elite Dashboard

import type { CrownVaultAsset, CrownVaultStats } from "@/lib/api"

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
  hasCompletedAssessmentProp?: boolean
}

export interface ApiEnvelope<T = any> {
  success?: boolean
  data?: T
  message?: string
  [key: string]: any
}

export interface IntelligencePayload {
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
  [key: string]: any
}

export interface IntelligenceData extends Partial<IntelligencePayload> {
  intelligence?: ApiEnvelope<IntelligencePayload> | IntelligencePayload | null
  processing_metadata?: {
    timestamp?: string
    [key: string]: any
  } | null
  dashboardSummary?: ApiEnvelope<any> | null
  crownVaultData?: ApiEnvelope<any> | null
  opportunitiesData?: ApiEnvelope<any> | null
  realOpportunities?: any[]
  realCrownVaultAssets?: CrownVaultAsset[]
  realCrownVaultStats?: CrownVaultStats | null
  [key: string]: any
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
  realOpportunities?: any[]
  victorOpportunities: any[]
  juicyOpportunities: any[]
  moderateOpportunities: any[]
  farFetchedOpportunities: any[]

  // Katherine Crown Vault Data (for Crown Vault Impact tab)
  realCrownVaultAssets?: CrownVaultAsset[]
  realCrownVaultStats?: CrownVaultStats | null
  crownVaultAnalysis: any
  crownVaultSummary: string
  totalExposure: string | number
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
