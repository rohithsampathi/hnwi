import type { PdfMemoData } from '@/lib/pdf/pdf-types';

type RecordLike = Record<string, unknown>;

export interface IntelligenceBasisCounts {
  developmentsCount?: number;
  corridorSignalsCount?: number;
  failurePatternsMatched?: number;
  sequencingRulesApplied?: number;
}

interface ResolveIntelligenceBasisCountsInput {
  memoData: PdfMemoData;
  backendData?: RecordLike | null;
  hnwiWorldCount?: number | null;
  fullArtifact?: RecordLike | null;
}

function asRecord(value: unknown): RecordLike | null {
  return typeof value === 'object' && value !== null
    ? (value as RecordLike)
    : null;
}

function numericOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function firstDefinedNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const numeric = numericOrUndefined(value);
    if (numeric !== undefined) {
      return numeric;
    }
  }

  return undefined;
}

export function resolveIntelligenceBasisCounts({
  memoData,
  backendData,
  hnwiWorldCount,
  fullArtifact,
}: ResolveIntelligenceBasisCountsInput): IntelligenceBasisCounts {
  const backendRecord = asRecord(backendData);
  const previewData = asRecord(memoData.preview_data);
  const memoMeta = asRecord(memoData.memo_data);
  const backendPreview = asRecord(backendRecord?.preview_data_v2) ?? asRecord(backendRecord?.preview_data);
  const backendMemo = asRecord(backendRecord?.memo_data_v2) ?? asRecord(backendRecord?.memo_data);
  const resolvedFullArtifact =
    asRecord(fullArtifact) ??
    asRecord(backendRecord?.full_artifact_v2) ??
    asRecord(backendRecord?.fullArtifact) ??
    asRecord(backendRecord?.full_artifact);
  const previewKgv2Pattern = asRecord(previewData?.kgv2_pattern_moat);
  const backendKgv2Pattern = asRecord(backendPreview?.kgv2_pattern_moat);
  const previewPrecedentSummary = asRecord(previewKgv2Pattern?.precedent_summary);
  const backendPrecedentSummary = asRecord(backendKgv2Pattern?.precedent_summary);

  const intelligenceSources =
    asRecord(resolvedFullArtifact?.intelligenceSources) ??
    asRecord(resolvedFullArtifact?.intelligence_sources);

  const memoKg =
    asRecord(memoMeta?.kgv3_intelligence_used) ??
    asRecord(backendMemo?.kgv3_intelligence_used);

  return {
    developmentsCount: firstDefinedNumber(
      hnwiWorldCount,
      backendRecord?.resolvedDevelopmentsCount,
      previewData?.hnwi_world_count,
      backendPreview?.hnwi_world_count,
      previewData?.developments_count,
      backendPreview?.developments_count,
      backendRecord?.hnwiWorldCount,
    ),
    corridorSignalsCount: firstDefinedNumber(
      previewPrecedentSummary?.total_relevant,
      backendPrecedentSummary?.total_relevant,
      intelligenceSources?.direct_route_precedents,
      intelligenceSources?.precedents_reviewed,
      asRecord(previewData?.peer_cohort_stats)?.direct_route_precedent_count,
      asRecord(backendPreview?.peer_cohort_stats)?.direct_route_precedent_count,
      previewData?.precedent_count,
      backendPreview?.precedent_count,
      memoKg?.precedents,
      intelligenceSources?.developmentsMatched,
      backendRecord?.precedentCount,
    ),
    failurePatternsMatched: firstDefinedNumber(
      memoKg?.failure_modes,
      intelligenceSources?.failure_modes,
      intelligenceSources?.failurePatternsMatched,
    ),
    sequencingRulesApplied: firstDefinedNumber(
      memoKg?.sequencing_rules,
      intelligenceSources?.sequence_corrections,
      intelligenceSources?.sequencingRulesApplied,
    ),
  };
}
