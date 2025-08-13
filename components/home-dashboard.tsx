// components/home-dashboard.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  Globe,
  Beaker,
  Hammer,
  ArrowRight,
  Briefcase,
  CalendarIcon,
  BookOpen,
  Crown,
  Users,
  Diamond,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getCardColors, getMetallicCardStyle } from "@/lib/colors"
// import { OnboardingWizard } from "./onboarding-wizard"
// import { useOnboarding } from "@/contexts/onboarding-context"
import { Heading2, Heading3, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { CrownLoader } from "@/components/ui/crown-loader"
import type React from "react"

import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"
import { useAuthPopup } from "@/contexts/auth-popup-context"

interface User {
  firstName: string
  lastName: string
  email: string
}

interface Development {
  id: string
  title: string
  description: string
  industry: string
  date: string
  product: string
  source?: string
}

interface ExperienceZoneItem {
  name: string
  icon: React.ElementType
  route: string
  color: string
  description: string | React.ReactNode
  iconAnimation: any
  beta?: boolean
  businessOnly?: boolean
  live?: boolean
}

const AnimatedIcon = ({
  icon: Icon,
  animation,
  className,
}: {
  icon: React.ElementType
  animation: any
  className?: string
}) => {
  return (
    <motion.div
      animate={animation.animate}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1000,
      }}
    >
      <Icon className="w-8 h-8 md:w-12 md:h-12" />
    </motion.div>
  )
}

const pulseAnimation = {
  animate: {
    opacity: [1, 0.4, 1],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
}

export function HomeDashboard({
  user,
  onNavigate,
  isFromSignupFlow,
  userData,
}: {
  user: User
  onNavigate: (route: string) => void
  isFromSignupFlow: boolean
  userData?: any
}) {
  const { theme } = useTheme()
  const { isBusinessMode } = useBusinessMode()
  const { toast } = useToast()
  const { showAuthPopup } = useAuthPopup()
  const [developments, setDevelopments] = useState<Development[]>([])
  const [developmentsLoading, setDevelopmentsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [availableWidth, setAvailableWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  // Commenting out onboarding popup code
  // const { currentStep, setCurrentStep, isWizardCompleted, setIsFromSignupFlow } = useOnboarding()
  // const [showOnboardingWizard, setShowOnboardingWizard] = useState(isFromSignupFlow && !isWizardCompleted)

  // Check if user has purchased reports
  const hasPurchasedReports = useCallback(() => {
    // First try to get from userData directly
    if (userData?.purchased_reports && userData.purchased_reports.length > 0) {
      return true;
    }
    
    // Then try profile path
    if (userData?.profile?.purchased_reports && userData.profile.purchased_reports.length > 0) {
      return true;
    }
    
    return false;
  }, [userData]);

  const fetchDevelopments = async () => {
    setDevelopmentsLoading(true)
    // Check authentication before making API call
    if (!isAuthenticated()) {
      console.log('User not authenticated - showing auth popup');
      showAuthPopup({
        title: "Sign In Required",
        description: "Please sign in to access Elite Pulse developments",
        onSuccess: () => {
          // Retry fetching developments after successful login
          fetchDevelopments();
        }
      });
      setDevelopmentsLoading(false)
      return;
    }

    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 10,
        sort_by: "date",
        sort_order: "desc"
      }, true, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache for developments
      
      setDevelopments(data.developments || [])
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || error.status === 401) {
        console.log('Authentication required for developments data - showing auth popup');
        showAuthPopup({
          title: "Session Expired",
          description: "Due to inactivity, your secure line has been logged out. Login again to restore secure access.",
          onSuccess: () => {
            // Retry fetching developments after successful login
            fetchDevelopments();
          }
        });
        setDevelopmentsLoading(false)
        return;
      }
      
      // For other errors, show toast
      toast({
        title: "Error",
        description: "Failed to fetch latest developments. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setDevelopmentsLoading(false)
    }
  }

  useEffect(() => {
    fetchDevelopments()
  }, [])

  // Dynamic width detection based on container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width
        setAvailableWidth(containerWidth)
        
        // Dynamic sizing based on available container width, not just window width
        if (containerWidth < 600) {
          setScreenSize('mobile')
        } else if (containerWidth < 900) {
          setScreenSize('tablet')  
        } else {
          setScreenSize('desktop')
        }
      }
    }

    // Use ResizeObserver for better container width detection
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Fallback to window resize
    window.addEventListener('resize', handleResize)
    handleResize() // Initial call
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Dynamic carousel configuration based on available width
  const getCarouselConfig = () => {
    // Only apply dynamic logic if we have measured width
    if (availableWidth === 0) {
      // Fallback to original logic while width is being measured
      switch (screenSize) {
        case 'mobile':
          return { cardsToShow: 2, slideStep: 1, showPartialCard: true, isVertical: false }
        case 'tablet':
          return { cardsToShow: 3, slideStep: 1, showPartialCard: true, isVertical: false, fullCards: 2 }
        case 'desktop':
        default:
          return { cardsToShow: 4, slideStep: 2, showPartialCard: true, isVertical: false }
      }
    }

    // Calculate optimal cards based on available width
    const cardMinWidth = 320 // Slightly larger minimum for better spacing
    const maxFullCards = Math.floor(availableWidth / cardMinWidth)
    
    switch (screenSize) {
      case 'mobile':
        return {
          cardsToShow: 2, // Always 2 on mobile
          slideStep: 1,
          showPartialCard: true,
          isVertical: false
        }
      case 'tablet':
        // More nuanced tablet logic
        const tabletCards = maxFullCards >= 3 ? 3 : (maxFullCards >= 2 ? 2 : 2) // Min 2, max 3
        return {
          cardsToShow: tabletCards,
          slideStep: 1,
          showPartialCard: true,
          isVertical: false,
          fullCards: Math.max(1, tabletCards - 1)
        }
      case 'desktop':
      default:
        // Desktop: scale from 2 to 4 based on available width
        let desktopCards
        if (maxFullCards >= 4) {
          desktopCards = 4 // Plenty of space: show 4 cards
        } else if (maxFullCards >= 3) {
          desktopCards = 3 // Good space: show 3 cards  
        } else {
          desktopCards = 2 // Limited space: show 2 cards
        }
        
        return {
          cardsToShow: desktopCards,
          slideStep: desktopCards > 2 ? 2 : 1,
          showPartialCard: true,
          isVertical: false
        }
    }
  }

  const config = getCarouselConfig()
  const totalSlides = config.isVertical 
    ? developments.length 
    : Math.max(0, developments.length - (config.cardsToShow - config.slideStep) + 1) // Allow final slide to show last cards + END OF STREAM
  
  const nextSlide = () => {
    if (config.isVertical) {
      setCurrentSlide((prev) => Math.min(prev + 1, developments.length - 1))
    } else {
      setCurrentSlide((prev) => Math.min(prev + config.slideStep, totalSlides - 1))
    }
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - config.slideStep, 0))
  }
  
  // Get developments to show based on current slide and screen size
  const getDisplayDevelopments = () => {
    if (screenSize === 'mobile') {
      // Mobile uses horizontal scroll, not carousel
      return developments
    }
    
    // Calculate the start index based on current slide
    let startIndex = currentSlide
    
    // Always return the requested number of cards from the start index
    return developments.slice(startIndex, startIndex + config.cardsToShow)
  }

  // Commenting out onboarding cleanup effect
  // useEffect(() => {
  //   return () => {
  //     setShowOnboardingWizard(false)
  //     setIsFromSignupFlow(false)
  //   }
  // }, [setIsFromSignupFlow])

  // All available sections
  const experienceZone: ExperienceZoneItem[] = [
    {
      name: "War Room",
      icon: Shield,
      route: "war-room",
      color: getCardColors(theme),
      description: "Playbooks and strategies for entrepreneurs to effectively grow their business empires with institutional-grade tactical frameworks.",
      iconAnimation: pulseAnimation,
      businessOnly: true,
    },
    // Tactics Lab moved to Founder's Desk
  ]

  // Filter items based on business mode only (War Room will be shown in business mode)
  const visibleExperienceZone = experienceZone.filter(item => isBusinessMode || !item.businessOnly);

  // Centralized heading style for all section titles
  const sectionHeadingClass = `text-2xl md:text-3xl font-heading font-bold tracking-wide ${
    theme === "dark" ? "text-white" : "text-black"
  }`;

  // Time-based greeting function
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };


  const foundersDeskItems = [
    {
      name: "Social Hub",
      icon: Users,
      route: "social-hub",
      color: getCardColors(theme),
      description: "Hub of essential events that HNWIs should attend throughout the year ensuring you're at the right place and right time.",
      iconAnimation: pulseAnimation,
      live: true,
    },
    // Calendar card removed/commented out
    /*{
      name: "Calendar",
      icon: CalendarIcon,
      route: "calendar-page",
      color: theme === "dark" ? "hsl(43, 50%, 52%)" : "#f3eae0",
      description: "Manage your elite events calendar, including private showcases, exclusive gatherings, and invitation-only investment summits tailored to your interests.",
      iconAnimation: pulseAnimation,
    },*/
    {
      name: "Playbook Store",
      icon: BookOpen,
      route: "play-books",
      color: getCardColors(theme),
      description: "Curated playbooks from global institutions and ultra-high-net-worth family office leaders.",
      iconAnimation: pulseAnimation,
      businessOnly: true,
    },
    {
      name: "Tactics Lab",
      icon: Beaker,
      route: "strategy-engine",
      color: getCardColors(theme), // Secondary colors - dark gray for dark mode, light gray for light mode
      description: "Wealth Strategy Assistant helping entrepreneurs get detailed analysis on HNWI World interests. A strategy engine, not a chatbot.",
      iconAnimation: pulseAnimation,
      beta: true,
      businessOnly: true,
    },
  ]

  // Filter founders desk items based on business mode only (Playbook Store will be shown in business mode)
  const visibleFoundersDeskItems = foundersDeskItems.filter(item => isBusinessMode || !item.businessOnly);

  const handleNavigate = (e: React.MouseEvent, route: string, developmentId?: string) => {
    e.preventDefault()
    
    // Commenting out onboarding steps
    // if (route === "play-books" && currentStep === "playbooks") {
    //   setCurrentStep("industryTrends")
    // } else if (route === "strategy-vault" && currentStep === "industryTrends") {
    //   setCurrentStep("orangeStrategy")
    // }

    // Handle development ID if provided (for strategy vault navigation with context)
    if (developmentId) {
      // Store the development ID in sessionStorage for the target page to access
      sessionStorage.setItem("currentDevelopmentId", developmentId);
      sessionStorage.setItem("nav_param_industry", "All");
      sessionStorage.setItem("nav_param_timeRange", "1w");
      
      // Navigate directly to strategy vault
      onNavigate("strategy-vault");
    } 
    // Handle opportunity navigation directly
    else if (route.startsWith("opportunity/")) {
      const opportunityId = route.split("/")[1];
      sessionStorage.setItem("currentOpportunityId", opportunityId);
      onNavigate("opportunity");
    }
    // All other regular navigation
    else {
      onNavigate(route);
    }
  }

  // Commenting out onboarding wizard close handler
  // const handleCloseOnboardingWizard = () => {
  //   setShowOnboardingWizard(false)
  // }

  return (
    <>
      <MetaTags
        title="HNWI Chronicles | Inside the Mind of Smart Wealth"
        description="Institutional intelligence. Off-market access. Generational continuity. Join remaining founding members at $1000/year lifetime rate."
        image="https://app.hnwichronicles.com/images/logo.png"
        url="https://app.hnwichronicles.com"
        ogTitle="HNWI Chronicles - What the world's top 1% realise before others know"
        ogDescription="Institutional intelligence. Off-market access. Generational continuity. Global wealth intelligence for the global top 1%."
        twitterTitle="HNWI Chronicles - What the world's top 1% realise before markets know"
        twitterDescription="Institutional intelligence. Off-market access. Generational continuity."
      />
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className={`text-2xl font-bold leading-tight ${theme === "dark" ? "text-white" : "text-black"}`}>
          {getTimeBasedGreeting()}, <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>{user.firstName}</span>
        </h1>
        <p className="text-muted-foreground text-base leading-tight mt-1">Your wealth intelligence dashboard</p>
      </div>

      <div ref={containerRef} className="space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Diamond className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
              <Heading2 className={sectionHeadingClass}>
                Elite Pulse
              </Heading2>
            </div>
            <Lead className="font-body font-regular tracking-wide text-base md:text-sm">What the world's top 1% realise before others know</Lead>
          </CardHeader>
          <CardContent className="px-0">
            {developmentsLoading ? (
              <div className="flex flex-col space-y-4 px-6">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <CrownLoader size="lg" text="Loading your strategic insights..." />
                </div>
              </div>
            ) : developments.length > 0 && (
              <div className={screenSize === 'mobile' ? 'relative' : 'px-6 relative'}>
                {/* Elite Pulse - Responsive Layout */}
                <div className={`relative ${screenSize !== 'mobile' ? 'px-5' : 'px-6'}`}>
                  <div 
                    className={screenSize === 'mobile' ? 'overflow-x-scroll overflow-y-hidden -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'overflow-visible'}
                  >
                    {screenSize === 'mobile' ? (
                      // Mobile: Horizontal scroll layout (perfect as is)
                      <div 
                        className="flex gap-4 pb-4"
                        style={{
                          width: 'max-content'
                        }}
                      >
                        {developments.map((development, index) => (
                          <motion.div
                            key={`elite-pulse-mobile-${development.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex-shrink-0 w-[75vw] h-[28rem] p-6 rounded-3xl cursor-pointer transition-all duration-300 relative"
                            style={{
                              ...getMetallicCardStyle(theme).style,
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onClick={(e) => handleNavigate(e, "strategy-vault", development.id)}
                          >
                            <div className="flex flex-col h-full">
                              {/* Top row with badge and date */}
                              <div className="flex justify-between items-center mb-3">
                                <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">
                                  {development.industry}
                                </PremiumBadge>
                                
                                <div className={`text-xs font-medium ${
                                  theme === "dark" 
                                    ? "text-gray-200" 
                                    : "text-gray-700"
                                }`}>
                                  {new Date(development.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                  })}
                                </div>
                              </div>
                              
                              {/* Heading */}
                              <h3 className={`text-lg font-black mb-3 ${
                                theme === "dark" ? "text-primary" : "text-black"
                              }`}>
                                {development.title}
                              </h3>
                              
                              {/* Body */}
                              <p className={`text-sm mb-4 font-medium leading-relaxed flex-grow ${
                                theme === "dark" ? "text-gray-200" : "text-gray-700"
                              }`}>
                                {development.description}
                              </p>
                              
                              {/* Bottom row with Read More and Source */}
                              <div className="flex justify-between items-center">
                                <div className={`text-sm font-bold hover:underline cursor-pointer ${
                                  theme === "dark" ? "text-primary" : "text-black"
                                }`}>
                                  Read Full Brief
                                </div>
                                {development.source && (
                                  <div className={`text-xs font-medium ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  }`}>
                                    Source: {development.source}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      // Tablet/Desktop: Carousel layout
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, x: 300 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -300 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="flex space-x-4 relative"
                          style={{
                            width: screenSize === 'desktop' 
                              ? '100%' 
                              : '100%'
                          }}
                        >
                          {/* Render available development cards */}
                          {getDisplayDevelopments().map((development, index) => {
                            // Render normal development card
                            return (
                              <motion.div
                                key={`elite-pulse-${development.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`${
                                  screenSize === 'tablet' 
                                    ? index < 2 
                                      ? "flex-1 min-w-0" // First 2 cards: full width
                                      : "w-16 flex-shrink-0" // 3rd card: very small peek
                                    : "flex-1 min-w-0" // Desktop: all cards get full width, no partial card constraint
                                } h-[28rem] p-6 rounded-3xl cursor-pointer transition-all duration-300 relative`}
                                style={{
                                  ...getMetallicCardStyle(theme).style,
                                  position: "relative",
                                  overflow: "hidden"
                                }}
                                onClick={(e) => handleNavigate(e, "strategy-vault", development.id)}
                              >
                                <div className="flex flex-col h-full">
                                  {/* Top row with badge and date */}
                                  <div className="flex justify-between items-center mb-3">
                                    <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">
                                      {development.industry}
                                    </PremiumBadge>
                                    
                                    <div className={`text-xs font-medium ${
                                      theme === "dark" 
                                        ? "text-gray-200" 
                                        : "text-gray-700"
                                    }`}>
                                      {new Date(development.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                      })}
                                    </div>
                                  </div>
                                  
                                  {/* Heading */}
                                  <h3 className={`text-lg font-black mb-3 ${
                                    theme === "dark" ? "text-primary" : "text-black"
                                  }`}>
                                    {development.title}
                                  </h3>
                                  
                                  {/* Body */}
                                  <p className={`text-sm mb-4 font-medium leading-relaxed flex-grow ${
                                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                                  }`}>
                                    {development.description}
                                  </p>
                                  
                                  {/* Bottom row with Read Full Brief and Source */}
                                  <div className="flex justify-between items-center">
                                    <div className={`text-sm font-bold hover:underline cursor-pointer ${
                                      theme === "dark" ? "text-primary" : "text-black"
                                    }`}>
                                      Read Full Brief
                                    </div>
                                    {development.source && (
                                      <div className={`text-xs font-medium ${
                                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                                      }`}>
                                        Source: {development.source}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Blur overlay for partial cards - doesn't affect content - but never on last slide */}
                                {screenSize === 'desktop' && index === 3 && currentSlide < totalSlides - 1 && getDisplayDevelopments().length === config.cardsToShow && (
                                  <div 
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                      maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,1) 100%)",
                                      WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,1) 100%)",
                                      background: theme === 'dark' ? '#0a0a0a' : '#ffffff'
                                    }}
                                  />
                                )}
                              </motion.div>
                            )
                          })}
                          
                          {/* Lightweight MORE SOON text - only show if we're at the end and have fewer cards */}
                          {getDisplayDevelopments().length < config.cardsToShow && (
                            <div className="w-16 flex items-center justify-center">
                              <div className={`text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} opacity-60`}>
                                <div className="text-xs font-light flex flex-col items-center">
                                  {"MORE SOON".split('').map((char, i) => 
                                    char === ' ' ? (
                                      <div key={i} className="h-1" />
                                    ) : (
                                      <div key={i} className="leading-none">{char}</div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                  
                  {/* Navigation Arrows - hide on mobile */}
                  {screenSize !== 'mobile' && (
                    <>
                      {/* Minimal Premium Arrow Navigation - show while we can navigate further */}
                      {currentSlide < totalSlides - 1 && (
                        <button 
                          onClick={nextSlide}
                          className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 bg-white/10 hover:bg-white/20 border border-white/20"
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </button>
                      )}
                      
                      {/* Minimal Premium Left Arrow Navigation - show when we can go back */}
                      {currentSlide > 0 && (
                        <button 
                          onClick={prevSlide}
                          className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 bg-white/10 hover:bg-white/20 border border-white/20"
                        >
                          <ChevronLeft className="w-4 h-4 text-primary" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* The Foundry Section */}
        {visibleExperienceZone.length > 0 && (
          <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-tertiary border-none" : "bg-tertiary border-none"} text-card-foreground`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Hammer className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                <Heading2 className={sectionHeadingClass}>
                  The Foundry
                </Heading2>
              </div>
              <CardDescription className="font-body tracking-wide text-base md:text-sm font-normal">Where Winning Strategies Are Forged</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {visibleExperienceZone.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={(e) => handleNavigate(e, item.route)}
                      className={`w-full min-h-[294px] md:min-h-[347px] p-3 md:pt-4 md:px-8 md:pb-8 flex flex-col items-start justify-between text-left font-button font-semibold ${getMetallicCardStyle(theme).className}`}
                      style={{
                        ...getMetallicCardStyle(theme).style,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden flex-1 pt-4">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 mt-2" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading3 className={`mb-2 mt-1 ${theme === "dark" ? "text-primary" : "text-black font-bold"}`}>{item.name}</Heading3>
                          {item.beta && (
                            <Badge variant="secondary" className="ml-1 badge-primary">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm md:text-base max-w-full whitespace-normal break-words font-normal mb-4">
                          {typeof item.description === "string" ? item.description : item.description}
                        </div>
                      </div>
                      <div className="flex justify-start items-center w-full mb-4 mt-2">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2 text-sm md:text-base font-button font-semibold">Explore</span>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Founder's Desk Section */}
        {visibleFoundersDeskItems.length > 0 && (
          <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-tertiary border-none" : "bg-tertiary border-none"} text-card-foreground`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Briefcase className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                <Heading2 className={sectionHeadingClass}>
                  Founder's Desk
                </Heading2>
              </div>
              <CardDescription className="font-body tracking-wide text-base md:text-sm font-normal">Your personal command center</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {visibleFoundersDeskItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={(e) => handleNavigate(e, item.route)}
                      className={`w-full min-h-[294px] md:min-h-[347px] p-3 md:pt-4 md:px-8 md:pb-8 flex flex-col items-start justify-between text-left font-button font-semibold ${getMetallicCardStyle(theme).className}`}
                      style={{
                        ...getMetallicCardStyle(theme).style,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden flex-1 pt-4">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 mt-2" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading3 className={`mb-2 mt-1 ${theme === "dark" ? "text-primary" : "text-black font-bold"}`}>{item.name}</Heading3>
                          {item.beta && (
                            <Badge variant="secondary" className="ml-1 badge-primary">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm md:text-base max-w-full whitespace-normal break-words font-normal mb-4">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex justify-start items-center w-full mb-4 mt-2">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2 text-sm md:text-base font-button font-semibold">Explore</span>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commenting out onboarding wizard */}
        {/* {showOnboardingWizard && <OnboardingWizard onClose={handleCloseOnboardingWizard} />} */}
      </div>
    </>
  )
}