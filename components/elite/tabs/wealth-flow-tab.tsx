// components/elite/tabs/wealth-flow-tab.tsx
// Elite Pulse tab with real-time market analysis and opportunities

"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heading3 } from "@/components/ui/typography"
import { Globe, PieChart, Clock, TrendingUp, ArrowRightLeft, Target, BarChart3, Zap, DollarSign, ArrowRight, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"
import { CitationText } from "../citation-text"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface ElitePulseTabProps {
  data: ProcessedIntelligenceData
  onCitationClick?: (citationId: string) => void
  citations?: Array<{ id: string; number: number; originalText: string }>
  citationMap?: Map<string, number>
}

// Parse Market Intelligence into sections with **Heading** followed by content
function parseMarketIntelligence(text: string) {
  if (!text) return []

  const sections: Array<{ heading: string; content: string }> = []

  // Split by **Heading** pattern
  const parts = text.split(/\n(?=\*\*[^*]+\*\*\n)/)

  for (const part of parts) {
    const trimmedPart = part.trim()
    if (!trimmedPart) continue

    // Check if starts with **Heading**
    const headingMatch = trimmedPart.match(/^\*\*([^*]+)\*\*\n/)

    if (headingMatch) {
      const heading = headingMatch[1].trim()
      const content = trimmedPart.substring(headingMatch[0].length).trim()
      sections.push({ heading, content })
    } else {
      // Content without heading (intro text)
      sections.push({ heading: '', content: trimmedPart })
    }
  }

  return sections
}

// Parse Timing Catalyst into sections with **Heading** followed by bullet points
function parseTimingCatalyst(text: string) {
  if (!text) return []

  const sections: Array<{ heading: string; bullets: string[] }> = []

  // Split by **Heading** pattern
  const parts = text.split(/\n(?=\*\*[^*]+\*\*\n)/)

  for (const part of parts) {
    const trimmedPart = part.trim()
    if (!trimmedPart) continue

    // Check if starts with **Heading**
    const headingMatch = trimmedPart.match(/^\*\*([^*]+)\*\*\n/)

    if (headingMatch) {
      const heading = headingMatch[1].trim()
      const content = trimmedPart.substring(headingMatch[0].length).trim()

      // Split by newlines to get bullets (each line is a bullet)
      const bullets = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      sections.push({ heading, bullets })
    } else {
      // Content without heading
      const bullets = trimmedPart
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      sections.push({ heading: '', bullets })
    }
  }

  return sections
}

// Parse Implementation Roadmap into sections with flexible heading detection
function parseImplementationRoadmap(text: string) {
  if (!text) return []

  const sections: Array<{ heading: string; bulletPoints: string[] }> = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let currentSection: { heading: string; bulletPoints: string[] } | null = null

  for (const line of lines) {
    let headingText = null

    // Pattern 1: **Text** or **Text:**
    const boldMatch = line.match(/^\*\*([^*]+)\*\*:?$/)
    if (boldMatch) {
      headingText = boldMatch[1].trim()
    }

    // Pattern 2: Text: (text ending with colon)
    const colonMatch = line.match(/^([^:]{3,50}):$/)
    if (colonMatch && !boldMatch) {
      const potentialHeading = colonMatch[1].trim()
      // Only treat as heading if short and doesn't look like a sentence
      if (!/\b[a-z]+\s+[a-z]/.test(potentialHeading)) {
        headingText = potentialHeading
      }
    }

    // Pattern 3: ALL CAPS headers
    if (!headingText && line.length < 50 && line === line.toUpperCase() && /^[A-Z\s\d:.-]+$/.test(line)) {
      headingText = line.replace(/:$/, '').trim()
    }

    if (headingText) {
      // Save previous section
      if (currentSection && currentSection.bulletPoints.length > 0) {
        sections.push(currentSection)
      }
      // Start new section
      currentSection = { heading: headingText, bulletPoints: [] }
    } else if (currentSection) {
      // Add to current section - each line is a bullet
      if (line.length > 0) {
        currentSection.bulletPoints.push(line)
      }
    } else {
      // No section yet, create one without heading
      currentSection = { heading: '', bulletPoints: [line] }
    }
  }

  // Add final section
  if (currentSection && currentSection.bulletPoints.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

export function ElitePulseTab({ data, onCitationClick, citations = [], citationMap: citationMapProp }: ElitePulseTabProps) {
  const elitePulseData = data?.elitePulseData

  // Create citation map from global citations
  const fallbackCitationMap = useMemo(() => {
    const map = new Map<string, number>()
    citations.forEach(citation => {
      map.set(citation.id, citation.number)
    })
    return map
  }, [citations])

  const citationMap = citationMapProp ?? fallbackCitationMap

  // Use the data extracted from Ruscha intelligence sections
  const hasElitePulseData = !!elitePulseData && (elitePulseData?.marketIntelligence || elitePulseData?.timingCatalyst || elitePulseData?.implementationRoadmap)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Elite Pulse</h2>
            <p className="text-sm text-muted-foreground">Real-time market opportunities and analysis</p>
          </div>
        </div>
      </div>

      {hasElitePulseData ? (
        <div className="space-y-8">
          {/* Market Insights */}
          {elitePulseData?.marketIntelligence && (
            <div className="space-y-6">
              {parseMarketIntelligence(elitePulseData.marketIntelligence).map((section, index) => (
                <div key={index}>
                  {section.heading && (
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {section.heading}
                    </h3>
                  )}
                  <CitationText
                    text={section.content}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                    className="text-sm text-foreground/90 leading-snug"
                    options={{ stripMarkdownBold: true, preserveLineBreaks: true, trim: true }}
                    citationDisplay="inline"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tier Opportunities Section */}
          {(data.tier1Opportunities?.length > 0 || data.tier2Opportunities?.length > 0 || data.tier3Opportunities?.length > 0) && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Investment Opportunities by Capital Tier</h2>
                  <p className="text-sm text-muted-foreground">Categorized by minimum capital requirements</p>
                </div>
              </div>

              {/* $100K Opportunities */}
              {data.tier1Opportunities && data.tier1Opportunities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">$100K Entry Opportunities</h4>
                      <p className="text-xs text-muted-foreground">Accessible entry-level investments</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {data.tier1Opportunities.length} Available
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {data.tier1Opportunities
                      .filter((opp: any) => {
                        const risk = opp.riskRating?.toLowerCase()
                        return risk?.includes('high') || risk?.includes('medium') || opp.impact === 'high' || opp.impact === 'medium'
                      })
                      .slice(0, 3)
                      .map((opp: any, index: number) => (
                        <TierOpportunityCard
                          key={index}
                          opportunity={opp}
                          index={index}
                          tier={1}
                          onCitationClick={onCitationClick}
                          citationMap={citationMap}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* $500K Opportunities */}
              {data.tier2Opportunities && data.tier2Opportunities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">$500K Growth Opportunities</h4>
                      <p className="text-xs text-muted-foreground">Mid-tier strategic investments</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {data.tier2Opportunities.length} Available
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {data.tier2Opportunities
                      .filter((opp: any) => {
                        const risk = opp.riskRating?.toLowerCase()
                        return risk?.includes('high') || risk?.includes('medium') || opp.impact === 'high' || opp.impact === 'medium'
                      })
                      .slice(0, 3)
                      .map((opp: any, index: number) => (
                        <TierOpportunityCard
                          key={index}
                          opportunity={opp}
                          index={index}
                          tier={2}
                          onCitationClick={onCitationClick}
                          citationMap={citationMap}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* $1M Opportunities */}
              {data.tier3Opportunities && data.tier3Opportunities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-foreground">$1M+ Premium Opportunities</h4>
                      <p className="text-xs text-muted-foreground">Elite-tier institutional deals</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {data.tier3Opportunities.length} Available
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {data.tier3Opportunities
                      .slice(0, 3)
                      .map((opp: any, index: number) => (
                        <TierOpportunityCard
                          key={index}
                          opportunity={opp}
                          index={index}
                          tier={3}
                          onCitationClick={onCitationClick}
                          citationMap={citationMap}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timing Catalyst */}
          {elitePulseData?.timingCatalyst && (
            <Card className="bg-muted/20 border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">Timing Catalyst Analysis</h2>
                    <p className="text-sm text-muted-foreground">Market timing and catalytic events</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {parseTimingCatalyst(elitePulseData.timingCatalyst).map((section, index) => (
                    <div key={index}>
                      {section.heading && (
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          {section.heading}
                        </h3>
                      )}
                      <div className="space-y-2 ml-4">
                        {section.bullets.map((bullet, bulletIndex) => (
                          <div key={bulletIndex} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                            <CitationText
                              text={bullet}
                              onCitationClick={onCitationClick}
                              citationMap={citationMap}
                              className="text-sm text-foreground/90 leading-snug"
                              options={{ stripMarkdownBold: true, preserveLineBreaks: true, trim: true }}
                              citationDisplay="inline"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Roadmap */}
          {elitePulseData?.implementationRoadmap && (
            <Card className="bg-muted/20 border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Target className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">Implementation Roadmap</h2>
                    <p className="text-sm text-muted-foreground">Strategic execution timeline</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {parseImplementationRoadmap(elitePulseData.implementationRoadmap || "").map((section, index) => (
                    <div key={index}>
                      {section.heading && (
                        <h3 className="text-base font-semibold text-foreground mb-2">
                          {section.heading}
                        </h3>
                      )}
                      <div className="space-y-2 ml-4">
                        {section.bulletPoints.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                            <CitationText
                              text={point}
                              onCitationClick={onCitationClick}
                              citationMap={citationMap}
                              className="text-sm text-foreground/90 leading-snug"
                              options={{ stripMarkdownBold: true, preserveLineBreaks: true, trim: true }}
                              citationDisplay="inline"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Elite Pulse Data Available</h3>
          <p className="text-muted-foreground mb-6">
            Elite Pulse analysis will appear here when market intelligence is generated.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-muted-foreground">
            <div className="p-4 rounded-lg bg-muted/20">
              <div className="font-medium">Wealth Migration</div>
              <div className="text-xs">Live capital movement tracking</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <div className="font-medium">Arbitrage Gaps</div>
              <div className="text-xs">Market inefficiency detection</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/20">
              <div className="font-medium">Strategic Moves</div>
              <div className="text-xs">$100K+ opportunity analysis</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// TierOpportunityCard component with always visible analysis
interface TierOpportunityCardProps {
  opportunity: any
  index: number
  tier: 1 | 2 | 3
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
}

const TierOpportunityCard = ({ opportunity, index, tier, onCitationClick, citationMap }: TierOpportunityCardProps) => {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)

  const descriptionText = opportunity.description || opportunity.analysis || opportunity.summary || ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${metallicStyle.className} hover:shadow-lg transition-all overflow-visible`}
      style={metallicStyle.style}
    >
      <Card className="bg-transparent border-0 overflow-visible">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CitationText
                  text={opportunity.title}
                  onCitationClick={onCitationClick}
                  citationMap={citationMap}
                  className="font-semibold text-sm text-primary mb-6"
                  options={{ stripMarkdownBold: true, trim: true }}
                />
                <div className="flex flex-wrap gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {opportunity.totalCapitalRequired}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {opportunity.riskRating}
                  </Badge>
                  {opportunity.location && opportunity.location !== 'Global Markets' && (
                    <Badge variant="outline" className="text-xs">
                      {opportunity.location}
                    </Badge>
                  )}
                  {opportunity.sector && (
                    <Badge variant="outline" className="text-xs">
                      {opportunity.sector}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Always visible analysis */}
            {descriptionText && (
              <div className="pt-0.5 border-t border-border space-y-0.5">
                <CitationText
                  text={descriptionText}
                  onCitationClick={onCitationClick}
                  citationMap={citationMap}
                  className="text-sm text-foreground/80 leading-[1.15] break-words max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent font-normal"
                  options={{ stripMarkdownBold: true, preserveLineBreaks: true, trim: true }}
                  citationDisplay="block"
                />

                {/* Additional fields if available */}
                {opportunity.minimumNetWorth && (
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      Min. Net Worth: {opportunity.minimumNetWorth}
                    </Badge>
                  </div>
                )}

                {(opportunity.taxEfficiency || opportunity.professionalTimeline) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {opportunity.taxEfficiency && (
                      <Badge variant="outline" className="text-xs">
                        Tax: {opportunity.taxEfficiency}
                      </Badge>
                    )}
                    {opportunity.professionalTimeline && (
                      <Badge variant="outline" className="text-xs">
                        Timeline: {opportunity.professionalTimeline}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
