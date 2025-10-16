// components/home-dashboard-elite.tsx
// Interactive World Map Dashboard

"use client"

import React, { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { HomeDashboardEliteProps } from "@/types/dashboard"
import { CrownLoader } from "@/components/ui/crown-loader"
import { secureApi } from "@/lib/secure-api"
import { usePageDataCache } from "@/contexts/page-data-cache-context"
import type { City } from "@/components/interactive-world-map"
import { extractDevIds } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { Brain, Crown, TrendingUp, Target } from "lucide-react"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { AnimatePresence } from "framer-motion"

// Dynamically import the map component with SSR disabled
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader size="lg" text="Loading Elite Pulse" />
      </div>
    )
  }
)

interface Opportunity {
  _id?: string  // MongoDB ID
  id?: string   // Alternative ID field
  title: string
  tier: string
  location: string
  latitude: number
  longitude: number
  country: string
  value: string
  risk: string
  analysis: string
  source: string
  victor_score?: string
  elite_pulse_analysis?: string
  category?: string  // Asset category from backend
  industry?: string  // Industry classification from backend
  product?: string   // Product type from backend
  start_date?: string  // Publish/start date
  executors?: Array<{
    name: string
    email?: string
    phone?: string
    role?: string
    strategic_trusted_partner?: boolean
    website?: string
    linkedin?: string
  }>
  // Price tracking fields from backend
  cost_per_unit?: number
  unit_count?: number
  current_price?: number
  entry_price?: number
  appreciation?: {
    percentage: number
    absolute: number
    annualized: number
    time_held_days: number
  }
  price_history?: Array<{
    timestamp: string
    price: number
    source: 'manual' | 'katherine_analysis' | 'system'
    confidence_score?: number
    notes?: string
  }>
  last_price_update?: string
  katherine_analysis?: string
  elite_pulse_impact?: {
    katherine_analysis?: string
    katherine_ai_analysis?: {
      strategic_assessment?: string
    }
  }
}

export function HomeDashboardElite({
  user,
  onNavigate,
  userData
}: HomeDashboardEliteProps) {
  const { getCachedData, setCachedData, isCacheValid } = usePageDataCache();

  // Check for cached data
  const cachedData = getCachedData('dashboard');
  const hasValidCache = isCacheValid('dashboard');

  const [cities, setCities] = useState<City[]>(cachedData?.cities || [])
  const [loading, setLoading] = useState(!hasValidCache)
  const [timeframe, setTimeframe] = useState<string>('live') // Default: live data
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showGreeting, setShowGreeting] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop')

  // Opportunity filter toggles
  const [showCrownAssets, setShowCrownAssets] = useState(true)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true)
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true)

  // Citation management
  const {
    citations: managedCitations,
    setCitations: setManagedCitations,
    citationMap,
    selectedCitationId,
    setSelectedCitationId,
    isPanelOpen,
    openCitation,
    closePanel
  } = useCitationManager()

  // Screen size detection for mobile/desktop (matching HNWI World)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setScreenSize(width < 768 ? 'mobile' : 'desktop')
      setIsDesktop(width >= 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Auto-hide greeting after 10 seconds on mobile only
  useEffect(() => {
    // Set timer to hide greeting on mobile only
    let timer: NodeJS.Timeout | null = null
    if (window.innerWidth < 768) {
      timer = setTimeout(() => {
        setShowGreeting(false)
      }, 10000) // 10 seconds
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  // Handle citation click from map popup
  const handleCitationClick = useCallback((citationId: string) => {
    openCitation(citationId)
  }, [openCitation])

  useEffect(() => {
    const fetchOpportunities = async () => {
      // Check if we have valid cached data
      const cached = getCachedData('dashboard');
      const isCacheValid = cached && (Date.now() - cached.timestamp < cached.ttl);

      // If cache is valid and we have the same timeframe, skip API call entirely
      if (isCacheValid && cached.timeframe === timeframe && cached.cities?.length > 0) {
        setCities(cached.cities);
        setManagedCitations(cached.citations || []);
        setLoading(false);
        return;
      }

      // No valid cache - show loading and fetch data
      setLoading(true);

      try {
        const apiUrl = timeframe === 'live'
          ? '/api/command-centre/opportunities?include_crown_vault=true&include_executors=true'
          : `/api/command-centre/opportunities?timeframe=${timeframe}&include_crown_vault=true&include_executors=true`

        const response = await secureApi.get(apiUrl, true, {
          enableCache: true,
          cacheDuration: 600000 // 10 minutes
        })

        if (response.success && response.opportunities) {
          // Transform opportunities to city format for the map
          const cityData: City[] = response.opportunities
            .map((opp: Opportunity, index: number) => {
              // Use backend coordinates directly - no overrides
              let lat = opp.latitude
              let lng = opp.longitude
              let displayName = opp.location || opp.country || opp.title || 'Opportunity'

              // Validate coordinates are within valid range
              if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                // Skip this opportunity if coordinates are invalid
                return null
              }

              // Skip if coordinates are (0, 0) - likely missing data
              if (lat === 0 && lng === 0) {
                return null
              }

              // Extract citations from BOTH analysis and elite_pulse_analysis
              const devIdsFromAnalysis = extractDevIds(opp.analysis || '')
              const devIdsFromElitePulse = extractDevIds(opp.elite_pulse_analysis || '')
              // Combine and deduplicate
              const allDevIds = Array.from(new Set([...devIdsFromAnalysis, ...devIdsFromElitePulse]))
              const devIds = allDevIds

              return {
                name: displayName,
                country: opp.country || 'Unknown',
                latitude: lat,
                longitude: lng,
                population: opp.value,
                type: opp.source === "MOEv4" ? "finance" : "luxury",
                // Include full opportunity data
                _id: opp._id,  // MongoDB ID for deep linking
                id: opp.id,    // Alternative ID field
                title: opp.title,
                tier: opp.tier,
                value: opp.value,
                risk: opp.risk,
                analysis: opp.analysis,
                source: opp.source,
                victor_score: opp.victor_score,
                elite_pulse_analysis: opp.elite_pulse_analysis,
                // Category/Industry/Product from backend
                category: opp.category,
                industry: opp.industry,
                product: opp.product,
                start_date: opp.start_date,
                // Citation data
                devIds: devIds,
                hasCitations: devIds.length > 0,
                // Executor data
                executors: opp.executors,
                // Price data from command centre (for Crown Vault assets)
                cost_per_unit: opp.cost_per_unit,
                unit_count: opp.unit_count,
                current_price: opp.current_price,
                entry_price: opp.entry_price,
                appreciation: opp.appreciation,
                price_history: opp.price_history,
                last_price_update: opp.last_price_update,
                // Katherine AI analysis (check for non-empty strings)
                katherine_analysis: (opp.katherine_analysis && opp.katherine_analysis.trim()) ||
                                   (opp.elite_pulse_impact?.katherine_analysis && opp.elite_pulse_impact.katherine_analysis.trim()) ||
                                   (opp.elite_pulse_impact?.katherine_ai_analysis?.strategic_assessment && opp.elite_pulse_impact.katherine_ai_analysis.strategic_assessment.trim()) ||
                                   null
              }
            })
            .filter((city): city is City => city !== null) // Remove null entries

          // Extract all citations across all opportunities
          const allCitations: Citation[] = []
          const seenIds = new Set<string>()
          let citationNumber = 1

          cityData.forEach(city => {
            if (city.devIds && city.devIds.length > 0) {
              city.devIds.forEach(devId => {
                if (!seenIds.has(devId)) {
                  seenIds.add(devId)
                  allCitations.push({
                    id: devId,
                    number: citationNumber++,
                    originalText: `[Dev ID: ${devId}]`
                  })
                }
              })
            }
          })

          setManagedCitations(allCitations)
          setCities(cityData)

          // Cache the data (5-minute TTL for dashboard) with timeframe
          setCachedData('dashboard', {
            cities: cityData,
            citations: allCitations,
            timeframe: timeframe,
            timestamp: Date.now(),
            ttl: 300000
          }, 300000);
        }
      } catch (error: any) {
        // Don't catch auth errors - let secureApi's automatic auth popup handle them
        // Auth errors will be caught by secureApiCall and show the popup automatically

        // For any other errors, just log silently and continue with empty data
        // (The error has already been handled by secureApi)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [timeframe]) // Re-fetch when timeframe changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CrownLoader size="lg" text="Loading Elite Pulse" />
      </div>
    )
  }

  // Generate greeting text
  const getGreeting = () => {
    const hour = new Date().getHours()
    const firstName = userData?.firstName || userData?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    if (hour < 6) return `Midnight Wealth Watchlist, ${firstName}`
    if (hour < 12) return `Morning Intelligence Brief, ${firstName}`
    if (hour < 17) return `Midday Market Synthesis, ${firstName}`
    if (hour < 22) return `Evening Capital Insights, ${firstName}`
    return `Night Watch: Global Capital Flow, ${firstName}`
  }

  // Filter cities based on opportunity type toggles
  const filteredCities = cities.filter(city => {
    // Crown Assets: opportunities from crown vault or asset-related
    const isCrownAsset = city.source?.toLowerCase().includes('crown') ||
                         city.category?.toLowerCase().includes('asset') ||
                         city.category?.toLowerCase().includes('vault')

    // Privé Opportunities: Victor-scored opportunities from Privé Exchange
    const isPriveOpportunity = city.victor_score !== undefined ||
                               city.source?.toLowerCase().includes('privé') ||
                               city.source?.toLowerCase().includes('prive')

    // HNWI Pattern Opportunities: MOEv4 market intelligence and patterns
    const isHNWIPattern = city.source === 'MOEv4' ||
                          city.source?.toLowerCase().includes('pattern') ||
                          city.category?.toLowerCase().includes('intelligence') ||
                          city.category?.toLowerCase().includes('trend') ||
                          (!isCrownAsset && !isPriveOpportunity) // Default category

    // Show city if its category toggle is enabled
    if (isCrownAsset && showCrownAssets) return true
    if (isPriveOpportunity && showPriveOpportunities) return true
    if (isHNWIPattern && showHNWIPatterns) return true

    return false
  })

  return (
    <>
      <div className="fixed inset-0 overflow-hidden" style={{ marginTop: '40px' }}>
        <InteractiveWorldMap
          width="100%"
          height="100%"
          showControls={true}
          cities={filteredCities}
          onCitationClick={handleCitationClick}
          citationMap={citationMap}
          onNavigate={onNavigate}
          showCrownAssets={showCrownAssets}
          showPriveOpportunities={showPriveOpportunities}
          showHNWIPatterns={showHNWIPatterns}
          onToggleCrownAssets={() => setShowCrownAssets(!showCrownAssets)}
          onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
          onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
        />

        {/* Greeting Overlay - Positioned to match PageHeader layout */}
        <div className="absolute top-12 md:top-16 left-4 md:left-[80px] z-[400] px-0 sm:px-2 lg:px-4 pointer-events-none">
          {/* Greeting and subtext - hidden after 10s on mobile, always visible on desktop */}
          {(showGreeting || isDesktop) && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground">
                  {getGreeting()}
                </h1>
              </div>
              <p className="text-muted-foreground text-xs md:text-sm ml-6 md:ml-7 mb-2 md:mb-3">
                World HNWI transactional opportunities on your Command Centre
              </p>
            </>
          )}

          {/* Date Range Selector - Custom dropdown below description text - always visible */}
          <div className={`relative inline-block pointer-events-auto ${(showGreeting || isDesktop) ? 'ml-6 md:ml-7' : 'ml-0'}`}>
            {/* Custom Dropdown Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`py-1.5 text-xs bg-secondary text-foreground rounded hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border flex items-center gap-2 ${timeframe === 'live' ? 'pl-6 pr-8 font-bold' : 'pl-3 pr-8'}`}
            >
              {/* Blinking dot - only visible when Live Data is selected */}
              {timeframe === 'live' && (
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                </span>
              )}
              <span>{timeframe === 'live' ? 'Live Data' : timeframe}</span>
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-[500]"
                  onClick={() => setIsDropdownOpen(false)}
                />

                {/* Dropdown Options */}
                <div className="absolute left-0 top-full mt-1 bg-background border border-border rounded shadow-lg z-[501] min-w-[120px]">
                  {[
                    { value: 'live', label: 'Live Data', bold: true },
                    { value: '7D', label: '7D' },
                    { value: '14D', label: '14D' },
                    { value: '21D', label: '21D' },
                    { value: '1M', label: '1M' },
                    { value: '3M', label: '3M' },
                    { value: '6M', label: '6M' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeframe(option.value)
                        setIsDropdownOpen(false)
                        setLoading(true)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-primary hover:text-white transition-colors ${
                        timeframe === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                      } ${option.bold ? 'font-bold' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Blinking animation styles */}
          <style jsx>{`
            @keyframes ping {
              75%, 100% {
                transform: scale(2);
                opacity: 0;
              }
            }
            .animate-ping {
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
          `}</style>
        </div>
      </div>

      {/* Citation Panel - Desktop Only (matching HNWI World pattern) */}
      {isPanelOpen && screenSize === 'desktop' && (
        <div className="hidden lg:block">
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={closePanel}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        </div>
      )}

      {/* Mobile Citation Panel - Full screen with AnimatePresence */}
      {isPanelOpen && screenSize === 'mobile' && (
        <AnimatePresence>
          <EliteCitationPanel
            citations={managedCitations}
            selectedCitationId={selectedCitationId}
            onClose={() => {
              closePanel()
            }}
            onCitationSelect={setSelectedCitationId}
            citationMap={citationMap}
          />
        </AnimatePresence>
      )}
    </>
  )
}
