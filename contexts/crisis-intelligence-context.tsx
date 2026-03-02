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

    // Delay initial fetch slightly to let auth session establish
    const initTimeout = setTimeout(() => {
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

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchCrisisIntelligence()
        .then((data) => { if (!cancelled) setCrisisData(data) })
        .catch(() => {})
    }, 300_000)

    return () => { cancelled = true; clearTimeout(initTimeout); clearInterval(interval) }
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
