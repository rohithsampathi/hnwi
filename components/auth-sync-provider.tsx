"use client"

import { useEffect, useState, useRef } from 'react'
import { unifiedAuthManager, type AuthState } from '@/lib/unified-auth-manager'

interface AuthSyncProviderProps {
  children: React.ReactNode
}

// Helper to check if auth cookies exist (prevents premature session checks)
function hasAuthCookies(): boolean {
  if (typeof document === 'undefined') return false

  const cookies = document.cookie
  // Check for any of the auth-related cookies
  return cookies.includes('access_token') ||
         cookies.includes('session_token') ||
         cookies.includes('refresh_token')
}

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(() =>
    unifiedAuthManager.getAuthState()
  )
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Subscribe to unified auth manager (which leverages secure-api)
    const unsubscribe = unifiedAuthManager.subscribe((state) => {
      setAuthState(state)
    })

    // Initial session check using secure-api
    unifiedAuthManager.checkSession()

    return unsubscribe
  }, [])

  // Listen for page visibility changes to refresh session
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Clear any pending timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
        visibilityTimeoutRef.current = null
      }

      if (document.visibilityState === 'visible' && !authState.isLoading) {
        // PWA Fix: Debounce session check by 1 second
        // This allows cookies to propagate from iOS/Android cookie store to browser context
        // before we attempt authentication check
        visibilityTimeoutRef.current = setTimeout(() => {
          // Only check session if auth cookies exist
          // Prevents 401 errors when cookies haven't synced yet after PWA wake
          if (hasAuthCookies()) {
            unifiedAuthManager.checkSession()
          }
        }, 1000) // 1 second delay for cookie propagation
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Clean up timeout on unmount
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current)
      }
    }
  }, [authState.isLoading])

  return <>{children}</>
}