// components/decision-memo/memo/CrisisResilienceSection.tsx
// Premium Crisis Resilience Stress Test Section - Institutional Quality
// Supports structured JSON data (preferred) and legacy text parsing (fallback)

"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

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
    LOW: { bars: 1, color: 'bg-muted-foreground', label: 'Low' },
    MEDIUM: { bars: 2, color: 'bg-foreground', label: 'Medium' },
    HIGH: { bars: 3, color: 'bg-primary', label: 'High' },
    CRITICAL: { bars: 4, color: 'bg-primary', label: 'Critical' }
  };

  const { bars, color, label } = config[level] || config.MEDIUM;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`w-1.5 rounded-full ${i <= bars ? color : 'bg-muted'}`}
            style={{ height: `${8 + i * 3}px` }}
          />
        ))}
      </div>
      <span className={`text-[10px] font-semibold uppercase ${level === 'CRITICAL' || level === 'HIGH' ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}

// Scenario type icon
function ScenarioIcon({ id }: { id: string }) {
  const icons: Record<string, React.ReactNode> = {
    ai_bubble: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    bank_crisis: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    recession_2008: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    liquidity_crisis: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground">
      {icons[id] || icons.liquidity_crisis}
    </div>
  );
}

// Resilience score gauge
function ResilienceGauge({ score, rating }: { score: number; rating: string }) {
  // Fix #20: Match backend rating values from rate_resilience() in programmatic_stress_calculator.py
  // Backend ratings: EXCELLENT (≥80), STRONG (≥65), MODERATE (≥50), FRAGILE (≥35), CRITICAL (<35)
  const ratingConfig: Record<string, { color: string; bg: string; label: string }> = {
    // New backend ratings (Fix #20)
    EXCELLENT: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/20', label: 'EXCELLENT' },
    STRONG: { color: 'text-primary', bg: 'bg-primary/20', label: 'STRONG' },
    MODERATE: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/20', label: 'MODERATE' },
    FRAGILE: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/20', label: 'FRAGILE' },
    CRITICAL: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/20', label: 'CRITICAL' },
    // Legacy frontend ratings (backwards compatibility)
    VULNERABLE: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/20', label: 'VULNERABLE' },
    AT_RISK: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/20', label: 'AT RISK' }
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

  const r = 50;
  const strokeW = 8;
  const halfC = Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-[76px]">
        <svg viewBox="0 0 120 68" className="w-full h-full overflow-visible">
          <path d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`} fill="none" stroke="currentColor" strokeWidth={strokeW} className="text-muted" />
          <path d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`} fill="none" stroke="currentColor" strokeWidth={strokeW} strokeDasharray={halfC} strokeDashoffset={halfC - (halfC * score / 100)} strokeLinecap="round" className="text-primary" />
        </svg>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

// Priority badge for recommendations
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { color: string; label: string }> = {
    IMMEDIATE: { color: 'bg-primary text-primary-foreground', label: 'IMMEDIATE' },
    SHORT_TERM: { color: 'bg-muted text-foreground', label: 'SHORT TERM' },
    LONG_TERM: { color: 'bg-muted text-muted-foreground', label: 'LONG TERM' }
  };

  const { color, label } = config[priority] || config.SHORT_TERM;

  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${color}`}>
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
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              CRISIS RESILIENCE STRESS TEST
            </h2>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Economic Scenarios
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            How your wealth structure survives worst-case economic events
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Overall Resilience Score Card */}
          {parsedData.overall_resilience && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResilienceGauge
                  score={parsedData.overall_resilience.score}
                  rating={parsedData.overall_resilience.rating}
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                    Overall Resilience Assessment
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {parsedData.overall_resilience.summary}
                  </p>

                  {/* Key Metrics - with fallbacks for missing values */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Worst Case</p>
                      <p className="text-sm font-bold text-foreground">
                        {parsedData.key_metrics?.worst_case_loss ||
                         parsedData.scenarios?.find(s => s.risk_level === 'CRITICAL')?.impact ||
                         '—'}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recovery</p>
                      <p className="text-sm font-bold text-foreground">
                        {parsedData.key_metrics?.recovery_time ||
                         parsedData.scenarios?.find(s => s.risk_level === 'CRITICAL')?.recovery?.split(';')[0] ||
                         '—'}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Buffer</p>
                      <p className="text-sm font-bold text-primary">
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
              className="grid md:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {parsedData.scenarios?.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`bg-card border rounded-xl p-5 ${
                    scenario.risk_level === 'CRITICAL'
                      ? 'border-primary/40'
                      : scenario.risk_level === 'HIGH'
                      ? 'border-primary/20'
                      : 'border-border'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ScenarioIcon id={scenario.id} />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{scenario.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{scenario.position}</p>
                      </div>
                    </div>
                    <RiskIndicator level={scenario.risk_level} />
                  </div>

                  {/* Stress Factor */}
                  <div className="bg-muted/30 rounded-lg p-3 mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Stress Factor</p>
                    <p className="text-xs text-foreground">{scenario.stress_factor}</p>
                  </div>

                  {/* Impact & Recovery */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Impact</p>
                      <p className="text-xs font-semibold text-primary">{scenario.impact}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Recovery</p>
                      <p className="text-xs font-semibold text-foreground">{scenario.recovery}</p>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="border-t border-border pt-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Verdict</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{scenario.verdict}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* SFO Recommendations */}
          {(parsedData.recommendations?.length ?? 0) > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  SFO Recommendations
                </h3>
              </div>

              <div className="space-y-3">
                {parsedData.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <PriorityBadge priority={rec.priority} />
                    <div className="flex-1">
                      <p className="text-xs text-foreground font-medium">{rec.action}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rec.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Taleb Antifragile Opportunity - "Profit from Crisis" */}
          {parsedData.antifragile_opportunity && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Antifragile Opportunity
                </h3>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                  TALEB FRAMEWORK
                </span>
              </div>

              {/* Concept Header */}
              <p className="text-xs font-semibold text-primary mb-2">
                {parsedData.antifragile_opportunity.concept}
              </p>

              {/* Taleb Principle */}
              <p className="text-sm text-muted-foreground mb-5 italic">
                {parsedData.antifragile_opportunity.taleb_principle}
              </p>

              {/* Main Metrics Grid */}
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                {/* Opportunity Capital */}
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Opportunity Capital</p>
                  <p className="text-lg font-bold text-primary">
                    {parsedData.antifragile_opportunity.opportunity_capital.recommended_buffer}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {parsedData.antifragile_opportunity.opportunity_capital.buffer_multiple}
                  </p>
                </div>

                {/* Distressed Buying Power - from crisis_scenario */}
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Distressed Buying Power</p>
                  <p className="text-lg font-bold text-foreground">
                    {parsedData.antifragile_opportunity.crisis_scenario.your_buying_power}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {parsedData.antifragile_opportunity.crisis_scenario.trigger}
                  </p>
                </div>

                {/* Instant Equity Gain - from crisis_scenario */}
                <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/40">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Instant Equity Gain</p>
                  <p className="text-lg font-bold text-primary">
                    {parsedData.antifragile_opportunity.crisis_scenario.instant_equity_gain}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {parsedData.antifragile_opportunity.crisis_scenario.equivalent_roi}
                  </p>
                </div>
              </div>

              {/* Comparison: Fragile vs Resilient vs Antifragile */}
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Position Spectrum</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1 flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Fragile:</span> {parsedData.antifragile_opportunity.comparison.fragile}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground mt-1 flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Resilient:</span> {parsedData.antifragile_opportunity.comparison.resilient}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <p className="text-[10px] text-muted-foreground">
                      <span className="font-semibold text-primary">Antifragile:</span> {parsedData.antifragile_opportunity.comparison.antifragile}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Required + Upside */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-card rounded-lg p-3 border border-border">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Action Required</p>
                  <p className="text-xs text-foreground">{parsedData.antifragile_opportunity.action_required}</p>
                </div>
                <div className="flex-1 bg-primary/10 rounded-lg p-3 border border-primary/30">
                  <p className="text-[9px] uppercase tracking-wider text-primary font-bold mb-1">Upside If Crisis</p>
                  <p className="text-xs text-foreground font-medium">{parsedData.antifragile_opportunity.upside_if_crisis}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Position Comparison: Fragile vs Resilient vs Antifragile */}
          {parsedData.position_comparison && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Your Position in Crisis
                </h3>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {/* Fragile */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                  parsedData.position_comparison.current_position === 'fragile'
                    ? 'bg-muted/50 border-muted-foreground'
                    : 'bg-muted/20 border-border opacity-60'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      parsedData.position_comparison.current_position === 'fragile' ? 'bg-muted-foreground' : 'bg-muted'
                    }`} />
                    <p className="text-xs font-bold text-foreground uppercase">Fragile</p>
                    {parsedData.position_comparison.current_position === 'fragile' && (
                      <span className="text-[8px] bg-muted-foreground text-background px-1.5 py-0.5 rounded font-bold">YOU</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {parsedData.position_comparison.fragile?.description || "Harmed by volatility. Forced to sell at bottom."}
                  </p>
                </div>

                {/* Resilient */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                  parsedData.position_comparison.current_position === 'resilient'
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-muted/20 border-border opacity-60'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      parsedData.position_comparison.current_position === 'resilient' ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <p className="text-xs font-bold text-foreground uppercase">Resilient</p>
                    {parsedData.position_comparison.current_position === 'resilient' && (
                      <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">YOU</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {parsedData.position_comparison.resilient?.description || "Survives volatility. Maintains position through crisis."}
                  </p>
                </div>

                {/* Antifragile */}
                <div className={`rounded-lg p-4 border-2 transition-all ${
                  parsedData.position_comparison.current_position === 'antifragile'
                    ? 'bg-primary/20 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'bg-muted/20 border-border opacity-60'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      parsedData.position_comparison.current_position === 'antifragile' ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <p className="text-xs font-bold text-foreground uppercase">Antifragile</p>
                    {parsedData.position_comparison.current_position === 'antifragile' && (
                      <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">YOU</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
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
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] text-muted-foreground">
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
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            CRISIS RESILIENCE STRESS TEST
          </h2>
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
            Economic Scenarios
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          How your wealth structure survives worst-case economic events
        </p>
      </motion.div>

      <motion.div
        className="bg-card border border-border rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="prose prose-sm max-w-none">
          {paragraphs.map((paragraph, idx) => {
            // Clean up markdown-style formatting
            const cleaned = paragraph
              .replace(/\*\*/g, '')
              .replace(/^\s*[-•→]\s*/gm, '• ')
              .trim();

            return (
              <p key={idx} className="text-xs text-muted-foreground leading-relaxed mb-3 last:mb-0 whitespace-pre-wrap">
                {cleaned}
              </p>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="flex items-center justify-center gap-2 pt-4"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <p className="text-[10px] text-muted-foreground">
          Grounded in HNWI Chronicles KG Historical Precedents + Stress Models
        </p>
      </motion.div>
    </div>
  );
}
