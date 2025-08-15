// components/industry-trends-bubbles.tsx

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useTheme } from "@/contexts/theme-context"
import { getMetallicCardStyle } from "@/lib/colors"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Building2, Coins, Bitcoin, CreditCard, PiggyBank, Store } from "lucide-react"

interface IndustryTrend {
  industry: string
  total_count: number
  trend?: 'up' | 'down' | 'stable'
  change_percentage?: number
}

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

// Activity intensity levels
const getActivityLevel = (count: number, maxCount: number): 'low' | 'medium' | 'high' => {
  const ratio = count / maxCount
  if (ratio >= 0.7) return 'high'
  if (ratio >= 0.3) return 'medium'
  return 'low'
}

interface IndustryTrendsBubblesProps {
  duration: string
  onIndustriesUpdate: (industries: string[]) => void
  onBubbleClick: (industry: string) => void
  getIndustryColor: (industry: string) => string
  selectedIndustry: string
  renderStatsOutside?: boolean
  startDate?: string
  endDate?: string
  developments?: any[] // Accept developments as props
  isLoading?: boolean
}

interface TooltipData {
  industry: string
  count: number
  x: number
  y: number
}

// Component now receives data as props, no API calls needed

export function IndustryTrendsBubbles({
  duration,
  onIndustriesUpdate,
  onBubbleClick,
  getIndustryColor,
  selectedIndustry,
  renderStatsOutside = true,
  startDate,
  endDate,
  developments = [],
  isLoading = false,
}: IndustryTrendsBubblesProps) {
  
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([])
  const [isProcessing, setIsProcessing] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { theme } = useTheme()
  
  // Keep track of raw data for debugging
  const rawApiData = useRef<any[]>([])
  
  // Ref to store current selectedIndustry for event handlers (avoids stale closure)
  const selectedIndustryRef = useRef(selectedIndustry)

  // Process developments data into industry trends
  const processIndustryTrends = useCallback(() => {
    
    setIsProcessing(true)
    
    try {
      // Store raw data for debugging
      rawApiData.current = developments

      // Process data - group by industry from developments
      const industriesMap = new Map<string, number>()
      
      
      developments.forEach((development: any) => {
        if (development && development.industry) {
          const industry = development.industry.trim()
          const count = industriesMap.get(industry) || 0
          industriesMap.set(industry, count + 1)
        }
      })
      

      // Convert map to array for visualization
      const processedData = Array.from(industriesMap.entries())
        .map(([industry, total_count]) => ({
          industry,
          total_count
        }))
        .filter(item => item.total_count > 0)
        .sort((a, b) => b.total_count - a.total_count)
      
      
      // Update state
      setIndustryTrends(processedData)
      setLastUpdated(new Date())
      
      // Notify parent component
      onIndustriesUpdate(processedData.map(item => item.industry))
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process industry trends.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [developments, onIndustriesUpdate, toast])

  // Keep ref in sync with selectedIndustry prop
  useEffect(() => {
    selectedIndustryRef.current = selectedIndustry
  }, [selectedIndustry])

  // Process data when developments change
  useEffect(() => {
    processIndustryTrends()
  }, [processIndustryTrends])

  // Calculate max count for activity levels and sort for leaderboard
  const maxCount = Math.max(...industryTrends.map(t => t.total_count), 1)
  
  // Sort industries by activity count (leaderboard order)
  const sortedTrends = [...industryTrends].sort((a, b) => b.total_count - a.total_count)
  
  // Get leaderboard position styling
  const getLeaderboardStyling = (position: number) => {
    switch (position) {
      case 1:
        return {
          badge: '🥇',
          glow: theme === 'dark' ? 'shadow-lg shadow-yellow-500/30' : 'shadow-lg shadow-yellow-400/30',
          borderColor: 'border-yellow-500/50',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-500'
        }
      case 2:
        return {
          badge: '🥈',
          glow: theme === 'dark' ? 'shadow-md shadow-gray-400/20' : 'shadow-md shadow-gray-300/20',
          borderColor: 'border-gray-400/50',
          iconBg: 'bg-gray-400/20',
          iconColor: 'text-gray-400'
        }
      case 3:
        return {
          badge: '🥉',
          glow: theme === 'dark' ? 'shadow-md shadow-orange-500/20' : 'shadow-md shadow-orange-400/20',
          borderColor: 'border-orange-500/50',
          iconBg: 'bg-orange-500/20',
          iconColor: 'text-orange-500'
        }
      default:
        return {
          badge: `#${position}`,
          glow: '',
          borderColor: 'border-border',
          iconBg: 'bg-gray-500/20',
          iconColor: 'text-gray-500'
        }
    }
  }

  // Loading state
  if (isLoading || isProcessing) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-[400px]">
          <CrownLoader size="lg" text="Loading wealth radar..." />
        </div>
      </div>
    )
  }

  // Get stats text for display
  const statsText = `${industryTrends.length} industries${lastUpdated ? ` • Updated: ${lastUpdated.toLocaleTimeString()}` : ''}`;

  // Get selected industry data for right panel
  const selectedIndustryData = industryTrends.find(t => t.industry === selectedIndustry)

  return (
    <div className="w-full h-[calc(100vh-180px)]">
      {/* Export stats for parent component */}
      <div className="hidden">
        <span id="industry-stats-text" data-stats={statsText}></span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        {/* Left Panel: Market Heat Map */}
        <div className="lg:col-span-2 h-full">
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                Activity Leaderboard
              </h3>
              <p className="text-sm text-muted-foreground">
                {industryTrends.length} sectors • {duration} leaders • Live tracking
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {sortedTrends.map((trend, index) => {
                  const position = index + 1
                  const IconComponent = getIndustryIcon(trend.industry)
                  const activityLevel = getActivityLevel(trend.total_count, maxCount)
                  const isSelected = selectedIndustry === trend.industry
                  const metallicStyle = getMetallicCardStyle(theme)
                  const leaderboardStyle = getLeaderboardStyling(position)
                  
                  return (
                    <motion.div
                      key={trend.industry}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 border ${
                          isSelected 
                            ? `border-primary ${theme === 'dark' ? 'shadow-lg shadow-primary/20' : 'shadow-lg shadow-primary/10'}` 
                            : `${leaderboardStyle.borderColor} hover:border-primary/50`
                        } ${leaderboardStyle.glow}`}
                        style={metallicStyle.style}
                        onClick={() => {
                          if (selectedIndustry === trend.industry) {
                            onBubbleClick("All")
                          } else {
                            onBubbleClick(trend.industry)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                activityLevel === 'high' 
                                  ? 'bg-yellow-500/20' 
                                  : activityLevel === 'medium'
                                  ? 'bg-blue-500/20'
                                  : 'bg-gray-500/20'
                              }`}>
                                <IconComponent className={`h-5 w-5 ${
                                  activityLevel === 'high'
                                    ? 'text-yellow-500'
                                    : activityLevel === 'medium'
                                    ? 'text-blue-500'
                                    : 'text-gray-500'
                                }`} />
                              </div>
                              <div>
                                <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {trend.industry}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {trend.total_count} developments
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  activityLevel === 'high'
                                    ? 'text-yellow-600 border-yellow-600/30'
                                    : activityLevel === 'medium'
                                    ? 'text-blue-600 border-blue-600/30'
                                    : 'text-gray-600 border-gray-600/30'
                                }`}
                              >
                                {activityLevel.toUpperCase()}
                              </Badge>
                              
                              {trend.trend && (
                                <div className="flex items-center">
                                  {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                  {trend.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                  {trend.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Intelligence Briefing */}
        <div className="lg:col-span-3 h-full">
          <div className="h-full flex flex-col">
            {selectedIndustryData ? (
              <>
                <div className="flex-shrink-0 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        {selectedIndustryData.industry} Intelligence
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedIndustryData.total_count} active developments • {getActivityLevel(selectedIndustryData.total_count, maxCount)} activity
                      </p>
                    </div>
                    <button
                      onClick={() => onBubbleClick("All")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Activity Overview */}
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          Activity Overview
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
                              {selectedIndustryData.total_count}
                            </div>
                            <div className="text-xs text-muted-foreground">Developments</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${
                              getActivityLevel(selectedIndustryData.total_count, maxCount) === 'high'
                                ? 'text-yellow-500'
                                : getActivityLevel(selectedIndustryData.total_count, maxCount) === 'medium'
                                ? 'text-blue-500'
                                : 'text-gray-500'
                            }`}>
                              {getActivityLevel(selectedIndustryData.total_count, maxCount).toUpperCase()}
                            </div>
                            <div className="text-xs text-muted-foreground">Activity Level</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                              {Math.round((selectedIndustryData.total_count / maxCount) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Market Share</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Opportunity Pipeline */}
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          Opportunity Pipeline
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-medium">Available Opportunities</p>
                              <p className="text-xs text-muted-foreground">Check Privé Exchange for curated deals</p>
                            </div>
                            <button
                              onClick={() => window.location.href = '/prive-exchange'}
                              className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
                            >
                              View Deals
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div>
                              <p className="text-sm font-medium">Custom Requirements</p>
                              <p className="text-xs text-muted-foreground">Connect with our concierge team</p>
                            </div>
                            <button
                              onClick={() => {
                                // Integrate with concierge system
                              }}
                              className="px-3 py-1 border border-border rounded text-xs hover:bg-muted transition-colors"
                            >
                              Contact
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Store className={`h-12 w-12 mx-auto mb-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Market Intelligence
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Select an industry from the heat map to view detailed activity analysis and available opportunities.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}