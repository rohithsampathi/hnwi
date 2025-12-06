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
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [hasAssessment, setHasAssessment] = useState(false)
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false) // Prevent multiple checks

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

  // Check if user has completed assessment - REQUIRED for dashboard access
  useEffect(() => {
    // CRITICAL: Prevent multiple rapid API calls that cause 429 errors
    if (hasCheckedAccess) {
      return // Already checked, skip
    }

    const checkAssessmentStatus = async () => {
      if (!user?.id && !user?.user_id) {
        setIsCheckingAccess(false)
        return
      }

      // Mark as checked IMMEDIATELY to prevent duplicate calls
      setHasCheckedAccess(true)

      try {
        const userId = user.id || user.user_id

        const response = await fetch(`/api/assessment/history/${userId}`)

        if (response.ok) {
          const data = await response.json()
          const assessments = data?.assessments || data || []

          if (assessments.length > 0) {
            setHasAssessment(true)
          } else {
            // Show dashboard anyway - the P toggle will prompt them to take assessment
            setHasAssessment(false)
          }
        } else {
          // On API error, allow access (fail open to prevent blocking legitimate users)
          setHasAssessment(true)
        }
      } catch (error) {
        // On error, allow access (fail open)
        setHasAssessment(true)
      } finally {
        setIsCheckingAccess(false)
      }
    }

    checkAssessmentStatus()
  }, [user, hasCheckedAccess, router])

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

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <>
        <MetaTags
          title="HNWI Chronicles Dashboard - Loading"
          description="Loading your personalized wealth intelligence dashboard."
          image="https://app.hnwichronicles.com/images/dashboard-og.png"
          url="https://app.hnwichronicles.com/dashboard"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </>
    )
  }

  // Always render dashboard - P toggle will handle assessment prompting
  return (
    <>
      <MetaTags
        title="HNWI Chronicles Dashboard - Your Wealth Intelligence Command Center"
        description="Access exclusive market intelligence, investment opportunities, and wealth strategies designed for high-net-worth individuals. Your personalized dashboard for financial success."
        image="https://app.hnwichronicles.com/images/dashboard-og.png"
        url="https://app.hnwichronicles.com/dashboard"
      />
      <HomeDashboardElite
        user={user}
        userData={user}
        onNavigate={handleNavigation}
        hasCompletedAssessmentProp={hasAssessment}
      />
    </>
  )
}