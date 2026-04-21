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
const CRISIS_FETCH_TIMEOUT_MS = 5000
const CRISIS_CACHE_TTL_MS = 30000

let cachedCrisisData: CrisisIntelligenceResponse | null = null
let cachedCrisisFetchedAt = 0
let inflightCrisisRequest: Promise<CrisisIntelligenceResponse> | null = null

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("crisis-intelligence-timeout")), timeoutMs)

    promise
      .then((value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      })
      .catch((error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      })
  })
}

function getValidCachedCrisisData(): CrisisIntelligenceResponse | null {
  if (!cachedCrisisData) return null
  if (Date.now() - cachedCrisisFetchedAt > CRISIS_CACHE_TTL_MS) {
    cachedCrisisData = null
    cachedCrisisFetchedAt = 0
    return null
  }

  return cachedCrisisData
}

async function fetchCrisisIntelligenceCached(force: boolean = false): Promise<CrisisIntelligenceResponse> {
  if (!force) {
    const cached = getValidCachedCrisisData()
    if (cached) {
      return cached
    }

    if (inflightCrisisRequest) {
      return inflightCrisisRequest
    }
  }

  const request = withTimeout(fetchCrisisIntelligence(), CRISIS_FETCH_TIMEOUT_MS)
    .then((data) => {
      cachedCrisisData = data
      cachedCrisisFetchedAt = Date.now()
      return data
    })
    .finally(() => {
      inflightCrisisRequest = null
    })

  inflightCrisisRequest = request
  return request
}

export function CrisisIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const [crisisData, setCrisisData] = useState<CrisisIntelligenceResponse | null>(() => getValidCachedCrisisData())

  const toggleCrisisAlert = useCallback(() => {
    setShowCrisisAlert(prev => !prev)
  }, [])

  // Single fetch for the entire app — shared across all map instances
  useEffect(() => {
    let cancelled = false

    const doFetch = (force: boolean = false) =>
      fetchCrisisIntelligenceCached(force)
        .then((data) => { if (!cancelled) setCrisisData(data) })
        .catch(() => {})

    let initTimeout: ReturnType<typeof setTimeout> | null = null

    initTimeout = setTimeout(() => {
      fetchCrisisIntelligenceCached()
        .then((data) => { if (!cancelled) setCrisisData(data) })
        .catch(() => {
          if (!cancelled) {
            setTimeout(() => {
              fetchCrisisIntelligenceCached(true)
                .then((data) => { if (!cancelled) setCrisisData(data) })
                .catch(() => {})
            }, 5000)
          }
        })
    }, 1500)

    // Refresh every 10 minutes
    const interval = setInterval(() => { void doFetch(true) }, CRISIS_CACHE_TTL_MS)

    // Re-fetch immediately when viewer access changes inside an already-mounted app surface.
    // The authenticated layout mounts this provider after platform login, so generic
    // auth:login listeners only create redundant refetches during session revalidation.
    const handleAuthChanged = () => { if (!cancelled) void doFetch(true) }
    window.addEventListener('hnwi-auth-changed', handleAuthChanged)

    return () => {
      cancelled = true
      if (initTimeout) clearTimeout(initTimeout)
      clearInterval(interval)
      window.removeEventListener('hnwi-auth-changed', handleAuthChanged)
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
    return crisisData.locations
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
