// =============================================================================
// SFO PATTERN AUDIT PAGE
// Single-scroll layout: sticky sidebar preview, flowing form
// Form only — review lives at /decision-memo/review (separate route)
// =============================================================================

"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IntakePanel } from './IntakePanel';
import { PreviewPanel } from './PreviewPanel';
import {
  SFOPatternAuditIntake,
  AuditSession,
  IntakeSection
} from '@/lib/decision-memo/pattern-audit-types';

const STORAGE_KEY = 'hc-audit-intake';

// Default initial state
const DEFAULT_INTAKE: Partial<SFOPatternAuditIntake> = {
  email: '',
  nationality: '',
  ndaConsent: false,
  privacyConsent: false,
  thesis: {
    moveDescription: '',
    expectedOutcome: ''
  },
  constraints: {
    liquidityHorizon: '',
    liquidityEvents: [],
    currentJurisdictions: [],
    prohibitedJurisdictions: [],
    prohibitions: [],
    dealBreakers: []
  },
  controlAndRails: {
    finalDecisionMaker: '' as any,
    decisionMakersCount: 0,
    vetoHolders: [],
    advisors: [],
    existingEntities: [],
    bankingRails: [],
    hasFormalIPS: false
  },
  assetDetails: {
    estimatedValue: 0,
  },
  urgency: '' as any,
  format: undefined
};

export function PatternAuditPage() {
  const router = useRouter();

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [intake, setIntake] = useState<Partial<SFOPatternAuditIntake>>(() => {
    // Restore from localStorage if available (e.g. user navigated back from review)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return DEFAULT_INTAKE;
  });
  const [session] = useState<AuditSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-save to localStorage on intake change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(intake));
    } catch { /* ignore */ }
  }, [intake]);

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

  /** Update top-level fields (email, nationality, consents) */
  const handleTopLevelChange = useCallback((field: string, value: any) => {
    setIntake(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /** Navigate to review page — data persists via localStorage */
  const handleReviewSubmit = useCallback(() => {
    setError(null);
    router.push('/decision-memo/review');
  }, [router]);

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  const isValid = Boolean(
    intake.email &&
    intake.email.includes('@') &&
    intake.nationality &&
    intake.ndaConsent &&
    intake.privacyConsent &&
    intake.thesis?.moveDescription &&
    intake.thesis?.expectedOutcome &&
    intake.thesis.moveDescription.length >= 20 &&
    intake.thesis.expectedOutcome.length >= 10 &&
    intake.thesis?.moveType &&
    (intake.thesis?.targetLocations?.length || 0) > 0 &&
    intake.thesis?.timeline &&
    intake.thesis?.sourceJurisdiction &&
    intake.thesis?.destinationJurisdiction
  );

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">HC</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground tracking-tight">
              Decision Posture Audit
            </h1>
            <p className="text-xs text-muted-foreground tracking-wider uppercase">
              SFO Pattern Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Content: Form + Sticky Preview */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">
          {/* Left column: Form */}
          <div className="flex-1 min-w-0">
            <IntakePanel
              intake={intake}
              onChange={handleIntakeChange}
              onTopLevelChange={handleTopLevelChange}
              onSubmit={handleReviewSubmit}
              isSubmitting={false}
              isValid={isValid}
              error={error}
            />
          </div>

          {/* Right column: Sticky Preview (hidden on mobile) */}
          <div className="hidden lg:block w-[400px] shrink-0">
            <div className="sticky top-24">
              <PreviewPanel
                intake={intake}
                session={session}
                isSubmitting={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { STORAGE_KEY };
export default PatternAuditPage;
