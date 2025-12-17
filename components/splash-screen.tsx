"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { unifiedAuthManager } from "@/lib/unified-auth-manager"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph, Heading2 } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { OnboardingPage } from "./onboarding-page"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { ShieldCheck, KeyRound, Award, Earth, ScanEye, Server, Fingerprint, ChevronLeft, Loader2, EyeOff, Eye, Lock, Shield } from "lucide-react"
import { MfaCodeInput } from "./mfa-code-input"

interface SplashScreenProps {
  onLogin?: () => void;
  onLoginSuccess?: (userData: any) => void;
  showLogin?: boolean;
}

export function SplashScreen({ onLogin, onLoginSuccess, showLogin = false }: SplashScreenProps) {
  const { theme } = useTheme()
  const { resetOnboarding, setIsFromSignupFlow } = useOnboarding()
  const { toast } = useToast()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(showLogin)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMfa, setShowMfa] = useState(false)
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)

  const handleCreateAccount = () => {
    setShowOnboarding(true)
  }

  const handleLoginClick = () => {
    if (onLogin) {
      onLogin()
    } else {
      setShowLoginForm(true)
    }
  }

  const handleBack = () => {
    setShowOnboarding(false)
    setShowLoginForm(false)
    setShowForgotPassword(false)
    setError("")
    setShowMfa(false)
    setMfaToken(null)
    setIsResending(false)
  }

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true)
    setShowLoginForm(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setError("")
    setShowPassword(false)
    setShowMfa(false)
    setMfaToken(null)
    setIsResending(false)
    setRememberDevice(false)

    // Set session flags to prevent splash screen loop
    sessionStorage.setItem("skipSplash", "true")
    sessionStorage.setItem("currentPage", "dashboard")
  }

  const handleOnboardingComplete = (userData: any) => {
    // Handle successful registration
    
    // Instead of redirecting to login, automatically log the user in
    const authData = {
      userId: userData.user_id,
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || "User",
      lastName: userData.lastName || (userData.name?.split(' ').slice(1).join(' ') || ""),
      profile: userData.profile || {},
      token: userData.token || "auto-login-token"
    }
    
    // Store auth data in localStorage (same pattern as login-page.tsx)
    localStorage.setItem("userId", authData.userId);
    localStorage.setItem("userEmail", authData.email);
    // Backend sets cookies
    
    // Store user object for recovery if needed
    localStorage.setItem("userObject", JSON.stringify(authData));
    
    // Set skipSplash flag to bypass login screen on page refresh
    sessionStorage.setItem("skipSplash", "true");
    sessionStorage.setItem("currentPage", "dashboard");
    
    // Call the onLoginSuccess callback if provided
    if (onLoginSuccess) {
      onLoginSuccess(authData)
    } else {
      // Fallback: Navigate to dashboard after signup
      window.location.href = "/"
    }
  }

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!email || !password) {
        setError("Please enter both email and password")
        return
      }

      if (isLoading) {
        return
      }

      setIsLoading(true)
      setError("")

      try {
        // Use unified auth manager (leverages secure-api with URL masking)
        const result = await unifiedAuthManager.login(email, password, rememberDevice)

        if (result.requiresMFA) {
          // MFA is required - show MFA input
          setMfaToken(result.mfaToken || '')
          setShowMfa(true)
          toast({
            title: "Security code sent",
            description: result.message || "Check your email for the 6-digit authentication code.",
          })
        } else if (result.success && result.user) {
          // Direct login success - unified auth manager already handled all state sync
          const normalizedUser = result.user

          if (!normalizedUser) {
            setError('Authentication failed. Please try again.')
            return
          }
          
          // Handle device trust if checkbox was checked
          if (rememberDevice) {
            try {
              // Import device trust function
              const { trustCurrentDevice } = await import("@/lib/device-trust")
              const trustSuccess = trustCurrentDevice()
              if (trustSuccess) {
                toast({
                  title: "Login Successful",
                  description: `Welcome back, ${normalizedUser.firstName}! Device trusted for 7 days.`,
                })
              } else {
                toast({
                  title: "Login Successful", 
                  description: `Welcome back, ${normalizedUser.firstName}!`,
                })
              }
            } catch (error) {
              toast({
                title: "Login Successful",
                description: `Welcome back, ${normalizedUser.firstName}!`,
              })
            }
          } else {
            toast({
              title: "Login Successful",
              description: `Welcome back, ${normalizedUser.firstName}!`,
            })
          }
          
          handleClose()

          if (onLoginSuccess) {
            onLoginSuccess(normalizedUser)
          }
          
          resetOnboarding()
          setIsFromSignupFlow(false)
        } else if (!result.success) {
          setError(result.error || "Login failed")
        }
      } catch (error) {
        setError("An unexpected error occurred. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, isLoading, toast, rememberDevice]
  )

  const handleMfaSubmit = async (code: string) => {
    if (!mfaToken) {
      setError("Invalid session. Please try logging in again.")
      return
    }

    try {
      // Use unified auth manager (leverages secure-api with URL masking)
      const result = await unifiedAuthManager.verifyMFA(code, mfaToken, rememberDevice)

      if (result.success && result.user) {
        // Unified auth manager already handled all state sync
        const normalizedUser = result.user

        if (!normalizedUser) {
          setError('Authentication failed. Please try again.')
          return
        }


        // Handle device trust if checkbox was checked
        if (rememberDevice) {
          try {
            // Import device trust function
            const { trustCurrentDevice } = await import("@/lib/device-trust")
            const trustSuccess = trustCurrentDevice()
            if (trustSuccess) {
              toast({
                title: "Login Successful",
                description: `Welcome back, ${normalizedUser.firstName}! Device trusted for 7 days.`,
              })
            } else {
              toast({
                title: "Login Successful",
                description: `Welcome back, ${normalizedUser.firstName}!`,
              })
            }
          } catch (error) {
            toast({
              title: "Login Successful",
              description: `Welcome back, ${normalizedUser.firstName}!`,
            })
          }
        } else {
          toast({
            title: "Login Successful",
            description: `Welcome back, ${normalizedUser.firstName}!`,
          })
        }

        // Reset form
        handleClose()

        // Set flags to prevent splash screen from showing again
        sessionStorage.setItem("skipSplash", "true")
        sessionStorage.setItem("currentPage", "dashboard")

        // Verify user data is available before navigation
        const { getCurrentUser } = await import("@/lib/auth-manager")
        const verifyAndNavigate = () => {
          const storedUser = getCurrentUser()
          if (storedUser) {
            // User data is confirmed stored, safe to navigate
            if (onLoginSuccess) {
              onLoginSuccess(normalizedUser)
            }
          } else {
            // If not yet available, retry once more
            setTimeout(() => {
              if (onLoginSuccess) {
                onLoginSuccess(normalizedUser)
              }
            }, 50)
          }
        }

        // Small delay to ensure auth state is fully synchronized before triggering navigation
        setTimeout(verifyAndNavigate, 150)
        
        resetOnboarding()
        setIsFromSignupFlow(false)
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
    }
  }

  const handleMfaResend = async () => {
    if (!mfaToken || isResending) {
      return
    }

    setIsResending(true)
    setError("")

    try {
      // Re-initiate login process using unified auth manager to get a new MFA code
      const result = await unifiedAuthManager.login(email, password, rememberDevice)

      if (result.requiresMFA && result.mfaToken) {
        setMfaToken(result.mfaToken)
        toast({
          title: "Code resent",
          description: result.message || "A new security code has been sent to your email.",
        })
      } else {
        setError("Failed to resend code")
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} onLogin={handleLoginClick} onBack={handleBack} />
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ParticlesBackground />
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <ForgotPasswordForm onBack={handleBack} />
        </div>
        
        {/* Security Standards Section */}
        <div className="w-full flex justify-center py-6 md:py-8 border-t border-border/20">
          <div className="w-full max-w-7xl px-4">
            <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
              Enterprise Security Architecture
            </p>
            
            {/* Auto-scrolling container optimized for 55" screens */}
            <div className="relative overflow-hidden w-full h-20">
              <div className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap" style={{ animationDuration: '30s' }}>
                {/* Security badges with larger sizing for 55" display */}
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                    alt="SOC 2"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                    alt="ISO"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                    alt="PCI DSS"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                    alt="GDPR"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                    alt="CCPA"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                    alt="AES-256"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                    alt="Zero-Trust"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                    alt="SOC 2"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                    alt="ISO"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                    alt="PCI DSS"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                    alt="GDPR"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                    alt="CCPA"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                    alt="AES-256"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                </div>
                <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                    alt="Zero-Trust"
                    width={24}
                    height={24}
                    className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                  />
                  <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
          <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
            <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              A product of <span className="font-semibold text-primary">Montaigne</span> 
              {/* • Powered by <span className={`font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Market Unwinded AI</span> */}
            </Paragraph>
            <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              © 2025 All Rights Reserved. HNWI Chronicles.
            </Paragraph>
          </div>
        </footer>
      </div>
    )
  }

  if (showLoginForm) {
    return (
      <>
        <MetaTags
          title="Login | HNWI Chronicles"
          description="Access your HNWI Chronicles account. Dive into wealth intelligence and strategic insights for high-net-worth individuals."
          image="https://hnwichronicles.com/login-og-image.jpg"
          url="https://hnwichronicles.com/login"
        />
        <div className="min-h-screen flex flex-col bg-background">
          <ParticlesBackground />

          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Back
            </Button>
          </div>
          <div className="flex-grow flex items-start justify-center p-4 pt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`w-full ${showMfa ? 'max-w-lg' : 'max-w-md'} bg-card backdrop-blur-sm rounded-3xl p-6 md:p-8 mt-8`}
            >
              {!showMfa ? (
                // Login Form
                <>
                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src="/logo.png"
                      alt="HNWI Chronicles"
                      width={80}
                      height={80}
                      className="mb-4 w-auto h-auto"
                      style={{ width: '80px', height: '80px' }}
                      priority
                    />
                    <Heading2 className="text-3xl font-bold font-heading text-center">
                      <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>Welcome Back</span>
                    </Heading2>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 rounded-3xl font-body bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-3xl font-body bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Simple Remember Device Checkbox */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="rememberDevice"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        style={{ 
                          accentColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'
                        }}
                      />
                      <label 
                        htmlFor="rememberDevice"
                        className="text-sm text-muted-foreground cursor-pointer select-none"
                      >
                        Remember this device for 7 days
                      </label>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                      theme === "dark" 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-black text-white hover:bg-black/90"
                    }`} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1 md:mr-2 h-4 w-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>

                  <Paragraph 
                    onClick={handleForgotPasswordClick}
                    className="text-sm mt-4 block mx-auto font-body text-center text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    Forgot Password?
                  </Paragraph>
                </>
              ) : (
                // MFA Code Input
                <>
                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src="/logo.png"
                      alt="HNWI Chronicles"
                      width={80}
                      height={80}
                      className="mb-4 w-auto h-auto"
                      style={{ width: '80px', height: '80px' }}
                      priority
                    />
                    <Heading2 className="text-3xl font-bold font-heading text-center">
                      <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>Security Verification</span>
                    </Heading2>
                    <Paragraph className="text-sm text-muted-foreground text-center mt-2">
                      Your security is our highest priority
                    </Paragraph>
                  </div>

                  <div className="mt-4">
                    <MfaCodeInput
                      onSubmit={handleMfaSubmit}
                      onResend={handleMfaResend}
                      isLoading={isLoading}
                      isResending={isResending}
                      error={error}
                    />
                    
                    <div className="flex justify-center mt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowMfa(false)
                          setMfaToken(null)
                          setError("")
                        }}
                        className="text-sm hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to login
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        
          {/* Security Standards Section - Full Screen Width */}
          <div className="w-full flex justify-center py-6 md:py-8 border-t border-border/20">
            <div className="w-full max-w-7xl px-4">
              <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
                Enterprise Security Architecture
              </p>
              
              {/* Auto-scrolling container optimized for 55" screens */}
              <div className="relative overflow-hidden w-full h-20">
                <div className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap" style={{ animationDuration: '30s' }}>
                  {/* Security badges with larger sizing for 55" display */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                  
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
            <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
              <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                A product of <span className="font-semibold text-primary">Montaigne</span>
                 {/* • Powered by <span className={`font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Market Unwinded AI</span> */}
              </Paragraph>
              <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                © 2025 All Rights Reserved. HNWI Chronicles.
              </Paragraph>
            </div>
          </footer>
        </div>
      </>
    )
  }

  return (
    <>
      <MetaTags
        title="HNWI Chronicles – Your Gateway to Global Wealth Intelligence"
        description="Unlock exclusive insights, playbooks, and strategic intelligence tailored for High-Net-Worth Individuals. HNWI Chronicles empowers you with data-driven strategies, industry trends, and actionable frameworks to navigate the world of wealth and influence."
        image="https://hnwichronicles.com/og-image.jpg"
        url="https://montaigne.co/hnwichronicles"
      />
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-background`}
      >
        <ParticlesBackground />

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="z-10 text-center w-full max-w-4xl mt-20"
          >
            {/* Earth animation */}
            <motion.div
              className="globe-container relative w-24 h-24 sm:w-32 sm:h-32 mb-6 mx-auto"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <Image
                src="/logo.png"
                alt="HNWI Chronicles"
                width={256}
                height={256}
                className="w-auto h-auto"
                style={{ width: "256px", height: "auto" }}
                priority
              />
            </motion.div>

            <Heading1 className="text-3xl sm:text-5xl mb-4 text-foreground">
              <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>HNWI</span>{" "}
              <span className={`${theme === "dark" ? "text-[#C0C0C0]" : "text-[#888888]"}`}>CHRONICLES</span>
            </Heading1>

            <Lead className="mb-8 text-muted-foreground">Being made for HNWI to build their legacy and chronicles</Lead>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center px-4">
              {/* Login button - Primary CTA */}
              <Button
                onClick={handleLoginClick}
                className={`w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-black text-white hover:bg-black/90"
                }`}
              >
                Log In
              </Button>

              {/* Start Simulation button - Secondary */}
              <Button
                onClick={() => window.location.href = '/simulation'}
                className={`w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-[hsl(43_74%_49%_/_0.2)] text-[hsl(43_74%_49%)] border border-[hsl(43_74%_49%_/_0.3)] hover:bg-[hsl(43_74%_49%_/_0.3)] hover:border-[hsl(43_74%_49%_/_0.5)]"
                    : "bg-[hsl(0_0%_10%_/_0.1)] text-[hsl(0_0%_20%)] border border-[hsl(0_0%_10%_/_0.2)] hover:bg-[hsl(0_0%_10%_/_0.15)] hover:text-[hsl(0_0%_10%)] hover:border-[hsl(0_0%_10%_/_0.3)]"
                }`}
              >
                Start Simulation
              </Button>
            </div>

          </motion.div>
          
          {/* Security Standards Section - Centered and Full Width for 55" Display */}
          <div className="w-full flex justify-center mt-8 md:mt-12 py-6 md:py-8 border-t border-border/20">
            <div className="w-full max-w-7xl px-4">
              <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
                Enterprise-Security Standard Architecture
              </p>
              
              {/* Auto-scrolling container optimized for 55" screens */}
              <div className="relative overflow-hidden w-full h-20">
                <div className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap" style={{ animationDuration: '30s' }}>
                  {/* Security badges with larger sizing for 55" display */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                  
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-card/95 backdrop-blur-sm rounded-lg border border-border/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className={`h-5 w-5 object-contain opacity-80 mr-2 ${theme === "dark" ? "filter invert" : ""}`}
                    />
                    <span className="text-foreground font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
          <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
            <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              A product of <span className="font-semibold text-primary">Montaigne</span> 
              {/* • Powered by <span className={`font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Market Unwinded AI</span> */}
            </Paragraph>
            <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              © 2025 All Rights Reserved. HNWI Chronicles.
            </Paragraph>
          </div>
        </footer>
      </div>
    </>
  )
}