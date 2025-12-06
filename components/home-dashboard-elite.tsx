// components/home-dashboard-elite.tsx
// Interactive World Map Dashboard

"use client"

import React, { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { HomeDashboardEliteProps } from "@/types/dashboard"
import { CrownLoader } from "@/components/ui/crown-loader"
import { secureApi } from "@/lib/secure-api"
import type { City } from "@/components/interactive-world-map"
import { extractDevIds } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { Brain, Crown, TrendingUp, Target } from "lucide-react"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { PersonalModeToggle } from "@/components/personal-mode-toggle"

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
  is_new?: boolean     // New opportunity indicator from backend
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
  userData,
  hasCompletedAssessmentProp
}: HomeDashboardEliteProps) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true) // Track initial load separately
  const [timeframe, setTimeframe] = useState<string>('live') // Default: live data
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showGreeting, setShowGreeting] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop')

  // Opportunity filter toggles
  const [showCrownAssets, setShowCrownAssets] = useState(true)
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true)
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true)

  // Category filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

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

  // Theme context for checkbox styling
  const { theme } = useTheme()

  // Personal Mode state
  const [isPersonalMode, setIsPersonalMode] = useState(false)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(hasCompletedAssessmentProp || false)
  const [personalModeLoading, setPersonalModeLoading] = useState(false)
  const [showModeBanner, setShowModeBanner] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Close timeframe dropdown if clicking outside
      if (isDropdownOpen && !target.closest('.timeframe-dropdown')) {
        setIsDropdownOpen(false)
      }

      // Close category dropdown if clicking outside
      if (isCategoryDropdownOpen && !target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen, isCategoryDropdownOpen])

  // Screen size detection for mobile/desktop (matching HNWI World)
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Consider as mobile if:
      // 1. Width < 1024px (includes landscape mobile)
      // 2. OR it's a touch device with small height (landscape detection)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isLandscapeMobile = isTouchDevice && height < 500
      const isMobile = width < 1024 || isLandscapeMobile

      setScreenSize(isMobile ? 'mobile' : 'desktop')
      setIsDesktop(!isMobile)
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

    // Only set timer if we're on mobile (use screenSize state for consistency)
    if (screenSize === 'mobile') {
      timer = setTimeout(() => {
        setShowGreeting(false)
      }, 10000) // 10 seconds
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [screenSize]) // Re-run if screen size changes

  // Load Personal Mode preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('personal_mode_enabled')
    if (savedPreference === 'true') {
      setIsPersonalMode(true)
    }
  }, [])

  // Update hasCompletedAssessment when prop changes
  useEffect(() => {
    if (hasCompletedAssessmentProp !== undefined) {
      setHasCompletedAssessment(hasCompletedAssessmentProp)
    }
  }, [hasCompletedAssessmentProp])

  // Check if user has completed C10 Assessment
  useEffect(() => {
    const checkAssessmentCompletion = async () => {
      if (!user?.id && !user?.user_id) return

      try {
        const userId = user.id || user.user_id
        const response = await secureApi.get(`/api/assessment/history/${userId}`, true, {
          enableCache: true,
          cacheDuration: 300000 // 5 minutes cache
        })

        // Check if user has any completed assessments
        const hasCompleted = response?.assessments?.length > 0 ||
          response?.length > 0 ||
          false

        setHasCompletedAssessment(hasCompleted)
      } catch (error) {
        setHasCompletedAssessment(false)
      }
    }

    checkAssessmentCompletion()
  }, [user])

  // Handle citation click from map popup
  const handleCitationClick = useCallback((citationId: string) => {
    openCitation(citationId)
  }, [openCitation])

  // Handle Personal Mode toggle
  const handlePersonalModeToggle = () => {
    // Only toggle if assessment is completed
    // If not completed, PersonalModeToggle component handles navigation to /assessment
    if (!hasCompletedAssessment) return

    const newMode = !isPersonalMode
    setIsPersonalMode(newMode)

    // Save preference to localStorage
    localStorage.setItem('personal_mode_enabled', String(newMode))

    // Show mode banner
    setShowModeBanner(true)

    // Data refresh happens automatically via useEffect dependency on isPersonalMode
    // No need to setLoading(true) - P button shows loading state
  }

  // Auto-hide mode banner after 7 seconds
  useEffect(() => {
    if (showModeBanner) {
      const timer = setTimeout(() => {
        setShowModeBanner(false)
      }, 7000) // 7 seconds

      return () => clearTimeout(timer)
    }
  }, [showModeBanner])

  // Reset category filter when mode changes
  useEffect(() => {
    // Clear selected categories when switching modes to prevent stale filters
    setSelectedCategories([])

    // In Personal Mode, always show Crown Assets and Privé Opportunities
    if (isPersonalMode && hasCompletedAssessment) {
      setShowCrownAssets(true)
      setShowPriveOpportunities(true)
    }
  }, [isPersonalMode, hasCompletedAssessment])

  // Clean category names by removing status/completion indicators
  const cleanCategoryName = (category: string): string => {
    if (!category) return category

    // Remove content in brackets/parentheses and common suffixes/status words
    const cleanedCategory = category
      // Remove content in parentheses like (Build-ready)
      .replace(/\s*\([^)]*\)/g, '')
      // Remove content in square brackets like [Build-ready]
      .replace(/\s*\[[^\]]*\]/g, '')
      // Remove common suffixes with dashes
      .replace(/\s*-\s*(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
      // Remove common suffixes without dashes
      .replace(/\s+(completed|under construction|ongoing|in progress|pending|active|inactive|sold|available)/gi, '')
      .trim()

    return cleanedCategory
  }

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true)

      // Clear cities when view mode changes to prevent showing stale data
      setCities([])

      try {
        // SOTA: Service Worker handles caching with StaleWhileRevalidate
        // Build API URL following backend integration guide
        const timeframeParam = timeframe === 'live' ? 'LIVE' : timeframe
        const viewParam = (isPersonalMode && hasCompletedAssessment) ? 'personalized' : 'all'

        // FIX: Only request Crown Vault assets in personalized mode to prevent backend 500 errors
        // sending include_crown_vault=true with view=all causes internal server error
        const includeCrownVault = viewParam === 'personalized'

        let apiUrl = `/api/command-centre/opportunities?view=${viewParam}&timeframe=${timeframeParam}&include_crown_vault=${includeCrownVault}`

        // Call API with requireAuth=true, bustCache=false (enable caching)
        // Note: Service Worker handles caching automatically via HTTP headers
        const response = await secureApi.get(apiUrl, true, false)

        // Handle wrapped response structure from backend
        // Backend returns: { success: true, view: "personalized"|"all", opportunities: [...], metadata: {...} }
        const opportunities = response?.opportunities || (Array.isArray(response) ? response : [])

        if (opportunities && opportunities.length > 0) {
          // Extract categories that actually have opportunities (not empty categories)
          // Clean category names by removing status indicators
          const categoriesWithOpportunities = new Set<string>()
          opportunities.forEach((opp: Opportunity) => {
            if (opp.category) {
              const cleanedCategory = cleanCategoryName(opp.category)
              if (cleanedCategory) {
                categoriesWithOpportunities.add(cleanedCategory)
              }
            }
          })
          const filteredCategories = Array.from(categoriesWithOpportunities).sort()

          if (filteredCategories.length > 0) {
            setAvailableCategories(filteredCategories)
            // Initialize selectedCategories to all categories if empty
            if (selectedCategories.length === 0) {
              setSelectedCategories(filteredCategories)
            }
          }
        }

        if (opportunities && opportunities.length > 0) {
          // Transform opportunities to city format for the map
          const cityData: City[] = opportunities
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

              // Smart category override: Fix miscategorized opportunities
              // If backend marks automotive-branded real estate as "automotive", override to "Real Estate"
              let correctedCategory = opp.category ? cleanCategoryName(opp.category) : opp.category
              const titleLower = (opp.title || '').toLowerCase()
              const analysisLower = (opp.analysis || '').toLowerCase()
              const combined = titleLower + ' ' + analysisLower
              const categoryLower = (correctedCategory || '').toLowerCase()

              // Check if this is actually real estate (residential/building) despite being marked as automotive/vehicle
              if (categoryLower.includes('automotive') ||
                categoryLower.includes('vehicle') ||
                categoryLower === 'luxury vehicles' ||
                categoryLower === 'luxury vehicle') {
                const isRealEstate = combined.includes('residential') ||
                  combined.includes('building') ||
                  combined.includes('architecture') ||
                  combined.includes('apartment') ||
                  combined.includes('condo') ||
                  combined.includes('real estate') ||
                  combined.includes('property investment') ||
                  combined.includes('branded residence') ||
                  (titleLower.includes('investment') && (
                    combined.includes('miami') ||
                    combined.includes('tower') ||
                    combined.includes('residence')
                  ))

                if (isRealEstate) {
                  correctedCategory = 'Real Estate'
                }
              }

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
                // Category/Industry/Product from backend (with smart override)
                category: correctedCategory,
                industry: opp.industry,
                product: opp.product,
                start_date: opp.start_date,
                // Use backend's is_new flag (no frontend date calculation)
                is_new: opp.is_new,
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
        }
      } catch (error: any) {
        // Let secureApi handle auth errors automatically
      } finally {
        setLoading(false)
        setInitialLoad(false) // Mark initial load as complete
      }
    }

    fetchOpportunities()
  }, [timeframe, isPersonalMode, hasCompletedAssessment]) // Re-fetch when timeframe or personalization changes

  // Only show full-screen loader on initial load, not on subsequent data fetches
  if (initialLoad && loading) {
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

  // Filter cities based on opportunity type toggles and selected categories
  const filteredCities = cities.filter(city => {
    // First, filter by category if any categories are selected
    if (selectedCategories.length > 0 && city.category) {
      if (!selectedCategories.includes(city.category)) {
        return false
      }
    }

    // Crown Assets: ONLY from actual Crown Vault source (user's personal assets)
    // Must explicitly be from "Crown Vault" source, not just mention "asset" in category
    const isCrownAsset = city.source?.toLowerCase().includes('crown vault') ||
      city.source?.toLowerCase() === 'crown vault'

    // Privé Opportunities: Victor-scored opportunities from Privé Exchange
    const isPriveOpportunity = city.victor_score !== undefined ||
      city.source?.toLowerCase().includes('privé') ||
      city.source?.toLowerCase().includes('prive')

    // HNWI Pattern Opportunities: MOEv4 market intelligence, Live HNWI Data, and other patterns
    // This is the default category for everything that's not Crown Vault or Privé
    const isHNWIPattern = city.source === 'MOEv4' ||
      city.source?.toLowerCase().includes('live hnwi data') ||
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
      <div
        className={`fixed inset-0 overflow-hidden transition-all duration-500 ${isPersonalMode && hasCompletedAssessment
            ? 'personal-mode-active'
            : ''
          }`}
        style={{ marginTop: '40px' }}
      >
        {/* Personal Mode Visual Effect - Animated Border */}
        {isPersonalMode && hasCompletedAssessment && (
          <>
            <div className="personal-mode-border-top" />
            <div className="personal-mode-border-right" />
            <div className="personal-mode-border-bottom" />
            <div className="personal-mode-border-left" />
          </>
        )}

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
          <div className={`flex gap-2 items-center flex-wrap ${(showGreeting || isDesktop) ? 'ml-6 md:ml-7' : 'ml-0'}`}>
            {/* Timeframe Dropdown */}
            <div className="relative inline-block pointer-events-auto timeframe-dropdown">
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
                        // Data refresh happens automatically via useEffect dependency on timeframe
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-primary hover:text-white transition-colors ${timeframe === option.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                        } ${option.bold ? 'font-bold' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Multi-Select Dropdown */}
            {availableCategories.length > 0 && (
              <div className="relative inline-block pointer-events-auto category-dropdown">
                {/* Custom Dropdown Button */}
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="py-1.5 px-3 pr-8 text-xs bg-secondary text-foreground rounded hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border flex items-center gap-2"
                >
                  <span>
                    Categories ({selectedCategories.length}/{availableCategories.length})
                  </span>
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2">▼</span>
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-background/95 backdrop-blur-sm border border-border rounded shadow-lg z-[501] min-w-[200px] max-h-[400px] overflow-y-auto">
                    {/* Select All / Deselect All */}
                    <div className="px-3 py-2 border-b border-border/50 bg-muted/30">
                      <button
                        onClick={() => {
                          if (selectedCategories.length === availableCategories.length) {
                            setSelectedCategories([])
                          } else {
                            setSelectedCategories([...availableCategories])
                          }
                        }}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {selectedCategories.length === availableCategories.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Category Options */}
                    {availableCategories.map(category => {
                      const isSelected = selectedCategories.includes(category)
                      return (
                        <label
                          key={category}
                          className={`flex items-center gap-2.5 px-3 py-2.5 text-xs cursor-pointer transition-colors border-b border-border/30 last:border-b-0 ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                            }`}
                        >
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, category])
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category))
                                }
                              }}
                              className="w-4 h-4 rounded border-2 border-border/50 checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 cursor-pointer accent-primary"
                              style={{
                                colorScheme: theme === 'dark' ? 'dark' : 'light'
                              }}
                            />
                          </div>
                          <span className={`flex-1 font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {category}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Personal Mode Power Toggle */}
            <div className="pointer-events-auto">
              <PersonalModeToggle
                isPersonalMode={isPersonalMode}
                onToggle={handlePersonalModeToggle}
                hasCompletedAssessment={hasCompletedAssessment}
                isLoading={loading}
              />
            </div>
          </div>

        </div>

        {/* Mode Banner - Top Center (Auto-dismisses after 7 seconds) */}
        {showModeBanner && hasCompletedAssessment && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400] pointer-events-none">
            {isPersonalMode ? (
              // Personal Mode Banner - Blue
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl border-2 border-blue-400/50 animate-pulse-slow">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Target className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  </div>
                  <div className="text-sm font-bold tracking-wide">
                    PERSONAL MODE ACTIVATED
                  </div>
                  <div className="h-4 w-px bg-white/30" />
                  <div className="text-xs font-medium">
                    {filteredCities.length} DNA-Matched Opportunities
                  </div>
                </div>
              </div>
            ) : (
              // All Mode Banner - Gold
              <div className="bg-gradient-to-r from-[#DAA520] via-[#FFD700] to-[#DAA520] backdrop-blur-sm text-zinc-900 px-6 py-3 rounded-full shadow-2xl border-2 border-[#DAA520]/50 animate-pulse-slow">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold tracking-wide">
                    ALL MODE
                  </div>
                  <div className="h-4 w-px bg-zinc-900/30" />
                  <div className="text-xs font-medium">
                    {filteredCities.length} Total Opportunities
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Mode Styles */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Personal Mode Animated Borders */
        .personal-mode-border-top,
        .personal-mode-border-right,
        .personal-mode-border-bottom,
        .personal-mode-border-left {
          position: absolute;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(218, 165, 32, 0.6),
            transparent
          );
          z-index: 500;
          pointer-events: none;
        }

        .personal-mode-border-top {
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          animation: borderSlideHorizontal 3s ease-in-out infinite;
        }

        .personal-mode-border-bottom {
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          animation: borderSlideHorizontal 3s ease-in-out infinite reverse;
        }

        .personal-mode-border-left {
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(218, 165, 32, 0.6),
            transparent
          );
          animation: borderSlideVertical 3s ease-in-out infinite;
        }

        .personal-mode-border-right {
          right: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(218, 165, 32, 0.6),
            transparent
          );
          animation: borderSlideVertical 3s ease-in-out infinite reverse;
        }

        @keyframes borderSlideHorizontal {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes borderSlideVertical {
          0%, 100% {
            background-position: 50% 0%;
          }
          50% {
            background-position: 50% 100%;
          }
        }

        /* Subtle background glow for personal mode */
        .personal-mode-active {
          background: radial-gradient(
            ellipse at top,
            rgba(218, 165, 32, 0.05),
            transparent 50%
          );
        }
      `}</style>

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
