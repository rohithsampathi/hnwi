// components/pages/opportunity-page.tsx

// components/pages/opportunity-page.tsx

"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import {
  Check, X, Loader2, DollarSign, Building2,
  PiggyBank, ThumbsUp, Phone
} from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
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
  const { theme } = useTheme()
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
    
    const userId = user?.id || localStorage.getItem("userId") || ""
    const userEmail = user?.email || localStorage.getItem("userEmail") || ""
    const userName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || "Unknown User"
    
    console.log("Submitting form to Formspree with data:", {
      opportunityTitle: opportunity?.title,
      userName,
      userId,
      userEmail,
      opportunityId: opportunity?.id,
      opportunityType: opportunity?.type,
      opportunityValue: opportunity?.value,
      region: opportunity?.region,
      timestamp: new Date().toISOString(),
    })
    
    try {
      // Use Express Interest endpoint for all opportunities
      const formspreeEndpoint = "https://formspree.io/f/xldgwozd"  // Express Interest endpoint for all opportunities
        
      console.log("Using Formspree endpoint:", formspreeEndpoint)
      
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          opportunityTitle: opportunity?.title,
          userName,
          userId,
          userEmail,
          opportunityId: opportunity?.id,
          opportunityType: opportunity?.type,
          opportunityValue: opportunity?.value,
          region: opportunity?.region,
          source: region ? "Privé Exchange" : "General Opportunity",
          timestamp: new Date().toISOString(),
          _subject: `Express Interest: ${opportunity?.title}`,
          message: `User ${userName} (${userEmail}) has expressed interest in the investment opportunity: ${opportunity?.title}. Source: ${region ? "Privé Exchange" : "General Opportunity"}. Details: Type: ${opportunity?.type}, Value: ${opportunity?.value}, Region: ${opportunity?.region}`
        }),
      })
      
      console.log("Formspree response status:", response.status)
      console.log("Formspree response headers:", response.headers)
      
      const responseData = await response.text()
      console.log("Formspree response data:", responseData)
      
      if (!response.ok) {
        throw new Error(`Failed to submit concierge request: ${response.status} ${responseData}`)
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
          <CrownLoader size="lg" text="Loading opportunity details..." />
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
        <Card 
          className={`w-full border-none ${getMetallicCardStyle(theme).className}`}
          style={{
            ...getMetallicCardStyle(theme).style,
            color: theme === "dark" ? "white" : "black",
          }}
        >
          <CardHeader>
            <div className="space-y-4">
              {/* 1. Hero Block - Title + Highlight Strip */}
              <CardTitle className="text-4xl font-black tracking-tight">
                {opportunity.title}
              </CardTitle>
              
              {/* Highlight Strip - horizontal badges */}
              <div className="flex flex-wrap items-center gap-1.5 py-2" role="group" aria-label="Investment highlights">
                {opportunity.type && <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">{opportunity.type}</PremiumBadge>}
                {opportunity.value && <Badge variant="outline">{opportunity.value}</Badge>}
                {opportunity.expectedReturn && <Badge variant="outline">{opportunity.expectedReturn}</Badge>}
                {opportunity.investmentHorizon && <Badge variant="outline">{opportunity.investmentHorizon}</Badge>}
                {opportunity.riskLevel && (
                  <Badge 
                    variant="outline" 
                    className={opportunity.riskLevel.toLowerCase() === 'low' ? 'text-primary' : ''}
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
                  <CardTitle className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                    Internal Risk Assessment
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Comparative risk positioning within our investment universe
                  </p>
                </div>
                
                <div 
                  className="p-6 rounded-xl border-none"
                  style={{
                    background: theme === "dark" 
                      ? "#2a2a2a" 
                      : "#f0f0f0",
                    border: theme === "dark" 
                      ? "2px solid rgba(75, 85, 99, 0.5)" 
                      : "2px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: theme === "dark"
                      ? "0 10px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 10px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${theme === "dark" ? "text-primary" : "text-black"}`}>Risk Level</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                          {opportunity.riskLevel}
                        </span>
                        <span className="text-sm text-muted-foreground">Risk</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="relative h-4 bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200 dark:from-emerald-900/40 dark:via-amber-900/40 dark:to-red-900/40 rounded-full overflow-hidden border border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-80 rounded-full shadow-inner" 
                             style={{
                               background: theme === "dark" 
                                 ? "linear-gradient(90deg, #10b981 0%, #059669 20%, #f59e0b 50%, #d97706 80%, #dc2626 100%)"
                                 : "linear-gradient(90deg, #10b981 0%, #34d399 20%, #f59e0b 50%, #fbbf24 80%, #ef4444 100%)",
                               boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.3)"
                             }} />
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
                    <CardTitle className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
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
                <div 
                  className="p-6 rounded-xl shadow-xl border-none"
                  style={{
                    background: theme === "dark" 
                      ? "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 25%, #2a2a2a 50%, #1f1f1f 75%, #2a2a2a 100%)"
                      : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%, #f5f5f5 100%)",
                    border: theme === "dark" 
                      ? "2px solid rgba(75, 85, 99, 0.5)" 
                      : "2px solid rgba(148, 163, 184, 0.3)",
                    boxShadow: theme === "dark"
                      ? "0 10px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 10px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
                  }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest">
                      INVESTMENT METRICS
                    </h3>
                  </div>
                  
                  <div className="space-y-5">
                    {opportunity.value && (
                      <div 
                        className="text-center p-3 rounded-lg border-none"
                        style={{
                          background: theme === "dark" 
                            ? "#2a2a2a" 
                            : "#f0f0f0",
                          border: theme === "dark" 
                            ? "1px solid rgba(148, 163, 184, 0.2)" 
                            : "1px solid rgba(148, 163, 184, 0.3)",
                          boxShadow: theme === "dark"
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                        }}
                      >
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Investment Size</div>
                        <div className="text-xl font-black text-primary">{opportunity.value}</div>
                      </div>
                    )}
                    {opportunity.expectedReturn && (
                      <div 
                        className="text-center p-3 rounded-lg border-none"
                        style={{
                          background: theme === "dark" 
                            ? "#2a2a2a" 
                            : "#f0f0f0",
                          border: theme === "dark" 
                            ? "1px solid rgba(148, 163, 184, 0.2)" 
                            : "1px solid rgba(148, 163, 184, 0.3)",
                          boxShadow: theme === "dark"
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                        }}
                      >
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Return</div>
                        <div className={`text-xl font-black ${theme === "dark" ? "text-primary" : "text-black"}`}>{opportunity.expectedReturn}</div>
                      </div>
                    )}
                    {opportunity.riskLevel && (
                      <div 
                        className="text-center p-3 rounded-lg border-none"
                        style={{
                          background: theme === "dark" 
                            ? "#2a2a2a" 
                            : "#f0f0f0",
                          border: theme === "dark" 
                            ? "1px solid rgba(148, 163, 184, 0.2)" 
                            : "1px solid rgba(148, 163, 184, 0.3)",
                          boxShadow: theme === "dark"
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                        }}
                      >
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Risk Profile</div>
                        <div className={`text-xl font-black ${theme === "dark" ? "text-primary" : "text-black"}`}>{opportunity.riskLevel}</div>
                      </div>
                    )}
                    {opportunity.investmentHorizon && (
                      <div 
                        className="text-center p-3 rounded-lg border-none"
                        style={{
                          background: theme === "dark" 
                            ? "#2a2a2a" 
                            : "#f0f0f0",
                          border: theme === "dark" 
                            ? "1px solid rgba(148, 163, 184, 0.2)" 
                            : "1px solid rgba(148, 163, 184, 0.3)",
                          boxShadow: theme === "dark"
                            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                            : "inset 0 1px 0 rgba(255, 255, 255, 0.5)"
                        }}
                      >
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
                    <CardTitle className="text-3xl font-bold text-primary tracking-tight">
                      Investment Analysis
                    </CardTitle>
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
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          theme === "dark" 
                            ? "bg-gray-700/50 border-gray-600/50" 
                            : "bg-gray-200/50 border-gray-400/30"
                        }`}>
                          <Check className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                            Investment Merits
                          </h3>
                          <p className={`text-sm font-medium ${theme === "dark" ? "text-primary/70" : "text-black/70"}`}>
                            Key advantages and opportunities
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {opportunity.pros.slice(0, 4).map((pro, index) => (
                          <div key={index} className="group relative">
                            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors duration-200 ${
                              theme === "dark" 
                                ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50" 
                                : "bg-gray-100/50 border-gray-300/40 hover:bg-gray-100/80"
                            }`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                theme === "dark" 
                                  ? "bg-gray-700/50" 
                                  : "bg-gray-300/50"
                              }`}>
                                <Check className={`w-3 h-3 ${theme === "dark" ? "text-primary" : "text-black"}`} />
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
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          theme === "dark" 
                            ? "bg-black/50 border-black/70" 
                            : "bg-black/10 border-black/30"
                        }`}>
                          <X className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-black"}`} />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                            Risk Considerations
                          </h3>
                          <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                            Important factors to evaluate
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {opportunity.cons.slice(0, 4).map((con, index) => (
                          <div key={index} className="group relative">
                            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors duration-200 ${
                              theme === "dark" 
                                ? "bg-black/30 border-black/50 hover:bg-black/50" 
                                : "bg-black/5 border-black/20 hover:bg-black/10"
                            }`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                                theme === "dark" 
                                  ? "bg-black/70" 
                                  : "bg-black/20"
                              }`}>
                                <X className={`w-3 h-3 ${theme === "dark" ? "text-white" : "text-black"}`} />
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
                For Information only · HNWI Chronicles is not a broker-dealer and does not provide personalised investment advice.
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
              <ThumbsUp className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
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
