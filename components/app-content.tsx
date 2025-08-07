// components/app-content.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { HomeDashboard } from "./home-dashboard"
import { SplashScreen } from "./splash-screen"
import { OnboardingPage } from "./onboarding-page"
import { ProfilePage } from "./profile-page"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Layout } from "./layout/layout"
import { StrategyEnginePage } from "./pages/strategy-engine-page"
import { StrategyVaultPage } from "./pages/strategy-vault-page"
import { PlaybookPage } from "./pages/playbook-page"
import { PriveExchangePage } from "./pages/prive-exchange-page"
import { CalendarPage } from "./pages/calendar-page"
import { PlaybookStorePage } from "./pages/playbook-store-page"
import { PlayBooksPage } from "./pages/playbooks-page"
import { InvestScanPage } from "./pages/invest-scan-page"
import { OpportunityPage } from "./pages/opportunity-page"
import { SocialHubPage } from "./pages/social-hub-page"
import CrownVaultPage from "./pages/crown-vault-page"
import { handleLogin, handleOnboardingComplete, handleUpdateUser, handleLogout } from "@/lib/auth-actions"
import { useToast } from "@/components/ui/use-toast"

// Force direct import with explicit path
import { LoginPage } from "@/components/login-page"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
  // For compatibility with direct API login
  user_id?: string
  profile?: any
  // Adding required profile fields to fix profile page errors
  net_worth?: number
  city?: string
  country?: string
  bio?: string
  industries?: string[]
  company?: string
  phone_number?: string
  linkedin?: string
  office_address?: string
  crypto_investor?: boolean
  land_investor?: boolean
}

interface AppContentProps {
  currentPage: string
  onNavigate: (route: string) => void
}

export function AppContent({ currentPage, onNavigate }: AppContentProps) {
  const [user, setUser] = useState<User | null>(null)
  const [currentPlaybookId, setCurrentPlaybookId] = useState<string | null>(null)
  const { isFromSignupFlow, setIsFromSignupFlow, resetOnboarding } = useOnboarding()
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [timeRange, setTimeRange] = useState("1w")
  const [expandedDevelopmentId, setExpandedDevelopmentId] = useState<string | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>(["splash"])
  const [hasCheckedSession, setHasCheckedSession] = useState(false)
  const [isSessionCheckComplete, setIsSessionCheckComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { theme } = useTheme()

  useEffect(() => {
    let isMounted = true

    const checkUserSession = async () => {
      try {
        if (currentPage === "loading") {
          // Skip loading while we're in initial loading state
          return;
        }
        
        // First check if we have a user object stored in localStorage from a successful login
        const storedUserObject = localStorage.getItem("userObject");
        if (storedUserObject && !user) { // Only set if we don't already have a user
          try {
            const userObj = JSON.parse(storedUserObject);
            setUser(userObj);
            setHasCheckedSession(true);
            setIsSessionCheckComplete(true);
            setIsLoading(false);
            
            // Ensure token and userId are still in localStorage
            if (userObj.id) {
              localStorage.setItem("userId", userObj.id);
              localStorage.setItem("userEmail", userObj.email || "");
              
              // Ensure token exists - very important for session persistence
              if (!localStorage.getItem("token")) {
                localStorage.setItem("token", "recovered-session-token");
              }
            }
            
            return; // Skip API call if we have a stored user
          } catch (e) {
            // Continue with API call if parsing fails
            // Error parsing stored user object
          }
        }
        
        // Only proceed with API session check if we don't already have a user
        if (!user && !hasCheckedSession) {
          setIsLoading(true);
          const response = await fetch("/api/auth/session")
          const data = await response.json()
  
          if (isMounted) {
            if (data.user) {
              // Create consistent user object
              const userObj = {
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName || "",
                role: data.user.role || "user",
                // Fields from API
                user_id: data.user.user_id || data.user.id,
                // Add any profile information
                ...(data.user.profile && { profile: data.user.profile })
              };
              
              setUser(userObj);
  
              // Store the ID from API response (user_id or id if available)
              const userId = data.user.user_id || data.user.id;
              if (userId) {
                localStorage.setItem("userId", userId);
                localStorage.setItem("userEmail", data.user.email);
                
                // Always ensure we have a token for session persistence
                if (data.token) {
                  localStorage.setItem("token", data.token);
                } else {
                  localStorage.setItem("token", "session-token-" + Date.now());
                }
                
                // Store the complete user object for future session recovery
                localStorage.setItem("userObject", JSON.stringify(userObj));
              }
            } else {
              setUser(null);
            }
            
            setHasCheckedSession(true);
            setIsSessionCheckComplete(true);
          }
        }
      } catch (error) {
        // Error checking session
        if (isMounted) {
          setUser(null);
          setHasCheckedSession(true);
          setIsSessionCheckComplete(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkUserSession();

    // Check for special navigation flags in sessionStorage
    if (typeof window !== 'undefined') {
      // Check if we need to show the profile page
      const shouldShowProfile = sessionStorage.getItem('showProfile');
      if (shouldShowProfile === 'true' && currentPage === 'dashboard') {
        // If we're on dashboard and the flag is set, navigate to profile
        handleNavigation('profile');
        // Clear the flag
        sessionStorage.removeItem('showProfile');
      }
    }

    return () => {
      isMounted = false
    }
  }, [currentPage, hasCheckedSession])

  // Remove immediate redirect from splash screen to allow it to display
  // The redirect will now be handled by app-wrapper.tsx with a 3-second delay

  const handleNavigation = (route: string) => {
    // Parse route and handle query parameters if present
    let baseRoute = route;
    let params = {};

    if (route.includes('?')) {
      const [path, queryString] = route.split('?');
      baseRoute = path;
      // Parse query parameters
      const searchParams = new URLSearchParams('?' + queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Special handling for opportunity routes
    if (baseRoute.startsWith("opportunity/")) {
      const opportunityId = baseRoute.split("/")[1];
      setNavigationHistory((prev) => [...prev, "opportunity"]);
      onNavigate("opportunity");
      sessionStorage.setItem("currentOpportunityId", opportunityId);
      return;
    }

    // Handle playbook routes
    if (baseRoute.startsWith("playbook/")) {
      const playbookId = baseRoute.split("/")[1];
      setCurrentPlaybookId(playbookId);
      setNavigationHistory((prev) => [...prev, "playbook"]);
      onNavigate("playbook");
    }

    // Handle back navigation
    else if (baseRoute === "back") {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1] || "splash";
      setNavigationHistory(newHistory);
      onNavigate(previousPage);
    }

    // Handle regular navigation
    else {
      // Store any parameters in sessionStorage for the target page to access
      if (Object.keys(params).length > 0) {
        Object.entries(params).forEach(([key, value]) => {
          sessionStorage.setItem(`nav_param_${key}`, value.toString());
        });
      }

      // For development view with ID parameter
      if (baseRoute.includes('development-view/')) {
        const devId = baseRoute.split('/')[1];
        sessionStorage.setItem('currentDevelopmentId', devId);
        setExpandedDevelopmentId(devId);
        baseRoute = 'strategy-vault';
      }

      setNavigationHistory((prev) => [...prev, baseRoute]);
      onNavigate(baseRoute);
    }
  }

  const handleLoginClick = () => {
    handleNavigation("login");
  }

  const handleSignUpClick = () => {
    handleNavigation("onboarding")
    setIsFromSignupFlow(true)
  }

  // This function is used for the fallback login form
  const handleLoginSuccessClick = async (loginData: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError("");


      // Use the NextJS API route which will call the FastAPI backend
      try {
        const response = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        });
        
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.detail || "Invalid credentials");
        }
        
        const data = await response.json();
        
        // Handle direct API login data format (from the Postman example)
        // Extract user info from the response - could be in data.user or directly in data
        const userData = data.user || data;
        
        // Extract profile data from the response
        const profile = userData.profile || {};
        
        // Get user ID from the most likely location
        const userId = userData.user_id || userData.id || profile.user_id;
        
        // Split name into parts for first/last name
        const nameParts = profile.name?.split(" ") || ["User", ""];
        const firstName = userData.firstName || userData.first_name || nameParts[0] || "User";
        const lastName = userData.lastName || userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        
        // Create a user object with consistent structure that works with ProfilePage
        const userObject = {
          id: userId,
          user_id: userId,
          email: userData.email || profile.email || loginData.email,
          firstName: firstName,
          lastName: lastName,
          role: "user",
          // Include all fields needed directly by ProfilePage
          name: profile.name || `${firstName} ${lastName}`.trim(),
          net_worth: profile.net_worth || 0,
          city: profile.city || "",
          country: profile.country || "",
          bio: profile.bio || "",
          industries: profile.industries || [],
          company: profile.company_info?.name || profile.company || "",
          phone_number: profile.phone_number || "",
          linkedin: profile.linkedin || "",
          office_address: profile.office_address || "",
          crypto_investor: profile.crypto_investor || false,
          land_investor: profile.land_investor || false,
          // Keep the full profile for reference
          profile: profile
        };
        
        
        // Set user in state
        setUser(userObject);
        
        // Store user data in localStorage
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", userObject.email);
        localStorage.setItem("userObject", JSON.stringify(userObject));
        
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        
        // Navigate to dashboard
        handleNavigation("dashboard");
        resetOnboarding();
        
        // Show success toast
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userObject.firstName}!`,
          variant: "default",
        });
      } catch (error) {
        console.error("Direct API login failed:", error);
        throw error;
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error
          ? error.message
          : "Authentication failed. Please verify your email and password.",
        variant: "destructive"
      });
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOnboardingCompleteClick = async (newUser: User) => {
    try {
      const result = await handleOnboardingComplete(newUser)
      if (result.success && result.user) {
        setUser(result.user)
        // Store the ID from API response if available, fall back to id from auth
        const userId = result.user.user_id || result.user._id || result.user.id;
        localStorage.setItem("userId", userId)
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        console.log("Onboarding complete - User ID set:", userId)
        handleNavigation("dashboard")
      } else {
        throw new Error(result.error || "Onboarding failed")
      }
    } catch (error) {
      console.error("Onboarding failed:", error)
      toast({
        title: "Onboarding Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUserClick = async (updatedUserData: Partial<User>) => {
    try {
      // First attempt to use the server-side handler
      try {
        const result = await handleUpdateUser(updatedUserData)
        if (result.success && result.user) {
          setUser(result.user)
          // Store the ID from API response if available, fall back to id from auth
          const userId = result.user.user_id || result.user._id || result.user.id;
          localStorage.setItem("userId", userId)
          if (result.token) {
            localStorage.setItem("token", result.token)
          }
          console.log("User update - User ID set:", userId)
          
          // Store the updated user object in localStorage
          localStorage.setItem("userObject", JSON.stringify(result.user));
          
          toast({
            title: "Success",
            description: "Profile updated successfully",
          })
          return // Success, so return early
        }
      } catch (serverUpdateError) {
        console.log("Server-side update failed, using client-side update:", serverUpdateError)
      }
      
      // If we reach here, the server-side update failed or wasn't successful
      // Just directly update the user in state and localStorage
      // This means we're accepting the profile-page component's direct API update
      
      // Get current user
      const currentUser = { ...user }
      
      // Merge updated data
      const mergedUser = {
        ...currentUser,
        ...updatedUserData,
        // Ensure critical fields are preserved
        id: currentUser.id,
        user_id: currentUser.user_id,
        // Update profile subobject if it exists
        ...(currentUser.profile ? {
          profile: {
            ...currentUser.profile,
            // Map any profile-specific fields
            name: updatedUserData.name || currentUser.profile.name,
            net_worth: updatedUserData.net_worth || currentUser.profile.net_worth,
            city: updatedUserData.city || currentUser.profile.city,
            country: updatedUserData.country || currentUser.profile.country,
            bio: updatedUserData.bio || currentUser.profile.bio,
            industries: updatedUserData.industries || currentUser.profile.industries,
            phone_number: updatedUserData.phone_number || currentUser.profile.phone_number,
            linkedin: updatedUserData.linkedin || currentUser.profile.linkedin,
            office_address: updatedUserData.office_address || currentUser.profile.office_address,
            crypto_investor: updatedUserData.crypto_investor !== undefined ? 
              updatedUserData.crypto_investor : currentUser.profile.crypto_investor,
            land_investor: updatedUserData.land_investor !== undefined ? 
              updatedUserData.land_investor : currentUser.profile.land_investor,
          }
        } : {})
      }
      
      // Update user in state
      setUser(mergedUser)
      
      // Store updated user in localStorage
      localStorage.setItem("userObject", JSON.stringify(mergedUser))
      
      console.log("Client-side user update complete")
    } catch (error) {
      console.error("User update failed:", error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      
      // Clear all auth data
      setUser(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");
      
      // Reset state
      setHasCheckedSession(false);
      setIsSessionCheckComplete(false);
      
      // Navigate to splash page
      handleNavigation("splash");
      resetOnboarding();
      
      // Show success toast
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      
      console.log("Logout - User ID removed from localStorage");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Handle successful login from LoginPage
  const handleLoginSuccess = (userData) => {
    try {
      
      // Extract profile from the response
      const profile = userData.profile || {};
      
      // Split name for first/last name if needed
      const nameParts = profile.name?.split(" ") || ["User", ""];
      const firstName = userData.firstName || userData.first_name || nameParts[0] || "User";
      const lastName = userData.lastName || userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      
      // Set user directly with all required profile fields
      const userObject = {
        id: userData.user_id || userData.userId || profile.user_id,
        user_id: userData.user_id || userData.userId || profile.user_id,
        email: userData.email || profile.email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        // Include all profile fields that might be needed by ProfilePage
        name: profile.name || `${firstName} ${lastName}`.trim(),
        net_worth: profile.net_worth || 0,
        city: profile.city || "",
        country: profile.country || "",
        bio: profile.bio || "",
        industries: profile.industries || [],
        company: profile.company_info?.name || profile.company || "",
        phone_number: profile.phone_number || "",
        linkedin: profile.linkedin || "",
        office_address: profile.office_address || "",
        crypto_investor: profile.crypto_investor || false,
        land_investor: profile.land_investor || false,
        // Keep the full profile for reference
        profile: profile
      };
      
      
      // Set user in state
      setUser(userObject);
      
      // Mark session as checked to bypass the session check
      setHasCheckedSession(true);
      setIsSessionCheckComplete(true);
      
      // Store user info in localStorage
      localStorage.setItem("userId", userObject.user_id);
      localStorage.setItem("userEmail", userObject.email);
      
      // Always ensure a token is stored
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      } else {
        // Create a fallback token to maintain session
        localStorage.setItem("token", "session-token-" + Date.now());
      }
      
      // Also store the complete user object for session recovery
      localStorage.setItem("userObject", JSON.stringify(userObject));
      
      // Store current page for refresh persistence
      sessionStorage.setItem("currentPage", "dashboard");
      
      // Navigate to dashboard
      handleNavigation("dashboard");
      resetOnboarding();
      
      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${firstName}!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error processing login data:", error);
      toast({
        title: "Login Error",
        description: "Error processing login data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Always render content, even if session check hasn't completed
  // This prevents blank screens
  const renderPage = () => {
    // Handle loading state with consistent loading screen
    if (currentPage === "loading") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
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
                className="w-full h-full object-contain"
                style={{ 
                  animation: "spin 8s linear infinite" 
                }}
                priority
              />
            </div>
            
            {/* Loading text */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-foreground">
                Brewing & Updating the Latest Juice
              </h2>
              <p className="text-primary">
                Please wait while we prepare your experience...
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    switch (currentPage) {
      case "splash":
        return <SplashScreen onLogin={handleLoginClick} />

      case "onboarding":
        return (
          <OnboardingPage
            onComplete={handleOnboardingCompleteClick}
            onLogin={handleLoginClick}
            onBack={() => handleNavigation("splash")}
          />
        )

      case "login":
        try {
          // Use the LoginPage with direct API call
          return <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => handleNavigation("splash")}
          />;
        } catch (error) {
          console.error("Error rendering LoginPage:", error);
          // Fallback simple login form if there's an error with the LoginPage component
          return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-900 to-black">
              <div className="w-full max-w-md bg-black/60 backdrop-blur-md p-8 rounded-xl border border-blue-500/30 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">HNWI Chronicles Login</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                  const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                  handleLoginSuccessClick({email, password});
                }} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="w-full p-3 rounded bg-blue-950 text-white border border-blue-500/50 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full p-3 rounded bg-blue-950 text-white border border-blue-500/50 focus:border-blue-400"
                      required
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <button
                    type="submit"
                    className="w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleNavigation("splash")}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          );
        }

      case "dashboard":
        // If not authenticated but trying to view dashboard, redirect to splash
        if (!user) {
          // Only redirect if we've finished checking the session
          if (isSessionCheckComplete) {
            // Redirect to splash
            setTimeout(() => handleNavigation("splash"), 0);
            return (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
                <div className="text-blue-400 text-xl">Redirecting to login...</div>
              </div>
            );
          } else {
            // Still checking auth, show loading
            return (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-black">
                <div className="text-blue-400 text-xl">Loading...</div>
              </div>
            );
          }
        }
        
        // User is authenticated, show dashboard
        return (
          <Layout title={`Welcome, ${user.firstName}`} onNavigate={handleNavigation}>
            <HomeDashboard user={user} onNavigate={handleNavigation} isFromSignupFlow={isFromSignupFlow} userData={user} />
          </Layout>
        )

      case "profile":
        return (
          user && (
            <Layout title="Profile" showBackButton onNavigate={handleNavigation}>
              <ProfilePage user={user} onUpdateUser={handleUpdateUserClick} onLogout={handleLogoutClick} />
            </Layout>
          )
        )

      case "strategy-engine":
        return <StrategyEnginePage onNavigate={handleNavigation} />

      case "strategy-vault":
        return (
          <StrategyVaultPage 
            onNavigate={handleNavigation}
            selectedIndustry={selectedIndustry}
            timeRange={timeRange}
            expandedDevelopmentId={expandedDevelopmentId}
          />
        )

      case "play-books":
        return <PlaybookStorePage onNavigate={handleNavigation} userEmail={user?.email || ""} userData={user} />

      case "playbook":
        return currentPlaybookId ? (
          <PlaybookPage playbookId={currentPlaybookId} onNavigate={handleNavigation} />
        ) : (
          <div>Error: No playbook selected</div>
        )

      case "prive-exchange":
        return <PriveExchangePage onNavigate={handleNavigation} />

      case "calendar-page":
        return <CalendarPage onNavigate={handleNavigation} />

      case "war-room":
        return user && <PlayBooksPage onNavigate={handleNavigation} userEmail={user.email} userData={user} />

      case "my-playbooks":
        return user && <PlayBooksPage onNavigate={handleNavigation} userEmail={user.email} userData={user} showOnlyPurchased={true} />

      case "invest-scan":
        return <InvestScanPage onNavigate={handleNavigation} />

      case "opportunity":
        // Retrieve the opportunityId from sessionStorage if available
        const currentOpportunityId = typeof window !== 'undefined' ? 
          sessionStorage.getItem("currentOpportunityId") : null;
        
        return <OpportunityPage 
          region=""
          opportunityId={currentOpportunityId || ""}
          onNavigate={handleNavigation}
        />

      case "social-hub":
        return <SocialHubPage onNavigate={handleNavigation} />

      case "crown-vault":
        return <CrownVaultPage onNavigate={handleNavigation} />

      default:
        return <div>Page not found</div>
    }
  }

  return <>{renderPage()}</>
}