"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { handleResetPassword } from "@/lib/auth-actions"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { MetaTags } from "./meta-tags"

export function ResetPasswordForm() {
  const { theme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      // No token provided, redirect to login
      router.push('/')
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      toast({
        title: "All Fields Required",
        description: "Please fill in both password fields",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await handleResetPassword(token, password)
      
      if (result.success) {
        setIsSuccess(true)
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in.",
          variant: "default",
        })
      } else {
        toast({
          title: "Reset Failed",
          description: result.error || "Failed to reset password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/')
  }

  if (isSuccess) {
    return (
      <>
        <MetaTags
          title="Password Reset Successful | HNWI Chronicles"
          description="Your password has been successfully reset. You can now log in to your HNWI Chronicles account."
        />
        <div className="min-h-screen flex flex-col bg-background">
          <ParticlesBackground />
          
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>

          <div className="flex-grow flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-card backdrop-blur-sm rounded-3xl p-6 md:p-8"
            >
              <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  theme === "dark" ? "bg-primary/20" : "bg-green-100"
                }`}>
                  <CheckCircle className={`w-8 h-8 ${theme === "dark" ? "text-primary" : "text-green-600"}`} />
                </div>
                <Heading2 className="text-2xl font-bold text-center">
                  Password Reset Successful
                </Heading2>
              </div>

              <div className="text-center space-y-4 mb-6">
                <Paragraph className="text-muted-foreground">
                  Your password has been successfully updated. You can now log in with your new password.
                </Paragraph>
              </div>

              <Button
                onClick={handleBackToLogin}
                className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark" 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-black text-white hover:bg-black/90"
                }`}
              >
                Back to Login
              </Button>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <MetaTags
        title="Reset Password | HNWI Chronicles"
        description="Reset your HNWI Chronicles password. Enter your new password to regain access to your account."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <ParticlesBackground />
        
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-card backdrop-blur-sm rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/logo.png"
                alt="HNWI Chronicles"
                width={60}
                height={60}
                className="mb-4 w-auto h-auto"
                style={{ width: '60px', height: '60px' }}
                priority
              />
              <Heading2 className="text-2xl font-bold text-center">
                Reset Your Password
              </Heading2>
              <Paragraph className="text-sm text-muted-foreground text-center mt-2">
                Enter your new password below
              </Paragraph>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-3xl font-body bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-3xl font-body bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <Button 
                type="submit" 
                className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  theme === "dark" 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-black text-white hover:bg-black/90"
                }`} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Paragraph className="text-sm text-muted-foreground">
                Remember your password?{" "}
                <span 
                  onClick={handleBackToLogin}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Back to Login
                </span>
              </Paragraph>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}