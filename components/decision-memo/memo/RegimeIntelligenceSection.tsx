// components/decision-memo/memo/RegimeIntelligenceSection.tsx
// Premium Tax Regime Intelligence Section - NHR, 13O, Golden Visa detection
// Shows special tax regime status with dual-scenario comparison

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

// Interfaces matching backend API
interface RegimeRates {
  foreign_income?: number;
  foreign_dividends?: number;
  capital_gains_foreign?: number;
}

interface CriticalDate {
  date: string;
  event: string;
}

interface DetectedRegime {
  regime_key: string;      // e.g., "NHR"
  regime_name: string;     // e.g., "Non-Habitual Residency"
  jurisdiction: string;    // e.g., "Portugal"
  status: "ACTIVE" | "ENDED" | "ENDING";
  rates?: RegimeRates;
  warning?: string;
  successor_regime?: string;
  critical_dates?: CriticalDate[];
}

// Qualification route for Golden Visa programs
interface QualificationRoute {
  route: string;
  minimum_investment: string;
  processing_time: string;
}

// Tax comparison between source and destination
interface TaxComparison {
  source_jurisdiction: string;
  source_income_tax: number;
  source_cgt: number;
  destination_jurisdiction: string;
  destination_income_tax: number;
  destination_cgt: number;
  total_savings_pct: number;
  note?: string;
}

// Critical consideration with priority
interface CriticalConsideration {
  item: string;
  detail: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

// Application process step
interface ApplicationStep {
  step: number;
  action: string;
  timeline: string;
}

// Estimated costs breakdown
interface EstimatedCosts {
  visa_fee?: string;
  emirates_id?: string;
  medical_test?: string;
  total_range: string;
}

interface RegimeScenario {
  regime_name: string;
  status: string;
  end_date?: string;
  // Legacy fields for ENDED/ENDING regimes
  with_regime?: {
    dest_income_tax: number;
    dest_cgt: number;
    tax_differential: number;
    note: string;
  };
  without_regime?: {
    dest_income_tax: number;
    dest_cgt: number;
    tax_differential: number;
    note: string;
  };
  successor_regime?: string;
  action_required?: string;
  // NEW: Enhanced Golden Visa fields
  key_benefits?: (string | { benefit: string; detail?: string })[];
  qualification_routes?: QualificationRoute[];
  tax_comparison?: TaxComparison;
  critical_considerations?: CriticalConsideration[];
  application_process?: ApplicationStep[];
  estimated_costs?: EstimatedCosts;
}

interface RegimeWarning {
  regime: string;
  status: string;
  warning: string;
  critical_dates?: CriticalDate[];
}

export interface RegimeIntelligence {
  has_special_regime: boolean;
  detected_regimes?: DetectedRegime[];
  regime_scenario?: RegimeScenario;
  regime_warnings?: RegimeWarning[];
}

interface RegimeIntelligenceSectionProps {
  regimeIntelligence?: RegimeIntelligence;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { border: string; text: string; icon: React.ReactNode }> = {
    ACTIVE: { border: 'border-emerald-500/20', text: 'text-emerald-500/80', icon: '✓' },
    ENDED: { border: 'border-muted-foreground/20', text: 'text-muted-foreground/80', icon: <AlertTriangle className="w-3 h-3" /> },
    ENDING: { border: 'border-amber-500/20', text: 'text-amber-500/80', icon: <Clock className="w-3 h-3" /> }
  };

  const { border, text, icon } = config[status] || config.ACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${border}`}>
      <span>{icon}</span>
      <span className={`text-xs tracking-[0.15em] font-medium uppercase ${text}`}>
        {status === 'ENDED' ? 'ENDED' : status === 'ENDING' ? 'ENDING SOON' : 'ACTIVE'}
      </span>
    </span>
  );
}

// Priority badge component
function PriorityBadge({ priority }: { priority: "HIGH" | "MEDIUM" | "LOW" }) {
  const config: Record<string, { border: string; text: string }> = {
    HIGH: { border: 'border-primary/20', text: 'text-primary/80' },
    MEDIUM: { border: 'border-amber-500/20', text: 'text-amber-500/80' },
    LOW: { border: 'border-muted-foreground/20', text: 'text-muted-foreground/80' }
  };

  const { border, text } = config[priority] || config.MEDIUM;

  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${border} ${text}`}>
      {priority}
    </span>
  );
}

// Check icon for benefits
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function RegimeIntelligenceSection({
  regimeIntelligence,
  sourceJurisdiction,
  destinationJurisdiction
}: RegimeIntelligenceSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Don't render if no special regime detected
  if (!regimeIntelligence?.has_special_regime) {
    return null;
  }

  const { detected_regimes, regime_scenario, regime_warnings } = regimeIntelligence;

  return (
    <div ref={sectionRef}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Tax Regime Intelligence
          </h2>
          <div className="h-px bg-border" />
        </div>

        {/* Main Content Card */}
        <div className="relative rounded-2xl border border-border/30 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative px-5 sm:px-8 md:px-12 py-10 md:py-12">
            {/* Regime Status Header */}
            {regime_scenario && (
              <motion.div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
              >
                <div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight mb-1">
                    {regime_scenario.regime_name}
                  </h3>
                  <p className="text-sm text-muted-foreground/60">
                    {destinationJurisdiction || 'Destination'} Special Tax Program
                  </p>
                </div>
                <StatusBadge status={regime_scenario.status} />
              </motion.div>
            )}

            {regime_scenario && (
              <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-8" />
            )}

            {/* KEY BENEFITS Section (Golden Visa) */}
            {regime_scenario?.key_benefits && regime_scenario.key_benefits.length > 0 && (
              <motion.div
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Key Benefits
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {regime_scenario.key_benefits.map((benefit, i) => {
                    const benefitText = typeof benefit === 'string' ? benefit : benefit.benefit;
                    const detailText = typeof benefit === 'object' ? benefit.detail : undefined;
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/20 bg-card/50">
                        <CheckIcon className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-foreground font-normal">{benefitText}</span>
                          {detailText && (
                            <p className="text-sm text-muted-foreground/60 mt-1">{detailText}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* QUALIFICATION ROUTES Section (Golden Visa) */}
            {regime_scenario?.qualification_routes && regime_scenario.qualification_routes.length > 0 && (
              <motion.div
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Qualification Routes
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {regime_scenario.qualification_routes.map((route, i) => (
                    <div key={i} className="rounded-xl border border-border/20 bg-card/50 p-5">
                      <h5 className="text-sm font-normal text-foreground mb-3">{route.route}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground/60">Min. Investment:</span>
                          <span className="text-base font-medium tabular-nums text-foreground">{route.minimum_investment}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground/60">Processing:</span>
                          <span className="text-base font-medium tabular-nums text-primary/80">{route.processing_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CRITICAL CONSIDERATIONS Section (Golden Visa) */}
            {regime_scenario?.critical_considerations && regime_scenario.critical_considerations.length > 0 && (
              <motion.div
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Critical Considerations
                </p>
                <div className="space-y-3">
                  {regime_scenario.critical_considerations.map((consideration, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/20 bg-card/50">
                      <PriorityBadge priority={consideration.priority} />
                      <div className="flex-1">
                        <p className="text-sm font-normal text-foreground">{consideration.item}</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">{consideration.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* APPLICATION PROCESS Section (Golden Visa) */}
            {regime_scenario?.application_process && regime_scenario.application_process.length > 0 && (
              <motion.div
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Application Process
                </p>
                <div className="space-y-2">
                  {regime_scenario.application_process.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/20 bg-card/50">
                      <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary/80">{step.step}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-normal text-foreground">{step.action}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-primary/80">{step.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ESTIMATED COSTS Section (Golden Visa) */}
            {regime_scenario?.estimated_costs && (
              <motion.div
                className="mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  Estimated Costs
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {regime_scenario.estimated_costs.visa_fee && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Visa Fee</p>
                      <p className="text-base font-medium tabular-nums text-foreground">{regime_scenario.estimated_costs.visa_fee}</p>
                    </div>
                  )}
                  {regime_scenario.estimated_costs.emirates_id && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Emirates ID</p>
                      <p className="text-base font-medium tabular-nums text-foreground">{regime_scenario.estimated_costs.emirates_id}</p>
                    </div>
                  )}
                  {regime_scenario.estimated_costs.medical_test && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Medical Test</p>
                      <p className="text-base font-medium tabular-nums text-foreground">{regime_scenario.estimated_costs.medical_test}</p>
                    </div>
                  )}
                  <div className="rounded-xl border border-primary/20 bg-card/50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Range</p>
                    <p className="text-base font-medium tabular-nums text-primary/80">{regime_scenario.estimated_costs.total_range}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dual Scenario Comparison (for ENDED/ENDING regimes) */}
            {regime_scenario && (regime_scenario.status === 'ENDED' || regime_scenario.status === 'ENDING') && regime_scenario.with_regime && (
              <motion.div
                className="grid md:grid-cols-2 gap-4 mb-8 sm:mb-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
              >
                {/* With Regime Scenario */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    <h4 className="text-sm font-normal text-foreground">
                      With {regime_scenario.regime_name}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground/60 mb-4">
                    {regime_scenario.with_regime.note}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Income Tax:</span>
                      <span className="font-medium tabular-nums text-foreground">{regime_scenario.with_regime.dest_income_tax}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Capital Gains:</span>
                      <span className="font-medium tabular-nums text-foreground">{regime_scenario.with_regime.dest_cgt}%</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Tax Benefit:</span>
                      <span className="font-medium tabular-nums text-emerald-500/80">
                        +{regime_scenario.with_regime.tax_differential}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Without Regime Scenario */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                    <h4 className="text-sm font-normal text-foreground">
                      Standard Rates (No Regime)
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground/60 mb-4">
                    {regime_scenario.without_regime.note}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Income Tax:</span>
                      <span className="font-medium tabular-nums text-foreground">{regime_scenario.without_regime.dest_income_tax}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Capital Gains:</span>
                      <span className="font-medium tabular-nums text-foreground">{regime_scenario.without_regime.dest_cgt}%</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground/60">Differential:</span>
                      <span className={`font-medium tabular-nums ${regime_scenario.without_regime.tax_differential >= 0 ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                        {regime_scenario.without_regime.tax_differential >= 0 ? '+' : ''}{regime_scenario.without_regime.tax_differential}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Successor Regime Info */}
            {regime_scenario?.successor_regime && (
              <motion.div
                className="rounded-xl border border-border/20 bg-card/50 p-5 mb-8"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Successor Program</p>
                    <p className="text-sm font-normal text-foreground">{regime_scenario.successor_regime}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Required */}
            {regime_scenario?.action_required && (
              <motion.div
                className="rounded-xl border border-amber-500/20 bg-card/50 p-5 mb-8"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-amber-500/80 mt-0.5">!</span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-500/60 mb-1">Action Required</p>
                    <p className="text-sm font-normal text-foreground">{regime_scenario.action_required}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Warnings Section */}
            {regime_warnings && regime_warnings.length > 0 && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE_OUT_EXPO }}
              >
                {regime_warnings.map((warning, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-red-500/20 bg-card/50 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500/60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-normal text-foreground">{warning.warning}</p>
                        {warning.critical_dates && warning.critical_dates.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {warning.critical_dates.map((cd, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span className="font-medium tabular-nums">{cd.date}:</span>
                                <span>{cd.event}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Detected Regimes List (if multiple) */}
            {detected_regimes && detected_regimes.length > 1 && (
              <motion.div
                className="mt-8 sm:mt-12"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT_EXPO }}
              >
                <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-8" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
                  All Detected Regimes
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {detected_regimes.map((regime, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-card/50"
                    >
                      <div>
                        <p className="text-sm font-normal text-foreground">{regime.regime_name}</p>
                        <p className="text-sm text-muted-foreground/60">{regime.jurisdiction}</p>
                      </div>
                      <StatusBadge status={regime.status} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
