"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ChevronDown, ChevronUp, ExternalLink, Lightbulb } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"
import React from "react" // Import React to fix the undeclared JSX variable
import { useTheme } from "@/contexts/theme-context"

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

import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"

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

      const data = await secureApi.post('/api/developments', requestBody);
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
    let currentSection = { title: "", content: [] }
    const sections = []
    const summaryContent = []

    lines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine === "") return

      // Check for markdown style ## headings and handle all uppercase headings
      if ((trimmedLine.startsWith("##") || trimmedLine.toUpperCase() === trimmedLine) && trimmedLine !== "") {
        if (currentSection.title) {
          sections.push(currentSection)
          currentSection = { title: "", content: [] }
        }
        // Remove ## prefix if present
        const titleText = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
        currentSection.title = toTitleCase(titleText)
      } else if (currentSection.title) {
        const isBulletPoint = trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || /^\d+\.\s/.test(trimmedLine)
        let formattedText = trimmedLine.replace(/^[-•]\s*|^\d+\.\s*/, "")
        formattedText = formattedText.replace(
          /(Opportunities:|Risks:|Recommendations & Future Paths:)/g,
          "<strong>$1</strong>",
        )

        // Include all content regardless of section, and mark bullets consistently
        currentSection.content.push({
          text: formattedText,
          isBullet: isBulletPoint,
        })
      } else {
        // Remove ## prefix from summary content as well, if present
        const formattedLine = trimmedLine.startsWith("##") ? trimmedLine.substring(2).trim() : trimmedLine
        summaryContent.push(formattedLine)
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

  // Custom AccordionTrigger without the default chevron
  const CustomAccordionTrigger = React.forwardRef<
    React.ElementRef<typeof AccordionPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
  >(({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  ))
  CustomAccordionTrigger.displayName = "CustomAccordionTrigger"

  const queenBullet = "list-none"

  const renderContent = (content: string[]): JSX.Element => (
    <div className="text-sm text-muted-foreground -mx-4">
      {Array.isArray(content) ? (
        content.map((paragraph, index) => (
          <p key={`summary-${index}`} className="mb-2 leading-relaxed break-words">
            {paragraph.split("\n").map((line, lineIndex) => {
              // Remove ## prefix if present
              const cleanedLine = line.startsWith("##") ? line.substring(2).trim() : line
              
              // Check for **Title**: format
              const boldTitleRegex = /^\*\*(.*?)\*\*\:\s*(.*)/;
              const hasBoldTitle = boldTitleRegex.test(cleanedLine);
              
              // Detect if this is a regular bullet point (not bold title format)
              const isBulletPoint = !hasBoldTitle && (cleanedLine.startsWith("-") || cleanedLine.startsWith("•") || /^\d+\.\s/.test(cleanedLine))
              // Clean bullet formats for consistent display
              const bulletCleanedText = isBulletPoint ? cleanedLine.replace(/^[-•]\s*|^\d+\.\s*/, "") : cleanedLine
              
              if (hasBoldTitle) {
                const matches = cleanedLine.match(boldTitleRegex);
                const title = matches[1];
                const content = matches[2];
                return (
                  <React.Fragment key={`line-${lineIndex}`}>
                    <div className="mt-1">
                      <strong>{title}:</strong> {content}
                    </div>
                    <br />
                  </React.Fragment>
                )
              } else if (isBulletPoint) {
                return (
                  <React.Fragment key={`line-${lineIndex}`}>
                    <div className="flex items-start">
                      <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
                      <span>{bulletCleanedText}</span>
                    </div>
                    <br />
                  </React.Fragment>
                )
              } else if (cleanedLine.trim().endsWith(":")) {
                return (
                  <React.Fragment key={`line-${lineIndex}`}>
                    <strong>{cleanedLine}</strong>
                    <br />
                  </React.Fragment>
                )
              }
              return (
                <React.Fragment key={`line-${lineIndex}`}>
                  {cleanedLine}
                  <br />
                </React.Fragment>
              )
            })}
          </p>
        ))
      ) : (
        <p className="mb-2 leading-relaxed">
          {typeof content === 'string' && content.startsWith("##") ? content.substring(2).trim() : content}
        </p>
      )}
    </div>
  )

  return (
    <CardContent className="p-1 md:p-2">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-foreground" />
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
              className="mb-2 overflow-hidden border-none bg-white dark:bg-primary-800 transition-all duration-300 w-full md:w-[calc(100%+2rem)] md:-ml-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold font-heading text-foreground flex-grow pr-4">{dev.title}</h3>
                  <Button 
                    className={`transition-all border transform hover:-translate-y-1 active:translate-y-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] rounded-full ${theme === "dark" ? "bg-white hover:bg-gray-100 dark:text-gray-800 border-gray-200" : "bg-primary hover:bg-primary/90 text-white border-primary/30"}`}
                    size="sm" 
                    onClick={() => toggleCardExpansion(dev.id)}
                  >
                    {expandedCards[dev.id] ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">Close</span>
                        <ChevronUp className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold">Read More</span>
                        <ChevronDown className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </div>
                <p className="text-base mb-4 dark:text-white">{dev.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: getIndustryColor(dev.industry),
                      color: "white",
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.35)",
                      padding: "0.35rem 0.7rem",
                      transform: "translateY(0)",
                      transition: "all 0.2s ease",
                      borderRadius: "9999px"
                    }}
                    className="text-white"
                  >
                    {dev.industry || "Unknown Industry"}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    style={{
                      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25)",
                      padding: "0.35rem 0.7rem",
                      backgroundColor: theme === "dark" ? "transparent" : "white",
                      color: theme === "dark" ? "white" : "#333",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      transform: "translateY(0)",
                      transition: "all 0.2s ease",
                      borderRadius: "9999px"
                    }}
                  >
                    {dev.product || "Unknown Product"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground dark:text-gray-300">{formatDate(dev.date)}</span>
                  {dev.url && (
                    <a
                      href={dev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-primary/10 hover:bg-primary/20 text-primary dark:text-white dark:bg-primary/30 dark:hover:bg-primary/40 px-3 py-1 rounded-3xl shadow-[0_3px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_5px_12px_rgba(0,0,0,0.2)] transition-all transform hover:-translate-y-0.5 border border-primary/10 dark:border-primary/30"
                    >
                      <span className="font-medium">Source</span> <ExternalLink className="ml-1 h-4 w-4" />
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
                      <div className="w-full bg-white dark:bg-primary-700 rounded-md border dark:border-primary-600">
                        <div className="px-4 py-4 w-full">
                          <div className="space-y-2">
                            <h4 className="text-base font-bold dark:text-white bg-primary/10 dark:bg-primary-600 px-3 py-1 rounded-md inline-block">HByte</h4>
                            <div className="text-sm text-gray-900 dark:text-gray-100 max-h-60 overflow-y-auto pr-2 w-full">
                              {formatAnalysis(dev.summary)
                                .summary.split("\n")
                                .map((paragraph, index) => (
                                  <p key={`summary-${index}`} className="mb-2 leading-relaxed break-words">
                                    {paragraph.split("\n").map((line, lineIndex) => {
                                      // Remove ## prefix if present
                                      const cleanedLine = line.startsWith("##") ? line.substring(2).trim() : line
                                      
                                      // Check for **Title**: format
                                      const boldTitleRegex = /^\*\*(.*?)\*\*\:\s*(.*)/;
                                      const hasBoldTitle = boldTitleRegex.test(cleanedLine);
                                      
                                      // Detect if this is a regular bullet point (not bold title format)
                                      const isBulletPoint = !hasBoldTitle && (cleanedLine.startsWith("-") || cleanedLine.startsWith("•") || /^\d+\.\s/.test(cleanedLine))
                                      // Clean bullet formats for consistent display
                                      const bulletCleanedText = isBulletPoint ? cleanedLine.replace(/^[-•]\s*|^\d+\.\s*/, "") : cleanedLine
                                      
                                      if (hasBoldTitle) {
                                        const matches = cleanedLine.match(boldTitleRegex);
                                        const title = matches[1];
                                        const content = matches[2];
                                        return (
                                          <React.Fragment key={`line-${lineIndex}`}>
                                            <div className="mt-1 text-gray-900 dark:text-white">
                                              <strong>{title}:</strong> {content}
                                            </div>
                                            <br />
                                          </React.Fragment>
                                        )
                                      } else if (isBulletPoint) {
                                        // Process bold markdown in bullets
                                        const formattedText = bulletCleanedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                        return (
                                          <React.Fragment key={`line-${lineIndex}`}>
                                            <div className="flex items-start">
                                              <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary dark:text-primary-foreground" />
                                              <span className="text-gray-900 dark:text-white">{formattedText.replace(/<[^>]*>/g, '')}</span>
                                            </div>
                                            <br />
                                          </React.Fragment>
                                        )
                                      } else if (cleanedLine.trim().endsWith(":")) {
                                        return (
                                          <React.Fragment key={`line-${lineIndex}`}>
                                            <strong className="text-gray-900 dark:text-white">{cleanedLine}</strong>
                                            <br />
                                          </React.Fragment>
                                        )
                                      }
                                      return (
                                        <React.Fragment key={`line-${lineIndex}`}>
                                          <span className="text-gray-900 dark:text-white">{cleanedLine}</span>
                                          <br />
                                        </React.Fragment>
                                      )
                                    })}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Accordion type="multiple" className="w-full space-y-2">
                        {formatAnalysis(dev.summary).sections.map((section, index) => (
                          <AccordionItem key={`section-${index}`} value={`section-${index}`} className="border-none">
                            <CustomAccordionTrigger className="bg-white dark:bg-primary-800 hover:bg-primary/5 dark:hover:bg-primary-700 px-4 py-3 rounded-md text-left shadow-md hover:shadow-lg transition-all">
                              <div className="flex justify-between items-center w-full">
                                <span className="text-base font-bold dark:text-white bg-primary/5 dark:bg-primary-600 px-2 py-1 rounded">{section.title}</span>
                                <div className="flex items-center justify-center p-1 rounded-full bg-primary/10 dark:bg-primary/30 text-primary dark:text-white">
                                  <ChevronDown className="h-5 w-5 accordion-chevron" />
                                </div>
                              </div>
                            </CustomAccordionTrigger>
                            <AccordionContent className="bg-white/90 dark:bg-primary-700 mt-1 p-4 rounded-md space-y-2">
                              <div className="space-y-2 dark:text-white">
                                {section.content.map((item, pIndex) => {
                                  // Clean any ## prefixes from text content
                                  const cleanedText = item.text.startsWith("##") ? 
                                    item.text.substring(2).trim() : item.text;
                                  
                                  // Check for **Title**: format
                                  const boldTitleRegex = /^\*\*(.*?)\*\*\:\s*(.*)/;
                                  const hasBoldTitle = boldTitleRegex.test(cleanedText);
                                  
                                  // Use the lightbulb for all bullet points (that aren't bold title format) regardless of section 
                                  const isLightbulbBullet = !hasBoldTitle && (item.isBullet || cleanedText.startsWith("-") || /^\d+\.\s/.test(cleanedText));
                                  // Strip bullet markers from text for consistent formatting
                                  const bulletCleanedText = isLightbulbBullet ? 
                                    cleanedText.replace(/^[-•]\s*|^\d+\.\s*/, "") : cleanedText;
                                  
                                  // If "Why This Matters" section and bold title format, display specially
                                  if (hasBoldTitle) {
                                    const matches = cleanedText.match(boldTitleRegex);
                                    const title = matches[1];
                                    const content = matches[2];
                                    return (
                                      <div key={`paragraph-${index}-${pIndex}`} className="text-sm text-gray-900 dark:text-gray-100">
                                        <div className="mt-1">
                                          <strong className="text-gray-900 dark:text-white">{title}:</strong> <span className="text-gray-900 dark:text-gray-100">{content}</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                    
                                  // Process the bulletCleanedText to handle **XXXX** formatting
                                  const formattedText = bulletCleanedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                  
                                  return (
                                    <div key={`paragraph-${index}-${pIndex}`} className="text-sm text-gray-900 dark:text-gray-100">
                                      {isLightbulbBullet ? (
                                        <div className="flex items-start">
                                          <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary dark:text-primary-foreground" />
                                          <span className="text-gray-900 dark:text-gray-100">{formattedText.replace(/<[^>]*>/g, '')}</span>
                                        </div>
                                      ) : (
                                        <p className="text-gray-900 dark:text-gray-100"><strong>{cleanedText.replace(/\*\*(.*?)\*\*/g, '$1')}</strong></p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      {dev.numerical_data && dev.numerical_data.length > 0 && (
                        <div className="bg-muted dark:bg-primary-800 p-4 rounded-md mt-4">
                          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            Numerical data
                          </h4>
                          <ul className={`${queenBullet} space-y-2`}>
                            {dev.numerical_data.map((item, index) => (
                              <li key={`numerical-${index}`} className="text-sm text-muted-foreground dark:text-gray-100 flex items-start">
                                <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary dark:text-primary-foreground" />
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

