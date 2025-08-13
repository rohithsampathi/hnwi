"use client"

import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/theme-context"

interface PremiumBadgeProps {
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "destructive"
  className?: string
}

export function PremiumBadge({ 
  children, 
  variant = "secondary", 
  className = "" 
}: PremiumBadgeProps) {
  const { theme } = useTheme()
  
  // Premium badge styling with proper contrast
  const premiumStyles = {
    light: "bg-black/10 text-black border-black/20 hover:bg-black/15 hover:text-black",
    dark: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 hover:text-primary"
  }
  
  return (
    <Badge 
      variant={variant}
      className={`text-xs font-normal transition-all duration-200 ${
        premiumStyles[theme]
      } ${className}`}
    >
      {children}
    </Badge>
  )
}