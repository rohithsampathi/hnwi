/**
 * WORLD-CLASS COVER PAGE - Native PDF Component
 * First Impression: Sets the tone for a $2,500+ institutional document
 *
 * Design Principles:
 * - Understated luxury (no cluttered design)
 * - Clear hierarchy with generous whitespace
 * - Strategic gold accents for premium feel
 * - Dark background for sophistication
 * - Every element serves a purpose
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, spacing, typography, cleanJurisdiction, formatDate } from '../pdf-styles';

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.gray[950],
    padding: 0,
    position: 'relative',
  },

  // === CLEAN BORDERS ===
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.amber[500],
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.amber[500],
  },

  // === CORNER ACCENTS - Simplified ===
  cornerTopLeft: {
    position: 'absolute',
    top: 40,
    left: 40,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 40,
    right: 40,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 40,
    left: 40,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
  cornerLineH: {
    width: 24,
    height: 1,
    backgroundColor: colors.gray[600],
  },
  cornerLineV: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray[600],
  },

  // === MAIN CONTAINER ===
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 72,
  },

  // === LOGO - Simplified ===
  logoContainer: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: colors.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: colors.amber[500],
  },

  // === BRAND NAME ===
  brandContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  brandGold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: colors.amber[500],
    letterSpacing: 6,
  },
  brandWhite: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: colors.gray[100],
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 56,
  },

  // === DIVIDER - Simplified ===
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
  },
  dividerLine: {
    width: 80,
    height: 1,
    backgroundColor: colors.gray[700],
  },
  dividerDiamond: {
    display: 'none', // Remove decorative element
  },

  // === DOCUMENT INFO ===
  documentType: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.gray[400],
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    color: colors.white,
    letterSpacing: 0,
    marginBottom: 56,
  },

  // === JURISDICTION CORRIDOR - Clean table style ===
  corridorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[700],
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  jurisdictionColumn: {
    alignItems: 'center',
    minWidth: 120,
  },
  jurisdictionLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  jurisdictionValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0,
  },
  corridorArrow: {
    marginHorizontal: 40,
    alignItems: 'center',
  },
  arrowLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.gray[600],
    marginBottom: 0,
  },
  arrowSymbol: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: colors.gray[500],
  },

  // === KEY METRICS - Clean display ===
  metricsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 56,
  },
  metricBox: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 140,
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: colors.gray[700],
  },
  metricLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  metricValueGold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.amber[500],
  },
  metricValueGreen: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: colors.emerald[500],
  },

  // === REFERENCE & DATE ===
  referenceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 0.5,
  },
  referenceId: {
    fontFamily: 'Courier-Bold',
    fontSize: 10,
    color: colors.gray[300],
    letterSpacing: 2,
  },
  dateText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[500],
  },

  // === CONFIDENTIAL BADGE - Simple border ===
  confidentialBadge: {
    borderWidth: 1,
    borderColor: colors.amber[500],
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  confidentialDot: {
    display: 'none', // Remove decorative dot
  },
  confidentialText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.amber[500],
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  // === FOOTER ===
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 72,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: colors.gray[600],
    letterSpacing: 0.5,
  },
});

interface PdfCoverPageProps {
  intakeId: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  generatedAt: string;
  exposureClass?: string;
  valueCreation?: string;
}

export const PdfCoverPage: React.FC<PdfCoverPageProps> = ({
  intakeId,
  sourceJurisdiction,
  destinationJurisdiction,
  generatedAt,
  exposureClass,
  valueCreation,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <Page size="A4" style={styles.page}>
      {/* Premium gold border - top */}
      <View style={styles.topBorder} />

      {/* Subtle corner accents */}
      <View style={styles.cornerTopLeft}>
        <View style={styles.cornerLineH} />
        <View style={styles.cornerLineV} />
      </View>
      <View style={styles.cornerTopRight}>
        <View style={[styles.cornerLineH, { alignSelf: 'flex-end' }]} />
        <View style={[styles.cornerLineV, { position: 'absolute', right: 0 }]} />
      </View>

      {/* Main content */}
      <View style={styles.container}>
        {/* Logo/Monogram */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>H</Text>
        </View>

        {/* Brand name */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandGold}>HNWI</Text>
          <Text style={styles.brandWhite}> CHRONICLES</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Private Intelligence Division</Text>

        {/* Simple divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
        </View>

        {/* Document type & title */}
        <Text style={styles.documentType}>SFO Decision Memorandum</Text>
        <Text style={styles.title}>Pattern Audit</Text>

        {/* Jurisdiction corridor */}
        {sourceJurisdiction && destinationJurisdiction && (
          <View style={styles.corridorContainer}>
            <View style={styles.jurisdictionColumn}>
              <Text style={styles.jurisdictionLabel}>Origin</Text>
              <Text style={styles.jurisdictionValue}>
                {cleanJurisdiction(sourceJurisdiction)}
              </Text>
            </View>
            <View style={styles.corridorArrow}>
              <View style={styles.arrowLine} />
              <Text style={styles.arrowSymbol}>▸</Text>
            </View>
            <View style={styles.jurisdictionColumn}>
              <Text style={styles.jurisdictionLabel}>Destination</Text>
              <Text style={styles.jurisdictionValue}>
                {cleanJurisdiction(destinationJurisdiction)}
              </Text>
            </View>
          </View>
        )}

        {/* Key metrics */}
        {(exposureClass || valueCreation) && (
          <View style={styles.metricsRow}>
            {exposureClass && (
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Risk Profile</Text>
                <Text style={styles.metricValueGold}>{exposureClass}</Text>
              </View>
            )}
            {valueCreation && (
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Value Creation</Text>
                <Text style={styles.metricValueGreen}>{valueCreation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Reference & Date */}
        <View style={styles.referenceContainer}>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Reference: </Text>
            <Text style={styles.referenceId}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(generatedAt)}</Text>
        </View>

        {/* Confidential badge */}
        <View style={styles.confidentialBadge}>
          <Text style={styles.confidentialText}>Confidential</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {currentYear} HNWI Chronicles</Text>
        <Text style={styles.footerText}>Private Intelligence Division</Text>
      </View>

      {/* Corner accents - bottom */}
      <View style={styles.cornerBottomLeft}>
        <View style={[styles.cornerLineV, { marginBottom: 0 }]} />
        <View style={styles.cornerLineH} />
      </View>
      <View style={styles.cornerBottomRight}>
        <View style={[styles.cornerLineV, { position: 'absolute', right: 0, bottom: 0 }]} />
        <View style={[styles.cornerLineH, { alignSelf: 'flex-end' }]} />
      </View>

      {/* Premium gold border - bottom */}
      <View style={styles.bottomBorder} />
    </Page>
  );
};

export default PdfCoverPage;
