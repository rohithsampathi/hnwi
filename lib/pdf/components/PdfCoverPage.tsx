/**
 * WORLD-CLASS COVER PAGE - Native PDF Component
 * Ultra-Premium SFO/Family Office Institutional Standard
 *
 * Design Inspiration: Bridgewater Associates, McKinsey & Co., Goldman Sachs
 * First Impression: Sets the tone for a $2,500+ institutional document
 *
 * Design Principles:
 * - Understated luxury with refined elegance
 * - Dramatic dark aesthetic with strategic gold accents
 * - Impeccable typography hierarchy
 * - Generous whitespace for breathing room
 * - Every element serves a purpose
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors, cleanJurisdiction, formatDate } from '../pdf-styles';

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.gray[950],
    padding: 0,
    position: 'relative',
  },

  // === PREMIUM GOLD BORDER SYSTEM ===
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.amber[500],
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.amber[500],
  },

  // === REFINED CORNER ACCENTS ===
  cornerTopLeft: {
    position: 'absolute',
    top: 48,
    left: 48,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 48,
    right: 48,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 48,
    left: 48,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 48,
    right: 48,
  },
  cornerLineH: {
    width: 32,
    height: 1,
    backgroundColor: colors.gray[700],
  },
  cornerLineV: {
    width: 1,
    height: 32,
    backgroundColor: colors.gray[700],
  },

  // === MAIN CONTAINER ===
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 80,
    paddingVertical: 72,
  },

  // === PREMIUM MONOGRAM LOGO ===
  logoContainer: {
    width: 72,
    height: 72,
    borderWidth: 2,
    borderColor: colors.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  logoInnerBorder: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: colors.amber[600],
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    color: colors.amber[500],
    letterSpacing: -1,
  },

  // === BRAND TYPOGRAPHY ===
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  brandGold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: colors.amber[500],
    letterSpacing: 8,
  },
  brandWhite: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: colors.white,
    letterSpacing: 8,
  },
  tagline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 56,
  },

  // === PREMIUM DIVIDER ===
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 56,
  },
  dividerLine: {
    width: 60,
    height: 1,
    backgroundColor: colors.gray[700],
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: colors.amber[500],
    transform: 'rotate(45deg)',
    marginHorizontal: 20,
  },

  // === DOCUMENT CLASSIFICATION ===
  documentBadge: {
    borderWidth: 1,
    borderColor: colors.gray[600],
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  documentBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[400],
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 42,
    color: colors.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 13,
    color: colors.gray[400],
    letterSpacing: 0.5,
    marginBottom: 48,
  },

  // === JURISDICTION CORRIDOR - Premium Table ===
  corridorContainer: {
    width: '100%',
    maxWidth: 380,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[700],
    paddingVertical: 28,
    marginBottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jurisdictionColumn: {
    alignItems: 'center',
    minWidth: 120,
  },
  jurisdictionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[600],
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  jurisdictionValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: colors.white,
    letterSpacing: 0.5,
  },
  corridorArrow: {
    marginHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLine: {
    width: 32,
    height: 1,
    backgroundColor: colors.amber[500],
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.amber[500],
  },

  // === KEY METRICS - Premium Display ===
  metricsContainer: {
    flexDirection: 'row',
    marginBottom: 48,
  },
  metricBox: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[800],
    marginRight: 2,
  },
  metricBoxFirst: {
    borderLeftWidth: 0,
  },
  metricLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[600],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
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
    marginBottom: 10,
  },
  referenceLabel: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[600],
  },
  referenceId: {
    fontFamily: 'Courier-Bold',
    fontSize: 12,
    color: colors.gray[300],
    letterSpacing: 3,
  },
  dateText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[500],
  },

  // === CONFIDENTIAL BADGE - Premium ===
  confidentialContainer: {
    marginTop: 8,
  },
  confidentialBadge: {
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    paddingVertical: 10,
    paddingHorizontal: 28,
    position: 'relative',
  },
  confidentialText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.amber[500],
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // === FOOTER ===
  footer: {
    position: 'absolute',
    bottom: 56,
    left: 80,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[700],
    letterSpacing: 0.5,
  },
  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.amber[600],
    borderRadius: 2,
    marginHorizontal: 8,
  },
});

interface PdfCoverPageProps {
  intakeId: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  generatedAt: string;
  exposureClass?: string;
  valueCreation?: string;
  viaNegativa?: {
    isActive: boolean;
    badgeLabel: string;
  };
}

export const PdfCoverPage: React.FC<PdfCoverPageProps> = ({
  intakeId,
  sourceJurisdiction,
  destinationJurisdiction,
  generatedAt,
  exposureClass,
  valueCreation,
  viaNegativa,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <Page size="A4" style={styles.page}>
      {/* Premium gold border - top */}
      <View style={styles.topBorder} />

      {/* Refined corner accents */}
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
        {/* Premium Monogram Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoInnerBorder} />
          <Text style={styles.logoText}>H</Text>
        </View>

        {/* Brand name */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandGold}>HNWI</Text>
          <Text style={styles.brandWhite}> CHRONICLES</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Private Intelligence Division</Text>

        {/* Premium divider with diamond */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        {/* Document classification */}
        <View style={styles.documentBadge}>
          <Text style={styles.documentBadgeText}>SFO Decision Memorandum</Text>
        </View>
        <Text style={styles.title}>Pattern Audit</Text>
        <Text style={styles.subtitle}>Strategic Intelligence Analysis</Text>

        {/* Jurisdiction corridor */}
        {!!sourceJurisdiction && !!destinationJurisdiction && (
          <View style={styles.corridorContainer}>
            <View style={styles.jurisdictionColumn}>
              <Text style={styles.jurisdictionLabel}>Origin</Text>
              <Text style={styles.jurisdictionValue}>
                {cleanJurisdiction(sourceJurisdiction)}
              </Text>
            </View>
            <View style={styles.corridorArrow}>
              <View style={styles.arrowContainer}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowHead} />
              </View>
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
        {!!(exposureClass || valueCreation) && (
          <View style={styles.metricsContainer}>
            {!!exposureClass && (
              <View style={[styles.metricBox, styles.metricBoxFirst]}>
                <Text style={styles.metricLabel}>Risk Profile</Text>
                <Text style={styles.metricValueGold}>{exposureClass}</Text>
              </View>
            )}
            {!!valueCreation && (
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
        <View style={styles.confidentialContainer}>
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {currentYear} HNWI Chronicles</Text>
        <View style={styles.footerCenter}>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>Private Intelligence Division</Text>
          <View style={styles.footerDot} />
        </View>
        <Text style={styles.footerText}>Institutional Grade</Text>
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

      {/* Via Negativa: VETOED watermark overlay */}
      {viaNegativa?.isActive && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontFamily: 'Helvetica-Bold',
            fontSize: 100,
            color: 'rgba(239, 68, 68, 0.25)',
            transform: 'rotate(-12deg)',
            letterSpacing: 20,
            textTransform: 'uppercase',
          }}>
            {viaNegativa.badgeLabel}
          </Text>
        </View>
      )}

      {/* Premium gold border - bottom */}
      <View style={styles.bottomBorder} />
    </Page>
  );
};

export default PdfCoverPage;
