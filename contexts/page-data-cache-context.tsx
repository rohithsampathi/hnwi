// contexts/page-data-cache-context.tsx
// Page-level data caching to prevent full reloads on navigation
// Keeps data in memory across page transitions

"use client"

import React, { createContext, useContext, useRef } from 'react'

interface PageDataCache {
  [pageName: string]: {
    data: any
    timestamp: number
    ttl: number
  }
}

interface PageDataCacheContextValue {
  getCachedData: (pageName: string) => any | null
  setCachedData: (pageName: string, data: any, ttl?: number) => void
  clearCachedData: (pageName: string) => void
  clearAllCache: () => void
  isCacheValid: (pageName: string) => boolean
}

const PageDataCacheContext = createContext<PageDataCacheContextValue | undefined>(undefined)

export function PageDataCacheProvider({ children }: { children: React.ReactNode }) {
  // Use ref to persist data across renders without causing re-renders
  const cacheRef = useRef<PageDataCache>({})

  const getCachedData = (pageName: string): any | null => {
    const cached = cacheRef.current[pageName]
    if (!cached) return null

    // Check if cache is still valid
    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      // Cache expired
      delete cacheRef.current[pageName]
      return null
    }

    return cached.data
  }

  const setCachedData = (pageName: string, data: any, ttl: number = 300000): void => {
    // Default TTL: 5 minutes (300000ms)
    cacheRef.current[pageName] = {
      data,
      timestamp: Date.now(),
      ttl
    }
  }

  const clearCachedData = (pageName: string): void => {
    delete cacheRef.current[pageName]
  }

  const clearAllCache = (): void => {
    cacheRef.current = {}
  }

  const isCacheValid = (pageName: string): boolean => {
    const cached = cacheRef.current[pageName]
    if (!cached) return false

    const now = Date.now()
    return (now - cached.timestamp) <= cached.ttl
  }

  const value: PageDataCacheContextValue = {
    getCachedData,
    setCachedData,
    clearCachedData,
    clearAllCache,
    isCacheValid
  }

  return (
    <PageDataCacheContext.Provider value={value}>
      {children}
    </PageDataCacheContext.Provider>
  )
}

export function usePageDataCache() {
  const context = useContext(PageDataCacheContext)
  if (!context) {
    throw new Error('usePageDataCache must be used within PageDataCacheProvider')
  }
  return context
}
