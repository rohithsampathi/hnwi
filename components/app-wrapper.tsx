

// components/app-wrapper.tsx
"use client"

import { useState, useEffect } from "react"
import { AppContent } from "./app-content"
import { Toaster } from "@/components/ui/toaster"
import { BusinessModeProvider } from "@/contexts/business-mode-context"

interface AppWrapperProps {
  initialRoute?: string | null;
  skipSplash?: boolean;
}

export default function AppWrapper({ initialRoute, skipSplash = false }: AppWrapperProps) {
  // If skipSplash is true, start on dashboard page, else splash
  const [currentPage, setCurrentPage] = useState<string>(skipSplash ? "dashboard" : "splash")
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [userInteracted, setUserInteracted] = useState<boolean>(false)
  const [forcePage, setForcePage] = useState<string | null>(null)

  // This effect handles initial setup and auto-redirect
  useEffect(() => {
    // Ensures we're mounted and hydrated before showing content
    setIsInitialized(true)
    
    // Make sure isInitialized is set immediately to prevent blank screens
    setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 100)
    
    // Check for token to determine if user is logged in
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    
    // If skipSplash is true, immediately set the page to initialRoute or dashboard
    if (skipSplash) {
      // console.log("Skipping splash screen as requested");
      if (initialRoute) {
        setCurrentPage(initialRoute);
      } else if (token && userId) {
        setCurrentPage("dashboard");
      }
      return; // Don't set up the timer
    }
    
    // Check if user is already logged in
    if (!userInteracted) {
      // Handle initial route if provided
      if (initialRoute && token && userId) {
        // If we have an initial route and user is logged in, navigate to it
        setCurrentPage(initialRoute);
      } else if (token && userId) {
        // If user is logged in but no initial route, go to dashboard
        setCurrentPage("dashboard");
      }
      // IMPORTANT: If no token/userId, remain on splash screen
    }
  }, [initialRoute, userInteracted, forcePage, skipSplash])

  const handleNavigate = (route: string) => {
    // Mark that user has interacted when they navigate
    setUserInteracted(true)
    
    // Explicitly set forcePage to prevent auto-redirects
    setForcePage(route)
    
    // Special case for login - need to handle it specially so it doesn't get overridden
    if (route === 'login') {
      // console.log('Forcing navigation to login page');
      
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
      }
    } else if (route === 'splash' && !isInitialized) {
      // Skip updating page if it's an initial splash navigation
      return;
    }
    
    // Update the current page
    setCurrentPage(route)
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
