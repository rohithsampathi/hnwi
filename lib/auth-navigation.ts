"use client"

import {
  AUTH_LOGIN_TIMESTAMP_KEY,
  AUTH_SESSION_ACTIVE_KEY,
  AUTH_USER_ID_KEY,
} from "@/lib/auth-storage"
import { hasAuthRecoveryFailure } from "@/lib/auth-recovery-state"

export const PUBLIC_HOME_ROUTE = "/"
export const LOGIN_ROUTE = "/auth/login"
export const DASHBOARD_ROUTE = "/dashboard"

const SKIP_SPLASH_KEY = "skipSplash"
const CURRENT_PAGE_KEY = "currentPage"
const DASHBOARD_PAGE_KEY = "dashboard"

export function markDashboardEntryIntent(): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(SKIP_SPLASH_KEY, "true")
  window.sessionStorage.setItem(CURRENT_PAGE_KEY, DASHBOARD_PAGE_KEY)
}

export function shouldBypassSplash(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const currentPage = window.sessionStorage.getItem(CURRENT_PAGE_KEY)
  const skipSplash = window.sessionStorage.getItem(SKIP_SPLASH_KEY)
  return currentPage === DASHBOARD_PAGE_KEY || skipSplash === "true"
}

export function hasRecoverableAuthState(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  if (hasAuthRecoveryFailure()) {
    return false
  }

  const sessionUserId = window.sessionStorage.getItem(AUTH_USER_ID_KEY)
  const hasSameTabSession =
    window.sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === "true" &&
    Boolean(sessionUserId)

  if (hasSameTabSession) {
    return true
  }

  const localUserId = window.localStorage.getItem(AUTH_USER_ID_KEY)
  const loginTimestamp = Number(window.localStorage.getItem(AUTH_LOGIN_TIMESTAMP_KEY) || "0")
  const hasRecentLocalLogin =
    Boolean(localUserId) &&
    Boolean(loginTimestamp) &&
    Date.now() - loginTimestamp < 2 * 60 * 1000

  return hasRecentLocalLogin
}
