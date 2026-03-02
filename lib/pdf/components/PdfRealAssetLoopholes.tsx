/**
 * PdfRealAssetLoopholes — Loophole strategies sub-component
 * Extracted from PdfRealAssetAuditSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme } from '../pdf-styles';

interface LoopholeStrategy {
  name: string;
  tax_savings_potential?: string;
  mechanism?: string;
  description?: string;
  requirements?: string[];
  timeline?: string;
}

interface PdfRealAssetLoopholesProps {
  strategies: LoopholeStrategy[];
}

export const PdfRealAssetLoopholes: React.FC<PdfRealAssetLoopholesProps> = ({ strategies }) => {
  if (!Array.isArray(strategies) || strategies.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, marginTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        Tax Strategies / Loopholes
      </Text>
      {strategies.slice(0, 4).map((strategy, idx) => (
        <View key={idx} style={{ marginBottom: 12, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, borderLeftWidth: 4, borderLeftColor: colors.emerald[500], padding: 14, position: 'relative', overflow: 'hidden' }} wrap={false}>
          {/* Corner accent */}
          <View style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, backgroundColor: 'rgba(16,185,129,0.08)', borderBottomLeftRadius: 60 }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, position: 'relative', zIndex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 24, height: 24, backgroundColor: colors.emerald[500], borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.pageBg }}>{idx + 1}</Text>
              </View>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, flex: 1, lineHeight: 1.3 }}>{strategy.name}</Text>
            </View>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: colors.emerald[400] }}>{strategy.tax_savings_potential}</Text>
          </View>

          {/* Description */}
          {!!(strategy.mechanism || strategy.description) && (
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted, lineHeight: 1.5, marginBottom: 10 }}>
              {strategy.mechanism || strategy.description}
            </Text>
          )}

          {/* Requirements tags */}
          {Array.isArray(strategy.requirements) && strategy.requirements.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {strategy.requirements.slice(0, 3).map((req, i) => (
                <View key={i} style={{ backgroundColor: darkTheme.surfaceBg, borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted }}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timeline */}
          {!!strategy.timeline && (
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
              Timeline: {strategy.timeline}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
