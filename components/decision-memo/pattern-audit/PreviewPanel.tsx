// =============================================================================
// PREVIEW PANEL — Reactive Intelligence Engine
// Sticky sidebar — reacts to intake form inputs in real-time
// Progressive unlock, completeness scoring, live input summary
// =============================================================================

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  AlertTriangle,
  TrendingUp,
  Shield,
  Lock,
  Globe,
  Users,
  Check,
  FileText,
  Building,
  Database,
  GitBranch,
  Layers
} from 'lucide-react';
import { AuditSession, SFOPatternAuditIntake } from '@/lib/decision-memo/pattern-audit-types';
import { AnalysisLoader } from './AnalysisLoader';

// =============================================================================
// TYPES
// =============================================================================

interface PreviewPanelProps {
  intake: Partial<SFOPatternAuditIntake>;
  session: AuditSession | null;
  isSubmitting: boolean;
}

interface ArtifactSectionDef {
  icon: React.ElementType;
  title: string;
  description: string;
  unlockThreshold: number;
}

interface EngineStatus {
  header: string;
  subtext: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ARTIFACT_SECTIONS: ArtifactSectionDef[] = [
  { icon: Scale, title: 'Executive Verdict & Risk Profile', description: 'Allocation recommendation + multi-dimensional risk assessment', unlockThreshold: 35 },
  { icon: Shield, title: 'Regulatory Exposure Analysis', description: 'Tax treatment, FBAR/FATCA triggers, compliance calendar', unlockThreshold: 35 },
  { icon: Building, title: 'Structure Optimization', description: 'Ownership structures analyzed + alternative corridors', unlockThreshold: 45 },
  { icon: Database, title: 'Precedent Intelligence Match', description: 'Pattern-matched against 750+ analyzed precedents', unlockThreshold: 45 },
  { icon: TrendingUp, title: '10-Year Wealth Projection', description: 'Multi-scenario probability-weighted trajectory', unlockThreshold: 55 },
  { icon: AlertTriangle, title: 'Crisis Stress Test', description: 'Economic scenario resilience + antifragile opportunity', unlockThreshold: 55 },
  { icon: Globe, title: 'Market Intelligence & Peer Analysis', description: 'HNWI migration corridors + geographic opportunities', unlockThreshold: 55 },
  { icon: GitBranch, title: 'Decision Scenario Tree', description: 'Game theory pathways + decision gates', unlockThreshold: 60 },
  { icon: Layers, title: 'Real Asset Audit Intelligence', description: 'Stamp duty, tax strategies, trust structures', unlockThreshold: 60 },
  { icon: Users, title: 'Heir Management & Succession', description: '3rd generation protection + wealth transfer plan', unlockThreshold: 60 },
];

const ENGINE_STATUSES: { min: number; max: number; status: EngineStatus }[] = [
  { min: 0, max: 0, status: { header: 'Awaiting Input', subtext: 'Start filling in your decision parameters' } },
  { min: 1, max: 15, status: { header: 'Identity Received', subtext: 'Continue with your decision thesis' } },
  { min: 16, max: 35, status: { header: 'Analyzing Thesis', subtext: 'Extracting jurisdiction signals...' } },
  { min: 36, max: 50, status: { header: 'Mapping Constraints', subtext: 'Building your risk boundaries...' } },
  { min: 51, max: 60, status: { header: 'Processing Governance', subtext: 'Control structure received' } },
  { min: 61, max: 80, status: { header: 'Matching Patterns', subtext: 'Scanning development patterns...' } },
  { min: 81, max: 99, status: { header: 'Ready for Submission', subtext: 'High-confidence analysis possible' } },
  { min: 100, max: 100, status: { header: 'Maximum Depth', subtext: 'All parameters received' } },
];

// =============================================================================
// SCORING ENGINE
// =============================================================================

function computeSignalStrength(intake: Partial<SFOPatternAuditIntake>): number {
  let score = 0;

  // Identity (10 points)
  if (intake.email && intake.email.includes('@')) score += 5;
  if (intake.nationality && intake.nationality.length > 0) score += 5;

  // Thesis Core (25 points)
  if (intake.thesis?.moveDescription && intake.thesis.moveDescription.length >= 20) score += 15;
  if (intake.thesis?.expectedOutcome && intake.thesis.expectedOutcome.length >= 10) score += 10;

  // Thesis Enrichment (10 points)
  const thesisOptional = [
    intake.thesis?.moveType,
    (intake.thesis?.targetLocations?.length || 0) > 0 ? true : undefined,
    intake.thesis?.timeline,
    intake.thesis?.sourceJurisdiction,
    intake.thesis?.destinationJurisdiction,
  ];
  score += Math.round((thesisOptional.filter(Boolean).length / 5) * 10);

  // Constraints Core (15 points)
  if (intake.constraints?.liquidityHorizon) score += 7.5;
  if ((intake.constraints?.currentJurisdictions?.length || 0) > 0) score += 7.5;

  // Constraints Depth (10 points)
  const constraintOptional = [
    (intake.constraints?.liquidityEvents?.length || 0) > 0 ? true : undefined,
    (intake.constraints?.prohibitions?.length || 0) > 0 ? true : undefined,
    (intake.constraints?.dealBreakers?.length || 0) > 0 ? true : undefined,
    (intake.constraints?.prohibitedJurisdictions?.length || 0) > 0 ? true : undefined,
    intake.constraints?.purchaseVehicle,
    intake.constraints?.destinationPropertyCount != null ? true : undefined,
  ];
  score += Math.round((constraintOptional.filter(Boolean).length / 6) * 10);

  // Control Core (10 points)
  if (intake.controlAndRails?.finalDecisionMaker) score += 10;

  // Control Depth (10 points)
  const controlOptional = [
    (intake.controlAndRails?.advisors?.length || 0) > 0 ? true : undefined,
    (intake.controlAndRails?.existingEntities?.length || 0) > 0 ? true : undefined,
    (intake.controlAndRails?.bankingRails?.length || 0) > 0 ? true : undefined,
    intake.controlAndRails?.hasFormalIPS ? true : undefined,
    (intake.controlAndRails?.heirs?.length || 0) > 0 ? true : undefined,
  ];
  score += controlOptional.filter(Boolean).length * 2;

  // Asset Details (10 points)
  const ad = intake.assetDetails;
  const assetOptional = [
    // Has a value
    (ad?.estimatedValue || 0) > 0 ? true : undefined,
    // Has a type/category field
    ad?.propertyType || ad?.artCategory || ad?.jewelleryType ||
    ad?.metalType || ad?.collectibleCategory || ad?.vehicleType || undefined,
    // Has detail (location, artist, brand, make, description, weight)
    ad?.locationPreference || ad?.artist || ad?.brand ||
    ad?.makeModel || ad?.description || ad?.weight || ad?.primaryMaterial || undefined,
    // Has condition/provenance/certification/storage
    ad?.condition || ad?.provenance || ad?.certification || ad?.storageMethod || undefined,
    // Has metrics (yield, appreciation, year, mileage, etc.)
    (ad?.rentalYieldPct || 0) > 0 ? true :
    (ad?.appreciationPct || 0) > 0 ? true :
    (ad?.year || 0) > 0 ? true :
    ad?.mileage ? true : undefined,
  ];
  score += assetOptional.filter(Boolean).length * 2;

  return Math.min(Math.round(score), 100);
}

function getEngineStatus(signal: number): EngineStatus {
  for (const entry of ENGINE_STATUSES) {
    if (signal >= entry.min && signal <= entry.max) return entry.status;
  }
  return ENGINE_STATUSES[0].status;
}

function getUnlockedIndices(signal: number): Set<number> {
  const set = new Set<number>();
  ARTIFACT_SECTIONS.forEach((section, i) => {
    if (signal >= section.unlockThreshold) set.add(i);
  });
  return set;
}

// =============================================================================
// LIVE INPUT SUMMARY DERIVATION
// =============================================================================

interface LiveSummary {
  jurisdictions: number;
  constraints: number;
  advisors: number;
  entities: number;
}

function deriveSummary(intake: Partial<SFOPatternAuditIntake>): LiveSummary {
  const jurisdictions = new Set<string>();
  intake.constraints?.currentJurisdictions?.forEach(j => jurisdictions.add(j));
  intake.constraints?.prohibitedJurisdictions?.forEach(j => jurisdictions.add(j));
  if (intake.thesis?.sourceJurisdiction) jurisdictions.add(intake.thesis.sourceJurisdiction);
  if (intake.thesis?.destinationJurisdiction) jurisdictions.add(intake.thesis.destinationJurisdiction);
  intake.controlAndRails?.advisors?.forEach(a => { if (a.jurisdiction) jurisdictions.add(a.jurisdiction); });
  intake.controlAndRails?.existingEntities?.forEach(e => { if (e.jurisdiction) jurisdictions.add(e.jurisdiction); });
  intake.controlAndRails?.bankingRails?.forEach(b => { if (b.jurisdiction) jurisdictions.add(b.jurisdiction); });

  const constraints =
    (intake.constraints?.prohibitions?.length || 0) +
    (intake.constraints?.dealBreakers?.length || 0) +
    (intake.constraints?.liquidityEvents?.length || 0);

  const advisors = intake.controlAndRails?.advisors?.length || 0;
  const entities = intake.controlAndRails?.existingEntities?.length || 0;

  return { jurisdictions: jurisdictions.size, constraints, advisors, entities };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PreviewPanel({ intake, session, isSubmitting }: PreviewPanelProps) {
  if (isSubmitting) {
    return <AnalysisLoader />;
  }
  return <EngineConfigPanel intake={intake} />;
}

function EngineConfigPanel({ intake }: { intake: Partial<SFOPatternAuditIntake> }) {
  const signalStrength = useMemo(() => computeSignalStrength(intake), [intake]);
  const engineStatus = useMemo(() => getEngineStatus(signalStrength), [signalStrength]);
  const unlockedIndices = useMemo(() => getUnlockedIndices(signalStrength), [signalStrength]);
  const summary = useMemo(() => deriveSummary(intake), [intake]);

  // Track newly unlocked sections for sweep animation
  const prevUnlockedRef = useRef<Set<number>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fresh = new Set<number>();
    unlockedIndices.forEach(idx => {
      if (!prevUnlockedRef.current.has(idx)) fresh.add(idx);
    });
    if (fresh.size > 0) {
      setNewlyUnlocked(fresh);
      const timeout = setTimeout(() => setNewlyUnlocked(new Set()), 700);
      prevUnlockedRef.current = new Set(unlockedIndices);
      return () => clearTimeout(timeout);
    }
    prevUnlockedRef.current = new Set(unlockedIndices);
  }, [unlockedIndices]);

  // Typing detection
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const intakeStringRef = useRef('');

  useEffect(() => {
    const s = JSON.stringify(intake);
    if (s !== intakeStringRef.current) {
      intakeStringRef.current = s;
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1500);
    }
    return () => clearTimeout(typingTimeoutRef.current);
  }, [intake]);

  return (
    <div className="space-y-4">

      {/* Header + Completeness Ring */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Your IC Artifact
            </h2>
            <p className="text-xs text-muted-foreground">
              Decision Posture Audit
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <SignalStrengthArc value={signalStrength} isActive={isTyping || signalStrength > 0} />

          <div className="mt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={engineStatus.header}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <h3 className="font-semibold text-foreground text-sm">
                  {engineStatus.header}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {engineStatus.subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            {signalStrength > 0 && signalStrength < 100 && (
              <div className="flex justify-center gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-primary/50"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Input Summary — plain language */}
      {signalStrength > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-2 gap-2"
        >
          <SummaryTile icon={Globe} label="Jurisdictions" value={summary.jurisdictions} />
          <SummaryTile icon={Shield} label="Risk Constraints" value={summary.constraints} />
          <SummaryTile icon={Users} label="Advisors" value={summary.advisors} />
          <SummaryTile icon={FileText} label="Entities" value={summary.entities} />
        </motion.div>
      )}

      {/* Artifact Sections — What You'll Receive */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              What You'll Receive
            </span>
            <span className="text-xs text-muted-foreground">
              {unlockedIndices.size}/{ARTIFACT_SECTIONS.length}
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {ARTIFACT_SECTIONS.map((section, i) => (
            <ArtifactSection
              key={i}
              index={i + 1}
              section={section}
              isUnlocked={unlockedIndices.has(i)}
              isNewlyUnlocked={newlyUnlocked.has(i)}
            />
          ))}
        </div>
      </div>

      {/* Footer: Progress bar only */}
      <div className="space-y-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${signalStrength}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SIGNAL STRENGTH ARC
// =============================================================================

function SignalStrengthArc({ value, isActive }: { value: number; isActive: boolean }) {
  const circumference = 2 * Math.PI * 46;

  return (
    <div className="relative" style={{ width: 110, height: 110 }}>
      {/* Background behind center */}
      <div
        className="absolute rounded-full bg-background"
        style={{ left: 12, top: 12, width: 86, height: 86 }}
      />

      {/* Inner circle */}
      <div
        className="absolute rounded-full bg-card flex items-center justify-center"
        style={{
          left: 12, top: 12, width: 86, height: 86,
          boxShadow: '0 2px 12px hsl(var(--primary) / 0.06)',
        }}
      >
        <div className="text-center">
          <motion.span
            key={value}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-2xl font-bold text-foreground block leading-none"
          >
            {value}
          </motion.span>
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5 block">
            Complete
          </span>
        </div>
      </div>

      {/* SVG arcs */}
      <svg className="absolute inset-0" width="110" height="110" viewBox="0 0 110 110">
        <circle
          cx="55" cy="55" r="46"
          fill="none"
          stroke="hsl(var(--primary) / 0.08)"
          strokeWidth="2.5"
        />
        <motion.circle
          cx="55" cy="55" r="46"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>

      {/* Orbiting dot */}
      {isActive && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              left: '50%', top: 2,
              width: 5, height: 5, marginLeft: -2.5,
              backgroundColor: 'hsl(var(--primary))',
              boxShadow: '0 0 6px 1px hsl(var(--primary) / 0.4)',
            }}
          />
        </motion.div>
      )}

      {/* Orbit track */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 3, top: 3, width: 104, height: 104,
          borderRadius: '50%',
          border: '1px solid hsl(var(--primary) / 0.06)',
        }}
      />
    </div>
  );
}

// =============================================================================
// SUMMARY TILE — simple metric with icon
// =============================================================================

function SummaryTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-foreground block leading-none"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

// =============================================================================
// ARTIFACT SECTION
// =============================================================================

function ArtifactSection({
  index,
  section,
  isUnlocked,
  isNewlyUnlocked,
}: {
  index: number;
  section: ArtifactSectionDef;
  isUnlocked: boolean;
  isNewlyUnlocked: boolean;
}) {
  const Icon = section.icon;

  return (
    <div
      className={`relative px-4 py-3 flex items-center gap-2.5 transition-all duration-300 ${
        isUnlocked ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {/* Sweep animation */}
      {isNewlyUnlocked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent pointer-events-none"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Number/Check */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 ${
        isUnlocked
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
      }`}>
        {isUnlocked ? <Check className="w-3 h-3" /> : index}
      </div>

      {/* Icon + Text */}
      <Icon className={`w-3.5 h-3.5 shrink-0 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-xs leading-tight ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
          {section.title}
        </h4>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {section.description}
        </p>
      </div>

      {!isUnlocked && <Lock className="w-3 h-3 text-muted-foreground/50 shrink-0" />}
    </div>
  );
}

export default PreviewPanel;
