// components/decision-memo/memo/StructureComparisonMatrix.tsx
// INSTITUTIONAL STRUCTURE COMPARISON - "Money Talking" design language
// Top 5 structures as comparison table, remaining as compact list

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  ArrowRight,
  Layers,
  Sparkles,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  useAnimatedMetric,
  useDecisionMemoRenderContext,
  useReportInView,
} from './decision-memo-render-context';

type StringOrObject = string | Record<string, unknown>;

/** Safely extract display text from items that may be strings or objects */
function toDisplayString(item: StringOrObject): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    // Backend corridor/strategy objects: {destination, reason, benefit, requirement}
    const dest = item.destination;
    const reason = item.reason;
    const benefit = item.benefit;
    if (dest && reason) {
      return `${String(dest)} — ${String(reason)}${benefit ? ` (${String(benefit)})` : ''}`;
    }
    if (dest) return String(dest);
    if (reason) return String(reason);
    // Generic fallback: join all values
    return Object.values(item).filter(Boolean).map(String).join(' — ');
  }
  return String(item);
}

interface Structure {
  name?: string;
  type?: string;
  verdict?: string;
  net_benefit_10yr?: number;
  tax_savings_pct?: number;
  viable?: boolean;
  warnings?: StringOrObject[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
  estate_tax_exposure?: number;
  is_nra?: boolean;
}

interface StructureComparisonMatrixProps {
  structureOptimization: {
    verdict?: string;
    verdict_reason?: string;
    optimal_structure?: {
      name?: string;
      type?: string;
      net_benefit_10yr?: number;
      tax_savings_pct?: number;
      warnings?: StringOrObject[];
      setup_cost?: number;
      annual_cost?: number;
      rental_income_rate?: number;
      capital_gains_rate?: number;
      estate_tax_rate?: number;
      estate_tax_exposure?: number;
      is_nra?: boolean;
      anti_avoidance_flags?: string[];
    };
    structures_analyzed?: Structure[];
    alternative_corridors?: StringOrObject[];
    alternative_strategies?: StringOrObject[];
  };
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Format benefit for display
function formatBenefit(benefit: number): string {
  const abs = Math.abs(benefit);
  if (abs >= 1_000_000) {
    return `${benefit >= 0 ? '+' : '-'}$${(abs / 1_000_000).toFixed(2)}M`;
  } else if (abs >= 1_000) {
    return `${benefit >= 0 ? '+' : '-'}$${(abs / 1_000).toFixed(0)}K`;
  }
  return `${benefit >= 0 ? '+' : '-'}$${abs.toLocaleString()}`;
}

function formatCost(value?: number): string {
  if (value === undefined || value === null || value === 0) return '\u2014';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatRate(value?: number): string {
  if (value === undefined || value === null) return '\u2014';
  return `${value.toFixed(1)}%`;
}

// Animated counter
function AnimatedBenefit({ value }: { value: number }) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useReportInView(ref, { once: true });
  const display = useAnimatedMetric(value, {
    duration: 1400,
    enabled: motionEnabled && isInView,
  });

  return <span ref={ref}>{formatBenefit(display)}</span>;
}

// Verdict badge (compact)
function VerdictBadge({ verdict, compact = false }: { verdict: string; compact?: boolean }) {
  const config: Record<string, { border: string; text: string; icon: React.ReactNode; label: string }> = {
    'PROCEED': {
      border: 'border-emerald-500/20',
      text: 'text-emerald-500/80',
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'PROCEED'
    },
    'PROCEED_MODIFIED': {
      border: 'border-amber-500/20',
      text: 'text-amber-500/80',
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'MODIFIED'
    },
    'PROCEED_DIVERSIFICATION_ONLY': {
      border: 'border-gold/20',
      text: 'text-gold/80',
      icon: <Layers className="w-3 h-3" />,
      label: 'DIVERSIFY'
    },
    'DO_NOT_PROCEED': {
      border: 'border-red-500/20',
      text: 'text-red-500/80',
      icon: <XCircle className="w-3 h-3" />,
      label: compact ? 'DNP' : 'DO NOT PROCEED'
    }
  };

  const c = config[verdict] || config['DO_NOT_PROCEED'];

  return (
    <span className={`inline-flex items-center gap-1 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${c.border} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// Check if all structures share identical tax rates
function checkIdenticalTaxRates(structures: Structure[]): boolean {
  if (structures.length <= 1) return false;
  const first = structures[0];
  return structures.every(s =>
    s.rental_income_rate === first.rental_income_rate &&
    s.capital_gains_rate === first.capital_gains_rate &&
    s.estate_tax_rate === first.estate_tax_rate
  );
}

export function StructureComparisonMatrix({
  structureOptimization,
  sourceJurisdiction,
  destinationJurisdiction
}: StructureComparisonMatrixProps) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const [isVisible, setIsVisible] = useState(!motionEnabled);
  const [showAllRemaining, setShowAllRemaining] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useReportInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const {
    verdict,
    verdict_reason,
    optimal_structure,
    structures_analyzed = [],
    alternative_corridors = [],
    alternative_strategies = []
  } = structureOptimization;

  // Sort: optimal first, then viable, then by benefit (highest first)
  const sortedStructures = [...structures_analyzed].sort((a, b) => {
    if (a.name === optimal_structure?.name) return -1;
    if (b.name === optimal_structure?.name) return 1;
    if (a.viable !== b.viable) return a.viable ? -1 : 1;
    return (b.net_benefit_10yr ?? 0) - (a.net_benefit_10yr ?? 0);
  });

  const viableCount = structures_analyzed.filter(s => s.viable || s.verdict === 'PROCEED' || s.verdict === 'PROCEED_MODIFIED').length;

  // Split into top 5 (table) and remaining (compact list)
  const top5 = sortedStructures.slice(0, 5);
  const remaining = sortedStructures.slice(5);

  // Check if tax rates are identical across all structures
  const allIdenticalRates = checkIdenticalTaxRates(structures_analyzed);
  const sharedRentalRate = allIdenticalRates ? structures_analyzed[0]?.rental_income_rate : undefined;
  const sharedCGTRate = allIdenticalRates ? structures_analyzed[0]?.capital_gains_rate : undefined;
  const sharedEstateRate = allIdenticalRates ? structures_analyzed[0]?.estate_tax_rate : undefined;

  if (structures_analyzed.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="relative">
      <div data-print-block="keep" data-print-max-height="880">
        {/* SECTION HEADER */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">Structure Optimization</p>

          <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-2">
            Ownership Structure
            <br />
            <span className="text-gold/80">Analysis</span>
          </h2>

          <div className="flex items-center gap-2 text-muted-foreground/60 flex-wrap">
            <span className="text-xs font-normal">{sourceJurisdiction}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold/70" />
            <span className="text-xs font-normal">{destinationJurisdiction}</span>
            <span className="text-sm text-muted-foreground/60 ml-2">{structures_analyzed.length} structures analyzed</span>
          </div>

          <motion.div
            className="mt-4 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>

        {/* OVERALL VERDICT */}
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-normal text-foreground mb-3">
              {verdict === 'PROCEED' && 'Viable Structure Identified'}
              {verdict === 'DO_NOT_PROCEED' && 'No Viable Structure Without Relocation'}
              {verdict === 'PROCEED_MODIFIED' && 'Viable With Modifications'}
              {verdict === 'PROCEED_DIVERSIFICATION_ONLY' && 'Diversification Pathway Only'}
            </h3>
            <p className="text-sm text-muted-foreground/60 leading-loose sm:leading-relaxed font-normal">
              {verdict_reason}
            </p>

            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60">
                <span className="font-medium text-foreground">{structures_analyzed.length}</span>
                <span className="font-normal">analyzed</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60">
                <span className="font-medium text-emerald-500/80">{viableCount}</span>
                <span className="font-normal">viable</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground/60">
                <span className="font-medium text-red-500/80">{structures_analyzed.length - viableCount}</span>
                <span className="font-normal">rejected</span>
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      </div>

      {/* OPTIMAL STRUCTURE - Premium hero card */}
      {optimal_structure && (
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">Recommended Structure</p>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-12">
              <div>
                <p className="text-2xl sm:text-3xl font-normal text-foreground tracking-tight mb-1">{optimal_structure.name || 'Unnamed Structure'}</p>
                <p className="text-sm text-muted-foreground/60 font-normal mb-6">{optimal_structure.type || 'Unknown type'}</p>

                {((optimal_structure.setup_cost !== undefined && optimal_structure.setup_cost > 0) ||
                 (optimal_structure.annual_cost !== undefined && optimal_structure.annual_cost > 0)) && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5 mb-5 space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Implementation Costs</p>
                    {optimal_structure.setup_cost !== undefined && optimal_structure.setup_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground/60 font-normal">Setup Cost</span>
                        <span className="font-medium text-foreground tabular-nums">{formatCost(optimal_structure.setup_cost)}</span>
                      </div>
                    )}
                    {optimal_structure.annual_cost !== undefined && optimal_structure.annual_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground/60 font-normal">Annual Maintenance</span>
                        <span className="font-medium text-foreground tabular-nums">{formatCost(optimal_structure.annual_cost)}/yr</span>
                      </div>
                    )}
                  </div>
                )}

                {(optimal_structure.rental_income_rate !== undefined ||
                  optimal_structure.capital_gains_rate !== undefined ||
                  optimal_structure.estate_tax_rate !== undefined) && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Effective Tax Rates</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {optimal_structure.rental_income_rate !== undefined && (
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Rental</p>
                          <p className="text-base font-medium tabular-nums text-foreground">{optimal_structure.rental_income_rate.toFixed(1)}%</p>
                        </div>
                      )}
                      {optimal_structure.capital_gains_rate !== undefined && (
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">CGT</p>
                          <p className="text-base font-medium tabular-nums text-foreground">{optimal_structure.capital_gains_rate.toFixed(1)}%</p>
                        </div>
                      )}
                      {optimal_structure.estate_tax_rate !== undefined && (
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Estate</p>
                          <p className="text-base font-medium tabular-nums text-foreground">{optimal_structure.estate_tax_rate.toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">10-Year Net Benefit</p>
                  <p className={`text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight ${
                    (optimal_structure.net_benefit_10yr ?? 0) >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'
                  }`}>
                    <AnimatedBenefit value={optimal_structure.net_benefit_10yr ?? 0} />
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-3 font-normal">
                    {(optimal_structure.tax_savings_pct ?? 0) >= 0 ? '+' : ''}{(optimal_structure.tax_savings_pct ?? 0).toFixed(1)}% tax savings vs. current structure
                  </p>
                </div>

                {/* Estate Tax Exposure Callout */}
                {optimal_structure.is_nra && optimal_structure.estate_tax_exposure !== undefined && optimal_structure.estate_tax_exposure > 0 && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
                    <p className="text-xs tracking-[0.15em] font-medium text-red-500/80 uppercase mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      NRA Estate Tax Exposure
                    </p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-red-500/80">
                      {formatCost(optimal_structure.estate_tax_exposure)}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-2 font-normal">
                      Based on $60,000 NRA exemption &middot; {formatRate(optimal_structure.estate_tax_rate)} effective rate
                    </p>
                  </div>
                )}
                {optimal_structure.is_nra && (optimal_structure.estate_tax_exposure === 0 || optimal_structure.estate_tax_exposure === undefined) && optimal_structure.estate_tax_rate === 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
                    <p className="text-xs tracking-[0.15em] font-medium text-emerald-500/80 uppercase flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Estate Tax Eliminated
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-2 font-normal">
                      This structure removes US situs exposure for NRA buyers
                    </p>
                  </div>
                )}

                {optimal_structure.anti_avoidance_flags && optimal_structure.anti_avoidance_flags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {optimal_structure.anti_avoidance_flags.map((flag, i) => (
                      <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                {optimal_structure.warnings && optimal_structure.warnings.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 flex-1">
                    <p className="text-xs uppercase tracking-[0.15em] font-medium text-amber-500/80 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Key Requirements
                    </p>
                    <ul className="space-y-2">
                      {optimal_structure.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/60 font-normal">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500/60 flex-shrink-0" />
                          <span>{toDisplayString(warning)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* IDENTICAL TAX RATES NOTICE */}
      {allIdenticalRates && (
        <motion.div
          className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5 sm:p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-normal text-foreground mb-2">
                All structures share identical effective tax rates
              </p>
              <p className="text-sm text-muted-foreground/60 leading-loose sm:leading-relaxed mb-4 font-normal">
                US worldwide taxation applies at the same rates regardless of ownership vehicle. The differentiator between structures is implementation cost, not tax efficiency.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs font-medium tabular-nums text-foreground rounded-xl border border-border/20 bg-card/50 px-3 py-1.5">
                  Rental: {formatRate(sharedRentalRate)}
                </span>
                <span className="text-xs font-medium tabular-nums text-foreground rounded-xl border border-border/20 bg-card/50 px-3 py-1.5">
                  CGT: {formatRate(sharedCGTRate)}
                </span>
                <span className="text-xs font-medium tabular-nums text-foreground rounded-xl border border-border/20 bg-card/50 px-3 py-1.5">
                  Estate: {formatRate(sharedEstateRate)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TOP 5 STRUCTURES - Comparison Table */}
      <motion.div
        className="mb-8 sm:mb-12"
        data-print-block="keep"
        data-print-max-height="960"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
          Top {Math.min(5, sortedStructures.length)} Structures &mdash; Comparison Matrix
        </p>

        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-4">
          {top5.map((structure, index) => {
            const isOptimal = structure.name === optimal_structure?.name;
            const isPositive = (structure.net_benefit_10yr ?? 0) >= 0;
            return (
              <div
                key={structure.name || `structure-${index}`}
                className={`rounded-xl border p-5 ${
                  isOptimal ? 'border-gold/30 bg-gold/[0.03]' : 'border-border/20 bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-normal flex-shrink-0 ${isOptimal ? 'text-gold/80' : 'text-muted-foreground/60'}`}>
                      {isOptimal ? <Sparkles className="w-4 h-4 text-gold/80" /> : `#${index + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-normal ${isOptimal ? 'text-gold/80' : 'text-foreground'} line-clamp-2`}>
                        {structure.name || 'Unnamed Structure'}
                      </p>
                      <p className="text-sm text-muted-foreground/60 font-normal">{structure.type || 'Unknown type'}</p>
                    </div>
                  </div>
                  <VerdictBadge verdict={structure.verdict || 'DO_NOT_PROCEED'} compact />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 text-xs">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">10yr Benefit</p>
                    <p className={`font-medium tabular-nums ${isPositive ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                      {formatBenefit(structure.net_benefit_10yr ?? 0)}
                    </p>
                  </div>
                  {!allIdenticalRates && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Tax Rates</p>
                      <p className="font-medium tabular-nums text-foreground">
                        R:{formatRate(structure.rental_income_rate)} C:{formatRate(structure.capital_gains_rate)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Setup / Annual</p>
                    <p className="font-medium tabular-nums text-muted-foreground/60">{formatCost(structure.setup_cost)} / {formatCost(structure.annual_cost)}</p>
                  </div>
                  {!allIdenticalRates && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
                        {structure.estate_tax_exposure !== undefined && structure.estate_tax_exposure > 0 ? 'Estate Exposure' : 'Estate Tax'}
                      </p>
                      {structure.estate_tax_exposure !== undefined && structure.estate_tax_exposure > 0 ? (
                        <p className="font-medium tabular-nums text-red-500/80">{formatCost(structure.estate_tax_exposure)}</p>
                      ) : structure.is_nra && structure.estate_tax_rate === 0 ? (
                        <p className="font-medium tabular-nums text-emerald-500/80">$0</p>
                      ) : (
                        <p className="font-medium tabular-nums text-foreground">{formatRate(structure.estate_tax_rate)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block rounded-2xl border border-border/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60 w-8">#</th>
                  <th className="text-left px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60 min-w-[100px] sm:min-w-[180px]">Structure</th>
                  <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">10yr Benefit</th>
                  {!allIdenticalRates && (
                    <>
                      <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Rental</th>
                      <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">CGT</th>
                      <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">
                        {structures_analyzed.some(s => s.estate_tax_exposure && s.estate_tax_exposure > 0) ? 'Estate $' : 'Estate'}
                      </th>
                    </>
                  )}
                  <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Setup</th>
                  <th className="text-right px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Annual</th>
                  <th className="text-center px-4 py-3.5 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((structure, index) => {
                  const isOptimal = structure.name === optimal_structure?.name;
                  const isPositive = (structure.net_benefit_10yr ?? 0) >= 0;

                  return (
                    <tr
                      key={structure.name || `top-structure-${index}`}
                      className={`transition-colors ${
                        isOptimal
                          ? 'bg-gold/[0.03] hover:bg-gold/[0.05]'
                          : 'hover:bg-card/30'
                      } ${index < top5.length - 1 ? 'border-b border-border/20' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <span className={`text-xs font-normal ${isOptimal ? 'text-gold/80' : 'text-muted-foreground/60'}`}>
                          {isOptimal ? (
                            <Sparkles className="w-4 h-4 text-gold/80" />
                          ) : (
                            index + 1
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className={`text-sm font-normal ${isOptimal ? 'text-gold/80' : 'text-foreground'}`}>
                            {structure.name || 'Unnamed Structure'}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5 font-normal">{structure.type || 'Unknown type'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`text-sm font-medium tabular-nums ${isPositive ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                          {formatBenefit(structure.net_benefit_10yr ?? 0)}
                        </span>
                      </td>
                      {!allIdenticalRates && (
                        <>
                          <td className="px-4 py-4 text-right">
                            <span className="text-xs font-medium tabular-nums text-foreground/70">{formatRate(structure.rental_income_rate)}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-xs font-medium tabular-nums text-foreground/70">{formatRate(structure.capital_gains_rate)}</span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {structure.estate_tax_exposure !== undefined && structure.estate_tax_exposure > 0 ? (
                              <span className="text-xs font-medium tabular-nums text-red-500/80">{formatCost(structure.estate_tax_exposure)}</span>
                            ) : structure.is_nra && structure.estate_tax_rate === 0 ? (
                              <span className="text-xs font-medium tabular-nums text-emerald-500/80">$0</span>
                            ) : (
                              <span className="text-xs font-medium tabular-nums text-foreground/70">{formatRate(structure.estate_tax_rate)}</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-4 text-right">
                        <span className="text-xs font-medium tabular-nums text-muted-foreground/60">{formatCost(structure.setup_cost)}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-xs font-medium tabular-nums text-muted-foreground/60">{formatCost(structure.annual_cost)}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <VerdictBadge verdict={structure.verdict || 'DO_NOT_PROCEED'} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* REMAINING STRUCTURES - Collapsible compact table */}
      {remaining.length > 0 && (
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => setShowAllRemaining(!showAllRemaining)}
            className="flex items-center gap-2.5 mb-4 w-full text-left group"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium flex-1 group-hover:text-muted-foreground/70 transition-colors">
              {remaining.length} Additional Structures
            </p>
            {showAllRemaining ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground/60" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
            )}
          </button>

          {showAllRemaining && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60 w-8">#</th>
                        <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Structure</th>
                        <th className="text-right px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">10yr Benefit</th>
                        <th className="text-right px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Setup</th>
                        <th className="text-right px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Annual</th>
                        <th className="text-center px-4 py-3 text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground/60">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((structure, index) => (
                        <tr
                          key={structure.name || `remaining-structure-${index}`}
                          className={`${index < remaining.length - 1 ? 'border-b border-border/20' : ''} hover:bg-card/30 transition-colors`}
                        >
                          <td className="px-4 py-3 text-xs font-medium text-muted-foreground/60 tabular-nums">{index + 6}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-normal text-foreground">{structure.name || 'Unnamed Structure'}</p>
                            <p className="text-xs text-muted-foreground/60 font-normal">{structure.type || 'Unknown type'}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-medium tabular-nums ${
                              (structure.net_benefit_10yr ?? 0) >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'
                            }`}>
                              {formatBenefit(structure.net_benefit_10yr ?? 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium tabular-nums text-muted-foreground/60">
                            {formatCost(structure.setup_cost)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-medium tabular-nums text-muted-foreground/60">
                            {formatCost(structure.annual_cost)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <VerdictBadge verdict={structure.verdict || 'DO_NOT_PROCEED'} compact />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ALTERNATIVE STRATEGIES */}
      {(alternative_corridors.length > 0 || alternative_strategies.length > 0) && (
        <motion.div
          className="mb-8 sm:mb-12 grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {alternative_corridors.length > 0 && (
            <div className="relative rounded-xl border border-border/20 bg-card/50 p-6">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-5">Alternative Corridors</p>
                <ul className="space-y-3">
                  {alternative_corridors.map((corridor, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground/60 font-normal">
                      <ArrowRight className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                      <span>{toDisplayString(corridor)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {alternative_strategies.length > 0 && (
            <div className="relative rounded-xl border border-border/20 bg-card/50 p-6">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-5">Alternative Strategies</p>
                <ul className="space-y-3">
                  {alternative_strategies.map((strategy, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground/60 font-normal">
                      <ArrowRight className="w-3.5 h-3.5 text-amber-500/40 flex-shrink-0 mt-0.5" />
                      <span>{toDisplayString(strategy)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* FOOTER */}
      <motion.div
        className="flex items-center justify-center gap-3 pt-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Structure Optimization Engine
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
      </motion.div>
    </div>
  );
}
