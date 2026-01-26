// app/(authenticated)/layout.tsx

"use client"

import { useState, useEffect, useLayoutEffect, ReactNode } from "react"
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
import { CitationPanelProvider } from "@/contexts/elite-citation-panel-context"
import { ElitePulseErrorBoundary } from "@/components/ui/intelligence-error-boundary"
import { EliteLoadingState } from "@/components/elite/elite-loading-state"
import { Layout } from "@/components/layout/layout"
import { getCurrentUser, authManager } from "@/lib/auth-manager"
import TokenRefreshManager from "@/components/token-refresh-manager"
import BackgroundSyncInitializer from "@/components/background-sync-initializer"
import '@/lib/auth/debug-helper' // Load debug helper

// Helper to detect PWA standalone mode
const isPWAStandalone = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
}

// Helper to check if this is a public route
const isPublicRoute = (pathname: string): boolean => {
  return pathname?.includes('/simulation') || pathname?.includes('/decision-memo')
}

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

  // Track if we've validated the session with backend (for PWA)
  const [sessionValidated, setSessionValidated] = useState(false)

  // CRITICAL: Synchronous localStorage check BEFORE first paint to prevent loading flash
  // useLayoutEffect runs synchronously after DOM updates but before browser paint
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !pathname) return
    if (isAuthenticated !== null) return // Already checked

    // PUBLIC ROUTES: /simulation and /decision-memo - allow access without login
    if (isPublicRoute(pathname)) {
      const authUser = getCurrentUser()
      setUser(authUser) // Will be null for non-authenticated users
      setIsAuthenticated(true) // Allow access regardless
      setIsInitialLoad(false)
      setMounted(true)
      return
    }

    // AUTHENTICATED ROUTES: Check localStorage first for quick access
    // secure-api will handle 401/403 on actual API calls
    const cachedUser = getCurrentUser()
    if (cachedUser && (cachedUser.id || cachedUser.user_id)) {
      setUser(cachedUser)
      setIsAuthenticated(true)
      setIsInitialLoad(false)
      setMounted(true)

      // PWA FIX: Schedule background session validation
      // This ensures cookies are still valid without blocking render
      // Critical for PWA where cookies may expire independently of localStorage
    }
  }, [pathname, isAuthenticated])

  // PWA SESSION VALIDATION: Verify cookies are still valid after localStorage-based auth
  // This runs AFTER the page renders to avoid blocking, but catches stale sessions
  useEffect(() => {
    // Skip if not authenticated from localStorage or already validated
    if (!isAuthenticated || sessionValidated) return
    // Skip for public routes
    if (isPublicRoute(pathname)) return

    const validateSession = async () => {
      try {
        // Quick session check - if this fails, cookies are gone
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          if (data.user) {
            // Session is valid - update user data if changed
            setUser(data.user)
            authManager.login(data.user)
            setSessionValidated(true)
            return
          }
        }

        // Session invalid - try to refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (refreshResponse.ok) {
          // Token refreshed - get new session
          const newSessionResponse = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })

          if (newSessionResponse.ok) {
            const data = await newSessionResponse.json()
            if (data.user) {
              setUser(data.user)
              authManager.login(data.user)
              setSessionValidated(true)
              return
            }
          }
        }

        // PWA FIX: Cookies are gone and refresh failed
        // Clear localStorage to stay in sync and redirect to login
        console.log('[Auth] Session validation failed - clearing stale localStorage')
        authManager.logout()
        setIsAuthenticated(false)
        setUser(null)

        // Clear loginTimestamp so auth popup can show
        localStorage.removeItem('loginTimestamp')

        // Redirect to login
        router.push("/")
      } catch (error) {
        // Network error - don't logout, let user continue with cached data
        // secure-api will handle 401/403 on actual API calls
        console.log('[Auth] Session validation network error - continuing with cached auth')
        setSessionValidated(true)
      }
    }

    // Run validation after a short delay to not block initial render
    const validationTimeout = setTimeout(validateSession, 500)
    return () => clearTimeout(validationTimeout)
  }, [isAuthenticated, sessionValidated, pathname, router])

  // SINGLE AUTH CHECK - Only runs if useLayoutEffect didn't find cached user
  useEffect(() => {
    // Wait for component to mount
    if (!mounted || !pathname) return

    // Already authenticated from localStorage check
    if (isAuthenticated !== null) return

    const checkAuthStatus = async () => {
      try {
        // PUBLIC ROUTES: /simulation and /decision-memo - allow access without login
        if (pathname.includes('/simulation') || pathname.includes('/decision-memo')) {
          const authUser = getCurrentUser()
          setUser(authUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
          return
        }

        // No cached user - check with backend
        const { authManager } = await import('@/lib/auth-manager')
        await authManager.waitForInitialization()

        // Try session check
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          if (data.user) {
            authManager.login(data.user)
            setUser(data.user)
            setIsAuthenticated(true)
            setIsInitialLoad(false)
            return
          }
        }

        // Session invalid - try refresh token
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (refreshResponse.ok) {
          const newSessionResponse = await fetch('/api/auth/session', {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })

          if (newSessionResponse.ok) {
            const data = await newSessionResponse.json()
            if (data.user) {
              authManager.login(data.user)
              setUser(data.user)
              setIsAuthenticated(true)
              setIsInitialLoad(false)
              return
            }
          }
        }

        // No valid session - redirect to login
        setIsAuthenticated(false)
        setIsInitialLoad(false)
        router.push("/")
      } catch (error) {
        // Network error - check localStorage as fallback
        const fallbackUser = getCurrentUser()
        if (fallbackUser && (fallbackUser.id || fallbackUser.user_id)) {
          setUser(fallbackUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
        } else {
          setIsAuthenticated(false)
          setIsInitialLoad(false)
          router.push("/")
        }
      }
    }

    checkAuthStatus()
  }, [mounted, pathname, router])

  // Listen for logout events (but ignore on public routes)
  useEffect(() => {
    const handleLogout = () => {
      // Ignore logout events on public routes
      if (pathname?.includes('/simulation') || pathname?.includes('/decision-memo')) {
        return
      }

      setUser(null)
      setIsAuthenticated(false)
      router.push("/")
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [router, pathname])

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

  // PWA FIX: Re-validate session when app comes to foreground
  // Critical for iOS where cookies may be cleared in background
  useEffect(() => {
    // Skip for public routes
    if (isPublicRoute(pathname)) return

    const handleVisibilityChange = async () => {
      // Only check when app becomes visible
      if (document.visibilityState !== 'visible') return
      // Skip if not authenticated
      if (!isAuthenticated) return
      // Only do this in PWA standalone mode
      if (!isPWAStandalone()) return

      console.log('[PWA] App became visible - validating session')

      try {
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          if (data.user) {
            // Session still valid
            return
          }
        }

        // Session invalid - try refresh
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!refreshResponse.ok) {
          // Refresh failed - session is truly lost
          console.log('[PWA] Session lost while in background - clearing state')
          authManager.logout()
          setIsAuthenticated(false)
          setUser(null)
          localStorage.removeItem('loginTimestamp')
          router.push("/")
        }
      } catch (error) {
        // Network error - continue with cached state
        console.log('[PWA] Visibility check network error - continuing')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isAuthenticated, pathname, router])

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
                  <CitationPanelProvider>
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
                  </CitationPanelProvider>
                </PageDataCacheProvider>
              </AppDataProvider>
            </OnboardingProvider>
          </StepUpMfaProvider>
        </AuthPopupProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}
