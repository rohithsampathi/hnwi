'use client';

import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';

type IntakeRecord = Record<string, unknown>;

interface ZeroTrustMoveIntakeSectionProps {
  data?: IntakeRecord | null;
}

const STATE_STYLES: Record<string, string> = {
  confirmed: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  claimed_unverified: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  assumed: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  missing: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
  contradicted: 'border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-300',
};

function asRecord(value: unknown): IntakeRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as IntakeRecord) : {};
}

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const record = item as IntakeRecord;
        return String(record.label || record.title || record.name || record.evidence || record.domain || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function asRecords(value: unknown): IntakeRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is IntakeRecord => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
    : [];
}

function text(value: unknown, fallback = 'Evidence gated'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function titleize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function evidenceLabel(value: string): string {
  const normalized = value.toLowerCase().replace(/\s+/g, '_');
  const labels: Record<string, string> = {
    confirmed: 'Documented',
    claimed_unverified: 'Adviser Confirmation Required',
    assumed: 'Model Assumption',
    missing: 'Missing Evidence',
    contradicted: 'Contradiction To Clear',
    evidence_gated: 'Evidence Gated',
  };
  return labels[normalized] ?? titleize(normalized);
}

function EvidenceBadge({ state }: { state: unknown }) {
  const normalized = text(state, 'evidence_gated').toLowerCase().replace(/\s+/g, '_');
  const className = STATE_STYLES[normalized] ?? 'border-border bg-muted text-muted-foreground';

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-normal ${className}`}>
      {evidenceLabel(normalized)}
    </span>
  );
}

function AuthorityColumn({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="border border-border bg-background p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="mt-3 space-y-2">
        {(items.length ? items : ['Not yet recorded']).map((item) => (
          <p key={`${label}-${item}`} className="text-sm leading-relaxed text-foreground">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function ZeroTrustMoveIntakeSection({ data }: ZeroTrustMoveIntakeSectionProps) {
  const intake = asRecord(data);
  if (Object.keys(intake).length === 0) return null;

  const evidenceStates = asRecord(intake.evidence_states);
  const recordsFromNative = asRecords(intake.records);
  const records = recordsFromNative.length ? recordsFromNative : asRecords(intake.evidence_records);
  const authority = asRecord(intake.authority);
  const bankingRails = asRecord(intake.banking_rails);
  const adviserInputsFromNative = asRecords(intake.adviser_inputs);
  const adviserInputs = adviserInputsFromNative.length ? adviserInputsFromNative : asRecords(intake.adviser_asks);
  const missing = asList(evidenceStates.missing).length ? asList(evidenceStates.missing) : asList(intake.missing_gates);
  const contradicted = asList(evidenceStates.contradicted).length ? asList(evidenceStates.contradicted) : asList(intake.contradictions);
  const openRecordGates = records
    .filter((record) => {
      const state = text(record.evidence_state || record.state, '').toLowerCase().replace(/\s+/g, '_');
      return ['missing', 'contradicted', 'claimed', 'claimed_unverified', 'assumed'].includes(state);
    })
    .map((record) => text(record.domain || record.record || record.label || record.title || record.detail, ''))
    .filter(Boolean);
  const openGates = [...missing, ...contradicted].length ? [...missing, ...contradicted] : openRecordGates;

  return (
    <section className="border border-border bg-card p-5 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background text-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {text(intake.section_label, 'Release Evidence Pack')}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                {text(intake.release_test, 'Evidence Required Before Release')}
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {text(
              intake.release_boundary,
              'The route should not release until buyer capacity, title, duty treatment, source-of-funds, primary and fallback bank rails, authority, succession/fairness, adviser sign-offs, and decision memory are evidenced.'
            )}
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-md">
          <div className="border border-border bg-background p-4">
            <FileCheck2 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Release Domains</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{records.length} reviewed</p>
          </div>
          <div className="border border-border bg-background p-4">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Open Gates</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{openGates.length} to close</p>
          </div>
          <div className="border border-border bg-background p-4">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Adviser Confirmations</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{adviserInputs.length} desks</p>
          </div>
        </div>
      </div>

      {records.length > 0 ? (
        <div className="mt-8 overflow-hidden border border-border">
          <div className="hidden grid-cols-[1.1fr_1.4fr_1.5fr_1fr] border-b border-border bg-muted/40 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid">
            <span>Record</span>
            <span>Current State</span>
            <span>Release Effect</span>
            <span>Owner</span>
          </div>
          <div className="divide-y divide-border">
            {records.map((record, index) => (
              <div key={`${text(record.domain, 'record')}-${index}`} className="grid gap-4 p-4 lg:grid-cols-[1.1fr_1.4fr_1.5fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:hidden">Record</p>
                  <p className="text-sm font-semibold text-foreground">
                    {text(record.domain || record.record || record.label || record.title || record.detail, `Record ${index + 1}`)}
                  </p>
                  <div className="mt-2">
                    <EvidenceBadge state={record.evidence_state || record.state} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:hidden">Current State</p>
                  <p className="text-sm leading-relaxed text-foreground">{text(record.current_record || record.detail)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:hidden">Release Effect</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{text(record.release_effect)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:hidden">Owner</p>
                  <p className="text-sm font-medium leading-relaxed text-foreground">{text(record.owner)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Banking Rail Proof</h3>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Source Rail</dt>
              <dd className="mt-1 text-foreground">{text(bankingRails.source_bank)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Primary Receiving Rail</dt>
              <dd className="mt-1 text-foreground">{text(bankingRails.primary_receiving_bank)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fallback Rail</dt>
              <dd className="mt-1 text-foreground">{text(bankingRails.fallback_receiving_bank)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Release Condition</dt>
              <dd className="mt-1 text-muted-foreground">{text(bankingRails.release_condition)}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Release Boundary</h3>
          </div>
          <div className="mt-4 space-y-3">
            {(openGates.length ? openGates.slice(0, 5) : ['No open release boundary recorded.']).map((boundary) => (
              <p key={boundary} className="text-sm leading-relaxed text-muted-foreground">
                {boundary}
              </p>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(authority).length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <AuthorityColumn label="Can See" items={asList(authority.see)} />
          <AuthorityColumn label="Can Stop" items={asList(authority.stop)} />
          <AuthorityColumn label="Can Sign" items={asList(authority.sign)} />
          <AuthorityColumn label="Can Move" items={asList(authority.move)} />
          <AuthorityColumn label="Can Retrieve" items={asList(authority.retrieve)} />
          <AuthorityColumn label="Can Explain" items={asList(authority.explain)} />
        </div>
      ) : null}

      {adviserInputs.length > 0 ? (
        <div className="mt-8 border border-border bg-background p-5">
          <h3 className="text-base font-semibold text-foreground">Adviser Input Gates</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {adviserInputs.map((input, index) => (
              <div key={`${text(input.desk || input.label || input.detail || input.owner, 'adviser')}-${index}`} className="border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {text(input.desk || input.label || input.detail || input.owner, `Adviser ${index + 1}`)}
                  </p>
                  <EvidenceBadge state={input.state} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {text(input.required_answer || input.release_effect || input.detail || input.source_ref)}
                </p>
                {input.owner ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Owner: {text(input.owner)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
