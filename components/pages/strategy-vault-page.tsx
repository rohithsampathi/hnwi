// components/pages/strategy-vault-page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout } from "@/components/layout/layout"
import { DevelopmentStream } from "@/components/development-stream"
import { IndustryTrendsBubbles } from "@/components/industry-trends-bubbles"
import { getIndustryColor } from "@/utils/color-utils"
import { getMatteCardStyle } from "@/lib/colors"
import { useSearchParams } from "next/navigation"
import { Globe, BookOpen, BarChart3 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { LiveButton } from "@/components/live-button"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "../meta-tags"

export function StrategyVaultPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { theme } = useTheme()
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [timeRange, setTimeRange] = useState("1w")
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([])
  const [expandedDevelopmentId, setExpandedDevelopmentId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check URL searchParams first
    const industry = searchParams.get("industry")
    const timeRange = searchParams.get("timeRange")
    const developmentId = searchParams.get("developmentId")

    if (industry) setSelectedIndustry(industry)
    if (timeRange) setTimeRange(timeRange)
    if (developmentId) setExpandedDevelopmentId(developmentId)
    
    // Check sessionStorage for navigation from Elite Pulse cards
    const sessionDevelopmentId = sessionStorage.getItem("currentDevelopmentId")
    const sessionIndustry = sessionStorage.getItem("nav_param_industry")
    const sessionTimeRange = sessionStorage.getItem("nav_param_timeRange")
    
    if (sessionDevelopmentId && !developmentId) {
      setExpandedDevelopmentId(sessionDevelopmentId)
      // Clear sessionStorage after using it
      sessionStorage.removeItem("currentDevelopmentId")
    }
    
    if (sessionIndustry && !industry) {
      setSelectedIndustry(sessionIndustry)
      sessionStorage.removeItem("nav_param_industry")
    }
    
    if (sessionTimeRange && !timeRange) {
      setTimeRange(sessionTimeRange)
      sessionStorage.removeItem("nav_param_timeRange")
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
        title="HNWI World: Private Wealth Intelligence, Every Day | HNWI Chronicles"
        description="The briefing smart wealth reads first. What's moving, why it matters, and where the next opportunity is—before the rest catch up."
        image="https://app.hnwichronicles.com/images/hnwi-world-og.png"
        url="https://app.hnwichronicles.com/hnwi-world"
      />
      <Layout
        title={
          <div className="flex items-center space-x-2">
            <Globe className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
            <Heading2 className={`${theme === "dark" ? "text-white" : "text-black"}`}>HNWI World</Heading2>
            <LiveButton />
          </div>
        }
        showBackButton
        onNavigate={onNavigate}
      >
        <div className="font-body">
          <div className="w-full mb-4 overflow-hidden">
            <div className="px-4 py-2 -mt-2">
              <p className="text-muted-foreground text-base leading-tight">
                Data Meets Strategy for the Wealthiest
              </p>
            </div>
            <div className="px-4 py-2">
              <div className="flex justify-between items-center mb-6">
                <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
                  <SelectTrigger className="w-[200px] bg-secondary/50 hover:bg-secondary/70 border-border">
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
                <div className="flex items-center space-x-4">
                  <Select onValueChange={handleTimeRangeChange} value={timeRange}>
                    <SelectTrigger className="w-[180px] bg-secondary/50 hover:bg-secondary/70 border-border">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
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
                    className="p-2 rounded-full hover:bg-muted transition-colors"
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
                      className="text-foreground"
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
                    <BarChart3 className={`w-5 h-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                    <Heading3 className={`${theme === "dark" ? "text-white" : "text-black"}`}>Wealth Radar</Heading3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Industry wise HNWI Peer Movements and Market Actions • {availableIndustries.length} industries available
                  </p>
                </div>
                
                {/* Visualization area */}
                <div className="px-6 pb-6">
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
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={`w-5 h-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                <Heading3 className="text-foreground">Insider Brief</Heading3>
              </div>
              <p className="text-body-small text-foreground mb-4">
                Daily intelligence briefings tracking HNWI market movements, institutional strategies, and wealth preservation insights from global elite circles
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

