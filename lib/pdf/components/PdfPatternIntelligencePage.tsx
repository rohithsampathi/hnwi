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
import { colors, darkTheme, pdfStyles, formatCurrency, cleanJurisdiction } from '../pdf-styles';
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
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={theme} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1, maxWidth: '70%' }}>Pattern Intelligence</Text>
          <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>Commandments IV + IX</Text>
          </View>
        </View>
      </View>

      {/* Intelligence Depth Banner */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 16, backgroundColor: darkTheme.cardBg }} wrap={false}>
        <View>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Intelligence Depth</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: darkTheme.textPrimary, letterSpacing: -0.5 }}>{precedentCount.toLocaleString()}+</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint, marginTop: 2 }}>Validated developments in KGv3</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Corridor Precedents</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: colors.amber[500], letterSpacing: -0.5 }}>{evidenceAnchors.length || '—'}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint, marginTop: 2 }}>Specific to this corridor</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <ConfidenceMeter level={precedentCount > 1000 ? 5 : precedentCount > 500 ? 4 : 3} size={60} theme={theme} />
        </View>
      </View>

      {/* FlowArrow Corridor */}
      <View style={{ marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: darkTheme.border, alignItems: 'center' }} wrap={false}>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Capital Flow Corridor</Text>
        <FlowArrow from={sourceClean} to={destClean} width={340} height={34} theme={theme} />
      </View>

      {/* Peer Movement Table */}
      {peerStats && (
        <View style={{ width: '100%', marginBottom: 24, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }} wrap={false}>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
            <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary }}>Metric</Text>
            <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, textAlign: 'right' }}>Value</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary }}>Total HNWIs Executing Similar Moves</Text>
            <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textSecondary }}>{safeText((peerStats as any).total_peers ?? peerStats.total_hnwis)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.cardBg }}>
            <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary }}>Recent Movements (Last 6 Months)</Text>
            <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textSecondary }}>{safeText((peerStats as any).last_6_months ?? peerStats.recent_movements)}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: darkTheme.pageBg }}>
            <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary }}>Average Transaction Value</Text>
            <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textSecondary }}>
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
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: colors.amber[500], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Destination Drivers</Text>
          {[
            { label: 'Tax Optimization', value: peerStats.drivers.tax_optimization, color: colors.amber[500] },
            { label: 'Asset Protection', value: peerStats.drivers.asset_protection, color: colors.emerald[400] },
            { label: 'Lifestyle', value: peerStats.drivers.lifestyle, color: darkTheme.textMuted },
          ].map((driver, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx < 2 ? 8 : 0 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textSecondary, width: 100 }}>{driver.label}</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Svg width={200} height={8} viewBox="0 0 200 8">
                  <Rect x="0" y="0" width="200" height="8" rx="2" fill={darkTheme.surfaceBg} />
                  <Rect x="0" y="0" width={String(Math.max((driver.value / 100) * 200, 2))} height="8" rx="2" fill={driver.color} />
                </Svg>
              </View>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, width: 36, textAlign: 'right' }}>{driver.value}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* Capital Flow Corridors */}
      {(capitalFlow?.source_flows || capitalFlow?.destination_flows) && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: colors.amber[500], textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Capital Flow Corridors</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* Source Flows Table */}
            {capitalFlow?.source_flows && capitalFlow.source_flows.length > 0 && (
              <View style={{ flex: 1, marginRight: 8, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
                  <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, paddingLeft: 6 }}>Source Flows</Text>
                  <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, textAlign: 'right' }}>Volume</Text>
                  <Text style={{ width: 40, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, textAlign: 'right', paddingRight: 6 }}>%</Text>
                </View>
                {capitalFlow.source_flows.slice(0, 5).map((flow, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: idx % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg }}>
                    <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textSecondary, paddingLeft: 6 }}>{flow.city}</Text>
                    <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textAlign: 'right' }}>{formatCurrency(flow.volume)}</Text>
                    <Text style={{ width: 40, fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, textAlign: 'right', paddingRight: 6 }}>{flow.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Destination Flows Table */}
            {capitalFlow?.destination_flows && capitalFlow.destination_flows.length > 0 && (
              <View style={{ flex: 1, marginLeft: capitalFlow?.source_flows?.length ? 8 : 0, borderTopWidth: 3, borderTopColor: darkTheme.textPrimary, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: darkTheme.textPrimary, backgroundColor: darkTheme.surfaceBg }}>
                  <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, paddingLeft: 6 }}>Dest. Flows</Text>
                  <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, textAlign: 'right' }}>Volume</Text>
                  <Text style={{ width: 40, fontFamily: 'Inter', fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, color: darkTheme.textPrimary, textAlign: 'right', paddingRight: 6 }}>%</Text>
                </View>
                {capitalFlow.destination_flows.slice(0, 5).map((flow, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: (flow as any).highlight ? darkTheme.goldTint : (idx % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg) }}>
                    <Text style={{ flex: 2, fontFamily: 'Inter', fontSize: 9, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textSecondary, fontWeight: (flow as any).highlight ? 700 : 400, paddingLeft: 6 }}>{flow.city}</Text>
                    <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textSecondary, textAlign: 'right' }}>{formatCurrency(flow.volume)}</Text>
                    <Text style={{ width: 40, fontFamily: 'Inter', fontSize: 9, color: (flow as any).highlight ? colors.amber[500] : darkTheme.textMuted, textAlign: 'right', paddingRight: 6 }}>{flow.percentage}%</Text>
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
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Flow Intensity</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: darkTheme.textPrimary }}>{safeText((capitalFlow as any)?.flow_intensity_index || capitalFlow.velocity || peerStats?.flow_intensity)}</Text>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: darkTheme.border, paddingBottom: 12, marginRight: 16 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Movement Velocity</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: colors.emerald[400] }}>{safeText((capitalFlow as any)?.velocity_change || peerStats?.movement_velocity)}</Text>
          </View>
          <View style={{ flex: 1, borderBottomWidth: 2, borderBottomColor: darkTheme.border, paddingBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Peers in Corridor</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: darkTheme.textPrimary }}>{safeText(capitalFlow.peers_in_corridor || (peerStats as any)?.total_peers || peerStats?.total_hnwis)}</Text>
          </View>
        </View>
      )}

      {/* Evidence Anchors with Dev IDs */}
      {evidenceAnchors.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, marginBottom: 12 }}>
            Pattern Citations — {evidenceAnchors.length} Corridor-Specific Precedents
          </Text>
          {evidenceAnchors.slice(0, 5).map((anchor, idx) => (
            <View key={idx} style={{ backgroundColor: darkTheme.pageBg, borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 3, borderLeftColor: colors.amber[500], padding: 12, marginBottom: 8 }} wrap={false}>
              <Text style={{ fontFamily: 'Courier-Bold', fontSize: 9, color: colors.amber[500], marginBottom: 4 }}>DEV-{anchor.dev_id}</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 4, lineHeight: 1.4 }}>{anchor.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {!!anchor.exit_complexity && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Exit: {anchor.exit_complexity}</Text>}
                {!!anchor.liquidity_horizon && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Liquidity: {anchor.liquidity_horizon}</Text>}
                {anchor.relevance_score !== undefined && (
                  <Text style={{ fontFamily: 'Inter', fontSize: 9, color: colors.amber[500] }}>Relevance: {(anchor.relevance_score * 100).toFixed(0)}%</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint, letterSpacing: 0.5, marginHorizontal: 12 }}>
          Pattern intelligence sourced from {precedentCount.toLocaleString()}+ KGv3 developments
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfPatternIntelligencePage;
