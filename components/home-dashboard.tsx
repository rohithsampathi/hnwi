// components/home-dashboard.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Diamond,
  BookOpen,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { getMetallicCardStyle } from "@/lib/colors"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Target, AlertCircle, BarChart3, PieChart, Lightbulb } from "lucide-react"
import { getMatteCardStyle } from "@/lib/colors"
// import { OnboardingWizard } from "./onboarding-wizard"
// import { useOnboarding } from "@/contexts/onboarding-context"
import { Heading2, Lead } from "@/components/ui/typography"
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
  summary: string
  numerical_data?: Array<{
    number: string
    context: string
    unit: string
    industry: string
    product: string
    source: string
    article_date: string
  }>
}

interface AnalysisSection {
  title: string
  content: Array<{
    text: string
    isBullet: boolean
  }>
}

interface FormattedAnalysis {
  summary: string
  sections: AnalysisSection[]
  winners?: AnalysisSection
  losers?: AnalysisSection
  potentialMoves?: AnalysisSection
}

const toTitleCase = (str: string) => {
  const cleanStr = str.replace(/\*\*/g, '');
  return cleanStr
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const formatAnalysis = (summary: string): FormattedAnalysis => {
  const lines = summary.split("\n")
  let currentSection = { title: "", content: [] as Array<{text: string, isBullet: boolean}> }
  const sections = [] as Array<{title: string, content: Array<{text: string, isBullet: boolean}>}>
  const summaryContent = [] as string[]
  let winners: AnalysisSection | undefined
  let losers: AnalysisSection | undefined
  let potentialMoves: AnalysisSection | undefined

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (trimmedLine === "") return

    if ((trimmedLine.startsWith("##") || trimmedLine.toUpperCase() === trimmedLine) && trimmedLine !== "") {
      if (currentSection.title) {
        const lowerTitle = currentSection.title.toLowerCase()
        
        if (lowerTitle.includes("winner")) {
          winners = { ...currentSection }
        } else if (lowerTitle.includes("loser")) {
          losers = { ...currentSection }
        } else if (lowerTitle.includes("potential") && lowerTitle.includes("move")) {
          potentialMoves = { ...currentSection }
        } else {
          sections.push(currentSection)
        }
        
        currentSection = { title: "", content: [] }
      }
      const titleText = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      currentSection.title = toTitleCase(titleText)
    } else if (currentSection.title) {
      const explicitBulletPoint = trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\.\s/.test(trimmedLine)
      
      const bulletSections = [
        "key moves", "long term", "long-term", "wealth impact", "sentiment tracker", 
        "market impact", "investment implications", "impact", "implications", "tracker", "moves"
      ]
      const shouldTreatAsBullet = bulletSections.some(section => 
        currentSection.title.toLowerCase().includes(section)
      )
      
      let formattedText = trimmedLine.replace(/^[-•]\s*|^\d+\.\s*/, "")
      formattedText = formattedText.replace(
        /(Opportunities:|Risks:|Recommendations & Future Paths:|Winners:|Losers:)/g,
        "<strong>$1</strong>",
      )

      if (shouldTreatAsBullet && !explicitBulletPoint) {
        const parts = formattedText.split(/\.\s+(?=[A-Z])/).filter(part => part.trim().length > 0)
        
        parts.forEach((part, index) => {
          let cleanPart = part.trim()
          if (index < parts.length - 1 && !cleanPart.endsWith('.')) {
            cleanPart += '.'
          }
          
          if (cleanPart.length > 0) {
            currentSection.content.push({
              text: cleanPart,
              isBullet: true,
            })
          }
        })
      } else {
        const isBulletPoint = explicitBulletPoint || shouldTreatAsBullet
        currentSection.content.push({
          text: formattedText,
          isBullet: isBulletPoint,
        })
      }
    } else {
      const formattedLine = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      summaryContent.push(formattedLine)
    }
  })

  if (currentSection.title) {
    const lowerTitle = currentSection.title.toLowerCase()
    
    if (lowerTitle.includes("winner")) {
      winners = { ...currentSection }
    } else if (lowerTitle.includes("loser")) {
      losers = { ...currentSection }
    } else if (lowerTitle.includes("potential") && lowerTitle.includes("move")) {
      potentialMoves = { ...currentSection }
    } else {
      sections.push(currentSection)
    }
  }

  return {
    summary: summaryContent.join("\n"),
    sections: sections,
    winners,
    losers,
    potentialMoves,
  }
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
  const [selectedDevelopment, setSelectedDevelopment] = useState<Development | null>(null)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
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

  // Set first development as selected when developments load
  useEffect(() => {
    if (developments.length > 0 && !selectedDevelopment) {
      setSelectedDevelopment(developments[0])
    }
  }, [developments, selectedDevelopment])

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setScreenSize('mobile')
      } else if (window.innerWidth < 1024) {
        setScreenSize('tablet')  
      } else {
        setScreenSize('desktop')
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleDevelopmentSelect = (development: Development) => {
    setSelectedDevelopment(development)
  }

  // Commenting out onboarding cleanup effect
  // useEffect(() => {
  //   return () => {
  //     setShowOnboardingWizard(false)
  //     setIsFromSignupFlow(false)
  //   }
  // }, [setIsFromSignupFlow])

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

  // Centralized heading style for section titles
  const sectionHeadingClass = `text-2xl md:text-3xl font-heading font-bold tracking-wide ${
    theme === "dark" ? "text-white" : "text-black"
  }`;

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
        {/* Two Column Layout */}
        {developmentsLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <CrownLoader size="lg" text="Loading strategic insights..." />
          </div>
        ) : screenSize === 'mobile' ? (
          // Mobile: Single column with original scrolling cards
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
              {developments.length > 0 && (
                <div className="relative px-6">
                  <div className="overflow-x-scroll overflow-y-hidden -mx-6 px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                          onClick={() => handleDevelopmentSelect(development)}
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
                                Tap to Expand
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
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Desktop/Tablet: Two column layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 h-[calc(100vh-180px)]">
            {/* Left Column - Expanded Insider Brief */}
            <div className="md:col-span-1 lg:col-span-3 h-full">
              <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-3">
                  <div className="flex items-center space-x-2">
                    <Diamond className={`w-5 h-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <Heading2 className={`text-xl font-bold ${sectionHeadingClass}`}>
                      Elite Pulse
                    </Heading2>
                  </div>
                  <Lead className="font-body font-regular tracking-wide text-sm">What the world's top 1% realise before others know</Lead>
                </CardHeader>
                <CardContent className="px-0 flex-1 overflow-hidden">
                  {selectedDevelopment ? (
                    <div className="px-6 h-full flex flex-col">
                      {(() => {
                        const analysis = formatAnalysis(selectedDevelopment.summary);
                        return (
                          <>
                            {/* Header with title and metadata - Fixed height */}
                            <div className="flex-shrink-0 mb-2">
                              <div className="flex flex-col gap-2">
                                {selectedDevelopment.product && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                                  >
                                    {selectedDevelopment.product}
                                  </Badge>
                                )}
                                <h3 className={`text-lg font-black leading-tight ${
                                  theme === "dark" ? "text-primary" : "text-black"
                                }`}>
                                  {selectedDevelopment.title}
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed ${
                                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                                }`}>
                                  {selectedDevelopment.description}
                                </p>
                                
                                <div className="flex justify-between items-center pt-1">
                                  <PremiumBadge className="font-bold px-2 py-1 rounded-full text-xs">
                                    {selectedDevelopment.industry}
                                  </PremiumBadge>
                                  
                                  <div className={`text-xs font-medium ${
                                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  }`}>
                                    {new Date(selectedDevelopment.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long", 
                                      day: "numeric"
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 space-y-2 overflow-y-auto">
                              {/* HByte Summary */}
                              <div 
                                className={`p-6 border rounded-xl ${getMatteCardStyle(theme).className}`}
                                style={getMatteCardStyle(theme).style}
                              >
                                <div className="flex items-center mb-4">
                                  <div className="p-2 rounded-lg bg-primary/20 mr-3">
                                    <Brain className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                  </div>
                                  <h4 className="text-xl font-bold">HByte Summary</h4>
                                </div>
                                <div className="text-sm leading-relaxed">
                                  <p className="font-medium">{analysis.summary}</p>
                                </div>
                              </div>

                              {/* Winners */}
                              {analysis.winners && (
                                <div 
                                  className="p-5 rounded-xl border"
                                  style={{
                                    background: theme === "dark" ? 
                                      "linear-gradient(135deg, rgba(0,80,0,0.3) 0%, rgba(0,120,0,0.5) 100%)" : 
                                      "linear-gradient(135deg, rgba(200,255,200,0.3) 0%, rgba(150,255,150,0.5) 100%)",
                                    backdropFilter: "blur(8px)",
                                    border: theme === "dark" ? "1px solid rgba(0,255,0,0.15)" : "1px solid rgba(0,180,0,0.15)"
                                  }}
                                >
                                  <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-lg bg-green-500/20 mr-3">
                                      <TrendingUp className="h-4 w-4 text-green-500" />
                                    </div>
                                    <h5 className="font-bold text-base text-green-600 dark:text-green-400">Winners</h5>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {analysis.winners.content.map((item, pIndex) => (
                                      <div key={`winner-${pIndex}`} className="text-sm">
                                        {item.isBullet ? (
                                          <div className="flex items-start py-1">
                                            <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-green-500/60"></div>
                                            <span 
                                              className="leading-relaxed font-medium"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <p 
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Losers */}
                              {analysis.losers && (
                                <div 
                                  className="p-5 rounded-xl border"
                                  style={{
                                    background: theme === "dark" ? 
                                      "linear-gradient(135deg, rgba(80,0,0,0.3) 0%, rgba(120,0,0,0.5) 100%)" : 
                                      "linear-gradient(135deg, rgba(255,200,200,0.3) 0%, rgba(255,150,150,0.5) 100%)",
                                    backdropFilter: "blur(8px)",
                                    border: theme === "dark" ? "1px solid rgba(255,0,0,0.15)" : "1px solid rgba(180,0,0,0.15)"
                                  }}
                                >
                                  <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-lg bg-red-500/20 mr-3">
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    </div>
                                    <h5 className="font-bold text-base text-red-600 dark:text-red-400">Losers</h5>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {analysis.losers.content.map((item, pIndex) => (
                                      <div key={`loser-${pIndex}`} className="text-sm">
                                        {item.isBullet ? (
                                          <div className="flex items-start py-1">
                                            <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-red-500/60"></div>
                                            <span 
                                              className="leading-relaxed font-medium"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <p 
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Potential Moves */}
                              {analysis.potentialMoves && (
                                <div 
                                  className="p-5 rounded-xl border"
                                  style={{
                                    background: theme === "dark" ? 
                                      "linear-gradient(135deg, rgba(60,60,0,0.3) 0%, rgba(100,100,0,0.5) 100%)" : 
                                      "linear-gradient(135deg, rgba(255,255,200,0.3) 0%, rgba(255,255,150,0.5) 100%)",
                                    backdropFilter: "blur(8px)",
                                    border: theme === "dark" ? "1px solid rgba(255,255,0,0.15)" : "1px solid rgba(200,200,0,0.15)"
                                  }}
                                >
                                  <div className="flex items-center mb-3">
                                    <div className="p-2 rounded-lg bg-yellow-500/20 mr-3">
                                      <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <h5 className="font-bold text-base text-yellow-700 dark:text-yellow-300">Potential Moves</h5>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {analysis.potentialMoves.content.map((item, pIndex) => (
                                      <div key={`move-${pIndex}`} className="text-sm">
                                        {item.isBullet ? (
                                          <div className="flex items-start py-1">
                                            <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-yellow-500/60"></div>
                                            <span 
                                              className="leading-relaxed font-medium"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <p 
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            }}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Analysis Sections - All sections in full */}
                              {analysis.sections.map((section, index) => {
                                const getSectionIcon = (title: string) => {
                                  const lowerTitle = title.toLowerCase()
                                  if (lowerTitle.includes('impact') || lowerTitle.includes('matter')) return Target
                                  if (lowerTitle.includes('move') || lowerTitle.includes('trend')) return TrendingUp
                                  if (lowerTitle.includes('risk') || lowerTitle.includes('warning')) return AlertCircle
                                  if (lowerTitle.includes('data') || lowerTitle.includes('number')) return BarChart3
                                  return PieChart
                                }
                                
                                const IconComponent = getSectionIcon(section.title)
                                
                                return (
                                  <div 
                                    key={`section-${index}`} 
                                    className={`p-5 border rounded-xl ${getMatteCardStyle(theme).className}`}
                                    style={getMatteCardStyle(theme).style}
                                  >
                                    <div className="flex items-center mb-3">
                                      <div className="p-2 rounded-lg bg-primary/20 mr-3">
                                        <IconComponent className={`h-4 w-4 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                      </div>
                                      <h5 className="font-bold text-base">{section.title}</h5>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {section.content.map((item, pIndex) => (
                                        <div key={`item-${pIndex}`} className="text-sm">
                                          {item.isBullet ? (
                                            <div className="flex items-start py-1">
                                              <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                              <span 
                                                className="leading-relaxed font-medium"
                                                dangerouslySetInnerHTML={{
                                                  __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                }}
                                              />
                                            </div>
                                          ) : (
                                            <p 
                                              className="leading-relaxed font-medium bg-primary/5 p-3 rounded-lg border-l-2 border-primary/30"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                              }}
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}

                              {/* Numerical Data */}
                              {selectedDevelopment.numerical_data && selectedDevelopment.numerical_data.length > 0 && (
                                <div 
                                  className={`p-5 rounded-xl border ${getMatteCardStyle(theme).className}`}
                                  style={getMatteCardStyle(theme).style}
                                >
                                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                                    <BarChart3 className={`h-5 w-5 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                    Numerical Data
                                  </h4>
                                  <div className="space-y-3">
                                    {selectedDevelopment.numerical_data.map((item, index) => (
                                      <div key={`numerical-${index}`} className="flex items-start text-sm">
                                        <Lightbulb className={`h-4 w-4 mr-3 flex-shrink-0 mt-1 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                        <span className="leading-relaxed font-medium">
                                          <span className="font-bold">
                                            {item.number} {item.unit}
                                          </span>{" "}
                                          - <span>{item.context.replace(/^[-\d]+\.\s*/, "")}</span>
                                          {item.source && (
                                            <span className="text-xs text-muted-foreground ml-2">(Source: {item.source})</span>
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full px-6">
                      <p className="text-muted-foreground text-center">Select a development from the right panel to view the full brief</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Small Cards */}
            <div className="md:col-span-1 lg:col-span-2 h-full">
              <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-2">
                  <Lead className="font-body font-regular tracking-wide text-sm text-muted-foreground">Latest developments</Lead>
                </CardHeader>
                <CardContent className="px-0 flex-1 overflow-hidden">
                  {developments.length > 0 ? (
                    <div className="px-4 h-full overflow-y-auto space-y-4">
                      {developments.map((development, index) => (
                        <motion.div
                          key={`pulse-card-${development.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative ${
                            selectedDevelopment?.id === development.id
                              ? `border-2 border-primary ${theme === "dark" ? "bg-primary/20 shadow-lg shadow-primary/25" : "bg-primary/10 shadow-lg shadow-primary/15"} before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-primary/30 before:pointer-events-none`
                              : "border-2 border-transparent hover:border-primary/30 hover:bg-primary/5"
                          }`}
                          style={{
                            ...getMetallicCardStyle(theme).style,
                          }}
                          onClick={() => handleDevelopmentSelect(development)}
                        >
                          <div className="flex flex-col space-y-3">
                            {/* Industry Badge and Date */}
                            <div className="flex justify-between items-start mb-2">
                              <PremiumBadge className="font-bold px-3 py-1.5 rounded-full text-sm">
                                {development.industry}
                              </PremiumBadge>
                              <div className={`text-sm font-medium ${
                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                              }`}>
                                {new Date(development.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric"
                                })}
                              </div>
                            </div>
                            
                            {/* Title */}
                            <h4 className={`text-sm font-bold line-clamp-3 leading-tight ${
                              theme === "dark" ? "text-primary" : "text-black"
                            }`}>
                              {development.title}
                            </h4>
                            
                            {/* Description */}
                            <p className={`text-sm line-clamp-4 leading-relaxed ${
                              theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}>
                              {development.description}
                            </p>
                            
                            {/* Source */}
                            {development.source && (
                              <div className={`text-xs font-medium pt-2 border-t border-primary/20 ${
                                theme === "dark" ? "text-gray-400" : "text-gray-600"
                              }`}>
                                Source: {development.source}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
                      <p className="text-muted-foreground text-center text-sm">No developments available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}


        {/* Commenting out onboarding wizard */}
        {/* {showOnboardingWizard && <OnboardingWizard onClose={handleCloseOnboardingWizard} />} */}
      </div>
    </>
  )
}