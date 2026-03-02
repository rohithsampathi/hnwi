// components/decision-memo/memo/GoldenVisaSection.tsx
// Golden Visa / Investment Migration Section - "Money Talking" design language

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
  Building2,
  ArrowRight,
  Plane,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { VisaProgram, DestinationDrivers } from '@/lib/decision-memo/memo-types';

interface GoldenVisaSectionProps {
  destinationDrivers?: DestinationDrivers;
  destinationJurisdiction?: string;
}

// Status badge component
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const isActive = status.toLowerCase().includes('active');
  const isLimited = status.toLowerCase().includes('limited');

  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
      isActive && !isLimited
        ? 'border-gold/20 text-gold/80'
        : 'border-border/20 text-muted-foreground/80'
    }`}>
      {status}
    </span>
  );
}

// Single Visa Program Card
function VisaProgramCard({ program, index }: { program: VisaProgram; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl border border-border/20 bg-card/50 px-5 sm:px-8 md:px-12 py-10 md:py-12"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h4 className="text-lg font-normal text-foreground tracking-tight">{program.program_name}</h4>
            {program.investment_type && (
              <p className="text-sm text-muted-foreground/60 mt-1">{program.investment_type}</p>
            )}
          </div>
          <StatusBadge status={program.status} />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-8">
          {/* Investment */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Investment</p>
            <p className="text-base font-medium tabular-nums text-foreground">{program.minimum_investment}</p>
          </div>

          {/* Duration */}
          {program.duration && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Duration</p>
              <p className="text-base font-medium tabular-nums text-foreground">{program.duration}</p>
            </div>
          )}

          {/* Processing */}
          {program.processing_time && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Processing</p>
              <p className="text-base font-medium tabular-nums text-foreground">{program.processing_time}</p>
            </div>
          )}

          {/* Presence Required */}
          {program.physical_presence_required && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Presence</p>
              <p className="text-base font-medium tabular-nums text-foreground">{program.physical_presence_required}</p>
            </div>
          )}
        </div>

        {/* Gold accent divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8" />

        {/* Key Benefits */}
        {program.key_benefits && program.key_benefits.length > 0 && (
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Key Benefits</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {program.key_benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-gold/60 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground font-normal">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Path to Citizenship */}
        {program.path_to_citizenship !== undefined && (
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground font-normal">
              Path to Citizenship: {' '}
              <span className={`font-medium ${program.path_to_citizenship ? 'text-gold/80' : 'text-muted-foreground/60'}`}>
                {program.path_to_citizenship ? 'Yes' : 'No'}
              </span>
            </span>
          </div>
        )}

        {/* 2025 Changes Notice */}
        {program["2025_changes"] && (
          <div className="rounded-xl border border-border/20 bg-card/50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">2025/2026 Update</p>
                <p className="text-sm text-muted-foreground font-normal">{program["2025_changes"]}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function GoldenVisaSection({
  destinationDrivers,
  destinationJurisdiction
}: GoldenVisaSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Only render if we have visa programs
  const visaPrograms = destinationDrivers?.visa_programs;
  if (!visaPrograms || visaPrograms.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef}>
      {/* Premium Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">Golden Visa</p>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight mb-3">
          Investment Benefits
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-4" />
        <p className="text-sm text-muted-foreground/60 font-normal">
          Investment migration programs available in {destinationJurisdiction || 'destination jurisdiction'}
        </p>
      </motion.div>

      <div className="space-y-8 sm:space-y-12">
        {/* Visa Program Cards */}
        {visaPrograms.map((program, index) => (
          <VisaProgramCard key={program.program_name} program={program} index={index} />
        ))}

        {/* Additional Drivers Section */}
        {(destinationDrivers?.tax_benefits?.length ||
          destinationDrivers?.lifestyle_factors?.length ||
          destinationDrivers?.business_environment?.length) && (
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tax Benefits */}
            {destinationDrivers?.tax_benefits && destinationDrivers.tax_benefits.length > 0 && (
              <div className="relative rounded-xl border border-border/20 bg-card/50 p-6">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-4">Tax Benefits</p>
                  <div className="space-y-3">
                    {destinationDrivers.tax_benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-gold/60 mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground font-normal">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lifestyle Factors */}
            {destinationDrivers?.lifestyle_factors && destinationDrivers.lifestyle_factors.length > 0 && (
              <div className="relative rounded-xl border border-border/20 bg-card/50 p-6">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-4">Lifestyle</p>
                  <div className="space-y-3">
                    {destinationDrivers.lifestyle_factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-gold/60 mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground font-normal">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Business Environment */}
            {destinationDrivers?.business_environment && destinationDrivers.business_environment.length > 0 && (
              <div className="relative rounded-xl border border-border/20 bg-card/50 p-6">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-4">Business</p>
                  <div className="space-y-3">
                    {destinationDrivers.business_environment.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-gold/60 mt-1 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground font-normal">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Sourced from HNWI Chronicles KG Golden Visa Programs 2025 + Investment Migration Database
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
        </motion.div>
      </div>
    </div>
  );
}

export default GoldenVisaSection;
