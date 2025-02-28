// app/opportunity/[id]/page.tsx

"use client"

import { OpportunityPage } from "@/components/pages/opportunity-page"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page({
  params: { id },
}: {
  params: { id: string }
}) {
  const router = useRouter()
  
  // Set up a global navigation handler that works with all routes
  useEffect(() => {
    // Define a global navigation function for the app
    window.handleGlobalNavigation = (path: string) => {
      if (path === "back") {
        router.push("/prive-exchange")
      } else if (path === "/" || path === "dashboard") {
        window.location.href = "/"
      } else {
        localStorage.setItem("redirectTo", path)
        window.location.href = "/"
      }
    }
    
    return () => {
      // Clean up on unmount
      delete window.handleGlobalNavigation
    }
  }, [router])
  
  // Create the navigation handler that uses the global function
  const handleNavigation = (path: string) => {
    if (window.handleGlobalNavigation) {
      window.handleGlobalNavigation(path)
    }
  }

  // Pass a dummy region since we now fetch by ID, but provide proper navigation function
  return <OpportunityPage region="" opportunityId={id} onNavigate={handleNavigation} />
}

// Extend Window interface to add our global handler
declare global {
  interface Window {
    handleGlobalNavigation?: (path: string) => void;
  }
}