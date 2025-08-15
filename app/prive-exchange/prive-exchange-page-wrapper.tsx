// app/prive-exchange/prive-exchange-page-wrapper.tsx

"use client"

import { PriveExchangePage } from "@/components/pages/prive-exchange-page"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function PriveExchangePageWrapper() {
  const router = useRouter()
  const [isGlobalHandlerReady, setIsGlobalHandlerReady] = useState(false)
  
  // Set up a global navigation handler for proper routing from this page
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
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      } 
      // Special case for dashboard navigation
      else if (path === "/" || path === "dashboard") {
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      }
      // Handle opportunity routes
      else if (normalizedPath.startsWith("opportunity/")) {
        const opportunityId = normalizedPath.split("/")[1];
        sessionStorage.setItem("currentOpportunityId", opportunityId);
        router.push(`/opportunity/${opportunityId}`);
      }
      else {
        // For routes that exist as app pages, navigate directly
        try {
          router.push(`/${normalizedPath}`);
        } catch (e) {
          // If navigation fails, it likely means the route doesn't exist
          // as a direct page - fall back to main page
          sessionStorage.setItem("skipSplash", "true");
          router.push("/");
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
      // Fallback if global handler isn't ready
      if (path === "dashboard") {
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      } else {
        router.push("/");
      }
    }
  }

  return <PriveExchangePage onNavigate={handleNavigation} />
}

// Ensure Window type is properly extended
declare global {
  interface Window {
    handleGlobalNavigation?: (path: string) => void;
  }
}