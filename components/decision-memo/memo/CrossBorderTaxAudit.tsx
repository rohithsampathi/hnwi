// components/decision-memo/memo/CrossBorderTaxAudit.tsx
// Cross-Border Tax Audit Section - "Money Talking" design language
// Shows true tax impact for cross-border acquisitions (US worldwide taxation, FTC, net yields)

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
import { resolveCrossBorderDisplayMetrics } from '@/lib/decision-memo/resolve-cross-border-display-metrics';
import {
  useAnimatedMetric,
  useDecisionMemoRenderContext,
  useReportInView,
} from './decision-memo-render-context';
import type { CrossBorderAuditSummary as PdfCrossBorderAuditSummary } from '@/lib/pdf/pdf-types';

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
  ongoing_tax_savings_pct?: number;
  ongoing_tax_savings_note?: string;
  fta_acquisition_savings_pct?: number;
  fta_acquisition_savings_usd?: number;
  compliance_flags?: string[];
  warnings?: string[];
}

interface CrossBorderTaxAuditProps {
  audit: CrossBorderAuditSummary | PdfCrossBorderAuditSummary | null | undefined;
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
  const { motionEnabled } = useDecisionMemoRenderContext();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useReportInView(ref, { once: true });
  const display = useAnimatedMetric(value, {
    duration: 1200,
    enabled: motionEnabled && isInView,
  });

  return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>;
}

// Premium FTC indicator
function FTCBadge({ available }: { available: boolean }) {
  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
      available
        ? 'border-gold/20 text-gold/80'
        : 'border-border/20 text-muted-foreground/60'
    }`}>
      {available ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
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
      className="relative rounded-xl border border-border/20 bg-card/50 p-6"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm font-normal text-foreground">{label}</h4>
          <FTCBadge available={ftcAvailable} />
        </div>

        {/* Rate Bars */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 w-24 flex-shrink-0">Destination</span>
            <div className="flex-1 h-2 bg-border/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-muted-foreground/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(destRate / maxRate) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground/60 w-14 text-right">{destRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60 w-24 flex-shrink-0">Source</span>
            <div className="flex-1 h-2 bg-border/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(sourceRate / maxRate) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground/60 w-14 text-right">{sourceRate.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.15em] text-gold/70 w-24 flex-shrink-0">NET RATE</span>
            <div className="flex-1 h-2.5 bg-border/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold/60 to-gold/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(netRate / maxRate) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-gold/80 w-14 text-right">{netRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Savings indicator */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/20 bg-card/50">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground/60">Tax Savings</span>
          <span className={`text-base font-medium ${
            savingsPct > 0 ? 'text-gold/80' :
            savingsPct < 0 ? 'text-red-500/80' :
            'text-muted-foreground/60'
          }`}>
            {savingsPct > 0 ? '+' : ''}{savingsPct.toFixed(0)}%
          </span>
        </div>

        {/* Explanation */}
        <p className="mt-4 text-sm text-muted-foreground/60 leading-relaxed font-normal">
          {explanation}
        </p>
      </div>
    </motion.div>
  );
}

export const CrossBorderTaxAudit: React.FC<CrossBorderTaxAuditProps> = ({
  audit: rawAudit,
  sourceJurisdiction = 'Source',
  destinationJurisdiction = 'Destination',
  viaNegativa
}) => {
  const audit = rawAudit as CrossBorderAuditSummary | null | undefined;
  const { motionEnabled } = useDecisionMemoRenderContext();
  const [isVisible, setIsVisible] = useState(!motionEnabled);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useReportInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  if (!audit) return null;

  const hasWarnings = audit.warnings && audit.warnings.length > 0;
  const hasComplianceFlags = audit.compliance_flags && audit.compliance_flags.length > 0;
  const {
    displayTaxSavingsPct,
    acquisitionReliefPct,
    acquisitionReliefUsd,
    dayOneLossPct,
  } = resolveCrossBorderDisplayMetrics(audit);
  const isZeroSavings = displayTaxSavingsPct === 0;

  return (
    <div ref={sectionRef} className="print-cross-border-audit relative">
      <div data-print-block="keep" data-print-max-height="780">
        {/* SECTION HEADER */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Cross-Border Tax Audit
          </h2>
          <div className="h-px bg-border" />
        </motion.div>

        {/* EXECUTIVE SUMMARY */}
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden mb-8 sm:mb-12"
          data-print-block="keep"
          data-print-max-gap="240"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
            <div className="mb-8">
              <p className="text-sm sm:text-base font-normal text-foreground leading-relaxed">
                {audit.executive_summary}
              </p>
            </div>

            {/* Key metric: Total Tax Savings */}
            <div className={`grid gap-3 sm:gap-6 ${acquisitionReliefPct ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Tax Savings</p>
                <p className={`text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight ${
                  isZeroSavings ? 'text-red-500/80' : 'text-emerald-500/80'
                }`}>
                  <AnimatedNumber value={displayTaxSavingsPct} />
                </p>
                {audit.ongoing_tax_savings_note && (
                  <p className="mt-2 text-xs text-muted-foreground/60 font-normal leading-relaxed">
                    {audit.ongoing_tax_savings_note}
                  </p>
                )}
              </div>

              {audit.acquisition_audit && (
                <>
                  {acquisitionReliefPct ? (
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Acquisition Relief</p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-emerald-500/80">
                        <AnimatedNumber value={acquisitionReliefPct} />
                      </p>
                      {acquisitionReliefUsd ? (
                        <p className="mt-2 text-xs text-muted-foreground/60 font-normal">
                          {formatCurrency(acquisitionReliefUsd)} stamp-duty relief
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Day-One Loss</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-red-500/80">
                      <AnimatedNumber value={dayOneLossPct ?? 0} decimals={2} />
                    </p>
                  </div>

                  <div className={`text-center ${acquisitionReliefPct ? 'col-span-2 lg:col-span-1' : 'col-span-2 sm:col-span-1'}`}>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Total Cost</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-gold/80">
                      {formatCurrency(audit.acquisition_audit.total_acquisition_cost)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* COMPLIANCE FLAGS */}
      {hasComplianceFlags && (
        <motion.div
          className="mb-8 flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {audit.compliance_flags!.map((flag, i) => (
            <span
              key={i}
              className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                viaNegativa?.isActive
                  ? 'border-red-500/20 text-red-500/80'
                  : 'border-gold/20 text-gold/80'
              }`}
            >
              {viaNegativa?.isActive
                ? (viaNegativa.compliancePrefix ? `${viaNegativa.compliancePrefix}: ${flag.replace(/_/g, ' ')}` : flag.replace(/_/g, ' '))
                : flag.replace(/_/g, ' ')}
            </span>
          ))}
        </motion.div>
      )}

      {/* CRITICAL WARNINGS */}
      {hasWarnings && (
        <motion.div
          className="mb-8 sm:mb-12 space-y-3"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {audit.warnings!.map((warning, i) => (
            <div
              key={i}
              className={`p-4 sm:p-5 rounded-xl flex items-start gap-3 border ${
                viaNegativa?.isActive
                  ? 'border-red-500/20 bg-red-500/[0.03]'
                  : 'border-amber-500/20 bg-amber-500/[0.03]'
              }`}
            >
              <FileWarning className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                viaNegativa?.isActive ? 'text-red-500/60' : 'text-amber-500/60'
              }`} />
              <div className="text-xs sm:text-sm text-foreground leading-relaxed font-normal">
                {viaNegativa?.isActive && (
                  <span className="text-red-500/80 font-medium mr-1">{viaNegativa.warningPrefix} #{i + 1}</span>
                )}
                {/^(CRITICAL|HIGH|MEDIUM|LOW):\s/.test(warning) ? (
                  <>
                    <span className="font-medium">{warning.split(': ')[0]}:</span> {warning.substring(warning.indexOf(': ') + 2)}
                  </>
                ) : (
                  warning
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ACQUISITION COST BREAKDOWN */}
      {audit.acquisition_audit && (
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden mb-8 sm:mb-12"
          data-print-block="keep"
          data-print-max-gap="220"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

          <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">Acquisition Cost Breakdown</p>

            {/* Cost Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Property Value</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{formatCurrency(audit.acquisition_audit.property_value)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">BSD Stamp Duty</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-amber-500/80">{formatCurrency(audit.acquisition_audit.bsd_stamp_duty)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">ABSD (Foreign)</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-red-500/80">{formatCurrency(audit.acquisition_audit.absd_additional_stamp_duty)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Total Acquisition</p>
                <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{formatCurrency(audit.acquisition_audit.total_acquisition_cost)}</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-8" />

            {/* Day-One Loss Bar */}
            <div className="rounded-xl border border-border/20 bg-card/50 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-normal text-foreground">Day-One Transaction Loss</p>
                <p className="text-sm text-muted-foreground/60 font-normal">Immediate cost as percentage of property value</p>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tabular-nums tracking-tight text-red-500/80">
                <AnimatedNumber value={dayOneLossPct ?? 0} decimals={2} />
              </p>
            </div>

            {audit.acquisition_audit.fta_benefit_applied && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-normal">
                  US-Singapore FTA benefit applied ({audit.acquisition_audit.buyer_category})
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAX TREATMENT GRID */}
      <motion.div
        className="mb-8 sm:mb-12"
        data-print-block="keep"
        data-print-max-height="760"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">Tax Treatment by Category</p>

        <div
          className="grid md:grid-cols-2 gap-6"
          data-print-block="keep"
          data-print-max-gap="160"
        >
          {/* Rental Income */}
          {audit.rental_income_audit && (
            <TaxComparison
              label="Rental Income Tax"
              icon={<Receipt className="w-4 h-4 text-gold/60" />}
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
              icon={<TrendingUp className="w-4 h-4 text-gold/60" />}
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
              icon={<Globe className="w-4 h-4 text-gold/60" />}
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
              className="relative rounded-xl border border-border/20 bg-card/50 p-6"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

              <div className="relative z-10">
                <h4 className="text-sm font-normal text-foreground mb-5">Net Yield Analysis</h4>

                {/* Yield metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Gross</p>
                    <p className="text-xl font-bold tabular-nums text-foreground">{Number(audit.net_yield_audit.gross_yield_pct).toFixed(2)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Tax Rate</p>
                    <p className="text-xl font-bold tabular-nums text-foreground/80">{Number(audit.net_yield_audit.tax_rate_applied_pct).toFixed(2)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">Net Yield</p>
                    <p className="text-xl font-bold tabular-nums text-gold/80">{audit.net_yield_audit.net_yield_pct.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Income breakdown */}
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground/60 font-normal">Annual Gross Income</span>
                    <span className="font-medium text-foreground tabular-nums">{formatCurrency(audit.net_yield_audit.annual_gross_income)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground/60 font-normal">Annual Tax Paid</span>
                    <span className="font-medium text-red-500/80 tabular-nums">-{formatCurrency(audit.net_yield_audit.annual_tax_paid)}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent" />
                  <div className="flex justify-between text-xs pt-1">
                    <span className="font-normal text-foreground">Annual Net Income</span>
                    <span className="font-medium text-gold/80 tabular-nums">{formatCurrency(audit.net_yield_audit.annual_net_income)}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground/60 leading-relaxed font-normal">
                  {audit.net_yield_audit.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* FOOTER */}
      <motion.div
        className="flex items-center justify-center gap-3 pt-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Cross-Border Tax Audit &middot; FTC Analysis
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
      </motion.div>
    </div>
  );
};

export default CrossBorderTaxAudit;
