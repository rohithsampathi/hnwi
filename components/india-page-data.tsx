"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import * as d3 from "d3"

interface CityData {
  city: string
  q42024: number
  midSegment: number
  highSegment: number
  affordableSegment: number
  yoyGrowth: number
}

interface MarketData {
  year: number
  value: number
}

const cityData: CityData[] = [
  { city: "Hyderabad", q42024: 13653, midSegment: 58, highSegment: 34, affordableSegment: 8, yoyGrowth: -31 },
  { city: "Delhi NCR", q42024: 4033, midSegment: 31, highSegment: 58, affordableSegment: 11, yoyGrowth: 82 },
  { city: "Pune", q42024: 10237, midSegment: 61, highSegment: 26, affordableSegment: 13, yoyGrowth: -6 },
  { city: "MMR", q42024: 17663, midSegment: 72, highSegment: 25, affordableSegment: 3, yoyGrowth: 6 },
  { city: "Kolkata", q42024: 4050, midSegment: 58, highSegment: 24, affordableSegment: 18, yoyGrowth: -24 },
  { city: "Chennai", q42024: 4050, midSegment: 77, highSegment: 18, affordableSegment: 5, yoyGrowth: 38 },
  { city: "Ahmedabad", q42024: 4474, midSegment: 52, highSegment: 16, affordableSegment: 32, yoyGrowth: -10 },
  { city: "Bengaluru", q42024: 10500, midSegment: 50, highSegment: 50, affordableSegment: 0, yoyGrowth: 3 },
]

const marketData: MarketData[] = [
  { year: 2017, value: 120 },
  { year: 2020, value: 180 },
  { year: 2025, value: 650 },
  { year: 2030, value: 1000 },
  { year: 2047, value: 5800 },
]

const cityColors = ["#4CAF50", "#2196F3", "#FFC107", "#E91E63", "#9C27B0", "#FF5722", "#795548", "#607D8B"]

export const IndiaPageData: React.FC = () => {
  const yoyGrowthChartRef = useRef<SVGSVGElement | null>(null)
  const q4LaunchesChartRef = useRef<SVGSVGElement | null>(null)
  const marketTrendChartRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    renderYOYGrowthChart()
    renderQ4LaunchesChart()
    renderMarketTrendChart()
  }, [])

  const renderYOYGrowthChart = () => {
    if (!yoyGrowthChartRef.current) return

    const svg = d3.select(yoyGrowthChartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = yoyGrowthChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(cityData.map((d) => d.city))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([d3.min(cityData, (d) => d.yoyGrowth) || 0, d3.max(cityData, (d) => d.yoyGrowth) || 0])

    // Move X-axis to Y=0
    const xAxis = d3.axisBottom(x)
    chart
      .append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(xAxis)
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 0)
      .attr("dy", ".35em")
      .attr("transform", "rotate(0)")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "var(--chart-axis-color)")

    chart
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "var(--chart-label-color)")

    chart
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "black")
      .attr("stroke-width", 1)

    chart
      .selectAll(".bar")
      .data(cityData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.city) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(Math.max(0, d.yoyGrowth)))
      .attr("height", (d) => Math.abs(y(d.yoyGrowth) - y(0)))
      .attr("fill", (d) => (d.yoyGrowth >= 0 ? "#4CAF50" : "#F44336"))

    chart
      .selectAll(".label")
      .data(cityData)
      .enter()
      .append("text")
      .attr("class", "label blinking-text")
      .attr("x", (d) => (x(d.city) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.yoyGrowth) + (d.yoyGrowth >= 0 ? -5 : 15))
      .attr("text-anchor", "middle")
      .text((d) => `${d.yoyGrowth}%`)
      .style("fill", "var(--chart-label-color)")
      .style("font-size", "12px")
      .style("font-weight", "bold")
  }

  const renderQ4LaunchesChart = () => {
    if (!q4LaunchesChartRef.current) return

    const svg = d3.select(q4LaunchesChartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = q4LaunchesChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(cityData.map((d) => d.city))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(cityData, (d) => d.q42024) || 0])

    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")

    chart.append("g").call(d3.axisLeft(y))

    chart
      .selectAll(".bar")
      .data(cityData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.city) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.q42024))
      .attr("height", (d) => height - y(d.q42024))
      .attr("fill", (d, i) => cityColors[i % cityColors.length])

    chart
      .selectAll(".label")
      .data(cityData)
      .enter()
      .append("text")
      .attr("class", "label blinking-text")
      .attr("x", (d) => (x(d.city) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.q42024) - 5)
      .attr("text-anchor", "middle")
      .text((d) => d.q42024)
      .style("fill", "var(--chart-label-color)")
      .style("font-size", "12px")
      .style("font-weight", "bold")
  }

  const renderMarketTrendChart = () => {
    if (!marketTrendChartRef.current) return

    const svg = d3.select(marketTrendChartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = marketTrendChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(marketData.map((d) => d.year.toString()))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(marketData, (d) => d.value) || 0])

    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    chart.append("g").call(d3.axisLeft(y))

    chart
      .selectAll(".bar")
      .data(marketData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.year.toString()) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => height - y(d.value))
      .attr("fill", "#4CAF50")

    chart
      .selectAll(".label")
      .data(marketData)
      .enter()
      .append("text")
      .attr("class", "label blinking-text")
      .attr("x", (d) => (x(d.year.toString()) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .text((d) => `$${d.value}B`)
      .style("fill", "var(--chart-label-color)")
      .style("font-size", "12px")
      .style("font-weight", "bold")
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold mb-2">YOY Growth by City (%)</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <svg ref={yoyGrowthChartRef} className="w-full h-full"></svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold mb-2">Q4 2024 Launches by City</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <svg ref={q4LaunchesChartRef} className="w-full h-full"></svg>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold mb-2">India Real Estate Market Trend (USD Billion)</h3>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <svg ref={marketTrendChartRef} className="w-full h-full"></svg>
          </div>
        </CardContent>
      </Card>
      <style jsx>{`
        :root {
          --chart-label-color: #000000;
          --chart-axis-color: #333333;
        }
        :global(.dark) {
          --chart-label-color: #ffffff;
          --chart-axis-color: #cccccc;
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .blinking-text {
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  )
}

