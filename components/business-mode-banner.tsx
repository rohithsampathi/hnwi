"use client"

import { useBusinessMode } from "@/contexts/business-mode-context"
import { useTheme } from "@/contexts/theme-context"
import { motion, AnimatePresence } from "framer-motion"
import { User } from "lucide-react"

export function BusinessModeBanner() {
  const { isBusinessMode, showBanner } = useBusinessMode()
  const { theme } = useTheme()

  // Metallic gold gradient for business mode
  const goldMetallicGradient = theme === "dark"
    ? "bg-gradient-to-r from-amber-700 via-yellow-500 to-amber-700 text-white"
    : "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-gray-900";
    
  // Metallic green gradient for personal mode
  const greenMetallicGradient = theme === "dark"
    ? "bg-gradient-to-r from-green-800 via-green-500 to-green-800 text-white"
    : "bg-gradient-to-r from-green-500 via-green-400 to-green-500 text-white";

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-20 md:top-28 left-0 right-0 z-50 p-3 flex items-center justify-center w-full shadow-lg ${
            isBusinessMode ? goldMetallicGradient : greenMetallicGradient
          }`}
          style={{
            boxShadow: isBusinessMode
              ? "0 4px 15px rgba(212, 175, 55, 0.5)"
              : "0 4px 15px rgba(34, 197, 94, 0.5)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        >
          <User className={`mr-2 h-5 w-5 ${
            isBusinessMode 
              ? theme === "dark" ? "text-amber-200" : "text-gray-900" 
              : "text-white"
          }`} />
          <span className="font-bold tracking-wide">
            {isBusinessMode ? "Business Mode" : "Personal Mode"} Activated
          </span>
          
          <style jsx global>{`
            @keyframes shimmer {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}