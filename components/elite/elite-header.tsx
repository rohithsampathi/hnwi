// components/elite/elite-header.tsx
// Elite dashboard header with real-time status

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, RefreshCw, Activity, Users, DollarSign, TrendingUp } from "lucide-react"
import { Heading2 } from "@/components/ui/typography"
import type { User, ProcessedIntelligenceData } from "@/types/dashboard"

interface EliteHeaderProps {
  user: User
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
    if (hour < 6) return "Late Night Intelligence Brief"
    if (hour < 12) return "Morning Intelligence Brief"  
    if (hour < 17) return "Midday Intelligence Update"
    if (hour < 22) return "Evening Intelligence Brief"
    return "Night Watch Intelligence"
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
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <Heading2 className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                {getTimeBasedGreeting()}, {user.firstName} {user.lastName}
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