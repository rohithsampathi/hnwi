"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Shield, RefreshCw } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"

interface MfaCodeInputProps {
  onSubmit?: (code: string) => Promise<void> | void
  onComplete?: (code: string) => void
  onResend?: () => Promise<void> | void
  isLoading?: boolean
  isResending?: boolean
  error?: string | null
  className?: string
  disabled?: boolean
}

export function MfaCodeInput({ 
  onSubmit, 
  onComplete,
  onResend, 
  isLoading = false, 
  isResending = false,
  error,
  className = "",
  disabled = false
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
    if (isSubmitting || isLoading || disabled || finalCode.length !== 6 || lastSubmittedCodeRef.current === finalCode) {
      return
    }

    // Set submitting state and track the code being submitted
    setIsSubmitting(true)
    lastSubmittedCodeRef.current = finalCode

    try {
      if (onSubmit) {
        await onSubmit(finalCode)
      } else {
        onComplete?.(finalCode)
      }
    } catch (error) {
      // Reset on error so user can retry
      lastSubmittedCodeRef.current = ""
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (canResend && !isResending && onResend) {
      // Reset submission tracking when getting a new code
      lastSubmittedCodeRef.current = ""
      setCode("")
      await onResend()
    }
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Code Input Label */}
      <div className="text-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-2 mb-3 sm:mb-4 flex-wrap">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
          <span className="text-center">Enter the 6-digit security code sent to your email</span>
        </p>
      </div>

      {/* Code Input Grid - Responsive sizing */}
      <div className="flex justify-center gap-1.5 sm:gap-2 md:gap-3 px-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            maxLength={1}
            value={code[index] || ''}
            onChange={(e) => handleCodeChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled || isLoading || isSubmitting}
            className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 text-center text-base sm:text-lg font-mono border-2 transition-all duration-200 flex-shrink-0 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 focus:border-primary"
                : "bg-white border-gray-300 focus:border-black"
            } ${code[index] ? 'border-green-500' : ''}`}
            placeholder="•"
          />
        ))}
      </div>

      {/* Timer and Status */}
      <div className="text-center space-y-2 px-2">
        <div className={`text-xs sm:text-sm font-medium ${timeLeft > 60 ? 'text-green-600' : timeLeft > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
          {timeLeft > 0 ? (
            <span>Code expires in {formatTime(timeLeft)}</span>
          ) : (
            <span>Code has expired</span>
          )}
        </div>

        {error && (
          <div className="text-xs sm:text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 sm:p-3 rounded-md break-words">
            {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:gap-3 px-2">
        <Button
          onClick={() => handleSubmit()}
          disabled={disabled || code.length !== 6 || isLoading || isSubmitting}
          className={`w-full h-11 sm:h-12 text-base sm:text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
            theme === "dark"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-black text-white hover:bg-black/90"
          }`}
        >
          {(isLoading || isSubmitting) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
              <span className="truncate">Verifying...</span>
            </>
          ) : (
            <span className="truncate">Verify Code</span>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={disabled || !canResend || isResending || !onResend}
          className={`w-full h-10 sm:h-11 text-sm sm:text-base transition-all duration-200 ${
            canResend && !isResending
              ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isResending ? (
            <>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin flex-shrink-0" />
              <span className="truncate">Sending...</span>
            </>
          ) : canResend ? (
            <>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Resend Code</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Resend in {formatTime(timeLeft)}</span>
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-[10px] sm:text-xs text-center text-gray-500 space-y-1 px-4">
        <p className="break-words">Didn't receive the code? Check your spam folder.</p>
        <p className="break-words">Code format: 6 alphanumeric characters (A1B2C3)</p>
      </div>
    </div>
  )
}
