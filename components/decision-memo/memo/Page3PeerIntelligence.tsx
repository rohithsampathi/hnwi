// components/decision-memo/memo/Page3PeerIntelligence.tsx
// Section 3: Market Intelligence & Peer Analysis - Harvard/Stanford/Goldman Tier
// Premium Sankey-style capital flow visualization with animated data

"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import type { Opportunity as MemoOpportunity } from '@/lib/decision-memo/memo-types';
import type { Opportunity as PdfOpportunity } from '@/lib/pdf/pdf-types';
import type { CitationMap, Citation } from '@/lib/parse-dev-citations';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { City } from '@/components/interactive-world-map';
import { useCrisisIntelligence } from '@/contexts/crisis-intelligence-context';
import { CrisisAlertBox } from '@/components/map/crisis-alert-box';
import {
  useAnimatedMetric,
  useDecisionMemoRenderContext,
  useReportInView,
} from './decision-memo-render-context';

// Dynamic import for map component
const InteractiveWorldMap = dynamic(
  () => import('@/components/interactive-world-map').then(mod => ({ default: mod.InteractiveWorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-2xl border border-border/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-muted-foreground/60 text-sm">Loading opportunities map...</span>
        </div>
      </div>
    )
  }
);

// Note: Legacy PeerIntelligenceData interface removed - using PeerCohortStats exclusively

// Backend-provided peer cohort stats
interface PeerCohortStats {
  // Fix #11: Dynamic section labels from backend
  section_title?: string;  // e.g., "CROSS-BORDER ACQUISITION INTELLIGENCE"
  section_subtitle?: string;  // e.g., "HNWI real estate acquisitions in Singapore"
  metric_labels?: {
    total_peers?: string;
    total_peers_subtitle?: string;
    last_6_months?: string;
    last_6_months_subtitle?: string;
    avg_deal_value?: string;
    avg_deal_value_subtitle?: string;
  };
  total_peers?: number;
  last_6_months?: number;  // Changed from last_90_days
  avg_deal_value_m?: number;
  drivers?: {
    tax_optimization: number;
    asset_protection: number;
    lifestyle: number;
  } | string[];
}

// Backend-provided capital flow data
interface CapitalFlowData {
  source_flows: Array<{ city: string; volume: number; percentage: number }>;
  destination_flows: Array<{ city: string; volume: number; percentage: number; highlight?: boolean }>;
  flow_intensity_index: number;
  velocity_change: string;
  // Fix #11: Pattern signal for dynamic badge and narrative
  pattern_signal?: {
    title: string;  // "CORRIDOR ACTIVITY PATTERN"
    subtitle: string;  // "US → Singapore acquisitions"
    badge: string;  // "DECLINING" | "SLOWING" | "ACCELERATING" | "STABLE"
    badge_color: string;  // "warning" | "neutral" | "success"
    narrative: string;  // Dynamic text based on velocity
  };
  // Fix #11: Velocity interpretation for conditional styling
  velocity_interpretation?: {
    signal: 'caution' | 'monitor' | 'active_window' | 'stable' | 'neutral';
    narrative: string;
  };
  trend_data: {
    data_available: boolean;
    q3?: number;
    q4?: number;
    q1?: number;
    q3_label?: string;  // Dynamic label e.g., "Q3 2024"
    q4_label?: string;
    q1_label?: string;
    q4_change?: string | null;  // e.g., "+15%"
    q1_change?: string | null;
    confidence?: string;  // "high" | "moderate" | "limited"
    source?: string;
    note?: string;
  };
}

interface Page3Props {
  opportunities: Array<MemoOpportunity | PdfOpportunity>;
  peerCount: number;
  onCitationClick: (citationId: string) => void;
  citationMap: CitationMap | Map<string, number>;
  sourceJurisdiction?: string;      // For tax calculations - e.g., "New York" (US state)
  destinationJurisdiction?: string; // For tax calculations - e.g., "Singapore"
  // COUNTRY-LEVEL for corridor display (resolves US states → "United States")
  sourceCountry?: string;           // For corridor display - e.g., "United States"
  destinationCountry?: string;      // For corridor display - e.g., "Singapore"
  // CITY-LEVEL for corridor visualization (Hyderabad → Dubai not India → UAE)
  sourceCity?: string;              // For corridor display - e.g., "Hyderabad"
  destinationCity?: string;         // For corridor display - e.g., "Dubai"
  // Backend-provided dynamic data (no legacy fallbacks)
  peerCohortStats?: PeerCohortStats;
  capitalFlowData?: CapitalFlowData;
  // Section visibility control for flexible layout
  sections?: ('peer' | 'corridor' | 'geographic' | 'drivers' | 'all')[];
  // Hide section title (for when component is called multiple times)
  hideSectionTitle?: boolean;
  // Fix #16: Relocation status affects labels (Migration Window vs Acquisition Window)
  isRelocating?: boolean;
  renderMode?: 'screen' | 'print';
}

// Animated counter for stats
function AnimatedStat({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1500
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useReportInView(ref, { once: true, margin: "-50px" });
  const count = useAnimatedMetric(value, {
    duration,
    enabled: motionEnabled && isInView,
  });

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}{suffix}
    </span>
  );
}

export function Page3PeerIntelligence({
  opportunities,
  peerCount,
  onCitationClick,
  citationMap,
  sourceJurisdiction = '',
  destinationJurisdiction = '',
  sourceCountry,
  destinationCountry,
  sourceCity,
  destinationCity,
  peerCohortStats,
  capitalFlowData,
  sections = ['all'],
  hideSectionTitle = false,
  isRelocating = false,  // Fix #16: Default to false (cross-border acquisition)
  renderMode = 'screen',
}: Page3Props) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const [isVisible, setIsVisible] = useState(!motionEnabled);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useReportInView(sectionRef, { once: true, margin: "-50px" });

  // Section visibility helpers
  const showPeer = sections.includes('all') || sections.includes('peer');
  const showCorridor = sections.includes('all') || sections.includes('corridor');
  const showGeographic = sections.includes('all') || sections.includes('geographic');
  const showDrivers = sections.includes('all') || sections.includes('drivers');
  const isPrintMode = renderMode === 'print';

  // Filter states for map
  const [showCrownAssets, setShowCrownAssets] = useState(true);
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

  // Crisis intelligence — rendered below map when in geographic-only mode
  const { showCrisisAlert, crisisData, crisisCounts, crisisColors } = useCrisisIntelligence();

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // CORRIDOR DISPLAY: Country-to-Country (e.g., "United States → Singapore")
  // Fix #11: Use sourceCountry/destinationCountry which resolves US states to "United States"
  // Falls back to jurisdiction for non-US cases or backward compatibility
  const corridorSource = sourceCountry || sourceJurisdiction || '—';
  const corridorDestination = destinationCountry || destinationJurisdiction || '—';

  // Use backend-provided peer cohort stats ONLY - no legacy fallbacks
  const peerData = {
    total: peerCohortStats?.total_peers ?? peerCount,
    last6Months: peerCohortStats?.last_6_months,
    averageValue: peerCohortStats?.avg_deal_value_m
  };

  // Driver percentages from backend ONLY - no fallbacks
  const drivers = Array.isArray(peerCohortStats?.drivers) ? undefined : peerCohortStats?.drivers;
  const hasDriverData = drivers !== undefined;

  // Capital flow data - ONLY from backend, no fake data generation
  // For HNWIs paying premium, we show real data or nothing

  // Use backend capital flow data ONLY - no fake fallback data
  const capitalFlows = useMemo(() => {
    if (capitalFlowData && capitalFlowData.source_flows?.length > 0) {
      return {
        outflows: capitalFlowData.source_flows.map(f => ({
          city: f.city,
          volume: f.volume,
          percentage: f.percentage
        })),
        inflows: capitalFlowData.destination_flows.map(f => ({
          city: f.city,
          volume: f.volume,
          percentage: f.percentage,
          highlight: f.highlight
        }))
      };
    }
    return null; // No fake data - show nothing if backend doesn't provide
  }, [capitalFlowData]);

  const hasCapitalFlows = capitalFlows !== null;

  // Flow intensity and velocity from backend ONLY - no fallbacks
  const flowIntensityIndex = capitalFlowData?.flow_intensity_index;
  const velocityChange = capitalFlowData?.velocity_change;
  const trendData = capitalFlowData?.trend_data;
  const hasCapitalFlowData = capitalFlowData !== undefined;
  // SOTA: Only show trend data if backend confirms it's available (real data, not synthetic)
  const hasTrendData = trendData?.data_available === true && trendData?.q3 !== undefined;

  // Transform opportunities to City format for InteractiveWorldMap
  // MATCHES Home Dashboard structure exactly - just with location filtering applied
  const cities = useMemo(() => {
    // LOCATION FILTER: Only show opportunities from source and destination jurisdictions
    // This is the key difference from Home Dashboard - we filter to transaction corridors
    const locationPatterns = [
      sourceJurisdiction?.toLowerCase(),
      destinationJurisdiction?.toLowerCase(),
      sourceCountry?.toLowerCase(),
      destinationCountry?.toLowerCase(),
      sourceCity?.toLowerCase(),
      destinationCity?.toLowerCase(),
    ].filter(Boolean);

    return opportunities
      .filter(opp => {
        // Must have valid coordinates
        if (!opp.latitude || !opp.longitude) return false;
        if (Math.abs(opp.latitude) > 90 || Math.abs(opp.longitude) > 180) return false;
        if (opp.latitude === 0 && opp.longitude === 0) return false;

        // LOCATION FILTER: Only include opportunities from transaction jurisdictions
        if (locationPatterns.length > 0) {
          const oppLocation = (opp.location || '').toLowerCase();
          const oppCountry = (opp.country || '').toLowerCase();
          const matchesLocation = locationPatterns.some(pattern =>
            pattern && (oppLocation.includes(pattern) || oppCountry.includes(pattern) ||
                       pattern.includes(oppLocation) || pattern.includes(oppCountry))
          );
          if (!matchesLocation) return false;
        }

        return true;
      })
      .map(opp => {
        const displayName = opp.location || opp.country || opp.title || 'Opportunity';

        // Extract citations from analysis text (same as Home Dashboard)
        const devIdsFromAnalysis = extractDevIds(opp.expected_return || '');
        const devIdsFromHnwi = extractDevIds(opp.hnwi_analysis || '');
        const devIds = opp.dev_id
          ? [opp.dev_id!, ...devIdsFromAnalysis, ...devIdsFromHnwi]
          : [...devIdsFromAnalysis, ...devIdsFromHnwi];
        const uniqueDevIds = Array.from(new Set(devIds));

        // Build rich analysis text (same priority as Home Dashboard)
        // Priority: hnwi_analysis → opportunity_narrative → expected_return → fallback
        let analysis = opp.hnwi_analysis || opp.opportunity_narrative || opp.expected_return || '';

        // If analysis is too short, use a descriptive fallback
        if (!analysis || analysis.length < 30) {
          analysis = `${opp.tier || 'Investment'} opportunity in ${opp.location}. ` +
            (opp.dna_match_score ? `DNA match: ${Math.round(opp.dna_match_score)}%. ` : '') +
            (opp.key_insights?.length ? opp.key_insights.slice(0, 2).join(' • ') : '');
        }

        // Append dev_id citation to analysis text so it shows as clickable button
        if (opp.dev_id) {
          const devIdCitationPattern = new RegExp(
            `\\[(?:Dev\\s*ID|DEVID)\\s*[:\\-–—]\\s*${String(opp.dev_id).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\]`,
            'i'
          );
          if (!devIdCitationPattern.test(analysis)) {
            analysis = `${analysis} [Dev ID: ${opp.dev_id}]`;
          }
        }

        // Determine type based on source (same as Home Dashboard)
        const type = opp.source === 'MOEv4' ? 'finance' : 'luxury';

        // Build City object matching Home Dashboard structure exactly
        const city: City = {
          name: displayName,
          country: opp.country || 'Unknown',
          latitude: opp.latitude!,
          longitude: opp.longitude!,
          population: opp.minimum_investment || opp.tier,
          type: type,
          _id: opp.dev_id,
          id: opp.dev_id,
          title: opp.title,
          tier: opp.tier,
          value: opp.minimum_investment || opp.tier,
          risk: opp.risk_level || 'Medium',
          analysis: analysis,
          source: opp.source || 'Command Centre',
          victor_score: opp.dna_match_score ? `${Math.round(opp.dna_match_score)}%` : undefined,
          elite_pulse_analysis: undefined,  // Don't show separate Elite Pulse - analysis already contains the full content
          category: opp.category,
          industry: opp.industry,
          is_new: false,
          devIds: uniqueDevIds,
          hasCitations: uniqueDevIds.length > 0,
          // Don't set katherine_analysis for Decision Memo - analysis field already has full content
          katherine_analysis: undefined,
        };

        return city;
      });
  }, [opportunities, sourceJurisdiction, destinationJurisdiction, sourceCountry, destinationCountry, sourceCity, destinationCity]);

  const geographicHighlights = useMemo(() => {
    const grouped = new Map<string, { name: string; country: string; count: number; titles: string[] }>();

    cities.forEach((city) => {
      const key = `${city.name}__${city.country}`;
      const existing = grouped.get(key) ?? {
        name: city.name,
        country: city.country,
        count: 0,
        titles: [],
      };

      existing.count += 1;

      if (city.title && !existing.titles.includes(city.title) && existing.titles.length < 2) {
        existing.titles.push(city.title);
      }

      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.name.localeCompare(right.name);
    });
  }, [cities]);

  const sectionHeader = (
    <motion.div
      className="mb-8 sm:mb-12"
      initial={{ opacity: 0, y: 12 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">
        Section III
      </p>
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-4">
        Market Intelligence & Peer Analysis
      </h2>
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </motion.div>
  );

  return (
    <div ref={sectionRef}>
      {/* Section Header - keep it attached to the first peer block in print mode */}
      {!hideSectionTitle && !showPeer && (showCorridor || showDrivers) && sectionHeader}

      {/* ═══════════════════════════════════════════════════════════════════
          PEER MOVEMENT ANALYSIS - Premium Stats Grid
          ═══════════════════════════════════════════════════════════════════ */}
      {showPeer && (
      <div data-print-block="keep" data-print-max-height="760">
        {!hideSectionTitle && sectionHeader}
        <motion.div
          className="mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
            {peerCohortStats?.section_title || 'CROSS-BORDER ACQUISITION INTELLIGENCE'}
          </p>
          <p className="text-sm text-muted-foreground/60 mb-8">
            {peerCohortStats?.section_subtitle || `HNWI real estate acquisitions in ${destinationJurisdiction || 'destination'}`}
          </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8"
          data-print-block="keep"
          data-print-max-gap="200"
        >
          {[
            {
              label: peerCohortStats?.metric_labels?.total_peers || 'Total Acquisitions',
              value: peerData.total,
              suffix: '',
              description: peerCohortStats?.metric_labels?.total_peers_subtitle || 'Similar corridor transactions',
              highlight: false,
              hasData: peerData.total !== undefined && peerData.total > 0
            },
            {
              label: peerCohortStats?.metric_labels?.last_6_months || 'Recent Activity',
              value: peerData.last6Months,
              suffix: '',
              description: peerCohortStats?.metric_labels?.last_6_months_subtitle || 'Last 6 months',
              highlight: false,
              hasData: peerData.last6Months !== undefined
            },
            {
              label: peerCohortStats?.metric_labels?.avg_deal_value || 'Average Transaction',
              value: peerData.averageValue,
              suffix: 'M',
              prefix: '$',
              description: peerCohortStats?.metric_labels?.avg_deal_value_subtitle || 'Median deal size',
              highlight: true,
              decimals: 1,
              hasData: peerData.averageValue !== undefined
            }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative rounded-2xl border border-border/20 bg-card/50 overflow-hidden p-4 sm:p-6 lg:p-8 transition-all"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {stat.highlight && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
              )}
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                  {stat.label}
                </p>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight mb-2 ${
                  stat.highlight ? 'text-primary' : 'text-foreground'
                }`}>
                  {stat.hasData ? (
                    <AnimatedStat
                      value={stat.value as number}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      decimals={stat.decimals || 0}
                    />
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pattern Alert - Fix #11: Dynamic based on velocity interpretation */}
        {(() => {
          // Determine colors based on velocity signal
          const signal = capitalFlowData?.velocity_interpretation?.signal || 'neutral';
          const patternSignal = capitalFlowData?.pattern_signal;

          // Color schemes based on signal
          const colorSchemes = {
            caution: {
              border: 'border-red-500/20',
              accent: 'via-red-500/40',
              titleColor: 'text-red-600 dark:text-red-400',
              badgeColor: 'border-red-500/20 text-red-500/80'
            },
            monitor: {
              border: 'border-amber-500/20',
              accent: 'via-amber-500/40',
              titleColor: 'text-amber-600 dark:text-amber-400',
              badgeColor: 'border-amber-500/20 text-amber-500/80'
            },
            active_window: {
              border: 'border-emerald-500/20',
              accent: 'via-emerald-500/40',
              titleColor: 'text-emerald-600 dark:text-emerald-400',
              badgeColor: 'border-emerald-500/20 text-emerald-500/80'
            },
            stable: {
              border: 'border-primary/20',
              accent: 'via-primary/40',
              titleColor: 'text-primary',
              badgeColor: 'border-primary/20 text-primary/80'
            },
            neutral: {
              border: 'border-border/20',
              accent: 'via-border/40',
              titleColor: 'text-muted-foreground',
              badgeColor: 'border-border/20 text-muted-foreground/80'
            }
          };

          const colors = colorSchemes[signal] || colorSchemes.neutral;
          const badge = patternSignal?.badge || (signal === 'caution' ? 'DECLINING' : signal === 'active_window' ? 'ACCELERATING' : 'STABLE');

          return (
            <motion.div
              className={`relative rounded-2xl border ${colors.border} bg-card/50 overflow-hidden px-4 sm:px-10 py-6`}
              data-print-block="keep"
              data-print-max-gap="180"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.accent} to-transparent`} />

              <div className="flex items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className={`text-xs font-medium ${colors.titleColor}`}>
                      {patternSignal?.title || 'CORRIDOR ACTIVITY PATTERN'}
                    </p>
                    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${colors.badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    {patternSignal?.narrative || capitalFlowData?.velocity_interpretation?.narrative || (
                      velocityChange
                        ? `Movement velocity: ${velocityChange}. Analysis in progress.`
                        : 'Corridor activity data analysis in progress.'
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}
        </motion.div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CAPITAL FLOW CORRIDOR - Single Source → Destination Visualization
          Only renders with real backend data - no fake cities
          ═══════════════════════════════════════════════════════════════════ */}
      {showCorridor && (
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div data-print-block="keep" data-print-max-height="760">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
            WEALTH MIGRATION CORRIDOR
          </p>
          <p className="text-sm text-muted-foreground/60 mb-8">
            {corridorSource && corridorDestination
              ? `${corridorSource} → ${corridorDestination} capital flow analysis`
              : 'Jurisdiction-specific capital flow patterns'
            }
          </p>

          <div
            className="relative rounded-2xl border border-border/30 overflow-hidden px-5 sm:px-8 md:px-12 py-10 md:py-12"
            data-print-block="keep"
            data-print-max-gap="180"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

            {/* Single Corridor Visualization - Clean and Data-Driven */}
            <div className="relative">
              {/* The single corridor flow */}
              <div className="flex items-center justify-between gap-4 sm:gap-8">
                {/* Source Jurisdiction */}
                <motion.div
                  className="flex-1 max-w-[150px] sm:max-w-[200px]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="p-4 sm:p-6 rounded-xl border border-red-500/20 bg-card/50">
                    <p className="text-xs uppercase tracking-[0.2em] text-red-500/60 mb-3">SOURCE</p>
                    <p className="text-base sm:text-xl font-medium text-foreground mb-1">
                      {corridorSource || '—'}
                    </p>
                    {hasCapitalFlowData && capitalFlows?.outflows[0] && (
                      <p className="text-xs text-muted-foreground/60">
                        {capitalFlows.outflows[0].volume.toLocaleString()} HNWIs outflow
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Flow Arrow with Animation */}
                <motion.div
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="relative">
                    {/* Animated flow line */}
                    <div className="w-16 sm:w-32 h-px bg-gradient-to-r from-red-500/40 via-gold/40 to-primary/40 overflow-hidden">
                      <motion.div
                        className="h-full w-8 bg-foreground/10"
                        animate={{ x: ['-100%', '400%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                    {/* Arrow head */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-primary/40 border-y-[4px] border-y-transparent" />
                  </div>
                  {velocityChange && (() => {
                    // Fix #11: Color velocity badge based on signal
                    const signal = capitalFlowData?.velocity_interpretation?.signal || 'neutral';
                    const badgeColors = signal === 'caution'
                      ? 'border-red-500/20 text-red-500/80'
                      : signal === 'monitor'
                      ? 'border-amber-500/20 text-amber-500/80'
                      : signal === 'active_window'
                      ? 'border-emerald-500/20 text-emerald-500/80'
                      : 'border-primary/20 text-primary/80';
                    return (
                      <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${badgeColors}`}>
                        {velocityChange} velocity
                      </span>
                    );
                  })()}
                </motion.div>

                {/* Destination Jurisdiction */}
                <motion.div
                  className="flex-1 max-w-[150px] sm:max-w-[200px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="p-4 sm:p-6 rounded-xl border border-primary/20 bg-card/50">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-3">DESTINATION</p>
                    <p className="text-base sm:text-xl font-medium text-foreground mb-1">
                      {corridorDestination || '—'}
                    </p>
                    {hasCapitalFlowData && capitalFlows?.inflows[0] && (
                      <p className="text-xs text-muted-foreground/60">
                        {capitalFlows.inflows[0].volume.toLocaleString()} HNWIs inflow
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Flow Metrics - Only show with real data */}
              {hasCapitalFlowData && (
                <motion.div
                  className="mt-8 sm:mt-12 pt-6 sm:pt-8"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-8" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                    {/* Flow Intensity */}
                    <div className="text-center sm:text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Flow Intensity</p>
                      {flowIntensityIndex != null ? (
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <span className="text-xl md:text-2xl font-medium tabular-nums tracking-tight text-foreground">
                            {flowIntensityIndex.toFixed(2)}
                          </span>
                          <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                            flowIntensityIndex > 0.7 ? 'border-red-500/20 text-red-500/80' :
                            flowIntensityIndex > 0.4 ? 'border-amber-500/20 text-amber-500/80' :
                            'border-border/20 text-muted-foreground/80'
                          }`}>
                            {flowIntensityIndex > 0.7 ? 'HIGH' : flowIntensityIndex > 0.4 ? 'ELEVATED' : 'NORMAL'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl md:text-2xl font-medium tabular-nums tracking-tight text-muted-foreground/60">—</span>
                      )}
                    </div>

                    {/* Velocity Change - Fix #11: Color based on signal */}
                    <div className="text-center sm:text-left">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Movement Velocity</p>
                      {velocityChange ? (() => {
                        const signal = capitalFlowData?.velocity_interpretation?.signal || 'neutral';
                        const velocityColor = signal === 'caution'
                          ? 'text-red-500'
                          : signal === 'monitor'
                          ? 'text-amber-500'
                          : signal === 'active_window'
                          ? 'text-emerald-500'
                          : 'text-primary';
                        return (
                          <span className={`text-xl md:text-2xl font-medium tabular-nums tracking-tight ${velocityColor}`}>{velocityChange}</span>
                        );
                      })() : (
                        <span className="text-xl md:text-2xl font-medium tabular-nums tracking-tight text-muted-foreground/60">—</span>
                      )}
                    </div>

                    {/* Peer Count */}
                    <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Peers in Corridor</p>
                      <span className="text-xl md:text-2xl font-medium tabular-nums tracking-tight text-foreground">
                        {peerData.total > 0 ? peerData.total.toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* No data state */}
              {!hasCapitalFlowData && (
                <motion.div
                  className="mt-8 text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                >
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Capital flow metrics calculated from pattern intelligence
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          INTERACTIVE OPPORTUNITIES MAP
          ═══════════════════════════════════════════════════════════════════ */}
      {showGeographic && cities.length > 0 && (
        <motion.div
          className="mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div data-print-block="keep" data-print-max-height="900">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
              GEOGRAPHIC OPPORTUNITY DISTRIBUTION
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8">
              Interactive map of matched investment opportunities
            </p>

            {isPrintMode ? (
              <div className="rounded-2xl border border-border/30 overflow-hidden bg-card/60">
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] px-6 py-6 sm:px-8 sm:py-8">
                  <div className="relative rounded-2xl border border-border/20 bg-background/70 px-5 py-5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.05] via-transparent to-transparent pointer-events-none" />
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70 font-medium mb-3">
                      Corridor Footprint
                    </p>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-3">
                      {geographicHighlights.length.toLocaleString()} matched markets across {cities.length.toLocaleString()} corridor opportunities
                    </h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed">
                      Geographic concentration clusters were filtered to the {corridorSource} → {corridorDestination} opportunity set,
                      preserving the same matched opportunities shown in the live report without relying on interactive map state during export.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                        Source: {sourceCity || corridorSource}
                      </span>
                      <span className="rounded-full border border-border/40 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground/70">
                        Destination: {destinationCity || corridorDestination}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {geographicHighlights.slice(0, 6).map((highlight, index) => (
                      <div
                        key={`${highlight.name}-${highlight.country}`}
                        className="rounded-xl border border-border/20 bg-background/80 px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {highlight.name}
                            </p>
                            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/60 mt-1">
                              {highlight.country}
                            </p>
                          </div>
                          <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1 text-xs font-medium text-gold/80">
                            {highlight.count} match{highlight.count === 1 ? '' : 'es'}
                          </span>
                        </div>
                        {highlight.titles.length > 0 ? (
                          <p className="text-xs text-muted-foreground/70 leading-relaxed mt-3">
                            {highlight.titles.join(' • ')}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/30 overflow-hidden">
                <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                  <InteractiveWorldMap
                    cities={cities}
                    onCitationClick={onCitationClick}
                    citationMap={citationMap}
                    showCrownAssets={showCrownAssets}
                    showPriveOpportunities={showPriveOpportunities}
                    showHNWIPatterns={showHNWIPatterns}
                    onToggleCrownAssets={() => setShowCrownAssets(!showCrownAssets)}
                    onTogglePriveOpportunities={() => setShowPriveOpportunities(!showPriveOpportunities)}
                    onToggleHNWIPatterns={() => setShowHNWIPatterns(!showHNWIPatterns)}
                    hideCrownAssetsToggle={true}
                    useAbsolutePositioning={true}
                    showCrisisOverlay={true}
                    crisisAlertExternal={true}
                  />
                </div>

                <div className="px-6 py-4">
                  <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    <span className="text-muted-foreground/60">Interactive Map:</span> Click markers to view opportunity analysis.
                    <span className="hidden sm:inline"> Color intensity reflects investment tier -- use filters to narrow by price range and category.</span>
                  </p>
                </div>

                {/* Crisis Intel Summary — rendered below map for visibility */}
                {showCrisisAlert && crisisData && crisisColors && (
                  <div className="px-6 pb-4">
                    <CrisisAlertBox
                      visible={showCrisisAlert}
                      theme="dark"
                      alert={crisisData.alert}
                      counts={crisisCounts}
                      colors={crisisColors}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MARKET SIGNAL CLASSIFICATION - Premium Cards
          ═══════════════════════════════════════════════════════════════════ */}
      {showDrivers && (
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
          MARKET SIGNAL CLASSIFICATION
        </p>
        <p className="text-sm text-muted-foreground/60 mb-8">
          Primary driver analysis
        </p>

        <div className="max-w-xl">
          {/* Primary Drivers */}
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden px-4 sm:px-10 py-8"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
              Primary Drivers
            </p>

            <div className="space-y-5">
              {hasDriverData ? (
                [
                  {
                    // Fix #16: "Tax optimization" only valid for relocating
                    // Non-relocating = cross-border acquisition (tax awareness, not optimization)
                    label: isRelocating ? 'Tax optimization' : 'Geographic diversification',
                    value: drivers!.tax_optimization,
                    color: 'primary'
                  },
                  {
                    label: 'Asset protection',
                    value: drivers!.asset_protection,
                    color: 'amber'
                  },
                  {
                    label: isRelocating ? 'Lifestyle upgrade' : 'Portfolio allocation',
                    value: drivers!.lifestyle,
                    color: 'muted'
                  }
                ].map((driver, i) => (
                  <motion.div
                    key={driver.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, delay: 1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground/60">{driver.label}</span>
                      <span className={`text-base font-medium tabular-nums ${
                        driver.color === 'primary' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {driver.value}%
                      </span>
                    </div>
                    <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          driver.color === 'primary' ? 'bg-primary/60' :
                          driver.color === 'amber' ? 'bg-amber-500/60' : 'bg-muted-foreground/20'
                        }`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${driver.value}%` } : {}}
                        transition={{ duration: 1, delay: 1.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground/60">
                  <p className="text-2xl font-medium mb-2">—</p>
                  <p className="text-xs uppercase tracking-[0.2em]">Driver data pending from backend</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Key Catalyst Note - Fix #11: Dynamic based on velocity signal, Fix #16: Relocation-aware labels */}
        {(() => {
          const signal = capitalFlowData?.velocity_interpretation?.signal || 'neutral';
          const isCaution = signal === 'caution' || signal === 'monitor';

          // Fix #16: Different labels for relocating vs non-relocating
          // "Migration Window" implies relocation; "Acquisition Window" for cross-border purchases
          const windowLabel = isRelocating ? 'Migration Window' : 'Acquisition Window';

          // Different messaging based on velocity signal AND relocation status
          const catalystTitle = isCaution
            ? `Market Signal: ${sourceJurisdiction || 'Source'} → ${destinationJurisdiction || 'Destination'} Corridor`
            : `Key Catalyst: ${sourceJurisdiction || 'Source'} → ${destinationJurisdiction || 'Destination'} ${windowLabel}`;

          // Fix #16: Non-relocating = asset diversification focus, not tax optimization
          const catalystBody = isCaution
            ? `Corridor activity is declining. Peer cohort is reducing exposure to ${destinationJurisdiction || 'destination jurisdiction'} residential acquisitions. Exercise due diligence on timing and market conditions.`
            : isRelocating
            ? `Regulatory changes and tax optimization opportunities driving wealth repositioning from ${sourceJurisdiction || 'source jurisdiction'} to ${destinationJurisdiction || 'destination jurisdiction'} among peer cohort.`
            : `Geographic diversification and asset allocation strategies driving cross-border acquisitions from ${sourceJurisdiction || 'source jurisdiction'} to ${destinationJurisdiction || 'destination jurisdiction'} among peer cohort.`;

          const catalystDetail = isCaution
            ? ' Review market fundamentals before committing capital to this corridor.'
            : ' Current window represents active execution period based on peer activity patterns.';

          const borderColor = isCaution ? 'border-amber-500/20' : 'border-primary/20';
          const accentColor = isCaution ? 'via-amber-500/40' : 'via-gold/40';

          return (
            <motion.div
              className={`mt-6 sm:mt-8 relative rounded-2xl border ${borderColor} bg-card/50 overflow-hidden px-4 sm:px-10 py-6`}
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${accentColor} to-transparent`} />

              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">
                  {catalystTitle}
                </p>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  {catalystBody}
                  <span className="hidden sm:inline">{catalystDetail}</span>
                </p>
              </div>
            </motion.div>
          );
        })()}
      </motion.div>
      )}
    </div>
  );
}
