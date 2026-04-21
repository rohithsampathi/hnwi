"use client"

import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DASHBOARD_ROUTE, hasRecoverableAuthState, shouldBypassSplash } from "@/lib/auth-navigation"

export function HomeRedirectController() {
  const router = useRouter()
  const hasCheckedAuthRef = useRef(false)

  const redirectToDashboard = useCallback(() => {
    router.replace(DASHBOARD_ROUTE)
  }, [router])

  useEffect(() => {
    if (hasCheckedAuthRef.current || typeof window === "undefined") {
      return
    }

    hasCheckedAuthRef.current = true
    if (shouldBypassSplash() || hasRecoverableAuthState()) {
      redirectToDashboard()
    }
  }, [redirectToDashboard])

  return null
}
