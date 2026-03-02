import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { ViaNegativaContext } from './memo-types';

/**
 * Computes derived props needed by memo components
 * Extracted from audit page.tsx to avoid duplication in JARVIS interface
 */
export function computeMemoProps(memoData: PdfMemoData) {
  // Cross-border audit
  const crossBorderAudit = memoData.preview_data.wealth_projection_data?.starting_position?.cross_border_audit_summary;
  const hasCrossBorderAudit = !!crossBorderAudit;
  const hasUSWorldwideTax = crossBorderAudit?.compliance_flags?.includes('US_WORLDWIDE_TAXATION');

  // Show tax savings flag
  const showTheoreticalTaxSavings = memoData.preview_data.show_tax_savings !== false && !hasUSWorldwideTax;

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

    const taxEfficiencyPassed = backendVN?.tax_efficiency_passed ?? (showTheoreticalTaxSavings && (crossBorderAudit?.total_tax_savings_pct || 0) > 0);
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
      headerText: hdr?.text || 'STRUCTURAL BARRIER ANALYSIS',
      headerSubtext: hdr?.subtext || 'Pattern Recognition Engine has identified critical viability issues',
      headerBadgeText: hdr?.badge_text || 'Risk Assessment',
      scenarioHeader: sc?.header || 'Path Analysis',
      scenarioSubheader: sc?.subheader || 'Evaluating structural alternatives',
      taxHeader: tx?.header || 'Tax Efficiency Check',
      taxSubheader: tx?.subheader || 'Comparing jurisdictional positioning',
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
  const valueCreation = {
    ...memoData.preview_data.value_creation,
    ...(memoData.preview_data.annual_rental_income !== undefined || memoData.preview_data.annual_appreciation !== undefined ? {
      annual: {
        rental: memoData.preview_data.annual_rental_income,
        rental_formatted: memoData.preview_data.annual_rental_income_formatted,
        appreciation: memoData.preview_data.annual_appreciation,
        appreciation_formatted: memoData.preview_data.annual_appreciation_formatted,
        total: memoData.preview_data.annual_value,
        total_formatted: memoData.preview_data.annual_value_formatted,
      }
    } : {})
  };

  return {
    crossBorderAudit,
    hasCrossBorderAudit,
    hasUSWorldwideTax,
    showTheoreticalTaxSavings,
    isViaNegativa,
    viaNegativaContext,
    valueCreation
  };
}
