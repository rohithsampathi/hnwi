"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"

export function StrategyThinkingLoader() {
  const { theme } = useTheme()

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <motion.div
        className="relative w-40 h-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${theme === "dark" ? "#BBDEFB" : "#1976D2"}`, opacity: 0.3 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${theme === "dark" ? "#BBDEFB" : "#1976D2"}`,
            opacity: 0.3,
            transform: "rotate(60deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${theme === "dark" ? "#BBDEFB" : "#1976D2"}`,
            opacity: 0.3,
            transform: "rotate(-60deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 -ml-3 -mt-3 rounded-full"
          style={{ backgroundColor: theme === "dark" ? "#BBDEFB" : "#1976D2" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.p
        className="mt-4 text-lg font-semibold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Updating profile...
      </motion.p>
    </div>
  )
}

