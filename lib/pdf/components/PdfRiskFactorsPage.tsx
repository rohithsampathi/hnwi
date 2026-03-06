/**
 * RISK FACTORS PAGE — Commandment I (Truth)
 * Extracted from PdfVerdictSection -> dedicated page 4
 *
 * Features:
 * - RiskHeatBar SVG showing distribution of critical/high/medium
 * - Risk cards with severity coloring + exposure amounts + mitigation
 * - Due diligence checklist with timelines
 * - GradientAccentBar header
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, formatCurrency, darkTheme, typography, spacing } from '../pdf-styles';
import { RiskFactor, DueDiligenceItem } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  RiskHeatBar,
  GradientDivider,
} from './svg';

/* ─── Local Typography Compositions ──────────────────────────────────────── */
const styles = {
  /** Bold 9pt uppercase label — used for section micro-labels */
  microLabel: {
    ...typography.microBold,
    letterSpacing: 1,
    color: darkTheme.textMuted,
  },
  /** Page section title — h2 uppercase */
  sectionHeading: {
    ...typography.h2,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: darkTheme.textPrimary,
  },
  /** Large exposure metric (28pt) */
  exposureHero: {
    ...typography.metricLg,
    fontSize: 28,
    color: colors.red[700],
  },
  /** Mono reference text (9pt Courier) */
  monoRef: {
    ...typography.mono,
    color: darkTheme.textMuted,
  },
  /** Bold 9pt count badge — severity counters in header */
  countBadge: {
    ...typography.microBold,
    letterSpacing: 0,
    textTransform: undefined as unknown as undefined,
  },
  /** Card index number */
  cardIndex: {
    ...typography.microBold,
    letterSpacing: 0,
    textTransform: undefined as unknown as undefined,
    color: darkTheme.textMuted,
  },
  /** Severity badge text — microBold exact match */
  severityBadge: {
    ...typography.microBold,
  },
  /** Cost/exposure display — smallBold */
  costDisplay: {
    ...typography.smallBold,
    color: darkTheme.textSecondary,
  },
  /** Risk card title — smallBold with custom line-height */
  riskTitle: {
    ...typography.smallBold,
    color: darkTheme.textPrimary,
    lineHeight: 1.4,
  },
  /** Risk description body — small with relaxed line-height */
  riskDescription: {
    ...typography.small,
    color: darkTheme.textMuted,
    lineHeight: 1.65,
  },
  /** Mitigation timeline badge */
  mitigationBadge: {
    ...typography.microBold,
    letterSpacing: 0,
    textTransform: undefined as unknown as undefined,
  },
  /** Mitigation action type badge — microBold uppercase */
  actionTypeBadge: {
    ...typography.microBold,
    textTransform: 'uppercase' as const,
  },
  /** Mitigation body text — small */
  mitigationBody: {
    ...typography.small,
    color: darkTheme.textSecondary,
    lineHeight: 1.5,
  },
  /** Due diligence section header — h4 uppercase */
  ddSectionTitle: {
    ...typography.h4,
    fontWeight: 700 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: darkTheme.textPrimary,
  },
  /** DD category badge — microBold exact match */
  ddCategoryBadge: {
    ...typography.microBold,
  },
  /** DD timeline badge — microBold base, no uppercase */
  ddTimelineBadge: {
    ...typography.microBold,
    letterSpacing: 0,
    textTransform: undefined as unknown as undefined,
    color: darkTheme.textMuted,
  },
  /** DD responsible party — caption */
  ddResponsible: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
  /** DD task body — small */
  ddTaskBody: {
    ...typography.small,
    color: darkTheme.textSecondary,
    lineHeight: 1.5,
  },
  /** Footer caption — caption with letter-spacing */
  footerCaption: {
    ...typography.caption,
    color: darkTheme.textFaint,
    letterSpacing: 0.5,
  },
} as const;

interface PdfRiskFactorsPageProps {
  riskFactors: RiskFactor[];
  dueDiligence: DueDiligenceItem[];
  totalExposureFormatted?: string;
  verdict?: string;
}

const formatCostDisplay = (costStr: string | undefined): string => {
  if (!costStr || typeof costStr !== 'string') return '';
  if (costStr.includes('=')) {
    const afterEquals = costStr.split('=').pop()?.trim() || '';
    if (afterEquals.startsWith('$')) return afterEquals.length > 12 ? formatCurrency(parseAmount(afterEquals)) : afterEquals;
  }
  if (costStr.length <= 12) return costStr;
  const dollarMatch = costStr.match(/\$[\d,]+\.?\d*[MK]?/i);
  if (dollarMatch) return dollarMatch[0].length > 12 ? formatCurrency(parseAmount(dollarMatch[0])) : dollarMatch[0];
  return costStr.substring(0, 12) + '...';
};

const parseAmount = (str: string): number => {
  if (!str) return 0;
  const clean = str.replace(/[$,]/g, '');
  if (clean.toUpperCase().endsWith('M')) return parseFloat(clean) * 1000000;
  if (clean.toUpperCase().endsWith('K')) return parseFloat(clean) * 1000;
  return parseFloat(clean) || 0;
};

export const PdfRiskFactorsPage: React.FC<PdfRiskFactorsPageProps> = ({
  riskFactors, dueDiligence, totalExposureFormatted, verdict,
}) => {
  const headerBadge = { backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 10, paddingVertical: 4 };
  const severityColor = (s: string) => s === 'critical' ? colors.red[700] : s === 'high' ? colors.amber[600] : darkTheme.textMuted;
  const severityBorderColor = (s: string) => s === 'critical' ? colors.red[700] : s === 'high' ? colors.amber[600] : darkTheme.textFaint;
  const severityBg = (s: string) => s === 'critical' ? colors.tints.redDeepSubtle : s === 'high' ? darkTheme.goldTint : undefined;
  const severityBadgeBg = (s: string) => s === 'critical' ? colors.tints.redDeepLight : s === 'high' ? darkTheme.goldTint : darkTheme.surfaceBg;

  const theme = getVerdictTheme(verdict);
  const criticalCount = riskFactors.filter(r => r.severity === 'critical').length;
  const highCount = riskFactors.filter(r => r.severity === 'high').length;
  const mediumCount = riskFactors.filter(r => r.severity === 'medium').length;
  const lowCount = riskFactors.filter(r => r.severity === 'low').length;

  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedRiskFactors = [...riskFactors].sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  if (sortedRiskFactors.length === 0 && dueDiligence.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.xl }}>
      {/* Header */}
      <View style={{ marginBottom: spacing.lg, paddingBottom: spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={getVerdictTheme('ABORT')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ ...styles.sectionHeading, flexShrink: 1, maxWidth: '70%' }}>Risk Factor Analysis</Text>
          <View style={headerBadge}>
            <Text style={{ ...styles.microLabel, letterSpacing: 1 }}>RISK ANALYSIS</Text>
          </View>
        </View>
      </View>

      {/* Total Exposure Hero */}
      {totalExposureFormatted && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg, paddingVertical: 16, paddingHorizontal: spacing.lg, backgroundColor: colors.tints.redDeepSubtle, borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 4, borderLeftColor: colors.red[700] }} wrap={false}>
          <View>
            <Text style={{ ...styles.microLabel, marginBottom: spacing.xs }}>{/* Total Exposure at Risk */}Total Exposure at Risk</Text>
            <Text style={styles.exposureHero}>{totalExposureFormatted}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.monoRef}>{sortedRiskFactors.length} Risk Factors Identified</Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {criticalCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.red[700], marginRight: 4 }} />
                  <Text style={{ ...styles.countBadge, color: colors.red[700] }}>{criticalCount} Critical</Text>
                </View>
              )}
              {highCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.amber[600], marginRight: 4 }} />
                  <Text style={{ ...styles.countBadge, color: colors.amber[600] }}>{highCount} High</Text>
                </View>
              )}
              {mediumCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, backgroundColor: darkTheme.textFaint, marginRight: 4 }} />
                  <Text style={{ ...styles.countBadge, color: darkTheme.textMuted }}>{mediumCount} Medium</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* RiskHeatBar SVG */}
      {riskFactors.length > 0 && (
        <View style={{ marginBottom: 24, alignItems: 'center' }} wrap={false}>
          <Text style={{ ...styles.microLabel, marginBottom: spacing.sm }}>Risk Distribution</Text>
          <RiskHeatBar critical={criticalCount} high={highCount} medium={mediumCount} low={lowCount} width={400} height={18} />
        </View>
      )}

      {/* Risk Cards — show all identified risks */}
      {sortedRiskFactors.map((risk, index) => (
        <View key={index} wrap={false} style={{
          backgroundColor: severityBg(risk.severity) || darkTheme.pageBg,
          borderWidth: 1, borderColor: darkTheme.border, marginBottom: 6, position: 'relative', overflow: 'hidden',
          borderLeftWidth: ['critical', 'high', 'medium'].includes(risk.severity) ? 4 : 1,
          borderLeftColor: ['critical', 'high', 'medium'].includes(risk.severity) ? severityBorderColor(risk.severity) : darkTheme.border,
        }}>
          <View style={{ paddingVertical: 8, paddingHorizontal: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 18, height: 18, borderRadius: 0.01, backgroundColor: darkTheme.surfaceBg, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Text style={styles.cardIndex}>{index + 1}</Text>
                </View>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: severityColor(risk.severity), backgroundColor: severityBadgeBg(risk.severity) }}>
                  <Text style={{ ...styles.severityBadge, color: severityColor(risk.severity) }}>{risk.severity.toUpperCase()}</Text>
                </View>
              </View>
              {!!(risk.cost_display || (risk.exposure_amount && risk.exposure_amount > 0)) && (
                <Text style={{ ...styles.costDisplay, maxWidth: 120, textAlign: 'right' }}>
                  {formatCostDisplay(risk.cost_display) || formatCurrency(risk.exposure_amount || 0)}
                </Text>
              )}
            </View>

            <Text style={{ ...styles.riskTitle, marginBottom: 2, marginTop: 2 }}>{risk.title}</Text>

            {!!(risk.mitigation || risk.mitigation_timeline_days) && (
              <View style={{ marginTop: 6, backgroundColor: darkTheme.goldTint, borderLeftWidth: 3, borderLeftColor: colors.amber[600], paddingVertical: 4, paddingHorizontal: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ ...styles.microLabel, letterSpacing: 0.5, marginRight: spacing.sm }}>Mitigation</Text>
                  {!!risk.mitigation_timeline_days && (
                    <View style={{ backgroundColor: darkTheme.goldTint, borderWidth: 1, borderColor: colors.amber[600], paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ ...styles.mitigationBadge, color: colors.amber[600] }}>{risk.mitigation_timeline_days} DAYS</Text>
                    </View>
                  )}
                </View>
                {!!risk.mitigation && (
                  <Text style={{ ...styles.mitigationBody, fontSize: 9 }}>{risk.mitigation}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Due Diligence Section */}
      {dueDiligence.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
            <Text style={styles.ddSectionTitle}>Due Diligence Requirements</Text>
            <Text style={styles.monoRef}>
              {dueDiligence.filter(d => d.priority === 'critical').length} Critical · {dueDiligence.filter(d => d.priority === 'high').length} High Priority
            </Text>
          </View>

          {dueDiligence.slice(0, 6).map((item, index) => {
            const isCritical = item.priority === 'critical';
            const timeline = isCritical ? '14 days' : item.priority === 'high' ? '30 days' : '60 days';
            return (
              <View key={index} wrap={false} style={{
                backgroundColor: isCritical ? darkTheme.goldTint : darkTheme.pageBg,
                borderWidth: 1, borderColor: darkTheme.border, marginBottom: spacing.sm, padding: spacing.md,
                borderLeftWidth: isCritical ? 3 : 1,
                borderLeftColor: isCritical ? colors.amber[500] : darkTheme.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: isCritical ? colors.tints.goldMedium : darkTheme.surfaceBg,
                      borderWidth: 1, borderColor: isCritical ? colors.amber[500] : darkTheme.border,
                      paddingHorizontal: 8, paddingVertical: 3, marginRight: spacing.sm,
                    }}>
                      <Text style={{ ...styles.ddCategoryBadge, color: isCritical ? colors.amber[400] : darkTheme.textSecondary }}>
                        {item.category?.toUpperCase() || 'COMPLIANCE'}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: darkTheme.pageBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={styles.ddTimelineBadge}>{item.timeline || timeline}</Text>
                    </View>
                  </View>
                  {!!item.responsible && (
                    <Text style={styles.ddResponsible}>{item.responsible}</Text>
                  )}
                </View>
                <Text style={styles.ddTaskBody}>{item.task}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: spacing.sm + 4 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ ...styles.footerCaption, marginHorizontal: spacing.sm + 4 }}>
          Risk analysis powered by HNWI Chronicles KGv3 Intelligence Engine
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfRiskFactorsPage;
