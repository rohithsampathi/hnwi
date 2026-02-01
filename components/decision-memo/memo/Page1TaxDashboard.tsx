// components/decision-memo/memo/Page1TaxDashboard.tsx
// Section 1: Tax Jurisdiction Analysis - Harvard/Stanford/Goldman Tier
// Premium institutional visualization with animated charts

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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
  cumulative_tax_differential_pct?: number; // Total combined tax differential
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
        const colorIntensity = ['from-primary to-primary/70', 'from-primary/80 to-primary/60', 'from-primary/60 to-primary/40', 'from-primary/50 to-primary/30'];

        return {
          id: step.order,
          name: step.action.length > 25 ? step.action.slice(0, 22) + '...' : step.action,
          description: step.whyThisOrder || step.action,
          start,
          duration,
          color: colorIntensity[idx] || 'from-primary/40 to-primary/20',
          status: idx === 0 ? 'primary' : 'pending'
        };
      })
    : []; // No fallback - show empty state if no data from backend

  const hasExecutionSequence = timelinePhases.length > 0;

  const totalDays = 365;

  return (
    <div ref={sectionRef}>
      {/* ═══════════════════════════════════════════════════════════════════
          TAX SECTIONS - Conditionally rendered based on sections prop
          ═══════════════════════════════════════════════════════════════════ */}
      {showTax && (
        <>
          {/* Section Title */}
          <motion.div
            className="mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 tracking-wide">
              TAX JURISDICTION ANALYSIS
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════════════
              TAX TRANSFORMATION HERO - The Dramatic 62.6% → 0% Moment
              ═══════════════════════════════════════════════════════════════════ */}
          <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30 border border-border rounded-xl sm:rounded-3xl p-3 sm:p-6 lg:p-10 shadow-2xl">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-10">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] sm:tracking-[0.25em] mb-2 sm:mb-3">
                Tax Rate Comparison by Category
              </p>
              <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
            </div>

            {/* Total Tax Differential Hero - Show combined tax savings/cost */}
            <motion.div
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Cumulative Tax Impact
              </p>
              <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${
                totalTaxDiff > 0
                  ? 'bg-green-500/10 border border-green-500/30'
                  : totalTaxDiff < 0
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-muted/50 border border-border'
              }`}>
                <span className={`text-3xl sm:text-5xl lg:text-6xl font-semibold ${
                  totalTaxDiff > 0
                    ? 'text-green-500'
                    : totalTaxDiff < 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}>
                  {totalTaxDiff > 0 ? '+' : ''}{totalTaxDiff.toFixed(0)}%
                </span>
                <div className="text-left">
                  <p className="text-sm sm:text-lg font-semibold text-foreground">
                    {totalTaxDiff > 0 ? 'Total Tax Savings' : totalTaxDiff < 0 ? 'Total Tax Cost' : 'Tax Neutral'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {taxComparison.source.displayLabel} → {taxComparison.destination.displayLabel}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tax Category Differentials Table */}
            <div className="bg-muted/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 sm:gap-4 items-end pb-4 mb-2 border-b-2 border-border">
                <div className="text-left">
                  <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Type</span>
                </div>
                <div className="text-center">
                  <div className="inline-flex flex-col items-center px-3 py-2 bg-muted/50 rounded-lg border border-border">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Source</span>
                    <span className="text-sm sm:text-lg font-bold text-foreground leading-tight">{taxComparison.source.displayLabel}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex flex-col items-center px-3 py-2 bg-muted/50 rounded-lg border border-border">
                    <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Destination</span>
                    <span className="text-sm sm:text-lg font-bold text-foreground leading-tight">{taxComparison.destination.displayLabel}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impact</span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border/50">
                {[
                  { label: 'Income Tax', source: taxComparison.source.income_tax, dest: taxComparison.destination.income_tax, diff: incomeDiff },
                  { label: 'Capital Gains', source: taxComparison.source.cgt, dest: taxComparison.destination.cgt, diff: cgtDiff },
                  { label: 'Estate Tax', source: taxComparison.source.estate_tax, dest: taxComparison.destination.estate_tax, diff: estateDiff },
                  { label: 'Wealth Tax', source: taxComparison.source.wealth_tax, dest: taxComparison.destination.wealth_tax, diff: wealthDiff },
                ].map((row, i) => {
                  // Color based on which is higher: higher tax = red, lower tax = green
                  const sourceColor = row.source > row.dest ? 'text-red-500' : row.source < row.dest ? 'text-green-500' : 'text-muted-foreground';
                  const destColor = row.dest > row.source ? 'text-red-500' : row.dest < row.source ? 'text-green-500' : 'text-muted-foreground';

                  return (
                    <motion.div
                      key={row.label}
                      className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 sm:gap-4 items-center py-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    >
                      <span className="text-sm sm:text-base font-medium text-foreground">{row.label}</span>
                      <div className="text-center">
                        <span className={`text-sm sm:text-base font-mono font-medium ${sourceColor}`}>{row.source}%</span>
                      </div>
                      <div className="text-center">
                        <span className={`text-sm sm:text-base font-mono font-medium ${destColor}`}>{row.dest}%</span>
                      </div>
                      <div className="text-center">
                        <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-bold ${
                          row.diff > 0 ? 'text-green-500' : row.diff < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                          {row.diff > 0 ? '+' : ''}{row.diff.toFixed(0)}%
                          {row.diff !== 0 && (
                            <span className="text-[9px] sm:text-[10px] font-medium opacity-80">
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

            {/* Tax Breakdown Comparison */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
              {/* Source Breakdown */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                    className="flex items-center gap-2 sm:gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="text-xs sm:text-sm text-muted-foreground w-20 sm:w-28">{item.label}</span>
                    <div className="flex-1 h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${(item.value / item.max) * 100}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-foreground w-10 sm:w-12 text-right">
                      {item.value}%
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Destination Breakdown */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                    className="flex items-center gap-2 sm:gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  >
                    <span className="text-xs sm:text-sm text-muted-foreground w-20 sm:w-28">{item.label}</span>
                    <div className="flex-1 h-1.5 sm:h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${(item.value / item.max) * 100}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-primary w-10 sm:w-12 text-right">
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

      {/* ═══════════════════════════════════════════════════════════════════
          IMPLEMENTATION TIMELINE - Gantt-Style Visualization
          Only shows with real backend execution sequence data
          ═══════════════════════════════════════════════════════════════════ */}
      {/* Implementation section only renders when we have real backend data */}
      {showImplementation && hasExecutionSequence && (
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mb-1 sm:mb-2 tracking-wide">
          IMPLEMENTATION ROADMAP
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8">
          Coordinated execution timeline with parallel workstreams
        </p>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
          {/* Timeline Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-border">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-muted border-2 border-border" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Pending</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs sm:text-sm font-semibold text-foreground">365 Days</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2 hidden sm:inline">Total Duration</span>
            </div>
          </div>

          {/* Month Markers - Hide on very small screens */}
          <div className="relative mb-2 sm:mb-4 hidden sm:block">
            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
              {['Day 0', 'Month 3', 'Month 6', 'Month 9', 'Month 12'].map((label, i) => (
                <span key={label} className="relative">
                  {label}
                  <div className="absolute top-4 sm:top-6 left-1/2 w-px h-2 sm:h-3 bg-border -translate-x-1/2" />
                </span>
              ))}
            </div>
          </div>

          {/* Timeline Track */}
          <div className="relative mt-4 sm:mt-8">
            {/* Base Track */}
            <div className="absolute top-0 left-0 right-0 h-px bg-border" />

            {/* Gantt Bars */}
            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
              {timelinePhases.map((phase, index) => {
                const leftPercent = (phase.start / totalDays) * 100;
                const widthPercent = (phase.duration / totalDays) * 100;

                return (
                  <motion.div
                    key={phase.id}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 mb-1.5 sm:mb-2">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shadow-md ${
                        phase.status === 'primary'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted border border-border text-foreground'
                      }`}>
                        {phase.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] sm:text-sm font-semibold text-foreground line-clamp-2 sm:line-clamp-1">
                            {phase.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {phase.duration}d
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar */}
                    <div className="relative h-7 sm:h-10 ml-6 sm:ml-12">
                      <div className="absolute inset-y-0 left-0 right-0 bg-muted/30 rounded-md sm:rounded-lg" />
                      <motion.div
                        className={`absolute inset-y-0 bg-gradient-to-r ${phase.color} rounded-md sm:rounded-lg shadow-sm cursor-pointer group`}
                        style={{ left: `${leftPercent}%` }}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${widthPercent}%` } : {}}
                        transition={{ duration: 0.8, delay: 1 + index * 0.15 }}
                        title={phase.description}
                      >
                        <div className="absolute inset-0 flex items-center px-2 sm:px-3 overflow-hidden">
                          <span className="text-[10px] sm:text-xs text-white font-medium truncate drop-shadow-sm">
                            {phase.description}
                          </span>
                        </div>
                        {/* Hover tooltip */}
                        <div className="absolute left-0 top-full mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                            <p className="text-xs font-medium text-foreground">{phase.description}</p>
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
              className="absolute top-0 bottom-0 w-0.5 bg-primary"
              style={{ left: '0%' }}
              initial={{ opacity: 0, height: 0 }}
              animate={isVisible ? { opacity: 1, height: '100%' } : {}}
              transition={{ duration: 0.5, delay: 1.5 }}
            >
              <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded">
                Start
              </div>
            </motion.div>
          </div>

          {/* Phase Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-6 sm:mt-10 pt-4 sm:pt-8 border-t border-border">
            {timelinePhases.map((phase, i) => (
              <motion.div
                key={phase.id}
                className="p-2 sm:p-4 bg-muted/20 rounded-lg sm:rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${phase.color}`} />
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Phase {phase.id}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground">{phase.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  Day {phase.start} → {phase.start + phase.duration}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Critical Path Note */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-1 h-full bg-primary rounded-full self-stretch" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-primary mb-0.5 sm:mb-1">
                  Critical Path: {timelinePhases[0]?.name || 'Initial Phase'}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {timelinePhases[0]?.description || 'The initial phase determines the overall timeline.'} Multiple phases
                  run in parallel to optimize total implementation time for {destinationJurisdiction || 'target'} positioning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      )}
    </div>
  );
}
