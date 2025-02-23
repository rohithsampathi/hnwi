// components/pages/opportunity-page.tsx

"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ChevronRight, Check, X, Loader2 } from "lucide-react"
import { regions, getOpportunityIcon } from "@/lib/invest-scan-data"

interface OpportunityPageProps {
  region: string
  opportunityId: string
}

export function OpportunityPage({ region, opportunityId }: OpportunityPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const regionData = regions.find((r) => r.id === region)
  const opportunity = regionData?.opportunities.find((o) => o.id === opportunityId)

  const handleNavigation = useCallback(
    (path: string) => {
      if (path === "back") {
        router.back()
      } else {
        router.push(`/${path.replace(/^\/+/, "")}`)
      }
    },
    [router],
  )

  if (!regionData || !opportunity) {
    return (
      <Layout title="Opportunity Not Found" showBackButton onNavigate={handleNavigation}>
        <Card className="w-full bg-background text-foreground">
          <CardContent>
            <Heading2 className="text-2xl font-bold mb-4">Opportunity Not Found</Heading2>
            <Paragraph>The requested opportunity could not be found. Please try again.</Paragraph>
            <Button onClick={() => handleNavigation("invest-scan")} className="mt-4">
              Return to Invest Scan
            </Button>
          </CardContent>
        </Card>
      </Layout>
    )
  }

  const handleTalkToConcierge = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    console.log("Opportunity details:", {
      id: opportunity.id,
      title: opportunity.title,
      type: opportunity.type,
      value: opportunity.value,
    })

    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Concierge Notified",
        description: `Our concierge has been notified about your interest in ${opportunity.title}. They will contact you shortly.`,
        duration: 5000,
      })
    }, 2000)
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
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button
              variant="link"
              className="p-0 text-sm text-muted-foreground hover:text-primary"
              onClick={() => handleNavigation("invest-scan")}
            >
              Invest Scan
            </Button>
            <ChevronRight className="w-4 h-4" />
            <Button
              variant="link"
              className="p-0 text-sm text-muted-foreground hover:text-primary"
              onClick={() => handleNavigation(`invest-scan/${region}`)}
            >
              {regionData.name}
            </Button>
            <ChevronRight className="w-4 h-4" />
            <span>{opportunity.title}</span>
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">{opportunity.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{opportunity.type}</Badge>
                <Badge variant="outline">{opportunity.value}</Badge>
              </div>
              <Paragraph className="text-lg mb-4">{opportunity.description}</Paragraph>
            </div>
            <div>
              <Heading3 className="text-xl font-semibold mb-2">What's this Opportunity?</Heading3>
              <Paragraph className="text-base">{opportunity.fullAnalysis}</Paragraph>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                {
                  title: "Risk Level",
                  value: opportunity.riskLevel,
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
                  valueColor: "text-blue-500",
                },
                {
                  title: "Investment Horizon",
                  value: opportunity.investmentHorizon,
                  valueColor: "text-purple-500",
                },
                {
                  title: "Investment Range",
                  value: opportunity.value,
                  valueColor: "text-emerald-500",
                },
              ].map((item, index) => (
                <Card key={index} className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
                  <CardContent className="p-4">
                    <Heading3 className="text-base font-black text-primary tracking-wide mb-2">{item.title}</Heading3>
                    <Paragraph className={`text-2xl font-extrabold ${item.valueColor}`}>{item.value}</Paragraph>
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
    </Layout>
  )
}

