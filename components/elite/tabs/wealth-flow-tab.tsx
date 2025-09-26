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
import { parseDevCitations } from "@/lib/parse-dev-citations"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface ElitePulseTabProps {
  data: ProcessedIntelligenceData
  onCitationClick?: (citationId: string) => void
  citations?: Array<{ id: string; number: number; originalText: string }>
}

// Parse Implementation Roadmap into structured sections with headings and bullet points
function parseImplementationRoadmap(text: string) {
  if (!text) return []

  const sections = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let currentSection = null

  for (const line of lines) {
    // More comprehensive heading detection:
    // 1. **Text** or **Text:** (bold markdown)
    // 2. Text: (any text ending with colon)
    // 3. **Text (without closing **)
    // 4. Lines that are ALL CAPS and seem like headings

    let headingText = null

    // Pattern 1: Bold markdown headings **Text** or **Text:**
    const boldMatch = line.match(/^\*\*(.*?)\*\*:?$/)
    if (boldMatch) {
      headingText = boldMatch[1].trim()
    }

    // Pattern 2: Any text ending with colon (but not if it's clearly a sentence)
    const colonMatch = line.match(/^([^:]{3,50}):$/)
    if (colonMatch && !boldMatch) {
      const potentialHeading = colonMatch[1].trim()
      // Only treat as heading if it doesn't look like a sentence (no lowercase words after first word)
      if (!/\b[a-z]+\s+[a-z]/.test(potentialHeading) || /^(immediate|q1|q2|q3|q4|platform|access|phase|step|stage|tier)/i.test(potentialHeading)) {
        headingText = potentialHeading
      }
    }

    // Pattern 3: Malformed markdown patterns like *Text**: or **Text*: or *Text*:
    const malformedMatch = line.match(/^\*+([^*]+)\*+:?\s*$/)
    if (malformedMatch && !boldMatch && !colonMatch) {
      headingText = malformedMatch[1].trim()
    }

    // Pattern 4: ALL CAPS short lines that look like section headers
    if (!headingText && line.length < 50 && line === line.toUpperCase() && /^[A-Z\s\d:.-]+$/.test(line)) {
      headingText = line.replace(/:$/, '').trim()
    }

    if (headingText) {
      // Save previous section if exists
      if (currentSection && currentSection.bulletPoints.length > 0) {
        sections.push(currentSection)
      }

      // Start new section
      currentSection = {
        heading: headingText,
        bulletPoints: []
      }
    } else if (currentSection && line.length > 0) {
      // Check if this line might actually be a heading we missed in the first pass
      let potentialHeadingText = null

      // Check for malformed markdown patterns that should be headings
      const malformedHeadingMatch = line.match(/^\*+([^*]+)\*+:?\s*$/)
      if (malformedHeadingMatch) {
        potentialHeadingText = malformedHeadingMatch[1].trim()
      }

      // Check for colon endings that should be headings
      const colonHeadingMatch = line.match(/^([^:]{3,50}):$/)
      if (colonHeadingMatch && !malformedHeadingMatch) {
        const potentialHeading = colonHeadingMatch[1].trim()
        if (!/\b[a-z]+\s+[a-z]/.test(potentialHeading) || /^(immediate|q1|q2|q3|q4|platform|access|phase|step|stage|tier)/i.test(potentialHeading)) {
          potentialHeadingText = potentialHeading
        }
      }

      if (potentialHeadingText) {
        // This line is actually a heading, create new section
        if (currentSection.bulletPoints.length > 0) {
          sections.push(currentSection)
        }
        currentSection = {
          heading: potentialHeadingText,
          bulletPoints: []
        }
      } else {
        // Add content to current section
        // Remove bullet point markers if present
        let cleanLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim()

        if (cleanLine.length > 0) {
          currentSection.bulletPoints.push(cleanLine)
        }
      }
    } else if (!currentSection && line.length > 0) {
      // If we haven't found a heading yet, create a section without the "Implementation Overview" heading
      const cleanLine = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/^\*\*(.*?)\*\*/, '$1').trim()
      if (cleanLine.length > 0) {
        // Create a section but without a default heading
        currentSection = {
          heading: '', // Empty heading instead of "Implementation Overview"
          bulletPoints: [cleanLine]
        }
      }
    }
  }

  // Add final section
  if (currentSection && currentSection.bulletPoints.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

export function ElitePulseTab({ data, onCitationClick, citations = [] }: ElitePulseTabProps) {
  const elitePulseData = data?.elitePulseData

  // Create citation map from global citations
  const citationMap = useMemo(() => {
    const map = new Map<string, number>()
    citations.forEach(citation => {
      map.set(citation.id, citation.number)
    })
    return map
  }, [citations])

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
            <div className="space-y-4">
              {/* Content without citations */}
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {(() => {
                  // Remove citation markers from the text
                  const cleanText = elitePulseData.marketIntelligence
                    .replace(/\[Dev ID:\s*[^\]]+\]/g, '')
                    .replace(/\[DEVID\s*-\s*[^\]]+\]/g, '')
                    .trim()
                  return cleanText
                })()}
              </div>

              {/* Citations at the end */}
              {(() => {
                const { citations: textCitations } = parseDevCitations(elitePulseData.marketIntelligence)
                if (textCitations.length > 0) {
                  return (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground mr-1">Sources:</span>
                      {textCitations.map((citation, idx) => {
                        const displayNumber = citationMap?.get(citation.id) ?? citation.number
                        return (
                          <button
                            key={idx}
                            onClick={() => onCitationClick?.(citation.id)}
                            className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                            aria-label={`Citation ${displayNumber}`}
                          >
                            [{displayNumber}]
                          </button>
                        )
                      })}
                    </div>
                  )
                }
                return null
              })()}
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
                <div className="space-y-4">
                  {/* Content without citations */}
                  <div className="space-y-2 ml-4">
                    {(() => {
                      // Remove citation markers from the text
                      const cleanText = elitePulseData.timingCatalyst
                        .replace(/\[Dev ID:\s*[^\]]+\]/g, '')
                        .replace(/\[DEVID\s*-\s*[^\]]+\]/g, '')
                        .trim()

                      return cleanText
                        .split(/(?<=[.!?])\s+/)
                        .filter((sentence: string) => sentence.trim().length > 0)
                        .map((sentence: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                            <span className="text-sm text-foreground leading-relaxed">
                              {sentence.trim()}
                            </span>
                          </div>
                        ))
                    })()}
                  </div>

                  {/* Citations at the end */}
                  {(() => {
                    const { citations: textCitations } = parseDevCitations(elitePulseData.timingCatalyst)
                    if (textCitations.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground mr-1">Sources:</span>
                          {textCitations.map((citation, idx) => {
                            const displayNumber = citationMap?.get(citation.id) ?? citation.number
                            return (
                              <button
                                key={idx}
                                onClick={() => onCitationClick?.(citation.id)}
                                className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                                aria-label={`Citation ${displayNumber}`}
                              >
                                [{displayNumber}]
                              </button>
                            )
                          })}
                        </div>
                      )
                    }
                    return null
                  })()}
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
                  {/* Content sections without citations */}
                  {(() => {
                    // Remove citation markers from the entire text
                    const cleanRoadmap = elitePulseData.implementationRoadmap
                      .replace(/\[Dev ID:\s*[^\]]+\]/g, '')
                      .replace(/\[DEVID\s*-\s*[^\]]+\]/g, '')
                      .trim()

                    return parseImplementationRoadmap(cleanRoadmap).map((section, index) => (
                      <div key={index} className="space-y-3">
                        {section.heading && section.heading !== '' && (
                          <h4 className="font-semibold text-foreground text-base border-b border-border pb-2">
                            {section.heading}
                          </h4>
                        )}
                        <div className="space-y-2 ml-4">
                          {section.bulletPoints.map((point, pointIndex) => {
                            // Parse the point to handle asterisk formatting
                            let formattedPoint = point
                            // Handle patterns like *TEXT**: or **TEXT*: or *TEXT*:
                            const asteriskMatch = point.match(/^\*+([^*:]+)\*+:\s*(.*)$/)

                            if (asteriskMatch) {
                              // Render with bold prefix
                              return (
                                <div key={pointIndex} className="flex items-start">
                                  <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                                  <span className="text-sm text-foreground leading-relaxed">
                                    <span className="font-bold">{asteriskMatch[1]}:</span>{' '}
                                    {asteriskMatch[2]}
                                  </span>
                                </div>
                              )
                            }

                            return (
                              <div key={pointIndex} className="flex items-start">
                                <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                                <span className="text-sm text-foreground leading-relaxed">
                                  {formattedPoint}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  })()}

                  {/* Citations at the end */}
                  {(() => {
                    const { citations: textCitations } = parseDevCitations(elitePulseData.implementationRoadmap)
                    if (textCitations.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground mr-1">Sources:</span>
                          {textCitations.map((citation, idx) => {
                            const displayNumber = citationMap?.get(citation.id) ?? citation.number
                            return (
                              <button
                                key={idx}
                                onClick={() => onCitationClick?.(citation.id)}
                                className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                                aria-label={`Citation ${displayNumber}`}
                              >
                                [{displayNumber}]
                              </button>
                            )
                          })}
                        </div>
                      )
                    }
                    return null
                  })()}
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

  // Determine impact level based on risk rating or other factors
  const getImpactLevel = () => {
    const risk = opportunity.riskRating?.toLowerCase()
    if (risk?.includes('high') || opportunity.impact === 'high') return 'HIGH'
    if (risk?.includes('medium') || opportunity.impact === 'medium') return 'MEDIUM'
    return 'LOW'
  }

  const impactLevel = getImpactLevel()

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
                <h5 className="font-semibold text-sm text-primary mb-2">{opportunity.title}</h5>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Impact Badge */}
                  <Badge
                    variant={impactLevel === 'HIGH' ? 'destructive' : impactLevel === 'MEDIUM' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {impactLevel} IMPACT
                  </Badge>
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
            {opportunity.description && (
              <div className="pt-3 border-t border-border space-y-3">
                {/* Full content without citations - increased font size and better formatting */}
                <div className="text-sm text-foreground/80 leading-relaxed break-words max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {(() => {
                    // Remove citation markers from the text
                    const cleanText = opportunity.description
                      .replace(/\[Dev ID:\s*[^\]]+\]/g, '')
                      .replace(/\[DEVID\s*-\s*[^\]]+\]/g, '')
                      .trim()
                    // Ensure proper formatting - preserve paragraphs but remove excessive whitespace
                    return cleanText.split('\n').map(line => line.trim()).filter(line => line).join('\n\n')
                  })()}
                </div>

                {/* Citations at the end */}
                {(() => {
                  const { citations: textCitations } = parseDevCitations(opportunity.description)
                  if (textCitations.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground mr-1">Sources:</span>
                        {textCitations.map((citation, idx) => {
                          const displayNumber = citationMap?.get(citation.id) ?? citation.number
                          return (
                            <button
                              key={idx}
                              onClick={() => onCitationClick?.(citation.id)}
                              className="inline-flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 px-1 py-0.5 rounded transition-colors"
                              aria-label={`Citation ${displayNumber}`}
                            >
                              [{displayNumber}]
                            </button>
                          )
                        })}
                      </div>
                    )
                  }
                  return null
                })()}

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