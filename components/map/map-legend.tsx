// components/map/map-legend.tsx
// Color legend for map showing price-based color coding

"use client"

import React, { useMemo } from "react"
import {
  GRADIENT_COLORS,
  MAP_PRICE_COLOR_RUBY_START,
  MAP_PRICE_COLOR_TOPAZ_START,
} from "@/lib/map-color-utils"

interface MapLegendProps {
  minValue?: string | number
  maxValue?: string | number
  className?: string
}

export function MapLegend({ minValue, maxValue, className = "" }: MapLegendProps) {
  const gradient = `linear-gradient(to right, ${GRADIENT_COLORS
    .map((stop) => `${stop.hex} ${stop.pos}%`)
    .join(', ')})`

  // Format value for display
  const formatValue = useMemo(() => {
    return (value: string | number | undefined): string => {
      if (value === undefined || value === null) return "N/A"

      // Convert to number if it's a string
      let num: number
      if (typeof value === 'string') {
        // Remove currency symbols and extract number
        const numStr = value.replace(/[^0-9.KMB]/gi, '')

        // Handle K, M, B suffixes
        if (value.toUpperCase().includes('B')) {
          num = parseFloat(numStr) * 1000000000
        } else if (value.toUpperCase().includes('M')) {
          num = parseFloat(numStr) * 1000000
        } else if (value.toUpperCase().includes('K')) {
          num = parseFloat(numStr) * 1000
        } else {
          num = parseFloat(numStr)
        }
      } else {
        num = value
      }

      // Format the number
      if (isNaN(num)) return "N/A"
      if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
      if (num >= 1000000) {
        const millions = num / 1000000
        return `$${Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)}M`
      }
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`
      return `$${num.toFixed(0)}`
    }
  }, [])

  return (
    <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg ${className}`}>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground mb-1">Entry Investment</p>

        {/* Color Gradient Bar */}
        <div className="relative h-3 rounded-full overflow-hidden" style={{
          background: gradient
        }}>
          {/* Optional: Add tick marks */}
        </div>

        {/* Labels */}
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {minValue !== undefined ? formatValue(minValue) : 'Lower'}
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {formatValue(MAP_PRICE_COLOR_TOPAZ_START)}
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            {maxValue !== undefined ? formatValue(maxValue) : `${formatValue(MAP_PRICE_COLOR_RUBY_START)}+`}
          </span>
        </div>
      </div>
    </div>
  )
}
