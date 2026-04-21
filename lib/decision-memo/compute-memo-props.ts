import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { ViaNegativaContext } from './memo-types';
import { resolveCrossBorderDisplayMetrics } from './resolve-cross-border-display-metrics';

/**
 * Computes derived props needed by memo components
 * Extracted from audit page.tsx to avoid duplication in JARVIS interface
 */
export function computeMemoProps(memoData: PdfMemoData) {
  const toNumberOrUndefined = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[$,]/g, '').trim());
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
  };

  const formatUsdCompact = (value: number | undefined): string | undefined => {
    if (value === undefined || !Number.isFinite(value)) {
      return undefined;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `~$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${Math.round(value / 1_000)}K`;
    }
    return `$${Math.round(value).toLocaleString()}`;
  };

  const formatPct = (value: unknown): string | undefined => {
    const numeric = toNumberOrUndefined(value);
    if (numeric === undefined) {
      return undefined;
    }
    return `${numeric.toFixed(2)}%`;
  };

  const buildAnnualReturnHeadlineMetric = (
    transactionValue: number | undefined,
    netYieldPct: number | undefined,
    appreciationRatePct: number | undefined,
    annualNetIncome: number | undefined,
  ) => {
    const computedAnnualNetIncome =
      annualNetIncome
      ?? (transactionValue !== undefined && netYieldPct !== undefined
        ? transactionValue * (netYieldPct / 100)
        : undefined);
    const computedAnnualAppreciation =
      transactionValue !== undefined && appreciationRatePct !== undefined
        ? transactionValue * (appreciationRatePct / 100)
        : undefined;

    if (
      computedAnnualNetIncome === undefined
      && computedAnnualAppreciation === undefined
    ) {
      return undefined;
    }

    const annualReturnTotal =
      (computedAnnualNetIncome ?? 0)
      + (computedAnnualAppreciation ?? 0);
    const formatted = formatUsdCompact(annualReturnTotal);
    if (!formatted) {
      return undefined;
    }

    const netIncomeFormatted = formatUsdCompact(computedAnnualNetIncome);
    const appreciationFormatted = formatUsdCompact(computedAnnualAppreciation);
    const description =
      netIncomeFormatted && appreciationFormatted
        ? `${netIncomeFormatted} net income + ${appreciationFormatted} appreciation basis`
        : 'Net annual income plus appreciation basis on the validated route';

    return {
      label: 'Underwritten Annual Return',
      value: formatted,
      description,
    };
  };

  // Cross-border audit
  const crossBorderAudit = memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary;
  const hasCrossBorderAudit = !!crossBorderAudit;
  const hasUSWorldwideTax = crossBorderAudit?.compliance_flags?.includes('US_WORLDWIDE_TAXATION');
  const crossBorderMetrics = resolveCrossBorderDisplayMetrics(crossBorderAudit);
  const routeTaxDifferential = memoData.preview_data.tax_differential;
  const noRelocationTaxCredit =
    routeTaxDifferential?.cumulative_impact === 'none_without_relocation'
    || routeTaxDifferential?.is_relocating === false;

  // Show tax savings flag
  const showTheoreticalTaxSavings =
    memoData.preview_data.show_tax_savings !== false
    && !hasUSWorldwideTax
    && !noRelocationTaxCredit;

  // Via Negativa context
  const structureVerdict = memoData.preview_data.structure_optimization?.verdict;
  const isViaNegativa = structureVerdict === 'DO_NOT_PROCEED';

  let viaNegativaContext: ViaNegativaContext | undefined;
  if (isViaNegativa) {
    const backendVN = memoData.preview_data?.via_negativa || (memoData as any).via_negativa;

    const acquisitionAudit = crossBorderAudit?.acquisition_audit;
    const propertyValue = acquisitionAudit?.property_value || 0;
    const totalAcquisitionCost = acquisitionAudit?.total_acquisition_cost || 0;

    const dayOneLossPct = backendVN?.day_one_loss_pct || acquisitionAudit?.day_one_loss_pct || 0;
    const dayOneLossAmount = backendVN?.day_one_loss_amount || (totalAcquisitionCost - propertyValue);

    let totalConfiscationExposure = backendVN?.total_regulatory_exposure ?? 0;
    if (!totalConfiscationExposure) {
      const warnings = crossBorderAudit?.warnings || [];
      warnings.forEach((w: string) => {
        const match = w.match(/\$[\d,]+(?:\.\d+)?/g);
        if (match) {
          match.forEach((m: string) => {
            const val = parseFloat(m.replace(/[$,]/g, ''));
            if (!isNaN(val) && val > totalConfiscationExposure) {
              totalConfiscationExposure = val;
            }
          });
        }
      });
    }

    const taxEfficiencyPassed =
      backendVN?.tax_efficiency_passed ??
      (showTheoreticalTaxSavings && crossBorderMetrics.displayTaxSavingsPct > 0);
    const liquidityPassed = backendVN?.liquidity_passed ?? dayOneLossPct < 10;
    const structurePassed = backendVN?.structure_passed ?? false;

    const hdr = backendVN?.header;
    const sc = backendVN?.scenario_section;
    const tx = backendVN?.tax_section;
    const vs = backendVN?.verdict_section;
    const cta = backendVN?.cta;

    viaNegativaContext = {
      isActive: true,
      dayOneLoss: dayOneLossPct,
      dayOneLossAmount,
      totalConfiscationExposure,
      taxEfficiencyPassed,
      liquidityPassed,
      structurePassed,
      analysisPosture: hdr?.subtext || 'Pattern Recognition Engine has identified critical viability issues',
      badgeLabel: hdr?.badge_label || hdr?.badge_text || 'Elevated Risk',
      titlePrefix: hdr?.title_prefix || 'Capital At',
      titleHighlight: hdr?.title_highlight || 'Risk',
      noticeTitle: hdr?.text || 'Structural Barrier Analysis',
      noticeBody: hdr?.subtext || 'Pattern Recognition Engine has identified critical viability issues',
      metricLabels: {
        capitalExposure: 'Day-One Loss',
        structureVerdict: 'Structure Filter',
        structureVerdictValue: structurePassed ? 'PASS' : 'FAIL',
        structureVerdictDesc: structurePassed ? 'Structure viability threshold met' : 'Structure viability threshold not met',
        regulatoryExposure: 'Regulatory Exposure',
        regulatoryExposureDesc: 'Potential compliance and confiscation exposure'
      },
      scenarioHeader: sc?.header || 'Path Analysis',
      expectationLabel: sc?.expectation_label || 'Your Expectation',
      actualLabel: sc?.actual_label || 'Market Actual',
      commentaryTitle: sc?.commentary_title || 'Variance Commentary',
      commentaryBody: sc?.commentary_body || 'Projected outcomes diverge from market-tested execution paths.',
      taxBadgeLabel: tx?.badge_label || 'Tax Intelligence',
      taxTitleLine1: tx?.title_line_1 || tx?.header || 'Tax Efficiency',
      taxTitleLine2: tx?.title_line_2 || 'Check',
      compliancePrefix: tx?.compliance_prefix || 'Compliance',
      warningPrefix: tx?.warning_prefix || 'Warning',
      verdictHeader: vs?.header || 'Structural Review',
      verdictBadgeLabel: vs?.badge_label || 'Capital Allocation Review',
      stampText: vs?.stamp_text || 'Allocation Not Recommended',
      stampSubtext: vs?.stamp_subtext || 'Key viability thresholds not met in this structure — review alternative corridors and strategies below',
      ctaHeadline: cta?.headline || 'DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?',
      ctaBody: (cta?.body_template || 'This Pattern Audit identified {dayOneLoss}% Day-One capital exposure. The same engine analyzes any cross-border acquisition across 50+ jurisdictions.')
        .replace('{dayOneLoss}', dayOneLossPct.toFixed(2)),
      ctaScarcity: cta?.scarcity_text || '5 Slots Remaining — February Cycle',
      ctaButtonText: cta?.button_text || 'INITIATE RED TEAM AUDIT ($5,000)',
      ctaButtonUrl: cta?.button_url || 'https://app.hnwichronicles.com/decision-memo',
      ctaContextNote: cta?.context_note || `Pattern Recognition Engine analyzes ${memoData.preview_data.source_jurisdiction || 'source'} → ${memoData.preview_data.destination_jurisdiction || 'destination'} corridor and 50+ other jurisdictions.`,
    };
  }

  const executiveSummary = memoData.preview_data.executive_summary as Record<string, any> | undefined;
  const startingPosition = memoData.preview_data.wealth_projection_data?.starting_position as Record<string, any> | undefined;
  const scenarioTreeData = memoData.preview_data.scenario_tree_data as Record<string, any> | undefined;
  const transactionValue =
    toNumberOrUndefined(startingPosition?.transaction_value)
    ?? toNumberOrUndefined((memoData.preview_data as any)?.transaction_value)
    ?? toNumberOrUndefined((memoData.preview_data as any)?.deal_overview?.transaction_value);
  const netYieldPct = toNumberOrUndefined(startingPosition?.net_rental_yield_pct);
  const appreciationRatePct = toNumberOrUndefined(startingPosition?.appreciation_rate_pct);
  const annualNetIncome =
    toNumberOrUndefined(
      memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary?.net_yield_audit?.annual_net_income
    );
  const latestGeneratedAt =
    memoData.preview_data.assumption_ledger?.fix_date ||
    (memoData.preview_data as any).dm64_manual_repair?.repaired_at ||
    memoData.generated_at;

  const annualReturnHeadlineMetric = buildAnnualReturnHeadlineMetric(
    transactionValue,
    netYieldPct,
    appreciationRatePct,
    annualNetIncome,
  );
  const shouldOverrideLegacyHeadlineMetric =
    executiveSummary?.headline_metric?.label === 'Probability-Weighted Route Value';

  const routeHeadlineMetric = (
    shouldOverrideLegacyHeadlineMetric
      ? annualReturnHeadlineMetric
      : executiveSummary?.headline_metric
  ) || annualReturnHeadlineMetric || (() => {
    const expectedValue = toNumberOrUndefined(scenarioTreeData?.expected_value_usd);
    const formatted = formatUsdCompact(expectedValue);
    if (!formatted) {
      return undefined;
    }
    return {
      label: 'Probability-Weighted Route Value',
      value: formatted,
      description: 'Expected value of the validated route',
    };
  })();

  const routeEvidenceBasisNote =
    executiveSummary?.evidence_basis_note ||
    memoData.preview_data.data_quality_note ||
    memoData.preview_data.peer_cohort_stats?.data_quality_note;

  const routeUnderwritingSnapshot =
    executiveSummary?.underwriting_snapshot ||
    (() => {
      const items = [
        { label: 'Gross Yield', value: formatPct(startingPosition?.rental_yield_pct) },
        { label: 'Net Yield', value: formatPct(startingPosition?.net_rental_yield_pct) },
        { label: 'Appreciation Basis', value: formatPct(startingPosition?.appreciation_rate_pct) },
      ].filter((item) => item.value);
      if (!items.length) {
        return undefined;
      }
      return [
        ...items,
        { label: 'Tax Arbitrage', value: '$0', note: 'No relocation-linked credit taken' },
      ];
    })();

  const annualRentalIncome = toNumberOrUndefined(memoData.preview_data.annual_rental_income);
  const annualAppreciation = toNumberOrUndefined(memoData.preview_data.annual_appreciation);
  const annualValue = toNumberOrUndefined(memoData.preview_data.annual_value);

  // Value creation (computed from various fields)
  const rawValueCreation = memoData.preview_data.value_creation;
  const baseValueCreation =
    typeof rawValueCreation === 'object' && rawValueCreation !== null
      ? {
          amount: typeof rawValueCreation.amount === 'number' ? rawValueCreation.amount : undefined,
          description: typeof rawValueCreation.description === 'string' ? rawValueCreation.description : undefined,
        }
      : typeof rawValueCreation === 'string'
        ? { description: rawValueCreation }
        : {};

  const valueCreation = {
    ...baseValueCreation,
    ...(annualRentalIncome !== undefined || annualAppreciation !== undefined || annualValue !== undefined ? {
      annual: {
        rental: annualRentalIncome,
        rental_formatted: memoData.preview_data.annual_rental_income_formatted,
        appreciation: annualAppreciation,
        appreciation_formatted: memoData.preview_data.annual_appreciation_formatted,
        total: annualValue,
        total_formatted: memoData.preview_data.annual_value_formatted,
      }
    } : {})
  };

  return {
    crossBorderAudit,
    crossBorderMetrics,
    hasCrossBorderAudit,
    hasUSWorldwideTax,
    showTheoreticalTaxSavings,
    isViaNegativa,
    viaNegativaContext,
    valueCreation,
    latestGeneratedAt,
    routeHeadlineMetric,
    routeEvidenceBasisNote,
    routeUnderwritingSnapshot,
  };
}
