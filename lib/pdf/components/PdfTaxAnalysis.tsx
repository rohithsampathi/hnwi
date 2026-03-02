/**
 * WORLD-CLASS TAX JURISDICTION ANALYSIS — Commandment III
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Rebuilt with SVG primitives:
 * - Hero dollar savings number (48pt, verdict-colored)
 * - HorizontalBar SVGs for each tax type
 * - FlowArrow SVG for corridor visualization
 * - GradientAccentBar header
 * - GradientDivider section separators
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, cleanJurisdiction, darkTheme } from '../pdf-styles';
import { TaxRates } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  HorizontalBar,
  FlowArrow,
  GradientDivider,
} from './svg';

interface PdfTaxAnalysisProps {
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  sourceTaxRates?: TaxRates;
  destinationTaxRates?: TaxRates;
  totalTaxBenefit?: string | number;
  taxDifferential?: any;
  showTaxSavings?: boolean;
}

export const PdfTaxAnalysis: React.FC<PdfTaxAnalysisProps> = ({
  sourceJurisdiction, destinationJurisdiction,
  sourceTaxRates = {}, destinationTaxRates = {},
  totalTaxBenefit, taxDifferential, showTaxSavings = true,
}) => {
  const microLabel = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1.5 };
  const headerBadge = { backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 10, paddingVertical: 4 };

  const effectiveSourceRates = taxDifferential?.source || sourceTaxRates;
  const effectiveDestRates = taxDifferential?.destination || destinationTaxRates;

  const taxTypes = [
    { key: 'income_tax', altKey: null as string | null, label: 'Income Tax' },
    { key: 'capital_gains', altKey: 'cgt', label: 'Capital Gains' },
    { key: 'estate_tax', altKey: null as string | null, label: 'Estate Tax' },
    { key: 'wealth_tax', altKey: null as string | null, label: 'Wealth Tax' },
  ];

  const getTaxRate = (rates: any, primaryKey: string, altKey: string | null): number | undefined => {
    const primary = rates?.[primaryKey];
    if (primary !== undefined && primary !== null) return primary;
    if (altKey) { const alt = rates?.[altKey]; if (alt !== undefined && alt !== null) return alt; }
    return undefined;
  };

  const calculateImpact = (source: number | undefined, dest: number | undefined) => {
    const s = source ?? 0; const d = dest ?? 0; const diff = s - d;
    if (diff === 0) return { value: '—', positive: false, neutral: true, diff: 0 };
    return { value: `${diff > 0 ? '+' : ''}${diff}%`, positive: diff > 0, neutral: false, diff };
  };

  let cumulativeDiff = 0;
  taxTypes.forEach(tax => {
    cumulativeDiff += (getTaxRate(effectiveSourceRates, tax.key, tax.altKey) ?? 0) - (getTaxRate(effectiveDestRates, tax.key, tax.altKey) ?? 0);
  });

  let benefitValue: number;
  if (!showTaxSavings) { benefitValue = 0; }
  else if (taxDifferential?.cumulative_tax_differential_pct != null) { benefitValue = Math.round(taxDifferential.cumulative_tax_differential_pct); }
  else if (typeof totalTaxBenefit === 'string') { const match = totalTaxBenefit.match(/([+-]?\d+)/); benefitValue = match ? parseInt(match[1]) : cumulativeDiff; }
  else if (typeof totalTaxBenefit === 'number') { benefitValue = totalTaxBenefit; }
  else { benefitValue = cumulativeDiff; }

  const sourceClean = cleanJurisdiction(sourceJurisdiction) || 'Current';
  const destClean = cleanJurisdiction(destinationJurisdiction) || 'Optimized';
  const isPositive = benefitValue > 0;
  const isNeutral = benefitValue === 0;
  const heroColor = isPositive ? colors.emerald[400] : isNeutral ? darkTheme.textMuted : colors.red[400];
  const heroTheme = getVerdictTheme(isPositive ? 'PROCEED' : isNeutral ? 'REVIEW' : 'ABORT');

  const cellBase = { flex: 1, fontFamily: 'Inter' as const, fontSize: 10, color: darkTheme.textSecondary, paddingHorizontal: 8 };
  const cellHeaderBase = { flex: 1, fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5, paddingHorizontal: 8 };
  const cellValueBase = { flex: 1, fontFamily: 'Courier-Bold' as const, fontSize: 11, textAlign: 'center' as const, color: darkTheme.textSecondary, paddingHorizontal: 8 };
  const cellImpactBase = { flex: 1, fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 11, textAlign: 'right' as const, paddingHorizontal: 8 };

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Header */}
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} minPresenceAhead={150}>
        <GradientAccentBar width={483} height={4} theme={heroTheme} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1, maxWidth: '70%' }}>Tax Jurisdiction Analysis</Text>
          <View style={headerBadge}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Commandment III</Text>
          </View>
        </View>
      </View>

      {/* Hero: Dollar Savings or N/A */}
      {!showTaxSavings ? (
        <View style={{ marginBottom: 24, padding: 28, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center' }} wrap={false}>
          <Text style={{ ...microLabel, marginBottom: 8 }}>Cumulative Tax Impact</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: darkTheme.textFaint, marginBottom: 8 }}>N/A</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 11, color: darkTheme.textMuted, textAlign: 'center', maxWidth: 360, lineHeight: 1.65 }}>
            {taxDifferential?.cumulative_impact_label || 'US Worldwide Taxation — US citizens and residents are taxed on worldwide income regardless of residency. Tax optimization through jurisdiction change is not applicable.'}
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: 24, padding: 28, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', position: 'relative', overflow: 'hidden' }} wrap={false}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: heroColor }} />
          <Text style={{ ...microLabel, marginBottom: 8 }}>Cumulative Tax Impact</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 48, letterSpacing: -1, marginBottom: 8, color: heroColor }}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: darkTheme.textPrimary, marginBottom: 4 }}>
            {isPositive ? 'Total Tax Savings' : isNeutral ? 'Tax Neutral' : 'Total Tax Cost'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted }}>{sourceClean}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
              <View style={{ width: 20, height: 1, backgroundColor: darkTheme.textFaint }} />
              <View style={{ width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: darkTheme.textFaint }} />
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted }}>{destClean}</Text>
          </View>

          {taxDifferential?.annual_savings_estimate && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Estimated Annual Savings</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: colors.emerald[400] }}>
                {typeof taxDifferential.annual_savings_estimate === 'number' ? `$${(taxDifferential.annual_savings_estimate / 1000).toFixed(0)}K` : taxDifferential.annual_savings_estimate}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* FlowArrow SVG Corridor */}
      <View style={{ flexDirection: 'row', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'center' }} wrap={false}>
        <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: colors.amber[500], marginRight: 20, paddingLeft: 16 }}>
          <Text style={{ ...microLabel, letterSpacing: 1, marginBottom: 8 }}>Migration Corridor</Text>
          <FlowArrow from={sourceClean} to={destClean} height={32} theme={heroTheme} />
        </View>
        <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: darkTheme.border, paddingLeft: 16 }}>
          <Text style={{ ...microLabel, letterSpacing: 1, marginBottom: 8 }}>Annual Efficiency Gain</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, letterSpacing: -0.5, color: isPositive ? colors.emerald[400] : darkTheme.textMuted }}>
            {showTaxSavings ? `${isPositive ? '+' : ''}${benefitValue}%` : 'N/A'}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginTop: 4 }}>Estimated tax optimization</Text>
        </View>
      </View>

      {/* Tax Comparison Table */}
      <View style={{ width: '100%', marginBottom: 24, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
        <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
          <Text style={cellHeaderBase}>Tax Category</Text>
          <Text style={{ ...cellHeaderBase, textAlign: 'center' }}>{sourceClean}</Text>
          <Text style={{ ...cellHeaderBase, textAlign: 'center' }}>{destClean}</Text>
          <Text style={{ ...cellHeaderBase, textAlign: 'right' }}>Impact</Text>
        </View>

        {taxTypes.map((tax, index) => {
          const sourceRate = getTaxRate(effectiveSourceRates, tax.key, tax.altKey);
          const destRate = getTaxRate(effectiveDestRates, tax.key, tax.altKey);
          const impact = calculateImpact(sourceRate, destRate);
          const sourceIsHigher = (sourceRate ?? 0) > (destRate ?? 0);
          const destIsHigher = (destRate ?? 0) > (sourceRate ?? 0);

          return (
            <View key={index} style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'center', backgroundColor: index % 2 === 1 ? darkTheme.cardBg : undefined }}>
              <Text style={{ ...cellBase, fontWeight: 700, color: darkTheme.textPrimary }}>{tax.label}</Text>
              <Text style={{ ...cellValueBase, color: sourceIsHigher ? colors.red[400] : (!sourceIsHigher && destIsHigher) ? colors.emerald[400] : darkTheme.textSecondary }}>
                {sourceRate !== undefined ? `${sourceRate}%` : '—'}
              </Text>
              <Text style={{ ...cellValueBase, color: destIsHigher ? colors.red[400] : (!destIsHigher && sourceIsHigher) ? colors.emerald[400] : darkTheme.textSecondary }}>
                {destRate !== undefined ? `${destRate}%` : '—'}
              </Text>
              <Text style={{ ...cellImpactBase, color: impact.positive ? colors.emerald[400] : !impact.neutral ? colors.red[400] : darkTheme.textMuted }}>
                {impact.value}
                {!impact.neutral && <Text style={{ fontSize: 8.5, color: darkTheme.textMuted }}>{impact.positive ? ' saved' : ' more'}</Text>}
              </Text>
            </View>
          );
        })}

        {/* Cumulative Total Row */}
        <View style={{ flexDirection: 'row', paddingVertical: 14, backgroundColor: darkTheme.cardBg }}>
          <Text style={{ ...cellBase, fontWeight: 700, color: darkTheme.textPrimary }}>Cumulative Impact</Text>
          <Text style={{ flex: 1 }} />
          <Text style={{ flex: 1 }} />
          <Text style={{ ...cellImpactBase, color: isPositive ? colors.emerald[400] : isNeutral ? darkTheme.textFaint : colors.red[400], fontSize: 14 }}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
        </View>
      </View>

      {/* Visual HorizontalBar Comparisons */}
      <View style={{ marginBottom: 24 }} wrap={false}>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, marginBottom: 12 }}>Rate Comparison — Visual Analysis</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 4, backgroundColor: colors.red[400] }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted }}>{sourceClean}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, marginRight: 4, backgroundColor: colors.emerald[400] }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted }}>{destClean}</Text>
          </View>
        </View>
        {taxTypes.map((tax, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
            <Text style={{ width: 90, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary }}>{tax.label}</Text>
            <HorizontalBar currentRate={getTaxRate(effectiveSourceRates, tax.key, tax.altKey) ?? 0} optimizedRate={getTaxRate(effectiveDestRates, tax.key, tax.altKey) ?? 0} width={180} height={22} />
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={180} height={1} color={darkTheme.border} />
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint, letterSpacing: 0.5, marginHorizontal: 12 }}>
          Tax analysis powered by HNWI Chronicles KGv3 Jurisdiction Intelligence
        </Text>
        <GradientDivider width={180} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfTaxAnalysis;
