// components/app-shell.tsx - World-Class App Shell with Instant Navigation

"use client"

import { useEffect, useMemo } from "react"
import { useNavigation, useAuth, useAppInitialization } from "@/contexts/app-state-context"
import { Toaster } from "@/components/ui/toaster"

// Pages
import { SplashScreen } from "./splash-screen"
import { OnboardingPage } from "./onboarding-page"
import { ProfilePage } from "./profile-page"
// import { HomeDashboard } from "./unused/home-dashboard"
import { ElitePulseDashboardNew } from "./elite-pulse-dashboard-new"
import { Layout } from "./layout/layout"
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

// Auth & Handlers
import { handleOnboardingComplete, handleUpdateUser, handleLogout } from "@/lib/auth-actions"
import { useToast } from "@/components/ui/use-toast"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useTheme } from "@/contexts/theme-context"
import { UserCircle2 } from "lucide-react"
import { Heading2 } from "@/components/ui/typography"

interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
  user_id?: string
  _id?: string
  profile?: any
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

export function AppShell() {
  const { currentPage, params, navigate, isTransitioning, preloadPage } = useNavigation()
  const { user, isAuthenticated, setUser } = useAuth()
  const { isInitialized, showLoading } = useAppInitialization()
  const { toast } = useToast()
  const { theme } = useTheme()
  const { isFromSignupFlow, resetOnboarding } = useOnboarding()

  // Preload likely next pages based on current page
  useEffect(() => {
    const preloadMap: Record<string, string[]> = {
      'splash': ['dashboard', 'onboarding'],
      'dashboard': ['invest-scan', 'prive-exchange', 'profile'],
      'invest-scan': ['opportunity', 'dashboard'],
      'prive-exchange': ['opportunity', 'dashboard'],
      'opportunity': ['invest-scan', 'prive-exchange'],
      'profile': ['dashboard']
    }

    const toPreload = preloadMap[currentPage] || []
    toPreload.forEach(page => {
      setTimeout(() => preloadPage(page), 500) // Preload after 500ms
    })
  }, [currentPage, preloadPage])

  // Auth handlers
  const handleLoginSuccess = (userData: any) => {
    try {
      const profile = userData.profile || {}
      
      // Extract user ID
      let userId = null
      if (userData.token) {
        try {
          const tokenParts = userData.token.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            userId = payload.user_id || payload.userId || payload.id
          }
        } catch (e) {
          // JWT parsing failed
        }
      }
      
      if (!userId) {
        userId = userData.userId || userData.user_id || userData.id || 
                profile.user_id || profile.userId || profile.id ||
                userData._id || profile._id
      }
                    
      if (!userId) {
        throw new Error("No valid user ID received from server")
      }
      
      const nameParts = profile.name?.split(" ") || ["User", ""]
      const firstName = userData.firstName || userData.first_name || nameParts[0] || "User"
      const lastName = userData.lastName || userData.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "")
      
      const userObject: User = {
        id: userId,
        user_id: userId,
        email: userData.email || profile.email,
        firstName: firstName,
        lastName: lastName,
        role: "user",
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
        profile: profile
      }
      
      // Cookies handle auth - no token storage needed
      
      setUser(userObject)
      resetOnboarding()
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${firstName}!`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Error processing login data. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleOnboardingCompleteClick = async (newUser: User) => {
    try {
      const result = await handleOnboardingComplete(newUser)
      if (result.success && result.user) {
        setUser(result.user)
        if (result.token) {
          // Backend sets cookies
        }
        navigate("dashboard")
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
      const result = await handleUpdateUser(updatedUserData)
      if (result.success && result.user) {
        setUser(result.user)
        if (result.token) {
          // Backend sets cookies
        }
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        return
      }
      
      // Fallback: merge with current user
      const currentUser = { ...user } as User
      const mergedUser: User = {
        ...currentUser,
        ...updatedUserData,
        id: currentUser.id,
        email: currentUser.email!,
        firstName: currentUser.firstName!,
        user_id: currentUser.user_id,
        ...(currentUser.profile ? {
          profile: {
            ...currentUser.profile,
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
      
      setUser(mergedUser)
      
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
      await handleLogout()
      setUser(null)
      resetOnboarding()
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      })
      
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Show loading screen
  if (!isInitialized || showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-900 to-black">
        <div className="text-emerald-400 text-xl animate-pulse">Loading...</div>
      </div>
    )
  }

  // Render current page
  const renderPage = useMemo(() => {
    // Add transition classes for smooth navigation
    const transitionClass = isTransitioning 
      ? "opacity-0 transform scale-95 transition-all duration-200" 
      : "opacity-100 transform scale-100 transition-all duration-200"
    
    switch (currentPage) {
      case "splash":
        return (
          <div className={transitionClass}>
            <SplashScreen onLoginSuccess={handleLoginSuccess} />
          </div>
        )

      case "onboarding":
        return (
          <div className={transitionClass}>
            <OnboardingPage
              onComplete={handleOnboardingCompleteClick}
              onLogin={() => navigate("login")}
              onBack={() => navigate("splash")}
            />
          </div>
        )

      case "login":
        return (
          <div className={transitionClass}>
            <SplashScreen onLogin={() => {}} onLoginSuccess={handleLoginSuccess} showLogin={true} />
          </div>
        )

      case "dashboard":
        if (!isAuthenticated || !user) {
          navigate("splash")
          return null
        }
        
        return (
          <div className={transitionClass}>
            <Layout title="" onNavigate={navigate} showBackButton={false} currentPage={currentPage}>
              <ElitePulseDashboardNew 
                userData={user}
              />
            </Layout>
          </div>
        )

      case "profile":
        if (!user) return null
        
        return (
          <div className={transitionClass}>
            <Layout 
              title={
                <div className="flex items-center space-x-2">
                  <UserCircle2 className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                  <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>Profile</Heading2>
                </div>
              }
              showBackButton 
              onNavigate={navigate}
            >
              <ProfilePage user={user} onUpdateUser={handleUpdateUserClick} onLogout={handleLogoutClick} />
            </Layout>
          </div>
        )

      case "strategy-engine":
        return (
          <div className={transitionClass}>
            <StrategyEnginePage onNavigate={navigate} />
          </div>
        )

      case "strategy-vault":
        return (
          <div className={transitionClass}>
            <StrategyVaultPage 
              onNavigate={navigate}
              selectedIndustry="All"
              timeRange="1w"
              expandedDevelopmentId={params.developmentId}
            />
          </div>
        )

      case "playbook":
        return params.playbookId ? (
          <div className={transitionClass}>
            <PlaybookPage playbookId={params.playbookId} onNavigate={navigate} />
          </div>
        ) : (
          <div>Error: No playbook selected</div>
        )

      case "prive-exchange":
        return (
          <div className={transitionClass}>
            <PriveExchangePage onNavigate={navigate} />
          </div>
        )

      case "calendar-page":
        return (
          <div className={transitionClass}>
            <CalendarPage onNavigate={navigate} />
          </div>
        )

      case "my-playbooks":
        return user ? (
          <div className={transitionClass}>
            <PlayBooksPage onNavigate={navigate} userEmail={user.email} userData={user} showOnlyPurchased={true} />
          </div>
        ) : null

      case "invest-scan":
        return (
          <div className={transitionClass}>
            <InvestScanPage onNavigate={navigate} />
          </div>
        )

      case "opportunity":
        const opportunityId = params.opportunityId || 
          (typeof window !== 'undefined' ? sessionStorage.getItem("currentOpportunityId") : null)
        
        return (
          <div className={transitionClass}>
            <OpportunityPage 
              region=""
              opportunityId={opportunityId || ""}
              onNavigate={navigate}
            />
          </div>
        )

      case "social-hub":
        return (
          <div className={transitionClass}>
            <SocialHubPage onNavigate={navigate} />
          </div>
        )

      case "crown-vault":
        return (
          <div className={transitionClass}>
            <CrownVaultPage onNavigate={navigate} />
          </div>
        )

      default:
        return (
          <div className={transitionClass}>
            <div>Page not found: {currentPage}</div>
          </div>
        )
    }
  }, [currentPage, params, isTransitioning, isAuthenticated, user, navigate, theme, isFromSignupFlow, handleLoginSuccess, handleOnboardingCompleteClick, handleUpdateUserClick, handleLogoutClick])

  return (
    <>
      {renderPage}
      <Toaster />
    </>
  )
}

export default AppShell