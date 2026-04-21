"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle,
  Clock3,
  Gauge,
  Radar,
  Shield,
  Siren,
  TriangleAlert,
} from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';
import { memoNumberClass } from '@/lib/decision-memo/memo-design-tokens';

interface CrisisResilienceSectionProps {
  crisisData?: Record<string, unknown>;
  content?: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

interface NormalizedScenario {
  id: string;
  name: string;
  position?: string;
  probability?: string;
  impact?: string;
  recovery?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  stressFactor?: string;
  verdict?: string;
  historicalPrecedent?: string;
  teciAmplifier?: string;
  impactChannels: string[];
  sources: string[];
  decisionWindowDays?: number;
}

interface NormalizedDetailItem {
  id: string;
  label: string;
  status?: string;
  detail?: string;
  routeScope?: string;
  decisionWindowDays?: number;
  impactChannels: string[];
}

interface NormalizedRecommendation {
  priority: string;
  action: string;
  rationale?: string;
}

export interface NormalizedCrisisData {
  overall: {
    score?: number;
    rating?: string;
    summary?: string;
    worstCaseLoss?: string;
    recoveryTime?: string;
    bufferRequired?: string;
    keyVulnerabilities: string[];
  };
  liveRead?: string;
  executionFocus?: string;
  macroRegime?: string;
  crisisVerdict?: string;
  operatingWindow?: string;
  scenarios: NormalizedScenario[];
  recommendations: NormalizedRecommendation[];
  priorityEvents: NormalizedDetailItem[];
  routeRisks: NormalizedDetailItem[];
  decisionFlags: string[];
  marketRegimes: NormalizedDetailItem[];
  sourceFamilies: string[];
  decisionWindowDays?: number;
  stressDrawdownFloorPct?: number;
  eventCount?: number;
  marketRegimeCount?: number;
  sourceCount?: number;
  bottomLine?: {
    surviveVerdict?: string;
    thriveVerdict?: string;
    oneSentence?: string;
  };
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return String(
          record.label ||
          record.title ||
          record.name ||
          record.note ||
          record.description ||
          record.event ||
          ""
        ).trim();
      }
      return "";
    })
    .filter(Boolean);
}

function riskLevel(value: unknown): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const label = String(value || "").trim().toUpperCase();
  if (label === "CRITICAL") return "CRITICAL";
  if (label === "HIGH" || label === "RED") return "HIGH";
  if (label === "LOW" || label === "GREEN") return "LOW";
  return "MEDIUM";
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function canonicalSourceFamily(value: unknown): string {
  const text = String(value || "").trim();
  if (!text) return "";
  const lowered = text.toLowerCase();
  if (lowered === "crisis_bundle" || lowered === "crisis_event") return "Crisis World-State Rail";
  if (lowered === "market_regime") return "Gulf Energy Market Rail";
  if (lowered.includes("crisis world-state") || lowered.includes("crisis rail")) return "Crisis World-State Rail";
  if (lowered.includes("castle")) return "Castle Transaction Cases";
  if (lowered.includes("pattern")) return "Pattern Intelligence";
  if (lowered.includes("kgv2.1") || lowered.includes("analytical surface")) return "KGv2.1 Analytical Surface";
  if (lowered.includes("kgv3") || lowered.includes("validated market")) return "KGv3 Validated Market Surface";
  if (lowered.includes("route metric")) return "Route Metric Packet";
  if (lowered.includes("gulf energy") || lowered.includes("brent") || lowered.includes("oil")) return "Gulf Energy Market Rail";
  return text;
}

function normalizeDetailItems(value: unknown): NormalizedDetailItem[] {
  if (!Array.isArray(value)) return [];
  const normalized: Array<NormalizedDetailItem | undefined> = value.map((item, index) => {
      if (typeof item === "string") {
        const label = item.trim();
        return label
          ? { id: `${label}-${index}`, label, impactChannels: [] }
          : undefined;
      }
      if (!item || typeof item !== "object") return undefined;
      const record = item as Record<string, unknown>;
      const label = String(record.label || record.title || record.name || record.event || "").trim();
      if (!label) return undefined;
      return {
        id: String(record.event_id || record.regime_id || record.id || label),
        label,
        status: String(record.status || record.risk_level || record.severity || record.magnitude || "").trim() || undefined,
        detail: String(record.detail || record.description || record.note || record.impact || record.movement || "").trim() || undefined,
        routeScope: String(record.route_scope || record.jurisdiction || "").trim() || undefined,
        decisionWindowDays: toFiniteNumber(record.decision_window_days),
        impactChannels: toStringList(record.impact_channels),
      };
    });
  return normalized.filter((item): item is NormalizedDetailItem => item !== undefined);
}

function parseEmbeddedJson(content?: string): Record<string, unknown> | undefined {
  if (!content) return undefined;
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeCrisisData(
  input?: Record<string, unknown>,
  content?: string,
): NormalizedCrisisData | undefined {
  const parsed = input && Object.keys(input).length > 0 ? input : parseEmbeddedJson(content);
  if (!parsed) return undefined;

  const overallRecord = (parsed.overall_resilience || parsed.resilience_assessment || {}) as Record<string, unknown>;
  const commanderBrief = (parsed.commander_brief || {}) as Record<string, unknown>;
  const keyMetrics = (parsed.key_metrics || {}) as Record<string, unknown>;
  const bottomLine = (parsed.bottom_line || {}) as Record<string, unknown>;

  const scenarios = (Array.isArray(parsed.scenarios) ? parsed.scenarios : [])
    .filter((scenario): scenario is Record<string, unknown> => Boolean(scenario && typeof scenario === "object"))
    .map((scenario, index) => ({
      id: String(scenario.id || scenario.event_id || scenario.name || `scenario_${index + 1}`),
      name: String(scenario.name || scenario.title || scenario.label || `Scenario ${index + 1}`),
      position: typeof scenario.position === "string" ? scenario.position : undefined,
      probability: typeof scenario.probability === "string" ? scenario.probability : undefined,
      impact:
        typeof scenario.impact === "string"
          ? scenario.impact
          : typeof scenario.portfolio_drawdown === "string"
            ? scenario.portfolio_drawdown
            : undefined,
      recovery: typeof scenario.recovery === "string" ? scenario.recovery : undefined,
      riskLevel: riskLevel(scenario.risk_level || scenario.severity || scenario.status),
      stressFactor:
        typeof scenario.stress_factor === "string"
          ? scenario.stress_factor
          : typeof scenario.impact_on_thesis === "string"
            ? scenario.impact_on_thesis
            : typeof scenario.why_this_matters === "string"
              ? scenario.why_this_matters
              : undefined,
      verdict:
        typeof scenario.verdict === "string"
          ? scenario.verdict
          : typeof scenario.mitigation === "string"
            ? scenario.mitigation
            : undefined,
      historicalPrecedent:
        typeof scenario.historical_precedent === "string" ? scenario.historical_precedent : undefined,
      teciAmplifier:
        typeof scenario.teci_amplifier === "string" ? scenario.teci_amplifier : undefined,
      impactChannels: toStringList(scenario.impact_channels),
      sources: dedupe(toStringList(scenario.sources).map(canonicalSourceFamily).filter(Boolean)),
      decisionWindowDays: toFiniteNumber(scenario.decision_window_days),
    }));

  const recommendations = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      priority: String(item.priority || "SHORT_TERM").toUpperCase(),
      action: String(item.action || "").trim(),
      rationale: String(item.rationale || item.context || item.note || "").trim() || undefined,
    }))
    .filter((item) => item.action);

  const priorityEvents = normalizeDetailItems(parsed.priority_events);
  const routeRisks = normalizeDetailItems(parsed.route_risks);
  const marketRegimes = normalizeDetailItems(parsed.market_regimes);

  const sourceFamilies = dedupe([
    ...toStringList(parsed.source_families).map(canonicalSourceFamily),
    ...toStringList(commanderBrief.source_families).map(canonicalSourceFamily),
    ...scenarios.flatMap((scenario) => scenario.sources),
  ].filter(Boolean));

  const worstCaseLoss =
    (typeof keyMetrics.worst_case_loss === "string" ? keyMetrics.worst_case_loss : undefined) ||
    (typeof overallRecord.worst_case_loss === "string" ? overallRecord.worst_case_loss : undefined) ||
    scenarios.find((scenario) => scenario.riskLevel === "CRITICAL" || scenario.riskLevel === "HIGH")?.impact;

  const recoveryTime =
    (typeof keyMetrics.recovery_time === "string" ? keyMetrics.recovery_time : undefined) ||
    (typeof overallRecord.recovery_time === "string" ? overallRecord.recovery_time : undefined) ||
    scenarios.find((scenario) => scenario.recovery)?.recovery;

  const bufferRequired =
    (typeof keyMetrics.required_buffer === "string" ? keyMetrics.required_buffer : undefined) ||
    (typeof keyMetrics.cash_buffer_needed === "string" ? keyMetrics.cash_buffer_needed : undefined) ||
    (typeof overallRecord.buffer_required === "string" ? overallRecord.buffer_required : undefined) ||
    (toFiniteNumber(parsed.stress_drawdown_floor_pct) !== undefined
      ? `${toFiniteNumber(parsed.stress_drawdown_floor_pct)?.toFixed(0)}% drawdown floor + external treasury outside the asset`
      : undefined);

  return {
    overall: {
      score: toFiniteNumber(overallRecord.score),
      rating: typeof overallRecord.rating === "string" ? overallRecord.rating : undefined,
      summary:
        (typeof overallRecord.summary === "string" ? overallRecord.summary : undefined) ||
        (typeof commanderBrief.route_read === "string" ? commanderBrief.route_read : undefined) ||
        (typeof parsed.alert_summary === "string" ? parsed.alert_summary : undefined),
      worstCaseLoss,
      recoveryTime,
      bufferRequired,
      keyVulnerabilities: dedupe([
        ...toStringList(overallRecord.key_vulnerabilities),
        typeof commanderBrief.execution_focus === "string" ? commanderBrief.execution_focus : "",
        typeof commanderBrief.macro_regime === "string" ? commanderBrief.macro_regime : "",
      ]),
    },
    liveRead:
      (typeof commanderBrief.route_read === "string" ? commanderBrief.route_read : undefined) ||
      (typeof parsed.alert_summary === "string" ? parsed.alert_summary : undefined),
    executionFocus: typeof commanderBrief.execution_focus === "string" ? commanderBrief.execution_focus : undefined,
    macroRegime: typeof commanderBrief.macro_regime === "string" ? commanderBrief.macro_regime : undefined,
    crisisVerdict:
      (typeof commanderBrief.crisis_verdict === "string" ? commanderBrief.crisis_verdict : undefined) ||
      (typeof bottomLine.one_sentence === "string" ? bottomLine.one_sentence : undefined),
    operatingWindow: typeof commanderBrief.operating_window === "string" ? commanderBrief.operating_window : undefined,
    scenarios,
    recommendations,
    priorityEvents,
    routeRisks,
    decisionFlags: toStringList(parsed.decision_flags),
    marketRegimes,
    sourceFamilies,
    decisionWindowDays: toFiniteNumber(parsed.decision_window_days),
    stressDrawdownFloorPct: toFiniteNumber(parsed.stress_drawdown_floor_pct),
    eventCount: toFiniteNumber(parsed.event_count) ?? priorityEvents.length ?? scenarios.length,
    marketRegimeCount: toFiniteNumber(parsed.market_regime_count) ?? marketRegimes.length,
    sourceCount: toFiniteNumber(parsed.source_count) ?? sourceFamilies.length,
    bottomLine: {
      surviveVerdict: typeof bottomLine.survive_verdict === "string" ? bottomLine.survive_verdict : undefined,
      thriveVerdict: typeof bottomLine.thrive_verdict === "string" ? bottomLine.thrive_verdict : undefined,
      oneSentence: typeof bottomLine.one_sentence === "string" ? bottomLine.one_sentence : undefined,
    },
  };
}

function RiskBadge({ level }: { level: NormalizedScenario["riskLevel"] }) {
  const styles: Record<NormalizedScenario["riskLevel"], string> = {
    LOW: "border-border/20 text-muted-foreground/70",
    MEDIUM: "border-amber-500/20 text-amber-500/80",
    HIGH: "border-primary/20 text-primary/80",
    CRITICAL: "border-red-500/20 text-red-500/80",
  };
  return (
    <span className={`inline-flex text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${styles[level]}`}>
      {level}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const key = priority.toUpperCase();
  const styles =
    key === "IMMEDIATE"
      ? "border-primary/20 text-primary/80"
      : key === "LONG_TERM"
        ? "border-border/20 text-muted-foreground/60"
        : "border-border/20 text-muted-foreground/80";
  return (
    <span className={`inline-flex text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border whitespace-nowrap ${styles}`}>
      {key.replace("_", " ")}
    </span>
  );
}

function ResilienceGauge({ score = 0, rating = "MODERATE" }: { score?: number; rating?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime = 0;
    const duration = 1200;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, score]);

  const ring = Math.PI * 54;
  const offset = ring - (ring * Math.max(0, Math.min(100, score))) / 100;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-44 h-[90px]">
        <svg viewBox="0 0 128 76" className="w-full h-full overflow-visible">
          <path d="M 10 66 A 54 54 0 0 1 118 66" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
          <motion.path
            d="M 10 66 A 54 54 0 0 1 118 66"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={ring}
            strokeLinecap="round"
            className="text-primary"
            initial={{ strokeDashoffset: ring }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className={memoNumberClass('hero', 'default')}>{animatedScore}</span>
          <span className="text-sm text-muted-foreground/60">/100</span>
        </div>
      </div>
      <span className="mt-3 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/80">
        {rating}
      </span>
    </div>
  );
}

export function CrisisResilienceSection({
  crisisData,
  content,
  sourceJurisdiction = "",
  destinationJurisdiction = "",
}: CrisisResilienceSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const normalized = useMemo(
    () => normalizeCrisisData(crisisData, content),
    [crisisData, content],
  );

  if (!normalized) return null;

  const corridorLabel = [sourceJurisdiction, destinationJurisdiction].filter(Boolean).join(" → ");

  return (
    <div ref={sectionRef}>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          Crisis Resilience Stress Test
        </h2>
        <div className="h-px bg-border" />
      </motion.div>

      <div className="space-y-8 sm:space-y-12">
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-8 md:px-12 py-10 md:py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.05, ease: EASE_OUT_EXPO }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <ResilienceGauge score={normalized.overall.score} rating={normalized.overall.rating} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                Overall Resilience Assessment
              </p>
              <p className="text-sm text-muted-foreground/60 mb-6 leading-loose sm:leading-relaxed">
                {normalized.overall.summary || "Live corridor stress requires re-underwriting."}
              </p>

              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Worst Case</p>
                  <p className={memoNumberClass('small', 'default')}>{normalized.overall.worstCaseLoss || "—"}</p>
                </div>
                <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Recovery</p>
                  <p className={memoNumberClass('small', 'default')}>{normalized.overall.recoveryTime || "—"}</p>
                </div>
                <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Decision Window</p>
                  <p className={memoNumberClass('small', 'default')}>
                    {normalized.decisionWindowDays ? `${normalized.decisionWindowDays} days` : normalized.operatingWindow || "—"}
                  </p>
                </div>
                <div className="text-center rounded-xl border border-primary/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Drawdown Floor</p>
                  <p className={memoNumberClass('small', 'default')}>
                    {normalized.stressDrawdownFloorPct !== undefined ? `${normalized.stressDrawdownFloorPct.toFixed(0)}%` : normalized.overall.bufferRequired || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_OUT_EXPO }}
        >
          <div className="rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-8 py-8">
            <div className="flex items-center gap-3 mb-5">
              <Radar className="w-4 h-4 text-primary/60" />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Live Crisis Read</p>
            </div>
            <p className="text-sm text-foreground leading-loose sm:leading-relaxed">
              {normalized.liveRead || normalized.crisisVerdict || "Crisis read unavailable."}
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent my-6" />
            <div className="space-y-4">
              {normalized.executionFocus && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Execution Focus</p>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{normalized.executionFocus}</p>
                </div>
              )}
              {normalized.macroRegime && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Macro Regime</p>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{normalized.macroRegime}</p>
                </div>
              )}
              {normalized.crisisVerdict && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Crisis Verdict</p>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{normalized.crisisVerdict}</p>
                </div>
              )}
              {corridorLabel && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Corridor</p>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{corridorLabel}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/30 overflow-hidden px-6 py-8">
            <div className="flex items-center gap-3 mb-5">
              <Siren className="w-4 h-4 text-primary/60" />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Intelligence Rails</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center rounded-xl border border-border/20 bg-card/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Events</p>
                <p className={memoNumberClass('stat', 'default')}>{normalized.eventCount ?? normalized.scenarios.length}</p>
              </div>
              <div className="text-center rounded-xl border border-border/20 bg-card/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Regimes</p>
                <p className={memoNumberClass('stat', 'default')}>{normalized.marketRegimeCount ?? normalized.marketRegimes.length}</p>
              </div>
              <div className="text-center rounded-xl border border-border/20 bg-card/50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Sources</p>
                <p className={memoNumberClass('stat', 'default')}>{normalized.sourceCount ?? normalized.sourceFamilies.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {normalized.sourceFamilies.map((family) => (
                <span key={family} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/80">
                  {family}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {normalized.scenarios.length > 0 && (
          <motion.div
            className="grid lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT_EXPO }}
          >
            {normalized.scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                className="relative rounded-xl border border-border/20 bg-card/50 p-6 transition-all duration-300"
                initial={{ opacity: 0, y: 12 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + index * 0.08, duration: 0.7, ease: EASE_OUT_EXPO }}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h4 className="text-sm font-medium text-foreground leading-snug">{scenario.name}</h4>
                    {scenario.position && (
                      <p className="text-xs text-muted-foreground/60 mt-1">{scenario.position}</p>
                    )}
                  </div>
                  <RiskBadge level={scenario.riskLevel} />
                </div>

                {scenario.stressFactor && (
                  <div className="rounded-lg border border-border/20 bg-card/50 p-4 mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Stress Factor</p>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">{scenario.stressFactor}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Impact</p>
                    <p className="text-sm font-medium text-primary">{scenario.impact || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Recovery</p>
                    <p className="text-sm font-medium text-foreground">{scenario.recovery || "—"}</p>
                  </div>
                </div>

                {scenario.impactChannels.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Impact Channels</p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.impactChannels.map((channel) => (
                        <span key={channel} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/80">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(scenario.historicalPrecedent || scenario.teciAmplifier) && (
                  <div className="rounded-lg border border-primary/10 bg-card/50 p-4 mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Crisis Intelligence Read</p>
                    {scenario.historicalPrecedent && (
                      <p className="text-sm text-muted-foreground/60 leading-relaxed mb-2">{scenario.historicalPrecedent}</p>
                    )}
                    {scenario.teciAmplifier && (
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">{scenario.teciAmplifier}</p>
                    )}
                  </div>
                )}

                {scenario.verdict && (
                  <div className="pt-4">
                    <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">Verdict</p>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed">{scenario.verdict}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {(normalized.priorityEvents.length > 0 || normalized.routeRisks.length > 0 || normalized.marketRegimes.length > 0 || normalized.decisionFlags.length > 0) && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
          >
            {normalized.decisionFlags.length > 0 && (
              <div className="rounded-2xl border border-border/30 overflow-hidden px-6 py-8">
                <div className="flex items-center gap-3 mb-5">
                  <TriangleAlert className="w-4 h-4 text-primary/60" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Decision Flags</p>
                </div>
                <div className="space-y-3">
                  {normalized.decisionFlags.map((flag) => (
                    <div key={flag} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border/30 overflow-hidden px-6 py-8">
                <div className="flex items-center gap-3 mb-5">
                  <Siren className="w-4 h-4 text-primary/60" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Priority Events</p>
                </div>
                <div className="space-y-4">
                  {normalized.priorityEvents.map((event) => (
                    <div key={event.id} className="rounded-xl border border-border/20 bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-foreground leading-relaxed">{event.label}</p>
                        {event.status && <RiskBadge level={riskLevel(event.status)} />}
                      </div>
                      {event.detail && <p className="text-sm text-muted-foreground/60 leading-relaxed">{event.detail}</p>}
                      {(event.routeScope || event.decisionWindowDays || event.impactChannels.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {event.routeScope && <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{event.routeScope}</span>}
                          {event.decisionWindowDays !== undefined && <span className="text-[11px] uppercase tracking-[0.15em] text-primary/80">{event.decisionWindowDays}d window</span>}
                          {event.impactChannels.map((channel) => (
                            <span key={channel} className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{channel}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/30 overflow-hidden px-6 py-8">
                <div className="flex items-center gap-3 mb-5">
                  <AlertTriangle className="w-4 h-4 text-primary/60" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Route Pressure Map</p>
                </div>
                <div className="space-y-4">
                  {normalized.routeRisks.map((risk) => (
                    <div key={risk.id} className="rounded-xl border border-border/20 bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-foreground leading-relaxed">{risk.label}</p>
                        {risk.status && <RiskBadge level={riskLevel(risk.status)} />}
                      </div>
                      {risk.detail && <p className="text-sm text-muted-foreground/60 leading-relaxed">{risk.detail}</p>}
                      {(risk.routeScope || risk.decisionWindowDays || risk.impactChannels.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {risk.routeScope && <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{risk.routeScope}</span>}
                          {risk.decisionWindowDays !== undefined && <span className="text-[11px] uppercase tracking-[0.15em] text-primary/80">{risk.decisionWindowDays}d window</span>}
                          {risk.impactChannels.map((channel) => (
                            <span key={channel} className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{channel}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/30 overflow-hidden px-6 py-8">
                <div className="flex items-center gap-3 mb-5">
                  <Gauge className="w-4 h-4 text-primary/60" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Market Regime</p>
                </div>
                <div className="space-y-4">
                  {normalized.marketRegimes.map((regime) => (
                    <div key={regime.id} className="rounded-xl border border-border/20 bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-foreground leading-relaxed">{regime.label}</p>
                        {regime.status && <RiskBadge level={riskLevel(regime.status)} />}
                      </div>
                      {regime.detail && <p className="text-sm text-muted-foreground/60 leading-relaxed">{regime.detail}</p>}
                      {(regime.routeScope || regime.decisionWindowDays || regime.impactChannels.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {regime.routeScope && <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{regime.routeScope}</span>}
                          {regime.decisionWindowDays !== undefined && <span className="text-[11px] uppercase tracking-[0.15em] text-primary/80">{regime.decisionWindowDays}d window</span>}
                          {regime.impactChannels.map((channel) => (
                            <span key={channel} className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">{channel}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {normalized.recommendations.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-4 h-4 text-primary/60" />
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Execution Recommendations</p>
            </div>
            <div className="space-y-5">
              {normalized.recommendations.map((recommendation, index) => (
                <div key={`${recommendation.priority}-${index}`} className="flex items-start gap-4">
                  <PriorityBadge priority={recommendation.priority} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed">{recommendation.action}</p>
                    {recommendation.rationale && (
                      <p className="text-sm text-muted-foreground/60 mt-1 leading-relaxed">{recommendation.rationale}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(normalized.bottomLine?.surviveVerdict || normalized.bottomLine?.thriveVerdict || normalized.bottomLine?.oneSentence) && (
          <motion.div
            className="rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">Bottom Line</p>
            <div className="grid lg:grid-cols-3 gap-4">
              {normalized.bottomLine?.surviveVerdict && (
                <div className="rounded-xl border border-border/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Survive</p>
                  <p className="text-sm text-foreground leading-relaxed">{normalized.bottomLine.surviveVerdict}</p>
                </div>
              )}
              {normalized.bottomLine?.thriveVerdict && (
                <div className="rounded-xl border border-border/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Thrive</p>
                  <p className="text-sm text-foreground leading-relaxed">{normalized.bottomLine.thriveVerdict}</p>
                </div>
              )}
              {normalized.bottomLine?.oneSentence && (
                <div className="rounded-xl border border-primary/20 bg-card/50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">One Sentence</p>
                  <p className="text-sm text-foreground leading-relaxed">{normalized.bottomLine.oneSentence}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          className="flex items-center justify-center gap-2 pt-2"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE_OUT_EXPO }}
        >
          <Clock3 className="w-3.5 h-3.5 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Grounded in HNWI Chronicles crisis world-state rail, castle transaction cases, pattern intelligence, and corridor execution data
          </p>
        </motion.div>
      </div>
    </div>
  );
}
