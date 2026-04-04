/**
 * REAL ASSET AUDIT INTELLIGENCE SECTION
 * SFO-Grade presentation of KGv3-verified data:
 * Stamp Duty, Loopholes, Dynasty Trusts, Freeports
 */

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCitationPanel } from '@/contexts/elite-citation-panel-context';
import type { RealAssetAuditData as PdfRealAssetAuditData } from '@/lib/pdf/pdf-types';

// Types
interface StampDutyData {
  found?: boolean;
  jurisdiction?: string;
  jurisdiction_code?: string;
  tax_name?: string;  // e.g., "ABSD", "SDLT", "RPTT"
  foreign_buyer_surcharge?: {
    rate_pct: number;
    effective_date?: string;
    description?: string;
    tax_name?: string;  // Jurisdiction-specific name
  };
  commercial_rates?: {
    base_rate_pct?: number;
    foreign_surcharge_pct: number;
    note?: string;
  };
  residential_rates?: Array<{
    threshold_sgd?: number;
    threshold?: string;
    rate_pct: number;
    description?: string;
    band?: string;
  }>;
  statute_citation?: string;
  official_source_url?: string;
  // Fix #8: FTA contextualization fields
  fta_applied?: boolean;
  fta_name?: string;
  absd_schedule_rate_pct?: number;  // Generic rate (e.g., 60%)
  absd_applied_rate_pct?: number;   // After FTA (e.g., 0%)
  absd_savings_usd?: number;
  absd_display_note?: string;
  // Fix #19: Jurisdiction-specific terminology
  foreign_buyer_tax_name?: string;  // "ABSD" (SG), "Non-Resident Surcharge" (UK), etc.
  has_foreign_buyer_tax?: boolean;  // false for NYC, Dubai
}

interface LoopholeStrategy {
  name: string;
  mechanism?: string;
  description?: string;
  tax_savings_potential: string;
  requirements?: string[];
  risks?: string[];
  timeline?: string;
  official_source_url?: string;
  legal_basis?: string;
  // Fix #8: FTA contextualization fields
  status?: 'ALREADY_MITIGATED' | 'NOT_APPLICABLE' | 'APPLICABLE';
  applicability_note?: string;
  future_value?: string;
}

interface DynastyTrustJurisdiction {
  jurisdiction?: string;
  name?: string;
  perpetuity_period?: string;
  perpetuity_years?: number;
  max_duration?: string;
  asset_protection?: string;
  tax_benefits?: string[];
  setup_cost?: string;
  annual_cost?: string;
}

interface DynastyTrustData {
  found?: boolean;
  jurisdictions?: DynastyTrustJurisdiction[];
  best_for_perpetuity?: string;
  recommended?: string;
  rationale?: string;
}

interface SuccessionVehicle {
  vehicle_type?: string;
  type?: string;
  name: string;
  jurisdiction?: string;
  tax_benefits?: string[];
  benefits?: string[];
  limitations?: string[];
  statute_citation?: string;
}

interface FreeportData {
  found?: boolean;
  freeports?: Array<{
    name: string;
    jurisdiction?: string;
    location?: string;
    asset_types?: string[];
    tax_benefits?: string[];
    storage_costs?: string;
  }>;
  recommended?: string;
}

interface JurisdictionAssetAudit {
  stamp_duty?: StampDutyData;
  loophole_strategies?: LoopholeStrategy[];
  dynasty_trusts?: DynastyTrustData;
  succession_vehicles?: SuccessionVehicle[];
  freeport_options?: FreeportData;
  data_completeness?: {
    total_sources?: number;
    confidence?: string;
  };
}

interface RealAssetAuditData {
  [jurisdiction: string]: JurisdictionAssetAudit;
}

interface RealAssetAuditSectionProps {
  data: RealAssetAuditData | PdfRealAssetAuditData;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  transactionValue?: number;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const RealAssetAuditSection: React.FC<RealAssetAuditSectionProps> = ({
  data: rawData,
  sourceJurisdiction,
  destinationJurisdiction,
  transactionValue = 0,
}) => {
  const data = rawData as RealAssetAuditData;
  const { openPanel } = useCitationPanel();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Filter out underscore-prefixed keys (internal/global data - not jurisdiction cards)
  // e.g., _global_succession_vehicles, _best_dynasty_trust_jurisdictions
  const jurisdictionKeys = useMemo(() =>
    Object.keys(data).filter(key => !key.startsWith('_')),
    [data]
  );

  // Calculate summary metrics - prioritize DESTINATION jurisdiction
  const summaryMetrics = useMemo(() => {
    let totalStrategies = 0;
    let foreignBuyerRate = 0;
    let foreignBuyerTaxName = 'Foreign Buyer Tax';
    let hasForeignBuyerTax = false;
    let hasLoophole = false;
    let trustOptions = 0;
    let ftaApplied = false;
    let scheduleRate = 0;

    // First, try to get destination jurisdiction's data
    const destKey = jurisdictionKeys.find(k =>
      destinationJurisdiction &&
      (k.toLowerCase().includes(destinationJurisdiction.toLowerCase()) ||
       destinationJurisdiction.toLowerCase().includes(k.toLowerCase()))
    );

    // If we have destination jurisdiction, use its rates
    if (destKey) {
      const destAudit = data[destKey];
      const stampDuty = destAudit.stamp_duty;

      // Check if FTA applied (Fix #8)
      if (stampDuty?.fta_applied) {
        ftaApplied = true;
        scheduleRate = stampDuty.absd_schedule_rate_pct ?? 0;
        foreignBuyerRate = stampDuty.absd_applied_rate_pct ?? 0;
      } else if (stampDuty?.foreign_buyer_surcharge) {
        foreignBuyerRate = stampDuty.foreign_buyer_surcharge.rate_pct ?? 0;
        scheduleRate = foreignBuyerRate;
      }

      // Determine tax name based on jurisdiction (Fix #19)
      foreignBuyerTaxName = stampDuty?.foreign_buyer_tax_name ||
        getForeignBuyerTaxName(destKey);
      hasForeignBuyerTax = stampDuty?.has_foreign_buyer_tax ??
        (foreignBuyerRate > 0 || stampDuty?.foreign_buyer_surcharge !== undefined);

      if (stampDuty?.commercial_rates?.foreign_surcharge_pct === 0) {
        hasLoophole = true;
      }
    }

    // Aggregate strategies and trust options across all jurisdictions
    jurisdictionKeys.forEach(key => {
      const audit = data[key];
      if (Array.isArray(audit.loophole_strategies)) {
        totalStrategies += audit.loophole_strategies.length;
      }
      if (Array.isArray(audit.dynasty_trusts?.jurisdictions)) {
        trustOptions += audit.dynasty_trusts.jurisdictions.length;
      }
      // Check for commercial loophole in any jurisdiction
      if (audit.stamp_duty?.commercial_rates?.foreign_surcharge_pct === 0) {
        hasLoophole = true;
      }
    });

    return {
      totalStrategies,
      foreignBuyerRate,
      foreignBuyerTaxName,
      hasForeignBuyerTax,
      hasLoophole,
      trustOptions,
      ftaApplied,
      scheduleRate
    };
  }, [data, jurisdictionKeys, destinationJurisdiction]);

  // Helper function to get jurisdiction-specific foreign buyer tax name
  function getForeignBuyerTaxName(jurisdiction: string): string {
    const jurLower = jurisdiction.toLowerCase();
    if (jurLower.includes('singapore')) return 'ABSD';
    if (jurLower.includes('hong kong')) return 'BSD/SSD';
    if (jurLower.includes('uk') || jurLower.includes('united kingdom') || jurLower.includes('britain')) return 'Non-Resident Surcharge';
    if (jurLower.includes('australia')) return 'Foreign Purchaser Duty';
    if (jurLower.includes('canada') || jurLower.includes('vancouver') || jurLower.includes('toronto')) return 'NRST/Foreign Buyer Tax';
    if (jurLower.includes('new york') || jurLower.includes('nyc')) return 'N/A'; // NYC has no foreign buyer tax
    if (jurLower.includes('dubai') || jurLower.includes('uae')) return 'N/A'; // UAE has no foreign buyer tax
    if (jurLower.includes('switzerland')) return 'Lex Koller Restrictions';
    return 'Foreign Buyer Surcharge';
  }

  if (!data || jurisdictionKeys.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const handleSourceClick = (title: string, source: string, url?: string, statute?: string) => {
    // openPanel expects (devIds: string[], options)
    openPanel([], {
      title,
      description: statute ? `${statute}${url ? ` - ${url}` : ''}` : url || '',
      source
    });
  };

  return (
    <div ref={sectionRef}>
      <motion.div
        ref={sectionRef}
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          Real Asset Audit Intelligence
        </h2>
        <div className="h-px bg-border" />
      </motion.div>
      {/* Executive Summary Card */}
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
      >
        <div className="relative rounded-2xl border border-border/30 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative px-5 sm:px-8 md:px-12 py-10 md:py-12">
            {/* Main Metric */}
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                Transfer Tax Analysis
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Foreign Buyer Tax - Fix #19: Jurisdiction-aware display */}
              <div className={`p-4 sm:p-5 rounded-xl border ${
                summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0
                  ? 'border-emerald-500/20 bg-card/50'
                  : 'border-border/20 bg-card/50'
              }`}>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                  {summaryMetrics.hasForeignBuyerTax ? 'Foreign Buyer Tax' : 'Transfer Tax'}
                </p>
                <div>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight ${
                    summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0 ? 'text-emerald-500/80' :
                    summaryMetrics.foreignBuyerRate >= 50 ? 'text-red-500/80' :
                    summaryMetrics.foreignBuyerRate >= 20 ? 'text-primary/80' : 'text-foreground'
                  }`}>
                    {summaryMetrics.hasForeignBuyerTax ? `${summaryMetrics.foreignBuyerRate}%` : 'N/A'}
                  </p>
                  {/* Show schedule rate if FTA reduced it */}
                  {summaryMetrics.ftaApplied && summaryMetrics.scheduleRate !== summaryMetrics.foreignBuyerRate && (
                    <p className="text-xs text-muted-foreground/60 line-through">was {summaryMetrics.scheduleRate}%</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0
                    ? 'FTA Exemption'
                    : summaryMetrics.foreignBuyerTaxName}
                </p>
              </div>

              {/* Tax Impact - only show if there's a foreign buyer tax */}
              {transactionValue > 0 && summaryMetrics.hasForeignBuyerTax && (
                <div className={`p-4 sm:p-5 rounded-xl border ${
                  summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0
                    ? 'border-emerald-500/20 bg-card/50'
                    : 'border-primary/20 bg-card/50'
                }`}>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                    {summaryMetrics.ftaApplied ? 'FTA Savings' : 'Tax Impact'}
                  </p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight ${
                    summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0
                      ? 'text-emerald-500/80'
                      : 'text-primary/80'
                  }`}>
                    {summaryMetrics.ftaApplied && summaryMetrics.foreignBuyerRate === 0
                      ? formatCurrency(transactionValue * summaryMetrics.scheduleRate / 100)
                      : formatCurrency(transactionValue * summaryMetrics.foreignBuyerRate / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {summaryMetrics.ftaApplied ? 'avoided' : `on ${formatCurrency(transactionValue)}`}
                  </p>
                </div>
              )}

              {/* Strategies Found */}
              <div className="p-4 sm:p-5 rounded-xl border border-border/20 bg-card/50">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Tax Strategies</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight text-foreground">{summaryMetrics.totalStrategies}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Identified</p>
              </div>

              {/* Loophole Status */}
              <div className={`p-4 sm:p-5 rounded-xl border ${summaryMetrics.hasLoophole ? 'border-primary/20 bg-card/50' : 'border-border/20 bg-card/50'}`}>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Commercial Route</p>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight ${summaryMetrics.hasLoophole ? 'text-primary/80' : 'text-muted-foreground/60'}`}>
                  {summaryMetrics.hasLoophole ? '0%' : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">{summaryMetrics.hasLoophole ? 'Loophole Available' : 'No Loophole'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content by Jurisdiction - Filter out underscore-prefixed keys (internal data) */}
      {jurisdictionKeys.map((jurisdiction, jurisdictionIdx) => {
        const auditData = data[jurisdiction];
        return (
        <div key={jurisdiction} className="mb-10 sm:mb-16">
          {/* Jurisdiction Header */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 + jurisdictionIdx * 0.1, ease: EASE_OUT_EXPO }}
          >
            <div>
              <h3 className="text-xl md:text-2xl font-normal text-foreground tracking-tight">{jurisdiction}</h3>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Jurisdiction Analysis</p>
            </div>
          </motion.div>

          {/* Stamp Duty Table */}
          {auditData.stamp_duty?.found && (
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
            >
              <div className="rounded-2xl border border-border/30 overflow-hidden">
                <div className="px-6 sm:px-10 py-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                      Stamp Duty Schedule
                    </p>
                    {(auditData.stamp_duty.statute_citation || auditData.stamp_duty.official_source_url) && (
                      <button
                        onClick={() => handleSourceClick(
                          `${jurisdiction} Stamp Duty`,
                          'Government Source',
                          auditData.stamp_duty?.official_source_url,
                          auditData.stamp_duty?.statute_citation
                        )}
                        className="text-xs text-muted-foreground/60 hover:text-primary/60 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Source
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

                <div>
                  {/* Foreign Buyer Surcharge Row - Fix #8 + #19: Show FTA context with jurisdiction-aware label */}
                  {auditData.stamp_duty.foreign_buyer_surcharge && (() => {
                    const hasFta = auditData.stamp_duty.fta_applied;
                    const scheduleRate = auditData.stamp_duty.absd_schedule_rate_pct ?? auditData.stamp_duty.foreign_buyer_surcharge.rate_pct;
                    const appliedRate = hasFta ? (auditData.stamp_duty.absd_applied_rate_pct ?? 0) : scheduleRate;
                    const displayRate = hasFta ? appliedRate : scheduleRate;
                    // Fix #19: Use jurisdiction-specific tax name
                    const taxName = auditData.stamp_duty.foreign_buyer_tax_name ||
                      auditData.stamp_duty.foreign_buyer_surcharge.tax_name ||
                      getForeignBuyerTaxName(jurisdiction);
                    const taxLabel = taxName === 'N/A' ? 'Foreign Buyer Surcharge' : `Foreign Buyer Surcharge (${taxName})`;

                    return (
                    <div className={`grid grid-cols-12 items-center ${hasFta ? 'bg-emerald-500/[0.03]' : ''}`}>
                      <div className="col-span-6 sm:col-span-5 px-6 sm:px-10 py-4">
                        <p className="text-sm font-normal text-foreground">{taxLabel}</p>
                        {auditData.stamp_duty.foreign_buyer_surcharge.effective_date && (
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            Since {auditData.stamp_duty.foreign_buyer_surcharge.effective_date}
                          </p>
                        )}
                        {/* Fix #8: Show FTA benefit note */}
                        {hasFta && auditData.stamp_duty.absd_display_note && (
                          <p className="text-xs text-emerald-500/60 mt-1">
                            {auditData.stamp_duty.absd_display_note}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-4 px-6 sm:px-10 py-4 text-right">
                        {typeof displayRate === 'number' ? (
                          <div>
                            {/* Fix #8: Show applied rate prominently */}
                            <span className={`text-xl md:text-2xl font-medium tabular-nums tracking-tight ${
                              hasFta && appliedRate === 0 ? 'text-emerald-500/80' :
                              displayRate >= 50 ? 'text-red-500/80' :
                              displayRate >= 20 ? 'text-primary/80' : 'text-foreground'
                            }`}>
                              {displayRate}%
                            </span>
                            {/* Fix #8: Show schedule rate as reference if FTA applied */}
                            {hasFta && scheduleRate !== appliedRate && (
                              <p className="text-xs text-muted-foreground/60 line-through">
                                (was {scheduleRate}%)
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xl md:text-2xl font-medium text-muted-foreground/60">N/A</span>
                        )}
                      </div>
                      <div className="col-span-3 px-5 py-4 text-right">
                        {typeof displayRate === 'number' && (
                          <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                            hasFta && appliedRate === 0 ? 'border-emerald-500/20 text-emerald-500/80' :
                            displayRate >= 50 ? 'border-red-500/20 text-red-500/80' :
                            displayRate >= 20 ? 'border-primary/20 text-primary/80' :
                            'border-muted-foreground/20 text-muted-foreground/80'
                          }`}>
                            {hasFta && appliedRate === 0 ? `FTA: ${auditData.stamp_duty.fta_name || 'Applied'}` :
                             displayRate >= 50 ? 'Prohibitive' :
                             displayRate >= 20 ? 'High' : 'Moderate'}
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })()}

                  {auditData.stamp_duty.foreign_buyer_surcharge && (
                    <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
                  )}

                  {/* Commercial Rates Row */}
                  {auditData.stamp_duty.commercial_rates && (
                    <>
                      <div className={`grid grid-cols-12 items-center ${typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' && auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 ? 'bg-primary/[0.02]' : ''}`}>
                        <div className="col-span-6 sm:col-span-5 px-6 sm:px-10 py-4">
                          <p className="text-sm font-normal text-foreground">Commercial Property</p>
                          {auditData.stamp_duty.commercial_rates.note && (
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{auditData.stamp_duty.commercial_rates.note}</p>
                          )}
                        </div>
                        <div className="col-span-3 sm:col-span-4 px-6 sm:px-10 py-4 text-right">
                          {typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' ? (
                            <span className={`text-xl md:text-2xl font-medium tabular-nums tracking-tight ${auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 ? 'text-primary/80' : 'text-foreground'}`}>
                              {auditData.stamp_duty.commercial_rates.foreign_surcharge_pct}%
                            </span>
                          ) : (
                            <span className="text-xl md:text-2xl font-medium text-muted-foreground/60">N/A</span>
                          )}
                        </div>
                        <div className="col-span-3 px-5 py-4 text-right">
                          {typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' && auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 && (
                            <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-primary/20 text-primary/80">
                              Loophole
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
                    </>
                  )}

                  {/* Residential Rate Tiers - Premium Visual */}
                  {Array.isArray(auditData.stamp_duty.residential_rates) && auditData.stamp_duty.residential_rates.length > 0 && (
                    <div>
                      <div className="px-6 sm:px-10 py-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Residential BSD Tiers</p>
                          <span className="text-xs text-muted-foreground/60">{auditData.stamp_duty.residential_rates.length} brackets</span>
                        </div>
                      </div>

                      {/* Progressive Tier Cards */}
                      <div className="px-6 sm:px-10 pb-6 sm:pb-8">
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {auditData.stamp_duty.residential_rates.slice(0, 6).map((tier, idx, arr) => {
                            const rate = typeof tier.rate_pct === 'number' ? tier.rate_pct : 0;
                            const maxRate = Math.max(...arr.map(t => typeof t.rate_pct === 'number' ? t.rate_pct : 0));
                            const intensity = maxRate > 0 ? rate / maxRate : 0;

                            return (
                              <div
                                key={idx}
                                className={`relative flex-1 min-w-[100px] sm:min-w-[120px] p-3 sm:p-4 rounded-xl border transition-all ${
                                  idx === arr.length - 1
                                    ? 'border-primary/20 bg-card/50'
                                    : 'border-border/20 bg-card/50'
                                }`}
                              >
                                {/* Tier Badge */}
                                <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border ${
                                  idx === arr.length - 1
                                    ? 'border-primary/20 bg-card text-primary/80'
                                    : 'border-border/20 bg-card text-muted-foreground/60'
                                }`}>
                                  <span className="text-xs">{idx + 1}</span>
                                </div>

                                {/* Rate Display */}
                                <div className="text-center mb-2">
                                  <span className={`text-xl md:text-2xl font-medium tabular-nums tracking-tight ${
                                    idx === arr.length - 1 ? 'text-primary/80' : 'text-foreground'
                                  }`}>
                                    {typeof tier.rate_pct === 'number' ? `${tier.rate_pct}%` : 'N/A'}
                                  </span>
                                </div>

                                {/* Progress Indicator */}
                                <div className="h-px bg-border/10 rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      idx === arr.length - 1 ? 'bg-primary/40' : 'bg-primary/20'
                                    }`}
                                    style={{ width: `${Math.max(intensity * 100, 10)}%` }}
                                  />
                                </div>

                                {/* Threshold */}
                                <p className="text-xs text-muted-foreground/60 text-center leading-tight break-words">
                                  {tier.threshold || tier.description || `Bracket ${idx + 1}`}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progressive Scale Legend */}
                        <div className="flex items-center justify-center gap-3 mt-4 pt-3">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/10 to-transparent" />
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <span className="text-xs text-muted-foreground/60">Lower tiers</span>
                          </div>
                          <svg className="w-3 h-3 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <span className="text-xs text-muted-foreground/60">Top bracket</span>
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/10 to-transparent" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tax Strategies */}
          {Array.isArray(auditData.loophole_strategies) && auditData.loophole_strategies.length > 0 && (
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                  Tax Optimization Strategies
                </p>
                <span className="text-xs text-muted-foreground/60">{auditData.loophole_strategies.length} found</span>
              </div>

              <div className="space-y-3">
                {auditData.loophole_strategies.map((strategy, idx) => {
                  // Fix #8: Determine styling based on strategy status
                  const isMitigated = strategy.status === 'ALREADY_MITIGATED';
                  const isNotApplicable = strategy.status === 'NOT_APPLICABLE';
                  const isDisabled = isMitigated || isNotApplicable;

                  return (
                  <div key={idx} className={`rounded-xl p-5 sm:p-6 ${
                    isDisabled
                      ? 'border border-border/20 bg-card/30 opacity-75'
                      : 'border border-border/20 bg-card/50'
                  }`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isDisabled ? 'border-border/20' : 'border-primary/20'
                        }`}>
                          <span className={`text-xs font-medium ${isDisabled ? 'text-muted-foreground/60' : 'text-primary/60'}`}>{idx + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className={`text-sm font-normal ${isDisabled ? 'text-muted-foreground/60' : 'text-foreground'}`}>
                              {strategy.name}
                            </h5>
                            {/* Fix #8: Status badge */}
                            {isMitigated && (
                              <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-emerald-500/20 text-emerald-500/80">
                                Already Mitigated
                              </span>
                            )}
                            {isNotApplicable && (
                              <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-amber-500/20 text-amber-500/80">
                                Not Applicable
                              </span>
                            )}
                          </div>
                          {(strategy.mechanism || strategy.description) && (
                            <p className="text-sm text-muted-foreground/60 mt-1 leading-relaxed font-normal">
                              {strategy.mechanism || strategy.description}
                            </p>
                          )}
                          {/* Fix #8: Show applicability note */}
                          {strategy.applicability_note && (
                            <div className={`mt-2 p-3 rounded-xl text-sm font-normal ${
                              isMitigated
                                ? 'border border-emerald-500/10 text-emerald-600/60 dark:text-emerald-400/60'
                                : 'border border-amber-500/10 text-amber-600/60 dark:text-amber-400/60'
                            }`}>
                              {strategy.applicability_note}
                            </div>
                          )}
                          {/* Fix #8: Show future value note for mitigated strategies */}
                          {strategy.future_value && (
                            <p className="text-sm text-muted-foreground/60 mt-1 italic font-normal">
                              {strategy.future_value}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xl md:text-2xl font-medium tabular-nums tracking-tight ${isDisabled ? 'text-muted-foreground/60 line-through' : 'text-primary/80'}`}>
                          {strategy.tax_savings_potential}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {isDisabled ? 'not applicable' : 'potential savings'}
                        </p>
                      </div>
                    </div>

                    {!isDisabled && ((Array.isArray(strategy.requirements) && strategy.requirements.length > 0) || strategy.timeline) ? (
                      <div className="grid sm:grid-cols-2 gap-3 pt-4">
                        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent col-span-full mb-1" />
                        {Array.isArray(strategy.requirements) && strategy.requirements.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Requirements</p>
                            <div className="space-y-1.5">
                              {strategy.requirements.slice(0, 3).map((req, i) => (
                                <p key={i} className="text-sm text-foreground font-normal flex items-start gap-2">
                                  <span className="text-primary/40 flex-shrink-0">→</span>
                                  <span>{req}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {strategy.timeline && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Timeline</p>
                            <p className="text-sm text-foreground font-normal">{strategy.timeline}</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Dynasty Trusts */}
          {auditData.dynasty_trusts?.found && Array.isArray(auditData.dynasty_trusts.jurisdictions) && auditData.dynasty_trusts.jurisdictions.length > 0 && (
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE_OUT_EXPO }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                Dynasty Trust Structures
              </p>

              <div className="rounded-2xl border border-border/30 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 sm:px-10 py-3">
                  <div className="col-span-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Structure</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Duration</p>
                  </div>
                  <div className="col-span-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Protection Level</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

                {/* Table Rows */}
                {auditData.dynasty_trusts.jurisdictions.slice(0, 4).map((trust, idx, arr) => (
                  <div key={idx}>
                    <div className="grid grid-cols-12 px-6 sm:px-10 py-4">
                      <div className="col-span-4">
                        <p className="text-sm font-normal text-foreground">{trust.name || trust.jurisdiction}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm font-medium tabular-nums text-foreground">
                          {trust.perpetuity_period || trust.max_duration ||
                           (trust.perpetuity_years ? `${trust.perpetuity_years} years` : '—')}
                        </p>
                      </div>
                      <div className="col-span-5">
                        <p className="text-sm text-muted-foreground/60 font-normal">
                          {trust.asset_protection || (trust.tax_benefits?.[0]) || 'Standard protection'}
                        </p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
                    )}
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              {(auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity) && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-card/50 p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-1">SFO Recommendation</p>
                      <p className="text-sm font-normal text-foreground">
                        {auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity}
                      </p>
                      {auditData.dynasty_trusts.rationale && (
                        <p className="text-sm text-muted-foreground/60 mt-1 font-normal">{auditData.dynasty_trusts.rationale}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Succession Vehicles */}
          {Array.isArray(auditData.succession_vehicles) && auditData.succession_vehicles.length > 0 && (
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT_EXPO }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                Succession Vehicles
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {auditData.succession_vehicles.slice(0, 4).map((vehicle, idx) => (
                  <div key={idx} className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs tracking-[0.15em] uppercase font-medium text-primary/60">
                        {vehicle.vehicle_type || vehicle.type || 'Vehicle'}
                      </span>
                    </div>
                    <h5 className="text-sm font-normal text-foreground mb-3">{vehicle.name}</h5>
                    {(vehicle.tax_benefits || vehicle.benefits) && (
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(vehicle.tax_benefits) ? vehicle.tax_benefits :
                          Array.isArray(vehicle.benefits) ? vehicle.benefits : [])
                          .slice(0, 2).map((benefit, i) => (
                          <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-primary/20 text-primary/80">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Freeport Options */}
          {auditData.freeport_options?.found && Array.isArray(auditData.freeport_options.freeports) && auditData.freeport_options.freeports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.8, ease: EASE_OUT_EXPO }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                Freeport Storage Options
              </p>

              <div className="flex flex-wrap gap-3">
                {auditData.freeport_options.freeports.map((freeport, idx) => (
                  <div key={idx} className="rounded-xl border border-border/20 bg-card/50 px-4 py-3">
                    <span className="text-sm font-normal text-foreground">{freeport.name}</span>
                    {(freeport.jurisdiction || freeport.location) && (
                      <span className="text-xs text-muted-foreground/60 ml-2">
                        ({freeport.jurisdiction || freeport.location})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        );
      })}

      {/* Intelligence Footer */}
      <motion.div
        className="flex items-center justify-center gap-2 pt-8"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT_EXPO }}
      >
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Grounded in HNWI Chronicles KG: Stamp Duty Rates, Tax Strategies, Trust Structures
        </p>
      </motion.div>
    </div>
  );
};

export default RealAssetAuditSection;
