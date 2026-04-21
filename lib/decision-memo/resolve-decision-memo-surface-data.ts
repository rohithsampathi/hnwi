import { assembleCrossBorderAudit } from '@/lib/decision-memo/assemble-cross-border-audit';
import type { ICArtifact } from '@/lib/decision-memo/pattern-audit-types';
import { transformICArtifactToMemoData } from '@/lib/decision-memo/sfo-to-memo-transformer';
import type { PdfMemoData } from '@/lib/pdf/pdf-types';

type RecordLike = Record<string, any>;

interface ResolveDecisionMemoSurfaceDataInput {
  intakeId: string;
  backendData?: RecordLike | null;
  fullArtifact?: RecordLike | ICArtifact | null;
}

export interface ResolvedDecisionMemoSurfaceData {
  memoData: PdfMemoData;
  backendData: RecordLike;
  fullArtifact: RecordLike | null;
  developmentsCount: number | null;
}

function hasKeys(value: unknown): value is RecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.keys(value as RecordLike).length > 0;
}

function numericOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function normalizeFullArtifact(
  backendData?: RecordLike | null,
  fullArtifact?: RecordLike | ICArtifact | null,
): RecordLike | null {
  return (
    (fullArtifact as RecordLike) ??
    backendData?.full_artifact_v2 ??
    backendData?.full_artifact ??
    backendData?.fullArtifact ??
    null
  );
}

function mergePreviewData(basePreviewData: RecordLike, backendData: RecordLike, fullArtifact: RecordLike | null): RecordLike {
  const previewData = { ...basePreviewData };
  const memoData = backendData.memo_data ?? {};
  const artifact = fullArtifact ?? {};

  previewData.transparency_regime_impact ??=
    memoData.transparency_regime_impact ??
    artifact.transparency_regime_impact ??
    backendData.transparency_regime_impact;
  previewData.transparency_data ??=
    memoData.transparency_data ??
    artifact.transparency_data ??
    backendData.transparency_data;

  previewData.crisis_resilience_stress_test ??=
    memoData.crisis_resilience_stress_test ??
    artifact.crisis_resilience_stress_test ??
    backendData.crisis_resilience_stress_test;
  previewData.crisis_data ??=
    memoData.crisis_data ??
    artifact.crisis_data ??
    backendData.crisis_data;

  previewData.peer_intelligence_analysis ??=
    memoData.peer_intelligence_analysis ??
    backendData.peer_intelligence_analysis;
  previewData.peer_intelligence_data ??=
    memoData.peer_intelligence_data ??
    backendData.peer_intelligence_data;

  previewData.market_dynamics_analysis ??=
    memoData.market_dynamics_analysis ??
    backendData.market_dynamics_analysis;
  previewData.market_dynamics_data ??=
    memoData.market_dynamics_data ??
    backendData.market_dynamics_data;

  previewData.implementation_roadmap_data ??=
    memoData.implementation_roadmap_data ??
    backendData.implementation_roadmap_data;

  previewData.due_diligence_data ??=
    memoData.due_diligence_data ??
    backendData.due_diligence_data;

  previewData.hnwi_trends_analysis ??=
    memoData.hnwi_trends_analysis ??
    backendData.hnwi_trends_analysis;

  previewData.risk_assessment ??=
    backendData.risk_assessment;

  if (Array.isArray(backendData.all_mistakes) && backendData.all_mistakes.length > 0) {
    previewData.all_mistakes = backendData.all_mistakes;
  }

  if (!hasKeys(previewData.heir_management_data)) {
    previewData.heir_management_data =
      memoData.heir_management_data ??
      artifact.heir_management_data ??
      backendData.heir_management_data;
    previewData.heir_management_analysis =
      memoData.heir_management_analysis ??
      artifact.heir_management_analysis ??
      backendData.heir_management_analysis;
  }

  if (!hasKeys(previewData.wealth_projection_data)) {
    previewData.wealth_projection_data =
      memoData.wealth_projection_data ??
      artifact.wealth_projection_data ??
      backendData.wealth_projection_data;
    previewData.wealth_projection_analysis =
      memoData.wealth_projection_analysis ??
      artifact.wealth_projection_analysis ??
      backendData.wealth_projection_analysis;
  }

  if (!hasKeys(previewData.scenario_tree_data)) {
    previewData.scenario_tree_data =
      memoData.scenario_tree_data ??
      artifact.scenario_tree_data ??
      backendData.scenario_tree_data;
    previewData.scenario_tree_analysis =
      memoData.scenario_tree_analysis ??
      artifact.scenario_tree_analysis ??
      backendData.scenario_tree_analysis;
  }

  if (!hasKeys(previewData.destination_drivers) || !Array.isArray(previewData.destination_drivers?.visa_programs)) {
    previewData.destination_drivers =
      memoData.destination_drivers ??
      artifact.destination_drivers ??
      backendData.destination_drivers;
  }

  return previewData;
}

function buildFallbackMemoMetadata(fullArtifact: RecordLike | null): RecordLike {
  const intelligenceSources = fullArtifact?.intelligence_sources ?? fullArtifact?.intelligenceSources ?? {};

  return {
    kgv3_intelligence_used: {
      precedents:
        intelligenceSources.precedents_reviewed ??
        intelligenceSources.developmentsMatched ??
        0,
      failure_modes:
        intelligenceSources.failure_modes ??
        intelligenceSources.failurePatternsMatched ??
        0,
      sequencing_rules:
        intelligenceSources.sequence_corrections ??
        intelligenceSources.sequencingRulesApplied ??
        0,
      jurisdictions: 2,
    },
  };
}

function getCrossBorderAuditSummary(container?: RecordLike | null): RecordLike | null {
  if (!container) {
    return null;
  }

  return (
    container?.preview_data?.wealth_projection_data?.starting_position?.cross_border_audit_summary ??
    container?.wealth_projection_data?.starting_position?.cross_border_audit_summary ??
    container?.starting_position?.cross_border_audit_summary ??
    container?.cross_border_audit_summary ??
    null
  );
}

function mergeCrossBorderAuditSummary(base?: RecordLike | null, override?: RecordLike | null): RecordLike | null {
  if (!base && !override) {
    return null;
  }

  if (!base) {
    return override ? { ...override } : null;
  }

  if (!override) {
    return { ...base };
  }

  return {
    ...base,
    ...override,
    acquisition_audit: {
      ...(base.acquisition_audit ?? {}),
      ...(override.acquisition_audit ?? {}),
    },
  };
}

function normalizeCrossBorderAuditSummary(summary?: RecordLike | null): RecordLike | null {
  if (!summary) {
    return null;
  }

  const acquisitionAudit = summary.acquisition_audit ?? {};
  const totalTaxSavingsPct = numericOrNull(summary.total_tax_savings_pct);
  const derivedAcquisitionReliefPct =
    numericOrNull(summary.fta_acquisition_savings_pct) ??
    numericOrNull(acquisitionAudit.fta_acquisition_savings_pct) ??
    (() => {
      const scheduledRatePct = numericOrNull(acquisitionAudit.absd_schedule_rate_pct);
      const appliedRatePct = numericOrNull(acquisitionAudit.absd_applied_rate_pct);

      if (scheduledRatePct === null || appliedRatePct === null) {
        return null;
      }

      return scheduledRatePct - appliedRatePct;
    })();
  const derivedAcquisitionReliefUsd =
    numericOrNull(summary.fta_acquisition_savings_usd) ??
    numericOrNull(acquisitionAudit.fta_acquisition_savings_usd) ??
    (() => {
      const propertyValue = numericOrNull(acquisitionAudit.property_value);
      if (propertyValue === null || derivedAcquisitionReliefPct === null) {
        return null;
      }

      return (propertyValue * derivedAcquisitionReliefPct) / 100;
    })();
  const ongoingTaxSavingsPct =
    numericOrNull(summary.ongoing_tax_savings_pct) ??
    (derivedAcquisitionReliefPct !== null && totalTaxSavingsPct !== null && derivedAcquisitionReliefPct === totalTaxSavingsPct
      ? 0
      : null);

  return {
    ...summary,
    ongoing_tax_savings_pct: ongoingTaxSavingsPct ?? summary.ongoing_tax_savings_pct,
    fta_acquisition_savings_pct: derivedAcquisitionReliefPct ?? summary.fta_acquisition_savings_pct,
    fta_acquisition_savings_usd: derivedAcquisitionReliefUsd ?? summary.fta_acquisition_savings_usd,
    acquisition_audit: {
      ...acquisitionAudit,
      fta_acquisition_savings_pct:
        derivedAcquisitionReliefPct ?? acquisitionAudit.fta_acquisition_savings_pct,
      fta_acquisition_savings_usd:
        derivedAcquisitionReliefUsd ?? acquisitionAudit.fta_acquisition_savings_usd,
    },
  };
}

function applyCanonicalCrossBorderAuditSummary(
  memoData: PdfMemoData,
  backendData?: RecordLike | null,
  fullArtifact?: RecordLike | null,
) {
  const mergedSummary = normalizeCrossBorderAuditSummary(
    mergeCrossBorderAuditSummary(
      mergeCrossBorderAuditSummary(
        getCrossBorderAuditSummary(backendData),
        getCrossBorderAuditSummary(memoData as RecordLike),
      ),
      getCrossBorderAuditSummary(fullArtifact),
    ),
  );

  if (!mergedSummary) {
    return;
  }

  memoData.preview_data = memoData.preview_data ?? {};
  memoData.preview_data.wealth_projection_data = memoData.preview_data.wealth_projection_data ?? {};
  memoData.preview_data.wealth_projection_data.starting_position =
    memoData.preview_data.wealth_projection_data.starting_position ?? {};
  memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = mergedSummary;
}

export function resolveDecisionMemoSurfaceData({
  intakeId,
  backendData,
  fullArtifact,
}: ResolveDecisionMemoSurfaceDataInput): ResolvedDecisionMemoSurfaceData | null {
  const normalizedBackendData = backendData
    ? ({
        ...backendData,
        preview_data: backendData.preview_data_v2 ?? backendData.preview_data,
        memo_data: backendData.memo_data_v2 ?? backendData.memo_data,
        full_artifact:
          backendData.full_artifact_v2 ??
          backendData.full_artifact ??
          backendData.fullArtifact,
        fullArtifact:
          backendData.full_artifact_v2 ??
          backendData.fullArtifact ??
          backendData.full_artifact,
        risk_assessment:
          backendData.risk_assessment ??
          backendData.preview_data_v2?.risk_assessment ??
          backendData.preview_data?.risk_assessment,
        all_mistakes:
          backendData.all_mistakes ??
          backendData.preview_data_v2?.all_mistakes ??
          backendData.preview_data?.all_mistakes,
        mitigationTimeline:
          backendData.mitigationTimeline ??
          backendData.preview_data_v2?.risk_assessment?.mitigation_timeline ??
          backendData.preview_data?.risk_assessment?.mitigation_timeline,
      } as RecordLike)
    : null;
  const normalizedFullArtifact = normalizeFullArtifact(normalizedBackendData, fullArtifact);

  if (!normalizedBackendData?.preview_data && !normalizedFullArtifact) {
    return null;
  }

  const memoData = normalizedBackendData?.preview_data
    ? ({
        ...normalizedBackendData,
        success: normalizedBackendData.success ?? true,
        intake_id: normalizedBackendData.intake_id ?? intakeId,
        generated_at:
          normalizedBackendData.generated_at ??
          normalizedFullArtifact?.generatedAt ??
          new Date().toISOString(),
        preview_data: mergePreviewData(
          normalizedBackendData.preview_data,
          normalizedBackendData,
          normalizedFullArtifact,
        ),
        memo_data:
          normalizedBackendData.memo_data ??
          buildFallbackMemoMetadata(normalizedFullArtifact),
        full_memo_url: normalizedBackendData.full_memo_url ?? '',
        full_artifact:
          normalizedBackendData.full_artifact ??
          normalizedBackendData.fullArtifact ??
          normalizedFullArtifact ??
          undefined,
      } as PdfMemoData)
    : ({
        ...transformICArtifactToMemoData(normalizedFullArtifact as ICArtifact, intakeId),
        full_artifact: normalizedFullArtifact ?? undefined,
      } as PdfMemoData);

  if (
    memoData.preview_data?.wealth_projection_data?.starting_position &&
    !memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary
  ) {
    const assembledAudit = assembleCrossBorderAudit(
      memoData.preview_data,
      memoData.preview_data.wealth_projection_data.starting_position,
      memoData.preview_data.real_asset_audit,
    );

    if (assembledAudit) {
      memoData.preview_data.wealth_projection_data.starting_position.cross_border_audit_summary = assembledAudit;
    }
  }

  applyCanonicalCrossBorderAuditSummary(
    memoData,
    normalizedBackendData,
    normalizedFullArtifact,
  );

  const developmentsCount =
    numericOrNull(memoData.preview_data?.hnwi_world_count) ??
    numericOrNull(normalizedBackendData?.preview_data?.hnwi_world_count);

  return {
    memoData,
    backendData: {
      ...(normalizedBackendData ?? {}),
      fullArtifact: normalizedFullArtifact ?? undefined,
      full_artifact: normalizedFullArtifact ?? undefined,
      resolvedDevelopmentsCount: developmentsCount ?? undefined,
    },
    fullArtifact: normalizedFullArtifact,
    developmentsCount,
  };
}
