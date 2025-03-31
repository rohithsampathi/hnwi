// components/login-page.tsx

"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { ChevronLeft, Loader2, Eye, EyeOff } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { ParticlesBackground } from "./particles-background"
import { MetaTags } from "./meta-tags"
import { login as loginWithAnalytics } from "@/utils/auth"

// Import from config to ensure consistency
import { API_BASE_URL } from "@/config/api"

export function LoginPage({ 
  onLoginSuccess, 
  onBack 
}) {
  const { theme } = useTheme()
  const { resetOnboarding, setIsFromSignupFlow } = useOnboarding()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault()
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        // Get response as JSON directly
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          throw new Error("Invalid response from server. Please try again.");
        }
        
        if (!response.ok) {
          throw new Error(data.detail || data.error || "Login failed. Please check your credentials.");
        }
        
        // Transform response to expected format for app-content.tsx
        const userData = {
          userId: data.user_id,
          email: data.email,
          firstName: data.first_name || "User",
          lastName: data.last_name || "",
          profile: data.profile || {},
          token: data.token || ""
        };
        
        // Use our helper function to login with Mixpanel tracking
        loginWithAnalytics(userData, userData.token);
        
        // Call the success handler with the user data
        onLoginSuccess(userData);
        
        // Reset onboarding state
        resetOnboarding();
        setIsFromSignupFlow(false);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.firstName}!`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error during login:", error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Login failed. Please check your credentials and try again.";
        
        setError(errorMessage);
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, onLoginSuccess, resetOnboarding, setIsFromSignupFlow, toast]
  );

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      <MetaTags
        title="Login | HNWI Chronicles"
        description="Access your HNWI Chronicles account. Dive into wealth intelligence and strategic insights for high-net-worth individuals."
        image="https://hnwichronicles.com/login-og-image.jpg"
        url="https://hnwichronicles.com/login"
      />
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          theme === "dark" ? "bg-[#121212]" : "bg-[#F5F5F5]"
        }`}
      >
        <ParticlesBackground />

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={onBack}
            className={`text-sm rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0.5 ${
              theme === "dark"
                ? "text-[#BBDEFB] hover:text-white hover:bg-[#1A1A1A]"
                : "text-[#424242] hover:text-[#212121] hover:bg-[#E0E0E0]"
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-md ${
              theme === "dark"
                ? "bg-[#121212]/80 shadow-[0_15px_35px_rgba(156,163,175,0.3)]"
                : "bg-[#F5F5F5]/80 shadow-[0_15px_35px_rgba(75,85,99,0.3)]"
            } backdrop-blur-sm rounded-3xl p-8`}
            style={{
              boxShadow:
                theme === "dark"
                  ? "0 15px 35px rgba(156,163,175,0.3), 0 8px 20px rgba(156,163,175,0.2), 0 4px 10px rgba(156,163,175,0.1)"
                  : "0 15px 35px rgba(75,85,99,0.3), 0 8px 20px rgba(75,85,99,0.2), 0 4px 10px rgba(75,85,99,0.1)",
            }}
          >
            <Heading2
              className={`text-3xl font-bold font-heading mb-6 text-center ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              Welcome Back
            </Heading2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
                    theme === "dark"
                      ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
                      : "bg-white text-[#212121] border-[#DDD]"
                  } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] transition-all focus:shadow-[0_4px_10px_rgba(66,165,245,0.25)]`}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
                    theme === "dark"
                      ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
                      : "bg-white text-[#212121] border-[#DDD]"
                  } focus:outline-none focus:ring-2 focus:ring-[#42A5F5] transition-all pr-10 focus:shadow-[0_4px_10px_rgba(66,165,245,0.25)]`}
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

              <Button type="submit" className="gradient-button w-full h-12 text-lg rounded-full shadow-[0_8px_20px_rgba(75,85,99,0.5)] hover:shadow-[0_12px_25px_rgba(75,85,99,0.7)] dark:shadow-[0_8px_20px_rgba(156,163,175,0.5)] dark:hover:shadow-[0_12px_25px_rgba(156,163,175,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            <Paragraph
              className={`text-sm mt-4 block mx-auto font-body text-center ${
                theme === "dark" ? "text-white" : "text-[#424242]"
              }`}
            >
              Forgot Password?
            </Paragraph>
          </motion.div>
        </div>
        <footer
          className={`text-[10px] leading-tight text-center py-4 font-body ${
            theme === "dark" ? "text-[#666]" : "text-[#999]"
          }`}
        >
          <p>© 2025 All Rights Reserved. HNWI Chronicles.</p>
          <p>powered by Market Unwinded AI</p>
        </footer>
      </div>
    </>
  )
}