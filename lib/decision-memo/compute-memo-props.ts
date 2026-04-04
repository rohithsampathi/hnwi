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
    ...(memoData.preview_data.annual_rental_income !== undefined || memoData.preview_data.annual_appreciation !== undefined ? {
      annual: {
        rental: memoData.preview_data.annual_rental_income,
        rental_formatted: memoData.preview_data.annual_rental_income_formatted,
        appreciation: memoData.preview_data.annual_appreciation,
        appreciation_formatted: memoData.preview_data.annual_appreciation_formatted,
        total: toNumberOrUndefined(memoData.preview_data.annual_value),
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
    valueCreation
  };
}
