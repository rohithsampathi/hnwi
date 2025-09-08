// components/elite/elite-loading-state.tsx
// Luxury loading state for elite dashboard

"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Fingerprint } from "lucide-react"
import { useState, useEffect } from "react"

interface EliteLoadingStateProps {
  message?: string
}

export function EliteLoadingState({ 
  message = "Verifying elite access..." 
}: EliteLoadingStateProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const steps = [
    "🔐 Securing encrypted access...",
    "🛡️ Verifying elite credentials...", 
    "🔑 Establishing secure channel...",
    "✨ Access granted to HNWI Chronicles"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedSteps(prev => {
        if (prev.length >= steps.length) {
          clearInterval(timer)
          setIsComplete(true)
          return prev
        }
        return [...prev, prev.length]
      })
    }, 800)

    return () => clearInterval(timer)
  }, [steps.length])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="text-center z-10 max-w-md mx-auto px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Shield className="w-16 h-16 mx-auto text-primary animate-pulse mb-4" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            HNWI Chronicles
          </h1>
          <p className="text-muted-foreground">Securing Encrypted Access</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                completedSteps.includes(index)
                  ? 'bg-primary/20 text-primary transform scale-105'
                  : 'bg-background/50 text-muted-foreground'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: completedSteps.includes(index) ? 1 : 0.7,
                x: 0 
              }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-2 h-2 rounded-full transition-colors ${
                completedSteps.includes(index) ? 'bg-primary' : 'bg-muted-foreground/30'
              }`} />
              <span className="text-sm font-medium">{step}</span>
              {completedSteps.includes(index) && (
                <motion.div 
                  className="ml-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div className="w-4 h-4 text-primary">✓</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {isComplete && (
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-primary font-semibold">🎯 Elite access established</div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}