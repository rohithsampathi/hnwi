"use client"

import { useEffect, useState, useRef } from 'react'
import { unifiedAuthManager, type AuthState } from '@/lib/unified-auth-manager'
import { hasRecoverableAuthState } from '@/lib/auth-navigation'

interface AuthSyncProviderProps {
  children: React.ReactNode
}

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(() =>
    unifiedAuthManager.getAuthState()
  )
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const unsubscribe = unifiedAuthManager.subscribe((state) => {
      setAuthState(state)
    })

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
          // Only check session when client state indicates a recoverable auth session.
          if (hasRecoverableAuthState()) {
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
