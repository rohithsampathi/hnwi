/**
 * STRESS TEST PAGE — Commandments V + VI
 * Crisis resilience + wealth projection combined
 *
 * Features:
 * - CircularGauge for Resilience Score
 * - 3-scenario table: Base/Stress/Opportunity
 * - SparklineChart for 10-year projections
 * - Scenario Detail Cards (base/stress/opportunity with growth rate + Year 10 value)
 * - Probability-Weighted Summary (expected net worth + value creation)
 * - Crisis Scenarios Grid (2x2 cards with risk_level badges)
 * - SFO Recommendations (priority badges + action + rationale)
 * - Worst-case: dollar loss + recovery timeline
 * - DonutChart for G1>G2>G3 wealth erosion
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, typography, spacing, pdfStyles, formatCurrency } from '../pdf-styles';
import { CrisisData, WealthProjectionData, HeirManagementData, ProjectionScenario } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  CircularGauge,
  SparklineChart,
  DonutChart,
  GradientDivider,
} from './svg';
import { PdfBadge } from './primitives/PdfBadge';

interface PdfStressTestPageProps {
  crisisData?: CrisisData;
  wealthProjection?: WealthProjectionData;
  heirManagement?: HeirManagementData;
  startingValue?: number;
  baseYear10?: number;
  stressYear10?: number;
  opportunityYear10?: number;
  baseProbability?: number;
  stressProbability?: number;
  opportunityProbability?: number;
  verdict?: string;
}

const parseDollarValue = (val: number | string | undefined): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/[$,]/g, '');
    if (clean.toUpperCase().endsWith('M')) return parseFloat(clean) * 1000000;
    if (clean.toUpperCase().endsWith('K')) return parseFloat(clean) * 1000;
    return parseFloat(clean) || 0;
  }
  return 0;
};

/** Map risk_level string to PdfBadge variant */
const riskLevelToVariant = (level?: string): 'critical' | 'high' | 'medium' | 'low' => {
  switch (level?.toUpperCase()) {
    case 'CRITICAL': return 'critical';
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    case 'LOW': return 'low';
    default: return 'medium';
  }
};

/** Map recommendation priority to PdfBadge variant */
const priorityToVariant = (priority?: string): 'critical' | 'high' | 'info' => {
  switch (priority?.toLowerCase()) {
    case 'immediate': return 'critical';
    case 'short_term': return 'high';
    case 'medium_term':
    case 'long_term':
    default: return 'info';
  }
};

/** Format priority label for display */
const priorityLabel = (priority?: string): string => {
  switch (priority?.toLowerCase()) {
    case 'immediate': return 'IMMEDIATE';
    case 'short_term': return 'SHORT-TERM';
    case 'medium_term': return 'MEDIUM-TERM';
    case 'long_term': return 'LONG-TERM';
    default: return priority?.toUpperCase() || 'ACTION';
  }
};

/** Resolve scenario data from wealthProjection.scenarios (handles Record or Array) */
const resolveScenarios = (
  scenarios?: WealthProjectionData['scenarios']
): { base?: ProjectionScenario; stress?: ProjectionScenario; opportunity?: ProjectionScenario } => {
  if (!scenarios) return {};
  if (Array.isArray(scenarios)) {
    return {
      base: scenarios.find((s) => s.name?.toLowerCase().includes('base')),
      stress: scenarios.find((s) => s.name?.toLowerCase().includes('stress')),
      opportunity: scenarios.find((s) => s.name?.toLowerCase().includes('opportun')),
    };
  }
  // Record-style: { base, stress, opportunity } or { base_case, stress_case, opportunity_case }
  const rec = scenarios as Record<string, ProjectionScenario | undefined>;
  return {
    base: rec.base || rec.base_case,
    stress: rec.stress || rec.stress_case,
    opportunity: rec.opportunity || rec.opportunity_case,
  };
};

// ─── Extracted styles ────────────────────────────────────────────────────────
const styles = {
  pageHeader: { marginBottom: spacing.lg, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border },
  headerRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, flexWrap: 'wrap' as const, marginTop: 10 },
  headerTitle: { ...typography.h2, fontSize: 15, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase' as const, flexShrink: 1, maxWidth: '70%' },
  headerBadge: { backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 10, paddingVertical: 4 },
  headerBadgeText: { ...typography.microBold, color: darkTheme.textMuted, letterSpacing: 1 },
  metricLabel: { ...typography.microBold, color: darkTheme.textMuted },
  metricValue: { ...typography.h4, fontWeight: 700 as const, color: darkTheme.textPrimary },
  tblCellHeader: { flex: 1, ...typography.microBold, color: darkTheme.textPrimary },
  tblCell: { flex: 1, ...typography.small, color: darkTheme.textSecondary },
  metricRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border },
  scenarioCard: { flex: 1, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12 },
  scenarioCardHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: spacing.sm },
  scenarioCardTitle: { ...typography.small, fontWeight: 700 as const, color: darkTheme.textPrimary },
  scenarioGrowthRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 4 },
  scenarioGrowthLabel: { ...typography.microBold, color: darkTheme.textMuted },
  scenarioGrowthValue: { ...typography.microBold, color: darkTheme.textSecondary },
  scenarioYear10Label: { ...typography.microBold, color: darkTheme.textMuted },
  sparklineCard: { marginBottom: spacing.lg, padding: spacing.md, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border },
  sparklineHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 12 },
  sparklineTitle: { ...typography.bodyBold, color: darkTheme.textPrimary },
  sparklineFooter: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginTop: spacing.sm },
  probBox: { marginBottom: spacing.lg, padding: spacing.md, backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: colors.amber[500], borderLeftWidth: 3 },
  probTitle: { ...typography.smallBold, color: colors.amber[500], textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 10 },
  probMetricLabel: { ...typography.microBold, color: darkTheme.textMuted, marginBottom: 4 },
  crisisCard: { width: '48%', backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 10, marginBottom: 0 },
  crisisCardHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 6 },
  crisisCardTitle: { ...typography.small, fontSize: 9.5, fontWeight: 700 as const, color: darkTheme.textPrimary, flexShrink: 1, maxWidth: '65%' },
  crisisImpactRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 4 },
  crisisVerdict: { ...typography.caption, color: darkTheme.textFaint, marginTop: 4, lineHeight: 1.3 },
  recRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, paddingVertical: 10 },
  recAction: { ...typography.small, fontSize: 9.5, fontWeight: 700 as const, color: darkTheme.textPrimary, lineHeight: 1.4 },
  recRationale: { ...typography.caption, color: darkTheme.textMuted, marginTop: 3, lineHeight: 1.3 },
  g3Title: { ...typography.bodyBold, color: darkTheme.textPrimary, marginBottom: spacing.md },
  g3ChartLabel: { ...typography.microBold, color: darkTheme.textMuted, letterSpacing: 1, marginTop: 6, textAlign: 'center' as const },
  footerRow: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: spacing.md, paddingTop: 12 },
};

export const PdfStressTestPage: React.FC<PdfStressTestPageProps> = ({
  crisisData,
  wealthProjection,
  heirManagement,
  startingValue = 0,
  baseYear10 = 0,
  stressYear10 = 0,
  opportunityYear10 = 0,
  baseProbability = 0.55,
  stressProbability = 0.25,
  opportunityProbability = 0.20,
  verdict,
}) => {
  const theme = getVerdictTheme(verdict);
  const resilienceScore = crisisData?.overall_resilience?.score || 0;
  const resilienceRating = crisisData?.overall_resilience?.rating || '—';
  const worstCaseLoss = parseDollarValue(crisisData?.key_metrics?.worst_case_loss || crisisData?.overall_resilience?.worst_case_loss);
  const recoveryTime = crisisData?.key_metrics?.recovery_time || crisisData?.overall_resilience?.recovery_time || '—';
  const bufferRequired = parseDollarValue(crisisData?.key_metrics?.required_buffer || crisisData?.overall_resilience?.buffer_required);
  const g3Risk = heirManagement?.third_generation_risk;
  const wealthTransfer = heirManagement?.wealth_transfer;
  // Use compound growth (CAGR) curve instead of linear for realistic wealth projection
  const sparklineData = startingValue > 0 && baseYear10 > 0
    ? (() => {
        const cagr = Math.pow(baseYear10 / startingValue, 1 / 10);
        return Array.from({ length: 11 }, (_, i) => startingValue * Math.pow(cagr, i));
      })()
    : [];
  const resilienceColor = resilienceScore >= 60 ? colors.amber[500] : resilienceScore >= 40 ? colors.amber[500] : colors.red[700];
  const resilienceTheme = getVerdictTheme(resilienceScore >= 60 ? 'PROCEED' : resilienceScore >= 40 ? 'RESTRUCTURE' : 'ABORT');
  const hasAnyCrisisData = crisisData && (resilienceScore > 0 || crisisData.scenarios?.length);
  const hasScenarios = startingValue > 0 || baseYear10 > 0;
  const hasG3Data = g3Risk || wealthTransfer;

  // Resolved scenario details from wealthProjection
  const resolvedScenarios = resolveScenarios(wealthProjection?.scenarios);
  const hasScenarioDetails = resolvedScenarios.base || resolvedScenarios.stress || resolvedScenarios.opportunity;

  // Probability-weighted expected value
  const expectedNetWorth = (baseProbability * baseYear10) + (stressProbability * stressYear10) + (opportunityProbability * opportunityYear10);
  const valueCreation = expectedNetWorth - startingValue;
  const hasProbabilityData = hasScenarios && startingValue > 0 && expectedNetWorth > 0;

  // Crisis scenarios & recommendations
  const crisisScenarios = crisisData?.scenarios || [];
  const hasCrisisScenarios = crisisScenarios.length > 0;
  const crisisRecommendations = crisisData?.recommendations || [];
  const hasCrisisRecommendations = crisisRecommendations.length > 0;

  if (!hasAnyCrisisData && !hasScenarios && !hasG3Data) return null;

  return (
    <View style={pdfStyles.section}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <GradientAccentBar width={483} height={4} theme={theme} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Stress Test & Succession Analysis</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>STRESS ANALYSIS</Text>
          </View>
        </View>
      </View>

      {/* Resilience Score + Key Metrics */}
      {hasAnyCrisisData && (
        <View style={{ flexDirection: 'row', marginBottom: spacing.xl, alignItems: 'center' }} wrap={false}>
          <View style={{ width: 120, alignItems: 'center', marginRight: spacing.lg }}>
            <CircularGauge score={resilienceScore} size={100} strokeWidth={8} theme={resilienceTheme} label="RESILIENCE" />
            <Text style={[styles.metricLabel, { color: resilienceColor, letterSpacing: 1, marginTop: 6 }]}>{resilienceRating}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Worst-Case Loss</Text>
              <Text style={[styles.metricValue, { color: colors.red[700] }]}>{worstCaseLoss > 0 ? `-${formatCurrency(worstCaseLoss)}` : '—'}</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Recovery Timeline</Text>
              <Text style={styles.metricValue}>{recoveryTime}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
              <Text style={styles.metricLabel}>Required Buffer</Text>
              <Text style={[styles.metricValue, { color: colors.amber[500] }]}>{bufferRequired > 0 ? formatCurrency(bufferRequired) : '—'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 3-Scenario Table */}
      {hasScenarios && (
        <View style={{ width: '100%', marginBottom: spacing.xl, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary }}>
            <Text style={[styles.tblCellHeader, { flex: 2 }]}>Scenario</Text>
            <Text style={styles.tblCellHeader}>Probability</Text>
            <Text style={[styles.tblCellHeader, { textAlign: 'right' }]}>Year 10 Value</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={[styles.tblCell, { flex: 2, ...typography.smallBold }]}>Base Case</Text>
            <Text style={styles.tblCell}>{Math.round(baseProbability * 100)}%</Text>
            <Text style={[styles.tblCell, { textAlign: 'right', fontFamily: 'Courier-Bold' }]}>{formatCurrency(baseYear10)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.cardBg }}>
            <Text style={[styles.tblCell, { flex: 2, ...typography.smallBold }]}>Stress Case</Text>
            <Text style={styles.tblCell}>{Math.round(stressProbability * 100)}%</Text>
            <Text style={[styles.tblCell, { textAlign: 'right', fontFamily: 'Courier-Bold', color: colors.red[700] }]}>{formatCurrency(stressYear10)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={[styles.tblCell, { flex: 2, ...typography.smallBold }]}>Opportunity Case</Text>
            <Text style={styles.tblCell}>{Math.round(opportunityProbability * 100)}%</Text>
            <Text style={[styles.tblCell, { textAlign: 'right', fontFamily: 'Courier-Bold', color: colors.amber[500] }]}>{formatCurrency(opportunityYear10)}</Text>
          </View>
        </View>
      )}

      {/* SparklineChart — 10-Year Projection */}
      {sparklineData.length > 0 && (
        <View style={styles.sparklineCard} wrap={false}>
          <View style={styles.sparklineHeader}>
            <Text style={styles.sparklineTitle}>10-Year Wealth Trajectory (Base Case)</Text>
            {baseYear10 > startingValue && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.metricLabel, { marginRight: spacing.sm }]}>Value Created</Text>
                <Text style={{ ...typography.metricSm, color: colors.amber[500] }}>+{formatCurrency(baseYear10 - startingValue)}</Text>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'center' }}>
            <SparklineChart data={sparklineData} width={420} height={80} theme={theme} showDots={false} />
          </View>
          <View style={styles.sparklineFooter}>
            <Text style={{ ...typography.mono, color: darkTheme.textFaint }}>Today: {formatCurrency(startingValue)}</Text>
            <Text style={{ ...typography.mono, color: darkTheme.textFaint }}>Year 5: {formatCurrency(sparklineData[5] || startingValue)}</Text>
            <Text style={{ fontFamily: 'Courier-Bold', fontSize: 9, color: colors.amber[500] }}>Year 10: {formatCurrency(baseYear10)}</Text>
          </View>
        </View>
      )}

      {/* ═══ Section 1: Scenario Detail Cards ═══ */}
      {hasScenarioDetails && (
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={pdfStyles.sectionTitle}>Scenario Analysis — Detailed Breakdown</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Base Case Card */}
            {resolvedScenarios.base && (
              <View style={styles.scenarioCard} wrap={false}>
                <View style={styles.scenarioCardHeader}>
                  <Text style={styles.scenarioCardTitle}>{resolvedScenarios.base.name || 'Base Case'}</Text>
                  <PdfBadge label={`${Math.round((resolvedScenarios.base.probability || baseProbability) * 100)}%`} variant="gold" />
                </View>
                {resolvedScenarios.base.growth_rate && (
                  <View style={styles.scenarioGrowthRow}>
                    <Text style={styles.scenarioGrowthLabel}>Growth Rate</Text>
                    <Text style={styles.scenarioGrowthValue}>{resolvedScenarios.base.growth_rate}</Text>
                  </View>
                )}
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.scenarioYear10Label}>Year 10 Value</Text>
                  <Text style={{ ...typography.metricMd, color: colors.amber[500], marginTop: 2 }}>
                    {formatCurrency(resolvedScenarios.base.year_10_value || resolvedScenarios.base.ten_year_outcome?.final_value || baseYear10)}
                  </Text>
                </View>
              </View>
            )}
            {/* Stress Case Card */}
            {resolvedScenarios.stress && (
              <View style={styles.scenarioCard} wrap={false}>
                <View style={styles.scenarioCardHeader}>
                  <Text style={styles.scenarioCardTitle}>{resolvedScenarios.stress.name || 'Stress Case'}</Text>
                  <PdfBadge label={`${Math.round((resolvedScenarios.stress.probability || stressProbability) * 100)}%`} variant="critical" />
                </View>
                {resolvedScenarios.stress.growth_rate && (
                  <View style={styles.scenarioGrowthRow}>
                    <Text style={styles.scenarioGrowthLabel}>Growth Rate</Text>
                    <Text style={styles.scenarioGrowthValue}>{resolvedScenarios.stress.growth_rate}</Text>
                  </View>
                )}
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.scenarioYear10Label}>Year 10 Value</Text>
                  <Text style={{ ...typography.metricMd, color: colors.red[700], marginTop: 2 }}>
                    {formatCurrency(resolvedScenarios.stress.year_10_value || resolvedScenarios.stress.ten_year_outcome?.final_value || stressYear10)}
                  </Text>
                </View>
              </View>
            )}
            {/* Opportunity Case Card */}
            {resolvedScenarios.opportunity && (
              <View style={styles.scenarioCard} wrap={false}>
                <View style={styles.scenarioCardHeader}>
                  <Text style={styles.scenarioCardTitle}>{resolvedScenarios.opportunity.name || 'Opportunity Case'}</Text>
                  <PdfBadge label={`${Math.round((resolvedScenarios.opportunity.probability || opportunityProbability) * 100)}%`} variant="success" />
                </View>
                {resolvedScenarios.opportunity.growth_rate && (
                  <View style={styles.scenarioGrowthRow}>
                    <Text style={styles.scenarioGrowthLabel}>Growth Rate</Text>
                    <Text style={styles.scenarioGrowthValue}>{resolvedScenarios.opportunity.growth_rate}</Text>
                  </View>
                )}
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.scenarioYear10Label}>Year 10 Value</Text>
                  <Text style={{ ...typography.metricMd, color: colors.amber[500], marginTop: 2 }}>
                    {formatCurrency(resolvedScenarios.opportunity.year_10_value || resolvedScenarios.opportunity.ten_year_outcome?.final_value || opportunityYear10)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ═══ Section 2: Probability-Weighted Summary ═══ */}
      {hasProbabilityData && (
        <View style={styles.probBox} wrap={false}>
          <Text style={styles.probTitle}>Probability-Weighted Outcome</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.probMetricLabel}>Starting Value</Text>
              <Text style={{ fontFamily: 'Courier-Bold', ...typography.metricSm, color: darkTheme.textPrimary }}>{formatCurrency(startingValue)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: darkTheme.border, borderRightWidth: 1, borderRightColor: darkTheme.border }}>
              <Text style={styles.probMetricLabel}>Expected Net Worth</Text>
              <Text style={{ fontFamily: 'Courier-Bold', ...typography.metricSm, color: darkTheme.textPrimary }}>{formatCurrency(expectedNetWorth)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={styles.probMetricLabel}>Value Creation</Text>
              <Text style={{ fontFamily: 'Courier-Bold', ...typography.metricSm, color: valueCreation >= 0 ? colors.amber[500] : colors.red[700] }}>
                {valueCreation >= 0 ? '+' : ''}{formatCurrency(valueCreation)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ═══ Section 3: Crisis Scenarios Grid ═══ */}
      {hasCrisisScenarios && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={pdfStyles.sectionTitle}>Crisis Scenario Analysis</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {crisisScenarios.slice(0, 4).map((scenario, idx) => {
              const riskLevel = scenario.risk_level || scenario.severity?.toUpperCase() || 'MEDIUM';
              const badgeVariant = riskLevelToVariant(riskLevel);
              return (
                <View key={scenario.id || idx} style={styles.crisisCard} wrap={false}>
                  <View style={styles.crisisCardHeader}>
                    <Text style={styles.crisisCardTitle}>{scenario.name}</Text>
                    <PdfBadge label={riskLevel} variant={badgeVariant} />
                  </View>
                  {scenario.impact && (
                    <View style={styles.crisisImpactRow}>
                      <Text style={pdfStyles.caption}>Impact</Text>
                      <Text style={{ fontFamily: 'Courier-Bold', ...typography.caption, color: colors.red[700] }}>
                        {typeof scenario.impact === 'number' ? formatCurrency(scenario.impact) : scenario.impact}
                      </Text>
                    </View>
                  )}
                  {scenario.recovery && (
                    <View style={styles.crisisImpactRow}>
                      <Text style={pdfStyles.caption}>Recovery</Text>
                      <Text style={{ ...typography.caption, color: darkTheme.textSecondary }}>{scenario.recovery}</Text>
                    </View>
                  )}
                  {scenario.verdict && (
                    <Text style={styles.crisisVerdict}>{scenario.verdict}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ═══ Section 4: SFO Recommendations ═══ */}
      {hasCrisisRecommendations && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={pdfStyles.sectionTitle}>SFO Recommendations</Text>
          {crisisRecommendations.map((rec, idx) => (
            <View
              key={idx}
              style={[styles.recRow, {
                borderBottomWidth: idx < crisisRecommendations.length - 1 ? 1 : 0,
                borderBottomColor: darkTheme.border,
              }]}
              wrap={false}
            >
              <View style={{ width: 80, marginRight: 10, paddingTop: 1 }}>
                <PdfBadge label={priorityLabel(rec.priority)} variant={priorityToVariant(rec.priority)} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recAction}>{rec.action}</Text>
                {rec.rationale && (
                  <Text style={styles.recRationale}>{rec.rationale}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* G1 > G2 > G3 Wealth Erosion */}
      {hasG3Data && (
        <View style={{ marginTop: spacing.xl }}>
          <Text style={styles.g3Title}>Third-Generation Test — Hughes Framework</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }} wrap={false}>
            <View style={{ width: 130, alignItems: 'center', marginRight: spacing.lg }}>
              <DonutChart
                size={110}
                strokeWidth={14}
                segments={[
                  { value: wealthTransfer?.g1?.asset_value || 100, color: colors.amber[500], label: 'G1' },
                  { value: wealthTransfer?.g2?.net_to_generation || wealthTransfer?.g2?.asset_value || 60, color: colors.amber[500], label: 'G2' },
                  { value: wealthTransfer?.g3?.net_to_generation || wealthTransfer?.g3?.asset_value || 20, color: colors.red[700], label: 'G3' },
                ]}
              />
              <Text style={styles.g3ChartLabel}>{'Wealth Erosion'}{'\n'}{'G1 > G2 > G3'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Without Structure — Loss Rate</Text>
                <Text style={[styles.metricValue, { color: colors.red[700] }]}>{g3Risk?.current_probability_of_loss || g3Risk?.current || 70}%</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>With Structure — Loss Rate</Text>
                <Text style={[styles.metricValue, { color: colors.amber[500] }]}>{g3Risk?.with_structure_probability || g3Risk?.with_structure || 30}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                <Text style={styles.metricLabel}>Recommended Structure</Text>
                <Text style={[styles.metricValue, { color: darkTheme.textPrimary, fontSize: 10 }]}>{heirManagement?.recommended_structure || '—'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

    </View>
  );
};

export default PdfStressTestPage;
