/**
 * WORLD-CLASS VERDICT SECTION - Investment Committee Decision
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Rebuilt with SVG primitives for institutional-grade visuals:
 * - VerdictStamp SVG center-stage
 * - CircularGauge for overall assessment score
 * - 4-metric grid with verdict coloring
 * - ConfidenceMeter for data quality
 * - GradientAccentBar verdict-colored header
 * - Risk factors EXTRACTED to PdfRiskFactorsPage (page 4)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, formatCurrency, darkTheme, spacing } from '../pdf-styles';
import { RiskFactor, DueDiligenceItem } from '../pdf-types';
import { getVerdictTheme, VerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  VerdictStamp,
  CircularGauge,
  ConfidenceMeter,
  GradientDivider,
} from './svg';

interface PdfVerdictSectionProps {
  verdict?: string;
  verdictRationale?: string;
  riskLevel?: string;
  opportunityCount?: number;
  riskFactorCount?: number;
  dataQuality?: string;
  precedentCount?: number;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  totalExposure?: number;
  totalExposureFormatted?: string;
  mitigationTimeline?: string;
  criticalItems?: number;
  highPriority?: number;
  riskFactors?: RiskFactor[];
  dueDiligence?: DueDiligenceItem[];
  viaNegativa?: {
    isActive: boolean;
    taxEfficiencyPassed: boolean;
    liquidityPassed: boolean;
    structurePassed: boolean;
    dayOneLoss: number;
    dayOneLossAmount: number;
    verdictHeader: string;
    verdictBadgeLabel: string;
    stampText: string;
    stampSubtext: string;
  };
}

const computeScore = (riskLevel: string, criticalCount: number, highCount: number, dataQuality: string, precedentCount: number): number => {
  let score = 60;
  const rl = riskLevel.toUpperCase();
  if (rl.includes('LOW')) score += 20;
  else if (rl.includes('MODERATE') || rl.includes('MEDIUM')) score += 5;
  else if (rl.includes('HIGH')) score -= 15;
  else if (rl.includes('CRITICAL')) score -= 15;
  score -= Math.min(criticalCount * 5 + highCount * 3, 20);
  if (dataQuality === 'Strong') score += 10;
  else if (dataQuality === 'Good') score += 5;
  if (precedentCount > 1000) score += 10;
  else if (precedentCount > 500) score += 5;
  return Math.max(15, Math.min(100, score));
};

export const PdfVerdictSection: React.FC<PdfVerdictSectionProps> = ({
  verdict = 'CONDITIONAL', verdictRationale, riskLevel = 'MODERATE',
  opportunityCount = 0, riskFactorCount = 0, dataQuality = 'Strong',
  precedentCount = 0, totalExposureFormatted, mitigationTimeline,
  criticalItems, highPriority, riskFactors = [], viaNegativa,
}) => {
  const microLabel = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1 };
  const headerBadge = { backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 10, paddingVertical: 4 };

  const theme = getVerdictTheme(viaNegativa?.isActive ? 'ABORT' : verdict);
  const criticalCount = criticalItems ?? riskFactors.filter(r => r.severity === 'critical').length;
  const highCount = highPriority ?? riskFactors.filter(r => r.severity === 'high').length;
  const confidenceBars = dataQuality === 'Strong' ? 5 : dataQuality === 'Good' ? 4 : dataQuality === 'Moderate' ? 3 : 2;
  const assessmentScore = computeScore(riskLevel, criticalCount, highCount, dataQuality, precedentCount);

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Header */}
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={theme} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1, maxWidth: '70%' }}>
            {viaNegativa?.isActive ? viaNegativa.verdictHeader : 'Investment Committee Decision'}
          </Text>
          <View style={headerBadge}>
            <Text style={{ ...microLabel, letterSpacing: 1 }}>SFO Pattern Audit</Text>
          </View>
        </View>
      </View>

      {/* Verdict Hero */}
      <View style={{ backgroundColor: darkTheme.cardBg, padding: 24, marginBottom: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: theme.primary }} wrap={false}>
        <View style={{ width: 150, alignItems: 'center', justifyContent: 'center', marginRight: 24 }}>
          <VerdictStamp verdict={viaNegativa?.isActive ? 'VETOED' : verdict} score={assessmentScore} size={130} theme={theme} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...microLabel, letterSpacing: 1.5, color: darkTheme.textFaint, marginBottom: 6 }}>
            {viaNegativa?.isActive ? viaNegativa.verdictBadgeLabel : 'Executive Summary'}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, letterSpacing: -0.5, marginBottom: 8, color: theme.primary }}>
            {viaNegativa?.isActive ? 'VETOED' : verdict}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 11, color: darkTheme.textFaint, lineHeight: 1.65, maxWidth: 320 }}>
            {verdictRationale || `Risk level assessed as ${riskLevel}. Proceed with structured monitoring and targeted due diligence as outlined in this assessment.`}
          </Text>
        </View>
      </View>

      {/* CircularGauge + ConfidenceMeter Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingVertical: 16, paddingHorizontal: 20, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }} wrap={false}>
        <View style={{ marginRight: 24, alignItems: 'center' }}>
          <CircularGauge score={assessmentScore} size={80} strokeWidth={7} theme={theme} label="SCORE" />
          <Text style={{ ...microLabel, marginTop: 6 }}>Overall Assessment</Text>
        </View>
        <View style={{ width: 1, height: 60, backgroundColor: darkTheme.border, marginRight: 24 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ ...microLabel, marginBottom: 8 }}>Data Quality</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, marginBottom: 6, color: dataQuality === 'Strong' ? colors.amber[500] : dataQuality === 'Good' ? colors.amber[600] : darkTheme.textMuted }}>{dataQuality}</Text>
          <ConfidenceMeter level={confidenceBars} size={60} theme={theme} />
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, textAlign: 'center', marginTop: 6 }}>
            Based on {precedentCount.toLocaleString()} KGv3 precedents
          </Text>
        </View>
        <View style={{ width: 1, height: 60, backgroundColor: darkTheme.border, marginLeft: 24, marginRight: 24 }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ ...microLabel, marginBottom: 8 }}>Intelligence Depth</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, color: darkTheme.textPrimary, marginBottom: 6 }}>
            {precedentCount > 1000 ? 'DEEP' : precedentCount > 500 ? 'GOOD' : 'STANDARD'}
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, textAlign: 'center', marginTop: 6 }}>
            {precedentCount.toLocaleString()} precedents{'\n'}analyzed for this corridor
          </Text>
        </View>
      </View>

      {/* Via Negativa: PASS/FAIL Grid + DENIED Stamp */}
      {viaNegativa?.isActive && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }} wrap={false}>
            {[
              { label: 'Tax Efficiency', passed: viaNegativa.taxEfficiencyPassed },
              { label: 'Liquidity', passed: viaNegativa.liquidityPassed },
              { label: 'Structure Viability', passed: viaNegativa.structurePassed },
            ].map((item, i) => (
              <View key={i} style={{
                flex: 1, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', borderWidth: 2, marginRight: i < 2 ? 8 : 0,
                borderColor: item.passed ? colors.amber[500] : colors.red[700],
                backgroundColor: item.passed ? colors.tints.goldLight : colors.tints.redDeepSubtle,
              }}>
                <Text style={{ ...microLabel, letterSpacing: 0.5, marginBottom: 8 }}>{item.label}</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: item.passed ? colors.amber[500] : colors.red[700] }}>{item.passed ? 'PASS' : 'FAIL'}</Text>
              </View>
            ))}
          </View>
          <View style={{ paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', marginBottom: 24, backgroundColor: colors.tints.redDeepSubtle, borderWidth: 2, borderColor: colors.red[700] }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 20, letterSpacing: 3, textTransform: 'uppercase', color: colors.red[700] }}>{viaNegativa.stampText}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, marginTop: 6, color: colors.red[700] }}>{viaNegativa.stampSubtext}</Text>
          </View>
        </View>
      )}

      {/* 4-Metric Grid */}
      <View style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: darkTheme.textPrimary, marginBottom: 24 }} wrap={false}>
        {[
          { label: 'Total Exposure', value: totalExposureFormatted || '—', sub: 'Aggregate risk at stake', color: colors.red[700], border: theme.primary, bg: theme.tint },
          { label: 'Risk Factors', value: String(riskFactorCount), sub: `${criticalCount}C · ${highCount}H identified`, color: criticalCount > 0 ? colors.red[700] : darkTheme.textPrimary, border: criticalCount > 0 ? colors.red[700] : darkTheme.border },
          { label: 'Mitigation Window', value: mitigationTimeline || '—', sub: 'Est. resolution timeline', color: colors.amber[500], border: colors.amber[500] },
          { label: 'Opportunities', value: String(opportunityCount), sub: 'Identified in corridor', color: colors.amber[500], border: colors.amber[500], last: true },
        ].map((m, i) => (
          <View key={i} style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRightWidth: m.last ? 0 : 1, borderRightColor: darkTheme.border, borderBottomWidth: 3, borderBottomColor: m.border, backgroundColor: m.bg }}>
            <Text style={{ ...microLabel, letterSpacing: 0.5, marginBottom: 8 }}>{m.label}</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: m.value.length > 12 ? 10 : m.value.length > 6 ? 14 : 20, color: m.color, marginBottom: 4 }}>{m.value}</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>{m.sub}</Text>
          </View>
        ))}
      </View>

      {/* Key Finding Callout */}
      {verdictRationale && (
        <View style={{ marginBottom: 16, paddingVertical: 14, paddingHorizontal: 20, borderLeftWidth: 4, borderLeftColor: theme.primary, backgroundColor: theme.tint }} wrap={false}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: theme.dark, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Key Finding</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.65 }}>{verdictRationale}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint, letterSpacing: 0.5, marginHorizontal: 12 }}>
          Assessment powered by HNWI Chronicles KGv3 Intelligence Engine
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfVerdictSection;
