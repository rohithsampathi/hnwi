// app/(authenticated)/profile/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ProfilePage } from "@/components/profile-page"
import { CrownLoader } from "@/components/ui/crown-loader"
import { BackButton } from "@/components/ui/back-button"
import { getCurrentUser, updateUser, logoutUser } from "@/lib/auth-manager"

export default function ProfileRoute() {
  const router = useRouter()
  // Use AuthManager to get current user
  const [user, setUser] = useState<any>(() => getCurrentUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no user, try to get from AuthManager
    if (!user) {
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      } else {
        // No user found, redirect to login
        router.push("/")
      }
    }
  }, [])

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

  const handleUpdateUser = (updatedUserData: any) => {
    // Use AuthManager to update user
    const updated = updateUser(updatedUserData)
    if (updated) {
      setUser(updated)
    }
  }

  const handleLogout = () => {
    // Use AuthManager to logout
    logoutUser()
    router.push("/")
  }

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