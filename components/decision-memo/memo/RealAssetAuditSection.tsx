/**
 * REAL ASSET AUDIT INTELLIGENCE SECTION
 * SFO-Grade presentation of KGv3-verified data:
 * Stamp Duty, Loopholes, Dynasty Trusts, Freeports
 */

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useCitationPanel } from '@/contexts/elite-citation-panel-context';

// Types
interface StampDutyData {
  found: boolean;
  foreign_buyer_surcharge?: {
    rate_pct: number;
    effective_date?: string;
    description?: string;
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
  }>;
  statute_citation?: string;
  official_source_url?: string;
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
  found: boolean;
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
  found: boolean;
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
  data: RealAssetAuditData;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  transactionValue?: number;
}

export const RealAssetAuditSection: React.FC<RealAssetAuditSectionProps> = ({
  data,
  sourceJurisdiction,
  destinationJurisdiction,
  transactionValue = 0,
}) => {
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

  // Calculate summary metrics (only from actual jurisdiction data)
  const summaryMetrics = useMemo(() => {
    let totalStrategies = 0;
    let maxSurcharge = 0;
    let hasLoophole = false;
    let trustOptions = 0;

    jurisdictionKeys.forEach(key => {
      const audit = data[key];
      const ratePct = audit.stamp_duty?.foreign_buyer_surcharge?.rate_pct;
      if (typeof ratePct === 'number' && ratePct > 0) {
        maxSurcharge = Math.max(maxSurcharge, ratePct);
      }
      const commercialRate = audit.stamp_duty?.commercial_rates?.foreign_surcharge_pct;
      if (typeof commercialRate === 'number' && commercialRate === 0) {
        hasLoophole = true;
      }
      if (Array.isArray(audit.loophole_strategies)) {
        totalStrategies += audit.loophole_strategies.length;
      }
      if (Array.isArray(audit.dynasty_trusts?.jurisdictions)) {
        trustOptions += audit.dynasty_trusts.jurisdictions.length;
      }
    });

    return { totalStrategies, maxSurcharge, hasLoophole, trustOptions };
  }, [data, jurisdictionKeys]);

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
      {/* Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 tracking-wide">
          REAL ASSET AUDIT INTELLIGENCE
        </h2>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          KGv3-verified stamp duty, tax strategies & trust structures
        </p>
      </motion.div>

      {/* Executive Summary Card */}
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl sm:rounded-3xl shadow-xl">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />

          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {/* Main Metric */}
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                Transfer Tax Analysis
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Foreign Buyer Tax */}
              <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Foreign Buyer Tax</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${summaryMetrics.maxSurcharge >= 50 ? 'text-red-500' : summaryMetrics.maxSurcharge >= 20 ? 'text-primary' : 'text-foreground'}`}>
                  {summaryMetrics.maxSurcharge}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">ABSD Rate</p>
              </div>

              {/* Tax Impact */}
              {transactionValue > 0 && (
                <div className="p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Tax Impact</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                    {formatCurrency(transactionValue * summaryMetrics.maxSurcharge / 100)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">on {formatCurrency(transactionValue)}</p>
                </div>
              )}

              {/* Strategies Found */}
              <div className="p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Tax Strategies</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{summaryMetrics.totalStrategies}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Identified</p>
              </div>

              {/* Loophole Status */}
              <div className={`p-3 sm:p-4 rounded-xl border ${summaryMetrics.hasLoophole ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50'}`}>
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1">Commercial Route</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${summaryMetrics.hasLoophole ? 'text-primary' : 'text-muted-foreground'}`}>
                  {summaryMetrics.hasLoophole ? '0%' : 'N/A'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">{summaryMetrics.hasLoophole ? 'Loophole Available' : 'No Loophole'}</p>
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
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 + jurisdictionIdx * 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{jurisdiction}</h3>
              <p className="text-xs text-muted-foreground">Jurisdiction Analysis</p>
            </div>
          </motion.div>

          {/* Stamp Duty Table */}
          {auditData.stamp_duty?.found && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      Stamp Duty Schedule
                    </h4>
                    {(auditData.stamp_duty.statute_citation || auditData.stamp_duty.official_source_url) && (
                      <button
                        onClick={() => handleSourceClick(
                          `${jurisdiction} Stamp Duty`,
                          'Government Source',
                          auditData.stamp_duty?.official_source_url,
                          auditData.stamp_duty?.statute_citation
                        )}
                        className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Source
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {/* Foreign Buyer Surcharge Row */}
                  {auditData.stamp_duty.foreign_buyer_surcharge && (
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-6 sm:col-span-5 px-5 py-4">
                        <p className="text-sm font-medium text-foreground">Foreign Buyer Surcharge (ABSD)</p>
                        {auditData.stamp_duty.foreign_buyer_surcharge.effective_date && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Since {auditData.stamp_duty.foreign_buyer_surcharge.effective_date}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-4 px-5 py-4 text-right">
                        {typeof auditData.stamp_duty.foreign_buyer_surcharge.rate_pct === 'number' ? (
                          <span className={`text-lg sm:text-xl font-bold ${
                            auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 50 ? 'text-red-500' :
                            auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 20 ? 'text-primary' : 'text-foreground'
                          }`}>
                            {auditData.stamp_duty.foreign_buyer_surcharge.rate_pct}%
                          </span>
                        ) : (
                          <span className="text-lg sm:text-xl font-bold text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="col-span-3 px-5 py-4 text-right">
                        {typeof auditData.stamp_duty.foreign_buyer_surcharge.rate_pct === 'number' && (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${
                            auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 50 ? 'bg-red-500/10 text-red-500' :
                            auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 20 ? 'bg-primary/10 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 50 ? 'Prohibitive' :
                             auditData.stamp_duty.foreign_buyer_surcharge.rate_pct >= 20 ? 'High' : 'Moderate'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Commercial Rates Row */}
                  {auditData.stamp_duty.commercial_rates && (
                    <div className={`grid grid-cols-12 items-center ${typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' && auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 ? 'bg-primary/5' : ''}`}>
                      <div className="col-span-6 sm:col-span-5 px-5 py-4">
                        <p className="text-sm font-medium text-foreground">Commercial Property</p>
                        {auditData.stamp_duty.commercial_rates.note && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{auditData.stamp_duty.commercial_rates.note}</p>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-4 px-5 py-4 text-right">
                        {typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' ? (
                          <span className={`text-lg sm:text-xl font-bold ${auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 ? 'text-primary' : 'text-foreground'}`}>
                            {auditData.stamp_duty.commercial_rates.foreign_surcharge_pct}%
                          </span>
                        ) : (
                          <span className="text-lg sm:text-xl font-bold text-muted-foreground">N/A</span>
                        )}
                      </div>
                      <div className="col-span-3 px-5 py-4 text-right">
                        {typeof auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 'number' && auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 && (
                          <span className="text-[9px] font-bold px-2 py-1 rounded bg-primary text-primary-foreground uppercase">
                            Loophole
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Residential Rate Tiers - Premium Visual */}
                  {Array.isArray(auditData.stamp_duty.residential_rates) && auditData.stamp_duty.residential_rates.length > 0 && (
                    <div className="border-t border-border">
                      <div className="px-5 py-4 bg-gradient-to-r from-muted/50 to-transparent">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Residential BSD Tiers</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{auditData.stamp_duty.residential_rates.length} brackets</span>
                        </div>
                      </div>

                      {/* Progressive Tier Cards */}
                      <div className="p-4 sm:p-5">
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
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-card border-border hover:border-primary/20'
                                }`}
                              >
                                {/* Tier Badge */}
                                <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                  idx === arr.length - 1
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {idx + 1}
                                </div>

                                {/* Rate Display */}
                                <div className="text-center mb-2">
                                  <span className={`text-lg sm:text-xl font-bold ${
                                    idx === arr.length - 1 ? 'text-primary' : 'text-foreground'
                                  }`}>
                                    {typeof tier.rate_pct === 'number' ? `${tier.rate_pct}%` : 'N/A'}
                                  </span>
                                </div>

                                {/* Progress Indicator */}
                                <div className="h-1 bg-muted/50 rounded-full overflow-hidden mb-2">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      idx === arr.length - 1 ? 'bg-primary' : 'bg-primary/40'
                                    }`}
                                    style={{ width: `${Math.max(intensity * 100, 10)}%` }}
                                  />
                                </div>

                                {/* Threshold */}
                                <p className="text-[9px] sm:text-[10px] text-muted-foreground text-center leading-tight break-words">
                                  {tier.threshold || tier.description || `Bracket ${idx + 1}`}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progressive Scale Legend */}
                        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary/30" />
                            <span className="text-[9px] text-muted-foreground">Lower tiers</span>
                          </div>
                          <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[9px] text-muted-foreground">Top bracket</span>
                          </div>
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
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Tax Optimization Strategies
                </h4>
                <span className="text-xs text-muted-foreground">{auditData.loophole_strategies.length} found</span>
              </div>

              <div className="space-y-3">
                {auditData.loophole_strategies.map((strategy, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-semibold text-foreground">{strategy.name}</h5>
                          {(strategy.mechanism || strategy.description) && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {strategy.mechanism || strategy.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary">{strategy.tax_savings_potential}</p>
                        <p className="text-[10px] text-muted-foreground">potential savings</p>
                      </div>
                    </div>

                    {(Array.isArray(strategy.requirements) && strategy.requirements.length > 0) || strategy.timeline ? (
                      <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                        {Array.isArray(strategy.requirements) && strategy.requirements.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Requirements</p>
                            <div className="space-y-1.5">
                              {strategy.requirements.slice(0, 3).map((req, i) => (
                                <p key={i} className="text-xs text-foreground flex items-start gap-2">
                                  <span className="text-primary flex-shrink-0">→</span>
                                  <span>{req}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {strategy.timeline && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Timeline</p>
                            <p className="text-xs text-foreground">{strategy.timeline}</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dynasty Trusts */}
          {auditData.dynasty_trusts?.found && Array.isArray(auditData.dynasty_trusts.jurisdictions) && auditData.dynasty_trusts.jurisdictions.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Dynasty Trust Structures
              </h4>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-muted/50 border-b border-border">
                  <div className="col-span-4 px-5 py-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Structure</p>
                  </div>
                  <div className="col-span-3 px-5 py-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Duration</p>
                  </div>
                  <div className="col-span-5 px-5 py-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Protection Level</p>
                  </div>
                </div>

                {/* Table Rows */}
                {auditData.dynasty_trusts.jurisdictions.slice(0, 4).map((trust, idx) => (
                  <div key={idx} className="grid grid-cols-12 border-b border-border last:border-0">
                    <div className="col-span-4 px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{trust.name || trust.jurisdiction}</p>
                    </div>
                    <div className="col-span-3 px-5 py-4">
                      <p className="text-sm text-foreground">
                        {trust.perpetuity_period || trust.max_duration ||
                         (trust.perpetuity_years ? `${trust.perpetuity_years} years` : '—')}
                      </p>
                    </div>
                    <div className="col-span-5 px-5 py-4">
                      <p className="text-xs text-muted-foreground">
                        {trust.asset_protection || (trust.tax_benefits?.[0]) || 'Standard protection'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              {(auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity) && (
                <div className="mt-4 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">SFO Recommendation</p>
                      <p className="text-sm font-medium text-foreground">
                        {auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity}
                      </p>
                      {auditData.dynasty_trusts.rationale && (
                        <p className="text-xs text-muted-foreground mt-1">{auditData.dynasty_trusts.rationale}</p>
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
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Succession Vehicles
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                {auditData.succession_vehicles.slice(0, 4).map((vehicle, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {vehicle.vehicle_type || vehicle.type || 'Vehicle'}
                      </span>
                    </div>
                    <h5 className="text-sm font-medium text-foreground mb-3">{vehicle.name}</h5>
                    {(vehicle.tax_benefits || vehicle.benefits) && (
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(vehicle.tax_benefits) ? vehicle.tax_benefits :
                          Array.isArray(vehicle.benefits) ? vehicle.benefits : [])
                          .slice(0, 2).map((benefit, i) => (
                          <span key={i} className="text-[10px] text-primary bg-primary/10 px-2 py-1 rounded">
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
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Freeport Storage Options
              </h4>

              <div className="flex flex-wrap gap-3">
                {auditData.freeport_options.freeports.map((freeport, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl px-4 py-3">
                    <span className="text-sm font-medium text-foreground">{freeport.name}</span>
                    {(freeport.jurisdiction || freeport.location) && (
                      <span className="text-xs text-muted-foreground ml-2">
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
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <p className="text-[10px] text-muted-foreground">
          Grounded in HNWI Chronicles KG: Stamp Duty Rates, Tax Strategies, Trust Structures
        </p>
      </motion.div>
    </div>
  );
};

export default RealAssetAuditSection;
