"use client"

// =============================================================================
// REPORT AUTH POPUP — "Encrypted Document" Login + MFA
// Pattern matches auth-popup.tsx session-expired flow
// Used on Decision Memo viewer pages when backend returns 401
// =============================================================================

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Loader2, Lock, Eye, EyeOff, Shield } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { MfaCodeInput } from "@/components/mfa-code-input"

const REPORT_AUTH_API = "/api/decision-memo/auth"

interface ReportAuthPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: string, rememberDevice: boolean) => void
  intakeId: string
}

export function ReportAuthPopup({
  isOpen,
  onClose,
  onSuccess,
  intakeId
}: ReportAuthPopupProps) {
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
  const [rememberDevice, setRememberDevice] = useState(true)

  const countdownInterval = useRef<NodeJS.Timeout | null>(null)

  const startCountdown = (seconds: number) => {
    setRateLimitSeconds(seconds)
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
          setError(null)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
    }
  }, [])

  // ─── Step 1: Email + Password ─────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (isLoading) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${REPORT_AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: intakeId,
          email,
          password
        })
      })

      if (response.status === 429) {
        setError("Too many attempts. Please wait before trying again.")
        startCountdown(60)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Invalid credentials")
        return
      }

      if (data.requires_mfa) {
        // Step 1 passed — show MFA input
        setMfaToken(data.mfa_token)
        setShowMfa(true)
        toast({
          title: "Verification code sent",
          description: data.message || "Check your email for the 6-digit code."
        })
      } else if (data.token) {
        // Direct access (no MFA) — shouldn't normally happen but handle it
        completeAuth(data.token)
      }
    } catch (err) {
      setError("Connection error. Please check your internet and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step 2: MFA Code Verification ────────────────────────────────────────

  const handleMfaSubmit = async (code: string) => {
    if (!mfaToken) {
      setError("Invalid session. Please try logging in again.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${REPORT_AUTH_API}/report-mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: intakeId,
          email,
          mfa_code: code,
          mfa_token: mfaToken,
          remember_device: rememberDevice
        })
      })

      if (response.status === 429) {
        setError("Too many attempts. Please wait before trying again.")
        startCountdown(60)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || "Invalid verification code")
        return
      }

      if (data.success && data.token) {
        completeAuth(data.token)
      } else {
        setError("Verification failed. Please try again.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMfaResend = async () => {
    if (!mfaToken || isResending) return

    setIsResending(true)
    setError(null)

    try {
      const response = await fetch(`${REPORT_AUTH_API}/report-mfa/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: intakeId,
          email,
          mfa_token: mfaToken
        })
      })

      const data = await response.json()

      if (response.status === 429) {
        setError("Too many resend attempts. Please wait.")
        startCountdown(60)
        return
      }

      if (data.success) {
        toast({
          title: "Code resent",
          description: data.message || "A new verification code has been sent."
        })
      } else {
        setError(data.detail || "Failed to resend code")
      }
    } catch (err) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  // ─── Auth Completion ───────────────────────────────────────────────────────

  const completeAuth = (token: string) => {
    toast({
      title: "Document unlocked",
      description: "Encrypted document access verified."
    })

    setTimeout(() => {
      handleClose()
      onSuccess(token, rememberDevice)
    }, 100)
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
    setIsLoading(false)
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
      countdownInterval.current = null
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
          onClose()
        }
      }}
    >
      <DialogContent className={showMfa ? "sm:max-w-lg" : "sm:max-w-md"}>
        {!showMfa ? (
          // ── Login Form ──
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                Encrypted Document
              </DialogTitle>
              <DialogDescription>
                This document is protected. Enter your credentials to access the full Decision Posture Audit.
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
                  autoFocus
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

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  Remember on this device for 7 days
                </span>
              </label>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                  {rateLimitSeconds !== null && (
                    <div className="mt-2 text-xs text-red-400">
                      Please try again in {rateLimitSeconds} second{rateLimitSeconds !== 1 ? "s" : ""}
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
                      Verifying...
                    </>
                  ) : (
                    "Login to Continue"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          // ── MFA Code Input ──
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                Security Verification
              </DialogTitle>
              <DialogDescription>
                Enter the 6-digit code sent to your email to access the encrypted document.
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
            </div>

            <div className="flex mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowMfa(false)
                  setMfaToken(null)
                  setError(null)
                }}
                disabled={isLoading}
                className="text-sm text-muted-foreground"
              >
                Back to login
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
