// components/elite/elite-header.tsx
// Elite dashboard header with real-time status

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw, Activity, Users, DollarSign, TrendingUp } from "lucide-react"
import { Heading2 } from "@/components/ui/typography"
import type { User, ProcessedIntelligenceData } from "@/types/dashboard"

interface EliteHeaderProps {
  user: User | null
  intelligenceData: ProcessedIntelligenceData
  refreshing: boolean
  onRefresh: () => void
}

export function EliteHeader({ 
  user, 
  intelligenceData, 
  refreshing, 
  onRefresh 
}: EliteHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return "Midnight Wealth Watchlist"
    if (hour < 12) return "Morning Intelligence Brief"  
    if (hour < 17) return "Midday Market Synthesis"
    if (hour < 22) return "Evening Capital Insights"
    return "Night Watch: Global Capital Flow"
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    })
  }

  return (
    <div className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <Heading2 className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                {getTimeBasedGreeting()}, {(() => {
                  // Try name field first (most reliable for full name)
                  if (user?.name) return user.name

                  // Then try firstName + lastName combination
                  const firstName = user?.firstName || user?.first_name
                  const lastName = user?.lastName || user?.last_name
                  if (firstName && lastName) return `${firstName} ${lastName}`
                  if (firstName) return firstName

                  // Fallback to email username or 'Principal'
                  return user?.email?.split('@')[0] || 'Principal'
                })()}
              </Heading2>
            </div>
          </div>
          
          {/* Elite System Stats with Time */}
          <div className="hidden lg:flex items-center space-x-4 text-xs text-muted-foreground pl-0 sm:pl-14">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>6 Expert Specialists</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3" />
              <span>25K Monthly Value</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>83:1 ROI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}