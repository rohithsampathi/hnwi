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
      // console.log("Global navigation handler called with path:", path);
      
      // Extract path without leading slashes for consistency
      const normalizedPath = path.replace(/^\/+/, "");
      
      if (path === "back") {
        router.push("/prive-exchange");
      } 
      // Special case for dashboard navigation
      else if (path === "/" || path === "dashboard") {
        // Instead of router.push which is causing issues, use the app's main route with a special flag
        // that skips the splash screen and goes directly to dashboard
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      }
      else {
        // For all other routes, use direct router navigation
        router.push(`/${normalizedPath}`);
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