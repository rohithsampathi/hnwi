// components/world-map.tsx

"use client"

import { useState } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

export function WorldMap({ theme }: { theme: "dark" | "light" }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <div className="w-full h-[400px]">
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onMouseEnter={() => {
                  setSelectedRegion(geo.properties.name)
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
                    fill: theme === "dark" ? "#42A5F5" : "#B3E5FC",
                    outline: "none",
                  },
                  pressed: {
                    fill: theme === "dark" ? "#1E88E5" : "#81D4FA",
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

