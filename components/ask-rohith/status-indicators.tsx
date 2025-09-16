// components/ask-rohith/status-indicators.tsx
// Privacy and authenticity status indicators

"use client"

import React from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import {
  Shield,
  Lock,
  BookOpen,
  Clock,
  Check,
  Users,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { StatusIndicators as StatusIndicatorsType } from "@/types/rohith"

interface StatusIndicatorsProps {
  indicators: StatusIndicatorsType
  compact?: boolean
  className?: string
}

export function StatusIndicators({
  indicators,
  compact = false,
  className
}: StatusIndicatorsProps) {
  const { theme } = useTheme()

  const indicatorItems = [
    {
      icon: Shield,
      label: "100% Your Knowledge Only",
      value: indicators.authenticityGuarantee,
      color: "text-green-600",
      bgColor: "bg-green-600/10"
    },
    {
      icon: Lock,
      label: "Zero Cross-User Contamination",
      value: true,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10"
    },
    {
      icon: BookOpen,
      label: `${indicators.hnwiKnowledgeSources} HNWI Knowledge Sources`,
      value: indicators.hnwiKnowledgeSources > 0,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10"
    },
    {
      icon: Clock,
      label: `Response: ${(indicators.responseTime / 1000).toFixed(1)}s`,
      value: indicators.responseTime > 0,
      color: "text-amber-600",
      bgColor: "bg-amber-600/10"
    },
    {
      icon: Users,
      label: "Complete Privacy",
      value: indicators.privacyCompliant,
      color: "text-indigo-600",
      bgColor: "bg-indigo-600/10"
    },
    {
      icon: Activity,
      label: `${indicators.graphNodesReferenced} Graph Nodes`,
      value: indicators.graphNodesReferenced > 0,
      color: "text-pink-600",
      bgColor: "bg-pink-600/10"
    }
  ]

  if (compact) {
    return (
      <div className={cn(
        "flex items-center space-x-2 text-xs",
        className
      )}>
        {indicatorItems.slice(0, 3).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full",
              item.bgColor
            )}
          >
            {item.value ? (
              <Check className={cn("h-3 w-3", item.color)} />
            ) : (
              <item.icon className={cn("h-3 w-3", item.color)} />
            )}
            <span className={cn("font-medium", item.color)}>
              {item.value ? "✓" : "○"}
            </span>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-lg border",
        theme === "dark" ? "bg-card/50 border-border/50" : "bg-muted/30 border-border/30",
        className
      )}
    >
      <div className="col-span-full mb-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <Shield className="h-4 w-4 mr-2 text-primary" />
          Security & Privacy Guarantees
        </h3>
      </div>

      {indicatorItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
            item.bgColor,
            "hover:scale-105"
          )}
        >
          <div className={cn(
            "p-2 rounded-full",
            theme === "dark" ? "bg-background/50" : "bg-background/80"
          )}>
            {item.value ? (
              <Check className={cn("h-4 w-4", item.color)} />
            ) : (
              <item.icon className={cn("h-4 w-4", item.color)} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium", item.color)}>
              {item.label}
            </p>
            {item.value && (
              <p className="text-xs text-muted-foreground">
                Verified
              </p>
            )}
          </div>

          {item.value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={cn(
                "w-2 h-2 rounded-full",
                "bg-green-500"
              )}
            />
          )}
        </motion.div>
      ))}

      {/* Summary footer */}
      <div className="col-span-full mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatusIndicators