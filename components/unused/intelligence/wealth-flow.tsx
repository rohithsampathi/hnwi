// components/intelligence/wealth-flow.tsx
// Wealth Migration Flow Visualization - Shows capital movement patterns

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  TrendingUp,
  DollarSign,
  Globe,
  Building2,
  Landmark,
  Shield,
  Zap
} from "lucide-react"
import { parseRuschaIntelligence, type ParsedIntelligence } from "@/lib/intelligence-parser"

interface WealthFlowProps {
  intelligence: any
  className?: string
}

export function WealthFlow({ intelligence, className }: WealthFlowProps) {
  const [parsedData, setParsedData] = useState<ParsedIntelligence | null>(null)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    console.log('🎯 WealthFlow: Intelligence received:', {
      hasIntelligence: !!intelligence,
      hasElitePulse: !!intelligence?.elite_pulse,
      hasWealthMigration: !!intelligence?.elite_pulse?.wealth_migration,
      hasPeerSignals: !!intelligence?.peer_signals
    })
    
    // Use actual JSON structure from backend
    if (intelligence?.elite_pulse?.wealth_migration || intelligence?.peer_signals) {
      const elitePulse = intelligence?.elite_pulse
      const peerSignals = intelligence?.peer_signals
      const wealthMigration = elitePulse?.wealth_migration
      
      let structuredParsed: any = {
        opportunities: [],
        timingWindows: [],
        executiveSummary: "",
        generatedAt: new Date().toISOString(),
        expertsAnalyzed: 6,
        hoursInvested: "120+ hours",
        marketAssessment: { juicy: [], moderate: [], farFetched: [] },
        confidence: elitePulse?.confidence || 0.84,
        wealthMigration: null
      }
      
      // Use elite_pulse wealth migration data
      if (wealthMigration) {
        structuredParsed.wealthMigration = {
          volume: wealthMigration.volume || "Significant capital movement detected",
          from: wealthMigration.from || "Traditional Markets",
          to: wealthMigration.to || "Alternative Assets",
          confidence: wealthMigration.confidence_score || elitePulse?.confidence || 0.84
        }
        
        console.log('🎯 WealthFlow: Elite pulse wealth migration:', structuredParsed.wealthMigration)
      }
      
      // Fallback to peer signals if no elite pulse wealth migration
      else if (peerSignals?.trending_opportunities) {
        structuredParsed.wealthMigration = {
          volume: "Peer network capital movement",
          from: "Traditional asset classes", 
          to: peerSignals.trending_opportunities[0] || "Alternative opportunities",
          confidence: 0.75
        }
        
        console.log('🎯 WealthFlow: Using peer signals for wealth flow')
      }
      
      setParsedData(structuredParsed)
    }
  }, [intelligence])

  // Animation cycle for wealth flow
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  if (!parsedData?.wealthMigration) {
    // Fallback to peer signals data
    const peerSignals = intelligence?.peer_signals?.data?.wealth_migration_trends
    
    if (!peerSignals) {
      return (
        <Card className={`border-border/40 ${className}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Globe className="h-5 w-5 animate-pulse" />
              <span>No wealth migration data available</span>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Use peer signals data
    const fromSectors = peerSignals.from_sectors || []
    const toSectors = peerSignals.to_sectors || []
    const volume = peerSignals.volume || "Significant capital movement"
    const confidence = (peerSignals.confidence || 0.84) * 100

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">Wealth Migration Intelligence</h2>
                  <p className="text-sm text-muted-foreground">
                    Real-time capital flow analysis
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-primary text-primary-foreground">
                  {confidence.toFixed(0)}% Confidence
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  Live tracking
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Flow Visualization */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {volume}
                </h3>
                <p className="text-muted-foreground">
                  Capital reallocation detected across multiple sectors
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* From Sectors */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Capital Exiting
                  </h4>
                  {fromSectors.map((sector: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ 
                        opacity: animationPhase === 0 ? 1 : 0.7,
                        scale: animationPhase === 0 ? 1.05 : 1 
                      }}
                      transition={{ duration: 0.5 }}
                      className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          {sector}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Flow Arrow */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      x: animationPhase === 1 ? [0, 20, 0] : 0,
                      scale: animationPhase === 1 ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 1, repeat: animationPhase === 1 ? Infinity : 0 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <ArrowRight className="h-8 w-8 text-primary" />
                    <div className="text-xs text-center text-muted-foreground">
                      <div>Real-time</div>
                      <div>Migration</div>
                    </div>
                  </motion.div>
                </div>

                {/* To Sectors */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Capital Entering
                  </h4>
                  {toSectors.map((sector: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ 
                        opacity: animationPhase === 2 ? 1 : 0.7,
                        scale: animationPhase === 2 ? 1.05 : 1 
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {sector}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use parsed wealth migration data
  const migration = parsedData.wealthMigration
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Wealth Migration Intelligence</h2>
                <p className="text-sm text-muted-foreground">
                  Elite capital movement patterns
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-primary text-primary-foreground">
                {(parsedData.confidence * 100).toFixed(0)}% Confidence
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                Real-time tracking
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Primary Flow Visualization */}
      <Card className="border-2 border-primary/30">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Volume Header */}
            <div className="text-center">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-primary mb-2"
              >
                {migration.volume}
              </motion.h3>
              <p className="text-muted-foreground">
                Tracked capital migration requiring immediate attention
              </p>
            </div>

            {/* Flow Visualization */}
            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* From */}
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                  >
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full border border-red-200 dark:border-red-800">
                        <Landmark className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground uppercase">
                        Exiting From
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {migration.from}
                      </div>
                      <div className="text-xs text-red-500">
                        Capital outflow detected
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Arrow with Animation */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ 
                      x: [0, 10, 0],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex flex-col items-center space-y-3"
                  >
                    <div className="relative">
                      <ArrowRight className="h-12 w-12 text-primary" />
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ 
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-primary/30 rounded-full"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-primary">MIGRATION</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </motion.div>
                </div>

                {/* To */}
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground uppercase">
                        Moving Into
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {migration.to}
                      </div>
                      <div className="text-xs text-green-500">
                        Capital accumulation zone
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Impact Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border"
            >
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-primary">
                  {parsedData.opportunities.filter(o => o.juiciness === 'JUICY').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  JUICY Opportunities
                </div>
              </div>

              <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-amber-600">
                  {parsedData.timingWindows.filter(w => w.urgency === 'urgent').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Urgent Windows
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-600">
                  $25K+
                </div>
                <div className="text-sm text-muted-foreground">
                  Monthly Value
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Intelligence Attribution */}
      <Card className="border-muted-foreground/20">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Migration intelligence powered by <span className="font-medium text-primary">6 Expert Analysts</span>
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              Real-time tracking • {(parsedData.confidence * 100).toFixed(0)}% confidence • Updated continuously
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}