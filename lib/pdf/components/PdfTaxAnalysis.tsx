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
import { colors, cleanJurisdiction, darkTheme, typography, spacing } from '../pdf-styles';
import { TaxRates } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  GradientDivider,
} from './svg';

// =============================================================================
// LOCAL STYLES — composed from centralized typography tokens
// =============================================================================
const styles = {
  // Section title — 15pt bold uppercase (between h2=16 and h3=13)
  sectionHeading: {
    ...typography.h2,
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: darkTheme.textPrimary,
  },
  // Micro label — bold 9pt uppercase with wide tracking
  microLabel: {
    ...typography.microBold,
    letterSpacing: 1.5,
    color: darkTheme.textMuted,
  },
  // Badge label — bold 9pt uppercase, narrower tracking than microLabel
  badgeLabel: {
    ...typography.microBold,
    letterSpacing: 1,
    color: darkTheme.textMuted,
  },
  // Hero impact number — 48pt (slightly smaller than hero token's 52pt)
  heroImpact: {
    ...typography.hero,
    fontSize: 48,
    letterSpacing: -1,
  },
  // Hero N/A state — 32pt bold for disabled display
  heroDisabled: {
    ...typography.h1,
    fontSize: 32,
    color: darkTheme.textFaint,
  },
  // Body text — 11pt standard body
  body: {
    ...typography.body,
    color: darkTheme.textMuted,
  },
  // Metric small — 14pt bold
  metricSm: {
    ...typography.metricSm,
    color: darkTheme.textPrimary,
  },
  // Metric savings — 20pt bold (between metricMd=16 and metricLg=22)
  metricSavings: {
    ...typography.metricLg,
    fontSize: 20,
  },
  // Metric efficiency — 18pt bold with tight tracking
  metricEfficiency: {
    ...typography.metricMd,
    fontSize: 18,
    letterSpacing: -0.5,
  },
  // Small text — 10pt for jurisdiction labels, legend items
  small: {
    ...typography.small,
    color: darkTheme.textMuted,
  },
  // Caption — 9pt for footnotes, estimation notes
  caption: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
  // Footer caption — 9pt with tracking
  footerCaption: {
    ...typography.caption,
    color: darkTheme.textFaint,
    letterSpacing: 0.5,
  },
  // Sub-section title — bold body text
  subSectionTitle: {
    ...typography.bodyBold,
    color: darkTheme.textPrimary,
  },
  // Bar chart label — bold 9pt without uppercase transform
  barLabel: {
    ...typography.microBold,
    textTransform: undefined as unknown as undefined,
    letterSpacing: 0,
    color: darkTheme.textSecondary,
  },
  // Table: cell base — 10pt regular
  cellBase: {
    ...typography.small,
    color: darkTheme.textSecondary,
    paddingHorizontal: 8,
  },
  // Table: column header — bold 9pt uppercase
  cellHeader: {
    ...typography.microBold,
    color: darkTheme.textPrimary,
    paddingHorizontal: 8,
  },
  // Table: value cell — monospaced 11pt centered
  cellValue: {
    fontSize: 11,
    fontFamily: 'Courier-Bold' as const,
    textAlign: 'center' as const,
    color: darkTheme.textSecondary,
    paddingHorizontal: 8,
  },
  // Table: impact cell — bold 11pt right-aligned
  cellImpact: {
    ...typography.bodyBold,
    textAlign: 'right' as const,
    paddingHorizontal: 8,
  },
  // Inline impact annotation — caption size
  impactAnnotation: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
} as const;

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
  const heroColor = isPositive ? colors.amber[500] : isNeutral ? darkTheme.textMuted : colors.red[700];
  const heroTheme = getVerdictTheme(isPositive ? 'PROCEED' : isNeutral ? 'REVIEW' : 'ABORT');

  return (
    <View style={{ marginBottom: spacing.xl }}>
      {/* Header */}
      <View style={{ marginBottom: spacing.lg, paddingBottom: spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} minPresenceAhead={150}>
        <GradientAccentBar width={483} height={4} theme={heroTheme} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: spacing.sm + 2 }}>
          <Text style={{ ...styles.sectionHeading, flexShrink: 1, maxWidth: '70%' }}>Tax Jurisdiction Analysis</Text>
          <View style={headerBadge}>
            <Text style={styles.badgeLabel}>TAX INTELLIGENCE</Text>
          </View>
        </View>
      </View>

      {/* Hero: Dollar Savings or N/A */}
      {!showTaxSavings ? (
        <View style={{ marginBottom: spacing.xl - 4, padding: spacing.xl, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center' }} wrap={false}>
          <Text style={{ ...styles.microLabel, marginBottom: spacing.sm }}>Cumulative Tax Impact</Text>
          <Text style={{ ...styles.heroDisabled, marginBottom: spacing.sm }}>N/A</Text>
          <Text style={{ ...styles.body, textAlign: 'center', maxWidth: 360 }}>
            {taxDifferential?.cumulative_impact_label || 'No relocation-linked tax arbitrage is claimed in this route. Jurisdictional tax obligations remain in scope until residence changes.'}
          </Text>
        </View>
      ) : (
        <View style={{ marginBottom: spacing.xl - 4, padding: spacing.xl, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', position: 'relative', overflow: 'hidden' }} wrap={false}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: heroColor }} />
          <Text style={{ ...styles.microLabel, marginBottom: spacing.sm }}>Cumulative Tax Impact</Text>
          <Text style={{ ...styles.heroImpact, marginBottom: spacing.sm, color: heroColor }}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
          <Text style={{ ...styles.metricSm, marginBottom: spacing.xs }}>
            {isPositive ? 'Total Tax Savings' : isNeutral ? 'Tax Neutral' : 'Total Tax Cost'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.small}>{sourceClean}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm }}>
              <View style={{ width: 20, height: 1, backgroundColor: darkTheme.textFaint }} />
              <View style={{ width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: darkTheme.textFaint }} />
            </View>
            <Text style={styles.small}>{destClean}</Text>
          </View>

          {taxDifferential?.annual_savings_estimate && (
            <View style={{ marginTop: spacing.sm + 4, paddingTop: spacing.sm + 4, borderTopWidth: 1, borderTopColor: darkTheme.border, alignItems: 'center' }}>
              <Text style={{ ...styles.badgeLabel, marginBottom: spacing.xs }}>Estimated Annual Savings</Text>
              <Text style={{ ...styles.metricSavings, color: colors.amber[500] }}>
                {typeof taxDifferential.annual_savings_estimate === 'number' ? `$${(taxDifferential.annual_savings_estimate / 1000).toFixed(0)}K` : taxDifferential.annual_savings_estimate}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Migration Corridor + Efficiency Gain */}
      <View style={{ flexDirection: 'row', marginBottom: spacing.xl - 4, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
        <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: colors.amber[500], paddingLeft: spacing.md + 2, marginRight: spacing.lg }}>
          <Text style={{ ...styles.microLabel, marginBottom: spacing.sm }}>Migration Corridor</Text>
          <Text style={{ ...styles.metricSm, marginBottom: 4 }}>{sourceClean}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
            <View style={{ width: 20, height: 1.5, backgroundColor: colors.amber[500] }} />
            <View style={{ width: 0, height: 0, borderTopWidth: 3, borderBottomWidth: 3, borderLeftWidth: 5, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: colors.amber[500] }} />
          </View>
          <Text style={{ ...styles.metricSm }}>{destClean}</Text>
        </View>
        <View style={{ flex: 1, borderLeftWidth: 3, borderLeftColor: darkTheme.border, paddingLeft: spacing.md + 2 }}>
          <Text style={{ ...styles.microLabel, marginBottom: spacing.sm }}>Annual Efficiency Gain</Text>
          <Text style={{ ...styles.metricEfficiency, color: isPositive ? colors.amber[500] : darkTheme.textMuted }}>
            {showTaxSavings ? `${isPositive ? '+' : ''}${benefitValue}%` : 'N/A'}
          </Text>
          <Text style={{ ...styles.caption, marginTop: spacing.xs }}>Estimated tax optimization</Text>
        </View>
      </View>

      {/* Tax Comparison Table */}
      <View style={{ width: '100%', marginBottom: spacing.xl - 4, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
        <View style={{ flexDirection: 'row', paddingVertical: spacing.sm + 4, borderBottomWidth: 2, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
          <Text style={{ ...styles.cellHeader, flex: 1 }}>Tax Category</Text>
          <Text style={{ ...styles.cellHeader, flex: 1, textAlign: 'center' }}>{sourceClean}</Text>
          <Text style={{ ...styles.cellHeader, flex: 1, textAlign: 'center' }}>{destClean}</Text>
          <Text style={{ ...styles.cellHeader, flex: 1, textAlign: 'right' }}>Impact</Text>
        </View>

        {taxTypes.map((tax, index) => {
          const sourceRate = getTaxRate(effectiveSourceRates, tax.key, tax.altKey);
          const destRate = getTaxRate(effectiveDestRates, tax.key, tax.altKey);
          const impact = calculateImpact(sourceRate, destRate);
          const sourceIsHigher = (sourceRate ?? 0) > (destRate ?? 0);
          const destIsHigher = (destRate ?? 0) > (sourceRate ?? 0);

          return (
            <View key={index} style={{ flexDirection: 'row', paddingVertical: spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'center', backgroundColor: index % 2 === 1 ? darkTheme.cardBg : undefined }}>
              <Text style={{ ...styles.cellBase, flex: 1, fontWeight: 700, color: darkTheme.textPrimary }}>{tax.label}</Text>
              <Text style={{ ...styles.cellValue, flex: 1, color: sourceIsHigher ? colors.red[700] : (!sourceIsHigher && destIsHigher) ? colors.amber[500] : darkTheme.textSecondary }}>
                {sourceRate !== undefined ? `${sourceRate}%` : '—'}
              </Text>
              <Text style={{ ...styles.cellValue, flex: 1, color: destIsHigher ? colors.red[700] : (!destIsHigher && sourceIsHigher) ? colors.amber[500] : darkTheme.textSecondary }}>
                {destRate !== undefined ? `${destRate}%` : '—'}
              </Text>
              <Text style={{ ...styles.cellImpact, flex: 1, color: impact.positive ? colors.amber[500] : !impact.neutral ? colors.red[700] : darkTheme.textMuted }}>
                {impact.value}
                {!impact.neutral && <Text style={styles.impactAnnotation}>{impact.positive ? ' saved' : ' more'}</Text>}
              </Text>
            </View>
          );
        })}

        {/* Cumulative Total Row */}
        <View style={{ flexDirection: 'row', paddingVertical: spacing.md, backgroundColor: darkTheme.cardBg }}>
          <Text style={{ ...styles.cellBase, flex: 1, fontWeight: 700, color: darkTheme.textPrimary }}>Cumulative Impact</Text>
          <Text style={{ flex: 1 }} />
          <Text style={{ flex: 1 }} />
          <Text style={{ ...styles.cellImpact, flex: 1, color: isPositive ? colors.amber[500] : isNeutral ? darkTheme.textFaint : colors.red[700], fontSize: 14 }}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md + 2, paddingTop: spacing.sm + 4 }}>
        <GradientDivider width={180} height={1} color={darkTheme.border} />
        <Text style={{ ...styles.footerCaption, marginHorizontal: spacing.sm + 4 }}>
          Tax analysis powered by HNWI Chronicles KGv3 Jurisdiction Intelligence
        </Text>
        <GradientDivider width={180} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfTaxAnalysis;
