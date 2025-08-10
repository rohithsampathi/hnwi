// components/home-dashboard.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
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
// import { OnboardingWizard } from "./onboarding-wizard"
// import { useOnboarding } from "@/contexts/onboarding-context"
import { LiveButton } from "@/components/live-button"
import { Heading2, Heading3, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
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
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [developments, setDevelopments] = useState<Development[]>([])
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
    // Check authentication before making API call
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping developments fetch');
      setDevelopments([]);
      return;
    }

    try {
      const data = await secureApi.post('/api/developments', {
        page: 1,
        page_size: 10,
        sort_by: "date",
        sort_order: "desc"
      });
      
      setDevelopments(data.developments || [])
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || error.status === 401) {
        console.log('Authentication required for developments data');
        setDevelopments([]);
        return;
      }
      
      // For other errors, show toast
      toast({
        title: "Error",
        description: "Failed to fetch latest developments. Please try again later.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchDevelopments()
  }, [])

  useEffect(() => {
    if (developments.length === 0) return;
    
    // Only start the interval after developments are loaded
    const interval = setInterval(() => {
      setSpotlightIndex((prevIndex) => (prevIndex + 1) % developments.length)
    }, 14000) // 14-second rotation interval
    
    return () => clearInterval(interval)
  }, [developments.length])

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
      color: theme === "dark" ? "hsl(43, 50%, 55%)" : "hsl(43, 50%, 75%)", // Golden yellow in both modes
      description: "Wealth Radar and Insider Briefings - your daily 5-minute read to understand lifestyle and alternative wealth investment developments in the HNWI World.",
      iconAnimation: pulseAnimation,
      live: true,
    },
    {
      name: "War Room",
      icon: Shield,
      route: "war-room",
      color: theme === "dark" ? "hsl(43, 50%, 55%)" : "hsl(43, 50%, 75%)",
      description: "Playbooks and strategies for entrepreneurs to effectively grow their business empires with institutional-grade tactical frameworks.",
      iconAnimation: pulseAnimation,
      businessOnly: true,
    },
    // Tactics Lab moved to Founder's Desk
  ]

  // Filter items based on business mode only (War Room will be shown in business mode)
  const visibleExperienceZone = experienceZone.filter(item => isBusinessMode || !item.businessOnly);

  const crownZoneItems = [
    {
      name: "Privé Exchange",
      icon: Store,
      route: "prive-exchange",
      color: theme === "dark" ? "hsl(165, 46%, 45%)" : "hsl(165, 46%, 75%)",
      description: "Exclusive marketplace for HNWI offering off-market investment opportunities and institutional alternatives.",
      iconAnimation: pulseAnimation,
      live: true,
    },
    {
      name: "Crown Vault",
      icon: Vault,
      route: "crown-vault",
      color: theme === "dark" ? "hsl(165, 46%, 45%)" : "hsl(165, 46%, 75%)",
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
      color: theme === "dark" ? "hsl(43, 50%, 52%)" : "hsl(43, 50%, 72%)",
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
      color: theme === "dark" ? "hsl(43, 50%, 52%)" : "hsl(43, 50%, 72%)",
      description: "Curated playbooks from global institutions and ultra-high-net-worth family office leaders.",
      iconAnimation: pulseAnimation,
      businessOnly: true,
    },
    {
      name: "Tactics Lab",
      icon: Beaker,
      route: "strategy-engine",
      color: theme === "dark" ? "hsl(43, 50%, 52%)" : "hsl(43, 50%, 72%)", // Golden yellow in both modes
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
        title="Dashboard | HNWI Chronicles"
        description="Access your personalized wealth intelligence dashboard."
        image="https://hnwichronicles.com/dashboard-og-image.jpg"
        url="https://hnwichronicles.com/dashboard"
      />
      <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
        <Card className="overflow-hidden bg-card text-card-foreground font-body">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Diamond className="w-6 h-6 text-primary" />
              <Heading2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide text-card-foreground">
                Elite Pulse
              </Heading2>
            </div>
            <Lead className="font-body font-regular tracking-wide text-base md:text-sm">Your Daily Dose of Wealth Insights</Lead>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {developments.length > 0 && (
                <div className="flex flex-col space-y-4">
                  {[0, 1, 2].map((offset) => {
                    const index = (spotlightIndex + offset) % developments.length;
                    return (
                      <div key={`news-block-${offset}`} className="min-h-[179px] relative news-block card-stack-item">
                        <div 
                          className="p-3 md:p-4 rounded-3xl cursor-pointer transition-all duration-300 min-h-full"
                          style={{
                            background: theme === "dark" ? 
                              "hsl(165, 46%, 8%)" : 
                              `linear-gradient(135deg, hsl(165, 46%, 85%) ${offset * 8}%, hsl(165, 46%, 75%))`,
                            backdropFilter: "blur(12px)",
                            color: theme === "dark" ? "white" : "#2c2144"
                          }}
                          onClick={(e) => handleNavigate(e, "strategy-vault", developments[index].id)}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                              key={`card-content-${developments[index].id}-${spotlightIndex}`}
                              initial={{ 
                                rotateX: 90,
                                opacity: 0
                              }}
                              animate={{ 
                                rotateX: 0,
                                opacity: 1
                              }}
                              exit={{ 
                                rotateX: -90,
                                opacity: 0
                              }}
                              transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: offset * 0.1
                              }}
                              className="flex flex-col h-full"
                              style={{
                                transformOrigin: "center center"
                              }}
                            >
                              <h3 className="text-base md:text-lg font-semibold">
                                {developments[index].title}
                              </h3>
                              <p className="text-sm md:text-base mt-1 mb-2 flex-grow">
                                {developments[index].description}
                              </p>
                              <div className="flex justify-between items-end mt-auto">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-primary/80 text-white dark:text-white text-sm md:text-xs shadow-[0_8px_16px_rgba(0,0,0,0.3)] rounded-full transform hover:-translate-y-0.5 transition-all hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                                    {developments[index].industry}
                                  </Badge>
                                  <div className="text-sm md:text-base font-bold whitespace-nowrap bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md inline-block">
                                    {new Date(developments[index].date).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric"
                                    })}
                                  </div>
                                </div>
                                <div className="cta-button">
                                  <div className="clickable-arrow">
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* The Foundry Section */}
        {visibleExperienceZone.length > 0 && (
          <Card className={`mt-4 md:mt-6 "bg-card text-card-foreground"`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Hammer className="w-6 h-6 text-primary" />
                <Heading2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide text-card-foreground">
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
                      className="w-full min-h-[294px] md:min-h-[347px] p-3 md:pt-4 md:px-8 md:pb-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                      style={{
                        background: item.color,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden flex-1 pt-4">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 mt-2" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading3 className="mb-2 mt-1 text-shadow text-card-foreground">{item.name}</Heading3>
                          {item.beta && (
                            <Badge variant="secondary" className="ml-1 badge-beta">
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
        <Card className={`mt-4 md:mt-6 "bg-card text-card-foreground"`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-primary" />
              <Heading2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide text-card-foreground">
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
                    className="w-full min-h-[294px] md:min-h-[347px] p-3 md:pt-4 md:px-8 md:pb-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                    style={{
                      background: item.color,
                      color: theme === "dark" ? "white" : "black",
                    }}
                  >
                    <div className="flex flex-col items-start w-full overflow-hidden flex-1 pt-4">
                      <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 mt-2" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <Heading3 className="mb-2 mt-1 text-shadow text-card-foreground">{item.name}</Heading3>
                        {item.beta && (
                          <Badge variant="secondary" className="ml-1 badge-beta">
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
          <Card className={`mt-4 md:mt-6 "bg-card text-card-foreground"`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-primary" />
                <Heading2 className="text-2xl md:text-3xl font-heading font-bold tracking-wide text-card-foreground">
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
                      className="w-full min-h-[294px] md:min-h-[347px] p-3 md:pt-4 md:px-8 md:pb-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                      style={{
                        background: item.color,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden flex-1 pt-4">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 mt-2" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading3 className="mb-2 mt-1 text-shadow text-card-foreground">{item.name}</Heading3>
                          {item.beta && (
                            <Badge variant="secondary" className="ml-1 badge-beta">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm md:text-base max-w-full whitespace-normal break-words font-normal mb-4">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex justify-between items-center w-full mb-4 mt-2">
                        {item.live && (
                          <div>
                            <LiveButton />
                          </div>
                        )}
                        <div className="flex items-center ml-auto">
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