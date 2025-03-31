

// components/app-wrapper.tsx
"use client"

import { useState, useEffect } from "react"
import { AppContent } from "./app-content"
import { Toaster } from "@/components/ui/toaster"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import MixpanelTracker from "@/lib/mixpanel"

interface AppWrapperProps {
  initialRoute?: string | null;
  skipSplash?: boolean;
}

export default function AppWrapper({ initialRoute, skipSplash = false }: AppWrapperProps) {
  // If skipSplash is true, start on dashboard page, else splash
  const [currentPage, setCurrentPage] = useState<string>("loading") // Start with loading state
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [userInteracted, setUserInteracted] = useState<boolean>(false)
  const [forcePage, setForcePage] = useState<string | null>(null)

  // This effect handles initial setup and auto-redirect
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === 'undefined') return;
    
    // Ensures we're mounted and hydrated before showing content
    setIsInitialized(true)
    
    // Get auth status once on mount
    const getAuthStatus = () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userObject = localStorage.getItem("userObject");
      return {
        token,
        userId,
        userObject,
        isAuthenticated: !!(token && userId)
      };
    };
    
    const { token, userId, userObject, isAuthenticated } = getAuthStatus();
    
    
    // Session recovery - do this only once on mount
    if (!token && userObject) {
      try {
        const parsedUser = JSON.parse(userObject);
        if (parsedUser && parsedUser.id) {
          localStorage.setItem("userId", parsedUser.id);
          localStorage.setItem("token", "recovered-session-token");
          // We won't re-render since this effect only runs once on mount
        }
      } catch (e) {
        // Error parsing userObject
      }
    }
    
    // Page determination logic - only run once on component mount
    const determineInitialPage = () => {
      try {
        // Always use initialRoute if explicitly provided (from parent)
        if (initialRoute) {
          // Store for future refreshes unless it's splash/login
          if (initialRoute !== "splash" && initialRoute !== "login") {
            sessionStorage.setItem("currentPage", initialRoute);
          }
          return initialRoute;
        }
        
        // Check for a previously persisted page (from navigation or refresh)
        const persistedPage = sessionStorage.getItem("currentPage");
        
        // For authenticated users
        if (isAuthenticated) {
          if (persistedPage && persistedPage !== "splash" && persistedPage !== "login") {
            return persistedPage;
          } else {
            // No persisted page, use the URL to determine the page
            const currentPath = window.location.pathname;
            let derivedPage = "dashboard"; // Default for authenticated users
            
            // Map URL paths to corresponding pages
            if (currentPath.includes('/invest-scan')) {
              derivedPage = "invest-scan";
            } else if (currentPath.includes('/prive-exchange')) {
              derivedPage = "prive-exchange";
            } else if (currentPath.includes('/opportunity')) {
              derivedPage = "opportunity";
              // Extract and store opportunity ID if present
              const opportunityId = currentPath.split('/').pop();
              if (opportunityId) {
                sessionStorage.setItem("currentOpportunityId", opportunityId);
              }
            } else if (currentPath.includes('/calendar-page')) {
              derivedPage = "calendar-page";
            } else if (currentPath.includes('/profile')) {
              derivedPage = "profile";
            }
            
            sessionStorage.setItem("currentPage", derivedPage);
            return derivedPage;
          }
        } else {
          // User is not authenticated - show splash
          sessionStorage.removeItem("currentPage");
          return "splash";
        }
      } catch (error) {
        // Fallback to splash screen if there's any error (e.g. localStorage blocked)
        // Error in initialization
        return "splash";
      }
    };
    
    // Set the page once
    const initialPage = determineInitialPage();
    setCurrentPage(initialPage);
    
    // Track initial page view
    MixpanelTracker.pageView(initialPage);
    
    // If user is logged in, identify them in Mixpanel
    if (userId) {
      MixpanelTracker.identify(userId);
      
      if (userObject) {
        try {
          const user = JSON.parse(userObject);
          MixpanelTracker.setProfile({
            $name: user.name || 'Unknown User',
            $email: user.email || '',
            userId: user.id
          });
        } catch (e) {
          // Error parsing user object
        }
      }
    }
    
  // No dependencies - we only want this to run once on mount
  }, [])

  const handleNavigate = (route: string) => {
    // Mark that user has interacted when they navigate
    setUserInteracted(true)
    
    // Store the current page in sessionStorage to persist across refreshes
    sessionStorage.setItem("currentPage", route);
    
    // Explicitly set forcePage to prevent auto-redirects
    setForcePage(route)
    
    // Special case for login - need to handle it specially so it doesn't get overridden
    if (route === 'login') {
      // Force removal of stored auth info to prevent automatic redirection
      const hasToken = localStorage.getItem("token");
      if (hasToken) {
        // Temporarily remove token to allow login page to show
        const tempToken = localStorage.getItem("token");
        const tempUserId = localStorage.getItem("userId");
        
        // Store temporarily
        sessionStorage.setItem("tempToken", tempToken || "");
        sessionStorage.setItem("tempUserId", tempUserId || "");
        
        // Remove from localStorage to prevent auto-redirect
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userObject");
      }
    } else if (route === 'splash' && !isInitialized) {
      // Skip updating page if it's an initial splash navigation
      return;
    }
    
    // Update the current page
    setCurrentPage(route)
    
    // Track page view in Mixpanel
    MixpanelTracker.pageView(route)
  }

  // Always show content, don't return null
  // This prevents blank screens during initialization

  // We've moved the BusinessModeProvider to the ThemeProvider in theme-context.tsx since they're related
  return (
    <>
      <AppContent currentPage={currentPage} onNavigate={handleNavigate} />
      <Toaster />
    </>
  )
}
