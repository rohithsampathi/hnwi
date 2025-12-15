// app/(authenticated)/layout.tsx

"use client"

import { useState, useEffect, ReactNode, useRef } from "react"
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
import { getCurrentUser, getCurrentUserId, isAuthenticated as checkAuth } from "@/lib/auth-manager"
import TokenRefreshManager from "@/components/token-refresh-manager"
import BackgroundSyncInitializer from "@/components/background-sync-initializer"
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  
  // Dynamic page configuration based on route
  const getPageConfig = (pathname: string) => {
    if (pathname.includes('/dashboard')) return { title: '', currentPage: 'dashboard', showBackButton: false }
    if (pathname.includes('/ask-rohith')) return { title: '', currentPage: 'ask-rohith', showBackButton: true }
    if (pathname.includes('/simulation')) return { title: '', currentPage: 'simulation', showBackButton: true }
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

  // Use ref to track current pathname for async operations
  // CRITICAL: Update ref synchronously, not in useEffect, to avoid race conditions
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname // Update synchronously on every render

  // Track if an auth check should be aborted
  const authCheckAbortRef = useRef(false)

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

  useEffect(() => {
    // CRITICAL: Wait for pathname to be available before any auth checks
    // This prevents premature redirects on first page load
    if (!mounted || !pathname) return

    // CRITICAL SAFEGUARD: Check pathname ref as well to catch any timing issues
    const currentPathname = pathnameRef.current || pathname

    // Allow assessment pages for both authenticated and unauthenticated users
    // This check must happen FIRST and ALWAYS run when on assessment pages
    // CRITICAL: This must be checked BEFORE the early return for isAuthenticated !== null
    if (currentPathname.includes('/simulation')) {
      // Abort any ongoing auth checks
      authCheckAbortRef.current = true

      // Check if user is actually authenticated
      const authUserId = getCurrentUserId()
      const authUser = getCurrentUser()
      const isUserAuthenticated = !!(authUserId && authUser)

      // Only update state if needed to prevent infinite loops
      if (isAuthenticated !== true) {
        setIsAuthenticated(true)
        setIsInitialLoad(false)
      }

      // If user is authenticated, keep their user data so they have full menu access
      // If not authenticated, set user to null (public assessment)
      if (isUserAuthenticated && user === null) {
        setUser(authUser) // Keep authenticated user data
      } else if (!isUserAuthenticated && user !== null) {
        setUser(null) // Clear user for public assessment
      }

      return
    }

    // For non-assessment pages, only check auth if not already checked
    // This comes AFTER assessment check to ensure assessment pages always bypass auth
    if (isCheckingAuth || isAuthenticated !== null) return

    const checkAuthStatus = async () => {
      // Store the pathname at the start of this async operation
      const checkStartPathname = pathname
      authCheckAbortRef.current = false // Reset abort flag
      setIsCheckingAuth(true)

      try {
        // ROOT FIX: Never attempt auth refresh for simulation pages (public access allowed)
        if (pathname.includes('/simulation')) {
          console.debug('[Auth] Simulation page - using minimal auth check')

          // Try to get user data from session storage only (no API calls)
          let userId = getCurrentUserId()
          let authUser = getCurrentUser()

          if (userId && authUser) {
            setUser(authUser)
            setIsAuthenticated(true)
          } else {
            // Non-authenticated user on simulation - allow access
            setUser(null)
            setIsAuthenticated(true) // Set to true to prevent redirects
          }
          setIsInitialLoad(false)
          setIsCheckingAuth(false)
          return
        }

        // Check if user just logged in FIRST, before any auth manager calls
        const loginTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem('loginTimestamp') : null
        const hasSessionData = typeof window !== 'undefined' &&
          (sessionStorage.getItem('userEmail') || sessionStorage.getItem('userId') || sessionStorage.getItem('userObject'))

        // If user logged in within last 5 minutes AND has session data, trust it completely
        // No API calls, no refresh attempts - just use the session data
        if (loginTimestamp && hasSessionData && (Date.now() - parseInt(loginTimestamp)) < 300000) { // 5 minutes
          console.debug('[Auth] User logged in recently - using cached session data')

          // Reconstruct user from sessionStorage
          let userId: string | null = null
          let authUser: any = null

          try {
            const userObj = sessionStorage.getItem('userObject')
            const userEmail = sessionStorage.getItem('userEmail')
            const userIdFromStorage = sessionStorage.getItem('userId')

            if (userObj) {
              authUser = JSON.parse(userObj)
              userId = authUser?.id || authUser?.user_id || userIdFromStorage
            } else if (userEmail && userIdFromStorage) {
              // Minimal user object from sessionStorage
              authUser = {
                id: userIdFromStorage,
                user_id: userIdFromStorage,
                email: userEmail
              }
              userId = userIdFromStorage
            }

            // If we have valid session data, use it immediately
            if (userId && authUser) {
              setUser(authUser)
              setIsAuthenticated(true)
              setIsInitialLoad(false)
              setIsCheckingAuth(false)
              return // Done - no further checks needed
            }
          } catch (e) {
            console.debug('[Auth] Failed to parse sessionStorage - will check auth normally')
          }
        }

        // Use centralized auth manager
        let userId = getCurrentUserId()
        let authUser = getCurrentUser()

        // If no user data initially, wait a bit for it to be available
        // This handles the case where we navigate here right after MFA
        if (!userId || !authUser) {
          // Wait for auth data to be available (from MFA completion)
          await new Promise(resolve => setTimeout(resolve, 500))

          // CRITICAL: Check if we navigated away during the delay using ref (not closure)
          if (pathnameRef.current !== checkStartPathname || authCheckAbortRef.current) {
            console.debug('[Auth] Aborting auth check - navigated from', checkStartPathname, 'to', pathnameRef.current, '| aborted:', authCheckAbortRef.current)
            setIsCheckingAuth(false)
            return // Abort this auth check
          }

          // Check again after delay
          userId = getCurrentUserId()
          authUser = getCurrentUser()

          // If still no user, only try refresh if NOT recently logged in
          if (!userId || !authUser) {
            // Double-check login timestamp again
            const recentLogin = loginTimestamp && (Date.now() - parseInt(loginTimestamp)) < 300000

            // Only call refreshUser if we have session data AND didn't recently login
            if (hasSessionData && !recentLogin) {
              const { refreshUser } = await import("@/lib/auth-manager")
              authUser = await refreshUser()
              userId = authUser?.id || authUser?.user_id
            }
          }
        }

        // CRITICAL: Before doing anything with the auth result, verify we're still on the same page using ref
        if (pathnameRef.current !== checkStartPathname || authCheckAbortRef.current) {
          console.debug('[Auth] Aborting auth check - navigated from', checkStartPathname, 'to', pathnameRef.current, '| aborted:', authCheckAbortRef.current)
          setIsCheckingAuth(false)
          return // Abort - user navigated away
        }

        // With cookie-based auth, we check for user data, not tokens
        if (!userId || !authUser) {

          // FINAL CHECK: Only redirect if we're still on the page where the check started
          // AND it's not an assessment page (assessment pages are public)
          // AND the check hasn't been aborted
          if (!userId || !authUser) {
            const currentPath = pathnameRef.current
            const isAborted = authCheckAbortRef.current

            if (isAborted) {
              console.debug('[Auth] Auth check aborted - not redirecting')
              setIsCheckingAuth(false)
              return
            }

            // CRITICAL: Triple-check we're not on assessment page before redirecting
            const finalPathCheck = pathnameRef.current
            if (finalPathCheck.includes('/simulation')) {
              console.debug('[Auth] Final check: on assessment page, aborting redirect')
              setIsCheckingAuth(false)
              return
            }

            if (currentPath === checkStartPathname && !currentPath.includes('/simulation')) {
              console.debug('[Auth] No user found, redirecting from', currentPath, 'to /')
              setIsAuthenticated(false)
              setIsInitialLoad(false)
              router.push("/")
            } else if (currentPath !== checkStartPathname) {
              console.debug('[Auth] Aborting redirect - navigated from', checkStartPathname, 'to', currentPath)
            } else if (currentPath.includes('/simulation')) {
              console.debug('[Auth] Aborting redirect - on assessment page')
            }
            setIsCheckingAuth(false)
            return
          }
        }

        // Set user from auth manager
        if (authUser) {
          setUser(authUser)
          setIsAuthenticated(true)
          setIsInitialLoad(false)
        } else {
          setIsAuthenticated(true)
          setIsInitialLoad(false)
        }
      } catch (error) {
        // Auth check failed
        setIsAuthenticated(false)
        setIsInitialLoad(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    // Execute auth check
    checkAuthStatus()
  }, [mounted, pathname]) // Only re-run when mounted state or pathname changes, NOT when isAuthenticated changes

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
