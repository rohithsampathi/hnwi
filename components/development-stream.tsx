"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, Lightbulb, ArrowRight, TrendingUp, Target, Brain, AlertCircle, BarChart3, PieChart, ChevronDown, ChevronUp } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react" // Import React to fix the undeclared JSX variable
import { useTheme } from "@/contexts/theme-context"
import { getCardColors, getMatteCardStyle, getMetallicCardStyle } from "@/lib/colors"
import { useAuthPopup } from "@/contexts/auth-popup-context"

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
  parentLoading?: boolean
  onLoadingChange?: (loading: boolean) => void
  startDate?: string
  endDate?: string
  developments?: any[] // Accept developments as props
  isLoading?: boolean
}

// Component now receives data as props, no API calls needed



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
  parentLoading = false,
  onLoadingChange,
  startDate,
  endDate,
  developments = [],
  isLoading = false,
}: DevelopmentStreamProps) {
  
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()

  // Component now receives developments as props, no need to fetch

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
    
    // Scroll to the beginning of the card after a short delay
    setTimeout(() => {
      const cardElement = document.getElementById(`development-card-${id}`);
      if (cardElement) {
        cardElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };


  return (
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
          {developments
            .filter(dev => selectedIndustry === 'All' || dev.industry === selectedIndustry)
            .map((dev) => (
            <div key={dev.id} id={`development-card-${dev.id}`} className="min-h-[179px] relative">
              {/* Unified frame wrapper for both main card and expanded content */}
              <div 
                className={`transition-all duration-300 ${
                  expandedCards[dev.id] 
                    ? "rounded-3xl" 
                    : "rounded-lg"
                }`}
                style={{
                  outline: expandedCards[dev.id] 
                    ? `0.2px solid ${theme === "dark" ? "#DAA520" : "#C0C0C0"}` 
                    : "none"
                }}
              >
                <div 
                  className="p-3 md:p-4 cursor-pointer transition-all duration-300 min-h-full relative overflow-hidden rounded-lg border border-border"
                  style={getMetallicCardStyle(theme).style}
                  onClick={() => toggleCardExpansion(dev.id)}
                >
                <div className="h-full flex flex-col justify-between py-2">
                  {/* Header with Product badge, title and toggle */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1 mr-3">
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
                    
                    {/* Expand Toggle - Top Right */}
                    <div className={`flex items-center cursor-pointer transition-colors duration-200 flex-shrink-0 ${
                      theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                    }`}>
                      {expandedCards[dev.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {/* Body */}
                  <p className={`text-sm font-medium leading-relaxed flex-grow ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}>
                    {dev.description}
                  </p>
                  
                  {/* Bottom row with Date and Category Badge */}
                  <div className="flex justify-end items-center mt-4">
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
                </div>
                
                <AnimatePresence>
                  {expandedCards[dev.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      {/* Expanded content without separate frame */}
                      <div className="p-4 max-h-[600px] overflow-y-auto">
                      <div className="space-y-6 px-2">
                      {(() => {
                        const analysis = formatAnalysis(dev.summary);
                        return (
                          <div className="w-full">
                        {/* HByte Summary */}
                        <div className="mb-6 pb-2">
                          <div className="flex items-center mb-4">
                            <div className="p-2 mr-3">
                              <Brain className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                            </div>
                            <h4 className="text-xl font-bold">HByte Summary</h4>
                          </div>
                          <div className="text-sm leading-relaxed pl-2">
                            <p className="font-medium">{analysis.summary}</p>
                          </div>
                        </div>

                        {/* Winners and Losers */}
                        {(analysis.winners || analysis.losers) && (
                          <div className="space-y-6 mb-6">
                            {analysis.winners && (
                              <div className="pb-2">
                                <div className="flex items-center mb-4">
                                  <TrendingUp className="h-4 w-4 text-green-500 mr-3" />
                                  <h5 className="font-bold text-lg text-green-600 dark:text-green-400">Winners</h5>
                                </div>
                                
                                <div className="space-y-0 pl-2 mb-6">
                                  {analysis.winners!.content.map((item, pIndex) => (
                                    <div key={`winner-${pIndex}`} className="text-sm">
                                      {item.isBullet ? (
                                        <div className="flex items-start py-0.5">
                                          <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 border border-green-500"></div>
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
                            
                            {analysis.losers && (
                              <div className="pb-2">
                                <div className="flex items-center mb-4">
                                  <AlertCircle className="h-4 w-4 text-red-500 mr-3" />
                                  <h5 className="font-bold text-lg text-red-600 dark:text-red-400">Losers</h5>
                                </div>
                                
                                <div className="space-y-0 pl-2 mb-6">
                                  {analysis.losers!.content.map((item, pIndex) => (
                                    <div key={`loser-${pIndex}`} className="text-sm">
                                      {item.isBullet ? (
                                        <div className="flex items-start py-0.5">
                                          <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 border border-red-500"></div>
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
                          </div>
                        )}

                        {/* Potential Moves */}
                        {analysis.potentialMoves && (
                          <div className="mb-6 pb-2">
                            <div className="flex items-center mb-4">
                              <TrendingUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-3" />
                              <h5 className="font-bold text-lg text-yellow-700 dark:text-yellow-300">Potential Moves</h5>
                            </div>
                            
                            <div className="space-y-0 pl-2 mb-6">
                              {analysis.potentialMoves!.content.map((item, pIndex) => (
                                <div key={`move-${pIndex}`} className="text-sm">
                                  {item.isBullet ? (
                                    <div className="flex items-start py-0.5">
                                      <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 border border-yellow-500"></div>
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

                        {/* Analysis Sections */}
                        <div className="space-y-6">
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
                              <div key={`section-${index}`} className="pb-2">
                                <div className="flex items-center mb-4">
                                  <div className="p-2 mr-3">
                                    <IconComponent className={`h-4 w-4 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                  </div>
                                  <h5 className="font-bold text-lg">{section.title}</h5>
                                </div>
                                
                                <div className="space-y-0 pl-2">
                                  {section.content.map((item, pIndex) => (
                                    <div key={`item-${pIndex}`} className="text-sm">
                                      {item.isBullet ? (
                                        <div className="flex items-start py-0.5">
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
                        
                        {/* Collapse arrow at bottom of frame */}
                        <div className="flex justify-center mt-6 pb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpansion(dev.id);
                            }}
                            className={`p-2 rounded-full transition-colors duration-200 hover:bg-muted ${
                              theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                            }`}
                          >
                            <ChevronUp className="h-5 w-5" />
                          </button>
                        </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
  )
}
