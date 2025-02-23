"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"

export function StrategyAtomAnimation() {
  const { theme } = useTheme()

  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  const electronVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const baseColor = theme === "dark" ? "#BBDEFB" : "#1976D2"
  const nucleusColor = "#FF4081" // Bright pink color for the nucleus
  const electronColors = ["#FFC107", "#4CAF50", "#03A9F4"] // Yellow, Green, Blue for electrons

  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        className="relative w-40 h-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${baseColor}`, opacity: 0.3 }}
          variants={orbitVariants}
          animate="animate"
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${baseColor}`, opacity: 0.3, transform: "rotate(60deg)" }}
          variants={orbitVariants}
          animate="animate"
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${baseColor}`, opacity: 0.3, transform: "rotate(-60deg)" }}
          variants={orbitVariants}
          animate="animate"
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-6 h-6 -ml-3 -mt-3 rounded-full"
          style={{ backgroundColor: nucleusColor }}
          variants={pulseVariants}
          animate="animate"
        />
        {electronColors.map((color, index) => (
          <motion.div
            key={index}
            className="absolute w-4 h-4 rounded-full"
            style={{
              backgroundColor: color,
              top: index === 0 ? 0 : index === 1 ? "50%" : "100%",
              left: index === 1 ? 0 : "100%",
              marginLeft: index === 1 ? "-8px" : index === 2 ? "-16px" : "0",
              marginTop: index === 0 ? "-8px" : index === 2 ? "-16px" : "0",
            }}
            variants={electronVariants}
            animate="animate"
            transition={{ duration: 2, delay: index * 0.5 }}
          />
        ))}
      </motion.div>
    </div>
  )
}

