"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IndustryTrends } from "./industry-trends"
import { IndustryTrendsBubbles } from "./industry-trends-bubbles"

export function IndustryPulse() {
  const [timeRange, setTimeRange] = useState("1w")
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

  const handleIndustriesUpdate = useCallback(() => {
    // This function can be used to trigger any updates needed when industries data changes
  }, [])

  const handleBubbleClick = useCallback((industry: string) => {
    setSelectedIndustry(industry)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Industry Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={setTimeRange} defaultValue={timeRange}>
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
        {selectedIndustry ? (
          <IndustryTrends
            timeRange={timeRange}
            selectedIndustry={selectedIndustry}
            onBack={() => setSelectedIndustry(null)}
          />
        ) : (
          <IndustryTrendsBubbles
            duration={timeRange}
            onIndustriesUpdate={handleIndustriesUpdate}
            onBubbleClick={handleBubbleClick}
          />
        )}
      </CardContent>
    </Card>
  )
}

