// components/elite/elite-loading-state.tsx
// Elegant loading state for elite dashboard

"use client"

import { motion } from "framer-motion"
import { CrownLoader } from "@/components/ui/crown-loader"

interface EliteLoadingStateProps {
  message?: string
}

export function EliteLoadingState({ 
  message = "Initializing Elite Intelligence System..." 
}: EliteLoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CrownLoader size="lg" text={message} />
      </motion.div>
    </div>
  )
}