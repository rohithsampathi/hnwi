/**
 * PDF REAL ASSET AUDIT SECTION — Orchestrator
 * Standards: Bridgewater / McKinsey / Goldman Sachs institutional quality
 *
 * Sub-components: PdfRealAssetStampDuty, PdfRealAssetLoopholes, PdfRealAssetTrusts
 */

import React from 'react';
import { View, Text, Page } from '@react-pdf/renderer';
import { colors, darkTheme, pdfStyles } from '../pdf-styles';
import { PdfSectionHeader, PdfGroundedNote } from './primitives';
import { PdfRealAssetStampDuty } from './PdfRealAssetStampDuty';
import { PdfRealAssetLoopholes } from './PdfRealAssetLoopholes';
import { PdfRealAssetTrusts } from './PdfRealAssetTrusts';
import type { RealAssetAuditData, JurisdictionAssetAudit } from '../pdf-types';

interface PdfRealAssetAuditSectionProps {
  data: RealAssetAuditData;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  transactionValue?: number;
  intakeId: string;
}

const PageFooter: React.FC<{ intakeId: string }> = ({ intakeId }) => (
  <View style={pdfStyles.footer} fixed>
    <Text style={pdfStyles.footerText}>Ref: {intakeId.slice(10, 22).toUpperCase()}</Text>
    <Text style={pdfStyles.footerBrand}>HNWI CHRONICLES</Text>
    <Text style={pdfStyles.footerText}>CONFIDENTIAL</Text>
  </View>
);

/** Check if a jurisdiction has any meaningful content */
const hasContent = (d: JurisdictionAssetAudit): boolean => {
  if (!d) return false;
  if (d.stamp_duty?.found) return true;
  if (Array.isArray(d.loophole_strategies) && d.loophole_strategies.length > 0) return true;
  if (d.dynasty_trusts?.found && Array.isArray(d.dynasty_trusts.jurisdictions) && d.dynasty_trusts.jurisdictions.length > 0) return true;
  if (Array.isArray(d.succession_vehicles) && d.succession_vehicles.length > 0) return true;
  if (d.freeport_options?.found && Array.isArray(d.freeport_options.freeports) && d.freeport_options.freeports.length > 0) return true;
  return false;
};

export const PdfRealAssetAuditSection: React.FC<PdfRealAssetAuditSectionProps> = ({
  data, sourceJurisdiction, destinationJurisdiction, transactionValue = 0, intakeId,
}) => {
  const ps = pdfStyles.page;

  const jurisdictionKeys = Object.keys(data).filter(key => !key.startsWith('_'));
  const jurisdictionsWithContent = jurisdictionKeys.filter(key => hasContent(data[key]));

  if (!data || jurisdictionsWithContent.length === 0) return null;

  return (
    <Page size="A4" style={ps}>
      <View style={{ marginBottom: 28 }}>
        <PdfSectionHeader
          title="Real Asset Audit Intelligence"
          badge="KGv3 Verified"
          subtitle="Comprehensive analysis of stamp duty, tax strategies, and trust structures"
        />

        {jurisdictionsWithContent.map((jurisdiction) => {
          const auditData = data[jurisdiction];
          return (
            <View key={jurisdiction} style={{ marginBottom: 28 }}>
              {/* Jurisdiction Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: colors.amber[500] }}>
                <View style={{ width: 28, height: 28, backgroundColor: colors.tints.goldMedium, borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: colors.amber[500] }}>{jurisdiction.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 1, flex: 1 }}>{jurisdiction}</Text>
              </View>

              <PdfRealAssetStampDuty stampDuty={auditData.stamp_duty} transactionValue={transactionValue} />
              <PdfRealAssetLoopholes strategies={auditData.loophole_strategies} />
              <PdfRealAssetTrusts auditData={auditData} />
            </View>
          );
        })}

      </View>

      <PageFooter intakeId={intakeId} />
    </Page>
  );
};

export default PdfRealAssetAuditSection;
