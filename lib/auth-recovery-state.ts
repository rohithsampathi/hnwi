"use client"

import {
  AUTH_RECOVERY_FAILED_KEY,
  AUTH_REFRESH_FAILED_AT_KEY,
} from "@/lib/auth-storage"

const DEFAULT_REFRESH_BACKOFF_MS = 60 * 1000

export function markAuthRecoveryFailed(): void {
  if (typeof window === "undefined") {
    return
  }

  const now = String(Date.now())
  window.sessionStorage.setItem(AUTH_RECOVERY_FAILED_KEY, "true")
  window.sessionStorage.setItem(AUTH_REFRESH_FAILED_AT_KEY, now)
}

export function clearAuthRecoveryFailure(): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(AUTH_RECOVERY_FAILED_KEY)
  window.sessionStorage.removeItem(AUTH_REFRESH_FAILED_AT_KEY)
}

export function hasAuthRecoveryFailure(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.sessionStorage.getItem(AUTH_RECOVERY_FAILED_KEY) === "true"
}

export function shouldSkipRefreshAfterFailure(
  backoffMs = DEFAULT_REFRESH_BACKOFF_MS,
): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const failedAt = Number(window.sessionStorage.getItem(AUTH_REFRESH_FAILED_AT_KEY) || "0")
  if (!failedAt) {
    return false
  }

  if (Date.now() - failedAt < backoffMs) {
    return true
  }

  clearAuthRecoveryFailure()
  return false
}
