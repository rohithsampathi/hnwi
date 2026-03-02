// components/decision-memo/memo/Page1TaxDashboard.tsx
// Section 1: Tax Jurisdiction Analysis - Harvard/Stanford/Goldman Tier
// Premium institutional visualization with animated charts

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface ExecutionStep {
  order: number;
  action: string;
  owner: string;
  timeline?: string;
  whyThisOrder?: string;
}

interface TaxRates {
  income_tax: number;
  cgt: number;
  wealth_tax: number;
  estate_tax: number;
}

interface TaxDifferential {
  source: TaxRates;
  destination: TaxRates;
  income_tax_differential_pct?: number;
  cgt_differential_pct?: number;
  estate_tax_differential_pct?: number;
  cumulative_tax_differential_pct?: number; // Total combined tax differential (for display)
  // SOTA Feb 2026: US Worldwide Taxation Support
  cumulative_tax_capturable_pct?: number;   // What's actually capturable (0 if not relocating)
  cumulative_impact?: 'saved' | 'more' | 'none_without_relocation';
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
  totalSavings: string;
  exposureClass: string;
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
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(end * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

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

  // Calculate individual tax differentials (positive = savings)
  const incomeDiff = sourceTaxes.income_tax - destTaxes.income_tax;
  const cgtDiff = sourceTaxes.cgt - destTaxes.cgt;
  const estateDiff = sourceTaxes.estate_tax - destTaxes.estate_tax;
  const wealthDiff = sourceTaxes.wealth_tax - destTaxes.wealth_tax;

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
      income_tax: sourceTaxes.income_tax,
      cgt: sourceTaxes.cgt,
      wealth_tax: sourceTaxes.wealth_tax,
      estate_tax: sourceTaxes.estate_tax
    },
    destination: {
      jurisdiction: destinationJurisdiction,
      displayLabel: destDisplayLabel,
      income_tax: destTaxes.income_tax,
      cgt: destTaxes.cgt,
      wealth_tax: destTaxes.wealth_tax,
      estate_tax: destTaxes.estate_tax
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
  const cumulativeImpactLabel = taxDifferential?.cumulative_impact_label;
  const taxSavingsNote = taxDifferential?.tax_savings_note;

  // Parse timeline string to days (e.g., "7-21 days" -> 14, "90 days" -> 90)
  const parseTimelineToDays = (timeline: string): number => {
    if (!timeline) return 30;
    const match = timeline.match(/(\d+)(?:\s*-\s*(\d+))?\s*days?/i);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return Math.round((min + max) / 2);
    }
    return 30; // Default
  };

  // Generate timeline phases from execution sequence - NO FALLBACK DATA
  // Only show real backend-provided execution sequence
  const timelinePhases = executionSequence.length > 0
    ? executionSequence.slice(0, 4).map((step, idx) => {
        const duration = parseTimelineToDays(step.timeline || '30 days');
        const start = idx === 0 ? 0 : (idx * 30); // Stagger phases
        const colorIntensity = ['bg-primary', 'bg-primary/80', 'bg-primary/60', 'bg-primary/50'];

        return {
          id: step.order,
          name: step.action.length > 25 ? step.action.slice(0, 22) + '...' : step.action,
          description: step.whyThisOrder || step.action,
          start,
          duration,
          color: colorIntensity[idx] || 'bg-primary/40',
          status: idx === 0 ? 'primary' : 'pending'
        };
      })
    : []; // No fallback - show empty state if no data from backend

  const hasExecutionSequence = timelinePhases.length > 0;

  const totalDays = 365;

  return (
    <div ref={sectionRef}>
      {/* Tax Sections */}
      {showTax && (
        <>
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
                    !isRelocating
                      ? 'border-amber-500/20 bg-amber-500/[0.03]'
                      : capturableDiff > 0
                        ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                        : capturableDiff < 0
                          ? 'border-red-500/20 bg-red-500/[0.03]'
                          : 'border-border/20 bg-card/50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight ${
                        !isRelocating
                          ? 'text-amber-500'
                          : capturableDiff > 0
                            ? 'text-emerald-500'
                            : capturableDiff < 0
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                      }`}>
                        {/* Show actual differential for comparison, but highlight capturable amount */}
                        {!isRelocating ? (
                          <>
                            <span className="text-xl sm:text-2xl lg:text-3xl line-through opacity-30 mr-2 tracking-tight">
                              {totalTaxDiff > 0 ? '+' : ''}{totalTaxDiff.toFixed(0)}%
                            </span>
                            <span>0%</span>
                          </>
                        ) : (
                          <>{capturableDiff > 0 ? '+' : ''}{capturableDiff.toFixed(0)}%</>
                        )}
                      </span>
                      <div className="text-left">
                        <p className="text-sm sm:text-base font-normal text-foreground">
                          {!isRelocating
                            ? 'Not Capturable'
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
                    {/* SOTA: US Worldwide Taxation Label */}
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
                              <span className={`text-sm sm:text-base font-medium ${sourceColor}`}>{row.source}%</span>
                            </div>
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-medium ${destColor}`}>{row.dest}%</span>
                            </div>
                            <div className="text-center">
                              <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-medium ${
                                row.diff > 0 ? 'text-emerald-500/80' : row.diff < 0 ? 'text-red-500/80' : 'text-muted-foreground/60'
                              }`}>
                                {row.diff > 0 ? '+' : ''}{row.diff.toFixed(0)}%
                                {row.diff !== 0 && (
                                  <span className="text-xs font-medium opacity-60">
                                    {row.diff > 0 ? 'saved' : 'more'}
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
                              row.diff > 0 ? 'text-emerald-500/80' : row.diff < 0 ? 'text-red-500/80' : 'text-muted-foreground/60'
                            }`}>
                              {row.diff > 0 ? '+' : ''}{row.diff.toFixed(0)}%
                              {row.diff !== 0 && (
                                <span className="text-xs font-medium opacity-60">
                                  {row.diff > 0 ? 'saved' : 'more'}
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Source vs Destination */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center px-3 py-2 rounded-lg bg-surface/50">
                              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 block mb-1">Source</span>
                              <span className={`text-lg font-medium ${sourceColor}`}>{row.source}%</span>
                            </div>
                            <div className="text-center px-3 py-2 rounded-lg bg-surface/50">
                              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 block mb-1">Destination</span>
                              <span className={`text-lg font-medium ${destColor}`}>{row.dest}%</span>
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
                        Current Structure
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
                            animate={isVisible ? { width: `${(item.value / item.max) * 100}%` } : {}}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: EASE_OUT_EXPO }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground/60 w-10 sm:w-12 text-right">
                          {item.value}%
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Destination Breakdown */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                        Optimized Structure
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
                            animate={isVisible ? { width: `${(item.value / item.max) * 100}%` } : {}}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: EASE_OUT_EXPO }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gold/70 w-10 sm:w-12 text-right">
                          {item.value}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </>
      )}

      {/* Implementation Timeline */}
      {showImplementation && hasExecutionSequence && (
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT_EXPO }}
      >
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
            Execution Framework
          </p>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mb-1">
            Implementation Roadmap
          </h3>
          <p className="text-sm text-muted-foreground/60 leading-relaxed">
            Coordinated execution timeline with parallel workstreams
          </p>
        </div>

        <div className="relative rounded-2xl border border-border/30 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-6">
              <div className="flex items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold/60" />
                  <span className="text-xs text-muted-foreground/60">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-border/30" />
                  <span className="text-xs text-muted-foreground/60">Pending</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">365 Days</span>
                <span className="text-xs text-muted-foreground/60 ml-2 hidden sm:inline">Total Duration</span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-6 sm:mb-10" />

            {/* Month Markers */}
            <div className="relative mb-3 sm:mb-6 hidden sm:block">
              <div className="flex justify-between text-xs text-muted-foreground/60">
                {['Day 0', 'Month 3', 'Month 6', 'Month 9', 'Month 12'].map((label, i) => (
                  <span key={label} className="relative">
                    {label}
                    <div className="absolute top-5 sm:top-7 left-1/2 w-px h-2 sm:h-3 bg-border/20 -translate-x-1/2" />
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline Track */}
            <div className="relative mt-6 sm:mt-10">
              {/* Base Track */}
              <div className="absolute top-0 left-0 right-0 h-px bg-border/20" />

              {/* Gantt Bars */}
              <div className="space-y-5 sm:space-y-8 pt-5 sm:pt-8">
                {timelinePhases.map((phase, index) => {
                  const leftPercent = (phase.start / totalDays) * 100;
                  const widthPercent = (phase.duration / totalDays) * 100;

                  return (
                    <motion.div
                      key={phase.id}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.7, delay: 0.8 + index * 0.15, ease: EASE_OUT_EXPO }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium ${
                          phase.status === 'primary'
                            ? 'bg-gold/10 text-gold border border-gold/20'
                            : 'border border-border/20 text-muted-foreground/60'
                        }`}>
                          {phase.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-normal text-foreground line-clamp-2 sm:line-clamp-1">
                              {phase.name}
                            </span>
                            <span className="text-xs text-muted-foreground/60 ml-2 flex-shrink-0">
                              {phase.duration}d
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Gantt Bar */}
                      <div className="relative h-7 sm:h-9 ml-6 sm:ml-12">
                        <div className="absolute inset-y-0 left-0 right-0 bg-muted/20 rounded" />
                        <motion.div
                          className={`absolute inset-y-0 ${phase.color} rounded cursor-pointer group`}
                          style={{ left: `${leftPercent}%` }}
                          initial={{ width: 0 }}
                          animate={isVisible ? { width: `${widthPercent}%` } : {}}
                          transition={{ duration: 0.8, delay: 1 + index * 0.15, ease: EASE_OUT_EXPO }}
                          title={phase.description}
                        >
                          <div className="absolute inset-0 flex items-center px-2 sm:px-3 overflow-hidden">
                            <span className="text-xs text-white/80 font-normal truncate">
                              {phase.description}
                            </span>
                          </div>
                          {/* Hover tooltip */}
                          <div className="absolute left-0 top-full mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="rounded-lg border border-border/20 bg-card/90 backdrop-blur-sm px-3 py-2 whitespace-nowrap">
                              <p className="text-xs font-normal text-foreground">{phase.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Today Marker */}
              <motion.div
                className="absolute top-0 bottom-0 w-px bg-gold/40"
                style={{ left: '0%' }}
                initial={{ opacity: 0, height: 0 }}
                animate={isVisible ? { opacity: 1, height: '100%' } : {}}
                transition={{ duration: 0.7, delay: 1.5, ease: EASE_OUT_EXPO }}
              >
                <div className="absolute -top-5 sm:-top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 sm:py-1 bg-gold/10 text-gold border border-gold/20 text-xs rounded">
                  Start
                </div>
              </motion.div>
            </div>

            {/* Phase Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12 pt-8 sm:pt-10">
              <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent col-span-full -mt-8 sm:-mt-10 mb-4" />
              {timelinePhases.map((phase, i) => (
                <motion.div
                  key={phase.id}
                  className="rounded-xl border border-border/20 bg-card/50 p-3 sm:p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 1.2 + i * 0.1, ease: EASE_OUT_EXPO }}
                >
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${phase.color}`} />
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
                      Phase {phase.id}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-normal text-foreground">{phase.name}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1 sm:mt-2">
                    Day {phase.start} → {phase.start + phase.duration}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Critical Path Note */}
            <div className="mt-6 sm:mt-8 rounded-xl border border-gold/10 bg-gold/[0.02] p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-0.5 h-full bg-gold/20 rounded self-stretch flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-normal text-gold/70 mb-1">
                    Critical Path: {timelinePhases[0]?.name || 'Initial Phase'}
                  </p>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">
                    {timelinePhases[0]?.description || 'The initial phase determines the overall timeline.'} Multiple phases
                    run in parallel to optimize total implementation time for {destinationJurisdiction || 'target'} positioning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
