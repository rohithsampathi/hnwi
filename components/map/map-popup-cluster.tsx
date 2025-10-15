// components/map/map-popup-cluster.tsx
// Cluster popup component showing list of opportunities at the same location

"use client"

import React from "react"
import { Crown } from "lucide-react"
import type { City } from "@/components/interactive-world-map"
import { formatValue, cleanTitle } from "@/lib/map-utils"

interface MapPopupClusterProps {
  cities: City[]
  theme: string
  onCityClick: (city: City, expand: boolean) => void
  clusterCities: Array<{ cities: [City]; center: City }>
  clusterIndex: number
}

export function MapPopupCluster({
  cities,
  theme,
  onCityClick,
  clusterCities,
  clusterIndex
}: MapPopupClusterProps) {
  return (
    <div className={`p-3 ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
      <h3 className="font-bold text-sm mb-3 text-primary">
        {cities.length} Opportunities in this area
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {cities.map((city, cityIndex) => (
          <div
            key={`cluster-city-${cityIndex}`}
            className="p-2 rounded border border-border hover:bg-muted cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              // Find the cluster index for this city after zoom
              const targetClusterIndex = clusterCities.findIndex(c =>
                c.cities.some(ct => ct.title === city.title)
              )
              onCityClick(city, true)
            }}
          >
            {city.start_date && (
              <p className="text-xs text-muted-foreground mb-1">
                {new Date(city.start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            )}
            <p className="font-semibold text-xs mb-1 flex items-center gap-1.5">
              {city.source?.toLowerCase().includes('crown vault') && (
                <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              )}
              {cleanTitle(city.title, city.source) || city.name}
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{city.value ? formatValue(city.value) : ''}</span>
              <span>{city.risk}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Click an opportunity to view details
      </p>
    </div>
  )
}
