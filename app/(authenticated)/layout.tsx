// app/(authenticated)/layout.tsx

"use client"

import { useState, useEffect, useLayoutEffect, ReactNode, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import { StepUpMfaProvider } from "@/contexts/step-up-mfa-context"
import { AppDataProvider } from "@/contexts/app-data-context"
import { ElitePulseProvider } from "@/contexts/elite-pulse-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { IntelligenceNotificationProvider } from "@/contexts/intelligence-notification-context"
import { PageDataCacheProvider } from "@/contexts/page-data-cache-context"
import { ElitePulseErrorBoundary } from "@/components/ui/intelligence-error-boundary"
import { EliteLoadingState } from "@/components/elite/elite-loading-state"
import { Layout } from "@/components/layout/layout"
import { getCurrentUser, isAuthenticated as checkAuth, refreshUser } from "@/lib/auth-manager"
import TokenRefreshManager from "@/components/token-refresh-manager"
import BackgroundSyncInitializer from "@/components/background-sync-initializer"
import '@/lib/auth/debug-helper' // Load debug helper

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  // CRITICAL: Start with null to match SSR, check localStorage in useEffect
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState("")

  // Dynamic page configuration based on route
  const getPageConfig = (pathname: string) => {
    if (pathname.includes('/dashboard')) return { title: '', currentPage: 'dashboard', showBackButton: false }
    if (pathname.includes('/ask-rohith')) return { title: '', currentPage: 'ask-rohith', showBackButton: true }
    if (pathname.includes('/simulation')) return { title: '', currentPage: 'simulation', showBackButton: true }
    if (pathname.includes('/hnwi-world')) return { title: '', currentPage: 'hnwi-world', showBackButton: true }
    if (pathname.includes('/prive-exchange')) return { title: '', currentPage: 'prive-exchange', showBackButton: true }
    if (pathname.includes('/crown-vault')) return { title: '', currentPage: 'crown-vault', showBackButton: true }
    if (pathname.includes('/social-hub')) return { title: '', currentPage: 'social-hub', showBackButton: true }
    if (pathname.includes('/trusted-network')) return { title: '', currentPage: 'trusted-network', showBackButton: true }
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
    } else if (route === "assessment" || route === "simulation") {
      router.push("/simulation")
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

  // CRITICAL: Synchronous localStorage check BEFORE first paint to prevent loading flash
  // useLayoutEffect runs synchronously after DOM updates but before browser paint
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !pathname) return
    if (isAuthenticated !== null) return // Already checked

    // Quick synchronous check of localStorage
    const cachedUser = getCurrentUser()
    if (cachedUser && (cachedUser.id || cachedUser.user_id)) {
      setUser(cachedUser)
      setIsAuthenticated(true)
      setIsInitialLoad(false)
      setMounted(true)
    }
  }, [pathname, isAuthenticated])

  // SINGLE AUTH CHECK - Prevents race conditions
  useEffect(() => {
    // Wait for component to mount
    if (!mounted || !pathname) return

    // Prevent multiple auth checks
    if (isAuthenticated !== null) return

    const checkAuthStatus = async () => {
      try {
        // Special handling for simulation pages (public access allowed)
        if (pathname.includes('/simulation')) {
          console.log('[Auth Layout] Simulation page - allowing public access')
          const authUser = getCurrentUser()
          setUser(authUser) // Will be null for non-authenticated users
          setIsAuthenticated(true) // Allow access regardless
          setIsInitialLoad(false)
          return
        }

        // CRITICAL: Initialize auth manager and wait for it to load localStorage
        const { authManager } = await import('@/lib/auth-manager')
        await authManager.waitForInitialization()
        console.log('[Auth Layout] Auth manager initialized')

        // Check localStorage FIRST - this is our source of truth
        const cachedUser = getCurrentUser()
        console.log('[Auth Layout] Checked localStorage:', {
          hasUser: !!cachedUser,
          userId: cachedUser?.id || cachedUser?.user_id,
          email: cachedUser?.email
        })

        // TRUST LOCALSTORAGE: If we have valid user data, use it
        // Backend will validate on API calls and handle 401s if invalid
        if (cachedUser && (cachedUser.id || cachedUser.user_id)) {
          console.log('[Auth Layout] ✅ Using cached user from localStorage')
          setUser(cachedUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
          return
        }

        console.log('[Auth Layout] No cached user - checking backend')

        // No localStorage data - check backend as fallback
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('[Auth Layout] Session response:', sessionResponse.status)

        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          console.log('[Auth Layout] Session data:', { hasUser: !!data.user })
          if (data.user) {
            // Backend has user - save to localStorage
            console.log('[Auth Layout] ✅ Backend session valid - saving to localStorage')
            authManager.login(data.user)
            setUser(data.user)
            setIsAuthenticated(true)
            setIsInitialLoad(false)
            return
          }
        }

        console.log('[Auth Layout] Session check failed - trying refresh token')

        // Try refresh token as last resort
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('[Auth Layout] Refresh response:', refreshResponse.status)

        if (refreshResponse.ok) {
          // Refresh succeeded, check session again
          const newSessionResponse = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (newSessionResponse.ok) {
            const data = await newSessionResponse.json()
            if (data.user) {
              console.log('[Auth Layout] ✅ Refresh succeeded - saving to localStorage')
              authManager.login(data.user)
              setUser(data.user)
              setIsAuthenticated(true)
              setIsInitialLoad(false)
              return
            }
          }
        }

        // No auth found anywhere - redirect to login
        console.log('[Auth Layout] ❌ No auth found - redirecting to login')
        setIsAuthenticated(false)
        setIsInitialLoad(false)
        router.push("/")
      } catch (error) {
        console.error('[Auth Layout] Error during auth check:', error)
        // Network error - check localStorage as fallback
        const fallbackUser = getCurrentUser()
        console.log('[Auth Layout] Fallback check:', { hasFallbackUser: !!fallbackUser })
        if (fallbackUser && (fallbackUser.id || fallbackUser.user_id)) {
          // Allow access with cached data during network issues
          console.log('[Auth Layout] ✅ Using fallback user from localStorage')
          setUser(fallbackUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
        } else {
          // No cached data and can't reach backend - redirect to login
          console.log('[Auth Layout] ❌ No fallback user - redirecting to login')
          setIsAuthenticated(false)
          setIsInitialLoad(false)
          router.push("/")
        }
      }
    }

    checkAuthStatus()
  }, [mounted, pathname, router])

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      console.log('[Auth Layout] 🚨 Logout event detected')
      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [router])

  // Listen for auth updates to refresh user data
  useEffect(() => {
    const handleAuthUpdate = () => {
      const updatedUser = getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    }

    window.addEventListener('auth:login', handleAuthUpdate)
    return () => window.removeEventListener('auth:login', handleAuthUpdate)
  }, [])

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
          <StepUpMfaProvider>
            <OnboardingProvider>
              <AppDataProvider>
                <PageDataCacheProvider>
                  <ElitePulseErrorBoundary>
                    <ElitePulseProvider>
                      <NotificationProvider
                        enablePolling={false}
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
                            user={user}
                            isUserAuthenticated={!!user}
                          >
                            <TokenRefreshManager refreshIntervalMinutes={45} />
                            <BackgroundSyncInitializer />
                            {children}
                            <Toaster />
                          </Layout>
                        </IntelligenceNotificationProvider>
                      </NotificationProvider>
                    </ElitePulseProvider>
                  </ElitePulseErrorBoundary>
                </PageDataCacheProvider>
              </AppDataProvider>
            </OnboardingProvider>
          </StepUpMfaProvider>
        </AuthPopupProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}
