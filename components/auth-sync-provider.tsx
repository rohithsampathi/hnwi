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
  const lastVisibleSyncAtRef = useRef(0)
  const hiddenSinceRef = useRef<number | null>(null)

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

      if (document.visibilityState === 'hidden') {
        hiddenSinceRef.current = Date.now()
        return
      }

      if (document.visibilityState === 'visible' && !authState.isLoading) {
        const now = Date.now()
        const hiddenForMs = hiddenSinceRef.current ? now - hiddenSinceRef.current : 0

        // Avoid hammering /api/auth/session on quick tab switches, DevTools focus changes,
        // and route transitions that do not represent a meaningful auth boundary.
        if (lastVisibleSyncAtRef.current && now - lastVisibleSyncAtRef.current < 60000) {
          return
        }

        if (hiddenSinceRef.current && hiddenForMs < 30000) {
          return
        }

        // PWA Fix: Debounce session check by 1 second.
        // This allows cookies to propagate from the OS cookie store before validation.
        visibilityTimeoutRef.current = setTimeout(() => {
          // Only check session when client state indicates a recoverable auth session.
          if (hasRecoverableAuthState()) {
            lastVisibleSyncAtRef.current = Date.now()
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
