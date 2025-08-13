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
  Store,
  Diamond,
  Vault,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getCardColors, getMetallicCardStyle } from "@/lib/colors"
// import { OnboardingWizard } from "./onboarding-wizard"
// import { useOnboarding } from "@/contexts/onboarding-context"
import { LiveButton } from "@/components/live-button"
import { Heading2, Heading3, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { CrownLoader } from "@/components/ui/crown-loader"
import type React from "react"

import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"

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
  const [developments, setDevelopments] = useState<Development[]>([])
  const [developmentsLoading, setDevelopmentsLoading] = useState(true)
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
      console.log('User not authenticated - skipping developments fetch');
      setDevelopments([]);
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
        console.log('Authentication required for developments data');
        setDevelopments([]);
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
      name: "HNWI World",
      icon: Globe,
      route: "strategy-vault",
      color: getCardColors(theme), // Secondary colors - dark gray for dark mode, light gray for light mode
      description: "Wealth Radar and Insider Brief - your daily 5-minute read to understand lifestyle and alternative wealth investment developments in the HNWI World.",
      iconAnimation: pulseAnimation,
      live: true,
    },
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

  const crownZoneItems = [
    {
      name: "Privé Exchange",
      icon: Store,
      route: "prive-exchange",
      color: getCardColors(theme),
      description: "Exclusive marketplace for HNWI offering off-market investment opportunities and institutional alternatives.",
      iconAnimation: pulseAnimation,
      live: true,
    },
    {
      name: "Crown Vault",
      icon: Vault,
      route: "crown-vault",
      color: getCardColors(theme),
      description: "High-secure legacy vault with discrete succession planning and encrypted asset custody for generational wealth preservation.",
      iconAnimation: pulseAnimation,
      live: true,
    }
  ]

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
          Welcome back, <span className={`${theme === "dark" ? "text-primary" : "text-black"}`}>{user.firstName}</span>
        </h1>
        <p className="text-muted-foreground text-base leading-tight mt-1">Your wealth intelligence dashboard</p>
      </div>

      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Diamond className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                <Heading2 className={sectionHeadingClass}>
                  Elite Pulse
                </Heading2>
              </div>
              <LiveButton />
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
              <div className="px-6">
                {/* Elite Pulse - Horizontal Cards Layout */}
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                  {developments.slice(0, 10).map((development, index) => (
                    <motion.div
                      key={`elite-pulse-${development.id}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex-shrink-0 w-80 h-[28rem] p-6 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2"
                      style={{
                        ...getMetallicCardStyle(theme).style,
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onClick={(e) => handleNavigate(e, "strategy-vault", development.id)}
                    >
                      <div className="flex flex-col">
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
                            Read More
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
                      <div className="flex justify-end items-center w-full mb-4 mt-2">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2 text-sm md:text-base font-button font-semibold">Explore</span>
                          <div className="clickable-arrow ml-1 flex-shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crown Zone Section */}
        <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-tertiary border-none" : "bg-tertiary border-none"} text-card-foreground`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
              <Heading2 className={sectionHeadingClass}>
                Crown Zone
              </Heading2>
            </div>
            <CardDescription className="font-body tracking-wide text-base md:text-sm font-normal">Exclusive opportunities for the elite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {crownZoneItems.map((item, index) => (
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
                    <div className="flex justify-between items-center w-full mb-4 mt-2">
                      {item.live && (
                        <div>
                          <LiveButton />
                        </div>
                      )}
                      <div className="flex items-center ml-auto">
                        <span className="mr-1 md:mr-2 text-xs md:text-sm font-button font-semibold">Explore</span>
                        <div className="clickable-arrow ml-1 flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                      <div className="flex justify-end items-center w-full mb-4 mt-2">
                        <div className="flex items-center">
                          <span className="mr-1 md:mr-2 text-sm md:text-base font-button font-semibold">Explore</span>
                          <div className="clickable-arrow ml-1 flex-shrink-0">
                            <ArrowRight className="w-4 h-4" />
                          </div>
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