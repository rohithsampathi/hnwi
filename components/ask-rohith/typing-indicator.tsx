// components/ask-rohith/typing-indicator.tsx
// Typing indicator for Rohith responses with progressive status messages

"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/theme-context"
import { Bot, Brain } from "lucide-react"

interface TypingIndicatorProps {
  message?: string
  showPortfolioContext?: boolean
}

// Status messages with their durations - loop between thinking and contemplating
const statusMessages = [
  { text: "Rohith is Thinking...", duration: 3000 },
  { text: "And now contemplating...", duration: 3000 }
]

export function TypingIndicator({
  message = "Rohith is thinking...",
  showPortfolioContext = false
}: TypingIndicatorProps) {
  const { theme } = useTheme()
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!showPortfolioContext) return

    let timeoutId: NodeJS.Timeout

    const advanceStatus = () => {
      // Start fade out
      setIsTransitioning(true)

      // After fade out, change text and fade in
      setTimeout(() => {
        // Loop back to start after reaching the end
        setCurrentStatusIndex(prev => (prev + 1) % statusMessages.length)
        setIsTransitioning(false)
      }, 300) // Match fade out duration

      // Calculate next index for duration lookup (with wrapping)
      const nextIndex = (currentStatusIndex + 1) % statusMessages.length

      // Schedule next status change
      timeoutId = setTimeout(
        advanceStatus,
        statusMessages[nextIndex].duration + 300 // Add transition time
      )
    }

    // Start the sequence after initial delay
    timeoutId = setTimeout(
      advanceStatus,
      statusMessages[currentStatusIndex].duration
    )

    return () => clearTimeout(timeoutId)
  }, [currentStatusIndex, showPortfolioContext])

  // Reset when a new message starts
  useEffect(() => {
    setCurrentStatusIndex(0)
    setIsTransitioning(false)
  }, [showPortfolioContext])

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 }
  }

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    }
  }

  const statusVariants = {
    initial: { opacity: 0, y: 5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      y: -5,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-start space-x-3 mb-4"
    >
      {/* Rohith Avatar */}
      <Avatar className="w-8 h-8 border border-primary/20">
        <AvatarImage src="/Rohith.ico" alt="Rohith" />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Typing Bubble */}
      <div className={`
        max-w-xs px-4 py-3 rounded-2xl rounded-tl-md
        ${theme === "dark"
          ? "bg-card border border-border/50"
          : "bg-muted/50 border border-border/30"
        }
      `}>
        <div className="flex flex-col space-y-2">
          {/* Main typing message - only show if not showing portfolio context */}
          {!showPortfolioContext && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground font-medium">
                {message}
              </span>

              {/* Animated dots */}
              <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-primary rounded-full"
                    variants={dotVariants}
                    animate="animate"
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: index * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Progressive status messages with fade transitions */}
          {showPortfolioContext && (
            <div className="flex items-center space-x-2 h-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStatusIndex}
                  variants={statusVariants}
                  initial="initial"
                  animate={isTransitioning ? "exit" : "animate"}
                  exit="exit"
                  className="flex items-center space-x-2"
                >
                  {/* Animated Brain Icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="w-4 h-4 text-primary" />
                  </motion.div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {statusMessages[currentStatusIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TypingIndicator