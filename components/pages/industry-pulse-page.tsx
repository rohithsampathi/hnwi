// components/pages/industry-pulse-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout/layout"
import { DevelopmentStream } from "@/components/development-stream"
import { IndustryTrendsBubbles } from "@/components/industry-trends-bubbles"
import { getIndustryColor } from "@/utils/color-utils"
import { useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"
import { LiveButton } from "@/components/live-button"

export function IndustryPulsePage({ onNavigate }: { onNavigate: (route: string) => void }) {
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
    <Layout
      title={
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6" />
          <span>HNWI World</span>
        </div>
      }
      showBackButton
      onNavigate={onNavigate}
    >
      <LiveButton />
      <p className="text-sm text-muted-foreground mt-2 leading-tight">
        Data Meets Strategy
        <br />
        for the Wealthiest
      </p>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary dark:text-primary-foreground">HNWI World</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Industries</SelectItem>
                {availableIndustries.sort().map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleTimeRangeChange} value={timeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="1w">Last week</SelectItem>
                <SelectItem value="1m">Last month</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-primary dark:text-primary-foreground mb-4">Trends Map</h3>
            <IndustryTrendsBubbles
              duration={timeRange}
              onIndustriesUpdate={handleIndustriesUpdate}
              onBubbleClick={handleBubbleClick}
              getIndustryColor={getIndustryColor}
              selectedIndustry={selectedIndustry}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary dark:text-primary-foreground">Market Developments</CardTitle>
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
    </Layout>
  )
}

