// =============================================================================
// USE REPORT AUTH — Cookie-backed auth wrapper for protected Decision Memo reports
// No report tokens are persisted in browser storage.
// =============================================================================

import { useCallback, useState } from 'react'

export function useReportAuth() {
  const [needsAuth, setNeedsAuth] = useState(false)
  const [hasReportSession, setHasReportSession] = useState(false)

  const setAuthenticated = useCallback(() => {
    setHasReportSession(true)
    setNeedsAuth(false)
  }, [])

  const clearToken = useCallback(() => {
    setHasReportSession(false)
    setNeedsAuth(true)
  }, [])

  const reportFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<any | null> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    })

    if (response.status === 401) {
      clearToken()
      return null
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    setAuthenticated()
    return response.json()
  }, [clearToken, setAuthenticated])

  return {
    token: null,
    hasReportSession,
    needsAuth,
    setNeedsAuth,
    setToken: setAuthenticated,
    clearToken,
    reportFetch,
  }
}
