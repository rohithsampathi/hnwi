"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"

export const LiveButton = () => {
  const { theme } = useTheme()
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm"
         style={{
           background: "linear-gradient(135deg, #065f46 0%, #047857 25%, #059669 50%, #10b981 75%, #34d399 100%)",
           border: "2px solid #047857",
           boxShadow: "0 0 15px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
         }}>
      <div className="relative">
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: "#ffffff" }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 w-2 h-2 rounded-full opacity-75"
          style={{ backgroundColor: "#ffffff" }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>
      <span className="text-xs font-medium text-white">
        Live
      </span>
    </div>
  )
}

