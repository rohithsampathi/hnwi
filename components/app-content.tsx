// components/app-content.tsx

// components/app-content.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "@/contexts/theme-context"
import { UserCircle2 } from "lucide-react"
import { Heading2 } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { HomeDashboardElite } from "./home-dashboard-elite"
import { SplashScreen } from "./splash-screen"
import { OnboardingPage } from "./onboarding-page"
import { ProfilePage } from "./profile-page"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Layout } from "./layout/layout"
import { ShieldLoader } from "./ui/shield-loader"
import { StrategyEnginePage } from "./pages/strategy-engine-page"
import { StrategyVaultPage } from "./pages/strategy-vault-page"
import { PlaybookPage } from "./pages/playbook-page"
import { PriveExchangePage } from "./pages/prive-exchange-page"
import { CalendarPage } from "./pages/calendar-page"
import { PlayBooksPage } from "./pages/playbooks-page"
import { InvestScanPage } from "./pages/invest-scan-page"
import { OpportunityPage } from "./pages/opportunity-page"
import { SocialHubPage } from "./pages/social-hub-page"
import CrownVaultPage from "./pages/crown-vault-page"
import { handleOnboardingComplete, handleUpdateUser, handleLogout } from "@/lib/auth-actions"
import { useToast } from "@/components/ui/use-toast"
import { setupLegacyNavigation, useNewNavigation } from "@/lib/unified-navigation"

// LoginPage is now consolidated into SplashScreen

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
  _id?: string
  profile?: any
  // Adding required profile fields to fix profile page errors
  name?: string
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

  // Setup unified navigation system for legacy compatibility
  useEffect(() => {
    setupLegacyNavigation(handleNavigation)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkUserSession = async () => {
      try {
        if (currentPage === "loading") {
          // Skip loading while we're in initial loading state
          return;
        }
        
        // PRIORITY 1: Check localStorage for immediate session restoration (prevents race conditions)
        if (!user) {
          const storedUserId = localStorage.getItem("userId");
          const storedToken = localStorage.getItem("token");
          const storedUserObject = localStorage.getItem("userObject");
          
          if (storedUserId && storedToken && storedUserObject) {
            try {
              const userObj = JSON.parse(storedUserObject);
              // Immediately restore user state to prevent navigation issues
              if (isMounted && userObj.id) {
                setUser(userObj);
                setHasCheckedSession(true);
                setIsSessionCheckComplete(true);
                
                // Continue with background validation but don't block navigation
                setTimeout(() => validateSessionInBackground(userObj), 100);
                return;
              }
            } catch (e) {
              // Invalid stored user object, continue to server validation
              localStorage.removeItem("userObject");
            }
          }
        }
        
        // PRIORITY 2: Server validation only if no valid local session
        if (!hasCheckedSession && !user) {
          setIsLoading(true);
          const response = await fetch("/api/auth/session", {
            credentials: 'include' // Include httpOnly cookies
          });
          const data = await response.json();
  
          if (isMounted) {
            if (data.user) {
              // Create consistent user object
              const userObj: User = {
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

              // Store the token for API calls if provided
              if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", userObj.user_id || userObj.id);
              }
              
              // Store complete user object for immediate restoration
              localStorage.setItem("userObject", JSON.stringify(userObj));
  
              // SECURITY: Store only non-sensitive display data in sessionStorage
              sessionStorage.setItem("userDisplay", JSON.stringify({
                firstName: userObj.firstName,
                lastName: userObj.lastName,
                email: userObj.email,
                role: userObj.role
              }));
            } else {
              setUser(null);
              sessionStorage.removeItem("userDisplay");
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("userObject");
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
    
    // Background session validation (doesn't affect navigation)
    const validateSessionInBackground = async (currentUser: User) => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.user && isMounted) {
          // Session expired, need to logout
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userObject");
          sessionStorage.removeItem("userDisplay");
        }
      } catch (error) {
        // Background validation failed, but don't disrupt current session
        // Only log for debugging
        console.warn("Background session validation failed:", error);
      }
    };

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
  }, [hasCheckedSession]) // Removed currentPage to prevent re-running on navigation

  // Remove immediate redirect from splash screen to allow it to display
  // The redirect will now be handled by app-wrapper.tsx with a 3-second delay

  const handleNavigation = (route: string) => {
    // Parse route and handle query parameters if present
    let baseRoute = route;
    const params: Record<string, string> = {};

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

    // Handle back navigation - always stay within app
    else if (baseRoute === "back") {
      // Use internal navigation history instead of browser back
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      let previousPage = newHistory[newHistory.length - 1];
      
      // If no previous page in history or previous page is splash/login, go to dashboard
      if (!previousPage || previousPage === "splash" || previousPage === "login" || previousPage === "onboarding") {
        previousPage = "dashboard";
      }
      
      setNavigationHistory([...newHistory]);
      onNavigate(previousPage);
    }

    // Handle regular navigation
    else {
      // Store any parameters in sessionStorage for the target page to access
      if (Object.keys(params).length > 0) {
        Object.entries(params).forEach(([key, value]) => {
          sessionStorage.setItem(`nav_param_${key}`, value);
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
        
        // Extract user ID from multiple possible sources
        const userId = userData.user_id || 
                      userData.userId || 
                      userData.id || 
                      profile.user_id || 
                      profile.userId || 
                      profile.id ||
                      userData._id ||
                      profile._id;
        
        if (!userId) {
          throw new Error("No valid user ID received from server. Please try logging in again.");
        }
        
        // Split name into parts for first/last name
        const nameParts = profile.name?.split(" ") || ["User", ""];
        const firstName = userData.firstName || userData.first_name || nameParts[0] || "User";
        const lastName = userData.lastName || userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        
        // Create a user object with consistent structure that works with ProfilePage
        const userObject: User = {
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
        throw error;
      }
    } catch (error) {
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
        const userId = result.user.user_id || (result.user as any)._id || result.user.id;
        localStorage.setItem("userId", userId)
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        handleNavigation("dashboard")
      } else {
        throw new Error(result.error || "Onboarding failed")
      }
    } catch (error) {
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
          const userId = result.user.user_id || (result.user as any)._id || result.user.id;
          localStorage.setItem("userId", userId)
          if (result.token) {
            localStorage.setItem("token", result.token)
          }
          
          // Store the updated user object in localStorage
          localStorage.setItem("userObject", JSON.stringify(result.user));
          
          toast({
            title: "Success",
            description: "Profile updated successfully",
          })
          return // Success, so return early
        }
      } catch (serverUpdateError) {
      }
      
      // If we reach here, the server-side update failed or wasn't successful
      // Just directly update the user in state and localStorage
      // This means we're accepting the profile-page component's direct API update
      
      // Get current user
      const currentUser = { ...user } as User
      
      // Merge updated data
      const mergedUser: User = {
        ...currentUser,
        ...updatedUserData,
        // Ensure critical fields are preserved
        id: currentUser.id,
        email: currentUser.email!,
        firstName: currentUser.firstName!,
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
      
    } catch (error) {
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
      
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Handle successful login from LoginPage
  const handleLoginSuccess = (userData: any) => {
    try {
      // Extract profile from the response
      const profile = userData.profile || {};
      
      // Extract user ID from multiple possible sources
      let userId = null;
      
      // First, try to extract from JWT token if available
      if (userData.token) {
        try {
          const tokenParts = userData.token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            userId = payload.user_id || payload.userId || payload.id;
          }
        } catch (e) {
          // JWT parsing failed, will fall back to direct fields
        }
      }
      
      // Fallback to direct fields if JWT parsing didn't work
      if (!userId) {
        userId = userData.userId || 
                userData.user_id || 
                userData.id || 
                profile.user_id || 
                profile.userId || 
                profile.id ||
                userData._id ||
                profile._id;
      }
                    
      if (!userId) {
        throw new Error("No valid user ID received from server. Please try logging in again.");
      }
      
      // Split name for first/last name if needed
      const nameParts = profile.name?.split(" ") || ["User", ""];
      const firstName = userData.firstName || userData.first_name || nameParts[0] || "User";
      const lastName = userData.lastName || userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      
      // Set user directly with all required profile fields
      const userObject: User = {
        id: userId,
        user_id: userId,
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
      localStorage.setItem("userId", userId);
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
    // Loading state is now handled by app/page.tsx, so we skip to main app content
    
    switch (currentPage) {
      case "splash":
        return <SplashScreen onLoginSuccess={handleLoginSuccess} />

      case "onboarding":
        return (
          <OnboardingPage
            onComplete={handleOnboardingCompleteClick}
            onLogin={handleLoginClick}
            onBack={() => handleNavigation("splash")}
          />
        )

      case "login":
        // Show splash screen with login form enabled
        return <SplashScreen onLogin={() => {}} onLoginSuccess={handleLoginSuccess} showLogin={true} />

      case "dashboard":
        // Enhanced authentication check with localStorage fallback
        const hasValidSession = user || (
          localStorage.getItem("userId") && 
          localStorage.getItem("token") && 
          localStorage.getItem("userObject")
        );
        
        if (!hasValidSession) {
          // Only redirect if we've finished checking the session AND no valid localStorage data
          if (isSessionCheckComplete) {
            // Redirect to splash
            setTimeout(() => handleNavigation("splash"), 0);
            return (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-900 to-black">
                <div className="text-emerald-400 text-xl">Redirecting to login...</div>
              </div>
            );
          } else {
            // Still checking auth, return null to let parent handle loading
            return null;
          }
        }
        
        // User is authenticated, show dashboard without back button
        return (
            <HomeDashboardElite 
              user={user} 
              onNavigate={handleNavigation} 
              isFromSignupFlow={isFromSignupFlow} 
              userData={user}
            />
        )

      case "profile":
        return (
          user && (
            <Layout title="" onNavigate={handleNavigation} currentPage="profile">
              <ProfilePage user={user} onUpdateUser={handleUpdateUserClick} onLogout={handleLogoutClick} />
            </Layout>
          )
        )

      case "strategy-engine":
        return (
          <Layout title="" onNavigate={handleNavigation} currentPage="strategy-engine">
            <StrategyEnginePage onNavigate={handleNavigation} />
          </Layout>
        )

      case "strategy-vault":
        return (
          <Layout title="" onNavigate={handleNavigation} currentPage="strategy-vault">
            <StrategyVaultPage 
              onNavigate={handleNavigation}
              selectedIndustry={selectedIndustry}
              timeRange={timeRange}
              expandedDevelopmentId={expandedDevelopmentId}
            />
          </Layout>
        )


      case "playbook":
        return currentPlaybookId ? (
          <PlaybookPage playbookId={currentPlaybookId} onNavigate={handleNavigation} />
        ) : (
          <div>Error: No playbook selected</div>
        )

      case "prive-exchange":
        return (
          <Layout title="" onNavigate={handleNavigation} currentPage="prive-exchange">
            <PriveExchangePage onNavigate={handleNavigation} />
          </Layout>
        )

      case "calendar-page":
        return <CalendarPage onNavigate={handleNavigation} />

      // War Room - Hidden for now
      // case "war-room":
      //   return user && <PlayBooksPage onNavigate={handleNavigation} userEmail={user.email} userData={user} />

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
        return (
          <Layout title="" onNavigate={handleNavigation} currentPage="social-hub">
            <SocialHubPage onNavigate={handleNavigation} />
          </Layout>
        )

      case "crown-vault":
        return (
          <Layout title="" onNavigate={handleNavigation} currentPage="crown-vault">
            <CrownVaultPage onNavigate={handleNavigation} />
          </Layout>
        )

      default:
        return <div>Page not found</div>
    }
  }

  return <>{renderPage()}</>
}