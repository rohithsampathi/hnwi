/**
 * WORLD-CLASS TAX JURISDICTION ANALYSIS
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Design Philosophy:
 * - Premium institutional aesthetic with refined elegance
 * - Clear data hierarchy for rapid comprehension
 * - Professional table design with proper typography
 * - Impactful cumulative savings display
 * - Visual rate comparison bars
 * - Strategic gold accents for premium feel
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, cleanJurisdiction } from '../pdf-styles';
import { TaxRates } from '../pdf-types';

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },

  // === PREMIUM SECTION HEADER ===
  sectionHeader: {
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  accentLine: {
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
  sectionTitle: {
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

  // === PREMIUM CUMULATIVE IMPACT HERO ===
  impactHero: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 28,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  impactHeroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.emerald[500],
  },
  impactHeroLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  impactHeroValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  impactHeroValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 48,
    letterSpacing: -1,
    marginRight: 16,
  },
  impactHeroValuePositive: {
    color: colors.emerald[600],
  },
  impactHeroValueNegative: {
    color: colors.red[600],
  },
  impactHeroValueNeutral: {
    color: colors.gray[500],
  },
  impactHeroDetails: {
    alignItems: 'center',
  },
  impactHeroTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
    marginBottom: 4,
  },
  impactHeroCorridor: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[500],
  },

  // === CORRIDOR & SUMMARY ROW ===
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  summaryBox: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.gray[200],
    marginRight: 20,
    paddingLeft: 16,
  },
  summaryBoxHighlight: {
    borderLeftColor: colors.amber[500],
  },
  summaryLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: colors.gray[900],
    letterSpacing: -0.5,
  },
  summarySubtext: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    marginTop: 4,
  },
  corridorArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corridorJurisdiction: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: colors.gray[800],
    marginRight: 10,
  },
  corridorArrowIcon: {
    fontFamily: 'Helvetica',
    fontSize: 14,
    color: colors.amber[500],
    marginRight: 10,
  },

  // === PREMIUM TAX COMPARISON TABLE ===
  table: {
    width: '100%',
    marginBottom: 28,
    borderTopWidth: 3,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[700],
    paddingHorizontal: 8,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: colors.gray[900],
  },
  tableCellValue: {
    flex: 1,
    fontFamily: 'Courier-Bold',
    fontSize: 11,
    textAlign: 'center',
    color: colors.gray[800],
    paddingHorizontal: 8,
  },
  tableCellValueHigher: {
    color: colors.red[600],
  },
  tableCellValueLower: {
    color: colors.emerald[600],
  },
  tableCellImpact: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 8,
  },
  positiveImpact: {
    color: colors.emerald[600],
  },
  negativeImpact: {
    color: colors.red[600],
  },
  neutralImpact: {
    color: colors.gray[500],
  },

  // === PREMIUM STRUCTURE COMPARISON ===
  structureRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  structureCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderTopWidth: 3,
    borderTopColor: colors.gray[300],
    padding: 16,
    marginRight: 20,
  },
  structureCardOptimized: {
    borderTopColor: colors.amber[500],
    backgroundColor: colors.amber[50],
  },
  structureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  structureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[400],
    marginRight: 8,
  },
  structureDotOptimized: {
    backgroundColor: colors.amber[500],
  },
  structureTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  structureItem: {
    marginBottom: 12,
  },
  structureItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  structureLabel: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[600],
  },
  structureValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
  },
  structureValueOptimized: {
    color: colors.emerald[600],
  },
  // Visual rate bar
  rateBarContainer: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  rateBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rateBarFillCurrent: {
    backgroundColor: colors.red[400],
  },
  rateBarFillOptimized: {
    backgroundColor: colors.emerald[500],
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

interface PdfTaxAnalysisProps {
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  sourceTaxRates?: TaxRates;
  destinationTaxRates?: TaxRates;
  totalTaxBenefit?: string | number;
}

export const PdfTaxAnalysis: React.FC<PdfTaxAnalysisProps> = ({
  sourceJurisdiction,
  destinationJurisdiction,
  sourceTaxRates = {},
  destinationTaxRates = {},
  totalTaxBenefit,
}) => {
  const taxTypes = [
    { key: 'income_tax', altKey: null, label: 'Income Tax' },
    { key: 'capital_gains', altKey: 'cgt', label: 'Capital Gains' },  // API returns 'cgt' sometimes
    { key: 'estate_tax', altKey: null, label: 'Estate Tax' },
    { key: 'wealth_tax', altKey: null, label: 'Wealth Tax' },
  ];

  // Helper to get tax rate, checking both primary and alternative keys
  const getTaxRate = (rates: any, primaryKey: string, altKey: string | null): number | undefined => {
    const primary = rates?.[primaryKey];
    if (primary !== undefined && primary !== null) return primary;
    if (altKey) {
      const alt = rates?.[altKey];
      if (alt !== undefined && alt !== null) return alt;
    }
    return undefined;
  };

  const calculateImpact = (source: number | undefined, dest: number | undefined): { value: string; positive: boolean; neutral: boolean; diff: number } => {
    const s = source ?? 0;
    const d = dest ?? 0;
    const diff = s - d;
    if (diff === 0) return { value: '—', positive: false, neutral: true, diff: 0 };
    return {
      value: `${diff > 0 ? '+' : ''}${diff}%`,
      positive: diff > 0,
      neutral: false,
      diff,
    };
  };

  // Calculate cumulative tax differential (using helper to check both keys)
  let cumulativeDiff = 0;
  taxTypes.forEach(tax => {
    const sourceRate = getTaxRate(sourceTaxRates, tax.key, tax.altKey) ?? 0;
    const destRate = getTaxRate(destinationTaxRates, tax.key, tax.altKey) ?? 0;
    cumulativeDiff += (sourceRate - destRate);
  });

  // Parse total benefit or use calculated
  let benefitValue = cumulativeDiff;
  if (typeof totalTaxBenefit === 'string') {
    const match = totalTaxBenefit.match(/([+-]?\d+)/);
    if (match) benefitValue = parseInt(match[1]);
  } else if (typeof totalTaxBenefit === 'number') {
    benefitValue = totalTaxBenefit;
  }

  const sourceClean = cleanJurisdiction(sourceJurisdiction) || 'Current';
  const destClean = cleanJurisdiction(destinationJurisdiction) || 'Optimized';

  const isPositive = benefitValue > 0;
  const isNeutral = benefitValue === 0;

  return (
    <View style={styles.section}>
      {/* Premium Section Header */}
      <View style={styles.sectionHeader} minPresenceAhead={150}>
        <View style={styles.accentLine} />
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { flexShrink: 1, maxWidth: '70%' }]}>Tax Jurisdiction Analysis</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Comparative Assessment</Text>
          </View>
        </View>
      </View>

      {/* Premium Cumulative Impact Hero */}
      <View style={styles.impactHero} wrap={false}>
        <View style={[styles.impactHeroAccent, {
          backgroundColor: isPositive ? colors.emerald[500] : isNeutral ? colors.gray[400] : colors.red[500]
        }]} />
        <Text style={styles.impactHeroLabel}>Cumulative Tax Impact</Text>
        <View style={styles.impactHeroValueContainer}>
          <Text style={[
            styles.impactHeroValue,
            isPositive && styles.impactHeroValuePositive,
            !isPositive && !isNeutral && styles.impactHeroValueNegative,
            isNeutral && styles.impactHeroValueNeutral,
          ]}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
          <View style={styles.impactHeroDetails}>
            <Text style={styles.impactHeroTitle}>
              {isPositive ? 'Total Tax Savings' : isNeutral ? 'Tax Neutral' : 'Total Tax Cost'}
            </Text>
            <Text style={styles.impactHeroCorridor}>
              {sourceClean} → {destClean}
            </Text>
          </View>
        </View>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow} wrap={false}>
        <View style={[styles.summaryBox, styles.summaryBoxHighlight]}>
          <Text style={styles.summaryLabel}>Migration Corridor</Text>
          <View style={styles.corridorArrow}>
            <Text style={styles.corridorJurisdiction}>{sourceClean}</Text>
            <Text style={styles.corridorArrowIcon}>→</Text>
            <Text style={styles.corridorJurisdiction}>{destClean}</Text>
          </View>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Annual Efficiency Gain</Text>
          <Text style={[styles.summaryValue, { color: isPositive ? colors.emerald[600] : colors.gray[600] }]}>
            {isPositive ? '+' : ''}{benefitValue}%
          </Text>
          <Text style={styles.summarySubtext}>Estimated tax optimization</Text>
        </View>
      </View>

      {/* Premium Tax Comparison Table */}
      <View style={styles.table} wrap={false}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Tax Category</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{sourceClean}</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{destClean}</Text>
          <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Impact</Text>
        </View>

        {taxTypes.map((tax, index) => {
          const sourceRate = getTaxRate(sourceTaxRates, tax.key, tax.altKey);
          const destRate = getTaxRate(destinationTaxRates, tax.key, tax.altKey);
          const impact = calculateImpact(sourceRate, destRate);

          const sourceIsHigher = (sourceRate ?? 0) > (destRate ?? 0);
          const destIsHigher = (destRate ?? 0) > (sourceRate ?? 0);

          return (
            <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.tableCellBold]}>{tax.label}</Text>
              <Text style={[
                styles.tableCellValue,
                sourceIsHigher && styles.tableCellValueHigher,
                !sourceIsHigher && destIsHigher && styles.tableCellValueLower,
              ]}>
                {sourceRate !== undefined ? `${sourceRate}%` : '—'}
              </Text>
              <Text style={[
                styles.tableCellValue,
                destIsHigher && styles.tableCellValueHigher,
                !destIsHigher && sourceIsHigher && styles.tableCellValueLower,
              ]}>
                {destRate !== undefined ? `${destRate}%` : '—'}
              </Text>
              <Text style={[
                styles.tableCellImpact,
                impact.positive && styles.positiveImpact,
                !impact.positive && !impact.neutral && styles.negativeImpact,
                impact.neutral && styles.neutralImpact,
              ]}>
                {impact.value}
                {!impact.neutral && (
                  <Text style={{ fontSize: 8.5, color: colors.gray[500] }}>
                    {impact.positive ? ' saved' : ' more'}
                  </Text>
                )}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Premium Structure Comparison with Visual Bars */}
      <View style={styles.structureRow} wrap={false}>
        {/* Current Structure */}
        <View style={styles.structureCard}>
          <View style={styles.structureHeader}>
            <View style={styles.structureDot} />
            <Text style={styles.structureTitle}>Current Structure</Text>
          </View>
          {taxTypes.map((tax, index) => {
            const rate = getTaxRate(sourceTaxRates, tax.key, tax.altKey) ?? 0;
            const barWidth = Math.min(rate * 2, 100); // Scale for visual
            return (
              <View key={index} style={styles.structureItem}>
                <View style={styles.structureItemRow}>
                  <Text style={styles.structureLabel}>{tax.label}</Text>
                  <Text style={styles.structureValue}>{rate}%</Text>
                </View>
                <View style={styles.rateBarContainer}>
                  <View style={[
                    styles.rateBarFill,
                    styles.rateBarFillCurrent,
                    { width: `${barWidth}%` }
                  ]} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Optimized Structure */}
        <View style={[styles.structureCard, styles.structureCardOptimized]}>
          <View style={styles.structureHeader}>
            <View style={[styles.structureDot, styles.structureDotOptimized]} />
            <Text style={styles.structureTitle}>Optimized Structure</Text>
          </View>
          {taxTypes.map((tax, index) => {
            const rate = getTaxRate(destinationTaxRates, tax.key, tax.altKey) ?? 0;
            const barWidth = Math.min(rate * 2, 100); // Scale for visual
            return (
              <View key={index} style={styles.structureItem}>
                <View style={styles.structureItemRow}>
                  <Text style={styles.structureLabel}>{tax.label}</Text>
                  <Text style={[styles.structureValue, styles.structureValueOptimized]}>{rate}%</Text>
                </View>
                <View style={styles.rateBarContainer}>
                  <View style={[
                    styles.rateBarFill,
                    styles.rateBarFillOptimized,
                    { width: `${barWidth}%` }
                  ]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Premium Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDiamond} />
        <Text style={styles.footerText}>
          Tax analysis powered by HNWI Chronicles KGv3 Jurisdiction Intelligence
        </Text>
        <View style={styles.footerDiamond} />
      </View>
    </View>
  );
};

export default PdfTaxAnalysis;
