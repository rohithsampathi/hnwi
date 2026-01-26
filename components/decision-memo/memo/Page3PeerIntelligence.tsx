// components/decision-memo/memo/Page3PeerIntelligence.tsx
// Section 3: Market Intelligence & Peer Analysis - Harvard/Stanford/Goldman Tier
// Premium Sankey-style capital flow visualization with animated data

"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { Opportunity } from '@/lib/decision-memo/memo-types';
import type { CitationMap } from '@/lib/parse-dev-citations';

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
  sourceJurisdiction?: string;      // For tax calculations - e.g., "India"
  destinationJurisdiction?: string; // For tax calculations - e.g., "UAE"
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
  sourceCity,
  destinationCity,
  peerCohortStats,
  capitalFlowData,
  sections = ['all'],
  hideSectionTitle = false
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

  // CORRIDOR DISPLAY: Country-to-Country (e.g., "India → UAE")
  // Wealth Migration Corridor shows jurisdiction level, not city level
  const corridorSource = sourceJurisdiction || '—';
  const corridorDestination = destinationJurisdiction || '—';

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
  const cities = useMemo(() => {
    return opportunities
      .filter(opp => opp.latitude && opp.longitude)
      .map(opp => {
        const tierLower = opp.tier?.toLowerCase() || '';
        const isPriveOpportunity = tierLower.includes('privé') ||
                                  tierLower.includes('prive') ||
                                  opp.tier === '$500K Tier' ||
                                  opp.tier === '$1M Tier';

        const type = opp.category?.toLowerCase().includes('real estate') ||
                    opp.category?.toLowerCase().includes('property')
                      ? 'luxury'
                      : 'finance';

        let entryValue = '$500K';
        if (opp.tier?.includes('$100K')) {
          entryValue = '$100K';
        } else if (opp.tier?.includes('$500K')) {
          entryValue = '$500K';
        } else if (opp.tier?.includes('$1M')) {
          entryValue = '$1M';
        }

        // Use actual backend analysis (expected_return contains historical_behavior/why_relevant)
        // Format: "Analysis text with actual insights [Dev ID: XXX]"
        const analysisText = opp.expected_return
          ? `${opp.expected_return} [Dev ID: ${opp.dev_id}]`
          : `${opp.tier} opportunity in ${opp.location}. ${opp.dna_match_score ? `DNA match: ${opp.dna_match_score}%` : ''} [Dev ID: ${opp.dev_id}]`;

        const city: any = {
          name: opp.location,
          country: opp.country || opp.location,
          latitude: opp.latitude!,
          longitude: opp.longitude!,
          title: opp.title,
          tier: opp.tier,
          value: entryValue,
          analysis: analysisText,
          category: opp.category,
          industry: opp.industry,
          type: type,
          devIds: opp.dev_id ? [opp.dev_id] : [],
          hasCitations: !!opp.dev_id,
          is_new: false,
          source: isPriveOpportunity ? 'Privé Exchange' : 'HNWI World Intelligence'
        };

        if (isPriveOpportunity) {
          city.victor_score = `${opp.dna_match_score || 0}%`;
        }

        return city;
      });
  }, [opportunities]);

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
          PEER MOVEMENT ANALYSIS
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
          Real-time tracking of HNWI wealth repositioning patterns
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            {
              label: 'Total HNWIs',
              value: peerData.total,
              suffix: '',
              description: 'Executing similar moves',
              highlight: false,
              hasData: peerData.total !== undefined && peerData.total > 0
            },
            {
              label: 'Last 6 Months',
              value: peerData.last6Months,
              suffix: '',
              description: 'Recent movements',
              highlight: false,
              hasData: peerData.last6Months !== undefined
            },
            {
              label: 'Average Value',
              value: peerData.averageValue,
              suffix: 'M',
              prefix: '$',
              description: 'Per transaction',
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

        {/* Pattern Alert */}
        <motion.div
          className="relative overflow-hidden p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-400" />

          <div className="flex items-start sm:items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 mb-0.5 sm:mb-1">
                PATTERN: WEALTH REPOSITIONING DETECTED
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {velocityChange ? (
                  <>Recent movement velocity increased by <span className="font-semibold text-amber-500">{velocityChange}</span> compared to prior period.</>
                ) : (
                  <>Peer movement data analysis in progress.</>
                )}
                <span className="hidden sm:inline"> Driven by regulatory changes and tax optimization opportunities.</span>
              </p>
            </div>
          </div>
        </motion.div>
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
                      className="h-full w-8 bg-white/40 rounded-full"
                      animate={{ x: ['-100%', '400%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  {/* Arrow head */}
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-primary border-y-[5px] border-y-transparent" />
                </div>
                {velocityChange && (
                  <span className="text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {velocityChange} velocity
                  </span>
                )}
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

                  {/* Velocity Change */}
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Movement Velocity</p>
                    {velocityChange ? (
                      <span className="text-lg sm:text-2xl font-bold text-primary">{velocityChange}</span>
                    ) : (
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
                    label: 'Tax optimization',
                    value: drivers!.tax_optimization,
                    color: 'primary'
                  },
                  {
                    label: 'Asset protection',
                    value: drivers!.asset_protection,
                    color: 'amber'
                  },
                  {
                    label: 'Lifestyle upgrade',
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

        {/* Key Catalyst Note */}
        <motion.div
          className="mt-4 sm:mt-6 p-3 sm:p-4 lg:p-5 bg-primary/5 border border-primary/20 rounded-xl sm:rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.3 }}
        >
          <div className="flex items-start gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 sm:mb-1">
                Key Catalyst: {sourceJurisdiction || 'Source'} → {destinationJurisdiction || 'Destination'} Migration Window
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Regulatory changes and tax optimization opportunities driving accelerated wealth repositioning
                from {sourceJurisdiction || 'source jurisdiction'} to {destinationJurisdiction || 'destination jurisdiction'} among peer cohort.
                <span className="hidden sm:inline"> Current window represents optimal execution timing before regulatory tightening.</span>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </div>
  );
}
