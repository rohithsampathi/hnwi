// components/elite/tabs/wealth-flow-tab.tsx
// Elite Pulse tab with real-time market analysis and opportunities

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading3 } from "@/components/ui/typography"
import { Globe, PieChart, Clock, Map, TrendingUp, ArrowRightLeft, Target, BarChart3, Zap } from "lucide-react"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface ElitePulseTabProps {
  data: ProcessedIntelligenceData
}

// Elite Pulse data parsing functions based on actual data format from console
const parseMarketAssessment = (text: string) => {
  if (!text) return { juicy: [], moderate: [], farFetched: [] }
  
  const categories = {
    juicy: [] as string[],
    moderate: [] as string[],
    farFetched: [] as string[]
  }
  
  // Extract JUICY OPPORTUNITIES section
  const juicyMatch = text.match(/\*\*JUICY OPPORTUNITIES:\*\*(.*?)(?=\*\*[A-Z]|$)/s)
  if (juicyMatch) {
    const juicyContent = juicyMatch[1].trim()
    categories.juicy.push(juicyContent)
  }
  
  // Extract MODERATE OPPORTUNITIES section
  const moderateMatch = text.match(/\*\*MODERATE OPPORTUNITIES:\*\*(.*?)(?=\*\*[A-Z]|$)/s)
  if (moderateMatch) {
    const moderateContent = moderateMatch[1].trim()
    categories.moderate.push(moderateContent)
  }
  
  // Extract FAR-FETCHED OPPORTUNITIES section
  const farFetchedMatch = text.match(/\*\*FAR-FETCHED OPPORTUNITIES:\*\*(.*?)(?=\*\*[A-Z]|$)/s)
  if (farFetchedMatch) {
    const farFetchedContent = farFetchedMatch[1].trim()
    categories.farFetched.push(farFetchedContent)
  }
  
  return categories
}

const parseTimingAnalysis = (text: string) => {
  if (!text) return { fourWeek: [], threeMonth: [], sixMonth: [] }
  
  const categories = {
    fourWeek: [] as string[],
    threeMonth: [] as string[],
    sixMonth: [] as string[]
  }
  
  // Extract 4-Week Window section (handle variations like "4-Week Window (Critical)")
  const fourWeekMatch = text.match(/\*\*4-Week Window[^:]*:\*\*(.*?)(?=\*\*(?:[36]-Month|$))/s)
  if (fourWeekMatch) {
    categories.fourWeek.push(fourWeekMatch[1].trim())
  }
  
  // Extract 3-Month Window section  
  const threeMonthMatch = text.match(/\*\*3-Month Window[^:]*:\*\*(.*?)(?=\*\*(?:6-Month|$))/s)
  if (threeMonthMatch) {
    categories.threeMonth.push(threeMonthMatch[1].trim())
  }
  
  // Extract 6-Month Window section
  const sixMonthMatch = text.match(/\*\*6-Month Window[^:]*:\*\*(.*?)(?=\*\*|$)/s)
  if (sixMonthMatch) {
    categories.sixMonth.push(sixMonthMatch[1].trim())
  }
  
  return categories
}

const parseImplementationRoadmap = (text: string) => {
  if (!text) return { priorities: [] }
  
  const priorities = []
  
  // More flexible regex to capture all priority sections - look for double asterisk patterns
  const priorityMatches = text.matchAll(/\*\*Priority (\d+):\s*(.*?)\*\*([\s\S]*?)(?=\*\*Priority \d+:|$)/g)
  
  for (const match of priorityMatches) {
    const priorityNumber = match[1]
    const title = match[2].trim()
    const content = match[3].trim()
    
    const priority = {
      title: `Priority ${priorityNumber}`,
      description: title,
      steps: [] as string[]
    }
    
    // Extract execution steps from content - handle multiple formats
    if (content) {
      // First try to find "Execution Steps:" section
      const executionMatch = content.match(/Execution Steps?:([\s\S]*?)(?=\*\*|$)/i)
      let stepsContent = executionMatch ? executionMatch[1] : content
      
      // Extract steps - handle both dash and numbered formats
      const lines = stepsContent.split('\n')
      for (const line of lines) {
        const cleanLine = line.trim()
        if (!cleanLine) continue
        
        // Match lines starting with "- Week", "- Month", or numbered items with Week/Month
        if (cleanLine.match(/^-\s+(Week|Month)\s+[\d-]+:/i) || 
            cleanLine.match(/^\d+\.\s+(Week|Month)\s+[\d-]+:/i) ||
            cleanLine.match(/^-\s+.{15,}/)) { // Any dash item with reasonable content
          priority.steps.push(cleanLine)
        }
      }
      
    }
    
    priorities.push(priority)
  }
  
  
  return { priorities }
}

export function ElitePulseTab({ data }: ElitePulseTabProps) {
  const elitePulseData = data?.elitePulseData
  // Use the data extracted from Ruscha intelligence sections
  const hasElitePulseData = !!elitePulseData && (elitePulseData?.marketIntelligence || elitePulseData?.timingCatalyst || elitePulseData?.implementationRoadmap)
  
  // Parse data according to user specifications
  const marketAssessment = parseMarketAssessment(elitePulseData?.marketIntelligence || '')
  const timingAnalysis = parseTimingAnalysis(elitePulseData?.timingCatalyst || '')
  const implementationRoadmap = parseImplementationRoadmap(elitePulseData?.implementationRoadmap || '')
  

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
          {/* Market Assessment - Three Categories */}
          {elitePulseData?.marketIntelligence && (
            <div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* High Popular */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">High Popular</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {marketAssessment.juicy.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {marketAssessment.juicy.map((opportunity, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-sm text-foreground leading-relaxed">
                            {(() => {
                              const text = opportunity.replace(/\(#\d+\)/g, '')
                              // Split only by dashes with proper spacing before and after (not part of words like "self-guided")
                              const bullets = text.split(/\s+-\s+/).filter(item => item.trim())
                              
                              return bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-start space-x-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  <div className="leading-relaxed">
                                    {(() => {
                                      const cleanText = bullet.trim().replace(/^-\s*/, '')
                                      const colonIndex = cleanText.indexOf(':')
                                      
                                      if (colonIndex > 0) {
                                        const heading = cleanText.substring(0, colonIndex)
                                        const content = cleanText.substring(colonIndex + 1).trim()
                                        
                                        return (
                                          <>
                                            <span className="font-bold">{heading}:</span>
                                            {content && <span className="ml-1">{content}</span>}
                                          </>
                                        )
                                      }
                                      
                                      return <span>{cleanText}</span>
                                    })()}
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      ))}
                      {marketAssessment.juicy.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No high popular opportunities identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Moderate Popular */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">Moderate Popular</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {marketAssessment.moderate.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {marketAssessment.moderate.map((opportunity, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-sm text-foreground leading-relaxed">
                            {(() => {
                              const text = opportunity.replace(/\(#\d+\)/g, '')
                              // Split only by dashes with proper spacing before and after (not part of words like "self-guided")
                              const bullets = text.split(/\s+-\s+/).filter(item => item.trim())
                              
                              return bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-start space-x-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  <div className="leading-relaxed">
                                    {(() => {
                                      const cleanText = bullet.trim().replace(/^-\s*/, '')
                                      const colonIndex = cleanText.indexOf(':')
                                      
                                      if (colonIndex > 0) {
                                        const heading = cleanText.substring(0, colonIndex)
                                        const content = cleanText.substring(colonIndex + 1).trim()
                                        
                                        return (
                                          <>
                                            <span className="font-bold">{heading}:</span>
                                            {content && <span className="ml-1">{content}</span>}
                                          </>
                                        )
                                      }
                                      
                                      return <span>{cleanText}</span>
                                    })()}
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      ))}
                      {marketAssessment.moderate.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No moderate popular opportunities identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Less Popular */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <Zap className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">Less Popular</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {marketAssessment.farFetched.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {marketAssessment.farFetched.map((opportunity, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <div className="text-sm text-foreground leading-relaxed">
                            {(() => {
                              const text = opportunity.replace(/\(#\d+\)/g, '')
                              // Split only by dashes with proper spacing before and after (not part of words like "self-guided")
                              const bullets = text.split(/\s+-\s+/).filter(item => item.trim())
                              
                              return bullets.map((bullet, idx) => (
                                <div key={idx} className="flex items-start space-x-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                  <div className="leading-relaxed">
                                    {(() => {
                                      const cleanText = bullet.trim().replace(/^-\s*/, '')
                                      const colonIndex = cleanText.indexOf(':')
                                      
                                      if (colonIndex > 0) {
                                        const heading = cleanText.substring(0, colonIndex)
                                        const content = cleanText.substring(colonIndex + 1).trim()
                                        
                                        return (
                                          <>
                                            <span className="font-bold">{heading}:</span>
                                            {content && <span className="ml-1">{content}</span>}
                                          </>
                                        )
                                      }
                                      
                                      return <span>{cleanText}</span>
                                    })()}
                                  </div>
                                </div>
                              ))
                            })()}
                          </div>
                        </div>
                      ))}
                      {marketAssessment.farFetched.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No less popular opportunities identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Timing Catalyst Analysis - Three Time Windows */}
          {elitePulseData?.timingCatalyst && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-3" />
                  Timing Catalyst Analysis
                </h3>
                <Badge variant="outline" className="text-xs">
                  {timingAnalysis.fourWeek.length + timingAnalysis.threeMonth.length + timingAnalysis.sixMonth.length} Time Windows
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 4 Week Window */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <Zap className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">4 Week Window</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {timingAnalysis.fourWeek.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {timingAnalysis.fourWeek.map((catalyst, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <p className="text-sm text-foreground leading-relaxed">{catalyst}</p>
                        </div>
                      ))}
                      {timingAnalysis.fourWeek.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No 4-week catalysts identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 3 Month Window */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">3 Month Window</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {timingAnalysis.threeMonth.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {timingAnalysis.threeMonth.map((catalyst, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <p className="text-sm text-foreground leading-relaxed">{catalyst}</p>
                        </div>
                      ))}
                      {timingAnalysis.threeMonth.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No 3-month catalysts identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 6 Month Window */}
                <Card className="bg-muted/20 border-border">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <Target className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-semibold text-foreground">6 Month Window</h4>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {timingAnalysis.sixMonth.length}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {timingAnalysis.sixMonth.map((catalyst, index) => (
                        <div key={index} className="p-3 bg-white/70 dark:bg-black/20 rounded-lg">
                          <p className="text-sm text-foreground leading-relaxed">{catalyst}</p>
                        </div>
                      ))}
                      {timingAnalysis.sixMonth.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No 6-month catalysts identified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Implementation Roadmap - Priorities with Week Steps */}
          {elitePulseData?.implementationRoadmap && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center">
                  <Target className="h-5 w-5 text-primary mr-3" />
                  Implementation Roadmap
                </h3>
                <Badge variant="outline" className="text-xs">
                  {implementationRoadmap.priorities.length} Priorities
                </Badge>
              </div>
              
              <div className="space-y-6">
                {implementationRoadmap.priorities.map((priority, index) => (
                  <div key={index} className="border-l-4 border-primary/20 pl-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                        P{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2">{priority.title}</h4>
                        {priority.description && (
                          <div className="text-sm text-muted-foreground mb-4 leading-relaxed space-y-3">
                            {(() => {
                              const formatText = (text: string) => {
                                // Split by **headers** and format as sections
                                const sections = text.split(/\*\*(.*?)\*\*:?/).filter(Boolean)
                                const formattedSections: JSX.Element[] = []
                                
                                for (let i = 0; i < sections.length; i += 2) {
                                  const header = sections[i]
                                  const content = sections[i + 1]
                                  
                                  if (header && content) {
                                    formattedSections.push(
                                      <div key={i} className="space-y-2">
                                        <h5 className="font-semibold text-foreground text-sm">
                                          {header.replace(/\*\*/g, '')}
                                        </h5>
                                        <div className="ml-2 space-y-1.5">
                                          {content.split(' - ').filter(item => item.trim()).map((item, idx) => (
                                            <div key={idx} className="flex items-start space-x-2 text-xs">
                                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                              <span className="leading-relaxed">
                                                {item.trim().replace(/^-\s*/, '')}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  }
                                }
                                
                                // If no structured format found, return original text
                                if (formattedSections.length === 0) {
                                  return <span>{text}</span>
                                }
                                
                                return <>{formattedSections}</>
                              }
                              
                              return formatText(priority.description)
                            })()}
                          </div>
                        )}
                        
                        {priority.steps.length > 0 && (
                          <div>
                            <h5 className="font-medium text-foreground mb-3">Execution Steps:</h5>
                            <div className="space-y-2">
                              {priority.steps.map((step, stepIndex) => (
                                <p key={stepIndex} className="text-sm text-foreground">
                                  {step.replace(/^-\s*/, '')}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {implementationRoadmap.priorities.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground italic">No implementation priorities identified</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
          <Heading3 className="mb-4">Elite Pulse</Heading3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real-time elite wealth migration, arbitrage opportunities, and insider intelligence will be displayed here as data becomes available.
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