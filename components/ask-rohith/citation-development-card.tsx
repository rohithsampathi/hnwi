// components/ask-rohith/citation-development-card.tsx
// Development card component that matches Market Intelligence Dashboard format exactly

"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { cn } from "@/lib/utils"
import {
  Brain,
  TrendingUp,
  AlertCircle,
  Target,
  Lightbulb,
  BarChart3,
  Calendar
} from "lucide-react"

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product?: string
  date?: string
  summary: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
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
  // Clean up the summary - remove duplicate headers and format properly
  let cleanedSummary = summary
    .replace(/^HByte Summary\s*\n?/i, '') // Remove HByte Summary header if it exists
    .replace(/^#\s*HNWI WORLD UPDATE\s*\n?/gim, '') // Remove HNWI WORLD UPDATE headers
    .replace(/^#\s*Hnwi World Update\s*\n?/gim, '') // Remove case variations
    .trim()

  const lines = cleanedSummary.split("\n")
  let currentSection = { title: "", content: [] as Array<{text: string, isBullet: boolean}> }
  const sections = [] as Array<{title: string, content: Array<{text: string, isBullet: boolean}>}>
  const summaryContent = [] as string[]
  let winners: AnalysisSection | undefined
  let losers: AnalysisSection | undefined
  let potentialMoves: AnalysisSection | undefined

  lines.forEach((line) => {
    const trimmedLine = line.trim()
    if (trimmedLine === "") return

    // Skip lines that are just headers we want to ignore
    if (trimmedLine.match(/^#\s*(HNWI WORLD UPDATE|Hnwi World Update)/i)) {
      return
    }

    if ((trimmedLine.startsWith("##") || (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 3)) && trimmedLine !== "") {
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
        currentSection.content.push({
          text: formattedText,
          isBullet: explicitBulletPoint || shouldTreatAsBullet,
        })
      }
    } else if (!currentSection.title) {
      summaryContent.push(trimmedLine)
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

  // If no sections were created and summary is empty, use the cleaned summary as is
  const finalSummary = summaryContent.length > 0
    ? summaryContent.join(" ").trim()
    : (sections.length === 0 && !winners && !losers && !potentialMoves
      ? cleanedSummary
      : (lines[0] || ""))

  return {
    summary: finalSummary,
    sections,
    winners,
    losers,
    potentialMoves
  }
}

interface CitationDevelopmentCardProps {
  development: Development
  citationNumber?: number
}

export function CitationDevelopmentCard({ development, citationNumber }: CitationDevelopmentCardProps) {
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
                      {analysis.winners.content.map((item, pIndex) => (
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
                      {analysis.losers.content.map((item, pIndex) => (
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
                  <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-3" />
                  <h5 className="font-bold text-lg text-yellow-700 dark:text-yellow-300">Potential Moves</h5>
                </div>

                <div className="space-y-0 pl-2 mb-6">
                  {analysis.potentialMoves.content.map((item, pIndex) => (
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

            {/* Other Sections */}
            {analysis.sections.map((section, index) => {
              const sectionIcon = section.title.toLowerCase().includes("insight") ? Lightbulb :
                               section.title.toLowerCase().includes("implication") ? Target :
                               section.title.toLowerCase().includes("risk") ? AlertCircle :
                               BarChart3;

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
                              __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CitationDevelopmentCard