/**
 * PdfRealAssetTrusts — Dynasty trusts, succession vehicles, freeports sub-component
 * Extracted from PdfRealAssetAuditSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme } from '../pdf-styles';
import type { JurisdictionAssetAudit } from '../pdf-types';

interface PdfRealAssetTrustsProps {
  auditData: JurisdictionAssetAudit;
}

export const PdfRealAssetTrusts: React.FC<PdfRealAssetTrustsProps> = ({ auditData }) => {
  const subsectionTitle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 11, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 12, marginTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: darkTheme.border };
  const thBase = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5 };
  const trBase = { flexDirection: 'row' as const, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg };
  const cellBold = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 10, color: darkTheme.textPrimary };
  const cellNormal = { fontFamily: 'Inter' as const, fontSize: 10, color: darkTheme.textSecondary };
  const tableShell = { width: '100%' as const, marginBottom: 16, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border };
  const headerRow = { flexDirection: 'row' as const, backgroundColor: darkTheme.surfaceBg, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: darkTheme.textPrimary };

  return (
  <>
    {/* Dynasty Trust Options */}
    {auditData.dynasty_trusts?.found && Array.isArray(auditData.dynasty_trusts.jurisdictions) && auditData.dynasty_trusts.jurisdictions.length > 0 && (
      <View style={{ marginBottom: 20 }}>
        <Text style={subsectionTitle}>Dynasty Trust Options</Text>
        <View style={tableShell} wrap={false}>
          <View style={headerRow}>
            <Text style={[thBase, { flex: 2 }]}>Structure</Text>
            <Text style={[thBase, { flex: 1 }]}>Duration</Text>
            <Text style={[thBase, { flex: 2 }]}>Protection</Text>
          </View>
          {auditData.dynasty_trusts.jurisdictions.slice(0, 4).map((trust, idx) => (
            <View key={idx} style={[trBase, idx % 2 === 1 && { backgroundColor: darkTheme.cardBg }]}>
              <Text style={[cellBold, { flex: 2 }]}>{trust.name || trust.jurisdiction}</Text>
              <Text style={[cellNormal, { flex: 1 }]}>
                {trust.perpetuity_period || trust.max_duration || (trust.perpetuity_years ? `${trust.perpetuity_years} yrs` : 'N/A')}
              </Text>
              <Text style={[cellNormal, { flex: 2 }]}>{trust.asset_protection || trust.tax_benefits?.[0] || 'Standard'}</Text>
            </View>
          ))}
        </View>

        {!!(auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity) && (
          <View style={{ marginTop: 14, backgroundColor: colors.tints.goldLight, borderWidth: 1, borderColor: colors.tints.goldStrong, borderLeftWidth: 4, borderLeftColor: colors.amber[500], padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ width: 16, height: 16, backgroundColor: colors.tints.goldStrong, borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500] }}>!</Text>
              </View>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], textTransform: 'uppercase', letterSpacing: 0.5 }}>Recommended Structure</Text>
            </View>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 }}>
              {auditData.dynasty_trusts.recommended || auditData.dynasty_trusts.best_for_perpetuity}
            </Text>
            {!!auditData.dynasty_trusts.rationale && (
              <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5, marginTop: 6 }}>
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
        <Text style={subsectionTitle}>Succession Vehicles</Text>
        <View style={tableShell} wrap={false}>
          <View style={headerRow}>
            <Text style={[thBase, { flex: 1 }]}>Type</Text>
            <Text style={[thBase, { flex: 2 }]}>Name</Text>
            <Text style={[thBase, { flex: 2 }]}>Benefits</Text>
          </View>
          {auditData.succession_vehicles.slice(0, 4).map((vehicle, idx) => (
            <View key={idx} style={[trBase, idx % 2 === 1 && { backgroundColor: darkTheme.cardBg }]}>
              <Text style={[cellNormal, { flex: 1, fontSize: 9, color: darkTheme.textMuted }]}>{vehicle.vehicle_type || vehicle.type || 'Vehicle'}</Text>
              <Text style={[cellBold, { flex: 2 }]}>{vehicle.name}</Text>
              <Text style={[cellNormal, { flex: 2, fontSize: 9 }]}>
                {(Array.isArray(vehicle.tax_benefits) ? vehicle.tax_benefits : Array.isArray(vehicle.benefits) ? vehicle.benefits : []).slice(0, 2).join(', ') || 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {/* Freeport Options */}
    {auditData.freeport_options?.found && Array.isArray(auditData.freeport_options.freeports) && auditData.freeport_options.freeports.length > 0 && (
      <View style={{ marginBottom: 20 }}>
        <Text style={subsectionTitle}>Freeport Storage Options</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {auditData.freeport_options.freeports.map((freeport, idx) => (
            <View key={idx} style={{ backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, borderTopWidth: 3, borderTopColor: darkTheme.textFaint, paddingHorizontal: 12, paddingVertical: 10, minWidth: 120, marginRight: 10, marginBottom: 10 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 4 }}>{freeport.name}</Text>
              {!!(freeport.jurisdiction || freeport.location) && (
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>{freeport.jurisdiction || freeport.location}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    )}

    {/* Data Completeness */}
    {auditData.data_completeness && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: darkTheme.surfaceBg }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint, marginRight: 8 }}>Sources: {auditData.data_completeness.total_sources || 0}</Text>
        {!!auditData.data_completeness.confidence && (
          <View style={{ backgroundColor: darkTheme.surfaceBg, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textMuted }}>{auditData.data_completeness.confidence} Confidence</Text>
          </View>
        )}
      </View>
    )}
  </>
  );
};
