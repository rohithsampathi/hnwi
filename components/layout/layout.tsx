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
import { useRouter, usePathname } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { getPageHeader } from "@/lib/page-headers"

interface LayoutProps {
  children: ReactNode
  title: string | ReactNode
  showBackButton?: boolean
  onNavigate: (route: string) => void
  sidebarCollapsed?: boolean
  currentPage?: string
}

export function Layout({ children, title, showBackButton = false, onNavigate, sidebarCollapsed: initialSidebarCollapsed = true, currentPage = "" }: LayoutProps) {
  const { theme } = useTheme()
  const { showBanner } = useBusinessMode()
  const { isCenterOpen, setCenterOpen } = useNotificationContext()
  const router = useRouter()
  const pathname = usePathname()
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [user, setUser] = useState<any>(null)
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

  // Calculate header height dynamically with fallback
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        const bannerHeight = showBanner ? 52 : 0
        const calculatedHeight = rect.height + bannerHeight
        // Ensure minimum height and add safety buffer
        setHeaderHeight(Math.max(calculatedHeight + 20, 80))
      } else {
        // Fallback if header ref is not available
        setHeaderHeight(80)
      }
    }

    // Initial calculation
    updateHeaderHeight()
    
    // Delay calculation to ensure DOM is ready
    const timeoutId = setTimeout(updateHeaderHeight, 100)
    
    window.addEventListener('resize', updateHeaderHeight)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [showBanner])

  // Trigger heartbeat animation every 10 seconds (after each rotation at 6 RPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHeartbeat(true)
      setTimeout(() => setShowHeartbeat(false), 1000) // Heartbeat lasts 1 second
    }, 10000) // Every 10 seconds (6 RPM = 1 rotation per 10 seconds)

    return () => clearInterval(interval)
  }, [])

  // Load user data from localStorage
  useEffect(() => {
    const userObject = localStorage.getItem("userObject")
    if (userObject) {
      try {
        const parsedUser = JSON.parse(userObject)
        setUser(parsedUser)
      } catch (e) {
      }
    }
  }, [])

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.back()
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-background text-foreground p-0 m-0"
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
        className={`fixed top-0 z-50 p-0 md:p-1 flex justify-between items-center bg-background border-b border-border transition-all duration-300`}
        style={{
          left: isDesktop 
            ? (sidebarState ? '64px' : '256px') : '0',
          right: '0'
        }}
      >
        <div 
          className="w-full flex justify-between items-center pl-0 pr-2 py-1"
        >
          <div className="flex items-center">
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            {/* <BusinessModeToggle /> */}
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div 
        className="transition-all duration-300 absolute w-full"
        style={{
          left: isDesktop 
            ? (sidebarState ? '64px' : '256px') : '0',
          right: '0'
        }}
      >
        <BusinessModeBanner />
      </div>
      
      {/* Sticky Page Header */}
      {(() => {
        const pageHeaderConfig = getPageHeader(pathname, user)
        if (pageHeaderConfig) {
          return (
            <div 
              className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border"
              style={{ 
                marginLeft: isDesktop 
                  ? (sidebarState ? '64px' : '256px') : '0'
              }}
            >
              <PageHeader 
                config={pageHeaderConfig}
                onNavigate={onNavigate}
              />
            </div>
          )
        }
        return null
      })()}

      <main 
        className={`flex-grow overflow-y-auto scrollbar-hide pb-12 md:pb-1 transition-all duration-300`}
        style={{ 
          marginLeft: isDesktop 
            ? (sidebarState ? '64px' : '256px') : '0',
          filter: isDesktop && !sidebarState ? 'blur(2px)' : 'none',
          opacity: isDesktop && !sidebarState ? 0.6 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        <div className="w-full pb-12 md:pb-0">
          {/* Legacy title support for existing pages */}
          {title && !getPageHeader(pathname, user) && (
            <div className="mb-4 pb-4 border-b border-border" style={{paddingLeft: '0px', paddingRight: '4px'}}>
              <div className="flex items-center gap-2">
                {title}
              </div>
            </div>
          )}
          
          <div className={getPageHeader(pathname, user) && !pathname.includes('/dashboard') ? 'px-8 sm:px-6 lg:px-8 -mt-1' : 'px-8'} style={{
            paddingLeft: getPageHeader(pathname, user) && !pathname.includes('/dashboard') ? '' : '', 
            paddingRight: getPageHeader(pathname, user) && !pathname.includes('/dashboard') ? '' : '', 
            paddingTop: getPageHeader(pathname, user) ? '8px' : '16px',
            marginTop: getPageHeader(pathname, user) ? '' : '0px'
          }}>
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