"use client"

import { useEffect, useState } from "react"
import { isAuthenticated } from "@/lib/auth-utils"
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
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      
      if (!authenticated) {
        
        // Show popup for all cases except insider brief
        if (!isInsiderBrief && showLoginPrompt) {
          showAuthPopup({
            title: "Sign In Required",
            description: "Due to inactivity, your secure line has been logged out. Login again to restore secure access.",
            onSuccess: () => {
              // Recheck authentication after successful login
              setTimeout(() => {
                checkAuth();
              }, 100);
            }
          });
        }
      } else {
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