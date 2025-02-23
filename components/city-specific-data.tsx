"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTheme } from "@/contexts/theme-context"
import * as d3 from "d3"
import { IndiaPageData } from "./india-page-data"

interface CitySpecificDataProps {
  city: string
  data: any
}

interface CityData {
  city: string
  q42024: number
  midSegment: number
  highSegment: number
  affordableSegment: number
  yoyGrowth: number
}

interface PropertyData {
  property: string
  location: string
  developer: string
  units: number
  size: string
  status: string
}

const richRuby = "#E0115F"
const richGold = "#FFD700"
const richEmerald = "#50C878"

const getScoreColor = (score: number) => {
  if (score < 1) return richRuby
  if (score >= 7) return richEmerald
  return richGold
}

const wrapText = (text: string, width: number) => {
  const words = text.split(/\s+/).reverse()
  let line = []
  const lines = []
  let word
  let lineLength = 0

  while ((word = words.pop())) {
    line.push(word)
    lineLength += word.length + 1
    if (lineLength > width) {
      lines.push(line.join(" "))
      line = []
      lineLength = 0
    }
  }
  if (line.length > 0) {
    lines.push(line.join(" "))
  }
  return lines
}

export const CitySpecificData: React.FC<CitySpecificDataProps> = ({ city, data }) => {
  const { theme } = useTheme()
  const chartRef = useRef<SVGSVGElement | null>(null)
  const pieChartRef = useRef<SVGSVGElement | null>(null)
  const qoqChartRef = useRef<SVGSVGElement | null>(null)
  const yoyChartRef = useRef<SVGSVGElement | null>(null)

  const premiumColors = [
    "#E0115F",
    "#00A86B",
    "#FFA500",
    "#0F52BA",
    "#800080",
    "#FFD700",
    "#FF4500",
    "#1E90FF",
    "#8B4513",
    "#4B0082",
    "#32CD32",
    "#FF69B4",
    "#1E90FF",
    "#FF6347",
    "#00CED1",
    "#FF8C00",
    "#9400D3",
    "#FF1493",
    "#00FA9A",
    "#DC143C",
    "#00BFFF",
    "#F4A460",
    "#9370DB",
    "#3CB371",
  ]

  const growthIndicator = (outlook: string) => {
    switch (outlook) {
      case "Growing":
        return { symbol: "↗", color: "#FFD700", rotation: "60deg" }
      case "Up":
        return { symbol: "↑", color: "#00A86B", rotation: "0deg" }
      default:
        return { symbol: "→", color: "#E0115F", rotation: "0deg" }
    }
  }

  useEffect(() => {
    if (!chartRef.current || !data) return

    const svg = d3.select(chartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 120, left: 60 }
    const width = chartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const chartData = data.marketData

    if (chartData) {
      const x = d3
        .scaleBand()
        .range([0, width])
        .domain(chartData.map((d) => d.microMarket))
        .padding(0.1)
      const y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(chartData, (d) => d.q42024) * 1.2 || 0])

      chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("y", 10)
        .attr("x", 0)
        .attr("dy", ".35em")
        .attr("transform", "rotate(0)")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .each(function (d) {
          const text = d3.select(this)
          const words = d.split(/[/,]/)
          text.text("")
          for (let i = 0; i < words.length; i++) {
            const tspan = text
              .append("tspan")
              .text(words[i])
              .attr("x", 0)
              .attr("dy", i ? "1.2em" : "0.7em")
          }
        })

      chart.append("g").call(d3.axisLeft(y)).style("font-weight", "bold")

      chart
        .selectAll(".bar")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.microMarket) || 0)
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(d.q42024 * 0.9))
        .attr("height", (d) => height - y(d.q42024 * 0.9))
        .attr("fill", (d, i) => premiumColors[i % premiumColors.length])
        .attr("stroke", (d, i) => d3.color(premiumColors[i % premiumColors.length])?.darker(0.5) as string)
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.3))")

      chart
        .selectAll(".growth-indicator")
        .data(chartData)
        .enter()
        .append("text")
        .attr("class", "growth-indicator")
        .attr("x", (d) => (x(d.microMarket) || 0) + x.bandwidth() / 2)
        .attr("y", (d) => y(d.q42024) - 10)
        .attr("text-anchor", "middle")
        .text((d) => growthIndicator(d.outlook).symbol)
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .style("fill", (d) => growthIndicator(d.outlook).color)
        .attr(
          "transform",
          (d) =>
            `translate(0,0) rotate(${growthIndicator(d.outlook).rotation}, ${(x(d.microMarket) || 0) + x.bandwidth() / 2}, ${y(d.q42024) - 10})`,
        )
        .each(function (d) {
          const element = this as SVGTextElement
          const animation = d3
            .select(element)
            .append("animate")
            .attr("attributeName", "opacity")
            .attr("values", "1;0.5;1")
            .attr("dur", "2s")
            .attr("repeatCount", "indefinite")
        })
    }
  }, [data, growthIndicator]) // Added growthIndicator to dependencies

  useEffect(() => {
    if (!pieChartRef.current || !data || !data.segmentData) return

    const svg = d3.select(pieChartRef.current)
    svg.selectAll("*").remove()

    const width = pieChartRef.current.clientWidth
    const height = 400
    const radius = Math.min(width, height) / 2.5

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    const pie = d3.pie().value((d: any) => d.value)

    const segments = [
      { name: "Mid Segment", value: data.segmentData.midSegment },
      { name: "High Segment", value: data.segmentData.highSegment },
      { name: "Affordable Segment", value: data.segmentData.affordableSegment },
    ]

    const arc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.9)

    const arcHover = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 1.1)

    const arcs = chart.selectAll("arc").data(pie(segments)).enter().append("g")

    arcs
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d: any, i: number) => premiumColors[i % premiumColors.length])
      .attr("stroke", (d: any, i: number) => d3.color(premiumColors[i % premiumColors.length])?.darker(0.5) as string)
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.3))")
      .style("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arcHover as any)
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc as any)
      })

    arcs
      .append("text")
      .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d: any) => `${d.data.value}%`)

    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(segments)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(10,${(i * 20) + height - 60})`)

    legend
      .append("rect")
      .attr("x", 0)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", (d, i) => premiumColors[i % premiumColors.length])

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .style("fill", theme === "dark" ? "#E0E0E0" : "#333333")
      .style("font-weight", "bold")
      .text((d) => `${d.name}: ${d.value}%`)
  }, [data])

  const renderQoQChart = () => {
    if (!qoqChartRef.current || !data || !data.marketData) return

    const svg = d3.select(qoqChartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 120, left: 60 }
    const width = qoqChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.marketData.map((d) => d.microMarket))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        Math.min(0, d3.min(data.marketData, (d) => d.qoqChange) || 0),
        Math.max(0, d3.max(data.marketData, (d) => d.qoqChange) || 0),
      ])

    chart
      .append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 0)
      .attr("dy", ".35em")
      .attr("transform", "rotate(0)")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .each(function (d) {
        const text = d3.select(this)
        const words = d.split(/[/,]/)
        text.text("")
        for (let i = 0; i < words.length; i++) {
          const tspan = text
            .append("tspan")
            .text(words[i])
            .attr("x", 0)
            .attr("dy", i ? "1.2em" : "0.7em")
        }
      })

    chart.append("g").call(d3.axisLeft(y)).style("font-weight", "bold")

    chart
      .selectAll(".bar")
      .data(data.marketData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.microMarket) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(Math.max(0, d.qoqChange)))
      .attr("height", (d) => Math.abs(y(d.qoqChange) - y(0)))
      .attr("fill", (d) => getScoreColor(d.qoqChange))

    chart
      .selectAll(".label")
      .data(data.marketData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.microMarket) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.qoqChange) + (d.qoqChange >= 0 ? -5 : 15))
      .attr("text-anchor", "middle")
      .text((d) => `${d.qoqChange}%`)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", theme === "dark" ? "#E0E0E0" : "#333333")
      .style("animation", "blink 1s infinite")
  }

  const renderYoYChart = () => {
    if (!yoyChartRef.current || !data || !data.marketData) return

    const svg = d3.select(yoyChartRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 120, left: 60 }
    const width = yoyChartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.marketData.map((d) => d.microMarket))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        Math.min(0, d3.min(data.marketData, (d) => d.yoyChange) || 0),
        Math.max(0, d3.max(data.marketData, (d) => d.yoyChange) || 0),
      ])

    chart
      .append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 0)
      .attr("dy", ".35em")
      .attr("transform", "rotate(0)")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .each(function (d) {
        const text = d3.select(this)
        const words = d.split(/[/,]/)
        text.text("")
        for (let i = 0; i < words.length; i++) {
          const tspan = text
            .append("tspan")
            .text(words[i])
            .attr("x", 0)
            .attr("dy", i ? "1.2em" : "0.7em")
        }
      })

    chart.append("g").call(d3.axisLeft(y)).style("font-weight", "bold")

    chart
      .selectAll(".bar")
      .data(data.marketData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.microMarket) || 0)
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(Math.max(0, d.yoyChange)))
      .attr("height", (d) => Math.abs(y(d.yoyChange) - y(0)))
      .attr("fill", (d) => getScoreColor(d.yoyChange))

    chart
      .selectAll(".label")
      .data(data.marketData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (x(d.microMarket) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.yoyChange) + (d.yoyChange >= 0 ? -5 : 15))
      .attr("text-anchor", "middle")
      .text((d) => `${d.yoyChange}%`)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", theme === "dark" ? "#E0E0E0" : "#333333")
      .style("animation", "blink 1s infinite")
  }

  useEffect(() => {
    renderQoQChart()
    renderYoYChart()
  }, [data])

  const renderPropertyTables = (propertyData: PropertyData[]) => {
    const launchedProjects = propertyData.filter((project) => project.status === "Launched")
    const completedProjects = propertyData.filter((project) => project.status === "Completed")

    return (
      <>
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-semibold mb-2">Key Property Launches</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Size (sq ft)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {launchedProjects.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>{project.property}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.developer}</TableCell>
                    <TableCell>{project.units}</TableCell>
                    <TableCell>{project.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-semibold mb-2">Key Completed Projects</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Size (sq ft)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProjects.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>{project.property}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>{project.developer}</TableCell>
                    <TableCell>{project.units}</TableCell>
                    <TableCell>{project.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    )
  }

  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes blink {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="space-y-4">
      {city === "India" ? (
        <IndiaPageData />
      ) : (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold mb-2">Average Quoted Capital (INR/SFT)</h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <svg ref={chartRef} className="w-full h-full"></svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold mb-2">QOQ Growth by Micro Market</h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <svg ref={qoqChartRef} className="w-full h-full"></svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold mb-2">YOY Growth by Micro Market</h3>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <svg ref={yoyChartRef} className="w-full h-full"></svg>
              </div>
            </CardContent>
          </Card>

          {data.segmentData && data.segmentData.yoyGrowth !== undefined && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <h3 className="text-lg font-semibold mb-2">YOY Growth</h3>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-6xl font-bold transition-colors duration-300 ${
                    data.segmentData.yoyGrowth > 5
                      ? "text-green-500"
                      : data.segmentData.yoyGrowth >= 0
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {data.segmentData.yoyGrowth}%
                </p>
              </CardContent>
            </Card>
          )}

          {data.segmentData && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold mb-2">2024 Q4 Launches by Segment</h3>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <svg ref={pieChartRef} className="w-full h-full"></svg>
                </div>
              </CardContent>
            </Card>
          )}

          {data.propertyData && data.propertyData.length > 0 && renderPropertyTables(data.propertyData)}
        </>
      )}
    </div>
  )
}

export default CitySpecificData

