// components/map/map-filter-controls.tsx
// Ultra-lean dual-range slider with native implementation

"use client"

import React, { useState, useEffect, useRef } from "react"
import { Crown, Gem, TrendingUp, ZoomOut } from "lucide-react"

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

// Dual Range Slider Component
function DualRangeSlider({ min, max, step, value, onChange, theme }: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (values: [number, number]) => void;
  theme: string;
}) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Convert value to percentage
  const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  // Update range bar position when values change
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (rangeRef.current) {
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal]);

  // Sync with external value changes
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(newMinVal);
    minValRef.current = newMinVal;
    onChange([newMinVal, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(newMaxVal);
    maxValRef.current = newMaxVal;
    onChange([minVal, newMaxVal]);
  };

  return (
    <div className="relative w-full h-3 flex items-center">
      {/* Track background */}
      <div className="absolute w-full h-[3px] bg-muted-foreground/30 rounded-full" />

      {/* Active range */}
      <div
        ref={rangeRef}
        className="absolute h-[3px] bg-primary rounded-full z-[1]"
      />

      {/* Min range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="dual-range-slider dual-range-slider-min"
        style={{
          position: 'absolute',
          width: '100%',
          pointerEvents: 'all',
          zIndex: minVal > max - 100 ? 5 : 3,
        }}
      />

      {/* Max range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="dual-range-slider dual-range-slider-max"
        style={{
          position: 'absolute',
          width: '100%',
          pointerEvents: 'all',
          zIndex: 4,
        }}
      />

      <style jsx global>{`
        .dual-range-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          background: transparent;
          outline: none;
        }

        .dual-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: hsl(var(--primary));
          border: 2px solid ${theme === 'dark' ? '#fff' : '#000'};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 10;
        }

        .dual-range-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: hsl(var(--primary));
          border: 2px solid ${theme === 'dark' ? '#fff' : '#000'};
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 10;
        }

        .dual-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .dual-range-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .dual-range-slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .dual-range-slider::-moz-range-thumb:active {
          transform: scale(1.15);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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
