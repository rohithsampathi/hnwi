/**
 * WORLD-CLASS TAX JURISDICTION ANALYSIS
 * Institutional-grade tax comparison visualization
 *
 * Design Philosophy:
 * - Clear data hierarchy for rapid comprehension
 * - Professional table design with proper typography
 * - Impactful cumulative savings display
 * - Side-by-side structure comparison
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, cleanJurisdiction, formatPercent } from '../pdf-styles';
import { TaxRates } from '../pdf-types';

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  // === SECTION HEADER ===
  sectionHeader: {
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  accentLine: {
    width: 24,
    height: 3,
    backgroundColor: colors.amber[500],
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
    letterSpacing: 0,
  },

  // === MAIN ANALYSIS CARD - Now just a container ===
  mainCard: {
    backgroundColor: colors.white,
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
    marginBottom: 16,
  },

  // === CUMULATIVE IMPACT - Clean display ===
  impactContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  impactBox: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: colors.gray[200],
    paddingLeft: 16,
  },
  impactLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  impactValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: colors.gray[900],
    letterSpacing: -1,
  },
  impactSubtext: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    marginTop: 4,
  },
  corridorBox: {
    width: 160,
    borderLeftWidth: 2,
    borderLeftColor: colors.amber[500],
    paddingLeft: 16,
  },
  corridorLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  corridorArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  corridorJurisdiction: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[800],
  },
  corridorArrowIcon: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: colors.gray[500],
  },

  // === TAX COMPARISON TABLE - Clean institutional ===
  table: {
    width: '100%',
    marginBottom: 24,
    borderTopWidth: 2,
    borderTopColor: colors.gray[900],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[900],
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tableRowAlt: {
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.gray[700],
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
  },
  tableCellValue: {
    flex: 1,
    fontFamily: 'Courier-Bold',
    fontSize: 10,
    textAlign: 'center',
    color: colors.gray[800],
  },
  tableCellImpact: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    textAlign: 'right',
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

  // === STRUCTURE COMPARISON - Simple side-by-side ===
  structureRow: {
    flexDirection: 'row',
    gap: 24,
  },
  structureCard: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: colors.gray[300],
    paddingTop: 12,
  },
  structureCardOptimized: {
    borderTopColor: colors.amber[500],
  },
  structureHeader: {
    marginBottom: 12,
  },
  structureDot: {
    display: 'none', // Remove decorative dots
  },
  structureDotCurrent: {},
  structureDotOptimized: {},
  structureTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  structureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  structureLabel: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[600],
  },
  structureValue: {
    fontFamily: 'Courier-Bold',
    fontSize: 10,
    color: colors.gray[900],
  },
  structureValueOptimized: {
    color: colors.emerald[600],
  },
  // Visual bar for rates - Hidden for cleaner look
  rateBarContainer: {
    display: 'none',
  },
  rateBarFill: {
    display: 'none',
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
    { key: 'income_tax', label: 'Income Tax', icon: '₹' },
    { key: 'capital_gains', label: 'Capital Gains', icon: '↗' },
    { key: 'estate_tax', label: 'Estate Tax', icon: '⚖' },
    { key: 'wealth_tax', label: 'Wealth Tax', icon: '◆' },
  ];

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

  // Parse total benefit
  let benefitValue = '+29%';
  if (typeof totalTaxBenefit === 'string') {
    benefitValue = totalTaxBenefit;
  } else if (typeof totalTaxBenefit === 'number') {
    benefitValue = `+${totalTaxBenefit}%`;
  }

  const sourceClean = cleanJurisdiction(sourceJurisdiction) || 'Current';
  const destClean = cleanJurisdiction(destinationJurisdiction) || 'Optimized';

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View style={styles.accentLine} />
        <Text style={styles.sectionTitle}>Tax Jurisdiction Analysis</Text>
      </View>

      {/* Main comparison */}
      <View style={styles.mainCard}>
        {/* Impact summary */}
        <View style={styles.impactContainer}>
          <View style={styles.impactBox}>
            <Text style={styles.impactLabel}>Cumulative Tax Advantage</Text>
            <Text style={styles.impactValue}>{benefitValue}</Text>
            <Text style={styles.impactSubtext}>Estimated annual efficiency gain</Text>
          </View>

          <View style={styles.corridorBox}>
            <Text style={styles.corridorLabel}>Migration Corridor</Text>
            <View style={styles.corridorArrow}>
              <Text style={styles.corridorJurisdiction}>{sourceClean}</Text>
              <Text style={styles.corridorArrowIcon}>→</Text>
              <Text style={styles.corridorJurisdiction}>{destClean}</Text>
            </View>
          </View>
        </View>

        {/* Tax comparison table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Tax Category</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{sourceClean}</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'center' }]}>{destClean}</Text>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Savings</Text>
          </View>

          {taxTypes.map((tax, index) => {
            const sourceRate = (sourceTaxRates as any)[tax.key];
            const destRate = (destinationTaxRates as any)[tax.key];
            const impact = calculateImpact(sourceRate, destRate);

            return (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.tableCellBold]}>{tax.label}</Text>
                <Text style={styles.tableCellValue}>
                  {sourceRate !== undefined ? `${sourceRate}%` : '—'}
                </Text>
                <Text style={styles.tableCellValue}>
                  {destRate !== undefined ? `${destRate}%` : '—'}
                </Text>
                <Text style={[
                  styles.tableCellImpact,
                  impact.positive && styles.positiveImpact,
                  !impact.positive && !impact.neutral && styles.negativeImpact,
                  impact.neutral && styles.neutralImpact,
                ]}>
                  {impact.value}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Structure comparison */}
        <View style={styles.structureRow}>
          <View style={styles.structureCard}>
            <View style={styles.structureHeader}>
              <Text style={styles.structureTitle}>Current Structure</Text>
            </View>
            {taxTypes.map((tax, index) => {
              const rate = (sourceTaxRates as any)[tax.key] ?? 0;
              return (
                <View key={index} style={styles.structureItem}>
                  <Text style={styles.structureLabel}>{tax.label}</Text>
                  <Text style={styles.structureValue}>{rate}%</Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.structureCard, styles.structureCardOptimized]}>
            <View style={styles.structureHeader}>
              <Text style={styles.structureTitle}>Optimized Structure</Text>
            </View>
            {taxTypes.map((tax, index) => {
              const rate = (destinationTaxRates as any)[tax.key] ?? 0;
              return (
                <View key={index} style={styles.structureItem}>
                  <Text style={styles.structureLabel}>{tax.label}</Text>
                  <Text style={[styles.structureValue, styles.structureValueOptimized]}>{rate}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PdfTaxAnalysis;
