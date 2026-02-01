// components/pages/opportunity-page.tsx

// components/pages/opportunity-page.tsx

"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Heading2, Paragraph } from "@/components/ui/typography"
import { PageHeaderWithBack } from "@/components/ui/back-button"
import { PageWrapper } from "@/components/ui/page-wrapper"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import {
  Check, X, Loader2, DollarSign, Building2,
  PiggyBank, ThumbsUp, Phone, TrendingUp, AlertTriangle,
  FileText, MapPin, Home, Calendar, Shield, DollarSign as DollarSignIcon,
  Target, ChevronDown, ChevronUp
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
  region?: string // Make region optional since not all opportunities come from regions
  opportunityId: string
  onNavigate?: (route: string) => void
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
}: OpportunityPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    thesis: false,
    financials: false,
    exitStrategy: false,
    riskAnalysis: false,
    assetDetails: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Fetch all opportunities to find the specific one
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // CRITICAL: Always bust cache to get fresh opportunity data
        const opportunities = await getOpportunities(true)

        const foundOpportunity = opportunities.find(o => o.id === opportunityId)
        if (foundOpportunity) {
          setOpportunity(foundOpportunity)
        } else {
          setError("Opportunity not found")
        }
      } catch (err) {
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
        // Navigate to dashboard route directly
        router.push("/dashboard");
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
    
    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          source: "prive_exchange",
          opportunityTitle: opportunity?.title,
          userName,
          userId,
          userEmail,
          opportunityId: opportunity?.id,
          opportunityType: opportunity?.type,
          opportunityValue: opportunity?.value,
          region: opportunity?.region,
          timestamp: new Date().toISOString(),
          _subject: `Express Interest: ${opportunity?.title}`,
          message: `User ${userName} (${userEmail}) has expressed interest in the investment opportunity: ${opportunity?.title}. Source: ${region ? "Privé Exchange" : "General Opportunity"}. Details: Type: ${opportunity?.type}, Value: ${opportunity?.value}, Region: ${opportunity?.region}`
        }),
      })
      
      
      const responseData = await response.text()
      
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
      <PageWrapper>
        <div className="flex items-center justify-center h-[50vh]">
          <CrownLoader size="lg" text="Loading opportunity details..." />
        </div>
      </PageWrapper>
    )
  }

  if (error || !opportunity) {
    return (
      <PageWrapper>
        <div className="px-4 sm:px-6 lg:px-8">
          <Card className="w-full bg-background text-foreground">
            <CardContent className="p-6">
              <Heading2 className="text-2xl font-bold mb-4">Opportunity Not Found</Heading2>
              <Paragraph>{error || "The requested opportunity could not be found. Please try again."}</Paragraph>
              <Button onClick={() => handleNavigation("prive-exchange")} className="mt-4">
                Return to Privé Exchange
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
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
    <PageWrapper>
      {/* Back Button */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <PageHeaderWithBack
          title={opportunity.title}
          subtitle="Investment Opportunity Details"
          onBack={() => handleNavigation("back")}
        />
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8">
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
            <div className="w-full">
              <Paragraph className="text-lg leading-relaxed">
                {opportunity.description}
              </Paragraph>
            </div>
            
            {/* 3. Risk Assessment */}
            {opportunity.riskLevel && (
              <div className="space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                      <div className="border-t border-primary/20">
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
              <div className="space-y-12">
                {/* Section Header */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3">
                    <CardTitle className="text-3xl font-bold text-primary tracking-tight">
                      Investment Analysis
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Comprehensive analysis of opportunities and considerations
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

            {/* 6. DEEP DIVE SECTIONS - Full 2,000-word analysis */}

            {/* 6.1 Investment Thesis - WHY THIS MAKES MONEY */}
            {opportunity.investment_thesis && (
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('thesis')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                      : "bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <TrendingUp className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                        Investment Thesis
                      </h3>
                      <p className="text-sm text-muted-foreground">Why this makes money · Value creation mechanisms</p>
                    </div>
                  </div>
                  {expandedSections.thesis ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.thesis && (
                  <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/50">
                    {/* What You're Buying */}
                    {opportunity.investment_thesis.what_youre_buying && (
                      <div className="space-y-3">
                        <h4 className={`text-lg font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                          What You're Buying
                        </h4>
                        <p className="text-base leading-relaxed text-foreground">
                          {opportunity.investment_thesis.what_youre_buying}
                        </p>
                      </div>
                    )}

                    {/* Why This Makes Money */}
                    {opportunity.investment_thesis.why_this_makes_money && opportunity.investment_thesis.why_this_makes_money.length > 0 && (
                      <div className="space-y-4">
                        <h4 className={`text-lg font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                          Why This Makes Money
                        </h4>
                        {opportunity.investment_thesis.why_this_makes_money.map((driver, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            theme === "dark"
                              ? "bg-gray-800/20 border-gray-700/30"
                              : "bg-gray-50 border-gray-200"
                          }`}>
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                                  theme === "dark" ? "bg-primary/20" : "bg-black/10"
                                }`}>
                                  <span className={`text-sm font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <p className="font-semibold text-foreground">
                                    <span className="text-muted-foreground text-sm">Driver: </span>
                                    {driver.driver}
                                  </p>
                                  <p className="text-sm text-foreground">
                                    <span className="text-muted-foreground">Mechanism: </span>
                                    {driver.mechanism}
                                  </p>
                                  {(driver.value_creation || driver.value_creation_display) && (
                                    <p className="text-sm text-foreground">
                                      <span className="text-muted-foreground">Value Creation: </span>
                                      {driver.value_creation_display || driver.value_creation}
                                    </p>
                                  )}
                                  {driver.evidence && (
                                    <p className="text-sm text-muted-foreground italic">
                                      Evidence: {driver.evidence}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* The Catch */}
                    {opportunity.investment_thesis.the_catch && opportunity.investment_thesis.the_catch.length > 0 && (
                      <div className="space-y-3">
                        <h4 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          The Catch
                        </h4>
                        <div className="space-y-2">
                          {opportunity.investment_thesis.the_catch.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                              <p className="text-sm text-foreground">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Privé/Victor Verdict - supports both new and legacy formats */}
                    {(opportunity.investment_thesis.prive_verdict || opportunity.investment_thesis.victor_verdict_one_line) && (
                      <div className={`p-4 rounded-lg border-2 ${
                        theme === "dark"
                          ? "bg-primary/10 border-primary/30"
                          : "bg-black/5 border-black/20"
                      }`}>
                        <p className={`text-base font-semibold italic ${theme === "dark" ? "text-primary" : "text-black"}`}>
                          "{opportunity.investment_thesis.prive_verdict || opportunity.investment_thesis.victor_verdict_one_line}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {opportunity.investment_thesis.prive_verdict ? 'Privé Intelligence' : 'Intelligence Assessment'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6.2 Financial Structure */}
            {(opportunity.pricing || opportunity.payment_plan || opportunity.return_analysis) && (
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('financials')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                      : "bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <DollarSignIcon className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                        Financial Structure
                      </h3>
                      <p className="text-sm text-muted-foreground">Pricing · Payment plan · Return scenarios</p>
                    </div>
                  </div>
                  {expandedSections.financials ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.financials && (
                  <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/50">
                    {/* Pricing Breakdown */}
                    {opportunity.pricing && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {opportunity.pricing.base_price_usd && (
                            <div className="p-4 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Base Price</p>
                              <p className={`text-xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                ${opportunity.pricing.base_price_usd.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {opportunity.pricing.discount_percentage && (
                            <div className="p-4 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Discount</p>
                              <p className="text-xl font-bold text-primary">
                                {opportunity.pricing.discount_percentage}% off
                              </p>
                            </div>
                          )}
                          {opportunity.pricing.total_investment_required && (
                            <div className="p-4 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Total Investment Required</p>
                              <p className={`text-xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                ${opportunity.pricing.total_investment_required.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {opportunity.pricing.per_acre && (
                            <div className="p-4 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Per Acre</p>
                              <p className={`text-xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                ${opportunity.pricing.per_acre.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Transaction Costs */}
                        {opportunity.pricing.transaction_costs && (
                          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                            <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Transaction Costs</h5>
                            <div className="space-y-2">
                              {opportunity.pricing.transaction_costs.stamp_duty && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-sm text-muted-foreground">
                                    Stamp Duty ({opportunity.pricing.transaction_costs.stamp_duty_percentage}%)
                                  </span>
                                  <span className="text-base font-semibold text-foreground">
                                    ${opportunity.pricing.transaction_costs.stamp_duty.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {opportunity.pricing.transaction_costs.registration_fees && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-sm text-muted-foreground">
                                    Registration Fees ({opportunity.pricing.transaction_costs.registration_percentage}%)
                                  </span>
                                  <span className="text-base font-semibold text-foreground">
                                    ${opportunity.pricing.transaction_costs.registration_fees.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {opportunity.pricing.transaction_costs.legal_fees && (
                                <div className="flex justify-between items-baseline">
                                  <span className="text-sm text-muted-foreground">Legal Fees</span>
                                  <span className="text-base font-semibold text-foreground">
                                    ${opportunity.pricing.transaction_costs.legal_fees.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {opportunity.pricing.transaction_costs.total_transaction_costs && (
                                <div className="flex justify-between items-baseline pt-2 border-t border-border/30">
                                  <span className="text-sm font-semibold text-foreground">Total Transaction Costs</span>
                                  <span className="text-base font-bold text-primary">
                                    ${opportunity.pricing.transaction_costs.total_transaction_costs.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Return Scenarios */}
                    {opportunity.return_analysis?.scenarios && (
                      <div className="space-y-4">
                        <h4 className={`text-lg font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                          Return Scenarios (5-Year Projections)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {opportunity.return_analysis.scenarios.conservative && (
                            <div className={`p-5 rounded-lg border space-y-3 ${
                              theme === "dark" ? "bg-gray-800/20 border-gray-700/30" : "bg-gray-100/50 border-gray-300/40"
                            }`}>
                              <p className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-muted-foreground" : "text-gray-700"}`}>
                                Conservative
                              </p>
                              <div className="space-y-2">
                                {opportunity.return_analysis.scenarios.conservative.annualized_return && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Annual Return</p>
                                    <p className="text-2xl font-bold text-foreground">
                                      {opportunity.return_analysis.scenarios.conservative.annualized_return}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.conservative.total_return_5yr && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Return (5yr)</p>
                                    <p className="text-lg font-semibold text-foreground">
                                      {opportunity.return_analysis.scenarios.conservative.total_return_5yr}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.conservative.assumptions && (
                                  <div className="pt-2 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground italic">
                                      {opportunity.return_analysis.scenarios.conservative.assumptions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {opportunity.return_analysis.scenarios.base_case && (
                            <div className={`p-5 rounded-lg border-2 space-y-3 relative ${
                              theme === "dark" ? "bg-primary/10 border-primary/30" : "bg-primary/5 border-primary/40"
                            }`}>
                              <Badge className={`absolute -top-2 -right-2 ${theme === "dark" ? "bg-primary" : "bg-black"}`}>
                                Expected ✨
                              </Badge>
                              <p className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                Base Case
                              </p>
                              <div className="space-y-2">
                                {opportunity.return_analysis.scenarios.base_case.annualized_return && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Annual Return</p>
                                    <p className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                                      {opportunity.return_analysis.scenarios.base_case.annualized_return}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.base_case.total_return_5yr && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Return (5yr)</p>
                                    <p className="text-lg font-semibold text-foreground">
                                      {opportunity.return_analysis.scenarios.base_case.total_return_5yr}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.base_case.assumptions && (
                                  <div className="pt-2 border-t border-primary/20">
                                    <p className="text-xs text-muted-foreground italic">
                                      {opportunity.return_analysis.scenarios.base_case.assumptions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {opportunity.return_analysis.scenarios.optimistic && (
                            <div className={`p-5 rounded-lg border space-y-3 ${
                              theme === "dark" ? "bg-gray-800/20 border-gray-700/30" : "bg-gray-100/50 border-gray-300/40"
                            }`}>
                              <p className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-muted-foreground" : "text-gray-700"}`}>
                                Optimistic
                              </p>
                              <div className="space-y-2">
                                {opportunity.return_analysis.scenarios.optimistic.annualized_return && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Annual Return</p>
                                    <p className="text-2xl font-bold text-foreground">
                                      {opportunity.return_analysis.scenarios.optimistic.annualized_return}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.optimistic.total_return_5yr && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total Return (5yr)</p>
                                    <p className="text-lg font-semibold text-foreground">
                                      {opportunity.return_analysis.scenarios.optimistic.total_return_5yr}%
                                    </p>
                                  </div>
                                )}
                                {opportunity.return_analysis.scenarios.optimistic.assumptions && (
                                  <div className="pt-2 border-t border-border/30">
                                    <p className="text-xs text-muted-foreground italic">
                                      {opportunity.return_analysis.scenarios.optimistic.assumptions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6.3 Exit Strategy */}
            {opportunity.exit_strategy && (
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('exitStrategy')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                      : "bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Target className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                        Exit Strategy
                      </h3>
                      <p className="text-sm text-muted-foreground">Multiple exit paths · Holding costs</p>
                    </div>
                  </div>
                  {expandedSections.exitStrategy ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.exitStrategy && (
                  <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/50">
                    {/* Exit Paths */}
                    <div className="space-y-4">
                      {opportunity.exit_strategy.primary_exit && (
                        <div className={`p-4 rounded-lg border ${
                          theme === "dark" ? "bg-gray-800/20 border-gray-700/30" : "bg-gray-100/50 border-gray-300/40"
                        }`}>
                          <h5 className={`font-semibold mb-2 ${theme === "dark" ? "text-primary" : "text-black"}`}>
                            Primary Exit
                          </h5>
                          <p className="text-sm text-foreground">
                            {typeof opportunity.exit_strategy.primary_exit === 'string'
                              ? opportunity.exit_strategy.primary_exit
                              : opportunity.exit_strategy.primary_exit.strategy || JSON.stringify(opportunity.exit_strategy.primary_exit)}
                          </p>
                          {typeof opportunity.exit_strategy.primary_exit === 'object' && opportunity.exit_strategy.primary_exit.timeframe && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Timeframe: {opportunity.exit_strategy.primary_exit.timeframe}
                            </p>
                          )}
                        </div>
                      )}
                      {opportunity.exit_strategy.secondary_exit && (
                        <div className={`p-4 rounded-lg border ${
                          theme === "dark" ? "bg-gray-800/20 border-gray-700/30" : "bg-gray-100/50 border-gray-300/40"
                        }`}>
                          <h5 className={`font-semibold mb-2 ${theme === "dark" ? "text-muted-foreground" : "text-gray-700"}`}>
                            Secondary Exit
                          </h5>
                          <p className="text-sm text-foreground">
                            {typeof opportunity.exit_strategy.secondary_exit === 'string'
                              ? opportunity.exit_strategy.secondary_exit
                              : opportunity.exit_strategy.secondary_exit.strategy || JSON.stringify(opportunity.exit_strategy.secondary_exit)}
                          </p>
                          {typeof opportunity.exit_strategy.secondary_exit === 'object' && opportunity.exit_strategy.secondary_exit.timeframe && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Timeframe: {opportunity.exit_strategy.secondary_exit.timeframe}
                            </p>
                          )}
                        </div>
                      )}
                      {opportunity.exit_strategy.emergency_exit && (
                        <div className={`p-4 rounded-lg border ${
                          theme === "dark" ? "bg-gray-800/20 border-gray-700/30" : "bg-gray-100/50 border-gray-300/40"
                        }`}>
                          <h5 className={`font-semibold mb-2 text-muted-foreground`}>
                            Emergency Exit
                          </h5>
                          <p className="text-sm text-foreground">
                            {typeof opportunity.exit_strategy.emergency_exit === 'string'
                              ? opportunity.exit_strategy.emergency_exit
                              : opportunity.exit_strategy.emergency_exit.strategy || JSON.stringify(opportunity.exit_strategy.emergency_exit)}
                          </p>
                          {typeof opportunity.exit_strategy.emergency_exit === 'object' && opportunity.exit_strategy.emergency_exit.timeframe && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Timeframe: {opportunity.exit_strategy.emergency_exit.timeframe}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Holding Costs */}
                    {opportunity.exit_strategy.holding_costs && (
                      <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          Holding Costs
                        </h5>
                        <div className="space-y-2">
                          {opportunity.exit_strategy.holding_costs.monthly_total && (
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Monthly Total</span>
                              <span className="text-base font-semibold text-foreground">
                                ${opportunity.exit_strategy.holding_costs.monthly_total.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {opportunity.exit_strategy.holding_costs.annual_total && (
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm text-muted-foreground">Annual Total</span>
                              <span className="text-base font-bold text-primary">
                                ${opportunity.exit_strategy.holding_costs.annual_total.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {opportunity.exit_strategy.holding_costs.breakdown && (
                            <div className="pt-2 border-t border-border/30 space-y-1">
                              {Object.entries(opportunity.exit_strategy.holding_costs.breakdown).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-baseline">
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-sm text-foreground">
                                    ${typeof value === 'number' ? value.toLocaleString() : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6.4 Detailed Risk Analysis */}
            {opportunity.risk_analysis && (
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('riskAnalysis')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                      : "bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Shield className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                        Detailed Risk Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">Risk factors · Downside scenarios · Red flags</p>
                    </div>
                  </div>
                  {expandedSections.riskAnalysis ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.riskAnalysis && (
                  <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/50">
                    {/* Risk Score */}
                    {opportunity.risk_analysis.overall_risk_score !== undefined && (
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                        <p className="text-3xl font-bold text-foreground">{opportunity.risk_analysis.overall_risk_score}/10</p>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {opportunity.risk_analysis.risk_factors && opportunity.risk_analysis.risk_factors.length > 0 && (
                      <div className="space-y-3">
                        <h5 className={`font-semibold ${theme === "dark" ? "text-muted-foreground" : "text-gray-700"}`}>
                          Key Considerations
                        </h5>
                        {opportunity.risk_analysis.risk_factors.map((factor: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                            <span className="text-muted-foreground mt-1">·</span>
                            <p className="text-sm text-muted-foreground">
                              {typeof factor === 'object'
                                ? (factor.factor_name || factor.description || JSON.stringify(factor))
                                : String(factor)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Red Flags - Subtle */}
                    {opportunity.risk_analysis.red_flags && opportunity.risk_analysis.red_flags.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-muted-foreground">Verification Required</h5>
                        {opportunity.risk_analysis.red_flags.map((flag: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-muted-foreground mt-1">·</span>
                            <p className="text-sm text-muted-foreground">
                              {String(flag).replace(/⚠️/g, '').trim()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6.5 Asset Details (for Real Estate) */}
            {opportunity.asset_details && (
              <div className="space-y-4">
                <button
                  onClick={() => toggleSection('assetDetails')}
                  className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                      : "bg-gray-100/50 border-gray-300/50 hover:bg-gray-100/80"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Home className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                        Asset Details
                      </h3>
                      <p className="text-sm text-muted-foreground">Property specs · Location · Developer · Timeline</p>
                    </div>
                  </div>
                  {expandedSections.assetDetails ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedSections.assetDetails && (
                  <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/50">
                    {/* Property Specs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {opportunity.asset_details.property_type && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-semibold text-foreground">{opportunity.asset_details.property_type}</p>
                        </div>
                      )}
                      {opportunity.asset_details.bedrooms && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground">Bedrooms</p>
                          <p className="font-semibold text-foreground">{opportunity.asset_details.bedrooms}</p>
                        </div>
                      )}
                      {opportunity.asset_details.total_area_sqft && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground">Area</p>
                          <p className="font-semibold text-foreground">{opportunity.asset_details.total_area_sqft} sqft</p>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    {opportunity.asset_details.location && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location
                        </h5>
                        {opportunity.asset_details.location.full_address && (
                          <p className="text-sm text-foreground">{opportunity.asset_details.location.full_address}</p>
                        )}
                        {opportunity.asset_details.location.nearby_landmarks && opportunity.asset_details.location.nearby_landmarks.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {opportunity.asset_details.location.nearby_landmarks.map((landmark, index) => (
                              <Badge key={index} variant="outline">{landmark}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Developer Info */}
                    {opportunity.asset_details.developer && (
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h5 className="font-semibold text-foreground mb-2">Developer</h5>
                        <div className="space-y-1 text-sm">
                          {opportunity.asset_details.developer.name && <p><span className="text-muted-foreground">Name:</span> {opportunity.asset_details.developer.name}</p>}
                          {opportunity.asset_details.developer.established && <p><span className="text-muted-foreground">Established:</span> {opportunity.asset_details.developer.established}</p>}
                          {opportunity.asset_details.developer.assets_under_management && <p><span className="text-muted-foreground">AUM:</span> {opportunity.asset_details.developer.assets_under_management}</p>}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {opportunity.asset_details.amenities && opportunity.asset_details.amenities.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-foreground">Amenities</h5>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.asset_details.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6.6 Land & Climate Details (for Agricultural Properties) */}
            {opportunity.asset_details?.soil_climate && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-100/50 border-gray-300/50"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className={`w-5 h-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                      Land & Climate Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {opportunity.asset_details.soil_climate.soil_type && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Soil Type</p>
                        <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.asset_details.soil_climate.soil_type}
                        </p>
                      </div>
                    )}
                    {opportunity.asset_details.soil_climate.climate && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Climate</p>
                        <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.asset_details.soil_climate.climate}
                        </p>
                      </div>
                    )}
                    {opportunity.asset_details.soil_climate.rainfall_mm && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Rainfall</p>
                        <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.asset_details.soil_climate.rainfall_mm} mm
                        </p>
                      </div>
                    )}
                    {opportunity.asset_details.soil_climate.water_table_depth && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Water Table Depth</p>
                        <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                          {opportunity.asset_details.soil_climate.water_table_depth}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6.7 Water Resources */}
            {opportunity.asset_details?.water_resources && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-100/50 border-gray-300/50"
                }`}>
                  <h3 className={`text-lg font-bold mb-3 ${theme === "dark" ? "text-primary" : "text-black"}`}>
                    Water Resources
                  </h3>
                  <div className="space-y-2">
                    {opportunity.asset_details.water_resources.source && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Source: </span>
                        {opportunity.asset_details.water_resources.source}
                      </p>
                    )}
                    {opportunity.asset_details.water_resources.note && (
                      <p className="text-xs text-muted-foreground italic">
                        {opportunity.asset_details.water_resources.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 6.8 Next Steps / Due Diligence */}
            {opportunity.next_steps && opportunity.next_steps.length > 0 && (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  theme === "dark" ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-100/50 border-gray-300/50"
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-primary" : "text-black"}`}>
                    Next Steps
                  </h3>
                  <div className="space-y-3">
                    {opportunity.next_steps.map((step: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        theme === "dark" ? "bg-gray-800/10 border-gray-700/30" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            theme === "dark" ? "bg-primary/20" : "bg-black/10"
                          }`}>
                            <span className={`text-xs font-bold ${theme === "dark" ? "text-primary" : "text-black"}`}>
                              {step.step || idx + 1}
                            </span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-black"}`}>
                              {step.action}
                            </p>
                            {step.estimated_time && (
                              <p className="text-xs text-primary">
                                {step.estimated_time}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Express Interest CTA */}
            <div className="flex justify-center">
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
            <div className="text-center border-t border-border/50">
              <Paragraph className="text-xs text-muted-foreground">
                For Information only · HNWI Chronicles is not a broker-dealer and does not provide personalised investment advice.
              </Paragraph>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </PageWrapper>
  )
}
