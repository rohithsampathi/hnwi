// app/(authenticated)/layout.tsx

"use client"

import { useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import { ElitePulseProvider } from "@/contexts/elite-pulse-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { IntelligenceNotificationProvider } from "@/contexts/intelligence-notification-context"
import { ElitePulseErrorBoundary } from "@/components/ui/intelligence-error-boundary"
import { getApiUrlForEndpoint } from "@/config/api"
import { EliteLoadingState } from "@/components/elite/elite-loading-state"
import { Layout } from "@/components/layout/layout"
import { getCurrentUser, getCurrentUserId, isAuthenticated as checkAuth } from "@/lib/auth-manager"
import '@/lib/auth/debug-helper' // Load debug helper

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("")
  
  // Dynamic page configuration based on route
  const getPageConfig = (pathname: string) => {
    if (pathname.includes('/dashboard')) return { title: '', currentPage: 'dashboard', showBackButton: false }
    if (pathname.includes('/ask-rohith')) return { title: '', currentPage: 'ask-rohith', showBackButton: true }
    if (pathname.includes('/hnwi-world')) return { title: '', currentPage: 'hnwi-world', showBackButton: true }
    if (pathname.includes('/prive-exchange')) return { title: '', currentPage: 'prive-exchange', showBackButton: true }
    if (pathname.includes('/crown-vault')) return { title: '', currentPage: 'crown-vault', showBackButton: true }
    if (pathname.includes('/social-hub')) return { title: '', currentPage: 'social-hub', showBackButton: true }
    if (pathname.includes('/tactics-lab')) return { title: '', currentPage: 'tactics-lab', showBackButton: true }
    if (pathname.includes('/calendar')) return { title: '', currentPage: 'calendar', showBackButton: true }
    if (pathname.includes('/profile')) return { title: '', currentPage: 'profile', showBackButton: true }
    if (pathname.includes('/playbooks')) return { title: '', currentPage: 'playbooks', showBackButton: true }
    return { title: '', currentPage: 'dashboard', showBackButton: false }
  }
  
  const pageConfig = getPageConfig(pathname)
  const [mounted, setMounted] = useState(false)

  // Update current page based on pathname
  useEffect(() => {
    setCurrentPage(pageConfig.currentPage)
  }, [pathname])
  

  const handleNavigation = (route: string) => {
    setCurrentPage(route)
    // Map internal routes to Next.js routes
    if (route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "ask-rohith") {
      router.push("/ask-rohith")
    } else if (route === "strategy-vault") {
      router.push("/hnwi-world")
    } else if (route === "strategy-engine") {
      router.push("/tactics-lab")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "hnwi-world") {
      router.push("/hnwi-world")
    } else if (route === "invest-scan") {
      router.push("/invest-scan")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1]
      router.push(`/opportunity/${opportunityId}`)
    } else if (route.startsWith("playbook/")) {
      const playbookId = route.split("/")[1]
      router.push(`/playbook/${playbookId}`)
    } else {
      // For other routes, try direct navigation
      router.push(`/${route}`)
    }
  }

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const checkAuthStatus = () => {
      // Use centralized auth manager
      const userId = getCurrentUserId()
      const authUser = getCurrentUser()

      // With cookie-based auth, we check for user data, not tokens
      if (!userId || !authUser) {
        setIsAuthenticated(false)
        setIsInitialLoad(false)
        router.push("/")
        return
      }

      // Set user from auth manager
      if (authUser) {
        setUser(authUser)
        setIsAuthenticated(true)
        setIsInitialLoad(false)
        
        // Skip background validation - it's causing logout issues
        // The token is already validated by the auth manager
      } else {
        setIsAuthenticated(true)
        setIsInitialLoad(false)
      }
    }

    // Background validation removed - was causing immediate logout issues
    // The auth manager already validates tokens properly

    // Execute auth check with timeout fallback
    const timeoutId = setTimeout(() => {
      setIsAuthenticated(true)
      setIsInitialLoad(false)
    }, 500)

    try {
      checkAuthStatus()
      clearTimeout(timeoutId)
    } catch (error) {
      clearTimeout(timeoutId)
      setIsAuthenticated(false)
      setIsInitialLoad(false)
    }

    return () => clearTimeout(timeoutId)
  }, [router, mounted])

  // Only show elite loading for initial page load, not internal navigation
  if (isAuthenticated === null) {
    return <EliteLoadingState message="Reconnecting to secure networks" />
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <ThemeProvider>
      <BusinessModeProvider>
        <AuthPopupProvider>
          <OnboardingProvider>
            <ElitePulseErrorBoundary>
              <ElitePulseProvider>
                <NotificationProvider
                  enablePolling={true}
                  pollInterval={30000}
                  enableSounds={true}
                  enableBrowserNotifications={true}
                >
                  <IntelligenceNotificationProvider 
                    position="top-right"
                    maxNotifications={5}
                    enableAutoNotifications={true}
                  >
                    <Layout
                      title={pageConfig.title}
                      onNavigate={handleNavigation}
                      currentPage={pageConfig.currentPage}
                      showBackButton={pageConfig.showBackButton}
                    >
                      {children}
                      <Toaster />
                    </Layout>
                  </IntelligenceNotificationProvider>
                </NotificationProvider>
              </ElitePulseProvider>
            </ElitePulseErrorBoundary>
          </OnboardingProvider>
        </AuthPopupProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}