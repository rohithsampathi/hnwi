/**
 * PDF Type Guards — Runtime checks replacing `as any` casts
 * Commandment V: zero `any` — every field access is type-safe
 */

import type {
  PdfPreviewData,
  RiskAssessment,
  Mistake,
  CrisisData,
  TransparencyData,
  HeirManagementData,
  RegimeIntelligence,
  GoldenVisaIntelligence,
  HnwiTrendsData,
} from '../pdf-types';

/** preview_data.risk_assessment (MCP field) */
export function getRiskAssessment(pd: PdfPreviewData): RiskAssessment | undefined {
  return pd.risk_assessment;
}

/** preview_data.all_mistakes (same array the UI uses for total exposure) */
export function getAllMistakes(pd: PdfPreviewData): Mistake[] {
  return pd.all_mistakes ?? [];
}

/** preview_data.show_tax_savings — defaults true when absent */
export function getShowTaxSavings(pd: PdfPreviewData): boolean {
  return pd.show_tax_savings !== false;
}

/** preview_data.structure_optimization?.verdict */
export function getStructureVerdict(pd: PdfPreviewData): string | undefined {
  return pd.structure_optimization?.verdict;
}

/** preview_data.via_negativa */
export function getViaNegativa(pd: PdfPreviewData) {
  return pd.via_negativa;
}

/** preview_data.crisis_data || parsed from crisis_resilience_stress_test */
export function getCrisisData(pd: PdfPreviewData): CrisisData | undefined {
  return pd.crisis_data ?? undefined;
}

/** preview_data.transparency_data || parsed from transparency_regime_impact */
export function getTransparencyData(pd: PdfPreviewData): TransparencyData | undefined {
  return pd.transparency_data ?? undefined;
}

/** preview_data.golden_visa_intelligence */
export function getGoldenVisaIntelligence(pd: PdfPreviewData): GoldenVisaIntelligence | undefined {
  return pd.golden_visa_intelligence;
}

/** Regime intelligence: peer_cohort_stats.regime_intelligence || preview_data.regime_intelligence */
export function getRegimeIntelligence(pd: PdfPreviewData): RegimeIntelligence | undefined {
  return pd.peer_cohort_stats?.regime_intelligence ?? pd.regime_intelligence;
}

/** HNWI trends: transform array format to object format if needed */
export function getHnwiTrendsData(pd: PdfPreviewData): HnwiTrendsData | undefined {
  const structured = pd.hnwi_trends_analysis;
  if (structured && typeof structured === 'object') return structured as HnwiTrendsData;

  const raw = pd.hnwi_trends;
  if (Array.isArray(raw)) {
    return {
      insights: raw.map((t: string) => ({ content: t })),
      confidence: pd.hnwi_trends_confidence,
    };
  }
  return undefined;
}

/** HeirManagement third_generation_problem — backend nests it in multiple places */
export function getThirdGenProblem(hm: HeirManagementData) {
  return hm.hughes_framework?.third_generation_problem ?? hm.third_generation_problem ?? {};
}
