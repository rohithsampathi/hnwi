// components/app-content.tsx

"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    let isMounted = true

    const checkUserSession = async () => {
      try {
        // First check if we have a user object stored in localStorage from a successful login
        const storedUserObject = localStorage.getItem("userObject");
        if (storedUserObject) {
          try {
            const userObj = JSON.parse(storedUserObject);
            setUser(userObj);
            setHasCheckedSession(true);
            setIsSessionCheckComplete(true);
            setIsLoading(false);
            return; // Skip API call if we have a stored user
          } catch (e) {
            // Continue with API call if parsing fails
          }
        }
        
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
              
              if (data.token) {
                localStorage.setItem("token", data.token);
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
      } catch (error) {
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
  }, [currentPage])

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

      console.log("Direct login attempt for:", loginData.email);

      // Use the NextJS API route which will call the FastAPI backend
      try {
        const response = await fetch(`/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        });
        
        console.log("Login API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.detail || "Invalid credentials");
        }
        
        const data = await response.json();
        
        // Extract profile data from the response
        const profile = data.user.profile || {};
        
        // Split name into parts for first/last name
        const nameParts = profile.name?.split(" ") || ["User", ""];
        const firstName = data.user.firstName || nameParts[0] || "User";
        const lastName = data.user.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
        
        // Create a user object with consistent structure
        const userObject = {
          id: data.user.id || data.user.user_id,
          user_id: data.user.user_id || data.user.id,
          email: data.user.email,
          firstName: firstName,
          lastName: lastName,
          role: "user",
          // Include profile data 
          profile: profile,
          net_worth: profile.net_worth || 0,
          city: profile.city || "",
          country: profile.country || "",
          bio: profile.bio || "",
          industries: profile.industries || [],
          company: profile.company?.name || "",
          phone_number: profile.phone_number || "",
          linkedin: profile.linkedin || "",
          office_address: profile.office_address || "",
          crypto_investor: profile.crypto_investor || false,
          land_investor: profile.land_investor || false,
        };
        
        // Set user in state
        setUser(userObject);
        
        // Store user data in localStorage
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("userEmail", data.email);
        
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        console.log("Login complete - User ID stored:", data.user_id);
        
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
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
      } else {
        throw new Error(result.error || "Update failed")
      }
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
      const firstName = userData.firstName || nameParts[0] || "User";
      const lastName = userData.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      
      // Set user directly with all required profile fields
      const userObject = {
        id: userData.user_id || userData.userId,
        user_id: userData.user_id || userData.userId,
        email: userData.email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
        // Include all profile fields that might be needed by ProfilePage
        net_worth: profile.net_worth || 0,
        city: profile.city || "",
        country: profile.country || "",
        bio: profile.bio || "",
        industries: profile.industries || [],
        company: profile.company?.name || profile.company || "",
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
      
      // Store user info in localStorage if not already stored by LoginPage
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", userData.userId);
      }
      
      if (!localStorage.getItem("userEmail")) {
        localStorage.setItem("userEmail", userData.email);
      }
      
      if (userData.token && !localStorage.getItem("token")) {
        localStorage.setItem("token", userData.token);
      }
      
      // Also store the complete user object for session recovery
      localStorage.setItem("userObject", JSON.stringify(userObject));
      
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
        return (
          user && (
            <Layout title={`Welcome, ${user.firstName}`} onNavigate={handleNavigation}>
              <HomeDashboard user={user} onNavigate={handleNavigation} isFromSignupFlow={isFromSignupFlow} />
            </Layout>
          )
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
        return user && <PlayBooksPage onNavigate={handleNavigation} userEmail={user.email} />

      case "my-playbooks":
        return user && <PlayBooksPage onNavigate={handleNavigation} userEmail={user.email} showOnlyPurchased={true} />

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

      default:
        return <div>Page not found</div>
    }
  }

  return <>{renderPage()}</>
}