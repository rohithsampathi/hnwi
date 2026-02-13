// =============================================================================
// PREVIEW ARTIFACT DISPLAY - Premium UHNWI Standard
// Goldman/McKinsey tier aesthetic with partial reveals
// =============================================================================

"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Shield,
  Target,
  Clock,
  FileText,
  AlertOctagon,
  Layers,
  Zap
} from 'lucide-react';
import { PreviewArtifact } from '@/lib/decision-memo/pattern-audit-types';

interface PreviewArtifactDisplayProps {
  preview: PreviewArtifact;
}

// =============================================================================
// SECTION HEADER - Premium institutional style
// =============================================================================
function SectionHeader({
  number,
  title,
  subtitle,
  locked = false
}: {
  number: number;
  title: string;
  subtitle?: string;
  locked?: boolean;
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
        {locked && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-full">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Premium
            </span>
          </div>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
    </div>
  );
}

// =============================================================================
// LOCKED CONTENT INDICATOR - Premium glass card
// =============================================================================
function LockedContent({ message }: { message: string }) {
  return (
    <motion.div
      className="relative overflow-hidden p-5 bg-gradient-to-br from-primary/5 via-card to-primary/5 border border-primary/20 rounded-2xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm mb-0.5">Unlock Complete Analysis</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-primary/50" />
      </div>
    </motion.div>
  );
}

// =============================================================================
// STAT CARD - Premium metric display
// =============================================================================
function StatCard({
  value,
  label,
  highlight = false,
  icon: Icon
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
  icon?: React.ElementType;
}) {
  return (
    <div className={`
      relative overflow-hidden p-4 rounded-xl border transition-all
      ${highlight
        ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg shadow-primary/10'
        : 'bg-card/50 border-border hover:border-primary/20'}
    `}>
      {highlight && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      )}
      <div className="relative flex items-center gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-primary/20' : 'bg-muted'}`}>
            <Icon className={`w-4 h-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        )}
        <div>
          <p className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function PreviewArtifactDisplay({ preview }: PreviewArtifactDisplayProps) {
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
  }[preview.verdict.verdict] || {
    icon: AlertTriangle,
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-500',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
    glowColor: 'shadow-amber-500/20'
  };

  const VerdictIcon = verdictConfig.icon;

  // Extract preview data
  const sequenceSteps = preview.sequencePreview?.total_steps || 4;
  const firstStep = preview.sequencePreview?.first_step || 'Execute primary commitment';
  const failureTriggers = preview.failureModesPreview?.triggers || [];
  const patternNames = preview.patternAnchorsPreview?.pattern_names || [];
  const nextStepHeadline = preview.nextStepPreview?.action_headline || 'Schedule initial consultation';
  const nextStepTimeline = preview.nextStepPreview?.timeline || '7-14 days';

  return (
    <div ref={sectionRef} className="space-y-12" id="preview-content">
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
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Decision Posture Audit
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-4" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-tight mb-6">
            {preview.thesisSummary}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border border-border/50">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs">{preview.intakeId.slice(0, 16).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/50 rounded-lg border border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <span>{new Date(preview.generatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: EXECUTIVE VERDICT - FULLY VISIBLE
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SectionHeader number={1} title="Executive Verdict" />

        <div className={`relative overflow-hidden bg-gradient-to-br ${verdictConfig.gradient} border-2 ${verdictConfig.borderColor} rounded-2xl p-6 sm:p-8 shadow-xl ${verdictConfig.glowColor}`}>
          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent" />

          <div className="relative flex items-start gap-5">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${verdictConfig.badgeBg} flex items-center justify-center flex-shrink-0 shadow-lg ${verdictConfig.glowColor}`}>
              <VerdictIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 ${verdictConfig.badgeBg} text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg`}>
                  {preview.verdict.verdict}
                </span>
              </div>

              <p className="text-lg sm:text-xl text-foreground leading-relaxed font-medium">
                {preview.verdict.singleSentence}
              </p>
            </div>
          </div>
        </div>

        {preview.whyThisMatters && (
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
                {preview.whyThisMatters}
              </p>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: SEQUENCE CORRECTION - PARTIAL PREVIEW
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
          locked
        />

        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={sequenceSteps} label="Total Steps" highlight icon={Layers} />
            <StatCard value="45" label="Days Est." icon={Clock} />
            <StatCard value="4" label="Stakeholders" icon={Shield} />
          </div>

          {/* First step card */}
          <div className="relative overflow-hidden p-5 bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30" />

            <div className="flex items-center gap-2 mb-4 pl-4">
              <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-md shadow-md">
                STEP 1
              </span>
              <span className="text-xs text-primary font-medium">Priority Action</span>
            </div>

            <div className="flex gap-4 pl-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg shadow-primary/30">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-base mb-2">{firstStep}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">Principal</span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">7-14 days</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <LockedContent message={`See all ${sequenceSteps} steps with dependencies, timelines, and owner assignments`} />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: FAILURE MODES - PARTIAL PREVIEW
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionHeader
          number={3}
          title="Failure Modes"
          subtitle="Critical risk triggers identified in your strategy"
          locked
        />

        <div className="space-y-5">
          {/* Risk header card */}
          <div className="relative overflow-hidden p-5 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full" />

            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertOctagon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{failureTriggers.length} Failure Modes</p>
                <p className="text-sm text-muted-foreground">Critical triggers that could derail execution</p>
              </div>
            </div>
          </div>

          {/* Trigger list */}
          <div className="space-y-2">
            {failureTriggers.slice(0, 3).map((trigger, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-red-500/30 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i === 0 ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-orange-400'}`} />
                <span className="flex-1 text-sm font-medium text-foreground">{trigger}</span>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  i === 0
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                }`}>
                  {i === 0 ? 'Critical' : 'High'}
                </span>
              </div>
            ))}
          </div>

          <LockedContent message="Get detailed mechanisms, damage estimates, and mitigation strategies" />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: PATTERN ANCHORS - PARTIAL PREVIEW
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
          locked
        />

        <div className="space-y-5">
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/5 via-card to-primary/5 border border-primary/20 rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

            <div className="relative flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{patternNames.length} Patterns Matched</p>
                <p className="text-sm text-muted-foreground">From 1,875+ historical developments</p>
              </div>
            </div>

            {/* Pattern tags */}
            <div className="flex flex-wrap gap-2">
              {patternNames.map((name, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-semibold rounded-xl border border-primary/20 shadow-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <LockedContent message="Access confidence scores, historical behavior analysis, and pattern class details" />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: ACTIONABLE NEXT STEP - PARTIAL PREVIEW
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
          locked
        />

        <div className="space-y-5">
          <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-2xl shadow-xl shadow-primary/10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

            <div className="relative flex items-start gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-2">Priority Action</p>
                <p className="text-lg sm:text-xl font-semibold text-foreground">{nextStepHeadline}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80 rounded-xl border border-border">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{nextStepTimeline}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-card/80 rounded-xl border border-border">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Unlocks next phase</span>
              </div>
            </div>
          </div>

          <LockedContent message="Get executor details, success criteria, and escalation paths" />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: SCOPE BOUNDARY - FULLY VISIBLE
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
              {['Primary transaction structure', 'Banking rail establishment', 'Entity formation sequence', 'Tax optimization pathway'].map((item, i) => (
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
              {['Immigration pathway', 'Estate planning integration', 'Insurance structuring'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 pl-1">
          <span className="text-foreground font-medium">Valid Until:</span> {preview.scopePreview?.valid_until || '90 days from generation'}
        </p>
      </motion.section>

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
              {preview.intelligencePreview?.developments_analyzed || 0}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Developments</p>
          </div>
          <div className="text-center p-4 bg-card/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">
              {preview.intelligencePreview?.failure_modes_identified || 0}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Patterns</p>
          </div>
          <div className="text-center p-4 bg-card/50 rounded-xl border border-border">
            <p className="text-2xl font-bold text-foreground">
              {preview.intelligencePreview?.regulatory_patterns || 0}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Rules</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PreviewArtifactDisplay;
