/**
 * WORLD-CLASS LAST PAGE - Confidentiality & Legal Notice
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
import { colors, spacing } from '../pdf-styles';

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
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.amber[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: colors.amber[500],
  },

  // === BRAND ===
  brandContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  brandGold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: colors.amber[500],
    letterSpacing: 6,
  },
  brandWhite: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: colors.gray[100],
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 48,
  },

  // === DIVIDER - Simple line ===
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  dividerLine: {
    width: 80,
    height: 1,
    backgroundColor: colors.gray[700],
  },
  dividerDiamond: {
    display: 'none',
  },

  // === COPYRIGHT ===
  copyright: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.gray[400],
    marginBottom: 32,
  },

  // === LEGAL SECTIONS ===
  legalContainer: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 32,
  },

  // === CONFIDENTIALITY BOX - Simple border ===
  confidentialityBox: {
    borderWidth: 1,
    borderColor: colors.amber[500],
    padding: 24,
    marginBottom: 16,
  },
  boxIcon: {
    display: 'none',
  },
  boxIconText: {
    display: 'none',
  },
  boxTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.amber[500],
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
    textAlign: 'center',
  },
  boxText: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[400],
    lineHeight: 1.6,
    textAlign: 'center',
  },

  // === TWO COLUMN NOTICES ===
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  noticeBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.gray[700],
    paddingTop: 12,
  },
  noticeHeader: {
    marginBottom: 8,
  },
  noticeDot: {
    display: 'none',
  },
  noticeTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[400],
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  noticeText: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
    lineHeight: 1.5,
  },

  // === REFERENCE SECTION ===
  referenceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[500],
  },
  referenceId: {
    fontFamily: 'Courier-Bold',
    fontSize: 10,
    color: colors.gray[300],
    letterSpacing: 2,
  },
  generatedDate: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: colors.gray[600],
  },

  // === WEBSITE ===
  websiteContainer: {
    marginTop: 16,
  },
  website: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.amber[500],
    letterSpacing: 1,
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
  },
});

interface PdfLastPageProps {
  intakeId: string;
  precedentCount?: number;
  generatedAt?: string;
}

export const PdfLastPage: React.FC<PdfLastPageProps> = ({
  intakeId,
  precedentCount = 0,
  generatedAt,
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

      {/* Subtle corner accents */}
      <View style={styles.cornerTopLeft}>
        <View style={styles.cornerLineH} />
        <View style={styles.cornerLineV} />
      </View>
      <View style={styles.cornerTopRight}>
        <View style={[styles.cornerLineH, { alignSelf: 'flex-end' }]} />
        <View style={[styles.cornerLineV, { position: 'absolute', right: 0 }]} />
      </View>

      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>H</Text>
        </View>

        {/* Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandGold}>HNWI</Text>
          <Text style={styles.brandWhite}> CHRONICLES</Text>
        </View>

        <Text style={styles.tagline}>Private Intelligence Division</Text>

        {/* Simple divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © {currentYear} HNWI Chronicles. All Rights Reserved.
        </Text>

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
                <Text style={styles.noticeTitle}>Intelligence Base</Text>
              </View>
              <Text style={styles.noticeText}>
                Powered by {precedentCount > 0 ? precedentCount.toLocaleString() : '1,500'}+ analyzed HNWI
                developments and regulatory precedents from our proprietary KGv3 knowledge graph.
              </Text>
            </View>

            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
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
        <Text style={styles.footerText}>End of Document</Text>
      </View>

      {/* Premium gold border - bottom */}
      <View style={styles.bottomBorder} />
    </Page>
  );
};

export default PdfLastPage;
