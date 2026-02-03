/**
 * PDF REAL ASSET AUDIT SECTION
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Design Philosophy:
 * - Premium institutional aesthetic with refined elegance
 * - Clear hierarchy: Stamp Duty (critical) > Loopholes (actionable) > Trusts (planning)
 * - Color-coded severity indicators
 * - Source citations for compliance
 * - Strategic gold accents for premium feel
 */

import React from 'react';
import { View, Text, StyleSheet, Page } from '@react-pdf/renderer';
import { colors, formatCurrency } from '../pdf-styles';
import {
  RealAssetAuditData,
  JurisdictionAssetAudit,
} from '../pdf-types';

const styles = StyleSheet.create({
  // === PAGE LAYOUT ===
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    backgroundColor: colors.white,
    color: colors.gray[800],
  },

  section: {
    marginBottom: 40,
  },

  // === PREMIUM SECTION HEADER ===
  header: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerAccent: {
    width: 32,
    height: 4,
    backgroundColor: colors.amber[500],
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15,
    color: colors.gray[900],
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerBadge: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[300],
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.amber[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    marginTop: 8,
  },

  // === PREMIUM JURISDICTION HEADER ===
  jurisdictionSection: {
    marginBottom: 28,
  },
  jurisdictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.amber[500],
  },
  jurisdictionIcon: {
    width: 28,
    height: 28,
    backgroundColor: colors.amber[100],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jurisdictionIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.amber[700],
  },
  jurisdictionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },

  // === PREMIUM SUBSECTION TITLE ===
  subsectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },

  // === PREMIUM STAMP DUTY TABLE ===
  stampDutyTable: {
    width: '100%',
    marginBottom: 16,
    borderTopWidth: 3,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  stampDutyRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    alignItems: 'center',
  },
  stampDutyRowCritical: {
    backgroundColor: colors.red[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.red[500],
  },
  stampDutyRowLoophole: {
    backgroundColor: colors.emerald[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.emerald[500],
  },
  stampDutyLabel: {
    flex: 2,
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[700],
    lineHeight: 1.5,
  },
  stampDutyRate: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    textAlign: 'right',
  },
  stampDutyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
    borderWidth: 1,
  },
  badgeCritical: {
    backgroundColor: colors.red[100],
    borderColor: colors.red[300],
  },
  badgeLoophole: {
    backgroundColor: colors.emerald[100],
    borderColor: colors.emerald[300],
  },
  badgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stampDutyEffective: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[500],
    marginTop: 2,
  },

  // === PREMIUM LOOPHOLE CARDS ===
  loopholeCard: {
    marginBottom: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderLeftWidth: 4,
    borderLeftColor: colors.emerald[500],
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  loopholeCardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: colors.emerald[50],
    borderBottomLeftRadius: 60,
  },
  loopholeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    position: 'relative',
    zIndex: 1,
  },
  loopholeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  loopholeNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.emerald[500],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  loopholeNumberText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.white,
  },
  loopholeName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
    flex: 1,
    lineHeight: 1.3,
  },
  loopholeSavings: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.emerald[600],
  },
  loopholeDescription: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[600],
    lineHeight: 1.5,
    marginBottom: 10,
  },
  loopholeRequirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  requirementTag: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  requirementText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[600],
  },
  loopholeTimeline: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[500],
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },

  // === PREMIUM TRUST TABLE ===
  trustTable: {
    width: '100%',
    marginBottom: 16,
    borderTopWidth: 3,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  trustTableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[900],
  },
  trustTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  trustTableRowAlt: {
    backgroundColor: colors.gray[50],
  },
  trustHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trustCell: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[700],
  },
  trustCellBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[900],
  },

  // === PREMIUM RECOMMENDATION BOX ===
  recommendationBox: {
    marginTop: 14,
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[200],
    borderLeftWidth: 4,
    borderLeftColor: colors.amber[500],
    padding: 14,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    width: 16,
    height: 16,
    backgroundColor: colors.amber[200],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recommendationIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.amber[700],
  },
  recommendationLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.amber[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === PREMIUM FREEPORT SECTION ===
  freeportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  freeportCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderTopWidth: 3,
    borderTopColor: colors.gray[400],
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
    marginRight: 10,
    marginBottom: 10,
  },
  freeportName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
    marginBottom: 4,
  },
  freeportLocation: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[500],
  },

  // === SOURCE CITATION ===
  sourceCitation: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceIcon: {
    width: 4,
    height: 4,
    backgroundColor: colors.gray[400],
    borderRadius: 2,
    marginRight: 6,
  },
  sourceText: {
    fontFamily: 'Courier',
    fontSize: 7,
    color: colors.gray[500],
  },

  // === DATA COMPLETENESS ===
  dataCompleteness: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  dataCompletenessText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[400],
    marginRight: 8,
  },
  dataCompletenessBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dataCompletenessBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[600],
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
    fontSize: 7,
    color: colors.gray[400],
    letterSpacing: 0.5,
  },
});

interface PdfRealAssetAuditSectionProps {
  data: RealAssetAuditData;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  transactionValue?: number;
  intakeId: string;
}

// Page footer component
const PageFooter: React.FC<{ intakeId: string }> = ({ intakeId }) => (
  <View style={{
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  }} fixed>
    <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: colors.gray[400] }}>
      Ref: {intakeId.slice(10, 22).toUpperCase()}
    </Text>
    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 7, color: colors.gray[600], letterSpacing: 1, textTransform: 'uppercase' }}>
      HNWI Chronicles
    </Text>
    <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: colors.gray[400] }}>Confidential</Text>
  </View>
);

const getSeverityColor = (ratePct: number) => {
  if (ratePct >= 50) return colors.red[600];
  if (ratePct >= 20) return colors.amber[600];
  if (ratePct > 0) return colors.gray[700];
  return colors.emerald[600];
};

const getSeverityLabel = (ratePct: number) => {
  if (ratePct >= 50) return 'PROHIBITIVE';
  if (ratePct >= 20) return 'HIGH';
  if (ratePct > 0) return 'MODERATE';
  return 'LOOPHOLE';
};

export const PdfRealAssetAuditSection: React.FC<PdfRealAssetAuditSectionProps> = ({
  data,
  sourceJurisdiction,
  destinationJurisdiction,
  transactionValue = 0,
  intakeId,
}) => {
  // Filter out underscore-prefixed keys (internal/global data - not jurisdiction cards)
  // e.g., _global_succession_vehicles, _best_dynasty_trust_jurisdictions
  const jurisdictionKeys = Object.keys(data).filter(key => !key.startsWith('_'));

  // Helper to check if a jurisdiction has any meaningful content
  const hasJurisdictionContent = (auditData: JurisdictionAssetAudit): boolean => {
    if (!auditData) return false;
    // Check for stamp duty with found flag
    if (auditData.stamp_duty?.found) return true;
    // Check for loophole strategies
    if (Array.isArray(auditData.loophole_strategies) && auditData.loophole_strategies.length > 0) return true;
    // Check for dynasty trusts
    if (auditData.dynasty_trusts?.found && Array.isArray(auditData.dynasty_trusts.jurisdictions) && auditData.dynasty_trusts.jurisdictions.length > 0) return true;
    // Check for succession vehicles
    if (Array.isArray(auditData.succession_vehicles) && auditData.succession_vehicles.length > 0) return true;
    // Check for freeport options
    if (auditData.freeport_options?.found && Array.isArray(auditData.freeport_options.freeports) && auditData.freeport_options.freeports.length > 0) return true;
    return false;
  };

  // Filter to only jurisdictions with actual content
  const jurisdictionsWithContent = jurisdictionKeys.filter(key => hasJurisdictionContent(data[key]));

  if (!data || jurisdictionsWithContent.length === 0) {
    return null;
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
      {/* Premium Section Header */}
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Real Asset Audit Intelligence</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>KGv3 Verified</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Comprehensive analysis of stamp duty, tax strategies, and trust structures
        </Text>
      </View>

      {/* Content by Jurisdiction - Only render jurisdictions with actual content */}
      {jurisdictionsWithContent.map((jurisdiction) => {
        const auditData = data[jurisdiction];
        return (
        <View key={jurisdiction} style={styles.jurisdictionSection}>
          {/* Premium Jurisdiction Header */}
          <View style={styles.jurisdictionHeader}>
            <View style={styles.jurisdictionIcon}>
              <Text style={styles.jurisdictionIconText}>
                {jurisdiction.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.jurisdictionTitle}>{jurisdiction}</Text>
          </View>

          {/* Stamp Duty Section */}
          {auditData.stamp_duty?.found && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subsectionTitle}>Stamp Duty / Transfer Tax</Text>
              <View style={styles.stampDutyTable}>
                {/* Foreign Buyer Surcharge - Critical Warning */}
                {auditData.stamp_duty.foreign_buyer_surcharge && (
                  <View style={[styles.stampDutyRow, styles.stampDutyRowCritical]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.stampDutyLabel}>
                        Foreign Buyer Surcharge (ABSD)
                      </Text>
                      {!!auditData.stamp_duty.foreign_buyer_surcharge.effective_date && (
                        <Text style={styles.stampDutyEffective}>
                          Effective: {auditData.stamp_duty.foreign_buyer_surcharge.effective_date}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.stampDutyRate, { color: colors.red[600] }]}>
                        {auditData.stamp_duty.foreign_buyer_surcharge.rate_pct != null
                          ? `${auditData.stamp_duty.foreign_buyer_surcharge.rate_pct}%`
                          : 'N/A'}
                      </Text>
                      <View style={[styles.stampDutyBadge, styles.badgeCritical]}>
                        <Text style={[styles.badgeText, { color: colors.red[600] }]}>
                          {getSeverityLabel(auditData.stamp_duty.foreign_buyer_surcharge.rate_pct)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Commercial Rates - Potential Loophole */}
                {auditData.stamp_duty.commercial_rates && (
                  <View style={[
                    styles.stampDutyRow,
                    auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 && styles.stampDutyRowLoophole
                  ]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.stampDutyLabel}>
                        Commercial Property
                      </Text>
                      {!!auditData.stamp_duty.commercial_rates.note && (
                        <Text style={styles.stampDutyEffective}>
                          {auditData.stamp_duty.commercial_rates.note}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[
                        styles.stampDutyRate,
                        { color: auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0
                          ? colors.emerald[600]
                          : colors.gray[700] }
                      ]}>
                        {auditData.stamp_duty.commercial_rates.foreign_surcharge_pct != null
                          ? `${auditData.stamp_duty.commercial_rates.foreign_surcharge_pct}%`
                          : 'N/A'}
                      </Text>
                      {auditData.stamp_duty.commercial_rates.foreign_surcharge_pct === 0 && (
                        <View style={[styles.stampDutyBadge, styles.badgeLoophole]}>
                          <Text style={[styles.badgeText, { color: colors.emerald[600] }]}>
                            LOOPHOLE
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Residential Rate Tiers */}
                {Array.isArray(auditData.stamp_duty.residential_rates) && auditData.stamp_duty.residential_rates.slice(0, 3).map((tier, idx) => (
                  <View key={idx} style={styles.stampDutyRow}>
                    <Text style={[styles.stampDutyLabel, { flex: 2 }]}>
                      {tier.threshold || tier.description || `Tier ${idx + 1}`}
                    </Text>
                    <Text style={[styles.stampDutyRate, { color: colors.gray[700] }]}>
                      {tier.rate_pct != null ? `${tier.rate_pct}%` : 'N/A'}
                    </Text>
                  </View>
                ))}

                {/* Transaction Impact */}
                {transactionValue > 0 && auditData.stamp_duty.foreign_buyer_surcharge && (
                  <View style={[styles.stampDutyRow, { backgroundColor: colors.gray[100] }]}>
                    <Text style={[styles.stampDutyLabel, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>
                      Impact on {formatCurrency(transactionValue)} Transaction
                    </Text>
                    <Text style={[styles.stampDutyRate, { color: colors.red[600] }]}>
                      {formatCurrency(transactionValue * (auditData.stamp_duty.foreign_buyer_surcharge.rate_pct / 100))}
                    </Text>
                  </View>
                )}
              </View>

              {/* Source Citation */}
              {!!auditData.stamp_duty.statute_citation && (
                <View style={styles.sourceCitation}>
                  <View style={styles.sourceIcon} />
                  <Text style={styles.sourceText}>
                    Source: {auditData.stamp_duty.statute_citation}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Premium Loophole Strategies */}
          {Array.isArray(auditData.loophole_strategies) && auditData.loophole_strategies.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subsectionTitle}>Tax Strategies / Loopholes</Text>
              {auditData.loophole_strategies.slice(0, 4).map((strategy, idx) => (
                <View key={idx} style={styles.loopholeCard}>
                  <View style={styles.loopholeCardAccent} />
                  <View style={styles.loopholeHeader}>
                    <View style={styles.loopholeHeaderLeft}>
                      <View style={styles.loopholeNumber}>
                        <Text style={styles.loopholeNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.loopholeName}>{strategy.name}</Text>
                    </View>
                    <Text style={styles.loopholeSavings}>{strategy.tax_savings_potential}</Text>
                  </View>
                  {!!(strategy.mechanism || strategy.description) && (
                    <Text style={styles.loopholeDescription}>
                      {strategy.mechanism || strategy.description}
                    </Text>
                  )}
                  {Array.isArray(strategy.requirements) && strategy.requirements.length > 0 && (
                    <View style={styles.loopholeRequirements}>
                      {strategy.requirements.slice(0, 3).map((req, i) => (
                        <View key={i} style={styles.requirementTag}>
                          <Text style={styles.requirementText}>{req}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!!strategy.timeline && (
                    <Text style={styles.loopholeTimeline}>
                      Timeline: {strategy.timeline}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Dynasty Trust Options */}
          {auditData.dynasty_trusts?.found && Array.isArray(auditData.dynasty_trusts.jurisdictions) && auditData.dynasty_trusts.jurisdictions.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subsectionTitle}>Dynasty Trust Options</Text>
              <View style={styles.trustTable}>
                <View style={styles.trustTableHeader}>
                  <Text style={[styles.trustHeaderCell, { flex: 2 }]}>Structure</Text>
                  <Text style={[styles.trustHeaderCell, { flex: 1 }]}>Duration</Text>
                  <Text style={[styles.trustHeaderCell, { flex: 2 }]}>Protection</Text>
                </View>
                {auditData.dynasty_trusts.jurisdictions.slice(0, 4).map((trust, idx) => (
                  <View key={idx} style={[
                    styles.trustTableRow,
                    idx % 2 === 1 && styles.trustTableRowAlt
                  ]}>
                    <Text style={[styles.trustCellBold, { flex: 2 }]}>
                      {trust.name || trust.jurisdiction}
                    </Text>
                    <Text style={[styles.trustCell, { flex: 1 }]}>
                      {trust.perpetuity_period || trust.max_duration ||
                       (trust.perpetuity_years ? `${trust.perpetuity_years} yrs` : 'N/A')}
                    </Text>
                    <Text style={[styles.trustCell, { flex: 2 }]}>
                      {trust.asset_protection || trust.tax_benefits?.[0] || 'Standard'}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Premium Recommendation */}
              {!!(auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity) && (
                <View style={styles.recommendationBox}>
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationIcon}>
                      <Text style={styles.recommendationIconText}>!</Text>
                    </View>
                    <Text style={styles.recommendationLabel}>Recommended Structure</Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity}
                  </Text>
                  {!!auditData.dynasty_trusts.rationale && (
                    <Text style={[styles.recommendationText, { marginTop: 6, fontStyle: 'italic' }]}>
                      {auditData.dynasty_trusts.rationale}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Succession Vehicles */}
          {Array.isArray(auditData.succession_vehicles) && auditData.succession_vehicles.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subsectionTitle}>Succession Vehicles</Text>
              <View style={styles.trustTable}>
                <View style={styles.trustTableHeader}>
                  <Text style={[styles.trustHeaderCell, { flex: 1 }]}>Type</Text>
                  <Text style={[styles.trustHeaderCell, { flex: 2 }]}>Name</Text>
                  <Text style={[styles.trustHeaderCell, { flex: 2 }]}>Benefits</Text>
                </View>
                {auditData.succession_vehicles.slice(0, 4).map((vehicle, idx) => (
                  <View key={idx} style={[
                    styles.trustTableRow,
                    idx % 2 === 1 && styles.trustTableRowAlt
                  ]}>
                    <Text style={[styles.trustCell, { flex: 1, fontSize: 8, color: colors.gray[500] }]}>
                      {vehicle.vehicle_type || vehicle.type || 'Vehicle'}
                    </Text>
                    <Text style={[styles.trustCellBold, { flex: 2 }]}>
                      {vehicle.name}
                    </Text>
                    <Text style={[styles.trustCell, { flex: 2, fontSize: 8 }]}>
                      {(Array.isArray(vehicle.tax_benefits) ? vehicle.tax_benefits :
                        Array.isArray(vehicle.benefits) ? vehicle.benefits : []).slice(0, 2).join(', ') || 'N/A'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Freeport Options */}
          {auditData.freeport_options?.found && Array.isArray(auditData.freeport_options.freeports) && auditData.freeport_options.freeports.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.subsectionTitle}>Freeport Storage Options</Text>
              <View style={styles.freeportGrid}>
                {auditData.freeport_options.freeports.map((freeport, idx) => (
                  <View key={idx} style={styles.freeportCard}>
                    <Text style={styles.freeportName}>{freeport.name}</Text>
                    {!!(freeport.jurisdiction || freeport.location) && (
                      <Text style={styles.freeportLocation}>
                        {freeport.jurisdiction || freeport.location}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Data Completeness */}
          {auditData.data_completeness && (
            <View style={styles.dataCompleteness}>
              <Text style={styles.dataCompletenessText}>
                Sources: {auditData.data_completeness.total_sources || 0}
              </Text>
              {!!auditData.data_completeness.confidence && (
                <View style={styles.dataCompletenessBadge}>
                  <Text style={styles.dataCompletenessBadgeText}>
                    {auditData.data_completeness.confidence} Confidence
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        );
      })}

      {/* Premium Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDiamond} />
        <Text style={styles.footerText}>
          Powered by HNWI Chronicles KGv3 Real Asset Intelligence Engine
        </Text>
        <View style={styles.footerDiamond} />
      </View>
    </View>

      <PageFooter intakeId={intakeId} />
    </Page>
  );
};

export default PdfRealAssetAuditSection;
