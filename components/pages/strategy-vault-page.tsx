// components/pages/strategy-vault-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout/layout"
import { DevelopmentStream } from "@/components/development-stream"
import { IndustryTrendsBubbles } from "@/components/industry-trends-bubbles"
import { getIndustryColor } from "@/utils/color-utils"
import { useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"
import { LiveButton } from "@/components/live-button"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "../meta-tags"

export function StrategyVaultPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [timeRange, setTimeRange] = useState("1w")
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([])
  const [expandedDevelopmentId, setExpandedDevelopmentId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const industry = searchParams.get("industry")
    const timeRange = searchParams.get("timeRange")
    const developmentId = searchParams.get("developmentId")

    if (industry) setSelectedIndustry(industry)
    if (timeRange) setTimeRange(timeRange)
    if (developmentId) setExpandedDevelopmentId(developmentId)
  }, [searchParams])

  useEffect(() => {
    const developmentId = searchParams.get("developmentId")
    if (developmentId) {
      setExpandedDevelopmentId(developmentId)
    }
  }, [searchParams])

  const handleIndustryChange = useCallback((value: string) => {
    setSelectedIndustry(value)
  }, [])

  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value)
  }, [])

  const handleBubbleClick = useCallback((industry: string) => {
    setSelectedIndustry(industry)
  }, [])

  const handleIndustriesUpdate = useCallback((industries: string[]) => {
    setAvailableIndustries(industries)
  }, [])

  return (
    <>
      <MetaTags
        title="HNWI World | HNWI Chronicles"
        description="Unlock the HNWI World: Real-time market insights, competitive intelligence, and strategic analysis for high-net-worth individuals."
        image="https://hnwichronicles.com/strategy-vault-og-image.jpg" // Replace with actual image URL
        url="https://hnwichronicles.com/strategy-vault" // Replace with actual URL
      />
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <Globe className="w-6 h-6 text-primary" />
            <Heading2>HNWI World</Heading2>
            <LiveButton />
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <div className="font-body">
          <Card className="w-full mb-6 overflow-hidden border-none bg-background/80 shadow-[0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_16px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_24px_rgba(255,255,255,0.15)] transition-all duration-300">
            <CardHeader>
              <Heading2 className="text-primary">HNWI World</Heading2>
              <Paragraph className="text-sm text-muted-foreground mt-2 leading-tight">
                Data Meets Strategy for the Wealthiest
              </Paragraph>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
                  <SelectTrigger className="w-[200px] bg-primary/5 hover:bg-primary/10 transition-all duration-300 shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.15)]">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/80 shadow-[0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_16px_rgba(255,255,255,0.1)]">
                    <SelectItem value="All">All Industries</SelectItem>
                    {availableIndustries.sort().map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-4">
                  <LiveButton />
                  <Select onValueChange={handleTimeRangeChange} value={timeRange}>
                    <SelectTrigger className="w-[180px] bg-primary/5 hover:bg-primary/10 transition-all duration-300 shadow-[0_4px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_16px_rgba(255,255,255,0.15)]">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/80 shadow-[0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_16px_rgba(255,255,255,0.1)]">
                      <SelectItem value="1d">Last 24 hours</SelectItem>
                      <SelectItem value="1w">Last week</SelectItem>
                      <SelectItem value="1m">Last month</SelectItem>
                      <SelectItem value="1y">Last 365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Card className="bg-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <Heading3 className="text-primary flex items-center">
                    <span className="bg-primary text-primary-foreground p-1 rounded mr-2">📊</span>
                    Wealth Radar
                  </Heading3>
                </CardHeader>
                <CardContent>
                  <IndustryTrendsBubbles
                    duration={timeRange}
                    onIndustriesUpdate={handleIndustriesUpdate}
                    onBubbleClick={handleBubbleClick}
                    getIndustryColor={getIndustryColor}
                    selectedIndustry={selectedIndustry}
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
          <Card className="w-full mt-8 overflow-hidden border-none bg-background/80 shadow-[0_8px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_16px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_24px_rgba(255,255,255,0.15)] transition-all duration-300">
            <CardHeader>
              <Heading3 className="text-primary">Insider Briefing 🔍</Heading3>
            </CardHeader>
            <CardContent>
              <DevelopmentStream
                selectedIndustry={selectedIndustry}
                duration={timeRange}
                getIndustryColor={getIndustryColor}
                expandedDevelopmentId={expandedDevelopmentId}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  )
}

