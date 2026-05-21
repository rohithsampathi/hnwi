// app/(authenticated)/dashboard/page.tsx

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HomeDashboardElite } from "@/components/home-dashboard-elite"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getCurrentUser } from "@/lib/auth-manager"
import { usePageTitle } from "@/hooks/use-page-title"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  usePageTitle(
    "Home",
    "World HNWI transactional opportunities on your Command Centre."
  )

  const handleNavigate = useCallback((route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
      return
    }

    router.push(route.startsWith("/") ? route : `/${route}`)
  }, [router])

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <CrownLoader
          size="lg"
          text="Loading Command Centre"
          subtext="Preparing your live intelligence map"
        />
      </div>
    )
  }

  return (
    <HomeDashboardElite
      user={user}
      onNavigate={handleNavigate}
      userData={user}
    />
  )
}
