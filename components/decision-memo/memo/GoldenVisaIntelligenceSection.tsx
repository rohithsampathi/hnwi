// components/decision-memo/memo/GoldenVisaIntelligenceSection.tsx
// Enhanced Golden Visa Intelligence Section - "Money Talking" design language

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
import type { GoldenVisaIntelligence } from '@/lib/pdf/pdf-types';

interface GoldenVisaIntelligenceSectionProps {
  intelligence?: GoldenVisaIntelligence | null;
  goldenVisaIntelligence?: GoldenVisaIntelligence | null; // Backward compat
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Status badge component
function StatusBadge({ status }: { status: 'ACTIVE' | 'MODIFIED' | 'ENDED' }) {
  const config: Record<string, { border: string; text: string; dot: string; label: string }> = {
    ACTIVE: { border: 'border-gold/20', text: 'text-gold/80', dot: 'bg-gold/80', label: 'ACTIVE' },
    MODIFIED: { border: 'border-amber-500/20', text: 'text-amber-500/80', dot: 'bg-amber-500/80', label: 'MODIFIED' },
    ENDED: { border: 'border-border/20', text: 'text-muted-foreground/80', dot: 'bg-muted-foreground/60', label: 'ENDED' }
  };

  const { border, text, dot, label } = config[status] || config.ACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className={`text-xs tracking-[0.15em] font-medium uppercase ${text}`}>
        {label}
      </span>
    </span>
  );
}

// Priority badge for critical considerations
function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const config: Record<string, { border: string; text: string }> = {
    HIGH: { border: 'border-amber-500/20', text: 'text-amber-500/80' },
    MEDIUM: { border: 'border-gold/20', text: 'text-gold/80' },
    LOW: { border: 'border-border/20', text: 'text-muted-foreground/80' }
  };

  const { border, text } = config[priority] || config.MEDIUM;

  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${border} ${text}`}>
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
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          Golden Visa Intelligence
        </h2>
        <div className="h-px bg-border" />
      </motion.div>

      <div className="space-y-8 sm:space-y-12">
        {/* Program Header Card */}
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          <div className="relative z-10 px-5 sm:px-8 md:px-12 py-10 md:py-12">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-normal text-foreground tracking-tight">{gvi.program_name || 'Golden Visa Program'}</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">{gvi.jurisdiction || destinationJurisdiction || 'Destination jurisdiction'}</p>
              </div>
              {gvi.status ? <StatusBadge status={gvi.status} /> : null}
            </div>

            {/* Qualification Summary Badge */}
            {gvi.qualification_summary && (
              <div className={`p-5 rounded-xl border text-center ${
                gvi.qualifies_based_on_transaction
                  ? 'border-gold/20 bg-gold/[0.03]'
                  : 'border-border/20 bg-card/50'
              }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {gvi.qualifies_based_on_transaction ? (
                    <CheckCircle className="w-4 h-4 text-gold/80" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-muted-foreground/60" />
                  )}
                  <span className={`text-xs tracking-[0.15em] uppercase font-medium ${
                    gvi.qualifies_based_on_transaction ? 'text-gold/80' : 'text-muted-foreground/60'
                  }`}>
                    {gvi.qualifies_based_on_transaction ? 'QUALIFIES' : 'REVIEW REQUIRED'}
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{gvi.qualification_summary}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Key Benefits Section */}
        {gvi.key_benefits && gvi.key_benefits.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Key Benefits
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {gvi.key_benefits.map((item, i) => {
                  const benefit = typeof item === 'string' ? { benefit: item, detail: undefined } : item;

                  return (
                    <div key={i} className="rounded-xl border border-border/20 bg-card/50 p-5">
                      <div className="flex items-start gap-3">
                        <CheckIcon className="w-3.5 h-3.5 text-gold/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{benefit.benefit}</p>
                          {benefit.detail ? <p className="text-sm text-muted-foreground/60 mt-1 font-normal">{benefit.detail}</p> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Qualification Routes Section */}
        {gvi.qualification_routes && gvi.qualification_routes.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Qualification Routes
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gvi.qualification_routes.map((route, i) => (
                  <div
                    key={i}
                    className={`relative rounded-xl p-5 border transition-all ${
                      route.recommended_for
                        ? 'border-gold/30 bg-gold/[0.03] ring-1 ring-gold/20 ring-offset-2 ring-offset-background'
                        : 'border-border/20 bg-card/50'
                    }`}
                  >
                    {route.recommended_for && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80 bg-background">
                          Recommended
                        </span>
                      </div>
                    )}

                    <h5 className="text-sm font-medium text-foreground mb-4 mt-1">{route.route}</h5>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Requirement</p>
                        <p className="text-sm text-foreground font-normal">{route.requirement}</p>
                      </div>

                      {route.property_types && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Property Types</p>
                          <p className="text-sm text-muted-foreground font-normal">{route.property_types}</p>
                        </div>
                      )}

                      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Processing</p>
                          <p className="text-base font-medium tabular-nums text-gold/80">{route.processing_time}</p>
                        </div>
                        {route.family_inclusion && (
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Family</p>
                            <p className="text-sm text-muted-foreground font-normal">{route.family_inclusion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Critical Considerations Section */}
        {gvi.critical_considerations && gvi.critical_considerations.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Critical Considerations
              </p>

              <div className="space-y-4">
                {gvi.critical_considerations.map((consideration, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-5 rounded-xl border ${
                      consideration.priority === 'HIGH'
                        ? 'border-amber-500/20 bg-amber-500/[0.03]'
                        : 'border-border/20 bg-card/50'
                    }`}
                  >
                    <PriorityBadge priority={consideration.priority} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{consideration.item}</p>
                      <p className="text-sm text-muted-foreground/60 mt-1 font-normal">{consideration.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Application Process Section */}
        {gvi.application_process && gvi.application_process.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Application Process
              </p>

              <div className="relative">
                {gvi.application_process.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {/* Timeline connector */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/[0.05] flex items-center justify-center z-10">
                        <span className="text-sm font-medium text-gold/80">{step.step}</span>
                      </div>
                      {i < gvi.application_process!.length - 1 && (
                        <div className="w-px h-full bg-gradient-to-b from-gold/20 to-transparent absolute top-10 left-5 -z-10" style={{ minHeight: '40px' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="rounded-xl border border-border/20 bg-card/50 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-normal text-foreground">{step.action}</p>
                          <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                            {step.timeline}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Costs Section */}
        {gvi.costs && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Estimated Costs
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                {gvi.costs.visa_fee && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Visa Fee</p>
                    <p className="text-base font-medium tabular-nums text-foreground">{gvi.costs.visa_fee}</p>
                  </div>
                )}
                {gvi.costs.emirates_id && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Emirates ID</p>
                    <p className="text-base font-medium tabular-nums text-foreground">{gvi.costs.emirates_id}</p>
                  </div>
                )}
                {gvi.costs.medical_test && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Medical Test</p>
                    <p className="text-base font-medium tabular-nums text-foreground">{gvi.costs.medical_test}</p>
                  </div>
                )}
                {gvi.costs.insurance_annual && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Insurance/Year</p>
                    <p className="text-base font-medium tabular-nums text-foreground">{gvi.costs.insurance_annual}</p>
                  </div>
                )}
                {(gvi.costs.total_initial || gvi.costs.total_range) && (
                  <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">Total</p>
                    <p className="text-base font-medium tabular-nums text-gold/80">{gvi.costs.total_initial || gvi.costs.total_range}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Source Footer */}
        {gvi.source && (
          <motion.div
            className="flex items-center justify-center gap-3 pt-4"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              {gvi.source}
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default GoldenVisaIntelligenceSection;
