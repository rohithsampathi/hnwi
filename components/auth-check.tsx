"use client"

import { useEffect, useState } from "react"
import { isAuthenticated, shouldSkip2FA, getDeviceTrustInfo, isAuthenticatedWithDeviceTrust } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { useAuthPopup } from "@/contexts/auth-popup-context"

interface AuthCheckProps {
  children: React.ReactNode
  showLoginPrompt?: boolean
  isInsiderBrief?: boolean
}

export function AuthCheck({ children, showLoginPrompt = true, isInsiderBrief = false }: AuthCheckProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const { showAuthPopup } = useAuthPopup()

  useEffect(() => {
    const checkAuth = () => {
      const authInfo = isAuthenticatedWithDeviceTrust()
      setIsAuth(authInfo.isAuthenticated)
      
      if (!authInfo.isAuthenticated) {
        // Add a small delay to allow for session restoration on page load
        // This prevents showing auth popup immediately on refresh
        const timeoutId = setTimeout(() => {
          // Recheck authentication after delay to handle page refresh case
          const recheckInfo = isAuthenticatedWithDeviceTrust()
          if (!recheckInfo.isAuthenticated) {
            // Check if device is trusted and should skip 2FA popup
            if (authInfo.isDeviceTrusted && shouldSkip2FA()) {
              // Device is trusted, skip auth popup
              setIsAuth(true);
              return;
            }
            
            // Show popup for all cases except insider brief
            if (!isInsiderBrief && showLoginPrompt) {
              const trustInfo = getDeviceTrustInfo();
              const description = trustInfo.isTrusted 
                ? `Your secure session expired. Device trust: ${trustInfo.timeRemaining}. Login to restore access.`
                : "Due to inactivity, your secure line has been logged out. Login again to restore secure access.";
                
              showAuthPopup({
                title: "Sign In Required",
                description,
                onSuccess: () => {
                  // Simply recheck auth state without recursive timeout
                  const authenticated = isAuthenticated();
                  setIsAuth(authenticated);
                }
              });
            }
          } else {
            // Authentication was restored, update state
            setIsAuth(true)
          }
        }, 1000) // 1 second delay to allow session restoration
        
        // Cleanup timeout on unmount
        return () => clearTimeout(timeoutId)
      }
    }
    
    checkAuth()
  }, [isInsiderBrief, showLoginPrompt, showAuthPopup])

  const handleLogin = () => {
    setShouldRedirect(true)
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 500)
  }

  if (isAuth === null) {
    return <div className="p-4 text-center">🔍 Checking authentication...</div>
  }

  // Only show authentication block for insider brief
  if (!isAuth && showLoginPrompt && isInsiderBrief) {
    return (
      <div className="p-6 text-center space-y-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border">
        <div className="text-lg font-semibold">🔐 Authentication Required</div>
        <div className="text-sm text-muted-foreground">
          Please log in to view Elite Pulse, Wealth Radar, and Insider Brief data.
        </div>
        <div className="text-xs text-muted-foreground">
          API Status: ✅ Working | Data Available: ✅ Ready | Login: ❌ Required
        </div>
        <Button 
          onClick={handleLogin}
          className="bg-black hover:bg-black/90 text-white"
          disabled={shouldRedirect}
        >
          {shouldRedirect ? "Redirecting..." : "Go to Login"}
        </Button>
      </div>
    )
  }

  // For non-insider-brief cases, don't render anything when not authenticated (popup handles it)
  if (!isAuth && !isInsiderBrief) {
    return null
  }

  return <>{children}</>
}