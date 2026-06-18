// components/decision-memo/memo/Page1TaxDashboard.tsx
// Section 1: Tax Jurisdiction Analysis - Harvard/Stanford/Goldman Tier
// Premium institutional visualization with animated charts

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';
import { memoNumberClass } from '@/lib/decision-memo/memo-design-tokens';
import {
  useAnimatedMetric,
  useDecisionMemoRenderContext,
  useReportInView,
} from './decision-memo-render-context';

interface ExecutionStep {
  order?: number;
  step?: number;
  action?: string;
  title?: string;
  owner?: string;
  timeline?: string;
  whyThisOrder?: string;
  description?: string;
  release_gate?: string;
}

interface TaxRates {
  income_tax?: number;
  capital_gains?: number;
  cgt?: number;
  wealth_tax?: number;
  estate_tax?: number;
}

interface TaxDifferential {
  source?: TaxRates;
  destination?: TaxRates;
  savings?: string;
  income_tax_differential_pct?: number;
  cgt_differential_pct?: number;
  estate_tax_differential_pct?: number;
  cumulative_tax_differential_pct?: number; // Total combined tax differential (for display)
  // SOTA Feb 2026: US Worldwide Taxation Support
  cumulative_tax_capturable_pct?: number;   // What's actually capturable (0 if not relocating)
  cumulative_impact?: 'saved' | 'cost' | 'more' | 'none_without_relocation';
  cumulative_impact_label?: string | null;  // "US Worldwide Taxation Applies..." when not relocating
  is_relocating?: boolean;
  tax_savings_note?: string;
}

interface ValueCreation {
  total_annual?: number;
  five_year_projected?: number;
  annual_tax_savings?: { amount: number };
  annual_cgt_savings?: { amount: number };
  annual_estate_benefit?: { amount: number };
}

interface Page1Props {
  totalSavings?: string;
  exposureClass?: string;
  sourceJurisdiction?: string;      // Country level - e.g., "India"
  destinationJurisdiction?: string; // Country level - e.g., "UAE"
  sourceCity?: string;              // City level - e.g., "Pune"
  destinationCity?: string;         // City level - e.g., "Dubai"
  executionSequence?: ExecutionStep[]; // From artifact sequence
  // Dynamic tax rates from backend - no hardcoding
  sourceTaxRates?: TaxRates;
  destinationTaxRates?: TaxRates;
  taxDifferential?: TaxDifferential;
  valueCreation?: ValueCreation;    // Detailed value creation breakdown
  // Section visibility control for flexible layout
  sections?: ('tax' | 'implementation' | 'all')[];
  showTaxSavings?: boolean;
}

// Animated counter component for dramatic number reveals
function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 1
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useReportInView(ref, { once: true, margin: "-100px" });
  const count = useAnimatedMetric(end, {
    duration,
    enabled: motionEnabled && isInView,
  });

  return (
    <span ref={ref}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

export function Page1TaxDashboard({
  totalSavings,
  exposureClass,
  sourceJurisdiction = '',
  destinationJurisdiction = '',
  sourceCity,
  destinationCity,
  executionSequence = [],
  sourceTaxRates,
  destinationTaxRates,
  taxDifferential,
  valueCreation,
  sections = ['all']
}: Page1Props) {
  const { motionEnabled } = useDecisionMemoRenderContext();
  const [isVisible, setIsVisible] = useState(!motionEnabled);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useReportInView(sectionRef, { once: true, margin: "-50px" });

  // Section visibility helpers
  const showTax = sections.includes('all') || sections.includes('tax');
  const showImplementation = sections.includes('all') || sections.includes('implementation');

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Use backend-provided tax rates - no hardcoding
  // Fallback to zeros if not provided (shows "—" in UI)
  const defaultTaxRates: TaxRates = { income_tax: 0, cgt: 0, wealth_tax: 0, estate_tax: 0 };
  const sourceTaxes = taxDifferential?.source || sourceTaxRates || defaultTaxRates;
  const destTaxes = taxDifferential?.destination || destinationTaxRates || defaultTaxRates;
  const sourceCgt = sourceTaxes.cgt ?? sourceTaxes.capital_gains ?? 0;
  const destinationCgt = destTaxes.cgt ?? destTaxes.capital_gains ?? 0;

  // Calculate individual tax differentials (positive = savings)
  const incomeDiff = (sourceTaxes.income_tax ?? 0) - (destTaxes.income_tax ?? 0);
  const cgtDiff = sourceCgt - destinationCgt;
  const estateDiff = (sourceTaxes.estate_tax ?? 0) - (destTaxes.estate_tax ?? 0);
  const wealthDiff = (sourceTaxes.wealth_tax ?? 0) - (destTaxes.wealth_tax ?? 0);

  // Format display labels: "Pune, India" or just "India" if no city
  const formatJurisdictionLabel = (city?: string, country?: string): string => {
    if (city && country) {
      // Avoid redundancy like "Dubai, Dubai" or "UAE, UAE"
      if (city.toLowerCase() === country.toLowerCase()) return city;
      // Check if city is already in country name (e.g., "Dubai" in "UAE")
      if (country.toLowerCase().includes(city.toLowerCase())) return country;
      return `${city}, ${country}`;
    }
    return city || country || '—';
  };

  const sourceDisplayLabel = formatJurisdictionLabel(sourceCity, sourceJurisdiction);
  const destDisplayLabel = formatJurisdictionLabel(destinationCity, destinationJurisdiction);

  const taxComparison = {
    source: {
      jurisdiction: sourceJurisdiction,
      displayLabel: sourceDisplayLabel,
      income_tax: sourceTaxes.income_tax ?? 0,
      cgt: sourceCgt,
      wealth_tax: sourceTaxes.wealth_tax ?? 0,
      estate_tax: sourceTaxes.estate_tax ?? 0
    },
    destination: {
      jurisdiction: destinationJurisdiction,
      displayLabel: destDisplayLabel,
      income_tax: destTaxes.income_tax ?? 0,
      cgt: destinationCgt,
      wealth_tax: destTaxes.wealth_tax ?? 0,
      estate_tax: destTaxes.estate_tax ?? 0
    },
    differentials: {
      income_tax: incomeDiff,
      cgt: cgtDiff,
      estate_tax: estateDiff,
      wealth_tax: wealthDiff
    }
  };

  // Use cumulative tax differential directly from backend
  const totalTaxDiff = taxDifferential?.cumulative_tax_differential_pct ?? 0;

  // SOTA Feb 2026: US Worldwide Taxation Support
  // When not relocating, show the differential but explain it's not capturable
  const isRelocating = taxDifferential?.is_relocating ?? true;
  const capturableDiff = taxDifferential?.cumulative_tax_capturable_pct ?? totalTaxDiff;
  const noRelocationTaxCredit = !isRelocating || taxDifferential?.cumulative_impact === 'none_without_relocation';
  const cumulativeImpactLabel = taxDifferential?.cumulative_impact_label;
  const taxSavingsNote = taxDifferential?.tax_savings_note;
  const allDisplayedTaxRatesZero = [
    taxComparison.source.income_tax,
    taxComparison.source.cgt,
    taxComparison.source.wealth_tax,
    taxComparison.source.estate_tax,
    taxComparison.destination.income_tax,
    taxComparison.destination.cgt,
    taxComparison.destination.wealth_tax,
    taxComparison.destination.estate_tax,
  ].every((value) => value === 0);
  const taxRatesEvidenceGated = noRelocationTaxCredit && allDisplayedTaxRatesZero;
  const displayTaxRate = (value: number) => taxRatesEvidenceGated ? 'Counsel-gated' : `${value}%`;
  const displayTaxImpact = (value: number) => {
    if (taxRatesEvidenceGated || noRelocationTaxCredit) return 'Not captured';
    return `${value > 0 ? '+' : ''}${value.toFixed(0)}%`;
  };

  const parseTimelineWindow = (timeline: string) => {
    if (!timeline) return { start: 0, end: 30, duration: 30, label: 'Evidence window' };

    const match = timeline.match(/(\d+)(?:\s*-\s*(\d+))?\s*days?/i);
    if (match) {
      const start = match[2] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10);
      return {
        start,
        end,
        duration: Math.max(1, end - start),
        label: timeline
      };
    }

    return { start: 0, end: 30, duration: 30, label: timeline };
  };

  const executionLaneForIndex = (index: number) => {
    if (index <= 2) return 'Authority + bank rails';
    if (index <= 5) return 'Title + tax counsel';
    return 'Succession + release';
  };

  const releaseSteps = executionSequence.map((step, idx) => {
    const timing = parseTimelineWindow(step.timeline || '30 days');
    const accent = idx === 0
      ? 'border-gold/35 bg-gold/[0.04]'
      : idx === executionSequence.length - 1
        ? 'border-primary/25 bg-primary/[0.04]'
        : 'border-border/25 bg-card/40';

    return {
      id: step.order ?? step.step ?? idx + 1,
      title: step.title || step.action || `Step ${idx + 1}`,
      action: step.action || step.description || '',
      whyThisOrder: step.whyThisOrder || step.description || '',
      owner: step.owner || 'Owner gated',
      timeline: step.timeline || timing.label,
      releaseGate: step.release_gate || 'Release gate must be documented before this step clears.',
      timing,
      accent,
      lane: executionLaneForIndex(idx),
      status: idx === 0 ? 'Active gate' : idx === executionSequence.length - 1 ? 'Release rule' : 'Sequenced gate',
    };
  });

  const hasExecutionSequence = releaseSteps.length > 0;
  const criticalPathDays = releaseSteps.reduce((max, step) => Math.max(max, step.timing.end), 0);
  const laneSummary = ['Authority + bank rails', 'Title + tax counsel', 'Succession + release'].map((lane) => ({
    lane,
    count: releaseSteps.filter((step) => step.lane === lane).length,
  }));
  const sourceBreakdownLabel = noRelocationTaxCredit ? 'Source Tax Baseline' : 'Current Structure';
  const destinationBreakdownLabel = noRelocationTaxCredit ? 'Destination Tax Baseline' : 'Optimized Structure';

  return (
    <div ref={sectionRef}>
      {/* Tax Sections */}
      {showTax && (
        <>
          <div data-print-block="keep" data-print-max-height="1040">
            {/* Section Title */}
            <motion.div
              className="mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">
                Jurisdiction Intelligence
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                Tax Jurisdiction Analysis
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-6" />
            </motion.div>

            {/* Tax Transformation Hero */}
            <motion.div
              className="mb-10 sm:mb-16"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              <div className="relative rounded-2xl border border-border/30 overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

                <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
                  {/* Header */}
                  <div className="text-center mb-8 sm:mb-12">
                    <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">
                      Tax Rate Comparison by Category
                    </p>
                    <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto" />
                  </div>

                {/* Total Tax Differential Hero */}
                <motion.div
                  className="text-center mb-8 sm:mb-12"
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                    Cumulative Tax Impact
                  </p>
                  <div className={`inline-flex flex-col items-center gap-3 px-8 py-6 rounded-xl border ${
                    noRelocationTaxCredit
                      ? 'border-amber-500/20 bg-amber-500/[0.03]'
                      : capturableDiff > 0
                        ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                        : capturableDiff < 0
                          ? 'border-red-500/20 bg-red-500/[0.03]'
                          : 'border-border/20 bg-card/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <span className={memoNumberClass('hero', noRelocationTaxCredit || capturableDiff === 0 ? 'muted' : 'default')}>
                        {/* Show actual differential for comparison, but highlight capturable amount */}
                        {noRelocationTaxCredit ? (
                          <>Not credited</>
                        ) : (
                          <>{capturableDiff > 0 ? '+' : ''}{capturableDiff.toFixed(0)}%</>
                        )}
                      </span>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-normal text-foreground">
                          {noRelocationTaxCredit
                            ? 'No Tax Arbitrage Claimed'
                            : capturableDiff > 0
                              ? 'Total Tax Savings'
                              : capturableDiff < 0
                                ? 'Total Tax Cost'
                                : 'Tax Neutral'}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {taxComparison.source.displayLabel} → {taxComparison.destination.displayLabel}
                        </p>
                      </div>
                    </div>
                    {cumulativeImpactLabel && (
                      <div className="mt-2 px-4 py-2 rounded-lg border border-amber-500/20">
                        <p className="text-xs font-medium text-amber-500/80">
                          <AlertTriangle className="w-3 h-3 inline mr-1 opacity-60" />{cumulativeImpactLabel}
                        </p>
                      </div>
                    )}
                    {/* Tax savings note for additional context */}
                    {taxSavingsNote && !cumulativeImpactLabel && (
                      <p className="text-xs text-muted-foreground/60 mt-2 max-w-md">
                        {taxSavingsNote}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Tax Category Differentials Table */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5 sm:p-8 mb-8 sm:mb-12">
                  {/* Desktop: Table Layout */}
                  <div className="hidden md:block">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 sm:gap-6 items-end pb-5 mb-3">
                      <div className="text-left">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">Tax Type</span>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex flex-col items-center px-3 py-2 rounded-lg border border-border/20">
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mb-1">Source</span>
                          <span className="text-sm sm:text-base font-normal text-foreground leading-tight">{taxComparison.source.displayLabel}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="inline-flex flex-col items-center px-3 py-2 rounded-lg border border-border/20">
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mb-1">Destination</span>
                          <span className="text-sm sm:text-base font-normal text-foreground leading-tight">{taxComparison.destination.displayLabel}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">Impact</span>
                      </div>
                    </div>

                    {/* Hairline divider */}
                    <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-1" />

                    {/* Table Body */}
                    <div className="space-y-0">
                      {[
                        { label: 'Income Tax', source: taxComparison.source.income_tax, dest: taxComparison.destination.income_tax, diff: incomeDiff },
                        { label: 'Capital Gains', source: taxComparison.source.cgt, dest: taxComparison.destination.cgt, diff: cgtDiff },
                        { label: 'Estate Tax', source: taxComparison.source.estate_tax, dest: taxComparison.destination.estate_tax, diff: estateDiff },
                        { label: 'Wealth Tax', source: taxComparison.source.wealth_tax, dest: taxComparison.destination.wealth_tax, diff: wealthDiff },
                      ].map((row, i) => {
                        // Color based on which is higher: higher tax = red, lower tax = green
                        const sourceColor = row.source > row.dest ? 'text-red-500/80' : row.source < row.dest ? 'text-emerald-500/80' : 'text-muted-foreground/60';
                        const destColor = row.dest > row.source ? 'text-red-500/80' : row.dest < row.source ? 'text-emerald-500/80' : 'text-muted-foreground/60';

                        return (
                          <motion.div
                            key={row.label}
                            className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 sm:gap-6 items-center py-4"
                            initial={{ opacity: 0, x: -10 }}
                            animate={isVisible ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: EASE_OUT_EXPO }}
                          >
                            <span className="text-sm font-normal text-foreground">{row.label}</span>
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-medium ${sourceColor}`}>{displayTaxRate(row.source)}</span>
                            </div>
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-medium ${destColor}`}>{displayTaxRate(row.dest)}</span>
                            </div>
                            <div className="text-center">
                              <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-medium ${
                                noRelocationTaxCredit
                                  ? 'text-amber-500/80'
                                  : row.diff > 0 ? 'text-emerald-500/80' : row.diff < 0 ? 'text-red-500/80' : 'text-muted-foreground/60'
                              }`}>
                                {displayTaxImpact(row.diff)}
                                {row.diff !== 0 && (
                                  <span className="text-xs font-medium opacity-60">
                                    {noRelocationTaxCredit ? 'not captured' : row.diff > 0 ? 'saved' : 'more'}
                                  </span>
                                )}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile: Card Layout */}
                  <div className="md:hidden space-y-5">
                    {/* Jurisdiction Labels */}
                    <div className="grid grid-cols-2 gap-3 pb-4 border-b border-border/20">
                      <div className="flex flex-col items-center px-3 py-2 rounded-lg border border-border/20">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mb-1">Source</span>
                        <span className="text-sm font-normal text-foreground leading-tight text-center">{taxComparison.source.displayLabel}</span>
                      </div>
                      <div className="flex flex-col items-center px-3 py-2 rounded-lg border border-border/20">
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium mb-1">Destination</span>
                        <span className="text-sm font-normal text-foreground leading-tight text-center">{taxComparison.destination.displayLabel}</span>
                      </div>
                    </div>

                    {/* Tax Type Cards */}
                    {[
                      { label: 'Income Tax', source: taxComparison.source.income_tax, dest: taxComparison.destination.income_tax, diff: incomeDiff },
                      { label: 'Capital Gains', source: taxComparison.source.cgt, dest: taxComparison.destination.cgt, diff: cgtDiff },
                      { label: 'Estate Tax', source: taxComparison.source.estate_tax, dest: taxComparison.destination.estate_tax, diff: estateDiff },
                      { label: 'Wealth Tax', source: taxComparison.source.wealth_tax, dest: taxComparison.destination.wealth_tax, diff: wealthDiff },
                    ].map((row, i) => {
                      // Color based on which is higher: higher tax = red, lower tax = green
                      const sourceColor = row.source > row.dest ? 'text-red-500/80' : row.source < row.dest ? 'text-emerald-500/80' : 'text-muted-foreground/60';
                      const destColor = row.dest > row.source ? 'text-red-500/80' : row.dest < row.source ? 'text-emerald-500/80' : 'text-muted-foreground/60';

                      return (
                        <motion.div
                          key={row.label}
                          className="rounded-lg border border-border/20 bg-card/30 p-4"
                          initial={{ opacity: 0, y: 12 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: EASE_OUT_EXPO }}
                        >
                          {/* Tax Type Header */}
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/10">
                            <span className="text-sm font-medium text-foreground">{row.label}</span>
                            <span className={`inline-flex items-center gap-1 text-base font-medium ${
                              noRelocationTaxCredit
                                ? 'text-amber-500/80'
                                : row.diff > 0 ? 'text-emerald-500/80' : row.diff < 0 ? 'text-red-500/80' : 'text-muted-foreground/60'
                            }`}>
                              {displayTaxImpact(row.diff)}
                              {row.diff !== 0 && (
                                <span className="text-xs font-medium opacity-60">
                                  {noRelocationTaxCredit ? 'not captured' : row.diff > 0 ? 'saved' : 'more'}
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Source vs Destination */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center px-3 py-2 rounded-lg bg-surface/50">
                              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 block mb-1">Source</span>
                              <span className={`text-lg font-medium ${sourceColor}`}>{displayTaxRate(row.source)}</span>
                            </div>
                            <div className="text-center px-3 py-2 rounded-lg bg-surface/50">
                              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 block mb-1">Destination</span>
                              <span className={`text-lg font-medium ${destColor}`}>{displayTaxRate(row.dest)}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Tax Breakdown Comparison */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-12">
                  {/* Source Breakdown */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                        {sourceBreakdownLabel}
                      </span>
                    </div>
                    {[
                      { label: 'Income Tax', value: taxComparison.source.income_tax, max: 50 },
                      { label: 'Capital Gains', value: taxComparison.source.cgt, max: 50 },
                      { label: 'Wealth Tax', value: taxComparison.source.wealth_tax, max: 50 },
                      { label: 'Estate Tax', value: taxComparison.source.estate_tax, max: 50 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="flex items-center gap-3 sm:gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: EASE_OUT_EXPO }}
                      >
                        <span className="text-xs text-muted-foreground/60 w-20 sm:w-28">{item.label}</span>
                        <div className="flex-1 h-1 bg-muted/30 rounded-sm overflow-hidden">
                          <motion.div
                            className="h-full bg-red-500/40 rounded-sm"
                            initial={{ width: 0 }}
                            animate={isVisible ? { width: taxRatesEvidenceGated ? '0%' : `${(item.value / item.max) * 100}%` } : {}}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: EASE_OUT_EXPO }}
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium text-foreground/60 text-right ${taxRatesEvidenceGated ? 'w-28' : 'w-10 sm:w-12'}`}>
                          {displayTaxRate(item.value)}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Destination Breakdown */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                        {destinationBreakdownLabel}
                      </span>
                    </div>
                    {[
                      { label: 'Income Tax', value: taxComparison.destination.income_tax, max: 50 },
                      { label: 'Capital Gains', value: taxComparison.destination.cgt, max: 50 },
                      { label: 'Wealth Tax', value: taxComparison.destination.wealth_tax, max: 50 },
                      { label: 'Estate Tax', value: taxComparison.destination.estate_tax, max: 50 },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="flex items-center gap-3 sm:gap-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: EASE_OUT_EXPO }}
                      >
                        <span className="text-xs text-muted-foreground/60 w-20 sm:w-28">{item.label}</span>
                        <div className="flex-1 h-1 bg-muted/30 rounded-sm overflow-hidden">
                          <motion.div
                            className="h-full bg-gold/40 rounded-sm"
                            initial={{ width: 0 }}
                            animate={isVisible ? { width: taxRatesEvidenceGated ? '0%' : `${(item.value / item.max) * 100}%` } : {}}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: EASE_OUT_EXPO }}
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-medium text-gold/70 text-right ${taxRatesEvidenceGated ? 'w-28' : 'w-10 sm:w-12'}`}>
                          {displayTaxRate(item.value)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </motion.div>
          </div>

        </>
      )}

      {/* Implementation Roadmap */}
      {showImplementation && hasExecutionSequence && (
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT_EXPO }}
        >
          <div className="mb-7">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
              Execution Framework
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mb-1">
              Implementation Roadmap
            </h3>
            <p className="text-sm text-muted-foreground/65 leading-relaxed">
              Release sequence for the first 30 days before exchange authority hardens.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-border/35 bg-card/35">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/45 via-border/30 to-transparent" />

            <div className="relative px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
              <div className="grid gap-5 border-b border-border/20 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold/70">
                    Release sequence
                  </p>
                  <h4 className="mt-2 text-base font-semibold leading-snug text-foreground sm:text-lg">
                    The room needs the gates that decide whether this Mayfair route can release differently.
                  </h4>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground/70">
                    Each step names the owner, timing, and release condition. Nothing here is hidden inside a rail or truncated into a tooltip.
                  </p>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border/20 rounded-md border border-border/20 bg-background/35">
                  <div className="px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">Gates</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{releaseSteps.length}</p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">Critical path</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{criticalPathDays}d</p>
                  </div>
                  <div className="px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">Lanes</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">
                      {laneSummary.filter((lane) => lane.count > 0).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 border-b border-border/20 py-5 md:grid-cols-3">
                {laneSummary.map((lane) => (
                  <div key={lane.lane} className="rounded-md border border-border/20 bg-background/30 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/55">
                      {lane.lane}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {lane.count} {lane.count === 1 ? 'gate' : 'gates'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-5">
                {releaseSteps.map((step, index) => (
                  <motion.div
                    key={`${step.id}-${index}`}
                    className={`rounded-lg border p-4 sm:p-5 ${step.accent}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.65, delay: 0.75 + index * 0.06, ease: EASE_OUT_EXPO }}
                  >
                    <div className="grid gap-4 lg:grid-cols-[64px_minmax(0,1fr)_minmax(220px,0.48fr)]">
                      <div className="flex items-start gap-3 lg:block">
                        <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border/25 bg-background/75 text-sm font-semibold text-foreground">
                          {step.id}
                        </div>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60 lg:mt-3">
                          {step.status}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full border border-border/25 bg-background/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/65">
                            {step.lane}
                          </span>
                          <span className="inline-flex rounded-full border border-gold/20 bg-gold/[0.06] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gold/80">
                            {step.timeline}
                          </span>
                        </div>

                        <h4 className="mt-3 text-base font-semibold leading-snug text-foreground">
                          {step.title}
                        </h4>

                        {step.action ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75">
                            {step.action}
                          </p>
                        ) : null}

                        {step.whyThisOrder ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
                            {step.whyThisOrder}
                          </p>
                        ) : null}

                        <div className="mt-4 rounded-md border border-border/20 bg-background/55 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">
                            Release condition
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                            {step.releaseGate}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-md border border-border/20 bg-background/35 p-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">
                            Owner
                          </p>
                          <p className="mt-1 font-medium leading-snug text-foreground">
                            {step.owner}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/55">
                            Window
                          </p>
                          <p className="mt-1 font-medium text-foreground">
                            Day {step.timing.start}-{step.timing.end}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 rounded-md border border-gold/25 bg-gold/[0.04] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gold/75">
                  Final release rule
                </p>
                <p className="mt-2 max-w-5xl text-sm leading-relaxed text-foreground/85">
                  {releaseSteps[releaseSteps.length - 1]?.releaseGate}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
