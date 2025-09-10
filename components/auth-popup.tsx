"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Crown, Eye, EyeOff, Shield } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { getMetallicCardStyle } from "@/lib/colors"
import { MfaCodeInput } from "@/components/mfa-code-input"
import { SessionState, setSessionState, isSessionLocked, getSessionInfo, trustCurrentDevice, shouldSkip2FA } from "@/lib/auth-utils"
import { ShieldLoader } from "@/components/ui/shield-loader"

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
  const [mfaToken, setMfaToken] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number | null>(null)
  const [isReauthMode, setIsReauthMode] = useState(false)
  const [storedEmail, setStoredEmail] = useState("")
  const [rememberDevice, setRememberDevice] = useState(false)
  
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)

  // Start countdown timer for rate limit
  const startCountdown = (seconds: number) => {
    setRateLimitSeconds(seconds)
    
    // Clear any existing interval
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
    }
    
    countdownInterval.current = setInterval(() => {
      setRateLimitSeconds(prev => {
        if (prev === null || prev <= 1) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current)
            countdownInterval.current = null
          }
          setError(null) // Clear rate limit error when countdown ends
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [])

  // Detect reauth mode when popup opens
  useEffect(() => {
    if (isOpen) {
      const sessionInfo = getSessionInfo();
      const isLocked = isSessionLocked();
      
      if (isLocked && sessionInfo.token) {
        // This is a reauth scenario - user was locked due to inactivity but token is still valid
        setIsReauthMode(true);
        
        // Try to get stored email from previous session data
        try {
          const userDisplay = sessionStorage.getItem("userDisplay");
          if (userDisplay) {
            const userData = JSON.parse(userDisplay);
            setStoredEmail(userData.email || "");
            setEmail(userData.email || "");
          }
        } catch (e) {
          // Ignore parsing errors
        }
        
        // For reauth, default to remembering device if they haven't opted out before
        setRememberDevice(true);
      } else {
        // This is a full login scenario
        setIsReauthMode(false);
        setStoredEmail("");
        setRememberDevice(false);
      }
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // In reauth mode, we might only need password if email is pre-filled
    if (isReauthMode && storedEmail && !password) {
      setError("Please enter your password to continue")
      return
    } else if (!isReauthMode && (!email || !password)) {
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
      // Step 1: Call standard login endpoint
      // In reauth mode, use storedEmail if available, otherwise use email state
      const loginEmail = isReauthMode && storedEmail ? storedEmail : email;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password }),
      })

      const result = await response.json()


      if (response.status === 429) {
        // Rate limited - show clear security message with countdown
        const retryAfter = response.headers.get('Retry-After') || '60'
        const waitTime = parseInt(retryAfter)
        
        // Use the server error message or fallback to custom message
        const errorMessage = result.error || 'Security Vault Activated. Too many login attempts detected.'
        setError(errorMessage)
        startCountdown(waitTime)
        return
      }

      if (result.requires_mfa) {
        // MFA is required - show MFA input
        setMfaToken(result.mfa_token)
        setShowMfa(true)
        toast({
          title: "Security code sent",
          description: result.message || "Check your email for the 6-digit authentication code.",
        })
      } else if (result.access_token) {
        // Direct login success (shouldn't happen with MFA enabled)
        if (result.access_token) {
          localStorage.setItem('token', result.access_token)
        }
        
        // Update session state to authenticated (unlocked)
        setSessionState(SessionState.AUTHENTICATED)
        
        // Trust device if checkbox was checked
        if (rememberDevice) {
          const trustSuccess = trustCurrentDevice();
          if (trustSuccess) {
            toast({
              title: "Secure access restored",
              description: isReauthMode 
                ? "Session unlocked and device trusted for 7 days. Your work has been preserved." 
                : "Elite authentication successful. Device trusted for 7 days.",
            })
          }
        } else {
          toast({
            title: "Secure access restored",
            description: isReauthMode 
              ? "Session unlocked. Your work has been preserved." 
              : "Elite authentication successful. Intelligence feed reconnected.",
          })
        }
        
        // Small delay to allow UI feedback, then close
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 100)
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
    if (!mfaToken) {
      setError("Invalid session. Please try logging in again.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: isReauthMode && storedEmail ? storedEmail : email,
          mfa_code: code,
          mfa_token: mfaToken
        }),
      })

      const result = await response.json()

      if (response.status === 429) {
        // Rate limited during MFA verification - show clear security message with countdown
        const retryAfter = response.headers.get('Retry-After') || '60'
        const waitTime = parseInt(retryAfter)
        
        setError(`Security Vault Activated. Too many verification attempts detected.`)
        startCountdown(waitTime)
        return
      }

      if (result.success) {
        // Store token in localStorage for frontend auth checks
        if (result.access_token) {
          localStorage.setItem('token', result.access_token)
        }
        
        // Update session state to authenticated (unlocked)
        setSessionState(SessionState.AUTHENTICATED)
        
        // Trust device if checkbox was checked
        if (rememberDevice) {
          const trustSuccess = trustCurrentDevice();
          if (trustSuccess) {
            toast({
              title: "Secure access restored",
              description: isReauthMode 
                ? "Session unlocked and device trusted for 7 days. Your work has been preserved." 
                : "Elite authentication successful. Device trusted for 7 days.",
            })
          }
        } else {
          toast({
            title: "Secure access restored",
            description: isReauthMode 
              ? "Session unlocked. Your work has been preserved." 
              : "Elite authentication successful. Intelligence feed reconnected.",
          })
        }
        
        // Small delay to allow UI feedback, then close
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 100)
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaResend = async () => {
    if (!mfaToken || isResending) {
      return
    }

    setIsResending(true)
    setError(null)

    try {
      // Use the proper MFA resend endpoint
      const response = await fetch('/api/auth/mfa/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken: mfaToken }),
      })

      const result = await response.json()

      if (response.status === 429) {
        // Rate limited during MFA resend - show clear security message with countdown
        const retryAfter = response.headers.get('Retry-After') || '60'
        const waitTime = parseInt(retryAfter)
        
        setError(`Security Vault Activated. Too many resend attempts detected.`)
        startCountdown(waitTime)
        return
      }

      if (result.success) {
        toast({
          title: "Code resent",
          description: result.message || "A new security code has been sent to your email.",
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
    setMfaToken(null)
    setIsResending(false)
    setRateLimitSeconds(null)
    setIsReauthMode(false)
    setStoredEmail("")
    setRememberDevice(false)
    setIsLoading(false)
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
      countdownInterval.current = null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
        onClose()
      }
    }}>
      <DialogContent className={showMfa ? "sm:max-w-lg" : "sm:max-w-md"}>
        {!showMfa ? (
          // Login Form
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isReauthMode ? (
                  <Shield className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                ) : (
                  <Crown className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                )}
                {isReauthMode ? "Session Locked" : title}
              </DialogTitle>
              <DialogDescription>
                {isReauthMode 
                  ? "Your session was locked due to inactivity. Enter your password to continue where you left off." 
                  : description
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {!isReauthMode && (
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
              )}
              
              {isReauthMode && storedEmail && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Continuing as:</div>
                  <div className="p-3 bg-muted rounded-md text-sm font-medium">
                    {storedEmail}
                  </div>
                </div>
              )}

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

              {/* Remember Device Checkbox - App Theme Colors */}
              <div 
                className="flex items-center space-x-3 mt-6 p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'hsl(0 0% 3.9%)' : 'hsl(0 0% 100%)',
                  borderColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                  boxShadow: theme === 'dark' 
                    ? '0 4px 12px hsla(43, 74%, 49%, 0.15)' 
                    : '0 4px 12px hsla(0, 0%, 0%, 0.1)'
                }}
              >
                {/* Custom Checkbox - App Colors */}
                <div
                  onClick={() => !isLoading && setRememberDevice(!rememberDevice)}
                  className="cursor-pointer flex-shrink-0"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: `2px solid ${theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'}`,
                    backgroundColor: rememberDevice 
                      ? (theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)')
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {rememberDevice && (
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 16 16" 
                      fill="none"
                      style={{ 
                        color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
                      }}
                    >
                      <path 
                        d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </div>
                
                {/* Hidden input for form compatibility */}
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={isLoading}
                  style={{ display: 'none' }}
                />
                
                <label 
                  htmlFor="rememberDevice" 
                  onClick={() => !isLoading && setRememberDevice(!rememberDevice)}
                  className="cursor-pointer select-none flex-1 text-sm font-semibold"
                  style={{ color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)' }}
                >
                  🔒 Remember this device for 7 days
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                  {rateLimitSeconds !== null && (
                    <div className="mt-2 text-xs text-red-400">
                      Please try again in {rateLimitSeconds} second{rateLimitSeconds !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleClose()
                    onClose()
                  }}
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
                      {isReauthMode ? "Unlocking..." : "Signing in..."}
                    </>
                  ) : (
                    isReauthMode ? "Unlock Session" : "Sign In"
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

            <div className="mt-4 space-y-6">
              <MfaCodeInput
                onSubmit={handleMfaSubmit}
                onResend={handleMfaResend}
                isLoading={isLoading}
                isResending={isResending}
                error={error}
              />

              
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowMfa(false)
                    setMfaToken(null)
                    setError(null)
                    setIsLoading(false)
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