"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronDown, ChevronUp, ExternalLink, Lightbulb } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import React from "react" // Import React to fix the undeclared JSX variable

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product: string
  date?: string
  url: string
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
}

interface DevelopmentStreamProps {
  selectedIndustry: string
  duration: string
  getIndustryColor: (industry: string) => string
  expandedDevelopmentId: string | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

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

  const fetchDevelopments = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/developments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      if (data.developments && Array.isArray(data.developments)) {
        const invalidDateEntries = data.developments.filter(
          (dev) => !dev.date || dev.date === "" || isNaN(new Date(dev.date).getTime()),
        ).length
        if (invalidDateEntries > 0) {
          toast({
            title: "Warning",
            description: `${invalidDateEntries} development(s) have invalid or missing dates. Some information may not be displayed correctly.`,
            variant: "warning",
          })
        }
        return data.developments
      } else {
        throw new Error("Invalid response format: developments array not found")
      }
    } catch (error) {
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
  }, [toast, duration, selectedIndustry]) // Comma removed

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
  )

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
  }, [fetchDevelopments, filterDevelopments, selectedIndustry, duration, expandedDevelopmentId])

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "") return "Date not available"
    const date = new Date(dateString)
    return isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const toTitleCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const formatAnalysis = (summary: string): FormattedAnalysis => {
    const lines = summary.split("\n")
    let currentSection = { title: "", content: [] }
    const sections = []
    const summaryContent = []

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine === "") return

      if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine !== "") {
        if (currentSection.title) {
          sections.push(currentSection)
          currentSection = { title: "", content: [] }
        }
        currentSection.title = toTitleCase(trimmedLine)
      } else if (currentSection.title) {
        const isBulletPoint = trimmedLine.startsWith("-") || /^\d+\.\s/.test(trimmedLine)
        let formattedText = trimmedLine.replace(/^[-]\s*|^\d+\.\s*/, "")
        formattedText = formattedText.replace(
          /(Opportunities:|Risks:|Recommendations & Future Paths:)/g,
          "<strong>$1</strong>",
        )

        // Only include bullet points for "Recommendations & Future Paths" section
        if (currentSection.title === "Recommendations & Future Paths") {
          if (isBulletPoint) {
            currentSection.content.push({
              text: formattedText,
              isBullet: true,
            })
          }
        } else {
          // For other sections, include all content
          currentSection.content.push({
            text: formattedText,
            isBullet: isBulletPoint,
          })
        }
      } else {
        summaryContent.push(trimmedLine)
      }
    })

    if (currentSection.title) {
      sections.push(currentSection)
    }

    return {
      summary: summaryContent.join("\n"),
      sections: sections,
    }
  }

  const queenBullet = "list-none"

  const renderContent = (content: string[]): JSX.Element => (
    <div className="text-sm text-muted-foreground -mx-4">
      {Array.isArray(content) ? (
        content.map((paragraph, index) => (
          <p key={`summary-${index}`} className="mb-2 leading-relaxed break-words">
            {paragraph.split("\n").map((line, lineIndex) => {
              if (line.trim().endsWith(":")) {
                return (
                  <React.Fragment key={`line-${lineIndex}`}>
                    <strong>{line}</strong>
                    <br />
                  </React.Fragment>
                )
              }
              return (
                <React.Fragment key={`line-${lineIndex}`}>
                  {line}
                  <br />
                </React.Fragment>
              )
            })}
          </p>
        ))
      ) : (
        <p className="mb-2 leading-relaxed">{content}</p>
      )}
    </div>
  )

  return (
    <CardContent className="p-1 md:p-2">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Card
              key={dev.id}
              className="mb-2 overflow-hidden border-none bg-background/80 shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_6px_12px_rgba(255,255,255,0.15)] transition-all duration-300 w-full md:w-[calc(100%+2rem)] md:-ml-4"
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold font-heading text-primary flex-grow pr-4">{dev.title}</h3>
                  <Button variant="ghost" size="sm" onClick={() => toggleCardExpansion(dev.id)}>
                    {expandedCards[dev.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-base mb-4">{dev.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: getIndustryColor(dev.industry),
                      color: "white",
                    }}
                  >
                    {dev.industry || "Unknown Industry"}
                  </Badge>
                  <Badge variant="outline">{dev.product || "Unknown Product"}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{formatDate(dev.date)}</span>
                  {dev.url && (
                    <a
                      href={dev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      Source <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
                <AnimatePresence>
                  {expandedCards[dev.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-2"
                    >
                      <Card className="w-full">
                        <CardContent className="px-3 py-3 w-full">
                          <div className="space-y-2">
                            <h4 className="text-base font-semibold">Analysis summary</h4>
                            <div className="text-sm text-muted-foreground max-h-60 overflow-y-auto pr-2 w-full">
                              {formatAnalysis(dev.summary)
                                .summary.split("\n")
                                .map((paragraph, index) => (
                                  <p key={`summary-${index}`} className="mb-2 leading-relaxed break-words">
                                    {paragraph.split("\n").map((line, lineIndex) => {
                                      if (line.trim().endsWith(":")) {
                                        return (
                                          <React.Fragment key={`line-${lineIndex}`}>
                                            <strong>{line}</strong>
                                            <br />
                                          </React.Fragment>
                                        )
                                      }
                                      return (
                                        <React.Fragment key={`line-${lineIndex}`}>
                                          {line}
                                          <br />
                                        </React.Fragment>
                                      )
                                    })}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Accordion type="single" collapsible className="w-full space-y-2">
                        {formatAnalysis(dev.summary).sections.map((section, index) => (
                          <AccordionItem key={`section-${index}`} value={`section-${index}`} className="border-none">
                            <AccordionTrigger className="bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-md text-left">
                              <span className="text-base font-semibold">{section.title}</span>
                            </AccordionTrigger>
                            <AccordionContent className="bg-background/50 mt-1 p-2 rounded-md space-y-2">
                              <div className="space-y-2">
                                {section.content.map((item, pIndex) => (
                                  <div key={`paragraph-${index}-${pIndex}`} className="text-sm text-muted-foreground">
                                    {item.isBullet ? (
                                      <div className="flex items-start">
                                        <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                                        <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                                      </div>
                                    ) : (
                                      <p dangerouslySetInnerHTML={{ __html: item.text }}></p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      {dev.numerical_data && dev.numerical_data.length > 0 && (
                        <div className="bg-muted p-4 rounded-md mt-4">
                          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                            Numerical data
                          </h4>
                          <ul className={`${queenBullet} space-y-2`}>
                            {dev.numerical_data.map((item, index) => (
                              <li key={`numerical-${index}`} className="text-sm text-muted-foreground flex items-start">
                                <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1" />
                                <span>
                                  <span className="font-medium">
                                    {item.number} {item.unit}
                                  </span>{" "}
                                  - {item.context.replace(/^[-\d]+\.\s*/, "")}
                                  {item.source && (
                                    <span className="text-xs text-muted-foreground ml-2">(Source: {item.source})</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </CardContent>
  )
}

