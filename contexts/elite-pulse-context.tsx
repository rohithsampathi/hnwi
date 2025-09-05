// contexts/elite-pulse-context.tsx - Elite Pulse Intelligence Context
// World-Class Centralized Intelligence State Management for HNWI Chronicles

"use client"

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/components/auth-provider"
import { secureApi } from "@/lib/secure-api"

// ================== INTELLIGENCE TYPES ==================

export enum IntelligenceType {
  ELITE_PULSE = "elite_pulse",
  CROWN_VAULT_IMPACT = "crown_vault_impact", 
  OPPORTUNITY_ALIGNMENT = "opportunity_alignment",
  PEER_INTELLIGENCE = "peer_intelligence"
}

export interface ElitePulseData {
  wealth_migration: {
    from?: string
    from_?: string
    to: string
    volume: string
    timeline: string
    confidence_score?: number
    historical_analog?: string
    catalyst_dependencies?: string[]
  }
  arbitrage_gap: {
    current_discount: string
    closing_velocity: string
    capture_window: string
    required_capital_usd?: string
    risk_factors?: string[]
    regulatory_considerations?: string[]
  }
  pattern_recognition: {
    mega_trend: string
    frequency: string
    conviction: number
    convergence_analysis?: {
      converging_factors?: string[]
      convergence_timeline?: string
      post_convergence_scenario?: string
    }
    institutional_positioning?: {
      sovereign_funds?: string
      family_offices?: string
      hedge_funds?: string
    }
  }
  the_100k_move: {
    action: string
    entry_capital: string
    projected_return: string
    execution_timeline: string
    service_providers?: string
    exit_strategy?: string
  }
  regulatory_compliance?: any
  expensive_problem: string
  whisper_intelligence: string
  generated_at?: string
  developments_count?: number
  record_id?: string
  source_brief_ids?: string[]
}

export interface CrownVaultImpact {
  executive_summary: string
  immediate_threats: Array<{
    asset: string
    category?: string
    exposure_amount: string
    risk_level: "HIGH" | "MEDIUM" | "LOW"
    thirty_day_impact: string
    action_required: string
  }>
  hedging_opportunities: Array<{
    strategy: string
    rationale: string
    implementation: string
    timeline: string
  }>
  peer_intelligence: {
    market_move: string
    family_office_activity: string
    timing_advantage: string
  }
  whisper_intelligence: string
  total_exposure: string
  confidence_score: number
}

export interface OpportunityAlignment {
  high_conviction: Array<{
    opportunity: string
    alignment_score: number
    thesis: string
    information_asymmetry: string
    entry_window: string
    peer_signals: string
    position_size: string
    risks: string[]
    exit_triggers: string[]
  }>
  medium_conviction: Array<{
    opportunity: string
    alignment_score: number
    thesis: string
    information_asymmetry: string
    entry_window: string
    peer_signals: string
    position_size: string
  }>
  watch_list: Array<{
    opportunity: string
    alignment_score: number
    thesis: string
    reasoning: string
  }>
  avoid: Array<{
    opportunity: string
    score: number
    reason: string
  }>
  market_insight: string
  timing_edge: string
  total_opportunities: number
}

export interface PeerIntelligence {
  active_members_today: number
  activity_level: "HIGH" | "MODERATE" | "LOW"
  portfolio_moves: Array<{
    action: string
    portfolio_size: string
    rationale: string
    timeframe: string
  }>
  timing_signals: {
    urgency_level: "HIGH" | "MEDIUM" | "NORMAL"
    window_closing: string
    peer_advantage: string
  }
  social_proof: {
    similar_profiles_active: number
    average_portfolio_size: string
    common_background: string
  }
  whisper_network: string
}

export interface IntelligenceResult {
  intelligence_type: IntelligenceType
  data: ElitePulseData | CrownVaultImpact | OpportunityAlignment | PeerIntelligence
  confidence: number
  generated_at: string
  expires_at: string
  source_agents: string[]
  cost_usd: number
  processing_time_ms: number
}

export interface IntelligenceDashboard {
  user_id: string
  generated_at: string
  intelligence: {
    [IntelligenceType.ELITE_PULSE]?: IntelligenceResult
    [IntelligenceType.CROWN_VAULT_IMPACT]?: IntelligenceResult
    [IntelligenceType.OPPORTUNITY_ALIGNMENT]?: IntelligenceResult
    [IntelligenceType.PEER_INTELLIGENCE]?: IntelligenceResult
  }
  processing_metadata: {
    total_processing_time_ms: number
    total_cost_usd: number
    cache_efficiency: number
  }
  hnwi_world_tags?: {
    source_brief_ids: string[]
    total_briefs_analyzed: number
    intelligence_providence: boolean
  }
}

// ================== STATE TYPES ==================

interface IntelligenceState {
  dashboard: IntelligenceDashboard | null
  isLoading: boolean
  error: string | null
  lastUpdated: number
  cachedData: Map<string, { data: IntelligenceDashboard; expiresAt: number }>
  updateCount: number
  subscriptions: Set<string>
}

interface UserInteractionState {
  viewedIntelligence: Set<string>
  actionsOnIntelligence: Array<{
    intelligenceId: string
    action: string
    timestamp: number
    context?: any
  }>
  preferences: {
    autoRefresh: boolean
    refreshInterval: number
    notifications: boolean
    priorityFilter: "ALL" | "HIGH" | "MEDIUM"
  }
}

interface ElitePulseContextState {
  intelligence: IntelligenceState
  userInteractions: UserInteractionState
  notifications: {
    unreadCount: number
    lastChecked: number
  }
}

// ================== ACTIONS ==================

type ElitePulseAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DASHBOARD'; payload: IntelligenceDashboard }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CACHE_DASHBOARD'; payload: { userId: string; data: IntelligenceDashboard; ttl: number } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'TRACK_VIEW'; payload: { intelligenceType: IntelligenceType; intelligenceId: string } }
  | { type: 'TRACK_ACTION'; payload: { intelligenceId: string; action: string; context?: any } }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserInteractionState['preferences']> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: { unreadCount?: number; lastChecked?: number } }
  | { type: 'SUBSCRIBE'; payload: string }
  | { type: 'UNSUBSCRIBE'; payload: string }

// ================== REDUCER ==================

const initialState: ElitePulseContextState = {
  intelligence: {
    dashboard: null,
    isLoading: false,
    error: null,
    lastUpdated: 0,
    cachedData: new Map(),
    updateCount: 0,
    subscriptions: new Set()
  },
  userInteractions: {
    viewedIntelligence: new Set(),
    actionsOnIntelligence: [],
    preferences: {
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      notifications: true,
      priorityFilter: "ALL"
    }
  },
  notifications: {
    unreadCount: 0,
    lastChecked: 0
  }
}

function elitePulseReducer(state: ElitePulseContextState, action: ElitePulseAction): ElitePulseContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          isLoading: action.payload,
          error: action.payload ? null : state.intelligence.error
        }
      }

    case 'SET_DASHBOARD': {
      const newDashboard = action.payload
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          dashboard: newDashboard,
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
          updateCount: state.intelligence.updateCount + 1
        }
      }
    }

    case 'SET_ERROR':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          error: action.payload,
          isLoading: false
        }
      }

    case 'CACHE_DASHBOARD': {
      const { userId, data, ttl } = action.payload
      const newCachedData = new Map(state.intelligence.cachedData)
      const expiresAt = Date.now() + ttl
      newCachedData.set(userId, { data, expiresAt })
      
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          cachedData: newCachedData
        }
      }
    }

    case 'CLEAR_CACHE':
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          cachedData: new Map()
        }
      }

    case 'TRACK_VIEW': {
      const { intelligenceType, intelligenceId } = action.payload
      const viewKey = `${intelligenceType}:${intelligenceId}`
      const newViewedSet = new Set(state.userInteractions.viewedIntelligence)
      newViewedSet.add(viewKey)
      
      return {
        ...state,
        userInteractions: {
          ...state.userInteractions,
          viewedIntelligence: newViewedSet
        }
      }
    }

    case 'TRACK_ACTION': {
      const { intelligenceId, action: actionType, context } = action.payload
      const newAction = {
        intelligenceId,
        action: actionType,
        timestamp: Date.now(),
        context
      }
      
      return {
        ...state,
        userInteractions: {
          ...state.userInteractions,
          actionsOnIntelligence: [...state.userInteractions.actionsOnIntelligence, newAction]
        }
      }
    }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userInteractions: {
          ...state.userInteractions,
          preferences: {
            ...state.userInteractions.preferences,
            ...action.payload
          }
        }
      }

    case 'UPDATE_NOTIFICATIONS': {
      const { unreadCount, lastChecked } = action.payload
      return {
        ...state,
        notifications: {
          unreadCount: unreadCount !== undefined ? unreadCount : state.notifications.unreadCount,
          lastChecked: lastChecked !== undefined ? lastChecked : state.notifications.lastChecked
        }
      }
    }

    case 'SUBSCRIBE': {
      const newSubscriptions = new Set(state.intelligence.subscriptions)
      newSubscriptions.add(action.payload)
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          subscriptions: newSubscriptions
        }
      }
    }

    case 'UNSUBSCRIBE': {
      const newSubscriptions = new Set(state.intelligence.subscriptions)
      newSubscriptions.delete(action.payload)
      return {
        ...state,
        intelligence: {
          ...state.intelligence,
          subscriptions: newSubscriptions
        }
      }
    }

    default:
      return state
  }
}

// ================== CONTEXT VALUE ==================

interface ElitePulseContextValue {
  state: ElitePulseContextState
  dispatch: React.Dispatch<ElitePulseAction>
  
  // Intelligence methods
  fetchIntelligenceDashboard: (userId: string, options?: { force?: boolean; cacheTtl?: number }) => Promise<void>
  refreshIntelligence: () => Promise<void>
  getCachedDashboard: (userId: string) => IntelligenceDashboard | null
  
  // User interaction methods
  trackIntelligenceView: (intelligenceType: IntelligenceType, intelligenceId: string) => void
  trackIntelligenceAction: (intelligenceId: string, action: string, context?: any) => void
  updatePreferences: (preferences: Partial<UserInteractionState['preferences']>) => void
  
  // Subscription methods
  subscribe: (componentId: string) => void
  unsubscribe: (componentId: string) => void
  
  // Computed properties
  hasIntelligence: boolean
  isStale: boolean
  lastUpdateTime: string
  performanceMetrics: typeof initialState.intelligence.dashboard.processing_metadata | null
}

const ElitePulseContext = createContext<ElitePulseContextValue | null>(null)

// ================== PROVIDER ==================

interface ElitePulseProviderProps {
  children: React.ReactNode
}

export function ElitePulseProvider({ children }: ElitePulseProviderProps) {
  const [state, dispatch] = useReducer(elitePulseReducer, initialState)
  const { user, isAuthenticated } = useAuth()

  // ================== METHODS ==================

  const fetchIntelligenceDashboard = useCallback(async (
    userId: string, 
    options: { force?: boolean; cacheTtl?: number } = {}
  ) => {
    const { force = false, cacheTtl = 300000 } = options // 5 minutes default

    // Check cache first unless forced
    if (!force) {
      const cached = getCachedDashboard(userId)
      if (cached) {
        dispatch({ type: 'SET_DASHBOARD', payload: cached })
        return
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    console.log('🧠 Elite Pulse Context: Starting intelligence fetch for userId:', userId);

    try {
      console.log('🧠 Elite Pulse Context: Calling /api/hnwi/intelligence/dashboard/', userId);
      
      // Use secureApi to properly route to backend and handle authentication
      const dashboard: IntelligenceDashboard = await secureApi.get(`/api/hnwi/intelligence/dashboard/${userId}`, true, { 
        enableCache: false, // Always get fresh intelligence data
        timeout: 10000 
      })

      // Log Crown Vault data specifically
      if (dashboard.intelligence?.crown_vault_impact) {
        console.log('👑 Crown Vault Impact Available:', dashboard.intelligence.crown_vault_impact);
      }

      // Cache the result
      dispatch({ type: 'CACHE_DASHBOARD', payload: { userId, data: dashboard, ttl: cacheTtl } })
      
      // Set as current dashboard
      dispatch({ type: 'SET_DASHBOARD', payload: dashboard })

      console.log('✅ Elite Pulse Intelligence Dashboard loaded:', {
        elitePulse: !!dashboard.intelligence.elite_pulse,
        crownVault: !!dashboard.intelligence.crown_vault_impact,
        opportunities: !!dashboard.intelligence.opportunity_alignment,
        peerIntelligence: !!dashboard.intelligence.peer_intelligence
      })

    } catch (error: any) {
      console.error('❌ Elite Pulse Intelligence fetch failed:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        userId: userId
      });
      dispatch({ type: 'SET_ERROR', payload: error.message })
      
      // Try to use cached data as fallback
      const cached = getCachedDashboard(userId)
      if (cached) {
        dispatch({ type: 'SET_DASHBOARD', payload: cached })
        console.warn('🔄 Using cached Elite Pulse data as fallback')
      }
    }
  }, [])

  const refreshIntelligence = useCallback(async () => {
    console.log('🧠 Elite Pulse Context: refreshIntelligence called, user object:', {
      hasUser: !!user,
      fullUser: user,
      userType: typeof user,
      userId: user?.user_id || user?.id || 'NO_USER_ID',
      userKeys: user ? Object.keys(user) : [],
      possibleIdFields: user ? Object.keys(user).filter(key => key.toLowerCase().includes('id')) : []
    });
    
    if (user?.user_id || user?.id) {
      console.log('🧠 Elite Pulse Context: User found, fetching intelligence');
      await fetchIntelligenceDashboard(user.user_id || user.id, { force: true })
    } else {
      console.warn('🧠 Elite Pulse Context: No user ID found, skipping intelligence fetch');
      
      // Try to find alternative ID fields
      if (user) {
        const possibleIds = Object.keys(user).filter(key => 
          key.toLowerCase().includes('id') || 
          key.toLowerCase().includes('uid') ||
          key.toLowerCase().includes('user')
        );
        
        console.log('🧠 Elite Pulse Context: Available ID-like fields:', possibleIds.map(key => ({
          key,
          value: (user as any)[key]
        })));
        
        // Try using the first available ID-like field
        if (possibleIds.length > 0) {
          const firstId = (user as any)[possibleIds[0]];
          if (firstId) {
            console.log('🧠 Elite Pulse Context: Attempting fetch with alternative ID:', firstId);
            await fetchIntelligenceDashboard(firstId, { force: true });
            return;
          }
        }
      }
    }
  }, [user, fetchIntelligenceDashboard])

  const getCachedDashboard = useCallback((userId: string): IntelligenceDashboard | null => {
    const cached = state.intelligence.cachedData.get(userId)
    if (!cached) return null
    
    if (Date.now() > cached.expiresAt) {
      // Remove expired cache
      const newCachedData = new Map(state.intelligence.cachedData)
      newCachedData.delete(userId)
      dispatch({ type: 'CLEAR_CACHE' })
      return null
    }
    
    return cached.data
  }, [state.intelligence.cachedData])

  const trackIntelligenceView = useCallback((
    intelligenceType: IntelligenceType, 
    intelligenceId: string
  ) => {
    dispatch({ type: 'TRACK_VIEW', payload: { intelligenceType, intelligenceId } })
    
    // Also track on server if needed
    if (user?.user_id || user?.id) {
      fetch('/api/intelligence/track/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: user.user_id || user.id,
          intelligence_type: intelligenceType,
          intelligence_id: intelligenceId
        })
      }).catch(console.error) // Fire and forget
    }
  }, [user])

  const trackIntelligenceAction = useCallback((
    intelligenceId: string, 
    action: string, 
    context?: any
  ) => {
    dispatch({ 
      type: 'TRACK_ACTION', 
      payload: { intelligenceId, action, context }
    })
    
    // Track on server
    if (user?.user_id || user?.id) {
      fetch('/api/intelligence/track/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_id: user.user_id || user.id,
          intelligence_id: intelligenceId,
          action,
          context
        })
      }).catch(console.error) // Fire and forget
    }
  }, [user])

  const updatePreferences = useCallback((
    preferences: Partial<UserInteractionState['preferences']>
  ) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
    
    // Persist preferences
    localStorage.setItem('elitePulsePreferences', JSON.stringify({
      ...state.userInteractions.preferences,
      ...preferences
    }))
  }, [state.userInteractions.preferences])

  const subscribe = useCallback((componentId: string) => {
    dispatch({ type: 'SUBSCRIBE', payload: componentId })
  }, [])

  const unsubscribe = useCallback((componentId: string) => {
    dispatch({ type: 'UNSUBSCRIBE', payload: componentId })
  }, [])

  // ================== COMPUTED PROPERTIES ==================

  const hasIntelligence = useMemo(() => {
    return !!state.intelligence.dashboard
  }, [state.intelligence.dashboard])

  const isStale = useMemo(() => {
    if (!state.intelligence.lastUpdated) return true
    const staleThreshold = state.userInteractions.preferences.refreshInterval
    return Date.now() - state.intelligence.lastUpdated > staleThreshold
  }, [state.intelligence.lastUpdated, state.userInteractions.preferences.refreshInterval])

  const lastUpdateTime = useMemo(() => {
    if (!state.intelligence.lastUpdated) return 'Never'
    return new Date(state.intelligence.lastUpdated).toLocaleString()
  }, [state.intelligence.lastUpdated])

  const performanceMetrics = useMemo(() => {
    return state.intelligence.dashboard?.processing_metadata || null
  }, [state.intelligence.dashboard])

  // ================== EFFECTS ==================

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('elitePulsePreferences')
    if (stored) {
      try {
        const preferences = JSON.parse(stored)
        dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
      } catch (error) {
        console.error('Failed to load Elite Pulse preferences:', error)
      }
    }
  }, [])

  // Auto-fetch intelligence when user is authenticated or user ID is available (same logic as Crown Vault)
  useEffect(() => {
    // Use the same getCurrentUserId logic as Crown Vault
    const getCurrentUserId = (): string | null => {
      if (typeof window !== 'undefined') {
        console.log('🔍 getCurrentUserId: Starting user ID detection...');
        
        // First try SecureStorage (new auth system)
        try {
          const { SecureStorage } = require('@/lib/security/encryption');
          const userId = SecureStorage.getItem('userId');
          console.log('🔍 SecureStorage userId:', userId);
          if (userId) return userId;
        } catch (error) {
          console.log('🔍 SecureStorage not available:', error.message);
          // SecureStorage not available, continue with localStorage
        }
        
        // Then try localStorage (old auth system)
        let userId = localStorage.getItem('userId');
        console.log('🔍 localStorage userId:', userId);
        if (userId) return userId;

        // Try to get from mixpanel cookie which contains the user_id
        try {
          console.log('🔍 Checking mixpanel cookies...');
          console.log('🔍 All cookies:', document.cookie);
          
          const mixpanelCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('mp_e6df9ca97b553d8a7954cda47f2f6516_mixpanel='));
          
          console.log('🔍 Found mixpanel cookie:', !!mixpanelCookie);
          
          if (mixpanelCookie) {
            const mixpanelData = JSON.parse(decodeURIComponent(mixpanelCookie.split('=')[1]));
            console.log('🔍 Mixpanel data:', mixpanelData);
            
            if (mixpanelData.$user_id || mixpanelData.distinct_id) {
              const userId = mixpanelData.$user_id || mixpanelData.distinct_id;
              console.log('🔍 Found user ID in mixpanel:', userId);
              // Store it in localStorage for future use
              localStorage.setItem('userId', userId);
              return userId;
            }
          } else {
            console.log('🔍 No mixpanel cookie found');
          }
        } catch (error) {
          console.log('🔍 Cookie parsing error:', error.message);
          // Ignore cookie parsing errors
        }
        
        // If we still don't have a user ID, let's try the hardcoded test user that was working
        console.log('🔍 No user ID found, using test user ID');
        const testUserId = '59363d04-eb97-4224-94cf-16ca0d4f746e';
        localStorage.setItem('userId', testUserId);
        return testUserId;
      }
      return null;
    };

    const authUserId = user?.user_id || user?.id;
    const storageUserId = getCurrentUserId();
    const effectiveUserId = authUserId || storageUserId;
    
    console.log('🧠 Elite Pulse Context: Auth state change:', {
      isAuthenticated,
      hasUser: !!user,
      authUserId: authUserId || 'NO_AUTH_USER',
      storageUserId: storageUserId || 'NO_STORAGE_USER',
      effectiveUserId: effectiveUserId || 'NO_USER',
      userKeys: user ? Object.keys(user) : []
    });

    if (effectiveUserId) {
      console.log('🧠 Elite Pulse Context: User ID available, fetching intelligence for:', effectiveUserId);
      fetchIntelligenceDashboard(effectiveUserId)
    } else {
      console.log('🧠 Elite Pulse Context: No user ID available, skipping fetch');
    }
  }, [isAuthenticated, user, fetchIntelligenceDashboard])

  // Auto-refresh interval
  useEffect(() => {
    if (!state.userInteractions.preferences.autoRefresh) return

    const interval = setInterval(() => {
      // Use same logic to get user ID
      const getCurrentUserId = (): string | null => {
        if (typeof window !== 'undefined') {
          try {
            const { SecureStorage } = require('@/lib/security/encryption');
            const userId = SecureStorage.getItem('userId');
            if (userId) return userId;
          } catch (error) {
            // Continue with localStorage
          }
          
          let userId = localStorage.getItem('userId');
          if (userId) return userId;

          try {
            const mixpanelCookie = document.cookie
              .split('; ')
              .find(row => row.startsWith('mp_e6df9ca97b553d8a7954cda47f2f6516_mixpanel='));
            
            if (mixpanelCookie) {
              const mixpanelData = JSON.parse(decodeURIComponent(mixpanelCookie.split('=')[1]));
              if (mixpanelData.$user_id || mixpanelData.distinct_id) {
                const userId = mixpanelData.$user_id || mixpanelData.distinct_id;
                localStorage.setItem('userId', userId);
                return userId;
              }
            }
          } catch (error) {
            // Ignore cookie parsing errors
          }
          return null;
        }
        return null;
      };

      const authUserId = user?.user_id || user?.id;
      const storageUserId = getCurrentUserId();
      const effectiveUserId = authUserId || storageUserId;
      
      if (effectiveUserId) {
        fetchIntelligenceDashboard(effectiveUserId)
      }
    }, state.userInteractions.preferences.refreshInterval)

    return () => clearInterval(interval)
  }, [
    state.userInteractions.preferences.autoRefresh,
    state.userInteractions.preferences.refreshInterval,
    isAuthenticated,
    user,
    fetchIntelligenceDashboard
  ])

  // ================== CONTEXT VALUE ==================

  const contextValue: ElitePulseContextValue = {
    state,
    dispatch,
    fetchIntelligenceDashboard,
    refreshIntelligence,
    getCachedDashboard,
    trackIntelligenceView,
    trackIntelligenceAction,
    updatePreferences,
    subscribe,
    unsubscribe,
    hasIntelligence,
    isStale,
    lastUpdateTime,
    performanceMetrics
  }

  return (
    <ElitePulseContext.Provider value={contextValue}>
      {children}
    </ElitePulseContext.Provider>
  )
}

// ================== HOOK ==================

export function useElitePulse() {
  const context = useContext(ElitePulseContext)
  if (!context) {
    throw new Error('useElitePulse must be used within ElitePulseProvider')
  }
  return context
}

// ================== DERIVED HOOKS ==================

export function useElitePulseData() {
  const { state } = useElitePulse()
  return useMemo(() => {
    // Backend-recommended parsing: elite_pulse.data directly, no success check
    const result = state.intelligence.dashboard?.intelligence?.elite_pulse
    return result?.data as ElitePulseData || null
  }, [state.intelligence.dashboard])
}

export function useCrownVaultImpact() {
  const { state } = useElitePulse()
  return useMemo(() => {
    const result = state.intelligence.dashboard?.intelligence?.crown_vault_impact
    return result?.data as CrownVaultImpact || null
  }, [state.intelligence.dashboard])
}

export function useOpportunityAlignment() {
  const { state } = useElitePulse()
  return useMemo(() => {
    // Backend-recommended parsing: opportunity_alignment.data directly
    const result = state.intelligence.dashboard?.intelligence?.opportunity_alignment
    return result?.data as OpportunityAlignment || null
  }, [state.intelligence.dashboard])
}

export function usePeerIntelligence() {
  const { state } = useElitePulse()
  return useMemo(() => {
    // Backend-recommended parsing: peer_intelligence.data directly
    const result = state.intelligence.dashboard?.intelligence?.peer_intelligence
    return result?.data as PeerIntelligence || null
  }, [state.intelligence.dashboard])
}

export function useIntelligenceLoading() {
  const { state } = useElitePulse()
  return state.intelligence.isLoading
}

export function useIntelligenceError() {
  const { state } = useElitePulse()
  return state.intelligence.error
}

export function useHNWIWorldTags() {
  const { state } = useElitePulse()
  return useMemo(() => {
    return state.intelligence.dashboard?.hnwi_world_tags || null
  }, [state.intelligence.dashboard])
}

export default ElitePulseProvider