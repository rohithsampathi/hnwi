/**
 * PDF Golden Visa / Investment Migration Section
 * Premium institutional visualization for visa programs and destination drivers
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../pdf-styles';
import { DestinationDrivers, VisaProgram } from '../pdf-types';

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  // === SECTION HEADER ===
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
  },
  headerBadge: {
    backgroundColor: colors.amber[50],
    borderWidth: 1,
    borderColor: colors.amber[300],
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.amber[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[500],
    marginTop: 6,
  },

  // === VISA PROGRAM CARD ===
  visaCard: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 16,
    padding: 16,
  },
  visaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visaCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaCardIcon: {
    width: 24,
    height: 24,
    backgroundColor: colors.amber[100],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaCardIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.amber[700],
  },
  visaCardTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: colors.gray[900],
  },
  visaCardType: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[500],
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  statusBadgeActive: {
    backgroundColor: colors.emerald[100],
  },
  statusBadgeLimited: {
    backgroundColor: colors.gray[100],
  },
  statusText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusTextActive: {
    color: colors.emerald[700],
  },
  statusTextLimited: {
    color: colors.gray[600],
  },

  // === METRICS GRID ===
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 10,
    marginRight: 12,
  },
  metricLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: colors.gray[900],
  },

  // === BENEFITS LIST ===
  benefitsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    marginRight: 4,
    marginBottom: 6,
  },
  benefitBullet: {
    width: 4,
    height: 4,
    backgroundColor: colors.amber[500],
    borderRadius: 2,
    marginTop: 3,
    marginRight: 4,
  },
  benefitText: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[600],
    flex: 1,
  },

  // === CHANGES NOTICE ===
  changesNotice: {
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 10,
    marginTop: 12,
    flexDirection: 'row',
  },
  changesIcon: {
    width: 16,
    height: 16,
    backgroundColor: colors.amber[200],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  changesIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.amber[700],
  },
  changesContent: {
    flex: 1,
  },
  changesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  changesText: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[600],
    lineHeight: 1.5,
  },

  // === DRIVERS SECTION ===
  driversGrid: {
    flexDirection: 'row',
    marginTop: 16,
  },
  driverCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginRight: 12,
  },
  driverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: colors.gray[900],
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  driverBullet: {
    width: 3,
    height: 3,
    backgroundColor: colors.amber[500],
    borderRadius: 1.5,
    marginTop: 4,
  },
  driverText: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[600],
    flex: 1,
    lineHeight: 1.4,
  },

  // === FOOTER ===
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.amber[500],
    borderRadius: 2,
    marginRight: 6,
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[400],
  },
});

interface PdfGoldenVisaSectionProps {
  destinationDrivers?: DestinationDrivers;
  destinationJurisdiction?: string;
}

export function PdfGoldenVisaSection({
  destinationDrivers,
  destinationJurisdiction
}: PdfGoldenVisaSectionProps) {
  // Only render if we have visa programs
  const visaPrograms = destinationDrivers?.visa_programs;
  if (!visaPrograms || visaPrograms.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Investment Migration Programs</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Golden Visa</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Investment migration programs available in {destinationJurisdiction || 'destination jurisdiction'}
        </Text>
      </View>

      {/* Visa Program Cards */}
      {visaPrograms.map((program, index) => {
        // Handle field name variations
        const programName = program.program_name || program.name || 'Investment Program';
        const investmentAmount = program.minimum_investment || program.investment_min;
        const benefits = program.key_benefits || program.benefits || [];
        const changes2025 = program["2025_changes"];

        return (
          <View key={index} style={styles.visaCard}>
            {/* Card Header */}
            <View style={styles.visaCardHeader}>
              <View style={styles.visaCardTitleRow}>
                <View style={styles.visaCardIcon}>
                  <Text style={styles.visaCardIconText}>V</Text>
                </View>
                <View>
                  <Text style={styles.visaCardTitle}>{programName}</Text>
                  {program.investment_type && (
                    <Text style={styles.visaCardType}>{program.investment_type}</Text>
                  )}
                </View>
              </View>
              {program.status && (
                <View style={[
                  styles.statusBadge,
                  program.status.toLowerCase().includes('active') && !program.status.toLowerCase().includes('limited')
                    ? styles.statusBadgeActive
                    : styles.statusBadgeLimited
                ]}>
                  <Text style={[
                    styles.statusText,
                    program.status.toLowerCase().includes('active') && !program.status.toLowerCase().includes('limited')
                      ? styles.statusTextActive
                      : styles.statusTextLimited
                  ]}>
                    {program.status}
                  </Text>
                </View>
              )}
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              {investmentAmount && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Investment</Text>
                  <Text style={styles.metricValue}>{investmentAmount}</Text>
                </View>
              )}
              {program.duration && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricValue}>{program.duration}</Text>
                </View>
              )}
              {program.processing_time && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Processing</Text>
                  <Text style={styles.metricValue}>{program.processing_time}</Text>
                </View>
              )}
              {program.physical_presence_required && (
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Presence</Text>
                  <Text style={styles.metricValue}>{program.physical_presence_required}</Text>
                </View>
              )}
            </View>

            {/* Benefits List */}
            {benefits.length > 0 && (
              <View>
                <Text style={styles.benefitsTitle}>Key Benefits</Text>
                <View style={styles.benefitsGrid}>
                  {benefits.slice(0, 6).map((benefit, i) => (
                    <View key={i} style={styles.benefitItem}>
                      <View style={styles.benefitBullet} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Path to Citizenship */}
            {program.path_to_citizenship !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <Text style={styles.driverText}>
                  Path to Citizenship: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{program.path_to_citizenship ? 'Yes' : 'No'}</Text>
                </Text>
              </View>
            )}

            {/* 2025/2026 Changes */}
            {changes2025 && (
              <View style={styles.changesNotice}>
                <View style={styles.changesIcon}>
                  <Text style={styles.changesIconText}>!</Text>
                </View>
                <View style={styles.changesContent}>
                  <Text style={styles.changesTitle}>2025/2026 Update</Text>
                  <Text style={styles.changesText}>{changes2025}</Text>
                </View>
              </View>
            )}
          </View>
        );
      })}

      {/* Destination Drivers Section */}
      {destinationDrivers?.primary_drivers && (
        <View style={styles.driversGrid}>
          {/* Tax Optimization */}
          {destinationDrivers.primary_drivers.tax_optimization !== undefined && (
            <View style={styles.driverCard}>
              <Text style={styles.driverTitle}>Tax Optimization</Text>
              <View style={styles.driverItem}>
                <Text style={styles.metricValue}>
                  {destinationDrivers.primary_drivers.tax_optimization}%
                </Text>
                <Text style={styles.driverText}> of peers cite this as primary driver</Text>
              </View>
            </View>
          )}

          {/* Asset Protection */}
          {destinationDrivers.primary_drivers.asset_protection !== undefined && (
            <View style={styles.driverCard}>
              <Text style={styles.driverTitle}>Asset Protection</Text>
              <View style={styles.driverItem}>
                <Text style={styles.metricValue}>
                  {destinationDrivers.primary_drivers.asset_protection}%
                </Text>
                <Text style={styles.driverText}> seeking enhanced protection</Text>
              </View>
            </View>
          )}

          {/* Lifestyle */}
          {destinationDrivers.primary_drivers.lifestyle !== undefined && (
            <View style={styles.driverCard}>
              <Text style={styles.driverTitle}>Lifestyle</Text>
              <View style={styles.driverItem}>
                <Text style={styles.metricValue}>
                  {destinationDrivers.primary_drivers.lifestyle}%
                </Text>
                <Text style={styles.driverText}> prioritize lifestyle factors</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Key Catalyst */}
      {destinationDrivers?.key_catalyst && (
        <View style={styles.changesNotice}>
          <View style={styles.changesIcon}>
            <Text style={styles.changesIconText}>!</Text>
          </View>
          <View style={styles.changesContent}>
            <Text style={styles.changesTitle}>Key Catalyst</Text>
            <Text style={styles.changesText}>{destinationDrivers.key_catalyst}</Text>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>
          Sourced from HNWI Chronicles KG Golden Visa Programs 2026 + Investment Migration Database
        </Text>
      </View>
    </View>
  );
}

export default PdfGoldenVisaSection;
