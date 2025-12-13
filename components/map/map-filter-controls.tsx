// components/map/map-filter-controls.tsx
// Ultra-lean dual-range slider with native implementation

"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Crown, Gem, TrendingUp, ZoomOut } from "lucide-react"
import Slider from "rc-slider"
import "rc-slider/assets/index.css"

interface MapFilterControlsProps {
  selectedPriceRange: { min: number; max: number }
  onPriceRangeChange: (range: { min: number; max: number }) => void
  showCrownAssets: boolean
  showPriveOpportunities: boolean
  showHNWIPatterns: boolean
  onToggleCrownAssets: () => void
  onTogglePriveOpportunities: () => void
  onToggleHNWIPatterns: () => void
  onReset: () => void
  theme: string
  currentZoom: number
  hideCrownAssetsToggle?: boolean // Hide Crown Assets toggle (for assessment)
  useAbsolutePositioning?: boolean // Use absolute positioning for assessment (inside map frame)
}

const MIN = 0
const MAX = 1000000

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M+`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

// Color stops for the gradient
// Green: 0-100K (0-10%), Yellow/Gold: 100K-800K (10-80%), Red: 800K-1M (80-100%)
const GRADIENT_COLORS = [
  { pos: 0, color: [13, 92, 58], hex: '#0d5c3a' },      // 0K - Deep dark emerald
  { pos: 5, color: [23, 165, 97], hex: '#17a561' },     // 50K - Vibrant emerald
  { pos: 10, color: [45, 209, 127], hex: '#2dd17f' },   // 100K - Bright emerald green
  { pos: 20, color: [80, 233, 145], hex: '#50e991' },   // 200K - Light emerald
  { pos: 30, color: [120, 240, 160], hex: '#78f0a0' },  // 300K - Lighter emerald
  { pos: 40, color: [255, 215, 0], hex: '#ffd700' },    // 400K - Pure golden topaz
  { pos: 50, color: [255, 200, 0], hex: '#ffc800' },    // 500K - Bright gold
  { pos: 60, color: [255, 176, 0], hex: '#ffb000' },    // 600K - Rich golden amber
  { pos: 70, color: [255, 150, 0], hex: '#ff9600' },    // 700K - Deep amber
  { pos: 80, color: [230, 57, 70], hex: '#e63946' },    // 800K - Bright ruby red (RED STARTS HERE)
  { pos: 90, color: [193, 18, 31], hex: '#c1121f' },    // 900K - Rich ruby
  { pos: 100, color: [128, 0, 32], hex: '#800020' }     // 1M - Deep dark burgundy ruby
]

// Get color from gradient based on percentage (0-100)
function getGradientColor(percent: number): string {
  // Find the two colors to interpolate between
  let lowerColor = GRADIENT_COLORS[0]
  let upperColor = GRADIENT_COLORS[GRADIENT_COLORS.length - 1]

  for (let i = 0; i < GRADIENT_COLORS.length - 1; i++) {
    if (percent >= GRADIENT_COLORS[i].pos && percent <= GRADIENT_COLORS[i + 1].pos) {
      lowerColor = GRADIENT_COLORS[i]
      upperColor = GRADIENT_COLORS[i + 1]
      break
    }
  }

  // Interpolate between the two colors
  const range = upperColor.pos - lowerColor.pos
  const rangePct = range === 0 ? 0 : (percent - lowerColor.pos) / range

  const r = Math.round(lowerColor.color[0] + (upperColor.color[0] - lowerColor.color[0]) * rangePct)
  const g = Math.round(lowerColor.color[1] + (upperColor.color[1] - lowerColor.color[1]) * rangePct)
  const b = Math.round(lowerColor.color[2] + (upperColor.color[2] - lowerColor.color[2]) * rangePct)

  return `rgb(${r}, ${g}, ${b})`
}

// Generate gradient CSS with proper color stops for a specific range
function getGradientForRange(minPercent: number, maxPercent: number): string {
  // Filter color stops that fall within or near the range
  const relevantStops = GRADIENT_COLORS.filter(stop =>
    stop.pos >= minPercent && stop.pos <= maxPercent
  )

  // Always include the start and end colors
  const stops = [
    { pos: minPercent, color: getGradientColor(minPercent) },
    ...relevantStops.map(stop => ({ pos: stop.pos, color: stop.hex })),
    { pos: maxPercent, color: getGradientColor(maxPercent) }
  ]

  // Remove duplicates and sort
  const uniqueStops = stops.filter((stop, index, self) =>
    index === self.findIndex(s => s.pos === stop.pos)
  ).sort((a, b) => a.pos - b.pos)

  // Convert to gradient string with positions relative to the range
  const gradientStops = uniqueStops.map(stop => {
    const relativePos = ((stop.pos - minPercent) / (maxPercent - minPercent)) * 100
    return `${stop.color} ${relativePos}%`
  }).join(', ')

  return `linear-gradient(to right, ${gradientStops})`
}

// Dual Range Slider Component using rc-slider
function DualRangeSlider({ min, max, step, value, onChange, theme }: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (values: [number, number]) => void;
  theme: string;
}) {
  // Convert value to percentage
  const getPercent = (val: number) => Math.round(((val - min) / (max - min)) * 100);

  // Get colors for thumbs based on position
  const minThumbColor = useMemo(() => getGradientColor(getPercent(value[0])), [value[0]]);
  const maxThumbColor = useMemo(() => getGradientColor(getPercent(value[1])), [value[1]]);

  // Get gradient for the active range
  const rangeGradient = useMemo(() => {
    const minPercent = getPercent(value[0]);
    const maxPercent = getPercent(value[1]);
    return getGradientForRange(minPercent, maxPercent);
  }, [value[0], value[1]]);

  const borderColor = theme === 'dark' ? '#fff' : '#000';

  return (
    <div className="relative w-full h-3 flex items-center">
      {/* Full gradient background (reference) */}
      <div
        className="absolute w-full h-[3px] rounded-full opacity-30 top-1/2 -translate-y-1/2"
        style={{
          background: 'linear-gradient(to right, #0d5c3a 0%, #17a561 5%, #2dd17f 10%, #50e991 20%, #78f0a0 30%, #ffd700 40%, #ffc800 50%, #ffb000 60%, #ff9600 70%, #e63946 80%, #c1121f 90%, #800020 100%)'
        }}
      />

      <Slider
        range
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(val) => {
          if (Array.isArray(val) && val.length === 2) {
            onChange([val[0], val[1]]);
          }
        }}
        styles={{
          rail: {
            backgroundColor: 'transparent',
            height: 3,
          },
          track: {
            background: rangeGradient,
            height: 3,
          },
          handle: {
            width: 14,
            height: 14,
            marginTop: -5.5,
            opacity: 1,
            border: `2px solid ${borderColor}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
        }}
        handleRender={(node, props) => {
          const isMin = props.index === 0;
          const color = isMin ? minThumbColor : maxThumbColor;

          return React.cloneElement(node, {
            ...node.props,
            style: {
              ...node.props.style,
              backgroundColor: color,
            },
          });
        }}
      />

      <style jsx global>{`
        .rc-slider-handle:hover {
          transform: scale(1.1);
        }
        .rc-slider-handle:active {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
        }
      `}</style>
    </div>
  );
}

// Mobile variant - ultra minimal
export function MapFilterControlsMobile(props: MapFilterControlsProps) {
  // Detect landscape mode for better positioning
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerHeight < 500 && window.innerWidth > window.innerHeight
      setIsLandscape(isLandscapeMode)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return (
    <div
      className={`lg:hidden ${props.useAbsolutePositioning ? 'absolute' : 'fixed'} left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto transition-all ${
        props.useAbsolutePositioning
          ? 'bottom-[30px]'
          : isLandscape ? 'bottom-[10px]' : 'bottom-[150px] md:bottom-[90px]'
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Ultra-compact slider for mobile */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 shadow-lg min-w-[220px] flex flex-col items-center gap-1">
          <div className="text-[9px] font-medium text-muted-foreground text-center">
            {formatCurrency(props.selectedPriceRange.min)} — {formatCurrency(props.selectedPriceRange.max)}
          </div>

          <div className="w-[90%]">
            <DualRangeSlider
              min={MIN}
              max={MAX}
              step={10000}
              value={[props.selectedPriceRange.min, props.selectedPriceRange.max]}
              onChange={([min, max]) => props.onPriceRangeChange({ min, max })}
              theme={props.theme}
            />
          </div>
        </div>

        {/* Filter icons and Zoom out on same line - more compact */}
        <div className="flex items-center justify-center gap-2">
          {/* Filter icons with container - smaller padding and icons */}
          <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-full px-2 py-1 shadow-lg">
            <button
              onClick={() => props.onToggleHNWIPatterns()}
              className={`text-xs p-1.5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                props.showHNWIPatterns
                  ? props.theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'bg-black text-white font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="HNWI Patterns"
            >
              <TrendingUp className="h-3 w-3" />
            </button>

            <button
              onClick={() => props.onTogglePriveOpportunities()}
              className={`text-xs p-1.5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                props.showPriveOpportunities
                  ? props.theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'bg-black text-white font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="Privé Opportunities"
            >
              <Gem className="h-3 w-3" />
            </button>

            {!props.hideCrownAssetsToggle && (
              <button
                onClick={() => props.onToggleCrownAssets()}
                className={`text-xs p-1.5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                  props.showCrownAssets
                    ? props.theme === 'dark'
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'bg-black text-white font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                aria-label="Crown Assets"
              >
                <Crown className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Zoom out - only show when zoomed in (zoom > 2) - smaller */}
          {props.currentZoom > 2 && (
            <button
              onClick={props.onReset}
              className="text-xs px-1.5 py-1 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out flex flex-row items-center justify-center gap-0.5 bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
              <span className="text-[9px] font-semibold">Zoom out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Desktop variant - ultra minimal
export function MapFilterControlsDesktop(props: MapFilterControlsProps) {
  return (
    <div className={`hidden lg:block ${props.useAbsolutePositioning ? 'absolute bottom-[40px]' : 'fixed bottom-24'} left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto`}>
      <div className="flex flex-col items-center gap-3">
        {/* Ultra-lean slider */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg min-w-[320px] flex flex-col items-center gap-1.5">
          <div className="text-[10px] font-medium text-muted-foreground text-center">
            {formatCurrency(props.selectedPriceRange.min)} — {formatCurrency(props.selectedPriceRange.max)}
          </div>

          <div className="w-[90%]">
            <DualRangeSlider
              min={MIN}
              max={MAX}
              step={10000}
              value={[props.selectedPriceRange.min, props.selectedPriceRange.max]}
              onChange={([min, max]) => props.onPriceRangeChange({ min, max })}
              theme={props.theme}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          {!props.hideCrownAssetsToggle && (
            <button
              onClick={props.onToggleCrownAssets}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                props.showCrownAssets
                  ? props.theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'bg-black text-white font-medium'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Crown Assets</span>
            </button>
          )}

          <button
            onClick={props.onTogglePriveOpportunities}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
              props.showPriveOpportunities
                ? props.theme === 'dark'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-black text-white font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Gem className="h-3.5 w-3.5" />
            <span>Privé Opportunities</span>
          </button>

          <button
            onClick={props.onToggleHNWIPatterns}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
              props.showHNWIPatterns
                ? props.theme === 'dark'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-black text-white font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>HNWI Patterns</span>
          </button>

          {/* Only show divider and zoom out button when zoomed in */}
          {props.currentZoom > 2 && (
            <>
              <div className="h-4 w-px bg-border mx-1" />

              <button
                onClick={props.onReset}
                className="text-xs px-2.5 py-1 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <ZoomOut className="h-3.5 w-3.5" />
                <span>Zoom out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
