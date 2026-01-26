// contexts/app-data-context.tsx
// Centralized data fetching context to prevent duplicate API calls

"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { getCurrentUserId } from "@/lib/auth-manager"
import { secureApi } from "@/lib/secure-api"

interface CrownVaultData {
  stats: any
  assets: any[]
  lastFetched: number
}

interface NotificationData {
  notifications: any[]
  stats: any
  preferences: any
  lastFetched: number
}

interface IntelligenceData {
  dashboard: any
  lastFetched: number
}

interface AppDataState {
  crownVault: CrownVaultData | null
  notifications: NotificationData | null
  intelligence: IntelligenceData | null
  isLoading: {
    crownVault: boolean
    notifications: boolean
    intelligence: boolean
  }
  error: {
    crownVault: string | null
    notifications: string | null
    intelligence: string | null
  }
}

interface AppDataContextValue {
  state: AppDataState
  fetchCrownVaultData: () => Promise<void>
  fetchNotificationData: () => Promise<void>
  fetchIntelligenceData: () => Promise<void>
  clearCache: (type?: 'crownVault' | 'notifications' | 'intelligence') => void
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined)

// Define which routes need which data
const ROUTE_DATA_CONFIG = {
  '/dashboard': ['intelligence', 'crownVault', 'notifications'],
  '/profile': ['crownVault', 'notifications'],
  '/crown-vault': ['crownVault'],
  '/social-hub': ['notifications'],
  '/calendar': ['notifications'],
  '/hnwi-world': [], // Doesn't need any of these
  '/ask-rohith': [], // Doesn't need any of these
  '/prive-exchange': [],
  '/invest-scan': [],
  '/tactics-lab': [],
  '/playbooks': []
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const fetchInProgressRef = useRef<Set<string>>(new Set())

  const [state, setState] = useState<AppDataState>({
    crownVault: null,
    notifications: null,
    intelligence: null,
    isLoading: {
      crownVault: false,
      notifications: false,
      intelligence: false
    },
    error: {
      crownVault: null,
      notifications: null,
      intelligence: null
    }
  })

  // Get required data types for current route
  const getRequiredDataForRoute = useCallback((path: string): string[] => {
    for (const [route, dataTypes] of Object.entries(ROUTE_DATA_CONFIG)) {
      if (path.startsWith(route)) {
        return dataTypes
      }
    }
    return []
  }, [])

  // Check if data is still fresh
  const isDataFresh = useCallback((lastFetched: number | undefined): boolean => {
    if (!lastFetched) return false
    return Date.now() - lastFetched < CACHE_TTL
  }, [])

  // Fetch Crown Vault data
  const fetchCrownVaultData = useCallback(async () => {
    // Check if already fetching or data is fresh
    if (fetchInProgressRef.current.has('crownVault')) return
    if (state.crownVault && isDataFresh(state.crownVault.lastFetched)) return

    const userId = getCurrentUserId()
    if (!userId) return

    fetchInProgressRef.current.add('crownVault')
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, crownVault: true },
      error: { ...prev.error, crownVault: null }
    }))

    try {
      const [stats, assets] = await Promise.all([
        secureApi.get(`/api/crown-vault/stats?owner_id=${userId}`, true),
        secureApi.get(`/api/crown-vault/assets/detailed?owner_id=${userId}`, true)
      ])

      setState(prev => ({
        ...prev,
        crownVault: {
          stats,
          assets,
          lastFetched: Date.now()
        },
        isLoading: { ...prev.isLoading, crownVault: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, crownVault: false },
        error: { ...prev.error, crownVault: 'Failed to fetch Crown Vault data' }
      }))
    } finally {
      fetchInProgressRef.current.delete('crownVault')
    }
  }, [state.crownVault, isDataFresh])

  // Fetch Notification data
  const fetchNotificationData = useCallback(async () => {
    // Check if already fetching or data is fresh
    if (fetchInProgressRef.current.has('notifications')) return
    if (state.notifications && isDataFresh(state.notifications.lastFetched)) return

    fetchInProgressRef.current.add('notifications')
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, notifications: true },
      error: { ...prev.error, notifications: null }
    }))

    try {
      const [notifications, preferences] = await Promise.all([
        secureApi.get('/api/notifications/inbox?limit=20&offset=0&unread_only=false', true),
        secureApi.get('/api/notifications/preferences', true)
      ])

      setState(prev => ({
        ...prev,
        notifications: {
          notifications: notifications.notifications || [],
          stats: notifications.stats || {},
          preferences,
          lastFetched: Date.now()
        },
        isLoading: { ...prev.isLoading, notifications: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, notifications: false },
        error: { ...prev.error, notifications: 'Failed to fetch notifications' }
      }))
    } finally {
      fetchInProgressRef.current.delete('notifications')
    }
  }, [state.notifications, isDataFresh])

  // Fetch Intelligence data
  const fetchIntelligenceData = useCallback(async () => {
    // Check if already fetching or data is fresh
    if (fetchInProgressRef.current.has('intelligence')) return
    if (state.intelligence && isDataFresh(state.intelligence.lastFetched)) return

    const userId = getCurrentUserId()
    if (!userId) return

    fetchInProgressRef.current.add('intelligence')
    setState(prev => ({
      ...prev,
      isLoading: { ...prev.isLoading, intelligence: true },
      error: { ...prev.error, intelligence: null }
    }))

    try {
      const dashboard = await secureApi.get(`/api/hnwi/intelligence/dashboard/${userId}`, true)

      setState(prev => ({
        ...prev,
        intelligence: {
          dashboard,
          lastFetched: Date.now()
        },
        isLoading: { ...prev.isLoading, intelligence: false }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: { ...prev.isLoading, intelligence: false },
        error: { ...prev.error, intelligence: 'Failed to fetch intelligence data' }
      }))
    } finally {
      fetchInProgressRef.current.delete('intelligence')
    }
  }, [state.intelligence, isDataFresh])

  // Clear cache
  const clearCache = useCallback((type?: 'crownVault' | 'notifications' | 'intelligence') => {
    if (!type) {
      setState(prev => ({
        ...prev,
        crownVault: null,
        notifications: null,
        intelligence: null
      }))
    } else {
      setState(prev => ({
        ...prev,
        [type]: null
      }))
    }
  }, [])

  // DISABLED: Components are using their own data fetching hooks
  // This was causing duplicate API calls
  // TODO: Either use this centralized approach OR component-level hooks, not both
  useEffect(() => {
    // Disabled to prevent duplicate API calls
    // Components like HomeDashboardElite use useIntelligenceData hook directly
    return
  }, [])

  // Listen for cache clearing events
  useEffect(() => {
    const handleClearIntelligence = () => {
      console.log('[App Data] Clearing intelligence cache')
      clearCache('intelligence')
    }

    window.addEventListener('app-data:clear-intelligence', handleClearIntelligence)
    return () => window.removeEventListener('app-data:clear-intelligence', handleClearIntelligence)
  }, [clearCache])

  const value: AppDataContextValue = {
    state,
    fetchCrownVaultData,
    fetchNotificationData,
    fetchIntelligenceData,
    clearCache
  }

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  )
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}