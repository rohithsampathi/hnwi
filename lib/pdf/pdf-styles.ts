/**
 * WORLD-CLASS UHNWI PDF STYLES - @react-pdf/renderer
 * Standards: Family Office / Private Bank / Institutional Quality
 * Target: $2,500+ Decision Audits for Ultra-High-Net-Worth ($30M+)
 *
 * Design Philosophy:
 * - Understated elegance over flashy design
 * - Precise typography hierarchy
 * - Generous whitespace for readability
 * - Subtle color usage with strategic accents
 * - Print-optimized for archival quality
 *
 * Built-in fonts available:
 * - Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
 * - Times-Roman, Times-Bold, Times-Italic, Times-BoldItalic
 * - Courier, Courier-Bold, Courier-Oblique, Courier-BoldOblique
 */

import { StyleSheet } from '@react-pdf/renderer';

// =============================================================================
// INSTITUTIONAL COLOR PALETTE
// Inspired by: Bridgewater, Goldman Sachs, McKinsey, Family Office Standards
// =============================================================================
export const colors = {
  // Primary Brand - Refined Gold (warm, not garish)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#c9a227', // Primary gold - warm, sophisticated
    600: '#a78b1f', // Dark gold for emphasis
    700: '#856d17',
    800: '#634f0f',
    900: '#423407',
  },
  // Success - Deep Emerald (wealth, growth)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Primary success
    600: '#059669', // Deep emerald for text
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Alert - Sophisticated Red (urgency without alarm)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Primary alert
    600: '#dc2626', // Deep red for text
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Premium Neutrals - Warm undertones for sophistication
  white: '#ffffff',
  offWhite: '#fafaf9', // Warm white for backgrounds
  black: '#0c0a09', // Warm black
  dark: '#1c1917', // Rich dark for covers
  gray: {
    50: '#fafaf9',   // Warm off-white
    100: '#f5f5f4',  // Light background
    200: '#e7e5e4',  // Borders, dividers
    300: '#d6d3d1',  // Muted elements
    400: '#a8a29e',  // Placeholder text
    500: '#78716c',  // Secondary text
    600: '#57534e',  // Body text
    700: '#44403c',  // Headings
    800: '#292524',  // Strong text
    900: '#1c1917',  // Darkest text
    950: '#0c0a09',  // True black
  },
  // Accent - Deep Blue (trust, professionalism)
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Primary blue
    600: '#2563eb', // Deep blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Special - Background tints
  tints: {
    goldLight: 'rgba(201, 162, 39, 0.05)',   // Subtle gold wash
    goldMedium: 'rgba(201, 162, 39, 0.10)',  // Gold highlight
    emeraldLight: 'rgba(16, 185, 129, 0.05)', // Subtle success
    emeraldMedium: 'rgba(16, 185, 129, 0.10)', // Success highlight
    redLight: 'rgba(239, 68, 68, 0.05)',     // Subtle alert
    redMedium: 'rgba(239, 68, 68, 0.10)',    // Alert highlight
  },
};

// =============================================================================
// TYPOGRAPHY SCALE (8pt baseline grid)
// =============================================================================
export const typography = {
  // Display - Cover pages, major headings
  display: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
  // H1 - Page titles
  h1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.3,
    lineHeight: 1.2,
  },
  // H2 - Section headers
  h2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.2,
    lineHeight: 1.25,
  },
  // H3 - Subsection headers
  h3: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.1,
    lineHeight: 1.3,
  },
  // H4 - Card titles
  h4: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0,
    lineHeight: 1.35,
  },
  // Body - Primary content
  body: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  // Small - Secondary content
  small: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
  },
  // Micro - Labels, captions
  micro: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
  // Mono - Reference numbers, codes
  mono: {
    fontSize: 9,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  // Mono small
  monoSmall: {
    fontSize: 7,
    fontFamily: 'Courier',
    letterSpacing: 0.3,
  },
};

// =============================================================================
// SPACING SCALE (4pt baseline)
// =============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// =============================================================================
// SHARED STYLES
// =============================================================================
export const pdfStyles = StyleSheet.create({
  // Page layouts
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: colors.white,
    color: colors.gray[700],
  },
  pageDark: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 0,
    backgroundColor: colors.dark,
    color: colors.gray[200],
  },

  // Cover/Last page specific
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 56,
  },

  // Typography styles
  h1: {
    ...typography.h1,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  h2: {
    ...typography.h2,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  h3: {
    ...typography.h3,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  h4: {
    ...typography.h4,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  bodyText: {
    ...typography.body,
    color: colors.gray[600],
  },
  smallText: {
    ...typography.small,
    color: colors.gray[500],
  },
  label: {
    ...typography.micro,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },

  // Layout containers
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Cards - Premium rounded styling
  card: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardBordered: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardDark: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHighlight: {
    backgroundColor: colors.tints.goldLight,
    borderWidth: 1.5,
    borderColor: colors.amber[500],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.micro,
    color: colors.gray[500],
    textAlign: 'center',
  },

  // Tags/Badges - Pill shaped
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeAmber: {
    backgroundColor: colors.amber[100],
  },
  badgeGreen: {
    backgroundColor: colors.emerald[100],
  },
  badgeRed: {
    backgroundColor: colors.red[100],
  },
  badgeGray: {
    backgroundColor: colors.gray[100],
  },
  badgeText: {
    ...typography.micro,
  },

  // Tables - Refined styling
  table: {
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    backgroundColor: colors.gray[50],
  },
  tableCell: {
    flex: 1,
    ...typography.small,
    color: colors.gray[700],
  },
  tableCellHeader: {
    flex: 1,
    ...typography.micro,
    color: colors.white,
  },

  // Special elements
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.lg,
  },
  accentLine: {
    width: 4,
    height: 20,
    backgroundColor: colors.amber[500],
    borderRadius: 2,
    marginRight: spacing.sm,
  },

  // Verdict box
  verdictBox: {
    backgroundColor: colors.gray[900],
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  verdictTitle: {
    ...typography.display,
    color: colors.white,
    marginBottom: spacing.sm,
  },

  // Risk indicators
  riskHigh: {
    color: colors.red[600],
    fontFamily: 'Helvetica-Bold',
  },
  riskMedium: {
    color: colors.amber[600],
    fontFamily: 'Helvetica-Bold',
  },
  riskLow: {
    color: colors.emerald[600],
    fontFamily: 'Helvetica-Bold',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  footerText: {
    ...typography.monoSmall,
    color: colors.gray[400],
  },
  footerBrand: {
    ...typography.micro,
    color: colors.amber[500],
    fontSize: 7,
  },

  // Intelligence note (grounded indicator)
  groundedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  groundedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.amber[500],
    marginRight: spacing.sm,
  },
  groundedText: {
    ...typography.micro,
    color: colors.gray[500],
    fontSize: 6,
  },
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format currency with intelligent abbreviation
 * Handles edge cases: objects, nulls, strings with currency symbols
 */
export const formatCurrency = (value: number | string | undefined | null | Record<string, unknown>): string => {
  if (value === undefined || value === null) return '$0';

  // Handle object values that might contain the actual number
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.value === 'number') return formatCurrency(obj.value);
    if (typeof obj.amount === 'number') return formatCurrency(obj.amount);
    if (typeof obj.total === 'number') return formatCurrency(obj.total);
    return '$0';
  }

  const num = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value;

  if (isNaN(num)) return '$0';

  // Format based on magnitude
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return `${sign}$${(absNum / 1_000_000_000).toFixed(2)}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}$${(absNum / 1_000_000).toFixed(2)}M`;
  } else if (absNum >= 10_000) {
    return `${sign}$${(absNum / 1_000).toFixed(0)}K`;
  } else if (absNum >= 1_000) {
    return `${sign}$${(absNum / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${absNum.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

/**
 * Format large numbers with K/M/B abbreviations (no currency symbol)
 */
export const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0';
  const absNum = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(1)}B`;
  } else if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(1)}M`;
  } else if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(1)}K`;
  }
  return `${sign}${absNum.toLocaleString('en-US')}`;
};

/**
 * Format percentage with sign
 */
export const formatPercent = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '0%';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(0)}%`;
};

/**
 * Clean jurisdiction name - handles objects and formatting
 */
export const cleanJurisdiction = (jurisdiction?: string | Record<string, unknown>): string => {
  if (!jurisdiction) return '';
  if (typeof jurisdiction === 'object') {
    const obj = jurisdiction as Record<string, unknown>;
    if (typeof obj.name === 'string') return cleanJurisdiction(obj.name);
    if (typeof obj.country === 'string') return cleanJurisdiction(obj.country);
    return '';
  }
  if (typeof jurisdiction !== 'string') return String(jurisdiction);

  return jurisdiction
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format date in institutional style
 */
export const formatDate = (dateString?: string | Record<string, unknown>): string => {
  const defaultFormat = { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };

  if (!dateString) {
    return new Date().toLocaleDateString('en-US', defaultFormat);
  }

  if (typeof dateString === 'object') {
    const obj = dateString as Record<string, unknown>;
    if (typeof obj.date === 'string') return formatDate(obj.date);
    if (typeof obj.timestamp === 'string') return formatDate(obj.timestamp);
    return new Date().toLocaleDateString('en-US', defaultFormat);
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-US', defaultFormat);
  }
  return date.toLocaleDateString('en-US', defaultFormat);
};

/**
 * Format date in short format (Jan 24, 2026)
 */
export const formatDateShort = (dateString?: string): string => {
  if (!dateString) {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Get risk color based on level
 */
export const getRiskColor = (level: string): string => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 'critical' || normalizedLevel === 'high') {
    return colors.red[600];
  } else if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    return colors.amber[600];
  }
  return colors.emerald[600];
};

/**
 * Get risk background color based on level
 */
export const getRiskBgColor = (level: string): string => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 'critical' || normalizedLevel === 'high') {
    return colors.red[100];
  } else if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    return colors.amber[100];
  }
  return colors.emerald[100];
};
