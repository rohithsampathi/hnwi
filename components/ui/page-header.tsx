// components/ui/page-header.tsx
// Dynamic page header component that shows based on current route

"use client"

import { ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import type { PageHeaderConfig } from "@/lib/page-headers"

interface PageHeaderProps {
  config: PageHeaderConfig
  onBack?: () => void
  onNavigate?: (route: string) => void
  className?: string
}

export function PageHeader({ 
  config, 
  onBack, 
  onNavigate, 
  className 
}: PageHeaderProps) {
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
    <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-0">
      {config.showBackButton && (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="bg-background border-border text-foreground hover:bg-muted hover:text-foreground shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
      
      <div className="mb-0">
        <div className="flex items-center gap-3 mb-1">
          <Crown className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {config.title}
          </h1>
        </div>
        {config.description && (
          <p className="text-muted-foreground text-sm ml-9 mb-0">
            {config.description}
          </p>
        )}
      </div>
      <div className="border-b border-border/30 mt-3 mb-6" />
    </div>
  )
}