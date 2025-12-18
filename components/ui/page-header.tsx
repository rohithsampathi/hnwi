// components/ui/page-header.tsx
// Dynamic page header component that shows based on current route

"use client"

import { ArrowLeft, Crown, Brain, Gem, Globe, Users, Beaker, UserCircle2, BookOpen, Shield, MessageSquare, Bot, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  
  // Map routes to their specific icons
  const getPageIcon = () => {
    if (pathname.includes('/dashboard')) return Brain
    if (pathname.includes('/prive-exchange')) return Gem
    if (pathname.includes('/hnwi-world') || pathname.includes('/strategy-vault')) return Globe
    if (pathname.includes('/crown-vault')) return Crown
    if (pathname.includes('/social-hub')) return Users
    if (pathname.includes('/ask-rohith')) return Bot
    if (pathname.includes('/tactics-lab') || pathname.includes('/strategy-engine')) return Beaker
    if (pathname.includes('/profile')) return UserCircle2
    if (pathname.includes('/playbooks')) return BookOpen
    if (pathname.includes('/trusted-network')) return Network
    // Default to Crown for any other pages
    return Crown
  }
  
  const PageIcon = getPageIcon()

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
    <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-0">
      {config.showBackButton && (
        <div className="mb-2">
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
        <div className="flex items-center gap-2 mb-1">
          <PageIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {config.title}
          </h1>
        </div>
        {config.description && (
          <p className="text-muted-foreground text-sm ml-7 mb-0">
            {config.description}
          </p>
        )}
      </div>
      <div className="border-b border-border/30 mt-2 mb-4" />
    </div>
  )
}