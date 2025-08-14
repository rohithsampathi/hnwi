// components/market-intelligence-dashboard.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CrownLoader } from "@/components/ui/crown-loader"
import { getMetallicCardStyle } from "@/lib/colors"
import { secureApi } from "@/lib/secure-api"
import { DevelopmentStream } from "@/components/development-stream"
import { GoldenScroll } from "@/components/ui/golden-scroll"
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
  Clock
} from "lucide-react"

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
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' }
]

// Client-side date filtering helper (same as development-stream.tsx)
const applyClientSideDateFilter = (items: any[], timeRange: string): any[] => {
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeRange) {
    case '1d':
      // For 1D, show items from last 48 hours (more lenient to catch recent data)
      cutoffDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      break;
    case '1w':
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '6m':
      cutoffDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return items;
  }
  
  const filtered = items.filter((item: any) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate >= cutoffDate;
  });
  
  console.log(`📅 [INDUSTRY TRENDS FILTER] ${timeRange}: From ${items.length} to ${filtered.length} items (cutoff: ${cutoffDate.toISOString()})`);
  return filtered;
};

// Icon mapping for industries
const getIndustryIcon = (industry: string) => {
  const industryLower = industry.toLowerCase()
  if (industryLower.includes('real estate') || industryLower.includes('property')) return Building2
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
  
  // State management - Simplified
  const [selectedTimeRange, setSelectedTimeRange] = useState('1w') // Default to 1 week
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [totalDevelopments, setTotalDevelopments] = useState(0)
  const [developmentStreamLoading, setDevelopmentStreamLoading] = useState(false)
  
  // Fetch developments data and generate industry trends from it (unified data source)
  const fetchIndustryTrends = useCallback(async (forceRefresh = false) => {
    try {
      const cacheKey = `unified-industry-trends-${selectedTimeRange}`;
      // Always show main loader when fetching data
      setIsLoading(true)
      setIsRefreshing(forceRefresh);
      
      console.log('🔍 [UNIFIED] Fetching developments to generate industry trends for time_range:', selectedTimeRange);
      
      // Use same API as DevelopmentStream to ensure perfect synchronization
      const requestBody = {
        start_date: null,
        end_date: null,
        industry: undefined, // Always fetch all industries - filter locally
        product: null,
        page: 1,
        page_size: 100,
        sort_by: "date",
        sort_order: "desc",
        time_range: selectedTimeRange,
      }
      
      const result = await secureApi.post('/api/developments', requestBody, true, { 
        enableCache: !forceRefresh,
        cacheDuration: 600000, // 10 minutes cache
        cacheKey: cacheKey
      });
      
      console.log('🔍 [UNIFIED] Developments API response for industry trends:', {
        hasData: !!result.developments,
        count: result.developments?.length,
        timeRange: result.time_range
      });
      
      if (!result.developments || !Array.isArray(result.developments)) {
        console.error('❌ [ERROR] Invalid developments response for industry trends:', result);
        throw new Error("Invalid API response format")
      }
      
      console.log('✅ [UNIFIED] Raw developments count:', result.developments.length);
      
      // Apply client-side date filtering (same logic as DevelopmentStream)
      let filteredDevelopments = result.developments;
      if (selectedTimeRange !== result.time_range) {
        console.log('⚠️ [API BUG] Developments API ignoring time_range! Applying client-side filtering...');
        filteredDevelopments = applyClientSideDateFilter(result.developments, selectedTimeRange);
      }
      
      console.log('📊 [UNIFIED] After filtering:', filteredDevelopments.length, 'developments');
      
      // Generate industry trends from developments data
      const industriesMap = new Map<string, number>()
      
      filteredDevelopments.forEach((dev: any) => {
        if (dev && dev.industry) {
          const count = industriesMap.get(dev.industry) || 0
          industriesMap.set(dev.industry, count + 1) // Each development counts as 1
        }
      })
      
      // Convert map to array for visualization
      const processedData = Array.from(industriesMap.entries())
        .map(([industry, total_count]) => ({
          industry: industry.trim(),
          total_count
        }))
        .filter(item => item.total_count > 0)
        .sort((a, b) => b.total_count - a.total_count)
      
      // Calculate total developments across all industries
      const totalDevs = processedData.reduce((sum, item) => sum + item.total_count, 0)
      
      console.log('📊 [UNIFIED] Generated industry trends from developments:', { 
        industriesCount: processedData.length, 
        totalDevs,
        breakdown: processedData.map(i => `${i.industry}: ${i.total_count}`)
      });
      
      // Update state
      setIndustryTrends(processedData)
      setTotalDevelopments(totalDevs)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Failed to fetch developments for industry trends:', error)
      toast({
        title: "Error",
        description: "Failed to fetch industry trends. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
      setIsLoading(false)
    }
  }, [selectedTimeRange, toast])
  
  // Initial load and when duration changes
  useEffect(() => {
    // console.log(`🔄 [DEBUG] useEffect triggered for time range: ${selectedTimeRange}`);
    fetchIndustryTrends()
  }, [fetchIndustryTrends])
  
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
  
  // Loading state - show single crown loader only for main data
  if (isLoading) {
    return (
      <div className="w-full">
        {/* Single Center Crown Loader */}
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <CrownLoader size="lg" text="Loading market intelligence..." />
        </div>
      </div>
    )
  }

  // Calculate max count for activity levels and sort for leaderboard
  const maxCount = Math.max(...industryTrends.map(t => t.total_count), 1)
  const sortedTrends = [...industryTrends].sort((a, b) => b.total_count - a.total_count)
  
  return (
    <div className="w-full">
      {/* Main Dashboard Content - No Background Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 min-h-[500px] mt-8">
        {/* Left Column - Activity Leaderboard (2 parts) */}
        <div className="md:col-span-1 lg:col-span-2">
          <div className="h-full">
            {/* Header Section */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Activity Leaderboard
                </h3>
                
                {/* Embedded Time Range Filter */}
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent className="z-50" side="bottom" align="end" sideOffset={4}>
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
              <GoldenScroll maxHeight="calc(100vh - 350px)" className="pt-2 px-3">
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
        
        {/* Right Column - Insider Brief Stream (3 parts) */}
        <div className="md:col-span-1 lg:col-span-3">
          <div className="h-full">
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
                Development stream • {selectedTimeRange} timeframe
              </p>
            </div>
            
            <div className="mt-8">
              <GoldenScroll maxHeight="calc(100vh - 350px)">
              <DevelopmentStream 
                selectedIndustry={selectedIndustry}
                duration={selectedTimeRange}
                getIndustryColor={getIndustryColor}
                expandedDevelopmentId={null}
                parentLoading={isLoading}
                onLoadingChange={(loading) => {
                  setDevelopmentStreamLoading(loading)
                }}
              />
              </GoldenScroll>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}