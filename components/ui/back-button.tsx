"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  onClick?: () => void
  onNavigate?: (route: string) => void
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  title?: string
  disabled?: boolean
}

export function BackButton({ 
  onClick, 
  onNavigate, 
  className,
  variant = "ghost",
  size = "md",
  title = "Back",
  disabled = false
}: BackButtonProps) {
  const { theme } = useTheme()
  
  const handleClick = () => {
    if (disabled) return
    
    if (onClick) {
      onClick()
    } else if (onNavigate) {
      // Navigate back to dashboard/home
      onNavigate('dashboard')
    } else if (typeof window !== 'undefined') {
      // Fallback to browser back
      window.history.back()
    }
  }

  const sizeClasses = {
    sm: "h-8 px-2 text-sm",
    md: "h-10 px-3",
    lg: "h-12 px-4 text-lg"
  }

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-all duration-200",
        "hover:scale-105 focus:scale-105",
        sizeClasses[size],
        theme === "dark" 
          ? "text-muted-foreground hover:text-black" 
          : "text-muted-foreground hover:text-white",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
    >
      <ArrowLeft className={cn(
        "transition-transform duration-200", 
        size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"
      )} />
      {title}
    </Button>
  )
}

// Utility component for consistent back button with page title
interface PageHeaderWithBackProps {
  title: string
  description?: string
  onNavigate?: (route: string) => void
  onBack?: () => void
  className?: string
  children?: React.ReactNode
  showBackButton?: boolean
}

export function PageHeaderWithBack({
  title,
  description,
  onNavigate,
  onBack,
  className,
  children,
  showBackButton = true
}: PageHeaderWithBackProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showBackButton && (
        <BackButton onNavigate={onNavigate} onClick={onBack} />
      )}
      {children}
      {description && (
        <p className="text-muted-foreground text-base leading-tight">
          {description}
        </p>
      )}
    </div>
  )
}