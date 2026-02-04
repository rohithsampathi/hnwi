// components/decision-memo/memo/CrossBorderTaxAudit.tsx
// Cross-Border Tax Audit Section - Institutional-grade presentation
// Shows true tax impact for cross-border acquisitions (US worldwide taxation, FTC, net yields)

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Percent,
  Building2,
  Globe,
  FileWarning,
  Calculator,
  Info,
  Shield,
  Receipt,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';

// Types for the cross-border audit data
interface AcquisitionAudit {
  property_value: number;
  bsd_stamp_duty: number;
  absd_additional_stamp_duty: number;
  total_stamp_duties: number;
  total_acquisition_cost: number;
  day_one_loss_pct: number;
  fta_benefit_applied?: boolean;
  buyer_category?: string;
}

interface TaxAuditItem {
  gross_yield_pct?: number;
  destination_tax_rate_pct: number;
  source_tax_rate_pct: number;
  ftc_available: boolean;
  net_tax_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface CapitalGainsAudit {
  destination_cgt_pct: number;
  source_cgt_pct: number;
  ftc_available: boolean;
  net_cgt_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface EstateAudit {
  destination_estate_pct: number;
  source_estate_pct: number;
  worldwide_applies: boolean;
  net_estate_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface NetYieldAudit {
  gross_yield_pct: number;
  tax_rate_applied_pct: number;
  net_yield_pct: number;
  annual_gross_income: number;
  annual_tax_paid: number;
  annual_net_income: number;
  explanation: string;
}

export interface CrossBorderAuditSummary {
  executive_summary: string;
  acquisition_audit?: AcquisitionAudit;
  rental_income_audit?: TaxAuditItem;
  capital_gains_audit?: CapitalGainsAudit;
  estate_tax_audit?: EstateAudit;
  net_yield_audit?: NetYieldAudit;
  total_tax_savings_pct: number;
  compliance_flags?: string[];
  warnings?: string[];
}

interface CrossBorderTaxAuditProps {
  audit: CrossBorderAuditSummary | null | undefined;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  viaNegativa?: ViaNegativaContext;
}

// Format currency for display
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// Animated number counter
function AnimatedNumber({ value, suffix = '%', decimals = 1 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number;
    const duration = 1200;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, isInView]);

  return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>;
}

// Premium FTC indicator
function FTCBadge({ available }: { available: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
      available
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'bg-secondary/50 text-secondary-foreground border border-secondary'
    }`}>
      {available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {available ? 'FTC CREDIT' : 'NO FTC'}
    </span>
  );
}

// Visual tax rate comparison with horizontal bars
function TaxComparison({
  label,
  icon,
  sourceRate,
  destRate,
  netRate,
  savingsPct,
  ftcAvailable,
  explanation
}: {
  label: string;
  icon: React.ReactNode;
  sourceRate: number;
  destRate: number;
  netRate: number;
  savingsPct: number;
  ftcAvailable: boolean;
  explanation: string;
}) {
  const maxRate = Math.max(sourceRate, destRate, netRate, 50);

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-border bg-card p-4 sm:p-5 hover:border-primary/20 transition-colors"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <h4 className="text-sm font-semibold text-foreground">{label}</h4>
        </div>
        <FTCBadge available={ftcAvailable} />
      </div>

      {/* Rate Bars */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-xs text-muted-foreground w-20 flex-shrink-0">Destination</span>
          <div className="flex-1 h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-secondary to-secondary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(destRate / maxRate) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground w-12 text-right">{destRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-xs text-muted-foreground w-20 flex-shrink-0">Source</span>
          <div className="flex-1 h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/50 to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(sourceRate / maxRate) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground w-12 text-right">{sourceRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] sm:text-xs font-semibold text-primary w-20 flex-shrink-0">NET RATE</span>
          <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(netRate / maxRate) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-primary w-12 text-right">{netRate.toFixed(1)}%</span>
        </div>
      </div>

      {/* Savings indicator */}
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
        savingsPct > 0 ? 'bg-primary/5 border border-primary/10' :
        savingsPct < 0 ? 'bg-secondary/30 border border-secondary' :
        'bg-muted/30 border border-border'
      }`}>
        <span className="text-[10px] sm:text-xs text-muted-foreground">Tax Savings</span>
        <span className={`text-sm font-bold ${
          savingsPct > 0 ? 'text-primary' :
          savingsPct < 0 ? 'text-secondary-foreground' :
          'text-muted-foreground'
        }`}>
          {savingsPct > 0 ? '+' : ''}{savingsPct.toFixed(0)}%
        </span>
      </div>

      {/* Explanation */}
      <p className="mt-3 text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
        {explanation}
      </p>
    </motion.div>
  );
}

export const CrossBorderTaxAudit: React.FC<CrossBorderTaxAuditProps> = ({
  audit,
  sourceJurisdiction = 'Source',
  destinationJurisdiction = 'Destination',
  viaNegativa
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  if (!audit) return null;

  const hasWarnings = audit.warnings && audit.warnings.length > 0;
  const hasComplianceFlags = audit.compliance_flags && audit.compliance_flags.length > 0;
  const isZeroSavings = audit.total_tax_savings_pct === 0;

  return (
    <div ref={sectionRef} className="relative">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION HEADER - Matches MemoHeader premium design language        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 ${
          viaNegativa?.isActive
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-primary/10 border border-primary/20'
        } rounded-full mb-3 w-fit`}>
          {viaNegativa?.isActive ? (
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
          ) : (
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
          )}
          <span className={`${viaNegativa?.isActive ? 'text-red-500' : 'text-primary'} text-[9px] sm:text-xs font-semibold tracking-wide uppercase`}>
            {viaNegativa?.isActive ? viaNegativa.taxBadgeLabel : 'Cross-Border Analysis'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight mb-2">
          {viaNegativa?.isActive ? viaNegativa.taxTitleLine1 : 'Tax Reality'}
          <br />
          <span className={viaNegativa?.isActive ? 'text-red-500' : 'text-primary'}>
            {viaNegativa?.isActive ? viaNegativa.taxTitleLine2 : 'Audit'}
          </span>
        </h2>

        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs sm:text-sm font-medium">{sourceJurisdiction}</span>
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-medium">{destinationJurisdiction}</span>
        </div>

        <motion.div
          className={`mt-3 w-16 h-1 ${
            viaNegativa?.isActive
              ? 'bg-gradient-to-r from-red-500 to-red-500/40'
              : 'bg-gradient-to-r from-primary to-primary/40'
          } rounded-full`}
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EXECUTIVE SUMMARY - Hero card with key verdict                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className={`relative overflow-hidden mb-6 sm:mb-8 rounded-xl sm:rounded-2xl border-2 p-5 sm:p-8 ${
          isZeroSavings
            ? 'bg-gradient-to-br from-card via-card to-red-500/5 border-red-500/20'
            : 'bg-gradient-to-br from-card via-card to-emerald-500/5 border-emerald-500/20'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Decorative corner gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${
          isZeroSavings ? 'bg-gradient-to-bl from-red-500/10' : 'bg-gradient-to-bl from-emerald-500/10'
        } to-transparent rounded-bl-full`} />

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isZeroSavings ? 'bg-red-500/10' : 'bg-emerald-500/10'
            }`}>
              {isZeroSavings ? (
                <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
              ) : (
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground leading-relaxed">
                {audit.executive_summary}
              </p>
            </div>
          </div>

          {/* Key metric: Total Tax Savings */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className={`rounded-xl p-3 sm:p-4 text-center ${
              isZeroSavings ? 'bg-red-500/5 border border-red-500/10' : 'bg-emerald-500/5 border border-emerald-500/10'
            }`}>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">Tax Savings</p>
              <p className={`text-2xl sm:text-3xl font-bold ${
                isZeroSavings ? 'text-red-500' : 'text-emerald-500'
              }`}>
                <AnimatedNumber value={audit.total_tax_savings_pct} />
              </p>
            </div>

            {audit.acquisition_audit && (
              <>
                <div className="rounded-xl p-3 sm:p-4 text-center bg-muted/30 border border-border">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">Day-One Loss</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-500">
                    <AnimatedNumber value={audit.acquisition_audit.day_one_loss_pct} />
                  </p>
                </div>

                <div className="rounded-xl p-3 sm:p-4 text-center bg-primary/5 border border-primary/20 col-span-2 sm:col-span-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Cost</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(audit.acquisition_audit.total_acquisition_cost)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMPLIANCE FLAGS                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {hasComplianceFlags && (
        <motion.div
          className="mb-6 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {audit.compliance_flags!.map((flag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide ${
                viaNegativa?.isActive
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-primary/5 text-primary border border-primary/15'
              }`}
            >
              {viaNegativa?.isActive ? (
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              {viaNegativa?.isActive
                ? (viaNegativa.compliancePrefix ? `${viaNegativa.compliancePrefix}: ${flag.replace(/_/g, ' ')}` : flag.replace(/_/g, ' '))
                : flag.replace(/_/g, ' ')}
            </span>
          ))}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CRITICAL WARNINGS                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {hasWarnings && (
        <motion.div
          className="mb-6 sm:mb-8 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {audit.warnings!.map((warning, i) => (
            <div
              key={i}
              className={`p-3 sm:p-4 rounded-xl flex items-start gap-3 ${
                viaNegativa?.isActive
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-amber-500/5 border border-amber-500/15'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                viaNegativa?.isActive ? 'bg-red-500/10' : 'bg-amber-500/10'
              }`}>
                <FileWarning className={`w-3.5 h-3.5 ${
                  viaNegativa?.isActive ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                {viaNegativa?.isActive && (
                  <span className="text-red-500 font-bold mr-1">{viaNegativa.warningPrefix} #{i + 1}</span>
                )}
                {/^(CRITICAL|HIGH|MEDIUM|LOW):\s/.test(warning) ? (
                  <>
                    <span className="font-bold">{warning.split(': ')[0]}:</span> {warning.substring(warning.indexOf(': ') + 2)}
                  </>
                ) : (
                  warning
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACQUISITION COST BREAKDOWN                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {audit.acquisition_audit && (
        <motion.div
          className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-border bg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {/* Section accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground uppercase tracking-wider">Acquisition Cost Breakdown</h3>
            </div>

            {/* Cost Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
              <div className="rounded-xl bg-muted/30 border border-border p-3 sm:p-4 text-center hover:border-primary/20 transition-colors">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Property Value</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{formatCurrency(audit.acquisition_audit.property_value)}</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border p-3 sm:p-4 text-center hover:border-primary/20 transition-colors">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1.5">BSD Stamp Duty</p>
                <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(audit.acquisition_audit.bsd_stamp_duty)}</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border p-3 sm:p-4 text-center hover:border-primary/20 transition-colors">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1.5">ABSD (Foreign)</p>
                <p className="text-lg sm:text-xl font-bold text-red-500">{formatCurrency(audit.acquisition_audit.absd_additional_stamp_duty)}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/25 p-3 sm:p-4 text-center">
                <p className="text-[10px] sm:text-xs uppercase tracking-wider text-primary mb-1.5">Total Acquisition</p>
                <p className="text-lg sm:text-xl font-bold text-primary">{formatCurrency(audit.acquisition_audit.total_acquisition_cost)}</p>
              </div>
            </div>

            {/* Day-One Loss Bar */}
            <div className="rounded-xl bg-gradient-to-r from-red-500/5 to-red-500/10 border border-red-500/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Day-One Transaction Loss</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Immediate cost as percentage of property value</p>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">
                <AnimatedNumber value={audit.acquisition_audit.day_one_loss_pct} />
              </p>
            </div>

            {audit.acquisition_audit.fta_benefit_applied && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  US-Singapore FTA benefit applied ({audit.acquisition_audit.buyer_category})
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAX TREATMENT GRID                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground uppercase tracking-wider">Tax Treatment by Category</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Rental Income */}
          {audit.rental_income_audit && (
            <TaxComparison
              label="Rental Income Tax"
              icon={<Receipt className="w-4 h-4 text-primary" />}
              sourceRate={audit.rental_income_audit.source_tax_rate_pct}
              destRate={audit.rental_income_audit.destination_tax_rate_pct}
              netRate={audit.rental_income_audit.net_tax_rate_pct}
              savingsPct={audit.rental_income_audit.tax_savings_pct}
              ftcAvailable={audit.rental_income_audit.ftc_available}
              explanation={audit.rental_income_audit.explanation}
            />
          )}

          {/* Capital Gains */}
          {audit.capital_gains_audit && (
            <TaxComparison
              label="Capital Gains Tax"
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              sourceRate={audit.capital_gains_audit.source_cgt_pct}
              destRate={audit.capital_gains_audit.destination_cgt_pct}
              netRate={audit.capital_gains_audit.net_cgt_rate_pct}
              savingsPct={audit.capital_gains_audit.tax_savings_pct}
              ftcAvailable={audit.capital_gains_audit.ftc_available}
              explanation={audit.capital_gains_audit.explanation}
            />
          )}

          {/* Estate Tax */}
          {audit.estate_tax_audit && (
            <TaxComparison
              label="Estate Tax"
              icon={<Globe className="w-4 h-4 text-primary" />}
              sourceRate={audit.estate_tax_audit.source_estate_pct}
              destRate={audit.estate_tax_audit.destination_estate_pct}
              netRate={audit.estate_tax_audit.net_estate_rate_pct}
              savingsPct={audit.estate_tax_audit.tax_savings_pct}
              ftcAvailable={!audit.estate_tax_audit.worldwide_applies}
              explanation={audit.estate_tax_audit.explanation}
            />
          )}

          {/* Net Yield */}
          {audit.net_yield_audit && (
            <motion.div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-5"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full" />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Percent className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Net Yield Analysis</h4>
                </div>

                {/* Yield metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">Gross</p>
                    <p className="text-lg font-bold text-foreground">{Number(audit.net_yield_audit.gross_yield_pct).toFixed(2)}%</p>
                  </div>
                  <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">Tax Rate</p>
                    <p className="text-lg font-bold text-foreground/80">{Number(audit.net_yield_audit.tax_rate_applied_pct).toFixed(2)}%</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2.5 text-center border border-primary/20">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-semibold">Net Yield</p>
                    <p className="text-lg font-bold text-primary">{audit.net_yield_audit.net_yield_pct.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Income breakdown */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Annual Gross Income</span>
                    <span className="font-medium text-foreground font-mono">{formatCurrency(audit.net_yield_audit.annual_gross_income)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Annual Tax Paid</span>
                    <span className="font-medium text-red-500 dark:text-red-400 font-mono">-{formatCurrency(audit.net_yield_audit.annual_tax_paid)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-primary/15">
                    <span className="font-semibold text-foreground">Annual Net Income</span>
                    <span className="font-bold text-primary font-mono">{formatCurrency(audit.net_yield_audit.annual_net_income)}</span>
                  </div>
                </div>

                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                  {audit.net_yield_audit.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
          Cross-Border Tax Audit • FTC Analysis
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </motion.div>
    </div>
  );
};

export default CrossBorderTaxAudit;
