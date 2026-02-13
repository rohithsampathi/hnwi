// =============================================================================
// FULL ARTIFACT DISPLAY - Premium UHNWI Standard
// Goldman/McKinsey tier aesthetic - Full IC-ready artifact after payment
// =============================================================================

"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Target,
  Clock,
  FileText,
  AlertOctagon,
  Layers,
  Zap,
  User
} from 'lucide-react';
import { ICArtifact } from '@/lib/decision-memo/pattern-audit-types';

interface ArtifactDisplayProps {
  artifact: ICArtifact;
}

// =============================================================================
// SECTION HEADER - Premium institutional style
// =============================================================================
function SectionHeader({
  number,
  title,
  subtitle
}: {
  number: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-sm font-bold text-primary-foreground">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-wide">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function ArtifactDisplay({ artifact }: ArtifactDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Verdict configuration with premium colors
  const verdictConfig = {
    'PROCEED': {
      icon: CheckCircle,
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-500',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      glowColor: 'shadow-emerald-500/20'
    },
    'PROCEED WITH MODIFICATIONS': {
      icon: AlertTriangle,
      gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-500',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      glowColor: 'shadow-amber-500/20'
    },
    'DO NOT PROCEED': {
      icon: XCircle,
      gradient: 'from-red-500/15 via-red-500/5 to-transparent',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-500',
      badgeBg: 'bg-gradient-to-r from-red-500 to-red-600',
      glowColor: 'shadow-red-500/20'
    }
  }[artifact.verdict.verdict] || {
    icon: AlertTriangle,
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-500',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    glowColor: 'shadow-amber-500/20'
  };

  const VerdictIcon = verdictConfig.icon;

  return (
    <div ref={sectionRef} className="space-y-12" id="artifact-content">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO HEADER - Premium Document Banner
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-primary/5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-32 h-32 border border-primary/10 rounded-full" />
        <div className="absolute top-8 right-8 w-24 h-24 border border-primary/10 rounded-full" />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
              IC-Ready Artifact
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-tight mb-6">
            {artifact.thesisSummary}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border border-border/50">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs">{artifact.intakeId?.slice(0, 16).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <span>{new Date(artifact.generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-primary/50 to-transparent" />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: EXECUTIVE VERDICT
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionHeader number={1} title="Executive Verdict" />

        <div className={`relative overflow-hidden bg-gradient-to-br ${verdictConfig.gradient} border-2 ${verdictConfig.borderColor} rounded-2xl p-6 sm:p-8 shadow-xl ${verdictConfig.glowColor}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent" />

          <div className="relative flex items-start gap-5">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${verdictConfig.badgeBg} flex items-center justify-center flex-shrink-0 shadow-lg ${verdictConfig.glowColor}`}>
              <VerdictIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 ${verdictConfig.badgeBg} text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg`}>
                  {artifact.verdict.verdict}
                </span>
              </div>

              <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium">
                {artifact.verdict.singleSentence}
              </p>
            </div>
          </div>
        </div>

        {artifact.whyThisMatters && (
          <motion.div
            className="mt-6 relative overflow-hidden p-6 bg-gradient-to-r from-muted/50 via-card to-muted/30 rounded-2xl border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-primary/20 rounded-full" />
            <div className="pl-5">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-3">
                Strategic Implication
              </p>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {artifact.whyThisMatters}
              </p>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: SEQUENCE CORRECTION - FULL
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <SectionHeader
          number={2}
          title="Sequence Correction"
          subtitle="Optimal execution order with dependency mapping"
        />

        <div className="space-y-4">
          {artifact.sequence.map((step, i) => (
            <motion.div
              key={step.order}
              initial={{ opacity: 0, x: -20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="relative overflow-hidden p-5 bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl hover:border-primary/30 transition-colors"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30" />

              <div className="flex gap-4 pl-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg shadow-primary/30">
                  {step.order}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-base mb-2">{step.action}</p>
                  <div className="flex flex-wrap gap-3 text-xs mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="text-muted-foreground">{step.owner}</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span className="text-muted-foreground">{step.timeline}</span>
                    </span>
                  </div>
                  <p className="text-xs text-primary flex items-center gap-1.5 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                    {step.whyThisOrder}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: FAILURE MODES - FULL
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionHeader
          number={3}
          title="Failure Modes"
          subtitle="Critical risk triggers with mitigation strategies"
        />

        <div className="space-y-4">
          {artifact.failureModes.map((mode, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="relative overflow-hidden p-5 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <AlertOctagon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Mode {i + 1}: {mode.trigger}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Critical
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-card/50 rounded-xl border border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Mechanism</p>
                    <p className="text-foreground">{mode.mechanism}</p>
                  </div>
                  <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Damage</p>
                    <p className="text-red-600 dark:text-red-400 font-medium">{mode.damage}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Mitigation</p>
                    <p className="text-foreground">{mode.mitigation}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: PATTERN ANCHORS - FULL
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <SectionHeader
          number={4}
          title="Pattern Anchors"
          subtitle="Historical corridor signals matched to your strategy"
        />

        <div className="space-y-4">
          {artifact.patternAnchors.map((anchor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="relative overflow-hidden p-5 bg-gradient-to-br from-primary/5 via-card to-primary/5 border border-primary/20 rounded-2xl"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

              <div className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{anchor.patternName}</p>
                    <span className="px-2.5 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-lg">
                      {anchor.patternClass}
                    </span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    anchor.confidence === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                    anchor.confidence === 'HIGH' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                    anchor.confidence === 'MEDIUM' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {anchor.confidence}
                  </span>
                </div>

                <div className="p-4 bg-card/50 rounded-xl border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Historical Behavior</p>
                  <p className="text-sm text-foreground leading-relaxed">{anchor.historicalBehavior}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: ACTIONABLE NEXT STEP - FULL
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <SectionHeader
          number={5}
          title="Actionable Next Step"
          subtitle="Your immediate priority action"
        />

        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-2xl shadow-xl shadow-primary/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

          <div className="relative">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-2">Priority Action</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{artifact.nextStep.action}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-card/80 rounded-xl border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Executor</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{artifact.nextStep.executor}</span>
                </div>
              </div>
              <div className="p-4 bg-card/80 rounded-xl border border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Timeline</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{artifact.nextStep.timeline}</span>
                </div>
              </div>
              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Unlocks</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-foreground">{artifact.nextStep.unlocks}</span>
                </div>
              </div>
              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">If Blocked</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-foreground">{artifact.nextStep.ifBlocked}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: SCOPE BOUNDARY
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <SectionHeader number={6} title="Scope Boundary" subtitle="What this analysis covers" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] mb-4">In Scope</p>
            <ul className="space-y-3">
              {artifact.scope.inScope.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden p-5 bg-muted/30 border border-border rounded-2xl">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">Out of Scope</p>
            <ul className="space-y-3">
              {artifact.scope.outOfScope.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 pl-1">
          <span className="text-foreground font-medium">Valid Until:</span> {artifact.scope.validUntil || '90 days from generation'}
        </p>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 07 - Return Scenarios (SOTA)
          ═══════════════════════════════════════════════════════════════════ */}
      {artifact.returnScenarios && (
        <motion.section
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <SectionHeader number={7} title="Return Scenarios" subtitle="Base / Bull / Bear Analysis" />

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Base Case */}
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
              <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.15em] mb-2">Base Case</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                {artifact.returnScenarios.baseCase.annualReturnPct || '8-12%'}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {Math.round((artifact.returnScenarios.baseCase.probability || 0.6) * 100)}% probability
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Value: {artifact.returnScenarios.baseCase.totalValueCreation}</p>
                <p>Exit: {artifact.returnScenarios.baseCase.exitTimeline}</p>
              </div>
            </div>

            {/* Bull Case */}
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.15em] mb-2">Bull Case</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                {artifact.returnScenarios.bullCase.annualReturnPct || '15-20%'}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {Math.round((artifact.returnScenarios.bullCase.probability || 0.25) * 100)}% probability
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Value: {artifact.returnScenarios.bullCase.totalValueCreation}</p>
                <p>Exit: {artifact.returnScenarios.bullCase.exitTimeline}</p>
              </div>
            </div>

            {/* Bear Case */}
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
              <p className="text-xs font-bold text-red-400 uppercase tracking-[0.15em] mb-2">Bear Case</p>
              <p className="text-2xl font-bold text-foreground mb-1">
                {artifact.returnScenarios.bearCase.annualReturnPct || '3-5%'}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {Math.round((artifact.returnScenarios.bearCase.probability || 0.15) * 100)}% probability
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Value: {artifact.returnScenarios.bearCase.totalValueCreation}</p>
                <p>Haircut: {artifact.returnScenarios.bearCase.exitHaircut || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Expected Value</p>
              <p className="text-xl font-bold text-primary">{artifact.returnScenarios.expectedValue}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Risk/Reward</p>
              <p className="text-sm text-foreground">{artifact.returnScenarios.riskRewardAssessment}</p>
            </div>
          </div>

          {artifact.returnScenarios.keySensitivities && artifact.returnScenarios.keySensitivities.length > 0 && (
            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.15em] mb-3">Key Sensitivities</p>
              <ul className="space-y-2">
                {artifact.returnScenarios.keySensitivities.slice(0, 4).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 08 - Implied IPS (SOTA)
          ═══════════════════════════════════════════════════════════════════ */}
      {artifact.impliedIps && (
        <motion.section
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <SectionHeader number={8} title="Implied Investment Policy" subtitle="Inferred from intake responses" />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Primary Objective</p>
              <p className="text-sm font-medium text-foreground">{artifact.impliedIps.primaryObjective}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2">Risk Tolerance</p>
              <p className="text-sm font-medium text-foreground">{artifact.impliedIps.riskTolerance}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-muted/30 border border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground mb-1">Liquidity Horizon</p>
              <p className="text-sm font-medium text-foreground">{artifact.impliedIps.liquidityHorizon}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground mb-1">Investment Horizon</p>
              <p className="text-sm font-medium text-foreground">{artifact.impliedIps.investmentHorizon}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-border rounded-xl text-center">
              <p className="text-xs text-muted-foreground mb-1">Decision Authority</p>
              <p className="text-sm font-medium text-foreground">{artifact.impliedIps.decisionAuthority}</p>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">IPS Confidence</p>
              <p className="text-sm font-medium text-primary">{Math.round((artifact.impliedIps.confidenceScore || 0) * 100)}%</p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                style={{ width: `${(artifact.impliedIps.confidenceScore || 0) * 100}%` }}
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 09 - DD Checklist (SOTA)
          ═══════════════════════════════════════════════════════════════════ */}
      {artifact.ddChecklist && artifact.ddChecklist.items && artifact.ddChecklist.items.length > 0 && (
        <motion.section
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <SectionHeader number={9} title="Due Diligence Checklist" subtitle={`${artifact.ddChecklist.totalItems} items across ${artifact.ddChecklist.jurisdictionsCovered?.length || 1} jurisdictions`} />

          <div className="space-y-3">
            {artifact.ddChecklist.items.slice(0, 10).map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  item.priority === 'high'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.category === 'Legal' ? 'bg-purple-500/20 text-purple-400' :
                        item.category === 'Tax' ? 'bg-blue-500/20 text-blue-400' :
                        item.category === 'Market' ? 'bg-green-500/20 text-green-400' :
                        item.category === 'Financing' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.category}
                      </span>
                      {item.priority === 'high' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{item.item}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'complete' ? 'bg-emerald-500/20' :
                    item.status === 'in_progress' ? 'bg-amber-500/20' :
                    'bg-muted'
                  }`}>
                    {item.status === 'complete' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    {item.status === 'in_progress' && <Clock className="w-3 h-3 text-amber-400" />}
                    {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                </div>
              </div>
            ))}
            {artifact.ddChecklist.items.length > 10 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                + {artifact.ddChecklist.items.length - 10} more items
              </p>
            )}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 10 - Alternatives Considered (SOTA)
          ═══════════════════════════════════════════════════════════════════ */}
      {artifact.alternativesConsidered && artifact.alternativesConsidered.length > 0 && (
        <motion.section
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <SectionHeader number={10} title="Alternatives Considered" subtitle="Why not other options" />

          <div className="space-y-4">
            {artifact.alternativesConsidered.map((alt, i) => (
              <div key={i} className="p-4 bg-muted/30 border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">{alt.alternative}</p>
                    <p className="text-xs text-muted-foreground">{alt.whyNotSelected}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER - Intelligence Sources
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-muted/50 via-card to-muted/30 border border-border rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">HNWI Chronicles Intelligence</p>
            <p className="text-xs text-muted-foreground">Pattern Analysis Division</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-2xl font-bold text-primary">
              {artifact.intelligenceSources.developmentsMatched}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Developments</p>
          </div>
          <div className="text-center p-4 bg-card/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">
              {artifact.intelligenceSources.failurePatternsMatched}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Patterns</p>
          </div>
          <div className="text-center p-4 bg-card/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">
              {artifact.intelligenceSources.sequencingRulesApplied}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Rules</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ArtifactDisplay;
