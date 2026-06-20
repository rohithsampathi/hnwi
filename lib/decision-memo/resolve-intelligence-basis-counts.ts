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

function countRecords(value: unknown): number | undefined {
  return Array.isArray(value) && value.length > 0 ? value.length : undefined;
}

function countRouteDriverSources(value: unknown): number | undefined {
  const routeIntelligence = asRecord(value);
  const register =
    asRecord(routeIntelligence?.routeDriverRegister) ??
    asRecord(routeIntelligence?.route_driver_register);
  const items = Array.isArray(register?.items) ? register.items : [];
  const count = items.reduce((total, item) => {
    const record = asRecord(item);
    const sources = Array.isArray(record?.sources) ? record.sources : [];
    const sourceIds = Array.isArray(record?.sourceIds) ? record.sourceIds : Array.isArray(record?.source_ids) ? record.source_ids : [];
    return total + Math.max(sources.length, sourceIds.length);
  }, 0);
  return count > 0 ? count : undefined;
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
      countRouteDriverSources(previewData?.route_intelligence_v2),
      countRouteDriverSources(backendPreview?.route_intelligence_v2),
      countRecords(asRecord(previewData?.legal_references)?.pattern_witnesses),
      countRecords(asRecord(backendPreview?.legal_references)?.pattern_witnesses),
      countRecords(asRecord(previewData?.legal_references)?.pattern_evidence_records),
      countRecords(asRecord(backendPreview?.legal_references)?.pattern_evidence_records),
      countRecords(previewData?.pattern_evidence_records),
      countRecords(backendPreview?.pattern_evidence_records),
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
