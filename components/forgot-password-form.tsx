"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { ChevronLeft, Loader2, Mail } from "lucide-react"
import { handleForgotPassword } from "@/lib/auth-actions"

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await handleForgotPassword(email)
      
      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Reset Email Sent",
          description: "If an account exists with this email, you'll receive reset instructions",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send reset email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card backdrop-blur-sm rounded-3xl p-6 md:p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            theme === "dark" ? "bg-primary/20" : "bg-green-100"
          }`}>
            <Mail className={`w-8 h-8 ${theme === "dark" ? "text-primary" : "text-green-600"}`} />
          </div>
          <Heading2 className="text-2xl font-bold text-center">
            Check Your Email
          </Heading2>
        </div>

        <div className="text-center space-y-4 mb-6">
          <Paragraph className="text-muted-foreground">
            If an account exists with <strong>{email}</strong>, you'll receive password reset instructions.
          </Paragraph>
          <Paragraph className="text-sm text-muted-foreground">
            Check your email and click the reset link. It will expire in 1 hour.
          </Paragraph>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            Back to Login
          </Button>
          
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setEmail("")
            }}
            variant="ghost"
            className="w-full text-sm"
          >
            Send to Different Email
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-card backdrop-blur-sm rounded-3xl p-6 md:p-8"
    >
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-sm rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex flex-col items-center mb-6 mt-8">
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
          Forgot Password?
        </Heading2>
        <Paragraph className="text-sm text-muted-foreground text-center mt-2">
          Enter your email and we'll send you reset instructions
        </Paragraph>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-3xl font-body bg-input text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            required
            disabled={isLoading}
          />
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
              Sending...
            </>
          ) : (
            "Send Reset Email"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Paragraph className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <span 
            onClick={onBack}
            className="text-primary hover:underline cursor-pointer"
          >
            Back to Login
          </span>
        </Paragraph>
      </div>
    </motion.div>
  )
}