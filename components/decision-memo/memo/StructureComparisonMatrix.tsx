// components/decision-memo/memo/StructureComparisonMatrix.tsx
// INSTITUTIONAL STRUCTURE COMPARISON - MCP CORE OUTPUT
// Top 5 structures as comparison table, remaining as compact list

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StringOrObject = string | Record<string, any>;

/** Safely extract display text from items that may be strings or objects */
function toDisplayString(item: StringOrObject): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    // Backend corridor/strategy objects: {destination, reason, benefit, requirement}
    if (item.destination && item.reason) {
      return `${item.destination} — ${item.reason}${item.benefit ? ` (${item.benefit})` : ''}`;
    }
    if (item.destination) return item.destination;
    if (item.reason) return item.reason;
    // Generic fallback: join all values
    return Object.values(item).filter(Boolean).join(' — ');
  }
  return String(item);
}

interface Structure {
  name: string;
  type: string;
  verdict: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  viable: boolean;
  warnings: StringOrObject[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
}

interface StructureComparisonMatrixProps {
  structureOptimization: {
    verdict: string;
    verdict_reason: string;
    optimal_structure?: {
      name: string;
      type: string;
      net_benefit_10yr: number;
      tax_savings_pct: number;
      warnings: StringOrObject[];
      setup_cost?: number;
      annual_cost?: number;
      rental_income_rate?: number;
      capital_gains_rate?: number;
      estate_tax_rate?: number;
      anti_avoidance_flags?: string[];
    };
    structures_analyzed: Structure[];
    alternative_corridors: StringOrObject[];
    alternative_strategies: StringOrObject[];
  };
  sourceJurisdiction: string;
  destinationJurisdiction: string;
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
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number;
    const duration = 1400;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, isInView]);

  return <span ref={ref}>{formatBenefit(display)}</span>;
}

// Verdict badge (compact)
function VerdictBadge({ verdict, compact = false }: { verdict: string; compact?: boolean }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    'PROCEED': {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'PROCEED'
    },
    'PROCEED_MODIFIED': {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-3 h-3" />,
      label: 'MODIFIED'
    },
    'PROCEED_DIVERSIFICATION_ONLY': {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: <Layers className="w-3 h-3" />,
      label: 'DIVERSIFY'
    },
    'DO_NOT_PROCEED': {
      bg: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-600 dark:text-red-400',
      icon: <XCircle className="w-3 h-3" />,
      label: compact ? 'DNP' : 'DO NOT PROCEED'
    }
  };

  const c = config[verdict] || config['DO_NOT_PROCEED'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${c.bg} ${c.text}`}>
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
  const [isVisible, setIsVisible] = useState(false);
  const [showAllRemaining, setShowAllRemaining] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const {
    verdict,
    verdict_reason,
    optimal_structure,
    structures_analyzed,
    alternative_corridors,
    alternative_strategies
  } = structureOptimization;

  // Sort: optimal first, then viable, then by benefit (highest first)
  const sortedStructures = [...structures_analyzed].sort((a, b) => {
    if (a.name === optimal_structure?.name) return -1;
    if (b.name === optimal_structure?.name) return 1;
    if (a.viable !== b.viable) return a.viable ? -1 : 1;
    return b.net_benefit_10yr - a.net_benefit_10yr;
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

  return (
    <div ref={sectionRef} className="relative">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION HEADER                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-3 w-fit">
          <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          <span className="text-primary text-[9px] sm:text-xs font-semibold tracking-wide uppercase">Structure Optimization</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight mb-2">
          Ownership Structure
          <br />
          <span className="text-primary">Analysis</span>
        </h2>

        <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
          <span className="text-xs sm:text-sm font-medium">{sourceJurisdiction}</span>
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium">{destinationJurisdiction}</span>
          <span className="text-xs text-muted-foreground/60 ml-2">{structures_analyzed.length} structures analyzed</span>
        </div>

        <motion.div
          className="mt-3 w-16 h-1 bg-gradient-to-r from-primary to-primary/40 rounded-full"
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* OVERALL VERDICT                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className={`relative overflow-hidden mb-6 sm:mb-8 rounded-xl sm:rounded-2xl border-2 p-5 sm:p-8 ${
          verdict === 'PROCEED' || verdict === 'PROCEED_MODIFIED'
            ? 'bg-gradient-to-br from-card via-card to-emerald-500/5 border-emerald-500/20'
            : verdict === 'DO_NOT_PROCEED'
            ? 'bg-gradient-to-br from-card via-card to-red-500/5 border-red-500/20'
            : 'bg-gradient-to-br from-card via-card to-amber-500/5 border-amber-500/20'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 ${
          verdict === 'PROCEED' || verdict === 'PROCEED_MODIFIED'
            ? 'bg-gradient-to-bl from-emerald-500/10'
            : verdict === 'DO_NOT_PROCEED'
            ? 'bg-gradient-to-bl from-red-500/10'
            : 'bg-gradient-to-bl from-amber-500/10'
        } to-transparent rounded-bl-full`} />

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              verdict === 'PROCEED' || verdict === 'PROCEED_MODIFIED'
                ? 'bg-emerald-500/10'
                : verdict === 'DO_NOT_PROCEED'
                ? 'bg-red-500/10'
                : 'bg-amber-500/10'
            }`}>
              {(verdict === 'PROCEED' || verdict === 'PROCEED_MODIFIED') && <CheckCircle className="w-7 h-7 text-emerald-500" />}
              {verdict === 'DO_NOT_PROCEED' && <XCircle className="w-7 h-7 text-red-500" />}
              {verdict === 'PROCEED_DIVERSIFICATION_ONLY' && <AlertTriangle className="w-7 h-7 text-amber-500" />}
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                {verdict === 'PROCEED' && 'Viable Structure Identified'}
                {verdict === 'DO_NOT_PROCEED' && 'No Viable Structure Without Relocation'}
                {verdict === 'PROCEED_MODIFIED' && 'Viable With Modifications'}
                {verdict === 'PROCEED_DIVERSIFICATION_ONLY' && 'Diversification Pathway Only'}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {verdict_reason}
              </p>

              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span><strong className="text-foreground">{structures_analyzed.length}</strong> analyzed</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span><strong className="text-foreground">{viableCount}</strong> viable</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  <span><strong className="text-foreground">{structures_analyzed.length - viableCount}</strong> rejected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* OPTIMAL STRUCTURE - Premium hero card                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {optimal_structure && (
        <motion.div
          className="relative overflow-hidden mb-6 sm:mb-8 rounded-xl sm:rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />

          <div className="relative z-10 p-5 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-primary uppercase tracking-wider">Recommended Structure</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{optimal_structure.name}</p>
                <p className="text-sm text-muted-foreground mb-5">{optimal_structure.type}</p>

                {((optimal_structure.setup_cost !== undefined && optimal_structure.setup_cost > 0) ||
                 (optimal_structure.annual_cost !== undefined && optimal_structure.annual_cost > 0)) && (
                  <div className="bg-background/60 rounded-xl p-4 mb-4 border border-border/50 space-y-2">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Implementation Costs</p>
                    {optimal_structure.setup_cost !== undefined && optimal_structure.setup_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Setup Cost</span>
                        <span className="font-semibold text-foreground font-mono">{formatCost(optimal_structure.setup_cost)}</span>
                      </div>
                    )}
                    {optimal_structure.annual_cost !== undefined && optimal_structure.annual_cost > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Maintenance</span>
                        <span className="font-semibold text-foreground font-mono">{formatCost(optimal_structure.annual_cost)}/yr</span>
                      </div>
                    )}
                  </div>
                )}

                {(optimal_structure.rental_income_rate !== undefined ||
                  optimal_structure.capital_gains_rate !== undefined ||
                  optimal_structure.estate_tax_rate !== undefined) && (
                  <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                    <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Effective Tax Rates</p>
                    <div className="grid grid-cols-3 gap-2">
                      {optimal_structure.rental_income_rate !== undefined && (
                        <div className="text-center bg-muted/30 rounded-lg p-2">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Rental</p>
                          <p className="text-base font-bold text-foreground">{optimal_structure.rental_income_rate.toFixed(1)}%</p>
                        </div>
                      )}
                      {optimal_structure.capital_gains_rate !== undefined && (
                        <div className="text-center bg-muted/30 rounded-lg p-2">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">CGT</p>
                          <p className="text-base font-bold text-foreground">{optimal_structure.capital_gains_rate.toFixed(1)}%</p>
                        </div>
                      )}
                      {optimal_structure.estate_tax_rate !== undefined && (
                        <div className="text-center bg-muted/30 rounded-lg p-2">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Estate</p>
                          <p className="text-base font-bold text-foreground">{optimal_structure.estate_tax_rate.toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-background/80 rounded-2xl p-5 sm:p-6 border border-primary/15 text-center">
                  <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">10-Year Net Benefit</p>
                  <p className={`text-3xl sm:text-4xl font-bold ${
                    optimal_structure.net_benefit_10yr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                  }`}>
                    <AnimatedBenefit value={optimal_structure.net_benefit_10yr} />
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {optimal_structure.tax_savings_pct >= 0 ? '+' : ''}{optimal_structure.tax_savings_pct.toFixed(1)}% tax savings vs. current structure
                  </p>
                </div>

                {optimal_structure.anti_avoidance_flags && optimal_structure.anti_avoidance_flags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {optimal_structure.anti_avoidance_flags.map((flag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary border border-primary/15 rounded-full text-[10px] font-semibold tracking-wide">
                        <Shield className="w-3 h-3" />
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                {optimal_structure.warnings && optimal_structure.warnings.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex-1">
                    <p className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Key Requirements
                    </p>
                    <ul className="space-y-1.5">
                      {optimal_structure.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* IDENTICAL TAX RATES NOTICE                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {allIdenticalRates && (
        <motion.div
          className="mb-4 sm:mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                All structures share identical effective tax rates
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                US worldwide taxation applies at the same rates regardless of ownership vehicle. The differentiator between structures is implementation cost, not tax efficiency.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs font-mono font-semibold text-foreground bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                  Rental: {formatRate(sharedRentalRate)}
                </span>
                <span className="text-xs font-mono font-semibold text-foreground bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                  CGT: {formatRate(sharedCGTRate)}
                </span>
                <span className="text-xs font-mono font-semibold text-foreground bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                  Estate: {formatRate(sharedEstateRate)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP 5 STRUCTURES - Comparison Table                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground uppercase tracking-wider">
            Top {Math.min(5, sortedStructures.length)} Structures &mdash; Comparison Matrix
          </h3>
        </div>

        {/* Mobile: Card layout */}
        <div className="md:hidden space-y-3">
          {top5.map((structure, index) => {
            const isOptimal = structure.name === optimal_structure?.name;
            const isPositive = structure.net_benefit_10yr >= 0;
            return (
              <div
                key={structure.name}
                className={`rounded-xl border-2 p-3 ${
                  isOptimal ? 'border-primary/60 bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold flex-shrink-0 ${isOptimal ? 'text-primary' : 'text-muted-foreground'}`}>
                      {isOptimal ? <Sparkles className="w-4 h-4 text-primary" /> : `#${index + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isOptimal ? 'text-primary' : 'text-foreground'} line-clamp-2`}>
                        {structure.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{structure.type}</p>
                    </div>
                  </div>
                  <VerdictBadge verdict={structure.verdict} compact />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">10yr Benefit</p>
                    <p className={`font-bold font-mono ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {formatBenefit(structure.net_benefit_10yr)}
                    </p>
                  </div>
                  {!allIdenticalRates && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Tax Rates</p>
                      <p className="font-mono text-foreground">
                        R:{formatRate(structure.rental_income_rate)} C:{formatRate(structure.capital_gains_rate)}
                      </p>
                    </div>
                  )}
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Setup / Annual</p>
                    <p className="font-mono text-muted-foreground">{formatCost(structure.setup_cost)} / {formatCost(structure.annual_cost)}</p>
                  </div>
                  {!allIdenticalRates && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Estate Tax</p>
                      <p className="font-mono text-foreground">{formatRate(structure.estate_tax_rate)}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block rounded-xl border-2 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b-2 border-border">
                  <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-8">#</th>
                  <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground min-w-[180px]">Structure</th>
                  <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">10yr Benefit</th>
                  {!allIdenticalRates && (
                    <>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rental</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CGT</th>
                      <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estate</th>
                    </>
                  )}
                  <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Setup</th>
                  <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Annual</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((structure, index) => {
                  const isOptimal = structure.name === optimal_structure?.name;
                  const isPositive = structure.net_benefit_10yr >= 0;

                  return (
                    <tr
                      key={structure.name}
                      className={`border-b border-border/50 transition-colors ${
                        isOptimal
                          ? 'bg-primary/5 hover:bg-primary/8'
                          : index % 2 === 0
                          ? 'bg-card hover:bg-muted/20'
                          : 'bg-muted/10 hover:bg-muted/25'
                      }`}
                    >
                      <td className="px-3 py-3.5">
                        <span className={`text-xs font-bold ${isOptimal ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isOptimal ? (
                            <Sparkles className="w-4 h-4 text-primary" />
                          ) : (
                            index + 1
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div>
                          <p className={`text-sm font-semibold ${isOptimal ? 'text-primary' : 'text-foreground'}`}>
                            {structure.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{structure.type}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className={`text-sm font-bold font-mono ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                          {formatBenefit(structure.net_benefit_10yr)}
                        </span>
                      </td>
                      {!allIdenticalRates && (
                        <>
                          <td className="px-3 py-3.5 text-right">
                            <span className="text-xs font-mono text-foreground">{formatRate(structure.rental_income_rate)}</span>
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <span className="text-xs font-mono text-foreground">{formatRate(structure.capital_gains_rate)}</span>
                          </td>
                          <td className="px-3 py-3.5 text-right">
                            <span className="text-xs font-mono text-foreground">{formatRate(structure.estate_tax_rate)}</span>
                          </td>
                        </>
                      )}
                      <td className="px-3 py-3.5 text-right">
                        <span className="text-xs font-mono text-muted-foreground">{formatCost(structure.setup_cost)}</span>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className="text-xs font-mono text-muted-foreground">{formatCost(structure.annual_cost)}</span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <VerdictBadge verdict={structure.verdict} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* REMAINING STRUCTURES - Collapsible compact table                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {remaining.length > 0 && (
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <button
            onClick={() => setShowAllRemaining(!showAllRemaining)}
            className="flex items-center gap-2.5 mb-3 w-full text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center group-hover:bg-muted/60 transition-colors">
              <Layers className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              {remaining.length} Additional Structures
            </h3>
            {showAllRemaining ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showAllRemaining && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/20 border-b border-border">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-8">#</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Structure</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">10yr Benefit</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Setup</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Annual</th>
                        <th className="text-center px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((structure, index) => (
                        <tr
                          key={structure.name}
                          className={`border-b border-border/30 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/5'}`}
                        >
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{index + 6}</td>
                          <td className="px-4 py-2.5">
                            <p className="text-sm font-medium text-foreground">{structure.name}</p>
                            <p className="text-[10px] text-muted-foreground">{structure.type}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span className={`text-xs font-bold font-mono ${
                              structure.net_benefit_10yr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                            }`}>
                              {formatBenefit(structure.net_benefit_10yr)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-muted-foreground">
                            {formatCost(structure.setup_cost)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-muted-foreground">
                            {formatCost(structure.annual_cost)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <VerdictBadge verdict={structure.verdict} compact />
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ALTERNATIVE STRATEGIES                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(alternative_corridors.length > 0 || alternative_strategies.length > 0) && (
        <motion.div
          className="mb-6 sm:mb-8 grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {alternative_corridors.length > 0 && (
            <div className="rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Alternative Corridors</h3>
              </div>
              <ul className="space-y-2.5">
                {alternative_corridors.map((corridor, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{toDisplayString(corridor)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {alternative_strategies.length > 0 && (
            <div className="rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Alternative Strategies</h3>
              </div>
              <ul className="space-y-2.5">
                {alternative_strategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{toDisplayString(strategy)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                             */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="flex items-center justify-center gap-3 pt-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          Structure Optimization Engine
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </motion.div>
    </div>
  );
}
