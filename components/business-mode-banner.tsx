"use client"

import { useBusinessMode } from "@/contexts/business-mode-context"
import { useTheme } from "@/contexts/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

export function BusinessModeBanner() {
  const { isBusinessMode, showBanner } = useBusinessMode()
  const { theme } = useTheme()

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-16 left-0 right-0 z-50 p-3 flex items-center justify-center w-full ${
            theme === "dark" 
              ? isBusinessMode 
                ? "bg-gradient-to-r from-amber-700 to-amber-900 text-white"
                : "bg-gradient-to-r from-blue-700 to-blue-900 text-white"
              : isBusinessMode
                ? "bg-gradient-to-r from-amber-300 to-amber-500 text-gray-800"
                : "bg-gradient-to-r from-blue-300 to-blue-500 text-gray-800"
          }`}
        >
          <Zap className="mr-2 h-5 w-5" />
          <span className="font-bold">{isBusinessMode ? "Business Mode" : "Standard Mode"} Activated</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}