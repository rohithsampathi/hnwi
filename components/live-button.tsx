"use client"

import { motion } from "framer-motion"

export const LiveButton = () => (
  <div className="inline-flex items-center bg-white dark:bg-green-800 rounded-full px-3 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition-all transform hover:-translate-y-1 active:translate-y-0.5 border border-gray-100 dark:border-green-600">
    <motion.div
      className="w-2 h-2 bg-red-500 rounded-full mr-2"
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    />
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">LIVE</span>
  </div>
)

