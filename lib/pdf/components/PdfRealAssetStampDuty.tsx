/**
 * PdfRealAssetStampDuty — Stamp duty / transfer tax table sub-component
 * Extracted from PdfRealAssetAuditSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, formatCurrency } from '../pdf-styles';
import type { StampDutyData } from '../pdf-types';

const getSeverityLabel = (ratePct: number) => {
  if (ratePct >= 50) return 'PROHIBITIVE';
  if (ratePct >= 20) return 'HIGH';
  if (ratePct > 0) return 'MODERATE';
  return 'LOOPHOLE';
};

const rateStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 14, textAlign: 'right' as const };
const badgeBase = { paddingHorizontal: 8, paddingVertical: 3, marginLeft: 10, borderWidth: 1 };
const badgeTextStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: 0.5 };

interface PdfRealAssetStampDutyProps {
  stampDuty?: StampDutyData;
  transactionValue: number;
}

export const PdfRealAssetStampDuty: React.FC<PdfRealAssetStampDutyProps> = ({ stampDuty, transactionValue }) => {
  const getSeverityColor = (ratePct: number) => {
    if (ratePct >= 50) return colors.red[700];
    if (ratePct >= 20) return colors.amber[500];
    if (ratePct > 0) return darkTheme.textSecondary;
    return colors.amber[500];
  };

  const rowBase = { flexDirection: 'row' as const, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'flex-start' as const };
  const labelText = { fontFamily: 'Inter' as const, fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 };
  const effectiveStyle = { fontFamily: 'Inter' as const, fontSize: 9, color: darkTheme.textMuted, marginTop: 2 };

  if (!stampDuty?.found) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        Stamp Duty / Transfer Tax
      </Text>
      <View style={{ width: '100%', marginBottom: 16, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
        {stampDuty.foreign_buyer_surcharge && (
          <View style={[rowBase, { backgroundColor: colors.tints.redLight, borderLeftWidth: 4, borderLeftColor: colors.red[700] }]}>
            <View style={{ flex: 2, paddingRight: 12 }}>
              <Text style={labelText}>Foreign Buyer Surcharge (ABSD)</Text>
              {!!stampDuty.foreign_buyer_surcharge.effective_date && <Text style={effectiveStyle}>Effective: {stampDuty.foreign_buyer_surcharge.effective_date}</Text>}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 130, flexShrink: 0, paddingTop: 2 }}>
              <Text style={[rateStyle, { color: colors.red[700] }]}>{stampDuty.foreign_buyer_surcharge.rate_pct != null ? `${stampDuty.foreign_buyer_surcharge.rate_pct}%` : 'N/A'}</Text>
              <View style={[badgeBase, { backgroundColor: colors.tints.redMedium, borderColor: colors.red[700] }]}>
                <Text style={[badgeTextStyle, { color: colors.red[700] }]}>{getSeverityLabel(stampDuty.foreign_buyer_surcharge.rate_pct ?? 0)}</Text>
              </View>
            </View>
          </View>
        )}

        {stampDuty.commercial_rates && (
          <View style={{ ...rowBase, ...(stampDuty.commercial_rates.foreign_surcharge_pct === 0 ? { backgroundColor: colors.tints.goldLight, borderLeftWidth: 4, borderLeftColor: colors.amber[500] } : {}) }}>
            <View style={{ flex: 2, paddingRight: 12 }}>
              <Text style={labelText}>Commercial Property</Text>
              {!!(stampDuty.commercial_rates.note || stampDuty.commercial_rates.notes) && <Text style={effectiveStyle}>{stampDuty.commercial_rates.note || stampDuty.commercial_rates.notes}</Text>}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', minWidth: 130, flexShrink: 0, paddingTop: 2 }}>
              <Text style={[rateStyle, { color: stampDuty.commercial_rates.foreign_surcharge_pct === 0 ? colors.amber[500] : darkTheme.textSecondary }]}>
                {stampDuty.commercial_rates.foreign_surcharge_pct != null ? `${stampDuty.commercial_rates.foreign_surcharge_pct}%` : 'N/A'}
              </Text>
              {stampDuty.commercial_rates.foreign_surcharge_pct === 0 && (
                <View style={[badgeBase, { backgroundColor: colors.tints.goldMedium, borderColor: colors.amber[500] }]}>
                  <Text style={[badgeTextStyle, { color: colors.amber[500] }]}>LOOPHOLE</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {Array.isArray(stampDuty.residential_rates) && stampDuty.residential_rates.slice(0, 3).map((tier, idx) => (
          <View key={idx} style={rowBase}>
            <Text style={[labelText, { flex: 2, paddingRight: 12 }]}>{tier.threshold || tier.description || `Tier ${idx + 1}`}</Text>
            <Text style={[rateStyle, { color: darkTheme.textSecondary }]}>{tier.rate_pct != null ? `${tier.rate_pct}%` : 'N/A'}</Text>
          </View>
        ))}

        {transactionValue > 0 && stampDuty.foreign_buyer_surcharge && (
          <View style={[rowBase, { backgroundColor: darkTheme.surfaceBg }]}>
            <Text style={[labelText, { flex: 2, paddingRight: 12, fontWeight: 700 }]}>Impact on {formatCurrency(transactionValue)} Transaction</Text>
            <Text style={[rateStyle, { color: colors.red[700] }]}>{formatCurrency(transactionValue * ((stampDuty.foreign_buyer_surcharge.rate_pct ?? 0) / 100))}</Text>
          </View>
        )}
      </View>

      {!!stampDuty.statute_citation && (
        <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: darkTheme.border, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, backgroundColor: darkTheme.textFaint, borderRadius: 2, marginRight: 6 }} />
          <Text style={{ fontFamily: 'Courier', fontSize: 9, color: darkTheme.textMuted }}>Source: {stampDuty.statute_citation}</Text>
        </View>
      )}
    </View>
  );
};
