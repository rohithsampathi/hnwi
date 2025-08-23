// components/elite-pulse-dashboard.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Target, 
  Brain,
  AlertTriangle,
  Crown,
  Sparkles,
  Shield,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  BarChart3,
} from "lucide-react"
import { secureApi } from "@/lib/secure-api"
import { isAuthenticated } from "@/lib/auth-utils"

interface ElitePulseAnalysis {
  wealth_migration: {
    from?: string
    from_?: string  // Backend uses from_ instead of from
    to: string
    volume: string
    timeline: string
    confidence_score?: number
    historical_analog?: string
    catalyst_dependencies?: string[]
  }
  arbitrage_gap: {
    current_discount: string
    closing_velocity: string
    capture_window: string
    required_capital_usd?: string
    risk_factors?: string[]
    regulatory_considerations?: string[]
  }
  pattern_recognition: {
    mega_trend: string
    frequency: string
    conviction: number
    convergence_analysis?: {
      converging_factors?: string[]
      convergence_timeline?: string
      post_convergence_scenario?: string
    }
    institutional_positioning?: {
      sovereign_funds?: string
      family_offices?: string
      hedge_funds?: string
    }
  }
  the_100k_move: {
    action: string
    entry_capital: string
    projected_return: string
    execution_timeline: string
    service_providers?: string
    exit_strategy?: string
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

interface ElitePulseDashboardProps {
  onLoadingComplete?: () => void
}

export function ElitePulseDashboard({ onLoadingComplete }: ElitePulseDashboardProps = {}) {
  const [elitePulseData, setElitePulseData] = useState<ElitePulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [briefCounts, setBriefCounts] = useState<BriefCounts | null>(null)
  const [activeSection, setActiveSection] = useState('overview')

  // Refs for smooth scrolling
  const overviewRef = useRef<HTMLDivElement>(null)
  const migrationRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)
  const whisperRef = useRef<HTMLDivElement>(null)
  const riskRef = useRef<HTMLDivElement>(null)
  const institutionalRef = useRef<HTMLDivElement>(null)
  const convergenceRef = useRef<HTMLDivElement>(null)
  const problemRef = useRef<HTMLDivElement>(null)

  const fetchElitePulse = async () => {
    try {
      setLoading(true)
      
      // Fetch brief counts in parallel with Elite Pulse data - direct backend call
      const countsPromise = secureApi.get('/api/developments/counts', true, { enableCache: true, cacheDuration: 300000 });
      
      // Try user-specific first if authenticated, otherwise fallback to global
      let data = null
      if (isAuthenticated()) {
        try {
          data = await secureApi.get('/api/elite-pulse/latest', true, { enableCache: true, cacheDuration: 300000 }); // direct backend call
        } catch (userError) {
        }
      }
      
      // Fallback to global if user-specific fails or user not authenticated
      if (!data || !data.success) {
        data = await secureApi.get('/api/elite-pulse/latest-global', true, { enableCache: true, cacheDuration: 300000 }); // direct backend call
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
      }
      
      if (data && data.success && data.analysis) {
        setElitePulseData(data)
        setError(null)
      } else {
        throw new Error('No Elite Pulse data available')
      }
    } catch (err: any) {
      // Handle errors gracefully without showing error to user
      setError(null)
      setElitePulseData(null)
    } finally {
      setLoading(false)
      // Notify parent component that loading is complete
      if (onLoadingComplete) {
        onLoadingComplete()
      }
    }
  }


  useEffect(() => {
    fetchElitePulse()
  }, [])

  // Ensure callback is called when component unmounts or loading state changes
  useEffect(() => {
    if (!loading && onLoadingComplete) {
      onLoadingComplete();
    }
  }, [loading, onLoadingComplete]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    if (!elitePulseData?.analysis) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section')
            if (sectionId) {
              setActiveSection(sectionId)
            }
          }
        })
      },
      { 
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0.1 
      }
    )

    // Define navigation sections dynamically
    const sections = [
      { id: 'overview', ref: overviewRef },
      { id: 'migration', ref: migrationRef },
      { id: 'action', ref: actionRef },
      { id: 'whisper', ref: whisperRef },
      ...(elitePulseData.analysis.arbitrage_gap?.risk_factors || elitePulseData.analysis.arbitrage_gap?.regulatory_considerations ? [{ id: 'risk', ref: riskRef }] : []),
      ...(elitePulseData.analysis.pattern_recognition?.institutional_positioning ? [{ id: 'institutional', ref: institutionalRef }] : []),
      ...(elitePulseData.analysis.pattern_recognition?.convergence_analysis ? [{ id: 'convergence', ref: convergenceRef }] : []),
      { id: 'problem', ref: problemRef }
    ]

    // Observe all section refs
    sections.forEach(section => {
      if (section.ref.current) {
        section.ref.current.setAttribute('data-section', section.id)
        observer.observe(section.ref.current)
      }
    })

    return () => observer.disconnect()
  }, [elitePulseData])

  // Loading is now handled by parent component - return empty space during loading
  if (loading) {
    return <div className="h-0 overflow-hidden"></div>
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

  // Navigation sections with premium icons
  const navigationSections = [
    { id: 'overview', label: 'HNWI Insider Action', ref: overviewRef, icon: BarChart3 },
    { id: 'migration', label: 'Migration Flow', ref: migrationRef, icon: RefreshCw },
    { id: 'action', label: 'Executive Action', ref: actionRef, icon: Crown },
    { id: 'whisper', label: 'Whisper Intel', ref: whisperRef, icon: MessageCircle },
    ...(analysis?.arbitrage_gap?.risk_factors || analysis?.arbitrage_gap?.regulatory_considerations ? [{ id: 'risk', label: 'Risk Factors', ref: riskRef, icon: Shield }] : []),
    ...(analysis?.pattern_recognition?.institutional_positioning ? [{ id: 'institutional', label: 'Institutional Moves', ref: institutionalRef, icon: TrendingUp }] : []),
    ...(analysis?.pattern_recognition?.convergence_analysis ? [{ id: 'convergence', label: 'Convergence', ref: convergenceRef, icon: Sparkles }] : []),
    { id: 'problem', label: 'Market Problem', ref: problemRef, icon: Target }
  ]

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = navigationSections.find(s => s.id === sectionId)
    const rightContentArea = document.querySelector('.right-content-scroll')
    
    if (rightContentArea) {
      if (sectionId === 'overview') {
        // Scroll to top for overview
        rightContentArea.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else if (section?.ref.current) {
        // Scroll to specific section
        const sectionTop = section.ref.current.offsetTop
        rightContentArea.scrollTo({
          top: sectionTop - 20, // Small offset for better visual alignment
          behavior: 'smooth'
        })
      }
      setActiveSection(sectionId)
    }
  }




  // Use backend timestamp with date
  const backendDateTime = new Date(elitePulseData.generated_at).toLocaleString('en-US', { 
    month: 'short',
    day: 'numeric',
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'GMT'
  });


  // Extract key intelligence for headline  
  const getHeadline = () => {
    const volume = analysis.wealth_migration.volume;
    const discount = analysis.arbitrage_gap.current_discount;
    const trend = analysis.pattern_recognition.mega_trend;
    
    // Extract meaningful amounts from volume text
    const billionMatch = volume?.match(/\$?(\d+(?:-\d+)?)\s*billion/i);
    const millionMatch = volume?.match(/(\d+(?:,\d+)?)\s*(?:UK\s+)?millionaires?/i);
    
    if (billionMatch) {
      const amount = billionMatch[1];
      const discountPercent = discount?.match(/(\d+(?:-\d+)?)%/)?.[1];
      if (discountPercent) {
        return `$${amount}B WEALTH SHIFT: ${discountPercent}% ARBITRAGE WINDOW`;
      }
      return `$${amount}B CAPITAL MIGRATION: IMMEDIATE OPPORTUNITY`;
    }
    
    if (millionMatch && trend) {
      const count = millionMatch[1];
      const trendKeyword = trend.split(' ')[0].toUpperCase();
      return `${count} HNW EXODUS: ${trendKeyword} ACCELERATION`;
    }
    
    if (trend) {
      const mainTrend = trend.split(' ').slice(0, 3).join(' ').toUpperCase();
      return `${mainTrend}: ELITE POSITIONING REQUIRED`;
    }
    
    return "ELITE INTELLIGENCE: IMMEDIATE ACTION WINDOW";
  };


  return (
    <div className="mb-4">
      {/* Maintain spacing after header removal */}
      <div className="pb-4"></div>
      
      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:h-[70vh]">
        {/* Left Sidebar - Navigation (Desktop only) */}
        <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
          <div className="p-6 h-full">
              <div className="space-y-6">
                {/* Last Updated and Confidence Score */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Last updated: {backendDateTime} GMT
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Confidence Score {analysis.pattern_recognition.conviction}/10</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="space-y-2">
                  {navigationSections.map((section) => {
                    const IconComponent = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`group w-full text-left px-4 py-4 rounded-xl transition-all duration-300 flex items-center space-x-4 ${
                          activeSection === section.id 
                            ? 'bg-primary/10 text-primary shadow-lg shadow-primary/10 border-l-4 border-primary font-medium scale-[1.02]' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-[1.01]'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 flex-shrink-0 transition-colors ${
                          activeSection === section.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        }`} />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{section.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 lg:h-full lg:overflow-y-auto right-content-scroll">
          <div className="max-w-none">
            <div className="space-y-4 lg:space-y-6 pb-8">
            
            {/* HNWI Insider Action Section */}
            <section ref={overviewRef} className="space-y-4">
              <div className="lg:hidden mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">HNWI INSIDER ACTION</h3>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              {/* Main Intelligence Display */}
              <div className="text-center lg:text-left space-y-4">
                <h1 className="text-xl lg:text-2xl font-bold leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {getHeadline()}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {analysis.pattern_recognition.mega_trend}
                </p>
              </div>
            </section>

            {/* Migration Flow Section */}
            <section ref={migrationRef} className="space-y-4">
              <div className="lg:hidden mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">MIGRATION FLOW</h3>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              {/* Migration Visualization */}
              <div className="space-y-6">
                {/* Flow Direction */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">FROM</div>
                      <div className="text-sm font-normal text-foreground pl-2 border-l-2 border-muted-foreground/30">
                        {analysis.wealth_migration.from_ || analysis.wealth_migration.from || "Traditional markets"}
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <RefreshCw className="h-6 w-6 text-primary animate-spin" style={{animationDuration: '3s'}} />
                        <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {analysis.wealth_migration.volume?.match(/\$?(\d+(?:-\d+)?)\s*billion/i)?.[0] || "Flow"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">TO</div>
                      <div className="text-sm font-normal text-primary pl-2 border-l-2 border-primary">
                        {analysis.wealth_migration.to}
                      </div>
                    </div>
                  </div>

                {/* Migration Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Volume & Timeline</div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">{analysis.wealth_migration.volume}</p>
                      <p className="text-sm text-muted-foreground italic">{analysis.wealth_migration.timeline}</p>
                    </div>
                  </div>
                  
                  {analysis.wealth_migration.historical_analog && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Historical Precedent</div>
                      <div className="pl-3 border-l border-primary/40">
                        <p className="text-sm text-muted-foreground italic leading-relaxed">{analysis.wealth_migration.historical_analog}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Executive Action Section */}
            <section ref={actionRef} className="space-y-4">
              <div className="lg:hidden mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">EXECUTIVE ACTION</h3>
                  <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">100K+ Move</span>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                {/* Action Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-primary">The Move</h4>
                  <p className="text-sm leading-relaxed font-medium text-foreground">
                    {analysis.the_100k_move.action}
                  </p>
                </div>
                
                {/* Capital & Returns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">ENTRY CAPITAL</div>
                    <div className="text-lg font-bold text-primary">
                      {analysis.the_100k_move.entry_capital?.replace('100000 USD', '$100K')}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">PROJECTED RETURN</div>
                    <div className="text-lg font-bold text-green-600">
                      {analysis.the_100k_move.projected_return?.match(/(\d+(?:-\d+)?)%/)?.[0] || "28-35% IRR"}
                    </div>
                  </div>
                </div>

                {/* Execution Details */}
                {(analysis.the_100k_move.execution_timeline || analysis.the_100k_move.service_providers || analysis.the_100k_move.exit_strategy) && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-primary">Execution Plan</h4>
                    <div className="space-y-4">
                      {analysis.the_100k_move.execution_timeline && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TIMELINE</div>
                          <p className="text-sm pl-3 border-l-2 border-primary/30 leading-relaxed">{analysis.the_100k_move.execution_timeline}</p>
                        </div>
                      )}
                      {analysis.the_100k_move.service_providers && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SERVICE PROVIDERS</div>
                          <p className="text-sm pl-3 border-l-2 border-primary/30 leading-relaxed">{analysis.the_100k_move.service_providers}</p>
                        </div>
                      )}
                      {analysis.the_100k_move.exit_strategy && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">EXIT STRATEGY</div>
                          <p className="text-sm pl-3 border-l-2 border-primary/30 leading-relaxed">{analysis.the_100k_move.exit_strategy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Whisper Intelligence Section */}
            <section ref={whisperRef} className="space-y-4">
              <div className="lg:hidden mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">WHISPER INTEL</h3>
                  <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">Insider perspectives</span>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute -left-1 top-0 w-0.5 h-full bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                  <blockquote className="text-base leading-relaxed italic font-medium text-foreground pl-4">
                    "{analysis.whisper_intelligence}"
                  </blockquote>
                </div>
                
                <div className="flex items-center justify-center space-x-2 pt-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Family offices • Sovereign funds • Private banks
                  </span>
                </div>
              </div>
            </section>

            {/* Risk Assessment Section */}
            {(analysis.arbitrage_gap.risk_factors || analysis.arbitrage_gap.regulatory_considerations) && (
              <section ref={riskRef} className="space-y-4">
                <div className="lg:hidden mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">RISK FACTORS</h3>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                </div>
                
                <div className="space-y-6">
                  {analysis.arbitrage_gap.risk_factors && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Key Risk Factors</h4>
                      <div className="space-y-3">
                        {analysis.arbitrage_gap.risk_factors.map((risk, index) => (
                          <div key={index} className="flex items-start space-x-3 pl-1">
                            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm leading-relaxed">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.arbitrage_gap.regulatory_considerations && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Regulatory Requirements</h4>
                      <div className="space-y-3">
                        {analysis.arbitrage_gap.regulatory_considerations.map((reg, index) => (
                          <div key={index} className="flex items-start space-x-3 pl-1">
                            <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm leading-relaxed">{reg}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Institutional Intelligence Section */}
            {analysis.pattern_recognition.institutional_positioning && (
              <section ref={institutionalRef} className="space-y-4">
                <div className="lg:hidden mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">INSTITUTIONAL MOVES</h3>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                </div>
                
                <div className="space-y-6">
                  {analysis.pattern_recognition.institutional_positioning.sovereign_funds && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Sovereign Wealth Funds</h4>
                      <div className="pl-3 border-l-2 border-primary/30">
                        <p className="text-sm leading-relaxed">{analysis.pattern_recognition.institutional_positioning.sovereign_funds}</p>
                      </div>
                    </div>
                  )}
                  {analysis.pattern_recognition.institutional_positioning.family_offices && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Family Offices</h4>
                      <div className="pl-3 border-l-2 border-primary/30">
                        <p className="text-sm leading-relaxed">{analysis.pattern_recognition.institutional_positioning.family_offices}</p>
                      </div>
                    </div>
                  )}
                  {analysis.pattern_recognition.institutional_positioning.hedge_funds && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Hedge Funds</h4>
                      <div className="pl-3 border-l-2 border-primary/30">
                        <p className="text-sm leading-relaxed">{analysis.pattern_recognition.institutional_positioning.hedge_funds}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Convergence Analysis Section */}
            {analysis.pattern_recognition.convergence_analysis && (
              <section ref={convergenceRef} className="space-y-4">
                <div className="lg:hidden mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-primary">CONVERGENCE</h3>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                </div>
                
                <div className="space-y-6">
                  {analysis.pattern_recognition.convergence_analysis.converging_factors && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Converging Factors</h4>
                      <div className="space-y-3">
                        {analysis.pattern_recognition.convergence_analysis.converging_factors.map((factor, index) => (
                          <div key={index} className="flex items-start space-x-3 pl-1">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm leading-relaxed">{factor}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.pattern_recognition.convergence_analysis.convergence_timeline && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Timeline</h4>
                      <div className="pl-3 border-l-2 border-primary/30">
                        <p className="text-sm leading-relaxed">{analysis.pattern_recognition.convergence_analysis.convergence_timeline}</p>
                      </div>
                    </div>
                  )}
                  {analysis.pattern_recognition.convergence_analysis.post_convergence_scenario && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-primary">Post-Convergence Scenario</h4>
                      <div className="pl-3 border-l-2 border-primary/30">
                        <p className="text-sm leading-relaxed">{analysis.pattern_recognition.convergence_analysis.post_convergence_scenario}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Market Problem Section */}
            <section ref={problemRef} className="space-y-4">
              <div className="lg:hidden mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-primary">MARKET PROBLEM</h3>
                  <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">Market inefficiency</span>
                </div>
                <div className="h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-primary">The Expensive Problem</h4>
                <p className="text-sm leading-relaxed font-medium">
                  {analysis.expensive_problem}
                </p>
              </div>
            </section>
            
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Source Information */}
      <div className="mt-8 pt-6 border-t border-border/40">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This analysis compounds intelligence from <span className="font-medium text-primary">{briefCounts?.developments?.total_count || '1,600+'} curated investment briefs</span> across global markets, family offices, and institutional flows.
            </p>
            
            {/* Mouse scroll animation - positioned lower */}
            <div className="pt-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-6 h-10 border-2 border-muted-foreground/40 rounded-full relative">
                  <motion.div
                    className="w-1 h-3 bg-primary rounded-full absolute left-1/2 top-2 transform -translate-x-1/2"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="text-xs text-muted-foreground/60"
                >
                  Keep scrolling
                </motion.div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}