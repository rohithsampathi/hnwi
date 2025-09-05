// components/layout/layout.tsx

"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { SidebarNavigation } from "../dashboard/sidebar-navigation"
import { ThemeToggle } from "../theme-toggle"
// import { BusinessModeToggle } from "../business-mode-toggle"
import { BusinessModeBanner } from "../business-mode-banner"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { useNotificationContext } from "@/contexts/notification-context"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { navigate as unifiedNavigate, useNewNavigation } from "@/lib/unified-navigation"

interface LayoutProps {
  children: ReactNode
  title: string | ReactNode
  showBackButton?: boolean
  onNavigate: (route: string) => void
  sidebarCollapsed?: boolean
  currentPage?: string
}

export function Layout({ children, title, showBackButton = false, onNavigate, sidebarCollapsed = true, currentPage = "" }: LayoutProps) {
  const { theme } = useTheme()
  const { showBanner } = useBusinessMode()
  const { isCenterOpen, setCenterOpen } = useNotificationContext()
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [sidebarState, setSidebarState] = useState(true) // Track sidebar collapse state (true = collapsed)
  const [isDesktop, setIsDesktop] = useState(false) // Track if desktop
  const [isTablet, setIsTablet] = useState(false) // Track if tablet
  const headerRef = useRef<HTMLElement>(null)

  // Check screen sizes - desktop/tablet logic
  useEffect(() => {
    const checkScreenSizes = () => {
      const width = window.innerWidth
      
      // Desktop: anything >= 768px (md breakpoint and above)
      setIsDesktop(width >= 768)
      
      // Tablet: md and up but below desktop large breakpoint (768px - 1280px)
      setIsTablet(width >= 768 && width < 1280)
    }
    checkScreenSizes()
    window.addEventListener('resize', checkScreenSizes)
    return () => window.removeEventListener('resize', checkScreenSizes)
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
    // Use unified navigation system - automatically routes to active system
    if (useNewNavigation()) {
      // New system: use unified navigation
      unifiedNavigate("dashboard")
    } else {
      // Legacy system: use onNavigate prop
      onNavigate("dashboard")
    }
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Use unified navigation system - automatically routes to active system
    if (useNewNavigation()) {
      // New system: use unified navigation
      unifiedNavigate("back")
    } else {
      // Legacy system: use onNavigate prop
      onNavigate("back")
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-background text-foreground"
    >
      {/* Sidebar for all devices - mobile only shows bottom nav */}
      <SidebarNavigation 
        onNavigate={onNavigate} 
        headerHeight={headerHeight} 
        onSidebarToggle={setSidebarState}
        showBackButton={showBackButton}
        currentPage={currentPage}
      />
      
      <header
        ref={headerRef}
        className={`fixed top-0 z-50 p-0 md:p-2 flex justify-between items-center bg-background border-b border-border transition-all duration-300`}
        style={{
          left: isDesktop 
            ? (sidebarState ? '64px' : '256px') // Desktop: always push header
            : '0',
          right: '0'
        }}
      >
        <div 
          className="max-w-7xl mx-auto w-full flex justify-between items-center px-3 py-1 md:px-4"
        >
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
            {/* <BusinessModeToggle /> */}
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div 
        className="transition-all duration-300"
        style={{
          marginLeft: isDesktop 
            ? (sidebarState ? '64px' : '256px') // Desktop: always push banner
            : '0'
        }}
      >
        <BusinessModeBanner />
      </div>
      
      <main 
        className="flex-grow px-0 py-4 md:p-6 lg:p-8 space-y-2 md:space-y-4 overflow-y-auto pb-12 md:pb-4 transition-all duration-300"
        style={{ 
          paddingTop: `${Math.max(headerHeight + 16, 96)}px`,
          marginLeft: isDesktop 
            ? (sidebarState ? '64px' : '256px') // Desktop: always push content next to sidebar
            : '0' // Mobile/Tablet: no margin (sidebar overlays)
        }}
      >
        <div className={`${title ? 'max-w-7xl md:mx-auto' : 'w-full'} pb-12 md:pb-0`}>
          {title && (
            <div className="mb-2 pb-0 border-b border-border pl-5 pr-0 md:px-0">
              <div className="flex items-center gap-2">
                {title}
              </div>
            </div>
          )}
          <div className={title ? 'pl-5 pr-0 md:px-0' : 'pl-5'}>
            {children}
          </div>
        </div>
      </main>

      {/* Notification Center Modal */}
      {isCenterOpen && (
        <NotificationCenter onClose={() => setCenterOpen(false)} />
      )}

    </div>
  )
}