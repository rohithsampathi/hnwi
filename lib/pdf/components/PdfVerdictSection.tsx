/**
 * WORLD-CLASS VERDICT SECTION - Investment Committee Decision
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Design Philosophy:
 * - Premium institutional aesthetic with refined elegance
 * - Clear decision hierarchy with immediate visual impact
 * - Professional dark/light contrast for authority
 * - Quantified metrics for data-driven decisions
 * - Risk factors with clear severity indicators
 * - Strategic gold accents for premium feel
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, formatCurrency } from '../pdf-styles';
import { RiskFactor, DueDiligenceItem } from '../pdf-types';

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },

  // === PREMIUM SECTION HEADER ===
  header: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerAccentBar: {
    width: 32,
    height: 4,
    backgroundColor: colors.amber[500],
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: colors.gray[900],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerBadge: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // === PREMIUM VERDICT BOX ===
  verdictContainer: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  verdictBox: {
    flex: 1,
    backgroundColor: colors.gray[950],
    position: 'relative',
    overflow: 'hidden',
    marginRight: 16,
  },
  verdictGoldAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.amber[500],
  },
  verdictCornerTL: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 20,
    height: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.gray[600],
  },
  verdictCornerBR: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 20,
    height: 20,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.gray[600],
  },
  verdictContent: {
    padding: 28,
    paddingTop: 32,
  },
  verdictBadge: {
    borderWidth: 1,
    borderColor: colors.gray[600],
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  verdictBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  verdictTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  verdictSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[400],
    lineHeight: 1.6,
    marginBottom: 24,
    maxWidth: 380,
  },
  verdictDivider: {
    height: 1,
    backgroundColor: colors.gray[800],
    marginBottom: 20,
  },
  verdictMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  verdictMetricItem: {
    minWidth: 80,
    marginRight: 20,
    marginBottom: 8,
  },
  verdictMetricLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  verdictMetricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.white,
  },

  // === PREMIUM DATA QUALITY SIDEBAR ===
  dataQualityBox: {
    width: 140,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataQualityLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  dataQualityValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  // Confidence bars visualization
  confidenceBarsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  confidenceBar: {
    width: 8,
    height: 24,
    borderRadius: 2,
    marginRight: 3,
  },
  confidenceBarActive: {
    backgroundColor: colors.amber[500],
  },
  confidenceBarInactive: {
    backgroundColor: colors.gray[200],
  },
  dataQualityNote: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    lineHeight: 1.4,
    textAlign: 'center',
  },

  // === PREMIUM EXPOSURE METRICS GRID ===
  exposureGrid: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.gray[900],
    marginBottom: 32,
  },
  exposureCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  exposureCardHighlight: {
    backgroundColor: colors.amber[50],
    borderBottomWidth: 3,
    borderBottomColor: colors.amber[500],
  },
  exposureLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  exposureValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: colors.gray[900],
    marginBottom: 4,
  },
  exposureSubtext: {
    fontFamily: 'Times-Roman',
    fontSize: 8.5,
    color: colors.gray[500],
  },

  // === PREMIUM RISK SECTION ===
  riskSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionStats: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: colors.gray[500],
  },

  // === PREMIUM RISK CARDS ===
  riskCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  riskCardCritical: {
    borderLeftWidth: 4,
    borderLeftColor: colors.red[500],
    backgroundColor: colors.red[50],
  },
  riskCardHigh: {
    borderLeftWidth: 4,
    borderLeftColor: colors.amber[500],
    backgroundColor: colors.amber[50],
  },
  riskCardMedium: {
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[400],
  },
  riskCardContent: {
    padding: 14,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  riskNumberText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[600],
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  riskBadgeCritical: {
    borderColor: colors.red[400],
    backgroundColor: colors.red[100],
  },
  riskBadgeHigh: {
    borderColor: colors.amber[400],
    backgroundColor: colors.amber[100],
  },
  riskBadgeMedium: {
    borderColor: colors.gray[400],
    backgroundColor: colors.gray[100],
  },
  riskBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  riskExposure: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[700],
    maxWidth: 120,
    textAlign: 'right',
  },
  riskTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
    marginBottom: 6,
    marginTop: 4,
    lineHeight: 1.4,
  },
  riskDescription: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[600],
    lineHeight: 1.65,
  },

  // === PREMIUM MITIGATION BOX ===
  mitigationBox: {
    marginTop: 10,
    backgroundColor: colors.emerald[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.emerald[500],
    padding: 12,
  },
  mitigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  mitigationLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  mitigationTimelineBadge: {
    backgroundColor: colors.emerald[100],
    borderWidth: 1,
    borderColor: colors.emerald[300],
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mitigationTimelineText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.emerald[700],
  },
  mitigationActionBadge: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mitigationActionText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.blue[700],
    textTransform: 'uppercase',
  },
  mitigationSourceText: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    color: colors.gray[400],
    marginLeft: 'auto',
  },
  mitigationText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === PREMIUM DUE DILIGENCE SECTION ===
  ddSection: {
    marginTop: 32,
  },
  ddCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 8,
    padding: 14,
    position: 'relative',
  },
  ddCardCritical: {
    borderLeftWidth: 3,
    borderLeftColor: colors.amber[500],
    backgroundColor: colors.amber[50],
  },
  ddHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ddHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ddCategoryBadge: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  ddCategoryBadgeCritical: {
    backgroundColor: colors.amber[100],
    borderColor: colors.amber[300],
  },
  ddCategoryText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ddCategoryTextCritical: {
    color: colors.amber[700],
  },
  ddTimelineBadge: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ddTimelineText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[600],
  },
  ddResponsible: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
  },
  ddTask: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === PREMIUM FOOTER ===
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.amber[500],
    transform: 'rotate(45deg)',
    marginHorizontal: 8,
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 8.5,
    color: colors.gray[400],
    letterSpacing: 0.5,
  },
});

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
  totalExposureFormatted?: string;  // Backend-provided formatted total exposure (e.g., "$4.75M")
  mitigationTimeline?: string;       // Backend-provided mitigation timeline (e.g., "14 days")
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

/**
 * Extract clean dollar amount from cost string for display
 * "60% of property value = $2,700,000" -> "$2.7M"
 * "$1.35M" -> "$1.35M"
 * "ABSD: $500,000" -> "$500K"
 */
const formatCostDisplay = (costStr: string | undefined): string => {
  if (!costStr || typeof costStr !== 'string') return '';

  // If it contains "=", extract the dollar part after
  if (costStr.includes('=')) {
    const afterEquals = costStr.split('=').pop()?.trim() || '';
    if (afterEquals.startsWith('$')) {
      return afterEquals.length > 12 ? formatCurrency(parseAmount(afterEquals)) : afterEquals;
    }
  }

  // If already short, return as-is
  if (costStr.length <= 12) return costStr;

  // Try to extract dollar amount
  const dollarMatch = costStr.match(/\$[\d,]+\.?\d*[MK]?/i);
  if (dollarMatch) {
    return dollarMatch[0].length > 12 ? formatCurrency(parseAmount(dollarMatch[0])) : dollarMatch[0];
  }

  // Fallback: truncate
  return costStr.substring(0, 12) + '...';
};

const parseAmount = (str: string): number => {
  if (!str) return 0;
  const clean = str.replace(/[$,]/g, '');
  if (clean.toUpperCase().endsWith('M')) return parseFloat(clean) * 1000000;
  if (clean.toUpperCase().endsWith('K')) return parseFloat(clean) * 1000;
  return parseFloat(clean) || 0;
};

export const PdfVerdictSection: React.FC<PdfVerdictSectionProps> = ({
  verdict = 'CONDITIONAL',
  verdictRationale,
  riskLevel = 'MODERATE',
  opportunityCount = 0,
  riskFactorCount = 0,
  dataQuality = 'Strong',
  precedentCount = 0,
  sourceJurisdiction,
  destinationJurisdiction,
  totalExposure = 0,
  totalExposureFormatted,
  mitigationTimeline,
  riskFactors = [],
  dueDiligence = [],
  viaNegativa,
}) => {
  const criticalCount = riskFactors.filter(r => r.severity === 'critical').length;
  const highCount = riskFactors.filter(r => r.severity === 'high').length;
  const mediumCount = riskFactors.filter(r => r.severity === 'medium').length;

  // Data quality to confidence bars (1-5)
  const confidenceBars = dataQuality === 'Strong' ? 5
    : dataQuality === 'Good' ? 4
    : dataQuality === 'Moderate' ? 3
    : 2;

  // Get verdict color for title
  const verdictColor = verdict.includes('APPROVED') && !verdict.includes('CONDITIONAL')
    ? colors.emerald[500]
    : verdict.includes('CONDITIONAL') || verdict.includes('REVIEW')
    ? colors.amber[500]
    : colors.gray[300];

  return (
    <View style={styles.section}>
      {/* Premium Section Header */}
      <View style={styles.header}>
        <View style={styles.headerAccentBar} />
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { flexShrink: 1, maxWidth: '70%' }]}>
            {viaNegativa?.isActive ? viaNegativa.verdictHeader : 'Investment Committee Decision'}
          </Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>SFO Pattern Audit</Text>
          </View>
        </View>
      </View>

      {/* Main Verdict + Data Quality */}
      <View style={styles.verdictContainer} wrap={false}>
        {/* Premium Verdict Box */}
        <View style={styles.verdictBox}>
          <View style={styles.verdictGoldAccent} />
          <View style={styles.verdictCornerTL} />
          <View style={styles.verdictCornerBR} />

          <View style={styles.verdictContent}>
            <View style={styles.verdictBadge}>
              <Text style={styles.verdictBadgeText}>
                {viaNegativa?.isActive ? viaNegativa.verdictBadgeLabel : 'Executive Summary'}
              </Text>
            </View>

            <Text style={[styles.verdictTitle, { color: viaNegativa?.isActive ? colors.red[500] : verdictColor }]}>{verdict}</Text>
            <Text style={styles.verdictSubtitle}>
              {verdictRationale || `Risk level assessed as ${riskLevel}. Proceed with structured monitoring and targeted due diligence as outlined in this assessment.`}
            </Text>

            <View style={styles.verdictDivider} />

            <View style={styles.verdictMetricsRow}>
              <View style={styles.verdictMetricItem}>
                <Text style={styles.verdictMetricLabel}>Risk Level</Text>
                <Text style={styles.verdictMetricValue}>{riskLevel}</Text>
              </View>
              <View style={styles.verdictMetricItem}>
                <Text style={styles.verdictMetricLabel}>Opportunities</Text>
                <Text style={styles.verdictMetricValue}>{opportunityCount}</Text>
              </View>
              <View style={styles.verdictMetricItem}>
                <Text style={styles.verdictMetricLabel}>Risk Factors</Text>
                <Text style={styles.verdictMetricValue}>{riskFactorCount}</Text>
              </View>
              <View style={styles.verdictMetricItem}>
                <Text style={styles.verdictMetricLabel}>Precedents</Text>
                <Text style={styles.verdictMetricValue}>{precedentCount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Data Quality Sidebar */}
        <View style={styles.dataQualityBox}>
          <Text style={styles.dataQualityLabel}>Data Quality</Text>
          <Text style={[styles.dataQualityValue, {
            color: dataQuality === 'Strong' ? colors.emerald[600]
              : dataQuality === 'Good' ? colors.amber[600]
              : colors.gray[600]
          }]}>{dataQuality}</Text>

          {/* Confidence Bars Visualization */}
          <View style={styles.confidenceBarsContainer}>
            {[1, 2, 3, 4, 5].map(i => (
              <View
                key={i}
                style={[
                  styles.confidenceBar,
                  i <= confidenceBars ? styles.confidenceBarActive : styles.confidenceBarInactive
                ]}
              />
            ))}
          </View>

          <Text style={styles.dataQualityNote}>
            Based on {precedentCount.toLocaleString()} KGv3 precedents analyzed
          </Text>
        </View>
      </View>

      {/* Via Negativa: PASS/FAIL Grid + DENIED Stamp */}
      {viaNegativa?.isActive && (
        <View style={{ marginBottom: 24 }}>
          {/* 3-column PASS/FAIL */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }} wrap={false}>
            {[
              { label: 'Tax Efficiency', passed: viaNegativa.taxEfficiencyPassed },
              { label: 'Liquidity', passed: viaNegativa.liquidityPassed },
              { label: 'Structure Viability', passed: viaNegativa.structurePassed },
            ].map((item, i) => (
              <View key={i} style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 8,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: item.passed ? colors.emerald[500] : colors.red[500],
                backgroundColor: item.passed ? colors.emerald[50] : colors.red[50],
                marginRight: i < 2 ? 8 : 0,
              }}>
                <Text style={{
                  fontFamily: 'Helvetica-Bold',
                  fontSize: 8.5,
                  color: colors.gray[500],
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}>{item.label}</Text>
                <Text style={{
                  fontFamily: 'Helvetica-Bold',
                  fontSize: 24,
                  color: item.passed ? colors.emerald[600] : colors.red[600],
                }}>{item.passed ? 'PASS' : 'FAIL'}</Text>
              </View>
            ))}
          </View>

          {/* CAPITAL ALLOCATION DENIED stamp */}
          <View style={{
            backgroundColor: colors.red[50],
            borderWidth: 2,
            borderColor: colors.red[500],
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
          }}>
            <Text style={{
              fontFamily: 'Helvetica-Bold',
              fontSize: 20,
              color: colors.red[600],
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}>{viaNegativa.stampText}</Text>
            <Text style={{
              fontFamily: 'Times-Roman',
              fontSize: 10,
              color: colors.red[400],
              marginTop: 6,
            }}>{viaNegativa.stampSubtext}</Text>
          </View>
        </View>
      )}

      {/* Premium Exposure Metrics Grid */}
      <View style={styles.exposureGrid} wrap={false}>
        <View style={[styles.exposureCard, styles.exposureCardHighlight]}>
          <Text style={styles.exposureLabel}>Total Exposure</Text>
          <Text style={styles.exposureValue}>{totalExposureFormatted || '—'}</Text>
          <Text style={styles.exposureSubtext}>Aggregate risk value at stake</Text>
        </View>
        <View style={styles.exposureCard}>
          <Text style={styles.exposureLabel}>Critical Items</Text>
          <Text style={[styles.exposureValue, criticalCount > 0 && { color: colors.red[600] }]}>
            {criticalCount}
          </Text>
          <Text style={styles.exposureSubtext}>Require immediate action</Text>
        </View>
        <View style={styles.exposureCard}>
          <Text style={styles.exposureLabel}>Mitigation Timeline</Text>
          <Text style={[styles.exposureValue, { color: colors.emerald[600] }]}>
            {mitigationTimeline || '—'}
          </Text>
          <Text style={styles.exposureSubtext}>Est. resolution window</Text>
        </View>
        <View style={[styles.exposureCard, { borderRightWidth: 0 }]}>
          <Text style={styles.exposureLabel}>High Priority</Text>
          <Text style={[styles.exposureValue, highCount > 0 && { color: colors.amber[600] }]}>
            {highCount}
          </Text>
          <Text style={styles.exposureSubtext}>Priority mitigation needed</Text>
        </View>
      </View>

      {/* Premium Risk Factors Section */}
      {riskFactors.length > 0 && (
        <View style={styles.riskSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Identified Risk Factors</Text>
            <Text style={styles.sectionStats}>
              {criticalCount}C · {highCount}H · {mediumCount}M | {totalExposureFormatted || '—'} Total
            </Text>
          </View>

          {riskFactors.slice(0, 5).map((risk, index) => (
            <View key={index} wrap={false} style={[
              styles.riskCard,
              risk.severity === 'critical' && styles.riskCardCritical,
              risk.severity === 'high' && styles.riskCardHigh,
              risk.severity === 'medium' && styles.riskCardMedium,
            ]}>
              <View style={styles.riskCardContent}>
                {/* Risk Header */}
                <View style={styles.riskHeader}>
                  <View style={styles.riskHeaderLeft}>
                    <View style={styles.riskNumber}>
                      <Text style={styles.riskNumberText}>{index + 1}</Text>
                    </View>
                    <View style={[
                      styles.riskBadge,
                      risk.severity === 'critical' && styles.riskBadgeCritical,
                      risk.severity === 'high' && styles.riskBadgeHigh,
                      risk.severity === 'medium' && styles.riskBadgeMedium,
                    ]}>
                      <Text style={[
                        styles.riskBadgeText,
                        { color: risk.severity === 'critical' ? colors.red[700] :
                                 risk.severity === 'high' ? colors.amber[700] : colors.gray[600] }
                      ]}>
                        {risk.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {!!(risk.cost_display || (risk.exposure_amount && risk.exposure_amount > 0)) && (
                    <Text style={styles.riskExposure}>
                      {formatCostDisplay(risk.cost_display) || formatCurrency(risk.exposure_amount || 0)}
                    </Text>
                  )}
                </View>

                {/* Risk Content */}
                <Text style={styles.riskTitle}>{risk.title}</Text>
                {!!risk.description && (
                  <Text style={styles.riskDescription}>{risk.description}</Text>
                )}

                {/* Premium Mitigation Box */}
                {!!(risk.mitigation || risk.mitigation_timeline_days) && (
                  <View style={styles.mitigationBox}>
                    <View style={styles.mitigationHeader}>
                      <Text style={styles.mitigationLabel}>Mitigation Plan</Text>

                      {!!risk.mitigation_timeline_days && (
                        <View style={styles.mitigationTimelineBadge}>
                          <Text style={styles.mitigationTimelineText}>
                            {risk.mitigation_timeline_days} DAYS
                          </Text>
                        </View>
                      )}

                      {!!risk.mitigation_action_type && (
                        <View style={styles.mitigationActionBadge}>
                          <Text style={styles.mitigationActionText}>
                            {risk.mitigation_action_type}
                          </Text>
                        </View>
                      )}

                      {!!risk.timeline_source && (
                        <Text style={styles.mitigationSourceText}>
                          Source: {risk.timeline_source}
                        </Text>
                      )}
                    </View>

                    {!!risk.mitigation && (
                      <Text style={styles.mitigationText}>{risk.mitigation}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Premium Due Diligence Section */}
      {dueDiligence.length > 0 && (
        <View style={styles.ddSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Due Diligence Requirements</Text>
            <Text style={styles.sectionStats}>
              {dueDiligence.filter(d => d.priority === 'critical').length} Critical · {dueDiligence.filter(d => d.priority === 'high').length} High Priority
            </Text>
          </View>

          {dueDiligence.slice(0, 6).map((item, index) => {
            const isCritical = item.priority === 'critical';
            const timeline = isCritical ? '14 days' : item.priority === 'high' ? '30 days' : '60 days';

            return (
              <View key={index} wrap={false} style={[
                styles.ddCard,
                isCritical && styles.ddCardCritical,
              ]}>
                <View style={styles.ddHeader}>
                  <View style={styles.ddHeaderLeft}>
                    <View style={[
                      styles.ddCategoryBadge,
                      isCritical && styles.ddCategoryBadgeCritical,
                    ]}>
                      <Text style={[
                        styles.ddCategoryText,
                        isCritical && styles.ddCategoryTextCritical,
                      ]}>
                        {item.category?.toUpperCase() || 'COMPLIANCE'}
                      </Text>
                    </View>
                    <View style={styles.ddTimelineBadge}>
                      <Text style={styles.ddTimelineText}>{item.timeline || timeline}</Text>
                    </View>
                  </View>
                  {!!item.responsible && (
                    <Text style={styles.ddResponsible}>{item.responsible}</Text>
                  )}
                </View>
                <Text style={styles.ddTask}>{item.task}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Premium Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDiamond} />
        <Text style={styles.footerText}>
          Assessment powered by HNWI Chronicles KGv3 Intelligence Engine
        </Text>
        <View style={styles.footerDiamond} />
      </View>
    </View>
  );
};

export default PdfVerdictSection;
