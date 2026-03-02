/**
 * PdfCard — Shared PDF card/panel primitive
 * Replaces duplicated card patterns across 14 PDF components
 *
 * Variants map directly to darkTheme values:
 *   default   → cardBg + border
 *   premium   → surfaceBg, no border (elevated look)
 *   bordered  → cardBg + border + rounded
 *   highlight → gold tint background + gold border
 *
 * Uses: darkTheme, spacing, colors from pdf-styles (no local StyleSheet)
 */

import React from 'react';
import { View, Style } from '@react-pdf/renderer';
import { darkTheme, spacing, colors } from '../../pdf-styles';

interface PdfCardProps {
  variant?: 'default' | 'premium' | 'bordered' | 'highlight';
  children: React.ReactNode;
}

const variantStyles: Record<string, Style> = {
  default: {
    backgroundColor: darkTheme.cardBg,
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  premium: {
    backgroundColor: darkTheme.surfaceBg,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  bordered: {
    backgroundColor: darkTheme.cardBg,
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  highlight: {
    backgroundColor: darkTheme.goldTint,
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
};

export const PdfCard: React.FC<PdfCardProps> = ({
  variant = 'default',
  children,
}) => (
  <View style={variantStyles[variant] || variantStyles.default}>
    {children}
  </View>
);
