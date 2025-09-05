// app/page.tsx - World-Class HNWI Chronicles Entry Point

"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Shield } from "lucide-react"

// Ultra-luxury loading experience for UHNWIs
const LoadingComponent = ({ onComplete }: { onComplete?: () => void }) => {
  const { theme } = useTheme()
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    "🔐 Securing elite connection...",
    "🛡️ Validating HNWI credentials...", 
    "🌐 Connecting to private networks...",
    "💎 Loading exclusive intelligence...",
    "👑 Access granted to HNWI Chronicles"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedSteps(prev => {
        if (prev.length >= steps.length) {
          clearInterval(timer)
          setIsComplete(true)
          setTimeout(() => onComplete?.(), 500)
          return prev
        }
        return [...prev, prev.length]
      })
    }, 400)

    return () => clearInterval(timer)
  }, [onComplete, steps.length])

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      theme === "dark" 
        ? "bg-gradient-to-br from-background via-background to-muted/20" 
        : "bg-gradient-to-br from-background via-muted/10 to-background"
    }`}>
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="text-center z-10 max-w-md mx-auto px-6">
        <div className="mb-8">
          <Shield className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === "dark" 
              ? "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              : "text-foreground"
          }`}>
            HNWI Chronicles
          </h1>
          <p className="text-muted-foreground">Ultra-High Net Worth Intelligence Platform</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                completedSteps.includes(index)
                  ? 'bg-primary/20 text-primary transform scale-105'
                  : 'bg-background/50 text-muted-foreground'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${
                completedSteps.includes(index) ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
              <span className="text-sm font-medium">{step}</span>
              {completedSteps.includes(index) && (
                <div className="ml-auto">
                  <div className="w-4 h-4 text-primary">✓</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="mt-6 animate-fade-in">
            <div className="text-primary font-semibold">🎯 Elite access established</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Secure reconnection loader for returning users
const SecureReconnectionLoader = () => {
  const { theme } = useTheme()
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === "dark" 
        ? "bg-gradient-to-br from-background via-background to-muted/20" 
        : "bg-gradient-to-br from-background via-muted/10 to-background"
    }`}>
      <div className="text-center">
        <Shield className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Reconnecting Secure Line</h2>
        <p className="text-muted-foreground">Restoring your HNWI session...</p>
      </div>
    </div>
  )
}

// Dynamically load the appropriate system based on feature flags
const AppRoot = dynamic(
  () => import('@/components/app-root'),
  { 
    ssr: false,
    loading: () => {
      // Only show fallback if main loading didn't complete properly
      const mainLoadingComplete = typeof window !== 'undefined' && sessionStorage.getItem('mainLoadingComplete')
      if (mainLoadingComplete === 'true') {
        return <div className="min-h-screen bg-background"></div>
      }
      return <SecureReconnectionLoader />
    }
  }
)

// Legacy system import
const AppWrapper = dynamic(
  () => import('@/components/app-wrapper'),
  {
    ssr: false,
    loading: () => <SecureReconnectionLoader />
  }
)

export default function Home() {
  const [showLoading, setShowLoading] = useState(true)
  const [initialPage, setInitialPage] = useState<string>()
  const [useNewSystem, setUseNewSystem] = useState(false)

  useEffect(() => {
    // Import feature flags to determine which system to use
    Promise.all([
      import("@/lib/auth-utils"),
      import("@/lib/feature-flags")
    ]).then(([{ isAuthenticated, getSessionState, SessionState }, { useNewStateManagement }]) => {
      try {
        // Determine which system to use
        const shouldUseNewSystem = useNewStateManagement()
        setUseNewSystem(shouldUseNewSystem)
        
        const authResult = isAuthenticated()
        const sessionState = getSessionState()
        
        // Consider both authenticated and locked sessions as logged in
        const isLoggedIn = authResult || sessionState === SessionState.LOCKED_INACTIVE
        
        // Get target route from URL
        let targetRoute: string | undefined
        const path = window.location.pathname
        
        if (path.includes('/invest-scan')) targetRoute = 'invest-scan'
        else if (path.includes('/prive-exchange')) targetRoute = 'prive-exchange'  
        else if (path.includes('/opportunity')) {
          targetRoute = 'opportunity'
          const opportunityId = path.split('/').pop()
          if (opportunityId) {
            sessionStorage.setItem("currentOpportunityId", opportunityId)
          }
        }
        else if (path.includes('/calendar-page')) targetRoute = 'calendar-page'
        else if (path.includes('/crown-vault')) targetRoute = 'crown-vault'
        else if (path.includes('/profile')) targetRoute = 'profile'
        
        // Set initial page based on auth status and route
        if (targetRoute && isLoggedIn) {
          setInitialPage(targetRoute)
        } else if (isLoggedIn) {
          setInitialPage('dashboard')
        } else {
          setInitialPage('splash')
        }

        // Complete loading after state is determined
        setTimeout(() => {
          setShowLoading(false)
          sessionStorage.setItem('mainLoadingComplete', 'true')
        }, 1500)

      } catch (error) {
        // Fallback to legacy system
        setUseNewSystem(false)
        setInitialPage('splash')
        setTimeout(() => {
          setShowLoading(false)
          sessionStorage.setItem('mainLoadingComplete', 'true')
        }, 1500)
      }
    })
  }, [])

  if (showLoading) {
    return <LoadingComponent onComplete={() => setShowLoading(false)} />
  }

  // Route to appropriate system based on feature flag
  if (useNewSystem) {
    return <AppRoot initialPage={initialPage} />
  } else {
    return <AppWrapper initialRoute={initialPage} />
  }
}

