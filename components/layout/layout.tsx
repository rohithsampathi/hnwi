// components/layout/layout.tsx

"use client"

import type { ReactNode } from "react"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { FooterNavigation } from "../dashboard/footer-navigation"
import { ThemeToggle } from "../theme-toggle"
import { BusinessModeToggle } from "../business-mode-toggle"
import { BusinessModeBanner } from "../business-mode-banner"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface LayoutProps {
  children: ReactNode
  title: string | ReactNode
  showBackButton?: boolean
  onNavigate: (route: string) => void
}

export function Layout({ children, title, showBackButton = false, onNavigate }: LayoutProps) {
  const { theme } = useTheme()

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate("dashboard")
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate("back")
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-background text-foreground"
    >
      <header
        className="p-2 md:p-6 flex justify-between items-center relative z-20 bg-background border-b border-border"
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-4">
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="mr-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              <motion.div
                className="mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Image src="/logo.png" alt="HNWI Chronicles Globe" width={24} height={24} className="md:w-8 md:h-8" />
              </motion.div>
              <h1
                className={`text-xl md:text-2xl font-bold font-heading`}
              >
                <span className="text-primary">HNWI</span>{" "}
                <span className="text-secondary">CHRONICLES</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <BusinessModeToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <BusinessModeBanner />
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      <FooterNavigation onNavigate={onNavigate} />
    </div>
  )
}