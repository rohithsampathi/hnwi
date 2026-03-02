/**
 * PDF Tax Regime Intelligence Section — Orchestrator
 * Premium institutional visualization for special tax regime detection
 * NHR, 13O, Golden Visa regime status and impact analysis
 *
 * Sub-components: PdfRegimeDetails, PdfRegimeComparison
 */

import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { colors, darkTheme } from '../pdf-styles';
import { PdfSectionHeader, PdfGroundedNote } from './primitives';
import { PdfRegimeDetails } from './PdfRegimeDetails';
import { PdfRegimeComparison } from './PdfRegimeComparison';

// --- Interfaces (local, matching web UI) ---

interface RegimeRates { foreign_income?: number; foreign_dividends?: number; capital_gains_foreign?: number }
interface CriticalDate { date: string; event: string }
interface DetectedRegime { regime_key: string; regime_name: string; jurisdiction: string; status: "ACTIVE" | "ENDED" | "ENDING"; rates?: RegimeRates; warning?: string; successor_regime?: string; critical_dates?: CriticalDate[] }
interface QualificationRoute { route: string; minimum_investment: string; processing_time: string }
interface TaxComparison { source_jurisdiction: string; source_income_tax: number; source_cgt: number; destination_jurisdiction: string; destination_income_tax: number; destination_cgt: number; total_savings_pct: number; note?: string }
interface CriticalConsideration { item: string; detail: string; priority: "HIGH" | "MEDIUM" | "LOW" }
interface ApplicationStep { step: number; action: string; timeline: string }
interface EstimatedCosts { visa_fee?: string; emirates_id?: string; medical_test?: string; total_range: string }
interface RegimeScenario {
  regime_name: string; status: string; end_date?: string;
  with_regime?: { dest_income_tax: number; dest_cgt: number; tax_differential: number; note: string };
  without_regime?: { dest_income_tax: number; dest_cgt: number; tax_differential: number; note: string };
  successor_regime?: string; action_required?: string; key_benefits?: string[];
  qualification_routes?: QualificationRoute[]; tax_comparison?: TaxComparison;
  critical_considerations?: CriticalConsideration[]; application_process?: ApplicationStep[];
  estimated_costs?: EstimatedCosts;
}
interface RegimeWarning { regime: string; status: string; warning: string; critical_dates?: CriticalDate[] }

export interface RegimeIntelligence {
  has_special_regime: boolean;
  detected_regimes?: DetectedRegime[];
  regime_scenario?: RegimeScenario;
  regime_warnings?: RegimeWarning[];
}

interface PdfRegimeIntelligenceSectionProps {
  regimeIntelligence?: RegimeIntelligence;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  intakeId: string;
}


const PageFooter: React.FC<{ intakeId: string }> = ({ intakeId }) => (
  <View style={{ position: 'absolute', bottom: 28, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }} fixed>
    <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint }}>Ref: {intakeId.slice(10, 22).toUpperCase()}</Text>
    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, letterSpacing: 1, textTransform: 'uppercase' }}>HNWI Chronicles</Text>
    <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint }}>Confidential</Text>
  </View>
);

export function PdfRegimeIntelligenceSection({ regimeIntelligence, sourceJurisdiction, destinationJurisdiction, intakeId }: PdfRegimeIntelligenceSectionProps) {
  if (!regimeIntelligence?.has_special_regime) return null;
  const { regime_scenario, regime_warnings } = regimeIntelligence;
  if (!regime_scenario) return null;

  const ps = {
    fontFamily: 'Inter' as const, fontSize: 10, paddingTop: 56, paddingBottom: 72,
    paddingHorizontal: 56, backgroundColor: darkTheme.pageBg, color: darkTheme.textSecondary,
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return { bg: 'rgba(16,185,129,0.15)', border: colors.emerald[500], color: colors.emerald[400], label: 'ACTIVE' };
    if (s === 'ended') return { bg: darkTheme.surfaceBg, border: darkTheme.textFaint, color: darkTheme.textMuted, label: 'ENDED' };
    return { bg: 'rgba(212,168,67,0.15)', border: colors.amber[500], color: colors.amber[500], label: 'ENDING SOON' };
  };

  const badge = getStatusBadge(regime_scenario.status);

  return (
    <Page size="A4" style={ps}>
      <View style={{ marginBottom: 32 }}>
        {/* Header with status badge */}
        <View style={{ marginBottom: 24, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: darkTheme.textPrimary }}>
          <View style={{ width: 32, height: 4, backgroundColor: colors.amber[500], marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: darkTheme.textPrimary, letterSpacing: -0.3 }}>Tax Regime Intelligence</Text>
            <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1.5, borderColor: badge.border, backgroundColor: badge.bg }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: badge.color }}>{badge.label}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted, marginTop: 8 }}>
            Special regime detection and impact analysis for {destinationJurisdiction || 'destination'}
          </Text>
        </View>

        {/* Hero Card */}
        <View style={{ backgroundColor: darkTheme.surfaceBg, padding: 24, marginBottom: 20 }} wrap={false}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: darkTheme.textPrimary, marginBottom: 6 }}>{regime_scenario.regime_name}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textFaint }}>{destinationJurisdiction || 'Destination'} Special Tax Program</Text>
        </View>

        <PdfRegimeDetails
          keyBenefits={regime_scenario.key_benefits}
          qualificationRoutes={regime_scenario.qualification_routes}
          criticalConsiderations={regime_scenario.critical_considerations}
          applicationProcess={regime_scenario.application_process}
          actionRequired={regime_scenario.action_required}
          successorRegime={regime_scenario.successor_regime}
          regimeWarnings={regime_warnings}
        />

        <PdfRegimeComparison
          taxComparison={regime_scenario.tax_comparison}
          estimatedCosts={regime_scenario.estimated_costs}
          scenarioStatus={regime_scenario.status}
          regimeName={regime_scenario.regime_name}
          withRegime={regime_scenario.with_regime}
          withoutRegime={regime_scenario.without_regime}
          sourceJurisdiction={sourceJurisdiction}
          destinationJurisdiction={destinationJurisdiction}
        />

        <PdfGroundedNote source="HNWI Chronicles KG Tax Regime Intelligence + NHR / Golden Visa Database" />
      </View>

      <PageFooter intakeId={intakeId} />
    </Page>
  );
}

export default PdfRegimeIntelligenceSection;
