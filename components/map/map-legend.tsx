// components/map/map-legend.tsx
// Color legend for map showing price-based color coding

"use client"

import React, { useMemo } from "react"

interface MapLegendProps {
  minValue?: string | number
  maxValue?: string | number
  className?: string
}

export function MapLegend({ minValue, maxValue, className = "" }: MapLegendProps) {
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
      if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
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
          background: 'linear-gradient(to right, #0d5c3a 0%, #17a561 5%, #2dd17f 10%, #50e991 20%, #ffd700 30%, #ffb000 40%, #ff8c00 50%, #e63946 65%, #c1121f 80%, #800020 100%)'
        }}>
          {/* Optional: Add tick marks */}
        </div>

        {/* Labels */}
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {minValue !== undefined ? formatValue(minValue) : 'Lower'}
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Mid-range
          </span>
          <span className="text-red-600 dark:text-red-400 font-medium">
            {maxValue !== undefined ? formatValue(maxValue) : 'Higher'}
          </span>
        </div>
      </div>
    </div>
  )
}
