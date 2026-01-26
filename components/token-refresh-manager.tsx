'use client'

import { useEffect, useRef, useCallback } from 'react'
import { refreshToken } from '@/lib/secure-api'
import { isAuthenticated } from '@/lib/auth-manager'

interface TokenRefreshManagerProps {
  refreshIntervalMinutes?: number
}

// Helper to detect PWA standalone mode
const isPWAStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
}

// Helper to check if this is a public route
const isPublicRoute = (): boolean => {
  if (typeof window === 'undefined') return false
  const pathname = window.location.pathname
  return pathname.includes('/simulation') || pathname.includes('/decision-memo')
}

export default function TokenRefreshManager({ refreshIntervalMinutes = 45 }: TokenRefreshManagerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRefreshRef = useRef<number>(0)

  const performBackgroundRefresh = useCallback(async (force: boolean = false) => {
    try {
      // Never refresh on public routes
      if (isPublicRoute()) {
        return
      }

      // Prevent rapid refresh calls (minimum 2 minutes between refreshes unless forced)
      const now = Date.now()
      if (!force && lastRefreshRef.current && (now - lastRefreshRef.current) < 2 * 60 * 1000) {
        return
      }

      // Check again before refreshing - don't refresh if recently logged in (unless in PWA mode)
      const currentLoginTimestamp = localStorage.getItem('loginTimestamp')
      const stillRecent = currentLoginTimestamp && (Date.now() - parseInt(currentLoginTimestamp)) < 120000 // 2 minutes

      // In PWA mode, we're more aggressive with refresh to maintain session
      if (stillRecent && !isPWAStandalone()) {
        return
      }

      // Only refresh if still authenticated
      if (isAuthenticated()) {
        const success = await refreshToken()
        if (success) {
          lastRefreshRef.current = Date.now()
        }
      }
    } catch (error) {
      // Token refresh failed - will retry on next interval
      console.log('[TokenRefresh] Background refresh failed:', error)
    }
  }, [])

  useEffect(() => {
    // Never run token refresh on public routes
    if (isPublicRoute()) {
      return
    }

    // Only start background refresh if user is authenticated
    if (!isAuthenticated()) {
      return
    }

    // PWA FIX: Use shorter interval in PWA mode to keep cookies fresh
    const isPWA = isPWAStandalone()
    const effectiveIntervalMinutes = isPWA ? Math.min(refreshIntervalMinutes, 30) : refreshIntervalMinutes
    const refreshIntervalMs = effectiveIntervalMinutes * 60 * 1000

    // Start the refresh timer
    intervalRef.current = setInterval(() => performBackgroundRefresh(false), refreshIntervalMs)

    // Initial refresh timing depends on PWA mode
    // PWA: 5 minutes after mount (cookies may have expired in background)
    // Browser: 20 minutes after mount (more stable)
    const initialDelayMs = isPWA ? 5 * 60 * 1000 : 20 * 60 * 1000
    const initialRefreshTimer = setTimeout(() => performBackgroundRefresh(false), initialDelayMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      clearTimeout(initialRefreshTimer)
    }
  }, [refreshIntervalMinutes, performBackgroundRefresh])

  // PWA FIX: Refresh token when app becomes visible (cookies may have expired in background)
  useEffect(() => {
    if (isPublicRoute()) return

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      if (!isAuthenticated()) return

      // Only do aggressive refresh in PWA mode
      if (!isPWAStandalone()) return

      // Refresh if app was hidden for more than 5 minutes
      const now = Date.now()
      if (lastRefreshRef.current && (now - lastRefreshRef.current) > 5 * 60 * 1000) {
        console.log('[PWA TokenRefresh] App became visible after 5+ min - refreshing token')
        await performBackgroundRefresh(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [performBackgroundRefresh])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // This component doesn't render anything visible
  return null
}