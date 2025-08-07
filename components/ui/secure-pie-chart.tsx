"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface AssetData {
  name: string
  displayName?: string  // Optional improved display name
  value: number
  count: number
  percentage: string
}

interface SecurePieChartProps {
  data: AssetData[]
  totalValue: number
  centerLabel?: string
  colors?: string[]
  className?: string
  height?: number
  showTooltip?: boolean
  showCenter?: boolean
}

const defaultColors = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  '#22c55e', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4'  // cyan-500
]

export function SecurePieChart({
  data,
  totalValue,
  centerLabel = "Total Portfolio",
  colors = defaultColors,
  className = "",
  height = 400,
  showTooltip = true,
  showCenter = true
}: SecurePieChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[400px] ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="h-[400px] sm:h-[450px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={"103.5%"}
              innerRadius={"44%"}
              fill="#8884d8"
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={4}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity drop-shadow-lg"
                  style={{ outline: 'none' }}
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                wrapperStyle={{ zIndex: 99999 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    return (
                      <div className="bg-popover border-2 border-primary rounded-2xl p-4 shadow-2xl" style={{ zIndex: 99999, position: 'relative' }}>
                        <div className="text-center">
                          <div className="font-bold text-lg text-foreground capitalize">{data.payload.displayName || data.payload.name.replace('_', ' ')}</div>
                          <div className="text-2xl font-bold text-primary mt-1">{formatCurrency(Number(data.value))}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {data.payload.percentage}% of portfolio
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {data.payload.count} {data.payload.count === 1 ? 'asset' : 'assets'}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {showCenter && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="text-center">
            <p className="text-sm sm:text-base text-foreground/70 font-bold">{centerLabel}</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary mt-1 drop-shadow-lg">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs sm:text-sm text-foreground/60 font-semibold mt-1">
              {data.length} {data.length === 1 ? 'Category' : 'Categories'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}