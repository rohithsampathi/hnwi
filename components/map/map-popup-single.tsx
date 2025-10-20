// components/map/map-popup-single.tsx
// Single opportunity popup with full details

"use client"

import React from "react"
import { MapPin, Crown, Globe, Linkedin, Brain } from "lucide-react"
import type { City } from "@/components/interactive-world-map"
import { CitationText } from "@/components/elite/citation-text"
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
  expandedPopupIndex: number | null
  clusterIndex: number
  onExpand: () => void
  onCitationClick?: (citationId: string) => void
  citationMap?: Map<string, number>
  onNavigate?: (route: string) => void
}

export function MapPopupSingle({
  city,
  theme,
  expandedPopupIndex,
  clusterIndex,
  onExpand,
  onCitationClick,
  citationMap,
  onNavigate
}: MapPopupSingleProps) {
  const isExpanded = expandedPopupIndex === clusterIndex

  return (
    <div className={`p-3 min-w-[300px] ${theme === "dark" ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
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
          {/* NEW Badge with Blinking Dot */}
          {city.is_new && (
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

      {/* Location Info - Always visible */}
      <div className="mb-2 pb-2 border-b border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {city.country}
        </p>
      </div>

      {/* Fixed Data - Always visible */}
      <div className="space-y-1.5">
        {city.value && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Entry Investment:</span>
            <span className="text-xs font-bold text-primary">{formatValue(city.value)}</span>
          </div>
        )}

        {/* Show unit price if available (for crown vault assets) */}
        {(city as any).cost_per_unit && (city as any).unit_count && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Unit Price:</span>
            <span className="text-xs font-medium">
              {(city as any).unit_count}x @ {formatValue(String((city as any).cost_per_unit))}
            </span>
          </div>
        )}

        {/* Show appreciation if available */}
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

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3 expanded-details">
          {/* Crown Vault Asset - Statistical Details & Katherine Analysis */}
          {city.source?.toLowerCase().includes('crown') && (
            <div className="space-y-3">
              {/* Price Statistics */}
              {(city.appreciation || city.price_history || city.cost_per_unit) && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold flex items-center gap-1">
                    <Crown className="h-3 w-3 text-amber-500" />
                    Crown Vault Asset Statistics
                  </p>
                  <div className="space-y-2">
                    {/* Current Price & Units */}
                    {city.cost_per_unit && city.unit_count && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Current Price:</span>
                        <span className="text-xs font-bold">{city.unit_count} units @ ${city.cost_per_unit.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Appreciation Metrics */}
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

                    {/* Price History Summary */}
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

                    {/* Last Update */}
                    {city.last_price_update && (
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>Last Updated:</span>
                        <span>{new Date(city.last_price_update).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Elite Pulse Analysis */}
              {(city as any).katherine_analysis && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-primary mb-2 font-semibold flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    Elite Pulse
                  </p>
                  <div className="text-xs leading-relaxed text-foreground">
                    <CitationText
                      text={cleanAnalysisText((city as any).katherine_analysis)}
                      onCitationClick={onCitationClick}
                      citationMap={citationMap}
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Analysis (non-Crown Vault) */}
          {!city.source?.toLowerCase().includes('crown') && city.analysis && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-semibold">Analysis:</p>
              <div className="text-xs leading-relaxed">
                <CitationText
                  text={cleanAnalysisText(city.analysis)}
                  onCitationClick={onCitationClick}
                  citationMap={citationMap}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* Elite Pulse Analysis (only for non-Crown Vault assets) */}
          {!city.source?.toLowerCase().includes('crown') && city.elite_pulse_analysis && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-semibold">Elite Pulse:</p>
              <div className="text-xs leading-relaxed">
                <CitationText
                  text={cleanAnalysisText(city.elite_pulse_analysis)}
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

                    {/* Strategic Trusted Partner - Show Website and LinkedIn */}
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
                      /* Regular Executor - Show Request Introduction */
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implement introduction request flow
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

          {/* Action Button - At the bottom of expanded details */}
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
      )}

      {/* Fallback for simple markers */}
      {!city.title && (
        <>
          {city.population && (
            <div className="mt-2">
              <p className="text-xs">Value: {formatValue(city.population)}</p>
            </div>
          )}
          {city.type && (
            <p className="text-xs capitalize mt-1">Type: {city.type}</p>
          )}
        </>
      )}
    </div>
  )
}
