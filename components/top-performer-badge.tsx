"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"

export const TopPerformerBadge = () => {
  const { theme } = useTheme()

  return (
    <motion.div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
        theme === "dark" ? "bg-yellow-400" : "bg-yellow-400"
      } text-black`}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      <Star className="w-4 h-4 text-black" />
    </motion.div>
  )
}

