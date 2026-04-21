'use client';

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  GitBranch,
  Landmark,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints,
} from 'lucide-react';
import type { LegalReferences } from '@/lib/pdf/pdf-types';
import CrossBorderTaxAudit from './CrossBorderTaxAudit';
import WealthProjectionSection from './WealthProjectionSection';
import { Page3PeerIntelligence } from './Page3PeerIntelligence';
import HNWITrendsSection from './HNWITrendsSection';
import { TransparencyRegimeSection } from './TransparencyRegimeSection';
import RealAssetAuditSection from './RealAssetAuditSection';
import { CrisisResilienceSection, normalizeCrisisData } from './CrisisResilienceSection';
import ScenarioTreeSection from './ScenarioTreeSection';
import HeirManagementSection from './HeirManagementSection';
import ReferencesSection from './ReferencesSection';
import { memoNumberClass } from '@/lib/decision-memo/memo-design-tokens';

interface HouseGradeMemoSectionProps {
  data?: Record<string, any> | null;
  previewData?: Record<string, any> | null;
  references?: LegalReferences | null;
  developmentsCount?: number;
  precedentCount?: number;
  routeEvidenceBasisNote?: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
  embedDetailedSchedules?: boolean;
  chapterId?:
    | 'hero'
    | 'governing-correction'
    | 'house-read'
    | 'validated-route'
    | 'live-market-crisis'
    | 'continuity-office-carry'
    | 'evidence';
}

type Tone = 'default' | 'gold' | 'emerald' | 'amber' | 'red';

type NormalizedItem = {
  text: string;
  status?: string;
  value?: string;
  note?: string;
};

type OwnershipSeat = {
  seat: string;
  owner: string;
  approvalRight: string;
  burden: string;
  stop: string;
  tone?: Tone;
};

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

function formatDisplayMetric(value: unknown, fallback = '—'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.abs(value) >= 1000 ? `$${Math.round(value).toLocaleString()}` : String(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const cleaned = trimmed.replace(/[$,%]/g, '').replace(/,/g, '');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed) && /[$,]/.test(trimmed)) {
      return `$${Math.round(parsed).toLocaleString()}`;
    }
    return trimmed;
  }
  return fallback;
}

function toNumericMetric(value: unknown): { numeric: number; isCurrency: boolean; isPercent: boolean } | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { numeric: value, isCurrency: false, isPercent: false };
  }

  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const cleaned = trimmed.replace(/[$,%]/g, '').replace(/,/g, '');
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return null;

  return {
    numeric,
    isCurrency: trimmed.includes('$'),
    isPercent: trimmed.includes('%'),
  };
}

function formatCompactCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${sign}$${(absolute / 1_000_000_000).toFixed(2).replace(/\.00$/, '')}B`;
  }
  if (absolute >= 1_000_000) {
    return `${sign}$${(absolute / 1_000_000).toFixed(2).replace(/\.00$/, '')}M`;
  }
  if (absolute >= 1_000) {
    const precision = absolute >= 100_000 ? 0 : 1;
    return `${sign}$${(absolute / 1_000).toFixed(precision).replace(/\.0$/, '')}K`;
  }
  return `${sign}$${Math.round(absolute).toLocaleString()}`;
}

function formatReadableMetric(
  value: unknown,
  variant: 'rail' | 'proof' | 'default' = 'default',
  fallback = '—',
): string {
  if (typeof value === 'string' && value.includes('/')) {
    return value
      .split('/')
      .map((part) => formatReadableMetric(part.trim(), variant, fallback))
      .join(' / ');
  }

  const parsed = toNumericMetric(value);
  if (!parsed) return formatDisplayMetric(value, fallback);

  if (parsed.isCurrency) {
    return variant === 'default' ? formatDisplayMetric(value, fallback) : formatCompactCurrency(parsed.numeric);
  }

  if (parsed.isPercent) {
    return `${parsed.numeric.toFixed(2).replace(/\.00$/, '')}%`;
  }

  if (typeof value === 'string' && /day|days|month|months|year|years/i.test(value)) {
    return value.trim();
  }

  if (Number.isInteger(parsed.numeric)) {
    return parsed.numeric.toLocaleString();
  }

  return parsed.numeric.toFixed(2).replace(/\.00$/, '');
}

function extractLeadingMetricToken(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/-?\$[\d,]+(?:\.\d+)?(?:[KMB])?|-?\d+(?:\.\d+)?%/);
  return match ? match[0] : null;
}

function metricNarrativeTail(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const token = extractLeadingMetricToken(trimmed);
  if (!token) return trimmed;
  const tail = trimmed.replace(token, '').replace(/^[\s–—:]+/, '').trim();
  return tail;
}

function uniqueTexts(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function metricValueClass(value: string | null | undefined, size: 'rail' | 'proof'): string {
  const display = (value || '').trim();
  const long = display.length >= 12;
  if (size === 'rail') {
    return memoNumberClass(long ? 'stat' : 'inline', 'default', 'whitespace-nowrap leading-[0.98]');
  }
  return memoNumberClass(long ? 'stat' : 'metric', 'default', 'whitespace-nowrap leading-[0.98]');
}

function statusTone(status?: string): Tone {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('block') || normalized.includes('abort') || normalized.includes('critical')) return 'red';
  if (normalized.includes('warn') || normalized.includes('risk') || normalized.includes('active') || normalized.includes('conditional')) return 'amber';
  if (normalized.includes('pass') || normalized.includes('lock') || normalized.includes('ready') || normalized.includes('approved')) return 'emerald';
  return 'default';
}

function normalizeItemNote(note?: string): string | undefined {
  if (!note) return undefined;
  const trimmed = note.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  const genericPatterns = [
    'this must be evidenced in writing before the route can harden',
    'if this survives remediation, the principal should not proceed',
    'the principal should not proceed',
  ];

  if (genericPatterns.some((pattern) => lower.includes(pattern))) {
    return undefined;
  }

  return trimmed;
}

function normalizeListItems(values: unknown): NormalizedItem[] {
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
          record.failure,
          record.description,
          record.item,
          record.name,
          record.headline,
        ]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || '';

      if (!text) return null;

      const status =
        [record.status, record.state, record.priority, record.level]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || undefined;
      const valueText =
        [record.value, record.amount, record.metric]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || undefined;
      const note =
        [record.note, record.consequence, record.why, record.detail]
          .map((candidate) => (typeof candidate === 'string' ? candidate.trim() : ''))
          .find(Boolean) || undefined;

      const normalizedNote = normalizeItemNote(note);

      return {
        text,
        status,
        value: valueText,
        note:
          normalizedNote && normalizedNote.toLowerCase() === text.toLowerCase()
            ? undefined
            : normalizedNote,
      };
    })
    .filter((item): item is NormalizedItem => Boolean(item?.text));
}

function formatDecisionCode(value?: string): string {
  const normalized = (value || '').trim();
  if (!normalized) return 'Decision Pending';
  return normalized.replace(/_/g, ' ');
}

function fallbackDecisionSignal(preview: Record<string, any>, memo: Record<string, any>) {
  const scenario = preview.scenario_tree_data || {};
  const risk = preview.risk_assessment || {};
  const structureVerdict = preview.structure_optimization?.verdict;
  const recommended = scenario.recommended_branch || risk.structure_verdict || risk.verdict || structureVerdict;
  if (!recommended) return {};
  const value = String(recommended).replace(/_/g, ' ').toUpperCase();
  return {
    value,
    code: String(recommended).toUpperCase(),
    rationale:
      scenario.rationale ||
      risk.verdict_note ||
      memo.real_decision?.headline ||
      'This move only survives if structure, tax, banking, title, and succession are locked in the right order before capital or SPA commitments harden.',
  };
}

function fallbackCorrectedThesis(preview: Record<string, any>, memo: Record<string, any>) {
  const starting = preview.wealth_projection_data?.starting_position || {};
  const input = preview.input_snapshot || {};
  return {
    room_believed:
      input.mandate ||
      starting.original_thesis ||
      'The room was treating the move primarily as a return and location call before the route-control conditions were written down.',
    actual_truth:
      memo.real_decision?.headline ||
      preview.cross_border_audit_summary?.executive_summary ||
      'The move only survives if structure, tax, banking, title, and succession are governed as one route before the closing window hardens.',
    what_changed:
      memo.corrected_thesis?.what_changed ||
      'The memo moved the room from upside language to route control: what must be true in writing before approval, what stops the move, and what the office carries next.',
  };
}

function fallbackHousePurpose(
  preview: Record<string, any>,
  sourceJurisdiction?: string,
  destinationJurisdiction?: string,
) {
  const source = sourceJurisdiction || preview.source_jurisdiction || 'the source jurisdiction';
  const destination = destinationJurisdiction || preview.destination_jurisdiction || 'the destination jurisdiction';
  const destinationAsset =
    destination.toLowerCase() === 'uae' ? 'Dubai purchase' : `${destination} acquisition`;
  const constraints = normalizeListItems(preview.input_snapshot?.constraints).map((item) => item.text);
  const defaultItems = [
    `Keep one house answer in control of the ${source} → ${destination} move so tax, banking, counsel, and family decisions do not split apart at signing.`,
    `Prevent day-one friction, onboarding delay, and later probate or reporting leakage from turning the ${destinationAsset} into an avoidable loss event.`,
    `Use the ${destinationAsset} to strengthen continuity across the family and office, with succession, governance, and operating memory locked before close.`,
  ];
  return {
    headline:
      `Protect house authority, stop avoidable leakage, and turn the ${destinationAsset} into a governed continuity move before capital hardens.`,
    items: constraints.length ? constraints.slice(0, 3) : defaultItems,
  };
}

function fallbackRouteArchitecture(preview: Record<string, any>) {
  const source = preview.source_jurisdiction || 'Source';
  const destination = preview.destination_jurisdiction || 'Destination';
  const structure = preview.structure_optimization?.recommended_structure || 'Direct individual freehold purchase';
  const taxNote = preview.cross_border_audit_summary?.ongoing_tax_savings_note;
  return {
    items: [
      { label: 'Jurisdictions', value: `${source} → ${destination}` },
      { label: 'Route', value: structure },
      { label: 'Tax posture', value: taxNote || 'No relocation-linked tax arbitrage assumed.' },
      { label: 'Reporting consequence', value: 'Cross-border reporting, banking, and succession rails stay live through execution.' },
    ],
  };
}

function fallbackEconomicProof(preview: Record<string, any>, memo: Record<string, any>) {
  const acq = preview.cross_border_audit_summary?.acquisition_audit || {};
  const net = preview.cross_border_audit_summary?.net_yield_audit || {};
  const weighted = preview.wealth_projection_data?.probability_weighted_outcome || {};
  const decisionEv = preview.scenario_tree_data?.decision_ev_usd || preview.scenario_tree_data?.expected_value_usd;
  return {
    transaction_value: acq.property_value_formatted || memo.transaction_value || '—',
    capital_deployed: acq.total_acquisition_cost_formatted || memo.capital_deployed || '—',
    day_one_loss: acq.day_one_loss_amount_formatted || memo.day_one_loss || '—',
    underwritten_annual_return: weighted.expected_value_formatted || memo.underwritten_annual_return || '—',
    gross_yield: net.gross_yield_pct != null ? `${Number(net.gross_yield_pct).toFixed(2)}%` : '—',
    net_yield: net.net_yield_pct != null ? `${Number(net.net_yield_pct).toFixed(2)}%` : '—',
    appreciation_basis: preview.wealth_projection_data?.starting_position?.appreciation_rate_pct != null
      ? `${Number(preview.wealth_projection_data.starting_position.appreciation_rate_pct).toFixed(2)}%`
      : '—',
    decision_ev: typeof decisionEv === 'number' ? `$${Math.round(decisionEv).toLocaleString()}` : '—',
    drawdown_floor: preview.crisis_data?.stress_drawdown_floor || '—',
  };
}

function fallbackExecutionSequence(preview: Record<string, any>) {
  const steps = asArray<Record<string, any>>(preview.execution_sequence).map((step, index) => ({
    order: step.order || step.step || index + 1,
    title: step.action || step.title || `Step ${index + 1}`,
    detail: step.whyThisOrder || step.description || step.timeline || '',
    wrong_order_cost: step.dependency || '',
  }));
  return { steps };
}

function fallbackFailureLogic(preview: Record<string, any>) {
  const criticalItems = asArray<string>(preview.risk_assessment?.critical_items);
  const highItems = asArray<string>(preview.risk_assessment?.high_items);
  const items = [...criticalItems, ...highItems].slice(0, 4).map((item, index) => ({
    category: `Failure ${index + 1}`,
    failure: item,
    consequence: 'If left unresolved, this weakens route control and increases irreversible loss.',
  }));
  return { items };
}

function fallbackContinuity(preview: Record<string, any>) {
  const heir = preview.heir_management_data || {};
  const g2 = heir.g1_to_g2_transfer || {};
  const g3 = heir.g2_to_g3_transfer || {};
  return {
    items: [
      { label: 'G1 route control', value: heir.with_structure?.route_control_score ? `${Math.round(heir.with_structure.route_control_score)}/100` : '—', detail: 'How well the route preserves control before hard commitment.' },
      { label: 'G2 retained value', value: g2.net_to_heirs_formatted || '—', detail: 'Net continuity after estate drag and route friction.' },
      { label: 'G3 without governance lock', value: g3.without_structure_formatted || '—', detail: 'Durable value if succession remains loose.' },
      { label: 'G3 with governance lock', value: g3.with_structure_formatted || '—', detail: 'Durable value after governance and succession are locked before close.' },
    ],
    top_trigger: heir.top_succession_trigger || {},
  };
}

function fallbackActionPath(preview: Record<string, any>) {
  const gates = asArray<string>(preview.scenario_tree_data?.critical_gates);
  return {
    day_7: gates.slice(0, 3),
    day_30: ['Convert the corrected route into one governed operating plan with owners and dates.'],
    day_90: ['Write the route lesson and governance rule back into house memory for the next cross-border move.'],
  };
}

function fallbackEvidenceStatus(preview: Record<string, any>, routeEvidenceBasisNote?: string) {
  return {
    validated_core: [
      routeEvidenceBasisNote || 'Core route evidence was validated through cross-border audit, scenario tree, and route witness surfaces.',
    ],
    modeled_core: [
      'Asset-level underwriting remains modeled until the live shortlist and documentation stack are locked.',
    ],
    adjacent_intelligence: [
      'Market, pattern, and crisis rails sharpen timing and route pressure but do not replace route-core evidence.',
    ],
    blocked_unknown: normalizeListItems(preview.house_grade_memo?.what_this_memo_does_not_yet_know?.items || []).map((item) => item.text),
  };
}

function humanizeKey(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function purposeEyebrow(text: string, index: number): string {
  const lower = text.toLowerCase();
  if (
    lower.includes('authority') ||
    lower.includes('one house') ||
    lower.includes('specialist') ||
    lower.includes('control')
  ) {
    return 'House Authority';
  }
  if (
    lower.includes('leak') ||
    lower.includes('day-one') ||
    lower.includes('bank') ||
    lower.includes('tax') ||
    lower.includes('probate') ||
    lower.includes('friction')
  ) {
    return 'Leakage Control';
  }
  if (
    lower.includes('continuity') ||
    lower.includes('succession') ||
    lower.includes('generation') ||
    lower.includes('g1') ||
    lower.includes('g2') ||
    lower.includes('g3')
  ) {
    return 'Continuity';
  }
  return ['House Authority', 'Leakage Control', 'Continuity'][index] || 'Priority';
}

function isInternalConstraintKey(key: string): boolean {
  return [
    'timeline',
    'timeline_days',
    'max_timeline_days',
    'decision_window_days',
    'web_validation_required',
    'required_web_validation_fields',
    'provided_web_validation_fields',
    'purchase_vehicle',
    'validation_fields',
    'required_fields',
  ].includes(key);
}

function publicConstraintLabel(key: string): string {
  const overrides: Record<string, string> = {
    timeline: 'Decision Horizon',
    timeline_days: 'Decision Horizon',
    max_timeline_days: 'Decision Horizon',
    decision_window_days: 'Decision Window',
    target_locations: 'Target Footprint',
    leverage_cap: 'Leverage Ceiling',
    ltv_cap: 'Leverage Ceiling',
    succession_lock_required: 'Succession Lock',
    banking_ready_before_signing: 'Banking Condition',
  };
  return overrides[key] || humanizeKey(key);
}

function publicConstraintValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Required' : 'Not required';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string') return value;
  return '';
}

function buildPublicConstraintItems(inputConstraints: Record<string, any>, liveDecisionWindow?: number | null) {
  const items: NormalizedItem[] = [];

  const timeline =
    inputConstraints.timeline_days ??
    inputConstraints.max_timeline_days ??
    inputConstraints.timeline;
  if (typeof timeline === 'number' && Number.isFinite(timeline)) {
    items.push({
      text: liveDecisionWindow && liveDecisionWindow > 0 && liveDecisionWindow !== timeline
        ? `Decision horizon: the room entered with a ${timeline}-day working window, but the live governed route is now operating inside a ${liveDecisionWindow}-day execution window.`
        : `Decision horizon: the room entered with a ${timeline}-day working window to get the move under control.`,
    });
  } else if (typeof timeline === 'string' && timeline.trim()) {
    items.push({
      text: `Decision horizon: ${timeline.trim()}.`,
    });
  }

  const requiredFields =
    inputConstraints.required_web_validation_fields ||
    inputConstraints.validation_fields ||
    inputConstraints.required_fields;
  if (Array.isArray(requiredFields) && requiredFields.length) {
    const readableFields = requiredFields
      .map((field) => humanizeKey(String(field)))
      .join(' and ');
    items.push({
      text: `External underwriting check: ${readableFields} had to be validated against live market evidence before approval.`,
    });
  } else if (inputConstraints.web_validation_required === true) {
    items.push({
      text: 'External underwriting check: key market assumptions had to be validated against live evidence before approval.',
    });
  }

  if (typeof inputConstraints.purchase_vehicle === 'string' && inputConstraints.purchase_vehicle.trim()) {
    items.push({
      text: `Structure was not fixed at intake. The memo had to resolve the purchase vehicle rather than inherit the original ${inputConstraints.purchase_vehicle.trim()} instruction without underwriting it.`,
    });
  }

  const remaining = Object.entries(inputConstraints)
    .filter(([key, value]) => !isInternalConstraintKey(key) && value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({
      text: `${publicConstraintLabel(key)}: ${publicConstraintValue(value)}`,
    }));

  return [...items, ...remaining];
}

function buildDecisionRailItems(
  inputRails: Record<string, any>,
  routeLabel: string,
  destinationAsset: string,
): NormalizedItem[] {
  const advisorItems = asArray<Record<string, any>>(inputRails.advisors).map((advisor) => {
    const name = asText(advisor.name, 'Advisor');
    const role = asText(advisor.role, '');
    const combined = `${name} ${role}`.toLowerCase();

    let note =
      'This rail cannot remain advisory only once the move enters a live signing window.';

    if (combined.includes('tax')) {
      note =
        'Must confirm current residence, long-term UK residence / IHT exposure, and overseas property treatment before signing.';
    } else if (combined.includes('property') || combined.includes('transaction') || combined.includes('counsel')) {
      note =
        `Must clear ${routeLabel}, title, SPA terms, service-charge stack, and purchase documentation before ${destinationAsset} execution.`;
    } else if (combined.includes('bank')) {
      note =
        'Must have onboarding, source-of-funds, remittance rails, and test transfer cleared before funds move.';
    } else if (combined.includes('succession') || combined.includes('will')) {
      note =
        'Must lock the succession route and governing documents before close, not as post-completion clean-up.';
    }

    return {
      text: role || name,
      status: 'Advisor',
      note,
      value: role && role !== name ? name : undefined,
    };
  });

  const heirs = asArray<Record<string, any>>(inputRails.heirs);
  const heirNames = heirs
    .map((heir) => asText(heir.name, ''))
    .filter(Boolean);
  const familyItems: NormalizedItem[] = heirNames.length
    ? [
        {
          text: `Family continuity rail${heirNames.length ? ` — ${heirNames.join(' and ')}` : ''}`,
          status: 'Family',
          note:
            'These beneficiaries should not enter the file as passive names only. Succession logic, beneficiary routing, and education expectations must be set before close.',
        },
      ]
    : [];

  return [...advisorItems, ...familyItems];
}

function findAdvisorByKeywords(advisors: Record<string, any>[], keywords: string[]) {
  return advisors.find((advisor) => {
    const combined = `${asText(advisor.name, '')} ${asText(advisor.role, '')}`.toLowerCase();
    return keywords.some((keyword) => combined.includes(keyword));
  });
}

function buildOwnershipSeats({
  advisors,
  heirs,
  decisionOwner,
  routeLabel,
}: {
  advisors: Record<string, any>[];
  heirs: Record<string, any>[];
  decisionOwner?: string;
  routeLabel: string;
}): OwnershipSeat[] {
  const taxAdvisor = findAdvisorByKeywords(advisors, ['tax']);
  const propertyAdvisor = findAdvisorByKeywords(advisors, ['property', 'transaction', 'real estate', 'counsel']);
  const bankAdvisor = findAdvisorByKeywords(advisors, ['bank', 'banking', 'private bank', 'wealth manager']);
  const successionAdvisor = findAdvisorByKeywords(advisors, ['succession', 'estate', 'private client', 'will', 'trust']);

  const heirNames = heirs.map((heir) => asText(heir.name, '')).filter(Boolean);

  const seats: OwnershipSeat[] = [
    {
      seat: 'Principal Approval',
      owner: asText(decisionOwner, 'Principal'),
      approvalRight: 'Decides whether the house accepts the corrected route after the written gate pack is complete.',
      burden: 'No SPA, funding, or social commitment is treated as final until tax, banking, title, and succession evidence align.',
      stop: 'Any unresolved gate survives remediation or the move still depends on oral comfort rather than written control.',
      tone: 'gold',
    },
    {
      seat: 'Operating Owner',
      owner: 'Family-office route lead to be named',
      approvalRight: 'Owns the master route file, dated owner map, escalation chain, and execution sequence across all advisers.',
      burden: 'Keeps tax, banking, title, succession, and asset diligence in one operating cadence so the move does not fragment between folders or advisors.',
      stop: `No one is explicitly carrying ${routeLabel}, owners, dates, and escalation into the live closing window.`,
      tone: 'default',
    },
  ];

  if (taxAdvisor || propertyAdvisor || bankAdvisor || successionAdvisor || heirs.length) {
    seats.push(
      {
        seat: 'UK Tax Sign-Off',
        owner: taxAdvisor ? `${asText(taxAdvisor.name, 'Advisor')}${taxAdvisor.role ? ` — ${asText(taxAdvisor.role, '')}` : ''}` : 'UK international tax counsel',
        approvalRight: 'Controls whether the route can proceed from a UK residence, IHT, and overseas property reporting perspective.',
        burden: 'Issue the written view on current residence, long-term UK exposure, overseas property treatment, and post-close reporting before signing.',
        stop: 'The tax position is absent, inconsistent, or unsuitable for the route the house is trying to execute.',
        tone: 'amber',
      },
      {
        seat: 'UAE Route Counsel',
        owner: propertyAdvisor ? `${asText(propertyAdvisor.name, 'Advisor')}${propertyAdvisor.role ? ` — ${asText(propertyAdvisor.role, '')}` : ''}` : 'UAE property / transaction counsel',
        approvalRight: 'Controls whether the chosen UAE purchase route, title package, and SPA mechanics are actually executable.',
        burden: 'Clear direct individual freehold purchase route, title, encumbrances, service-charge stack, SPA terms, and completion mechanics before any commitment is treated as hard.',
        stop: 'Title, allocation, or route mechanics fail and the file is still being advanced on broker comfort.',
        tone: 'amber',
      },
      {
        seat: 'Banking Release',
        owner: bankAdvisor ? `${asText(bankAdvisor.name, 'Advisor')}${bankAdvisor.role ? ` — ${asText(bankAdvisor.role, '')}` : ''}` : 'UAE banking lead to be named',
        approvalRight: 'Controls whether capital can legally and operationally move through the route on time.',
        burden: 'Complete onboarding, source-of-funds package, remittance path, and test transfer before the SPA execution window.',
        stop: 'Funds cannot move cleanly, test transfer fails, or onboarding remains conditional while the house is being asked to proceed.',
        tone: 'amber',
      },
      {
        seat: 'Continuity And Succession',
        owner: successionAdvisor
          ? `${asText(successionAdvisor.name, 'Advisor')}${successionAdvisor.role ? ` — ${asText(successionAdvisor.role, '')}` : ''}`
          : heirNames.length
            ? `Family continuity seat — ${heirNames.join(' and ')}`
            : 'Succession counsel / family continuity seat',
        approvalRight: 'Controls whether the asset enters the house as a governed continuity asset rather than an offshore ownership problem for the next generation.',
        burden: 'Lock the DIFC Will or approved equivalent route, beneficiary logic, governance steps, and heir briefing path before close.',
        stop: 'Succession remains open, heirs are uninformed, or the asset is treated as complete before continuity documents are settled.',
        tone: 'amber',
      },
    );
  }

  return seats;
}

function soundsGenericHeroCopy(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    'property attractiveness decision',
    'house-control decision',
    'one route before capital moves',
    'keep the move governable by one house answer',
    'prevent visible day-one leakage',
    'continuity-strengthening move',
    'upside language to route control',
    'return and location call',
  ].some((needle) => lower.includes(needle));
}

function principalPurposeItems(source: string, destination: string, destinationAsset: string): NormalizedItem[] {
  return [
    {
      text: `Keep one house answer in charge of the ${source} → ${destination} move so UK tax advice, UAE banking activation, transaction counsel, and family judgment do not diverge at signing.`,
    },
    {
      text: `Strip out avoidable leakage before the ${destinationAsset} closes: day-one friction, onboarding delay, title slippage, probate drag, and later reporting clean-up.`,
    },
    {
      text: `Use the ${destinationAsset} to strengthen continuity, with succession locks, governance rules, and office memory established before close rather than repaired after it.`,
    },
  ];
}

function formatDrawdownFloor(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const pct = value > 0 && value < 1 ? value * 100 : value;
    return `${Math.round(pct)}% drawdown floor`;
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    const parsed = Number(trimmed.replace(/[^0-9.:-]/g, ''));
    if (Number.isFinite(parsed) && !trimmed.includes('%') && parsed > 0 && parsed < 1) {
      return `${Math.round(parsed * 100)}% drawdown floor`;
    }
    if (Number.isFinite(parsed) && !trimmed.toLowerCase().includes('drawdown')) {
      return `${Math.round(parsed)}% drawdown floor`;
    }
    return trimmed;
  }
  return '—';
}

function crisisScenarioTitle(scenario: Record<string, any>, index: number): string {
  const direct = asText(scenario.title || scenario.name || scenario.label, '');
  if (direct) return direct;

  const stress = asText(scenario.stress_factor, '');
  const lower = stress.toLowerCase();
  if (lower.includes('7 days') || lower.includes('hormuz') || lower.includes('energy shock')) {
    return 'Hormuz Closure Keeps Energy Shock Acute';
  }
  if (lower.includes('10 days') || lower.includes('oil')) {
    return 'Oil Shock Regime Remains Acute';
  }
  if (lower.includes('remittance') || lower.includes('onboarding') || lower.includes('title sequencing')) {
    return 'Banking Rail Execution Freeze';
  }

  const verdict = asText(scenario.verdict, '').toLowerCase();
  if (verdict.includes('funding rails')) return 'Banking Rail Execution Freeze';

  return `Live Stress Scenario ${index + 1}`;
}

function toneClasses(tone: Tone) {
  if (tone === 'gold') return 'border-gold/25 bg-gradient-to-br from-gold/[0.06] via-card to-card';
  if (tone === 'emerald') return 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.05] via-card to-card';
  if (tone === 'amber') return 'border-amber-500/20 bg-gradient-to-br from-amber-500/[0.05] via-card to-card';
  if (tone === 'red') return 'border-red-500/20 bg-gradient-to-br from-red-500/[0.05] via-card to-card';
  return 'border-border/20 bg-gradient-to-br from-card via-card to-muted/10';
}

function sectionHeader(eyebrow: string, title: string, subtitle: string, icon: ReactNode) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-start gap-4">
        <div className="mt-1 rounded-2xl border border-gold/20 bg-gold/[0.08] p-3 text-gold/80">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold/70 font-medium">{eyebrow}</p>
          <h2 className="mt-2 text-[28px] md:text-[34px] font-semibold leading-tight tracking-tight text-foreground">{title}</h2>
          <p className="mt-4 max-w-4xl text-sm md:text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </div>
  );
}

function SurfaceCard({
  title,
  eyebrow,
  children,
  tone = 'default',
  className = '',
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 overflow-hidden rounded-[28px] border p-5 sm:p-6 lg:p-7 ${toneClasses(tone)} ${className}`}>
      {(eyebrow || title) ? (
        <div className="mb-5">
          {eyebrow ? <p className="text-[11px] uppercase tracking-[0.24em] text-gold/70 font-medium mb-2">{eyebrow}</p> : null}
          {title ? <h3 className="break-words text-lg md:text-[22px] font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{title}</h3> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function StatusPill({ value }: { value?: string }) {
  if (!value) return null;
  const tone = statusTone(value);
  const toneText =
    tone === 'red'
      ? 'border-red-500/25 text-red-500/80 bg-red-500/[0.05]'
      : tone === 'amber'
        ? 'border-amber-500/25 text-amber-600/85 bg-amber-500/[0.06]'
        : tone === 'emerald'
          ? 'border-emerald-500/25 text-emerald-500/80 bg-emerald-500/[0.05]'
          : 'border-border/20 text-muted-foreground bg-card/60';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${toneText}`}>
      {value}
    </span>
  );
}

function SignalRail({
  title,
  items,
  tone = 'default',
}: {
  title: string;
  items: Array<{ label: string; value?: string | null; note?: string | null; tone?: Tone }>;
  tone?: Tone;
}) {
  const usable = items.filter((item) => item.value || item.note);
  if (!usable.length) return null;
  return (
    <SurfaceCard title={title} tone={tone} className="h-full">
      <div className="divide-y divide-border/15">
        {usable.map((item) => (
          <div key={item.label} className="py-4 first:pt-0 last:pb-0">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr),auto] xl:items-start">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/75">{item.label}</p>
                {item.note ? <p className="mt-3 max-w-xl break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{item.note}</p> : null}
              </div>
              {item.value ? (
                <div className="xl:justify-self-end xl:text-right">
                  <p className={metricValueClass(formatReadableMetric(item.value, 'rail'), 'rail')}>
                    {formatReadableMetric(item.value, 'rail')}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function MetricBand({
  title,
  items,
  tone = 'default',
  columns = 3,
}: {
  title: string;
  items: Array<{ label: string; value?: string | null; note?: string | null }>;
  tone?: Tone;
  columns?: 2 | 3 | 4 | 6;
}) {
  const usable = items.filter((item) => item.value || item.note);
  if (!usable.length) return null;
  const cols =
    columns === 6
      ? 'md:grid-cols-2 2xl:grid-cols-3'
      : columns === 4
        ? 'md:grid-cols-2 2xl:grid-cols-2'
        : columns === 2
          ? 'lg:grid-cols-2'
          : 'lg:grid-cols-2 2xl:grid-cols-3';
  return (
    <SurfaceCard title={title} tone={tone}>
      <div className={`grid gap-4 ${cols}`}>
        {usable.map((item) => (
          <div key={item.label} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">{item.label}</p>
            {item.value ? (
              <p className={`${metricValueClass(formatReadableMetric(item.value, 'proof'), 'proof')} mt-3`}>
                {formatReadableMetric(item.value, 'proof')}
              </p>
            ) : null}
            {item.note ? <p className="mt-4 max-w-md break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{item.note}</p> : null}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function CapitalExposurePanel({
  corridorLabel,
  transactionValue,
  capitalDeployed,
  dayOneLoss,
  decisionEv,
  decisionEvNote,
  grossYield,
  netYield,
  appreciationBasis,
  drawdownFloor,
}: {
  corridorLabel: string;
  transactionValue?: string | null;
  capitalDeployed?: string | null;
  dayOneLoss?: string | null;
  decisionEv?: string | null;
  decisionEvNote?: string | null;
  grossYield?: string | null;
  netYield?: string | null;
  appreciationBasis?: string | null;
  drawdownFloor?: string | null;
}) {
  return (
    <SurfaceCard title="Capital And Exposure Proof" tone="gold">
      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1.05fr),360px]">
        <div className="min-w-0">
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            This is the capital question behind the move: how much the house is committing, what is irrecoverably paid before the route is proven, and what the corrected route is worth only if the gate set actually clears.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Transaction Value</p>
              <p className={`${metricValueClass(formatReadableMetric(transactionValue, 'proof'), 'proof')} mt-3`}>
                {formatReadableMetric(transactionValue, 'proof')}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Asset value under review before closing mechanics, title allocation, and route costs are layered in.
              </p>
            </div>
            <div className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">All-In Capital Committed</p>
              <p className={`${metricValueClass(formatReadableMetric(capitalDeployed, 'proof'), 'proof')} mt-3`}>
                {formatReadableMetric(capitalDeployed, 'proof')}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Gross commitment once day-one friction and route costs are included, not just the headline asset price.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)]">
            <div className="min-w-0 rounded-[24px] border border-red-500/15 bg-red-500/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-red-500/75">Day-One Loss</p>
              <p className={`${metricValueClass(formatReadableMetric(dayOneLoss, 'proof'), 'proof')} mt-3`}>
                {formatReadableMetric(dayOneLoss, 'proof')}
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground">
                This capital leaves the house before {corridorLabel} has been proven executable.
              </p>
            </div>

            <div className="min-w-0 rounded-[24px] border border-gold/20 bg-gold/[0.06] p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold/75">Decision EV</p>
              <p className={`${metricValueClass(formatReadableMetric(decisionEv, 'proof'), 'proof')} mt-3`}>
                {formatReadableMetric(decisionEv, 'proof')}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground">
                {asText(decisionEvNote, 'Validated route expected value after the gate set clears.')}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 border-t border-border/12 pt-6 2xl:border-l 2xl:border-t-0 2xl:pl-7 2xl:pt-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">Underwriting Basis</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The market story only matters through the corrected underwriting basis. These are the live numbers the house is actually relying on.
          </p>

          <div className="mt-6 divide-y divide-border/12">
            {[
              {
                label: 'Gross Yield',
                value: grossYield,
                note: 'Broker-level income indication before vacancy, service-charge, and route drag.',
              },
              {
                label: 'Net Yield',
                value: netYield,
                note: `The income basis the house should underwrite on ${corridorLabel}, not on brochure ambition.`,
              },
              {
                label: 'Appreciation Basis',
                value: appreciationBasis,
                note: 'The corrected appreciation assumption after witness review, not a straight-line continuation claim.',
              },
              {
                label: 'Stress Drawdown Floor',
                value: drawdownFloor,
                note: 'The repricing regime the house must survive without breaking route discipline or treasury calm.',
              },
            ].map((row) => (
              <div key={row.label} className="grid gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">{row.label}</p>
                  <p className={metricValueClass(formatReadableMetric(row.value, 'rail'), 'rail')}>
                    {formatReadableMetric(row.value, 'rail')}
                  </p>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{row.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function ListRows({
  items,
  numbered = false,
}: {
  items: unknown;
  numbered?: boolean;
}) {
  const normalized = normalizeListItems(items);
  if (!normalized.length) return null;
  return (
    <div className="divide-y divide-border/12">
      {normalized.map((item, index) => (
        <div key={`${item.text}-${index}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <div className="shrink-0 pt-0.5">
            {numbered ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-xs font-semibold text-gold/80">
                {index + 1}
              </div>
            ) : (
              <div className="mt-2 h-1.5 w-1.5 rounded-full bg-gold/70" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.status ? <StatusPill value={item.status} /> : null}
              {item.value ? <span className="break-words text-xs uppercase tracking-[0.18em] text-gold/80 [overflow-wrap:anywhere]">{item.value}</span> : null}
            </div>
            <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{item.text}</p>
            {item.note ? <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{item.note}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListPanel({
  title,
  items,
  tone = 'default',
  numbered = false,
  description,
}: {
  title: string;
  items: unknown;
  tone?: Tone;
  numbered?: boolean;
  description?: string;
}) {
  const normalized = normalizeListItems(items);
  if (!normalized.length) return null;
  return (
    <SurfaceCard title={title} tone={tone}>
      {description ? <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <ListRows items={normalized} numbered={numbered} />
    </SurfaceCard>
  );
}

function OwnershipMapPanel({
  title,
  description,
  seats,
}: {
  title: string;
  description?: string;
  seats: OwnershipSeat[];
}) {
  if (!seats.length) return null;
  return (
    <SurfaceCard title={title} tone="gold">
      {description ? <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {seats.map((seat) => (
          <div key={`${seat.seat}-${seat.owner}`} className={`min-w-0 rounded-[24px] border p-5 ${toneClasses(seat.tone || 'default')}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold/70">{seat.seat}</p>
                <p className="mt-2 break-words text-base md:text-[17px] font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{seat.owner}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Approval Right</p>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{seat.approvalRight}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Exact Burden</p>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{seat.burden}</p>
              </div>
              <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-red-500/70">What Stops The Move</p>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{seat.stop}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function KeyValuePanel({
  title,
  rows,
  tone = 'default',
  columns = 2,
}: {
  title: string;
  rows: Array<{ label: string; value?: string | null; detail?: string | null; status?: string | null }>;
  tone?: Tone;
  columns?: 1 | 2 | 3;
}) {
  const usable = rows.filter((row) => row.value || row.detail);
  if (!usable.length) return null;
  const cols = columns === 1 ? 'grid-cols-1' : 'xl:grid-cols-2';
  return (
    <SurfaceCard title={title} tone={tone}>
      <div className={`grid gap-4 ${cols}`}>
        {usable.map((row) => {
          const value = asText(row.value, '');
          const detail = asText(row.detail, '');
          const sameText = value && detail && value.trim().toLowerCase() === detail.trim().toLowerCase();
          return (
          <div key={`${title}-${row.label}`} className="min-w-0 rounded-2xl border border-border/15 bg-card/55 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">{row.label}</p>
              {row.status ? <StatusPill value={row.status} /> : null}
            </div>
            {value ? <p className="mt-2 break-words text-base font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{value}</p> : null}
            {detail && !sameText ? <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{detail}</p> : null}
          </div>
        )})}
      </div>
    </SurfaceCard>
  );
}

function EditorialSignalRail({
  title,
  rows,
  tone = 'default',
  description,
  embedded = false,
}: {
  title: string;
  rows: Array<{ label: string; value?: string | null; detail?: string | null; status?: string | null; displayValue?: string | null }>;
  tone?: Tone;
  description?: string;
  embedded?: boolean;
}) {
  const usable = rows.filter((row) => row.value || row.detail);
  if (!usable.length) return null;
  const content = (
    <>
      {embedded ? (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">{title}</p>
          {description ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
      ) : description ? <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="divide-y divide-border/12">
        {usable.map((row) => (
          <div key={`${title}-${row.label}`} className="py-4 first:pt-0 last:pb-0">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto] md:items-start">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">{row.label}</p>
                {row.detail ? <p className="mt-2 max-w-xl break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{row.detail}</p> : null}
              </div>
              <div className="min-w-0 md:justify-self-end md:text-right">
                {row.status ? <div className="mb-2 flex md:justify-end"><StatusPill value={row.status} /></div> : null}
                {(row.displayValue || row.value) ? (
                  <p className={metricValueClass(row.displayValue || formatReadableMetric(row.value, 'rail'), 'rail')}>
                    {row.displayValue || formatReadableMetric(row.value, 'rail')}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  return embedded ? content : <SurfaceCard title={title} tone={tone}>{content}</SurfaceCard>;
}

function NarrativeReadPanel({
  title,
  items,
  description,
  lead,
  aside,
}: {
  title: string;
  items: string[];
  description?: string;
  lead?: string;
  aside?: ReactNode;
}) {
  if (!items.length && !lead) return null;
  return (
    <SurfaceCard title={title} tone="gold">
      <div className={`grid gap-8 ${aside ? '2xl:grid-cols-[minmax(0,1.08fr),360px]' : ''}`}>
        <div className="min-w-0">
          {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
          {lead ? <p className={`${description ? 'mt-5' : ''} text-sm md:text-[15px] leading-relaxed text-foreground`}>{lead}</p> : null}
          {items.length ? (
            <div className={`space-y-5 ${lead || description ? 'mt-6' : ''}`}>
              {items.map((item, index) => (
                <div key={`${title}-${index}`} className="grid gap-3 md:grid-cols-[28px,1fr]">
                  <div className="pt-0.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.05] text-[11px] font-semibold text-gold/80">
                      {index + 1}
                    </div>
                  </div>
                  <p className="break-words pt-0.5 text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]">{item}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? (
          <div className="min-w-0 border-t border-border/12 pt-6 2xl:border-l 2xl:border-t-0 2xl:pl-7 2xl:pt-0">
            {aside}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

function WatchChipPanel({
  title,
  items,
  description,
  embedded = false,
}: {
  title: string;
  items: unknown;
  description?: string;
  embedded?: boolean;
}) {
  const normalized = normalizeListItems(items);
  if (!normalized.length) return null;
  const content = (
    <>
      {embedded ? (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">{title}</p>
          {description ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
      ) : description ? <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="flex flex-wrap gap-3">
        {normalized.map((item, index) => (
          <span
            key={`${item.text}-${index}`}
            className="inline-flex items-center rounded-full border border-amber-500/18 bg-amber-500/[0.05] px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-foreground"
          >
            {item.text}
          </span>
        ))}
      </div>
    </>
  );
  return embedded ? content : <SurfaceCard title={title} tone="amber">{content}</SurfaceCard>;
}

function InputFramePanel({
  rows,
}: {
  rows: Array<{ label: string; value?: string | null; detail?: string | null }>;
}) {
  const usable = rows.filter((row) => row.value || row.detail);
  if (!usable.length) return null;
  return (
    <SurfaceCard
      title="Original Input Frame"
      eyebrow="What The Principal Asked The Memo To Settle"
      tone="gold"
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {usable.map((row) => (
          <div key={`input-frame-${row.label}`} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold/70">{row.label}</p>
            {row.value ? <p className="mt-3 break-words text-base md:text-[17px] font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{row.value}</p> : null}
            {row.detail ? <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{row.detail}</p> : null}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function HouseIntakePanel({
  intake,
}: {
  intake: Record<string, any>;
}) {
  const rows = [
    {
      label: 'House Purpose At Intake',
      detail: asArray<string>(intake.house_purpose).join(' • '),
    },
    {
      label: 'Treasury Questions',
      detail: asArray<string>(intake.treasury_questions).join(' • '),
    },
    {
      label: 'Governance Questions',
      detail: asArray<string>(intake.governance_questions).join(' • '),
    },
    {
      label: 'Continuity Questions',
      detail: asArray<string>(intake.continuity_questions).join(' • '),
    },
  ].filter((row) => row.detail);

  if (!rows.length) return null;
  return (
    <SurfaceCard
      title="What The House Needed The Memo To Protect"
      eyebrow="House Standard Intake"
      tone="gold"
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((row) => (
          <div key={`house-intake-${row.label}`} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold/70">{row.label}</p>
            <p className="mt-3 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{row.detail}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function MandateBriefPanel({
  liveMove,
  substituteStory,
  mandateHeadline,
  mandateItems,
  burdenItems,
  reliefItems,
  cannotFailItems,
  trustGapItems,
}: {
  liveMove?: string;
  substituteStory?: string;
  mandateHeadline?: string;
  mandateItems: NormalizedItem[];
  burdenItems: NormalizedItem[];
  reliefItems: NormalizedItem[];
  cannotFailItems: NormalizedItem[];
  trustGapItems: NormalizedItem[];
}) {
  const hasNarrative = Boolean(liveMove || substituteStory || burdenItems.length);
  const hasMandateSide = Boolean(mandateHeadline || mandateItems.length || reliefItems.length);
  const hasBottomRail = Boolean(cannotFailItems.length || trustGapItems.length);

  if (!hasNarrative && !hasMandateSide && !hasBottomRail) return null;

  return (
    <SurfaceCard
      title="Why The House Commissioned This Memo"
      eyebrow="Six-Book Opening"
      tone="gold"
    >
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        This opening keeps the memo tied to the live decision burden in the room: what the house does not yet trust,
        what story is substituting for proof, what mandate is actually at risk, and what relief has to be earned
        before approval.
      </p>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.08fr),minmax(340px,0.92fr)]">
        <div className="min-w-0 rounded-[26px] border border-border/15 bg-card/45 p-6">
          <div className="space-y-6 divide-y divide-border/12">
            {liveMove ? (
              <div className="min-w-0 pb-6 first:pt-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">The Exposed Live Decision</p>
                <p className="mt-3 max-w-3xl break-words text-base md:text-[18px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
                  {liveMove}
                </p>
              </div>
            ) : null}

            {substituteStory ? (
              <div className="min-w-0 pt-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">The Substitute Story Carrying The Room</p>
                <p className="mt-3 max-w-3xl break-words text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
                  {substituteStory}
                </p>
              </div>
            ) : null}

            {burdenItems.length ? (
              <div className="min-w-0 pt-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">The Present Room Burden</p>
                <div className="mt-3 space-y-3">
                  {burdenItems.slice(0, 4).map((item, index) => (
                    <div key={`burden-brief-${index}`} className="flex gap-3">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" />
                      <p className="min-w-0 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 rounded-[26px] border border-gold/18 bg-gold/[0.05] p-6">
          {(mandateHeadline || mandateItems.length) ? (
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">The House Mandate At Risk</p>
              {mandateHeadline ? (
                <p className="mt-3 break-words text-lg font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">
                  {mandateHeadline}
                </p>
              ) : null}
              {mandateItems.length ? (
                <div className="mt-4 space-y-3">
                  {mandateItems.slice(0, 3).map((item, index) => (
                    <div key={`mandate-brief-${index}`} className="flex gap-3">
                      <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/75" />
                      <p className="min-w-0 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {reliefItems.length ? (
            <div className={`${mandateHeadline || mandateItems.length ? 'mt-6 border-t border-border/12 pt-6' : ''} min-w-0`}>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">The Relief This Memo Must Earn</p>
              <div className="mt-4 space-y-3">
                {reliefItems.slice(0, 4).map((item, index) => (
                  <div key={`relief-brief-${index}`} className="flex gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/70" />
                    <p className="min-w-0 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {hasBottomRail ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {cannotFailItems.length ? (
            <div className="min-w-0 rounded-[24px] border border-red-500/15 bg-red-500/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-red-500/70">What Cannot Fail</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {cannotFailItems.slice(0, 6).map((item, index) => (
                  <span
                    key={`cannot-fail-${index}`}
                    className="inline-flex min-w-0 max-w-full items-center rounded-full border border-red-500/15 bg-card/80 px-3.5 py-2 text-[12px] leading-relaxed text-foreground"
                  >
                    <span className="truncate [overflow-wrap:anywhere]">{item.text}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {trustGapItems.length ? (
            <div className="min-w-0 rounded-[24px] border border-amber-500/15 bg-amber-500/[0.04] p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-600/80">Trust Gaps Visible At Intake</p>
              <div className="mt-4 space-y-3">
                {trustGapItems.slice(0, 4).map((item, index) => (
                  <div key={`trust-gap-${index}`} className="flex gap-3">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/80" />
                    <p className="min-w-0 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </SurfaceCard>
  );
}

function ApprovalMatrixPanel({
  title,
  rows,
  tone = 'gold',
}: {
  title: string;
  rows: Array<Record<string, any>>;
  tone?: Tone;
}) {
  if (!rows.length) return null;
  return (
    <SurfaceCard title={title} tone={tone}>
      <div className="space-y-4">
        {rows.map((row, index) => {
          const primary = asText(row.gate || row.trigger || row.condition, '');
          if (!primary) return null;
          return (
            <div key={`${title}-${index}`} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {row.status ? <StatusPill value={asText(row.status, '')} /> : null}
                {row.deadline ? <span className="text-[11px] uppercase tracking-[0.18em] text-gold/75">{asText(row.deadline, '')}</span> : null}
              </div>
              <p className="mt-3 break-words text-base md:text-[17px] font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{primary}</p>
              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                {row.owner ? (
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Owner</p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(row.owner, '')}</p>
                  </div>
                ) : null}
                {row.proof_artifact ? (
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Required Proof</p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(row.proof_artifact, '')}</p>
                  </div>
                ) : null}
                {row.house_consequence ? (
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">If Not Cleared</p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(row.house_consequence, '')}</p>
                  </div>
                ) : null}
              </div>
              {row.decision_standard ? (
                <div className="mt-4 rounded-2xl border border-amber-500/18 bg-amber-500/[0.05] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-600/80">Decision Standard</p>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(row.decision_standard, '')}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

function HeirCardsPanel({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, any>>;
}) {
  if (!rows.length) return null;
  return (
    <SurfaceCard title={title} tone="gold">
      <div className="grid gap-5 2xl:grid-cols-2">
        {rows.map((row, index) => (
          <div key={`${row.name || 'heir'}-${index}`} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-lg font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{asText(row.name, 'Heir')}</p>
              {row.relationship ? <StatusPill value={asText(row.relationship, '')} /> : null}
            </div>
            <div className="mt-5 space-y-4">
              {[
                ['Legal Position', row.legal_position],
                ['Tax Position', row.tax_position],
                ['Governance Position', row.governance_position],
                ['Education Requirement', row.education_requirement],
                ['Before Close', row.before_close],
              ].map(([label, value]) =>
                value ? (
                  <div key={`${row.name}-${label}`} className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">{label}</p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(value, '')}</p>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function ComparePanel({
  title,
  leftLabel,
  leftText,
  rightLabel,
  rightText,
  footer,
}: {
  title: string;
  leftLabel: string;
  leftText: string;
  rightLabel: string;
  rightText: string;
  footer?: string;
}) {
  return (
    <SurfaceCard title={title} tone="gold">
      <div className="grid gap-4 2xl:grid-cols-[0.95fr,1.05fr]">
        <div className="min-w-0 rounded-[24px] border border-red-500/15 bg-red-500/[0.03] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-red-500/75">{leftLabel}</p>
          <p className="mt-3 break-words text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]">{leftText}</p>
        </div>
        <div className="min-w-0 rounded-[24px] border border-emerald-500/15 bg-emerald-500/[0.03] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500/75">{rightLabel}</p>
          <p className="mt-3 break-words text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]">{rightText}</p>
        </div>
      </div>
      {footer ? (
        <div className="mt-4 rounded-2xl border border-gold/15 bg-gold/[0.05] px-4 py-3">
          <p className="break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{footer}</p>
        </div>
      ) : null}
    </SurfaceCard>
  );
}

function SequencePanel({ steps }: { steps: Array<Record<string, any>> }) {
  const normalized = steps.filter((step) => step && (step.title || step.detail));
  if (!normalized.length) return null;
  return (
    <SurfaceCard title="Execution Sequence" tone="gold">
      <div className="space-y-5">
        {normalized.map((step, index) => (
          <div key={`${step.title || 'step'}-${index}`} className="grid gap-4 xl:grid-cols-[84px,1fr]">
            <div className="flex items-start gap-3 xl:block">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08] text-sm font-semibold text-gold/80">
                {step.order || index + 1}
              </div>
            </div>
            <div className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
              <p className="break-words text-base md:text-lg font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{asText(step.title, `Step ${index + 1}`)}</p>
              {step.detail ? <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{asText(step.detail, '')}</p> : null}
              {step.wrong_order_cost ? (
                <div className="mt-4 rounded-2xl border border-amber-500/18 bg-amber-500/[0.05] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-600/80">Wrong Order Cost</p>
                  <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(step.wrong_order_cost, '')}</p>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function FailurePanel({ items }: { items: Array<Record<string, any>> }) {
  if (!items.length) return null;
  return (
    <SurfaceCard title="Exactly How The Route Breaks" tone="amber">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.category || 'failure'}-${index}`} className="grid gap-4 rounded-[24px] border border-border/15 bg-card/55 p-5 xl:grid-cols-[220px,1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600/80">{asText(item.category, `Failure ${index + 1}`)}</p>
            </div>
            <div className="min-w-0">
              <p className="break-words text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(item.failure, '')}</p>
              {item.consequence ? <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{asText(item.consequence, '')}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function ScenarioBoard({ branches }: { branches: Array<Record<string, any>> }) {
  if (!branches.length) return null;
  return (
    <SurfaceCard title="Decision Paths" tone="gold">
      <div className="grid gap-4 2xl:grid-cols-2">
        {branches.map((branch, index) => {
          const conditions = normalizeListItems(branch.conditions).slice(0, 4);
          const label = asText(branch.label || branch.name, 'Branch');
          const strength = asText(branch.recommendation_strength, '');
          const tone = label.toLowerCase().includes('do not')
            ? 'red'
            : strength.toLowerCase().includes('recommend') || strength.toLowerCase().includes('primary')
              ? 'gold'
              : 'default';
          return (
            <div key={`${label}-${index}`} className={`${index === 0 && branches.length >= 3 ? '2xl:col-span-2' : ''} min-w-0 rounded-[24px] border p-5 sm:p-6 ${toneClasses(tone)}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="break-words text-lg font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{label}</p>
                {strength ? <StatusPill value={strength} /> : null}
              </div>
              {branch.expected_value ? <p className={memoNumberClass('hero', 'default', 'mt-4 break-words [overflow-wrap:anywhere]')}>{formatDisplayMetric(branch.expected_value)}</p> : null}
              {branch.outcome || branch.description ? <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{asText(branch.outcome || branch.description, '')}</p> : null}
              {conditions.length ? (
                <div className="mt-5 space-y-3">
                  {conditions.map((condition, condIndex) => (
                    <div key={`${label}-${condIndex}`} className="min-w-0 rounded-2xl border border-border/15 bg-card/55 p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {condition.status ? <StatusPill value={condition.status} /> : null}
                      </div>
                      <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{condition.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

function CrisisBoard({
  scenarios,
  footer,
}: {
  scenarios: Array<Record<string, any>>;
  footer?: ReactNode;
}) {
  if (!scenarios.length) return null;
  return (
    <SurfaceCard title="Live Crisis Scenarios" tone="amber">
      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div key={`${scenario.title || 'scenario'}-${index}`} className={`${index > 0 ? 'border-t border-border/12 pt-5' : ''}`}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr),190px,minmax(0,1.1fr)]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {scenario.risk_level ? <StatusPill value={asText(scenario.risk_level, '')} /> : null}
                </div>
                <p className="mt-3 break-words text-base md:text-lg font-semibold tracking-tight text-foreground [overflow-wrap:anywhere]">{crisisScenarioTitle(scenario, index)}</p>
              </div>
              <div className="min-w-0 xl:text-right">
                {scenario.impact ? (
                  <p className={metricValueClass(formatReadableMetric(extractLeadingMetricToken(scenario.impact) || scenario.impact, 'proof'), 'proof')}>
                    {formatReadableMetric(extractLeadingMetricToken(scenario.impact) || scenario.impact, 'proof')}
                  </p>
                ) : null}
                {metricNarrativeTail(scenario.impact) ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {metricNarrativeTail(scenario.impact)}
                  </p>
                ) : null}
                {scenario.recovery ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Recovery window: {asText(scenario.recovery, '')}</p> : null}
              </div>
              <div className="min-w-0 xl:border-l xl:border-border/12 xl:pl-5">
                {scenario.subheadline ? <p className="break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{asText(scenario.subheadline, '')}</p> : null}
                {scenario.stress_factor ? <p className={`${scenario.subheadline ? 'mt-3' : ''} break-words text-sm md:text-[15px] leading-relaxed text-foreground [overflow-wrap:anywhere]`}>{asText(scenario.stress_factor, '')}</p> : null}
                {scenario.verdict ? (
                  <div className="mt-4 border-t border-border/12 pt-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75">Route Read</p>
                    <p className="mt-2 break-words text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">{asText(scenario.verdict, '')}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-8 border-t border-border/12 pt-6">{footer}</div> : null}
    </SurfaceCard>
  );
}

function StageColumns({
  title,
  description,
  stages,
}: {
  title?: string;
  description?: string;
  stages: Array<{ label: string; items: unknown }>;
}) {
  const usable = stages.filter((stage) => normalizeListItems(stage.items).length);
  if (!usable.length) return null;
  return (
    <SurfaceCard title={title || 'What The Office Must Carry Next'} tone="gold">
      {description ? <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      <div className="grid gap-4 2xl:grid-cols-2">
        {usable.map((stage) => (
          <div key={stage.label} className="min-w-0 rounded-[24px] border border-border/15 bg-card/55 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">{stage.label}</p>
            <div className="mt-4">
              <ListRows items={stage.items} />
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function ScheduleDivider({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-10 border-t border-border/15 pt-8">
      <div className="max-w-4xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold/70 font-medium">{label}</p>
        <h3 className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function HouseGradeMemoSection({
  data,
  previewData,
  references,
  developmentsCount = 0,
  precedentCount = 0,
  routeEvidenceBasisNote,
  sourceJurisdiction,
  destinationJurisdiction,
  onCitationClick,
  citationMap,
  embedDetailedSchedules = true,
  chapterId,
}: HouseGradeMemoSectionProps) {
  const preview = previewData || {};
  const memo = data || {};

  const decisionSignal = memo.decision_signal || fallbackDecisionSignal(preview, memo);
  const houseMandateAtRisk = memo.house_mandate_at_risk || {};
  const correctedThesis = memo.corrected_thesis || fallbackCorrectedThesis(preview, memo);
  const housePurpose = memo.house_purpose_at_stake || fallbackHousePurpose(preview, sourceJurisdiction, destinationJurisdiction);
  const visibility = memo.visibility_and_confidence_note || {};
  const publicHouseModel = memo.public_house_model || {};
  const currentHouseBurden = memo.current_house_burden || {};
  const authority = memo.authority_and_governance_map || {};
  const fragmentation = memo.fragmentation_map || {};
  const routeArchitecture = memo.route_architecture || fallbackRouteArchitecture(preview);
  const economics = memo.economic_and_capital_proof || fallbackEconomicProof(preview, memo);
  const executionSequence = memo.execution_sequence || fallbackExecutionSequence(preview);
  const failureLogic = memo.failure_logic || fallbackFailureLogic(preview);
  const continuity = memo.continuity_and_g1_g2_g3_consequence || fallbackContinuity(preview);
  const gates = memo.gate_and_abort_structure || preview.scenario_tree_data || {};
  const decisionRequirements = memo.decision_requirements || {};
  const actionPath = memo.family_office_action_path || fallbackActionPath(preview);
  const warRoomWatchlist = memo.war_room_watchlist || {};
  const crownVault = memo.crown_vault_consequence || {};
  const dashboardCarry = memo.home_dashboard_carry_forward || {};
  const houseLearning = memo.house_learning_write_back || {};
  const unknowns = memo.what_this_memo_does_not_yet_know || {};
  const disclosure = memo.next_disclosure_needed_for_deeper_precision || {};
  const evidence = memo.evidence_status || fallbackEvidenceStatus(preview, routeEvidenceBasisNote);

  const scenarioTree = preview.scenario_tree_data || {};
  const crisis = preview.crisis_data || {};
  const normalizedCrisis = normalizeCrisisData(preview.crisis_data, preview.crisis_resilience_stress_test);
  const transparency = preview.transparency_data || {};
  const crossBorderAudit = preview.cross_border_audit_summary || {};
  const inputSnapshot = memo.input_frame || preview.input_snapshot || {};
  const houseStandardIntake = inputSnapshot.house_standard_intake || {};
  const mandate = inputSnapshot.mandate || {};
  const inputConstraints = inputSnapshot.constraints || {};
  const inputRails = inputSnapshot.decision_rails || {};
  const transactionValue =
    crossBorderAudit?.acquisition_audit?.property_value ||
    (() => {
      const targetSize = preview.deal_overview?.target_size;
      if (typeof targetSize !== 'string') return 0;
      const parsed = parseFloat(targetSize.replace(/[^0-9.]/g, ''));
      return Number.isFinite(parsed) ? parsed * 1_000_000 : 0;
    })();

  const corridorLabel = [sourceJurisdiction, destinationJurisdiction].filter(Boolean).join(' → ') || 'the corridor';
  const heirManagement = preview.heir_management_data || {};
  const hasCrossBorderAudit = Boolean(crossBorderAudit?.executive_summary || crossBorderAudit?.acquisition_audit);
  const hasTransparency =
    Boolean(asArray(transparency.reporting_triggers).length || asArray(transparency.compliance_risks).length || asArray(transparency.compliance_calendar).length);
  const hasRealAssetAudit = Boolean(preview.real_asset_audit && Object.keys(preview.real_asset_audit).length);
  const hasMarketIntelligence = Boolean(
    asArray(preview.all_opportunities).length ||
    preview.peer_cohort_stats?.total_peers ||
    preview.capital_flow_data?.movement_velocity_pct
  );
  const hasTrends = Boolean(asArray(preview.hnwi_trends).length);
  const hasCrisis = Boolean(crisis?.scenarios?.length || crisis?.overall_resilience?.score);
  const hasAnnualWealthEngine = Boolean(preview.annual_wealth_engine && Object.keys(preview.annual_wealth_engine).length);
  const hasWealthProjection = Boolean(
    (preview.wealth_projection_data && Object.keys(preview.wealth_projection_data).length) ||
    hasAnnualWealthEngine
  );
  const hasScenarioTree = Boolean(scenarioTree && Object.keys(scenarioTree).length);
  const hasHeirManagement = Boolean(heirManagement && Object.keys(heirManagement).length);
  const dayOneLossLabel = asText(economics.day_one_loss, 'the day-one drag');
  const drawdownFloorLabel = asText(economics.drawdown_floor || crisis.stress_drawdown_floor, 'the modeled stress floor');
  const routeWitnessLabel = precedentCount ? `${precedentCount} direct route witnesses` : 'the witness set';

  const witnessCards = [
    {
      label: 'Decision Window',
      value: gates.decision_window_days ? `${gates.decision_window_days} days` : '—',
      note: `${corridorLabel} has a finite execution window before the route must be re-underwritten.`,
      tone: 'amber' as Tone,
    },
    {
      label: 'Day-One Loss',
      value: asText(economics.day_one_loss, '—'),
      note: `${dayOneLossLabel} is paid before the house has proved the route.`,
      tone: 'red' as Tone,
    },
    {
      label: 'Decision EV',
      value: asText(economics.decision_ev || scenarioTree.decision_ev_label, '—'),
      note: scenarioTree.decision_ev_note || 'Validated route expected value after the gate set clears.',
      tone: 'gold' as Tone,
    },
    {
      label: 'Route Witnesses',
      value: precedentCount ? `${precedentCount}` : asText(preview.peer_cohort_stats?.total_peers, '—'),
      note: routeEvidenceBasisNote || `${routeWitnessLabel} and governing objects inform this read.`,
      tone: 'default' as Tone,
    },
  ];

  const purposeSource = sourceJurisdiction || preview.source_jurisdiction || 'the source jurisdiction';
  const purposeDestination = destinationJurisdiction || preview.destination_jurisdiction || 'the destination jurisdiction';
  const destinationAsset =
    purposeDestination.toLowerCase() === 'uae'
      ? 'Dubai purchase'
      : `${purposeDestination} acquisition`;
  const rawHousePurposeItems = normalizeListItems((houseMandateAtRisk.items && asArray(houseMandateAtRisk.items).length ? houseMandateAtRisk.items : housePurpose.items));
  const genericPurposeCount = rawHousePurposeItems.filter((item) => soundsGenericHeroCopy(item.text)).length;
  const housePurposeItems =
    !rawHousePurposeItems.length || genericPurposeCount >= 2
      ? principalPurposeItems(purposeSource, purposeDestination, destinationAsset)
      : rawHousePurposeItems;
  const liveDecisionHeadline = asText(
    memo.live_decision_the_room_does_not_fully_trust_yet?.headline || houseStandardIntake.live_move_the_room_does_not_fully_trust_yet,
    `Whether the house can execute ${corridorLabel} without letting unresolved route mechanics harden into the purchase.`,
  );
  const substituteStoryHeadline = asText(
    memo.current_substitute_story?.headline || houseStandardIntake.current_substitute_story,
    `${destinationAsset} upside and status language are still making the room feel safer than the route actually is.`,
  );
  const houseReliefItems = normalizeListItems(
    (memo.house_relief_to_be_earned?.items && asArray(memo.house_relief_to_be_earned.items).length
      ? memo.house_relief_to_be_earned.items
      : houseStandardIntake.house_relief_to_be_earned) || [],
  );
  const cannotFailItems = normalizeListItems(houseStandardIntake.what_cannot_fail || []);
  const trustGapItems = normalizeListItems(houseStandardIntake.trust_gap_signals || []);
  const routeArchitectureRows = asArray<Record<string, any>>(routeArchitecture.items).map((item, index) => ({
    label: asText(item.label, `Route ${index + 1}`),
    value: asText(item.value, ''),
    detail: asText(item.detail || item.note, ''),
  }));
  const routeLabel =
    asText(routeArchitectureRows.find((row) => row.label.toLowerCase().includes('route'))?.value, '') ||
    'direct individual freehold purchase';

  const burdenRows = asArray<Record<string, any>>(currentHouseBurden.items).map((item, index) => ({
    label: asText(item.label, `Burden ${index + 1}`),
    value: asText(item.value || item.headline, ''),
    detail: asText(item.detail || item.note || item.description, ''),
    status: asText(item.status, '—') === '—' ? undefined : asText(item.status, ''),
  }));
  const burdenBriefItems = burdenRows.length
    ? burdenRows
        .map((row) => ({
          text: row.detail || row.value || row.label,
          status: row.status,
        }))
        .filter((row) => row.text)
    : normalizeListItems(houseStandardIntake.present_room_burden || []);

  const publicModelRows = normalizeListItems(publicHouseModel.items);
  const authorityRows = [
    {
      label: 'Decision Owner',
      value: asText(authority.decision_owner, 'Not yet named'),
      detail: 'The room that must own the move once specialist views diverge.',
    },
    {
      label: 'Approvers',
      value: asArray(authority.approvers).length ? `${asArray(authority.approvers).length}` : '—',
      detail: asArray(authority.approvers).slice(0, 3).map((item) => asText(item, '')).filter(Boolean).join(' • '),
    },
    {
      label: 'Veto Points',
      value: asArray(authority.veto_points).length ? `${asArray(authority.veto_points).length}` : '—',
      detail: asArray(authority.veto_points).slice(0, 3).map((item) => asText(item, '')).filter(Boolean).join(' • '),
      status: asArray(authority.veto_points).length ? 'Active' : undefined,
    },
    {
      label: 'Alignment Points',
      value: asArray(authority.alignment_points).length ? `${asArray(authority.alignment_points).length}` : '—',
      detail: asArray(authority.alignment_points).slice(0, 3).map((item) => asText(item, '')).filter(Boolean).join(' • '),
    },
  ];

  const fragmentationRows = asArray<Record<string, any>>(fragmentation.items).map((item, index) => ({
    label: asText(item.label, `Fragment ${index + 1}`),
    value: asText(item.headline || item.value, ''),
    detail: asText(item.detail || item.note || item.description, ''),
    status: asText(item.status, '—') === '—' ? undefined : asText(item.status, ''),
  }));

  const continuityMetrics = asArray<Record<string, any>>(continuity.items).map((item) => ({
    label: asText(item.label, 'Metric'),
    value: asText(item.value, '—'),
    detail: asText(item.detail, ''),
  }));
  const heirSpecificRead = normalizeListItems(continuity.heir_specific_read || []);
  const heirCards = asArray<Record<string, any>>(continuity.heir_cards || []);

  const trendItems = normalizeListItems(preview.hnwi_trends || []).map((item) => item.text);
  const crisisScenarios = normalizedCrisis?.scenarios?.length
    ? normalizedCrisis.scenarios.map((scenario) => ({
        title: scenario.name,
        risk_level: scenario.riskLevel,
        stress_factor: scenario.stressFactor,
        impact: scenario.impact,
        recovery: scenario.recovery,
        verdict: scenario.verdict,
      }))
    : asArray<Record<string, any>>(crisis.scenarios);
  const complianceTriggers = normalizeListItems(transparency.reporting_triggers || []);
  const complianceRisks = normalizeListItems(transparency.compliance_risks || []);
  const complianceCalendar = normalizeListItems(transparency.compliance_calendar || []);
  const branches = asArray<Record<string, any>>(scenarioTree.branches);
  const failureItems = asArray<Record<string, any>>(failureLogic.items);
  const gateItems = normalizeListItems(gates.critical_gates);
  const abortItems = normalizeListItems(gates.abort_triggers);
  const decisionWindowLabel = gates.decision_window_days ? `${gates.decision_window_days} days` : 'the current live window';
  const topGate = gateItems[0]?.text || 'the validated route gates';
  const topContinuityRisk =
    asText(continuity.top_trigger?.trigger, '') ||
    'succession drift after closing';
  const successionLockItems = normalizeListItems(heirManagement.succession_lock_items || []);
  const governanceFramework = heirManagement.governance_framework || {};
  const governanceRows = [
    {
      label: 'Family Council Rhythm',
      value: asText(governanceFramework.family_council_frequency, 'Not yet fixed'),
      detail: 'The family should know when this asset and its route discipline are reviewed.',
    },
    {
      label: 'Decision Threshold',
      value: asText(governanceFramework.decision_threshold, 'Not yet fixed'),
      detail: 'Who is needed when a sale, refinance, or distribution decision is proposed.',
    },
    {
      label: 'Veto Right',
      value: asText(governanceFramework.veto_power, 'Not yet fixed'),
      detail: 'Which seat can stop a move that weakens continuity or tax discipline.',
    },
    {
      label: 'Succession Triggers',
      value: asArray(governanceFramework.succession_triggers).length
        ? `${asArray(governanceFramework.succession_triggers).length}`
        : '—',
      detail: asArray(governanceFramework.succession_triggers)
        .map((item) => asText(item, ''))
        .filter(Boolean)
        .join(' • '),
    },
  ];
  const educationPlan = heirManagement.heir_education_plan || {};
  const educationItems = [
    ...asArray<string>(educationPlan.gen_2_actions).map((item) => ({
      text: item,
      status: 'G2',
    })),
    ...asArray<string>(educationPlan.gen_3_actions).map((item) => ({
      text: item,
      status: 'G3',
    })),
  ];
  const thirdGenerationProblem =
    continuity.third_generation_problem ||
    heirManagement.third_generation_problem ||
    heirManagement.hughes_framework?.third_generation_problem ||
    {};
  const thirdGenerationProblemRows = [
    thirdGenerationProblem.display_loss_arrow
      ? `Loss risk ${thirdGenerationProblem.display_loss_arrow}`
      : '',
    thirdGenerationProblem.display_preservation_arrow
      ? `Retained-value continuity ${thirdGenerationProblem.display_preservation_arrow}`
      : '',
  ].filter(Boolean);
  const humanCapitalProvisionItems = asArray<Record<string, any>>(
    continuity.human_capital_provisions ||
      heirManagement.human_capital_provisions ||
      heirManagement.hughes_framework?.human_capital_provisions,
  ).map((item) => ({
    text: asText(item.name, 'Human capital provision'),
    note: [asText(item.description, ''), asText(item.trigger, '')].filter(Boolean).join(' • '),
  }));
  const governanceInsuranceItems = asArray<Record<string, any>>(
    continuity.governance_insurance ||
      heirManagement.governance_insurance ||
      heirManagement.hughes_framework?.governance_insurance,
  ).map((item) => ({
    text: asText(item.name, 'Governance insurance'),
    note: [asText(item.description, ''), asText(item.rationale, '')].filter(Boolean).join(' • '),
  }));
  const structureSpecificProvisionItems = asArray<Record<string, any>>(
    continuity.structure_specific_provisions || heirManagement.structure_specific_provisions,
  ).map((item) => {
    const humanCapitalNames = asArray<Record<string, any>>(item.human_capital).map((entry) => asText(entry.name, '')).filter(Boolean);
    const governanceNames = asArray<Record<string, any>>(item.governance_insurance).map((entry) => asText(entry.name, '')).filter(Boolean);
    return {
      text: `${asText(item.structure_name, 'Structure provision')} • ${asText(item.jurisdiction, 'Jurisdiction not stated')}`,
      note: [...humanCapitalNames, ...governanceNames].join(' • '),
    };
  });
  const beneficiaryMapNote =
    asText(continuity.beneficiary_map_note, '') !== '—'
      ? asText(continuity.beneficiary_map_note, '')
      : asText(heirManagement.beneficiary_map_note, '');

  const routeStructureLabel = asText(
    preview.structure_optimization?.recommended_structure ||
      asArray<Record<string, any>>(routeArchitecture.items).find((item) => /route|structure/i.test(asText(item.label, '')))?.value,
    'the corrected route',
  );
  const marketCallLabel =
    (destinationJurisdiction || '').toLowerCase() === 'uae'
      ? 'Dubai residential property'
      : destinationJurisdiction
        ? `${destinationJurisdiction} acquisition`
        : 'the destination asset';
  const authoredDecisionRationale =
    `The ${corridorLabel} move only survives if structure, tax, banking, title, and succession are locked in the right order before capital or SPA commitments harden.`;
  const decisionRationaleCandidate = asText(decisionSignal.rationale, '');
  const decisionRationale =
    !decisionRationaleCandidate || soundsGenericHeroCopy(decisionRationaleCandidate)
      ? authoredDecisionRationale
      : decisionRationaleCandidate;
  const authoredRealDecision =
    `This is not a yes-or-no call on ${marketCallLabel} attractiveness. The real decision is whether the house can complete ${routeStructureLabel.toLowerCase()} without letting tax position, banking activation, title diligence, and succession design slip into the closing itself.`;
  const realDecisionCandidate = asText(memo.real_decision?.headline, '');
  const realDecision =
    !realDecisionCandidate || soundsGenericHeroCopy(realDecisionCandidate)
      ? authoredRealDecision
      : realDecisionCandidate;
  const inputMandateRows = [
    {
      label: 'Original Move',
      value: asText(mandate.move_description, 'Not captured'),
      detail: 'What the house originally asked the room to solve.',
    },
    {
      label: 'Expected Outcome',
      value: asText(mandate.expected_outcome, 'Not captured'),
      detail: 'The pre-correction ambition the memo had to test.',
    },
    {
      label: 'Target Footprint',
      value: asArray<string>(mandate.target_locations).length ? asArray<string>(mandate.target_locations).join(' • ') : 'Not captured',
      detail: 'Initial target micro-markets carried into the room.',
    },
  ];

  const constraintItems = buildPublicConstraintItems(
    inputConstraints,
    typeof gates.decision_window_days === 'number' ? gates.decision_window_days : null,
  );
  const approvalMatrixRows = asArray<Record<string, any>>(decisionRequirements.approval_matrix || []);
  const stopMatrixRows = asArray<Record<string, any>>(decisionRequirements.stop_matrix || []);

  const railItems = buildDecisionRailItems(inputRails, routeLabel, destinationAsset);
  const ownershipSeats = buildOwnershipSeats({
    advisors: asArray<Record<string, any>>(inputRails.advisors),
    heirs: asArray<Record<string, any>>(inputRails.heirs),
    decisionOwner: authority.decision_owner,
    routeLabel,
  });

  const marketSignalRows = [
    {
      label: 'Dubai Purchase Witnesses',
      value: precedentCount ? `${precedentCount}` : asText(preview.peer_cohort_stats?.total_peers, '—'),
      displayValue: precedentCount ? `${precedentCount.toLocaleString()}` : asText(preview.peer_cohort_stats?.total_peers, '—'),
      detail: 'Direct route witnesses and corridor-adjacent purchase cases informing the read.',
    },
    {
      label: 'Current Decision Window',
      value: gates.decision_window_days ? `${gates.decision_window_days} days` : '—',
      displayValue: gates.decision_window_days ? `${gates.decision_window_days} days` : '—',
      detail: 'How long the corrected route remains governable before re-underwrite.',
    },
    {
      label: 'Tracked Market File',
      value: developmentsCount ? `${developmentsCount.toLocaleString()}` : '—',
      displayValue: developmentsCount ? `${developmentsCount.toLocaleString()}` : '—',
      detail: 'Tracked market records, developments, and related objects shaping the current Dubai read.',
    },
    {
      label: 'Evidence Basis',
      value: routeEvidenceBasisNote ? 'Locked' : 'Partial',
      displayValue: routeEvidenceBasisNote ? 'Locked' : 'Partial',
      detail: routeEvidenceBasisNote || `${routeWitnessLabel} and governing objects are present, but the authority basis note is not yet fully written through.`,
    },
  ];

  const resilienceRows = [
    {
      label: 'Overall Resilience',
      value: normalizedCrisis?.overall?.score ? `${normalizedCrisis.overall.score}/100` : crisis.overall_resilience?.score ? `${crisis.overall_resilience.score}/100` : '—',
      displayValue: normalizedCrisis?.overall?.score ? `${normalizedCrisis.overall.score}/100` : crisis.overall_resilience?.score ? `${crisis.overall_resilience.score}/100` : '—',
      detail: asText(normalizedCrisis?.overall?.rating || crisis.overall_resilience?.rating, ''),
    },
    {
      label: 'Stress Drawdown Floor',
      value: formatDrawdownFloor(
        normalizedCrisis?.stressDrawdownFloorPct ?? crisis.stress_drawdown_floor ?? economics.drawdown_floor,
      ),
      displayValue: formatDrawdownFloor(
        normalizedCrisis?.stressDrawdownFloorPct ?? crisis.stress_drawdown_floor ?? economics.drawdown_floor,
      ),
      detail: `The repricing regime the house must survive without breaking ${corridorLabel} discipline.`,
      status: 'Live',
    },
    {
      label: 'Worst Case',
      value: asText(
        normalizedCrisis?.overall?.worstCaseLoss ||
          crisis.worst_case ||
          crisisScenarios[0]?.impact,
        '—',
      ),
      displayValue: formatReadableMetric(
        extractLeadingMetricToken(
          asText(
            normalizedCrisis?.overall?.worstCaseLoss ||
              crisis.worst_case ||
              crisisScenarios[0]?.impact,
            '—',
          ),
        ) ||
          asText(
            normalizedCrisis?.overall?.worstCaseLoss ||
              crisis.worst_case ||
              crisisScenarios[0]?.impact,
            '—',
          ),
        'proof',
      ),
      detail: asText(
        normalizedCrisis?.bottomLine?.oneSentence ||
          normalizedCrisis?.crisisVerdict ||
          crisis.bottom_line ||
          crisis.recommendation ||
          crisisScenarios[0]?.verdict,
        '',
      ),
    },
  ];

  const watchlistCandidates =
    normalizedCrisis && (
      normalizedCrisis.priorityEvents.length ||
      normalizedCrisis.routeRisks.length ||
      normalizedCrisis.decisionFlags.length
    )
      ? [
          ...normalizedCrisis.priorityEvents.map((item) => item.label),
          ...normalizedCrisis.routeRisks.map((item) => item.label),
          ...normalizedCrisis.decisionFlags,
        ]
      : asArray<string>(warRoomWatchlist.items);
  const watchlistItems = uniqueTexts(
    watchlistCandidates
      .filter(Boolean)
      .filter((item): item is string => typeof item === 'string'),
  ).slice(0, 5);

  const evidenceGroups = [
    { title: 'Validated Core', items: evidence.validated_core, tone: 'emerald' as Tone },
    { title: 'Modeled Core', items: evidence.modeled_core, tone: 'default' as Tone },
    { title: 'Adjacent Intelligence', items: evidence.adjacent_intelligence, tone: 'gold' as Tone },
    { title: 'Blocked Unknown', items: evidence.blocked_unknown, tone: 'red' as Tone },
  ];

  const showHero = !chapterId || chapterId === 'hero';
  const showGoverningCorrection = !chapterId || chapterId === 'governing-correction';
  const showHouseRead = !chapterId || chapterId === 'house-read';
  const showValidatedRoute = !chapterId || chapterId === 'validated-route';
  const showLiveMarketCrisis = !chapterId || chapterId === 'live-market-crisis';
  const showContinuityOfficeCarry = !chapterId || chapterId === 'continuity-office-carry';
  const showEvidence = !chapterId || chapterId === 'evidence';

  const decisionRequirementColumns = [
    {
      title: 'What Must Be True Before Approval',
      items: decisionRequirements.must_be_true || gateItems.slice(0, 4),
      tone: 'emerald' as Tone,
      description: `These are written conditions precedent the principal should require before approving the ${corridorLabel} route.`,
    },
    {
      title: 'What Stops The Move',
      items: decisionRequirements.stop_conditions || abortItems,
      tone: 'red' as Tone,
      description: 'Any one of these surviving remediation is enough to stop the move. They are route breaks, not monitoring items.',
    },
    {
      title: 'What The Office Carries Next',
      items: decisionRequirements.can_be_carried_next || actionPath.day_30,
      tone: 'default' as Tone,
      description: `These are owned office actions for the next operating window after ${topGate} is evidenced and the route is no longer being debated.`,
    },
  ];
  const treasuryRows = asArray<Record<string, any>>(economics.treasury_and_liquidity_burden?.items).map((item, index) => ({
    label: asText(item.label, `Treasury ${index + 1}`),
    value: asText(item.value, ''),
    detail: asText(item.detail, ''),
    status: asText(item.status, '—') === '—' ? undefined : asText(item.status, ''),
  }));

  return (
    <div className="space-y-14 sm:space-y-20">
      {showHero ? (
      <section className="relative overflow-hidden rounded-[32px] border border-border/20 bg-gradient-to-br from-card via-card to-muted/10 p-6 sm:p-8 lg:p-10 2xl:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_24%)]" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-gold/80">
              <Sparkles className="h-3.5 w-3.5" />
              House-Governed Memo
            </span>
            {sourceJurisdiction && destinationJurisdiction ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-card/60 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {sourceJurisdiction} <ArrowRight className="h-3.5 w-3.5" /> {destinationJurisdiction}
              </span>
            ) : null}
          </div>

          <div className="mt-8 grid gap-8 2xl:grid-cols-12">
            <div className="2xl:col-span-7">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-4">Decision Signal</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-semibold tracking-tight text-foreground">
                {formatDecisionCode(asText(decisionSignal.value || decisionSignal.code, 'Decision Pending'))}
              </h1>
              {decisionRationale ? <p className="mt-5 max-w-4xl text-base md:text-lg leading-relaxed text-muted-foreground">{decisionRationale}</p> : null}
              {realDecision ? (
                <SurfaceCard title="The Real Decision Before Capital Moves" tone="gold" className="mt-6">
                  <p className="text-sm md:text-[15px] leading-relaxed text-foreground">{realDecision}</p>
                </SurfaceCard>
              ) : null}
            </div>

            <div className="2xl:col-span-5">
              <SignalRail title="House Signal Rail" items={witnessCards} tone="gold" />
            </div>
          </div>

        </div>
      </section>
      ) : null}

      {showHero ? (
      <section>
        <MandateBriefPanel
          liveMove={liveDecisionHeadline}
          substituteStory={substituteStoryHeadline}
          mandateHeadline={asText(houseMandateAtRisk.headline || housePurpose.headline, '')}
          mandateItems={housePurposeItems}
          burdenItems={burdenBriefItems}
          reliefItems={houseReliefItems}
          cannotFailItems={cannotFailItems}
          trustGapItems={trustGapItems}
        />
      </section>
      ) : null}

      {showHero ? (
      <section>
        <div className="space-y-4">
          {decisionRequirementColumns.map((column) => (
            <ListPanel
              key={column.title}
              title={column.title}
              items={column.items}
              tone={column.tone}
              description={column.description}
              numbered={column.title === 'What Must Be True Before Approval'}
            />
          ))}
        </div>
        {approvalMatrixRows.length || stopMatrixRows.length ? (
          <div className="mt-5 grid gap-5 2xl:grid-cols-2">
            {approvalMatrixRows.length ? (
              <ApprovalMatrixPanel
                title="Approval Matrix"
                rows={approvalMatrixRows}
                tone="gold"
              />
            ) : null}
            {stopMatrixRows.length ? (
              <ApprovalMatrixPanel
                title="Stop Matrix"
                rows={stopMatrixRows}
                tone="red"
              />
            ) : null}
          </div>
        ) : null}
      </section>
      ) : null}

      {showGoverningCorrection ? (
      <section>
        {sectionHeader(
          'Chapter I',
          'The Governing Correction',
          `This chapter corrects the room's substitute story. ${corridorLabel} is not approved because the destination feels attractive; it is approved only if tax, banking, title, and succession can be carried as one governable route.`,
          <Target className="h-5 w-5" />,
        )}
        <div className="grid gap-5 2xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ComparePanel
            title="Corrected Thesis"
            leftLabel="What The Room Believed"
            leftText={asText(correctedThesis.room_believed, 'The original thesis has not been fully stated.')}
            rightLabel="What Is Actually True"
            rightText={asText(correctedThesis.actual_truth, 'The route needs to be governed before capital moves.')}
            footer={asText(correctedThesis.what_changed, '')}
          />
          </div>
          <div className="xl:col-span-5 space-y-5">
            <KeyValuePanel
              title="Visibility And Confidence"
              rows={[
                {
                  label: 'Visibility Level',
                  value: asText(visibility.level, 'Partial visibility'),
                  detail: asText(visibility.note || visibility.summary, `The house has given enough visibility to govern ${corridorLabel}, but not enough to pretend every downstream fact is closed.`),
                },
                {
                  label: 'Memo Confidence',
                  value: preview.hnwi_trends_confidence ? `${Math.round(preview.hnwi_trends_confidence * 100)}%` : '—',
                  detail: `Confidence is earned from route-core evidence, ${routeWitnessLabel}, and the legal / banking rails under review.`,
                },
              ]}
              tone="default"
            />
          </div>
        </div>
        <div className="mt-5">
          <InputFramePanel rows={inputMandateRows} />
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ListPanel
            title="Decision Rails"
            items={railItems}
            tone="default"
            description="These are the human rails already inside the move. Each one needs a defined burden, an approval right, and a proof standard before the route is treated as real."
          />
          <ListPanel
            title="Constraints"
            items={constraintItems}
            tone="amber"
            description="These are the intake conditions and assumptions the memo had to correct before the house could trust the route."
          />
        </div>
      </section>
      ) : null}

      {showHouseRead ? (
      <section>
        {sectionHeader(
          'Chapter II',
          'Authority, Fragmentation, And House Burden',
          `This chapter shows what the house is already carrying before closing: who can approve or stop the move, where the room is fragmenting, and which burden becomes expensive if left vague before ${routeLabel} hardens.`,
          <Landmark className="h-5 w-5" />,
        )}
        <div className="grid gap-5 2xl:grid-cols-2">
          <div>
            <ListPanel
              title="What Can Be Seen Before Deeper Access"
              items={publicModelRows}
              description={`What can already be inferred on ${corridorLabel} before the house opens the full operating file.`}
            />
          </div>
          <div>
            <KeyValuePanel title="Authority, Approvers, And Veto Rights" rows={authorityRows} columns={1} />
          </div>
        </div>

        <div className="mt-5">
          <KeyValuePanel
            title="Fragmentation Map"
            rows={fragmentationRows}
            tone="amber"
            columns={2}
          />
        </div>

        {ownershipSeats.length ? (
          <div className="mt-5">
            <OwnershipMapPanel
              title="Named Roles, Approval Rights, And Execution Owners"
              seats={ownershipSeats}
              description="The move should not proceed on assumed coverage. Each seat needs one named owner, one approval right, one burden, and one failure condition the house understands before capital is committed."
            />
          </div>
        ) : null}

        <div className="mt-5">
          <KeyValuePanel
            title="What The House Is Already Paying For"
            rows={burdenRows}
            tone="amber"
            columns={2}
          />
        </div>
      </section>
      ) : null}

      {showValidatedRoute ? (
      <section>
        {sectionHeader(
          'Chapter III',
          'Route Approval, Treasury, And Failure Logic',
          `This chapter answers the decision the principal actually has to make: whether ${corridorLabel} is real enough to approve, what treasury burden is being accepted, what must happen in order, and exactly how the route still breaks if discipline loosens.`,
          <Waypoints className="h-5 w-5" />,
        )}
        <CapitalExposurePanel
          corridorLabel={corridorLabel}
          transactionValue={asText(economics.transaction_value, '—')}
          capitalDeployed={asText(economics.capital_deployed, '—')}
          dayOneLoss={asText(economics.day_one_loss, '—')}
          decisionEv={asText(economics.decision_ev || scenarioTree.decision_ev_label, '—')}
          decisionEvNote={scenarioTree.decision_ev_note || 'Validated route expected value after the gate set clears.'}
          grossYield={asText(economics.gross_yield, '—')}
          netYield={asText(economics.net_yield, '—')}
          appreciationBasis={asText(economics.appreciation_basis, '—')}
          drawdownFloor={drawdownFloorLabel}
        />
        {treasuryRows.length ? (
          <div className="mt-5">
            <KeyValuePanel
              title="Treasury And Liquidity Burden Still Carried By The House"
              rows={treasuryRows}
              tone="amber"
              columns={2}
            />
          </div>
        ) : null}

        <div className="mt-5">
          <KeyValuePanel title="Route Architecture" rows={routeArchitectureRows} tone="gold" columns={1} />
        </div>

        <div className="mt-5">
          <SequencePanel steps={asArray<Record<string, any>>(executionSequence.steps)} />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div>
            <ListPanel title="Critical Gates" items={gateItems} tone="emerald" numbered />
          </div>
          <div>
            <ListPanel title="Abort Triggers" items={abortItems} tone="red" />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {complianceTriggers.length ? <ListPanel title="Triggered Reporting Rails" items={complianceTriggers} /> : null}
          {complianceRisks.length ? <ListPanel title="Compliance Risks That Still Break The Route" items={complianceRisks} tone="amber" /> : null}
          {complianceCalendar.length ? <ListPanel title="What Must Still Be Filed, Cleared, Or Timed" items={complianceCalendar} /> : null}
        </div>

        <div className="mt-5">
          <FailurePanel items={failureItems} />
        </div>

        {embedDetailedSchedules && (hasCrossBorderAudit || hasTransparency || hasRealAssetAudit) ? (
          <>
            <ScheduleDivider
              label="Working Papers"
              title="Route, Tax, Title, And Compliance Working Papers"
              description={`These working papers exist to clear approval, not to decorate the memo. They carry the detailed tax, reporting, title, and acquisition mechanics the principal, office, and counsel need before ${routeLabel} is approved.`}
            />
            <div className="mt-6 space-y-8">
              {hasCrossBorderAudit ? (
                <CrossBorderTaxAudit
                  audit={crossBorderAudit}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                />
              ) : null}
              {hasTransparency ? (
                <TransparencyRegimeSection
                  transparencyData={preview.transparency_data}
                  content={preview.transparency_regime_impact}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                />
              ) : null}
              {hasRealAssetAudit ? (
                <RealAssetAuditSection
                  data={preview.real_asset_audit}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                  transactionValue={transactionValue}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </section>
      ) : null}

      {showLiveMarketCrisis ? (
      <section>
        {sectionHeader(
          'Chapter IV',
          'Live Market And Crisis Read',
          `This chapter shows what the market changes and what it does not. Witness strength, corridor pattern intelligence, and live Gulf stress are read together so the house does not mistake market heat for route permission or crisis color for abstraction.`,
          <Eye className="h-5 w-5" />,
        )}
        <NarrativeReadPanel
          title="What The Market Read Actually Changes"
          lead={crossBorderAudit.executive_summary ? asText(crossBorderAudit.executive_summary, '') : undefined}
          items={trendItems}
          description="The market read matters only where it sharpens entry discipline, timing, and underwriting. It does not by itself grant route permission."
          aside={
            <div className="space-y-7">
              <EditorialSignalRail
                title="Market Witness Read"
                rows={marketSignalRows}
                tone="gold"
                embedded
                description="This is the witness base behind the current Dubai read: route precedents, timing window, market file depth, and evidence lock."
              />
              <EditorialSignalRail
                title="Resilience Read"
                rows={resilienceRows}
                tone="default"
                embedded
                description="This is the practical resilience read for the move: how fragile the route is, what drawdown it must survive, and where live stress is most punitive."
              />
            </div>
          }
        />

        <div className="mt-6">
          <CrisisBoard
            scenarios={crisisScenarios.slice(0, 3)}
            footer={
              <WatchChipPanel
                title="What The War Room Watches Daily"
                items={watchlistItems}
                embedded
                description="These are the live pressures that can tighten or break the route before the house is fully through closing."
              />
            }
          />
        </div>

        {embedDetailedSchedules && (hasMarketIntelligence || hasTrends || hasCrisis) ? (
          <>
            <ScheduleDivider
              label="Working Papers"
              title="Market, Trend, And Crisis Working Papers"
              description={`These working papers hold the witness set, corridor pattern read, and live crisis pressure behind this chapter. They are here so the principal can move from the live read into the proof base without changing documents.`}
            />
            <div className="mt-6 space-y-8">
              {hasMarketIntelligence ? (
                <Page3PeerIntelligence
                  opportunities={preview.all_opportunities || []}
                  peerCount={preview.peer_cohort_stats?.total_peers || 0}
                  onCitationClick={onCitationClick || (() => {})}
                  citationMap={citationMap || new Map<string, number>()}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                  sourceCountry={preview.source_country}
                  destinationCountry={preview.destination_country}
                  sourceCity={preview.source_city}
                  destinationCity={preview.destination_city}
                  peerCohortStats={preview.peer_cohort_stats}
                  capitalFlowData={preview.capital_flow_data}
                  sections={['peer', 'corridor', 'geographic']}
                  hideSectionTitle
                  renderMode="screen"
                  isRelocating={preview.peer_cohort_stats?.is_relocating ?? preview.is_relocating ?? false}
                />
              ) : null}
              {hasTrends ? (
                <HNWITrendsSection
                  trends={preview.hnwi_trends}
                  confidence={preview.hnwi_trends_confidence}
                  dataQuality={preview.hnwi_trends_data_quality}
                  citations={preview.hnwi_trends_citations}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                  sourceCountry={preview.source_country}
                  destinationCountry={preview.destination_country}
                />
              ) : null}
              {hasCrisis ? (
                <CrisisResilienceSection
                  crisisData={preview.crisis_data}
                  content={preview.crisis_resilience_stress_test}
                  sourceJurisdiction={sourceJurisdiction}
                  destinationJurisdiction={destinationJurisdiction}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </section>
      ) : null}

      {showContinuityOfficeCarry ? (
      <section>
        {sectionHeader(
          'Chapter V',
          'Continuity, Succession, And Office Carry',
          `A serious memo does not stop at recommendation. It shows what ${routeLabel} means if the principal dies or loses capacity, what the heirs actually inherit, and what the office must carry in the next ${decisionWindowLabel} so ${topContinuityRisk} never becomes permanent house friction.`,
          <GitBranch className="h-5 w-5" />,
        )}

        <div className="mt-5 grid gap-5 2xl:grid-cols-12">
          <div className="xl:col-span-7">
            <KeyValuePanel
              title="What The Asset Does Across G1 / G2 / G3"
              rows={continuityMetrics}
              tone="default"
              columns={2}
            />
          </div>
          <div className="xl:col-span-5">
            <SurfaceCard title="Top Succession Trigger" tone="amber">
              {continuity.top_trigger?.trigger ? (
                <>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600/80" />
                    <StatusPill value={asText(continuity.top_trigger.timeline, 'Before Close')} />
                  </div>
                  <p className="mt-4 text-sm md:text-[15px] leading-relaxed text-foreground">{asText(continuity.top_trigger.trigger, '')}</p>
                  {continuity.top_trigger.at_risk ? <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">{asText(continuity.top_trigger.at_risk, '')}</p> : null}
                  {continuity.top_trigger.mitigation ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{asText(continuity.top_trigger.mitigation, '')}</p> : null}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">No top succession trigger has been loaded yet.</p>
              )}
            </SurfaceCard>
          </div>
        </div>

        {heirCards.length ? (
          <div className="mt-5">
            <HeirCardsPanel
              title="Heir-By-Heir Legal, Tax, Governance, And Education Read"
              rows={heirCards}
            />
          </div>
        ) : heirSpecificRead.length ? (
          <div className="mt-5">
            <ListPanel
              title="Heir-Specific Legal, Tax, And Education Read"
              items={heirSpecificRead}
              tone="gold"
              description="This is the family-facing consequence map: what each named heir actually inherits into, what legal and tax drag sits in front of them, and what the house should teach before expectations harden."
            />
          </div>
        ) : null}

        {(thirdGenerationProblemRows.length || beneficiaryMapNote) ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {thirdGenerationProblemRows.length ? (
              <SurfaceCard title="Third Generation Problem" tone="amber">
                {asText(thirdGenerationProblem.headline, '') ? (
                  <p className="text-sm md:text-[15px] leading-relaxed text-foreground">
                    {asText(thirdGenerationProblem.headline, '')}
                  </p>
                ) : null}
                <div className={asText(thirdGenerationProblem.headline, '') ? 'mt-4' : ''}>
                  <ListRows items={thirdGenerationProblemRows} />
                </div>
              </SurfaceCard>
            ) : null}
            {beneficiaryMapNote ? (
              <SurfaceCard title="Beneficiary Map Status" tone="gold">
                <p className="text-sm md:text-[15px] leading-relaxed text-foreground">{beneficiaryMapNote}</p>
              </SurfaceCard>
            ) : null}
          </div>
        ) : null}

        {(humanCapitalProvisionItems.length || governanceInsuranceItems.length) ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {humanCapitalProvisionItems.length ? (
              <ListPanel
                title="What The House Must Teach Before Expectation Hardens"
                items={humanCapitalProvisionItems}
                tone="gold"
                description="These are the stewardship disciplines the house should install so the next generation inherits understanding, not just exposure."
              />
            ) : null}
            {governanceInsuranceItems.length ? (
              <ListPanel
                title="What Must Be Structurally Protected"
                items={governanceInsuranceItems}
                tone="amber"
                description="These are the structural protections that stop continuity from weakening once the asset exists."
              />
            ) : null}
          </div>
        ) : null}

        {structureSpecificProvisionItems.length ? (
          <div className="mt-5">
            <ListPanel
              title="Structure-Specific Continuity Provisions"
              items={structureSpecificProvisionItems}
              tone="default"
              description="These provisions only matter if the route is locked before close and carried as a governed structure rather than a post-close cleanup exercise."
            />
          </div>
        ) : null}

        <div className="mt-5">
          <StageColumns
            title="What The Office Must Carry In 7 / 30 / 90 Days"
            description="This is the post-decision operating path. It turns the memo from insight into house carriage, with dated actions instead of founder-memory reliance."
            stages={[
              { label: 'Day 7', items: actionPath.day_7 },
              { label: 'Day 30', items: actionPath.day_30 },
              { label: 'Day 90', items: actionPath.day_90 },
            ]}
          />
        </div>

        <div className="mt-5 grid gap-5 2xl:grid-cols-2">
          {successionLockItems.length ? (
            <div>
              <ListPanel
                title="Succession Locks Before Capital Moves"
                items={successionLockItems}
                tone="emerald"
                description="These are not post-close cleanup items. If they remain loose, the heirs inherit avoidable tax drag and governance confusion."
              />
            </div>
          ) : null}
          {governanceRows.some((row) => row.value !== 'Not yet fixed' && row.value !== '—') ? (
            <div>
              <KeyValuePanel
                title="Family Governance Discipline"
                rows={governanceRows}
                tone="gold"
                columns={1}
              />
            </div>
          ) : null}
          {educationItems.length ? (
            <div className={successionLockItems.length ? '2xl:col-span-2' : ''}>
              <ListPanel
                title="Heir Education And Readiness"
                items={educationItems}
                description="This is what the house should teach before economic expectations harden into assumed rights."
              />
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5 2xl:grid-cols-2">
          <ListPanel title="Crown Vault Consequence" items={crownVault.items} tone="gold" />
          <ListPanel title="Home Dashboard Carry-Forward" items={dashboardCarry.items} />
          <div className="2xl:col-span-2">
            <ListPanel title="House Learning Write-Back" items={houseLearning.items} tone="emerald" />
          </div>
        </div>

        {embedDetailedSchedules && (hasWealthProjection || hasScenarioTree || hasHeirManagement) ? (
          <>
            <ScheduleDivider
              label="Working Papers"
              title="Decision Carry, Wealth, And Continuity Working Papers"
              description="These working papers show what the decision does after the memo is read and after capital is committed. They stay in the same flow so the principal can move from continuity judgment into the actual proof surfaces without changing documents."
            />
            <div className="mt-6 space-y-8">
              {hasWealthProjection ? (
                <WealthProjectionSection
                  data={preview.wealth_projection_data || {}}
                  rawAnalysis={preview.wealth_projection_analysis}
                  annualWealthEngine={preview.annual_wealth_engine}
                  generationalMemory={preview.heir_management_data || preview.generational_view}
                  structures={preview.structure_optimization?.structures_analyzed || []}
                  structureProjections={preview.structure_projections || {}}
                  optimalStructureName={preview.structure_optimization?.optimal_structure?.name}
                />
              ) : null}
              {hasScenarioTree ? (
                <div className="print-scenario-tree">
                  <ScenarioTreeSection
                    data={preview.scenario_tree_data || {}}
                    rawAnalysis={preview.scenario_tree_analysis}
                  />
                </div>
              ) : null}
              {hasHeirManagement ? (
                <HeirManagementSection
                  data={preview.heir_management_data || {}}
                  rawAnalysis={preview.heir_management_analysis}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </section>
      ) : null}

      {showEvidence ? (
      <section>
        {sectionHeader(
          'Appendix',
          'Evidence, Unknowns, And House Memory',
          `The memo closes by making evidence quality explicit, naming what is still unknown, and showing which authority rails were strong enough to govern ${corridorLabel} now versus what still needs house disclosure or outside confirmation.`,
          <ShieldCheck className="h-5 w-5" />,
        )}
        <div className="grid gap-5 2xl:grid-cols-12">
          <div className="xl:col-span-4 space-y-5">
            <ListPanel title="What This Memo Does Not Yet Know" items={unknowns.items} tone="red" />
            <ListPanel title="Next Disclosure Needed For Deeper Precision" items={disclosure.items} />
          </div>
          <div className="xl:col-span-8">
            <SurfaceCard title="Evidence Status" tone="default">
              <div className="grid gap-4 md:grid-cols-2">
                {evidenceGroups.map((group) => (
                  <div key={group.title} className={`rounded-[24px] border p-5 ${toneClasses(group.tone)}`}>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-gold/70">{group.title}</p>
                    <div className="mt-4">
                      <ListRows items={group.items} />
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>

        {references ? (
          <div className="mt-5">
            <SurfaceCard title="Authority Ledger" tone="gold">
              <ReferencesSection
                references={references}
                developmentsCount={developmentsCount}
                precedentCount={precedentCount}
              />
            </SurfaceCard>
          </div>
        ) : null}
      </section>
      ) : null}
    </div>
  );
}
