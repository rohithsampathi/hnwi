// components/layout/layout.tsx

"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { SidebarNavigation } from "../dashboard/sidebar-navigation"
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
  sidebarCollapsed?: boolean
}

export function Layout({ children, title, showBackButton = false, onNavigate, sidebarCollapsed = true }: LayoutProps) {
  const { theme } = useTheme()
  const { showBanner } = useBusinessMode()
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [sidebarState, setSidebarState] = useState(true) // Track sidebar collapse state
  const [isDesktop, setIsDesktop] = useState(false) // Track if desktop
  const headerRef = useRef<HTMLElement>(null)

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Calculate header height dynamically
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        const bannerHeight = showBanner ? 52 : 0 // Business banner height when visible
        setHeaderHeight(rect.height + bannerHeight)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [showBanner])

  // Trigger heartbeat animation every 10 seconds (after each rotation at 6 RPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHeartbeat(true)
      setTimeout(() => setShowHeartbeat(false), 1000) // Heartbeat lasts 1 second
    }, 10000) // Every 10 seconds (6 RPM = 1 rotation per 10 seconds)

    return () => clearInterval(interval)
  }, [])

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
      {/* Sidebar for desktop */}
      <SidebarNavigation 
        onNavigate={onNavigate} 
        headerHeight={headerHeight} 
        onSidebarToggle={setSidebarState}
        showBackButton={showBackButton}
      />
      
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-30 p-3 md:p-6 flex justify-between items-center bg-background border-b border-border"
      >
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-4">
          <div className="flex items-center">
            {/* Mobile Logo and Text - Only visible on mobile */}
            <div className="md:hidden flex items-center cursor-pointer" onClick={handleLogoClick}>
              <motion.div
                className="mr-3"
                animate={{ 
                  rotate: 360,
                  scale: showHeartbeat ? [1, 1.2, 1, 1.15, 1] : 1
                }}
                transition={{ 
                  rotate: { 
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY, 
                    ease: "linear" 
                  },
                  scale: showHeartbeat ? {
                    duration: 1,
                    times: [0, 0.3, 0.5, 0.8, 1],
                    ease: "easeInOut"
                  } : {
                    duration: 0
                  }
                }}
              >
                <Image 
                  src="/logo.png" 
                  alt="HNWI Chronicles Globe" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8" 
                  priority 
                />
              </motion.div>
              <h1 className="text-sm font-bold font-heading leading-tight">
                <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>HNWI</span>{" "}
                <span className={`${theme === "dark" ? "text-[#C0C0C0]" : "text-[#888888]"}`}>CHRONICLES</span>
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
      
      <main 
        className={`flex-grow p-4 md:p-6 lg:p-8 space-y-2 md:space-y-4 overflow-y-auto pb-20 md:pb-4 transition-all duration-300`}
        style={{ 
          paddingTop: `${Math.max(headerHeight + 16, 96)}px`,
          marginLeft: isDesktop ? (sidebarState ? '64px' : '256px') : '0' // Desktop only
        }}
      >
        <div className="max-w-7xl mx-auto w-full pb-20 md:pb-0">
          {title && (
            <div className="mb-2 pb-0 border-b border-border">
              <div className="flex items-center gap-2">
                {title}
              </div>
            </div>
          )}
          {children}
        </div>
      </main>

    </div>
  )
}