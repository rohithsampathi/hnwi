// components/decision-memo/memo/MemoHeader.tsx
// Premium Investment Memorandum Header - Harvard/Stanford/Goldman Tier
// Unified layout with verdict-based color theming (green/yellow/red)

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download } from 'lucide-react';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';

interface TaxRates {
  income_tax: number;
  cgt: number;
  wealth_tax: number;
  estate_tax: number;
}

interface TaxDifferential {
  source: TaxRates;
  destination: TaxRates;
  income_tax_differential_pct: number;
  cgt_differential_pct: number;
  estate_tax_differential_pct: number;
  cumulative_tax_differential_pct?: number;
  weighted_tax_differential_pct?: number;
  cumulative_impact?: "saved" | "cost" | "none_without_relocation";
  is_relocating?: boolean;
  headline_tax_savings?: string;
  tax_savings_note?: string;
}

interface ValueCreation {
  annual_tax_savings?: number;
  annual_cgt_savings?: number;
  annual_estate_benefit?: number;
  total_annual?: number;
  formatted?: {
    annual_tax_savings?: string;
    annual_cgt_savings?: string;
    annual_estate_benefit?: string;
    total_annual?: string;
  };
  annual?: {
    rental?: number;
    rental_formatted?: string;
    appreciation?: number;
    appreciation_formatted?: string;
    tax_savings?: number;
    total?: number;
    total_formatted?: string;
  };
}

interface MemoHeaderProps {
  intakeId: string;
  generatedAt: string;
  exposureClass: string;
  totalSavings: string;
  precedentCount?: number;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  sourceTaxRates?: TaxRates;
  destinationTaxRates?: TaxRates;
  taxDifferential?: TaxDifferential;
  valueCreation?: ValueCreation;
  crossBorderTaxSavingsPct?: number;
  crossBorderComplianceFlags?: string[];
  showTaxSavings?: boolean;
  optimalStructure?: {
    name: string;
    type: string;
    net_benefit_10yr: number;
  };
  verdict?: string;
  viaNegativa?: ViaNegativaContext;
  onExportPDF?: () => void;
}

// NOTE: sourceTaxRates, destinationTaxRates, taxDifferential, crossBorderTaxSavingsPct,
// crossBorderComplianceFlags, showTaxSavings are kept in props for backward compatibility
// with the parent page component but are no longer rendered in the header metrics.

// ─── Color Theme System ─────────────────────────────────────────────────────
// Three tiers: approved (green), conditional (yellow/amber), vetoed (red)
type VerdictTier = 'approved' | 'conditional' | 'vetoed';

const THEME = {
  approved: {
    accentLine: 'from-transparent via-green-500 to-transparent',
    decorBg: 'from-green-500/5',
    badgeBg: 'bg-green-500/10 border-green-500/30',
    badgeDot: 'bg-green-500',
    badgeText: 'text-green-500',
    badgeLabel: 'APPROVED',
    titleHighlight: 'text-green-500',
    cardHighlightBg: 'bg-gradient-to-br from-green-500/15 to-green-500/5 border-2 border-green-500/30',
    cardHighlightGlow: 'from-green-500/20',
    cardHighlightValue: 'text-green-500',
    noticeBg: 'from-green-500/10 via-green-500/5 to-green-500/10 border-green-500/30',
    noticeAccent: 'from-green-500 via-green-500/50 to-green-500',
    noticeDot: 'bg-green-500',
    noticeTitle: 'text-green-600 dark:text-green-500',
  },
  conditional: {
    accentLine: 'from-transparent via-amber-500 to-transparent',
    decorBg: 'from-amber-500/5',
    badgeBg: 'bg-amber-500/10 border-amber-500/30',
    badgeDot: 'bg-amber-500',
    badgeText: 'text-amber-500',
    badgeLabel: 'UNDER REVIEW',
    titleHighlight: 'text-amber-500',
    cardHighlightBg: 'bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-2 border-amber-500/30',
    cardHighlightGlow: 'from-amber-500/20',
    cardHighlightValue: 'text-amber-500',
    noticeBg: 'from-amber-500/10 via-amber-500/5 to-amber-500/10 border-amber-500/30',
    noticeAccent: 'from-amber-500 via-amber-500/50 to-amber-500',
    noticeDot: 'bg-amber-500',
    noticeTitle: 'text-amber-600 dark:text-amber-500',
  },
  vetoed: {
    accentLine: 'from-transparent via-red-500 to-transparent',
    decorBg: 'from-red-500/5',
    badgeBg: 'bg-red-500/10 border-red-500/30',
    badgeDot: 'bg-red-500',
    badgeText: 'text-red-500',
    badgeLabel: 'ELEVATED RISK',
    titleHighlight: 'text-red-500',
    cardHighlightBg: 'bg-gradient-to-br from-red-500/15 to-red-500/5 border-2 border-red-500/30',
    cardHighlightGlow: 'from-red-500/20',
    cardHighlightValue: 'text-red-500',
    noticeBg: 'from-red-500/10 via-red-500/5 to-red-500/10 border-red-500/30',
    noticeAccent: 'from-red-500 via-red-500/50 to-red-500',
    noticeDot: 'bg-red-500',
    noticeTitle: 'text-red-600 dark:text-red-500',
  },
} as const;

// Animated counter component
function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!isInView) return;
    const numMatch = value.match(/([\d.]+)/);
    if (!numMatch) { setDisplayValue(value); return; }

    const targetNum = parseFloat(numMatch[1]);
    let startTime: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNum = targetNum * easeOutQuart;
      const formatted = value.replace(numMatch[1], currentNum.toFixed(numMatch[1].includes('.') ? 2 : 0));
      setDisplayValue(formatted);
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    requestAnimationFrame(animate);
  }, [value, isInView]);

  return <span ref={ref}>{displayValue || value}</span>;
}

export function MemoHeader({
  intakeId,
  generatedAt,
  exposureClass,
  totalSavings,
  precedentCount = 0,
  sourceTaxRates,
  destinationTaxRates,
  taxDifferential,
  valueCreation,
  crossBorderTaxSavingsPct,
  crossBorderComplianceFlags,
  showTaxSavings = true,
  optimalStructure,
  verdict,
  viaNegativa,
  onExportPDF,
}: MemoHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // ─── Determine verdict tier ───────────────────────────────────────────────
  // FIX: Use actual verdict prop to determine tier, not just optimalStructure existence
  const tier: VerdictTier = (() => {
    if (viaNegativa?.isActive) return 'vetoed';

    // Map verdict strings to tiers
    const verdictUpper = (verdict || '').toUpperCase();

    // Vetoed/Red tier: REVIEW REQUIRED, DO_NOT_PROCEED, NOT_RECOMMENDED
    if (verdictUpper.includes('REVIEW REQUIRED') ||
        verdictUpper === 'DO_NOT_PROCEED' ||
        verdictUpper.includes('NOT_RECOMMENDED')) {
      return 'vetoed';
    }

    // Approved/Green tier: APPROVED, PROCEED (without MODIFIED)
    if (verdictUpper === 'APPROVED' || verdictUpper === 'PROCEED') {
      return 'approved';
    }

    // Conditional/Amber tier: CONDITIONAL, PROCEED_MODIFIED, PROCEED_DIVERSIFICATION_ONLY, or unknown
    return 'conditional';
  })();

  const theme = THEME[tier];

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatAmount = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  // ─── Metrics ──────────────────────────────────────────────────────────────
  // Same 3 metrics for all verdict tiers — only colors change
  const metrics: Array<{
    label: string;
    value: string;
    description: string;
    highlight?: boolean;
  }> = [
    {
      label: 'Total Value Creation',
      value: totalSavings,
      description: valueCreation?.annual ? 'Projected annual returns' : 'Annual tax-optimized savings',
      highlight: true
    },
    {
      label: optimalStructure ? 'Optimal Structure' : 'Strategy Classification',
      value: optimalStructure ? optimalStructure.name : exposureClass,
      description: optimalStructure
        ? `${(optimalStructure.net_benefit_10yr / 1000000).toFixed(2)}M 10-yr benefit`
        : 'Risk-adjusted profile',
    },
    {
      label: 'Intelligence Depth',
      value: precedentCount > 0 ? `${precedentCount}` : '—',
      description: 'Corridor signals analyzed',
    },
  ];

  // ─── Badge & Title ────────────────────────────────────────────────────────
  const badgeLabel = theme.badgeLabel;

  // Map verdict string to display-friendly title
  const verdictDisplay: Record<string, { line1: string; line2: string }> = {
    'PROCEED': { line1: 'Decision Memo', line2: 'Proceed' },
    'PROCEED_MODIFIED': { line1: 'Decision Memo', line2: 'Proceed Modified' },
    'PROCEED_DIVERSIFICATION_ONLY': { line1: 'Decision Memo', line2: 'Diversification Only' },
    'DO_NOT_PROCEED': { line1: 'Decision Memo', line2: 'Do Not Proceed' },
  };
  const vd = verdict ? verdictDisplay[verdict] : null;
  const titleLine1 = vd?.line1 ?? 'Decision Memo';
  const titleLine2 = vd?.line2 ?? '';

  // ─── Notice ───────────────────────────────────────────────────────────────
  // Same notice for all tiers — only color differs via theme
  const noticeTitle = 'Intelligence Advisory';
  const noticeBody = `Pattern & Market Intelligence Report based on ${precedentCount > 0 ? precedentCount.toLocaleString() : '0'}+ analyzed corridor signals. This report provides strategic intelligence and pattern analysis for informed decision-making. For execution and implementation, consult your legal, tax, and financial advisory teams.`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={headerRef} className="relative">
      {/* Background */}
      <motion.div
        className="absolute inset-0 rounded-3xl shadow-2xl bg-gradient-to-br from-card via-card to-muted/20"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      />

      {/* Accent Line — verdict-colored */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${theme.accentLine}`}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      {/* Decorative Background Elements */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${theme.decorBg} to-transparent rounded-bl-full`} />
      <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${theme.decorBg} to-transparent rounded-tr-full`} />

      {/* Content */}
      <div className="relative z-10 p-3 sm:p-8 lg:p-12">
        {/* Main Title Section */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Badge — verdict-colored */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full mb-3 w-fit border ${theme.badgeBg}`}>
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${theme.badgeDot}`} />
            <span className={`text-[8px] sm:text-xs font-semibold tracking-wide ${theme.badgeText}`}>
              {badgeLabel}
            </span>
          </div>

          {/* Two-line title with verdict-colored highlight */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-tight">
              {titleLine1}
              {titleLine2 && (
                <>
                  <br />
                  <span className={theme.titleHighlight}>{titleLine2}</span>
                </>
              )}
            </h1>
          </div>

          {/* Date & Ref */}
          <div className="flex items-center gap-3 sm:gap-6 text-muted-foreground flex-wrap">
            <motion.div
              className="flex items-center gap-1.5 sm:gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.badgeText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider">Date:</span>
              <span className="text-foreground font-medium text-xs sm:text-sm">{formatDate(generatedAt)}</span>
            </motion.div>

            <div className="w-px h-3 sm:h-4 bg-border hidden sm:block" />

            <motion.div
              className="flex items-center gap-1.5 sm:gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${theme.badgeText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider">Ref:</span>
              <span className="text-foreground font-mono text-xs sm:text-sm font-medium">
                {intakeId.slice(7, 19).toUpperCase()}
              </span>
            </motion.div>

            {/* Export PDF */}
            {onExportPDF && (
              <>
                <div className="w-px h-3 sm:h-4 bg-border hidden sm:block" />
                <motion.button
                  onClick={onExportPDF}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${theme.badgeBg} hover:opacity-80`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <Download className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.badgeText}`} />
                  <span className={theme.badgeText}>Export PDF</span>
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Key Metrics Grid — 4 cards, first highlighted in verdict color */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-10">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all ${
                metric.highlight
                  ? theme.cardHighlightBg
                  : 'bg-muted/30 border-2 border-border hover:border-primary/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {metric.highlight && (
                <div className={`absolute top-0 right-0 w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-bl ${theme.cardHighlightGlow} to-transparent rounded-bl-full`} />
              )}

              <div className="relative z-10">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-3 text-muted-foreground">
                  {metric.label}
                </p>

                <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-1 sm:mb-2 ${
                  metric.highlight ? theme.cardHighlightValue : 'text-foreground'
                }`}>
                  {metric.highlight ? <AnimatedValue value={metric.value} /> : metric.value}
                </p>

                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Creation Breakdown — unified: returns + tax savings (shows $0 when no tax savings) */}
        {valueCreation && (() => {
          const hasAnnualFormat = valueCreation.annual && (valueCreation.annual.rental !== undefined || valueCreation.annual.appreciation !== undefined);
          const hasTaxFormat = typeof valueCreation.annual_tax_savings === 'number' || typeof valueCreation.annual_cgt_savings === 'number' || typeof valueCreation.annual_estate_benefit === 'number';
          if (!hasAnnualFormat && !hasTaxFormat) return null;

          // Build all components in one unified grid
          const components: Array<{ value: string; label: string; color: string }> = [];

          // Annual returns (rental + appreciation)
          if (hasAnnualFormat) {
            components.push({
              value: valueCreation.annual?.rental_formatted || `$${(valueCreation.annual?.rental ?? 0).toLocaleString()}`,
              label: 'Rental Income',
              color: (valueCreation.annual?.rental ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'
            });
            components.push({
              value: valueCreation.annual?.appreciation_formatted || `$${(valueCreation.annual?.appreciation ?? 0).toLocaleString()}`,
              label: 'Appreciation',
              color: (valueCreation.annual?.appreciation ?? 0) > 0 ? 'text-green-500' : 'text-muted-foreground'
            });
          }

          // Tax savings — show potential vs actual (like Tax Jurisdiction Analysis section)
          const taxSavings = valueCreation.annual_tax_savings ?? valueCreation.annual?.tax_savings ?? 0;
          const isRelocating = taxDifferential?.is_relocating ?? true;
          const potentialDiff = taxDifferential?.cumulative_tax_differential_pct ?? taxDifferential?.weighted_tax_differential_pct;
          const hasPotentialCut = !isRelocating && potentialDiff !== undefined && potentialDiff > 0 && taxSavings === 0;

          // Tax savings — single grid cell (paired inline when not capturable)
          components.push({
            value: hasPotentialCut ? `__POTENTIAL_CUT__${Math.round(potentialDiff)}` : (valueCreation.formatted?.annual_tax_savings || `$${Math.abs(taxSavings).toLocaleString()}`),
            label: hasPotentialCut ? 'Tax Savings' : taxSavings < 0 ? 'Tax Cost' : 'Tax Savings',
            color: taxSavings > 0 ? 'text-green-500' : taxSavings < 0 ? 'text-red-500' : 'text-muted-foreground'
          });

          // CGT savings — show if backend provides it
          if (hasTaxFormat && typeof valueCreation.annual_cgt_savings === 'number') {
            const cgt = valueCreation.annual_cgt_savings;
            components.push({
              value: valueCreation.formatted?.annual_cgt_savings || `$${Math.abs(cgt).toLocaleString()}`,
              label: cgt < 0 ? 'CGT Cost' : 'CGT Savings',
              color: cgt > 0 ? 'text-green-500' : cgt < 0 ? 'text-red-500' : 'text-muted-foreground'
            });
          }

          // Estate benefit — show if backend provides it
          if (hasTaxFormat && typeof valueCreation.annual_estate_benefit === 'number') {
            const estate = valueCreation.annual_estate_benefit;
            components.push({
              value: valueCreation.formatted?.annual_estate_benefit || `$${Math.abs(estate).toLocaleString()}`,
              label: estate < 0 ? 'Estate Cost' : 'Estate Benefit',
              color: estate > 0 ? 'text-green-500' : estate < 0 ? 'text-red-500' : 'text-muted-foreground'
            });
          }

          // Determine grid columns based on component count
          const gridCols = components.length <= 3 ? 'grid-cols-3'
            : components.length === 4 ? 'grid-cols-2 sm:grid-cols-4'
            : 'grid-cols-3 sm:grid-cols-5';

          return (
            <motion.div
              className="mb-6 sm:mb-10 p-4 sm:p-6 bg-muted/20 border border-border rounded-xl sm:rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.95 }}
            >
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Value Creation Breakdown
              </p>
              <div className={`grid ${gridCols} gap-3 sm:gap-4`}>
                {components.map((comp, i) => {
                  // Potential vs Actual paired inline in one cell
                  const potentialMatch = comp.value.match(/^__POTENTIAL_CUT__(\d+)$/);
                  if (potentialMatch) {
                    return (
                      <div key={i} className="text-center">
                        <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                          <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-muted-foreground/40 line-through">
                            +{potentialMatch[1]}%
                          </span>
                          <span className="text-muted-foreground/30 text-sm">→</span>
                          <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-amber-500">
                            $0
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Tax Savings</p>
                        <p className="text-[9px] sm:text-[10px] text-amber-500/80 mt-0.5">Requires relocation</p>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="text-center">
                      <p className={`text-lg sm:text-xl lg:text-2xl font-semibold ${comp.color}`}>
                        {comp.value}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{comp.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Notice Box — verdict-colored accent */}
        <motion.div
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-r border ${theme.noticeBg}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <motion.div
            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${theme.noticeAccent}`}
            initial={{ scaleY: 0 }}
            animate={isVisible ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.1 }}
          />

          <div className="flex items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
            <motion.div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-0.5 flex-shrink-0 ${theme.noticeDot}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex-1">
              <p className={`font-semibold mb-1 sm:mb-2 text-xs sm:text-sm uppercase tracking-wide ${theme.noticeTitle}`}>
                {noticeTitle}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {noticeBody}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient Border */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 0.5 } : {}}
        transition={{ duration: 0.8, delay: 1.2 }}
      />
    </div>
  );
}
