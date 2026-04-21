type RecordLike = Record<string, any>;

function numericOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

export interface ResolvedCrossBorderDisplayMetrics {
  displayTaxSavingsPct: number;
  acquisitionReliefPct: number | null;
  acquisitionReliefUsd: number | null;
  dayOneLossPct: number | null;
}

export function resolveCrossBorderDisplayMetrics(
  audit?: RecordLike | null,
): ResolvedCrossBorderDisplayMetrics {
  const acquisitionAudit = audit?.acquisition_audit;
  const totalTaxSavingsPct = numericOrNull(audit?.total_tax_savings_pct) ?? 0;
  const derivedAcquisitionReliefPct =
    numericOrNull(acquisitionAudit?.fta_acquisition_savings_pct) ??
    (() => {
      const scheduledRatePct = numericOrNull(acquisitionAudit?.absd_schedule_rate_pct);
      const appliedRatePct = numericOrNull(acquisitionAudit?.absd_applied_rate_pct);

      if (scheduledRatePct === null || appliedRatePct === null) {
        return null;
      }

      return scheduledRatePct - appliedRatePct;
    })();
  const acquisitionReliefPct =
    numericOrNull(audit?.fta_acquisition_savings_pct) ??
    derivedAcquisitionReliefPct;
  const derivedAcquisitionReliefUsd =
    numericOrNull(acquisitionAudit?.fta_acquisition_savings_usd) ??
    (() => {
      const propertyValue = numericOrNull(acquisitionAudit?.property_value);
      if (propertyValue === null || acquisitionReliefPct === null) {
        return null;
      }

      return (propertyValue * acquisitionReliefPct) / 100;
    })();
  const acquisitionReliefUsd =
    numericOrNull(audit?.fta_acquisition_savings_usd) ??
    derivedAcquisitionReliefUsd;
  const ongoingTaxSavingsPct = numericOrNull(audit?.ongoing_tax_savings_pct);
  const dayOneLossPct = numericOrNull(acquisitionAudit?.day_one_loss_pct);

  const displayTaxSavingsPct =
    ongoingTaxSavingsPct ??
    (acquisitionReliefPct !== null && acquisitionReliefPct === totalTaxSavingsPct
      ? 0
      : totalTaxSavingsPct);

  return {
    displayTaxSavingsPct,
    acquisitionReliefPct,
    acquisitionReliefUsd,
    dayOneLossPct,
  };
}
