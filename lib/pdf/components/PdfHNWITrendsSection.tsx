/**
 * PDF HNWI Trends Section
 * Premium institutional visualization for HNWI migration trends and patterns
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, pdfStyles } from '../pdf-styles';
import { HnwiTrendsData, TrendInsight, SourceCitation } from '../pdf-types';
import { PdfSectionHeader } from './primitives';

interface PdfHNWITrendsSectionProps {
  trendsData?: HnwiTrendsData;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

export function PdfHNWITrendsSection({
  trendsData,
  sourceJurisdiction,
  destinationJurisdiction
}: PdfHNWITrendsSectionProps) {
  if (!trendsData?.insights || trendsData.insights.length === 0) return null;

  const confidence = trendsData.confidence || 0;
  const confidencePct = Math.round(confidence * 100);
  const confidenceBars = Math.round(confidence * 5);
  const corridorLabel = sourceJurisdiction && destinationJurisdiction
    ? `${sourceJurisdiction} > ${destinationJurisdiction}`
    : 'Cross-Border';

  const getTrendType = (content: string): 'corridor' | 'outflow' | 'inflow' | 'default' => {
    const lower = content.toLowerCase();
    if (lower.includes('\u2192') || lower.includes('corridor')) return 'corridor';
    if (lower.includes('outflow') || lower.includes('departures')) return 'outflow';
    if (lower.includes('inflow') || lower.includes('attracted')) return 'inflow';
    return 'default';
  };

  const trendBg: Record<string, object> = {
    corridor: { backgroundColor: colors.tints.goldLight, borderColor: colors.tints.goldStrong },
    outflow: { backgroundColor: darkTheme.cardBg, borderColor: darkTheme.border },
    inflow: { backgroundColor: colors.tints.goldLight, borderColor: colors.tints.goldStrong },
    default: {},
  };
  const iconBg: Record<string, string> = {
    corridor: colors.tints.goldMedium,
    outflow: darkTheme.border,
    inflow: colors.tints.goldMedium,
    default: darkTheme.surfaceBg,
  };
  const iconColor: Record<string, string> = {
    corridor: colors.amber[500],
    outflow: darkTheme.textMuted,
    inflow: colors.amber[500],
    default: darkTheme.textMuted,
  };
  const iconLabel: Record<string, string> = { corridor: '>', outflow: '+', inflow: '-', default: '*' };

  return (
    <View style={{ marginBottom: 32 }}>
      <PdfSectionHeader
        title="HNWI Migration Trends"
        badge={corridorLabel}
        subtitle="High-net-worth wealth patterns and capital flow intelligence"
        accentColor={colors.amber[500]}
      />

      {/* Confidence Metrics Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12, marginBottom: 16 }} wrap={false}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ alignItems: 'flex-start', marginRight: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Confidence</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View key={i} style={{ width: 4, height: 12, borderRadius: 1, marginRight: 2, backgroundColor: i <= confidenceBars ? colors.amber[500] : darkTheme.border }} />
                ))}
              </View>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: darkTheme.textPrimary, marginLeft: 6 }}>{confidencePct}%</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-start', marginRight: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Trends</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: darkTheme.textPrimary }}>{trendsData.trends_count || trendsData.insights.length}</Text>
          </View>
          {trendsData.sources_count !== undefined && (
            <View style={{ alignItems: 'flex-start', marginRight: 24 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Sources</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: darkTheme.textPrimary }}>{trendsData.sources_count}</Text>
            </View>
          )}
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.amber[500], backgroundColor: colors.tints.goldMedium }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], textTransform: 'uppercase', letterSpacing: 0.5 }}>KGv3 Verified</Text>
        </View>
      </View>

      {/* Trends List */}
      <View style={{ marginBottom: 16 }}>
        {trendsData.insights.slice(0, 6).map((insight, index) => {
          const type = getTrendType(insight.content);
          return (
            <View key={index} style={[{ flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 8, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }, trendBg[type]]} wrap={false}>
              <View style={{ width: 24, height: 24, borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: iconBg[type] }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: iconColor[type] }}>{iconLabel[type]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 }}>{insight.content}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Data Sources Section */}
      {trendsData.collections_queried && trendsData.collections_queried.length > 0 && (
        <View style={{ backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>KGv3 Collections Queried</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {trendsData.collections_queried.map((source, i) => (
              <View key={i} style={{ backgroundColor: darkTheme.surfaceBg, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>{source}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source Citations */}
      {trendsData.source_citations && trendsData.source_citations.length > 0 && (
        <View style={{ backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Source Citations</Text>
          {trendsData.source_citations.slice(0, 5).map((citation, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
              <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginTop: 4, marginRight: 6 }} />
              <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, flex: 1 }}>
                {citation.title}
                {!!citation.date && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint }}> ({citation.date})</Text>}
                {!!citation.reliability && <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], marginLeft: 4 }}> • {citation.reliability}</Text>}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
        <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginHorizontal: 6 }} />
        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textFaint }}>
          Powered by HNWI Chronicles KG Migration Intelligence + Henley Private Wealth Data
        </Text>
      </View>
    </View>
  );
}

export default PdfHNWITrendsSection;
