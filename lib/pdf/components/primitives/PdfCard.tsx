/**
 * PdfCard — Shared PDF card/panel primitive
 *
 * Design: Cards create the primary visual depth on dark pages.
 * cardBg (#1C1C1C) sits 7 brightness points above pageBg (#0C0C0C)
 * — enough contrast to be visible in PDF rendering without subpixel smoothing.
 *
 * Variants:
 *   default   → cardBg + visible border (workhorse)
 *   premium   → surfaceBg (elevated, no border — special emphasis)
 *   bordered  → cardBg + border + rounded (same as default, semantic alias)
 *   highlight → gold tint bg + gold border (key findings, verdicts)
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
    borderRadius: 0.01,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  premium: {
    backgroundColor: darkTheme.surfaceBg,
    borderRadius: 0.01,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  bordered: {
    backgroundColor: darkTheme.cardBg,
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 0.01,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  highlight: {
    backgroundColor: darkTheme.goldTint,
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    borderRadius: 0.01,
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
