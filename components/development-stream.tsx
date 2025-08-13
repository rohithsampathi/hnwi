"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, Lightbulb, ArrowRight, TrendingUp, Target, Brain, AlertCircle, BarChart3, PieChart } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react" // Import React to fix the undeclared JSX variable
import { useTheme } from "@/contexts/theme-context"
import { AuthCheck } from "@/components/auth-check"
import { getCardColors, getMatteCardStyle } from "@/lib/colors"

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product: string
  date?: string
  url: string
  summary: string
  source?: string
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

interface DevelopmentStreamProps {
  selectedIndustry: string
  duration: string
  getIndustryColor: (industry: string) => string
  expandedDevelopmentId: string | null
}

import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"


const queenBullet = "list-none";

const toTitleCase = (str: string) => {
  // Remove ** formatting
  const cleanStr = str.replace(/\*\*/g, '');
  // Convert to title case (capitalize first letter of each word)
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

    // Check for markdown style ## headings and handle all uppercase headings
    if ((trimmedLine.startsWith("##") || trimmedLine.toUpperCase() === trimmedLine) && trimmedLine !== "") {
      if (currentSection.title) {
        const lowerTitle = currentSection.title.toLowerCase()
        
        // Check if this is a special section to extract separately
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
      // Remove ## prefix if present
      const titleText = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      currentSection.title = toTitleCase(titleText)
    } else if (currentSection.title) {
      const explicitBulletPoint = trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\.\s/.test(trimmedLine)
      
      // Check if this section should treat all lines as bullet points and split by periods
      const bulletSections = [
        "key moves", 
        "long term", 
        "long-term",
        "wealth impact",
        "sentiment tracker", 
        "market impact", 
        "investment implications",
        "impact",
        "implications",
        "tracker",
        "moves"
      ]
      const shouldTreatAsBullet = bulletSections.some(section => 
        currentSection.title.toLowerCase().includes(section)
      )
      
      let formattedText = trimmedLine.replace(/^[-•]\s*|^\d+\.\s*/, "")
      formattedText = formattedText.replace(
        /(Opportunities:|Risks:|Recommendations & Future Paths:|Winners:|Losers:)/g,
        "<strong>$1</strong>",
      )

      // If this is a bullet section, split by periods and create separate bullets
      if (shouldTreatAsBullet && !explicitBulletPoint) {
        // Split by periods but keep periods that are likely abbreviations or decimals
        const parts = formattedText.split(/\.\s+(?=[A-Z])/).filter(part => part.trim().length > 0)
        
        parts.forEach((part, index) => {
          let cleanPart = part.trim()
          // Add period back if it was removed and it's not the last part
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
        // Regular processing for other content
        const isBulletPoint = explicitBulletPoint || shouldTreatAsBullet
        currentSection.content.push({
          text: formattedText,
          isBullet: isBulletPoint,
        })
      }
    } else {
      // Remove ## prefix from summary content as well, if present
      const formattedLine = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
      summaryContent.push(formattedLine)
    }
  })

  if (currentSection.title) {
    const lowerTitle = currentSection.title.toLowerCase()
    
    // Check if this is a special section to extract separately
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

export function DevelopmentStream({
  selectedIndustry,
  duration,
  getIndustryColor,
  expandedDevelopmentId,
}: DevelopmentStreamProps) {
  const [developments, setDevelopments] = useState<Development[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()

  const fetchDevelopments = useCallback(async () => {
    // Check authentication before making API call
    if (!isAuthenticated()) {
      console.log('User not authenticated - skipping developments fetch in development stream');
      setDevelopments([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true)
    setError(null)
    try {
      const requestBody = {
        start_date: null,
        end_date: null,
        industry: selectedIndustry === "All" ? undefined : selectedIndustry,
        product: null,
        page: 1,
        page_size: 100,
        sort_by: "date",
        sort_order: "desc",
        time_range: duration,
      }

      const data = await secureApi.post('/api/developments', requestBody, true, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache for developments
      if (data.developments && Array.isArray(data.developments)) {
        const invalidDateEntries = data.developments.filter(
          (dev: any) => !dev.date || dev.date === "" || isNaN(new Date(dev.date).getTime()),
        ).length
        if (invalidDateEntries > 0) {
          toast({
            title: "Warning",
            description: `${invalidDateEntries} development(s) have invalid or missing dates. Some information may not be displayed correctly.`,
            // If your toast type system doesn't include "warning", adjust in your theme or typing.
            // @ts-ignore
            variant: "warning",
          })
        }
        return data.developments
      } else {
        throw new Error("Invalid response format: developments array not found")
      }
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || error.status === 401) {
        console.log('Authentication required for development stream data');
        setDevelopments([]);
        setError(null); // Don't show error to user for auth issues
        return [];
      }
      
      let errorMessage = error.message || "An unknown error occurred"
      if (error.message.includes("datetime_from_date_parsing")) {
        errorMessage =
          "The server returned developments with invalid date formats. This is a server-side issue that needs to be addressed."
      }
      setError(errorMessage)
      toast({
        title: "Error",
        description: `Failed to load developments: ${errorMessage}`,
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast, duration, selectedIndustry]); // Added semicolon

  const filterDevelopments = useCallback(
    (devs: Development[]) => {
      return devs.filter((dev) => {
        const devDate = new Date(dev.date || "")
        const now = new Date()
        let startDate: Date

        switch (duration) {
          case "1d":
            startDate = new Date(now.setDate(now.getDate() - 1))
            break
          case "1w":
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case "1m":
            startDate = new Date(now.setMonth(now.getMonth() - 1))
            break
          case "1y":
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(0)
        }

        const isInDateRange = devDate >= startDate && devDate <= new Date()
        const isInIndustry = selectedIndustry === "All" || dev.industry === selectedIndustry

        return isInDateRange && isInIndustry
      })
    },
    [duration, selectedIndustry],
  );

  useEffect(() => {
    fetchDevelopments().then((fetchedDevelopments) => {
      if (fetchedDevelopments) {
        const filteredDevelopments = filterDevelopments(fetchedDevelopments)
        setDevelopments(filteredDevelopments)
        if (filteredDevelopments.length === 0) {
          setError(`No developments found for ${selectedIndustry} in the last ${duration}`)
        } else {
          setError(null)
        }

        if (expandedDevelopmentId) {
          setExpandedCards((prev) => ({ ...prev, [expandedDevelopmentId]: true }))
        }
      }
    })
  }, [fetchDevelopments, filterDevelopments, selectedIndustry, duration, expandedDevelopmentId]);

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "") return "Date not available"
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  };

  return (
    <AuthCheck>
      <div className="p-1 md:p-2">
        {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <CrownLoader size="lg" text="Loading development updates..." />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            An error occurred while fetching developments. Please try again later or contact support if the issue
            persists.
          </p>
        </div>
      ) : (
        <div className="w-full space-y-6">
          {developments.map((dev) => (
            <div key={dev.id} className="min-h-[179px] relative">
              <div 
                className={`p-3 md:p-4 cursor-pointer transition-all duration-300 min-h-full relative overflow-hidden ${getMatteCardStyle(theme).className}`}
                style={getMatteCardStyle(theme).style}
                onClick={() => toggleCardExpansion(dev.id)}
              >
                <div className="h-full flex flex-col justify-between py-2">
                  {/* Product badge and heading together */}
                  <div className="flex flex-col">
                    {dev.product && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit mb-1"
                      >
                        {dev.product}
                      </Badge>
                    )}
                    <h3 className={`text-lg font-black mb-3 line-clamp-2 ${
                      theme === "dark" ? "text-primary" : "text-black"
                    }`}>
                      {dev.title}
                    </h3>
                  </div>
                  
                  {/* Body */}
                  <p className={`text-sm font-medium leading-relaxed flex-grow ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}>
                    {dev.description}
                  </p>
                  
                  {/* Bottom row with Read More, Date, and Category Badge */}
                  <div className="flex justify-between items-center mt-4">
                    <div className={`text-sm font-bold hover:underline cursor-pointer ${
                      theme === "dark" ? "text-primary" : "text-black"
                    }`}>
                      Read More
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`text-xs font-medium ${
                        theme === "dark" 
                          ? "text-gray-200" 
                          : "text-gray-700"
                      }`}>
                        {dev.date ? new Date(dev.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "Date not available"}
                      </div>
                      
                      <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">
                        {dev.industry || "Unknown Industry"}
                      </PremiumBadge>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedCards[dev.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2"
                    >
                      {(() => {
                        const analysis = formatAnalysis(dev.summary);
                        return (
                          <div className="w-full">
                        {/* Premium Executive Summary Card */}
                        <div 
                          className={`mb-6 p-6 border ${getMatteCardStyle(theme).className}`}
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

                        {/* Winners and Losers Boxes */}
                        {(analysis.winners || analysis.losers) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                                    <TrendingUp className={`h-4 w-4 text-green-500`} />
                                  </div>
                                  <h5 className="font-bold text-base text-green-600 dark:text-green-400">Winners</h5>
                                </div>
                                
                                <div className="space-y-2">
                                  {analysis.winners!.content.map((item, pIndex) => (
                                    <div key={`winner-${pIndex}`} className="text-sm">
                                      {item.isBullet ? (
                                        <div className="flex items-start py-1">
                                          <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-green-500/60"></div>
                                          <span 
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <p 
                                          className="leading-relaxed font-medium"
                                          dangerouslySetInnerHTML={{
                                            __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
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
                                    <AlertCircle className={`h-4 w-4 text-red-500`} />
                                  </div>
                                  <h5 className="font-bold text-base text-red-600 dark:text-red-400">Losers</h5>
                                </div>
                                
                                <div className="space-y-2">
                                  {analysis.losers!.content.map((item, pIndex) => (
                                    <div key={`loser-${pIndex}`} className="text-sm">
                                      {item.isBullet ? (
                                        <div className="flex items-start py-1">
                                          <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-red-500/60"></div>
                                          <span 
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <p 
                                          className="leading-relaxed font-medium"
                                          dangerouslySetInnerHTML={{
                                            __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Potential Moves Section */}
                        {analysis.potentialMoves && (
                          <div className="mb-6">
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
                                  <TrendingUp className={`h-4 w-4 text-yellow-600 dark:text-yellow-400`} />
                                </div>
                                <h5 className="font-bold text-base text-yellow-700 dark:text-yellow-300">Potential Moves</h5>
                              </div>
                              
                              <div className="space-y-2">
                                {analysis.potentialMoves!.content.map((item, pIndex) => (
                                  <div key={`move-${pIndex}`} className="text-sm">
                                    {item.isBullet ? (
                                      <div className="flex items-start py-1">
                                        <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-yellow-500/60"></div>
                                        <span 
                                          className="leading-relaxed font-medium"
                                          dangerouslySetInnerHTML={{
                                            __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <p 
                                        className="leading-relaxed font-medium"
                                        dangerouslySetInnerHTML={{
                                          __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Analysis Sections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className={`p-5 border ${getMatteCardStyle(theme).className}`}
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
                                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <p 
                                          className="leading-relaxed font-medium bg-primary/5 p-3 rounded-lg border-l-2 border-primary/30"
                                          dangerouslySetInnerHTML={{
                                            __html: item.text.replace(/\*\*(.*?)\*\*/g, '$1')
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      
                      {dev.numerical_data && dev.numerical_data.length > 0 && (
                        <div className="bg-muted dark:bg-primary-800 p-4 rounded-md mt-4">
                          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            Numerical data
                          </h4>
                          <ul className={`${queenBullet} space-y-2`}>
                            {dev.numerical_data.map((item, index) => (
                              <li key={`numerical-${index}`} className="text-sm text-muted-foreground dark:text-gray-100 flex items-start">
                                <Lightbulb className={`h-4 w-4 mr-2 flex-shrink-0 mt-1 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                <span>
                                  <span className="font-medium dark:text-white">
                                    {item.number} {item.unit}
                                  </span>{" "}
                                  - <span className="dark:text-gray-100">{item.context.replace(/^[-\d]+\.\s*/, "")}</span>
                                  {item.source && (
                                    <span className="text-xs text-muted-foreground dark:text-gray-300 ml-2">(Source: {item.source})</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </AuthCheck>
  )
}
