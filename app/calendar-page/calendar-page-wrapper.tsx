// app/calendar-page/calendar-page-wrapper.tsx

"use client"

import { CalendarPage } from "@/components/pages/calendar-page"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function CalendarPageWrapper() {
  const router = useRouter()
  const [isGlobalHandlerReady, setIsGlobalHandlerReady] = useState(false)
  
  // Set up a global navigation handler for proper routing from this page
  useEffect(() => {
    // Define a global navigation function for the app
    window.handleGlobalNavigation = (path: string) => {
      // Handle different route types
      if (path === "back") {
        sessionStorage.setItem("skipSplash", "true")
        router.push("/")
      } 
      // Special case for dashboard navigation
      else if (path === "/" || path === "dashboard") {
        sessionStorage.setItem("skipSplash", "true")
        router.push("/")
      }
      // Handle opportunity routes
      else if (path.startsWith("opportunity/")) {
        const opportunityId = path.split("/")[1]
        sessionStorage.setItem("currentOpportunityId", opportunityId)
        router.push(`/opportunity/${opportunityId}`)
      }
      else {
        // For all other routes, use direct router navigation
        try {
          const normalizedPath = path.replace(/^\/+/, "")
          router.push(`/${normalizedPath}`)
        } catch (e) {
          console.error("Navigation failed:", e)
          // Fallback to dashboard on error
          sessionStorage.setItem("skipSplash", "true")
          router.push("/")
        }
      }
    }
    
    setIsGlobalHandlerReady(true)
    
    return () => {
      // Clean up on unmount
      delete window.handleGlobalNavigation
    }
  }, [router])
  
  // Create the navigation handler that uses the global function
  const handleNavigation = (path: string) => {
    if (window.handleGlobalNavigation) {
      window.handleGlobalNavigation(path)
    } else {
      // Fallback to basic navigation if global handler not ready
      if (path === "dashboard") {
        sessionStorage.setItem("skipSplash", "true")
        router.push("/")
      } else {
        router.push("/")
      }
    }
  }

  return <CalendarPage onNavigate={handleNavigation} />
}

// Extend Window interface to add our global handler
declare global {
  interface Window {
    handleGlobalNavigation?: (path: string) => void;
  }
}