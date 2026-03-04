/**
 * PdfMetricGrid — Metric display grid primitive
 *
 * Design: Numbers are THE thing UHNWIs scan for.
 * - Values at 26pt (visible even when zoomed out on mobile)
 * - Labels in micro uppercase (institutional look)
 * - Each metric box clearly bounded with visible border
 * - Generous padding inside boxes
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
            borderRadius: 0.01,
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
              fontSize: metric.value.length > 12 ? 13 : metric.value.length > 6 ? 18 : 26,
              fontFamily: 'Inter',
              fontWeight: 700,
              color: metric.color || darkTheme.textPrimary,
              textAlign: 'center',
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
