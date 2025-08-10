"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as d3 from "d3"
import { toast } from "@/components/ui/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface Development {
  id: string
  title: string
  description: string
  date: string
  url: string
  industry: string
  product: string
  summary: string
  numerical_data: any
}

interface TimeSeriesPoint {
  timestamp: string
  count: number
  developments: Development[]
}

interface Product {
  [key: string]: TimeSeriesPoint[]
}

interface Industry {
  industry: string
  total_count: number
  products: Product
}

interface TimeSeriesResponse {
  data: Industry[]
  time_range: string
  start_date: string
  end_date: string
}

// Import from config to ensure consistency
import { API_BASE_URL } from "@/config/api"
import { secureApi } from "@/lib/secure-api"

function classifyProducts(products: Product): { [key: string]: string[] } {
  const productNames = Object.keys(products)
  if (productNames.length <= 10) {
    return { "All Products": productNames }
  }

  const classifications: { [key: string]: string[] } = {}
  productNames.forEach((name) => {
    const category = name.split(" ")[0].toLowerCase()
    if (!classifications[category]) {
      classifications[category] = []
    }
    classifications[category].push(name)
  })

  const MAX_CATEGORIES = 10
  if (Object.keys(classifications).length > MAX_CATEGORIES) {
    const sortedCategories = Object.entries(classifications).sort((a, b) => b[1].length - a[1].length)

    const mainCategories = sortedCategories.slice(0, MAX_CATEGORIES - 1)
    const otherProducts = sortedCategories.slice(MAX_CATEGORIES - 1).flatMap(([_, products]) => products)

    const result = Object.fromEntries(mainCategories)
    result["Other"] = otherProducts
    return result
  }

  return classifications
}

function calculatePreviousCount(industry: Industry | null | undefined, timeRange: string): number {
  if (!industry || !industry.products) return 0

  const allDataPoints = Object.values(industry.products).flatMap((product) => product || [])
  const sortedDataPoints = allDataPoints.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const currentPeriodEnd = new Date(sortedDataPoints[0].timestamp)
  let currentPeriodStart: Date
  let previousPeriodEnd: Date
  let previousPeriodStart: Date

  switch (timeRange) {
    case "1d":
      currentPeriodStart = new Date(currentPeriodEnd.getTime() - 24 * 60 * 60 * 1000)
      previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1)
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - 24 * 60 * 60 * 1000)
      break
    case "1w":
      currentPeriodStart = new Date(currentPeriodEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
      previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1)
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "1m":
      currentPeriodStart = new Date(currentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
      previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1)
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "1y":
      currentPeriodStart = new Date(currentPeriodEnd.getTime() - 365 * 24 * 60 * 60 * 1000)
      previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1)
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      return 0
  }

  const previousPeriodCount = sortedDataPoints
    .filter(
      (point) => new Date(point.timestamp) >= previousPeriodStart && new Date(point.timestamp) <= previousPeriodEnd,
    )
    .reduce((sum, point) => sum + point.count, 0)

  return previousPeriodCount
}

export function IndustryTrends() {
  const [timeRange, setTimeRange] = useState("1w")
  const [industries, setIndustries] = useState<Industry[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDevelopments, setExpandedDevelopments] = useState<{ [key: string]: boolean }>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedDataPoint, setSelectedDataPoint] = useState<any | null>(null)
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })
  const chartRef = useRef<HTMLDivElement>(null)
  const [productClassifications, setProductClassifications] = useState<{ [key: string]: string[] }>({})

  const fetchIndustryTrends = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Enhanced cache-busting with random UUID and timestamp
      const timestamp = new Date().getTime()
      const random = Math.random().toString(36).substring(2, 15)
      const cacheKey = `${timestamp}-${random}`
      
      // Clear any existing browser cache for this endpoint
      // Use correct POST format as expected by backend
      const data: TimeSeriesResponse = await secureApi.post(`/api/industry-trends/time-series`, {
        time_range: timeRange,
        include_developments: true
      })

      if (data.data.length === 0) {
        setError("No industry data available for the selected time range.")
      } else {
        setIndustries(data.data)
      }
    } catch (error) {
      setError(`Failed to fetch industry trends: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: `Failed to fetch industry trends: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchIndustryTrends()
  }, [fetchIndustryTrends])

  const handleIndustryClick = useCallback((industry: Industry) => {
    setSelectedIndustry(industry)
    setSelectedProduct(null)
  }, [])

  const handleProductClick = useCallback((productName: string) => {
    setSelectedProduct(productName)
  }, [])

  const handleBackClick = useCallback(() => {
    if (selectedProduct) {
      setSelectedProduct(null)
    } else {
      setSelectedIndustry(null)
    }
  }, [selectedProduct])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    // Implement search logic here
  }, [])

  const toggleDevelopmentExpansion = useCallback((id: string) => {
    setExpandedDevelopments((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const handleDataPointClick = (data: any, event: React.MouseEvent) => {
    if (!data || !event || !chartRef.current) return

    const chartRect = chartRef.current.getBoundingClientRect()
    const x = event.clientX - chartRect.left
    const y = event.clientY - chartRect.top

    setSelectedDataPoint(data.payload)
    setCardPosition({ x, y })
  }

  const SummaryCard: React.FC<{ data: any; position: { x: number; y: number }; onClose: () => void }> = ({
    data,
    position,
    onClose,
  }) => {
    const cardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
          onClose()
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [onClose])

    return (
      <div
        ref={cardRef}
        className="absolute bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -100%)",
        }}
      >
        <p className="date text-sm text-gray-500 mb-1">{new Date(data.timestamp).toLocaleString()}</p>
        <p className="count text-2xl font-bold text-gray-900 mb-2">{data.count} developments</p>
        {data.developments && data.developments.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Latest Development:</p>
            <p className="text-sm text-gray-600">{data.developments[0].title}</p>
          </div>
        )}
      </div>
    )
  }

  const renderBubbleChart = (
    data: any[],
    onClick: (item: any) => void,
    radiusScale: d3.ScalePower<number, number, never>,
  ) => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    svg.selectAll("*").remove()

    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const nodes = data.map((item) => ({
      ...item,
      r: radiusScale(item.value || 0),
    }))

    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (d as any).r + 2),
      )
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))

    // Add clustering force for classified products
    if (selectedIndustry && !selectedProduct) {
      const categoryCenters: { [key: string]: { x: number; y: number } } = {}
      Object.keys(productClassifications).forEach((category, index) => {
        const angle = (2 * Math.PI * index) / Object.keys(productClassifications).length
        categoryCenters[category] = {
          x: width / 2 + (width / 3) * Math.cos(angle),
          y: height / 2 + (height / 3) * Math.sin(angle),
        }
      })

      simulation
        .force(
          "cluster",
          d3
            .forceX((d: any) => {
              const category = Object.entries(productClassifications).find(([_, products]) =>
                products.includes(d.name),
              )?.[0]
              return category ? categoryCenters[category].x : width / 2
            })
            .strength(0.3),
        )
        .force(
          "cluster-y",
          d3
            .forceY((d: any) => {
              const category = Object.entries(productClassifications).find(([_, products]) =>
                products.includes(d.name),
              )?.[0]
              return category ? categoryCenters[category].y : height / 2
            })
            .strength(0.3),
        )
    }

    const boundingBox = (node: any) => {
      const r = node.r + 2 // Add a small padding
      node.x = Math.max(r, Math.min(width - r, node.x))
      node.y = Math.max(r, Math.min(height - r, node.y))
    }

    const g = svg.append("g")

    const bubbles = g
      .selectAll(".bubble")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .on("click", (event, d) => onClick(d))

    const circles = bubbles
      .append("circle")
      .attr("r", (d) => (d as any).r)
      .attr("fill", (d, i) => color(i.toString()))
      .attr("stroke", (d, i) => d3.color(color(i.toString()))?.darker(0.5) as string)
      .attr("stroke-width", 2)
      .style("cursor", "pointer")

    function pulse() {
      circles
        .transition()
        .duration(1000)
        .attr("r", (d) => (d as any).r * 1.05)
        .transition()
        .duration(1000)
        .attr("r", (d) => (d as any).r)
        .on("end", pulse)
    }

    pulse()

    const textGroup = bubbles.append("g").attr("transform", (d) => `translate(0, 0)`)

    textGroup
      .append("text")
      .attr("class", "bubble-name")
      .attr("y", 0)
      .style("text-anchor", "middle")
      .style("dominant-baseline", "middle")
      .style("font-size", (d) => `${Math.min(Math.max((d as any).r * 0.2, 10), 16)}px`)
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d) => (d as any).name)
      .call(wrap, (d) => (d as any).r * 1.5)

    const statsGroup = textGroup.append("g").attr("transform", (d) => `translate(0, ${(d as any).r + 8})`)

    statsGroup
      .append("path")
      .attr("d", (d) => {
        const item = d as any
        const currentCount = item.value
        const previousCount = calculatePreviousCount(item, timeRange)
        const percentChange = ((currentCount - previousCount) / previousCount) * 100
        return percentChange >= 0 ? "M-4,0 L0,-8 L4,0 Z" : "M-4,0 L0,8 L4,0 Z"
      })
      .attr("fill", (d) => {
        const item = d as any
        const currentCount = item.value
        const previousCount = calculatePreviousCount(item, timeRange)
        const percentChange = ((currentCount - previousCount) / previousCount) * 100
        return percentChange >= 0 ? "#4ade80" : "#ef4444"
      })

    statsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 16)
      .style("text-anchor", "middle")
      .style("font-size", (d) => `${Math.min(Math.max((d as any).r * 0.15, 8), 12)}px`)
      .style("font-weight", "bold")
      .style("fill", (d, i) => {
        const item = d as any
        const currentCount = item.value
        const previousCount = calculatePreviousCount(item, timeRange)
        const percentChange = ((currentCount - previousCount) / previousCount) * 100
        return percentChange >= 0 ? "#4ade80" : "#ef4444"
      })
      .text((d, i) => {
        const item = d as any
        const currentCount = item.value
        const previousCount = calculatePreviousCount(item, timeRange)
        const percentChange = ((currentCount - previousCount) / previousCount) * 100
        return `${percentChange >= 0 ? "+" : ""}${percentChange.toFixed(1)}%`
      })

    bubbles.append("title").text(
      (d) => `${(d as any).name}
${(d as any).value} development${(d as any).value !== 1 ? "s" : ""}`,
    )

    // Add category labels for classified products
    if (selectedIndustry && !selectedProduct) {
      const categoryLabels = svg
        .selectAll(".category-label")
        .data(Object.entries(productClassifications))
        .enter()
        .append("text")
        .attr("class", "category-label")
        .attr("x", (d, i) => {
          const angle = (2 * Math.PI * i) / Object.keys(productClassifications).length
          return width / 2 + (width / 3) * Math.cos(angle)
        })
        .attr("y", (d, i) => {
          const angle = (2 * Math.PI * i) / Object.keys(productClassifications).length
          return height / 2 + (height / 3) * Math.sin(angle)
        })
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text((d) => d[0])
    }

    simulation.on("tick", () => {
      bubbles.each(boundingBox).attr("transform", (d) => `translate(${(d as any).x},${(d as any).y})`)
    })
  }

  const renderProductLineGraph = () => {
    if (!selectedProduct || !selectedIndustry) return null

    const productData = selectedIndustry.products[selectedProduct]

    const chartData = productData.map((point) => ({
      timestamp: new Date(point.timestamp).getTime(),
      count: point.count,
      developments: point.developments,
    }))

    const latestData = chartData[chartData.length - 1]
    const earliestData = chartData[0]
    const totalDevelopments = chartData.reduce((sum, data) => sum + data.count, 0)
    const averageDevelopments = totalDevelopments / chartData.length
    const trend = latestData.count > earliestData.count ? "up" : "down"
    const trendPercentage = ((latestData.count - earliestData.count) / earliestData.count) * 100

    const minCount = Math.min(...chartData.map((data) => data.count))
    const maxCount = Math.max(...chartData.map((data) => data.count))
    const countRange = maxCount - minCount
    const yAxisDomain = [minCount - countRange * 0.1, maxCount + countRange * 0.1]

    return (
      <Card className="bg-white mt-4">
        <CardHeader>
          <CardTitle className="text-gray-900">{selectedProduct} Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Total Developments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalDevelopments}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Average Developments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{averageDevelopments.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Latest Count</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{latestData.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {trend === "up" ? (
                    <TrendingUp className="text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="text-red-500 mr-2" />
                  )}
                  <p className={`text-2xl font-bold ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {trendPercentage.toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="h-[500px] relative" ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  stroke="rgba(0,0,0,0.8)"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <YAxis
                  domain={yAxisDomain}
                  tickFormatter={(value) => value.toFixed(0)}
                  stroke="rgba(0,0,0,0.8)"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Tooltip content={<></>} />
                <ReferenceLine y={latestData.count} stroke="rgba(255,0,0,0.5)" strokeWidth={2} strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2451B7"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#2451B7",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#45B7E0",
                    stroke: "#fff",
                    strokeWidth: 2,
                    onClick: handleDataPointClick,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
            {selectedDataPoint && (
              <SummaryCard
                data={selectedDataPoint}
                position={cardPosition}
                onClose={() => setSelectedDataPoint(null)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  useEffect(() => {
    if (!svgRef.current || industries.length === 0 || isLoading) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    const minRadius = 30
    const maxRadius = 80
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(industries, (d) => d.total_count) || 0])
      .range([minRadius, maxRadius])

    if (!selectedIndustry) {
      // Render industries using force-directed graph
      const industryData = industries.map((industry) => ({
        id: industry.industry,
        name: industry.industry,
        value: industry.total_count,
      }))

      renderBubbleChart(
        industryData,
        (item) => handleIndustryClick(industries.find((i) => i.industry === item.id) || null),
        radiusScale,
      )
    } else if (!selectedProduct) {
      // Classify products and render using force-directed graph
      const classifications = classifyProducts(selectedIndustry.products || {})
      setProductClassifications(classifications)

      const productData = Object.entries(selectedIndustry.products || {}).map(([name, data]) => ({
        id: name,
        name,
        value: (data || []).reduce((sum, point) => sum + (point.count || 0), 0),
      }))

      renderBubbleChart(productData, (item) => handleProductClick(item.id), radiusScale)
    }
  }, [industries, selectedIndustry, selectedProduct, handleIndustryClick, handleProductClick, isLoading, timeRange])

  function wrap(text: d3.Selection<SVGTextElement, any, any, any>, width: number | ((d: any) => number)) {
    text.each(function (d) {
      const textElement = d3.select(this)
      const words = textElement.text().split(/\s+/).reverse()
      let word
      let line: string[] = []
      let lineNumber = 0
      const lineHeight = 1.1 // ems
      const y = textElement.attr("y")
      const dy = Number.parseFloat(textElement.attr("dy") || "0")
      let tspan = textElement
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em")

      const widthValue = typeof width === "function" ? width(d) : width

      while ((word = words.pop())) {
        line.push(word)
        tspan.text(line.join(" "))
        if ((tspan.node()?.getComputedTextLength() || 0) > widthValue) {
          line.pop()
          tspan.text(line.join(" "))
          line = [word]
          tspan = textElement
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight + dy}em`)
            .text(word)
        }
      }
    })
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Industry Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Select onValueChange={setTimeRange} defaultValue={timeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="1w">Last week</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-[200px]"
            />
            <Button type="submit" className="w-[100px]">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
          {(selectedIndustry || selectedProduct) && (
            <Button variant="outline" onClick={handleBackClick} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-[600px]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-destructive">
            <p>{error}</p>
            <p className="mt-2">Please check the console for more details.</p>
          </div>
        ) : industries.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No industry data available for the selected time range.
          </div>
        ) : (
          <>
            <div className="relative w-full h-[600px] bg-gradient-to-br from-background to-accent/10 rounded-lg overflow-hidden mb-4">
              <svg ref={svgRef} width="100%" height="100%" />
            </div>
            {selectedProduct && selectedIndustry && renderProductLineGraph()}
            {selectedProduct && selectedIndustry && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">{selectedProduct} Developments</h3>
                {selectedIndustry.products[selectedProduct].flatMap((point) =>
                  point.developments.map((dev) => (
                    <Card key={dev.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg">{dev.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{dev.description}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Date: {new Date(dev.date).toLocaleDateString()}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDevelopmentExpansion(dev.id)}
                          className="flex items-center"
                        >
                          {expandedDevelopments[dev.id] ? (
                            <>
                              <ChevronUp className="mr-2 h-4 w-4" /> Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-4 w-4" /> Know More
                            </>
                          )}
                        </Button>
                        {expandedDevelopments[dev.id] && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Summary</h4>
                            <p className="text-sm mb-4">{dev.summary}</p>
                            {dev.numerical_data && (
                              <>
                                <h4 className="text-sm font-semibold mb-2">Numerical Data</h4>
                                <pre className="text-xs bg-muted p-2 rounded mb-4">
                                  {JSON.stringify(dev.numerical_data, null, 2)}
                                </pre>
                              </>
                            )}
                            <a
                              href={dev.url}
                              target="_blank"
                              rel="noreferrer noopener norefernel"
                              className="text-sm text-primary hover:underline"
                            >
                              Relevant Resource
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )),
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

