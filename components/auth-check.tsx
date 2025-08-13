"use client"

import { useEffect, useState } from "react"
import { isAuthenticated } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"

interface AuthCheckProps {
  children: React.ReactNode
  showLoginPrompt?: boolean
}

export function AuthCheck({ children, showLoginPrompt = true }: AuthCheckProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsAuth(authenticated)
      
      if (!authenticated) {
        console.log("🔐 User not authenticated - data won't load until login")
      } else {
        console.log("✅ User authenticated - data should load")
      }
    }
    
    checkAuth()
  }, [])

  const handleLogin = () => {
    setShouldRedirect(true)
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 500)
  }

  if (isAuth === null) {
    return <div className="p-4 text-center">🔍 Checking authentication...</div>
  }

  if (!isAuth && showLoginPrompt) {
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
          className="bg-primary hover:bg-primary/90"
          disabled={shouldRedirect}
        >
          {shouldRedirect ? "Redirecting..." : "Go to Login"}
        </Button>
      </div>
    )
  }

  return <>{children}</>
}