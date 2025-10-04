// app/(authenticated)/dashboard/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { HomeDashboardElite } from "@/components/home-dashboard-elite"
import { MetaTags } from "@/components/meta-tags"
import { getCurrentUser } from "@/lib/auth-manager"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // Load user data from centralized auth and listen for updates
  useEffect(() => {
    const authUser = getCurrentUser()
    if (authUser) {
      setUser(authUser)
    }

    // Listen for auth state changes to update user
    const handleAuthUpdate = (event: any) => {
      const updatedUser = getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    }

    window.addEventListener('auth:login', handleAuthUpdate)

    return () => {
      window.removeEventListener('auth:login', handleAuthUpdate)
    }
  }, [])

  const handleNavigation = (route: string) => {
    // Map internal routes to Next.js routes
    if (route === "strategy-vault") {
      router.push("/prive-exchange")
    } else if (route === "strategy-engine") {
      router.push("/ask-rohith")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else {
      // For other routes, try direct navigation
      router.push(`/${route}`)
    }
  }

  return (
    <>
      <MetaTags
        title="HNWI Chronicles Dashboard - Your Wealth Intelligence Command Center"
        description="Access exclusive market intelligence, investment opportunities, and wealth strategies designed for high-net-worth individuals. Your personalized dashboard for financial success."
        image="https://app.hnwichronicles.com/images/dashboard-og.png"
        url="https://app.hnwichronicles.com/dashboard"
      />
      <HomeDashboardElite user={user} userData={user} onNavigate={handleNavigation} />
    </>
  )
}