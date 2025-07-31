"use client"

import { OpportunityPage } from "@/components/pages/opportunity-page"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClientPage({
  region,
  opportunityId,
}: {
  region: string
  opportunityId: string
}) {
  const router = useRouter()
  const [isGlobalHandlerReady, setIsGlobalHandlerReady] = useState(false)
  
  // Set up a global navigation handler that works with all routes
  useEffect(() => {
    // Define a global navigation function for the app
    window.handleGlobalNavigation = (path: string) => {
      // Parse route and handle query parameters if present
      let baseRoute = path;
      let queryParams = {};
      
      if (path.includes('?')) {
        const [routePath, queryString] = path.split('?');
        baseRoute = routePath;
        
        // Parse query parameters
        const searchParams = new URLSearchParams('?' + queryString);
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });
      }
      
      // Extract path without leading slashes for consistency
      const normalizedPath = baseRoute.replace(/^\/+/, "");
      
      // Handle different route types
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
      // Handle opportunity routes
      else if (normalizedPath.startsWith("opportunity/")) {
        const opportunityId = normalizedPath.split("/")[1];
        router.push(`/opportunity/${opportunityId}`);
      }
      else {
        // For all other routes, use direct router navigation
        router.push(`/${normalizedPath}`);
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
      console.warn("Global navigation handler not ready, using direct navigation");
      if (path === "back") {
        router.push("/prive-exchange");
      } else if (path === "dashboard") {
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      } else {
        const normalizedPath = path.replace(/^\/+/, "");
        router.push(`/${normalizedPath}`);
      }
    }
  }

  // Store the current opportunity ID in sessionStorage for consistent referencing
  useEffect(() => {
    sessionStorage.setItem("currentOpportunityId", opportunityId);
  }, [opportunityId]);

  // Pass proper navigation function to the opportunity page
  return <OpportunityPage region={region} opportunityId={opportunityId} onNavigate={handleNavigation} />
}

// Extend Window interface to add our global handler
declare global {
  interface Window {
    handleGlobalNavigation?: (path: string) => void;
  }
}