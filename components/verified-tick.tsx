"use client"

import type React from "react"
import { motion } from "framer-motion"

interface VerifiedTickProps {
  color: "blue" | "green"
  size?: number
}

export const VerifiedTick: React.FC<VerifiedTickProps> = ({ color, size = 24 }) => {
  const fillColor = color === "blue" ? "#1DA1F2" : "#4CAF50"

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <path
        d="M22.25 12C22.25 17.6523 17.6523 22.25 12 22.25C6.34766 22.25 1.75 17.6523 1.75 12C1.75 6.34766 6.34766 1.75 12 1.75C17.6523 1.75 22.25 6.34766 22.25 12Z"
        fill={fillColor}
      />
      <path d="M10.5 16.25L6.75 12.5L7.80625 11.4437L10.5 14.1313L16.1937 8.4375L17.25 9.5L10.5 16.25Z" fill="white" />
    </motion.svg>
  )
}

