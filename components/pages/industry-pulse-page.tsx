// components/pages/industry-pulse-page.tsx

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { secureApi } from "@/lib/secure-api"
import { useToast } from "@/components/ui/use-toast"
import { Layout } from "@/components/layout/layout"
import { DevelopmentStream } from "@/components/development-stream"
import { useHNWIWorldTags } from "@/contexts/elite-pulse-context"
import { IndustryTrendsBubbles } from "@/components/industry-trends-bubbles"
import { getIndustryColor } from "@/utils/color-utils"
import { useSearchParams } from "next/navigation"
import { Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function IndustryPulsePage({ onNavigate }: { onNavigate: (route: string) => void }) {
  
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [timeRange, setTimeRange] = useState("7d")
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([])
  const [expandedDevelopmentId, setExpandedDevelopmentId] = useState<string | null>(null)
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop')
  const [showStickyControls, setShowStickyControls] = useState(false)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [developments, setDevelopments] = useState<any[]>([])
  const [isLoadingDevelopments, setIsLoadingDevelopments] = useState(false)
  
  const { toast } = useToast()
  const hnwiWorldTags = useHNWIWorldTags()
  
  
  const searchParams = useSearchParams()
  const selectorControlsRef = useRef<HTMLDivElement>(null)

  // Unified data fetching function
  const fetchDevelopments = useCallback(async () => {
    
    setIsLoadingDevelopments(true)
    try {
      const requestBody: any = {
        page: 1,
        page_size: 1000, // Get enough data for both components
        sort_by: "date",
        sort_order: "desc"
      }
      
      // Add date range parameters if provided
      if (startDate) {
        requestBody.start_date = startDate
      }
      if (endDate) {
        requestBody.end_date = endDate
      }
      
      // Fallback to time_range if no specific dates provided
      if (!startDate && !endDate) {
        requestBody.time_range = timeRange
      }
      
      
      // Create stable cache key based on time range instead of exact timestamps
      const cacheKey = `developments:${timeRange}:page-${requestBody.page}:size-${requestBody.page_size}`;
      
      const data = await secureApi.post('/api/developments', requestBody, true, { 
        enableCache: true, 
        cacheDuration: 300000, 
        cacheKey: cacheKey 
      }); // 5 minutes cache for developments
      
      
      if (data.developments && Array.isArray(data.developments)) {
        setDevelopments(data.developments)
        
        // Extract industries for the industry selector
        const industries = [...new Set(data.developments.map((dev: any) => dev.industry).filter(Boolean))]
        setAvailableIndustries(industries)
      } else {
        setDevelopments([])
        setAvailableIndustries([])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch developments. Please try again.",
        variant: "destructive",
      })
      setDevelopments([])
      setAvailableIndustries([])
    } finally {
      setIsLoadingDevelopments(false)
    }
  }, [startDate, endDate, timeRange, toast])

  // Fetch data when parameters change
  useEffect(() => {
    fetchDevelopments()
  }, [fetchDevelopments])

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

  // Screen size detection for mobile/desktop check
  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Sticky controls effect for mobile using scroll event
  useEffect(() => {
    if (screenSize !== 'mobile') return;
    
    const handleScroll = () => {
      const selectorControlsElement = selectorControlsRef.current;
      if (!selectorControlsElement) return;
      
      const rect = selectorControlsElement.getBoundingClientRect();
      const headerHeight = 56; // Account for header
      
      // Show sticky when selector controls are above the viewport (scrolled past)
      const shouldShowSticky = rect.bottom < headerHeight;
      setShowStickyControls(shouldShowSticky);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [screenSize])

  return (
    <Layout
      currentPage="strategy-vault"
      title={
        <div className="flex items-center space-x-2">
          <Globe className="w-6 h-6" />
          <span>HNWI World</span>
        </div>
      }
      showBackButton
      onNavigate={onNavigate}
    >
      <p className="text-sm text-muted-foreground mt-2 leading-tight">
        Data Meets Strategy
        <br />
        for the Wealthiest
      </p>
      <div className="mt-8"></div>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary dark:text-primary-foreground">HNWI World</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6" ref={selectorControlsRef}>
            <div className="flex justify-between items-center">
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
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="3d">3 Days</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="14d">14 Days</SelectItem>
                  <SelectItem value="21d">21 Days</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                  }}
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="mb-0"
              >
                Clear Dates
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-primary dark:text-primary-foreground mb-4">Trends Map</h3>
            <IndustryTrendsBubbles
              duration={timeRange}
              onIndustriesUpdate={handleIndustriesUpdate}
              onBubbleClick={handleBubbleClick}
              getIndustryColor={getIndustryColor}
              selectedIndustry={selectedIndustry}
              startDate={startDate ? startDate : undefined}
              endDate={endDate ? endDate : undefined}
              developments={developments}
              isLoading={isLoadingDevelopments}
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
            startDate={startDate ? startDate : undefined}
            endDate={endDate ? endDate : undefined}
            developments={developments}
            isLoading={isLoadingDevelopments}
            elitePulseBriefIds={hnwiWorldTags?.source_brief_ids || []}
          />
        </CardContent>
      </Card>

      {/* Sticky Controls Header */}
      <AnimatePresence>
        {showStickyControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[56px] left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {/* Industry Selector Sticky Button */}
              <Select onValueChange={handleIndustryChange} value={selectedIndustry}>
                <SelectTrigger className="w-[140px] text-xs">
                  <SelectValue placeholder="Industry" />
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
              
              {/* Time Range Selector Sticky Button */}
              <Select onValueChange={handleTimeRangeChange} value={timeRange}>
                <SelectTrigger className="w-[120px] text-xs">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1D</SelectItem>
                  <SelectItem value="3d">3D</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="14d">14D</SelectItem>
                  <SelectItem value="21d">21D</SelectItem>
                  <SelectItem value="1m">1M</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Inputs Sticky */}
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px] text-xs"
                placeholder="Start Date"
              />
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px] text-xs"
                placeholder="End Date"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}

