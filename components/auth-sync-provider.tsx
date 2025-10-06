"use client"

import { useEffect, useState } from 'react'
import { unifiedAuthManager, type AuthState } from '@/lib/unified-auth-manager'

interface AuthSyncProviderProps {
  children: React.ReactNode
}

export function AuthSyncProvider({ children }: AuthSyncProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(() =>
    unifiedAuthManager.getAuthState()
  )

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
      if (document.visibilityState === 'visible' && !authState.isLoading) {
        // Page became visible, refresh session using secure-api
        unifiedAuthManager.checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [authState.isLoading])

  return <>{children}</>
}