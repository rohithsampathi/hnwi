/**
 * PdfMetricGrid — Shared PDF metric grid primitive
 * Replaces duplicated metric-box row patterns across 14 PDF components
 *
 * Uses: darkTheme, typography, spacing from pdf-styles (no local StyleSheet)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, typography, spacing } from '../../pdf-styles';

interface MetricItem {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

interface PdfMetricGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4;
}

export const PdfMetricGrid: React.FC<PdfMetricGridProps> = ({
  metrics,
  columns = 3,
}) => {
  const visibleMetrics = metrics.slice(0, columns);

  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: spacing.lg,
      }}
    >
      {visibleMetrics.map((metric, idx) => (
        <View
          key={idx}
          style={{
            flex: 1,
            backgroundColor: darkTheme.cardBg,
            borderWidth: 1,
            borderColor: darkTheme.border,
            borderRadius: 10,
            padding: spacing.md,
            alignItems: 'center',
            marginRight: idx < visibleMetrics.length - 1 ? spacing.sm : 0,
          }}
        >
          <Text
            style={{
              ...typography.micro,
              color: darkTheme.textMuted,
              textAlign: 'center',
              marginBottom: spacing.xs,
            }}
          >
            {metric.label}
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              color: metric.color || darkTheme.textPrimary,
              marginBottom: metric.subtext ? spacing.xs : 0,
            }}
          >
            {metric.value}
          </Text>
          {metric.subtext && (
            <Text
              style={{
                ...typography.small,
                color: darkTheme.textMuted,
                textAlign: 'center',
              }}
            >
              {metric.subtext}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
