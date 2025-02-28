// components/pages/opportunity-page.tsx

// components/pages/opportunity-page.tsx

"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  Check, X, Loader2, DollarSign, Building2,
  PiggyBank, Timer, ThumbsUp, Phone
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
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // Fetch all opportunities to find the specific one
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const opportunities = await getOpportunities()
        setAllOpportunities(opportunities)
        
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

  // Use the passed onNavigate function if available, otherwise fallback
  const handleNavigation = useCallback(
    (path: string) => {
      if (onNavigate) {
        // Use the onNavigate function passed from parent
        onNavigate(path)
      } else if (path === "back") {
        // Default back navigation
        if (region) {
          router.push(`/invest-scan/${region}`)
        } else {
          router.push("/prive-exchange")
        }
      } else {
        // Fallback direct routing
        router.push(`/${path.replace(/^\/+/, "")}`)
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

  return (
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
          <CardTitle className="text-4xl font-black tracking-tight">
            {opportunity.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {opportunity.type && <Badge variant="secondary">{opportunity.type}</Badge>}
                {opportunity.value && <Badge variant="outline">{opportunity.value}</Badge>}
              </div>
              <Paragraph className="text-lg mb-4">{opportunity.description}</Paragraph>
            </div>
            {opportunity.fullAnalysis && (
              <div>
                <Heading3 className="text-xl font-semibold mb-2">
                  What's this Opportunity?
                </Heading3>
                <Paragraph className="text-base">{opportunity.fullAnalysis}</Paragraph>
              </div>
            )}
            {(opportunity.pros || opportunity.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunity.pros && opportunity.pros.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-black tracking-wide flex items-center">
                        <Check className="w-5 h-5 mr-2 text-green-500" />
                        Pros
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {opportunity.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {opportunity.cons && opportunity.cons.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-black tracking-wide flex items-center">
                        <X className="w-5 h-5 mr-2 text-red-500" />
                        Cons
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2">
                        {opportunity.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                {
                  title: "Risk Level",
                  value: opportunity.riskLevel,
                  icon: <Timer className="w-4 h-4" />,
                  valueColor:
                    opportunity.riskLevel === "Low"
                      ? "text-green-500"
                      : opportunity.riskLevel === "Medium"
                        ? "text-yellow-500"
                        : "text-red-500",
                },
                {
                  title: "Expected Return",
                  value: opportunity.expectedReturn,
                  icon: <DollarSign className="w-4 h-4" />,
                  valueColor: "text-blue-500",
                },
                {
                  title: "Investment Horizon",
                  value: opportunity.investmentHorizon,
                  icon: <Timer className="w-4 h-4" />,
                  valueColor: "text-purple-500",
                },
                {
                  title: "Investment Range",
                  value: opportunity.value,
                  icon: <PiggyBank className="w-4 h-4" />,
                  valueColor: "text-emerald-500",
                },
              ]
                // Only show items that have a value
                .filter(item => item.value)
                .map((item, index) => (
                  <Card
                    key={index}
                    className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors"
                  >
                    <CardContent className="p-4">
                      <Heading3 className="text-base font-black text-primary tracking-wide mb-2 text-center flex flex-col items-center justify-center">
                        <span className="flex items-center justify-center gap-2 mb-1">
                          {item.icon}
                          {item.title}
                        </span>
                      </Heading3>
                      <Paragraph className={`text-2xl font-bold text-center ${item.valueColor}`}>
                        {item.value}
                      </Paragraph>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center py-8">
          <Button onClick={handleTalkToConcierge} className="px-8 py-6 text-lg" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Talk to Concierge"
            )}
          </Button>
        </CardFooter>
      </Card>
      
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
    </Layout>
  )
}
