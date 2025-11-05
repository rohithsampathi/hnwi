// components/market-intelligence-dashboard.tsx

"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Fuse from "fuse.js"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getMetallicCardStyle } from "@/lib/colors"
import { secureApi } from "@/lib/secure-api"
import { DevelopmentStream } from "@/components/development-stream"
import { GoldenScroll } from "@/components/ui/golden-scroll"
import { useCitationManager } from "@/hooks/use-citation-manager"
import { usePageDataCache } from "@/contexts/page-data-cache-context"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Coins,
  Bitcoin,
  CreditCard,
  PiggyBank,
  Store,
  Filter,
  Clock,
  Palette,
  Smartphone,
  Plane,
  Gem,
  ShoppingBag,
  MapPin,
  Banknote,
  Stethoscope,
  Factory,
  Cpu,
  Car,
  Zap,
  Truck,
  ShieldCheck,
  Search,
  X
} from "lucide-react"
import { EliteCitationPanel } from "@/components/elite/elite-citation-panel"
import { extractDevIds } from "@/lib/parse-dev-citations"
import type { Citation } from "@/lib/parse-dev-citations"

interface IndustryTrend {
  industry: string
  total_count: number
  trend?: 'up' | 'down' | 'stable'
  change_percentage?: number
}

interface Development {
  id: string
  title: string
  description: string
  industry: string
  date: string
  summary: string
  product?: string
  numerical_data?: Array<{
    number: string
    unit: string
    context: string
    source?: string
  }>
}

// Time range options - matching the original format
const timeRanges = [
  { value: '1d', label: '1D' },
  { value: '3d', label: '3D' },
  { value: '7d', label: '7D' },
  { value: '14d', label: '14D' },
  { value: '21d', label: '21D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' }
]

// Client-side date filtering helper (same as development-stream.tsx)
const applyClientSideDateFilter = (items: any[], timeRange: string): any[] => {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeRange) {
    case '1d':
      cutoffDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
      break;
    case '3d':
      cutoffDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '14d':
      cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    case '21d':
      cutoffDate = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3m':
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6m':
      cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    default:
      return items;
  }
  
  const filtered = items.filter((item: any) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
  
  return filtered;
};

// Icon mapping for industries
const getIndustryIcon = (industry: string) => {
  const industryLower = industry.toLowerCase()
  if (industryLower.includes('real estate') || industryLower.includes('property')) return Building2
  if (industryLower.includes('collectibles') || industryLower.includes('collectible')) return Gem
  if (industryLower.includes('lifestyle') || industryLower.includes('luxury goods')) return ShoppingBag
  if (industryLower.includes('tourism') || industryLower.includes('travel') || industryLower.includes('hospitality')) return MapPin
  if (industryLower.includes('financial services') || industryLower.includes('wealth management')) return Banknote
  if (industryLower.includes('healthcare') || industryLower.includes('medical') || industryLower.includes('pharma')) return Stethoscope
  if (industryLower.includes('manufacturing') || industryLower.includes('industrial')) return Factory
  if (industryLower.includes('fintech') || industryLower.includes('financial technology')) return Smartphone
  if (industryLower.includes('art') || industryLower.includes('auction') || industryLower.includes('fine art')) return Palette
  if (industryLower.includes('aviation') || industryLower.includes('aerospace') || industryLower.includes('airline')) return Plane
  if (industryLower.includes('technology') || industryLower.includes('tech') || industryLower.includes('software')) return Cpu
  if (industryLower.includes('automotive') || industryLower.includes('vehicle')) return Car
  if (industryLower.includes('energy') || industryLower.includes('renewable') || industryLower.includes('power')) return Zap
  if (industryLower.includes('logistics') || industryLower.includes('shipping') || industryLower.includes('transport')) return Truck
  if (industryLower.includes('insurance') || industryLower.includes('risk management')) return ShieldCheck
  if (industryLower.includes('finance') || industryLower.includes('banking')) return CreditCard
  if (industryLower.includes('crypto') || industryLower.includes('blockchain')) return Bitcoin
  if (industryLower.includes('metal') || industryLower.includes('commodity')) return Coins
  if (industryLower.includes('equity') || industryLower.includes('investment')) return PiggyBank
  return Store
}

// Intelligent Activity Assessment - Market momentum over volume
const getActivityLevel = (count: number, totalDevelopments: number, industry: string): 'low' | 'medium' | 'high' => {
  // Base volume ratio relative to total developments across all industries
  const volumeRatio = count / totalDevelopments
  
  // Strategic sector multipliers (sectors with higher barrier to entry get weighted importance)
  const strategicWeight = getStrategicWeight(industry)
  
  // Adjusted score: volume × strategic importance
  const intelligenceScore = volumeRatio * strategicWeight
  
  // Smart thresholds - relative to total market activity
  if (intelligenceScore >= 0.15) return 'high'    // Significant market presence (15%+ of total activity)
  if (intelligenceScore >= 0.05) return 'medium'  // Notable activity (5%+ of total activity)
  return 'low'                                     // Background noise (<5% of total activity)
}

// Strategic sector importance (barrier to entry + capital intensity)
const getStrategicWeight = (industry: string): number => {
  const industryLower = industry.toLowerCase()
  
  // High-barrier sectors: More developments = bigger signal
  if (industryLower.includes('real estate') || industryLower.includes('property')) return 1.4
  if (industryLower.includes('finance') || industryLower.includes('banking')) return 1.3  
  if (industryLower.includes('crypto') || industryLower.includes('blockchain')) return 1.2
  if (industryLower.includes('energy') || industryLower.includes('infrastructure')) return 1.3
  
  // Medium-barrier sectors: Standard weighting  
  if (industryLower.includes('healthcare') || industryLower.includes('biotech')) return 1.1
  if (industryLower.includes('technology') || industryLower.includes('software')) return 1.0
  if (industryLower.includes('manufacturing') || industryLower.includes('industrial')) return 1.0
  
  // Low-barrier sectors: Developments less significant
  if (industryLower.includes('retail') || industryLower.includes('consumer')) return 0.8
  if (industryLower.includes('media') || industryLower.includes('entertainment')) return 0.9
  
  return 1.0 // Default weight
}

// Leaderboard position styling - only show badges for top 5
const getLeaderboardStyling = (position: number) => {
  switch (position) {
    case 1:
      return {
        badge: '🥇',
        showBadge: true,
        glow: 'shadow-lg shadow-yellow-500/30',
        borderColor: 'border-yellow-500/50',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-500'
      }
    case 2:
      return {
        badge: '🥈',
        showBadge: true,
        glow: 'shadow-md shadow-gray-400/20',
        borderColor: 'border-gray-400/50',
        iconBg: 'bg-gray-400/20',
        iconColor: 'text-gray-400'
      }
    case 3:
      return {
        badge: '🥉',
        showBadge: true,
        glow: 'shadow-md shadow-orange-500/20',
        borderColor: 'border-orange-500/50',
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-500'
      }
    case 4:
      return {
        badge: '🏅',
        showBadge: true,
        glow: 'shadow-sm shadow-blue-400/20',
        borderColor: 'border-blue-400/50',
        iconBg: 'bg-blue-400/20',
        iconColor: 'text-blue-400'
      }
    case 5:
      return {
        badge: '🏅',
        showBadge: true,
        glow: 'shadow-sm shadow-green-400/20',
        borderColor: 'border-green-400/50',
        iconBg: 'bg-green-400/20',
        iconColor: 'text-green-400'
      }
    default:
      return {
        badge: '',
        showBadge: false,
        glow: '',
        borderColor: 'border-border',
        iconBg: 'bg-gray-500/20',
        iconColor: 'text-gray-500'
      }
  }
}


interface MarketIntelligenceDashboardProps {
  onNavigate?: (route: string) => void
}

export function MarketIntelligenceDashboard({ onNavigate }: MarketIntelligenceDashboardProps) {

  const { theme } = useTheme()
  const { toast } = useToast()
  const { getCachedData, setCachedData, isCacheValid } = usePageDataCache()

  // Check for cached data with default timeframe (no industry filter in cache key)
  const cacheKey = 'hnwi-world-7d' // Default cache key
  const cachedData = getCachedData(cacheKey)
  const hasValidCache = isCacheValid(cacheKey)

  // State management - Unified data approach - Initialize with cached data if available
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d') // Default to 7 days
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [allDevelopments, setAllDevelopments] = useState<any[]>(cachedData?.developments || []) // ALL developments (no industry filter)
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>(cachedData?.industryTrends || [])
  const [isLoading, setIsLoading] = useState(!hasValidCache)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(cachedData?.lastUpdated || null)
  const [totalDevelopments, setTotalDevelopments] = useState(cachedData?.totalDevelopments || 0)

  // Citation state managed via shared hook
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
  
  // Mobile improvements state
  const [screenSize, setScreenSize] = useState<'mobile' | 'desktop'>('desktop')
  const [showStickySectors, setShowStickySectors] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  const sectorsRef = useRef<HTMLDivElement>(null)
  const insiderBriefsRef = useRef<HTMLDivElement>(null)

  // Handle citation click from development cards
  const handleCitationClick = useCallback((citationId: string) => {
    openCitation(citationId)
  }, [openCitation])

  // Handle citation selection from panel
  const handleCitationSelect = useCallback((citationId: string) => {
    setSelectedCitationId(citationId)
  }, [])

  // Client-side filter developments by selected industry (instant - no API call)
  const developments = useMemo(() => {
    if (selectedIndustry === 'All') {
      return allDevelopments
    }
    return allDevelopments.filter(dev => dev.industry === selectedIndustry)
  }, [allDevelopments, selectedIndustry])

  // Handle development expansion and extract citations
  const handleDevelopmentExpanded = useCallback((devId: string, isExpanded: boolean) => {
    if (isExpanded) {
      const dev = allDevelopments.find((d) => d.id === devId)
      if (dev?.summary) {
        const devIds = extractDevIds(dev.summary)
        if (devIds.length > 0) {
          const uniqueIds = Array.from(new Set(devIds))
          const newCitations: Citation[] = uniqueIds.map((id, index) => ({
            id,
            number: index + 1,
            originalText: `[Dev ID: ${id}]`
          }))

          setManagedCitations(newCitations)

          if (newCitations.length > 0) {
            setSelectedCitationId((current) => (current && uniqueIds.includes(current) ? current : newCitations[0].id))
          } else {
            setSelectedCitationId(null)
          }
          return
        }
      }

      setManagedCitations([])
      setSelectedCitationId(null)
    } else {
      setManagedCitations([])
      setSelectedCitationId(null)
      closePanel()
    }
  }, [allDevelopments, setManagedCitations, setSelectedCitationId, closePanel])
  
  // Screen size detection for mobile/desktop check
  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])
  
  // Sticky sectors effect for mobile - show when scrolling past activity leaderboard section
  useEffect(() => {
    if (screenSize !== 'mobile') return;
    
    // Ensure DOM is fully rendered before setting up observer
    const setupObserver = () => {
      const sectorsElement = sectorsRef.current;
      const rect = sectorsElement?.getBoundingClientRect();
      
      if (!sectorsElement || rect?.height === 0) {
        setTimeout(setupObserver, 100);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Show sticky when activity leaderboard section is NOT intersecting (user has scrolled past it)
          setShowStickySectors(!entry.isIntersecting);
        },
        {
          threshold: [0, 0.1, 1],
          rootMargin: '0px'
        }
      );

      observer.observe(sectorsElement);
      
      return observer;
    };

    const observer = setupObserver();

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [screenSize]);
  
  // Unified data fetching - single API call for both components - Mobile Safe
  // IMPORTANT: Only fetches when timeRange changes, NOT when industry changes (client-side filter)
  const fetchDevelopments = useCallback(async (forceRefresh = false) => {

    try {
      // Create cache key based ONLY on timeRange (not industry - we filter client-side)
      const dynamicCacheKey = `hnwi-world-${selectedTimeRange}`

      // Check if we have valid cached data (skip API call entirely)
      if (!forceRefresh) {
        const cached = getCachedData(dynamicCacheKey)
        const cacheIsValid = cached && (Date.now() - cached.timestamp < (cached.ttl || 300000))

        // If cache is valid, skip API calls entirely
        if (cacheIsValid && cached.developments?.length >= 0) {
          setAllDevelopments(cached.developments)
          setIndustryTrends(cached.industryTrends || [])
          setTotalDevelopments(cached.totalDevelopments || 0)
          setLastUpdated(cached.lastUpdated || null)
          setIsLoading(false)
          return
        }
      }

      // Prevent multiple simultaneous requests - but allow initial load
      if (isLoading && !forceRefresh && allDevelopments.length > 0) {
        return;
      }

      setIsLoading(true);
      setIsRefreshing(forceRefresh);

      // Convert timeframe for the new endpoint - Fixed 1m/3m handling
      let timeframe = selectedTimeRange;

      // Map UI values to API values
      switch (selectedTimeRange) {
        case '1m':
          timeframe = '1m';
          break;
        case '3m':
          timeframe = '3m';
          break;
        case '30d':
          timeframe = '1m';
          break;
        case '90d':
          timeframe = '3m';
          break;
        case '6m':
          timeframe = '6m';
          break;
        default:
          timeframe = selectedTimeRange;
      }

      // Create query parameters for GET request - NO industry filter (fetch all)
      const params = new URLSearchParams({
        timeframe: timeframe.toUpperCase()
      });

      // Create stable cache key (no industry in key)
      const cacheKey = `developments:${selectedTimeRange}:all:page-1:size-100`;

      // Use direct backend API call like Crown Vault and Home Dashboard
      const endpoint = `/api/developments?${params.toString()}`;

      // Use secureApi.get with authentication - direct backend call (mobile optimized)
      const data = await secureApi.get(endpoint, true, {
        enableCache: true,
        cacheDuration: 300000 // 5 minutes cache
      });

      if (data.developments && Array.isArray(data.developments)) {

        // Store ALL developments (no industry filter)
        setAllDevelopments(data.developments);
        setTotalDevelopments(data.total_count || data.developments.length);

        // Use the rich category data from the new endpoint
        let processedTrends: IndustryTrend[] = []
        if (data.categories && data.categories.industries_with_counts) {
          // Convert to the format expected by the UI
          processedTrends = data.categories.industries_with_counts.map((item: any) => ({
            industry: item.name,
            total_count: item.count
          }));

          setIndustryTrends(processedTrends);
        } else {
          // Fallback to manual processing if categories not available
          const industriesMap = new Map<string, number>();

          data.developments.forEach((dev: any) => {
            if (dev && dev.industry) {
              const industry = dev.industry.trim();
              const count = industriesMap.get(industry) || 0;
              industriesMap.set(industry, count + 1);
            }
          });

          processedTrends = Array.from(industriesMap.entries())
            .map(([industry, total_count]) => ({
              industry: industry.trim(),
              total_count
            }))
            .filter(item => item.total_count > 0)
            .sort((a, b) => b.total_count - a.total_count);

          setIndustryTrends(processedTrends);
        }

        const updatedDate = new Date()
        setLastUpdated(updatedDate);

        // Cache the data (5-minute TTL) with timestamp (no industry in cache key)
        const dynamicCacheKey = `hnwi-world-${selectedTimeRange}`
        setCachedData(dynamicCacheKey, {
          developments: data.developments,
          industryTrends: processedTrends,
          totalDevelopments: data.total_count || data.developments.length,
          lastUpdated: updatedDate,
          timestamp: Date.now(),
          ttl: 300000
        }, 300000);
      } else {
        // No data found - don't show error, just empty state
        setAllDevelopments([]);
        setIndustryTrends([]);
        setTotalDevelopments(0);
      }

    } catch (error) {
      // Only show toast error if it's not a timeout/abort
      if (error.name !== 'AbortError' && error.name !== 'TimeoutError') {
        toast({
          title: "Loading Error",
          description: "Unable to load data. Using cached version.",
          variant: "destructive",
          duration: 3000,
        });
      }

      // Don't reset data on error - keep previous state for better UX
      // setAllDevelopments([])
      // setIndustryTrends([])
      // setTotalDevelopments(0)
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [selectedTimeRange, getCachedData, setCachedData, toast])

  // Initial load and when duration changes ONLY - NOT when industry changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDevelopments();
    }, 100); // Small debounce to prevent rapid firing

    return () => clearTimeout(timeoutId);
  }, [selectedTimeRange, fetchDevelopments])

  // Handle scroll to Insider Brief section from home dashboard
  useEffect(() => {
    const shouldScrollToInsiderBrief = sessionStorage.getItem("scrollToInsiderBrief")
    if (shouldScrollToInsiderBrief === "true" && insiderBriefsRef.current) {
      // Clear the flag
      sessionStorage.removeItem("scrollToInsiderBrief")
      
      // Scroll to the Insider Brief section with smooth behavior
      setTimeout(() => {
        insiderBriefsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        })
      }, 500) // Wait for page to load before scrolling
    }
  }, [developments]) // Trigger after developments are loaded
  
  // Get industry color (simple implementation)
  const getIndustryColor = useCallback((industry: string) => {
    // Simple hash-based color generation
    let hash = 0
    for (let i = 0; i < industry.length; i++) {
      hash = industry.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 60%)`
  }, [])
  
  // Get industry options for dropdown
  const industryOptions = [
    { value: 'All', label: 'All Industries' },
    ...industryTrends.map(trend => ({
      value: trend.industry,
      label: trend.industry
    }))
  ]

  // Filter developments based on search query with fuzzy search
  const filteredDevelopments = useMemo(() => {
    if (!searchQuery.trim()) return developments

    const query = searchQuery.trim().toLowerCase()

    // Smart prioritized search: title matches get highest priority
    const titleMatches = developments.filter(dev =>
      dev.title?.toLowerCase().includes(query)
    )

    // If we have title matches, those are likely the most relevant
    if (titleMatches.length > 0) {
      return titleMatches
    }

    // Next, try description matches (more focused than summary)
    const descriptionMatches = developments.filter(dev =>
      dev.description?.toLowerCase().includes(query)
    )

    if (descriptionMatches.length > 0) {
      return descriptionMatches
    }

    // For product field, use exact match
    const productMatches = developments.filter(dev =>
      dev.product?.toLowerCase().includes(query)
    )

    if (productMatches.length > 0) {
      return productMatches
    }

    // Finally, check summary but be cautious - summaries often mention other cities for comparison
    // Only return summary matches if the query appears multiple times or near the beginning
    const summaryMatches = developments.filter(dev => {
      const summary = dev.summary?.toLowerCase() || ''
      if (!summary.includes(query)) return false

      // Check if query appears in first 200 characters (likely the main subject)
      const firstPart = summary.substring(0, 200)
      return firstPart.includes(query)
    })

    if (summaryMatches.length > 0) {
      return summaryMatches
    }

    // If no exact matches found, fall back to fuzzy search for typos
    const fuse = new Fuse(developments, {
      keys: [
        { name: 'title', weight: 3.0 },        // Highest priority
        { name: 'description', weight: 1.5 },  // Medium priority
        { name: 'product', weight: 1.0 }       // Lower priority (skip summary to avoid false positives)
      ],
      threshold: 0.4,           // Balanced: allows some fuzziness
      distance: 100,            // Reasonable character distance
      minMatchCharLength: 2,    // Match shorter terms
      ignoreLocation: false,    // Prefer matches at beginning
      useExtendedSearch: false, // Better performance
      includeScore: true,       // Include match scores
      findAllMatches: false     // Performance optimization
    })

    const results = fuse.search(query)

    // Return matched items sorted by relevance
    return results.map(result => result.item)
  }, [developments, searchQuery])

  // Loading state - show single crown loader only for main data
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Single Center Crown Loader */}
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <CrownLoader size="lg" text="Loading HNWI World Intelligence..." />
        </div>
      </div>
    )
  }

  // Calculate max count for activity levels and sort for leaderboard
  const maxCount = Math.max(...industryTrends.map(t => t.total_count), 1)
  const sortedTrends = [...industryTrends].sort((a, b) => b.total_count - a.total_count)
  
  // Mobile layout logic
  if (screenSize === 'mobile') {
    return (
      <div className="w-full">
        {/* Mobile Sectors Section */}
        <div ref={sectorsRef} className="mb-6 mt-4">
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Activity Leaderboard
              </h3>
              
              {/* Embedded Time Range Filter - Mobile Safe */}
              <Select 
                value={selectedTimeRange} 
                onValueChange={(value) => {
                  try {
                    // Prevent rapid changes during loading or if same value
                    if (isLoading || value === selectedTimeRange) {
                      return;
                    }
                    setSelectedTimeRange(value);
                  } catch (error) {
                    toast({
                      title: "Filter Error",
                      description: "Please try again",
                      variant: "destructive",
                      duration: 2000,
                    });
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={`w-[120px] ${isLoading ? 'opacity-50' : ''}`}>
                  {isLoading ? (
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
                  ) : (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent 
                  className="z-[60]" 
                  side="bottom" 
                  align="end" 
                  sideOffset={4}
                  avoidCollisions={true}
                  position="popper"
                >
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              {industryTrends.length} sectors • {totalDevelopments} total developments
            </p>
          </div>
          
          {/* Mobile Sectors Grid - 3 blocks then scroll */}
          <div className="h-[300px] overflow-y-auto">
            <div className="space-y-3 px-1">
              {sortedTrends.map((trend, index) => {
                const position = index + 1
                const IconComponent = getIndustryIcon(trend.industry)
                const activityLevel = getActivityLevel(trend.total_count, totalDevelopments, trend.industry)
                const isSelected = selectedIndustry === trend.industry
                const leaderboardStyle = getLeaderboardStyling(position)
                const progressPercentage = (trend.total_count / maxCount) * 100
                
                // Mono gold system - activity intensity only
                const baseColor = theme === 'dark' ? '#FFD700' : '#DAA520' // Brighter Gold
                const activityColor = activityLevel === 'high' 
                  ? baseColor 
                  : activityLevel === 'medium'
                  ? baseColor + '80' // 50% opacity
                  : baseColor + '40' // 25% opacity
                
                return (
                  <div key={trend.industry}>
                    {/* Mobile Sector Card */}
                    {isSelected ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5 relative"
                        style={{
                          ...getMetallicCardStyle(theme).style,
                          outline: `1px solid ${theme === "dark" ? "#FFD700" : "#DAA520"}`,
                          outlineOffset: '2px'
                        }}
                        onClick={() => setSelectedIndustry("All")}
                      >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {leaderboardStyle.showBadge && (
                                <span className="text-lg font-bold">
                                  {leaderboardStyle.badge}
                                </span>
                              )}
                              <div 
                                className="p-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `${activityColor}20`, color: activityColor }}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${
                                theme === 'dark' ? 'text-white' : 'text-black'
                              }`}>
                                {trend.industry}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {trend.total_count} developments
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar and Stats */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Activity Level</span>
                              <span className="font-medium">{activityLevel.toUpperCase()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: activityColor
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5"
                        style={getMetallicCardStyle(theme).style}
                        onClick={() => setSelectedIndustry(trend.industry)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            {leaderboardStyle.showBadge && (
                              <span className="text-lg font-bold">
                                {leaderboardStyle.badge}
                              </span>
                            )}
                            <div 
                              className="p-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${activityColor}20`, color: activityColor }}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>
                              {trend.industry}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {trend.total_count} developments
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar and Stats */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Activity Level</span>
                            <span className="font-medium">{activityLevel.toUpperCase()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${progressPercentage}%`,
                                backgroundColor: activityColor
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Mobile Insider Briefs Section - Continuous Scroll */}
        <div ref={insiderBriefsRef} className="mb-6">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`}>
                {selectedIndustry === 'All' ? 'All Insider Briefs' : `${selectedIndustry} Insider Brief`}
              </h3>

              {/* Embedded Industry Filter */}
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent className="z-50" side="bottom" align="end" sideOffset={4}>
                  {industryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Box */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search developments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedIndustry !== 'All' && (
                <>
                  <button
                    onClick={() => setSelectedIndustry('All')}
                    className="text-primary hover:underline mr-2"
                  >
                    Show All Industries
                  </button>
                  •{' '}
                </>
              )}
              {searchQuery ? (
                <>
                  {filteredDevelopments.length} results found •{' '}
                </>
              ) : null}
              Development stream • {selectedTimeRange} timeframe
            </p>
          </div>
          
          {/* Insider briefs - no internal scroll on mobile */}
          <div>
            <DevelopmentStream
              selectedIndustry={selectedIndustry}
              duration={selectedTimeRange}
              getIndustryColor={getIndustryColor}
              expandedDevelopmentId={null}
              parentLoading={isLoading}
              onLoadingChange={(loading) => {
                // No longer needed since parent handles loading
              }}
              developments={filteredDevelopments}
              isLoading={isLoading}
              onCitationClick={handleCitationClick}
              onDevelopmentExpanded={handleDevelopmentExpanded}
            />
          </div>
        </div>
        
        {/* Sticky Sectors Header */}
        <AnimatePresence>
          {showStickySectors && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[56px] left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3"
            >
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {/* All Sectors Sticky Button */}
                <Button
                  variant={selectedIndustry === 'All' ? "default" : "outline"}
                  size="sm"
                  className="flex-shrink-0 text-xs px-3 py-1.5 h-auto"
                  onClick={() => setSelectedIndustry('All')}
                >
                  <Store className="w-3 h-3 mr-1" />
                  All ({totalDevelopments})
                </Button>

                {/* Sector Sticky Buttons */}
                {sortedTrends.slice(0, 8).map((trend) => {
                  const IconComponent = getIndustryIcon(trend.industry)
                  const isSelected = selectedIndustry === trend.industry
                  
                  return (
                    <Button
                      key={trend.industry}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0 text-xs px-3 py-1.5 h-auto"
                      onClick={() => setSelectedIndustry(trend.industry)}
                    >
                      <IconComponent className="w-3 h-3 mr-1" style={{ color: isSelected ? 'inherit' : '#DAA520' }} />
                      {trend.industry} ({trend.total_count})
                    </Button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Citation Panel */}
        {isPanelOpen && screenSize === 'mobile' && (
          <AnimatePresence>
            <EliteCitationPanel
              citations={managedCitations}
              selectedCitationId={selectedCitationId}
              onClose={() => {
                closePanel()
              }}
              onCitationSelect={handleCitationSelect}
            />
          </AnimatePresence>
        )}
      </div>
    )
  }
  
  // Desktop layout (existing)
  return (
    <div className="w-full">
      {/* Main Dashboard Content - Flex Layout for proper 3-column */}
      <div className="flex flex-col lg:flex-row gap-8 mt-4">
        {/* Left Column - Activity Leaderboard */}
        <div className={`w-full ${isPanelOpen ? 'lg:w-[30%]' : 'lg:w-[40%]'} h-full flex-shrink-0 transition-all duration-300`}>
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Activity Leaderboard
                </h3>
                
                {/* Embedded Time Range Filter - Desktop Safe */}
                <Select 
                  value={selectedTimeRange} 
                  onValueChange={(value) => {
                    try {
                      // Prevent rapid changes during loading or if same value
                      if (isLoading || value === selectedTimeRange) {
                        return;
                      }
                      setSelectedTimeRange(value);
                    } catch (error) {
                      toast({
                        title: "Filter Error",
                        description: "Please try again",
                        variant: "destructive",
                        duration: 2000,
                      });
                    }
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className={`w-[120px] ${isLoading ? 'opacity-50' : ''}`}>
                    {isLoading ? (
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
                    ) : (
                      <Clock className="w-4 h-4 mr-2" />
                    )}
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[60]" 
                    side="bottom" 
                    align="end" 
                    sideOffset={4}
                    avoidCollisions={true}
                    position="popper"
                  >
                    {timeRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                {industryTrends.length} sectors • {totalDevelopments} total developments
              </p>
            </div>
            
            <div className="mt-4">
              <GoldenScroll maxHeight="485px" className="pt-2 px-3">
              {sortedTrends.map((trend, index) => {
                const position = index + 1
                const IconComponent = getIndustryIcon(trend.industry)
                const activityLevel = getActivityLevel(trend.total_count, totalDevelopments, trend.industry)
                const isSelected = selectedIndustry === trend.industry
                const leaderboardStyle = getLeaderboardStyling(position)
                const progressPercentage = (trend.total_count / maxCount) * 100
                
                // Mono gold system - activity intensity only
                const baseColor = theme === 'dark' ? '#FFD700' : '#DAA520' // Brighter Gold
                const activityColor = activityLevel === 'high' 
                  ? baseColor 
                  : activityLevel === 'medium'
                  ? baseColor + '80' // 50% opacity
                  : baseColor + '40' // 25% opacity
                
                return (
                  <div key={trend.industry} className="mb-3">
                    {/* Elite Pulse Frame for Selected Sector Only */}
                    {isSelected ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5 relative"
                        style={{
                          ...getMetallicCardStyle(theme).style,
                          outline: `1px solid ${theme === "dark" ? "#FFD700" : "#DAA520"}`,
                          outlineOffset: '2px'
                        }}
                        onClick={() => setSelectedIndustry("All")}
                      >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {leaderboardStyle.showBadge && (
                                <span className="text-lg font-bold">
                                  {leaderboardStyle.badge}
                                </span>
                              )}
                              <div 
                                className="p-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `${activityColor}20`, color: activityColor }}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-sm ${
                                theme === 'dark' ? 'text-white' : 'text-black'
                              }`}>
                                {trend.industry}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {trend.total_count} developments
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar and Stats */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Activity Level</span>
                              <span className="font-medium">{activityLevel.toUpperCase()}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${progressPercentage}%`,
                                  backgroundColor: activityColor
                                }}
                              />
                            </div>
                            
                          </div>
                        </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg cursor-pointer transition-all duration-200 border-transparent hover:border-primary/30 hover:bg-primary/5"
                        style={getMetallicCardStyle(theme).style}
                        onClick={() => setSelectedIndustry(trend.industry)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            {leaderboardStyle.showBadge && (
                              <span className="text-lg font-bold">
                                {leaderboardStyle.badge}
                              </span>
                            )}
                            <div 
                              className="p-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: `${activityColor}20`, color: activityColor }}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold text-sm ${
                              theme === 'dark' ? 'text-white' : 'text-black'
                            }`}>
                              {trend.industry}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {trend.total_count} developments
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar and Stats */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Activity Level</span>
                            <span className="font-medium">{activityLevel.toUpperCase()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${progressPercentage}%`,
                                backgroundColor: activityColor
                              }}
                            />
                          </div>
                          
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
              </GoldenScroll>
            </div>
          </div>
        </div>
        
        {/* Middle Column - Insider Brief Stream */}
        <div className="w-full lg:flex-1 min-w-0">
          <div className="h-full flex flex-col">
            {/* Header Section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {selectedIndustry === 'All' ? 'All Insider Briefs' : `${selectedIndustry} Insider Brief`}
                </h3>

                {/* Embedded Industry Filter */}
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent className="z-50" side="bottom" align="end" sideOffset={4}>
                    {industryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Box */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search developments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {selectedIndustry !== 'All' && (
                  <>
                    <button
                      onClick={() => setSelectedIndustry('All')}
                      className="text-primary hover:underline mr-2"
                    >
                      Show All Industries
                    </button>
                    •{' '}
                  </>
                )}
                {searchQuery ? (
                  <>
                    {filteredDevelopments.length} results found •{' '}
                  </>
                ) : null}
                Development stream • {selectedTimeRange} timeframe
              </p>
            </div>
            
            <div className="mt-4 px-3">
              <GoldenScroll maxHeight="485px" className="pt-2">
                <DevelopmentStream
                  selectedIndustry={selectedIndustry}
                  duration={selectedTimeRange}
                  getIndustryColor={getIndustryColor}
                  expandedDevelopmentId={null}
                  parentLoading={isLoading}
                  onLoadingChange={(loading) => {
                    // No longer needed since parent handles loading
                  }}
                  developments={filteredDevelopments}
                  isLoading={isLoading}
                  onCitationClick={handleCitationClick}
                  onDevelopmentExpanded={handleDevelopmentExpanded}
                  citationMap={citationMap}
                />
              </GoldenScroll>
            </div>
          </div>
        </div>

        {/* Right Column - Citations Panel (Desktop Only) */}
        {isPanelOpen && (
          <div className="hidden lg:block">
            <EliteCitationPanel
              citations={managedCitations}
              selectedCitationId={selectedCitationId}
              onClose={() => {
                closePanel()
              }}
              onCitationSelect={handleCitationSelect}
            />
          </div>
        )}
      </div>
      
      {/* Footer disclaimer */}
      <div className="pt-8 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Intelligence Research Platform • HNWI Chronicles builds comprehensive market intelligence for informed decision-making
        </p>
      </div>
    </div>
  )
}
