// components/auth-provider.tsx
"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { getCurrentUser } from "@/lib/auth-manager"
import { clearAuthSessionCache, primeAuthSessionCache } from "@/lib/client-auth-session"
import { unifiedAuthManager } from "@/lib/unified-auth-manager"

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  refreshSession: (force?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isAuthenticated: false,
  refreshSession: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialAuthState = unifiedAuthManager.getAuthState()
  const [user, setUser] = useState<any | null>(() => initialAuthState.user ?? getCurrentUser())
  const [loading, setLoading] = useState(() => initialAuthState.isLoading && !(initialAuthState.user ?? getCurrentUser()))

  const refreshSession = useCallback(async (force = true) => {
    const currentState = unifiedAuthManager.getAuthState()

    if (!force && currentState.user) {
      setUser(currentState.user)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const nextState = await unifiedAuthManager.checkSession()
      setUser(nextState.user ?? null)
      setLoading(nextState.isLoading)
    } catch (error) {
      setUser(null)
      setLoading(false)
    } finally {
      const nextUser = getCurrentUser()
      if (nextUser) {
        primeAuthSessionCache({ user: nextUser })
      } else {
        clearAuthSessionCache()
      }
    }
  }, [])

  useEffect(() => {
    const unsubscribe = unifiedAuthManager.subscribe((state) => {
      setUser(state.user ?? null)
      setLoading(state.isLoading)

      if (state.user) {
        primeAuthSessionCache({ user: state.user })
      } else {
        clearAuthSessionCache()
      }
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const handleAuthLogin = () => {
      const nextUser = getCurrentUser()
      if (nextUser) {
        primeAuthSessionCache({ user: nextUser })
      } else {
        clearAuthSessionCache()
      }
      setUser(nextUser)
      setLoading(false)
    }

    const handleAuthUserUpdated = () => {
      const nextUser = getCurrentUser()
      if (nextUser) {
        primeAuthSessionCache({ user: nextUser })
      }
      setUser(nextUser)
    }

    const handleAuthLogout = () => {
      clearAuthSessionCache()
      setUser(null)
      setLoading(false)
    }

    window.addEventListener('auth:login', handleAuthLogin)
    window.addEventListener('auth:userUpdated', handleAuthUserUpdated)
    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      window.removeEventListener('auth:login', handleAuthLogin)
      window.removeEventListener('auth:userUpdated', handleAuthUserUpdated)
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [])

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user && !loading,
    refreshSession
  }), [user, loading, refreshSession])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
