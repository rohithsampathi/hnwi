// app/page.tsx - Simple HNWI Chronicles Entry Point

"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { getCurrentUser } from "@/lib/auth-manager"

export default function Home() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Mark as hydrated to prevent SSR/client mismatch
    setIsHydrated(true)

    // Prevent multiple checks and infinite loops
    if (isRedirecting || hasCheckedAuth) return

    const checkAuth = async () => {
      setHasCheckedAuth(true)

      // Check if we're coming from a successful login
      const currentPage = sessionStorage.getItem("currentPage")
      if (currentPage === "dashboard") {
        // User should be on dashboard, redirect there
        setIsRedirecting(true)
        router.push("/dashboard")
        return
      }

      // Quick auth check - if user has valid session, redirect to dashboard
      let user = getCurrentUser()

      // If no user in memory, try to refresh from cookies (hard refresh case)
      // Only attempt refresh if there's some indication of a session
      if (!user) {
        const hasSessionData = typeof window !== 'undefined' &&
          (sessionStorage.getItem('userEmail') || sessionStorage.getItem('userId') || sessionStorage.getItem('userObject'))

        // Only call refreshUser if we have session data to avoid unnecessary 401 errors
        if (hasSessionData) {
          const { refreshUser } = await import("@/lib/auth-manager")
          user = await refreshUser()
        }
      }

      if (user && (user.id || user.user_id)) {
        // User appears to be logged in, redirect to dashboard immediately
        setIsRedirecting(true)
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [isRedirecting, hasCheckedAuth]) // Remove router dependency

  // Show splash screen for unauthenticated users
  const handleLoginSuccess = (userData: any) => {
    setIsRedirecting(true)
    // Use replace instead of push to prevent back navigation issues
    router.replace("/dashboard")
  }

  // Show loading until hydrated to prevent layout shift
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto text-primary mb-4 animate-pulse text-6xl flex items-center justify-center">
              🛡️
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              HNWI Chronicles
            </h1>
            <p className="text-muted-foreground">Reconnecting to secure networks</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/20 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">🔐 Securing encrypted access...</span>
              <div className="ml-auto w-4 h-4 text-primary">✓</div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/20 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">🛡️ Verifying elite credentials...</span>
              <div className="ml-auto w-4 h-4 text-primary">✓</div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-sm font-medium">🔑 Establishing secure channel...</span>
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto text-primary mb-4 animate-pulse text-6xl flex items-center justify-center">
              🛡️
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              HNWI Chronicles
            </h1>
            <p className="text-muted-foreground">Accessing your vault</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/20 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">🔐 Securing encrypted access...</span>
              <div className="ml-auto w-4 h-4 text-primary">✓</div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/20 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">🛡️ Verifying elite credentials...</span>
              <div className="ml-auto w-4 h-4 text-primary">✓</div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/20 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium">🔑 Establishing secure channel...</span>
              <div className="ml-auto w-4 h-4 text-primary">✓</div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="text-sm font-medium">✨ Preparing your private vault...</span>
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SplashScreen 
      onLoginSuccess={handleLoginSuccess}
    />
  )
}

