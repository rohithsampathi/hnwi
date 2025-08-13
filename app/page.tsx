// app/page.tsx
"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { Shield } from "lucide-react"

// Ultra-luxury checklist loading experience for UHNWIs
const LoadingComponent = () => {
  const { theme } = useTheme();
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [time, setTime] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);
  const [floatingElements, setFloatingElements] = React.useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    rotation: number;
    duration: number;
    delay: number;
  }>>([]);

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

  // Create floating geometric elements on mount
  React.useEffect(() => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
      width: Math.random() * 120 + 40,
      height: Math.random() * 120 + 40,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      rotation: Math.random() * 360,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    }));
    setFloatingElements(elements);
  }, []);

  // Enhanced step completion - 1 second with more precise timing
  React.useEffect(() => {
    // Use timeouts for precise control
    const timeouts: NodeJS.Timeout[] = [];
    
    // Step 0: Immediate
    timeouts.push(setTimeout(() => {
      setCompletedSteps([0]);
    }, 0));
    
    // Step 1: 250ms
    timeouts.push(setTimeout(() => {
      setCompletedSteps([0, 1]);
    }, 250));
    
    // Step 2: 500ms
    timeouts.push(setTimeout(() => {
      setCompletedSteps([0, 1, 2]);
    }, 500));
    
    // Step 3: 750ms
    timeouts.push(setTimeout(() => {
      setCompletedSteps([0, 1, 2, 3]);
      setIsComplete(true);
    }, 750));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []); // Empty dependency array ensures this runs only once
  
  const isDark = theme === "dark";
  
  return (
    <div className={`min-h-screen relative overflow-hidden bg-background`}>
      
      {/* Emerald Shield Badge - Top Right */}
      <div className="absolute top-8 right-8 z-20">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
             style={{
               background: "linear-gradient(135deg, #065f46 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)",
               border: "2px solid #047857",
               boxShadow: "0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
             }}>
          <Shield className="w-5 h-5 text-white" fill="currentColor" />
          <span className="text-sm font-medium text-white">
            HNWI Member Route
          </span>
        </div>
      </div>
      
      {/* Luxury background elements */}
      <div className="absolute inset-0">
        {/* Subtle mesh gradient */}
        <div className={`absolute inset-0 opacity-30 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_1px_1px,_#374151_1px,_transparent_0)] bg-[length:24px_24px]"
            : "bg-[radial-gradient(circle_at_1px_1px,_#d1d5db_1px,_transparent_0)] bg-[length:24px_24px]"
        }`}></div>
        
        {/* Floating geometric elements */}
        {floatingElements.map((element, i) => (
          <div
            key={i}
            className={`absolute opacity-20 animate-float ${
              isDark ? "bg-gradient-to-br from-secondary/40 to-secondary/60" : "bg-gradient-to-br from-secondary/40 to-secondary/60"
            }`}
            style={{
              '--element-width': `${element.width}px`,
              '--element-height': `${element.height}px`,
              '--element-left': `${element.left}%`,
              '--element-top': `${element.top}%`,
              '--element-rotation': `${element.rotation}deg`,
              '--element-duration': `${element.duration}s`,
              '--element-delay': `${element.delay}s`,
              width: 'var(--element-width)',
              height: 'var(--element-height)',
              left: 'var(--element-left)',
              top: 'var(--element-top)',
              transform: 'rotate(var(--element-rotation))',
              animation: `float var(--element-duration) ease-in-out infinite var(--element-delay)`,
              borderRadius: i % 2 === 0 ? '50%' : '4px',
            }}
          />
        ))}
      </div>

      {/* Main content centered */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
        
        {/* Logo */}
        <div className="mb-12">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="HNWI Chronicles Logo" 
              width={180}
              height={180}
              className="w-auto h-auto object-contain filter drop-shadow-2xl"
              style={{ 
                width: '180px',
                height: '180px'
              }}
              priority
            />
          </div>
        </div>

        {/* Content below logo */}
        <div className="text-center space-y-10">
          
          {/* Subtitle only */}
          <div>
            <p className="text-xl font-body text-foreground">
              Brewing Knowledge & Ensuring a Secure Route
            </p>
          </div>
          
          {/* Left-aligned checklist with symmetric positioning */}
          <div className="w-80 mx-auto">
            <div className="ml-16 space-y-4">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {/* Animated checkmark */}
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-150 relative ${
                    completedSteps.includes(index)
                      ? "scale-100"
                      : "border-muted-foreground scale-90"
                  }`}
                  style={{
                    background: completedSteps.includes(index) 
                      ? "linear-gradient(135deg, #065f46 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)"
                      : "transparent",
                    border: completedSteps.includes(index)
                      ? "2px solid #047857"
                      : undefined,
                    boxShadow: completedSteps.includes(index)
                      ? "0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                      : undefined
                  }}>
                    {completedSteps.includes(index) && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center font-bold"
                        style={{ 
                          fontSize: '12px',
                          color: '#ffffff'
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                  
                  {/* Left-aligned text with app font */}
                  <span className={`text-lg font-body transition-all duration-150 ${
                    completedSteps.includes(index)
                      ? "text-foreground"
                      : "text-muted-foreground"
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
              ? "bg-secondary/30 border-secondary/50 text-muted-foreground" 
              : "bg-secondary/30 border-secondary/50 text-muted-foreground"
          }`}>
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-light tracking-widest">
              HNWI CHRONICLES
            </span>
            <span className="text-xs opacity-60">•</span>
            <span className="text-xs font-mono">{time}</span>
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
    import("@/lib/auth-utils").then(({ isAuthenticated }) => {
      // Enhanced session check using utility function
      try {
        const isAuthenticatedResult = isAuthenticated();
        setIsLoggedIn(isAuthenticatedResult);
        
        if (isAuthenticatedResult) {
          // Get user data from localStorage for display
          const userEmail = localStorage.getItem("userEmail");
          if (userEmail) {
            console.log("User authenticated:", userEmail);
          }
        }
      } catch (error) {
        console.warn("Session check failed, falling back to localStorage:", error);
        
        // Fallback to localStorage check for backward compatibility
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const isAuthenticatedFallback = !!(token && userId);
        
        if (isAuthenticatedFallback !== isLoggedIn) {
          setIsLoggedIn(isAuthenticatedFallback);
        }
      }
    });
    
    import("@/lib/auth-utils").then(() => {
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
      
      // Check if we should show splash screen or go directly to a specific route
      const currentPath = window.location.pathname;
      
      // If not on root path, extract route and skip splash
      if (currentPath !== '/') {
        const extractedRoute = getRouteFromPath();
        setTargetRoute(extractedRoute);
        setSkipSplash(true);
      }
      
      // Handle cross-origin navigation from external sites
      const referrer = document.referrer;
      if (referrer && !referrer.includes(window.location.hostname)) {
        // Clear any stale session data when coming from external site
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

    // Show loading for 2 seconds then transition
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShowLoading(false);
      }, 500); // Additional 500ms for fade out
    }, 2000);
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