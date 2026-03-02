/**
 * PdfBadge — Shared PDF badge/tag primitive
 * Replaces duplicated badge patterns across 14 PDF components
 *
 * Risk variants use getRiskColor/getRiskBgColor;
 * gold and info have special handling.
 *
 * Uses: darkTheme, typography, spacing, colors, getRiskColor, getRiskBgColor
 * from pdf-styles (no local StyleSheet)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import {
  darkTheme,
  typography,
  spacing,
  colors,
  getRiskColor,
  getRiskBgColor,
} from '../../pdf-styles';

type BadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'success'
  | 'info'
  | 'gold';

interface PdfBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const getVariantStyles = (
  variant: BadgeVariant
): { bg: string; fg: string } => {
  switch (variant) {
    case 'gold':
      return {
        bg: 'rgba(212, 168, 67, 0.15)',
        fg: colors.amber[500],
      };
    case 'info':
      return {
        bg: 'rgba(59, 130, 246, 0.12)',
        fg: colors.blue[400],
      };
    case 'success':
    case 'low':
      return {
        bg: getRiskBgColor('low'),
        fg: getRiskColor('low'),
      };
    case 'critical':
    case 'high':
      return {
        bg: getRiskBgColor(variant),
        fg: getRiskColor(variant),
      };
    case 'medium':
      return {
        bg: getRiskBgColor('medium'),
        fg: getRiskColor('medium'),
      };
    default:
      return {
        bg: darkTheme.surfaceBg,
        fg: darkTheme.textMuted,
      };
  }
};

export const PdfBadge: React.FC<PdfBadgeProps> = ({ label, variant }) => {
  const { bg, fg } = getVariantStyles(variant);

  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          ...typography.micro,
          color: fg,
          fontSize: 8,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
