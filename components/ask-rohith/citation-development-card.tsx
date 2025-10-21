// components/ask-rohith/citation-development-card.tsx
// Development card component that matches Market Intelligence Dashboard format exactly

"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { CitationText } from "@/components/elite/citation-text"
import { formatAnalysis, type FormattedAnalysis, type AnalysisSection } from "@/lib/format-text"
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Target,
  Lightbulb,
  BarChart3,
  Calendar,
  ExternalLink
} from "lucide-react"

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product?: string
  date?: string
  url?: string
  summary: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
  }>
}

// Removed: formatAnalysis and related types now imported from @/lib/format-text

interface CitationDevelopmentCardProps {
  development: Development
  citationNumber?: number
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
}

export function CitationDevelopmentCard({ development, citationNumber, onCitationClick, citationMap }: CitationDevelopmentCardProps) {
  const { theme } = useTheme()
  const analysis = formatAnalysis(development.summary)

  return (
    <div className="space-y-4">
      {/* Main Development Card */}
      <div
        className="px-3 md:px-4 py-2 md:py-3 rounded-lg border border-border"
        style={getMetallicCardStyle(theme).style}
      >
        <div className="h-full flex flex-col justify-between py-1">
          {/* Header with Product badge and title */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {development.product && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                >
                  {development.product}
                </Badge>
              )}
            </div>
            <h3 className={`text-lg font-black mb-3 line-clamp-2 ${
              theme === "dark" ? "text-primary" : "text-black"
            }`}>
              {development.title}
            </h3>
          </div>

          {/* Body */}
          <p className={`text-sm font-medium leading-relaxed flex-grow ${
            theme === "dark" ? "text-gray-200" : "text-gray-700"
          }`}>
            {development.description}
          </p>

          {/* Bottom row with Date and Category Badge */}
          <div className="flex justify-end items-center mt-4">
            <div className="flex items-center gap-3">
              <div className={`text-xs font-medium ${
                theme === "dark"
                  ? "text-gray-200"
                  : "text-gray-700"
              }`}>
                {development.date ? new Date(development.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                }) : "Date not available"}
              </div>

              <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">
                {development.industry || "Unknown Industry"}
              </PremiumBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Analysis Content */}
      <div className="border border-border rounded-lg p-4 bg-transparent">
        <div className="space-y-6 px-2">
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
                <p className="font-medium">
                  <CitationText
                    text={analysis.summary}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                  />
                </p>
              </div>
            </div>

            {/* Other Sections - "Why This Matters" will appear first due to sorting */}
            {analysis.sections.map((section, index) => {
              const sectionIcon = section.title.toLowerCase().includes("insight") ? Lightbulb :
                               section.title.toLowerCase().includes("implication") ? Target :
                               section.title.toLowerCase().includes("risk") ? AlertCircle :
                               BarChart3;

              const isWhyThisMatters = section.title.toLowerCase().includes('why') && section.title.toLowerCase().includes('matter')

              return (
                <div key={index} className="mb-6 pb-2">
                  <div className="flex items-center mb-4">
                    <div className="p-2 mr-3">
                      {React.createElement(sectionIcon, {
                        className: `h-4 w-4 ${theme === "dark" ? "text-primary" : "text-black"}`
                      })}
                    </div>
                    <h5 className="font-bold text-lg">{section.title}</h5>
                  </div>

                  <div className="space-y-0 pl-2">
                    {section.content.map((item, pIndex) => (
                      <div key={`section-${index}-${pIndex}`} className="text-sm">
                        {item.isBullet ? (
                          <div className="flex items-start py-0.5">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                              theme === "dark" ? "bg-primary/60" : "bg-black/60"
                            }`}></div>
                            <span className="leading-relaxed font-medium">
                              <CitationText
                                text={item.text}
                                onCitationClick={onCitationClick}
                                citationMap={citationMap}
                                options={{ stripMarkdownBold: true }}
                              />
                            </span>
                          </div>
                        ) : (
                          <p className="leading-relaxed font-medium">
                            <CitationText
                              text={item.text}
                              onCitationClick={onCitationClick}
                              citationMap={citationMap}
                              options={{ convertMarkdownBold: true }}
                            />
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Nested Winners/Losers/Potential Moves under "Why This Matters" */}
                  {isWhyThisMatters && (
                    <div className="mt-6 pl-4 space-y-6">
                      {/* Winners nested sub-section */}
                      {analysis.winners && (
                        <div className="pb-2">
                          <div className="flex items-center mb-4">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-3" />
                            <h6 className="font-bold text-base text-green-600 dark:text-green-400">Winners</h6>
                          </div>

                          <div className="space-y-0 pl-2">
                            {analysis.winners.content.map((item, pIndex) => (
                              <div key={`winner-${pIndex}`} className="text-sm">
                                <div className="flex items-start py-0.5">
                                  <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-green-500"></div>
                                  <span className="leading-relaxed font-medium">
                                    <CitationText
                                      text={item.text}
                                      onCitationClick={onCitationClick}
                                      citationMap={citationMap}
                                      options={{ convertMarkdownBold: true }}
                                    />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Losers nested sub-section */}
                      {analysis.losers && (
                        <div className="pb-2">
                          <div className="flex items-center mb-4">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-3" />
                            <h6 className="font-bold text-base text-red-600 dark:text-red-400">Losers</h6>
                          </div>

                          <div className="space-y-0 pl-2">
                            {analysis.losers.content.map((item, pIndex) => (
                              <div key={`loser-${pIndex}`} className="text-sm">
                                <div className="flex items-start py-0.5">
                                  <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-red-500"></div>
                                  <span className="leading-relaxed font-medium">
                                    <CitationText
                                      text={item.text}
                                      onCitationClick={onCitationClick}
                                      citationMap={citationMap}
                                      options={{ convertMarkdownBold: true }}
                                    />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Potential Moves nested sub-section */}
                      {analysis.potentialMoves && (
                        <div className="pb-2">
                          <div className="flex items-center mb-4">
                            <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-3" />
                            <h6 className="font-bold text-base text-yellow-700 dark:text-yellow-300">Potential Moves</h6>
                          </div>

                          <div className="space-y-0 pl-2">
                            {analysis.potentialMoves.content.map((item, pIndex) => (
                              <div key={`move-${pIndex}`} className="text-sm">
                                <div className="flex items-start py-0.5">
                                  <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-yellow-500"></div>
                                  <span className="leading-relaxed font-medium">
                                    <CitationText
                                      text={item.text}
                                      onCitationClick={onCitationClick}
                                      citationMap={citationMap}
                                      options={{ convertMarkdownBold: true }}
                                    />
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Numerical Data */}
            {development.numerical_data && development.numerical_data.length > 0 && (
              <div className="mb-6 pb-2">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-4 w-4 text-primary mr-3" />
                  <h5 className="font-bold text-lg">Key Metrics</h5>
                </div>

                <div className="grid grid-cols-1 gap-3 pl-2">
                  {development.numerical_data.map((data, idx) => (
                    <div key={idx} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">
                          {data.number}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {data.unit}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {data.context}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source link at bottom */}
            {development.url && (
              <div className="flex justify-center mt-6 pb-2">
                <a
                  href={development.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full transition-colors duration-200 hover:bg-muted ${
                    theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                  }`}
                  title="View source"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CitationDevelopmentCard