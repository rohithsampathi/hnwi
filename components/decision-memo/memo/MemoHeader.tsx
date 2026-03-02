// components/decision-memo/memo/MemoHeader.tsx
// "Money Talking" — fluid, futuristic, grounded
// Design: Bloomberg Terminal meets Patek Philippe

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Download } from 'lucide-react';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { EASE_OUT_EXPO, EASE_OUT_QUART } from '@/lib/animations/motion-variants';

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

// ─── Verdict Theme ──────────────────────────────────────────────────────────
type VerdictTier = 'approved' | 'conditional' | 'vetoed';

const THEME = {
  approved: {
    dot: 'bg-verdict-proceed',
    text: 'text-verdict-proceed',
    label: 'APPROVED',
    title: 'text-verdict-proceed',
    value: 'text-verdict-proceed',
  },
  conditional: {
    dot: 'bg-gold',
    text: 'text-gold',
    label: 'UNDER REVIEW',
    title: 'text-gold',
    value: 'text-gold',
  },
  vetoed: {
    dot: 'bg-verdict-abort',
    text: 'text-verdict-abort',
    label: 'ELEVATED RISK',
    title: 'text-verdict-abort',
    value: 'text-verdict-abort',
  },
} as const;

// Animated counter — monospace display
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!isInView) return;
    const numMatch = value.match(/([\d.]+)/);
    if (!numMatch) { setDisplayValue(value); return; }
    const targetNum = parseFloat(numMatch[1]);
    let startTime: number;
    const duration = 1800;
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

  return <span ref={ref} className={className}>{displayValue || value}</span>;
}

export function MemoHeader({
  intakeId,
  generatedAt,
  exposureClass,
  totalSavings,
  precedentCount = 0,
  taxDifferential,
  valueCreation,
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

  // ─── Verdict tier ─────────────────────────────────────────────────────────
  const tier: VerdictTier = (() => {
    if (viaNegativa?.isActive) return 'vetoed';
    const v = (verdict || '').toUpperCase();
    if (v.includes('REVIEW REQUIRED') || v === 'DO_NOT_PROCEED' || v.includes('NOT_RECOMMENDED')) return 'vetoed';
    if (v === 'APPROVED' || v === 'PROCEED') return 'approved';
    return 'conditional';
  })();
  const t = THEME[tier];

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // ─── Metrics ──────────────────────────────────────────────────────────────
  const isNumericValue = (v: string) => /^[\$\+\-\d%]/.test(v) || v === '—';

  const metrics = [
    {
      label: 'Total Value Creation',
      value: totalSavings,
      description: valueCreation?.annual ? 'Projected annual returns' : 'Annual tax-optimized savings',
      highlight: true,
      numeric: true,
    },
    {
      label: optimalStructure ? 'Optimal Structure' : 'Strategy Classification',
      value: optimalStructure ? optimalStructure.name : exposureClass,
      description: optimalStructure
        ? `${(optimalStructure.net_benefit_10yr / 1000000).toFixed(2)}M 10-yr benefit`
        : 'Risk-adjusted profile',
      numeric: false,
    },
    {
      label: 'Intelligence Depth',
      value: precedentCount > 0 ? `${precedentCount}` : '—',
      description: 'Corridor signals analyzed',
      numeric: true,
    },
  ];

  // ─── Title ────────────────────────────────────────────────────────────────
  const verdictDisplay: Record<string, { line1: string; line2: string }> = {
    'PROCEED': { line1: 'Decision Memo', line2: 'Proceed' },
    'PROCEED_MODIFIED': { line1: 'Decision Memo', line2: 'Proceed Modified' },
    'PROCEED_DIVERSIFICATION_ONLY': { line1: 'Decision Memo', line2: 'Diversification Only' },
    'DO_NOT_PROCEED': { line1: 'Decision Memo', line2: 'Do Not Proceed' },
  };
  const vd = verdict ? verdictDisplay[verdict] : null;
  const titleLine1 = vd?.line1 ?? 'Decision Memo';
  const titleLine2 = vd?.line2 ?? '';

  // ─── Value Creation Components ────────────────────────────────────────────
  const valueComponents = (() => {
    if (!valueCreation) return null;
    const hasAnnual = valueCreation.annual && (valueCreation.annual.rental !== undefined || valueCreation.annual.appreciation !== undefined);
    const hasTax = typeof valueCreation.annual_tax_savings === 'number' || typeof valueCreation.annual_cgt_savings === 'number' || typeof valueCreation.annual_estate_benefit === 'number';
    if (!hasAnnual && !hasTax) return null;

    const items: Array<{ value: string; label: string; color: string; note?: string }> = [];

    if (hasAnnual) {
      items.push({
        value: valueCreation.annual?.rental_formatted || `$${(valueCreation.annual?.rental ?? 0).toLocaleString()}`,
        label: 'Rental Income',
        color: (valueCreation.annual?.rental ?? 0) > 0 ? 'text-verdict-proceed' : 'text-muted-foreground',
      });
      items.push({
        value: valueCreation.annual?.appreciation_formatted || `$${(valueCreation.annual?.appreciation ?? 0).toLocaleString()}`,
        label: 'Appreciation',
        color: (valueCreation.annual?.appreciation ?? 0) > 0 ? 'text-verdict-proceed' : 'text-muted-foreground',
      });
    }

    const taxSavings = valueCreation.annual_tax_savings ?? valueCreation.annual?.tax_savings ?? 0;
    const isRelocating = taxDifferential?.is_relocating ?? true;
    const potentialDiff = taxDifferential?.cumulative_tax_differential_pct ?? taxDifferential?.weighted_tax_differential_pct;
    const hasPotentialCut = !isRelocating && potentialDiff !== undefined && potentialDiff > 0 && taxSavings === 0;

    if (hasPotentialCut) {
      items.push({
        value: `+${Math.round(potentialDiff)}%`,
        label: 'Tax Savings',
        color: 'text-gold',
        note: 'Requires relocation',
      });
    } else {
      items.push({
        value: valueCreation.formatted?.annual_tax_savings || `$${Math.abs(taxSavings).toLocaleString()}`,
        label: taxSavings < 0 ? 'Tax Cost' : 'Tax Savings',
        color: taxSavings > 0 ? 'text-verdict-proceed' : taxSavings < 0 ? 'text-verdict-abort' : 'text-muted-foreground',
      });
    }

    if (hasTax && typeof valueCreation.annual_cgt_savings === 'number') {
      const cgt = valueCreation.annual_cgt_savings;
      items.push({
        value: valueCreation.formatted?.annual_cgt_savings || `$${Math.abs(cgt).toLocaleString()}`,
        label: cgt < 0 ? 'CGT Cost' : 'CGT Savings',
        color: cgt > 0 ? 'text-verdict-proceed' : cgt < 0 ? 'text-verdict-abort' : 'text-muted-foreground',
      });
    }

    if (hasTax && typeof valueCreation.annual_estate_benefit === 'number') {
      const estate = valueCreation.annual_estate_benefit;
      items.push({
        value: valueCreation.formatted?.annual_estate_benefit || `$${Math.abs(estate).toLocaleString()}`,
        label: estate < 0 ? 'Estate Cost' : 'Estate Benefit',
        color: estate > 0 ? 'text-verdict-proceed' : estate < 0 ? 'text-verdict-abort' : 'text-muted-foreground',
      });
    }

    return items;
  })();

  // ─── Notice ───────────────────────────────────────────────────────────────
  const noticeBody = `Pattern & Market Intelligence Report based on ${precedentCount > 0 ? precedentCount.toLocaleString() : '0'}+ analyzed corridor signals. This report provides strategic intelligence and pattern analysis for informed decision-making. For execution and implementation, consult your legal, tax, and financial advisory teams.`;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      ref={headerRef}
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
    >
      {/* Ambient gold glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      <div className="relative rounded-2xl border border-border/30 overflow-hidden max-w-full">
        {/* Gradient gold hairline */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
        />

        <div className="px-5 sm:px-8 md:px-12 pt-8 sm:pt-10 md:pt-12 pb-6 md:pb-8">
          {/* ─── Top row: Status dot + label + export ───────────────────── */}
          <motion.div
            className="flex items-center justify-between mb-8 md:mb-10"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <motion.div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className={`text-xs uppercase tracking-[0.15em] font-semibold whitespace-nowrap ${t.text}`}>
                Decision Memo
              </span>
              <span className="w-px h-3 bg-border/30 flex-shrink-0" />
              <span className={`text-xs uppercase tracking-[0.15em] font-semibold truncate hover:whitespace-normal hover:overflow-visible cursor-default ${t.text}`} title={t.label}>
                {t.label}
              </span>
            </div>

            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors duration-300 min-h-[44px] px-3 sm:px-4 flex-shrink-0 font-medium"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </motion.div>

          {/* ─── Hero verdict — massive, confident ──────────────────────── */}
          <motion.div
            className="mb-5 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT_EXPO }}
          >
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums tracking-tight leading-[0.95] break-words ${t.title}`}>
              {titleLine2 || titleLine1}
            </h1>
            {titleLine2 && (
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground/70 mt-3 tracking-wide font-medium">
                {titleLine1}
              </p>
            )}
          </motion.div>

          {/* ─── Date + Reference ────────────────────────────────────────── */}
          <motion.div
            className="flex items-center flex-wrap gap-2.5 sm:gap-3 mb-10 md:mb-12"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="text-sm text-muted-foreground/70 font-medium">{formatDate(generatedAt)}</span>
            <span className="w-px h-3 bg-border/30" />
            <span className="text-xs text-muted-foreground/60 tracking-wider font-medium">
              {intakeId.slice(7, 19).toUpperCase()}
            </span>
          </motion.div>

          {/* ─── Key Metrics — floating, no borders ─────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                className="min-w-0 overflow-hidden"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.1, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground/70 font-medium mb-2">
                  {metric.label}
                </p>
                {metric.numeric ? (
                  <p
                    title={metric.value}
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums tracking-tight truncate hover:whitespace-normal hover:overflow-visible cursor-default ${
                      metric.highlight ? t.value : 'text-foreground'
                    }`}
                  >
                    {metric.highlight ? <AnimatedValue value={metric.value} /> : metric.value}
                  </p>
                ) : (
                  <p
                    title={metric.value}
                    className="text-lg md:text-xl font-bold text-foreground tracking-tight leading-snug truncate hover:whitespace-normal hover:overflow-visible cursor-default"
                  >
                    {metric.value}
                  </p>
                )}
                <p className="text-sm text-muted-foreground/70 mt-1.5">{metric.description}</p>
              </motion.div>
            ))}
          </div>

          {/* ─── Value Creation — inline flow ────────────────────────────── */}
          {valueComponents && (
            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <div className="h-px bg-gradient-to-r from-border/40 via-border/15 to-transparent mb-6" />
              <p className="text-xs uppercase tracking-[0.15em] text-gold/70 font-semibold mb-5">
                Returns Analysis
              </p>
              <div className="flex flex-wrap items-baseline gap-x-6 sm:gap-x-8 gap-y-4">
                {valueComponents.map((item, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className={`text-base sm:text-lg font-bold tabular-nums ${item.color}`}>
                      {item.value}
                    </span>
                    <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground/70 font-medium">
                      {item.label}
                    </span>
                    {item.note && (
                      <span className="text-xs text-gold/70 italic">{item.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ─── Advisory ──────────────────────────────────────────────── */}
        <motion.div
          className="px-5 sm:px-8 md:px-12 py-4 border-t border-border/20"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-3xl">
            {noticeBody}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
