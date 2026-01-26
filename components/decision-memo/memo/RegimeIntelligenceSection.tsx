// components/decision-memo/memo/RegimeIntelligenceSection.tsx
// Premium Tax Regime Intelligence Section - NHR, 13O, Golden Visa detection
// Shows special tax regime status with dual-scenario comparison

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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
  key_benefits?: string[];
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

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    ACTIVE: { bg: 'bg-primary/10 border-primary/30', text: 'text-primary', icon: '✓' },
    ENDED: { bg: 'bg-muted border-border', text: 'text-muted-foreground', icon: '⚠️' },
    ENDING: { bg: 'bg-muted border-border', text: 'text-muted-foreground', icon: '⏳' }
  };

  const { bg, text, icon } = config[status] || config.ACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${bg}`}>
      <span>{icon}</span>
      <span className={`text-xs font-bold uppercase tracking-wider ${text}`}>
        {status === 'ENDED' ? 'ENDED' : status === 'ENDING' ? 'ENDING SOON' : 'ACTIVE'}
      </span>
    </span>
  );
}

// Priority badge component - using primary colors only
function PriorityBadge({ priority }: { priority: "HIGH" | "MEDIUM" | "LOW" }) {
  const config: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: 'bg-primary/20', text: 'text-primary' },
    MEDIUM: { bg: 'bg-primary/10', text: 'text-primary' },
    LOW: { bg: 'bg-muted', text: 'text-muted-foreground' }
  };

  const { bg, text } = config[priority] || config.MEDIUM;

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${bg} ${text}`}>
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
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Section Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-wide">
                TAX REGIME INTELLIGENCE
              </h2>
              <p className="text-xs text-muted-foreground">
                Special regime detection and impact analysis
              </p>
            </div>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30 ml-[52px]" />
        </div>

        {/* Main Content Card */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* Regime Status Header */}
          {regime_scenario && (
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {regime_scenario.regime_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {destinationJurisdiction || 'Destination'} Special Tax Program
                </p>
              </div>
              <StatusBadge status={regime_scenario.status} />
            </motion.div>
          )}

          {/* KEY BENEFITS Section (Golden Visa) */}
          {regime_scenario?.key_benefits && regime_scenario.key_benefits.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Key Benefits
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {regime_scenario.key_benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
                    <CheckIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* QUALIFICATION ROUTES Section (Golden Visa) */}
          {regime_scenario?.qualification_routes && regime_scenario.qualification_routes.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Qualification Routes
              </h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {regime_scenario.qualification_routes.map((route, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-foreground mb-2">{route.route}</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Min. Investment:</span>
                        <span className="font-medium text-foreground">{route.minimum_investment}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Processing:</span>
                        <span className="font-medium text-primary">{route.processing_time}</span>
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
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Critical Considerations
              </h4>
              <div className="space-y-3">
                {regime_scenario.critical_considerations.map((consideration, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg">
                    <PriorityBadge priority={consideration.priority} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{consideration.item}</p>
                      <p className="text-xs text-muted-foreground mt-1">{consideration.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* APPLICATION PROCESS Section (Golden Visa) */}
          {regime_scenario?.application_process && regime_scenario.application_process.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.45 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Application Process
              </h4>
              <div className="space-y-2">
                {regime_scenario.application_process.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{step.action}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-primary">{step.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ESTIMATED COSTS Section (Golden Visa) */}
          {regime_scenario?.estimated_costs && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Estimated Costs
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {regime_scenario.estimated_costs.visa_fee && (
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Visa Fee</p>
                    <p className="text-sm font-bold text-foreground">{regime_scenario.estimated_costs.visa_fee}</p>
                  </div>
                )}
                {regime_scenario.estimated_costs.emirates_id && (
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Emirates ID</p>
                    <p className="text-sm font-bold text-foreground">{regime_scenario.estimated_costs.emirates_id}</p>
                  </div>
                )}
                {regime_scenario.estimated_costs.medical_test && (
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Medical Test</p>
                    <p className="text-sm font-bold text-foreground">{regime_scenario.estimated_costs.medical_test}</p>
                  </div>
                )}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Range</p>
                  <p className="text-sm font-bold text-primary">{regime_scenario.estimated_costs.total_range}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Dual Scenario Comparison (for ENDED/ENDING regimes) */}
          {regime_scenario && (regime_scenario.status === 'ENDED' || regime_scenario.status === 'ENDING') && regime_scenario.with_regime && (
            <motion.div
              className="grid md:grid-cols-2 gap-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              {/* With Regime Scenario */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h4 className="text-sm font-semibold text-foreground">
                    With {regime_scenario.regime_name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {regime_scenario.with_regime.note}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Income Tax:</span>
                    <span className="font-medium text-foreground">{regime_scenario.with_regime.dest_income_tax}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capital Gains:</span>
                    <span className="font-medium text-foreground">{regime_scenario.with_regime.dest_cgt}%</span>
                  </div>
                  <div className="pt-2 border-t border-green-500/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax Benefit:</span>
                      <span className="font-bold text-green-500">
                        +{regime_scenario.with_regime.tax_differential}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Without Regime Scenario */}
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">
                    Standard Rates (No Regime)
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {regime_scenario.without_regime.note}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Income Tax:</span>
                    <span className="font-medium text-foreground">{regime_scenario.without_regime.dest_income_tax}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capital Gains:</span>
                    <span className="font-medium text-foreground">{regime_scenario.without_regime.dest_cgt}%</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Differential:</span>
                      <span className={`font-bold ${regime_scenario.without_regime.tax_differential >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {regime_scenario.without_regime.tax_differential >= 0 ? '+' : ''}{regime_scenario.without_regime.tax_differential}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Successor Regime Info */}
          {regime_scenario?.successor_regime && (
            <motion.div
              className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Successor Program</p>
                  <p className="text-sm text-muted-foreground">{regime_scenario.successor_regime}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Required */}
          {regime_scenario?.action_required && (
            <motion.div
              className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-500">!</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Action Required</p>
                  <p className="text-sm text-muted-foreground">{regime_scenario.action_required}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warnings Section */}
          {regime_warnings && regime_warnings.length > 0 && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              {regime_warnings.map((warning, i) => (
                <div
                  key={i}
                  className="bg-red-500/5 border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{warning.warning}</p>
                      {warning.critical_dates && warning.critical_dates.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {warning.critical_dates.map((cd, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>📅</span>
                              <span className="font-medium">{cd.date}:</span>
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
              className="mt-6 pt-6 border-t border-border"
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                All Detected Regimes
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {detected_regimes.map((regime, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{regime.regime_name}</p>
                      <p className="text-xs text-muted-foreground">{regime.jurisdiction}</p>
                    </div>
                    <StatusBadge status={regime.status} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
