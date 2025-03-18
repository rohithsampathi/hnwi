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
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
// import { OnboardingWizard } from "./onboarding-wizard"
// import { useOnboarding } from "@/contexts/onboarding-context"
import { LiveButton } from "@/components/live-button"
import { Heading2, Heading3, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import type React from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

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
    try {
      const response = await fetch(`${API_BASE_URL}/api/developments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 1,
          page_size: 10,
          sort_by: "date",
          sort_order: "desc"
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch developments: ${response.status}`)
      }
  
      const data = await response.json()
      setDevelopments(data.developments || [])
    } catch (error) {
      console.error("Error fetching developments:", error)
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
      name: "War Room",
      icon: Shield,
      route: "war-room",
      color: theme === "dark" ? "#7f6e6b" : "#e6d5c1",
      description: "Access your private strategic playbooks and tactical resources designed exclusively for wealth strategists and financial leaders.",
      iconAnimation: pulseAnimation,
      businessOnly: true,
    },
    {
      name: "HNWI World",
      icon: Globe,
      route: "strategy-vault",
      color: theme === "dark" ? "#7f6e6b" : "#e6d5c1",
      description: "Explore global wealth insights and exclusive market intelligence curated specifically for high-net-worth individuals and their advisors.",
      iconAnimation: pulseAnimation,
      live: true,
    },
    {
      name: "Tactics Lab",
      icon: Beaker,
      route: "strategy-engine",
      color: theme === "dark" ? "#7f6e6b" : "#e6d5c1",
      description: "Experiment with advanced wealth preservation and growth strategies in our premium simulation environment.",
      iconAnimation: pulseAnimation,
      beta: true,
      businessOnly: true,
    },
  ]

  // Filter items based on business mode only (War Room will be shown in business mode)
  const visibleExperienceZone = experienceZone.filter(item => isBusinessMode || !item.businessOnly);

  const crownWorldItems = [
    {
      name: "Privé Exchange",
      icon: Crown,
      route: "prive-exchange",
      color: theme === "dark" ? "#695d7e" : "#d8d0e8",
      description: "Access our exclusive marketplace for premium alternative assets, private equity opportunities, and bespoke investment vehicles not available to the general public.",
      iconAnimation: pulseAnimation,
      beta: true,
      live: true,
    },
    {
      name: "Social Hub",
      icon: Users,
      route: "social-hub",
      color: theme === "dark" ? "#695d7e" : "#d8d0e8",
      description: "Connect with fellow elite investors, family offices, and wealth managers in our private network designed for high-value relationship building and deal flow.",
      iconAnimation: pulseAnimation,
      beta: true,
      live: true,
    },
  ]

  const foundersDeskItems = [
    {
      name: "Calendar",
      icon: CalendarIcon,
      route: "calendar-page",
      color: theme === "dark" ? "#877773" : "#f3eae0",
      description: "Manage your elite events calendar, including private showcases, exclusive gatherings, and invitation-only investment summits tailored to your interests.",
      iconAnimation: pulseAnimation,
    },
    {
      name: "Playbook Store",
      icon: BookOpen,
      route: "play-books",
      color: theme === "dark" ? "#877773" : "#f3eae0",
      description: "Discover and acquire premium investment playbooks and wealth preservation strategies developed by leading global experts and institutions.",
      iconAnimation: pulseAnimation,
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
        <Card className={`overflow-hidden ${theme === "dark" ? "bg-darkPrimary-600 text-white" : "bg-primary-50 text-black"} font-body`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <span role="img" aria-label="diamond">💎</span>
              <Heading2 className={`text-xl md:text-2xl font-heading font-bold tracking-wide ${theme === "dark" ? "text-white" : "text-black"}`}>
                Elite Pulse
              </Heading2>
            </div>
            <Lead className="font-body font-regular tracking-wide">Your Daily Dose of Wealth Insights</Lead>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {developments.length > 0 && (
                <div className="flex flex-col space-y-4">
                  {[0, 1, 2].map((offset) => {
                    const index = (spotlightIndex + offset) % developments.length;
                    return (
                      <div key={`news-block-${offset}`} className="h-[143px] overflow-hidden relative news-block card-stack-item">
                        <div 
                          className="p-3 md:p-4 rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden h-full"
                          style={{
                            background: theme === "dark" ? 
                              `linear-gradient(135deg, #695d7e ${offset * 8}%, #5d5073)` : 
                              `linear-gradient(135deg, #d8d0e8 ${offset * 8}%, #c6b8e0)`,
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
                              <h3 className="text-sm md:text-base font-semibold line-clamp-1">
                                {developments[index].title}
                              </h3>
                              <p className="text-xs md:text-sm mt-1 mb-2 line-clamp-3 flex-grow">
                                {developments[index].description}
                              </p>
                              <div className="flex justify-between items-end mt-auto">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="bg-primary/80 text-primary-foreground text-xs shadow-[0_8px_16px_rgba(0,0,0,0.3)] rounded-full transform hover:-translate-y-0.5 transition-all hover:shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                                    {developments[index].industry}
                                  </Badge>
                                  <div className="text-xs md:text-sm font-bold whitespace-nowrap bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md inline-block">
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
          <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-darkPrimary-600 text-white" : "bg-primary-50 text-black"}`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Hammer className="w-6 h-6 text-primary" />
                <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                  The Foundry
                </Heading2>
              </div>
              <CardDescription className="font-body tracking-wide text-xl font-normal">Where Winning Strategies Are Forged</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {visibleExperienceZone.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Button
                      onClick={(e) => handleNavigate(e, item.route)}
                      className="w-full h-[260px] md:h-[300px] p-4 md:p-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                      style={{
                        background: item.color,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden h-[160px]">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-3 mt-4" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Heading3 className="mb-2 mt-0 text-shadow">{item.name}</Heading3>
                          {item.beta && (
                            <Badge variant="secondary" className="ml-1 badge-beta">
                              Beta
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm md:text-sm max-w-full line-clamp-4 md:line-clamp-3 overflow-hidden whitespace-normal break-words font-normal">
                          {typeof item.description === "string" ? item.description : item.description}
                        </div>
                      </div>
                      <div className="flex justify-between items-center w-full mb-2">
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
        )}

        {/* Crown World Section */}
        <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-darkPrimary-600 text-white" : "bg-primary-50 text-black"}`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-primary" />
              <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                Crown World
              </Heading2>
            </div>
            <CardDescription className="font-body tracking-wide text-xl font-normal">Exclusive opportunities for the elite</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {crownWorldItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    onClick={(e) => handleNavigate(e, item.route)}
                    className="w-full h-[260px] md:h-[300px] p-4 md:p-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                    style={{
                      background: item.color,
                      color: theme === "dark" ? "white" : "black",
                    }}
                  >
                    <div className="flex flex-col items-start w-full overflow-hidden h-[160px]">
                      <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-3 mt-4" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <Heading3 className="mb-2 mt-0 text-shadow">{item.name}</Heading3>
                        {item.beta && (
                          <Badge variant="secondary" className="ml-1 badge-beta">
                            Beta
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm md:text-sm max-w-full line-clamp-4 md:line-clamp-3 overflow-hidden whitespace-normal break-words font-normal">
                        {typeof item.description === "string" ? item.description : item.description}
                      </div>
                    </div>
                    <div className="flex justify-between items-center w-full mb-2">
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
          <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-darkPrimary-600 text-white" : "bg-primary-50 text-black"}`}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-primary" />
                <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                  Founder's Desk
                </Heading2>
              </div>
              <CardDescription className="font-body tracking-wide text-xl font-normal">Your personal command center</CardDescription>
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
                      className="w-full h-[260px] md:h-[300px] p-4 md:p-8 flex flex-col items-start justify-between text-left rounded-3xl transition-all duration-300 hover:scale-105 font-button font-semibold overflow-hidden"
                      style={{
                        background: item.color,
                        color: theme === "dark" ? "white" : "black",
                      }}
                    >
                      <div className="flex flex-col items-start w-full overflow-hidden h-[160px]">
                        <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-3 mt-4" />
                        <Heading3 className="mb-2 mt-0 text-shadow">{item.name}</Heading3>
                        <div className="text-sm md:text-sm max-w-full line-clamp-4 md:line-clamp-3 overflow-hidden whitespace-normal break-words font-normal">
                          {item.description}
                        </div>
                      </div>
                      <div className="flex items-center w-full justify-end mb-2">
                        <span className="mr-1 md:mr-2 text-xs md:text-sm font-button font-semibold">Explore</span>
                        <div className="clickable-arrow ml-1 flex-shrink-0">
                          <ArrowRight className="w-4 h-4" />
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