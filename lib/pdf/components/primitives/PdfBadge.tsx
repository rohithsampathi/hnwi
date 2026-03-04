/**
 * PdfBadge — Status badge/tag primitive
 *
 * Design: Badges must be readable at 9pt with boosted tint backgrounds.
 * PDF rendering flattens low-opacity colors — tints use 22% opacity minimum.
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
        bg: colors.tints.goldMedium,
        fg: colors.amber[500],
      };
    case 'info':
      return {
        bg: colors.tints.blueMedium,
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
        borderRadius: 0.01,
      }}
    >
      <Text
        style={{
          ...typography.micro,
          color: fg,
        }}
      >
        {label}
      </Text>
    </View>
  );
};
