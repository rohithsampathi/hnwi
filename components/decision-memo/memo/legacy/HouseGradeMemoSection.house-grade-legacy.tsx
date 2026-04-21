'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  Clock3,
  Eye,
  GitBranch,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
} from 'lucide-react';
import ReferencesSection from './ReferencesSection';
import type { LegalReferences } from '@/lib/pdf/pdf-types';

interface HouseGradeMemoSectionProps {
  data?: Record<string, any> | null;
  crossBorderAudit?: Record<string, any> | null;
  transparencyData?: Record<string, any> | null;
  crisisData?: Record<string, any> | null;
  scenarioTreeData?: Record<string, any> | null;
  heirData?: Record<string, any> | null;
  hnwiTrends?: string[] | null;
  peerStats?: Record<string, any> | null;
  references?: LegalReferences | null;
  developmentsCount?: number;
  precedentCount?: number;
  routeEvidenceBasisNote?: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

function asArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asText(value: unknown, fallback = '—'): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

interface StructuredListItem {
  text: string;
  status?: string;
}

function normalizeListItems(values: unknown): StructuredListItem[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => {
      if (typeof value === 'string') {
        const text = value.trim();
        return text ? { text } : null;
      }

      if (typeof value === 'number' && Number.isFinite(value)) {
        return { text: String(value) };
      }

      if (!value || typeof value !== 'object') return null;

      const record = value as Record<string, unknown>;
      const text =
        [
          record.condition,
          record.text,
          record.title,
          record.label,
          record.summary,
          record.detail,
          record.item,
          record.name,
          record.headline,
          record.value,
        ]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || '';

      if (!text) return null;

      const status =
        [record.status, record.state, record.tone, record.level]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || undefined;

      return { text, status };
    })
    .filter((item): item is StructuredListItem => Boolean(item?.text));
}

function toneClass(tone: 'default' | 'soft' | 'warn' | 'strong' = 'default') {
  switch (tone) {
    case 'soft':
      return 'border-primary/20 bg-primary/[0.06]';
    case 'warn':
      return 'border-amber-400/25 bg-amber-500/[0.06]';
    case 'strong':
      return 'border-foreground/10 bg-foreground/[0.03]';
    default:
      return 'border-border/35 bg-background/70';
  }
}

function StatusPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'soft' | 'warn';
}) {
  const classes =
    tone === 'soft'
      ? 'border-primary/20 bg-primary/[0.08] text-primary'
      : tone === 'warn'
        ? 'border-amber-400/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300'
        : 'border-border/40 bg-background/70 text-muted-foreground';

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${classes}`}>
      {label}
    </span>
  );
}

function HeroMetric({
  label,
  value,
  note,
}: {
  label: string;
  value?: string | null;
  note?: string | null;
}) {
  if (!value && !note) return null;

  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">{label}</p>
      {value ? <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p> : null}
      {note ? <p className="mt-2 text-sm leading-relaxed text-white/70">{note}</p> : null}
    </div>
  );
}

function ChapterShell({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2.2rem] border border-border/45 bg-card/70 px-6 py-7 shadow-sm sm:px-8 sm:py-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="mt-1 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">{eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function StoryCard({
  label,
  text,
  tone = 'default',
}: {
  label: string;
  text?: string | null;
  tone?: 'default' | 'soft' | 'warn' | 'strong';
}) {
  if (!text || text === '—') return null;

  return (
    <div className={`rounded-[1.6rem] border p-5 ${toneClass(tone)}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}

function InsightList({
  title,
  items,
  tone = 'default',
}: {
  title: string;
  items: unknown[];
  tone?: 'default' | 'soft' | 'warn';
}) {
  const normalizedItems = normalizeListItems(items);
  if (!normalizedItems.length) return null;

  return (
    <div className={`rounded-[1.6rem] border p-5 ${toneClass(tone)}`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="space-y-3">
        {normalizedItems.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-3 rounded-xl border border-border/20 bg-card/60 px-3 py-3">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
            <div className="min-w-0">
              {item.status ? <div className="mb-2"><StatusPill label={item.status} tone={tone === 'warn' ? 'warn' : tone === 'soft' ? 'soft' : 'default'} /></div> : null}
              <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabeledItemsGrid({
  title,
  items,
}: {
  title: string;
  items: Array<Record<string, any>>;
}) {
  if (!items.length) return null;

  return (
    <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={`${item.label || item.title || 'item'}-${index}`} className="rounded-2xl border border-border/25 bg-card/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{item.label || item.title || item.category || `Item ${index + 1}`}</p>
              {item.value ? <p className="text-sm font-medium text-primary">{item.value}</p> : null}
            </div>
            {item.status ? <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.status}</p> : null}
            {item.detail ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.detail}</p> : null}
            {item.consequence ? <p className="mt-3 text-sm leading-relaxed text-foreground">{item.consequence}</p> : null}
            {item.failure ? <p className="mt-3 text-sm leading-relaxed text-foreground">{item.failure}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricBoard({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value?: string | null; note?: string | null }>;
}) {
  const filtered = items.filter((item) => item.value || item.note);
  if (!filtered.length) return null;

  return (
    <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/25 bg-card/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
            {item.value ? <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{item.value}</p> : null}
            {item.note ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SequenceRail({
  steps,
}: {
  steps: Array<Record<string, any>>;
}) {
  if (!steps.length) return null;

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={`${step.title || 'step'}-${index}`} className="rounded-[1.6rem] border border-border/35 bg-background/70 p-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {step.order || index + 1}
              </div>
              {index < steps.length - 1 ? <div className="mt-2 h-full min-h-8 w-px bg-border/50" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                {step.phase ? <StatusPill label={asText(step.phase, '')} tone="soft" /> : null}
              </div>
              {step.detail ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.detail}</p> : null}
              {step.wrong_order_cost ? (
                <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-3 py-2 text-sm leading-relaxed text-foreground">
                  {step.wrong_order_cost}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StageColumn({
  label,
  items,
}: {
  label: string;
  items: unknown[];
}) {
  const normalizedItems = normalizeListItems(items);
  if (!normalizedItems.length) return null;

  return (
    <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      </div>
      <div className="space-y-3">
        {normalizedItems.map((item, index) => (
          <div key={`${label}-${index}`} className="rounded-xl border border-border/20 bg-card/60 px-3 py-3">
            {item.status ? <div className="mb-2"><StatusPill label={item.status} tone="soft" /></div> : null}
            <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioBranchCard({
  branch,
}: {
  branch: Record<string, any>;
}) {
  const label = asText(branch.label || branch.name, 'Branch');
  const conditions = normalizeListItems(branch.conditions);
  const strength = asText(branch.recommendation_strength, '');
  const tone =
    strength.toLowerCase().includes('primary') || strength.toLowerCase().includes('recommended')
      ? 'soft'
      : label.toLowerCase().includes('do not')
        ? 'warn'
        : 'default';

  return (
    <div className={`rounded-[1.6rem] border p-5 ${toneClass(tone as 'default' | 'soft' | 'warn')}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold tracking-tight text-foreground">{label}</p>
          {strength ? <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{strength}</p> : null}
        </div>
        {branch.expected_value ? <p className="text-xl font-semibold tracking-tight text-primary">{asText(branch.expected_value, '—')}</p> : null}
      </div>
      {branch.outcome || branch.description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{asText(branch.outcome || branch.description, '')}</p>
      ) : null}
      {conditions.length ? (
        <div className="mt-4 space-y-2">
          {conditions.slice(0, 4).map((item, index) => (
            <div key={`${label}-${index}`} className="rounded-xl border border-border/20 bg-card/60 px-3 py-2">
              {item.status ? <div className="mb-2"><StatusPill label={item.status} tone={tone === 'warn' ? 'warn' : tone === 'soft' ? 'soft' : 'default'} /></div> : null}
              <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ScenarioSummary({
  scenarioTreeData,
}: {
  scenarioTreeData?: Record<string, any> | null;
}) {
  if (!scenarioTreeData || typeof scenarioTreeData !== 'object') return null;

  const branches = asArray<Record<string, any>>(scenarioTreeData.branches);
  const matrix = asArray<Record<string, any>>(scenarioTreeData.decision_matrix);

  return (
    <div className="space-y-5">
      {branches.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {branches.map((branch, index) => (
            <ScenarioBranchCard key={`${branch.label || 'branch'}-${index}`} branch={branch} />
          ))}
        </div>
      ) : null}

      {matrix.length ? (
        <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Decision Matrix</p>
          <div className="space-y-3">
            {matrix.map((row, index) => (
              <div key={`${row.branch || 'row'}-${index}`} className="grid gap-2 rounded-xl border border-border/20 bg-card/60 p-3 md:grid-cols-[1.1fr,0.8fr,0.7fr,1.4fr]">
                <p className="text-sm font-semibold text-foreground">{asText(row.branch, 'Branch')}</p>
                <p className="text-sm font-medium text-primary">{asText(row.expected_value, '—')}</p>
                <p className="text-sm text-muted-foreground">{asText(row.risk_level, '—')}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{asText(row.recommended_if, '')}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CrisisScenarioCard({
  scenario,
}: {
  scenario: Record<string, any>;
}) {
  const riskLevel = asText(scenario.risk_level, '');
  const tone =
    riskLevel.toLowerCase().includes('high')
      ? 'warn'
      : riskLevel.toLowerCase().includes('medium')
        ? 'strong'
        : 'default';

  return (
    <div className={`rounded-[1.6rem] border p-5 ${toneClass(tone as 'default' | 'warn' | 'strong')}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-base font-semibold tracking-tight text-foreground">{asText(scenario.title, 'Scenario')}</p>
        {riskLevel ? <StatusPill label={riskLevel} tone={tone === 'warn' ? 'warn' : 'default'} /> : null}
      </div>
      {scenario.subheadline ? <p className="mt-2 text-sm text-muted-foreground">{asText(scenario.subheadline, '')}</p> : null}
      {scenario.stress_factor ? <p className="mt-4 text-sm leading-relaxed text-foreground">{asText(scenario.stress_factor, '')}</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {scenario.impact ? (
          <div className="rounded-xl border border-border/20 bg-card/60 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Impact</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{asText(scenario.impact, '')}</p>
          </div>
        ) : null}
        {scenario.recovery ? (
          <div className="rounded-xl border border-border/20 bg-card/60 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Recovery</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{asText(scenario.recovery, '')}</p>
          </div>
        ) : null}
      </div>
      {scenario.verdict ? (
        <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-3 py-3 text-sm leading-relaxed text-foreground">
          {asText(scenario.verdict, '')}
        </div>
      ) : null}
    </div>
  );
}

export default function HouseGradeMemoSection({
  data,
  crossBorderAudit,
  transparencyData,
  crisisData,
  scenarioTreeData,
  heirData,
  hnwiTrends,
  peerStats,
  references,
  developmentsCount = 0,
  precedentCount = 0,
  routeEvidenceBasisNote,
  sourceJurisdiction,
  destinationJurisdiction,
}: HouseGradeMemoSectionProps) {
  if (!data || typeof data !== 'object') return null;

  const decisionSignal = (data.decision_signal || {}) as Record<string, any>;
  const correctedThesis = (data.corrected_thesis || {}) as Record<string, any>;
  const visibility = (data.visibility_and_confidence_note || {}) as Record<string, any>;
  const housePurpose = (data.house_purpose_at_stake || {}) as Record<string, any>;
  const publicHouseModel = (data.public_house_model || {}) as Record<string, any>;
  const currentHouseBurden = (data.current_house_burden || {}) as Record<string, any>;
  const authority = (data.authority_and_governance_map || {}) as Record<string, any>;
  const fragmentation = (data.fragmentation_map || {}) as Record<string, any>;
  const routeArchitecture = (data.route_architecture || {}) as Record<string, any>;
  const economics = (data.economic_and_capital_proof || {}) as Record<string, any>;
  const executionSequence = (data.execution_sequence || {}) as Record<string, any>;
  const gates = (data.gate_and_abort_structure || {}) as Record<string, any>;
  const continuity = (data.continuity_and_g1_g2_g3_consequence || {}) as Record<string, any>;
  const actionPath = (data.family_office_action_path || {}) as Record<string, any>;
  const warRoomWatchlist = (data.war_room_watchlist || {}) as Record<string, any>;
  const crownVault = (data.crown_vault_consequence || {}) as Record<string, any>;
  const dashboardCarry = (data.home_dashboard_carry_forward || {}) as Record<string, any>;
  const houseLearning = (data.house_learning_write_back || {}) as Record<string, any>;
  const unknowns = (data.what_this_memo_does_not_yet_know || {}) as Record<string, any>;
  const disclosure = (data.next_disclosure_needed_for_deeper_precision || {}) as Record<string, any>;
  const evidence = (data.evidence_status || {}) as Record<string, any>;

  const crisisScenarios = asArray<Record<string, any>>(crisisData?.scenarios);
  const transparencyTriggers = asArray<Record<string, any>>(transparencyData?.reporting_triggers);
  const complianceRisks = asArray<Record<string, any>>(transparencyData?.compliance_risks);
  const branchCount = asArray<Record<string, any>>(scenarioTreeData?.branches).length;

  const marketWitnessStats = [
    {
      label: 'Dubai Purchase Witnesses',
      value: peerStats?.total_peers ? String(peerStats.total_peers) : precedentCount ? String(precedentCount) : undefined,
      note: 'Direct route witnesses and corridor-adjacent purchase signals used in the memo.',
    },
    {
      label: 'Collections Read',
      value: developmentsCount ? `${developmentsCount.toLocaleString()}` : undefined,
      note: 'Tracked developments, collections, or market rails feeding the current route read.',
    },
    {
      label: 'Evidence Basis',
      value: routeEvidenceBasisNote ? 'Locked' : undefined,
      note: routeEvidenceBasisNote || undefined,
    },
    {
      label: 'Audit Read',
      value: crossBorderAudit?.warnings?.length ? `${crossBorderAudit.warnings.length} warnings` : undefined,
      note: crossBorderAudit?.executive_summary || undefined,
    },
  ];

  const continuityItems = asArray<Record<string, any>>(continuity.items);
  const continuityMetrics = continuityItems.length
    ? continuityItems.map((item) => ({
        label: asText(item.label, 'Continuity'),
        value: asText(item.value, '—'),
        note: asText(item.detail, ''),
      }))
    : [
        {
          label: 'Route Control',
          value: asText(heirData?.route_control_score, '—'),
          note: asText(heirData?.recommended_structure, ''),
        },
        {
          label: 'Forced-Sale Pressure',
          value: heirData?.forced_sale_pressure_pct != null ? `${heirData.forced_sale_pressure_pct}%` : '—',
          note: asText(heirData?.g3_durability_read, ''),
        },
      ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[#0d1117] px-6 py-7 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%)]" />
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="House-Governed Decision Memo" tone="soft" />
              {sourceJurisdiction && destinationJurisdiction ? (
                <StatusPill label={`${sourceJurisdiction} to ${destinationJurisdiction}`} />
              ) : null}
              {visibility.level ? <StatusPill label={`Visibility: ${asText(visibility.level, '—')}`} /> : null}
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {asText(decisionSignal.value, 'Decision Pending')}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/74">
              {asText(data.real_decision?.headline || decisionSignal.rationale, 'One governing answer for the house, one route order for the office, and one memory write-back for the next move.')}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {gates.decision_window_days ? <StatusPill label={`${gates.decision_window_days} day decision window`} tone="warn" /> : null}
              {branchCount ? <StatusPill label={`${branchCount} live branches`} /> : null}
              {precedentCount ? <StatusPill label={`${precedentCount} route precedents`} /> : null}
              {references?.total_count ? <StatusPill label={`${references.total_count} authority references`} /> : null}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <StoryCard label="What The Room Believed" text={correctedThesis.room_believed} tone="strong" />
              <StoryCard label="What Is Actually True" text={correctedThesis.actual_truth} tone="soft" />
              <StoryCard label="Governing Order" text={correctedThesis.what_changed || decisionSignal.rationale} tone="warn" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroMetric label="Decision Signal" value={asText(decisionSignal.code || decisionSignal.value, '—')} note={decisionSignal.rationale} />
            <HeroMetric label="Decision EV" value={asText(economics.decision_ev, '—')} note="Validated route value after the critical gates clear." />
            <HeroMetric label="Day-One Loss" value={asText(economics.day_one_loss || economics.wealth_at_risk, '—')} note="Immediate capital impairment if the route hardens wrong." />
            <HeroMetric label="Capital Deployed" value={asText(economics.capital_deployed || economics.transaction_value, '—')} note={routeEvidenceBasisNote || 'Committee-underwritten route basis.'} />
          </div>
        </div>
      </section>

      <ChapterShell
        eyebrow="Chapter I"
        title="House Coherence"
        description="The memo makes purpose, burden, authority, and fragmentation legible before the room gets seduced by the asset surface."
        icon={<Landmark className="h-5 w-5" />}
      >
        <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            <StoryCard label="House Purpose At Stake" text={housePurpose.headline} tone="soft" />
            <InsightList title="What The House Is Actually Protecting" items={asArray<string>(housePurpose.items)} tone="soft" />
            <InsightList title="Public House Model" items={asArray<string>(publicHouseModel.items)} />
          </div>

          <div className="space-y-5">
            <LabeledItemsGrid title="Current House Burden" items={asArray<Record<string, any>>(currentHouseBurden.items)} />
            <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Authority And Governance Map</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/25 bg-card/60 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Decision Owner</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{asText(authority.decision_owner, '—')}</p>
                </div>
                <InsightList title="Approvers" items={asArray<string>(authority.approvers)} tone="soft" />
                <InsightList title="Veto Points" items={asArray<string>(authority.veto_points)} tone="warn" />
                <InsightList title="Alignment Points" items={asArray<string>(authority.alignment_points)} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Visibility And Confidence Note</p>
            <div className="grid gap-4 md:grid-cols-3">
              <InsightList title="Publicly Evidenced" items={asArray<string>(visibility.publicly_evidenced)} tone="soft" />
              <InsightList title="Modeled Core" items={asArray<string>(visibility.modeled)} />
              <InsightList title="Still Unconfirmed" items={asArray<string>(visibility.unconfirmed)} tone="warn" />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fragmentation Map</p>
            {fragmentation.summary ? <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{asText(fragmentation.summary, '')}</p> : null}
            <LabeledItemsGrid title="Where The House Is Thinking In Pieces" items={asArray<Record<string, any>>(fragmentation.items)} />
          </div>
        </div>
      </ChapterShell>

      <ChapterShell
        eyebrow="Chapter II"
        title="Route Design"
        description="This chapter turns the move into a governed route: architecture, economics, sequence, compliance, and abort logic live in one control layer."
        icon={<Waypoints className="h-5 w-5" />}
      >
        <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <MetricBoard
            title="Route Architecture"
            items={asArray<Record<string, any>>(routeArchitecture.items).map((item) => ({
              label: asText(item.label, 'Route'),
              value: asText(item.value, '—'),
              note: asText(item.detail, ''),
            }))}
          />
          <MetricBoard
            title="Economic And Capital Proof"
            items={[
              { label: 'Transaction Value', value: asText(economics.transaction_value, '—') },
              { label: 'Capital Deployed', value: asText(economics.capital_deployed, '—') },
              { label: 'Decision EV', value: asText(economics.decision_ev, '—') },
              { label: 'Day-One Loss', value: asText(economics.day_one_loss, '—') },
              { label: 'Underwritten Annual Return', value: asText(economics.annual_underwritten_return || economics.underwritten_annual_return, '—') },
              { label: 'Gross / Net Yield', value: `${asText(economics.gross_yield, '—')} / ${asText(economics.net_yield, '—')}` },
              { label: 'Appreciation Basis', value: asText(economics.appreciation_basis, '—') },
              { label: 'Drawdown Floor', value: asText(economics.drawdown_floor, '—') },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Execution Sequence</p>
            <SequenceRail steps={asArray<Record<string, any>>(executionSequence.steps)} />
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Gate And Abort Structure</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InsightList title="Critical Gates" items={asArray<string>(gates.critical_gates)} tone="soft" />
                <InsightList title="Abort Triggers" items={asArray<string>(gates.abort_triggers)} tone="warn" />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Transparency And Compliance</p>
              <div className="grid gap-4">
                {transparencyTriggers.length ? (
                  <div className="rounded-2xl border border-border/25 bg-card/60 p-4">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Triggered Reporting Rails</p>
                    <div className="space-y-3">
                      {transparencyTriggers.slice(0, 3).map((item, index) => (
                        <div key={`${item.title || 'trigger'}-${index}`} className="rounded-xl border border-border/20 bg-background/70 px-3 py-3">
                          <p className="text-sm font-semibold text-foreground">{asText(item.title, 'Trigger')}</p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{asText(item.exposure || item.reason, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {complianceRisks.length ? (
                  <div className="rounded-2xl border border-border/25 bg-card/60 p-4">
                    <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Top Compliance Risks</p>
                    <div className="space-y-3">
                      {complianceRisks.slice(0, 2).map((item, index) => (
                        <div key={`${item.title || 'risk'}-${index}`} className="rounded-xl border border-border/20 bg-background/70 px-3 py-3">
                          <p className="text-sm font-semibold text-foreground">{asText(item.title, 'Risk')}</p>
                          {item.trigger ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{asText(item.trigger, '')}</p> : null}
                          {item.fix ? <p className="mt-2 text-sm leading-relaxed text-foreground">{asText(item.fix, '')}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </ChapterShell>

      <ChapterShell
        eyebrow="Chapter III"
        title="Live Intelligence"
        description="The memo combines market witness, route evidence, and crisis pressure in one view so timing stress does not get mistaken for route permission."
        icon={<Eye className="h-5 w-5" />}
      >
        <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <MetricBoard title="Market Witness Read" items={marketWitnessStats} />
          <InsightList title="Current Route Intelligence" items={asArray<string>(hnwiTrends)} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Crisis Scenarios</p>
            <div className="grid gap-4 xl:grid-cols-2">
              {crisisScenarios.slice(0, 4).map((scenario, index) => (
                <CrisisScenarioCard key={`${scenario.title || 'scenario'}-${index}`} scenario={scenario} />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">War Room Watchlist</p>
              <InsightList title="Live Priority Events" items={asArray<string>(warRoomWatchlist.items)} tone="warn" />
            </div>

            <MetricBoard
              title="Resilience Read"
              items={[
                {
                  label: 'Overall Resilience',
                  value: crisisData?.overall_resilience?.score ? `${crisisData.overall_resilience.score}/100` : undefined,
                  note: asText(crisisData?.overall_resilience?.rating, ''),
                },
                {
                  label: 'Worst Case',
                  value: asText(crisisData?.overall_resilience?.worst_case || crisisData?.bottom_line?.impact, '—'),
                  note: 'Mark-to-market and timing pressure inside the current crisis window.',
                },
                {
                  label: 'Buffer',
                  value: asText(crisisData?.overall_resilience?.buffer || crisisData?.bottom_line?.buffer, '—'),
                },
                {
                  label: 'Decision Window',
                  value: gates.decision_window_days ? `${gates.decision_window_days} days` : undefined,
                  note: asText(crisisData?.bottom_line?.summary, ''),
                },
              ]}
            />
          </div>
        </div>
      </ChapterShell>

      <ChapterShell
        eyebrow="Chapter IV"
        title="Decision Carry"
        description="The last chapter converts the decision into an operating path for the office: branches, continuity, 7/30/90 ownership, and house memory write-back."
        icon={<GitBranch className="h-5 w-5" />}
      >
        <div className="grid gap-5 xl:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Decision Scenario Tree</p>
            <ScenarioSummary scenarioTreeData={scenarioTreeData} />
          </div>

          <div className="space-y-5">
            <MetricBoard title="Continuity And G1-G2-G3 Consequence" items={continuityMetrics} />

            {continuity.top_trigger?.trigger ? (
              <div className="rounded-[1.6rem] border border-amber-400/25 bg-amber-500/[0.06] p-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Top Succession Trigger</p>
                </div>
                <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{asText(continuity.top_trigger.trigger, '—')}</p>
                {continuity.top_trigger.dollars_at_risk ? (
                  <p className="mt-2 text-sm text-muted-foreground">At risk: {asText(continuity.top_trigger.dollars_at_risk, '—')}</p>
                ) : null}
                {continuity.top_trigger.mitigation ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground">{asText(continuity.top_trigger.mitigation, '')}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">7 / 30 / 90 Day Family Office Path</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <StageColumn label="Day 7" items={asArray<string>(actionPath.day_7)} />
            <StageColumn label="Day 30" items={asArray<string>(actionPath.day_30)} />
            <StageColumn label="Day 90" items={asArray<string>(actionPath.day_90)} />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <InsightList title="Crown Vault Consequence" items={asArray<string>(crownVault.items)} tone="soft" />
          <InsightList title="Home Dashboard Carry-Forward" items={asArray<string>(dashboardCarry.items)} />
          <InsightList title="House Learning Write-Back" items={asArray<string>(houseLearning.items)} tone="soft" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <InsightList title="What This Memo Does Not Yet Know" items={asArray<string>(unknowns.items)} tone="warn" />
          <InsightList title="Next Disclosure Needed For Deeper Precision" items={asArray<string>(disclosure.items)} />
        </div>
      </ChapterShell>

      <ChapterShell
        eyebrow="Appendix"
        title="Evidence Ledger"
        description="The memo closes with evidence quality, authority depth, and the exact reference packet behind the governing answer."
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[1.6rem] border border-border/35 bg-background/70 p-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Evidence Status</p>
            <div className="grid gap-4 md:grid-cols-2">
              <InsightList title="Validated Core" items={asArray<string>(evidence.validated_core)} tone="soft" />
              <InsightList title="Modeled Core" items={asArray<string>(evidence.modeled_core)} />
              <InsightList title="Adjacent Intelligence" items={asArray<string>(evidence.adjacent_intelligence)} />
              <InsightList title="Blocked Unknown" items={asArray<string>(evidence.blocked_unknown)} tone="warn" />
            </div>
          </div>

          <MetricBoard
            title="Authority Snapshot"
            items={[
              { label: 'Direct Route Precedents', value: precedentCount ? String(precedentCount) : '—' },
              { label: 'Collections / Developments', value: developmentsCount ? developmentsCount.toLocaleString() : '—' },
              { label: 'Authority References', value: references?.total_count ? String(references.total_count) : '—' },
              { label: 'Decision Basis Note', note: routeEvidenceBasisNote || '—' },
            ]}
          />
        </div>

        {references ? (
          <div className="mt-5 rounded-[1.6rem] border border-border/35 bg-background/70 p-4 sm:p-5">
            <ReferencesSection
              references={references}
              developmentsCount={developmentsCount}
              precedentCount={precedentCount}
            />
          </div>
        ) : null}
      </ChapterShell>
    </div>
  );
}
