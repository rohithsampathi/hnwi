// components/pages/opportunity-page.tsx

// components/pages/opportunity-page.tsx

"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Check, X, Loader2, DollarSign, Building2,
  PiggyBank, ThumbsUp, Phone
} from "lucide-react"
import { getOpportunities, Opportunity } from "@/lib/api"  // removed any placeholders
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

interface OpportunityPageProps {
  region: string
  opportunityId: string
}

// Map opportunity types to icons
const getOpportunityIcon = (type: string | undefined) => {
  if (!type) return DollarSign
  
  switch (type.toLowerCase()) {
    case "real estate":
      return Building2
    case "private equity":
      return PiggyBank
    default:
      return DollarSign
  }
}

export function OpportunityPage({ 
  region, 
  opportunityId, 
  onNavigate 
}: OpportunityPageProps & { onNavigate?: (route: string) => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Fetch all opportunities to find the specific one
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const opportunities = await getOpportunities()
        
        const foundOpportunity = opportunities.find(o => o.id === opportunityId)
        if (foundOpportunity) {
          setOpportunity(foundOpportunity)
        } else {
          setError("Opportunity not found")
        }
      } catch (err) {
        console.error("Failed to fetch opportunity:", err)
        setError("Failed to load investment opportunity")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [opportunityId])

  // Unified navigation handler that works in both contexts
  const handleNavigation = useCallback(
    (path: string) => {
      // Always prefer the provided onNavigate function when available
      if (onNavigate) {
        // Use the onNavigate function passed from parent
        // This ensures we use the app's navigation system when available
        onNavigate(path);
        return;
      }
      
      // Fallback for direct Next.js navigation when we're in app router context
      
      // First try to use the global navigation handler if available
      if (typeof window !== 'undefined' && window.handleGlobalNavigation) {
        window.handleGlobalNavigation(path);
        return;
      }
      
      // Last resort - direct router navigation for specific cases
      if (path === "back") {
        // Default back navigation
        if (region) {
          router.push(`/invest-scan/${region}`);
        } else {
          router.push("/prive-exchange");
        }
      } else if (path === "dashboard") {
        // Special handling for dashboard to maintain state
        sessionStorage.setItem("skipSplash", "true");
        router.push("/");
      } else {
        // Normalize the path and navigate
        const normalizedPath = path.replace(/^\/+/, "");
        router.push(`/${normalizedPath}`);
      }
    },
    [router, region, onNavigate],
  )

  const handleTalkToConcierge = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsProcessing(true)
    
    const userId = localStorage.getItem("userId") || ""
    const userEmail = localStorage.getItem("userEmail") || ""
    const userName = user?.name || "Unknown User"
    
    try {
      // Send data to Formspree (example)
      const response = await fetch("https://formspree.io/f/xwpvjjpz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityTitle: opportunity?.title,
          userName,
          userId,
          userEmail,
          opportunityId: opportunity?.id,
          opportunityType: opportunity?.type,
          opportunityValue: opportunity?.value,
          region: opportunity?.region,
          timestamp: new Date().toISOString(),
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to submit concierge request")
      }
      
      setShowSuccessDialog(true)
      toast({
        title: "Concierge Notified",
        description: `Our concierge has been notified about your interest in ${opportunity?.title}.`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Error submitting concierge request:", error)
      toast({
        title: "Request Failed",
        description: "We couldn't process your request. Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Loading Opportunity" showBackButton onNavigate={handleNavigation}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (error || !opportunity) {
    return (
      <Layout title="Opportunity Not Found" showBackButton onNavigate={handleNavigation}>
        <Card className="w-full bg-background text-foreground">
          <CardContent>
            <Heading2 className="text-2xl font-bold mb-4">Opportunity Not Found</Heading2>
            <Paragraph>{error || "The requested opportunity could not be found. Please try again."}</Paragraph>
            <Button onClick={() => handleNavigation("prive-exchange")} className="mt-4">
              Return to Privé Exchange
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  // Calculate risk level for gradient bar
  const getRiskPosition = (riskLevel: string | undefined) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 15
      case 'medium': return 50
      case 'high': return 85
      default: return 50
    }
  }

  return (
    <>
      <Layout
        title={
          <div className="flex items-center space-x-2">
            {React.createElement(getOpportunityIcon(opportunity.type), { className: "w-6 h-6 text-primary" })}
            <Heading2>Investment Opportunity</Heading2>
          </div>
        }
        showBackButton
        onNavigate={handleNavigation}
      >
        <Card className="w-full bg-background text-foreground">
          <CardHeader>
            <div className="space-y-4">
              {/* 1. Hero Block - Title + Highlight Strip */}
              <CardTitle className="text-4xl font-black tracking-tight">
                {opportunity.title}
              </CardTitle>
              
              {/* Highlight Strip - horizontal badges */}
              <div className="flex flex-wrap items-center gap-1.5 py-2" role="group" aria-label="Investment highlights">
                {opportunity.type && <Badge variant="secondary">{opportunity.type}</Badge>}
                {opportunity.value && <Badge variant="outline">{opportunity.value}</Badge>}
                {opportunity.expectedReturn && <Badge variant="outline">{opportunity.expectedReturn}</Badge>}
                {opportunity.investmentHorizon && <Badge variant="outline">{opportunity.investmentHorizon}</Badge>}
                {opportunity.riskLevel && (
                  <Badge 
                    variant="outline" 
                    className={opportunity.riskLevel.toLowerCase() === 'low' ? 'text-green-600' : ''}
                  >
                    {opportunity.riskLevel} Risk
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* 2. Primary Content Area - Narrative */}
            <div className="pt-8">
              <Paragraph className="text-lg leading-relaxed">
                {opportunity.description}
              </Paragraph>
            </div>
            
            {/* 3. Risk Assessment */}
            {opportunity.riskLevel && (
              <div className="space-y-6 mt-16">
                <div className="text-center space-y-3">
                  <CardTitle className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    Internal Risk Assessment
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Comparative risk positioning within our investment universe
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50/50 via-background to-orange-50/30 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10 p-6 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Risk Level</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${
                          opportunity.riskLevel.toLowerCase() === 'low' ? 'text-green-600 dark:text-green-400' :
                          opportunity.riskLevel.toLowerCase() === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {opportunity.riskLevel}
                        </span>
                        <span className="text-sm text-muted-foreground">Risk</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative h-4 bg-gradient-to-r from-emerald-100 via-amber-100 to-red-100 dark:from-emerald-900/30 dark:via-amber-900/30 dark:to-red-900/30 rounded-full overflow-hidden border border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 opacity-60 rounded-full" />
                        <div 
                          className="absolute top-1/2 w-4 h-4 bg-foreground rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-background"
                          style={{ left: `${getRiskPosition(opportunity.riskLevel)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low Risk</span>
                        <span>Medium Risk</span>
                        <span>High Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 4. Strategic Analysis & Key Numbers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
              {/* Left 2/3 - Strategic Analysis */}
              <div className="lg:col-span-2 space-y-4">
                {opportunity.fullAnalysis && (
                  <div className="space-y-3">
                    <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
                      Strategic Analysis
                    </CardTitle>
                    <Paragraph className="text-base leading-relaxed">
                      {opportunity.fullAnalysis}
                    </Paragraph>
                  </div>
                )}
              </div>
              
              {/* Right 1/3 - Premium Key Numbers */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 rounded-xl border border-primary/20 shadow-xl backdrop-blur-sm">
                  <div className="text-center mb-6">
                    <div className="w-12 h-1 bg-gradient-to-r from-primary/50 to-primary mx-auto mb-3"></div>
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest">
                      INVESTMENT METRICS
                    </h3>
                    <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mt-3"></div>
                  </div>
                  
                  <div className="space-y-5">
                    {opportunity.value && (
                      <div className="text-center p-3 bg-background/80 rounded-lg border border-primary/10">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Investment Size</div>
                        <div className="text-xl font-black text-primary">{opportunity.value}</div>
                      </div>
                    )}
                    {opportunity.expectedReturn && (
                      <div className="text-center p-3 bg-background/80 rounded-lg border border-primary/10">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Return</div>
                        <div className="text-xl font-black text-emerald-600">{opportunity.expectedReturn}</div>
                      </div>
                    )}
                    {opportunity.riskLevel && (
                      <div className="text-center p-3 bg-background/80 rounded-lg border border-primary/10">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Risk Profile</div>
                        <div className={`text-xl font-black ${
                          opportunity.riskLevel.toLowerCase() === 'low' ? 'text-green-600' :
                          opportunity.riskLevel.toLowerCase() === 'medium' ? 'text-amber-600' :
                          'text-red-600'
                        }`}>{opportunity.riskLevel}</div>
                      </div>
                    )}
                    {opportunity.investmentHorizon && (
                      <div className="text-center p-3 bg-background/80 rounded-lg border border-primary/10">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Time Horizon</div>
                        <div className="text-xl font-black text-primary">{opportunity.investmentHorizon}</div>
                      </div>
                    )}
                    
                    {(opportunity.region || opportunity.country) && (
                      <div className="pt-4 border-t border-primary/20">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-3">Geographic Focus</div>
                        <div className="space-y-2">
                          {opportunity.region && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">Region</span>
                              <span className="text-sm font-bold text-primary">{opportunity.region}</span>
                            </div>
                          )}
                          {opportunity.country && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">Country</span>
                              <span className="text-sm font-bold text-primary">{opportunity.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 5. Investment Assessment - World-Class Analysis */}
            {(opportunity.pros || opportunity.cons) && (
              <div className="space-y-12 mt-32">
                {/* Section Header */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-8 h-px bg-primary/30"></div>
                    <CardTitle className="text-3xl font-bold text-primary tracking-tight">
                      Investment Analysis
                    </CardTitle>
                    <div className="w-8 h-px bg-primary/30"></div>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Comprehensive assessment of opportunities and considerations
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Investment Merits */}
                  {opportunity.pros && opportunity.pros.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 dark:bg-green-400/10 rounded-2xl flex items-center justify-center border border-green-200/50 dark:border-green-700/50">
                          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                            Investment Merits
                          </h3>
                          <p className="text-green-600/70 dark:text-green-400/70 text-sm font-medium">
                            Key advantages and opportunities
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {opportunity.pros.slice(0, 4).map((pro, index) => (
                          <div key={index} className="group relative">
                            <div className="flex items-start gap-4 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100/50 dark:border-green-800/30 hover:bg-green-50/80 dark:hover:bg-green-950/30 transition-colors duration-200">
                              <div className="w-5 h-5 bg-green-500/20 dark:bg-green-400/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-lg font-semibold leading-normal text-foreground">{pro}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Considerations */}
                  {opportunity.cons && opportunity.cons.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-400/10 rounded-2xl flex items-center justify-center border border-amber-200/50 dark:border-amber-700/50">
                          <X className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            Risk Considerations
                          </h3>
                          <p className="text-amber-600/70 dark:text-amber-400/70 text-sm font-medium">
                            Important factors to evaluate
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {opportunity.cons.slice(0, 4).map((con, index) => (
                          <div key={index} className="group relative">
                            <div className="flex items-start gap-4 p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/50 dark:border-amber-800/30 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 transition-colors duration-200">
                              <div className="w-5 h-5 bg-amber-500/20 dark:bg-amber-400/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                                <X className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-lg font-semibold leading-normal text-foreground">{con}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 6. Express Interest CTA */}
            <div className="flex justify-center py-8 mt-20">
              <Button 
                onClick={handleTalkToConcierge} 
                className="px-12 py-6 text-lg font-semibold shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Request
                  </>
                ) : (
                  "Express Interest"
                )}
              </Button>
            </div>
            
            {/* 7. On-Page Legal Footnote */}
            <div className="text-center pt-8 mt-12 border-t border-border/50">
              <Paragraph className="text-xs text-muted-foreground">
                Information only · HNWI Chronicles is not a broker-dealer and does not provide personalised investment advice.
              </Paragraph>
            </div>
          </CardContent>
        </Card>

      </Layout>


      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              Concierge Notified
            </DialogTitle>
            <DialogDescription>
              Our concierge has been informed about your interest in{" "}
              <span className="font-semibold">{opportunity?.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/30 p-4 rounded-lg my-4">
            <p className="text-sm">
              Our wealth management specialist will contact you shortly to discuss this investment opportunity in detail
              and answer any questions you may have.
            </p>
            <div className="flex items-center gap-2 mt-3 text-primary">
              <Phone className="h-4 w-4" />
              <p className="text-sm font-medium">Expect a call within 24 hours</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue Exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
