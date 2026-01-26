/**
 * WORLD-CLASS VERDICT SECTION - Investment Committee Decision
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Design Philosophy:
 * - Clear decision hierarchy with immediate visual impact
 * - Professional dark/light contrast for authority
 * - Quantified metrics for data-driven decisions
 * - Risk factors with clear severity indicators
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography, formatCurrency } from '../pdf-styles';
import { RiskFactor, DueDiligenceItem } from '../pdf-types';

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  // === SECTION HEADER - Clean ===
  header: {
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerAccent: {
    width: 24,
    height: 3,
    backgroundColor: colors.amber[500],
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
  },

  // === VERDICT BOX - Institutional ===
  verdictContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  verdictBox: {
    flex: 1,
    backgroundColor: colors.gray[950],
    padding: 24,
    position: 'relative',
  },
  verdictGoldAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.amber[500],
  },
  verdictBadge: {
    borderWidth: 1,
    borderColor: colors.gray[600],
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verdictBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[300],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  verdictTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  verdictSubtitle: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[400],
    lineHeight: 1.5,
    marginBottom: 20,
  },
  verdictDivider: {
    height: 1,
    backgroundColor: colors.gray[800],
    marginBottom: 16,
  },
  verdictMetricsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  verdictMetricItem: {},
  verdictMetricLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  verdictMetricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.white,
  },

  // === DATA QUALITY SIDEBAR - Simple ===
  dataQualityBox: {
    width: 120,
    borderLeftWidth: 2,
    borderLeftColor: colors.gray[200],
    paddingLeft: 16,
    justifyContent: 'center',
  },
  dataQualityLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dataQualityValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: colors.gray[900],
    marginBottom: 8,
  },
  dataQualityBar: {
    display: 'none', // Remove visual bar
  },
  dataQualityBarFill: {
    display: 'none',
  },
  dataQualityNote: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    lineHeight: 1.4,
  },

  // === EXPOSURE METRICS - Table style ===
  exposureGrid: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
    marginBottom: 24,
  },
  exposureCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
  },
  exposureCardHighlight: {
    borderBottomWidth: 2,
    borderBottomColor: colors.amber[500],
  },
  exposureIcon: {
    display: 'none', // Remove icons
  },
  exposureIconText: {
    display: 'none',
  },
  exposureLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  exposureValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: colors.gray[900],
    marginBottom: 2,
  },
  exposureSubtext: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: colors.gray[500],
  },

  // === RISK SECTION - Clean table ===
  riskSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
  },
  sectionStats: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: colors.gray[500],
  },

  // === RISK CARDS - Simplified ===
  riskCard: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  riskCardCritical: {
    borderLeftWidth: 3,
    borderLeftColor: colors.red[500],
    paddingLeft: 12,
  },
  riskCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: colors.amber[500],
    paddingLeft: 12,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskNumber: {
    display: 'none', // Remove numbered circles
  },
  riskNumberText: {
    display: 'none',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  riskBadgeCritical: {
    borderColor: colors.red[500],
  },
  riskBadgeHigh: {
    borderColor: colors.amber[500],
  },
  riskBadgeMedium: {
    borderColor: colors.gray[400],
  },
  riskBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  riskTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
    flex: 1,
  },
  riskDescription: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[600],
    lineHeight: 1.4,
    marginTop: 4,
  },

  // === DUE DILIGENCE - Table style ===
  ddSection: {
    marginTop: 24,
  },
  ddCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  ddHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ddHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ddBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.gray[400],
  },
  ddBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ddTimeline: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: colors.gray[600],
  },
  ddResponsible: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
  },
  ddTask: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[700],
    lineHeight: 1.4,
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
  riskFactors?: RiskFactor[];
  dueDiligence?: DueDiligenceItem[];
}

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
  riskFactors = [],
  dueDiligence = [],
}) => {
  const criticalCount = riskFactors.filter(r => r.severity === 'critical').length;
  const highCount = riskFactors.filter(r => r.severity === 'high').length;
  const mediumCount = riskFactors.filter(r => r.severity === 'medium').length;

  // Data quality percentage for visual bar
  const qualityPercent = dataQuality === 'Strong' ? 90 : dataQuality === 'Good' ? 75 : 60;

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <Text style={styles.headerTitle}>Investment Committee Decision</Text>
      </View>

      {/* Main verdict + data quality */}
      <View style={styles.verdictContainer}>
        {/* Verdict box */}
        <View style={styles.verdictBox}>
          <View style={styles.verdictGoldAccent} />

          <View style={styles.verdictBadge}>
            <Text style={styles.verdictBadgeText}>SFO Pattern Audit</Text>
          </View>

          <Text style={styles.verdictTitle}>{verdict}</Text>
          <Text style={styles.verdictSubtitle}>
            {verdictRationale || `Risk level assessed as ${riskLevel}. Proceed with structured monitoring and targeted due diligence as outlined below.`}
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
              <Text style={styles.verdictMetricValue}>{precedentCount}</Text>
            </View>
          </View>
        </View>

        {/* Data quality sidebar */}
        <View style={styles.dataQualityBox}>
          <Text style={styles.dataQualityLabel}>Data Quality</Text>
          <Text style={styles.dataQualityValue}>{dataQuality}</Text>
          <Text style={styles.dataQualityNote}>
            {precedentCount.toLocaleString()} KGv3 precedents analyzed
          </Text>
        </View>
      </View>

      {/* Exposure metrics */}
      <View style={styles.exposureGrid}>
        <View style={[styles.exposureCard, styles.exposureCardHighlight]}>
          <Text style={styles.exposureLabel}>Total Exposure</Text>
          <Text style={styles.exposureValue}>{formatCurrency(totalExposure)}</Text>
          <Text style={styles.exposureSubtext}>Aggregate risk value</Text>
        </View>
        <View style={styles.exposureCard}>
          <Text style={styles.exposureLabel}>Critical Items</Text>
          <Text style={[styles.exposureValue, criticalCount > 0 && { color: colors.red[600] }]}>
            {criticalCount}
          </Text>
          <Text style={styles.exposureSubtext}>Immediate action</Text>
        </View>
        <View style={[styles.exposureCard, { borderRightWidth: 0 }]}>
          <Text style={styles.exposureLabel}>High Priority</Text>
          <Text style={[styles.exposureValue, highCount > 0 && { color: colors.amber[600] }]}>
            {highCount}
          </Text>
          <Text style={styles.exposureSubtext}>Priority mitigation</Text>
        </View>
      </View>

      {/* Risk factors */}
      {riskFactors.length > 0 && (
        <View style={styles.riskSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Identified Risk Factors</Text>
            <Text style={styles.sectionStats}>
              {criticalCount}C · {highCount}H · {mediumCount}M | {formatCurrency(totalExposure)}
            </Text>
          </View>

          {riskFactors.slice(0, 5).map((risk, index) => (
            <View key={index} style={[
              styles.riskCard,
              risk.severity === 'critical' && styles.riskCardCritical,
              risk.severity === 'high' && styles.riskCardHigh,
            ]}>
              {/* Risk Header Row */}
              <View style={styles.riskHeader}>
                <View style={[
                  styles.riskBadge,
                  risk.severity === 'critical' && styles.riskBadgeCritical,
                  risk.severity === 'high' && styles.riskBadgeHigh,
                  risk.severity === 'medium' && styles.riskBadgeMedium,
                ]}>
                  <Text style={[
                    styles.riskBadgeText,
                    { color: risk.severity === 'critical' ? colors.red[600] :
                             risk.severity === 'high' ? colors.amber[600] : colors.gray[600] }
                  ]}>
                    {risk.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.riskTitle}>{risk.title}</Text>
                {/* Exposure amount if available */}
                {risk.exposure_amount && risk.exposure_amount > 0 && (
                  <Text style={{
                    fontFamily: 'Helvetica-Bold',
                    fontSize: 8,
                    color: colors.gray[700],
                    marginLeft: 'auto',
                  }}>
                    {formatCurrency(risk.exposure_amount)}
                  </Text>
                )}
              </View>

              {risk.description && (
                <Text style={styles.riskDescription}>{risk.description}</Text>
              )}

              {/* Mitigation Plan Box - KGv3 Enhanced */}
              {(risk.mitigation || risk.mitigation_timeline_days) && (
                <View style={{
                  marginTop: 8,
                  backgroundColor: colors.gray[50],
                  borderLeftWidth: 2,
                  borderLeftColor: colors.emerald[500],
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                }}>
                  {/* Mitigation Header with Timeline */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{
                      fontFamily: 'Helvetica-Bold',
                      fontSize: 7,
                      color: colors.gray[500],
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      MITIGATION PLAN
                    </Text>

                    {/* Timeline Badge - Prominent */}
                    {risk.mitigation_timeline_days && (
                      <View style={{
                        marginLeft: 8,
                        backgroundColor: colors.emerald[100],
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}>
                        <Text style={{
                          fontFamily: 'Helvetica-Bold',
                          fontSize: 8,
                          color: colors.emerald[700],
                        }}>
                          {risk.mitigation_timeline_days} DAYS
                        </Text>
                      </View>
                    )}

                    {/* Action Type Badge */}
                    {risk.mitigation_action_type && (
                      <View style={{
                        marginLeft: 6,
                        backgroundColor: colors.blue[50],
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}>
                        <Text style={{
                          fontFamily: 'Helvetica',
                          fontSize: 7,
                          color: colors.blue[700],
                          textTransform: 'uppercase',
                        }}>
                          {risk.mitigation_action_type}
                        </Text>
                      </View>
                    )}

                    {/* Timeline Source - Provenance */}
                    {risk.timeline_source && (
                      <Text style={{
                        marginLeft: 'auto',
                        fontFamily: 'Courier',
                        fontSize: 6,
                        color: colors.gray[400],
                      }}>
                        Source: {risk.timeline_source}
                      </Text>
                    )}
                  </View>

                  {/* Mitigation Action Text */}
                  {risk.mitigation && (
                    <Text style={{
                      fontFamily: 'Helvetica',
                      fontSize: 9,
                      color: colors.gray[700],
                      lineHeight: 1.4,
                    }}>
                      {risk.mitigation}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Due Diligence */}
      {dueDiligence.length > 0 && (
        <View style={styles.ddSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Due Diligence Requirements</Text>
            <Text style={styles.sectionStats}>
              {dueDiligence.filter(d => d.priority === 'critical').length} Critical · {dueDiligence.filter(d => d.priority === 'high').length} High Priority
            </Text>
          </View>

          {dueDiligence.slice(0, 6).map((item, index) => (
            <View key={index} style={styles.ddCard}>
              <View style={styles.ddHeader}>
                <View style={styles.ddHeaderLeft}>
                  <View style={styles.ddBadge}>
                    <Text style={styles.ddBadgeText}>{item.category?.toUpperCase() || 'COMPLIANCE'}</Text>
                  </View>
                  {item.timeline && (
                    <Text style={styles.ddTimeline}>{item.timeline}</Text>
                  )}
                </View>
                {item.responsible && (
                  <Text style={styles.ddResponsible}>{item.responsible}</Text>
                )}
              </View>
              <Text style={styles.ddTask}>{item.task}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PdfVerdictSection;
