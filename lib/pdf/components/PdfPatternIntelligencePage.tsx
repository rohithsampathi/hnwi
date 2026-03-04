/**
 * PATTERN INTELLIGENCE PAGE — Commandments IV + IX
 * Peer analysis + pattern evidence with Dev IDs and citations
 *
 * Features:
 * - Intelligence depth header
 * - FlowArrow for capital flow corridor
 * - Peer movement table
 * - Pattern citation cards with Dev IDs
 * - Velocity + flow intensity metrics
 */

import React from 'react';
import { View, Text, Svg, Rect } from '@react-pdf/renderer';
import { colors, darkTheme, pdfStyles, typography, spacing, formatCurrency, cleanJurisdiction } from '../pdf-styles';
import { PeerCohortStats, CapitalFlowData } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  FlowArrow,
  GradientDivider,
  ConfidenceMeter,
} from './svg';

const safeText = (val: any, fallback: string = '—'): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
};

// ---------------------------------------------------------------------------
// Local styles — extracted from repeated inline declarations
// ---------------------------------------------------------------------------
const styles = {
  /** Page heading: 15pt bold uppercase (between h2 16pt and h3 13pt) */
  pageTitle: {
    ...typography.h3,
    fontWeight: 700 as const,
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: darkTheme.textPrimary,
  },
  /** Micro label with letterSpacing 1 (microBold base has 0.5) */
  microLabel: {
    ...typography.microBold,
    letterSpacing: 1,
    color: darkTheme.textMuted,
  },
  /** Micro label — faint variant */
  microLabelFaint: {
    ...typography.microBold,
    letterSpacing: 1,
    color: darkTheme.textFaint,
  },
  /** Micro label — gold variant */
  microLabelGold: {
    ...typography.microBold,
    letterSpacing: 1,
    color: colors.amber[500],
  },
  /** Large metric — primary */
  metricLgPrimary: {
    ...typography.metricLg,
    color: darkTheme.textPrimary,
  },
  /** Large metric — gold */
  metricLgGold: {
    ...typography.metricLg,
    color: colors.amber[500],
  },
  /** Large metric — emerald */
  metricLgEmerald: {
    ...typography.metricLg,
    color: colors.amber[500],
  },
  /** 9pt caption — faint */
  captionFaint: {
    ...typography.caption,
    color: darkTheme.textFaint,
  },
  /** 9pt caption — secondary */
  captionSecondary: {
    ...typography.caption,
    color: darkTheme.textSecondary,
  },
  /** 9pt caption — muted */
  captionMuted: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
  /** 9pt caption — gold */
  captionGold: {
    ...typography.caption,
    color: colors.amber[500],
  },
  /** Table header cell — 9pt bold uppercase (microBold + 0.5 letterSpacing) */
  tableHeaderCell: {
    ...typography.microBold,
    color: darkTheme.textPrimary,
  },
  /** Table body cell — small (10pt regular) */
  tableCellText: {
    ...typography.small,
    color: darkTheme.textSecondary,
  },
  /** Table body cell — small bold (10pt bold) */
  tableCellBold: {
    ...typography.smallBold,
    color: darkTheme.textSecondary,
  },
  /** Evidence anchor title — 10pt bold */
  anchorTitle: {
    ...typography.smallBold,
    color: darkTheme.textPrimary,
    lineHeight: 1.4,
  },
  /** Dev ID — Courier-Bold 9pt gold */
  devId: {
    fontFamily: 'Courier-Bold',
    fontSize: 9,
    color: colors.amber[500],
  },
  /** Section heading — bodyBold (11pt bold) */
  sectionHeading: {
    ...typography.bodyBold,
    color: darkTheme.textPrimary,
  },
  /** Driver percentage — 9pt bold primary */
  driverPercent: {
    ...typography.microBold,
    color: darkTheme.textPrimary,
  },
  /** Flow table cell — 9pt bold secondary */
  flowCellBold: {
    ...typography.microBold,
    color: darkTheme.textSecondary,
  },
  /** Flow table cell — 9pt muted */
  flowCellMuted: {
    ...typography.caption,
    color: darkTheme.textMuted,
  },
} as const;

interface PdfPatternIntelligencePageProps {
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  precedentCount?: number;
  peerStats?: PeerCohortStats;
  capitalFlow?: CapitalFlowData;
  evidenceAnchors?: Array<{
    dev_id: string;
    title: string;
    exit_complexity?: string;
    liquidity_horizon?: string;
    relevance_score?: number;
  }>;
  verdict?: string;
}

export const PdfPatternIntelligencePage: React.FC<PdfPatternIntelligencePageProps> = ({
  sourceJurisdiction,
  destinationJurisdiction,
  precedentCount = 0,
  peerStats,
  capitalFlow,
  evidenceAnchors = [],
  verdict,
}) => {
  const theme = getVerdictTheme(verdict);
  const sourceClean = cleanJurisdiction(sourceJurisdiction) || 'Source';
  const destClean = cleanJurisdiction(destinationJurisdiction) || 'Destination';

  return (
    <View style={pdfStyles.section}>
      {/* Header */}
      <View style={{ marginBottom: spacing.lg, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={theme} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ ...styles.pageTitle, flexShrink: 1, maxWidth: '70%' }}>Pattern Intelligence</Text>
          <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border }}>
            <Text style={{ ...typography.microBold, letterSpacing: 1, color: darkTheme.textMuted, textTransform: 'uppercase' }}>INTELLIGENCE</Text>
          </View>
        </View>
      </View>

      {/* Intelligence Depth Banner */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg, padding: 16, backgroundColor: darkTheme.cardBg }} wrap={false}>
        <View>
          <Text style={{ ...styles.microLabelFaint, marginBottom: spacing.xs }}>Intelligence Depth</Text>
          <Text style={styles.metricLgPrimary}>{precedentCount.toLocaleString()}+</Text>
          <Text style={{ ...styles.captionFaint, marginTop: 2 }}>Validated developments in KGv3</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ ...styles.microLabelFaint, marginBottom: spacing.xs }}>Corridor Precedents</Text>
          <Text style={styles.metricLgGold}>{evidenceAnchors.length || '—'}</Text>
          <Text style={{ ...styles.captionFaint, marginTop: 2 }}>Specific to this corridor</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <ConfidenceMeter level={precedentCount > 1000 ? 5 : precedentCount > 500 ? 4 : 3} size={60} theme={theme} />
        </View>
      </View>

      {/* FlowArrow Corridor */}
      <View style={{ marginBottom: 24, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'center' }} wrap={false}>
        <Text style={{ ...styles.microLabel, marginBottom: 10 }}>Capital Flow Corridor</Text>
        <FlowArrow from={sourceClean} to={destClean} width={340} height={34} theme={theme} />
      </View>

      {/* Peer Movement Table */}
      {peerStats && (
        <View style={{ width: '100%', marginBottom: 24, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
            <Text style={{ flex: 2, ...styles.tableHeaderCell }}>Metric</Text>
            <Text style={{ flex: 1, ...styles.tableHeaderCell, textAlign: 'right' }}>Value</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={{ flex: 2, ...styles.tableCellText }}>Total HNWIs Executing Similar Moves</Text>
            <Text style={{ flex: 1, textAlign: 'right', ...styles.tableCellBold }}>{safeText((peerStats as any).total_peers ?? peerStats.total_hnwis)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.cardBg }}>
            <Text style={{ flex: 2, ...styles.tableCellText }}>Recent Movements (Last 6 Months)</Text>
            <Text style={{ flex: 1, textAlign: 'right', ...styles.tableCellBold }}>{safeText((peerStats as any).last_6_months ?? peerStats.recent_movements)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={{ flex: 2, ...styles.tableCellText }}>Average Transaction Value</Text>
            <Text style={{ flex: 1, textAlign: 'right', ...styles.tableCellBold }}>
              {(() => {
                const avgVal = (peerStats as any).avg_deal_value_m ?? peerStats.average_value;
                if (typeof avgVal === 'number') {
                  return (peerStats as any).avg_deal_value_m !== undefined ? `$${avgVal}M` : formatCurrency(avgVal);
                }
                return safeText(avgVal);
              })()}
            </Text>
          </View>
        </View>
      )}

      {/* Destination Drivers */}
      {peerStats?.drivers && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <Text style={{ ...styles.microLabelGold, marginBottom: 12 }}>Destination Drivers</Text>
          {[
            { label: 'Tax Optimization', value: peerStats.drivers.tax_optimization, color: colors.amber[500] },
            { label: 'Asset Protection', value: peerStats.drivers.asset_protection, color: colors.amber[500] },
            { label: 'Lifestyle', value: peerStats.drivers.lifestyle, color: darkTheme.textMuted },
          ].map((driver, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < 2 ? spacing.sm : 0 }}>
              <Text style={{ ...styles.captionSecondary, width: 100 }}>{driver.label}</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Svg width={200} height={8} viewBox="0 0 200 8">
                  <Rect x="0" y="0" width="200" height="8" rx="2" fill={darkTheme.surfaceBg} />
                  <Rect x="0" y="0" width={String(Math.max((driver.value / 100) * 200, 2))} height="8" rx="2" fill={driver.color} />
                </Svg>
              </View>
              <Text style={{ ...styles.driverPercent, width: 36, textAlign: 'right' }}>{driver.value}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Capital Flow Corridors */}
      {(capitalFlow?.source_flows || capitalFlow?.destination_flows) && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <Text style={{ ...styles.microLabelGold, marginBottom: 12 }}>Capital Flow Corridors</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* Source Flows Table */}
            {capitalFlow?.source_flows && capitalFlow.source_flows.length > 0 && (
              <View style={{ flex: 1, marginRight: spacing.sm, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
                  <Text style={{ flex: 2, ...styles.tableHeaderCell, paddingLeft: 6 }}>Source Flows</Text>
                  <Text style={{ flex: 1, ...styles.tableHeaderCell, textAlign: 'right' }}>Volume</Text>
                  <Text style={{ width: 40, ...styles.tableHeaderCell, textAlign: 'right', paddingRight: 6 }}>%</Text>
                </View>
                {capitalFlow.source_flows.slice(0, 5).map((flow, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: idx % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg }}>
                    <Text style={{ flex: 2, ...styles.captionSecondary, paddingLeft: 6 }}>{flow.city}</Text>
                    <Text style={{ flex: 1, ...styles.flowCellBold, textAlign: 'right' }}>{formatCurrency(flow.volume)}</Text>
                    <Text style={{ width: 40, ...styles.flowCellMuted, textAlign: 'right', paddingRight: 6 }}>{flow.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Destination Flows Table */}
            {capitalFlow?.destination_flows && capitalFlow.destination_flows.length > 0 && (
              <View style={{ flex: 1, marginLeft: capitalFlow?.source_flows?.length ? spacing.sm : 0, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                <View style={{ flexDirection: 'row', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
                  <Text style={{ flex: 2, ...styles.tableHeaderCell, paddingLeft: 6 }}>Dest. Flows</Text>
                  <Text style={{ flex: 1, ...styles.tableHeaderCell, textAlign: 'right' }}>Volume</Text>
                  <Text style={{ width: 40, ...styles.tableHeaderCell, textAlign: 'right', paddingRight: 6 }}>%</Text>
                </View>
                {capitalFlow.destination_flows.slice(0, 5).map((flow, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: (flow as any).highlight ? darkTheme.goldTint : (idx % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg) }}>
                    <Text style={{ flex: 2, ...typography.caption, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textSecondary, fontWeight: (flow as any).highlight ? 700 : 400, paddingLeft: 6 }}>{flow.city}</Text>
                    <Text style={{ flex: 1, ...typography.microBold, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textSecondary, textAlign: 'right' }}>{formatCurrency(flow.volume)}</Text>
                    <Text style={{ width: 40, ...typography.caption, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textMuted, textAlign: 'right', paddingRight: 6 }}>{flow.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Flow Metrics */}
      {capitalFlow && (
        <View style={{ flexDirection: 'row', marginBottom: 24 }} wrap={false}>
          <View style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: darkTheme.border, paddingBottom: 12, marginRight: 16 }}>
            <Text style={{ ...styles.microLabel, marginBottom: 6 }}>Flow Intensity</Text>
            <Text style={styles.metricLgPrimary}>{safeText((capitalFlow as any)?.flow_intensity_index || capitalFlow.velocity || peerStats?.flow_intensity)}</Text>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: darkTheme.border, paddingBottom: 12, marginRight: 16 }}>
            <Text style={{ ...styles.microLabel, marginBottom: 6 }}>Movement Velocity</Text>
            <Text style={styles.metricLgEmerald}>{safeText((capitalFlow as any)?.velocity_change || peerStats?.movement_velocity)}</Text>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: darkTheme.border, paddingBottom: 12 }}>
            <Text style={{ ...styles.microLabel, marginBottom: 6 }}>Peers in Corridor</Text>
            <Text style={styles.metricLgPrimary}>{safeText(capitalFlow.peers_in_corridor || (peerStats as any)?.total_peers || peerStats?.total_hnwis)}</Text>
          </View>
        </View>
      )}

      {/* Evidence Anchors with Dev IDs */}
      {evidenceAnchors.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ ...styles.sectionHeading, marginBottom: 12 }}>
            Pattern Citations — {evidenceAnchors.length} Corridor-Specific Precedents
          </Text>
          {evidenceAnchors.slice(0, 5).map((anchor, idx) => (
            <View key={idx} style={{ backgroundColor: darkTheme.pageBg, borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 3, borderLeftColor: colors.amber[500], padding: 12, marginBottom: spacing.sm }} wrap={false}>
              <Text style={{ ...styles.devId, marginBottom: spacing.xs }}>DEV-{anchor.dev_id}</Text>
              <Text style={{ ...styles.anchorTitle, marginBottom: spacing.xs }}>{anchor.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {!!anchor.exit_complexity && <Text style={styles.captionMuted}>Exit: {anchor.exit_complexity}</Text>}
                {!!anchor.liquidity_horizon && <Text style={styles.captionMuted}>Liquidity: {anchor.liquidity_horizon}</Text>}
                {anchor.relevance_score !== undefined && (
                  <Text style={styles.captionGold}>Relevance: {(anchor.relevance_score * 100).toFixed(0)}%</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ ...pdfStyles.footerCenter, marginHorizontal: 12 }}>
          Pattern intelligence sourced from {precedentCount.toLocaleString()}+ KGv3 developments
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfPatternIntelligencePage;
