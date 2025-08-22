// components/elite-pulse-dashboard.tsx

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Eye, 
  DollarSign, 
  ArrowRight,
  Brain,
  Clock,
  AlertTriangle,
  Lightbulb,
  Crown,
  Sparkles,
  Mouse
} from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getMatteCardStyle, getMetallicCardStyle } from "@/lib/colors"
import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"
import { useAuthPopup } from "@/contexts/auth-popup-context"

interface ElitePulseAnalysis {
  wealth_migration: {
    from?: string
    from_?: string  // Backend uses from_ instead of from
    to: string
    volume: string
    timeline: string
  }
  arbitrage_gap: {
    current_discount: string
    closing_velocity: string
    capture_window: string
  }
  pattern_recognition: {
    mega_trend: string
    frequency: string
    conviction: number
  }
  the_100k_move: {
    action: string
    entry_capital: string
    projected_return: string
    execution_timeline: string
  }
  expensive_problem: string
  whisper_intelligence: string
}

interface ElitePulseData {
  analysis: ElitePulseAnalysis
  generated_at: string
  developments_count?: number
  record_id: string
}

interface BriefCounts {
  developments: {
    total_count: number
    source: string
  }
  opportunities: {
    total_count: number
    active_count: number
    source: string
  }
}

export function ElitePulseDashboard() {
  const { theme } = useTheme()
  const { showAuthPopup } = useAuthPopup()
  const [elitePulseData, setElitePulseData] = useState<ElitePulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [briefCounts, setBriefCounts] = useState<BriefCounts | null>(null)

  const fetchElitePulse = async () => {
    try {
      setLoading(true)
      
      // Fetch brief counts in parallel with Elite Pulse data - use dedicated counts endpoint
      const countsPromise = secureApi.get('/api/developments/counts', true, { enableCache: true, cacheDuration: 300000 });
      
      // Try user-specific first if authenticated, otherwise fallback to global
      let data = null
      if (isAuthenticated()) {
        try {
          data = await secureApi.get('/api/elite-pulse/latest', true, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache like Private Brief
        } catch (userError) {
          console.log('User-specific Elite Pulse not available, trying global...')
        }
      }
      
      // Fallback to global if user-specific fails or user not authenticated
      if (!data || !data.success) {
        data = await secureApi.get('/api/elite-pulse/latest-global', false, { enableCache: true, cacheDuration: 300000 }); // 5 minutes cache
      }
      
      // Fetch counts data
      try {
        const countsData = await countsPromise;
        if (countsData && countsData.developments) {
          // Use the counts endpoint response structure directly
          setBriefCounts({
            developments: {
              total_count: countsData.developments.total_count,
              source: countsData.developments.source
            },
            opportunities: {
              total_count: countsData.opportunities?.total_count || 0,
              active_count: countsData.opportunities?.active_count || 0,
              source: countsData.opportunities?.source || "mongodb"
            }
          });
        }
      } catch (countsError) {
        console.log('Brief counts not available:', countsError);
      }
      
      if (data && data.success && data.analysis) {
        setElitePulseData(data)
        setError(null)
      } else {
        throw new Error('No Elite Pulse data available')
      }
    } catch (err: any) {
      console.error('Elite Pulse fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchElitePulse()
  }, [])

  if (loading) {
    return (
      <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <CrownLoader size="md" text="Generating Elite Pulse..." />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !elitePulseData) {
    return (
      <Card className="overflow-hidden font-body bg-transparent border-none text-card-foreground">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Elite Pulse temporarily unavailable</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!elitePulseData) return null

  const { analysis } = elitePulseData
  const convictionColor = analysis.pattern_recognition.conviction >= 8 ? "text-green-500" : 
                         analysis.pattern_recognition.conviction >= 6 ? "text-yellow-500" : "text-red-500"

  // Use backend timestamp with date
  const backendDateTime = new Date(elitePulseData.generated_at).toLocaleString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'GMT'
  });

  // Centralized heading style matching Private Brief
  const sectionHeadingClass = `text-2xl md:text-3xl font-heading font-bold tracking-wide ${
    theme === "dark" ? "text-white" : "text-black"
  }`;

  // Extract key intelligence for headline
  const getHeadline = () => {
    if (analysis.wealth_migration.volume && analysis.arbitrage_gap.current_discount) {
      return analysis.wealth_migration.volume.includes('billion') 
        ? `${analysis.wealth_migration.volume.split(' ')[0]} WEALTH EXODUS: ${analysis.arbitrage_gap.current_discount.split(' ')[0]} ARBITRAGE CLOSING`
        : "WEALTH MIGRATION ACCELERATING: ARBITRAGE WINDOW CLOSING";
    }
    return "ELITE INTELLIGENCE UPDATE: IMMEDIATE ACTION REQUIRED";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="pb-4">
        <div className="flex items-center space-x-2">
          <Zap className={`w-6 h-6 ${theme === "dark" ? "text-primary" : "text-black"}`} />
          <h2 className={sectionHeadingClass}>
            Elite Pulse
          </h2>
        </div>
        <p className="text-muted-foreground text-base leading-tight">
          Intelligence from curated insider briefs. Compound insights that accelerate advantage.
        </p>
      </div>

      <div className="space-y-6">
          
          {/* Hero Intelligence Section */}
          <div className="border-l-4 border-primary p-6">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-medium text-muted-foreground">CURRENT</span>
                </div>
                <div className="h-3 w-px bg-muted-foreground/30 hidden sm:block"></div>
                <span className="text-xs font-mono text-muted-foreground">{backendDateTime} GMT</span>
                <div className="h-3 w-px bg-muted-foreground/30 hidden sm:block"></div>
                <span className="text-xs font-medium text-muted-foreground">
                  Databank Briefs: {briefCounts?.developments?.total_count || '1,600+'}
                </span>
              </div>
              <Badge variant="outline" className="text-xs font-medium self-start sm:self-auto">
                Grade A+ ({analysis.pattern_recognition.conviction}/10)
              </Badge>
            </div>

              {/* Main Intelligence */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold leading-tight text-primary">
                  {getHeadline()}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20">
                    <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground font-medium mb-1">TIMELINE</div>
                      <div className="font-medium leading-tight">{analysis.wealth_migration.timeline}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-muted-foreground font-medium mb-1">EXECUTION WINDOW</div>
                      <div className="font-medium leading-tight">{analysis.arbitrage_gap.capture_window}</div>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Action Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Your Move */}
            <Card style={{
              ...getMetallicCardStyle(theme).style,
              boxShadow: 'none'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-bold text-primary">
                    YOUR MOVE
                  </h4>
                </div>
                <p className="text-sm leading-relaxed mb-4">
                  {analysis.the_100k_move.action}
                </p>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">CAPITAL REQUIRED</div>
                    <div className="text-sm font-bold text-primary">{analysis.the_100k_move.entry_capital}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">PROJECTED RETURN</div>
                    <div className="text-sm font-bold text-primary break-words">{analysis.the_100k_move.projected_return}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intelligence Insight */}
            <Card style={{
              ...getMetallicCardStyle(theme).style,
              boxShadow: 'none'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Eye className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-bold text-primary">
                    INTELLIGENCE
                  </h4>
                </div>
                <p className="text-sm leading-relaxed mb-4">
                  {analysis.whisper_intelligence}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Brain className="h-3 w-3" />
                  <span>Family offices • Auction houses • Private banks</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problem Statement */}
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-bold text-primary">
                EXPENSIVE PROBLEM
              </h4>
            </div>
            <p className="text-sm leading-relaxed">
              {analysis.expensive_problem}
            </p>
          </div>

          {/* Continuity Bridge */}
          <div className="text-center space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium">Synthesis from {briefCounts?.developments?.total_count || '1,600+'} curated briefs.</span> Each insight builds on previous intelligence. 
                <span className="font-medium">Your advantage compounds daily.</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Explore the detailed intelligence that shaped this analysis below
              </p>
            </div>
            
            {/* Scroll Animation */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Mouse className="h-5 w-5 text-primary/70" />
              </motion.div>
            </div>
          </div>
          
      </div>
    </motion.div>
  )
}