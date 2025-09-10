// components/elite/elite-footer.tsx
// Elite dashboard footer with system stats

"use client"

import { motion } from "framer-motion"
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react"
import type { User } from "@/types/dashboard"

interface EliteFooterProps {
  user?: User
}

export function EliteFooter({ user }: EliteFooterProps) {
  const stats = [
    { icon: Users, label: "6 Expert Specialists" },
    { icon: Activity, label: "Real-time Analysis" },
    { icon: DollarSign, label: "25K Monthly Value" },
    { icon: TrendingUp, label: "83:1 ROI" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="text-center space-y-3 py-6 pb-20 md:pb-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs text-muted-foreground">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-1">
            <stat.icon className="h-3 w-3" />
            <span className="hidden sm:inline">{stat.label}</span>
            <span className="sm:hidden">{stat.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Generated for: <span className="font-medium">
          {user?.firstName || user?.first_name || user?.name || user?.email?.split('@')[0] || 'User'}
          {user?.lastName || user?.last_name ? ` ${user?.lastName || user?.last_name}` : ''}
        </span>
      </div>
    </motion.div>
  )
}