/**
 * WORLD-CLASS LAST PAGE - Confidentiality & Legal Notice
 * Ultra-Premium SFO/Family Office Institutional Standard
 *
 * Design Inspiration: Bridgewater Associates, McKinsey & Co., Goldman Sachs
 * The final impression that reinforces institutional credibility
 *
 * Design Philosophy:
 * - Matching premium dark aesthetic from cover
 * - Clear legal language with proper hierarchy
 * - Sophisticated closing that mirrors top-tier consulting firms
 * - Document reference for audit trail
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../pdf-styles';

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
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: colors.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
    fontSize: 32,
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
    fontSize: 24,
    color: colors.amber[500],
    letterSpacing: 7,
  },
  brandWhite: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: colors.white,
    letterSpacing: 7,
  },
  tagline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[500],
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginBottom: 48,
  },

  // === PREMIUM DIVIDER ===
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  dividerLine: {
    width: 48,
    height: 1,
    backgroundColor: colors.gray[700],
    marginHorizontal: 8,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.amber[500],
    transform: 'rotate(45deg)',
  },

  // === COPYRIGHT ===
  copyright: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[400],
    marginBottom: 40,
  },

  // === LEGAL SECTIONS ===
  legalContainer: {
    width: '100%',
    maxWidth: 440,
    marginBottom: 40,
  },

  // === CONFIDENTIALITY BOX - Premium ===
  confidentialityBox: {
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    padding: 28,
    marginBottom: 24,
    position: 'relative',
  },
  confidentialityCorner: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.amber[500],
  },
  boxTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.amber[500],
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  boxText: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: colors.gray[400],
    lineHeight: 1.7,
    textAlign: 'center',
  },

  // === TWO COLUMN NOTICES ===
  twoColumnRow: {
    flexDirection: 'row',
  },
  noticeBox: {
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: colors.gray[800],
    paddingTop: 16,
    marginRight: 24,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.amber[600],
    borderRadius: 3,
    marginRight: 8,
  },
  noticeTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[400],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  noticeText: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    lineHeight: 1.6,
  },

  // === REFERENCE SECTION ===
  referenceSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  generatedDate: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[600],
  },

  // === WEBSITE - Premium ===
  websiteContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gray[700],
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  website: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.amber[500],
    letterSpacing: 2,
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
    fontSize: 8.5,
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

interface PdfLastPageProps {
  intakeId: string;
  precedentCount?: number;
  generatedAt?: string;
  viaNegativa?: {
    isActive: boolean;
    dayOneLoss: number;
    ctaBody: string;
  };
}

export const PdfLastPage: React.FC<PdfLastPageProps> = ({
  intakeId,
  precedentCount = 0,
  generatedAt,
  viaNegativa,
}) => {
  const currentYear = new Date().getFullYear();
  const generatedDate = generatedAt ? new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

      <View style={styles.container}>
        {/* Premium Monogram Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoInnerBorder} />
          <Text style={styles.logoText}>H</Text>
        </View>

        {/* Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandGold}>HNWI</Text>
          <Text style={styles.brandWhite}> CHRONICLES</Text>
        </View>

        <Text style={styles.tagline}>Private Intelligence Division</Text>

        {/* Premium divider with diamond */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © {currentYear} HNWI Chronicles. All Rights Reserved.
        </Text>

        {/* Via Negativa: Buy Bridge CTA */}
        {viaNegativa?.isActive && (
          <View style={{
            width: '100%',
            maxWidth: 440,
            borderWidth: 2,
            borderColor: colors.amber[500],
            padding: 24,
            marginBottom: 32,
            alignItems: 'center',
          }}>
            <Text style={{
              fontFamily: 'Helvetica-Bold',
              fontSize: 13,
              color: colors.amber[500],
              letterSpacing: 1,
              textAlign: 'center',
              marginBottom: 10,
            }}>
              DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?
            </Text>
            <Text style={{
              fontFamily: 'Times-Roman',
              fontSize: 8,
              color: colors.gray[400],
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 16,
              maxWidth: 360,
            }}>
              {viaNegativa.ctaBody}
            </Text>

            <Text style={{
              fontFamily: 'Helvetica-Bold',
              fontSize: 8,
              color: colors.amber[600],
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              5 Slots Remaining — February Cycle
            </Text>

            <View style={{
              backgroundColor: colors.amber[500],
              paddingVertical: 10,
              paddingHorizontal: 24,
              marginBottom: 16,
            }}>
              <Text style={{
                fontFamily: 'Helvetica-Bold',
                fontSize: 10,
                color: colors.gray[950],
                letterSpacing: 1,
              }}>
                INITIATE YOUR PATTERN AUDIT — $5,000
              </Text>
            </View>

            <View style={{
              borderTopWidth: 1,
              borderTopColor: colors.gray[700],
              paddingTop: 12,
              width: '100%',
            }}>
              <Text style={{
                fontFamily: 'Times-Roman',
                fontSize: 7,
                color: colors.gray[500],
                textAlign: 'center',
                lineHeight: 1.5,
              }}>
                For Indian Family Offices: This sample analyzes a US → Singapore corridor. The same Pattern Recognition Engine applies to India → Dubai, India → Singapore, India → Portugal, and 50+ other corridors.
              </Text>
            </View>
          </View>
        )}

        {/* Legal sections */}
        <View style={styles.legalContainer}>
          {/* Confidentiality notice */}
          <View style={styles.confidentialityBox}>
            <Text style={styles.boxTitle}>Confidentiality Notice</Text>
            <Text style={styles.boxText}>
              This SFO Pattern Audit report is confidential and proprietary to HNWI Chronicles.
              Unauthorized distribution, reproduction, or disclosure is strictly prohibited.
              This document is intended solely for the use of the individual or entity to whom it is addressed.
            </Text>
          </View>

          {/* Two column notices */}
          <View style={styles.twoColumnRow}>
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <View style={styles.noticeDot} />
                <Text style={styles.noticeTitle}>Intelligence Base</Text>
              </View>
              <Text style={styles.noticeText}>
                Powered by {precedentCount > 0 ? precedentCount.toLocaleString() : '1,500'}+ analyzed HNWI
                developments and regulatory precedents from our proprietary KGv3 knowledge graph.
              </Text>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <View style={styles.noticeDot} />
                <Text style={styles.noticeTitle}>Important Notice</Text>
              </View>
              <Text style={styles.noticeText}>
                For execution and implementation, consult qualified legal, tax, and financial advisory teams.
                Past patterns do not guarantee future outcomes.
              </Text>
            </View>
          </View>
        </View>

        {/* Reference section */}
        <View style={styles.referenceSection}>
          <View style={styles.referenceBadge}>
            <Text style={styles.referenceLabel}>Document Reference: </Text>
            <Text style={styles.referenceId}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={styles.generatedDate}>Generated: {generatedDate}</Text>
        </View>

        {/* Website */}
        <View style={styles.websiteContainer}>
          <Text style={styles.website}>app.hnwichronicles.com</Text>
        </View>
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {currentYear} HNWI Chronicles</Text>
        <View style={styles.footerCenter}>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>End of Document</Text>
          <View style={styles.footerDot} />
        </View>
        <Text style={styles.footerText}>Institutional Grade</Text>
      </View>

      {/* Premium gold border - bottom */}
      <View style={styles.bottomBorder} />
    </Page>
  );
};

export default PdfLastPage;
