// components/investment-globe.tsx

"use client"

import { useRef, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import Globe, { type GlobeMethods } from "react-globe.gl"
import chroma from "chroma-js"
import type { Region } from "@/lib/invest-scan-data"

interface InvestmentGlobeProps {
  regions: Region[]
  onRegionSelect: (regionId: string) => void
}

export function InvestmentGlobe({ regions, onRegionSelect }: InvestmentGlobeProps) {
  const globeEl = useRef<GlobeMethods | undefined>(undefined)
  const { theme } = useTheme()
  const toRegion = (region: object) => region as Region

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true
      globeEl.current.controls().autoRotateSpeed = 0.5
    }
  }, [])

  const maxOpportunities = Math.max(...regions.map((r) => r.opportunities.length)) || 1
  const colorScale = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value / maxOpportunities))
    return chroma.scale(["#fff5eb", "#d94801", "#7f2704"])(clamped).hex()
  }

  return (
    <Globe
      ref={globeEl}
      globeImageUrl={`/assets/${theme === "dark" ? "earth-night.jpg" : "earth-day.jpg"}`}
      backgroundColor="rgba(0,0,0,0)"
      width={800}
      height={600}
      labelsData={regions}
      labelLat={(region) => toRegion(region).position[1]}
      labelLng={(region) => toRegion(region).position[0]}
      labelText={(region) => toRegion(region).name}
      labelSize={(region) => Math.sqrt(toRegion(region).opportunities.length) * 4 + 3}
      labelDotRadius={(region) => Math.sqrt(toRegion(region).opportunities.length) * 4 + 3}
      labelColor={(region) => colorScale(toRegion(region).opportunities.length)}
      labelResolution={2}
      onLabelClick={(label) => {
        const region = toRegion(label)
        onRegionSelect(region.id)
      }}
      labelLabel={(label) => {
        const region = toRegion(label)
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
