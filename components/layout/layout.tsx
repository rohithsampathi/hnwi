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
      className={`min-h-screen flex flex-col font-montserrat ${
        theme === "dark" ? "bg-[#121212] text-white" : "bg-[#F5F5F5] text-[#212121]"
      }`}
    >
      <header
        className={`p-2 md:p-4 flex justify-between items-center relative z-20 ${
          theme === "dark"
            ? "bg-[#121212] shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1),_0_2px_4px_-1px_rgba(255,255,255,0.06)]"
            : "bg-[#F5F5F5] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)]"
        }`}
      >
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className={`mr-2 ${
                theme === "dark"
                  ? "text-[#BBDEFB] hover:text-white hover:bg-[#1A1A1A]"
                  : "text-[#424242] hover:text-[#212121] hover:bg-[#E0E0E0]"
              }`}
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
              className={`text-base md:text-lg font-bold font-heading ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              HNWI Chronicles
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <BusinessModeToggle />
          <ThemeToggle />
        </div>
      </header>

      <BusinessModeBanner />
      
      <main className="flex-grow p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">{children}</main>

      <FooterNavigation onNavigate={onNavigate} />
    </div>
  )
}