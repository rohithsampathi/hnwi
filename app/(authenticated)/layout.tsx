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
import { CrisisIntelligenceProvider } from "@/contexts/crisis-intelligence-context"
import { ElitePulseErrorBoundary } from "@/components/ui/intelligence-error-boundary"
import { EliteLoadingState } from "@/components/elite/elite-loading-state"
import { Layout } from "@/components/layout/layout"
import { getCurrentUser, authManager, updateUser as updateAuthUser } from "@/lib/auth-manager"
import { secureApi } from "@/lib/secure-api"
import TokenRefreshManager from "@/components/token-refresh-manager"
import '@/lib/auth/debug-helper' // Load debug helper

// Helper to check if this is a public route
const isPublicRoute = (pathname: string): boolean => {
  return pathname?.includes('/simulation') || pathname?.includes('/decision-memo') || pathname?.includes('/war-room')
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
    if (pathname.includes('/war-room')) return { title: '', currentPage: 'war-room', showBackButton: false }
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

  // CRITICAL: Synchronous check BEFORE first paint to prevent loading flash
  // Only trust sessionStorage (same-tab, active session). localStorage alone = stale.
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

    // AUTHENTICATED ROUTES: Only render immediately if sessionStorage has full user
    // sessionStorage = active session in this tab (dies with tab close)
    // localStorage alone = potentially stale from a previous session — must validate first
    const hasFullSession = !!sessionStorage.getItem('userObject')

    if (hasFullSession) {
      // Same tab, active session — trust it and render immediately
      const cachedUser = getCurrentUser()
      if (cachedUser && (cachedUser.id || cachedUser.user_id)) {
        setUser(cachedUser)
        setIsAuthenticated(true)
        setIsInitialLoad(false)
        setMounted(true)
        return
      }
    }

    // No active session in this tab — DON'T render content yet.
    // Let the useEffect auth check validate with backend first.
    // This prevents showing stale data from a previous session.
    // isAuthenticated stays null → EliteLoadingState shows briefly while backend validates.
    setMounted(true) // Ensure SINGLE AUTH CHECK useEffect can run immediately
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
        // CRITICAL FIX: Check if user JUST logged in (within last 30 seconds)
        // If so, trust localStorage and skip aggressive backend validation
        // This prevents the race condition where cookies haven't fully propagated yet
        const loginTimestamp = localStorage.getItem('loginTimestamp')
        const isRecentLogin = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 30000 // 30 seconds

        // Quick session check - if this fails, cookies are gone
        const sessionResponse = await fetch('/api/auth/session', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })

        if (sessionResponse.ok) {
          const data = await sessionResponse.json()
          if (data.user) {
            // Session is valid - update user data if changed
            authManager.login(data.user)
            setSessionValidated(true)
            // Hydrate full profile if name is missing (JWT only has id/email)
            const userId = data.user.user_id || data.user.id
            if (userId && !data.user.name) {
              secureApi.get(`/api/users/${userId}`, true)
                .then((fullUser: any) => {
                  if (fullUser?.name) {
                    const merged = { ...data.user, ...fullUser }
                    updateAuthUser(merged)
                    setUser(merged)
                  } else {
                    setUser(data.user)
                  }
                })
                .catch(() => setUser(data.user))
            } else {
              setUser(data.user)
            }
            return
          }
        }

        // Session check returned no user - if this is a recent login,
        // trust localStorage and retry later instead of logging out immediately
        if (isRecentLogin) {
          console.log('[Auth] Session check returned no user but login was recent - trusting localStorage')
          setSessionValidated(true)
          return
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

        // Session AND refresh both failed — session is definitively lost.
        // Do NOT trust localStorage here — it's stale. Redirect immediately.
        console.log('[Auth] Session validation failed - clearing stale state and redirecting')
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
    // Recent login: 2s delay (cookies still propagating)
    // Minimal user (localStorage only, no sessionStorage): immediate (session data is stale)
    // Normal: 500ms
    const loginTimestamp = localStorage.getItem('loginTimestamp')
    const isRecentLogin = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 30000
    const hasSessionStorage = !!sessionStorage.getItem('userObject')
    const validationDelay = isRecentLogin ? 2000 : (hasSessionStorage ? 500 : 100)
    const validationTimeout = setTimeout(validateSession, validationDelay)
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
        // PUBLIC ROUTES: /simulation, /decision-memo, /war-room - allow access without login
        if (isPublicRoute(pathname)) {
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
        // Network error — only allow if sessionStorage has full user (active session)
        // Don't trust localStorage alone — it's stale from a previous session
        const hasFullSession = !!sessionStorage.getItem('userObject')
        if (hasFullSession) {
          const fallbackUser = getCurrentUser()
          if (fallbackUser && (fallbackUser.id || fallbackUser.user_id)) {
            setUser(fallbackUser)
            setIsAuthenticated(true)
            setIsInitialLoad(false)
            return
          }
        }
        // No active session — redirect to splash
        setIsAuthenticated(false)
        setIsInitialLoad(false)
        router.push("/")
      }
    }

    checkAuthStatus()
  }, [mounted, pathname, router])

  // Listen for logout events (but ignore on public routes)
  useEffect(() => {
    const handleLogout = () => {
      // Ignore logout events on public routes
      if (isPublicRoute(pathname || '')) {
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
  // CRITICAL: Listen for BOTH auth:login AND auth:userUpdated
  // auth:login fires on session validation (basic user data)
  // auth:userUpdated fires when name/profile is hydrated from /api/users/
  useEffect(() => {
    const handleAuthUpdate = () => {
      const updatedUser = getCurrentUser()
      if (updatedUser) {
        setUser(updatedUser)
      }
    }

    window.addEventListener('auth:login', handleAuthUpdate)
    window.addEventListener('auth:userUpdated', handleAuthUpdate)
    return () => {
      window.removeEventListener('auth:login', handleAuthUpdate)
      window.removeEventListener('auth:userUpdated', handleAuthUpdate)
    }
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
                  <CitationPanelProvider>
                    <ElitePulseErrorBoundary>
                      <CrisisIntelligenceProvider>
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
                            {children}
                            <Toaster />
                          </Layout>
                        </IntelligenceNotificationProvider>
                      </NotificationProvider>
                      </ElitePulseProvider>
                      </CrisisIntelligenceProvider>
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
