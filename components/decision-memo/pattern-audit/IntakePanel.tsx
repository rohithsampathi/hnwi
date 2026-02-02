// =============================================================================
// INTAKE PANEL
// Flowing form — no sticky header/footer, everything scrolls with page
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Loader2,
  Target,
  Lock,
  Users,
  ArrowRight,
  Clock,
  Mail,
  Globe,
  FileCheck,
  Shield,
  Building
} from 'lucide-react';
import { ThesisInput } from './ThesisInput';
import { ConstraintsInput } from './ConstraintsInput';
import { RailsInput } from './RailsInput';
import { AssetDetailsInput } from './AssetDetailsInput';
import {
  SFOPatternAuditIntake,
  IntakeSection
} from '@/lib/decision-memo/pattern-audit-types';

interface IntakePanelProps {
  intake: Partial<SFOPatternAuditIntake>;
  onChange: (section: IntakeSection, data: any) => void;
  onTopLevelChange: (field: string, value: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  error: string | null;
}

export function IntakePanel({
  intake,
  onChange,
  onTopLevelChange,
  onSubmit,
  isSubmitting,
  isValid,
  error
}: IntakePanelProps) {
  const [expandedSection, setExpandedSection] = useState<1 | 2 | 3 | 4>(1);
  const [patternCount, setPatternCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/developments/counts')
      .then(res => res.json())
      .then(data => {
        const count = data.developments?.total_count || data.total || data.count || data.total_count;
        if (count) setPatternCount(count);
      })
      .catch(() => {});
  }, []);

  // Check completion status for each section
  const section1Complete = Boolean(
    intake.thesis?.moveDescription &&
    intake.thesis.moveDescription.length >= 20 &&
    intake.thesis?.expectedOutcome &&
    intake.thesis.expectedOutcome.length >= 10 &&
    intake.thesis?.moveType &&
    (intake.thesis?.targetLocations?.length || 0) > 0 &&
    intake.thesis?.timeline &&
    intake.thesis?.sourceJurisdiction &&
    intake.thesis?.destinationJurisdiction
  );
  const section2Complete = Boolean(
    intake.constraints?.liquidityHorizon &&
    (intake.constraints?.currentJurisdictions?.length || 0) > 0
  );
  const section3Complete = Boolean(intake.controlAndRails?.finalDecisionMaker);
  const section4Complete = Boolean(
    (intake.assetDetails?.estimatedValue || 0) > 0
  );

  return (
    <div className={`space-y-4 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}>

      {/* Identity Fields */}
      <div className="border rounded-xl border-border bg-card/50 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Contact & Identity</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email to receive final report & credentials *
            </label>
            <input
              type="email"
              placeholder="client@familyoffice.com"
              value={intake.email || ''}
              onChange={(e) => onTopLevelChange('email', e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Primary Benefactor Tax Jurisdiction *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. United States"
                value={intake.nationality || ''}
                onChange={(e) => onTopLevelChange('nationality', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Decision Thesis */}
      <CollapsibleSection
        number={1}
        title="Decision Thesis"
        subtitle="What move? What outcome?"
        icon={Target}
        isExpanded={expandedSection === 1}
        onToggle={() => setExpandedSection(1)}
        isComplete={section1Complete}
      >
        <ThesisInput
          value={intake.thesis}
          onChange={(data) => onChange('thesis', data)}
        />
      </CollapsibleSection>

      {/* Section 2: Constraints */}
      <CollapsibleSection
        number={2}
        title="Constraints"
        subtitle="What cannot change?"
        icon={Lock}
        isExpanded={expandedSection === 2}
        onToggle={() => setExpandedSection(2)}
        isComplete={section2Complete}
      >
        <ConstraintsInput
          value={intake.constraints}
          onChange={(data) => onChange('constraints', data)}
        />
      </CollapsibleSection>

      {/* Section 3: Control & Rails */}
      <CollapsibleSection
        number={3}
        title="Control & Rails"
        subtitle="Who decides? What exists?"
        icon={Users}
        isExpanded={expandedSection === 3}
        onToggle={() => setExpandedSection(3)}
        isComplete={section3Complete}
      >
        <RailsInput
          value={intake.controlAndRails}
          onChange={(data) => onChange('controlAndRails', data)}
        />
      </CollapsibleSection>

      {/* Section 4: Asset Details (optional) */}
      <CollapsibleSection
        number={4}
        title="Asset Details"
        subtitle="Specifics about the asset (optional)"
        icon={Building}
        isExpanded={expandedSection === 4}
        onToggle={() => setExpandedSection(4)}
        isComplete={section4Complete}
      >
        <AssetDetailsInput
          value={intake.assetDetails}
          onChange={(data) => onChange('assetDetails', data)}
          moveType={intake.thesis?.moveType}
        />
      </CollapsibleSection>

      {/* NDA & Privacy Consent — inline card */}
      <div className="border rounded-xl border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Engagement Terms</span>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={intake.ndaConsent || false}
            onChange={(e) => onTopLevelChange('ndaConsent', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
            <FileCheck className="w-3 h-3 inline mr-1 -mt-0.5" />
            I acknowledge this is a confidential engagement and agree to the <a href="/decision-memo/nda" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2 hover:text-primary/80" onClick={(e) => e.stopPropagation()}>Non-Disclosure Agreement</a>.
          </span>
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={intake.privacyConsent || false}
            onChange={(e) => onTopLevelChange('privacyConsent', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
            <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
            I consent to processing of the information provided under the <a href="/decision-memo/privacy" target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2 hover:text-primary/80" onClick={(e) => e.stopPropagation()}>Privacy &amp; Data Processing Policy</a>.
          </span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
        className={`
          w-full py-3.5 px-4 rounded-xl font-semibold
          flex items-center justify-center gap-2 transition-all
          ${isValid && !isSubmitting
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Preparing Review...</span>
          </>
        ) : (
          <>
            <span>Review & Proceed to Payment</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* SLA Info + Completion Progress */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            48-hour SLA
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>{patternCount ? patternCount.toLocaleString() : '...'} pattern library</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>IC-ready output</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[
            Boolean(intake.email),
            section1Complete,
            section2Complete,
            section3Complete,
            section4Complete
          ].map((complete, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${complete ? 'bg-primary' : 'bg-muted-foreground/30'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COLLAPSIBLE SECTION COMPONENT
// =============================================================================

interface CollapsibleSectionProps {
  number: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  number,
  title,
  subtitle,
  icon: Icon,
  isExpanded,
  onToggle,
  isComplete,
  children
}: CollapsibleSectionProps) {
  return (
    <div
      className={`
        border rounded-xl transition-all duration-200
        ${isExpanded
          ? 'border-primary/30 bg-card shadow-sm'
          : 'border-border bg-card/50 hover:border-border/80'
        }
      `}
    >
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              transition-all
              ${isComplete
                ? 'bg-primary text-primary-foreground'
                : isExpanded
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'bg-muted text-muted-foreground'
              }
            `}
          >
            {isComplete ? (
              <Check className="w-4 h-4" />
            ) : (
              number
            )}
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${isExpanded || isComplete ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className={`font-semibold ${isExpanded ? 'text-foreground' : 'text-foreground/80'}`}>
                {title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-primary' : 'text-muted-foreground'}`} />
        </motion.div>
      </button>

      {/* Section Content — always mounted to preserve form state */}
      <motion.div
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        initial={false}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-5 pt-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default IntakePanel;
