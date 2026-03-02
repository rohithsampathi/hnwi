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
import { colors, formatCurrency, darkTheme } from '../pdf-styles';
import { RiskFactor, DueDiligenceItem } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  RiskHeatBar,
  GradientDivider,
} from './svg';

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
  const microLabel = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1 };
  const headerBadge = { backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 10, paddingVertical: 4 };
  const severityColor = (s: string) => s === 'critical' ? colors.red[400] : s === 'high' ? colors.amber[400] : darkTheme.textMuted;
  const severityBorderColor = (s: string) => s === 'critical' ? colors.red[500] : s === 'high' ? colors.amber[500] : darkTheme.textFaint;
  const severityBg = (s: string) => s === 'critical' ? 'rgba(239, 68, 68, 0.08)' : s === 'high' ? darkTheme.goldTint : undefined;
  const severityBadgeBg = (s: string) => s === 'critical' ? 'rgba(239, 68, 68, 0.12)' : s === 'high' ? 'rgba(212, 168, 67, 0.12)' : darkTheme.surfaceBg;

  const theme = getVerdictTheme(verdict);
  const criticalCount = riskFactors.filter(r => r.severity === 'critical').length;
  const highCount = riskFactors.filter(r => r.severity === 'high').length;
  const mediumCount = riskFactors.filter(r => r.severity === 'medium').length;
  const lowCount = riskFactors.filter(r => r.severity === 'low').length;

  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedRiskFactors = [...riskFactors].sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  if (sortedRiskFactors.length === 0 && dueDiligence.length === 0) return null;

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Header */}
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={getVerdictTheme('ABORT')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1, maxWidth: '70%' }}>Risk Factor Analysis</Text>
          <View style={headerBadge}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Commandment I</Text>
          </View>
        </View>
      </View>

      {/* Total Exposure Hero */}
      {totalExposureFormatted && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingVertical: 16, paddingHorizontal: 20, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 4, borderLeftColor: colors.red[500] }} wrap={false}>
          <View>
            <Text style={{ ...microLabel, marginBottom: 4 }}>Total Exposure at Risk</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: colors.red[400], letterSpacing: -0.5 }}>{totalExposureFormatted}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'Courier', fontSize: 9, color: darkTheme.textMuted }}>{sortedRiskFactors.length} Risk Factors Identified</Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {criticalCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.red[500], marginRight: 4 }} />
                  <Text style={{ fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: colors.red[400] }}>{criticalCount} Critical</Text>
                </View>
              )}
              {highCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                  <View style={{ width: 8, height: 8, backgroundColor: colors.amber[500], marginRight: 4 }} />
                  <Text style={{ fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: colors.amber[500] }}>{highCount} High</Text>
                </View>
              )}
              {mediumCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, backgroundColor: darkTheme.textFaint, marginRight: 4 }} />
                  <Text style={{ fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textMuted }}>{mediumCount} Medium</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* RiskHeatBar SVG */}
      {riskFactors.length > 0 && (
        <View style={{ marginBottom: 24, alignItems: 'center' }} wrap={false}>
          <Text style={{ ...microLabel, marginBottom: 8 }}>Risk Distribution</Text>
          <RiskHeatBar critical={criticalCount} high={highCount} medium={mediumCount} low={lowCount} width={400} height={18} />
        </View>
      )}

      {/* Risk Cards */}
      {sortedRiskFactors.slice(0, 6).map((risk, index) => (
        <View key={index} wrap={false} style={{
          backgroundColor: severityBg(risk.severity) || darkTheme.pageBg,
          borderWidth: 1, borderColor: darkTheme.border, marginBottom: 10, position: 'relative', overflow: 'hidden',
          borderLeftWidth: ['critical', 'high', 'medium'].includes(risk.severity) ? 4 : 1,
          borderLeftColor: ['critical', 'high', 'medium'].includes(risk.severity) ? severityBorderColor(risk.severity) : darkTheme.border,
        }}>
          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: darkTheme.surfaceBg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textMuted }}>{index + 1}</Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: severityColor(risk.severity), backgroundColor: severityBadgeBg(risk.severity) }}>
                  <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.5, color: severityColor(risk.severity) }}>{risk.severity.toUpperCase()}</Text>
                </View>
              </View>
              {!!(risk.cost_display || (risk.exposure_amount && risk.exposure_amount > 0)) && (
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textSecondary, maxWidth: 120, textAlign: 'right' }}>
                  {formatCostDisplay(risk.cost_display) || formatCurrency(risk.exposure_amount || 0)}
                </Text>
              )}
            </View>

            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 6, marginTop: 4, lineHeight: 1.4 }}>{risk.title}</Text>
            {!!risk.description && (
              <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted, lineHeight: 1.65 }}>{risk.description}</Text>
            )}

            {!!(risk.mitigation || risk.mitigation_timeline_days) && (
              <View style={{ marginTop: 10, backgroundColor: 'rgba(16, 185, 129, 0.08)', borderLeftWidth: 3, borderLeftColor: colors.emerald[500], padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ ...microLabel, letterSpacing: 0.5, marginRight: 8 }}>Mitigation Plan</Text>
                  {!!risk.mitigation_timeline_days && (
                    <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderWidth: 1, borderColor: colors.emerald[500], paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: colors.emerald[400] }}>{risk.mitigation_timeline_days} DAYS</Text>
                    </View>
                  )}
                  {!!risk.mitigation_action_type && (
                    <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', borderWidth: 1, borderColor: colors.blue[500], paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 }}>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: colors.blue[400], textTransform: 'uppercase' }}>{risk.mitigation_action_type}</Text>
                    </View>
                  )}
                </View>
                {!!risk.mitigation && (
                  <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 }}>{risk.mitigation}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Due Diligence Section */}
      {dueDiligence.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Due Diligence Requirements</Text>
            <Text style={{ fontFamily: 'Courier', fontSize: 9, color: darkTheme.textMuted }}>
              {dueDiligence.filter(d => d.priority === 'critical').length} Critical · {dueDiligence.filter(d => d.priority === 'high').length} High Priority
            </Text>
          </View>

          {dueDiligence.slice(0, 6).map((item, index) => {
            const isCritical = item.priority === 'critical';
            const timeline = isCritical ? '14 days' : item.priority === 'high' ? '30 days' : '60 days';
            return (
              <View key={index} wrap={false} style={{
                backgroundColor: isCritical ? darkTheme.goldTint : darkTheme.pageBg,
                borderWidth: 1, borderColor: darkTheme.border, marginBottom: 8, padding: 14,
                borderLeftWidth: isCritical ? 3 : 1,
                borderLeftColor: isCritical ? colors.amber[500] : darkTheme.border,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: isCritical ? 'rgba(212, 168, 67, 0.12)' : darkTheme.surfaceBg,
                      borderWidth: 1, borderColor: isCritical ? colors.amber[500] : darkTheme.border,
                      paddingHorizontal: 8, paddingVertical: 3, marginRight: 8,
                    }}>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.5, color: isCritical ? colors.amber[400] : darkTheme.textSecondary }}>
                        {item.category?.toUpperCase() || 'COMPLIANCE'}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: darkTheme.pageBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: darkTheme.textMuted }}>{item.timeline || timeline}</Text>
                    </View>
                  </View>
                  {!!item.responsible && (
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>{item.responsible}</Text>
                  )}
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 }}>{item.task}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint, letterSpacing: 0.5, marginHorizontal: 12 }}>
          Risk analysis powered by HNWI Chronicles KGv3 Intelligence Engine
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfRiskFactorsPage;
