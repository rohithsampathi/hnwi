// components/world-map.tsx

"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const geoUrl = "/assets/maps/world-countries-110m.json"
type SimpleMapGeography = {
  rsmKey: string
  properties: {
    name?: string
  }
}

export function WorldMap({ theme }: { theme: "dark" | "light" }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <div className="w-full h-[400px]">
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: SimpleMapGeography[] }) =>
            geographies.map((geo: SimpleMapGeography) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => {
                  setSelectedRegion(geo.properties.name || null)
                }}
                onMouseLeave={() => {
                  setSelectedRegion(null)
                }}
                style={{
                  default: {
                    fill: theme === "dark" ? "#333" : "#DDD",
                    outline: "none",
                  },
                  hover: {
                    fill: theme === "dark" ? "#22C55E" : "#A7F3D0",
                    outline: "none",
                  },
                  pressed: {
                    fill: theme === "dark" ? "#059669" : "#6EE7B7",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      {selectedRegion && <div className="mt-2 text-center">Selected Region: {selectedRegion}</div>}
    </div>
  )
}
