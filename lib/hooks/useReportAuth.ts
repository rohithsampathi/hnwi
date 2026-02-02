// =============================================================================
// USE REPORT AUTH — Token management for protected Decision Memo reports
// Supports "Remember on this device" (localStorage, 7 days) and session-only
// =============================================================================

import { useState, useCallback } from 'react'

const TOKEN_PREFIX = 'report_token_'
const EXPIRY_PREFIX = 'report_token_exp_'

/**
 * Hook for managing report-scoped authentication tokens.
 *
 * Tokens can be stored in:
 * - sessionStorage (default) — cleared when tab closes
 * - localStorage (remember_device) — persists for 7 days
 *
 * Usage:
 *   const { token, needsAuth, setToken, reportFetch } = useReportAuth(intakeId)
 */
export function useReportAuth(intakeId: string) {
  const storageKey = `${TOKEN_PREFIX}${intakeId}`
  const expiryKey = `${EXPIRY_PREFIX}${intakeId}`

  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null

    // Check localStorage first (remembered device)
    const remembered = localStorage.getItem(storageKey)
    if (remembered) {
      const expiresAt = localStorage.getItem(expiryKey)
      if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
        // Expired — clean up
        localStorage.removeItem(storageKey)
        localStorage.removeItem(expiryKey)
        return null
      }
      return remembered
    }

    // Fall back to sessionStorage
    return sessionStorage.getItem(storageKey)
  }

  const [token, setTokenState] = useState<string | null>(getStoredToken)
  const [needsAuth, setNeedsAuth] = useState(false)

  /**
   * Store a token. If rememberDevice is true, uses localStorage with 7-day expiry.
   * Otherwise uses sessionStorage (cleared when tab closes).
   */
  const setToken = useCallback((newToken: string, rememberDevice: boolean = false) => {
    if (typeof window !== 'undefined') {
      if (rememberDevice) {
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
        localStorage.setItem(storageKey, newToken)
        localStorage.setItem(expiryKey, String(Date.now() + sevenDaysMs))
        // Clean sessionStorage if it had an old token
        sessionStorage.removeItem(storageKey)
      } else {
        sessionStorage.setItem(storageKey, newToken)
        // Clean localStorage if switching back to session-only
        localStorage.removeItem(storageKey)
        localStorage.removeItem(expiryKey)
      }
    }
    setTokenState(newToken)
    setNeedsAuth(false)
  }, [storageKey, expiryKey])

  const clearToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey)
      localStorage.removeItem(storageKey)
      localStorage.removeItem(expiryKey)
    }
    setTokenState(null)
    setNeedsAuth(true)
  }, [storageKey, expiryKey])

  /**
   * Fetch wrapper that adds the report auth token and detects 401.
   * Returns the JSON response, or null if auth is needed (sets needsAuth=true).
   */
  const reportFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<any | null> => {
    const currentToken = getStoredToken()
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    }

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 401) {
      // Token missing, expired, or invalid — needs (re)authentication
      clearToken()
      return null
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    return response.json()
  }, [clearToken])

  return {
    token,
    needsAuth,
    setNeedsAuth,
    setToken,
    clearToken,
    reportFetch
  }
}
