// app/(authenticated)/dashboard/page.tsx

"use client"

import { useEffect, useState } from "react"
import { WeeklySurvivalDashboard } from "@/components/katya/weekly-survival-dashboard"
import { getCurrentUser } from "@/lib/auth-manager"
import { usePageTitle } from "@/hooks/use-page-title"

export default function DashboardPage() {
  const [, setUser] = useState<any>(null)

  usePageTitle(
    "Home",
    "Weekly survival proof for Katya. Money movement, room quality, funnel leaks, and next operating moves."
  )

  useEffect(() => {
    const authUser = getCurrentUser()
    if (authUser) {
      setUser(authUser)
    }

    // Listen for auth state changes to update user
    // CRITICAL: Listen for BOTH auth:login AND auth:userUpdated
    // auth:login = session validated (basic data), auth:userUpdated = name/profile hydrated
    const handleAuthUpdate = () => {
      const updatedUser = getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    }

    window.addEventListener('auth:login', handleAuthUpdate)
    window.addEventListener('auth:userUpdated', handleAuthUpdate)

    return () => {
      window.removeEventListener('auth:login', handleAuthUpdate)
      window.removeEventListener('auth:userUpdated', handleAuthUpdate)
    }
  }, [])

  return <WeeklySurvivalDashboard />
}
