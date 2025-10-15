// components/map/map-filter-controls.tsx
// Ultra-lean dual-range slider using react-range-slider-input

"use client"

import React from "react"
import { Crown, Gem, Globe } from "lucide-react"
import RangeSlider from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"

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
}

const MIN = 0
const MAX = 1000000

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M+`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value}`
}

// Mobile variant - ultra minimal
export function MapFilterControlsMobile(props: MapFilterControlsProps) {
  return (
    <div className="lg:hidden fixed bottom-[120px] md:bottom-[60px] left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
      <div className="flex flex-col items-center gap-1.5">
        {/* Ultra-lean slider */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-2.5 py-1 shadow-lg min-w-[260px] flex flex-col items-center">
          <div className="text-[10px] font-medium text-muted-foreground text-center -mt-1 -mb-1">
            {formatCurrency(props.selectedPriceRange.min)} — {formatCurrency(props.selectedPriceRange.max)}
          </div>

          <div className="custom-range-slider-mobile w-[90%]">
            <RangeSlider
              min={MIN}
              max={MAX}
              step={10000}
              value={[props.selectedPriceRange.min, props.selectedPriceRange.max]}
              onInput={(values: number[]) => {
                props.onPriceRangeChange({ min: values[0], max: values[1] })
              }}
            />
          </div>

          <style jsx global>{`
            .custom-range-slider-mobile .range-slider {
              height: 14px !important;
              background: transparent !important;
            }
            .custom-range-slider-mobile .range-slider__range {
              background: hsl(var(--primary)) !important;
              height: 3px !important;
            }
            .custom-range-slider-mobile .range-slider__thumb {
              width: 12px !important;
              height: 12px !important;
              background: hsl(var(--primary)) !important;
              border: 2px solid ${props.theme === 'dark' ? '#fff' : '#000'} !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
              cursor: grab !important;
            }
            .custom-range-slider-mobile .range-slider__thumb:active {
              cursor: grabbing !important;
              transform: scale(1.15) !important;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
            }
            .custom-range-slider-mobile .range-slider__track {
              background: transparent !important;
              height: 3px !important;
            }
          `}</style>
        </div>

        {/* Filter icons */}
        <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-full px-2.5 py-1.5 shadow-lg">
          <button
            onClick={() => props.onToggleCrownAssets()}
            className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
              props.showCrownAssets
                ? props.theme === 'dark'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-black text-white font-medium'
                : 'text-muted-foreground'
            }`}
            aria-label="Crown Assets"
          >
            <Crown className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Crown</span>
          </button>

          <button
            onClick={() => props.onTogglePriveOpportunities()}
            className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
              props.showPriveOpportunities
                ? props.theme === 'dark'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-black text-white font-medium'
                : 'text-muted-foreground'
            }`}
            aria-label="Privé Opportunities"
          >
            <Gem className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Privé</span>
          </button>

          <button
            onClick={() => props.onToggleHNWIPatterns()}
            className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
              props.showHNWIPatterns
                ? props.theme === 'dark'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'bg-black text-white font-medium'
                : 'text-muted-foreground'
            }`}
            aria-label="HNWI Patterns"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden md:inline">HNWI</span>
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={props.onReset}
          className="text-xs px-2.5 py-1 text-muted-foreground hover:text-primary transition-colors"
        >
          🌍 World View
        </button>
      </div>
    </div>
  )
}

// Desktop variant - ultra minimal
export function MapFilterControlsDesktop(props: MapFilterControlsProps) {
  return (
    <div className="hidden lg:block fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
      <div className="flex flex-col items-center gap-3">
        {/* Ultra-lean slider */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-1 shadow-lg min-w-[300px] flex flex-col items-center">
          <div className="text-[10px] font-medium text-muted-foreground text-center -mt-1 -mb-1">
            {formatCurrency(props.selectedPriceRange.min)} — {formatCurrency(props.selectedPriceRange.max)}
          </div>

          <div className="custom-range-slider-desktop w-[90%]">
            <RangeSlider
              min={MIN}
              max={MAX}
              step={10000}
              value={[props.selectedPriceRange.min, props.selectedPriceRange.max]}
              onInput={(values: number[]) => {
                props.onPriceRangeChange({ min: values[0], max: values[1] })
              }}
            />
          </div>

          <style jsx global>{`
            .custom-range-slider-desktop .range-slider {
              height: 14px !important;
              background: transparent !important;
            }
            .custom-range-slider-desktop .range-slider__range {
              background: hsl(var(--primary)) !important;
              height: 3px !important;
            }
            .custom-range-slider-desktop .range-slider__thumb {
              width: 14px !important;
              height: 14px !important;
              background: hsl(var(--primary)) !important;
              border: 2px solid ${props.theme === 'dark' ? '#fff' : '#000'} !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
              cursor: grab !important;
            }
            .custom-range-slider-desktop .range-slider__thumb:active {
              cursor: grabbing !important;
              transform: scale(1.15) !important;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
            }
            .custom-range-slider-desktop .range-slider__track {
              background: transparent !important;
              height: 3px !important;
            }
          `}</style>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
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
            <Globe className="h-3.5 w-3.5" />
            <span>HNWI Patterns</span>
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <button
            onClick={props.onReset}
            className="text-xs px-2.5 py-1 text-muted-foreground hover:text-primary transition-colors"
          >
            🌍 World View
          </button>
        </div>
      </div>
    </div>
  )
}
