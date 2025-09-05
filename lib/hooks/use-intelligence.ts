// lib/hooks/use-intelligence.ts
// Custom Intelligence Hooks for Feature Integration
// Simplified hooks for accessing Elite Pulse Intelligence across features

"use client"

import { useMemo } from "react"
import { 
  useElitePulse,
  useElitePulseData,
  useCrownVaultImpact, 
  useOpportunityAlignment,
  usePeerIntelligence,
  useHNWIWorldTags,
  IntelligenceType
} from "@/contexts/elite-pulse-context"

// ================== CORE INTELLIGENCE HOOKS ==================

/**
 * useIntelligenceSummary - Get a summary of all available intelligence
 * Perfect for dashboard widgets and overview components
 */
export function useIntelligenceSummary() {
  const elitePulse = useElitePulseData()
  const crownVault = useCrownVaultImpact()
  const opportunities = useOpportunityAlignment()
  const peer = usePeerIntelligence()
  const { hasIntelligence, isStale, performanceMetrics } = useElitePulse()

  return useMemo(() => ({
    hasIntelligence,
    isStale,
    performanceMetrics,
    summary: {
      elitePulse: {
        available: !!elitePulse,
        confidence: elitePulse?.pattern_recognition?.conviction || 0,
        migration: elitePulse?.wealth_migration ? {
          from: elitePulse.wealth_migration.from_ || elitePulse.wealth_migration.from,
          to: elitePulse.wealth_migration.to,
          volume: elitePulse.wealth_migration.volume
        } : null,
        arbitrageGap: elitePulse?.arbitrage_gap?.current_discount || null,
        pattern: elitePulse?.pattern_recognition?.mega_trend || null
      },
      crownVault: {
        available: !!crownVault,
        threatsCount: crownVault?.immediate_threats?.length || 0,
        opportunitiesCount: crownVault?.hedging_opportunities?.length || 0,
        totalExposure: crownVault?.total_exposure || null,
        confidence: crownVault?.confidence_score || 0
      },
      opportunities: {
        available: !!opportunities,
        totalOpportunities: opportunities?.total_opportunities || 0,
        highConviction: opportunities?.high_conviction?.length || 0,
        mediumConviction: opportunities?.medium_conviction?.length || 0,
        avoidCount: opportunities?.avoid?.length || 0
      },
      peer: {
        available: !!peer,
        activeMembers: peer?.active_members_today || 0,
        activityLevel: peer?.activity_level || 'UNKNOWN',
        urgencyLevel: peer?.timing_signals?.urgency_level || 'NORMAL'
      }
    }
  }), [elitePulse, crownVault, opportunities, peer, hasIntelligence, isStale, performanceMetrics])
}

/**
 * useIntelligenceActions - Get actions for tracking user interactions
 * Use this in components that need to track user actions on intelligence
 */
export function useIntelligenceActions() {
  const { trackIntelligenceView, trackIntelligenceAction } = useElitePulse()

  return useMemo(() => ({
    trackView: trackIntelligenceView,
    trackAction: trackIntelligenceAction,
    
    // Convenience methods for common actions
    trackOpportunityView: (opportunityId: string) => 
      trackIntelligenceAction('opportunity_view', 'view', { opportunityId }),
    
    trackAssetAlert: (assetName: string, alertType: string) =>
      trackIntelligenceAction('crown_vault_alert', 'view', { assetName, alertType }),
    
    trackPeerSignal: (signalType: string, context?: any) =>
      trackIntelligenceAction('peer_signal', 'view', { signalType, ...context }),
    
    trackElitePulseSection: (section: string) =>
      trackIntelligenceAction('elite_pulse_section', 'view', { section })
  }), [trackIntelligenceView, trackIntelligenceAction])
}

// ================== FEATURE-SPECIFIC HOOKS ==================

/**
 * useOpportunityScoring - Get opportunity alignment scores
 * Use this in Privé Exchange and Opportunity Atlas components
 */
export function useOpportunityScoring() {
  const opportunities = useOpportunityAlignment()
  const elitePulse = useElitePulseData()

  return useMemo(() => {
    if (!opportunities || !elitePulse) return null

    // Create a scoring map for easy lookup
    const scoringMap = new Map<string, {
      score: number
      conviction: 'high' | 'medium' | 'watch' | 'avoid'
      thesis: string
      reasoning?: string
    }>()

    // High conviction opportunities
    opportunities.high_conviction?.forEach(opp => {
      scoringMap.set(opp.opportunity, {
        score: opp.alignment_score,
        conviction: 'high',
        thesis: opp.thesis
      })
    })

    // Medium conviction opportunities  
    opportunities.medium_conviction?.forEach(opp => {
      scoringMap.set(opp.opportunity, {
        score: opp.alignment_score,
        conviction: 'medium',
        thesis: opp.thesis
      })
    })

    // Watch list
    opportunities.watch_list?.forEach(opp => {
      scoringMap.set(opp.opportunity, {
        score: opp.alignment_score,
        conviction: 'watch',
        thesis: opp.thesis,
        reasoning: opp.reasoning
      })
    })

    // Avoid list
    opportunities.avoid?.forEach(opp => {
      scoringMap.set(opp.opportunity, {
        score: opp.score,
        conviction: 'avoid',
        thesis: opp.reason,
        reasoning: opp.reason
      })
    })

    return {
      scoringMap,
      getScore: (opportunityName: string) => scoringMap.get(opportunityName),
      marketInsight: opportunities.market_insight,
      timingEdge: opportunities.timing_edge,
      totalOpportunities: opportunities.total_opportunities
    }
  }, [opportunities, elitePulse])
}

/**
 * useCrownVaultAlerts - Get Crown Vault impact alerts
 * Use this in Crown Vault components for risk warnings
 */
export function useCrownVaultAlerts() {
  const crownVault = useCrownVaultImpact()

  return useMemo(() => {
    if (!crownVault) return null

    const alerts = []

    // Add immediate threat alerts
    crownVault.immediate_threats?.forEach(threat => {
      alerts.push({
        id: `threat_${threat.asset}`,
        type: 'threat' as const,
        severity: threat.risk_level.toLowerCase() as 'high' | 'medium' | 'low',
        title: `${threat.asset} At Risk`,
        message: threat.action_required,
        exposure: threat.exposure_amount,
        timeframe: '30 days',
        actionRequired: true
      })
    })

    // Add hedging opportunity alerts  
    crownVault.hedging_opportunities?.forEach((opportunity, index) => {
      alerts.push({
        id: `hedge_${index}`,
        type: 'opportunity' as const,
        severity: 'medium' as const,
        title: `Hedging Strategy Available`,
        message: opportunity.strategy,
        rationale: opportunity.rationale,
        timeline: opportunity.timeline,
        actionRequired: false
      })
    })

    return {
      alerts,
      totalExposure: crownVault.total_exposure,
      executiveSummary: crownVault.executive_summary,
      whisperIntelligence: crownVault.whisper_intelligence,
      confidence: crownVault.confidence_score,
      hasThreats: crownVault.immediate_threats && crownVault.immediate_threats.length > 0,
      hasOpportunities: crownVault.hedging_opportunities && crownVault.hedging_opportunities.length > 0
    }
  }, [crownVault])
}

/**
 * usePeerSignals - Get peer activity signals
 * Use this for social proof and peer activity indicators
 */
export function usePeerSignals() {
  const peer = usePeerIntelligence()

  return useMemo(() => {
    if (!peer) return null

    return {
      activityLevel: {
        level: peer.activity_level,
        activeMembers: peer.active_members_today,
        isHigh: peer.activity_level === 'HIGH',
        isMedium: peer.activity_level === 'MODERATE'
      },
      timing: {
        urgency: peer.timing_signals?.urgency_level || 'NORMAL',
        windowStatus: peer.timing_signals?.window_closing,
        peerAdvantage: peer.timing_signals?.peer_advantage,
        isUrgent: peer.timing_signals?.urgency_level === 'HIGH'
      },
      socialProof: {
        similarProfilesActive: peer.social_proof?.similar_profiles_active || 0,
        averagePortfolioSize: peer.social_proof?.average_portfolio_size,
        commonBackground: peer.social_proof?.common_background
      },
      recentMoves: peer.portfolio_moves || [],
      whisperNetwork: peer.whisper_network
    }
  }, [peer])
}

/**
 * useElitePulseBriefs - Get HNWI World brief tagging information
 * Use this in HNWI World components to show Elite Pulse providence
 */
export function useElitePulseBriefs() {
  const tags = useHNWIWorldTags()
  
  return useMemo(() => {
    if (!tags) return null

    return {
      sourceBriefIds: tags.source_brief_ids || [],
      totalBriefsAnalyzed: tags.total_briefs_analyzed || 0,
      hasIntelligenceProvidence: tags.intelligence_providence || false,
      
      // Helper function to check if a brief contributed to Elite Pulse
      isBriefTagged: (briefId: string) => tags.source_brief_ids?.includes(briefId) || false,
      
      // Get stats for UI display
      stats: {
        totalBriefs: tags.total_briefs_analyzed || 0,
        sourceBriefs: tags.source_brief_ids?.length || 0,
        providenceRatio: tags.source_brief_ids && tags.total_briefs_analyzed 
          ? (tags.source_brief_ids.length / tags.total_briefs_analyzed) * 100 
          : 0
      }
    }
  }, [tags])
}

// ================== UTILITY HOOKS ==================

/**
 * useIntelligenceStatus - Get overall system status
 * Use this for system monitoring and health checks
 */
export function useIntelligenceStatus() {
  const { 
    state, 
    hasIntelligence, 
    isStale, 
    lastUpdateTime,
    performanceMetrics 
  } = useElitePulse()

  return useMemo(() => ({
    status: hasIntelligence ? (isStale ? 'stale' : 'active') : 'loading',
    hasIntelligence,
    isStale,
    lastUpdateTime,
    isLoading: state.intelligence.isLoading,
    error: state.intelligence.error,
    updateCount: state.intelligence.updateCount,
    subscriptionCount: state.intelligence.subscriptions.size,
    cacheSize: state.intelligence.cachedData.size,
    performance: performanceMetrics ? {
      processingTime: performanceMetrics.total_processing_time_ms,
      cost: performanceMetrics.total_cost_usd,
      efficiency: performanceMetrics.cache_efficiency
    } : null
  }), [state, hasIntelligence, isStale, lastUpdateTime, performanceMetrics])
}

/**
 * useIntelligencePreferences - Get and update user preferences
 * Use this for settings and configuration components
 */
export function useIntelligencePreferences() {
  const { state, updatePreferences } = useElitePulse()
  
  return useMemo(() => ({
    preferences: state.userInteractions.preferences,
    updatePreferences,
    
    // Convenience methods
    setAutoRefresh: (enabled: boolean) => updatePreferences({ autoRefresh: enabled }),
    setRefreshInterval: (interval: number) => updatePreferences({ refreshInterval: interval }),
    setNotifications: (enabled: boolean) => updatePreferences({ notifications: enabled }),
    setPriorityFilter: (filter: "ALL" | "HIGH" | "MEDIUM") => updatePreferences({ priorityFilter: filter })
  }), [state.userInteractions.preferences, updatePreferences])
}

// ================== EXPORTS ==================

// Export all hooks for easy importing
export {
  // Core intelligence hooks
  useElitePulseData,
  useCrownVaultImpact,
  useOpportunityAlignment,
  usePeerIntelligence,
  useHNWIWorldTags,
  
  // Context hook
  useElitePulse
}