// components/app-content.tsx

"use client"

import { useState, useEffect } from "react"
import { HomeDashboard } from "./home-dashboard"
import { LoginPage } from "./login-page"
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

interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  role?: string
  createdAt?: Date
  updatedAt?: Date
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
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()

        if (isMounted) {
          if (data.user) {
            setUser(data.user)
            // Store the ID exactly as received
            localStorage.setItem("userId", data.user.id)
            localStorage.setItem("token", data.token)
            console.log("Session check - User ID set:", data.user.id)
          }
          setHasCheckedSession(true)
          setIsSessionCheckComplete(true)
        }
      } catch (error) {
        console.error("Session check failed:", error)
        if (isMounted) {
          setHasCheckedSession(true)
          setIsSessionCheckComplete(true)
        }
      }
    }

    checkUserSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isSessionCheckComplete && user && currentPage === "splash") {
      const timer = setTimeout(() => {
        handleNavigation("dashboard")
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isSessionCheckComplete, user, currentPage])

  const handleNavigation = (route: string) => {
    if (route.startsWith("playbook/")) {
      const playbookId = route.split("/")[1]
      setCurrentPlaybookId(playbookId)
      setNavigationHistory((prev) => [...prev, "playbook"])
      onNavigate("playbook")
    } else if (route === "back") {
      const newHistory = [...navigationHistory]
      newHistory.pop()
      const previousPage = newHistory[newHistory.length - 1] || "splash"
      setNavigationHistory(newHistory)
      onNavigate(previousPage)
    } else {
      setNavigationHistory((prev) => [...prev, route])
      onNavigate(route)
    }
  }

  const handleLoginClick = () => {
    handleNavigation("login")
  }

  const handleSignUpClick = () => {
    handleNavigation("onboarding")
    setIsFromSignupFlow(true)
  }

  const handleLoginSuccessClick = async (loginData: { email: string; password: string }) => {
    try {
      console.log("Login attempt for:", loginData.email) // Debug log
      const result = await handleLogin(loginData)
      if (result.success && result.user) {
        console.log("Login successful, user ID:", result.user.id) // Debug log
        setUser(result.user)
        // Store the ID exactly as received from handleLogin
        localStorage.setItem("userId", result.user.id)
        localStorage.setItem("userEmail", result.user.email)
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        console.log("Login complete - User ID stored:", result.user.id) // Debug log
        handleNavigation("dashboard")
        resetOnboarding()
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleOnboardingCompleteClick = async (newUser: User) => {
    try {
      const result = await handleOnboardingComplete(newUser)
      if (result.success && result.user) {
        setUser(result.user)
        // Store IDs and token exactly as received
        localStorage.setItem("userId", result.user.id)
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        console.log("Onboarding complete - User ID set:", result.user.id)
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
        // Store IDs and token exactly as received
        localStorage.setItem("userId", result.user.id)
        if (result.token) {
          localStorage.setItem("token", result.token)
        }
        console.log("User update - User ID set:", result.user.id)
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
      await handleLogout()
      setUser(null)
      localStorage.removeItem("userId")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("token")
      setHasCheckedSession(false)
      setIsSessionCheckComplete(false)
      handleNavigation("splash")
      resetOnboarding()
      console.log("Logout - User ID removed from localStorage")
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (!hasCheckedSession) {
    return null
  }

  const renderPage = () => {
    switch (currentPage) {
      case "splash":
        return <SplashScreen onLogin={handleLoginClick} onSignUp={handleSignUpClick} />
      case "onboarding":
        return (
          <OnboardingPage
            onComplete={handleOnboardingCompleteClick}
            onLogin={handleLoginClick}
            onBack={() => handleNavigation("splash")}
          />
        )
      case "login":
        return <LoginPage onLoginSuccess={handleLoginSuccessClick} onBack={() => handleNavigation("splash")} />
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
        return <PlaybookStorePage onNavigate={handleNavigation} userEmail={user?.email || ""} />
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
        return <OpportunityPage onNavigate={handleNavigation} />
      case "social-hub":
        return <SocialHubPage onNavigate={handleNavigation} />
      default:
        return <div>Page not found</div>
    }
  }

  return <>{renderPage()}</>
}