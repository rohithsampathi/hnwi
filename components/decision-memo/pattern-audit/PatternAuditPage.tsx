// =============================================================================
// SFO PATTERN AUDIT PAGE
// Split view: Left = 3 Inputs, Right = Preview/Status
// Submits intake → Redirects to audit preview page
// =============================================================================

"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IntakePanel } from './IntakePanel';
import { PreviewPanel } from './PreviewPanel';
import { usePatternAudit } from '@/lib/hooks/usePatternAudit';
import {
  SFOPatternAuditIntake,
  AuditSession,
  IntakeSection
} from '@/lib/decision-memo/pattern-audit-types';

// Default initial state
const DEFAULT_INTAKE: Partial<SFOPatternAuditIntake> = {
  thesis: {
    moveDescription: '',
    expectedOutcome: ''
  },
  constraints: {
    liquidityHorizon: '12+ months',
    liquidityEvents: [],
    currentJurisdictions: [],
    prohibitedJurisdictions: [],
    prohibitions: [],
    dealBreakers: []
  },
  controlAndRails: {
    finalDecisionMaker: 'principal',
    decisionMakersCount: 1,
    vetoHolders: [],
    advisors: [],
    existingEntities: [],
    bankingRails: [],
    hasFormalIPS: false
  },
  urgency: 'standard'
};

export function PatternAuditPage() {
  const router = useRouter();

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [intake, setIntake] = useState<Partial<SFOPatternAuditIntake>>(DEFAULT_INTAKE);
  const [session, setSession] = useState<AuditSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent double submission (guards against React strict mode and fast clicks)
  const hasSubmittedRef = useRef(false);
  const submittedIntakeIdRef = useRef<string | null>(null);

  const { submitIntake } = usePatternAudit();

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleIntakeChange = useCallback((
    section: IntakeSection,
    data: any
  ) => {
    setIntake(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Guard against double submission
    if (hasSubmittedRef.current) {
      console.log('⏭️ [PatternAuditPage] Already submitted, skipping duplicate');
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit intake to backend - returns { session, preview }
      const { session: newSession } = await submitIntake(intake as SFOPatternAuditIntake);
      setSession(newSession);

      // Track the submitted intake ID
      submittedIntakeIdRef.current = newSession.intakeId;

      // Redirect to the audit preview page
      router.push(`/decision-memo/audit/${newSession.intakeId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit audit request');
      setIsSubmitting(false);
      // Reset ref on error to allow retry
      hasSubmittedRef.current = false;
    }
  }, [intake, submitIntake, router]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const isValid = Boolean(
    intake.thesis?.moveDescription &&
    intake.thesis?.expectedOutcome &&
    intake.thesis.moveDescription.length >= 20 &&
    intake.thesis.expectedOutcome.length >= 10
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel: Intake */}
      <div className="w-full lg:w-1/2 border-r border-border overflow-y-auto">
        <IntakePanel
          intake={intake}
          onChange={handleIntakeChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isValid={isValid}
          error={error}
        />
      </div>

      {/* Right Panel: Preview (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 overflow-y-auto bg-muted/30">
        <PreviewPanel
          session={session}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default PatternAuditPage;
