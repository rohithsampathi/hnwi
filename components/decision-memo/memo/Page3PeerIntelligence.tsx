// components/decision-memo/memo/Page3PeerIntelligence.tsx
// Section 3: Market Intelligence & Peer Analysis - Harvard/Stanford/Goldman Tier
// Premium Sankey-style capital flow visualization with animated data

"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { Opportunity } from '@/lib/decision-memo/memo-types';
import type { CitationMap, Citation } from '@/lib/parse-dev-citations';
import { extractDevIds } from '@/lib/parse-dev-citations';
import type { City } from '@/components/interactive-world-map';

// Dynamic import for map component
const InteractiveWorldMap = dynamic(
  () => import('@/components/interactive-world-map').then(mod => ({ default: mod.InteractiveWorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-muted-foreground text-sm">Loading opportunities map...</span>
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
  total_peers: number;
  last_6_months: number;  // Changed from last_90_days
  avg_deal_value_m: number;
  drivers: {
    tax_optimization: number;
    asset_protection: number;
    lifestyle: number;
  };
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
  opportunities: Opportunity[];
  peerCount: number;
  onCitationClick: (citationId: string) => void;
  citationMap: CitationMap;
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
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

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
  isRelocating = false  // Fix #16: Default to false (cross-border acquisition)
}: Page3Props) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  // Section visibility helpers
  const showPeer = sections.includes('all') || sections.includes('peer');
  const showCorridor = sections.includes('all') || sections.includes('corridor');
  const showGeographic = sections.includes('all') || sections.includes('geographic');
  const showDrivers = sections.includes('all') || sections.includes('drivers');

  // Filter states for map
  const [showCrownAssets, setShowCrownAssets] = useState(true);
  const [showPriveOpportunities, setShowPriveOpportunities] = useState(true);
  const [showHNWIPatterns, setShowHNWIPatterns] = useState(true);

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
  const drivers = peerCohortStats?.drivers;
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
          ? [opp.dev_id, ...devIdsFromAnalysis, ...devIdsFromHnwi]
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

        // Append dev_id citation if it exists but isn't already referenced in the analysis text
        // This ensures the citation is clickable even if the analysis doesn't explicitly contain [Dev ID: XXX]
        if (opp.dev_id && !analysis.includes(opp.dev_id)) {
          analysis = `${analysis} [Dev ID: ${opp.dev_id}]`;
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

  return (
    <div ref={sectionRef}>
      {/* Section Header - shows if peer, corridor, or drivers sections are visible AND not hidden */}
      {!hideSectionTitle && (showPeer || showCorridor || showDrivers) && (
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 tracking-wide">
            MARKET INTELLIGENCE & PEER ANALYSIS
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PEER MOVEMENT ANALYSIS - Premium Stats Grid
          ═══════════════════════════════════════════════════════════════════ */}
      {showPeer && (
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2 tracking-wide">
          {peerCohortStats?.section_title || 'CROSS-BORDER ACQUISITION INTELLIGENCE'}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
          {peerCohortStats?.section_subtitle || `HNWI real estate acquisitions in ${destinationJurisdiction || 'destination'}`}
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
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
              className={`relative overflow-hidden p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border transition-all ${
                stat.highlight
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30'
                  : 'bg-card border-border hover:border-primary/20'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              {/* Decorative corner accent */}
              {stat.highlight && (
                <div className="absolute top-0 right-0 w-10 sm:w-16 h-10 sm:h-16 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
              )}

              <div className="relative z-10">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-3">
                  {stat.label}
                </p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-1 sm:mb-2 ${
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
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
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
              bg: 'from-red-500/10 via-red-500/5 to-red-500/10',
              border: 'border-red-500/30',
              accent: 'from-red-500 to-red-400',
              icon: 'bg-red-500/20',
              iconColor: 'text-red-500',
              titleColor: 'text-red-600 dark:text-red-400',
              highlight: 'text-red-500'
            },
            monitor: {
              bg: 'from-amber-500/10 via-amber-500/5 to-amber-500/10',
              border: 'border-amber-500/30',
              accent: 'from-amber-500 to-amber-400',
              icon: 'bg-amber-500/20',
              iconColor: 'text-amber-500',
              titleColor: 'text-amber-600 dark:text-amber-400',
              highlight: 'text-amber-500'
            },
            active_window: {
              bg: 'from-emerald-500/10 via-emerald-500/5 to-emerald-500/10',
              border: 'border-emerald-500/30',
              accent: 'from-emerald-500 to-emerald-400',
              icon: 'bg-emerald-500/20',
              iconColor: 'text-emerald-500',
              titleColor: 'text-emerald-600 dark:text-emerald-400',
              highlight: 'text-emerald-500'
            },
            stable: {
              bg: 'from-primary/10 via-primary/5 to-primary/10',
              border: 'border-primary/30',
              accent: 'from-primary to-primary/80',
              icon: 'bg-primary/20',
              iconColor: 'text-primary',
              titleColor: 'text-primary',
              highlight: 'text-primary'
            },
            neutral: {
              bg: 'from-muted/30 via-muted/20 to-muted/30',
              border: 'border-border',
              accent: 'from-muted-foreground to-muted-foreground/80',
              icon: 'bg-muted',
              iconColor: 'text-muted-foreground',
              titleColor: 'text-muted-foreground',
              highlight: 'text-foreground'
            }
          };

          const colors = colorSchemes[signal] || colorSchemes.neutral;
          const badge = patternSignal?.badge || (signal === 'caution' ? 'DECLINING' : signal === 'active_window' ? 'ACCELERATING' : 'STABLE');

          return (
            <motion.div
              className={`relative overflow-hidden p-3 sm:p-4 lg:p-6 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl sm:rounded-2xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.accent}`} />

              <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {signal === 'caution' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    ) : signal === 'active_window' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className={`text-xs sm:text-sm font-semibold ${colors.titleColor} mb-0.5 sm:mb-1`}>
                    {patternSignal?.title || 'CORRIDOR ACTIVITY PATTERN'}: <span className="uppercase">{badge}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CAPITAL FLOW CORRIDOR - Single Source → Destination Visualization
          Only renders with real backend data - no fake cities
          ═══════════════════════════════════════════════════════════════════ */}
      {showCorridor && (
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2 tracking-wide">
          WEALTH MIGRATION CORRIDOR
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
          {corridorSource && corridorDestination
            ? `${corridorSource} → ${corridorDestination} capital flow analysis`
            : 'Jurisdiction-specific capital flow patterns'
          }
        </p>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
          {/* Single Corridor Visualization - Clean and Data-Driven */}
          <div className="relative">
            {/* The single corridor flow */}
            <div className="flex items-center justify-between gap-4 sm:gap-8">
              {/* Source Jurisdiction */}
              <motion.div
                className="flex-1 max-w-[200px]"
                initial={{ opacity: 0, x: -20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="p-4 sm:p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl sm:rounded-2xl">
                  <p className="text-[10px] sm:text-xs text-red-500/80 uppercase tracking-wider mb-2">SOURCE</p>
                  <p className="text-base sm:text-xl font-bold text-foreground mb-1">
                    {corridorSource || '—'}
                  </p>
                  {hasCapitalFlowData && capitalFlows?.outflows[0] && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="relative">
                  {/* Animated flow line */}
                  <div className="w-16 sm:w-32 h-1 bg-gradient-to-r from-red-500 via-primary to-primary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full w-8 bg-foreground/40 rounded-full"
                      animate={{ x: ['-100%', '400%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  {/* Arrow head */}
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-primary border-y-[5px] border-y-transparent" />
                </div>
                {velocityChange && (() => {
                  // Fix #11: Color velocity badge based on signal
                  const signal = capitalFlowData?.velocity_interpretation?.signal || 'neutral';
                  const badgeColors = signal === 'caution'
                    ? 'text-red-500 bg-red-500/10'
                    : signal === 'monitor'
                    ? 'text-amber-500 bg-amber-500/10'
                    : signal === 'active_window'
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-primary bg-primary/10';
                  return (
                    <span className={`text-[10px] sm:text-xs font-semibold ${badgeColors} px-2 py-0.5 rounded-full`}>
                      {velocityChange} velocity
                    </span>
                  );
                })()}
              </motion.div>

              {/* Destination Jurisdiction */}
              <motion.div
                className="flex-1 max-w-[200px]"
                initial={{ opacity: 0, x: 20 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl sm:rounded-2xl">
                  <p className="text-[10px] sm:text-xs text-primary/80 uppercase tracking-wider mb-2">DESTINATION</p>
                  <p className="text-base sm:text-xl font-bold text-foreground mb-1">
                    {corridorDestination || '—'}
                  </p>
                  {hasCapitalFlowData && capitalFlows?.inflows[0] && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {capitalFlows.inflows[0].volume.toLocaleString()} HNWIs inflow
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Flow Metrics - Only show with real data */}
            {hasCapitalFlowData && (
              <motion.div
                className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Flow Intensity */}
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Flow Intensity</p>
                    {flowIntensityIndex != null ? (
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-lg sm:text-2xl font-bold text-foreground">
                          {flowIntensityIndex.toFixed(2)}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
                          flowIntensityIndex > 0.7 ? 'bg-red-500/10 text-red-500' :
                          flowIntensityIndex > 0.4 ? 'bg-amber-500/10 text-amber-500' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {flowIntensityIndex > 0.7 ? 'HIGH' : flowIntensityIndex > 0.4 ? 'ELEVATED' : 'NORMAL'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-2xl font-bold text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Velocity Change - Fix #11: Color based on signal */}
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Movement Velocity</p>
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
                        <span className={`text-lg sm:text-2xl font-bold ${velocityColor}`}>{velocityChange}</span>
                      );
                    })() : (
                      <span className="text-lg sm:text-2xl font-bold text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Peer Count */}
                  <div className="text-center sm:text-left col-span-2 sm:col-span-1">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Peers in Corridor</p>
                    <span className="text-lg sm:text-2xl font-bold text-foreground">
                      {peerData.total > 0 ? peerData.total.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* No data state */}
            {!hasCapitalFlowData && (
              <motion.div
                className="mt-6 text-center py-4"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Capital flow metrics calculated from pattern intelligence
                </p>
              </motion.div>
            )}
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
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2 tracking-wide">
            GEOGRAPHIC OPPORTUNITY DISTRIBUTION
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
            Interactive map of matched investment opportunities
          </p>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
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
              />
            </div>

            <div className="p-3 sm:p-4 bg-muted/30 border-t border-border">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary mt-1.5 sm:mt-2 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Interactive Map:</span> Click markers to view opportunity analysis.
                  <span className="hidden sm:inline"> Color intensity reflects investment tier - use filters to narrow by price range and category.</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MARKET SIGNAL CLASSIFICATION - Premium Cards
          ═══════════════════════════════════════════════════════════════════ */}
      {showDrivers && (
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2 tracking-wide">
          MARKET SIGNAL CLASSIFICATION
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
          Primary driver analysis
        </p>

        <div className="max-w-xl">
          {/* Primary Drivers */}
          <motion.div
            className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
              Primary Drivers
            </h4>

            <div className="space-y-3 sm:space-y-4">
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
                    transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                  >
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">{driver.label}</span>
                      <span className={`text-xs sm:text-sm font-semibold ${
                        driver.color === 'primary' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {driver.value}%
                      </span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          driver.color === 'primary' ? 'bg-primary' :
                          driver.color === 'amber' ? 'bg-amber-500' : 'bg-muted-foreground/30'
                        }`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${driver.value}%` } : {}}
                        transition={{ duration: 0.8, delay: 1.1 + i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-2xl font-semibold mb-2">—</p>
                  <p className="text-xs">Driver data pending from backend</p>
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

          return (
            <motion.div
              className={`mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 ${isCaution ? 'bg-amber-500/5 border-amber-500/20' : 'bg-primary/5 border-primary/20'} border rounded-xl sm:rounded-2xl`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isCaution ? 'bg-amber-500/20' : 'bg-primary/20'} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isCaution ? 'text-amber-500' : 'text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isCaution ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 sm:mb-1">
                    {catalystTitle}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {catalystBody}
                    <span className="hidden sm:inline">{catalystDetail}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </motion.div>
      )}
    </div>
  );
}
