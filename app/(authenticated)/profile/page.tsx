// app/(authenticated)/profile/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ProfilePage } from "@/components/profile-page"
import { CrownLoader } from "@/components/ui/crown-loader"
import { BackButton } from "@/components/ui/back-button"

export default function ProfileRoute() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage or API
    const storedUser = localStorage.getItem("userObject")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        // Handle error silently
      }
    }
    setLoading(false)
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

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser)
    localStorage.setItem("userObject", JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userObject")
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