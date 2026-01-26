// =============================================================================
// INTAKE PANEL
// Left side of split view - 3 collapsible input sections
// =============================================================================

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Loader2,
  Target,
  Lock,
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ThesisInput } from './ThesisInput';
import { ConstraintsInput } from './ConstraintsInput';
import { RailsInput } from './RailsInput';
import {
  SFOPatternAuditIntake,
  IntakeSection
} from '@/lib/decision-memo/pattern-audit-types';

interface IntakePanelProps {
  intake: Partial<SFOPatternAuditIntake>;
  onChange: (section: IntakeSection, data: any) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  error: string | null;
}

export function IntakePanel({
  intake,
  onChange,
  onSubmit,
  isSubmitting,
  isValid,
  error
}: IntakePanelProps) {
  const [expandedSection, setExpandedSection] = useState<1 | 2 | 3>(1);

  // Check completion status for each section
  const section1Complete = Boolean(
    intake.thesis?.moveDescription &&
    intake.thesis.moveDescription.length >= 20 &&
    intake.thesis?.expectedOutcome &&
    intake.thesis.expectedOutcome.length >= 10
  );
  const section2Complete = Boolean(
    intake.constraints?.liquidityHorizon &&
    (intake.constraints?.currentJurisdictions?.length || 0) > 0
  );
  const section3Complete = Boolean(intake.controlAndRails?.finalDecisionMaker);

  const allComplete = section1Complete && section2Complete && section3Complete;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">HC</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Decision Posture Audit
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">
              SFO Pattern Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
      </div>

      {/* Action Bar */}
      <div className="px-6 py-5 border-t border-border bg-card sticky bottom-0">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

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
              <span>Submitting Audit...</span>
            </>
          ) : (
            <>
              <span>Submit for Audit</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* SLA Info */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            24-hour SLA
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>1,875 pattern library</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
          <span>IC-ready output</span>
        </div>

        {/* Completion Progress */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[section1Complete, section2Complete, section3Complete].map((complete, i) => (
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

      {/* Section Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IntakePanel;
