// components/map/map-popup-single.tsx
// Single opportunity popup with full details - REWRITTEN FOR PROPER SCROLL

"use client"

import React from "react"
import { MapPin, Crown, Globe, Linkedin, Brain } from "lucide-react"
import type { City } from "@/components/interactive-world-map"
import { CitationText } from "@/components/elite/citation-text"
import { FormattedAnalysis } from "@/components/elite/formatted-analysis"
import { AdvancedScrollArea } from "@/components/ui/advanced-scroll-area"
import {
  formatValue,
  formatLabel,
  formatSource,
  cleanTitle,
  cleanAnalysisText
} from "@/lib/map-utils"
import {
  getOpportunityRoute,
  getActionButtonLabel
} from "@/lib/map-routing"

interface MapPopupSingleProps {
  city: City
  theme: string
  expandedClusterId: string | null
  clusterId: string
  onExpand: () => void
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
  onNavigate?: (route: string) => void
  scrollPosition?: number // Optional - no longer used but kept for compatibility
  onScrollPositionChange?: (clusterId: string, position: number) => void // Optional
}

export function MapPopupSingle({
  city,
  theme,
  expandedClusterId,
  clusterId,
  onExpand,
  onCitationClick,
  citationMap,
  onNavigate
}: MapPopupSingleProps) {
  const isExpanded = expandedClusterId === clusterId
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // is_new is already filtered to only include last 5 added opportunities in useOpportunities hook
  const shouldShowNewBadge = city.is_new === true

  // Extract first paragraph from analysis text
  const getFirstParagraph = (text: string | undefined): string => {
    if (!text) return ""
    // Split by double newlines
    const paragraphs = text.split(/\n\n+/)
    return paragraphs[0]?.trim() || text
  }

  // OverlayScrollbars handles scroll isolation natively via CSS containment
  // No need for manual event listeners - advanced-scroll-area handles this

  return (
    <div
      className={`w-full ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}
      style={{ maxWidth: '340px' }}
    >
      {/* FIXED HEADER - Outside scroll container */}
      <div className="p-3">
        {/* Publish Date */}
        {city.start_date && (
          <p className="text-xs text-muted-foreground mb-2">
            {new Date(city.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}

        {/* Title */}
        {city.title && (
          <h3 className="font-bold text-sm mb-2 text-primary flex items-center gap-2">
            {city.source?.toLowerCase().includes('crown vault') && (
              <Crown className="h-4 w-4 text-amber-500" />
            )}
            {cleanTitle(city.title, city.source)}
            {shouldShowNewBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded border border-primary/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                NEW
              </span>
            )}
          </h3>
        )}

        {/* Location */}
        <div className="mb-2 pb-2 border-b border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {city.country}
          </p>
        </div>

        {/* Fixed Metrics */}
        <div className="space-y-1.5">
          {city.value && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Entry Investment:</span>
              <span className="text-xs font-bold text-primary">{formatValue(city.value)}</span>
            </div>
          )}

          {(city as any).cost_per_unit && (city as any).unit_count && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Unit Price:</span>
              <span className="text-xs font-medium">
                {(city as any).unit_count}x @ {formatValue(String((city as any).cost_per_unit))}
              </span>
            </div>
          )}

          {(city as any).appreciation && (city as any).appreciation.percentage !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Appreciation:</span>
              <span className={`text-xs font-medium ${(city as any).appreciation.percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(city as any).appreciation.percentage >= 0 ? '+' : ''}{(city as any).appreciation.percentage.toFixed(1)}%
                {(city as any).appreciation.annualized && (
                  <span className="text-[10px] ml-1">
                    ({(city as any).appreciation.annualized.toFixed(1)}% p.a.)
                  </span>
                )}
              </span>
            </div>
          )}

          {city.risk && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Risk Profile:</span>
              <span className="text-xs font-medium">{formatLabel(city.risk)}</span>
            </div>
          )}

          {city.source && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Source:</span>
              <span className="text-xs font-medium">{formatSource(city.source)}</span>
            </div>
          )}

          {city.victor_score && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Opportunity Demand:</span>
              <span className="text-xs font-medium">{formatLabel(city.victor_score)}</span>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={onExpand}
          className="w-full mt-3 px-3 py-1.5 text-xs font-medium rounded transition-colors bg-primary/10 text-primary hover:bg-primary/20"
        >
          {isExpanded ? "Collapse ▲" : "View Details ▼"}
        </button>
      </div>

      {/* SCROLLABLE CONTENT - Using Advanced OverlayScrollbars */}
      {isExpanded && (
        <div className="border-t border-border" ref={scrollAreaRef}>
          <AdvancedScrollArea maxHeight={280}>
            <div className="px-3 pt-3 pb-8 space-y-3">
            {/* Crown Vault Asset */}
            {city.source?.toLowerCase().includes('crown') && (
              <div className="space-y-3">
                {(city.appreciation || city.price_history || city.cost_per_unit) && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold flex items-center gap-1">
                      <Crown className="h-3 w-3 text-amber-500" />
                      Crown Vault Asset Statistics
                    </p>
                    <div className="space-y-2">
                      {city.cost_per_unit && city.unit_count && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Current Price:</span>
                          <span className="text-xs font-bold">{city.unit_count} units @ ${city.cost_per_unit.toLocaleString()}</span>
                        </div>
                      )}

                      {city.appreciation && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Total Gain:</span>
                            <span className={`text-xs font-bold ${city.appreciation.percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {city.appreciation.percentage >= 0 ? '+' : ''}{city.appreciation.percentage.toFixed(2)}%
                              <span className="text-[10px] ml-1">
                                (${city.appreciation.absolute.toLocaleString()})
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Annualized Return:</span>
                            <span className={`text-xs font-bold ${city.appreciation.annualized >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {city.appreciation.annualized >= 0 ? '+' : ''}{city.appreciation.annualized.toFixed(2)}% p.a.
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Holding Period:</span>
                            <span className="text-xs font-medium">{city.appreciation.time_held_days} days</span>
                          </div>
                        </>
                      )}

                      {city.price_history && city.price_history.length > 1 && (
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">Price Updates:</span>
                            <span className="text-xs font-medium">{city.price_history.length} total</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {city.price_history.slice(-3).map((entry, idx) => (
                              <div key={idx} className="text-[10px] px-2 py-0.5 bg-primary/10 rounded" title={new Date(entry.timestamp).toLocaleString()}>
                                ${entry.price.toLocaleString()}
                                {entry.confidence_score && (
                                  <span className="ml-1 opacity-60">({(entry.confidence_score * 100).toFixed(0)}%)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {city.last_price_update && (
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                          <span>Last Updated:</span>
                          <span>{new Date(city.last_price_update).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(city as any).katherine_analysis && (
                  <div
                    className="bg-primary/5 rounded-lg p-3 border border-primary/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-xs text-primary mb-2 font-semibold flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Elite Pulse
                    </p>
                    <div className="text-xs leading-relaxed text-foreground">
                      <FormattedAnalysis
                        text={getFirstParagraph((city as any).katherine_analysis)}
                        onCitationClick={onCitationClick}
                        citationMap={citationMap}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Analysis */}
            {!city.source?.toLowerCase().includes('crown') && city.analysis && (
              <div onClick={(e) => e.stopPropagation()}>
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Analysis:</p>
                <div className="text-xs leading-relaxed">
                  <FormattedAnalysis
                    text={getFirstParagraph(city.analysis)}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Elite Pulse */}
            {!city.source?.toLowerCase().includes('crown') && city.elite_pulse_analysis && (
              <div onClick={(e) => e.stopPropagation()}>
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Elite Pulse:</p>
                <div className="text-xs leading-relaxed">
                  <FormattedAnalysis
                    text={getFirstParagraph(city.elite_pulse_analysis)}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Executors */}
            {city.executors && city.executors.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold">
                  Executor{city.executors.length > 1 ? 's' : ''}:
                </p>
                <div className="space-y-2">
                  {city.executors.map((executor, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-muted/50 rounded-md p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{executor.name}</p>
                        {executor.role && (
                          <p className="text-xs text-muted-foreground truncate">{executor.role}</p>
                        )}
                      </div>

                      {executor.strategic_trusted_partner ? (
                        <div className="flex items-center gap-1.5">
                          {executor.website && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(executor.website, '_blank', 'noopener,noreferrer')
                              }}
                              className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="Visit Website"
                            >
                              <Globe className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {executor.linkedin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(executor.linkedin, '_blank', 'noopener,noreferrer')
                              }}
                              className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              title="View LinkedIn"
                            >
                              <Linkedin className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          Request Introduction
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {onNavigate && (
              <div className="pt-3 mt-3 border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const route = getOpportunityRoute(city)
                    onNavigate(route)
                  }}
                  className="w-full px-3 py-2 text-xs font-medium rounded transition-colors bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1"
                >
                  {getActionButtonLabel(city)}
                </button>
              </div>
            )}
            </div>
          </AdvancedScrollArea>
        </div>
      )}

      {/* Fallback */}
      {!city.title && (
        <div className="p-3">
          {city.population && (
            <p className="text-xs">Value: {formatValue(city.population)}</p>
          )}
          {city.type && (
            <p className="text-xs capitalize mt-1">Type: {city.type}</p>
          )}
        </div>
      )}
    </div>
  )
}
