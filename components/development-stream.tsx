"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ExternalLink, Lightbulb, ArrowRight, TrendingUp, Target, Brain, AlertCircle, BarChart3, PieChart, ChevronDown, ChevronUp, Share2 } from "lucide-react"
import { CrownLoader } from "@/components/ui/crown-loader"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PremiumBadge } from "@/components/ui/premium-badge"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react" // Import React to fix the undeclared JSX variable
import { useTheme } from "@/contexts/theme-context"
import { getCardColors, getMatteCardStyle, getMetallicCardStyle } from "@/lib/colors"
import { useAuthPopup } from "@/contexts/auth-popup-context"
import { CitationText } from "@/components/elite/citation-text"
import { parseDevCitations } from "@/lib/parse-dev-citations"
import { formatAnalysis, type FormattedAnalysis, type AnalysisSection } from "@/lib/format-text"
import { sanitizeRichHtml } from "@/lib/security/sanitization"
import type {
  HNWIWorldDevelopment,
  HNWIWorldPatternMetadata,
} from "@/types/hnwi-world"
import { resolveHnwiWorldCategory } from "@/lib/hnwi-world-category"
import { dedupeHnwiWorldDevelopments } from "@/lib/hnwi-world-dedupe"

interface ElitePulseImpactMeta {
  impact_level?: "HIGH" | "MEDIUM" | "LOW"
}

type DevelopmentRecord = HNWIWorldDevelopment & {
  elite_pulse_impact?: ElitePulseImpactMeta
}

const sanitizeDevelopmentHtml = (value: string) => sanitizeRichHtml(value, { allowLinks: true })

// Removed: AnalysisSection and FormattedAnalysis now imported from @/lib/format-text

interface DevelopmentStreamProps {
  selectedIndustry: string
  duration: string
  getIndustryColor: (industry: string) => string
  expandedDevelopmentId: string | null
  parentLoading?: boolean
  onLoadingChange?: (loading: boolean) => void
  startDate?: string
  endDate?: string
  developments?: DevelopmentRecord[] // Accept developments as props
  isLoading?: boolean
  elitePulseBriefIds?: string[] // Elite Pulse source brief IDs for tagging
  showElitePulseOnly?: boolean // Filter to show only Elite Pulse developments
  elitePulseImpactFilter?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' // Impact level filter
  onCitationClick?: (citationId: string) => void // Handler for citation clicks
  onDevelopmentExpanded?: (devId: string, isExpanded: boolean) => void // Handler for development card expansion
  citationMap?: Map<string, number> // Global citation number mapping
}

// Component now receives data as props, no API calls needed



// Removed: formatAnalysis and toTitleCase now imported from @/lib/format-text

const queenBullet = "list-none";

const normalizeSurfaceText = (value?: string | null) =>
  (value || "").replace(/\s+/g, " ").trim()

const removeLeadingSurfaceText = (text: string, leadingText?: string | null) => {
  const normalizedLeading = normalizeSurfaceText(leadingText)
  if (!normalizedLeading) return text.trim()

  const trimmed = text.trim()
  const normalizedText = normalizeSurfaceText(trimmed)
  if (!normalizedText.toLowerCase().startsWith(normalizedLeading.toLowerCase())) {
    return trimmed
  }

  const leadingPattern = normalizedLeading
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+")
  return trimmed.replace(new RegExp(`^${leadingPattern}\\s*`, "i"), "").trim()
}

const getHByteText = (dev: DevelopmentRecord, analysis: FormattedAnalysis) => {
  const explicitHByte = normalizeSurfaceText(dev.hbyte_summary)
  if (explicitHByte) return explicitHByte

  let fallback = analysis.summary.trim()
  fallback = removeLeadingSurfaceText(fallback, dev.card_summary)
  fallback = removeLeadingSurfaceText(fallback, dev.description)
  return fallback || analysis.summary.trim()
}

const OUTWARD_TERM_LABEL_MAP: Record<string, string> = {
  "Castle Pattern Footprint": "Pattern Intelligence",
  "Bundle Labels": "Pattern Clusters",
  "Signal Labels": "Signal Themes",
}

const OUTWARD_TERM_VALUE_MAP: Record<string, string> = {
  "castle_brief_v31": "Library Brief v31",
  "castle brief v31": "Library Brief v31",
  "castle_brief_v3.1": "Library Brief v3.1",
  "castle brief v3.1": "Library Brief v3.1",
  "castle_brief_v3_1": "Library Brief v3.1",
  "castle_brief_v31_library": "Library Brief v31",
  "native_castle_briefs": "Library Briefs",
  "native castle briefs": "Library Briefs",
  "native_kgv3_validated": "Validated Facts",
  "native kgv3 validated": "Validated Facts",
  "native_pattern_intelligence": "Pattern Intelligence",
  "native pattern intelligence": "Pattern Intelligence",
  "native_transaction_cases": "Transaction Cases",
  "native transaction cases": "Transaction Cases",
  "v3.1-library": "Library v3.1",
}

const outwardLabel = (label: string) => OUTWARD_TERM_LABEL_MAP[label] || label

const formatPatternValue = (value?: string | null) => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (OUTWARD_TERM_VALUE_MAP[normalized]) {
    return OUTWARD_TERM_VALUE_MAP[normalized]
  }
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const hasPatternMetadata = (metadata?: HNWIWorldPatternMetadata) => {
  if (!metadata) return false

  return Boolean(
    metadata.signal_count ||
      metadata.bundle_count ||
      metadata.related_development_count ||
      metadata.citation_count ||
      metadata.quality_score ||
      metadata.validation_status ||
      metadata.native_version ||
      metadata.verdict ||
      metadata.pattern_labels?.length ||
      metadata.signal_labels?.length ||
      metadata.bundle_labels?.length
  )
}

export function DevelopmentStream({
  selectedIndustry,
  duration,
  getIndustryColor,
  expandedDevelopmentId,
  parentLoading = false,
  onLoadingChange,
  startDate,
  endDate,
  developments = [],
  isLoading = false,
  elitePulseBriefIds = [],
  showElitePulseOnly = false,
  elitePulseImpactFilter = 'ALL',
  onCitationClick,
  onDevelopmentExpanded,
  citationMap,
}: DevelopmentStreamProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(() =>
    expandedDevelopmentId ? { [expandedDevelopmentId]: true } : {}
  )
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme } = useTheme()
  const canonicalDevelopments = useMemo(
    () => dedupeHnwiWorldDevelopments(developments),
    [developments]
  )
  const isSingleDevelopmentView = canonicalDevelopments.length === 1 && Boolean(expandedDevelopmentId)
  const [scrolledCards, setScrolledCards] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!expandedDevelopmentId) return
    setExpandedCards((prev) => {
      if (prev[expandedDevelopmentId]) {
        return prev
      }
      return { ...prev, [expandedDevelopmentId]: true }
    })
  }, [expandedDevelopmentId])

  // Component now receives developments as props, no need to fetch

  // Helper function to get Elite Pulse impact level from development
  const getElitePulseImpact = (dev: DevelopmentRecord): 'HIGH' | 'MEDIUM' | 'LOW' | null => {
    // Check if development has Elite Pulse impact data
    if (dev.elite_pulse_impact && dev.elite_pulse_impact.impact_level) {
      return dev.elite_pulse_impact.impact_level;
    }
    
    // Fallback: if it's tagged as Elite Pulse brief but no impact level, assume MEDIUM
    if (elitePulseBriefIds.includes(dev.id)) {
      return 'MEDIUM';
    }
    
    return null;
  };

  // Filter developments based on Elite Pulse criteria
  const getFilteredDevelopments = () => {
    let filteredDevs = canonicalDevelopments
      .filter(dev => selectedIndustry === 'All' || resolveHnwiWorldCategory(dev) === selectedIndustry);
    
    // Apply Elite Pulse only filter
    if (showElitePulseOnly) {
      filteredDevs = filteredDevs.filter(dev => 
        elitePulseBriefIds.includes(dev.id) || getElitePulseImpact(dev)
      );
    }
    
    // Apply impact level filter
    if (elitePulseImpactFilter !== 'ALL') {
      filteredDevs = filteredDevs.filter(dev => {
        const impactLevel = getElitePulseImpact(dev);
        return impactLevel === elitePulseImpactFilter;
      });
    }
    
    return filteredDevs;
  };

  const toggleCardExpansion = (id: string) => {
    const newExpandedState = !expandedCards[id]
    setExpandedCards((prev) => ({ ...prev, [id]: newExpandedState }))

    // Notify parent about expansion change
    if (onDevelopmentExpanded) {
      onDevelopmentExpanded(id, newExpandedState)
    }

    // Scroll to the beginning of the card after a short delay
    setTimeout(() => {
      const cardElement = document.getElementById(`development-card-${id}`);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleExpandedContentScroll = (id: string, event: React.UIEvent<HTMLDivElement>) => {
    if (!isSingleDevelopmentView) return

    const shouldCollapse = event.currentTarget.scrollTop > 16
    setScrolledCards((prev) => {
      if (prev[id] === shouldCollapse) return prev
      return { ...prev, [id]: shouldCollapse }
    })
  }

  // Handle share - copy link to clipboard
  const handleShare = async (devId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const shareUrl = `${window.location.origin}/share/development/${devId}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied!",
        description: "Share this development with others",
        duration: 2000,
      })
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      toast({
        title: "Link Copied!",
        description: "Share this development with others",
        duration: 2000,
      })
    }
  };


  return (
    <div className={isSingleDevelopmentView ? "h-full min-h-0" : undefined}>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <CrownLoader size="lg" text="Loading development updates..." />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-red-500">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            An error occurred while fetching developments. Please try again later or contact support if the issue
            persists.
          </p>
        </div>
      ) : (
        <div className={cn("w-full space-y-4", isSingleDevelopmentView && "h-full min-h-0")}>
          {getFilteredDevelopments().map((dev) => {
            const elitePulseImpact = getElitePulseImpact(dev);
            const categoryLabel = resolveHnwiWorldCategory(dev);
            const industryLabel = dev.industry
              ? resolveHnwiWorldCategory({ ...dev, category: dev.industry })
              : categoryLabel;
            const showIndustryBadge = industryLabel && industryLabel !== categoryLabel;
            const isCardCollapsedIntoHeading = Boolean(
              isSingleDevelopmentView && expandedCards[dev.id] && scrolledCards[dev.id]
            )
            return (
            <div key={dev.id} id={`development-card-${dev.id}`} className={`relative ${expandedCards[dev.id] ? '' : 'min-h-[179px]'}`}>
              {/* Unified frame wrapper for both main card and expanded content */}
              <div 
                className={`transition-all duration-300 ${
                  expandedCards[dev.id] 
                    ? "rounded-3xl" 
                    : "rounded-lg"
                }`}
                style={{
                  outline: expandedCards[dev.id] 
                    ? `0.2px solid ${theme === "dark" ? "#DAA520" : "#C0C0C0"}` 
                    : "none"
                }}
              >
                <div 
                  className={cn(
                    "px-3 md:px-4 cursor-pointer transition-all duration-300 min-h-full relative overflow-hidden rounded-lg border border-border",
                    isCardCollapsedIntoHeading ? "py-2" : "py-2 md:py-3"
                  )}
                  style={getMetallicCardStyle(theme).style}
                  onClick={() => toggleCardExpansion(dev.id)}
                >
                <div className="h-full flex flex-col justify-between py-1">
                  {/* Header with category badge, title and toggle */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1 mr-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs font-normal px-2 py-1 rounded-md text-muted-foreground border-muted-foreground/30 whitespace-nowrap w-fit"
                        >
                          {categoryLabel}
                        </Badge>
                        {(elitePulseBriefIds.includes(dev.id) || elitePulseImpact) && (
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs font-semibold px-2 py-1 rounded-md bg-gradient-to-r from-primary to-primary/80 text-white whitespace-nowrap w-fit">
                              Elite Pulse
                            </Badge>
                            {elitePulseImpact && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap w-fit ${
                                  elitePulseImpact === 'HIGH' 
                                    ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400' 
                                    : elitePulseImpact === 'MEDIUM'
                                    ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400'
                                    : 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
                                }`}
                              >
                                {elitePulseImpact} Impact
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <h3 className={`text-lg font-black break-words ${
                        isCardCollapsedIntoHeading ? "mb-0" : "mb-3"
                      } ${
                        isSingleDevelopmentView ? "" : "line-clamp-2"
                      } ${
                        theme === "dark" ? "text-primary" : "text-black"
                      }`}>
                        {dev.title}
                      </h3>
                    </div>
                    
                    {/* Expand Toggle - Top Right */}
                    <div className={`flex items-center cursor-pointer transition-colors duration-200 flex-shrink-0 ${
                      theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                    }`}>
                      {expandedCards[dev.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  
                  {/* Body */}
                  <p className={`text-sm font-medium leading-relaxed flex-grow ${
                    isCardCollapsedIntoHeading ? "hidden" : ""
                  } ${
                    theme === "dark" ? "text-gray-200" : "text-gray-700"
                  }`}>
                    {dev.description}
                  </p>
                  
                  {/* Bottom row with Date and Category Badge */}
                  <div className={cn("justify-end items-center mt-4", isCardCollapsedIntoHeading ? "hidden" : "flex")}>
                    <div className="flex items-center gap-3">
                      <div className={`text-xs font-medium ${
                        theme === "dark" 
                          ? "text-gray-200" 
                          : "text-gray-700"
                      }`}>
                        {dev.date ? new Date(dev.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "Date not available"}
                      </div>
                      
                      {showIndustryBadge && (
                        <PremiumBadge className="font-bold px-3 py-1.5 rounded-full w-fit">
                          {industryLabel}
                        </PremiumBadge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expanded content completely outside the unified frame wrapper */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedCards[dev.id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div>
                  <div className={cn(
                    "border border-border rounded-lg p-4 bg-transparent",
                    isSingleDevelopmentView
                      ? cn(
                          "overflow-y-auto overscroll-contain transition-[max-height] duration-300",
                          isCardCollapsedIntoHeading
                            ? "max-h-[calc(100dvh-15rem)] md:max-h-[calc(100dvh-13rem)]"
                            : "max-h-[calc(100dvh-22rem)] md:max-h-[calc(100dvh-18rem)]"
                        )
                      : "max-h-[500px] overflow-y-auto"
                  )}
                    onScroll={(event) => handleExpandedContentScroll(dev.id, event)}
                  >
                      <div className="space-y-6 px-2">
                      {(() => {
                        const analysis = formatAnalysis(dev.summary);
                        const hbyteText = getHByteText(dev, analysis);
                        return (
                          <div className="w-full">
                        {/* HByte */}
                        <div className="mb-6 pb-2">
                          <div className="flex items-center mb-4">
                            <div className="p-2 mr-3">
                              <Brain className={`h-5 w-5 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                            </div>
                            <h4 className="text-xl font-bold">HByte</h4>
                          </div>
                          <div className="text-sm leading-relaxed pl-2">
                            {onCitationClick ? (
                              <CitationText
                                text={hbyteText}
                                onCitationClick={onCitationClick}
                                className="font-medium"
                                citationMap={citationMap}
                              />
                            ) : (
                              <p className="font-medium">{hbyteText}</p>
                            )}
                          </div>
                        </div>

                        {/* Analysis Sections - Winners/Losers/Potential Moves now nested under "Why This Matters" */}
                        <div className="space-y-6">
                          {analysis.sections.map((section, index) => {
                            const getSectionIcon = (title: string) => {
                              const lowerTitle = title.toLowerCase()
                              if (lowerTitle.includes('impact') || lowerTitle.includes('matter')) return Target
                              if (lowerTitle.includes('move') || lowerTitle.includes('trend')) return TrendingUp
                              if (lowerTitle.includes('risk') || lowerTitle.includes('warning')) return AlertCircle
                              if (lowerTitle.includes('data') || lowerTitle.includes('number')) return BarChart3
                              return PieChart
                            }

                            const IconComponent = getSectionIcon(section.title)
                            const lowerSectionTitle = section.title.toLowerCase()
                            const shouldRenderSectionAsBullets =
                              lowerSectionTitle.includes('why this matters') ||
                              lowerSectionTitle.includes('long term wealth impact') ||
                              lowerSectionTitle.includes('long-term wealth impact') ||
                              lowerSectionTitle.includes('wealth impact')

                            return (
                              <div key={`section-${index}`} className="pb-2">
                                <div className="flex items-center mb-4">
                                  <div className="p-2 mr-3">
                                    <IconComponent className={`h-4 w-4 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                  </div>
                                  <h5 className="font-bold text-lg">{section.title}</h5>
                                </div>

                                <div className="space-y-0 pl-2">
                                  {section.content.map((item, pIndex) => (
                                    <div key={`item-${pIndex}`} className="text-sm">
                                      {item.isBullet || shouldRenderSectionAsBullets ? (
                                        <div className="flex items-start py-0.5">
                                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                          {onCitationClick ? (
                                            <CitationText
                                              text={item.text}
                                              onCitationClick={onCitationClick}
                                              className="leading-relaxed font-medium"
                                              citationMap={citationMap}
                                            />
                                          ) : (
                                              <span
                                                className="leading-relaxed font-medium"
                                                dangerouslySetInnerHTML={{
                                                __html: sanitizeDevelopmentHtml(item.text)
                                                }}
                                              />
                                          )}
                                        </div>
                                      ) : (
                                        onCitationClick ? (
                                          <CitationText
                                            text={item.text}
                                            onCitationClick={onCitationClick}
                                            className="leading-relaxed font-medium"
                                            citationMap={citationMap}
                                          />
                                        ) : (
                                          <p
                                            className="leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{
                                              __html: sanitizeDevelopmentHtml(item.text)
                                            }}
                                          />
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Nested sub-sections under "Why This Matters" */}
                                {lowerSectionTitle.includes('why this matters') && (
                                  <div className="mt-6 pl-4 space-y-6">
                                    {/* Winners sub-section */}
                                    {analysis.winners && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <TrendingUp className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Winners</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.winners!.content.map((item, pIndex) => (
                                            <div key={`winner-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: sanitizeDevelopmentHtml(item.text)
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: sanitizeDevelopmentHtml(item.text)
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Losers sub-section */}
                                    {analysis.losers && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <AlertCircle className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Losers</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.losers!.content.map((item, pIndex) => (
                                            <div key={`loser-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: sanitizeDevelopmentHtml(item.text)
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: sanitizeDevelopmentHtml(item.text)
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Potential Moves sub-section */}
                                    {analysis.potentialMoves && (
                                      <div className="pb-2">
                                        <div className="flex items-center mb-3">
                                          <TrendingUp className={`h-4 w-4 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                          <h6 className="font-bold text-base">Potential Moves</h6>
                                        </div>

                                        <div className="space-y-0 pl-2">
                                          {analysis.potentialMoves!.content.map((item, pIndex) => (
                                            <div key={`move-${pIndex}`} className="text-sm">
                                              {item.isBullet ? (
                                                <div className="flex items-start py-0.5">
                                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${theme === "dark" ? "bg-primary/60" : "bg-black/60"}`}></div>
                                                  {onCitationClick ? (
                                                    <CitationText
                                                      text={item.text}
                                                      onCitationClick={onCitationClick}
                                                      className="leading-relaxed font-medium"
                                                      citationMap={citationMap}
                                                    />
                                                  ) : (
                                                    <span
                                                      className="leading-relaxed font-medium"
                                                      dangerouslySetInnerHTML={{
                                                        __html: sanitizeDevelopmentHtml(item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                onCitationClick ? (
                                                  <CitationText
                                                    text={item.text}
                                                    onCitationClick={onCitationClick}
                                                    className="leading-relaxed font-medium"
                                                    citationMap={citationMap}
                                                  />
                                                ) : (
                                                  <p
                                                    className="leading-relaxed font-medium"
                                                    dangerouslySetInnerHTML={{
                                                      __html: sanitizeDevelopmentHtml(item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
                                                    }}
                                                  />
                                                )
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      
                      {dev.numerical_data && dev.numerical_data.length > 0 && (
                        <div className="bg-muted dark:bg-primary-800 p-4 rounded-md mt-4">
                          <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                            Numerical data
                          </h4>
                          <ul className={`${queenBullet} space-y-2`}>
                            {dev.numerical_data.map((item: NonNullable<DevelopmentRecord["numerical_data"]>[number], index: number) => (
                              <li key={`numerical-${index}`} className="text-sm text-muted-foreground dark:text-gray-100 flex items-start">
                                <Lightbulb className={`h-4 w-4 mr-2 flex-shrink-0 mt-1 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                                <span>
                                  <span className="font-medium dark:text-white">
                                    {item.number} {item.unit}
                                  </span>{" "}
                                  - <span className="dark:text-gray-100">{item.context.replace(/^[-\d]+\.\s*/, "")}</span>
                                  {item.source && (
                                    <span className="text-xs text-muted-foreground dark:text-gray-300 ml-2">(Source: {item.source})</span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {hasPatternMetadata(dev.pattern_metadata) && (
                        <div className="bg-muted/60 dark:bg-primary-900/20 border border-border p-4 rounded-md mt-4">
                          <div className="flex items-center mb-3">
                            <BarChart3 className={`h-5 w-5 mr-2 ${theme === "dark" ? "text-primary" : "text-black"}`} />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {outwardLabel("Castle Pattern Footprint")}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {typeof dev.pattern_metadata?.signal_count === "number" && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Signals</div>
                                <div className="text-sm font-semibold">{dev.pattern_metadata.signal_count}</div>
                              </div>
                            )}
                            {typeof dev.pattern_metadata?.bundle_count === "number" && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Bundles</div>
                                <div className="text-sm font-semibold">{dev.pattern_metadata.bundle_count}</div>
                              </div>
                            )}
                            {typeof dev.pattern_metadata?.related_development_count === "number" && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Related Briefs</div>
                                <div className="text-sm font-semibold">{dev.pattern_metadata.related_development_count}</div>
                              </div>
                            )}
                            {typeof dev.pattern_metadata?.citation_count === "number" && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Citations</div>
                                <div className="text-sm font-semibold">{dev.pattern_metadata.citation_count}</div>
                              </div>
                            )}
                            {typeof dev.pattern_metadata?.quality_score === "number" && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Quality Score</div>
                                <div className="text-sm font-semibold">{Math.round(dev.pattern_metadata.quality_score)}/100</div>
                              </div>
                            )}
                            {dev.pattern_metadata?.validation_status && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Validation</div>
                                <div className="text-sm font-semibold">{formatPatternValue(dev.pattern_metadata.validation_status)}</div>
                              </div>
                            )}
                            {dev.pattern_metadata?.verdict && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">Verdict</div>
                                <div className="text-sm font-semibold">{formatPatternValue(dev.pattern_metadata.verdict)}</div>
                              </div>
                            )}
                            {dev.pattern_metadata?.native_version && (
                              <div className="rounded-md border border-border/70 px-3 py-2">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">{outwardLabel("Native Version")}</div>
                                <div className="text-sm font-semibold">{formatPatternValue(dev.pattern_metadata.native_version)}</div>
                              </div>
                            )}
                          </div>

                          {dev.pattern_metadata?.pattern_labels && dev.pattern_metadata.pattern_labels.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Pattern Themes</div>
                              <div className="flex flex-wrap gap-2">
                                {dev.pattern_metadata.pattern_labels.map((label, index) => (
                                  <Badge key={`pattern-label-${index}`} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {dev.pattern_metadata?.signal_labels && dev.pattern_metadata.signal_labels.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{outwardLabel("Signal Labels")}</div>
                              <div className="flex flex-wrap gap-2">
                                {dev.pattern_metadata.signal_labels.map((label, index) => (
                                  <Badge key={`signal-label-${index}`} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {dev.pattern_metadata?.bundle_labels && dev.pattern_metadata.bundle_labels.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{outwardLabel("Bundle Labels")}</div>
                              <div className="flex flex-wrap gap-2">
                                {dev.pattern_metadata.bundle_labels.map((label, index) => (
                                  <Badge key={`bundle-label-${index}`} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                          </div>
                        );
                      })()}
                        
                        {/* Collapse arrow, share, and source link at bottom of frame */}
                        <div className="flex justify-center items-center gap-4 mt-6 pb-2">
                          {dev.url && (
                            <a
                              href={dev.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 rounded-full transition-colors duration-200 hover:bg-muted ${
                                theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                              }`}
                              title="View source"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </a>
                          )}
                          <button
                            onClick={(e) => handleShare(dev.id, e)}
                            className={`p-2 rounded-full transition-colors duration-200 hover:bg-muted ${
                              theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                            }`}
                            title="Share development"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpansion(dev.id);
                            }}
                            className={`p-2 rounded-full transition-colors duration-200 hover:bg-muted ${
                              theme === "dark" ? "text-primary hover:text-primary/80" : "text-black hover:text-black/80"
                            }`}
                          >
                            <ChevronUp className="h-5 w-5" />
                          </button>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
