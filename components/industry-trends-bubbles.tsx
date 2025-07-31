// components/industry-trends-bubbles.tsx

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import * as d3 from "d3"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { IndustryBubbleTooltip } from "./industry-bubble-tooltip"

interface IndustryTrend {
  industry: string
  total_count: number
}

interface IndustryTrendsBubblesProps {
  duration: string
  onIndustriesUpdate: (industries: string[]) => void
  onBubbleClick: (industry: string) => void
  getIndustryColor: (industry: string) => string
  selectedIndustry: string
  renderStatsOutside?: boolean
}

interface TooltipData {
  industry: string
  count: number
  x: number
  y: number
}

// Import from config to ensure consistency
import { API_BASE_URL } from "@/config/api"

export function IndustryTrendsBubbles({
  duration,
  onIndustriesUpdate,
  onBubbleClick,
  getIndustryColor,
  selectedIndustry,
  renderStatsOutside = true,
}: IndustryTrendsBubblesProps) {
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Keep track of raw data for debugging
  const rawApiData = useRef<any[]>([])

  // Fetch all data from the time series endpoint
  const fetchIndustryTrends = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(prevState => !isRefreshing && prevState);
      setIsRefreshing(forceRefresh);
      
      // Generate cache-busting parameters
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(2, 15)
      const cacheKey = `${timestamp}-${random}`
      
      // Construct URL with cache-busting
      const url = `${API_BASE_URL}/api/industry-trends/time-series?_t=${cacheKey}`
      
      console.log(`Fetching trends data for duration: ${duration}`, url)
      
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "X-Request-ID": cacheKey
        },
        body: JSON.stringify({
          time_range: duration,
          include_developments: false,
          _timestamp: timestamp,
          _cache_key: cacheKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.data || !Array.isArray(result.data)) {
        console.error("Invalid API response format:", result)
        throw new Error("Invalid API response format")
      }
      
      // Store raw data for debugging
      rawApiData.current = result.data

      // Process data - group by exact industry names from API
      const industriesMap = new Map<string, number>()
      
      // Log unique industries found in API response
      const uniqueIndustries = new Set<string>()
      
      result.data.forEach((item: any) => {
        if (item && item.industry) {
          uniqueIndustries.add(item.industry)
          const count = industriesMap.get(item.industry) || 0
          industriesMap.set(item.industry, count + (item.total_count || 1))
        }
      })
      
      console.log(`Found ${uniqueIndustries.size} unique industries in API:`, 
        Array.from(uniqueIndustries).sort())

      // Convert map to array for visualization
      const processedData = Array.from(industriesMap.entries())
        .map(([industry, total_count]) => ({
          industry: industry.trim(), // Just trim whitespace, no other modifications
          total_count
        }))
        .filter(item => item.total_count > 0)
        .sort((a, b) => b.total_count - a.total_count)
      
      console.log(`Processed ${processedData.length} industry trends`)
      
      // Update state
      setIndustryTrends(processedData)
      setLastUpdated(new Date())
      
      // Notify parent component
      onIndustriesUpdate(processedData.map(item => item.industry))
      
    } catch (error) {
      console.error("Error fetching industry trends:", error)
      toast({
        title: "Error",
        description: "Failed to fetch industry trends. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [duration, onIndustriesUpdate, toast])

  // Initial load and when duration changes
  useEffect(() => {
    fetchIndustryTrends()
  }, [fetchIndustryTrends])

  // Visualization effect
  useEffect(() => {
    if (!containerRef.current || isLoading || industryTrends.length === 0) return
    
    const updateVisualization = () => {
      // Clear previous visualization
      d3.select(containerRef.current).selectAll("svg").remove()

      const container = containerRef.current
      const margin = { top: 20, right: 20, bottom: 20, left: 20 }
      const width = container.clientWidth - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      // Responsive bubble sizing
      const minRadius = Math.min(36, width / 16.67)
      const maxRadius = Math.min(96, width / 6.67)

      // Create scale for bubble sizes
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(industryTrends, (d) => d.total_count) || 0])
        .range([minRadius, maxRadius])

      const adjustedRadiusScale = (value: number) => Math.max(radiusScale(value) * 1.04, 24)

      // Create SVG container
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

      // Stats are now displayed directly in the HTML above the visualization
      
      // Set up force simulation
      const simulation = d3
        .forceSimulation(industryTrends)
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("charge", d3.forceManyBody().strength(-30))
        .force(
          "collide",
          d3
            .forceCollide()
            .radius((d) => adjustedRadiusScale(d.total_count) + 10)
            .strength(0.9)
            .iterations(4)
        )

      // Filter data if a specific industry is selected
      const filteredTrends =
        selectedIndustry === "All"
          ? industryTrends
          : industryTrends.filter((trend) => trend.industry === selectedIndustry)

      // Create bubble groups
      const bubbles = svg
        .selectAll(".bubble")
        .data(filteredTrends)
        .enter()
        .append("g")
        .attr("class", "bubble")
        .style("cursor", "pointer")

      // Add circles to groups
      const circles = bubbles
        .append("circle")
        .attr("r", (d) => adjustedRadiusScale(d.total_count))
        .style("fill", (d) => getIndustryColor(d.industry))
        .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))")
        .style("cursor", "pointer")
        .style("opacity", "0.95")

      // Add event listeners
      bubbles
        .on("mouseover touchstart", (event, d) => {
          event.preventDefault() // Prevent default touch behavior
          const [x, y] = d3.pointer(event, container)
          
          // Apply hover effect
          d3.select(event.currentTarget).select("circle")
            .transition()
            .duration(200)
            .style("filter", "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35))")
            .style("opacity", "1")
            .attr("r", (d) => adjustedRadiusScale(d.total_count) * 1.05)
            
          setTooltipData({
            industry: d.industry,
            count: d.total_count,
            x,
            y,
          })
        })
        .on("mouseout touchend", (event) => {
          // Remove hover effect
          d3.select(event.currentTarget).select("circle")
            .transition()
            .duration(200)
            .style("filter", "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))")
            .style("opacity", "0.95")
            .attr("r", (d) => adjustedRadiusScale(d.total_count))
            
          setTooltipData(null)
        })
        .on("click", (_, d) => {
          // Toggle selection like Opportunity Atlas does
          if (selectedIndustry === d.industry) {
            onBubbleClick("All") // Reset to show all industries
          } else {
            onBubbleClick(d.industry) // Select this industry
          }
        })

      // Add text labels to bubbles
      bubbles
        .append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("text-shadow", "0px 1px 3px rgba(0,0,0,0.7)")
        .style("paint-order", "stroke")
        .style("stroke", "rgba(0,0,0,0.3)")
        .style("stroke-width", "1px")
        .each(function (d) {
          const self = d3.select(this)
          const words = d.industry.split(/\s+/)
          const lines = []
          let line = []
          let lineNumber = 0
          const lineHeight = 1.1
          const fontSize = Math.min(adjustedRadiusScale(d.total_count) / 3, 24) // Increased max font size

          self.style("font-size", `${fontSize}px`)

          for (const word of words) {
            const testLine = line.concat(word)
            const testElem = self.append("tspan").text(testLine.join(" "))
            const testWidth = testElem.node()?.getComputedTextLength() || 0

            if (testWidth > adjustedRadiusScale(d.total_count) * 1.5 && line.length > 0) {
              lines.push(line)
              line = [word]
              lineNumber++
            } else {
              line = testLine
            }
            testElem.remove()
          }
          if (line.length > 0) {
            lines.push(line)
            lineNumber++
          }

          const totalHeight = lineNumber * lineHeight * fontSize
          const startY = -totalHeight / 2 + fontSize / 2

          lines.forEach((lineWords, i) => {
            self
              .append("tspan")
              .attr("x", 0)
              .attr("y", startY + i * lineHeight * fontSize)
              .text(lineWords.join(" "))
          })
        })

      // Add pulsing animation
      function pulse() {
        circles
          .transition()
          .duration(1000)
          .attr("r", (d) => adjustedRadiusScale(d.total_count) * 1.05)
          .transition()
          .duration(1000)
          .attr("r", (d) => adjustedRadiusScale(d.total_count))
          .on("end", pulse)
      }

      pulse()

      // Update positions on simulation tick
      simulation.nodes(industryTrends).on("tick", () => {
        bubbles.attr("transform", (d) => {
          const radius = adjustedRadiusScale(d.total_count)
          d.x = Math.max(radius, Math.min(width - radius, d.x))
          d.y = Math.max(radius, Math.min(height - radius, d.y))
          return `translate(${d.x},${d.y})`
        })
      })
    }

    updateVisualization()

    const handleResize = () => {
      updateVisualization()
      setTooltipData(null) // Hide tooltip on resize
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [industryTrends, isLoading, onBubbleClick, getIndustryColor, selectedIndustry])

  // Handle manual refresh
  const handleRefresh = () => {
    fetchIndustryTrends(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Get stats text for display
  const statsText = `${industryTrends.length} industries${lastUpdated ? ` • Updated: ${lastUpdated.toLocaleTimeString()}` : ''}`;

  return (
    <div className="w-full">
      <div className="px-4">
        {/* Don't render stats text here if renderStatsOutside is true */}
        {!renderStatsOutside && (
          <div className="text-xs text-gray-500 mb-1">
            {statsText}
          </div>
        )}
        <div ref={containerRef} className="h-[400px] w-full relative">
          {/* Export stats for parent component to use */}
          <div className="hidden">{/* Used to pass data to the parent */}
            <span id="industry-stats-text" data-stats={statsText}></span>
          </div>
          
          <AnimatePresence>
            {tooltipData && (
              <IndustryBubbleTooltip
                industry={tooltipData.industry}
                count={tooltipData.count}
                x={tooltipData.x}
                y={tooltipData.y}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}