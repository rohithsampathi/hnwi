// components/map/map-filter-controls.tsx
// Ultra-lean dual-range slider using react-range-slider-input

"use client"

import React from "react"
import { Crown, Gem, TrendingUp, ZoomOut } from "lucide-react"
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

// Mobile variant - ultra minimal
export function MapFilterControlsMobile(props: MapFilterControlsProps) {
  // Detect landscape mode for better positioning
  const [isLandscape, setIsLandscape] = React.useState(false)

  React.useEffect(() => {
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
          ? 'bottom-[40px]'
          : isLandscape ? 'bottom-[20px]' : 'bottom-[160px] md:bottom-[100px]'
      }`}
    >
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

        {/* Filter icons and Zoom out on same line */}
        <div className="flex items-center justify-center gap-3">
          {/* Filter icons with container - Reordered: Globe, Diamond, Crown */}
          <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur-sm border border-border rounded-full px-2.5 py-1.5 shadow-lg">
            <button
              onClick={() => props.onToggleHNWIPatterns()}
              className={`text-xs p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                props.showHNWIPatterns
                  ? props.theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium shadow-md'
                    : 'bg-black text-white font-medium shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="HNWI Patterns"
            >
              <TrendingUp className="h-4 w-4" />
            </button>

            <button
              onClick={() => props.onTogglePriveOpportunities()}
              className={`text-xs p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                props.showPriveOpportunities
                  ? props.theme === 'dark'
                    ? 'bg-primary/10 text-primary font-medium shadow-md'
                    : 'bg-black text-white font-medium shadow-md'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              aria-label="Privé Opportunities"
            >
              <Gem className="h-4 w-4" />
            </button>

            {!props.hideCrownAssetsToggle && (
              <button
                onClick={() => props.onToggleCrownAssets()}
                className={`text-xs p-2 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center relative ${
                  props.showCrownAssets
                    ? props.theme === 'dark'
                      ? 'bg-primary/10 text-primary font-medium shadow-md'
                      : 'bg-black text-white font-medium shadow-md'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                aria-label="Crown Assets"
              >
                <Crown className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Zoom out - only show when zoomed in (zoom > 2) */}
          {props.currentZoom > 2 && (
            <button
              onClick={props.onReset}
              className="text-xs px-2 py-1.5 text-muted-foreground hover:text-primary transition-all duration-300 ease-in-out flex flex-row items-center justify-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-full shadow-lg"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">Zoom out</span>
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
