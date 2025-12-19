'use client'

import { useEffect, useRef } from 'react'
import { refreshToken } from '@/lib/secure-api'
import { isAuthenticated } from '@/lib/auth-manager'

interface TokenRefreshManagerProps {
  refreshIntervalMinutes?: number
}

export default function TokenRefreshManager({ refreshIntervalMinutes = 45 }: TokenRefreshManagerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // ROOT FIX: Never run token refresh on simulation pages (public access)
    if (typeof window !== 'undefined' && window.location.pathname.includes('/simulation')) {
      return
    }

    // Only start background refresh if user is authenticated
    if (!isAuthenticated()) {
      return
    }

    // ROOT FIX: Don't start refresh if user just logged in
    const loginTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem('loginTimestamp') : null
    const recentlyLoggedIn = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 300000 // 5 minutes

    const refreshIntervalMs = refreshIntervalMinutes * 60 * 1000 // Convert minutes to milliseconds

    const performBackgroundRefresh = async () => {
      try {
        // ROOT FIX: Never refresh on simulation pages
        if (window.location.pathname.includes('/simulation')) {
          return
        }

        // Check again before refreshing - don't refresh if recently logged in
        const currentLoginTimestamp = sessionStorage.getItem('loginTimestamp')
        const stillRecent = currentLoginTimestamp && (Date.now() - parseInt(currentLoginTimestamp)) < 300000

        if (stillRecent) {
          return
        }

        // Only refresh if still authenticated
        if (isAuthenticated()) {
          const success = await refreshToken()
          // Token refresh completed
        }
      } catch (error) {
        // Token refresh failed - will retry on next interval
      }
    }

    // Start the refresh timer
    intervalRef.current = setInterval(performBackgroundRefresh, refreshIntervalMs)

    // ROOT FIX: Delay initial refresh - 20 minutes after component mount (not 5)
    // This gives plenty of time for auth to stabilize after login
    const initialRefreshTimer = setTimeout(performBackgroundRefresh, 20 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      clearTimeout(initialRefreshTimer)
    }
  }, [refreshIntervalMinutes])

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