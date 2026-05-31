"use client"

import React from "react"
import { useTheme } from "@/contexts/theme-context"

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
  valueFormatter?: (value: number) => string
  centerValueLabel?: string
}

const defaultColors = [
  '#DAA520',                 // Rich Gold - primary luxury color
  '#DC2626',                 // Deep Red - classic wealth color
  '#059669',                 // Rich Emerald - premium green
  '#7C3AED',                 // Royal Purple - luxury accent
  '#EA580C',                 // Burnt Orange - sophisticated warmth
  '#0284C7',                 // Deep Blue - trust and stability
  '#BE185D',                 // Rich Magenta - premium accent
  '#059669',                 // Forest Green - wealth/growth
  '#B45309',                 // Rich Amber - luxury variant
  '#4338CA',                 // Deep Indigo - premium blue
  '#BE123C',                 // Crimson Red - luxury red
  '#047857',                 // Deep Teal - sophisticated green
  '#9333EA',                 // Rich Violet - premium purple
  '#C2410C',                 // Terracotta - earthy luxury
  '#1D4ED8',                 // Rich Blue - premium variant
  '#BE185D',                 // Rose - elegant accent
  '#065F46',                 // Dark Green - wealth tone
  '#7C2D12',                 // Rich Brown - luxury earth
  '#581C87',                 // Deep Purple - royal variant
  '#92400E',                 // Golden Brown - premium earth
  '#1E40AF',                 // Navy Blue - trust variant
  '#991B1B'                  // Dark Red - luxury crimson
]

export function SecurePieChart({
  data,
  totalValue,
  centerLabel = "Total Portfolio",
  colors = defaultColors,
  className = "",
  height = 400,
  showTooltip = true,
  showCenter = true,
  valueFormatter,
  centerValueLabel,
}: SecurePieChartProps) {
  const { theme } = useTheme()
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
  const renderValue = valueFormatter || formatCurrency;
  const chartData = (data || []).filter((item) => Number.isFinite(item.value) && item.value > 0);
  const totalChartValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const normalizedTotal = totalChartValue > 0 ? totalChartValue : totalValue;
  const size = Math.max(240, Math.min(520, height));
  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.22;

  const describeArc = (startAngle: number, endAngle: number): string => {
    const startOuter = polarToCartesian(center, center, outerRadius, endAngle);
    const endOuter = polarToCartesian(center, center, outerRadius, startAngle);
    const startInner = polarToCartesian(center, center, innerRadius, startAngle);
    const endInner = polarToCartesian(center, center, innerRadius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      "L", startInner.x, startInner.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, endInner.x, endInner.y,
      "Z",
    ].join(" ");
  };

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ minHeight: height }}>
      <div className="relative w-full max-w-[520px]" style={{ height }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`${centerLabel} allocation chart`}
        >
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={outerRadius - innerRadius}
            opacity="0.35"
          />
          {chartData.reduce<Array<{ item: AssetData; start: number; end: number; index: number }>>((segments, item, index) => {
            const start = segments[index - 1]?.end ?? -90;
            const span = (item.value / normalizedTotal) * 360;
            segments.push({ item, start, end: start + span, index });
            return segments;
          }, []).map(({ item, start, end, index }) => {
            const span = end - start;
            const label = `${item.displayName || item.name.replace(/_/g, " ")}: ${renderValue(item.value)} (${item.percentage}% / ${item.count} ${item.count === 1 ? "asset" : "assets"})`;
            if (span >= 359.99) {
              return (
                <circle
                  key={`${item.name}-${index}`}
                  cx={center}
                  cy={center}
                  r={(outerRadius + innerRadius) / 2}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth={outerRadius - innerRadius}
                  className="transition-opacity hover:opacity-80"
                >
                  {showTooltip && <title>{label}</title>}
                </circle>
              );
            }
            return (
              <path
                key={`${item.name}-${index}`}
                d={describeArc(start, end)}
                fill={colors[index % colors.length]}
                stroke="hsl(var(--background))"
                strokeWidth="3"
                className="transition-opacity hover:opacity-80"
              >
                {showTooltip && <title>{label}</title>}
              </path>
            );
          })}
        </svg>
      </div>
      
      {showCenter && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <div className="text-center">
            <p className="text-sm sm:text-base text-foreground/70 font-bold">{centerLabel}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 drop-shadow-lg ${theme === 'dark' ? 'text-primary' : 'text-black'}`}>
              {centerValueLabel || renderValue(totalValue)}
            </p>
            <p className="text-xs sm:text-sm text-foreground/60 font-semibold mt-1">
              {chartData.length} {chartData.length === 1 ? 'Category' : 'Categories'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
