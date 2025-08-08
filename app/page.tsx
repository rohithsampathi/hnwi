// app/page.tsx
"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import Image from "next/image"

// Add a professional loading component with rotating logo
const LoadingComponent = () => {
  // Use state to help manage theme if needed
  const [theme, setTheme] = React.useState("dark");
  
  // Effect to check system theme preference or use saved theme
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      } else {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(isDarkMode ? "dark" : "light");
      }
    }
  }, []);
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 ${
      theme === "dark" ? "bg-[#121212]" : "bg-[#F5F5F5]"
    }`}>
      {/* Add particles background for consistent look with splash screen */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black/40 z-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-0"></div>
      </div>
      
      <div className="z-10 flex flex-col items-center justify-center">
        {/* Rotating logo */}
        <div className="relative w-32 h-32 mb-6">
          <Image 
            src="/logo.png" 
            alt="HNWI Chronicles Logo" 
            width={128}
            height={128}
            className="w-full h-full object-contain animate-spin-slow"
            style={{ 
              animation: "spin 8s linear infinite" 
            }}
            priority
          />
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Brewing & Updating the Latest Juice
          </h2>
          <p className={`${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            Please wait while we prepare your experience...
          </p>
        </div>
      </div>
    </div>
  );
};

// Dynamically load the AppWrapper with client-side rendering only
const AppWrapper = dynamic(() => import("@/components/app-wrapper"), { 
  ssr: false,
  loading: () => <LoadingComponent />
})

export default function Home() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null)
  const [skipSplash, setSkipSplash] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === 'undefined') return;
    
    // Function to get the current route from the URL
    const getRouteFromPath = () => {
      const path = window.location.pathname;
      // Map URL paths to internal route names
      if (path.includes('/invest-scan')) return "invest-scan";
      if (path.includes('/prive-exchange')) return "prive-exchange";
      if (path.includes('/opportunity')) {
        // Save opportunity ID if present
        const opportunityId = path.split('/').pop();
        if (opportunityId) {
          sessionStorage.setItem("currentOpportunityId", opportunityId);
        }
        return "opportunity";
      }
      if (path.includes('/calendar-page')) return "calendar-page";
      if (path.includes('/profile')) return "profile";
      return "dashboard"; // Default for root path when authenticated
    };
    
    // Check authentication via server-side session with fallback to localStorage
    const checkAuthStatus = async () => {
      try {
        // First check server-side session
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const sessionData = await response.json();
          const isAuthenticated = !!sessionData.user;
          
          if (isAuthenticated !== isLoggedIn) {
            setIsLoggedIn(isAuthenticated);
          }
          
          if (sessionData.user) {
            sessionStorage.setItem("userDisplay", JSON.stringify({
              firstName: sessionData.user.firstName,
              lastName: sessionData.user.lastName,
              email: sessionData.user.email,
              role: sessionData.user.role
            }));
          }
          return isAuthenticated;
        }
      } catch (error) {
        console.warn("Session check failed, falling back to localStorage:", error);
      }
      
      // Fallback to localStorage check for backward compatibility
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const isAuthenticatedFallback = !!(token && userId);
      
      if (isAuthenticatedFallback !== isLoggedIn) {
        setIsLoggedIn(isAuthenticatedFallback);
      }
      
      if (!isAuthenticatedFallback) {
        sessionStorage.removeItem("userDisplay");
      }
      
      return isAuthenticatedFallback;
    };

    // Execute auth check and handle routing
    checkAuthStatus().then(isAuthenticated => {
      // Determine the target route based on auth status
      if (isAuthenticated) {
        // For authenticated users
        
        // Priority 1: Check for explicit redirect request (secure fallback)
        const redirectTo = sessionStorage.getItem("redirectTo");
        if (redirectTo) {
          setTargetRoute(redirectTo);
          sessionStorage.removeItem("redirectTo");
        } 
        // Priority 2: Use persisted page from session storage (for refresh cases)
        else {
          const currentPage = sessionStorage.getItem("currentPage");
          if (currentPage && currentPage !== "splash" && currentPage !== "login") {
            setTargetRoute(currentPage);
          } 
          // Priority 3: Extract route from current URL path
          else {
            const routeFromPath = getRouteFromPath();
            setTargetRoute(routeFromPath);
            // Save this for future refreshes
            sessionStorage.setItem("currentPage", routeFromPath);
          }
        }
        
        // Always skip splash for authenticated users
        setSkipSplash(true);
      } else {
        // For non-authenticated users, always show splash
        setTargetRoute("splash");
        setSkipSplash(false);
        sessionStorage.removeItem("currentPage");
      }
      
      // Special override: forcibly skip splash if requested
      const skipSplashFlag = sessionStorage.getItem("skipSplash");
      if (skipSplashFlag === "true") {
        setTargetRoute("dashboard");
        setSkipSplash(true);
        sessionStorage.removeItem("skipSplash");
      }
    });
  }, [])
  
  return <AppWrapper initialRoute={targetRoute} skipSplash={skipSplash} />
}