// components/decision-memo/memo/MemoHeader.tsx
// Premium Investment Memorandum Header - Harvard/Stanford/Goldman Tier
// Institutional branding with premium animations

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
  // Cross-border audit override: when US worldwide taxation applies, tax savings are 0%
  crossBorderTaxSavingsPct?: number;  // If defined, overrides calculated tax impact
  crossBorderComplianceFlags?: string[];  // e.g. ['US_WORLDWIDE_TAXATION']
  // Jan 2026 MCP CORE: Structure optimization override
  showTaxSavings?: boolean;  // If false, structure analysis says no tax benefit exists
  // Jan 2026 MCP CORE: Optimal Structure (Best Instrument)
  optimalStructure?: {
    name: string;
    type: string;
    net_benefit_10yr: number;
  };
  viaNegativa?: ViaNegativaContext;
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
  valueCreation,
  crossBorderTaxSavingsPct,
  crossBorderComplianceFlags,
  showTaxSavings = true,
  optimalStructure,
  viaNegativa
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
    // Jan 2026 MCP CORE: Structure optimization override
    // If showTaxSavings is false, structure analysis determined no viable structure exists
    if (showTaxSavings === false) {
      return {
        label: 'Tax Savings',
        value: '0%',
        description: crossBorderComplianceFlags?.includes('US_WORLDWIDE_TAXATION')
          ? 'US Worldwide Taxation'
          : 'No viable structure',
        isSavings: false
      };
    }

    // Cross-border override: when US worldwide taxation applies, actual savings are 0%
    const hasUSWorldwideTax = crossBorderComplianceFlags?.includes('US_WORLDWIDE_TAXATION');
    if (hasUSWorldwideTax && crossBorderTaxSavingsPct !== undefined) {
      return {
        label: 'Tax Savings',
        value: `${crossBorderTaxSavingsPct}%`,
        description: 'US Worldwide Taxation',
        isSavings: false
      };
    }

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

  // Format currency for Via Negativa metrics
  const formatVNAmount = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  const metrics = viaNegativa?.isActive
    ? [
        {
          label: viaNegativa.metricLabels.capitalExposure,
          value: `-${formatVNAmount(viaNegativa.dayOneLossAmount)}`,
          description: `${viaNegativa.dayOneLoss.toFixed(1)}% absorbed at signature`,
          highlight: true,
          isDestructive: true
        },
        {
          label: viaNegativa.metricLabels.structureVerdict,
          value: viaNegativa.metricLabels.structureVerdictValue,
          description: viaNegativa.metricLabels.structureVerdictDesc,
          highlight: false,
          isDestructive: true
        },
        {
          label: viaNegativa.metricLabels.regulatoryExposure,
          value: viaNegativa.totalConfiscationExposure > 0
            ? formatVNAmount(viaNegativa.totalConfiscationExposure)
            : 'FLAGGED',
          description: viaNegativa.metricLabels.regulatoryExposureDesc,
          highlight: false,
          isDestructive: true
        },
        {
          label: 'Intelligence Depth',
          value: precedentCount > 0 ? `${precedentCount}` : '—',
          description: 'Precedents analyzed',
          highlight: false
        }
      ]
    : [
        {
          label: 'Total Value Creation',
          value: totalSavings,
          description: 'Annual tax-optimized savings',
          highlight: true
        },
        {
          label: optimalStructure ? 'Optimal Structure' : 'Strategy Classification',
          value: optimalStructure ? optimalStructure.name : exposureClass,
          description: optimalStructure
            ? `${(optimalStructure.net_benefit_10yr / 1000000).toFixed(2)}M 10-yr benefit`
            : 'Risk-adjusted profile',
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
        className={`absolute inset-0 rounded-3xl shadow-2xl ${
          viaNegativa?.isActive
            ? 'bg-gradient-to-br from-red-950/90 via-card to-red-950/30 border-2 border-red-500/20'
            : 'bg-gradient-to-br from-card via-card to-muted/20'
        }`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
      />

      {/* Animated Accent Line */}
      <motion.div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${
          viaNegativa?.isActive
            ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-500'
            : 'bg-gradient-to-r from-transparent via-primary to-transparent'
        }`}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isVisible ? { opacity: viaNegativa?.isActive ? 1 : 0.8, scaleX: 1 } : {}}
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
          {/* CONFIDENTIAL / DO NOT PROCEED badge */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-full mb-3 w-fit ${
            viaNegativa?.isActive
              ? 'bg-red-500/15 border border-red-500/30'
              : 'bg-primary/10 border border-primary/20'
          }`}>
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
              viaNegativa?.isActive ? 'bg-red-500' : 'bg-primary'
            }`} />
            <span className={`text-[8px] sm:text-xs font-semibold tracking-wide ${
              viaNegativa?.isActive ? 'text-red-500' : 'text-primary'
            }`}>
              {viaNegativa?.isActive ? viaNegativa.badgeLabel : 'CONFIDENTIAL'}
            </span>
          </div>

          <div className="mb-4 sm:mb-6">
            {viaNegativa?.isActive ? (
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                {viaNegativa.titlePrefix}
                <br />
                <span className="text-red-500">{viaNegativa.titleHighlight}</span>
              </h1>
            ) : (
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-tight">
                Pattern Intelligence
                <br />
                <span className="text-primary">Analysis</span>
              </h1>
            )}
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
                metric.highlight && (metric as any).isDestructive
                  ? 'bg-gradient-to-br from-red-500/20 to-red-900/10 border-2 border-red-500/40'
                  : metric.highlight
                  ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/30'
                  : (metric as any).isDestructive
                  ? 'bg-red-950/30 border-2 border-red-500/20 hover:border-red-500/30'
                  : 'bg-muted/30 border-2 border-border hover:border-primary/20'
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {/* Highlight glow effect */}
              {metric.highlight && !(metric as any).isDestructive && (
                <div className="absolute top-0 right-0 w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
              )}
              {metric.highlight && (metric as any).isDestructive && (
                <div className="absolute top-0 right-0 w-12 sm:w-20 h-12 sm:h-20 bg-gradient-to-bl from-red-500/20 to-transparent rounded-bl-full" />
              )}

              <div className="relative z-10">
                <p className={`text-[10px] sm:text-xs uppercase tracking-wider mb-1.5 sm:mb-3 ${
                  (metric as any).isDestructive ? 'text-red-400/80' : 'text-muted-foreground'
                }`}>
                  {metric.label}
                </p>

                <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-1 sm:mb-2 ${
                  (metric as any).isDestructive
                    ? 'text-red-500'
                    : metric.highlight
                    ? 'text-primary'
                    : (metric as any).isTaxSavings === true
                    ? 'text-green-500'
                    : (metric as any).isTaxSavings === false
                    ? 'text-red-500'
                    : 'text-foreground'
                }`}>
                {metric.highlight && !(metric as any).isDestructive ? (
                  <AnimatedValue value={metric.value} />
                ) : (
                  metric.value
                )}
              </p>

                <p className={`text-[10px] sm:text-xs ${
                  (metric as any).isDestructive ? 'text-red-400/60' : 'text-muted-foreground'
                }`}>
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Creation Breakdown - Only shows when backend provides breakdown data (hidden in Via Negativa) */}
        {!viaNegativa?.isActive && valueCreation && (valueCreation.annual_tax_savings !== undefined || valueCreation.annual_cgt_savings !== undefined || valueCreation.annual_estate_benefit !== undefined) && (
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

        {/* Disclaimer / Via Negativa Warning Box */}
        <motion.div
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 ${
            viaNegativa?.isActive
              ? 'bg-gradient-to-r from-red-950/50 via-red-950/30 to-red-950/50 border border-red-500/30'
              : 'bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border border-primary/20'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {/* Animated border accent */}
          <motion.div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              viaNegativa?.isActive
                ? 'bg-gradient-to-b from-red-500 via-red-600 to-red-500'
                : 'bg-gradient-to-b from-primary via-primary/50 to-primary'
            }`}
            initial={{ scaleY: 0 }}
            animate={isVisible ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.1 }}
          />

          <div className="flex items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
            <motion.div
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-0.5 flex-shrink-0 ${
                viaNegativa?.isActive ? 'bg-red-500' : 'bg-primary'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex-1">
              {viaNegativa?.isActive ? (
                <>
                  <p className="text-red-500 font-bold mb-1 sm:mb-2 text-xs sm:text-sm uppercase tracking-wide">
                    {viaNegativa.noticeTitle}
                  </p>
                  <p className="text-red-300/70 text-xs sm:text-sm leading-relaxed">
                    {viaNegativa.noticeBody}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-primary font-semibold mb-1 sm:mb-2 text-xs sm:text-sm uppercase tracking-wide">
                    Important Notice
                  </p>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Pattern & Market Intelligence Report based on {precedentCount > 0 ? precedentCount.toLocaleString() : '0'}+ analyzed precedents.
                    This report provides strategic intelligence and pattern analysis for informed decision-making.
                    For execution and implementation, consult your legal, tax, and financial advisory teams.
                  </p>
                </>
              )}
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
