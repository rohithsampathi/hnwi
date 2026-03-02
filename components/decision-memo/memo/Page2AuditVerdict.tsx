// components/decision-memo/memo/Page2AuditVerdict.tsx
// Section 2: Risk Assessment & Investment Verdict - McKinsey/Goldman Tier
// Institutional-grade risk visualization for HNWI decision-making

"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mistake, ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { EASE_OUT_EXPO, EASE_OUT_QUART } from '@/lib/animations/motion-variants';

interface DDChecklistItem {
  category: string;
  item: string;
  status: string;
  priority: string;
}

interface Page2Props {
  mistakes: Mistake[];
  opportunitiesCount: number;
  precedentCount?: number;  // From kgv3_intelligence_used.precedents
  ddChecklist?: {
    total_items: number;
    items: DDChecklistItem[];
  };
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  // Props from backend intelligence
  dataQuality?: string;        // "strong", "moderate", "limited", "insufficient"
  dataQualityNote?: string;    // Human-readable explanation
  mitigationTimeline?: string; // e.g., "90 Days", "45 Days"
  // Backend-provided risk assessment (preferred over calculated)
  riskAssessment?: {
    risk_level?: string;       // "LOW", "MODERATE", "HIGH", "CRITICAL"
    total_exposure_formatted?: string;  // e.g., "$2.5M"
    critical_items?: number;
    high_priority?: number;    // SOTA: High priority items count
    verdict?: string;          // e.g., "APPROVED", "CONDITIONAL", "REVIEW REQUIRED"
    recommendation?: string;
    verdict_note?: string;     // SOTA: Additional context for verdict
    // SOTA Feb 2026: Structure verdict sync from scenario tree
    structure_verdict?: string; // "PROCEED" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED"
  };
  // SOTA Feb 2026: Scenario Tree integration for verdict coherence
  scenarioTreeData?: {
    recommended_branch?: string; // "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED"
    recommendation_strength?: number; // 0-100 percentage
  };
  // Via Negativa "Autopsy" mode
  viaNegativa?: ViaNegativaContext;
}

// Animated radial gauge for confidence/risk score
function RadialGauge({
  value,
  maxValue = 100,
  size = 220,
  label,
  sublabel,
  color = 'primary'
}: {
  value: number;
  maxValue?: number;
  size?: number;
  label: string;
  sublabel?: string;
  color?: 'primary' | 'emerald' | 'amber' | 'red';
}) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [animatedValue, setAnimatedValue] = useState(0);

  const radius = (size - 30) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animatedValue / maxValue;
  const strokeDashoffset = circumference * (1 - progress * 0.75); // 270 degrees (3/4 circle)

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const duration = 1800;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - elapsed, 4);
      setAnimatedValue(value * easeOutQuart);

      if (elapsed < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isInView]);

  const colorMap = {
    primary: { stroke: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.1)' },
    emerald: { stroke: 'rgb(16, 185, 129)', bg: 'rgb(16, 185, 129, 0.1)' },
    amber: { stroke: 'rgb(245, 158, 11)', bg: 'rgb(245, 158, 11, 0.1)' },
    red: { stroke: 'rgb(239, 68, 68)', bg: 'rgb(239, 68, 68, 0.1)' }
  };

  const colors = colorMap[color];

  return (
    <div className="relative flex flex-col items-center">
      <svg ref={ref} width={size} height={size * 0.85} className="overflow-visible">
        <defs>
          <linearGradient id={`gauge-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="1" />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          strokeDashoffset={0}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          opacity="0.3"
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gauge-gradient-${color})`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={isInView ? { strokeDashoffset } : {}}
          transition={{ duration: 1.8, ease: EASE_OUT_QUART }}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          filter="url(#gauge-glow)"
        />

        {/* Center value */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="fill-foreground font-medium"
          style={{ fontSize: size / 4.5, fontFamily: 'ui-monospace, monospace' }}
        >
          {Math.round(animatedValue)}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          className="fill-muted-foreground/60 uppercase tracking-wider"
          style={{ fontSize: 12 }}
        >
          {label}
        </text>
      </svg>
      {sublabel && (
        <p className="text-xs text-muted-foreground/60 mt-2 text-center max-w-[140px]">
          {sublabel}
        </p>
      )}
    </div>
  );
}

// Risk severity indicator pill
function SeverityPill({ severity }: { severity: string }) {
  const normalizedSeverity = severity.toLowerCase().replace('urgency: ', '');

  const config = {
    critical: {
      border: 'border-red-500/20',
      text: 'text-red-500/80',
      pulse: true
    },
    high: {
      border: 'border-orange-500/20',
      text: 'text-orange-500/80',
      pulse: false
    },
    medium: {
      border: 'border-amber-500/20',
      text: 'text-amber-500/80',
      pulse: false
    },
    low: {
      border: 'border-emerald-500/20',
      text: 'text-emerald-500/80',
      pulse: false
    }
  };

  const level = normalizedSeverity.includes('critical') ? 'critical'
    : normalizedSeverity.includes('high') ? 'high'
    : normalizedSeverity.includes('medium') ? 'medium'
    : 'low';

  const c = config[level];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs tracking-[0.15em] font-medium uppercase border ${c.border} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${c.pulse ? 'animate-pulse' : ''}`} />
      {level}
    </span>
  );
}

// Executive metric card
function ExecutiveMetric({
  label,
  value,
  sublabel,
  icon,
  trend,
  delay = 0,
  isVisible
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  delay?: number;
  isVisible: boolean;
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-5">
        <div className="text-gold/70">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
            trend === 'positive' ? 'border-emerald-500/20 text-emerald-500/80' :
            trend === 'negative' ? 'border-red-500/20 text-red-500/80' :
            'border-border/20 text-muted-foreground/60'
          }`}>
            {trend === 'positive' ? '+' : trend === 'negative' ? '-' : '='}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">{label}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold tabular-nums tracking-tight text-foreground mb-1">{value}</p>
      {sublabel && <p className="text-sm text-muted-foreground/60 hidden sm:block">{sublabel}</p>}
    </motion.div>
  );
}

export function Page2AuditVerdict({
  mistakes,
  opportunitiesCount,
  precedentCount = 0,
  ddChecklist,
  sourceJurisdiction = 'Current Location',
  destinationJurisdiction = 'Target Location',
  dataQuality,
  dataQualityNote,
  mitigationTimeline,
  riskAssessment,
  viaNegativa,
  scenarioTreeData
}: Page2Props) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Calculate risk metrics
  const riskMetrics = useMemo(() => {
    const criticalCount = mistakes.filter(m =>
      m.urgency.toLowerCase().includes('critical')
    ).length;
    const highCount = mistakes.filter(m =>
      m.urgency.toLowerCase().includes('high')
    ).length;

    // Calculate total exposure - prefer cost_numeric from backend, fallback to parsing
    let totalExposure = 0;
    mistakes.forEach(m => {
      // Use pre-calculated cost_numeric from backend if available
      if (m.cost_numeric) {
        totalExposure += m.cost_numeric;
      } else {
        // Fallback: try to parse from cost string
        const match = m.cost.match(/\$?([\d.]+)([MK]?)/);
        if (match) {
          let val = parseFloat(match[1]);
          if (match[2] === 'M') val *= 1000000;
          if (match[2] === 'K') val *= 1000;
          totalExposure += val;
        }
      }
    });

    return { criticalCount, highCount, totalExposure };
  }, [mistakes]);

  const getVerdict = () => {
    // SOTA Feb 2026: Use structure_verdict as source of truth for verdict display
    // This ensures header syncs with scenario tree recommendation
    const structureVerdict = riskAssessment?.structure_verdict;
    const scenarioBranch = scenarioTreeData?.recommended_branch;
    const scenarioStrength = scenarioTreeData?.recommendation_strength;

    // Map structure_verdict to display verdict
    const structureVerdictMap: Record<string, { verdict: string; color: 'emerald' | 'amber' | 'red' }> = {
      'PROCEED': { verdict: 'APPROVED', color: 'emerald' },
      'PROCEED_NOW': { verdict: 'APPROVED', color: 'emerald' },
      'PROCEED_MODIFIED': { verdict: 'CONDITIONAL', color: 'amber' },
      'DO_NOT_PROCEED': { verdict: 'REVIEW REQUIRED', color: 'red' }
    };

    // Only use backend-provided risk assessment - no frontend fallback calculations
    if (riskAssessment?.risk_level) {
      const riskLevel = riskAssessment.risk_level.toUpperCase();
      const colorMap: Record<string, 'emerald' | 'primary' | 'amber' | 'red'> = {
        'LOW': 'emerald',
        'LOW-MODERATE': 'primary',
        'MODERATE': 'primary',
        'MODERATE-HIGH': 'amber',
        'HIGH': 'amber',
        'CRITICAL': 'red'
      };
      const riskScoreMap: Record<string, number> = {
        'LOW': 25,
        'LOW-MODERATE': 35,
        'MODERATE': 45,
        'MODERATE-HIGH': 55,
        'HIGH': 70,
        'CRITICAL': 85
      };

      // SOTA: Prefer structure_verdict over risk_assessment.verdict for coherence
      let finalVerdict = riskAssessment.verdict || '—';
      let finalColor = colorMap[riskLevel] || 'primary';

      if (structureVerdict && structureVerdictMap[structureVerdict]) {
        finalVerdict = structureVerdictMap[structureVerdict].verdict;
        finalColor = structureVerdictMap[structureVerdict].color;
      } else if (scenarioBranch && structureVerdictMap[scenarioBranch]) {
        // Fallback to scenario tree recommendation
        finalVerdict = structureVerdictMap[scenarioBranch].verdict;
        finalColor = structureVerdictMap[scenarioBranch].color;
      }

      // Build recommendation with scenario strength context
      let recommendation = riskAssessment.recommendation || '—';
      if (riskAssessment.verdict_note) {
        recommendation = riskAssessment.verdict_note;
      }
      if (scenarioStrength && scenarioBranch) {
        recommendation = `${recommendation} (${scenarioStrength}% confidence in ${scenarioBranch.replace('_', ' ')})`;
      }

      return {
        decision: finalVerdict,
        riskScore: riskScoreMap[riskLevel] || 0,
        riskLevel: riskLevel,
        recommendation: recommendation,
        color: finalColor,
        // SOTA: Expose structure context for advanced display
        structureVerdict: structureVerdict,
        scenarioBranch: scenarioBranch,
        scenarioStrength: scenarioStrength
      };
    }

    // No backend data - show blanks
    return {
      decision: '—',
      riskScore: 0,
      riskLevel: '—',
      recommendation: '—',
      color: 'primary' as const,
      structureVerdict: undefined,
      scenarioBranch: undefined,
      scenarioStrength: undefined
    };
  };

  const verdict = getVerdict();

  // Transform mistakes for visualization
  const riskItems = useMemo(() => {
    return mistakes.map((mistake, i) => {
      const urgencyValue = mistake.urgency.toLowerCase().includes('critical') ? 90
        : mistake.urgency.toLowerCase().includes('high') ? 70
        : mistake.urgency.toLowerCase().includes('medium') ? 50
        : 30;

      // Parse cost - use cost_numeric from backend if available, otherwise parse string
      let costValue = mistake.cost_numeric || 0;
      if (!costValue) {
        const costMatch = mistake.cost.match(/\$?([\d.]+)([MK]?)/i);
        if (costMatch) {
          costValue = parseFloat(costMatch[1]);
          if (costMatch[2]?.toUpperCase() === 'M') costValue *= 1000000;
          if (costMatch[2]?.toUpperCase() === 'K') costValue *= 1000;
        }
      }

      return {
        ...mistake,
        urgencyValue,
        costValue,
        index: i + 1
      };
    }).sort((a, b) => b.urgencyValue - a.urgencyValue);
  }, [mistakes]);

  return (
    <div ref={sectionRef}>
      {/* Section Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-3">
          {viaNegativa?.isActive ? 'Capital Allocation Review' : 'Investment Committee'}
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          {viaNegativa?.isActive ? viaNegativa.verdictHeader : 'Risk Assessment & Investment Verdict'}
        </h2>
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-6" />
      </motion.div>

      {/* Via Negativa: Pass/Fail Grid (Autopsy Mode Only) */}
      {viaNegativa?.isActive && (
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {/* Tax Efficiency */}
            <div className={`relative overflow-hidden rounded-xl p-4 sm:p-6 text-center border ${
              viaNegativa.taxEfficiencyPassed
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-red-500/20 bg-red-500/[0.03]'
            }`}>
              {/* Small colored dot indicator */}
              <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${
                viaNegativa.taxEfficiencyPassed ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Tax Efficiency</p>
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${
                viaNegativa.taxEfficiencyPassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.taxEfficiencyPassed ? 'PASS' : 'FAIL'}
              </p>
            </div>

            {/* Liquidity */}
            <div className={`relative overflow-hidden rounded-xl p-4 sm:p-6 text-center border ${
              viaNegativa.liquidityPassed
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-red-500/20 bg-red-500/[0.03]'
            }`}>
              <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${
                viaNegativa.liquidityPassed ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Liquidity</p>
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${
                viaNegativa.liquidityPassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.liquidityPassed ? 'PASS' : 'FAIL'}
              </p>
            </div>

            {/* Structure Viability */}
            <div className={`relative overflow-hidden rounded-xl p-4 sm:p-6 text-center border ${
              viaNegativa.structurePassed
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-red-500/20 bg-red-500/[0.03]'
            }`}>
              <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${
                viaNegativa.structurePassed ? 'bg-emerald-500' : 'bg-red-500'
              }`} />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Structure Viability</p>
              <p className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${
                viaNegativa.structurePassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.structurePassed ? 'PASS' : 'FAIL'}
              </p>
            </div>
          </div>

          {/* CAPITAL ALLOCATION DENIED stamp */}
          <div className="mt-6 p-4 sm:p-6 rounded-xl border border-red-500/20 bg-red-500/[0.03] text-center">
            <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-500" />
            <p className="text-xl sm:text-2xl font-semibold text-red-500 tracking-wider">
              {viaNegativa.stampText.toUpperCase()}
            </p>
            <p className="text-xs text-red-500/60 mt-3 tracking-wide">
              {viaNegativa.stampSubtext}
            </p>
          </div>
        </motion.div>
      )}

      {/* Executive Summary Panel */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
      >
        <div className="relative rounded-2xl border border-border/30 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

          {/* Gold hairline gradient */}
          <div className={`h-px bg-gradient-to-r from-transparent ${
            viaNegativa?.isActive ? 'via-red-500/40' :
            verdict.color === 'emerald' ? 'via-emerald-500/40' :
            verdict.color === 'amber' ? 'via-amber-500/40' :
            verdict.color === 'red' ? 'via-red-500/40' : 'via-gold/40'
          } to-transparent`} />

          {/* Verdict section */}
          <motion.div
            className="px-5 sm:px-8 md:px-12 py-10 md:py-12"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            {/* Status dot + label */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${
                viaNegativa?.isActive ? 'bg-red-500' :
                verdict.color === 'emerald' ? 'bg-emerald-500' :
                verdict.color === 'amber' ? 'bg-amber-500' : 'bg-gold'
              } animate-pulse`} />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                {viaNegativa?.isActive ? 'Capital Allocation Review' : 'Investment Committee Decision'}
              </span>
            </div>

            {/* Big verdict text */}
            <motion.h3
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${
                viaNegativa?.isActive ? 'text-red-500' :
                verdict.color === 'emerald' ? 'text-emerald-500' :
                verdict.color === 'amber' ? 'text-amber-500' :
                verdict.color === 'red' ? 'text-red-500' : 'text-foreground'
              }`}
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
            >
              {viaNegativa?.isActive
                ? (viaNegativa.stampText?.toUpperCase() || 'NOT RECOMMENDED')
                : verdict.decision}
            </motion.h3>

            {/* Recommendation text */}
            <motion.p
              className="text-sm sm:text-base text-muted-foreground/60 max-w-2xl leading-loose sm:leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT_EXPO }}
            >
              {viaNegativa?.isActive
                ? (viaNegativa.stampSubtext || 'Key viability thresholds not met — review alternative corridors and strategies')
                : verdict.recommendation}
            </motion.p>
          </motion.div>

          {/* Hairline divider */}
          <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

          {/* Key metrics — gap-based grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-px bg-border/10"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
          >
            {/* Risk Level */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Risk Level</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{verdict.riskLevel}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Overall assessment</p>
            </div>
            {/* Opportunities */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Opportunities</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{opportunitiesCount}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Identified windows</p>
            </div>
            {/* Risk Factors */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Risk Factors</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{mistakes.length}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Items flagged</p>
            </div>
            {/* Data Quality */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Data Quality</p>
              <p className={`text-xl sm:text-2xl font-bold capitalize ${
                dataQuality === 'strong' ? 'text-emerald-500' :
                dataQuality === 'moderate' ? 'text-foreground' :
                dataQuality === 'limited' ? 'text-amber-500' :
                'text-muted-foreground'
              }`}>
                {dataQuality || '—'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{dataQualityNote || '—'}</p>
            </div>
          </motion.div>

          {/* Hairline divider */}
          <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

          {/* Secondary metrics — gap-based grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/10"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE_OUT_EXPO }}
          >
            {/* Total Exposure */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Total Exposure</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{riskAssessment?.total_exposure_formatted || '—'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Aggregate risk value</p>
            </div>
            {/* Critical Items */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Critical Items</p>
              <p className={`text-xl sm:text-2xl font-bold ${
                (riskAssessment?.critical_items ?? 0) > 0 ? 'text-red-500' : 'text-foreground'
              }`}>{riskAssessment?.critical_items ?? '—'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Require immediate action</p>
            </div>
            {/* High Priority */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">High Priority</p>
              <p className={`text-xl sm:text-2xl font-bold ${
                (riskAssessment?.high_priority ?? 0) > 2 ? 'text-amber-500' : 'text-foreground'
              }`}>{riskAssessment?.high_priority ?? '—'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Priority mitigation needed</p>
            </div>
            {/* Mitigation Timeline */}
            <div className="bg-background px-4 sm:px-8 py-6 sm:py-8">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Mitigation Timeline</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{mitigationTimeline || '—'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Resolution window</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Risk Analysis */}
      {mistakes.length > 0 && (
        <motion.div
          className="mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
                Risk Intelligence
              </p>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
                Identified Risk Factors
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60 tracking-wide">
              <span>{riskAssessment?.critical_items ?? '—'} Critical</span>
              <span>{riskAssessment?.high_priority ?? '—'} High</span>
              <span className="font-medium text-foreground/60">{riskAssessment?.total_exposure_formatted || '—'} Total</span>
            </div>
          </div>

          {/* Clean List Layout */}
          <div className="space-y-4">
            {riskItems.map((risk, index) => {
              const isCritical = risk.urgency.toLowerCase().includes('critical');
              const isHigh = risk.urgency.toLowerCase().includes('high');
              const severityLevel = isCritical ? 'Critical' : isHigh ? 'High' : 'Medium';
              const dotColor = isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500';

              return (
                <motion.div
                  key={index}
                  className="rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6"
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.5 + index * 0.08, ease: EASE_OUT_EXPO }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Colored dot indicator instead of border-l */}
                      <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                      <span className="text-xs text-muted-foreground/60">
                        {risk.index}.
                      </span>
                      <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                        isCritical
                          ? 'border-red-500/20 text-red-500/80'
                          : isHigh
                          ? 'border-amber-500/20 text-amber-500/80'
                          : 'border-border/20 text-muted-foreground/60'
                      }`}>
                        {severityLevel}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isCritical ? 'text-red-500/80' : isHigh ? 'text-amber-500/80' : 'text-muted-foreground/60'
                    }`}>
                      {risk.cost}
                    </span>
                  </div>

                  {/* Risk Title */}
                  <h4 className="text-sm sm:text-base font-normal text-foreground leading-loose sm:leading-relaxed mb-2 pl-8">
                    {risk.title}
                  </h4>

                  {/* Mitigation */}
                  {risk.fix && (
                    <div className="pl-8 pt-3">
                      <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-3" />
                      <p className="text-sm text-muted-foreground/60 leading-loose sm:leading-relaxed">
                        <span className="text-foreground/60 font-medium">Mitigation: </span>
                        {risk.fix}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* No risks state */}
      {mistakes.length === 0 && (
        <motion.div
          className="mb-16 rounded-2xl border border-border/30 overflow-hidden p-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_EXPO }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
            <div className="text-center relative">
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full border border-emerald-500/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={isVisible ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
              >
                <svg className="w-10 h-10 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </motion.div>
              <h4 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                No Critical Risk Factors Identified
              </h4>
              <p className="text-sm text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
                The proposed strategy demonstrates strong alignment with regulatory requirements
                and industry best practices. Proceed with standard implementation protocols.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Due Diligence Requirements */}
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6, ease: EASE_OUT_EXPO }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
              Compliance Framework
            </p>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">
              Due Diligence Requirements
            </h3>
          </div>
          {ddChecklist?.items?.length && (
            <span className="text-xs text-muted-foreground/60 tracking-wide">
              {ddChecklist.items.filter(i => i.priority === 'critical').length} Critical · {ddChecklist.items.filter(i => i.priority === 'high').length} High
            </span>
          )}
        </div>

        {/* Clean List Layout */}
        {ddChecklist?.items?.length ? (
          <div className="space-y-4">
            {ddChecklist.items
              .sort((a, b) => {
                const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
              })
              .slice(0, 5)
              .map((item, i) => {
                const isCritical = item.priority === 'critical';
                const responsible = item.category.includes('TAX') ? 'Tax Advisor' :
                                   item.category.includes('LEGAL') ? 'Legal Counsel' :
                                   item.category.includes('COMPLIANCE') ? 'Compliance Officer' :
                                   item.category.includes('BANKING') ? 'Private Banking RM' :
                                   'Advisory Team';
                const timeline = isCritical ? '14 days' : item.priority === 'high' ? '30 days' : '60 days';

                return (
                  <motion.div
                    key={item.item}
                    className="rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.7 + i * 0.08, ease: EASE_OUT_EXPO }}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {/* Colored dot indicator */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCritical ? 'bg-gold' : 'bg-border/40'
                        }`} />
                        <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                          isCritical
                            ? 'border-gold/20 text-gold/80'
                            : 'border-border/20 text-muted-foreground/60'
                        }`}>
                          {item.category}
                        </span>
                        <span className={`text-xs ${
                          isCritical ? 'text-gold/70' : 'text-muted-foreground/60'
                        }`}>
                          {timeline}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/60">{responsible}</span>
                    </div>

                    {/* Item Title */}
                    <p className="text-sm font-normal text-foreground leading-relaxed pl-5">
                      {item.item}
                    </p>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-10 px-6 rounded-xl border border-border/20 bg-card/50">
            <p className="text-sm text-muted-foreground/60">
              Due diligence items will be generated based on {sourceJurisdiction} → {destinationJurisdiction} profile
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
