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
      className={`absolute pointer-events-none px-4 py-2 rounded-lg shadow-lg z-50 ${
        theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#121212]"
      }`}
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -120%)",
      }}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium">
          <span className="text-muted-foreground">Industry:</span> {industry}
        </p>
        <p className="text-sm font-medium">
          <span className="text-muted-foreground">Developments:</span> {count}
        </p>
      </div>
      <div
        className={`absolute bottom-0 left-1/2 w-3 h-3 -mb-1.5 transform rotate-45 -translate-x-1/2 ${
          theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
        }`}
      />
    </motion.div>
  )
}

