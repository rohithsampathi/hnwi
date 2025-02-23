"use client"

import { motion } from "framer-motion"

export const LiveButton = () => (
  <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md">
    <motion.div
      className="w-2 h-2 bg-red-500 rounded-full mr-2"
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    />
    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">LIVE</span>
  </div>
)

