/**
 * PDF HNWI Trends Section
 * Premium institutional visualization for HNWI migration trends and patterns
 */

import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../pdf-styles';
import { HnwiTrendsData, TrendInsight, SourceCitation } from '../pdf-types';

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
    marginRight: 12,
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

  // === CONFIDENCE METRICS BAR ===
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginBottom: 16,
  },
  metricsGroup: {
    flexDirection: 'row',
  },
  metricItem: {
    alignItems: 'flex-start',
    marginRight: 24,
  },
  metricLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: colors.gray[900],
    marginRight: 6,
  },
  confidenceBars: {
    flexDirection: 'row',
  },
  confidenceBar: {
    width: 4,
    height: 12,
    borderRadius: 1,
    marginRight: 2,
  },
  confidenceBarActive: {
    backgroundColor: colors.amber[500],
  },
  confidenceBarInactive: {
    backgroundColor: colors.gray[200],
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.amber[300],
    backgroundColor: colors.amber[50],
  },
  qualityBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.amber[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // === TRENDS LIST ===
  trendsList: {
    marginBottom: 16,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  trendItemCorridor: {
    backgroundColor: colors.amber[50],
    borderColor: colors.amber[200],
  },
  trendItemOutflow: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  trendItemInflow: {
    backgroundColor: colors.emerald[50],
    borderColor: colors.emerald[200],
  },
  trendIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trendIconCorridor: {
    backgroundColor: colors.amber[100],
  },
  trendIconOutflow: {
    backgroundColor: colors.gray[200],
  },
  trendIconInflow: {
    backgroundColor: colors.emerald[100],
  },
  trendIconDefault: {
    backgroundColor: colors.gray[100],
  },
  trendIconText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  trendIconTextCorridor: {
    color: colors.amber[700],
  },
  trendIconTextOutflow: {
    color: colors.gray[600],
  },
  trendIconTextInflow: {
    color: colors.emerald[700],
  },
  trendIconTextDefault: {
    color: colors.gray[500],
  },
  trendContent: {
    flex: 1,
  },
  trendText: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: colors.gray[700],
    lineHeight: 1.5,
  },

  // === DATA SOURCES ===
  sourcesSection: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginBottom: 16,
  },
  sourcesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sourceTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  sourceTagText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[600],
  },

  // === CITATIONS ===
  citationsSection: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: 12,
    marginBottom: 16,
  },
  citationsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: colors.gray[700],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  citationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  citationBullet: {
    width: 4,
    height: 4,
    backgroundColor: colors.amber[500],
    borderRadius: 2,
    marginTop: 4,
    marginRight: 6,
  },
  citationText: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: colors.gray[600],
    flex: 1,
  },
  citationDate: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[400],
  },
  citationReliability: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: colors.amber[600],
    marginLeft: 4,
  },

  // === FOOTER ===
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.amber[500],
    borderRadius: 2,
    marginHorizontal: 6,
  },
  footerText: {
    fontFamily: 'Times-Roman',
    fontSize: 7,
    color: colors.gray[400],
  },
});

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
  // Only render if we have trends data with insights
  if (!trendsData?.insights || trendsData.insights.length === 0) {
    return null;
  }

  const confidence = trendsData.confidence || 0;
  const confidencePct = Math.round(confidence * 100);
  const confidenceBars = Math.round(confidence * 5);

  const corridorLabel = sourceJurisdiction && destinationJurisdiction
    ? `${sourceJurisdiction} → ${destinationJurisdiction}`
    : 'Cross-Border';

  // Helper to determine trend type
  const getTrendType = (content: string): 'corridor' | 'outflow' | 'inflow' | 'default' => {
    const lower = content.toLowerCase();
    if (lower.includes('→') || lower.includes('corridor')) return 'corridor';
    if (lower.includes('outflow') || lower.includes('departures')) return 'outflow';
    if (lower.includes('inflow') || lower.includes('attracted')) return 'inflow';
    return 'default';
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerAccent} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>HNWI Migration Trends</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{corridorLabel}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          High-net-worth wealth patterns and capital flow intelligence
        </Text>
      </View>

      {/* Confidence Metrics Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricsGroup}>
          {/* Confidence */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <View style={styles.metricValueRow}>
              <View style={styles.confidenceBars}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.confidenceBar,
                      i <= confidenceBars ? styles.confidenceBarActive : styles.confidenceBarInactive
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.metricValue}>{confidencePct}%</Text>
            </View>
          </View>

          {/* Trends Count */}
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Trends</Text>
            <Text style={styles.metricValue}>{trendsData.trends_count || trendsData.insights.length}</Text>
          </View>

          {/* Sources */}
          {trendsData.sources_count !== undefined && (
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Sources</Text>
              <Text style={styles.metricValue}>{trendsData.sources_count}</Text>
            </View>
          )}
        </View>

        {/* Quality Badge */}
        <View style={styles.qualityBadge}>
          <Text style={styles.qualityBadgeText}>KGv3 Verified</Text>
        </View>
      </View>

      {/* Trends List */}
      <View style={styles.trendsList}>
        {trendsData.insights.slice(0, 6).map((insight, index) => {
          const trendType = getTrendType(insight.content);
          const iconStyles = {
            corridor: { bg: styles.trendIconCorridor, text: styles.trendIconTextCorridor },
            outflow: { bg: styles.trendIconOutflow, text: styles.trendIconTextOutflow },
            inflow: { bg: styles.trendIconInflow, text: styles.trendIconTextInflow },
            default: { bg: styles.trendIconDefault, text: styles.trendIconTextDefault }
          };
          const itemStyles = {
            corridor: styles.trendItemCorridor,
            outflow: styles.trendItemOutflow,
            inflow: styles.trendItemInflow,
            default: {}
          };
          const iconLabel = {
            corridor: '→',
            outflow: '↗',
            inflow: '↙',
            default: '●'
          };

          return (
            <View key={index} style={[styles.trendItem, itemStyles[trendType]]}>
              <View style={[styles.trendIcon, iconStyles[trendType].bg]}>
                <Text style={[styles.trendIconText, iconStyles[trendType].text]}>
                  {iconLabel[trendType]}
                </Text>
              </View>
              <View style={styles.trendContent}>
                <Text style={styles.trendText}>{insight.content}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Data Sources Section */}
      {trendsData.collections_queried && trendsData.collections_queried.length > 0 && (
        <View style={styles.sourcesSection}>
          <Text style={styles.sourcesTitle}>KGv3 Collections Queried</Text>
          <View style={styles.sourcesGrid}>
            {trendsData.collections_queried.map((source, i) => (
              <View key={i} style={styles.sourceTag}>
                <Text style={styles.sourceTagText}>{source}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source Citations */}
      {trendsData.source_citations && trendsData.source_citations.length > 0 && (
        <View style={styles.citationsSection}>
          <Text style={styles.citationsTitle}>Source Citations</Text>
          {trendsData.source_citations.slice(0, 5).map((citation, index) => (
            <View key={index} style={styles.citationItem}>
              <View style={styles.citationBullet} />
              <Text style={styles.citationText}>
                {citation.title}
                {citation.date && <Text style={styles.citationDate}> ({citation.date})</Text>}
                {citation.reliability && (
                  <Text style={styles.citationReliability}> • {citation.reliability}</Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerDot} />
        <Text style={styles.footerText}>
          Powered by HNWI Chronicles KG Migration Intelligence + Henley Private Wealth Data
        </Text>
      </View>
    </View>
  );
}

export default PdfHNWITrendsSection;
