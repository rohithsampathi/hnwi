// hooks/use-auth-sync.ts
// Session synchronization hook for consistent authentication state

import { useEffect, useCallback, useRef } from 'react'
import { loginUser, logoutUser, getCurrentUser, isAuthenticated as authManagerAuthenticated } from '@/lib/auth-manager'
import { setAuthState, isAuthenticated as secureApiAuthenticated } from '@/lib/secure-api'

interface UseAuthSyncOptions {
  autoSync?: boolean
  onAuthChange?: (authenticated: boolean, user: any) => void
  debug?: boolean
}

export function useAuthSync(options: UseAuthSyncOptions = {}) {
  const { autoSync = true, onAuthChange, debug = false } = options
  const syncInProgressRef = useRef(false)
  const lastSyncTimeRef = useRef(0)

  const log = useCallback((message: string, data?: any) => {
    if (debug && typeof window !== 'undefined') {
      console.log(`[AuthSync] ${message}`, data || '')
    }
  }, [debug])

  const syncAuthState = useCallback(async () => {
    // Prevent concurrent syncs
    const now = Date.now()
    if (syncInProgressRef.current || (now - lastSyncTimeRef.current) < 1000) {
      log('Sync skipped - already in progress or too recent')
      return
    }

    syncInProgressRef.current = true
    lastSyncTimeRef.current = now

    try {
      log('Starting auth state sync')

      // Check current state
      const authManagerAuth = authManagerAuthenticated()
      const secureApiAuth = secureApiAuthenticated()
      const currentUser = getCurrentUser()

      log('Current auth states', {
        authManager: authManagerAuth,
        secureApi: secureApiAuth,
        hasUser: !!currentUser
      })

      // If states are already consistent and we have user data, we're good
      if (authManagerAuth && secureApiAuth && currentUser) {
        log('Auth states already consistent')
        onAuthChange?.(true, currentUser)
        return
      }

      // Try to get session from backend
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.user) {
            log('Session found, syncing auth states', { user: data.user.email })

            // Sync all auth systems
            const normalizedUser = loginUser(data.user)
            setAuthState(true)

            // Ensure sessionStorage is updated (critical for PWA)
            if (normalizedUser) {
              sessionStorage.setItem('userObject', JSON.stringify(normalizedUser))
              sessionStorage.setItem('userId', normalizedUser.id || normalizedUser.user_id || '')
              sessionStorage.setItem('userEmail', normalizedUser.email || '')
            }

            onAuthChange?.(true, normalizedUser)
            log('Auth state sync completed successfully')
          } else {
            log('No session found, clearing auth states')

            // Clear all auth states
            logoutUser()
            setAuthState(false)
            onAuthChange?.(false, null)
          }
        } else if (response.status === 401) {
          log('Session expired, clearing auth states')

          // Clear all auth states
          logoutUser()
          setAuthState(false)
          onAuthChange?.(false, null)
        } else {
          log('Session check failed', { status: response.status })
        }
      } catch (error) {
        log('Session check network error', error)

        // On network error, keep existing state if we have user data
        if (currentUser) {
          log('Keeping existing auth state due to network error')
          setAuthState(true)
        }
      }
    } finally {
      syncInProgressRef.current = false
    }
  }, [onAuthChange, log])

  // Auto-sync on mount
  useEffect(() => {
    if (autoSync && typeof window !== 'undefined') {
      // Small delay to allow other initialization to complete
      const timer = setTimeout(syncAuthState, 100)
      return () => clearTimeout(timer)
    }
  }, [autoSync, syncAuthState])

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userObject' || e.key === 'userId') {
        log('Storage changed, triggering sync')
        setTimeout(syncAuthState, 100)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [syncAuthState, log])

  // Listen for auth events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleAuthLogin = () => {
      log('Auth login event detected')
      setTimeout(syncAuthState, 100)
    }

    const handleAuthLogout = () => {
      log('Auth logout event detected')
      logoutUser()
      setAuthState(false)
      onAuthChange?.(false, null)
    }

    window.addEventListener('auth:login', handleAuthLogin)
    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      window.removeEventListener('auth:login', handleAuthLogin)
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [syncAuthState, onAuthChange, log])

  // Return sync function for manual use
  return {
    syncAuthState,
    isAuthenticated: authManagerAuthenticated() && secureApiAuthenticated(),
    user: getCurrentUser()
  }
}