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
          <div className="w-full mb-6 overflow-hidden">
            <div className="space-y-2 px-4 py-6">
              <div className="flex items-center gap-2">
                <Heading2 className="text-primary">HNWI World</Heading2>
                <LiveButton />
              </div>
              <Paragraph className="font-body tracking-wide text-xl text-muted-foreground">
                Data Meets Strategy for the Wealthiest
              </Paragraph>
            </div>
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-6">
                <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
                  <SelectTrigger className="w-[200px] bg-white dark:bg-primary-800 hover:bg-primary/5 dark:hover:bg-primary-700 transition-all duration-300 shadow-sm dark:text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-primary-800 border dark:border-primary-600">
                    <SelectItem value="All">All Industries</SelectItem>
                    {availableIndustries.sort().map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-4">
                  <Select onValueChange={handleTimeRangeChange} value={timeRange}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-primary-800 hover:bg-primary/5 dark:hover:bg-primary-700 transition-all duration-300 shadow-sm dark:text-white">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-primary-800 border dark:border-primary-600">
                      <SelectItem value="1d">Last 24 hours</SelectItem>
                      <SelectItem value="1w">Last week</SelectItem>
                      <SelectItem value="1m">Last month</SelectItem>
                      <SelectItem value="1y">Last 365 days</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Force refresh button to clear cache and fetch fresh data */}
                  <button 
                    onClick={() => {
                      // Force a new time range to trigger a refetch
                      const currentTimeRange = timeRange
                      setTimeRange("temp")
                      setTimeout(() => setTimeRange(currentTimeRange), 10)
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-primary-700 transition-colors"
                    aria-label="Refresh data"
                    title="Force refresh of Wealth Radar data"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-black dark:text-white"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                      <path d="M16 16h5v5"></path>
                    </svg>
                  </button>
                </div>
              </div>
              {/* Wealth Radar - matching Opportunity Atlas structure */}
              <div className="relative bg-card rounded-lg border border-border">
                {/* Header inside the box - left aligned like Opportunity Atlas */}
                <div className="pt-6 pb-4 px-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📊</span>
                    <Heading3 className="text-primary dark:text-white">Wealth Radar</Heading3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Industry wise HNWI Peer Movements and Market Actions • {availableIndustries.length} industries available
                  </p>
                </div>
                
                {/* Visualization area */}
                <div className="px-6">
                  <IndustryTrendsBubbles
                    duration={timeRange}
                    onIndustriesUpdate={handleIndustriesUpdate}
                    onBubbleClick={handleBubbleClick}
                    getIndustryColor={getIndustryColor}
                    selectedIndustry={selectedIndustry}
                    renderStatsOutside={true}
                  />
                </div>
                
                {/* Footer with updated timestamp and disclaimer */}
                <div className="px-6 pb-4">
                  <div className="text-center border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Last updated: {new Date().toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      For Information only. HNWI Chronicles is not a broker-dealer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full mt-8 overflow-hidden">
            <div className="py-4">
              <Heading3 className="text-foreground mb-2">Insider Briefing 🔍</Heading3>
              <p className="text-body-small text-foreground mb-4">
                Your private intelligence ally delivering sophisticated insights for ultra-high-net-worth portfolios
              </p>
            </div>
            <div className="py-2">
              <DevelopmentStream
                selectedIndustry={selectedIndustry}
                duration={timeRange}
                getIndustryColor={getIndustryColor}
                expandedDevelopmentId={expandedDevelopmentId}
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

