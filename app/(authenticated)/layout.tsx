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
    
    const checkAuth = () => {
      // Fast local auth check - no server calls for speed
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")
      const userObject = localStorage.getItem("userObject")

      if (!token || !userId) {
        setIsAuthenticated(false)
        setIsInitialLoad(false)
        router.push("/")
        return
      }

      // Set user from localStorage immediately for speed
      if (userObject) {
        try {
          const parsedUser = JSON.parse(userObject)
          setUser(parsedUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
          
          // Background validation (non-blocking)
          validateTokenInBackground(token)
        } catch (e) {
          setIsAuthenticated(false)
          setIsInitialLoad(false)
          router.push("/")
        }
      } else {
        setIsAuthenticated(true)
        setIsInitialLoad(false)
      }
    }

    // Background token validation (doesn't block UI)
    const validateTokenInBackground = async (token: string) => {
      try {
        const response = await fetch(getApiUrlForEndpoint('/api/auth/session'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          // Token invalid, redirect after delay to avoid disrupting UX
          setTimeout(() => {
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
            localStorage.removeItem("userObject")
            router.push("/")
          }, 1000)
        }
      } catch (error) {
        // Silent fail - don't disrupt user experience
      }
    }

    // Execute auth check with timeout fallback
    const timeoutId = setTimeout(() => {
      setIsAuthenticated(true)
      setIsInitialLoad(false)
    }, 500)

    try {
      checkAuth()
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