// components/map/map-popup-single.tsx
// Single opportunity popup with full details

"use client"

import React from "react"
import { MapPin, Crown, Globe, Linkedin } from "lucide-react"
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
          {/* Analysis */}
          {city.analysis && (
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

          {/* Elite Pulse Analysis */}
          {city.elite_pulse_analysis && (
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
