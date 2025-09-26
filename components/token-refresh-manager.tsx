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
    // Only start background refresh if user is authenticated
    if (!isAuthenticated()) {
      return
    }

    const refreshIntervalMs = refreshIntervalMinutes * 60 * 1000 // Convert minutes to milliseconds

    const performBackgroundRefresh = async () => {
      try {
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

    // Also perform an initial refresh after 5 minutes to ensure we have a fresh token
    const initialRefreshTimer = setTimeout(performBackgroundRefresh, 5 * 60 * 1000)

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