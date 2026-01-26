// components/decision-memo/memo/MemoHeader.tsx
// Premium Investment Memorandum Header - Harvard/Stanford/Goldman Tier
// Institutional branding with premium animations

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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
  cumulative_tax_differential_pct?: number; // Total combined tax differential
}

// Value creation breakdown from backend
interface ValueCreation {
  annual_tax_savings?: number;     // Can be negative (cost)
  annual_cgt_savings?: number;     // Can be negative (cost)
  annual_estate_benefit?: number;  // Can be negative (cost)
  total_annual?: number;
  formatted?: {
    annual_tax_savings?: string;
    annual_cgt_savings?: string;
    annual_estate_benefit?: string;
    total_annual?: string;
  };
}

interface MemoHeaderProps {
  intakeId: string;
  generatedAt: string;
  exposureClass: string;
  totalSavings: string;
  precedentCount?: number;  // From kgv3_intelligence_used.precedents
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  // Backend-provided tax data
  sourceTaxRates?: TaxRates;
  destinationTaxRates?: TaxRates;
  taxDifferential?: TaxDifferential;
  // Backend-provided value creation breakdown
  valueCreation?: ValueCreation;
}

// Animated counter component
function AnimatedValue({
  value,
  prefix = '',
  suffix = '',
}: {
  value: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part from value like "$3.13M" -> 3.13
    const numMatch = value.match(/([\d.]+)/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseFloat(numMatch[1]);
    let startTime: number;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentNum = targetNum * easeOutQuart;

      // Reconstruct the value with prefix/suffix from original
      const formatted = value.replace(numMatch[1], currentNum.toFixed(numMatch[1].includes('.') ? 2 : 0));
      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isInView]);

  return (
    <span ref={ref}>
      {prefix}{displayValue || value}{suffix}
    </span>
  );
}

export function MemoHeader({
  intakeId,
  generatedAt,
  exposureClass,
  totalSavings,
  precedentCount = 0,
  sourceJurisdiction = '',
  destinationJurisdiction = '',
  sourceTaxRates,
  destinationTaxRates,
  taxDifferential,
  valueCreation
}: MemoHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate cumulative tax differential (positive = savings, negative = cost)
  const getTaxImpact = (): { label: string; value: string; description: string; isSavings: boolean } => {
    // Use the backend-provided cumulative differential directly (total of all tax types)
    const cumulativeTaxDiff = taxDifferential?.cumulative_tax_differential_pct;

    if (cumulativeTaxDiff !== undefined && cumulativeTaxDiff !== null) {
      const isSavings = cumulativeTaxDiff >= 0;
      return {
        label: isSavings ? 'Tax Savings' : 'Tax Cost',
        value: `${isSavings ? '+' : ''}${cumulativeTaxDiff.toFixed(0)}%`,
        description: isSavings ? 'Total tax benefit' : 'Total tax increase',
        isSavings
      };
    }

    // Fallback: Use income_tax_differential_pct if cumulative not available
    const incomeTaxDiff = taxDifferential?.income_tax_differential_pct;
    if (incomeTaxDiff !== undefined && incomeTaxDiff !== null) {
      const isSavings = incomeTaxDiff >= 0;
      return {
        label: isSavings ? 'Tax Savings' : 'Tax Cost',
        value: `${isSavings ? '+' : ''}${incomeTaxDiff.toFixed(0)}%`,
        description: isSavings ? 'Income tax benefit' : 'Income tax increase',
        isSavings
      };
    }

    // Final fallback: Calculate from source/destination rates
    const source = taxDifferential?.source || sourceTaxRates || { income_tax: 0, cgt: 0, wealth_tax: 0, estate_tax: 0 };
    const dest = taxDifferential?.destination || destinationTaxRates || { income_tax: 0, cgt: 0, wealth_tax: 0, estate_tax: 0 };
    const incomeDiff = source.income_tax - dest.income_tax;
    const isSavings = incomeDiff >= 0;

    return {
      label: isSavings ? 'Tax Savings' : 'Tax Cost',
      value: `${isSavings ? '+' : ''}${incomeDiff.toFixed(0)}%`,
      description: isSavings ? 'Income tax benefit' : 'Income tax increase',
      isSavings
    };
  };

  const taxImpact = getTaxImpact();

  const metrics = [
    {
      label: 'Total Value Creation',
      value: totalSavings,
      description: 'Annual tax-optimized savings',
      highlight: true
    },
    {
      label: 'Strategy Classification',
      value: exposureClass,
      description: 'Risk-adjusted profile',
      highlight: false
    },
    {
      label: 'Intelligence Depth',
      value: precedentCount > 0 ? `${precedentCount}` : '—',
      description: 'Precedents analyzed',
      highlight: false
    },
    {
      label: taxImpact.label,
      value: taxImpact.value,
      description: taxImpact.description,
      highlight: false,
      isTaxSavings: taxImpact.isSavings
    }
  ];

  return (
    <div ref={headerRef} className="relative">
      {/* Premium Background with Subtle Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-card via-card to-muted/20 rounded-3xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      />

      {/* Animated Accent Line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-3xl"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isVisible ? { opacity: 0.8, scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />

      {/* Content */}
      <div className="relative z-10 p-3 sm:p-8 lg:p-12">
        {/* Main Title Section */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* CONFIDENTIAL badge - absolute positioned on small screens to prevent overflow */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-3 w-fit">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-[8px] sm:text-xs font-semibold tracking-wide">CONFIDENTIAL</span>
          </div>

          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-tight">
              Pattern Intelligence
              <br />
              <span className="text-primary">Analysis</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 text-muted-foreground flex-wrap">
            <motion.div
              className="flex items-center gap-1.5 sm:gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider">Ref:</span>
              <span className="text-foreground font-mono text-xs sm:text-sm font-medium">
                {intakeId.slice(7, 19).toUpperCase()}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Key Metrics Grid - Premium Glass Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all ${
                metric.highlight
                  ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30'
                  : 'bg-muted/30 border-2 border-border hover:border-primary/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {/* Highlight glow effect */}
              {metric.highlight && (
                <div className="absolute top-0 right-0 w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
              )}

              <div className="relative z-10">
                <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-3">
                  {metric.label}
                </p>

                <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-1 sm:mb-2 ${
                metric.highlight ? 'text-primary' : metric.isTaxSavings === true ? 'text-green-500' : metric.isTaxSavings === false ? 'text-red-500' : 'text-foreground'
              }`}>
                {metric.highlight ? (
                  <AnimatedValue value={metric.value} />
                ) : (
                  metric.value
                )}
              </p>

                <p className="text-muted-foreground text-[10px] sm:text-xs">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Creation Breakdown - Only shows when backend provides breakdown data */}
        {valueCreation && (valueCreation.annual_tax_savings !== undefined || valueCreation.annual_cgt_savings !== undefined || valueCreation.annual_estate_benefit !== undefined) && (
          <motion.div
            className="mb-6 sm:mb-10 p-4 sm:p-6 bg-muted/20 border border-border rounded-xl sm:rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.95 }}
          >
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Value Creation Breakdown
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Income Tax Savings */}
              <div className="text-center">
                <p className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
                  (valueCreation.annual_tax_savings ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {valueCreation.formatted?.annual_tax_savings ||
                    ((valueCreation.annual_tax_savings ?? 0) >= 0 ? '+' : '') +
                    '$' + Math.abs(valueCreation.annual_tax_savings ?? 0).toLocaleString()
                  }
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Income Tax {(valueCreation.annual_tax_savings ?? 0) >= 0 ? 'Savings' : 'Cost'}
                </p>
              </div>
              {/* CGT Savings */}
              <div className="text-center">
                <p className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
                  (valueCreation.annual_cgt_savings ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {valueCreation.formatted?.annual_cgt_savings ||
                    ((valueCreation.annual_cgt_savings ?? 0) >= 0 ? '+' : '') +
                    '$' + Math.abs(valueCreation.annual_cgt_savings ?? 0).toLocaleString()
                  }
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  CGT {(valueCreation.annual_cgt_savings ?? 0) >= 0 ? 'Savings' : 'Cost'}
                </p>
              </div>
              {/* Estate Benefit */}
              <div className="text-center">
                <p className={`text-lg sm:text-xl lg:text-2xl font-semibold ${
                  (valueCreation.annual_estate_benefit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {valueCreation.formatted?.annual_estate_benefit ||
                    ((valueCreation.annual_estate_benefit ?? 0) >= 0 ? '+' : '') +
                    '$' + Math.abs(valueCreation.annual_estate_benefit ?? 0).toLocaleString()
                  }
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Estate {(valueCreation.annual_estate_benefit ?? 0) >= 0 ? 'Benefit' : 'Cost'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Disclaimer Box */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border border-primary/20 rounded-xl sm:rounded-2xl p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* Animated border accent */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-primary"
            initial={{ scaleY: 0 }}
            animate={isVisible ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.1 }}
          />

          <div className="flex items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
            <motion.div
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full mt-0.5 flex-shrink-0"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex-1">
              <p className="text-primary font-semibold mb-1 sm:mb-2 text-xs sm:text-sm uppercase tracking-wide">
                Important Notice
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Pattern & Market Intelligence Report based on {precedentCount > 0 ? precedentCount.toLocaleString() : '0'}+ analyzed precedents.
                This report provides strategic intelligence and pattern analysis for informed decision-making.
                For execution and implementation, consult your legal, tax, and financial advisory teams.
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
