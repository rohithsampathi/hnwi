// components/home-dashboard-elite.tsx
// Interactive World Map Dashboard

"use client"

import React, { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import type { HomeDashboardEliteProps } from "@/types/dashboard"
import { CrownLoader } from "@/components/ui/crown-loader"
import { secureApi } from "@/lib/secure-api"
import type { City } from "@/components/interactive-world-map"
import type { Citation } from "@/lib/parse-dev-citations"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { Brain, Crown, TrendingUp, Target } from "lucide-react"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { PersonalModeToggle } from "@/components/personal-mode-toggle"
import { useOpportunities } from "@/lib/hooks/useOpportunities"

// Dynamically import the map component with SSR disabled
const InteractiveWorldMap = dynamic(
  () => import("@/components/interactive-world-map").then(mod => mod.InteractiveWorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <CrownLoader size="lg" text="Loading Elite Pulse" />
        </div>
      </div>
    )
  }
)

export function HomeDashboardElite({
  user,
  onNavigate,
  userData,
  hasCompletedAssessmentProp
}: HomeDashboardEliteProps) {
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
  const [showModeBanner, setShowModeBanner] = useState(false)

  // Fetch opportunities using centralized hook (dashboard mode)
  const {
    cities,
    loading,
    availableCategories,
    refetch
  } = useOpportunities({
    isPublic: false, // Use authenticated endpoint for dashboard
    timeframe,
    isPersonalMode,
    hasCompletedAssessment,
    includeCrownVault: isPersonalMode && hasCompletedAssessment,
    cleanCategories: true // Clean category names for better UI
  })

  // Track initial load separately for full-screen loader
  const [initialLoad, setInitialLoad] = useState(true)

  // Mark initial load as complete when loading finishes
  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false)
    }
  }, [loading, initialLoad])

  // Initialize selected categories when available categories change
  useEffect(() => {
    if (availableCategories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(availableCategories)
    }
  }, [availableCategories])

  // Extract citations from cities when they change
  useEffect(() => {
    const allCitations: Citation[] = []
    const seenIds = new Set<string>()
    let citationNumber = 1

    cities.forEach(city => {
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
  }, [cities, setManagedCitations])

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

    // In Personal Mode, always show all opportunity types (Crown Assets, Privé, and HNWI Patterns)
    // HNWI Patterns include assessment-matched opportunities
    if (isPersonalMode && hasCompletedAssessment) {
      setShowCrownAssets(true)
      setShowPriveOpportunities(true)
      setShowHNWIPatterns(true) // CRITICAL: Include assessment-matched opportunities
    }
  }, [isPersonalMode, hasCompletedAssessment])

  // Only show full-screen loader on initial load, not on subsequent data fetches
  if (initialLoad && loading) {
    return (
      <div className="w-full h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <CrownLoader size="lg" text="Loading Elite Pulse" />
        </div>
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

        {/* Greeting Overlay - Positioned with more breathing room from top */}
        <div className="absolute top-20 md:top-24 left-4 md:left-[80px] z-[400] px-0 sm:px-2 lg:px-4 pointer-events-none">
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
                className={`relative py-1.5 text-xs bg-secondary text-foreground rounded hover:bg-primary hover:text-white transition-colors cursor-pointer border border-border flex items-center ${timeframe === 'live' ? 'pl-3 pr-8 font-bold' : 'pl-3 pr-8'}`}
              >
                {/* Blinking dot - only visible when Live Data is selected - positioned before text */}
                {timeframe === 'live' && (
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
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
