/**
 * PdfAuditOverviewPage — Decision Thesis & Intelligence Foundation
 * Maps to web's AuditOverviewSection (report mode, showMap=false)
 * Shows: Intelligence basis, decision thesis, corridor label
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';
import { PdfMetricGrid } from './primitives/PdfMetricGrid';
import { FlowArrow } from './svg/FlowArrow';

interface PdfAuditOverviewPageProps {
  sourceJurisdiction: string;
  destinationJurisdiction: string;
  sourceCity?: string;
  destinationCity?: string;
  developmentsCount: number;
  precedentCount: number;
  thesisSummary?: string;
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
  exposureClass,
  verdict,
  cleanJurisdiction,
}) => {
  const srcLabel = cleanJurisdiction(sourceCity || sourceJurisdiction);
  const dstLabel = cleanJurisdiction(destinationCity || destinationJurisdiction);

  return (
    <View>
      <PdfSectionHeader
        title="Decision Thesis & Intelligence Foundation"
        badge="AUDIT OVERVIEW"
      />

      {/* Intelligence Basis Metrics */}
      <PdfMetricGrid
        columns={3}
        metrics={[
          { label: 'Developments Analyzed', value: developmentsCount.toLocaleString(), color: colors.amber[500] },
          { label: 'Corridor Signals', value: precedentCount.toLocaleString(), color: colors.amber[500] },
          { label: 'Risk Profile', value: exposureClass || '—' },
        ]}
      />

      {/* Corridor Flow */}
      <PdfCard variant="default">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>Origin</Text>
            <Text style={{ ...typography.h3, color: darkTheme.textPrimary }}>{srcLabel}</Text>
          </View>
          <View style={{ width: 60, alignItems: 'center' }}>
            <FlowArrow width={50} color={colors.amber[500]} />
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 4, letterSpacing: 1.5, textTransform: 'uppercase' }}>Destination</Text>
            <Text style={{ ...typography.h3, color: darkTheme.textPrimary }}>{dstLabel}</Text>
          </View>
        </View>
      </PdfCard>

      {/* Decision Thesis */}
      {thesisSummary && (
        <PdfCard variant="highlight">
          <Text style={{ ...typography.micro, color: colors.amber[500], marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700 }}>
            Decision Thesis
          </Text>
          <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 8 }}>
            Strategic mandate for this evaluation
          </Text>
          <Text style={{ fontSize: 10, fontFamily: 'Inter', color: darkTheme.textSecondary, lineHeight: 1.6 }}>
            {thesisSummary}
          </Text>
        </PdfCard>
      )}

      {/* Intelligence Basis Note */}
      <PdfCard variant="default">
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(16, 185, 129, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm }}>
            <Text style={{ fontSize: 12, color: colors.emerald[500] }}>✓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.micro, color: colors.emerald[500], marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
              Intelligence Basis
            </Text>
            <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textSecondary, lineHeight: 1.6 }}>
              This audit draws on {developmentsCount.toLocaleString()} validated developments from 3 years of HNWI wealth pattern tracking, cross-referenced against {precedentCount.toLocaleString()} corridor signals specific to the {srcLabel}→{dstLabel} corridor. All findings are citation-backed.
            </Text>
          </View>
        </View>
      </PdfCard>
    </View>
  );
};
