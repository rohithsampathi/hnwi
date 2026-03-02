// components/decision-memo/memo/CrisisResilienceSection.tsx
// Premium Crisis Resilience Stress Test Section - Institutional Quality
// Supports structured JSON data (preferred) and legacy text parsing (fallback)

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_OUT_EXPO, EASE_OUT_QUART } from '@/lib/animations/motion-variants';

// Structured JSON interfaces
interface CrisisScenario {
  id: "ai_bubble" | "bank_crisis" | "recession_2008" | "liquidity_crisis";
  name: string;
  position: string;
  stress_factor: string;
  impact: string;
  recovery: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  verdict: string;
}

interface OverallResilience {
  score: number;
  // Fix #20: Match backend rating values from rate_resilience()
  // Backend returns: EXCELLENT, STRONG, MODERATE, FRAGILE, CRITICAL
  rating: "EXCELLENT" | "STRONG" | "MODERATE" | "FRAGILE" | "CRITICAL" | "VULNERABLE" | "AT_RISK";
  summary: string;
}

interface Recommendation {
  priority: "IMMEDIATE" | "SHORT_TERM" | "LONG_TERM";
  action: string;
  rationale: string;
}

interface KeyMetrics {
  worst_case_loss: string;
  recovery_time: string;
  required_buffer: string;
}

// Taleb Antifragile Framework - "Profit from crisis"
interface OpportunityCapitalDetail {
  recommended_buffer: string;
  buffer_multiple: string;
  rationale: string;
}

interface CrisisScenarioDetail {
  name: string;
  trigger: string;
  your_buying_power: string;
  instant_equity_gain: string;
  equivalent_roi: string;
  annualized_return: string;
}

interface AntifragileOpportunity {
  concept: string;
  taleb_principle: string;
  opportunity_capital: OpportunityCapitalDetail;
  crisis_scenario: CrisisScenarioDetail;
  comparison: {
    fragile: string;
    resilient: string;
    antifragile: string;
  };
  action_required: string;
  upside_if_crisis: string;
}

interface PositionComparison {
  fragile: { label: string; description: string };
  resilient: { label: string; description: string };
  antifragile: { label: string; description: string };
  current_position: "fragile" | "resilient" | "antifragile";
}

export interface CrisisData {
  scenarios: CrisisScenario[];
  overall_resilience: OverallResilience;
  recommendations: Recommendation[];
  key_metrics: KeyMetrics;
  // Taleb Antifragile Framework
  antifragile_opportunity?: AntifragileOpportunity;
  position_comparison?: PositionComparison;
}

interface CrisisResilienceSectionProps {
  crisisData?: CrisisData;        // Structured JSON (preferred)
  content?: string;                // Legacy text (fallback)
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

// Risk level visual indicator
function RiskIndicator({ level }: { level: string }) {
  const config: Record<string, { bars: number; color: string; label: string }> = {
    LOW: { bars: 1, color: 'bg-muted-foreground/40', label: 'Low' },
    MEDIUM: { bars: 2, color: 'bg-foreground/60', label: 'Medium' },
    HIGH: { bars: 3, color: 'bg-primary/80', label: 'High' },
    CRITICAL: { bars: 4, color: 'bg-primary', label: 'Critical' }
  };

  const { bars, color, label } = config[level] || config.MEDIUM;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`w-1 rounded-full ${i <= bars ? color : 'bg-muted/30'}`}
            style={{ height: `${8 + i * 3}px` }}
          />
        ))}
      </div>
      <span className={`text-xs tracking-[0.15em] uppercase font-medium ${level === 'CRITICAL' || level === 'HIGH' ? 'text-primary/80' : 'text-muted-foreground/60'}`}>
        {label}
      </span>
    </div>
  );
}

// Scenario type icon
function ScenarioIcon({ id }: { id: string }) {
  const icons: Record<string, React.ReactNode> = {
    ai_bubble: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bank_crisis: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    recession_2008: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    liquidity_crisis: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className="text-muted-foreground/60">
      {icons[id] || icons.liquidity_crisis}
    </div>
  );
}

// Resilience score gauge — animated arc draw + counter
function ResilienceGauge({ score, rating }: { score: number; rating: string }) {
  const gaugeRef = useRef<HTMLDivElement>(null);
  const gaugeInView = useInView(gaugeRef, { once: true, margin: "-50px" });
  const [animatedScore, setAnimatedScore] = useState(0);

  // Fix #20: Match backend rating values from rate_resilience() in programmatic_stress_calculator.py
  // Backend ratings: EXCELLENT (≥80), STRONG (≥65), MODERATE (≥50), FRAGILE (≥35), CRITICAL (<35)
  const ratingConfig: Record<string, { color: string; bg: string; label: string }> = {
    // New backend ratings (Fix #20)
    EXCELLENT: { color: 'text-green-600 dark:text-green-400', bg: 'border-green-500/20 text-green-500/80', label: 'EXCELLENT' },
    STRONG: { color: 'text-primary', bg: 'border-primary/20 text-primary/80', label: 'STRONG' },
    MODERATE: { color: 'text-amber-600 dark:text-amber-400', bg: 'border-amber-500/20 text-amber-500/80', label: 'MODERATE' },
    FRAGILE: { color: 'text-orange-600 dark:text-orange-400', bg: 'border-orange-500/20 text-orange-500/80', label: 'FRAGILE' },
    CRITICAL: { color: 'text-red-600 dark:text-red-400', bg: 'border-red-500/20 text-red-500/80', label: 'CRITICAL' },
    // Legacy frontend ratings (backwards compatibility)
    VULNERABLE: { color: 'text-orange-600 dark:text-orange-400', bg: 'border-orange-500/20 text-orange-500/80', label: 'VULNERABLE' },
    AT_RISK: { color: 'text-red-600 dark:text-red-400', bg: 'border-red-500/20 text-red-500/80', label: 'AT RISK' }
  };

  // Use score-based fallback if rating not found (in case of legacy data)
  const getFallbackRating = (s: number) => {
    if (s >= 80) return 'EXCELLENT';
    if (s >= 65) return 'STRONG';
    if (s >= 50) return 'MODERATE';
    if (s >= 35) return 'FRAGILE';
    return 'CRITICAL';
  };
  const config = ratingConfig[rating] || ratingConfig[getFallbackRating(score)];

  const r = 54;
  const strokeW = 8;
  const halfC = Math.PI * r;
  const targetOffset = halfC - (halfC * score / 100);

  // Animated counter synced with arc
  useEffect(() => {
    if (!gaugeInView) return;
    let startTime: number;
    const duration = 1800;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - elapsed, 4);
      setAnimatedScore(Math.round(score * easeOut));
      if (elapsed < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, gaugeInView]);

  return (
    <div ref={gaugeRef} className="flex flex-col items-center">
      <div className="relative w-44 h-[90px]">
        <svg viewBox="0 0 128 76" className="w-full h-full overflow-visible">
          <path d={`M ${64 - r} 66 A ${r} ${r} 0 0 1 ${64 + r} 66`} fill="none" stroke="currentColor" strokeWidth={strokeW} className="text-muted/20" />
          <motion.path
            d={`M ${64 - r} 66 A ${r} ${r} 0 0 1 ${64 + r} 66`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeW}
            strokeDasharray={halfC}
            strokeLinecap="round"
            className="text-primary"
            initial={{ strokeDashoffset: halfC }}
            animate={gaugeInView ? { strokeDashoffset: targetOffset } : {}}
            transition={{ duration: 1.8, ease: EASE_OUT_QUART }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <span className="text-3xl md:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight text-foreground">{animatedScore}</span>
          <span className="text-sm text-muted-foreground/60">/100</span>
        </div>
      </div>
      <motion.span
        className={`mt-3 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${config.bg}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={gaugeInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.4, ease: EASE_OUT_EXPO }}
      >
        {config.label}
      </motion.span>
    </div>
  );
}

// Priority badge for recommendations
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { color: string; label: string }> = {
    IMMEDIATE: { color: 'border-primary/20 text-primary/80', label: 'IMMEDIATE' },
    SHORT_TERM: { color: 'border-border/20 text-muted-foreground/80', label: 'SHORT TERM' },
    LONG_TERM: { color: 'border-border/20 text-muted-foreground/60', label: 'LONG TERM' }
  };

  const { color, label } = config[priority] || config.SHORT_TERM;

  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border whitespace-nowrap ${color}`}>
      {label}
    </span>
  );
}

export function CrisisResilienceSection({
  crisisData,
  content,
  sourceJurisdiction = '',
  destinationJurisdiction = ''
}: CrisisResilienceSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Try to parse JSON from content string if crisisData not provided
  // Backend sometimes sends JSON wrapped in markdown header like "## TITLE\n{json...}"
  let parsedData: CrisisData | undefined = crisisData;

  if (!parsedData && content) {
    try {
      // Try to extract JSON from content (may have markdown header before it)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate it looks like CrisisData structure
        if (parsed.scenarios || parsed.overall_resilience || parsed.recommendations) {
          parsedData = parsed as CrisisData;
        }
      }
    } catch (e) {
      // Not JSON, will fall through to legacy text rendering
    }
  }

  // Check if we have structured JSON data
  const hasStructuredData = parsedData?.scenarios?.length ||
                            parsedData?.overall_resilience;

  // Don't render if no data at all
  if (!hasStructuredData && (!content || content === 'N/A' || content.length < 50)) {
    return null;
  }

  // =========================================================================
  // PREFERRED: Render from structured JSON data
  // =========================================================================
  if (hasStructuredData && parsedData) {
    return (
      <div ref={sectionRef}>
        {/* Section Header */}
        <motion.div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Crisis Resilience Stress Test
          </h2>
          <div className="h-px bg-border" />
        </motion.div>

        <div className="space-y-8 sm:space-y-12 mb-8">
          {/* Overall Resilience Score Card */}
          {parsedData.overall_resilience && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-8 md:px-12 py-10 md:py-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-8">
                <ResilienceGauge
                  score={parsedData.overall_resilience.score}
                  rating={parsedData.overall_resilience.rating}
                />
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                    Overall Resilience Assessment
                  </p>
                  <p className="text-sm text-muted-foreground/60 mb-6 leading-loose sm:leading-relaxed">
                    {parsedData.overall_resilience.summary}
                  </p>

                  {/* Key Metrics */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Worst Case</p>
                      <p className="text-base font-medium tabular-nums text-foreground">
                        {parsedData.key_metrics?.worst_case_loss ||
                         parsedData.scenarios?.find(s => s.risk_level === 'CRITICAL')?.impact ||
                         '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Recovery</p>
                      <p className="text-base font-medium tabular-nums text-foreground">
                        {parsedData.key_metrics?.recovery_time ||
                         parsedData.scenarios?.find(s => s.risk_level === 'CRITICAL')?.recovery?.split(';')[0] ||
                         '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Buffer</p>
                      <p className="text-base font-medium tabular-nums text-primary">
                        {parsedData.key_metrics?.required_buffer ||
                         parsedData.recommendations?.find(r => r.priority === 'IMMEDIATE')?.action?.match(/\$[\d,.]+[KMB]?/)?.[0] ||
                         '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Scenario Cards Grid */}
          {(parsedData.scenarios?.length ?? 0) > 0 && (
            <motion.div
              className="grid md:grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
            >
              {parsedData.scenarios?.map((scenario, idx) => (
                <motion.div
                  key={scenario.id}
                  className="relative rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6 transition-all duration-300"
                  initial={{ opacity: 0, y: 12 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + idx * 0.1, duration: 0.7, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -3, boxShadow: '0 8px 30px -8px rgba(0,0,0,0.08)' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <ScenarioIcon id={scenario.id} />
                      <div>
                        <h4 className="text-sm font-normal text-foreground break-words line-clamp-2">{scenario.name}</h4>
                        <p className="text-xs text-muted-foreground/60">{scenario.position}</p>
                      </div>
                    </div>
                    <RiskIndicator level={scenario.risk_level} />
                  </div>

                  {/* Stress Factor */}
                  <div className="rounded-lg p-3 mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Stress Factor</p>
                    <p className="text-sm text-muted-foreground/60 leading-loose sm:leading-relaxed">{scenario.stress_factor}</p>
                  </div>

                  {/* Impact & Recovery */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Impact</p>
                      <p className="text-sm font-medium text-primary">{scenario.impact}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Recovery</p>
                      <p className="text-sm font-medium text-foreground">{scenario.recovery}</p>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="pt-4">
                    <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Verdict</p>
                    <p className="text-sm text-muted-foreground/60 leading-loose sm:leading-relaxed">{scenario.verdict}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* SFO Recommendations */}
          {(parsedData.recommendations?.length ?? 0) > 0 && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
                SFO Recommendations
              </p>

              <div className="space-y-5">
                {parsedData.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <PriorityBadge priority={rec.priority} />
                    <div className="flex-1">
                      <p className="text-xs text-foreground font-normal">{rec.action}</p>
                      <p className="text-sm text-muted-foreground/60 mt-0.5 leading-loose sm:leading-relaxed">{rec.rationale}</p>
                      {idx < (parsedData.recommendations?.length ?? 0) - 1 && (
                        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mt-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Taleb Antifragile Opportunity - "Profit from Crisis" */}
          {parsedData.antifragile_opportunity && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium">
                    Antifragile Opportunity
                  </p>
                  <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-primary/20 text-primary/80">
                    TALEB FRAMEWORK
                  </span>
                </div>

                {/* Concept Header */}
                <p className="text-sm font-normal text-primary mb-2">
                  {parsedData.antifragile_opportunity.concept}
                </p>

                {/* Taleb Principle */}
                <p className="text-sm text-muted-foreground/70 mb-8 italic leading-relaxed">
                  {parsedData.antifragile_opportunity.taleb_principle}
                </p>

                {/* Main Metrics Grid */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />
                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {/* Opportunity Capital */}
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Opportunity Capital</p>
                    <p className="text-xl md:text-2xl font-bold text-primary">
                      {parsedData.antifragile_opportunity.opportunity_capital.recommended_buffer}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-2 leading-relaxed">
                      {parsedData.antifragile_opportunity.opportunity_capital.buffer_multiple}
                    </p>
                  </div>

                  {/* Distressed Buying Power - from crisis_scenario */}
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Distressed Buying Power</p>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {parsedData.antifragile_opportunity.crisis_scenario.your_buying_power}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-2 leading-relaxed">
                      {parsedData.antifragile_opportunity.crisis_scenario.trigger}
                    </p>
                  </div>

                  {/* Instant Equity Gain - from crisis_scenario */}
                  <div className="relative rounded-xl border border-primary/20 bg-card/50 p-5 overflow-hidden">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Instant Equity Gain</p>
                      <p className="text-xl md:text-2xl font-bold text-primary">
                        {parsedData.antifragile_opportunity.crisis_scenario.instant_equity_gain}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-2 leading-relaxed">
                        {parsedData.antifragile_opportunity.crisis_scenario.equivalent_roi}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison: Fragile vs Resilient vs Antifragile */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5 mb-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Position Spectrum</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">
                        <span className="font-normal text-foreground/60">Fragile:</span> {parsedData.antifragile_opportunity.comparison.fragile}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">
                        <span className="font-normal text-foreground/60">Resilient:</span> {parsedData.antifragile_opportunity.comparison.resilient}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">
                        <span className="font-normal text-primary/80">Antifragile:</span> {parsedData.antifragile_opportunity.comparison.antifragile}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Required + Upside */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 rounded-xl border border-border/20 bg-card/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Action Required</p>
                    <p className="text-xs text-foreground/60 font-normal leading-relaxed">{parsedData.antifragile_opportunity.action_required}</p>
                  </div>
                  <div className="flex-1 relative rounded-xl border border-primary/20 bg-card/50 p-4 overflow-hidden">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-2">Upside If Crisis</p>
                      <p className="text-xs text-foreground/80 font-normal leading-relaxed">{parsedData.antifragile_opportunity.upside_if_crisis}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Position Comparison: Fragile vs Resilient vs Antifragile */}
          {parsedData.position_comparison && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
                Your Position in Crisis
              </p>

              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Fragile */}
                <div className={`rounded-xl p-5 border transition-all ${
                  parsedData.position_comparison.current_position === 'fragile'
                    ? 'border-muted-foreground/30 bg-card/50'
                    : 'border-border/20 opacity-40'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      parsedData.position_comparison.current_position === 'fragile' ? 'bg-muted-foreground/60' : 'bg-muted/30'
                    }`} />
                    <p className="text-xs tracking-[0.15em] uppercase font-medium text-foreground">Fragile</p>
                    {parsedData.position_comparison.current_position === 'fragile' && (
                      <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-muted-foreground/20 text-muted-foreground/80">YOU</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    {parsedData.position_comparison.fragile?.description || "Harmed by volatility. Forced to sell at bottom."}
                  </p>
                </div>

                {/* Resilient */}
                <div className={`rounded-xl p-5 border transition-all ${
                  parsedData.position_comparison.current_position === 'resilient'
                    ? 'border-primary/30 bg-card/50'
                    : 'border-border/20 opacity-40'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      parsedData.position_comparison.current_position === 'resilient' ? 'bg-primary/60' : 'bg-muted/30'
                    }`} />
                    <p className="text-xs tracking-[0.15em] uppercase font-medium text-foreground">Resilient</p>
                    {parsedData.position_comparison.current_position === 'resilient' && (
                      <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-primary/20 text-primary/80">YOU</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    {parsedData.position_comparison.resilient?.description || "Survives volatility. Maintains position through crisis."}
                  </p>
                </div>

                {/* Antifragile */}
                <div className={`rounded-xl p-5 border transition-all ${
                  parsedData.position_comparison.current_position === 'antifragile'
                    ? 'border-primary/40 bg-card/50'
                    : 'border-border/20 opacity-40'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${
                      parsedData.position_comparison.current_position === 'antifragile' ? 'bg-primary' : 'bg-muted/30'
                    }`} />
                    <p className="text-xs tracking-[0.15em] uppercase font-medium text-foreground">Antifragile</p>
                    {parsedData.position_comparison.current_position === 'antifragile' && (
                      <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-primary/20 text-primary/80">YOU</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    {parsedData.position_comparison.antifragile?.description || "Benefits from volatility. Buys distressed assets at discount."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Intelligence Source Footer */}
          <motion.div
            className="flex items-center justify-center gap-2 pt-4"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Grounded in HNWI Chronicles KG Historical Precedents + Stress Models + Antifragile Framework
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FALLBACK: Render legacy text content
  // =========================================================================
  return <LegacyTextCrisisSection content={content || ''} />;
}

// Legacy text rendering component (fallback)
function LegacyTextCrisisSection({ content }: { content: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  if (!content || content.length < 50) return null;

  // Simple rendering of the raw content with basic formatting
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div ref={sectionRef}>
      <motion.div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          Crisis Resilience Stress Test
        </h2>
        <div className="h-px bg-border" />
      </motion.div>

      <motion.div
        className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="prose prose-sm max-w-none">
          {paragraphs.map((paragraph, idx) => {
            // Clean up markdown-style formatting
            const cleaned = paragraph
              .replace(/\*\*/g, '')
              .replace(/^\s*[-•→]\s*/gm, '• ')
              .trim();

            return (
              <p key={idx} className="text-xs text-muted-foreground/60 leading-loose sm:leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">
                {cleaned}
              </p>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 pt-6"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Grounded in HNWI Chronicles KG Historical Precedents + Stress Models
        </p>
      </motion.div>
    </div>
  );
}
