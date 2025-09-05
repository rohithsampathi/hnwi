// components/auth-provider.tsx
"use client"

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { secureApi } from "@/lib/secure-api"

interface AuthContextType {
  user: any | null
  loading: boolean
  isAuthenticated: boolean
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isAuthenticated: false,
  refreshSession: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true)
      // Check localStorage token first for faster auth check
      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        return
      }
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      setUser(null)
      // Clear invalid token
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
      setSessionChecked(true)
    }
  }, [])

  useEffect(() => {
    // Only check session once on mount
    if (!sessionChecked) {
      refreshSession()
    }
  }, [sessionChecked, refreshSession])

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