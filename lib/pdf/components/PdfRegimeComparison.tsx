/**
 * PdfRegimeComparison — Tax comparison, costs, scenarios sub-component
 * Extracted from PdfRegimeIntelligenceSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme } from '../pdf-styles';

interface TaxComparison {
  source_jurisdiction: string;
  source_income_tax: number;
  source_cgt: number;
  destination_jurisdiction: string;
  destination_income_tax: number;
  destination_cgt: number;
  total_savings_pct: number;
  note?: string;
}

interface EstimatedCosts {
  visa_fee?: string;
  emirates_id?: string;
  medical_test?: string;
  total_range: string;
}

interface ScenarioSide {
  dest_income_tax: number;
  dest_cgt: number;
  tax_differential: number;
  note: string;
}

const compRow = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 6 };

interface PdfRegimeComparisonProps {
  taxComparison?: TaxComparison;
  estimatedCosts?: EstimatedCosts;
  scenarioStatus?: string;
  regimeName?: string;
  withRegime?: ScenarioSide;
  withoutRegime?: ScenarioSide;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

export const PdfRegimeComparison: React.FC<PdfRegimeComparisonProps> = ({
  taxComparison, estimatedCosts, scenarioStatus, regimeName,
  withRegime, withoutRegime, sourceJurisdiction, destinationJurisdiction,
}) => {
  const sectionLabel = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 };
  const compLabel = { fontFamily: 'Inter' as const, fontSize: 9, color: darkTheme.textMuted };
  const compValue = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 10, color: darkTheme.textPrimary };

  return (
  <>
    {/* Tax Comparison */}
    {taxComparison && (
      <View style={{ marginBottom: 24 }}>
        <Text style={sectionLabel}>Tax Comparison</Text>
        <View style={{ flexDirection: 'row' }} wrap={false}>
          <View style={{ flex: 1, padding: 16, borderWidth: 1, borderColor: darkTheme.border, marginRight: 16 }}>
            <Text style={{ ...sectionLabel, marginBottom: 12 }}>{taxComparison.source_jurisdiction || sourceJurisdiction || 'Source'}</Text>
            <View style={compRow}><Text style={compLabel}>Income Tax:</Text><Text style={compValue}>{taxComparison.source_income_tax}%</Text></View>
            <View style={compRow}><Text style={compLabel}>Capital Gains:</Text><Text style={compValue}>{taxComparison.source_cgt}%</Text></View>
          </View>
          <View style={{ flex: 1, padding: 16, borderWidth: 2, borderColor: colors.emerald[500], backgroundColor: 'rgba(16,185,129,0.08)' }}>
            <Text style={{ ...sectionLabel, marginBottom: 12 }}>{taxComparison.destination_jurisdiction || destinationJurisdiction || 'Destination'}</Text>
            <View style={compRow}><Text style={compLabel}>Income Tax:</Text><Text style={[compValue, { color: colors.emerald[400] }]}>{taxComparison.destination_income_tax}%</Text></View>
            <View style={compRow}><Text style={compLabel}>Capital Gains:</Text><Text style={[compValue, { color: colors.emerald[400] }]}>{taxComparison.destination_cgt}%</Text></View>
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(16,185,129,0.25)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.emerald[400], textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Savings</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: colors.emerald[400] }}>+{taxComparison.total_savings_pct}%</Text>
            </View>
          </View>
        </View>
      </View>
    )}

    {/* Estimated Costs */}
    {estimatedCosts && (
      <View>
        <Text style={sectionLabel}>Estimated Costs</Text>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {estimatedCosts.visa_fee && (
            <View style={{ flex: 1, padding: 12, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Visa Fee</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary }}>{estimatedCosts.visa_fee}</Text>
            </View>
          )}
          {estimatedCosts.emirates_id && (
            <View style={{ flex: 1, padding: 12, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Emirates ID</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary }}>{estimatedCosts.emirates_id}</Text>
            </View>
          )}
          {estimatedCosts.medical_test && (
            <View style={{ flex: 1, padding: 12, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Medical Test</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary }}>{estimatedCosts.medical_test}</Text>
            </View>
          )}
          <View style={{ flex: 1, padding: 12, backgroundColor: 'rgba(212,168,67,0.08)', borderWidth: 1.5, borderColor: colors.amber[500], alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Total Range</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: colors.amber[500] }}>{estimatedCosts.total_range}</Text>
          </View>
        </View>
      </View>
    )}

    {/* Dual Scenario Comparison */}
    {(scenarioStatus === 'ENDED' || scenarioStatus === 'ENDING') && withRegime && withoutRegime && (
      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        <View style={{ flex: 1, padding: 16, borderWidth: 2, borderColor: colors.emerald[500], backgroundColor: 'rgba(16,185,129,0.08)' }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, marginBottom: 8, color: colors.emerald[400] }}>With {regimeName}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{withRegime.note}</Text>
          <View style={compRow}><Text style={compLabel}>Income Tax:</Text><Text style={compValue}>{withRegime.dest_income_tax}%</Text></View>
          <View style={compRow}><Text style={compLabel}>Capital Gains:</Text><Text style={compValue}>{withRegime.dest_cgt}%</Text></View>
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: colors.emerald[400] }}>+{withRegime.tax_differential}%</Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: 16, borderWidth: 1, borderColor: darkTheme.border, marginLeft: 16 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, marginBottom: 8, color: darkTheme.textSecondary }}>Standard Rates (No Regime)</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginBottom: 12, lineHeight: 1.5 }}>{withoutRegime.note}</Text>
          <View style={compRow}><Text style={compLabel}>Income Tax:</Text><Text style={compValue}>{withoutRegime.dest_income_tax}%</Text></View>
          <View style={compRow}><Text style={compLabel}>Capital Gains:</Text><Text style={compValue}>{withoutRegime.dest_cgt}%</Text></View>
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: withoutRegime.tax_differential >= 0 ? colors.emerald[400] : colors.red[400] }}>
              {withoutRegime.tax_differential >= 0 ? '+' : ''}{withoutRegime.tax_differential}%
            </Text>
          </View>
        </View>
      </View>
    )}
  </>
  );
};
