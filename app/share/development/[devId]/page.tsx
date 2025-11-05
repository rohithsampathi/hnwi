// app/share/development/[devId]/page.tsx
// Public page for viewing shared HNWI World developments

"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CrownLoader } from "@/components/ui/crown-loader"
import { MetaTags } from "@/components/meta-tags"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import {
  Lock,
  ExternalLink,
  Share2,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart,
  Lightbulb,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CitationText } from "@/components/elite/citation-text"
import { formatAnalysis } from "@/lib/format-text"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { extractDevIds } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"

interface Development {
  id: string
  title: string
  description: string
  industry: string
  product?: string
  date?: string
  summary: string
  url?: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
  }>
}

// Access gate component for non-authenticated users
function AccessGate({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="max-w-md p-8 text-center space-y-6 bg-card rounded-xl border border-border shadow-xl">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Get Full Access</h2>
          <p className="text-muted-foreground">
            To access all HNWI World developments and exclusive intelligence, you need a premium HNWI Chronicles account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onGetAccess}
            className="w-full gap-2"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            View Membership Plans
            <ExternalLink className="h-3 w-3" />
          </Button>

          <p className="text-xs text-muted-foreground">
            Join elite investors with exclusive market intelligence
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SharedDevelopmentPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const devId = params.devId as string

  const [development, setDevelopment] = useState<Development | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAccessGate, setShowAccessGate] = useState(false)

  // Citation management
  const {
    citations: managedCitations,
    setCitations: setManagedCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager()

  useEffect(() => {
    loadDevelopment()
  }, [devId])

  const loadDevelopment = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/developments/public/${devId}`)

      if (response.ok) {
        const dev = await response.json()

        const development: Development = {
          id: dev._id || dev.id || devId,
          title: dev.title || dev.name || `Development ${devId}`,
          description: dev.description || dev.summary?.substring(0, 200) || "Development details",
          industry: dev.industry || "Market Intelligence",
          product: dev.product,
          date: dev.date || dev.created_at,
          summary: dev.summary || dev.analysis || "",
          url: dev.url,
          numerical_data: dev.numerical_data || []
        }

        setDevelopment(development)

        // Extract and set citations
        const devIds = extractDevIds(development.summary)
        if (devIds.length > 0) {
          const citations: Citation[] = devIds.map((id, index) => ({
            id,
            number: index + 1,
            originalText: `[Dev ID: ${id}]`
          }))
          setManagedCitations(citations)
        }
      } else {
        setError("Development not found or no longer available")
      }
    } catch (err) {
      setError("Failed to load development details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetAccess = () => {
    // Open pricing page in new tab
    window.open("https://www.hnwichronicles.com/pricing", "_blank")
  }

  const handleBack = () => {
    // Go to main website
    window.location.href = "https://www.hnwichronicles.com"
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch (err) {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleCitationClick = (citationId: string) => {
    openCitation(citationId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader size="lg" text="Loading development..." />
      </div>
    )
  }

  if (error || !development) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Development Not Found</h2>
          <p className="text-muted-foreground">{error || "This development is no longer available"}</p>
          <Button onClick={handleBack} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  const metallicStyle = getMetallicCardStyle(theme)
  const analysis = formatAnalysis(development.summary)

  return (
    <>
      <MetaTags
        title={`${development.title} - HNWI World Development | HNWI Chronicles`}
        description={development.description || "Exclusive market intelligence development from HNWI World"}
        image="https://app.hnwichronicles.com/images/hnwi-world-og.png"
        url={`https://app.hnwichronicles.com/share/development/${devId}`}
      />

      <div className="min-h-screen bg-background">
        {/* Access Gate Overlay */}
        <AnimatePresence>
          {showAccessGate && (
            <AccessGate onGetAccess={handleGetAccess} />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <PageHeaderWithBack onBack={handleBack} />

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Share2 className="h-3 w-3" />
                  Share
                </Button>

                <Button
                  onClick={handleGetAccess}
                  size="sm"
                  className="gap-2"
                >
                  <Lock className="h-3 w-3" />
                  Get Access
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  {development.product && (
                    <Badge variant="outline" className="text-xs">
                      {development.product}
                    </Badge>
                  )}
                  <Badge className="text-xs px-2 py-1">
                    {development.industry}
                  </Badge>
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-4">{development.title}</h1>

                <p className="text-muted-foreground mb-4">{development.description}</p>

                {development.date && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(development.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Analysis Section */}
              <Card className="mb-6" style={metallicStyle.style}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    HByte Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed">
                    <CitationText
                      text={analysis.summary}
                      onCitationClick={handleCitationClick}
                      citationMap={citationMap}
                      className="font-medium"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Sections */}
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
                  <Card key={`section-${index}`} className="mb-6" style={metallicStyle.style}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {section.content.map((item, pIndex) => (
                          <div key={`item-${pIndex}`}>
                            {item.isBullet ? (
                              <div className="flex items-start py-0.5">
                                <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></div>
                                <CitationText
                                  text={item.text}
                                  onCitationClick={handleCitationClick}
                                  citationMap={citationMap}
                                  className="leading-relaxed font-medium"
                                />
                              </div>
                            ) : (
                              <CitationText
                                text={item.text}
                                onCitationClick={handleCitationClick}
                                citationMap={citationMap}
                                className="leading-relaxed font-medium"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Numerical Data */}
              {development.numerical_data && development.numerical_data.length > 0 && (
                <Card className="mb-6" style={metallicStyle.style}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Numerical Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {development.numerical_data.map((item, index) => (
                        <li key={`numerical-${index}`} className="text-sm flex items-start">
                          <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0 mt-1 text-primary" />
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
                  </CardContent>
                </Card>
              )}

              {/* Source Link */}
              {development.url && (
                <div className="flex items-center justify-center gap-4 py-4">
                  <a
                    href={development.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    View Original Source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-primary/5 rounded-xl border border-primary/20 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Want More Intelligence Like This?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Join HNWI Chronicles to access 1,562+ developments and exclusive market intelligence.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowAccessGate(true)}
                    className="gap-2"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Get Full Access
                  </Button>

                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="gap-2"
                    size="lg"
                  >
                    Learn More
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Professional investors only • Elite market intelligence
                </p>
              </motion.div>
            </motion.div>
          </div>
        </ScrollArea>

        {/* Citation Panel */}
        {isPanelOpen && (
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        )}
      </div>
    </>
  )
}
