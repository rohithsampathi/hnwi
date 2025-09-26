// app/share/opportunity/[opportunityId]/page.tsx
// Public page for viewing shared investment opportunities

"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  DollarSign,
  Building2,
  PiggyBank,
  TrendingUp,
  MapPin,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getOpportunities, type Opportunity } from "@/lib/api"

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
            To invest in this opportunity and access all Privé Exchange features, you need a premium HNWI Chronicles account.
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
            Join elite investors with exclusive market opportunities
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Map opportunity types to icons
const getOpportunityIcon = (type: string | undefined) => {
  if (!type) return DollarSign

  const typeLower = type.toLowerCase()
  if (typeLower.includes("real estate")) return Building2
  if (typeLower.includes("private equity")) return PiggyBank
  if (typeLower.includes("venture")) return TrendingUp
  return DollarSign
}

export default function SharedOpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const { theme } = useTheme()
  const opportunityId = params.opportunityId as string

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAccessGate, setShowAccessGate] = useState(false)

  useEffect(() => {
    loadOpportunity()
  }, [opportunityId])

  const loadOpportunity = async () => {
    try {
      setIsLoading(true)
      const opportunities = await getOpportunities()
      const found = opportunities.find(o => o.id === opportunityId)

      if (found) {
        setOpportunity(found)
      } else {
        setError("Opportunity not found or no longer available")
      }
    } catch (err) {
      setError("Failed to load opportunity details")
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

  const handleInvest = () => {
    // Show access gate for investment action
    setShowAccessGate(true)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CrownLoader size="lg" text="Loading opportunity..." />
      </div>
    )
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Opportunity Not Found</h2>
          <p className="text-muted-foreground">{error || "This opportunity is no longer available"}</p>
          <Button onClick={handleBack} variant="outline">
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  const OpportunityIcon = getOpportunityIcon(opportunity.type)
  const metallicStyle = getMetallicCardStyle(theme)

  return (
    <>
      <MetaTags
        title={`${opportunity.title} - Investment Opportunity | HNWI Chronicles`}
        description={opportunity.description || "Exclusive investment opportunity available on Privé Exchange"}
        image="https://app.hnwichronicles.com/images/prive-exchange-og.png"
        url={`https://app.hnwichronicles.com/share/opportunity/${opportunityId}`}
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
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <OpportunityIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{opportunity.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {opportunity.region && (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>{opportunity.region}</span>
                          <Separator orientation="vertical" className="h-4" />
                        </>
                      )}
                      {opportunity.type && (
                        <>
                          <span>{opportunity.type}</span>
                          <Separator orientation="vertical" className="h-4" />
                        </>
                      )}
                      <span>Listed {new Date(opportunity.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  className={cn(
                    "px-3 py-1",
                    opportunity.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-gray-500/10 text-gray-600"
                  )}
                >
                  {opportunity.is_active ? "Active" : "Closed"}
                </Badge>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-border/50" style={metallicStyle.style}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Investment Size</p>
                        <p className="text-lg font-bold text-foreground">{opportunity.value || "Contact for details"}</p>
                      </div>
                      <DollarSign className="h-5 w-5 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50" style={metallicStyle.style}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Expected Return</p>
                        <p className="text-lg font-bold text-foreground">{opportunity.expectedReturn || "Variable"}</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50" style={metallicStyle.style}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                        <p className="text-lg font-bold text-foreground">{opportunity.riskLevel || "Medium"}</p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50" style={metallicStyle.style}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Time Horizon</p>
                        <p className="text-lg font-bold text-foreground">{opportunity.investmentHorizon || "3-5 years"}</p>
                      </div>
                      <Calendar className="h-5 w-5 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {opportunity.description && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {opportunity.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Investment Analysis - Show full data */}
              {opportunity.fullAnalysis && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {opportunity.fullAnalysis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pros and Cons */}
              {(opportunity.pros?.length || opportunity.cons?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {opportunity.pros?.length && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          Investment Advantages
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {opportunity.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {opportunity.cons?.length && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          Risk Considerations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {opportunity.cons.map((con, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Members-Only Actions Section */}
              <Card className="mb-6 relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg">Investment Actions</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="blur-sm pointer-events-none">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Button className="flex-1">
                          Express Interest
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Request Information
                        </Button>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Connect with our investment concierge team for personalized guidance and exclusive deal flow.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Overlay prompting to get access */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="p-3 bg-primary/10 rounded-full inline-block">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">Members-Only Actions</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Join HNWI Chronicles to express interest and connect with our investment concierge team
                      </p>
                      <Button onClick={handleGetAccess} className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Get Access
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-primary/5 rounded-xl border border-primary/20 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Ready to Invest?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Join HNWI Chronicles to access this opportunity and connect with our investment concierge team.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleInvest}
                    className="gap-2"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Express Interest
                  </Button>

                  <Button
                    onClick={handleGetAccess}
                    variant="outline"
                    className="gap-2"
                    size="lg"
                  >
                    View All Opportunities
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Minimum investment requirements apply • Professional investors only
                </p>
              </motion.div>
            </motion.div>
          </div>
        </ScrollArea>
      </div>
    </>
  )
}