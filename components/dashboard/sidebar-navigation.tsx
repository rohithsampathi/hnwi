// components/dashboard/sidebar-navigation.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Brain, Crown, UserCircle2, Globe, Gem, Menu, X, ChevronLeft, Info, MoreHorizontal, Shield, Users, BookOpen, Beaker, MessageSquare, Bot, ChevronDown, ChevronUp, ChevronRight, Network } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { motion } from "framer-motion"
import { getMemberAnalytics, type MemberAnalytics } from "@/lib/api"
import { useRouter } from "next/navigation"

export function SidebarNavigation({
  onNavigate,
  headerHeight = 0,
  onSidebarToggle,
  showBackButton = false,
  currentPage = "",
}: {
  onNavigate: (route: string) => void
  headerHeight?: number
  onSidebarToggle?: (collapsed: boolean) => void
  showBackButton?: boolean
  currentPage?: string
}) {
  const router = useRouter()
  const { theme } = useTheme()
  const { isBusinessMode } = useBusinessMode()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [showHeartbeat, setShowHeartbeat] = useState(false)
  const [isMoreExpanded, setIsMoreExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-more-expanded') === 'true'
    }
    return false
  })
  const [isTabletSize, setIsTabletSize] = useState(false)
  const [memberAnalytics, setMemberAnalytics] = useState<MemberAnalytics | null>(null)

  // Detect tablet size - md and up but below large desktop
  useEffect(() => {
    const checkTabletSize = () => {
      const width = window.innerWidth
      // Tablet: md and up but below desktop large breakpoint (768px - 1280px)
      setIsTabletSize(width >= 768 && width < 1280)
    }
    
    checkTabletSize()
    window.addEventListener('resize', checkTabletSize)
    return () => window.removeEventListener('resize', checkTabletSize)
  }, [])

  // Fetch member analytics (skip on Ask Rohith page)
  useEffect(() => {
    // Skip analytics fetch on Ask Rohith page
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (pathname.includes('/ask-rohith')) {
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const analytics = await getMemberAnalytics();
        setMemberAnalytics(analytics);
      } catch (error) {
      }
    };

    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 300000);
    return () => clearInterval(interval);
  }, []);

  // Heartbeat animation for logo
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHeartbeat(true)
      setTimeout(() => setShowHeartbeat(false), 1000)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // All navigation items with business mode flags - Reordered as requested
  const allNavItems = [
    { name: "Home", icon: Brain, route: "dashboard", businessOnly: false },
    {
      name: "Ask Rohith",
      icon: Bot,
      route: "ask-rohith",
      description: "Your private intelligence ally with full portfolio awareness and memory. Rohith listens, understands, and provides strategic insights.",
      isNew: true,
      businessOnly: false
    },
    {
      name: "Privé Exchange",
      icon: Gem,
      route: "prive-exchange",
      description: "Off-market opportunities. Member referrals only.",
      businessOnly: false
    },
    {
      name: "HNWI World",
      icon: Globe,
      route: "strategy-vault",
      description: memberAnalytics ?
        `What ${memberAnalytics.active_members_24h} members are discussing privately` :
        "Private intelligence network",
      businessOnly: false
    },
    {
      name: "Crown Vault",
      icon: Crown,
      route: "crown-vault",
      description: "Generational wealth architecture. Built for families that think in decades.",
      businessOnly: false
    },
    {
      name: "Social Hub",
      icon: Users,
      route: "social-hub",
      description: "Where the right people gather. Invitation verification required.",
      businessOnly: false
    },
    {
      name: "Executor Directory",
      icon: Network,
      route: "trusted-network",
      description: "Vetted executors for intelligence-driven action",
      businessOnly: false
    },
    // War Room - Hidden for now
    // {
    //   name: "War Room",
    //   icon: Shield,
    //   route: "war-room",
    //   description: "Playbooks and strategies for entrepreneurs to effectively grow their business empires with HNWI Pattern Intelligence tactical frameworks.",
    //   businessOnly: true
    // },
    { name: "Profile", icon: UserCircle2, route: "profile", businessOnly: false },
  ]

  // Filter nav items based on business mode
  const filteredNavItems = allNavItems.filter(item => isBusinessMode || !item.businessOnly)


  // Split filtered items into main (first 4) and additional items
  const mainNavItems = filteredNavItems.slice(0, 4)
  const additionalNavItems = filteredNavItems.slice(4)

  // Mobile bottom nav items - Updated order: Home, Ask Rohith, Privé Exchange
  const mobileNavItems = [
    { name: "Home", icon: Brain, route: "dashboard" },
    { name: "Ask Rohith", icon: Bot, route: "ask-rohith", isNew: true },
    { name: "Privé Exchange", icon: Gem, route: "prive-exchange" },
  ]

  // Additional menu items for three dots dropdown - Updated order: HNWI World, Crown Vault, Social Hub, Executor Directory, Profile
  const moreMenuItems = [
    { name: "HNWI World", icon: Globe, route: "strategy-vault" },
    { name: "Crown Vault", icon: Crown, route: "crown-vault" },
    { name: "Social Hub", icon: Users, route: "social-hub" },
    { name: "Executor Directory", icon: Network, route: "trusted-network" },
    { name: "Profile", icon: UserCircle2, route: "profile" }, // Profile moved to last
  ]

  const handleNavigate = (route: string) => {
    // Direct Next.js navigation for new route structure
    if (route === "dashboard") {
      router.push("/dashboard")
    } else if (route === "strategy-vault") {
      router.push("/hnwi-world") // HNWI World maps to hnwi-world
    } else if (route === "ask-rohith") {
      router.push("/ask-rohith")
    } else if (route === "social-hub") {
      router.push("/social-hub")
    } else if (route === "prive-exchange") {
      router.push("/prive-exchange")
    } else if (route === "crown-vault") {
      router.push("/crown-vault")
    } else if (route === "trusted-network") {
      router.push("/trusted-network")
    } else if (route === "calendar-page") {
      router.push("/calendar")
    } else if (route === "profile") {
      router.push("/profile")
    } else if (route === "playbooks") {
      router.push("/playbooks")
    } else {
      // For other routes, try direct navigation
      router.push(`/${route}`)
    }
  }

  const handleToggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    onSidebarToggle?.(newState)
  }

  return (
    <>
      {/* iPad overlay when sidebar is expanded - only for tablet view */}
      {!isCollapsed && isTabletSize && (
        <div
          className="fixed inset-0 z-55"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 bg-background border-r border-border shadow-xl transition-all duration-300 flex-col",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{
          height: isCollapsed ? '100vh' : 'auto',
          minHeight: '100vh',
          overflow: 'visible',
          zIndex: 9999
        }}
      >
        {/* Logo at top */}
        <div 
          className="flex items-center justify-center px-4 py-4 border-b border-border bg-background flex-shrink-0 cursor-pointer"
          onClick={() => handleNavigate("dashboard")}
        >
          <motion.div
            className={cn(isCollapsed ? "mr-0" : "mr-3")}
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
          {!isCollapsed && (
            <h1 className="text-sm font-bold font-heading leading-tight break-words max-w-full">
              <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>HNWI</span>{" "}
              <span className={`${theme === "dark" ? "text-[#C0C0C0]" : "text-[#888888]"}`}>CHRONICLES</span>
            </h1>
          )}
        </div>


        {/* Main content area - fills remaining space */}
        <div className="flex flex-col flex-1" style={{ overflow: 'visible' }}>
          {/* Toggle button when collapsed */}
          {isCollapsed && (
            <div className="p-3 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSidebar}
                className="w-full justify-center h-12 hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            </div>
          )}
          
          {/* Toggle button when expanded */}
          {!isCollapsed && (
            <div className="p-3 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={handleToggleSidebar}
                className="w-full justify-start gap-4 h-12 px-4 hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-semibold tracking-wide">Back</span>
              </Button>
            </div>
          )}
          
          {/* Navigation items */}
          <nav className="p-3 pt-0 flex-1" style={{ overflow: 'visible' }}>
            <div className="space-y-2">
              <TooltipProvider>
                {/* Main navigation items */}
                {mainNavItems.map((item) => {
                  const isActive = currentPage === item.route;
                  return (
                  <div key={item.route} className="relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-4 h-12 px-4 font-medium rounded-lg transition-all duration-200",
                        isCollapsed && "justify-center px-0 gap-0",
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => handleNavigate(item.route)}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary" : ""
                      )} />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-semibold tracking-wide",
                              isActive ? "text-primary" : ""
                            )}>{item.name}</span>
                            {(item.beta || item.isNew) && (
                              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                {item.isNew ? "New" : "Beta"}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <div 
                                  className="ml-2 p-1 hover:bg-muted-foreground/10 rounded-full transition-colors duration-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Info className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="right" 
                                className="max-w-xs p-4 text-xs leading-relaxed bg-popover border shadow-2xl"
                                style={{ 
                                  zIndex: 999999,
                                }}
                                sideOffset={15}
                                avoidCollisions={true}
                              >
                                <div className="max-w-[280px]">
                                  <p className="line-clamp-4 break-words text-popover-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </Button>
                  </div>
                  );
                })}
                
                {/* Additional navigation items - inline accordion */}
                {isMoreExpanded && additionalNavItems.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {additionalNavItems.map((item) => {
                      const isActive = currentPage === item.route;
                      return (
                      <div key={item.route} className="relative">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-4 h-12 px-4 font-medium rounded-lg transition-all duration-200",
                            isCollapsed && "justify-center px-0 gap-0",
                            isActive 
                              ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          onClick={() => handleNavigate(item.route)}
                        >
                          <item.icon className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary" : ""
                          )} />
                          {!isCollapsed && (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm font-semibold tracking-wide",
                                  isActive ? "text-primary" : ""
                                )}>{item.name}</span>
                                {(item.beta || item.isNew) && (
                                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    {item.isNew ? "New" : "Beta"}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className="ml-2 p-1 hover:bg-muted-foreground/10 rounded-full transition-colors duration-200"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Info className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="right" 
                                    className="max-w-xs p-4 text-xs leading-relaxed bg-popover border shadow-2xl"
                                    style={{ 
                                      zIndex: 999999,
                                    }}
                                    sideOffset={15}
                                    avoidCollisions={true}
                                  >
                                    <div className="max-w-[280px]">
                                      <p className="line-clamp-4 break-words text-popover-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </Button>
                      </div>
                      );
                    })}
                    
                    {/* Collapse arrow at bottom of expanded items */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-4 h-12 px-4 font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200",
                          isCollapsed && "justify-center px-0 gap-0"
                        )}
                        onClick={() => {
                          setIsMoreExpanded(false)
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('sidebar-more-expanded', 'false')
                          }
                        }}
                      >
                        <ChevronDown className="h-5 w-5 flex-shrink-0 rotate-180" />
                        {!isCollapsed && (
                          <span className="text-sm font-semibold tracking-wide">Less</span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* More expand button - only show when not expanded and there are additional items */}
                {!isMoreExpanded && additionalNavItems.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-4 h-12 px-4 font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200",
                        isCollapsed && "justify-center px-0 gap-0"
                      )}
                      onClick={() => {
                        setIsMoreExpanded(true)
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('sidebar-more-expanded', 'true')
                        }
                      }}
                    >
                      <ChevronDown className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-semibold tracking-wide">More</span>
                      )}
                    </Button>
                  </div>
                )}
              </TooltipProvider>
            </div>
          </nav>

          {/* Bottom footer text - positioned at bottom edge */}
          {!isCollapsed && (
            <div className="mt-auto p-4 pb-16 border-t border-border/20 flex-shrink-0">
              <div className="text-xs text-muted-foreground text-center space-y-3">
                {/* Premium Edition with background */}
                <div className="bg-card/50 rounded-lg p-2.5 border border-border/20">
                  <div className="space-y-1">
                    <div className="font-bold tracking-wide text-foreground text-[11px] leading-tight">
                      HNWI CHRONICLES
                    </div>
                    <div className="text-primary font-medium text-[10px] leading-tight">
                      Premium Edition
                    </div>
                  </div>
                </div>
                
                {/* Splash screen footer */}
                <div className="space-y-2">
                  <div className="leading-relaxed text-[9px] break-words">
                    A product of <span className="font-semibold text-primary">Montaigne</span>
                    <br />
                    Powered by <span className={`font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>Market Unwinded AI</span>
                  </div>
                  <div className="text-muted-foreground/80 font-medium text-[8px] leading-tight break-words">
                    © 2025 All Rights Reserved.
                    <br />
                    HNWI Chronicles.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay when sidebar is open */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-55"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 safe-area-pb">
          {mobileNavItems.map((item) => {
            const isActive = currentPage === item.route;
            return (
              <Button
                key={item.route}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-16 px-2 py-2 hover:bg-muted rounded-xl relative group",
                  theme === 'dark' && "hover:text-white"
                )}
                onClick={() => handleNavigate(item.route)}
              >
                {item.isNew && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold z-10">
                    NEW
                  </span>
                )}
                <item.icon className={cn(
                  "h-6 w-6 mb-1 flex-shrink-0",
                  isActive && 'text-primary',
                  theme === 'dark' && !isActive && "group-hover:text-white"
                )} />
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  isActive && 'text-primary',
                  theme === 'dark' && !isActive && "group-hover:text-white"
                )}>
                  {item.name === "Ask Rohith" ? "Rohith" : item.name === "HNWI World" ? "HNWI" : item.name}
                </span>
              </Button>
            )
          })}

          {/* Three Dots More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center min-w-[60px] h-16 px-2 py-2 hover:bg-muted rounded-xl group",
                  theme === 'dark' && "hover:text-white"
                )}
              >
                <MoreHorizontal className={cn(
                  "h-6 w-6 mb-1 flex-shrink-0",
                  theme === 'dark' && "group-hover:text-white"
                )} />
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  theme === 'dark' && "group-hover:text-white"
                )}>
                  More
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mb-2">
              {moreMenuItems.map((item) => {
                const isActive = currentPage === item.route;
                return (
                  <DropdownMenuItem
                    key={item.route}
                    onClick={() => handleNavigate(item.route)}
                    className="flex items-center space-x-3 py-3 group"
                  >
                    <item.icon className={cn(
                      "h-5 w-5",
                      isActive && 'text-primary',
                      theme === 'light' && "group-hover:text-white"
                    )} />
                    <span className={cn(
                      "font-medium",
                      isActive && 'text-primary',
                      theme === 'light' && "group-hover:text-white"
                    )}>{item.name}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}