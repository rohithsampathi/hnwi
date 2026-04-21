// app/(authenticated)/layout.tsx

"use client"

import "./authenticated-app-globals.css"

import { useState, useEffect, useLayoutEffect, useCallback, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { AuthSyncProvider } from "@/components/auth-sync-provider"
import { LegacyServiceWorkerCleanup } from "@/components/platform/legacy-service-worker-cleanup"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import { StepUpMfaProvider } from "@/contexts/step-up-mfa-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { PageDataCacheProvider } from "@/contexts/page-data-cache-context"
import { CitationPanelProvider } from "@/contexts/elite-citation-panel-context"
import { CrisisIntelligenceProvider } from "@/contexts/crisis-intelligence-context"
import { ElitePulseProvider } from "@/contexts/elite-pulse-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { ElitePulseErrorBoundary } from "@/components/ui/intelligence-error-boundary"
import { EliteLoadingState } from "@/components/elite/elite-loading-state"
import { Layout } from "@/components/layout/layout"
import { getCurrentUser, authManager, updateUser as updateAuthUser } from "@/lib/auth-manager"
import { fetchAuthSession } from "@/lib/client-auth-session"
import { secureApi } from "@/lib/secure-api"
import { isLoginAttemptInProgress } from "@/lib/unified-auth-manager"
import logger from "@/lib/secure-logger"
import TokenRefreshManager from "@/components/token-refresh-manager"
import { PUBLIC_HOME_ROUTE } from "@/lib/auth-navigation"
import { AUTH_LOGIN_TIMESTAMP_KEY, AUTH_SESSION_ACTIVE_KEY, AUTH_USER_ID_KEY } from "@/lib/auth-storage"

// Helper to check if this is a public route
const isPublicRoute = (pathname: string): boolean => {
  return pathname?.includes('/simulation') || pathname?.includes('/decision-memo') || pathname?.includes('/war-room')
}

interface AuthenticatedLayoutProps {
  children: ReactNode
}

const AUTH_REQUEST_TIMEOUT_MS = 5000
const AUTH_JSON_HEADERS = { 'Content-Type': 'application/json' }

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = AUTH_REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  // CRITICAL: Start with null to match SSR, check localStorage in useEffect
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)

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
  const needsCrisisIntelligence = pathname.includes('/dashboard') || pathname.includes('/war-room')
  const needsPageDataCache =
    pathname.includes('/hnwi-world') ||
    pathname.includes('/profile') ||
    pathname.includes('/crown-vault') ||
    pathname.includes('/trusted-network')
  const needsCitationPanel = pathname.includes('/decision-memo')
  

  const handleNavigation = (route: string) => {
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

  const redirectToPublicHome = useCallback(() => {
    router.replace(PUBLIC_HOME_ROUTE)
  }, [router])

  const fetchSessionUser = useCallback(async (force = false) => {
    const data = await fetchAuthSession({
      force,
      timeoutMs: AUTH_REQUEST_TIMEOUT_MS,
    })

    return data?.user ?? null
  }, [])

  const refreshSessionUser = useCallback(async () => {
    const refreshResponse = await fetchWithTimeout('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: AUTH_JSON_HEADERS
    })

    if (!refreshResponse.ok) {
      return null
    }

    return fetchSessionUser(true)
  }, [fetchSessionUser])

  const resolveSessionUser = useCallback(async () => {
    const directUser = await fetchSessionUser()
    if (directUser) {
      return directUser
    }

    return refreshSessionUser()
  }, [fetchSessionUser, refreshSessionUser])

  const applyValidatedUser = useCallback((nextUser: any, markSessionValidated = false) => {
    const currentAuthUser = getCurrentUser()
    const currentUserId = currentAuthUser?.user_id || currentAuthUser?.id
    const nextUserId = nextUser?.user_id || nextUser?.id

    if (currentUserId && nextUserId && currentUserId === nextUserId) {
      updateAuthUser(nextUser)
    } else {
      authManager.login(nextUser)
    }

    setIsAuthenticated(true)

    if (markSessionValidated) {
      setSessionValidated(true)
    }

    const userId = nextUser?.user_id || nextUser?.id
    if (userId && !nextUser?.name) {
      secureApi.get(`/api/users/${userId}`, true)
        .then((fullUser: any) => {
          if (fullUser?.name) {
            const mergedUser = { ...nextUser, ...fullUser }
            updateAuthUser(mergedUser)
            setUser(mergedUser)
          } else {
            setUser(nextUser)
          }
        })
        .catch(() => setUser(nextUser))
      return
    }

    setUser(nextUser)
  }, [])

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return
    }

    void import("@/lib/auth/debug-helper")
  }, [])

  // Keep a single viewport height source of truth for mobile browsers.
  // `100vh` overstates visible height on deployed mobile Safari/Chrome when browser chrome is present.
  useEffect(() => {
    if (typeof window === "undefined") return

    const root = document.documentElement

    const updateViewportHeight = () => {
      const viewportHeight = Math.round(window.visualViewport?.height ?? window.innerHeight)
      root.style.setProperty("--app-viewport-height", `${viewportHeight}px`)
    }

    updateViewportHeight()

    window.addEventListener("resize", updateViewportHeight)
    window.addEventListener("orientationchange", updateViewportHeight)
    window.visualViewport?.addEventListener("resize", updateViewportHeight)
    window.visualViewport?.addEventListener("scroll", updateViewportHeight)

    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
      window.visualViewport?.removeEventListener("resize", updateViewportHeight)
      window.visualViewport?.removeEventListener("scroll", updateViewportHeight)
    }
  }, [])

  // Track if we've validated the session with backend (for PWA)
  const [sessionValidated, setSessionValidated] = useState(false)

  // CRITICAL: Synchronous check BEFORE first paint to prevent loading flash.
  // Only trust the same-tab session marker. Cross-tab/local persistence always revalidates first.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !pathname) return
    if (isAuthenticated !== null) return // Already checked

    // PUBLIC ROUTES: /simulation and /decision-memo - allow access without login
    if (isPublicRoute(pathname)) {
      const authUser = getCurrentUser()
      setUser(authUser) // Will be null for non-authenticated users
      setIsAuthenticated(true) // Allow access regardless
      setMounted(true)
      return
    }

    const hasActiveTabSession = sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === 'true'

    if (hasActiveTabSession) {
      // Same tab, active session — trust it and render immediately
      const cachedUser = getCurrentUser()
      if (cachedUser && (cachedUser.id || cachedUser.user_id)) {
        setUser(cachedUser)
        setIsAuthenticated(true)
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
        const loginTimestamp = localStorage.getItem(AUTH_LOGIN_TIMESTAMP_KEY)
        const isRecentLogin = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 30000 // 30 seconds

        const resolvedUser = await resolveSessionUser()
        if (resolvedUser) {
          applyValidatedUser(resolvedUser, true)
          return
        }

        // Session check returned no user - if this is a recent login,
        // trust localStorage and retry later instead of logging out immediately
        if (isRecentLogin) {
          logger.debug('[Auth] Session check returned no user but login was recent - trusting localStorage')
          setSessionValidated(true)
          return
        }

        // Session invalid - try to refresh token
        // MOBILE FIX: If session + refresh both failed but localStorage has a userId,
        // cookies may not have synced from the mobile OS cookie store yet.
        // Wait and retry once before giving up.
        const hasLocalUser = !!localStorage.getItem(AUTH_USER_ID_KEY)
        if (hasLocalUser && !isRecentLogin) {
          logger.debug('[Auth] Session validation failed but localStorage has userId — retrying after delay')
          await new Promise(resolve => setTimeout(resolve, 500))
          const retryUser = await resolveSessionUser()
          if (retryUser) {
            applyValidatedUser(retryUser, true)
            return
          }
        }

        // Session AND refresh both failed — session is definitively lost.
        // But if a login attempt is currently in progress (auth popup or splash screen),
        // don't interfere — let the login flow handle errors inline.
        if (isLoginAttemptInProgress()) {
          logger.debug('[Auth] Session validation failed but login in progress - deferring')
          setSessionValidated(true)
          return
        }

        // Do NOT trust localStorage here — it's stale. Redirect immediately.
        logger.debug('[Auth] Session validation failed - clearing stale state and redirecting')
        authManager.logout()
        setIsAuthenticated(false)
        setUser(null)

        // Clear loginTimestamp so auth popup can show
        localStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY)

        // Redirect to login
        redirectToPublicHome()
      } catch (error) {
        // Network error - don't logout, let user continue with cached data
        // secure-api will handle 401/403 on actual API calls
        logger.debug('[Auth] Session validation network error - continuing with cached auth')
        setSessionValidated(true)
      }
    }

    // Run validation after a short delay to not block initial render
    // Recent login: 2s delay (cookies still propagating)
    // Minimal user (localStorage only, no sessionStorage): immediate (session data is stale)
    // Normal: 500ms
    const loginTimestamp = localStorage.getItem(AUTH_LOGIN_TIMESTAMP_KEY)
    const isRecentLogin = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 30000
    const hasSameTabSession = sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === 'true'
    const validationDelay = isRecentLogin ? 2000 : (hasSameTabSession ? 500 : 100)
    const validationTimeout = setTimeout(validateSession, validationDelay)
    return () => clearTimeout(validationTimeout)
  }, [applyValidatedUser, isAuthenticated, pathname, redirectToPublicHome, resolveSessionUser, sessionValidated])

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
          return
        }

        // No cached user - check with backend
        const { authManager } = await import('@/lib/auth-manager')
        await authManager.waitForInitialization()

        // First attempt
        let validatedUser = await resolveSessionUser()

        // MOBILE FIX: If first attempt fails but localStorage indicates a prior session,
        // cookies may not have synced from the mobile OS cookie store yet.
        // Retry once after a delay to give cookies time to propagate.
        if (!validatedUser && typeof window !== 'undefined') {
          const hasLocalUser = !!localStorage.getItem(AUTH_USER_ID_KEY)
          if (hasLocalUser) {
            logger.debug('[Auth] Session check failed but localStorage has userId — retrying after delay (mobile cookie sync)')
            await new Promise(resolve => setTimeout(resolve, 500))
            validatedUser = await resolveSessionUser()
          }
        }

        if (validatedUser) {
          applyValidatedUser(validatedUser, true)
          return
        }

        // No valid session - redirect to login (unless login is in progress)
        if (isLoginAttemptInProgress()) {
          return
        }
        setIsAuthenticated(false)
        redirectToPublicHome()
      } catch (error) {
        // Network error — only allow if sessionStorage has full user (active session)
        // Don't trust localStorage alone — it's stale from a previous session
        const hasActiveTabSession = sessionStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === 'true'
        if (hasActiveTabSession) {
          const fallbackUser = getCurrentUser()
          if (fallbackUser && (fallbackUser.id || fallbackUser.user_id)) {
            setUser(fallbackUser)
            setIsAuthenticated(true)
            return
          }
        }
        // No active session — redirect to splash (unless login is in progress)
        if (isLoginAttemptInProgress()) {
          return
        }
        setIsAuthenticated(false)
        redirectToPublicHome()
      }
    }

    checkAuthStatus()
  }, [applyValidatedUser, isAuthenticated, mounted, pathname, redirectToPublicHome, resolveSessionUser])

  // Listen for logout events (but ignore on public routes)
  useEffect(() => {
    const handleLogout = () => {
      // Ignore logout events on public routes
      if (isPublicRoute(pathname || '')) {
        return
      }

      // Don't redirect during an active login attempt — the login form
      // handles errors inline and a redirect would close the auth popup.
      if (isLoginAttemptInProgress()) {
        return
      }

      setUser(null)
      setIsAuthenticated(false)
      redirectToPublicHome()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [pathname, redirectToPublicHome])

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

  const shellContent = (
    <NotificationProvider
      enablePolling={false}
      pollInterval={30000}
      enableSounds={true}
      enableBrowserNotifications={true}
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
    </NotificationProvider>
  )

  const cacheScopedShell = needsPageDataCache ? (
    <PageDataCacheProvider>{shellContent}</PageDataCacheProvider>
  ) : (
    shellContent
  )

  const citationScopedShell = needsCitationPanel ? (
    <CitationPanelProvider>{cacheScopedShell}</CitationPanelProvider>
  ) : (
    cacheScopedShell
  )

  return (
    <ThemeProvider>
      <LegacyServiceWorkerCleanup />
      <OnboardingProvider>
        <AuthProvider>
          <AuthSyncProvider>
            <ElitePulseProvider>
              <BusinessModeProvider>
                <AuthPopupProvider>
                  <StepUpMfaProvider>
                    <ElitePulseErrorBoundary>
                      {needsCrisisIntelligence ? (
                        <CrisisIntelligenceProvider>{citationScopedShell}</CrisisIntelligenceProvider>
                      ) : (
                        citationScopedShell
                      )}
                    </ElitePulseErrorBoundary>
                  </StepUpMfaProvider>
                </AuthPopupProvider>
              </BusinessModeProvider>
            </ElitePulseProvider>
          </AuthSyncProvider>
        </AuthProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}
