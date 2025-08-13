"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"

export const LiveButton = () => {
  const { theme } = useTheme()
  const metallicStyle = getMetallicCardStyle(theme)
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm"
         style={{
           ...metallicStyle.style,
           border: theme === "dark" 
             ? "1px solid rgba(255, 255, 255, 0.2)" 
             : "1px solid rgba(0, 0, 0, 0.1)",
         }}>
      <div className="relative">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "#ef4444" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 w-2 h-2 rounded-full opacity-75"
          style={{ backgroundColor: "#ef4444" }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>
      <span className={`text-xs font-medium ${
        theme === "dark" ? "text-white" : "text-primary"
      }`}>
        Live
      </span>
    </div>
  )
}

