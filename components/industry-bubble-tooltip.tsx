"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"

interface TooltipProps {
  industry: string
  count: number
  x: number
  y: number
}

export function IndustryBubbleTooltip({ industry, count, x, y }: TooltipProps) {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={`absolute pointer-events-none px-3 py-2 rounded-lg shadow-xl border z-[60] min-w-[160px] ${
        theme === "dark" 
          ? "bg-gray-900 text-white border-gray-700" 
          : "bg-white text-gray-900 border-gray-200"
      }`}
      style={{
        left: isNaN(x) ? 0 : x,
        top: isNaN(y) ? 0 : y - 10,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="space-y-1">
        <div className="font-semibold text-sm text-foreground">
          {industry}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Developments:</span>
            <span className="font-medium">{count}</span>
          </div>
        </div>
      </div>
      <div
        className={`absolute top-full left-1/2 w-0 h-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${
          theme === "dark" ? "border-t-gray-900" : "border-t-white"
        }`}
      />
    </motion.div>
  )
}

