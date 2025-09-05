// components/elite/elite-metrics.tsx
// Elite metrics dashboard with animations

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, DollarSign, Users, TrendingUp, Award } from "lucide-react"
import type { ProcessedIntelligenceData } from "@/types/dashboard"

interface EliteMetricsProps {
  data: ProcessedIntelligenceData
}

export function EliteMetrics({ data }: EliteMetricsProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const formatCapitalFlow = (value: string | number) => {
    if (typeof value === 'string') {
      // If it's already formatted (like "$25.2B"), return as is
      if (value.match(/\$[\d.-]+[BMK]/)) return value
      // Handle elite pulse specific formats
      if (value.includes('billion')) {
        const match = value.match(/([\d.-]+)\s*billion/i);
        if (match) return `$${match[1]}B`;
      }
      if (value.includes('million')) {
        const match = value.match(/([\d.-]+)\s*million/i);
        if (match) return `$${match[1]}M`;
      }
      // Try to extract raw number and format
      const match = value.match(/([\d.-]+)/);
      if (match) {
        const num = parseFloat(match[1]);
        // For elite flows, assume billions if number is large
        if (num > 1000) return formatCurrency(num * 1000000); // Millions
        return formatCurrency(num * 1000000000); // Billions
      }
    }
    if (typeof value === 'number') {
      return formatCurrency(value);
    }
    return '$25.2B'; // Fallback value
  }

  const metrics = [
    {
      icon: Target,
      value: data.opportunities.length,
      label: "Active Opportunities",
      subValue: `${data.juicyOpportunities.length} High Priority`,
      delay: 0.1
    },
    {
      icon: DollarSign,
      value: formatCurrency(data.totalOpportunityValue),
      label: "Total Opportunity Value", 
      delta: `+${((data.totalOpportunityValue / 10000000) * 100).toFixed(1)}%`,
      deltaLabel: "potential",
      delay: 0.2
    },
    {
      icon: Users,
      value: data.peerSignals?.active_members_today || 0,
      label: "Peer Network Active",
      subValue: "Elite members online",
      delay: 0.3
    },
    {
      icon: Award,
      value: `${(data.confidence * 100).toFixed(0)}%`,
      label: "Framework Confidence",
      subValue: "System reliability",
      delay: 0.5
    }
  ]

  return (
    <div className="-mt-2 mb-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: animated ? 1 : 0, opacity: animated ? 1 : 0 }}
            transition={{ duration: 0.4, delay: metric.delay }}
          >
            <Card className="border-border/50 bg-card/50 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-2 sm:p-3 text-center">
                <div className="relative inline-block mb-1.5">
                  <div className="p-1 rounded-lg bg-primary/10">
                    <metric.icon className="h-4 w-4 text-primary" />
                  </div>
                  {metric.subValue && typeof metric.subValue === 'number' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{metric.subValue}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-0.5">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                    {metric.value}
                  </div>
                  {metric.delta && (
                    <div className="text-xs font-medium text-green-600">
                      {metric.delta} {metric.deltaLabel}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium leading-tight">
                    {metric.label}
                  </div>
                  {metric.subValue && typeof metric.subValue === 'string' && (
                    <div className="text-xs text-muted-foreground/80 px-1.5 py-0.5 bg-muted/30 rounded text-center">
                      {metric.subValue}
                    </div>
                  )}
                  {metric.subLabel && (
                    <div className="text-xs text-muted-foreground/60 italic">{metric.subLabel}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}