"use client"

import dynamic from "next/dynamic"
import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph, Heading2 } from "@/components/ui/typography"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { usePageTitleSimple } from "@/hooks/use-page-title"
import { ChevronLeft, Loader2, EyeOff, Eye } from "lucide-react"
import { SecurityArchitectureStrip, SplashScreenFooter } from "./splash-screen-security"
import { DASHBOARD_ROUTE, markDashboardEntryIntent } from "@/lib/auth-navigation"

interface SplashScreenProps {
  onLogin?: () => void;
  onLoginSuccess?: (userData: any) => void;
  showLogin?: boolean;
}

const ParticlesBackground = dynamic(
  () => import("./particles-background").then((mod) => mod.ParticlesBackground),
  {
    ssr: false,
  },
)

const OnboardingPage = dynamic(
  () => import("./onboarding-page").then((mod) => mod.OnboardingPage),
  {
    ssr: false,
    loading: () => <FullScreenLoader label="Preparing secure onboarding" />,
  },
)

const ForgotPasswordForm = dynamic(
  () => import("./forgot-password-form").then((mod) => mod.ForgotPasswordForm),
  {
    ssr: false,
    loading: () => <InlinePanelLoader label="Loading password recovery" />,
  },
)

const MfaCodeInput = dynamic(
  () => import("./mfa-code-input").then((mod) => mod.MfaCodeInput),
  {
    ssr: false,
    loading: () => <InlinePanelLoader label="Loading verification step" compact />,
  },
)

export function SplashScreen({ onLogin, onLoginSuccess, showLogin = false }: SplashScreenProps) {
  const { theme } = useTheme()
  const { resetOnboarding, setIsFromSignupFlow } = useOnboarding()
  const { toast } = useToast()
  const [showParticles, setShowParticles] = useState(false)
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

  // Set page title and description based on state
  const getPageTitle = () => {
    if (showOnboarding) return 'Create Account - HNWI Chronicles';
    if (showForgotPassword) return 'Reset Password - HNWI Chronicles';
    if (showLoginForm) return 'Sign In - HNWI Chronicles';
    return 'HNWI Chronicles – Private Intelligence for Modern Wealth';
  };

  const getPageDescription = () => {
    if (showOnboarding) return 'Join HNWI Chronicles. Exclusive wealth intelligence platform combining AI-powered market analysis, off-market opportunities, and strategic planning for ultra-high-net-worth individuals.';
    if (showForgotPassword) return 'Reset your HNWI Chronicles password to regain access to exclusive wealth intelligence and premium investment opportunities.';
    if (showLoginForm) return 'Sign in to HNWI Chronicles. Access real-time wealth intelligence, AI-scored opportunities, and strategic insights for ultra-high-net-worth individuals.';
    return 'Private intelligence platform for modern wealth. Real-time market intelligence, exclusive opportunities, and AI-powered strategic planning for $1M+ net worth individuals.';
  };

  usePageTitleSimple(getPageTitle(), getPageDescription(), [showOnboarding, showForgotPassword, showLoginForm]);

  useEffect(() => {
    let cancelled = false

    const showDeferredParticles = () => {
      if (!cancelled) {
        setShowParticles(true)
      }
    }

    if (typeof window === "undefined") {
      return
    }

    const idleApi = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleApi.requestIdleCallback) {
      const handle = idleApi.requestIdleCallback(showDeferredParticles, { timeout: 1200 })
      return () => {
        cancelled = true
        idleApi.cancelIdleCallback?.(handle)
      }
    }

    const timer = window.setTimeout(showDeferredParticles, 180)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  const getAuthManager = useCallback(async () => {
    const mod = await import("@/lib/unified-auth-manager")
    return mod.unifiedAuthManager
  }, [])

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
    markDashboardEntryIntent()
  }

  const showLoginSuccessToast = async (firstName?: string) => {
    const resolvedFirstName = firstName || "there"

    if (!rememberDevice) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${resolvedFirstName}!`,
      })
      return
    }

    try {
      const { trustCurrentDevice } = await import("@/lib/auth-utils")
      const trustSuccess = trustCurrentDevice()

      toast({
        title: "Login Successful",
        description: trustSuccess
          ? `Welcome back, ${resolvedFirstName}! Device trusted for 7 days.`
          : `Welcome back, ${resolvedFirstName}!`,
      })
    } catch {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${resolvedFirstName}!`,
      })
    }
  }

  const transitionToMfaStep = (token: string, message?: string) => {
    setShowOnboarding(false)
    setShowLoginForm(true)
    setShowForgotPassword(false)
    setMfaToken(token)
    setShowMfa(true)

    toast({
      title: "Security code sent",
      description: message || "Check your email for the 6-digit authentication code.",
    })
  }

  const finalizeAuthenticatedEntry = async (normalizedUser: any) => {
    await showLoginSuccessToast(normalizedUser?.firstName || normalizedUser?.name?.split(" ")[0])
    handleClose()

    if (onLoginSuccess) {
      onLoginSuccess(normalizedUser)
    } else {
      window.location.assign(DASHBOARD_ROUTE)
    }

    resetOnboarding()
    setIsFromSignupFlow(false)
  }

  const handleOnboardingComplete = async (userData: any) => {
    if (!userData?.email || !userData?.password) {
      setShowOnboarding(false)
      setShowLoginForm(true)
      setError("Account created, but secure sign-in could not start. Please sign in to continue.")
      return
    }

    setEmail(userData.email)
    setPassword(userData.password)
    setShowOnboarding(false)
    setShowLoginForm(true)
    setShowForgotPassword(false)
    setShowMfa(false)
    setMfaToken(null)
    setError("")
    setIsLoading(true)

    try {
      const authManager = await getAuthManager()
      const result = await authManager.login(userData.email, userData.password, false)

      if (result.requiresMFA) {
        if (result.mfaToken) {
          transitionToMfaStep(result.mfaToken, result.message)
          return
        }

        setError("Account created, but the security challenge could not start. Please sign in to continue.")
        return
      }

      if (result.success && result.user) {
        await finalizeAuthenticatedEntry(result.user)
        return
      }

      setError(result.error || "Account created, but automatic sign-in failed. Please sign in to continue.")
    } catch (error) {
      setError("Account created, but secure sign-in failed. Please sign in to continue.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
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
      const authManager = await getAuthManager()
      const result = await authManager.login(email, password, rememberDevice)

      if (result.requiresMFA) {
        if (result.mfaToken) {
          transitionToMfaStep(result.mfaToken, result.message)
        } else {
          setError("Authentication challenge unavailable. Please try again.")
        }
      } else if (result.success && result.user) {
        const normalizedUser = result.user

        if (!normalizedUser) {
          setError('Authentication failed. Please try again.')
          return
        }

        await finalizeAuthenticatedEntry(normalizedUser)
      } else if (!result.success) {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaSubmit = async (code: string) => {
    if (!mfaToken) {
      setError("Invalid session. Please try logging in again.")
      return
    }

    try {
      // Use unified auth manager (leverages secure-api with URL masking)
      const authManager = await getAuthManager()
      const result = await authManager.verifyMFA(code, mfaToken, rememberDevice)

      if (result.success && result.user) {
        const normalizedUser = result.user

        if (!normalizedUser) {
          setError('Authentication failed. Please try again.')
          return
        }
        await finalizeAuthenticatedEntry(normalizedUser)
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
      const authManager = await getAuthManager()
      const result = await authManager.login(email, password, rememberDevice)

      if (result.requiresMFA && result.mfaToken) {
        transitionToMfaStep(result.mfaToken, result.message || "A new security code has been sent to your email.")
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
        {showParticles ? <ParticlesBackground /> : null}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <ForgotPasswordForm onBack={handleBack} />
        </div>
        <SecurityArchitectureStrip />
        <SplashScreenFooter />
      </div>
    )
  }

  if (showLoginForm) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {showParticles ? <ParticlesBackground /> : null}

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

                  <Button type="submit" className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${theme === "dark"
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

        <SecurityArchitectureStrip />
        <SplashScreenFooter />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-background`}
    >
      {showParticles ? <ParticlesBackground /> : null}

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

          <Lead className="mb-8 text-muted-foreground">Private Intelligence for Modern Wealth.</Lead>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center px-4">
            {/* Login button - Primary CTA */}
            <Button
              onClick={handleLoginClick}
              className={`w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${theme === "dark"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-black text-white hover:bg-black/90"
                }`}
            >
              Log In
            </Button>

            {/* Gain Access button - Secondary */}
            <Button
              onClick={() => window.location.href = 'https://www.hnwichronicles.com/clearance'}
              className={`w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${theme === "dark"
                ? "bg-[hsl(43_74%_49%_/_0.2)] text-[hsl(43_74%_49%)] border border-[hsl(43_74%_49%_/_0.3)] hover:bg-[hsl(43_74%_49%_/_0.3)] hover:border-[hsl(43_74%_49%_/_0.5)]"
                : "bg-[hsl(0_0%_10%_/_0.1)] text-[hsl(0_0%_20%)] border border-[hsl(0_0%_10%_/_0.2)] hover:bg-[hsl(0_0%_10%_/_0.15)] hover:text-[hsl(0_0%_10%)] hover:border-[hsl(0_0%_10%_/_0.3)]"
                }`}
            >
              Gain Access
            </Button>
          </div>

        </motion.div>

        <SecurityArchitectureStrip title="Enterprise-Security Standard Architecture" />
      </div>

      <SplashScreenFooter />
    </div>
  )
}

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-center px-6">
      <div className="space-y-4">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function InlinePanelLoader({
  label,
  compact = false,
}: {
  label: string
  compact?: boolean
}) {
  return (
    <div className={`flex items-center justify-center ${compact ? "py-8" : "min-h-[320px]"}`}>
      <div className="space-y-3 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
