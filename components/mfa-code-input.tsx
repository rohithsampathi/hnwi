"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield, RefreshCw } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface MfaCodeInputProps {
  onSubmit: (code: string) => Promise<void>
  onResend: () => Promise<void>
  isLoading?: boolean
  isResending?: boolean
  error?: string | null
  className?: string
}

export function MfaCodeInput({ 
  onSubmit, 
  onResend, 
  isLoading = false, 
  isResending = false,
  error,
  className = ""
}: MfaCodeInputProps) {
  const { theme } = useTheme()
  const [code, setCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSubmittedCodeRef = useRef<string>("")

  // Initialize timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Reset timer when resending
  useEffect(() => {
    if (isResending) {
      setTimeLeft(300)
      setCanResend(false)
    }
  }, [isResending])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (value: string, index: number) => {
    // Only allow alphanumeric characters (excluding confusing ones: I, O, 0, 1)
    const cleanValue = value.replace(/[^A-HJ-NP-UVW-Z2-9]/gi, '').toUpperCase()
    
    if (cleanValue.length <= 1) {
      const newCode = code.split('')
      newCode[index] = cleanValue
      const updatedCode = newCode.join('')
      setCode(updatedCode)

      // Reset last submitted code when user modifies the code
      if (lastSubmittedCodeRef.current && updatedCode !== lastSubmittedCodeRef.current) {
        lastSubmittedCodeRef.current = ""
      }

      // Auto-focus next input
      if (cleanValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }

      // Auto-submit when all 6 digits are entered (debounced)
      if (updatedCode.length === 6 && updatedCode.replace(/\s/g, '').length === 6) {
        // Clear any existing timeout
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current)
        }
        // Debounce the submission to prevent double-submits
        submitTimeoutRef.current = setTimeout(() => {
          handleSubmit(updatedCode)
        }, 150)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newCode = code.split('')
        newCode[index] = ''
        setCode(newCode.join(''))
      }
    }
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text').replace(/[^A-HJ-NP-UVW-Z2-9]/gi, '').toUpperCase()
    if (pastedText.length === 6) {
      setCode(pastedText)
      inputRefs.current[5]?.focus()
      // Auto-submit pasted code (debounced)
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
      submitTimeoutRef.current = setTimeout(() => {
        handleSubmit(pastedText)
      }, 200)
    }
  }

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code
    
    // Prevent submission if already submitting or if this code was already submitted
    if (isSubmitting || isLoading || finalCode.length !== 6 || lastSubmittedCodeRef.current === finalCode) {
      return
    }

    // Set submitting state and track the code being submitted
    setIsSubmitting(true)
    lastSubmittedCodeRef.current = finalCode

    try {
      await onSubmit(finalCode)
    } catch (error) {
      // Reset on error so user can retry
      lastSubmittedCodeRef.current = ""
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (canResend && !isResending) {
      // Reset submission tracking when getting a new code
      lastSubmittedCodeRef.current = ""
      setCode("")
      await onResend()
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Code Input Label */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          Enter the 6-digit security code sent to your email
        </p>
      </div>

      {/* Code Input Grid */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            maxLength={1}
            value={code[index] || ''}
            onChange={(e) => handleCodeChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isLoading || isSubmitting}
            className={`w-12 h-12 text-center text-lg font-mono border-2 transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 focus:border-primary"
                : "bg-white border-gray-300 focus:border-black"
            } ${code[index] ? 'border-green-500' : ''}`}
            placeholder="•"
          />
        ))}
      </div>

      {/* Timer and Status */}
      <div className="text-center space-y-2">
        <div className={`text-sm ${timeLeft > 60 ? 'text-green-600' : timeLeft > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
          {timeLeft > 0 ? (
            <>Code expires in {formatTime(timeLeft)}</>
          ) : (
            <>Code has expired</>
          )}
        </div>
        
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => handleSubmit()}
          disabled={code.length !== 6 || isLoading || isSubmitting}
          className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
            theme === "dark" 
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-black text-white hover:bg-black/90"
          }`}
        >
          {(isLoading || isSubmitting) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className={`w-full transition-all duration-200 ${
            canResend && !isResending
              ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : canResend ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend Code
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend in {formatTime(timeLeft)}
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-center text-gray-500 space-y-1">
        <p>Didn't receive the code? Check your spam folder.</p>
        <p>Code format: 6 alphanumeric characters (A1B2C3)</p>
      </div>
    </div>
  )
}