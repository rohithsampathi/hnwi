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
import { CitationText } from "@/components/elite/citation-text"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import { formatAnalysis, type FormattedAnalysis, type AnalysisSection } from "@/lib/format-text"

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

// Removed: AnalysisSection and FormattedAnalysis now imported from @/lib/format-text

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
  elitePulseBriefIds?: string[] // Elite Pulse source brief IDs for tagging
  showElitePulseOnly?: boolean // Filter to show only Elite Pulse developments
  elitePulseImpactFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' // Impact level filter
  onCitationClick?: (citationId: string) => void // Handler for citation clicks
  onDevelopmentExpanded?: (devId: string, isExpanded: boolean) => void // Handler for development card expansion
  citationMap?: Map<string, number> // Global citation number mapping
}

// Component now receives data as props, no API calls needed



// Removed: formatAnalysis and toTitleCase now imported from @/lib/format-text

const queenBullet = "list-none";

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
  elitePulseBriefIds = [],
  showElitePulseOnly = false,
  elitePulseImpactFilter = 'ALL',
  onCitationClick,
  onDevelopmentExpanded,
  citationMap,
}: DevelopmentStreamProps) {
  
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()

  // Component now receives developments as props, no need to fetch

  // Helper function to get Elite Pulse impact level from development
  const getElitePulseImpact = (dev: any): 'HIGH' | 'MEDIUM' | 'LOW' | null => {
    // Check if development has Elite Pulse impact data
    if (dev.elite_pulse_impact && dev.elite_pulse_impact.impact_level) {
      return dev.elite_pulse_impact.impact_level;
    }
    
    // Fallback: if it's tagged as Elite Pulse brief but no impact level, assume MEDIUM
    if (elitePulseBriefIds.includes(dev.id)) {
      return 'MEDIUM';
    }
    
    return null;
  };

  // Filter developments based on Elite Pulse criteria
  const getFilteredDevelopments = () => {
    let filteredDevs = developments
      .filter(dev => selectedIndustry === 'All' || dev.industry === selectedIndustry);
    
    // Apply Elite Pulse only filter
    if (showElitePulseOnly) {
      filteredDevs = filteredDevs.filter(dev => 
        elitePulseBriefIds.includes(dev.id) || getElitePulseImpact(dev)
      );
    }
    
    // Apply impact level filter
    if (elitePulseImpactFilter !== 'ALL') {
      filteredDevs = filteredDevs.filter(dev => {
        const impactLevel = getElitePulseImpact(dev);
        return impactLevel === elitePulseImpactFilter;
      });
    }
    
    return filteredDevs;
  };

  const toggleCardExpansion = (id: string) => {
    const newExpandedState = !expandedCards[id]
    setExpandedCards((prev) => ({ ...prev, [id]: newExpandedState }))

    // Notify parent about expansion change
    if (onDevelopmentExpanded) {
      onDevelopmentExpanded(id, newExpandedState)
    }

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
    <div>
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
        <div className="w-full space-y-4">
          {getFilteredDevelopments().map((dev) => {
            const elitePulseImpact = getElitePulseImpact(dev);
            return (
            <div key={dev.id} id={`development-card-${dev.id}`} className={`relative ${expandedCards[dev.id] ? '' : 'min-h-[179px]'}`}>
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
                  className="px-3 md:px-4 py-2 md:py-3 cursor-pointer transition-all duration-300 min-h-full relative overflow-hidden rounded-lg border border-border"
                  style={getMetallicCardStyle(theme).style}
                  onClick={() => toggleCardExpansion(dev.id)}
                >
                <div className="h-full flex flex-col justify-between py-1">
                  {/* Header with Product badge, title and toggle */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1 mr-3">
                      <div className="flex items-center space-x-2 mb-1">
                        {dev.product && (
                          <Badge 
                            variant="outline" 
                            className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                          >
                            {dev.product}
                          </Badge>
                        )}
                        {(elitePulseBriefIds.includes(dev.id) || elitePulseImpact) && (
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs font-semibold px-2 py-1 rounded-md bg-gradient-to-r from-primary to-primary/80 text-white whitespace-nowrap w-fit">
                              Elite Pulse
                            </Badge>
                            {elitePulseImpact && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap w-fit ${
                                  elitePulseImpact === 'HIGH' 
                                    ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400' 
                                    : elitePulseImpact === 'MEDIUM'
                                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
                                    : 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
                                }`}
                              >
                                {elitePulseImpact} Impact
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
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
              
              {/* Expanded content completely outside the unified frame wrapper */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedCards[dev.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div>
                  <div className="border border-border rounded-lg p-4 max-h-[500px] overflow-y-auto bg-transparent">
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
                            {onCitationClick ? (
                              <CitationText
                                text={analysis.summary}
                                onCitationClick={onCitationClick}
                                className="font-medium"
                                citationMap={citationMap}
                              />
                            ) : (
                              <p className="font-medium">{analysis.summary}</p>
                            )}
                          </div>
                        </div>

                        {/* Analysis Sections - Winners/Losers/Potential Moves now nested under "Why This Matters" */}
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
                            const isWhyThisMatters = section.title.toLowerCase().includes('why this matters')

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
                                          {onCitationClick ? (
                                            <CitationText
                                              text={item.text}
                                              onCitationClick={onCitationClick}
                                              className="leading-relaxed font-medium"
                                              citationMap={citationMap}
                                            />
                                          ) : (
                                            <span
                                              className="leading-relaxed font-medium"
                                              dangerouslySetInnerHTML={{
                                                __html: item.text
                                              }}
                                            />
                                          )}
                                        </div>
                                      ) : (
                                        onCitationClick ? (
                                          <CitationText
                                            text={item.text}
                                            onCitationClick={onCitationClick}
                                            className="leading-relaxed font-medium"
                                            citationMap={citationMap}
                                          />
                                        ) : (
                                          <p
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: item.text
                                            }}
                                          />
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Nested sub-sections under "Why This Matters" */}
                                {isWhyThisMatters && (
                                  <div className="mt-6 pl-4 space-y-6">
                                    {/* Winners sub-section */}
                                    {analysis.winners && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <TrendingUp className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Winners</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.winners!.content.map((item, pIndex) => (
                                            <div key={`winner-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: item.text
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: item.text
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Losers sub-section */}
                                    {analysis.losers && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <AlertCircle className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Losers</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.losers!.content.map((item, pIndex) => (
                                            <div key={`loser-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: item.text
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: item.text
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Potential Moves sub-section */}
                                    {analysis.potentialMoves && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <TrendingUp className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Potential Moves</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.potentialMoves!.content.map((item, pIndex) => (
                                            <div key={`move-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
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
                    </div>
                  </div>
                </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
