/**
 * PdfAuditOverviewPage — Decision Thesis & Intelligence Basis
 * Maps to web's AuditOverviewSection (report mode, showMap=false)
 *
 * Web shows (report mode):
 *   1. Decision Thesis card (fullThesis > thesisSummary, gold bordered card)
 *   2. Intelligence Basis banner (prose with 2 highlighted numbers)
 *   3. NO metrics grid, NO corridor arrows (those are personal/map mode only)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';

interface PdfAuditOverviewPageProps {
  sourceJurisdiction: string;
  destinationJurisdiction: string;
  sourceCity?: string;
  destinationCity?: string;
  developmentsCount: number;
  precedentCount: number;
  thesisSummary?: string;
  fullThesis?: string;
  exposureClass?: string;
  verdict?: string;
  cleanJurisdiction: (j: string) => string;
}

export const PdfAuditOverviewPage: React.FC<PdfAuditOverviewPageProps> = ({
  sourceJurisdiction,
  destinationJurisdiction,
  sourceCity,
  destinationCity,
  developmentsCount,
  precedentCount,
  thesisSummary,
  fullThesis,
  exposureClass,
  cleanJurisdiction,
}) => {
  const srcLabel = cleanJurisdiction(sourceCity || sourceJurisdiction);
  const dstLabel = cleanJurisdiction(destinationCity || destinationJurisdiction);

  // Prefer fullThesis (richer context), fallback to thesisSummary — mirrors web's displayText logic
  const thesisText = fullThesis || thesisSummary;

  return (
    <View>
      <PdfSectionHeader
        title="Audit Overview"
        badge="DECISION INTEL"
      />

      {/* ─── Decision Thesis card — web: border-2 border-gold/20 bg-gold/5 ── */}
      {thesisText && (
        <View style={{
          marginBottom: spacing.lg,
          padding: 20,
          borderWidth: 1.5,
          borderColor: `${colors.amber[600]}40`,
          backgroundColor: darkTheme.goldTint,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{
              width: 28, height: 28,
              backgroundColor: `${colors.amber[600]}1A`,
              alignItems: 'center', justifyContent: 'center',
              marginRight: 10, flexShrink: 0,
            }}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter', color: colors.amber[500] }}>≡</Text>
            </View>
            <View>
              <Text style={{ ...typography.micro, color: colors.amber[500], fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 }}>
                Decision Thesis
              </Text>
              <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textMuted }}>
                Strategic mandate for this evaluation
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 10.5, fontFamily: 'Inter', color: darkTheme.textPrimary, lineHeight: 1.65 }}>
            {thesisText}
          </Text>
        </View>
      )}

      {/* ─── Intelligence Basis banner — web: border border-border bg-surface ── */}
      <View style={{
        padding: 20,
        borderWidth: 1,
        borderColor: darkTheme.border,
        backgroundColor: darkTheme.cardBg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Emerald check icon */}
          <View style={{
            width: 28, height: 28,
            backgroundColor: 'rgba(34,197,94,0.08)',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 10, flexShrink: 0,
          }}>
            <Text style={{ fontSize: 13, fontFamily: 'Inter', color: '#22C55E', fontWeight: 700 }}>{'\u2713'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, fontFamily: 'Inter', fontWeight: 700, color: '#22C55E', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Intelligence Basis
            </Text>
            {/* Prose matching web exactly — inline highlighted numbers */}
            <Text style={{ fontSize: 10, fontFamily: 'Inter', color: darkTheme.textSecondary, lineHeight: 1.65 }}>
              {'This audit draws on '}
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, color: colors.amber[500] }}>
                {developmentsCount.toLocaleString()}
              </Text>
              {' validated developments from 3 years of HNWI wealth pattern tracking, cross-referenced against '}
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, color: colors.amber[500] }}>
                {precedentCount.toLocaleString()}
              </Text>
              {` corridor signals specific to the ${srcLabel}\u2192${dstLabel} corridor. All findings are citation-backed.`}
            </Text>
          </View>
        </View>
      </View>

      {/* Exposure Class tag — subtle context row */}
      {exposureClass && exposureClass !== '—' && (
        <View style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.amber[500], marginRight: 6 }} />
          <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textMuted }}>
            {'Risk Profile: '}
            <Text style={{ color: darkTheme.textSecondary, fontWeight: 700 }}>{exposureClass}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};
