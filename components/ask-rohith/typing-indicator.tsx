// components/ask-rohith/typing-indicator.tsx
// Typing indicator for Rohith responses with progressive status messages

"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/theme-context"
import { Bot } from "lucide-react"

interface TypingIndicatorProps {
  message?: string
  showPortfolioContext?: boolean
}

// Status messages with their durations
const statusMessages = [
  { text: "Browsing HNWI knowledge base", duration: 2000 },
  { text: "Found relevant citations", duration: 3000 },
  { text: "Deep analysis on related citations", duration: 2000 },
  { text: "Compiling my response", duration: 3000 }
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
      if (currentStatusIndex < statusMessages.length - 1) {
        // Start fade out
        setIsTransitioning(true)

        // After fade out, change text and fade in
        setTimeout(() => {
          setCurrentStatusIndex(prev => prev + 1)
          setIsTransitioning(false)
        }, 300) // Match fade out duration

        // Schedule next status change
        timeoutId = setTimeout(
          advanceStatus,
          statusMessages[currentStatusIndex + 1].duration + 300 // Add transition time
        )
      }
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
                  <div className="w-1 h-1 bg-primary/50 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {statusMessages[currentStatusIndex].text}
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