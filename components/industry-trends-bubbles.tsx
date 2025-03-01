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
}

interface TooltipData {
  industry: string
  count: number
  x: number
  y: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

export function IndustryTrendsBubbles({
  duration,
  onIndustriesUpdate,
  onBubbleClick,
  getIndustryColor,
  selectedIndustry,
}: IndustryTrendsBubblesProps) {
  const [industryTrends, setIndustryTrends] = useState<IndustryTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const fetchIndustryTrends = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/industry-trends/time-series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_range: duration,
          include_developments: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setIndustryTrends(data.data)
      onIndustriesUpdate(data.data.map((item) => item.industry))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch industry trends. Please try again later.",
        variant: "destructive",
      })
      setIndustryTrends([])
    } finally {
      setIsLoading(false)
    }
  }, [duration, onIndustriesUpdate, toast])

  useEffect(() => {
    fetchIndustryTrends()
  }, [fetchIndustryTrends])

  useEffect(() => {
    if (!containerRef.current || isLoading || industryTrends.length === 0) return

    const updateVisualization = () => {
      d3.select(containerRef.current).selectAll("svg").remove()

      const container = containerRef.current
      const margin = { top: 20, right: 20, bottom: 20, left: 20 }
      const width = container.clientWidth - margin.left - margin.right
      const height = 400 - margin.top - margin.bottom

      // Responsive bubble sizing
      const minRadius = Math.min(36, width / 16.67)
      const maxRadius = Math.min(96, width / 6.67)

      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(industryTrends, (d) => d.total_count) || 0])
        .range([minRadius, maxRadius])

      const adjustedRadiusScale = (value: number) => Math.max(radiusScale(value) * 1.04, 24)

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)

      const minValue = Math.min(...industryTrends.map((d) => d.total_count))
      const maxValue = Math.max(...industryTrends.map((d) => d.total_count))

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
            .iterations(4),
        )

      const filteredTrends =
        selectedIndustry === "All"
          ? industryTrends
          : industryTrends.filter((trend) => trend.industry === selectedIndustry)

      const bubbles = svg
        .selectAll(".bubble")
        .data(filteredTrends)
        .enter()
        .append("g")
        .attr("class", "bubble")
        .style("cursor", "pointer")

      const circles = bubbles
        .append("circle")
        .attr("r", (d) => adjustedRadiusScale(d.total_count))
        .style("fill", (d) => getIndustryColor(d.industry))
        .style("filter", "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))")

      // Add event listeners for both mouse and touch events
      bubbles
        .on("mouseover touchstart", (event, d) => {
          event.preventDefault() // Prevent default touch behavior
          const [x, y] = d3.pointer(event, container)
          setTooltipData({
            industry: d.industry,
            count: d.total_count,
            x,
            y,
          })
        })
        .on("mouseout touchend", () => {
          setTooltipData(null)
        })
        .on("click", (_, d) => {
          onBubbleClick(d.industry)
        })

      bubbles
        .append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-weight", "bold")
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

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardContent>
        <div ref={containerRef} className="h-[400px] w-full relative">
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
      </CardContent>
    </Card>
  )
}

