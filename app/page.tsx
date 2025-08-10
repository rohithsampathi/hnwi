// app/page.tsx
"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import Image from "next/image"

// Ultra-luxury checklist loading experience for UHNWIs
const LoadingComponent = () => {
  const [theme, setTheme] = React.useState("dark");
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [time, setTime] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);

  // Compact checklist items - 1 second total experience
  const checklistItems = [
    "Secure access",
    "Load intelligence", 
    "Prepare insights",
    "Ready"
  ];

  // Real-time clock
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      setTime(timeStr);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme detection
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

  // Lightning-fast checklist completion - 1 second total, runs only once
  React.useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    checklistItems.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setCompletedSteps(prev => {
          const newSteps = [...prev, index];
          return newSteps;
        });
        
        // Don't mark as complete immediately - let the parent handle timing
      }, (index + 1) * 250); // Each item completes every 0.25 seconds
      
      intervals.push(timeout);
    });

    return () => intervals.forEach(clearTimeout);
  }, []); // Empty dependency array ensures this runs only once
  
  const isDark = theme === "dark";
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDark 
        ? "bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950" 
        : "bg-gradient-to-br from-zinc-50 via-slate-100 to-zinc-50"
    }`}>
      
      {/* Luxury background elements */}
      <div className="absolute inset-0">
        {/* Subtle mesh gradient */}
        <div className={`absolute inset-0 opacity-30 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_1px_1px,_#374151_1px,_transparent_0)] bg-[length:24px_24px]"
            : "bg-[radial-gradient(circle_at_1px_1px,_#d1d5db_1px,_transparent_0)] bg-[length:24px_24px]"
        }`}></div>
        
        {/* Floating geometric elements */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute opacity-20 ${
              isDark ? "bg-gradient-to-br from-slate-400 to-slate-600" : "bg-gradient-to-br from-slate-300 to-slate-500"
            }`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `float ${8 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Top status bar */}
      <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-xs font-mono ${
        isDark ? "text-slate-400 border-slate-800" : "text-slate-600 border-slate-200"
      } border-b backdrop-blur-sm z-20`}>
        <div className="flex items-center space-x-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>SECURE CONNECTION ACTIVE</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{time}</span>
          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
            UHNW MEMBER
          </span>
        </div>
      </div>

      {/* Main content - perfectly centered */}
      <div className="min-h-screen flex flex-col justify-center items-center relative z-10">
        
        {/* Large centered rotating logo */}
        <div className="mb-16 relative">
          {/* Logo container with clockwise rotation */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="HNWI Chronicles" 
              width={160}
              height={160}
              className="relative z-10 animate-spin w-auto h-auto"
              style={{ 
                animation: "spin 8s linear infinite"
              }}
              priority
            />
          </div>
        </div>

        {/* Content below logo */}
        <div className="text-center space-y-10">
          
          {/* Subtitle only */}
          <div>
            <p className={`text-xl font-body ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Brewing Knowledge & Ensuring a Secure Route
            </p>
          </div>
          
          {/* Left-aligned checklist with symmetric positioning */}
          <div className="w-80 mx-auto">
            <div className="ml-16 space-y-4">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {/* Animated checkmark */}
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                    completedSteps.includes(index)
                      ? "bg-emerald-500 border-emerald-500 scale-100"
                      : isDark 
                        ? "border-slate-600 scale-90" 
                        : "border-slate-400 scale-90"
                  }`}>
                    {completedSteps.includes(index) && (
                      <svg 
                        className="w-full h-full text-white p-1"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Left-aligned text with app font */}
                  <span className={`text-lg font-body transition-all duration-150 ${
                    completedSteps.includes(index)
                      ? isDark ? "text-slate-200" : "text-slate-800"
                      : isDark ? "text-slate-500" : "text-slate-500"
                  }`}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom institutional branding */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="text-center">
          <div className={`inline-flex items-center space-x-4 px-6 py-3 rounded-full backdrop-blur-sm border ${
            isDark 
              ? "bg-slate-900/30 border-slate-700/50 text-slate-400" 
              : "bg-white/30 border-slate-300/50 text-slate-600"
          }`}>
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-sm font-light tracking-widest">
              HNWI CHRONICLES
            </span>
            <span className="text-xs opacity-60">•</span>
            <span className="text-xs font-mono opacity-80">
              INSTITUTIONAL INTELLIGENCE PLATFORM
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

// Dynamically load the AppWrapper with client-side rendering only
const AppWrapper = dynamic(() => import("@/components/app-wrapper"), { 
  ssr: false
})

export default function Home() {
  const [targetRoute, setTargetRoute] = useState<string | null>(null)
  const [skipSplash, setSkipSplash] = useState<boolean>(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [showLoading, setShowLoading] = useState<boolean>(true)
  const [fadeOut, setFadeOut] = useState<boolean>(false)
  
  useEffect(() => {
    // Start fade-out after 1.3 seconds, then hide completely after 1.8 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1300);
    
    const hideTimer = setTimeout(() => {
      setShowLoading(false);
    }, 1800);
    
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);
  
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
  
  // Show loading screen first, then smooth transition to app
  if (showLoading) {
    return (
      <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <LoadingComponent />
      </div>
    );
  }
  
  return <AppWrapper initialRoute={targetRoute} skipSplash={skipSplash} />
}