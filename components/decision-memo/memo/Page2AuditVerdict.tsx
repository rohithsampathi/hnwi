// components/decision-memo/memo/Page2AuditVerdict.tsx
// Section 2: Risk Assessment & Investment Verdict - McKinsey/Goldman Tier
// Institutional-grade risk visualization for HNWI decision-making

"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mistake, ViaNegativaContext } from '@/lib/decision-memo/memo-types';

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
  size = 180,
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
          strokeWidth="12"
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
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference * 0.75}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={isInView ? { strokeDashoffset } : {}}
          transition={{ duration: 1.8, ease: "easeOut" }}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          filter="url(#gauge-glow)"
        />

        {/* Center value */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="fill-foreground font-bold"
          style={{ fontSize: size / 4.5 }}
        >
          {Math.round(animatedValue)}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          className="fill-muted-foreground uppercase tracking-wider"
          style={{ fontSize: 10 }}
        >
          {label}
        </text>
      </svg>
      {sublabel && (
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-[140px]">
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
      bg: 'bg-gradient-to-r from-red-600 to-red-500',
      text: 'text-white',
      dot: 'bg-white',
      pulse: true
    },
    high: {
      bg: 'bg-gradient-to-r from-orange-500 to-orange-400',
      text: 'text-white',
      dot: 'bg-white',
      pulse: false
    },
    medium: {
      bg: 'bg-gradient-to-r from-amber-400 to-amber-300',
      text: 'text-amber-900',
      dot: 'bg-amber-900',
      pulse: false
    },
    low: {
      bg: 'bg-gradient-to-r from-emerald-400 to-emerald-300',
      text: 'text-emerald-900',
      dot: 'bg-emerald-900',
      pulse: false
    }
  };

  const level = normalizedSeverity.includes('critical') ? 'critical'
    : normalizedSeverity.includes('high') ? 'high'
    : normalizedSeverity.includes('medium') ? 'medium'
    : 'low';

  const c = config[level];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
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
      className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
            trend === 'positive' ? 'bg-emerald-500/10 text-emerald-500' :
            trend === 'negative' ? 'bg-red-500/10 text-red-500' :
            'bg-muted text-muted-foreground'
          }`}>
            {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→'}
          </span>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">{label}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{value}</p>
      {sublabel && <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{sublabel}</p>}
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
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2 sm:mb-3 tracking-wide">
          {viaNegativa?.isActive ? viaNegativa.verdictHeader : 'RISK ASSESSMENT & INVESTMENT VERDICT'}
        </h2>
        <div className={`w-16 sm:w-24 h-1 bg-gradient-to-r ${viaNegativa?.isActive ? 'from-red-500 to-red-500/30' : 'from-primary to-primary/30'}`} />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          VIA NEGATIVA: PASS/FAIL GRID (Autopsy Mode Only)
          ═══════════════════════════════════════════════════════════════════ */}
      {viaNegativa?.isActive && (
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* Tax Efficiency */}
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 ${
              viaNegativa.taxEfficiencyPassed
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-2">Tax Efficiency</p>
              <p className={`text-2xl sm:text-4xl font-black ${
                viaNegativa.taxEfficiencyPassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.taxEfficiencyPassed ? 'PASS' : 'FAIL'}
              </p>
            </div>

            {/* Liquidity */}
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 ${
              viaNegativa.liquidityPassed
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-2">Liquidity</p>
              <p className={`text-2xl sm:text-4xl font-black ${
                viaNegativa.liquidityPassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.liquidityPassed ? 'PASS' : 'FAIL'}
              </p>
            </div>

            {/* Structure Viability */}
            <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 ${
              viaNegativa.structurePassed
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-2">Structure Viability</p>
              <p className={`text-2xl sm:text-4xl font-black ${
                viaNegativa.structurePassed ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {viaNegativa.structurePassed ? 'PASS' : 'FAIL'}
              </p>
            </div>
          </div>

          {/* CAPITAL ALLOCATION DENIED stamp */}
          <div className="mt-6 p-4 sm:p-6 bg-red-100 dark:bg-red-950/40 border-2 border-red-200 dark:border-red-500/30 rounded-xl text-center">
            <p className="text-xl sm:text-3xl font-black text-red-600 dark:text-red-500 tracking-wider">
              {viaNegativa.stampText.toUpperCase()}
            </p>
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400/60 mt-2">
              {viaNegativa.stampSubtext}
            </p>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          EXECUTIVE SUMMARY PANEL
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Main Verdict Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border border-border rounded-2xl sm:rounded-3xl shadow-2xl mb-4 sm:mb-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-60 h-32 sm:h-60 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full" />

          <div className="relative z-10 p-3 sm:p-6 lg:p-10 xl:p-12">
            <div className="grid lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-10">
              {/* Left - Decision & Details */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    viaNegativa?.isActive ? 'bg-red-500' :
                    verdict.color === 'emerald' ? 'bg-emerald-500' :
                    verdict.color === 'amber' ? 'bg-amber-500' : 'bg-primary'
                  } animate-pulse`} />
                  <span className="text-[8px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                    {viaNegativa?.isActive ? 'Capital Allocation Review' : 'Investment Committee Decision'}
                  </span>
                </div>

                <motion.h3
                  className={`text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-2 sm:mb-4 ${
                    viaNegativa?.isActive ? 'text-red-500' :
                    verdict.color === 'emerald' ? 'text-emerald-500' :
                    verdict.color === 'amber' ? 'text-amber-500' : 'text-primary'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {viaNegativa?.isActive
                    ? (viaNegativa.stampText?.toUpperCase() || 'NOT RECOMMENDED')
                    : verdict.decision}
                </motion.h3>

                <motion.p
                  className="text-xs sm:text-base lg:text-lg text-muted-foreground mb-3 sm:mb-8 max-w-xl leading-relaxed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {viaNegativa?.isActive
                    ? (viaNegativa.stampSubtext || 'Key viability thresholds not met — review alternative corridors and strategies')
                    : verdict.recommendation}
                </motion.p>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <motion.div
                    className="p-2 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Risk Level</p>
                    <p className="text-sm sm:text-base lg:text-xl font-bold text-foreground">{verdict.riskLevel}</p>
                  </motion.div>
                  <motion.div
                    className="p-2 sm:p-4 bg-primary/5 rounded-lg sm:rounded-xl border border-primary/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.7 }}
                  >
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Opportunities</p>
                    <p className="text-sm sm:text-base lg:text-xl font-bold text-primary">{opportunitiesCount}</p>
                  </motion.div>
                  <motion.div
                    className="p-2 sm:p-4 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.8 }}
                  >
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">Risk Factors</p>
                    <p className="text-sm sm:text-base lg:text-xl font-bold text-foreground">{mistakes.length}</p>
                  </motion.div>
                </div>
              </div>

              {/* Right - Data Quality Indicator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 sm:gap-6 mt-4 lg:mt-0">
                <div className="w-[180px] p-6 bg-muted/30 rounded-2xl border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Data Quality</p>
                  <p className={`text-2xl font-bold capitalize ${
                    dataQuality === 'strong' ? 'text-emerald-500' :
                    dataQuality === 'moderate' ? 'text-primary' :
                    dataQuality === 'limited' ? 'text-amber-500' :
                    'text-muted-foreground'
                  }`}>
                    {dataQuality || '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {dataQualityNote || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <ExecutiveMetric
            label="Total Exposure"
            value={riskAssessment?.total_exposure_formatted || '—'}
            sublabel="Aggregate risk value"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            trend={riskAssessment?.total_exposure_formatted ? 'negative' : 'neutral'}
            delay={0.3}
            isVisible={isVisible}
          />
          <ExecutiveMetric
            label="Critical Items"
            value={riskAssessment?.critical_items ?? '—'}
            sublabel="Require immediate action"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            trend={(riskAssessment?.critical_items ?? 0) > 0 ? 'negative' : 'neutral'}
            delay={0.4}
            isVisible={isVisible}
          />
          <ExecutiveMetric
            label="High Priority"
            value={riskAssessment?.high_priority ?? '—'}
            sublabel="Priority mitigation needed"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            trend={(riskAssessment?.high_priority ?? 0) > 2 ? 'negative' : 'neutral'}
            delay={0.5}
            isVisible={isVisible}
          />
          <ExecutiveMetric
            label="Mitigation Timeline"
            value={mitigationTimeline}
            sublabel="Recommended resolution window"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            delay={0.6}
            isVisible={isVisible}
          />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
          RISK ANALYSIS - Clean Institutional Design
          ═══════════════════════════════════════════════════════════════════ */}
      {mistakes.length > 0 && (
        <motion.div
          className="mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground tracking-wide">
              IDENTIFIED RISK FACTORS
            </h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{riskAssessment?.critical_items ?? '—'} Critical</span>
              <span className="text-border">|</span>
              <span>{riskAssessment?.high_priority ?? '—'} High</span>
              <span className="text-border">|</span>
              <span className="font-medium text-foreground">{riskAssessment?.total_exposure_formatted || '—'} Total</span>
            </div>
          </div>

          {/* Clean List Layout */}
          <div className="space-y-3">
            {riskItems.map((risk, index) => {
              const isCritical = risk.urgency.toLowerCase().includes('critical');
              const isHigh = risk.urgency.toLowerCase().includes('high');
              const severityLevel = isCritical ? 'Critical' : isHigh ? 'High' : 'Medium';

              return (
                <motion.div
                  key={index}
                  className="bg-card border border-border rounded-xl p-4 sm:p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-5">
                        {risk.index}.
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                        isCritical
                          ? 'bg-red-500/10 text-red-600'
                          : isHigh
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {severityLevel}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${
                      isCritical ? 'text-red-600' : isHigh ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>
                      {risk.cost}
                    </span>
                  </div>

                  {/* Risk Title */}
                  <h4 className="text-sm sm:text-base font-medium text-foreground leading-relaxed mb-2 pl-8">
                    {risk.title}
                  </h4>

                  {/* Mitigation */}
                  {risk.fix && (
                    <div className="pl-8 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Mitigation: </span>
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
          className="mb-16 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
            >
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <h4 className="text-2xl font-bold text-foreground mb-3">
              No Critical Risk Factors Identified
            </h4>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The proposed strategy demonstrates strong alignment with regulatory requirements
              and industry best practices. Proceed with standard implementation protocols.
            </p>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          DUE DILIGENCE REQUIREMENTS - Premium Timeline
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="mb-10 sm:mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground tracking-wide">
            DUE DILIGENCE REQUIREMENTS
          </h3>
          {ddChecklist?.items?.length && (
            <span className="text-xs text-muted-foreground">
              {ddChecklist.items.filter(i => i.priority === 'critical').length} Critical · {ddChecklist.items.filter(i => i.priority === 'high').length} High
            </span>
          )}
        </div>

        {/* Clean List Layout */}
        {ddChecklist?.items?.length ? (
          <div className="space-y-3">
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
                    className="bg-card border border-border rounded-xl p-4 sm:p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.7 + i * 0.08 }}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                          isCritical
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-medium ${
                          isCritical ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {timeline}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{responsible}</span>
                    </div>

                    {/* Item Title */}
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {item.item}
                    </p>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground">
              Due diligence items will be generated based on {sourceJurisdiction} → {destinationJurisdiction} profile
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
