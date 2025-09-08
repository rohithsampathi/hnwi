// components/ui/page-layout.tsx
// Enhanced centralized layout component with consistent header, title, and back button

"use client"

import type { ReactNode } from "react"
import { ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  showBackButton?: boolean
  onBack?: () => void
  onNavigate?: (route: string) => void
  className?: string
  headerChildren?: ReactNode
}

export function PageLayout({ 
  children, 
  title,
  description,
  showBackButton = true,
  onBack,
  onNavigate,
  className,
  headerChildren
}: PageLayoutProps) {
  const { theme } = useTheme()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (onNavigate) {
      onNavigate('dashboard')
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className={cn("pt-20 px-4 sm:px-6 lg:px-8", className)}>
      {(title || showBackButton || headerChildren) && (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {showBackButton && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className={cn(
                    "mb-4 -ml-2 inline-flex items-center gap-2 font-medium transition-all duration-200",
                    "hover:scale-105 focus:scale-105",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              {title && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Crown className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {title}
                    </h1>
                  </div>
                  {description && (
                    <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {headerChildren && (
              <div className="flex items-center gap-2">
                {headerChildren}
              </div>
            )}
          </div>
          
          {title && <div className="mt-6 border-b border-border/50" />}
        </div>
      )}
      
      <div className="pb-12 md:pb-6">
        {children}
      </div>
    </div>
  )
}

// Simplified page wrapper for pages that don't need titles/headers
export function SimplePageWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("pt-20", className)}>
      {children}
    </div>
  )
}