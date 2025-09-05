// components/elite/elite-error-state.tsx
// Error state component for elite dashboard

"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface EliteErrorStateProps {
  error: string
  onRetry: () => void
}

export function EliteErrorState({ error, onRetry }: EliteErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md border-red-200 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Intelligence System Error</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Intelligence Load
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}