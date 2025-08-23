"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Crown, Eye, EyeOff } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { handleLogin } from "@/lib/auth-actions"
import { useToast } from "@/components/ui/use-toast"
import { getMetallicCardStyle } from "@/lib/colors"
import { MfaCodeInput } from "@/components/mfa-code-input"

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  title?: string
  description?: string
}

export function AuthPopup({ 
  isOpen, 
  onClose, 
  onSuccess,
  title = "Private Line Disconnected",
  description = "Your encrypted connection has timed out. Restore access to continue monitoring intelligence."
}: AuthPopupProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMfa, setShowMfa] = useState(false)
  const [mfaSessionToken, setMfaSessionToken] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    // Prevent multiple submissions
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Initiate 2FA login
      const response = await fetch('/api/auth/mfa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success) {
        setMfaSessionToken(result.sessionToken)
        setShowMfa(true)
        toast({
          title: "Security code sent",
          description: "Check your email for the 6-digit authentication code.",
        })
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaSubmit = async (code: string) => {
    if (!mfaSessionToken) {
      setError("Invalid session. Please try logging in again.")
      return
    }

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionToken: mfaSessionToken, 
          code 
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store token in localStorage for frontend auth checks
        if (result.token) {
          localStorage.setItem('token', result.token)
        }
        
        toast({
          title: "Secure access restored",
          description: "Elite authentication successful. Intelligence feed reconnected.",
        })
        
        // Reset form
        handleClose()
        
        // Call success callback and close
        onSuccess?.()
        onClose()
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
    }
  }

  const handleMfaResend = async () => {
    if (!mfaSessionToken || isResending) {
      return
    }

    setIsResending(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken: mfaSessionToken }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Code resent",
          description: "A new security code has been sent to your email.",
        })
      } else {
        setError(result.error || "Failed to resend code")
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setError(null)
    setShowPassword(false)
    setShowMfa(false)
    setMfaSessionToken(null)
    setIsResending(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={showMfa ? "sm:max-w-lg" : "sm:max-w-md"}>
        {!showMfa ? (
          // Login Form
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                {title}
              </DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 relative">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                    theme === "dark" 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-black text-white hover:bg-black/90"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          // MFA Code Input
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                Security Verification
              </DialogTitle>
              <DialogDescription>
                Complete elite authentication to restore secure access.
              </DialogDescription>
            </DialogHeader>

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
                    setMfaSessionToken(null)
                    setError(null)
                  }}
                  className="text-sm"
                >
                  ← Back to login
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}