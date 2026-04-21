"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  GitBranch,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  Target,
  Calendar,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Info,
  Star
} from 'lucide-react';
import {
  ScenarioTreeData,
  BranchName,
  ConditionStatus,
  formatCurrency,
  formatPercentage,
  getBranchDisplayName,
  MarketValidation
} from '@/lib/decision-memo/sfo-expert-types';
import type { ScenarioTreeData as PdfScenarioTreeData } from '@/lib/pdf/pdf-types';
import { ViaNegativaContext } from '@/lib/decision-memo/memo-types';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';
import { memoNumberClass } from '@/lib/decision-memo/memo-design-tokens';

interface ScenarioTreeSectionProps {
  data?: ScenarioTreeData | PdfScenarioTreeData | Record<string, never>;
  rawAnalysis?: string;
  viaNegativa?: ViaNegativaContext;
}

// Helper function to parse markdown bold (**text**) and render as bold spans
function parseMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    // Odd indices are the bold parts (captured groups)
    if (index % 2 === 1) {
      return <span key={index} className="font-medium text-foreground">{part}</span>;
    }
    return part;
  });
}

function toNumericValue(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function distributeGateDays(count: number, decisionWindowDays: number): number[] {
  if (count <= 0) return [];
  const interval = decisionWindowDays / count;
  return Array.from({ length: count }, (_, index) => {
    const computed = Math.ceil((index + 1) * interval);
    return Math.max(1, Math.min(decisionWindowDays, computed));
  });
}

function recommendationStrengthLabel(strength: number): string {
  if (strength >= 0.75) return 'Primary';
  if (strength >= 0.5) return 'Qualified';
  if (strength >= 0.35) return 'Fallback';
  return 'Low';
}

function formatScenarioMetricValue(value: number): string {
  return formatCurrency(value);
}

function buildStructuredScenarioTreeData(
  input?: ScenarioTreeSectionProps['data'],
  rawAnalysis?: string,
): ScenarioTreeData | undefined {
  if (!input || typeof input !== 'object') return undefined;

  const raw = input as Record<string, any>;
  if (Array.isArray(raw.branches) && raw.branches.length > 0) {
    return raw as ScenarioTreeData;
  }

  const recommendedBranch = String(raw.recommended_branch || '').toUpperCase() as BranchName;
  if (!recommendedBranch) return undefined;

  const criticalGates = Array.isArray(raw.critical_gates) ? raw.critical_gates.filter(Boolean) : [];
  const abortTriggers = Array.isArray(raw.abort_triggers) ? raw.abort_triggers.filter(Boolean) : [];
  const scenarioWeights = raw.scenario_weights || {};
  const decisionWindowDays = toNumericValue(raw.decision_window_days) || 30;
  const gateDays = distributeGateDays(criticalGates.length, decisionWindowDays);
  const decisionEvUsd = toNumericValue(raw.decision_ev_usd) ?? toNumericValue(raw.expected_value_usd) ?? 0;
  const valueBasisLabel = typeof raw.value_basis_label === 'string' ? raw.value_basis_label : 'Modeled Route Outcome';
  const valueBasisNote = typeof raw.value_basis_note === 'string'
    ? raw.value_basis_note
    : 'Branch values below use one comparable basis: modeled route-outcome value under the corridor benchmark, separate from the dedicated 10-year wealth projection surface.';
  const decisionEvLabel = typeof raw.decision_ev_label === 'string' ? raw.decision_ev_label : 'Validated Route Decision EV';
  const decisionEvNote = typeof raw.decision_ev_note === 'string'
    ? raw.decision_ev_note
    : 'Weighted across base / stress / opportunity cases using the validated route probabilities.';
  const baseCase = raw.base_case || {};
  const stressCase = raw.stress_case || {};
  const opportunityCase = raw.opportunity_case || {};
  const inactionCase = raw.inaction_case || {};

  const buildOutcomes = (expectedValue: number) => ([
    {
      scenario: 'BASE_CASE',
      probability: toNumericValue(scenarioWeights.base) || 0.45,
      net_outcome: toNumericValue(baseCase.year_terminal_value_usd) || expectedValue,
      description: baseCase.assumptions || 'Base corridor case.',
    },
    {
      scenario: 'STRESS_CASE',
      probability: toNumericValue(scenarioWeights.stress) || 0.35,
      net_outcome: toNumericValue(stressCase.year_terminal_value_usd) || 0,
      description: stressCase.assumptions || 'Stress corridor case.',
      stress_calibration: stressCase.assumptions || undefined,
    },
    {
      scenario: 'OPPORTUNITY_CASE',
      probability: toNumericValue(scenarioWeights.opportunity) || 0.2,
      net_outcome: toNumericValue(opportunityCase.year_terminal_value_usd) || expectedValue,
      description: opportunityCase.assumptions || 'Opportunity corridor case.',
    },
  ]);

  const proceedModifiedExpected =
    toNumericValue(baseCase.year_terminal_value_usd) ??
    decisionEvUsd;
  const proceedNowExpected =
    toNumericValue(raw.proceed_now_expected_value) ??
    toNumericValue(stressCase.year_terminal_value_usd) ??
    0;
  const doNotProceedExpected =
    toNumericValue(raw.do_not_proceed_expected_value) ??
    toNumericValue(inactionCase.terminal_value_usd) ??
    0;

  const branches: ScenarioTreeData['branches'] = [
    {
      name: 'PROCEED_MODIFIED',
      recommendation_strength: recommendedBranch === 'PROCEED_MODIFIED' ? 0.84 : 0.58,
      conditions: criticalGates.map((condition) => ({ condition, status: 'CONDITIONAL' as ConditionStatus })),
      outcomes: buildOutcomes(proceedModifiedExpected),
      expected_value: proceedModifiedExpected,
      expected_value_note: 'Modeled route-outcome value if the validated route clears the full gate set.',
      verdict: 'Proceed only after the critical gates clear and the validated route remains intact.',
      verdict_conditions: criticalGates.slice(0, 4),
    },
    {
      name: 'PROCEED_NOW',
      recommendation_strength: recommendedBranch === 'PROCEED_NOW' ? 0.76 : 0.34,
      conditions: criticalGates.slice(0, 3).map((condition) => ({ condition, status: 'MODELED' as ConditionStatus })),
      outcomes: buildOutcomes(proceedNowExpected),
      expected_value: proceedNowExpected,
      expected_value_note: 'Modeled route-outcome value if the room hardens the unmodified route under live corridor stress.',
      verdict: 'Only choose this if the room is explicitly accepting the unmodified route risk.',
      verdict_conditions: criticalGates.slice(0, 2),
    },
    {
      name: 'DO_NOT_PROCEED',
      recommendation_strength: recommendedBranch === 'DO_NOT_PROCEED' ? 0.8 : 0.42,
      conditions: abortTriggers.map((condition) => ({ condition, status: 'BLOCKED' as ConditionStatus })),
      outcomes: [
        {
          scenario: 'CAPITAL_PRESERVED',
          probability: 1,
          net_outcome: doNotProceedExpected,
          description: 'Preserve capital rather than force a broken route.',
          survival_advantage: {
            survives_2008_scenario: true,
            survives_regulatory_shock: true,
            zero_ruin_probability: true,
          },
        },
      ],
      expected_value: doNotProceedExpected,
      expected_value_note: 'Modeled route-outcome value if capital stays outside the route and compounds conservatively.',
      verdict: 'Do not proceed if any abort trigger remains unresolved.',
      verdict_conditions: abortTriggers,
    },
  ];

  return {
    branches,
    recommended_branch: recommendedBranch,
    value_basis_label: valueBasisLabel,
    value_basis_note: valueBasisNote,
    decision_ev_label: decisionEvLabel,
    decision_ev_usd: decisionEvUsd,
    decision_ev_note: decisionEvNote,
    rationale: [
      rawAnalysis?.match(/\*\*Verdict Rationale:\*\*\s*([^\n]+)/i)?.[1]?.trim() ||
        'The route should only harden after structure, tax, banking, and underwriting gates are cleared.',
      `Validated route decision EV is ${formatCurrency(decisionEvUsd)} across the base / stress / opportunity mix.`,
      `${criticalGates.length} critical gates govern the route before capital moves.`,
      `Decision window holds for ${decisionWindowDays} days before the route must be re-underwritten.`,
    ].filter(Boolean),
    decision_gates: criticalGates.map((gate, index) => ({
      gate_number: index + 1,
      day: gateDays[index] || decisionWindowDays,
      check: gate,
      if_pass: index === criticalGates.length - 1 ? 'Proceed to closing on the validated route.' : 'Advance to the next critical gate.',
      if_fail: 'Pause the route and remediate before any capital is transferred.',
    })),
    expiry: {
      days: decisionWindowDays,
      reassess_triggers: [
        'Market shift >10%',
        'New regulations',
        'Counterparty changes',
      ],
    },
    decision_matrix: [
      {
        branch: 'Proceed Modified',
        expected_value: formatCurrency(proceedModifiedExpected),
        risk_level: 'MEDIUM',
        recommended_if: 'All critical gates clear inside the live decision window.',
      },
      {
        branch: 'Proceed Now',
        expected_value: formatCurrency(proceedNowExpected),
        risk_level: 'HIGH',
        recommended_if: 'Only if the room knowingly accepts the unmodified route risk.',
      },
      {
        branch: 'Do Not Proceed',
        expected_value: formatCurrency(doNotProceedExpected),
        risk_level: 'LOW',
        recommended_if: 'Choose this if any abort trigger survives remediation.',
      },
    ],
  };
}

// Branch strength indicator (visual bars) — animated stagger fill
function StrengthIndicator({ strength, animate = false }: { strength: number; animate?: boolean }) {
  const bars = Math.round(strength * 5);

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${i <= bars ? 'bg-primary/60' : 'bg-muted/20'}`}
            initial={animate ? { height: 0 } : { height: 12 }}
            animate={{ height: 12 }}
            transition={animate ? { delay: i * 0.08, duration: 0.3, ease: EASE_OUT_EXPO } : {}}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground/60 ml-1">
        {recommendationStrengthLabel(strength)}
      </span>
    </div>
  );
}

// Condition status badge
function ConditionBadge({ status }: { status: ConditionStatus }) {
  const config: Record<ConditionStatus, { icon: React.ReactNode; color: string; label: string }> = {
    MET: { icon: <CheckCircle className="w-3 h-3" />, color: 'border-primary/20 text-primary/80', label: 'Met' },
    CONFIRMED: { icon: <CheckCircle className="w-3 h-3" />, color: 'border-primary/20 text-primary/80', label: 'Confirmed' },
    CONDITIONAL: { icon: <RefreshCw className="w-3 h-3" />, color: 'border-amber-500/20 text-amber-500/80', label: 'Conditional' },
    MODELED: { icon: <Info className="w-3 h-3" />, color: 'border-border/20 text-muted-foreground/80', label: 'Modeled' },
    PENDING: { icon: <AlertTriangle className="w-3 h-3" />, color: 'border-border/20 text-muted-foreground/80', label: 'Pending' },
    BLOCKED: { icon: <XCircle className="w-3 h-3" />, color: 'border-border/20 text-muted-foreground/60', label: 'Blocked' }
  };

  const { icon, color, label } = config[status] || config.PENDING;

  return (
    <span className={`inline-flex items-center gap-1 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${color}`}>
      {icon}
      {label}
    </span>
  );
}

// Branch card component — with hover lift and animated strength bars
function BranchCard({
  branch,
  isRecommended,
  index,
  valueBasisLabel
}: {
  branch: ScenarioTreeData['branches'][0];
  isRecommended: boolean;
  index: number;
  valueBasisLabel?: string;
}) {
  const icons: Record<BranchName, React.ReactNode> = {
    PROCEED_NOW: <CheckCircle className="w-4 h-4 text-primary/60" />,
    PROCEED_MODIFIED: <AlertTriangle className="w-4 h-4 text-amber-500/60" />,
    DO_NOT_PROCEED: <XCircle className="w-4 h-4 text-red-500/60" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`
        relative rounded-[24px] border border-border/20 bg-card/50 p-5 sm:p-6 lg:p-7 transition-all duration-300
        ${isRecommended ? 'border-primary/30' : ''}
      `}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <motion.div
          className="absolute -top-3 inset-x-0 flex justify-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + index * 0.12, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-emerald-500/20 text-emerald-500/80 bg-card inline-flex items-center gap-1">
            <Star className="w-3 h-3 inline" /> Recommended
          </span>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {icons[branch.name]}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-medium text-foreground break-words leading-snug">{getBranchDisplayName(branch.name)}</h4>
            <div className="mt-1">
              <StrengthIndicator strength={branch.recommendation_strength} animate />
            </div>
          </div>
        </div>
      </div>

      {/* Value basis — hero treatment */}
      <div className="mb-4 pt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{valueBasisLabel || 'Expected Value'}</p>
        <p className={memoNumberClass('metric', branch.expected_value >= 0 ? 'default' : 'muted')}>
          {formatScenarioMetricValue(branch.expected_value)}
        </p>
        {branch.expected_value_note && (
          <p className="text-sm text-muted-foreground/60 italic mt-2 leading-relaxed">
            {branch.expected_value_note}
          </p>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-3 mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Conditions</p>
        {branch.conditions.slice(0, 4).map((condition, i) => (
          <motion.div
            key={i}
            className="flex flex-col sm:flex-row sm:items-start gap-2 rounded-lg p-3 sm:p-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.12 + i * 0.06, duration: 0.4 }}
          >
            <div className="flex-shrink-0">
              <ConditionBadge status={condition.status} />
            </div>
            <span className="text-sm text-muted-foreground/60 flex-1 leading-loose sm:leading-relaxed break-words pt-0.5">{condition.condition}</span>
          </motion.div>
        ))}
      </div>

      {/* Verdict */}
      <div className="pt-3">
        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-3" />
        <p className="text-xs sm:text-sm text-foreground/60 font-normal leading-relaxed">{parseMarkdownBold(branch.verdict)}</p>
      </div>
    </motion.div>
  );
}

// Decision gate timeline item — animated connector draw
function GateItem({ gate, index, total }: { gate: ScenarioTreeData['decision_gates'][0]; index: number; total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
      className="relative flex items-start gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.12, duration: 0.4, ease: EASE_OUT_EXPO }}
        >
          <span className="text-xs font-medium text-primary">{gate.gate_number}</span>
        </motion.div>
        {index < total - 1 && (
          <motion.div
            className="w-px bg-primary/10 absolute top-8 left-4"
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            transition={{ delay: index * 0.12 + 0.2, duration: 0.5, ease: EASE_OUT_EXPO }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <motion.div
          className="rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6 hover:border-border/30 transition-colors duration-300"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-xs font-medium text-foreground">Day {gate.day}</span>
          </div>
          <p className="text-sm text-foreground/60 font-normal mb-3 leading-loose sm:leading-relaxed">{gate.check}</p>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
            <div className="rounded-lg p-3 border border-primary/10">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-1.5">If Pass</p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed break-words">{gate.if_pass}</p>
            </div>
            <div className="rounded-lg p-3 border border-border/20">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">If Fail</p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed break-words">{gate.if_fail}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export const ScenarioTreeSection: React.FC<ScenarioTreeSectionProps> = ({
  data,
  rawAnalysis,
  viaNegativa
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  const normalizedStructuredData = buildStructuredScenarioTreeData(data, rawAnalysis);
  const hasStructuredData = Boolean(normalizedStructuredData?.branches?.length);
  const hasNarrativeAnalysis = rawAnalysis && rawAnalysis.trim().length > 0;

  // Filter out JSON blocks from markdown content
  const filterJsonFromMarkdown = (markdown: string): string => {
    // Remove JSON code blocks (```json ... ```)
    let filtered = markdown.replace(/```(?:json)?[\s\S]*?```/gi, '');
    // Remove standalone JSON objects at the end
    filtered = filtered.replace(/\n\s*\{[\s\S]*?"[a-z_]+"[\s\S]*\}\s*$/i, '');
    // Remove lines that look like pure JSON
    filtered = filtered.replace(/^\s*[\[\]{}",:\d]+\s*$/gm, '');
    return filtered.trim();
  };

  // Parse markdown sections for premium display - handles decorated borders (═══, ━━━) and various title formats
  const parseScenarioSections = (markdown: string) => {
    const sections: { number: string; title: string; content: string; type: 'path' | 'table' | 'decision' | 'text' }[] = [];
    const lines = markdown.split('\n');
    let currentSection: { number: string; title: string; content: string[]; type: 'path' | 'table' | 'decision' | 'text' } | null = null;
    let sectionCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = lines[i - 1] || '';

      // Skip pure border lines
      if (line.match(/^[═━─]+$/) || line.match(/^[\s]*$/)) {
        continue;
      }

      // Detect various section header patterns
      const mdSectionMatch = line.match(/^#+\s+(\d+)\.\s+(.+)/);
      const branchMatch = line.match(/^BRANCH\s+(\d+):\s+(.+)/i);
      const decisionMatch = line.match(/^DECISION\s+(TREE|GATES|MATRIX)\s*(?:VISUALIZATION)?:?\s*(.*)$/i);
      const allCapsSection = line.match(/^([A-Z][A-Z\s_-]+)(?:\s*\(|:|\s*$)/) && !line.match(/^[═━─]+$/);
      const isAfterBorder = prevLine.match(/^[═━─]+$/);

      if (mdSectionMatch || branchMatch || decisionMatch || (isAfterBorder && allCapsSection)) {
        if (currentSection && currentSection.content.length > 0) {
          sections.push({ ...currentSection, content: currentSection.content.join('\n') });
        }

        sectionCounter++;
        let title = '';
        let type: 'path' | 'table' | 'decision' | 'text' = 'text';
        let number = String(sectionCounter);

        if (mdSectionMatch) {
          number = mdSectionMatch[1];
          title = mdSectionMatch[2].trim();
        } else if (branchMatch) {
          number = branchMatch[1];
          title = `Branch ${branchMatch[1]}: ${branchMatch[2].trim()}`;
          type = 'path';
        } else if (decisionMatch) {
          title = `Decision ${decisionMatch[1]}${decisionMatch[2] ? ': ' + decisionMatch[2].trim() : ''}`;
          type = 'decision';
        } else if (allCapsSection) {
          title = line.replace(/[:\s]*$/, '').trim();
        }

        // Determine type based on keywords
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('branch') || lowerTitle.includes('path') || lowerTitle.includes('proceed')) {
          type = 'path';
        } else if (lowerTitle.includes('decision') || lowerTitle.includes('gate') || lowerTitle.includes('matrix') || lowerTitle.includes('summary')) {
          type = 'decision';
        }

        currentSection = { number, title, content: [], type };
      } else if (currentSection) {
        if (line.includes('|') && line.trim().startsWith('|')) {
          currentSection.type = 'table';
        }
        // Skip border/decoration lines in content
        if (!line.match(/^[═━─]+$/)) {
          currentSection.content.push(line);
        }
      }
    }
    if (currentSection && currentSection.content.length > 0) {
      sections.push({ ...currentSection, content: currentSection.content.join('\n') });
    }
    return sections;
  };

  // Parse markdown table
  const parseTable = (tableStr: string) => {
    const lines = tableStr.split('\n').filter(l => l.includes('|') && !l.match(/^\|[-\s|]+\|$/));
    if (lines.length < 2) return null;
    const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = lines.slice(1).map(line => line.split('|').filter(c => c.trim()).map(c => c.trim()));
    return { headers, rows };
  };

  // Extract branches from narrative markdown
  const extractBranchesFromNarrative = (text: string): Array<{
    name: 'PROCEED_NOW' | 'PROCEED_MODIFIED' | 'DO_NOT_PROCEED';
    displayName: string;
    expectedValue: string;
    strength: number;
    conditions: string[];
    verdict: string;
    isRecommended: boolean;
  }> => {
    const branches: Array<{
      name: 'PROCEED_NOW' | 'PROCEED_MODIFIED' | 'DO_NOT_PROCEED';
      displayName: string;
      expectedValue: string;
      strength: number;
      conditions: string[];
      verdict: string;
      isRecommended: boolean;
    }> = [];

    // Find recommended branch
    const recommendedMatch = text.match(/(?:RECOMMENDED|VERDICT|OPTIMAL)[:\s]+(?:BRANCH\s+\d+:?\s*)?([A-Z\s]+(?:NOW|MODIFIED|PROCEED)?)/i) ||
                            text.match(/(?:RECOMMENDED|OPTIMAL)\s+(?:PATH|BRANCH)[:\s]+([^\n]+)/i);
    const recommendedText = recommendedMatch ? recommendedMatch[1].toLowerCase() : '';

    // Look for BRANCH sections or PROCEED patterns
    const branchPatterns = [
      { regex: /BRANCH\s+1[:\s]+PROCEED\s+NOW|PROCEED\s+(?:NOW|IMMEDIATELY)/i, name: 'PROCEED_NOW' as const, display: 'Proceed Now' },
      { regex: /BRANCH\s+2[:\s]+PROCEED\s+(?:WITH\s+)?MODIF|PROCEED\s+(?:WITH\s+)?MODIF/i, name: 'PROCEED_MODIFIED' as const, display: 'Proceed Modified' },
      { regex: /BRANCH\s+3[:\s]+DO\s+NOT\s+PROCEED|DO\s+NOT\s+PROCEED|ABORT|REJECT/i, name: 'DO_NOT_PROCEED' as const, display: 'Do Not Proceed' }
    ];

    branchPatterns.forEach((pattern) => {
      if (pattern.regex.test(text)) {
        // Extract expected value for this branch
        const evMatch = text.match(new RegExp(pattern.display.replace(/\s+/g, '\\s+') + '[^$]*\\$([\\d,]+(?:\\.\\d+)?[KMB]?)', 'i')) ||
                       text.match(new RegExp('BRANCH\\s+\\d+[^$]*\\$([\\d,]+(?:\\.\\d+)?[KMB]?)', 'i'));
        const expectedValue = evMatch ? `$${evMatch[1]}` : '+$0';

        // Extract strength/probability
        const strengthMatch = text.match(new RegExp(pattern.display.replace(/\s+/g, '\\s+') + '[^\\d]*([0-9]{1,3})%', 'i'));
        const strength = strengthMatch ? parseInt(strengthMatch[1]) / 100 : 0.5;

        // Check if recommended
        const isRecommended = recommendedText.includes(pattern.name.toLowerCase().replace(/_/g, ' ')) ||
                             recommendedText.includes(pattern.display.toLowerCase()) ||
                             (pattern.name === 'PROCEED_NOW' && recommendedText.includes('proceed'));

        branches.push({
          name: pattern.name,
          displayName: pattern.display,
          expectedValue,
          strength,
          conditions: [],
          verdict: isRecommended ? 'Recommended strategic path based on analysis' : '',
          isRecommended
        });
      }
    });

    // If no branches found, create defaults based on common patterns
    if (branches.length === 0) {
      const hasPositive = text.match(/PROCEED|APPROVE|EXECUTE/i);
      const hasNegative = text.match(/DO NOT|REJECT|ABORT|AVOID/i);
      const hasModified = text.match(/MODIF|CONDITION|CONTINGENT/i);

      if (hasPositive) {
        branches.push({
          name: 'PROCEED_NOW',
          displayName: 'Proceed Now',
          expectedValue: '+$500K',
          strength: 0.7,
          conditions: ['Market conditions favorable', 'Due diligence complete'],
          verdict: 'Execute with standard precautions',
          isRecommended: !hasModified
        });
      }
      if (hasModified) {
        branches.push({
          name: 'PROCEED_MODIFIED',
          displayName: 'Proceed Modified',
          expectedValue: '+$350K',
          strength: 0.6,
          conditions: ['Address specific conditions', 'Renegotiate terms'],
          verdict: 'Execute after modifications',
          isRecommended: true
        });
      }
      if (hasNegative) {
        branches.push({
          name: 'DO_NOT_PROCEED',
          displayName: 'Do Not Proceed',
          expectedValue: '$0',
          strength: 0.3,
          conditions: ['Risk exceeds threshold', 'Better alternatives exist'],
          verdict: 'Preserve capital for alternatives',
          isRecommended: false
        });
      }
    }

    return branches;
  };

  // Extract decision gates from narrative
  const extractGatesFromNarrative = (text: string): Array<{
    gateNumber: number;
    day: number;
    check: string;
    ifPass: string;
    ifFail: string;
  }> => {
    const gates: Array<{
      gateNumber: number;
      day: number;
      check: string;
      ifPass: string;
      ifFail: string;
    }> = [];

    // Look for GATE patterns
    const gateMatches = text.matchAll(/GATE\s+(\d+)[:\s]+([^\n]+)/gi);
    for (const match of gateMatches) {
      const gateNum = parseInt(match[1]);
      const checkText = match[2].trim();
      gates.push({
        gateNumber: gateNum,
        day: gateNum * 7, // Default to weekly gates
        check: checkText,
        ifPass: 'Continue to next phase',
        ifFail: 'Reassess or abort'
      });
    }

    // Look for DAY patterns
    const dayMatches = text.matchAll(/DAY\s+(\d+)[:\s]+([^\n]+)/gi);
    for (const match of dayMatches) {
      const day = parseInt(match[1]);
      const checkText = match[2].trim();
      gates.push({
        gateNumber: gates.length + 1,
        day,
        check: checkText,
        ifPass: 'Proceed as planned',
        ifFail: 'Evaluate alternatives'
      });
    }

    // If no gates found, create defaults based on common patterns
    if (gates.length === 0) {
      const hasInspection = text.match(/inspection|due\s+diligence|assess/i);
      const hasNegotiation = text.match(/negotiat|contract|terms/i);
      const hasClose = text.match(/clos|final|execut/i);

      if (hasInspection) {
        gates.push({
          gateNumber: 1,
          day: 7,
          check: 'Complete due diligence and inspection',
          ifPass: 'Move to negotiation phase',
          ifFail: 'Renegotiate or exit'
        });
      }
      if (hasNegotiation) {
        gates.push({
          gateNumber: gates.length + 1,
          day: 14,
          check: 'Finalize terms and conditions',
          ifPass: 'Proceed to closing',
          ifFail: 'Reassess deal structure'
        });
      }
      if (hasClose) {
        gates.push({
          gateNumber: gates.length + 1,
          day: 30,
          check: 'Execute final closing',
          ifPass: 'Transaction complete',
          ifFail: 'Exercise exit clause'
        });
      }
    }

    return gates;
  };

  // Extract key decision metrics
  const extractDecisionMetrics = (text: string) => {
    const metrics: { label: string; value: string; type: 'good' | 'bad' | 'neutral' }[] = [];
    const evMatch = text.match(/EXPECTED\s+VALUE[:\s]+[\|\s]*\$?([\d,]+(?:\.\d+)?[KMB]?)/i);
    if (evMatch) metrics.push({ label: 'Expected Value', value: `$${evMatch[1]}`, type: 'good' });
    const worstMatch = text.match(/Worst.*?(?:case|outcome).*?:\s*\$?([\d,]+)/i);
    if (worstMatch) metrics.push({ label: 'Worst Case', value: `$${worstMatch[1]}`, type: 'bad' });
    const bestMatch = text.match(/Best.*?(?:case|outcome).*?:\s*\$?([\d,]+)/i);
    if (bestMatch) metrics.push({ label: 'Best Case', value: `$${bestMatch[1]}`, type: 'good' });
    const roiMatch = text.match(/ROI[:\s]+([+-]?\d+(?:\.\d+)?%?)/i);
    if (roiMatch) metrics.push({ label: 'Expected ROI', value: roiMatch[1].includes('%') ? roiMatch[1] : `${roiMatch[1]}%`, type: 'good' });
    return metrics;
  };

  // Extract recommendation from narrative
  const extractRecommendation = (text: string): { branch: string; rationale: string[] } => {
    const recommendedMatch = text.match(/(?:RECOMMENDED|VERDICT|OPTIMAL)[:\s]+([^\n]+)/i);
    const branch = recommendedMatch ? recommendedMatch[1].trim() : 'Proceed with Modifications';

    const rationale: string[] = [];
    const rationaleMatches = text.matchAll(/(?:RATIONALE|REASONING|BECAUSE)[:\s]+([^\n]+)/gi);
    for (const match of rationaleMatches) {
      rationale.push(match[1].trim());
    }

    // Extract bullet points after recommendation
    const bulletMatches = text.matchAll(/[•✓-]\s+([^\n]+)/g);
    for (const match of bulletMatches) {
      if (rationale.length < 4 && match[1].length > 20 && match[1].length < 150) {
        rationale.push(match[1].trim());
      }
    }

    if (rationale.length === 0) {
      rationale.push('Strategic alignment with long-term objectives');
      rationale.push('Risk-adjusted returns within acceptable threshold');
    }

    return { branch, rationale };
  };

  // Visual branch card for narrative fallback — with hover lift
  function NarrativeBranchCard({
    branch,
    index
  }: {
    branch: ReturnType<typeof extractBranchesFromNarrative>[0];
    index: number;
  }) {
    const icons = {
      PROCEED_NOW: <CheckCircle className="w-4 h-4 text-primary/60" />,
      PROCEED_MODIFIED: <AlertTriangle className="w-4 h-4 text-amber-500/60" />,
      DO_NOT_PROCEED: <XCircle className="w-4 h-4 text-red-500/60" />
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 + index * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
        whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={`
          relative rounded-[24px] border border-border/20 bg-card/50 p-5 sm:p-6 lg:p-7 transition-all duration-300
          ${branch.isRecommended ? 'border-primary/30' : ''}
        `}
      >
        {/* Recommended Badge */}
        {branch.isRecommended && (
          <motion.div
            className="absolute -top-3 inset-x-0 flex justify-center z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.6 + index * 0.12, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-emerald-500/20 text-emerald-500/80 bg-card inline-flex items-center gap-1">
              <Star className="w-3 h-3 inline" /> Recommended
            </span>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4 mt-1">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {icons[branch.name]}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base font-medium text-foreground break-words leading-snug">{branch.displayName}</h4>
              <div className="mt-1">
                <StrengthIndicator strength={branch.strength} animate />
              </div>
            </div>
          </div>
        </div>

        {/* Expected Value — hero treatment */}
        <div className="mb-4 pt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-4" />
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Expected Value</p>
          <p className={memoNumberClass('metric', branch.expectedValue.includes('-') ? 'muted' : 'default')}>
            {branch.expectedValue}
          </p>
        </div>

        {/* Verdict */}
        {branch.verdict && (
          <div className="pt-3">
            <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-3" />
            <p className="text-xs sm:text-sm text-foreground/60 font-normal leading-relaxed">{parseMarkdownBold(branch.verdict)}</p>
          </div>
        )}
      </motion.div>
    );
  }

  // Visual gate item for narrative fallback — animated connector draw
  function NarrativeGateItem({ gate, index, total }: { gate: ReturnType<typeof extractGatesFromNarrative>[0]; index: number; total: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={isVisible ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.12, duration: 0.7, ease: EASE_OUT_EXPO }}
        className="relative flex items-start gap-4"
      >
        {/* Timeline connector */}
        <div className="flex flex-col items-center">
          <motion.div
            className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center z-10"
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ delay: index * 0.12, duration: 0.4, ease: EASE_OUT_EXPO }}
          >
            <span className="text-xs font-medium text-primary">{gate.gateNumber}</span>
          </motion.div>
          {index < total - 1 && (
            <motion.div
              className="w-px bg-primary/10 absolute top-8 left-4"
              initial={{ height: 0 }}
              animate={isVisible ? { height: '100%' } : {}}
              transition={{ delay: index * 0.12 + 0.2, duration: 0.5, ease: EASE_OUT_EXPO }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <motion.div
            className="rounded-xl border border-border/20 bg-card/50 p-5 sm:p-6 hover:border-border/30 transition-colors duration-300"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-medium text-foreground">Day {gate.day}</span>
            </div>
            <p className="text-sm text-foreground/60 font-normal mb-3 leading-loose sm:leading-relaxed">{gate.check}</p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-lg p-3 border border-primary/10">
                <p className="text-xs uppercase tracking-[0.2em] text-primary/60 mb-1.5">If Pass</p>
                <p className="text-sm text-muted-foreground/60 leading-relaxed break-words">{gate.ifPass}</p>
              </div>
              <div className="rounded-lg p-3 border border-border/20">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">If Fail</p>
                <p className="text-sm text-muted-foreground/60 leading-relaxed break-words">{gate.ifFail}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Premium Narrative Fallback with VISUAL dashboard (matching Crisis Resilience style)
  if (!hasStructuredData && hasNarrativeAnalysis) {
    const cleanedAnalysis = filterJsonFromMarkdown(rawAnalysis);
    const keyMetrics = extractDecisionMetrics(cleanedAnalysis);
    const branches = extractBranchesFromNarrative(cleanedAnalysis);
    const gates = extractGatesFromNarrative(cleanedAnalysis);
    const recommendation = extractRecommendation(cleanedAnalysis);

    return (
      <div ref={sectionRef}>
        {/* Premium Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Decision Scenario Tree
          </h2>
          <div className="h-px bg-border" />
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          {/* Key Decision Metrics Grid */}
          {keyMetrics.length > 0 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {keyMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-xl border ${
                    metric.type === 'good' ? 'border-primary/20' :
                    'border-border/20'
                  } bg-card/50 p-5 text-center overflow-hidden`}
                >
                  {metric.type === 'good' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                  )}
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{metric.label}</p>
                    <p className={`text-xl md:text-2xl font-bold tabular-nums tracking-tight ${
                      metric.type === 'good' ? 'text-primary' :
                      metric.type === 'bad' ? 'text-muted-foreground/60' :
                      'text-foreground'
                    }`}>
                      {metric.value}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Visual Decision Tree with Branch Cards */}
          {branches.length > 0 && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-5 sm:px-8 md:px-12 py-10 md:py-12"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center">
                {/* Root Node — with subtle breathing pulse */}
                <motion.div
                  className="w-48 p-4 rounded-xl border border-gold/30 text-center mb-4 relative"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-xl border border-gold/20"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <Target className="w-5 h-5 mx-auto mb-2 text-primary/60" />
                  <p className="font-normal text-foreground text-sm">Decision Point</p>
                  <p className="text-xs text-muted-foreground/60">Choose Your Path</p>
                </motion.div>

                {/* Animated connectors */}
                <motion.div
                  className="w-px bg-primary/20"
                  initial={{ height: 0 }}
                  animate={isVisible ? { height: 24 } : {}}
                  transition={{ duration: 0.3, delay: 0.5, ease: EASE_OUT_EXPO }}
                />
                <motion.div
                  className="w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT_EXPO }}
                />

                {/* Branch Cards */}
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6 w-full mt-4">
                  {branches.map((branch, index) => (
                    <div key={branch.name} className={index === 0 && branches.length >= 3 ? '2xl:col-span-2' : ''}>
                      <NarrativeBranchCard
                        branch={branch}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommendation Card */}
          {recommendation && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">
                Strategic Recommendation
              </p>

              <div className="rounded-xl border border-border/20 bg-card/50 p-5 mb-5">
                <p className="text-lg font-normal text-foreground">{parseMarkdownBold(recommendation.branch)}</p>
              </div>

              {recommendation.rationale.length > 0 && (
                <div className="space-y-3">
                  {recommendation.rationale.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-3.5 h-3.5 text-primary/40 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground/60 font-normal leading-loose sm:leading-relaxed">{parseMarkdownBold(reason)}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Decision Gates Timeline */}
          {gates.length > 0 && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
                Decision Gates Timeline
              </p>

              <div className="relative ml-1">
                {gates.map((gate, index) => (
                  <NarrativeGateItem
                    key={gate.gateNumber}
                    gate={gate}
                    index={index}
                    total={gates.length}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Expiry Notice */}
          <motion.div
            className="flex items-center justify-between rounded-xl border border-border/20 bg-card/50 px-6 py-4"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-muted-foreground/60" />
              <div>
                <p className="text-sm font-normal text-foreground">
                  Decision Tree Valid For: <span className="">30 days</span>
                </p>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">
                  Reassess if: Market shift &gt;10% | New regulations | Counterparty changes
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-8"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Grounded in HNWI Chronicles KG Decision Framework + Game Theory Models
          </p>
        </motion.div>
      </div>
    );
  }

  if (!hasStructuredData) {
    return null;
  }

  const typedData = normalizedStructuredData as ScenarioTreeData;
  const recommendedBranch = typedData.branches.find(b => b.name === typedData.recommended_branch);
  const branchValueBasisLabel = typedData.value_basis_label || 'Expected Value';
  const decisionEvLabel = typedData.decision_ev_label || 'Validated Route Decision EV';

  return (
    <div ref={sectionRef}>
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Decision Scenario Tree
          </h2>
          <div className="h-px bg-border" />
        </motion.div>
      <div className="space-y-8 sm:space-y-12">
        {/* Visual Decision Tree */}
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden px-4 sm:px-10 md:px-14 py-8 md:py-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-col items-center">
            {/* Root Node — with subtle breathing pulse */}
            <motion.div
              className="w-40 sm:w-48 p-3 sm:p-4 rounded-xl border border-gold/30 text-center mb-4 relative"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            >
              {/* Subtle ring pulse */}
              <motion.div
                className="absolute inset-0 rounded-xl border border-gold/20"
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Target className="w-5 h-5 sm:w-5 sm:h-5 mx-auto mb-2 text-primary/60" />
              <p className="font-normal text-foreground text-xs sm:text-sm">Decision Point</p>
              <p className="text-xs text-muted-foreground/60">Choose Your Path</p>
            </motion.div>

            {/* Animated connector — draws downward */}
            <motion.div
              className="w-px bg-primary/20"
              initial={{ height: 0 }}
              animate={isVisible ? { height: 24 } : {}}
              transition={{ duration: 0.3, delay: 0.5, ease: EASE_OUT_EXPO }}
            />
            {/* Horizontal spread connector */}
            <motion.div
              className="hidden md:block w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              initial={{ scaleX: 0 }}
              animate={isVisible ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT_EXPO }}
            />

            {/* Branch Cards */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6 w-full mt-4">
              {typedData.branches.map((branch, index) => (
                <div key={branch.name} className={index === 0 && typedData.branches.length >= 3 ? '2xl:col-span-2' : ''}>
                  <BranchCard
                    branch={branch}
                    isRecommended={branch.name === typedData.recommended_branch}
                    index={index}
                    valueBasisLabel={branchValueBasisLabel}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommendation Rationale */}
        {recommendedBranch && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-5">
              Recommendation: {getBranchDisplayName(typedData.recommended_branch)}
            </p>

            <div className="space-y-3 mb-5">
              {typedData.rationale.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-3.5 h-3.5 text-primary/40 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground/60 font-normal leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>

            {typedData.decision_ev_usd !== undefined && (
              <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5 mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{decisionEvLabel}</p>
                <p className={memoNumberClass('metric', 'default')}>
                  {formatScenarioMetricValue(typedData.decision_ev_usd)}
                </p>
                {typedData.decision_ev_note && (
                  <p className="text-sm text-muted-foreground/60 italic mt-2 leading-relaxed">
                    {typedData.decision_ev_note}
                  </p>
                )}
              </div>
            )}

            {typedData.value_basis_note && (
              <div className="rounded-xl border border-border/20 bg-card/50 p-4 mb-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Branch Value Basis</p>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">{typedData.value_basis_note}</p>
              </div>
            )}

            {/* Verdict Conditions */}
            {recommendedBranch.verdict_conditions.length > 0 && (
              <div className="pt-5">
                <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Choose this path if:</p>
                <div className="space-y-3">
                  {recommendedBranch.verdict_conditions.map((condition, i) => (
                    <div key={i} className="rounded-xl border border-border/20 bg-card/50 px-4 py-3">
                      <p className="text-sm text-muted-foreground/70 leading-relaxed break-words">{condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Decision Gates Timeline */}
        {typedData.decision_gates.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden px-6 sm:px-10 py-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-6">
              Decision Gates
            </p>

            <div className="relative ml-1">
              {typedData.decision_gates.map((gate, index) => (
                <GateItem
                  key={gate.gate_number}
                  gate={gate}
                  index={index}
                  total={typedData.decision_gates.length}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Decision Matrix Table */}
        {typedData.decision_matrix.length > 0 && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            <div className="px-6 sm:px-10 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                Decision Matrix
              </p>
            </div>

            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-3 px-6 pb-6">
              {typedData.decision_matrix.map((entry, i) => (
                <div key={i} className="rounded-xl border border-border/20 bg-card/50 p-5 space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-base font-medium text-foreground break-words leading-snug">{entry.branch}</h4>
                    <span className="inline-flex text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1.5 border border-border/20 text-muted-foreground/80">
                      {entry.risk_level}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">{branchValueBasisLabel}</p>
                    <p className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${String(entry.expected_value).startsWith('-') ? 'text-muted-foreground/60' : 'text-primary'}`}>
                      {entry.expected_value}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed pt-2">{entry.recommended_if}</p>
                </div>
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-10 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Branch</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground/60">{branchValueBasisLabel}</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Risk Level</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Recommended If</th>
                  </tr>
                </thead>
                <tbody>
                  {typedData.decision_matrix.map((entry, i) => (
                    <tr key={i} className="hover:bg-card/30 transition-colors border-t border-border/20">
                      <td className="px-3 sm:px-10 py-4 text-sm font-normal text-foreground whitespace-nowrap">{entry.branch}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={memoNumberClass('small', String(entry.expected_value).startsWith('-') ? 'muted' : 'default')}>
                          {entry.expected_value}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/80 whitespace-nowrap">
                          {entry.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground/60 leading-relaxed">{entry.recommended_if}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Market Validation - Expected vs Reality */}
        {typedData.market_validation && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 sm:px-10 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className={`w-4 h-4 ${viaNegativa?.isActive ? 'text-red-500/60' : 'text-primary/60'}`} />
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                  {viaNegativa?.isActive ? viaNegativa.scenarioHeader : 'Expected vs Reality'}
                </p>
              </div>
              <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
                typedData.market_validation.overall_confidence === 'high'
                  ? 'border-primary/20 text-primary/80'
                  : typedData.market_validation.overall_confidence === 'moderate'
                  ? 'border-amber-500/20 text-amber-500/80'
                  : 'border-border/20 text-muted-foreground/80'
              }`}>
                {typedData.market_validation.overall_confidence} confidence
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />

            <div className="px-6 sm:px-10 py-6 sm:py-8 space-y-6">
              {/* Appreciation Comparison */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 items-center">
                <div className={`rounded-xl p-4 sm:p-5 text-center border ${
                  viaNegativa?.isActive
                    ? 'border-red-500/20'
                    : 'border-border/20'
                }`}>
                  <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${
                    viaNegativa?.isActive ? 'text-red-400/60 font-medium' : 'text-muted-foreground/60'
                  }`}>{viaNegativa?.isActive ? viaNegativa.expectationLabel : 'Your Expectation'}</p>
                  <p className="text-xl font-bold text-foreground">
                    {typedData.market_validation.expected_vs_reality.appreciation.your_expectation}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Appreciation Rate</p>
                </div>

                <div className="hidden md:flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    {typedData.market_validation.expected_vs_reality.appreciation.deviation?.includes('above') ? (
                      <TrendingUp className="w-4 h-4 text-amber-500/50" />
                    ) : typedData.market_validation.expected_vs_reality.appreciation.deviation?.includes('below') ? (
                      <TrendingDown className="w-4 h-4 text-primary/50" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-muted-foreground/60" />
                    )}
                    <span className={`text-xs font-medium ${
                      typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high' ||
                      typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                        ? 'text-amber-500/60'
                        : 'text-muted-foreground/60'
                    }`}>
                      {typedData.market_validation.expected_vs_reality.appreciation.deviation || 'vs'}
                    </span>
                  </div>
                </div>

                <div className={`rounded-xl p-4 sm:p-5 text-center border ${
                  viaNegativa?.isActive
                    ? (typedData.market_validation.expected_vs_reality.appreciation.market_actual
                        ? 'border-emerald-500/20'
                        : 'border-border/20')
                    : (typedData.market_validation.expected_vs_reality.appreciation.market_actual
                        ? 'border-primary/20'
                        : 'border-border/20')
                }`}>
                  <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${
                    viaNegativa?.isActive ? 'text-emerald-400/60 font-medium' : 'text-muted-foreground/60'
                  }`}>{viaNegativa?.isActive ? viaNegativa.actualLabel : 'Market Actual'}</p>
                  <p className={`text-xl font-bold ${viaNegativa?.isActive ? 'text-emerald-400' : 'text-primary'}`}>
                    {typedData.market_validation.expected_vs_reality.appreciation.market_actual || 'N/A'}
                  </p>
                  {typedData.market_validation.expected_vs_reality.appreciation.market_source && (
                    <p className="text-xs text-muted-foreground/60 mt-1 break-words">
                      {typedData.market_validation.expected_vs_reality.appreciation.market_source}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning for Appreciation */}
              {typedData.market_validation.expected_vs_reality.appreciation.warning &&
               typedData.market_validation.expected_vs_reality.appreciation.warning_level !== 'none' && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                  typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                    ? 'border-red-500/20'
                    : typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high'
                    ? 'border-amber-500/20'
                    : 'border-border/20'
                }`}>
                  <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                    typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'extreme'
                      ? 'text-red-500/60'
                      : typedData.market_validation.expected_vs_reality.appreciation.warning_level === 'high'
                      ? 'text-amber-500/60'
                      : 'text-muted-foreground/60'
                  }`} />
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">
                    {typedData.market_validation.expected_vs_reality.appreciation.warning}
                  </p>
                </div>
              )}

              {/* Rental Yield Comparison */}
              {typedData.market_validation.expected_vs_reality.rental_yield?.your_expectation && (
                <>
                  <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 items-center">
                    <div className={`rounded-xl p-4 text-center border ${
                      viaNegativa?.isActive
                        ? 'border-red-500/20'
                        : 'border-border/20'
                    }`}>
                      <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${
                        viaNegativa?.isActive ? 'text-red-400/60 font-medium' : 'text-muted-foreground/60'
                      }`}>{viaNegativa?.isActive ? viaNegativa.expectationLabel : 'Your Expectation'}</p>
                      <p className="text-xl font-bold text-foreground">
                        {typedData.market_validation.expected_vs_reality.rental_yield.your_expectation}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Rental Yield</p>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2">
                        {typedData.market_validation.expected_vs_reality.rental_yield.deviation?.includes('above') ? (
                          <TrendingUp className="w-4 h-4 text-amber-500/50" />
                        ) : typedData.market_validation.expected_vs_reality.rental_yield.deviation?.includes('below') ? (
                          <TrendingDown className="w-4 h-4 text-primary/50" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-muted-foreground/60" />
                        )}
                        <span className={`text-xs font-medium ${
                          typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high' ||
                          typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                            ? 'text-amber-500/60'
                            : 'text-muted-foreground/60'
                        }`}>
                          {typedData.market_validation.expected_vs_reality.rental_yield.deviation || 'vs'}
                        </span>
                      </div>
                    </div>

                    <div className={`rounded-xl p-4 sm:p-5 text-center border ${
                      viaNegativa?.isActive
                        ? (typedData.market_validation.expected_vs_reality.rental_yield.market_actual
                            ? 'border-emerald-500/20'
                            : 'border-border/20')
                        : (typedData.market_validation.expected_vs_reality.rental_yield.market_actual
                            ? 'border-primary/20'
                            : 'border-border/20')
                    }`}>
                      <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${
                        viaNegativa?.isActive ? 'text-emerald-400/60 font-medium' : 'text-muted-foreground/60'
                      }`}>{viaNegativa?.isActive ? viaNegativa.actualLabel : 'Market Actual'}</p>
                      <p className={`text-xl font-bold ${viaNegativa?.isActive ? 'text-emerald-400' : 'text-primary'}`}>
                        {typedData.market_validation.expected_vs_reality.rental_yield.market_actual || 'N/A'}
                      </p>
                      {typedData.market_validation.expected_vs_reality.rental_yield.market_source && (
                        <p className="text-xs text-muted-foreground/60 mt-1 break-words">
                          {typedData.market_validation.expected_vs_reality.rental_yield.market_source}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Warning for Rental Yield */}
                  {typedData.market_validation.expected_vs_reality.rental_yield.warning &&
                   typedData.market_validation.expected_vs_reality.rental_yield.warning_level !== 'none' && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                      typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                        ? 'border-red-500/20'
                        : typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high'
                        ? 'border-amber-500/20'
                        : 'border-border/20'
                    }`}>
                      <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'extreme'
                          ? 'text-red-500/60'
                          : typedData.market_validation.expected_vs_reality.rental_yield.warning_level === 'high'
                          ? 'text-amber-500/60'
                          : 'text-muted-foreground/60'
                      }`} />
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">
                        {typedData.market_validation.expected_vs_reality.rental_yield.warning}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Recommendation */}
              {typedData.market_validation.recommendation && (
                <div className="relative rounded-xl border border-primary/20 p-5 overflow-hidden">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
                  <div className="relative flex items-start gap-3">
                    <Info className="w-3.5 h-3.5 text-primary/50 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/60 font-normal leading-relaxed">
                      {typedData.market_validation.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Deviation Commentary - Via Negativa */}
              {viaNegativa?.isActive && typedData.market_validation && (
                <div className="rounded-xl border border-red-500/20 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-red-400/60 font-medium mb-2">{viaNegativa.commentaryTitle}</p>
                  <p className="text-sm text-red-300/50 font-normal leading-relaxed">
                    {viaNegativa.commentaryBody}
                  </p>
                </div>
              )}

              {/* Data Sources */}
              {typedData.market_validation.data_sources_used && typedData.market_validation.data_sources_used.length > 0 && (
                <div className="pt-3">
                  <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Data Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {typedData.market_validation.data_sources_used.map((source, i) => (
                      <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/60">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Expiry Notice */}
        <motion.div
          className="flex items-center justify-between rounded-xl border border-border/20 bg-card/50 px-6 py-4"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-muted-foreground/60" />
            <div>
              <p className="text-sm font-normal text-foreground">
                Decision Tree Valid For: <span className="">{typedData.expiry.days} days</span>
              </p>
              <p className="text-sm text-muted-foreground/60 leading-relaxed">
                Reassess if: {typedData.expiry.reassess_triggers.join(' | ')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Grounded in HNWI Chronicles KG Decision Framework + Game Theory Models
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ScenarioTreeSection;
