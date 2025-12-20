// app/(authenticated)/dashboard/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { HomeDashboardElite } from "@/components/home-dashboard-elite"
import { getCurrentUser } from "@/lib/auth-manager"
import { usePageTitle } from "@/hooks/use-page-title"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const [hasAssessment, setHasAssessment] = useState(false)
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false) // Prevent multiple checks

  // Set page title and meta description
  usePageTitle(
    "Home",
    "Real-time wealth intelligence dashboard. Elite pulse insights, AI-scored opportunities, and market intelligence for ultra-high-net-worth individuals."
  )

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

        // SOTA AUTHENTICATION: Backend API calls use httpOnly cookies
        // No need to check auth state - fetch will send cookies automatically
        const response = await fetch(`/api/assessment/history/${userId}`, {
          credentials: 'include' // Ensure cookies are sent
        })

        if (response.ok) {
          const data = await response.json()
          const assessments = data?.assessments || data || []

          if (assessments.length > 0) {
            setHasAssessment(true)
          } else {
            // Show dashboard anyway - the P toggle will prompt them to take assessment
            setHasAssessment(false)
          }
        } else if (response.status === 401 || response.status === 403) {
          // Backend says not authenticated - auth expired during page load
          // Layout will handle redirect on next navigation
          setHasAssessment(false)
        } else {
          // On other API error, allow access (fail open to prevent blocking)
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
      <div className="w-full h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Always render dashboard - P toggle will handle assessment prompting
  return (
    <HomeDashboardElite
      user={user}
      userData={user}
      onNavigate={handleNavigation}
      hasCompletedAssessmentProp={hasAssessment}
    />
  )
}