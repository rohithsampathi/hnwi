// components/decision-memo/memo/GoldenVisaIntelligenceSection.tsx
// Enhanced Golden Visa Intelligence Section - Premium SFO-grade visualization

"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  Globe,
  Users,
  AlertTriangle,
  ArrowRight,
  FileCheck,
  Wallet,
  Building2
} from 'lucide-react';
import { GoldenVisaIntelligence } from '@/lib/decision-memo/memo-types';

interface GoldenVisaIntelligenceSectionProps {
  intelligence?: GoldenVisaIntelligence | null;
  goldenVisaIntelligence?: GoldenVisaIntelligence | null; // Backward compat
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Status badge component
function StatusBadge({ status }: { status: 'ACTIVE' | 'MODIFIED' | 'ENDED' }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: 'bg-primary/20 border-primary/30', text: 'text-primary', label: 'ACTIVE' },
    MODIFIED: { bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'MODIFIED' },
    ENDED: { bg: 'bg-muted border-border', text: 'text-muted-foreground', label: 'ENDED' }
  };

  const { bg, text, label } = config[status] || config.ACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${bg}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-primary' : status === 'MODIFIED' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
      <span className={`text-xs font-bold uppercase tracking-wider ${text}`}>
        {label}
      </span>
    </span>
  );
}

// Priority badge for critical considerations
function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const config: Record<string, { bg: string; text: string }> = {
    HIGH: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
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

// Check icon component
function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function GoldenVisaIntelligenceSection({
  intelligence,
  goldenVisaIntelligence,
  sourceJurisdiction,
  destinationJurisdiction
}: GoldenVisaIntelligenceSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Accept either prop name for golden visa intelligence data
  const gvi = intelligence || goldenVisaIntelligence;

  // Only render if we have golden visa intelligence data
  if (!gvi) {
    return null;
  }

  return (
    <div ref={sectionRef}>
      {/* Premium Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            GOLDEN VISA INTELLIGENCE
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            Residency
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          Investment migration pathway for {destinationJurisdiction || gvi.jurisdiction}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Program Header Card */}
        <motion.div
          className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{gvi.program_name}</h3>
                <p className="text-sm text-muted-foreground">{gvi.jurisdiction}</p>
              </div>
            </div>
            <StatusBadge status={gvi.status} />
          </div>

          {/* Qualification Summary Badge */}
          {gvi.qualification_summary && (
            <div className={`p-4 rounded-xl border-2 text-center mb-4 ${
              gvi.qualifies_based_on_transaction
                ? 'bg-primary/10 border-primary/40'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                {gvi.qualifies_based_on_transaction ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={`text-sm font-bold uppercase tracking-wider ${
                  gvi.qualifies_based_on_transaction ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {gvi.qualifies_based_on_transaction ? 'QUALIFIES' : 'REVIEW REQUIRED'}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">{gvi.qualification_summary}</p>
            </div>
          )}
        </motion.div>

        {/* Key Benefits Section */}
        {gvi.key_benefits && gvi.key_benefits.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Key Benefits
              </h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {gvi.key_benefits.map((item, i) => (
                <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.benefit}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Qualification Routes Section */}
        {gvi.qualification_routes && gvi.qualification_routes.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <ArrowRight className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Qualification Routes
              </h4>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gvi.qualification_routes.map((route, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl p-4 border-2 transition-all ${
                    route.recommended_for
                      ? 'bg-primary/5 border-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-muted/20 border-border'
                  }`}
                >
                  {route.recommended_for && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                        Recommended
                      </span>
                    </div>
                  )}

                  <h5 className="text-sm font-bold text-foreground mb-3 mt-1">{route.route}</h5>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Requirement</p>
                      <p className="text-xs text-foreground">{route.requirement}</p>
                    </div>

                    {route.property_types && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Property Types</p>
                        <p className="text-xs text-muted-foreground">{route.property_types}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Processing</p>
                        <p className="text-sm font-bold text-primary">{route.processing_time}</p>
                      </div>
                      {route.family_inclusion && (
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Family</p>
                          <p className="text-xs text-muted-foreground">{route.family_inclusion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Critical Considerations Section */}
        {gvi.critical_considerations && gvi.critical_considerations.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Critical Considerations
              </h4>
            </div>

            <div className="space-y-3">
              {gvi.critical_considerations.map((consideration, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    consideration.priority === 'HIGH'
                      ? 'bg-amber-500/5 border-amber-500/30'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <PriorityBadge priority={consideration.priority} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{consideration.item}</p>
                    <p className="text-xs text-muted-foreground mt-1">{consideration.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Application Process Section */}
        {gvi.application_process && gvi.application_process.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <FileCheck className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Application Process
              </h4>
            </div>

            <div className="relative">
              {gvi.application_process.map((step, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-10">
                      <span className="text-sm font-bold text-primary">{step.step}</span>
                    </div>
                    {i < gvi.application_process!.length - 1 && (
                      <div className="w-0.5 h-full bg-border absolute top-10 left-5 -z-10" style={{ minHeight: '40px' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{step.action}</p>
                        <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded">
                          {step.timeline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Costs Section */}
        {gvi.costs && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Estimated Costs
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {gvi.costs.visa_fee && (
                <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Visa Fee</p>
                  <p className="text-sm font-bold text-foreground">{gvi.costs.visa_fee}</p>
                </div>
              )}
              {gvi.costs.emirates_id && (
                <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Emirates ID</p>
                  <p className="text-sm font-bold text-foreground">{gvi.costs.emirates_id}</p>
                </div>
              )}
              {gvi.costs.medical_test && (
                <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Medical Test</p>
                  <p className="text-sm font-bold text-foreground">{gvi.costs.medical_test}</p>
                </div>
              )}
              {gvi.costs.insurance_annual && (
                <div className="bg-muted/30 rounded-lg p-3 text-center border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Insurance/Year</p>
                  <p className="text-sm font-bold text-foreground">{gvi.costs.insurance_annual}</p>
                </div>
              )}
              {(gvi.costs.total_initial || gvi.costs.total_range) && (
                <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-3 text-center">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                  <p className="text-sm font-bold text-primary">{gvi.costs.total_initial || gvi.costs.total_range}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Source Footer */}
        {gvi.source && (
          <motion.div
            className="flex items-center justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] text-muted-foreground">
              {gvi.source}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default GoldenVisaIntelligenceSection;
