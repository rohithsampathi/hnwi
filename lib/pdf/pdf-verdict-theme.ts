/**
 * VERDICT-BASED COLOR THEMING
 * Dynamic color palettes driven by the audit verdict (PROCEED/RESTRUCTURE/ABORT)
 * Mirrors web MemoHeader theme logic for PDF consistency
 */

import { colors } from './pdf-styles';

export interface VerdictTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  gradient: [string, string];
  accentBar: string;
  badgeBg: string;
  badgeText: string;
  heroAccent: string;
  trackBg: string;
  /** Softer tint for table row highlights */
  tint: string;
}

const emeraldTheme: VerdictTheme = {
  primary: colors.amber[500],
  light: colors.tints.goldMedium,
  dark: colors.amber[600],
  bg: colors.tints.goldLight,
  gradient: [colors.amber[400], colors.amber[600]],
  accentBar: colors.amber[500],
  badgeBg: colors.tints.goldMedium,
  badgeText: colors.amber[500],
  heroAccent: colors.amber[500],
  trackBg: colors.tints.goldLight,
  tint: colors.tints.goldLight,
};

const amberTheme: VerdictTheme = {
  primary: colors.amber[500],
  light: colors.tints.goldMedium,
  dark: colors.amber[500],
  bg: colors.tints.goldLight,
  gradient: [colors.amber[400], colors.amber[600]],
  accentBar: colors.amber[500],
  badgeBg: colors.tints.goldMedium,
  badgeText: colors.amber[500],
  heroAccent: colors.amber[500],
  trackBg: colors.tints.goldLight,
  tint: colors.tints.goldLight,
};

const redTheme: VerdictTheme = {
  primary: colors.red[500],
  light: colors.tints.redMedium,
  dark: colors.red[400],
  bg: colors.tints.redLight,
  gradient: [colors.red[400], colors.red[600]],
  accentBar: colors.red[500],
  badgeBg: colors.tints.redMedium,
  badgeText: colors.red[400],
  heroAccent: colors.red[400],
  trackBg: colors.tints.redLight,
  tint: colors.tints.redLight,
};

/**
 * Map a verdict string to its institutional color theme.
 * Handles all known verdict variants from the backend.
 */
export function getVerdictTheme(verdict?: string): VerdictTheme {
  if (!verdict) return amberTheme;

  const v = verdict.toUpperCase().trim();

  // PROCEED family → Emerald
  if (
    v === 'PROCEED' ||
    v === 'APPROVED' ||
    v === 'PROCEED WITH ENHANCEMENTS' ||
    v === 'STRONG PROCEED'
  ) {
    return emeraldTheme;
  }

  // RESTRUCTURE family → Amber
  if (
    v === 'RESTRUCTURE' ||
    v === 'CONDITIONAL' ||
    v === 'CONDITIONAL PROCEED' ||
    v === 'RESTRUCTURE REQUIRED' ||
    v === 'REVIEW'
  ) {
    return amberTheme;
  }

  // ABORT family → Red
  if (
    v === 'ABORT' ||
    v === 'VETOED' ||
    v === 'REJECT' ||
    v === 'DO NOT PROCEED' ||
    v === 'CAPITAL ALLOCATION DENIED'
  ) {
    return redTheme;
  }

  // Default to amber for unknown verdicts
  return amberTheme;
}

/**
 * Utility: get a simple verdict label color for inline text usage
 */
export function getVerdictColor(verdict?: string): string {
  const theme = getVerdictTheme(verdict);
  return theme.primary;
}
