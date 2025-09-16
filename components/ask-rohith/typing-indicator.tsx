// components/ask-rohith/typing-indicator.tsx
// Typing indicator for Rohith responses

"use client"

import React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/theme-context"
import { Bot } from "lucide-react"

interface TypingIndicatorProps {
  message?: string
  showPortfolioContext?: boolean
}

export function TypingIndicator({
  message = "Rohith is thinking...",
  showPortfolioContext = false
}: TypingIndicatorProps) {
  const { theme } = useTheme()

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
          {/* Main typing message */}
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

          {/* Portfolio context indicator */}
          {showPortfolioContext && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-2 text-xs text-muted-foreground"
            >
              <div className="w-1 h-1 bg-primary/50 rounded-full animate-pulse"></div>
              <span>Browsing HNWI knowledge base</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TypingIndicator