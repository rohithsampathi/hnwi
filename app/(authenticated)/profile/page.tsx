// app/(authenticated)/profile/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { ProfilePage } from "@/components/profile-page"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getCurrentUser, updateUser } from "@/lib/auth-manager"
import { usePageTitle } from "@/hooks/use-page-title"
import { PUBLIC_HOME_ROUTE } from "@/lib/auth-navigation"

export default function ProfileRoute() {
  const router = useRouter()
  // Use AuthManager to get current user
  const [user, setUser] = useState<any>(() => getCurrentUser())
  const [loading, setLoading] = useState(false)

  // Set page title and meta description
  usePageTitle(
    "Profile",
    "Manage your HNWI Chronicles member profile, preferences, and account settings for personalized wealth intelligence."
  )

  useEffect(() => {
    // If no user, try to get from AuthManager
    if (!user) {
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.replace(PUBLIC_HOME_ROUTE)
      }
    }
  }, [router, user])

  const handleNavigation = (route: string) => {
    if (route === "back" || route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/prive-exchange")
    } else if (route === "strategy-engine") {
      router.push("/tactics-lab")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else {
      router.push(`/${route}`)
    }
  }

  const handleUpdateUser = useCallback((updatedUserData: any) => {
    // Use AuthManager to update user
    const updated = updateUser(updatedUserData)
    if (updated) {
      setUser(updated)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    setLoading(true)

    try {
      const { unifiedAuthManager } = await import("@/lib/unified-auth-manager")
      await unifiedAuthManager.logout()
    } finally {
      setLoading(false)
      router.replace(PUBLIC_HOME_ROUTE)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader size="lg" text="Loading profile" subtext="Preparing your member dashboard" />
      </div>
    )
  }
  return (
    <div className="bg-background">
      <ProfilePage 
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />
    </div>
  )
}
