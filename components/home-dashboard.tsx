// components/home-dashboard.tsx

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
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
import { OnboardingWizard } from "./onboarding-wizard"
import { useOnboarding } from "@/contexts/onboarding-context"
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
}: {
  user: User
  onNavigate: (route: string) => void
  isFromSignupFlow: boolean
}) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const [developments, setDevelopments] = useState<Development[]>([])
  const { currentStep, setCurrentStep, isWizardCompleted, setIsFromSignupFlow } = useOnboarding()
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(isFromSignupFlow && !isWizardCompleted)

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
    const interval = setInterval(() => {
      setSpotlightIndex((prevIndex) => (prevIndex + 1) % Math.max(developments.length, 1))
    }, 10000)
    return () => clearInterval(interval)
  }, [developments.length])

  useEffect(() => {
    return () => {
      setShowOnboardingWizard(false)
      setIsFromSignupFlow(false)
    }
  }, [setIsFromSignupFlow])

  // All available sections
  const experienceZone: ExperienceZoneItem[] = [
    {
      name: "War Room",
      icon: Shield,
      route: "war-room",
      color: "linear-gradient(145deg, #8B0000, #B22222)",
      description: (
        <>
          <p className="text-xs md:text-sm">Access your strategic</p>
          <p className="text-xs md:text-sm">playbooks</p>
        </>
      ),
      iconAnimation: pulseAnimation,
    },
    {
      name: "Strategy Vault",
      icon: Globe,
      route: "strategy-vault",
      color: "linear-gradient(145deg, #005f40, #00331f)",
      description: (
        <>
          <p className="text-xs md:text-sm">Where the Wealth World</p>
          <p className="text-xs md:text-sm mb-2">Takes Center Stage</p>
          <div className="mt-1">
            <LiveButton />
          </div>
        </>
      ),
      iconAnimation: pulseAnimation,
    },
    {
      name: "Tactics Lab",
      icon: Beaker,
      route: "strategy-engine",
      color: "linear-gradient(145deg, #2C3E50, #4A5D70, #34495E)",
      description: (
        <>
          <p className="text-xs md:text-sm text-white">Experiment.</p>
          <p className="text-xs md:text-sm text-white mb-2">Master. Dominate.</p>
          <div className="mt-1">
            <Badge variant="secondary" className={`${theme === "dark" ? "text-white" : "text-black"}`}>
              Beta
            </Badge>
          </div>
        </>
      ),
      iconAnimation: pulseAnimation,
      beta: true,
    },
  ]

  const crownWorldItems = [
    {
      name: "Privé Exchange",
      icon: Crown,
      route: "prive-exchange",
      color: "linear-gradient(145deg, #FFD700, #FFA500)",
      description: (
        <>
          <p>Exclusive marketplace</p>
          <p>for elite assets</p>
        </>
      ),
      iconAnimation: pulseAnimation,
      showLive: true,
    },
    {
      name: "Social Hub",
      icon: Users,
      route: "social-hub",
      color: "linear-gradient(145deg, #C0C0C0, #A9A9A9, #808080)",
      description: (
        <>
          <p>Exclusive network for</p>
          <p>elite connections</p>
        </>
      ),
      iconAnimation: pulseAnimation,
    },
  ]

  const foundersDeskItems = [
    {
      name: "Calendar",
      icon: CalendarIcon,
      route: "calendar-page",
      color: "linear-gradient(145deg, #0F52BA, #4169E1)",
      description: "Manage your exclusive events",
      iconAnimation: pulseAnimation,
    },
    {
      name: "Playbook Store",
      icon: BookOpen,
      route: "play-books",
      color: "linear-gradient(145deg, #8A2BE2, #9370DB)",
      description: "Access premium strategies",
      iconAnimation: pulseAnimation,
    },
  ]

  const handleNavigate = (e: React.MouseEvent, route: string, developmentId?: string) => {
    e.preventDefault()
    
    if (route === "play-books" && currentStep === "playbooks") {
      setCurrentStep("industryTrends")
    } else if (route === "strategy-vault" && currentStep === "industryTrends") {
      setCurrentStep("orangeStrategy")
    }

    if (developmentId) {
      onNavigate(`strategy-vault?developmentId=${developmentId}&industry=All&timeRange=1w`)
    } else {
      onNavigate(route)
    }
  }

  const handleCloseOnboardingWizard = () => {
    setShowOnboardingWizard(false)
  }

  return (
    <>
      <MetaTags
        title="Dashboard | HNWI Chronicles"
        description="Access your personalized wealth intelligence dashboard."
        image="https://hnwichronicles.com/dashboard-og-image.jpg"
        url="https://hnwichronicles.com/dashboard"
      />
      <div className="space-y-4 md:space-y-6">
        <Card className={`overflow-hidden ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"} font-body`}>
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
            <AnimatePresence mode="wait">
              {developments[spotlightIndex] && (
                <motion.div
                  key={developments[spotlightIndex].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="p-3 md:p-5 rounded-lg bg-gradient-to-br from-[#1A0F2E] to-[#2D1B4E] cursor-pointer hover:bg-gradient-to-tl hover:from-[#2D1B4E] hover:to-[#3D2A5C] transition-all"
                  style={{
                    boxShadow: "0 4px 15px rgba(45, 27, 78, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                  onClick={(e) => handleNavigate(e, "strategy-vault", developments[spotlightIndex].id)}
                >
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    {developments[spotlightIndex].title}
                  </h3>
                  <p className="text-xs md:text-sm mb-2 md:mb-4 text-white">
                    {developments[spotlightIndex].description}
                  </p>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs md:text-sm">
                        {developments[spotlightIndex].industry}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs md:text-sm">
                        {developments[spotlightIndex].product}
                      </Badge>
                    </div>
                    <div className="text-xs md:text-sm text-white">
                      Date:{" "}
                      {new Date(developments[spotlightIndex].date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* The Foundry Section */}
        <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Hammer className="w-6 h-6 text-primary" />
              <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                The Foundry
              </Heading2>
            </div>
            <CardDescription className="font-body tracking-wide">Where Winning Strategies Are Forged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {experienceZone.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    onClick={(e) => handleNavigate(e, item.route)}
                    className="w-full h-[200px] md:h-[300px] p-4 md:p-8 flex flex-col items-center justify-between text-center rounded-xl transition-all duration-300 hover:scale-105 font-button font-semibold"
                    style={{
                      background: item.color,
                      color: "white",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 md:mb-6" />
                      <Heading3 className="mb-2 md:mb-4 mt-1 md:mt-2 text-shadow">{item.name}</Heading3>
                      <div className="text-xs md:text-base max-w-[150px] md:max-w-[200px] flex-grow">
                        {typeof item.description === "string" ? item.description : item.description}
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <span className="mr-1 md:mr-2 text-sm md:text-lg font-button font-semibold">Explore</span>
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crown World Section */}
        <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-primary" />
              <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                Crown World
              </Heading2>
            </div>
            <CardDescription className="font-body tracking-wide">Exclusive opportunities for the elite</CardDescription>
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
                    className="w-full h-[200px] md:h-[300px] p-4 md:p-8 flex flex-col items-center justify-between text-center rounded-xl transition-all duration-300 hover:scale-105 font-button font-semibold"
                    style={{
                      background: item.color,
                      color: "white",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 md:mb-6" />
                      <Heading3 className="mb-2 md:mb-4 mt-1 md:mt-2 text-shadow">{item.name}</Heading3>
                      <div className="text-xs md:text-sm max-w-[150px] md:max-w-[200px] flex-grow text-center flex flex-col items-center justify-center">
                        {typeof item.description === "string" ? item.description : item.description}
                      </div>
                      {item.showLive && (
                        <div className="mt-1">
                          <LiveButton />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <span className="mr-1 md:mr-2 text-sm md:text-lg font-button font-semibold">Explore</span>
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Founder's Desk Section */}
        <Card className={`mt-4 md:mt-6 ${theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"}`}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <Heading2 className="text-xl md:text-2xl font-heading font-bold tracking-wide text-primary">
                Founder's Desk
              </Heading2>
            </div>
            <CardDescription className="font-body tracking-wide">Your personal command center</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {foundersDeskItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    onClick={(e) => handleNavigate(e, item.route)}
                    className="w-full h-[200px] md:h-[300px] p-4 md:p-8 flex flex-col items-center justify-between text-center rounded-xl transition-all duration-300 hover:scale-105 font-button font-semibold"
                    style={{
                      background: item.color,
                      color: "white",
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <AnimatedIcon icon={item.icon} animation={item.iconAnimation} className="mb-2 md:mb-6" />
                      <Heading3 className="mb-2 md:mb-4 mt-1 md:mt-2 text-shadow">{item.name}</Heading3>
                      <div className="text-xs md:text-sm max-w-[150px] md:max-w-[200px] flex-grow">
                        {item.description}
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <span className="mr-1 md:mr-2 text-sm md:text-lg font-button font-semibold">Explore</span>
                      <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {showOnboardingWizard && <OnboardingWizard onClose={handleCloseOnboardingWizard} />}
      </div>
    </>
  )
}