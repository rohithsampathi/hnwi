/**
 * PdfRegimeComparison — Tax comparison, costs, scenarios sub-component
 * Extracted from PdfRegimeIntelligenceSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, typography, spacing } from '../pdf-styles';

interface TaxComparison {
  source_jurisdiction?: string;
  source_income_tax?: number;
  source_cgt?: number;
  destination_jurisdiction?: string;
  destination_income_tax?: number;
  destination_cgt?: number;
  total_savings_pct?: number;
  note?: string;
}

interface EstimatedCosts {
  visa_fee?: string;
  emirates_id?: string;
  medical_test?: string;
  total_range?: string;
}

interface ScenarioSide {
  dest_income_tax?: number;
  dest_cgt?: number;
  tax_differential?: number;
  note?: string;
}

/* ── Local style compositions from typography tokens ─────────────── */
const styles = {
  sectionLabel: {
    ...typography.microBold,
    letterSpacing: 1,
    color: darkTheme.textMuted,
    marginBottom: spacing.md,
  },
  compLabel: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
  compValue: {
    ...typography.smallBold,
    color: darkTheme.textPrimary,
  },
  totalSavingsLabel: {
    ...typography.microBold,
    color: colors.amber[500],
  },
  totalSavingsValue: {
    ...typography.metricSm,
    color: colors.amber[500],
  },
  costLabel: {
    ...typography.microBold,
    marginBottom: 6,
    color: darkTheme.textMuted,
  },
  costValue: {
    ...typography.bodyBold,
    color: darkTheme.textPrimary,
  },
  scenarioTitle: {
    ...typography.smallBold,
    marginBottom: spacing.sm,
  },
  scenarioNote: {
    ...typography.caption,
    color: darkTheme.textMuted,
    marginBottom: spacing.md,
  },
  scenarioDiff: {
    ...typography.h4,
    fontWeight: 700 as const,
  },
} as const;

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
  return (
  <>
    {/* Tax Comparison */}
    {taxComparison && (
      <View style={{ marginBottom: spacing.xl }}>
        <Text style={styles.sectionLabel}>Tax Comparison</Text>
        <View style={{ flexDirection: 'row' }} wrap={false}>
          <View style={{ flex: 1, padding: spacing.lg, borderWidth: 1, borderColor: darkTheme.border, marginRight: spacing.lg }}>
            <Text style={{ ...styles.sectionLabel, marginBottom: spacing.md }}>{taxComparison.source_jurisdiction || sourceJurisdiction || 'Source'}</Text>
            <View style={compRow}><Text style={styles.compLabel}>Income Tax:</Text><Text style={styles.compValue}>{taxComparison.source_income_tax ?? 0}%</Text></View>
            <View style={compRow}><Text style={styles.compLabel}>Capital Gains:</Text><Text style={styles.compValue}>{taxComparison.source_cgt ?? 0}%</Text></View>
          </View>
          <View style={{ flex: 1, padding: spacing.lg, borderWidth: 2, borderColor: colors.amber[500], backgroundColor: colors.tints.goldLight }}>
            <Text style={{ ...styles.sectionLabel, marginBottom: spacing.md }}>{taxComparison.destination_jurisdiction || destinationJurisdiction || 'Destination'}</Text>
            <View style={compRow}><Text style={styles.compLabel}>Income Tax:</Text><Text style={[styles.compValue, { color: colors.amber[500] }]}>{taxComparison.destination_income_tax ?? 0}%</Text></View>
            <View style={compRow}><Text style={styles.compLabel}>Capital Gains:</Text><Text style={[styles.compValue, { color: colors.amber[500] }]}>{taxComparison.destination_cgt ?? 0}%</Text></View>
            <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.tints.goldStrong, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.totalSavingsLabel}>Total Savings</Text>
              <Text style={styles.totalSavingsValue}>+{taxComparison.total_savings_pct ?? 0}%</Text>
            </View>
          </View>
        </View>
      </View>
    )}

    {/* Estimated Costs */}
    {estimatedCosts && (
      <View>
        <Text style={styles.sectionLabel}>Estimated Costs</Text>
        <View style={{ flexDirection: 'row', marginBottom: spacing.xl }}>
          {estimatedCosts.visa_fee && (
            <View style={{ flex: 1, padding: spacing.md, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: spacing.md }}>
              <Text style={styles.costLabel}>Visa Fee</Text>
              <Text style={styles.costValue}>{estimatedCosts.visa_fee}</Text>
            </View>
          )}
          {estimatedCosts.emirates_id && (
            <View style={{ flex: 1, padding: spacing.md, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: spacing.md }}>
              <Text style={styles.costLabel}>Emirates ID</Text>
              <Text style={styles.costValue}>{estimatedCosts.emirates_id}</Text>
            </View>
          )}
          {estimatedCosts.medical_test && (
            <View style={{ flex: 1, padding: spacing.md, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', marginRight: spacing.md }}>
              <Text style={styles.costLabel}>Medical Test</Text>
              <Text style={styles.costValue}>{estimatedCosts.medical_test}</Text>
            </View>
          )}
          <View style={{ flex: 1, padding: spacing.md, backgroundColor: colors.tints.goldLight, borderWidth: 1.5, borderColor: colors.amber[500], alignItems: 'center' }}>
            <Text style={styles.costLabel}>Total Range</Text>
            <Text style={[styles.costValue, { color: colors.amber[500] }]}>{estimatedCosts.total_range || '—'}</Text>
          </View>
        </View>
      </View>
    )}

    {/* Dual Scenario Comparison */}
    {(scenarioStatus === 'ENDED' || scenarioStatus === 'ENDING') && withRegime && withoutRegime && (
      <View style={{ flexDirection: 'row', marginBottom: spacing.xl }}>
        <View style={{ flex: 1, padding: spacing.lg, borderWidth: 2, borderColor: colors.amber[500], backgroundColor: colors.tints.goldLight }}>
          <Text style={[styles.scenarioTitle, { color: colors.amber[500] }]}>With {regimeName}</Text>
          <Text style={styles.scenarioNote}>{withRegime.note || 'Preferred regime scenario.'}</Text>
          <View style={compRow}><Text style={styles.compLabel}>Income Tax:</Text><Text style={styles.compValue}>{withRegime.dest_income_tax ?? 0}%</Text></View>
          <View style={compRow}><Text style={styles.compLabel}>Capital Gains:</Text><Text style={styles.compValue}>{withRegime.dest_cgt ?? 0}%</Text></View>
          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
            <Text style={[styles.scenarioDiff, { color: colors.amber[500] }]}>+{withRegime.tax_differential ?? 0}%</Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: spacing.lg, borderWidth: 1, borderColor: darkTheme.border, marginLeft: spacing.lg }}>
          <Text style={[styles.scenarioTitle, { color: darkTheme.textSecondary }]}>Standard Rates (No Regime)</Text>
          <Text style={styles.scenarioNote}>{withoutRegime.note || 'Fallback to standard rates.'}</Text>
          <View style={compRow}><Text style={styles.compLabel}>Income Tax:</Text><Text style={styles.compValue}>{withoutRegime.dest_income_tax ?? 0}%</Text></View>
          <View style={compRow}><Text style={styles.compLabel}>Capital Gains:</Text><Text style={styles.compValue}>{withoutRegime.dest_cgt ?? 0}%</Text></View>
          <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
            <Text style={[styles.scenarioDiff, { color: (withoutRegime.tax_differential ?? 0) >= 0 ? colors.amber[500] : colors.red[700] }]}>
              {(withoutRegime.tax_differential ?? 0) >= 0 ? '+' : ''}{withoutRegime.tax_differential ?? 0}%
            </Text>
          </View>
        </View>
      </View>
    )}
  </>
  );
};
