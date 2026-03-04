"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import {
  fetchCrisisIntelligence,
  buildZoneMap,
  computeCrisisCounts,
  type CrisisIntelligenceResponse,
  type CrisisLocation,
  type CrisisZone,
  type CrisisCounts,
  type CrisisColorConfig,
  type CrisisStatus,
} from "@/lib/crisis-overlay"

interface CrisisIntelligenceState {
  // Toggle
  showCrisisAlert: boolean
  toggleCrisisAlert: () => void
  // Raw data
  crisisData: CrisisIntelligenceResponse | null
  // Derived
  crisisZoneMap: Record<string, CrisisZone>
  crisisCounts: CrisisCounts
  crisisColors: Record<CrisisStatus, CrisisColorConfig> | null
  crisisLocations: CrisisLocation[]
}

const CrisisIntelligenceContext = createContext<CrisisIntelligenceState | null>(null)

export function CrisisIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const [crisisData, setCrisisData] = useState<CrisisIntelligenceResponse | null>(null)

  const toggleCrisisAlert = useCallback(() => {
    setShowCrisisAlert(prev => !prev)
  }, [])

  // Single fetch for the entire app — shared across all map instances
  useEffect(() => {
    let cancelled = false

    const doFetch = () =>
      fetchCrisisIntelligence()
        .then((data) => { if (!cancelled) setCrisisData(data) })
        .catch(() => {})

    // Quick auth check — skip the initial fetch if user clearly isn't logged in yet.
    // This avoids noisy 401s when the provider mounts on unauthenticated pages
    // (e.g. /decision-memo before login). The auth-event listeners below will
    // trigger a fetch as soon as login completes.
    const hasAuth = typeof window !== 'undefined' && (
      !!localStorage.getItem('userId') ||
      !!sessionStorage.getItem('userId') ||
      !!sessionStorage.getItem('latest_report_token')
    )

    let initTimeout: ReturnType<typeof setTimeout> | null = null

    if (hasAuth) {
      // User appears authenticated — fetch with a short delay for session to settle
      initTimeout = setTimeout(() => {
        fetchCrisisIntelligence()
          .then((data) => { if (!cancelled) setCrisisData(data) })
          .catch(() => {
            // Single retry after 5s if auth wasn't ready
            if (!cancelled) {
              setTimeout(() => {
                fetchCrisisIntelligence()
                  .then((data) => { if (!cancelled) setCrisisData(data) })
                  .catch(() => {})
              }, 5000)
            }
          })
      }, 1500)
    }

    // Refresh every 5 minutes
    const interval = setInterval(doFetch, 300_000)

    // Re-fetch immediately when auth state changes:
    // - 'hnwi-auth-changed': viewer logs in via audit popup OR Decision Memo popup
    // - 'auth:login': platform user logs in (syncAuthSystems dispatches this)
    // This covers the case where provider mounts before login.
    const handleAuthChanged = () => { if (!cancelled) doFetch() }
    window.addEventListener('hnwi-auth-changed', handleAuthChanged)
    window.addEventListener('auth:login', handleAuthChanged)

    return () => {
      cancelled = true
      if (initTimeout) clearTimeout(initTimeout)
      clearInterval(interval)
      window.removeEventListener('hnwi-auth-changed', handleAuthChanged)
      window.removeEventListener('auth:login', handleAuthChanged)
    }
  }, [])

  // Derived data
  const crisisZoneMap = useMemo(
    () => crisisData ? buildZoneMap(crisisData.zones) : {},
    [crisisData]
  )
  const crisisCounts = useMemo(
    () => crisisData ? computeCrisisCounts(crisisData.zones) : { red: 0, amber: 0, yellow: 0, total: 0 },
    [crisisData]
  )
  const crisisColors = crisisData?.colors ?? null
  const crisisLocations = useMemo(() => {
    if (!crisisData?.locations) return []
    // Show: red geopolitical locations + ALL AI disruption locations (any status)
    return crisisData.locations.filter(loc =>
      loc.crisis_domain === "ai" || !loc.status || loc.status === "red"
    )
  }, [crisisData?.locations])

  const value = useMemo(() => ({
    showCrisisAlert,
    toggleCrisisAlert,
    crisisData,
    crisisZoneMap,
    crisisCounts,
    crisisColors,
    crisisLocations,
  }), [showCrisisAlert, toggleCrisisAlert, crisisData, crisisZoneMap, crisisCounts, crisisColors, crisisLocations])

  return (
    <CrisisIntelligenceContext.Provider value={value}>
      {children}
    </CrisisIntelligenceContext.Provider>
  )
}

export function useCrisisIntelligence(): CrisisIntelligenceState {
  const ctx = useContext(CrisisIntelligenceContext)
  if (!ctx) {
    // Fallback for components outside the provider (e.g. shared-results page)
    return {
      showCrisisAlert: false,
      toggleCrisisAlert: () => {},
      crisisData: null,
      crisisZoneMap: {},
      crisisCounts: { red: 0, amber: 0, yellow: 0, total: 0 },
      crisisColors: null,
      crisisLocations: [],
    }
  }
  return ctx
}
