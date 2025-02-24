// components/investment-globe.tsx

"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import Globe from "react-globe.gl"
import * as d3 from "d3"
import type { Region } from "@/lib/invest-scan-data"

interface InvestmentGlobeProps {
  regions: Region[]
  onRegionSelect: (regionId: string) => void
}

export function InvestmentGlobe({ regions, onRegionSelect }: InvestmentGlobeProps) {
  const globeEl = useRef<any>()
  const { theme } = useTheme()

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.5
    }
  }, [])

  const colorScale = d3
    .scaleSequential(d3.interpolateYlOrRd)
    .domain([0, Math.max(...regions.map((r) => r.opportunities.length))])

  return (
    <Globe
      ref={globeEl}
      globeImageUrl={`/assets/${theme === "dark" ? "earth-night.jpg" : "earth-day.jpg"}`}
      backgroundColor="rgba(0,0,0,0)"
      width={800}
      height={600}
      labelsData={regions}
      labelLat={(d) => d.position[1]}
      labelLng={(d) => d.position[0]}
      labelText={(d) => d.name}
      labelSize={(d) => Math.sqrt(d.opportunities.length) * 4 + 3}
      labelDotRadius={(d) => Math.sqrt(d.opportunities.length) * 4 + 3}
      labelColor={(d) => colorScale(d.opportunities.length)}
      labelResolution={2}
      onLabelClick={(label) => {
        const region = label as unknown as Region
        onRegionSelect(region.id)
      }}
      labelLabel={(label) => {
        const region = label as unknown as Region
        return `
          <div class="p-2 bg-white rounded shadow">
            <strong>${region.name}</strong><br/>
            ${region.opportunities.length} opportunities
          </div>
        `
      }}
    />
  )
}

