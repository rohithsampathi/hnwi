"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph, Heading2 } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { OnboardingPage } from "./onboarding-page"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { ShieldCheck, KeyRound, Award, Earth, ScanEye, Server, Fingerprint, ChevronLeft, Loader2, EyeOff, Eye, Lock } from "lucide-react"

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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
    setError("")
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
    localStorage.setItem("token", authData.token);
    
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
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        })
        
        let data
        try {
          data = await response.json()
        } catch (jsonError) {
          throw new Error("Invalid response from server. Please try again.")
        }
        
        if (!response.ok) {
          throw new Error(data.detail || data.error || "Login failed. Please check your credentials.")
        }
        
        const userData = {
          userId: data.user_id,
          email: data.email,
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          profile: data.profile || {},
          token: data.token || ""
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(userData)
        }
        
        resetOnboarding()
        setIsFromSignupFlow(false)
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.firstName}!`,
          variant: "default",
        })
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Login failed. Please check your credentials and try again."
        
        setError(errorMessage)
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [email, password, onLoginSuccess, resetOnboarding, setIsFromSignupFlow, toast]
  )

  if (showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} onLogin={handleLoginClick} onBack={handleBack} />
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
              className="w-full max-w-md bg-card shadow-lg backdrop-blur-sm rounded-3xl p-6 md:p-8 mt-8"
              style={{
                boxShadow:
                  theme === "dark"
                    ? "0 15px 35px rgba(156,163,175,0.3), 0 8px 20px rgba(156,163,175,0.2), 0 4px 10px rgba(156,163,175,0.1)"
                    : "0 15px 35px rgba(75,85,99,0.3), 0 8px 20px rgba(75,85,99,0.2), 0 4px 10px rgba(75,85,99,0.1)",
              }}
            >
              <div className="flex flex-col items-center mb-6">
                <Image
                  src="/logo.png"
                  alt="HNWI Chronicles"
                  width={80}
                  height={80}
                  className="mb-4"
                  priority
                />
                <Heading2 className="text-3xl font-bold font-heading text-center text-card-foreground">
                  Welcome Back
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
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button type="submit" className="w-full h-12 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-300 transform hover:scale-105" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 md:mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>

              <Paragraph className="text-sm mt-4 block mx-auto font-body text-center text-muted-foreground hover:text-primary cursor-pointer">
                Forgot Password?
              </Paragraph>
            </motion.div>
          </div>
        
          {/* Security Standards Section - Full Screen Width */}
          <div className="w-full flex justify-center py-6 md:py-8 border-t border-border/20">
            <div className="w-full max-w-7xl px-4">
              <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
                Enterprise Security Standards
              </p>
              
              {/* Auto-scrolling container optimized for 55" screens */}
              <div className="relative overflow-hidden w-full h-20">
                <div className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap" style={{ animationDuration: '30s' }}>
                  {/* Security badges with larger sizing for 55" display */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                  
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
            <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
              <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                A product of <span className="font-semibold text-primary">Montaigne</span> • Powered by <span className="font-semibold text-secondary">Market Unwinded AI</span>
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
        description="Unlock exclusive insights, playbooks, and strategic intelligence tailored for High-Net-Worth and Ultra-High-Net-Worth Individuals. HNWI Chronicles empowers you with data-driven strategies, industry trends, and actionable frameworks to navigate the world of wealth and influence."
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
                className="w-full h-full"
                style={{ height: "auto" }}
                priority
              />
            </motion.div>

            <Heading1 className="text-3xl sm:text-5xl mb-4 text-foreground">
              <span className="text-primary">HNWI</span>{" "}
              <span className="text-secondary">CHRONICLES</span>
            </Heading1>

            <Lead className="mb-8 text-muted-foreground">Built for UHNWI and HNWI to build their legacy and chronicles</Lead>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center px-4">
              {/* Login button */}
              <Button
                onClick={handleLoginClick}
                className="w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Log In
              </Button>

              {/* Join HNWI button */}
              <Button
                onClick={() => window.open('https://www.hnwichronicles.com/hnwi-world#pricing', '_blank')}
                className="w-full sm:w-[200px] max-w-[280px] h-[50px] text-lg rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Join HNWI
              </Button>
            </div>

          </motion.div>
          
          {/* Security Standards Section - Centered and Full Width for 55" Display */}
          <div className="w-full flex justify-center mt-8 md:mt-12 py-6 md:py-8 border-t border-border/20">
            <div className="w-full max-w-7xl px-4">
              <p className="text-center text-base md:text-lg font-medium text-muted-foreground mb-6 md:mb-8">
                Enterprise Security Standards
              </p>
              
              {/* Auto-scrolling container optimized for 55" screens */}
              <div className="relative overflow-hidden w-full h-20">
                <div className="absolute flex animate-scroll space-x-8 md:space-x-12 whitespace-nowrap" style={{ animationDuration: '30s' }}>
                  {/* Security badges with larger sizing for 55" display */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                  
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/shield-check.svg"
                      alt="SOC 2"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">SOC 2 TYPE II</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/standardresume.svg"
                      alt="ISO"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ISO 27001</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/visa.svg"
                      alt="PCI DSS"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">PCI DSS</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/europeanunion.svg"
                      alt="GDPR"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">GDPR</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/googlemaps.svg"
                      alt="CCPA"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">CCPA</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/letsencrypt.svg"
                      alt="AES-256"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">AES-256</span>
                  </div>
                  <div className="flex items-center justify-center min-w-fit px-4 py-3 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-md">
                    <Image
                      src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/cloudflare.svg"
                      alt="Zero-Trust"
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain opacity-80 mr-2"
                    />
                    <span className="text-slate-800 font-bold text-sm tracking-tight">ZERO-TRUST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full py-4 md:py-6 px-4 text-center z-10 bg-background/80 backdrop-blur-sm border-t border-border/20">
          <div className="max-w-2xl mx-auto space-y-1 md:space-y-2">
            <Paragraph className="text-[10px] md:text-xs text-muted-foreground leading-tight">
              A product of <span className="font-semibold text-primary">Montaigne</span> • Powered by <span className="font-semibold text-secondary">Market Unwinded AI</span>
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