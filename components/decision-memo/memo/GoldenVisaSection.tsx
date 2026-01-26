// components/decision-memo/memo/GoldenVisaSection.tsx
// Golden Visa / Investment Migration Section - Premium institutional visualization

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
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
      isActive && !isLimited
        ? 'bg-primary/20 text-primary'
        : isLimited
        ? 'bg-muted text-muted-foreground'
        : 'bg-muted text-muted-foreground'
    }`}>
      {status}
    </span>
  );
}

// Single Visa Program Card
function VisaProgramCard({ program, index }: { program: VisaProgram; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground">{program.program_name}</h4>
            {program.investment_type && (
              <p className="text-xs text-muted-foreground">{program.investment_type}</p>
            )}
          </div>
        </div>
        <StatusBadge status={program.status} />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {/* Investment */}
        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Investment</p>
          </div>
          <p className="text-sm font-bold text-foreground">{program.minimum_investment}</p>
        </div>

        {/* Duration */}
        {program.duration && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Duration</p>
            </div>
            <p className="text-sm font-bold text-foreground">{program.duration}</p>
          </div>
        )}

        {/* Processing */}
        {program.processing_time && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Processing</p>
            </div>
            <p className="text-sm font-bold text-foreground">{program.processing_time}</p>
          </div>
        )}

        {/* Presence Required */}
        {program.physical_presence_required && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Plane className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Presence</p>
            </div>
            <p className="text-sm font-bold text-foreground">{program.physical_presence_required}</p>
          </div>
        )}
      </div>

      {/* Key Benefits */}
      {program.key_benefits && program.key_benefits.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Key Benefits</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {program.key_benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path to Citizenship */}
      {program.path_to_citizenship !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Path to Citizenship: {' '}
            <span className={`font-bold ${program.path_to_citizenship ? 'text-primary' : 'text-muted-foreground'}`}>
              {program.path_to_citizenship ? 'Yes' : 'No'}
            </span>
          </span>
        </div>
      )}

      {/* 2025 Changes Notice */}
      {program["2025_changes"] && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">2025/2026 Update</p>
              <p className="text-sm text-muted-foreground">{program["2025_changes"]}</p>
            </div>
          </div>
        </div>
      )}
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
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            INVESTMENT BENEFITS
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            Golden Visa
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          Investment migration programs available in {destinationJurisdiction || 'destination jurisdiction'}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Visa Program Cards */}
        {visaPrograms.map((program, index) => (
          <VisaProgramCard key={program.program_name} program={program} index={index} />
        ))}

        {/* Additional Drivers Section */}
        {(destinationDrivers?.tax_benefits?.length ||
          destinationDrivers?.lifestyle_factors?.length ||
          destinationDrivers?.business_environment?.length) && (
          <motion.div
            className="grid md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Tax Benefits */}
            {destinationDrivers?.tax_benefits && destinationDrivers.tax_benefits.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Tax Benefits</h4>
                </div>
                <div className="space-y-2">
                  {destinationDrivers.tax_benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lifestyle Factors */}
            {destinationDrivers?.lifestyle_factors && destinationDrivers.lifestyle_factors.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Lifestyle</h4>
                </div>
                <div className="space-y-2">
                  {destinationDrivers.lifestyle_factors.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Environment */}
            {destinationDrivers?.business_environment && destinationDrivers.business_environment.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Business</h4>
                </div>
                <div className="space-y-2">
                  {destinationDrivers.business_environment.map((factor, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Sourced from HNWI Chronicles KG Golden Visa Programs 2025 + Investment Migration Database
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default GoldenVisaSection;
