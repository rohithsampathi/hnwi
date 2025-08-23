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
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (value: string, index: number) => {
    // Only allow alphanumeric characters (excluding confusing ones)
    const cleanValue = value.replace(/[^A-HJ-NP-UW-Z2-9]/gi, '').toUpperCase()
    
    if (cleanValue.length <= 1) {
      const newCode = code.split('')
      newCode[index] = cleanValue
      const updatedCode = newCode.join('')
      setCode(updatedCode)

      // Auto-focus next input
      if (cleanValue && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }

      // Auto-submit when all 6 digits are entered
      if (updatedCode.length === 6 && updatedCode.replace(/\s/g, '').length === 6) {
        handleSubmit(updatedCode)
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
    const pastedText = e.clipboardData.getData('text').replace(/[^A-HJ-NP-UW-Z2-9]/gi, '').toUpperCase()
    if (pastedText.length === 6) {
      setCode(pastedText)
      inputRefs.current[5]?.focus()
      // Auto-submit pasted code
      setTimeout(() => handleSubmit(pastedText), 100)
    }
  }

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code
    if (finalCode.length === 6) {
      await onSubmit(finalCode)
    }
  }

  const handleResend = async () => {
    if (canResend && !isResending) {
      await onResend()
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Shield className={`h-8 w-8 ${theme === "dark" ? "text-primary" : "text-black"}`} />
        </div>
        <h2 className="text-xl font-semibold">Elite Authentication</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
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
            disabled={isLoading}
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
          disabled={code.length !== 6 || isLoading}
          className={`w-full h-12 text-lg rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
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