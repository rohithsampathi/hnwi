/**
 * PDF Tax Regime Intelligence Section
 * Premium institutional visualization for special tax regime detection
 * NHR, 13O, Golden Visa regime status and impact analysis
 */

import React from 'react';
import { View, Text, StyleSheet, Page } from '@react-pdf/renderer';
import { colors, formatPercent } from '../pdf-styles';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    backgroundColor: colors.white,
    color: colors.gray[800],
  },

  section: {
    marginBottom: 32,
  },

  // === SECTION HEADER ===
  header: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[900],
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
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.gray[900],
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 8,
  },

  // === STATUS BADGE ===
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  statusBadgeActive: {
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  statusBadgeEnded: {
    borderColor: colors.gray[400],
    backgroundColor: colors.gray[100],
  },
  statusBadgeEnding: {
    borderColor: colors.amber[500],
    backgroundColor: colors.amber[50],
  },
  statusText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusTextActive: {
    color: colors.emerald[700],
  },
  statusTextEnded: {
    color: colors.gray[600],
  },
  statusTextEnding: {
    color: colors.amber[700],
  },

  // === REGIME HERO CARD ===
  heroCard: {
    backgroundColor: colors.gray[900],
    padding: 24,
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[400],
  },

  // === KEY BENEFITS GRID ===
  benefitsSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  benefitCheck: {
    width: 16,
    height: 16,
    backgroundColor: colors.emerald[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  benefitCheckText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.emerald[600],
  },
  benefitText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    flex: 1,
    lineHeight: 1.5,
  },

  // === QUALIFICATION ROUTES TABLE ===
  routesTable: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableCellHeader: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
  },
  tableCellBold: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
  },
  tableCellHighlight: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.emerald[600],
  },

  // === TAX COMPARISON ===
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonGrid: {
    flexDirection: 'row',
  },
  comparisonCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginRight: 16,
  },
  comparisonCardHighlight: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  comparisonTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[900],
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  comparisonLabel: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
  },
  comparisonValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
  },
  comparisonValueHighlight: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.emerald[600],
  },
  savingsBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.emerald[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.emerald[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.emerald[600],
  },

  // === CRITICAL CONSIDERATIONS ===
  considerationsSection: {
    marginBottom: 24,
  },
  considerationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
  },
  priorityHigh: {
    backgroundColor: colors.amber[100],
    borderWidth: 1,
    borderColor: colors.amber[300],
  },
  priorityMedium: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  priorityLow: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  priorityText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityTextHigh: {
    color: colors.amber[700],
  },
  priorityTextMedium: {
    color: colors.gray[600],
  },
  priorityTextLow: {
    color: colors.gray[500],
  },
  considerationContent: {
    flex: 1,
  },
  considerationTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[900],
    marginBottom: 4,
  },
  considerationDetail: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[600],
    lineHeight: 1.5,
  },

  // === APPLICATION PROCESS ===
  processSection: {
    marginBottom: 24,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: colors.amber[500],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.white,
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepAction: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    flex: 1,
  },
  stepTimeline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.amber[600],
  },

  // === ESTIMATED COSTS ===
  costsGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  costBox: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    marginRight: 12,
  },
  costBoxTotal: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.amber[50],
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    alignItems: 'center',
  },
  costLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  costValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
  },
  costValueTotal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.amber[700],
  },

  // === DUAL SCENARIO COMPARISON ===
  scenarioGrid: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  scenarioCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginRight: 16,
  },
  scenarioCardWithRegime: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  scenarioTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 8,
  },
  scenarioTitleWithRegime: {
    color: colors.emerald[700],
  },
  scenarioTitleWithout: {
    color: colors.gray[700],
  },
  scenarioNote: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    marginBottom: 12,
    lineHeight: 1.5,
  },
  scenarioMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scenarioMetricLabel: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
  },
  scenarioMetricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
  },
  scenarioDifferential: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  differentialPositive: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.emerald[600],
  },
  differentialNegative: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.red[600],
  },

  // === ACTION REQUIRED ===
  actionBox: {
    backgroundColor: colors.amber[50],
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
  },
  actionIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.amber[500],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.white,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.amber[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === FOOTER ===
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.amber[500],
    borderRadius: 3,
    marginHorizontal: 8,
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 8.5,
    color: colors.gray[400],
  },
});

// Interfaces matching the web UI
interface RegimeRates {
  foreign_income?: number;
  foreign_dividends?: number;
  capital_gains_foreign?: number;
}

interface CriticalDate {
  date: string;
  event: string;
}

interface DetectedRegime {
  regime_key: string;
  regime_name: string;
  jurisdiction: string;
  status: "ACTIVE" | "ENDED" | "ENDING";
  rates?: RegimeRates;
  warning?: string;
  successor_regime?: string;
  critical_dates?: CriticalDate[];
}

interface QualificationRoute {
  route: string;
  minimum_investment: string;
  processing_time: string;
}

interface TaxComparison {
  source_jurisdiction: string;
  source_income_tax: number;
  source_cgt: number;
  destination_jurisdiction: string;
  destination_income_tax: number;
  destination_cgt: number;
  total_savings_pct: number;
  note?: string;
}

interface CriticalConsideration {
  item: string;
  detail: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

interface ApplicationStep {
  step: number;
  action: string;
  timeline: string;
}

interface EstimatedCosts {
  visa_fee?: string;
  emirates_id?: string;
  medical_test?: string;
  total_range: string;
}

interface RegimeScenario {
  regime_name: string;
  status: string;
  end_date?: string;
  with_regime?: {
    dest_income_tax: number;
    dest_cgt: number;
    tax_differential: number;
    note: string;
  };
  without_regime?: {
    dest_income_tax: number;
    dest_cgt: number;
    tax_differential: number;
    note: string;
  };
  successor_regime?: string;
  action_required?: string;
  key_benefits?: string[];
  qualification_routes?: QualificationRoute[];
  tax_comparison?: TaxComparison;
  critical_considerations?: CriticalConsideration[];
  application_process?: ApplicationStep[];
  estimated_costs?: EstimatedCosts;
}

interface RegimeWarning {
  regime: string;
  status: string;
  warning: string;
  critical_dates?: CriticalDate[];
}

export interface RegimeIntelligence {
  has_special_regime: boolean;
  detected_regimes?: DetectedRegime[];
  regime_scenario?: RegimeScenario;
  regime_warnings?: RegimeWarning[];
}

interface PdfRegimeIntelligenceSectionProps {
  regimeIntelligence?: RegimeIntelligence;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  intakeId: string;
}

// Helper to get status badge styles
const getStatusStyles = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'active') {
    return {
      badge: styles.statusBadgeActive,
      text: styles.statusTextActive,
      label: 'ACTIVE'
    };
  } else if (statusLower === 'ended') {
    return {
      badge: styles.statusBadgeEnded,
      text: styles.statusTextEnded,
      label: 'ENDED'
    };
  } else {
    return {
      badge: styles.statusBadgeEnding,
      text: styles.statusTextEnding,
      label: 'ENDING SOON'
    };
  }
};

// Helper to get priority badge styles
const getPriorityStyles = (priority: string) => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower === 'high') {
    return {
      badge: styles.priorityHigh,
      text: styles.priorityTextHigh
    };
  } else if (priorityLower === 'medium') {
    return {
      badge: styles.priorityMedium,
      text: styles.priorityTextMedium
    };
  } else {
    return {
      badge: styles.priorityLow,
      text: styles.priorityTextLow
    };
  }
};

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
    <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: colors.gray[400] }}>
      Ref: {intakeId.slice(10, 22).toUpperCase()}
    </Text>
    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8.5, color: colors.gray[600], letterSpacing: 1, textTransform: 'uppercase' }}>
      HNWI Chronicles
    </Text>
    <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: colors.gray[400] }}>Confidential</Text>
  </View>
);

export function PdfRegimeIntelligenceSection({
  regimeIntelligence,
  sourceJurisdiction,
  destinationJurisdiction,
  intakeId
}: PdfRegimeIntelligenceSectionProps) {
  // Don't render if no special regime detected
  if (!regimeIntelligence?.has_special_regime) {
    return null;
  }

  const { detected_regimes, regime_scenario, regime_warnings } = regimeIntelligence;

  if (!regime_scenario) {
    return null;
  }

  const statusStyles = getStatusStyles(regime_scenario.status);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        {/* Section Header */}
        <View style={styles.header}>
          <View style={styles.headerAccent} />
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Tax Regime Intelligence</Text>
            <View style={[styles.statusBadge, statusStyles.badge]}>
              <Text style={[styles.statusText, statusStyles.text]}>{statusStyles.label}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Special regime detection and impact analysis for {destinationJurisdiction || 'destination'}
          </Text>
        </View>

        {/* Regime Hero Card */}
        <View style={styles.heroCard} wrap={false}>
          <Text style={styles.heroTitle}>{regime_scenario.regime_name}</Text>
          <Text style={styles.heroSubtitle}>
            {destinationJurisdiction || 'Destination'} Special Tax Program
          </Text>
        </View>

        {/* Key Benefits */}
        {regime_scenario.key_benefits && regime_scenario.key_benefits.length > 0 && (
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionLabel}>Key Benefits</Text>
            <View style={styles.benefitsGrid}>
              {regime_scenario.key_benefits.slice(0, 6).map((benefit, i) => (
                <View key={i} style={styles.benefitItem} wrap={false}>
                  <View style={styles.benefitCheck}>
                    <Text style={styles.benefitCheckText}>✓</Text>
                  </View>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Qualification Routes Table */}
        {regime_scenario.qualification_routes && regime_scenario.qualification_routes.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionLabel}>Qualification Routes</Text>
            <View style={styles.routesTable} wrap={false}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, { flex: 2 }]}>Route</Text>
                <Text style={styles.tableCellHeader}>Min. Investment</Text>
                <Text style={styles.tableCellHeader}>Processing</Text>
              </View>
              {regime_scenario.qualification_routes.map((route, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={[styles.tableCellBold, { flex: 2 }]}>{route.route}</Text>
                  <Text style={styles.tableCell}>{route.minimum_investment}</Text>
                  <Text style={styles.tableCellHighlight}>{route.processing_time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tax Comparison */}
        {regime_scenario.tax_comparison && (
          <View style={styles.comparisonSection}>
            <Text style={styles.sectionLabel}>Tax Comparison</Text>
            <View style={styles.comparisonGrid} wrap={false}>
              {/* Source */}
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonTitle}>
                  {regime_scenario.tax_comparison.source_jurisdiction || sourceJurisdiction || 'Source'}
                </Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Income Tax:</Text>
                  <Text style={styles.comparisonValue}>{regime_scenario.tax_comparison.source_income_tax}%</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Capital Gains:</Text>
                  <Text style={styles.comparisonValue}>{regime_scenario.tax_comparison.source_cgt}%</Text>
                </View>
              </View>

              {/* Destination */}
              <View style={styles.comparisonCardHighlight}>
                <Text style={styles.comparisonTitle}>
                  {regime_scenario.tax_comparison.destination_jurisdiction || destinationJurisdiction || 'Destination'}
                </Text>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Income Tax:</Text>
                  <Text style={styles.comparisonValueHighlight}>{regime_scenario.tax_comparison.destination_income_tax}%</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>Capital Gains:</Text>
                  <Text style={styles.comparisonValueHighlight}>{regime_scenario.tax_comparison.destination_cgt}%</Text>
                </View>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsLabel}>Total Savings</Text>
                  <Text style={styles.savingsValue}>+{regime_scenario.tax_comparison.total_savings_pct}%</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Critical Considerations */}
        {regime_scenario.critical_considerations && regime_scenario.critical_considerations.length > 0 && (
          <View style={styles.considerationsSection}>
            <Text style={styles.sectionLabel}>Critical Considerations</Text>
            {regime_scenario.critical_considerations.slice(0, 4).map((consideration, i) => {
              const priorityStyles = getPriorityStyles(consideration.priority);
              return (
                <View key={i} style={styles.considerationItem} wrap={false}>
                  <View style={[styles.priorityBadge, priorityStyles.badge]}>
                    <Text style={[styles.priorityText, priorityStyles.text]}>{consideration.priority}</Text>
                  </View>
                  <View style={styles.considerationContent}>
                    <Text style={styles.considerationTitle}>{consideration.item}</Text>
                    <Text style={styles.considerationDetail}>{consideration.detail}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Application Process */}
        {regime_scenario.application_process && regime_scenario.application_process.length > 0 && (
          <View style={styles.processSection}>
            <Text style={styles.sectionLabel}>Application Process</Text>
            {regime_scenario.application_process.slice(0, 5).map((step, i) => (
              <View key={i} style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepAction}>{step.action}</Text>
                  <Text style={styles.stepTimeline}>{step.timeline}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Estimated Costs */}
        {regime_scenario.estimated_costs && (
          <View>
            <Text style={styles.sectionLabel}>Estimated Costs</Text>
            <View style={styles.costsGrid}>
              {regime_scenario.estimated_costs.visa_fee && (
                <View style={styles.costBox}>
                  <Text style={styles.costLabel}>Visa Fee</Text>
                  <Text style={styles.costValue}>{regime_scenario.estimated_costs.visa_fee}</Text>
                </View>
              )}
              {regime_scenario.estimated_costs.emirates_id && (
                <View style={styles.costBox}>
                  <Text style={styles.costLabel}>Emirates ID</Text>
                  <Text style={styles.costValue}>{regime_scenario.estimated_costs.emirates_id}</Text>
                </View>
              )}
              {regime_scenario.estimated_costs.medical_test && (
                <View style={styles.costBox}>
                  <Text style={styles.costLabel}>Medical Test</Text>
                  <Text style={styles.costValue}>{regime_scenario.estimated_costs.medical_test}</Text>
                </View>
              )}
              <View style={styles.costBoxTotal}>
                <Text style={styles.costLabel}>Total Range</Text>
                <Text style={styles.costValueTotal}>{regime_scenario.estimated_costs.total_range}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Dual Scenario Comparison (for ENDED/ENDING regimes) */}
        {(regime_scenario.status === 'ENDED' || regime_scenario.status === 'ENDING') && regime_scenario.with_regime && regime_scenario.without_regime && (
          <View style={styles.scenarioGrid}>
            <View style={styles.scenarioCardWithRegime}>
              <Text style={[styles.scenarioTitle, styles.scenarioTitleWithRegime]}>
                With {regime_scenario.regime_name}
              </Text>
              <Text style={styles.scenarioNote}>{regime_scenario.with_regime.note}</Text>
              <View style={styles.scenarioMetric}>
                <Text style={styles.scenarioMetricLabel}>Income Tax:</Text>
                <Text style={styles.scenarioMetricValue}>{regime_scenario.with_regime.dest_income_tax}%</Text>
              </View>
              <View style={styles.scenarioMetric}>
                <Text style={styles.scenarioMetricLabel}>Capital Gains:</Text>
                <Text style={styles.scenarioMetricValue}>{regime_scenario.with_regime.dest_cgt}%</Text>
              </View>
              <View style={styles.scenarioDifferential}>
                <Text style={styles.differentialPositive}>+{regime_scenario.with_regime.tax_differential}%</Text>
              </View>
            </View>

            <View style={styles.scenarioCard}>
              <Text style={[styles.scenarioTitle, styles.scenarioTitleWithout]}>
                Standard Rates (No Regime)
              </Text>
              <Text style={styles.scenarioNote}>{regime_scenario.without_regime.note}</Text>
              <View style={styles.scenarioMetric}>
                <Text style={styles.scenarioMetricLabel}>Income Tax:</Text>
                <Text style={styles.scenarioMetricValue}>{regime_scenario.without_regime.dest_income_tax}%</Text>
              </View>
              <View style={styles.scenarioMetric}>
                <Text style={styles.scenarioMetricLabel}>Capital Gains:</Text>
                <Text style={styles.scenarioMetricValue}>{regime_scenario.without_regime.dest_cgt}%</Text>
              </View>
              <View style={styles.scenarioDifferential}>
                <Text style={regime_scenario.without_regime.tax_differential >= 0 ? styles.differentialPositive : styles.differentialNegative}>
                  {regime_scenario.without_regime.tax_differential >= 0 ? '+' : ''}{regime_scenario.without_regime.tax_differential}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Required */}
        {regime_scenario.action_required && (
          <View style={styles.actionBox}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>!</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Action Required</Text>
              <Text style={styles.actionText}>{regime_scenario.action_required}</Text>
            </View>
          </View>
        )}

        {/* Successor Regime */}
        {regime_scenario.successor_regime && (
          <View style={[styles.actionBox, { backgroundColor: colors.emerald[50], borderColor: colors.emerald[500] }]}>
            <View style={[styles.actionIcon, { backgroundColor: colors.emerald[500] }]}>
              <Text style={styles.actionIconText}>→</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.emerald[700] }]}>Successor Program</Text>
              <Text style={styles.actionText}>{regime_scenario.successor_regime}</Text>
            </View>
          </View>
        )}

        {/* Warnings */}
        {regime_warnings && regime_warnings.length > 0 && (
          <View style={{ marginTop: 16 }}>
            {regime_warnings.map((warning, i) => (
              <View key={i} style={[styles.actionBox, { backgroundColor: colors.red[50], borderColor: colors.red[500] }]}>
                <View style={[styles.actionIcon, { backgroundColor: colors.red[500] }]}>
                  <Text style={styles.actionIconText}>!</Text>
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.red[700] }]}>Warning</Text>
                  <Text style={styles.actionText}>{warning.warning}</Text>
                  {warning.critical_dates && warning.critical_dates.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      {warning.critical_dates.map((cd, j) => (
                        <Text key={j} style={{ fontSize: 9, color: colors.gray[600], marginBottom: 2 }}>
                          {cd.date}: {cd.event}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>
            Powered by HNWI Chronicles KG Tax Regime Intelligence + NHR / Golden Visa Database
          </Text>
        </View>
      </View>

      <PageFooter intakeId={intakeId} />
    </Page>
  );
}

export default PdfRegimeIntelligenceSection;
