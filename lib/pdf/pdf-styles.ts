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
    500: '#D4A843', // Primary gold — Commandment III
    600: '#8B7532', // Dark gold for emphasis
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
  black: '#0A0A0A', // Commandment III true black
  dark: '#141414', // Rich dark for covers
  gray: {
    50: '#fafaf9',   // Warm off-white
    100: '#f5f5f4',  // Light background
    200: '#e7e5e4',  // Borders, dividers
    300: '#d6d3d1',  // Muted elements
    400: '#a8a29e',  // Placeholder text
    500: '#78716c',  // Secondary text
    600: '#57534e',  // Body text
    700: '#44403c',  // Headings
    800: '#262626',  // Strong text
    900: '#141414',  // Darkest text
    950: '#0A0A0A',  // True black — Commandment III
  },
  // Accent - Deep Blue (trust, professionalism)
  // Warning - Orange (risk threshold 3–4)
  orange: {
    400: '#fb923c',
    500: '#f97316', // Primary orange
    600: '#ea580c',
  },
  // Caution - Yellow (risk threshold 5–6)
  yellow: {
    400: '#facc15',
    500: '#eab308', // Primary yellow
    600: '#ca8a04',
  },
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
  // Special - Background tints (dark mode — higher opacity for visibility on dark)
  tints: {
    goldLight: 'rgba(212, 168, 67, 0.08)',   // Subtle gold wash
    goldMedium: 'rgba(212, 168, 67, 0.15)',  // Gold highlight
    goldStrong: 'rgba(212, 168, 67, 0.25)',  // Gold border accent
    emeraldLight: 'rgba(16, 185, 129, 0.08)', // Subtle success
    emeraldMedium: 'rgba(16, 185, 129, 0.15)', // Success highlight
    redLight: 'rgba(239, 68, 68, 0.08)',     // Subtle alert
    redMedium: 'rgba(239, 68, 68, 0.15)',    // Alert highlight
    orangeMedium: 'rgba(249, 115, 22, 0.15)', // Orange highlight
    yellowMedium: 'rgba(234, 179, 8, 0.15)', // Yellow highlight
  },
};

// =============================================================================
// DARK THEME ALIASES — "Money Talking" Design Language
// Maps Commandment III exact values to semantic usage
// =============================================================================
export const darkTheme: Record<string, string> = {
  pageBg: '#0A0A0A',        // Page background
  cardBg: '#141414',        // Card / panel background
  surfaceBg: '#1A1A1A',     // Elevated surface
  border: '#262626',        // Border color
  borderSubtle: '#1F1F1F',  // Subtle border
  textPrimary: '#F5F5F5',   // Primary text (headings, values)
  textSecondary: '#D4D4D4', // Secondary text (body)
  textMuted: '#A3A3A3',     // Muted text (labels, captions)
  textFaint: '#737373',     // Faint text (footnotes)
  gold: '#D4A843',          // Primary gold accent
  goldMuted: '#8B7532',     // Muted gold
  goldTint: 'rgba(212, 168, 67, 0.08)', // Gold wash bg
};

// Snapshot of original dark values for restoration after light-mode PDF export
const _darkThemeValues = { ...darkTheme };

// Institutional light theme — exact match to web UI (globals.css :root values)
const _lightThemeValues: Record<string, string> = {
  pageBg: '#FFFFFF',        // --background
  cardBg: '#FAFAFA',        // --surface (stone-50)
  surfaceBg: '#F5F5F5',     // --surface-hover (stone-100)
  border: '#D4D4D4',        // --border (stone-300)
  borderSubtle: '#E5E5E5',  // stone-200
  textPrimary: '#0A0A0A',   // --foreground (stone-950)
  textSecondary: '#262626',  // stone-800
  textMuted: '#525252',     // --muted-foreground (stone-600)
  textFaint: '#737373',     // stone-500
  gold: '#D4A843',          // --gold (exact match)
  goldMuted: '#8B7532',     // --gold-muted (exact match)
  goldTint: 'rgba(212, 168, 67, 0.08)',
};

// =============================================================================
// TYPOGRAPHY SCALE (8pt baseline grid)
// Matches web UI: Inter for all text, Courier for mono
// =============================================================================
export const typography = {
  // Hero - Impact numbers (tax savings, scores) — biggest visual emphasis
  hero: {
    fontSize: 48,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -1,
    lineHeight: 1.0,
  },
  // Display - Cover pages, major headings
  display: {
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
  // H1 - Page titles
  h1: {
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.3,
    lineHeight: 1.2,
  },
  // H2 - Section headers
  h2: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: 0,
    lineHeight: 1.3,
  },
  // H3 - Subsection headers
  h3: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 0,
    lineHeight: 1.35,
  },
  // H4 - Card titles
  h4: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  // Body - Primary content
  body: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 400 as const,
    lineHeight: 1.65,
  },
  // Small - Secondary content
  small: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  // Micro - Labels, captions
  micro: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    lineHeight: 1.4,
  },
  // Mono - Citations/references
  mono: {
    fontSize: 8,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  // Mono small
  monoSmall: {
    fontSize: 8,
    fontFamily: 'Courier',
    letterSpacing: 0.3,
  },
};

// =============================================================================
// SPACING SCALE (4pt baseline) - Tighter for more compact layout
// =============================================================================
export const spacing = {
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

// =============================================================================
// SHARED STYLES — rebuilt on theme swap via buildPdfStyles()
// =============================================================================
function buildPdfStyles() {
  return StyleSheet.create({
    // Page layouts
    page: {
      fontFamily: 'Inter',
      fontSize: 10,
      paddingTop: 48,
      paddingBottom: 56,
      paddingHorizontal: 48,
      backgroundColor: darkTheme.pageBg,
      color: darkTheme.textSecondary,
    },
    pageDark: {
      fontFamily: 'Inter',
      fontSize: 10,
      padding: 0,
      backgroundColor: darkTheme.pageBg,
      color: darkTheme.textSecondary,
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
      color: darkTheme.textPrimary,
      marginBottom: spacing.md,
    },
    h2: {
      ...typography.h2,
      color: darkTheme.textPrimary,
      marginBottom: spacing.md,
    },
    h3: {
      ...typography.h3,
      color: darkTheme.textPrimary,
      marginBottom: spacing.sm,
    },
    h4: {
      ...typography.h4,
      color: darkTheme.textSecondary,
      marginBottom: spacing.xs,
    },
    bodyText: {
      ...typography.body,
      color: darkTheme.textMuted,
    },
    smallText: {
      ...typography.small,
      color: darkTheme.textMuted,
    },
    label: {
      ...typography.micro,
      color: darkTheme.textMuted,
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
      borderBottomColor: darkTheme.border,
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

    // Cards
    card: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardBordered: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardDark: {
      backgroundColor: darkTheme.surfaceBg,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardHighlight: {
      backgroundColor: darkTheme.goldTint,
      borderWidth: 1.5,
      borderColor: colors.amber[500],
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },

    // Metrics grid
    metricsGrid: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    metricBox: {
      flex: 1,
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 10,
      padding: spacing.md,
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    metricValue: {
      fontSize: 20,
      fontFamily: 'Inter',
      fontWeight: 700 as const,
      color: darkTheme.textPrimary,
      marginBottom: spacing.xs,
    },
    metricLabel: {
      ...typography.micro,
      color: darkTheme.textMuted,
      textAlign: 'center',
    },

    // Tags/Badges
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    badgeAmber: {
      backgroundColor: 'rgba(212, 168, 67, 0.15)',
    },
    badgeGreen: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    badgeRed: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    badgeGray: {
      backgroundColor: darkTheme.surfaceBg,
    },
    badgeText: {
      ...typography.micro,
    },

    // Tables
    table: {
      width: '100%',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 10,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: darkTheme.surfaceBg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: darkTheme.borderSubtle,
      backgroundColor: darkTheme.pageBg,
    },
    tableRowAlt: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: darkTheme.borderSubtle,
      backgroundColor: darkTheme.cardBg,
    },
    tableCell: {
      flex: 1,
      ...typography.small,
      color: darkTheme.textSecondary,
    },
    tableCellHeader: {
      flex: 1,
      ...typography.micro,
      color: darkTheme.textPrimary,
    },

    // Special elements
    divider: {
      height: 1,
      backgroundColor: darkTheme.border,
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
      backgroundColor: darkTheme.cardBg,
      borderRadius: 12,
      padding: spacing.xl,
      marginBottom: spacing.lg,
    },
    verdictTitle: {
      ...typography.display,
      color: darkTheme.textPrimary,
      marginBottom: spacing.sm,
    },

    // Risk indicators
    riskHigh: {
      color: colors.red[400],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
    },
    riskMedium: {
      color: colors.amber[500],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
    },
    riskLow: {
      color: colors.emerald[400],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
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
      borderTopColor: darkTheme.border,
    },
    footerText: {
      ...typography.monoSmall,
      color: darkTheme.textFaint,
    },
    footerBrand: {
      ...typography.micro,
      color: colors.amber[500],
      fontSize: 8.5,
    },

    // Intelligence note (grounded indicator)
    groundedNote: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: darkTheme.cardBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: darkTheme.border,
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
      color: darkTheme.textMuted,
      fontSize: 8.5,
    },

    // Hero number display (tax savings, scores)
    heroValue: {
      ...typography.hero,
      color: darkTheme.textPrimary,
    },

    // Verdict-themed table header (colored top border)
    tableHeaderVerdict: {
      flexDirection: 'row',
      backgroundColor: darkTheme.surfaceBg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderTopWidth: 3,
    },

    // Verdict-themed card (left accent border)
    cardVerdict: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderLeftWidth: 3,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },

    // Verdict-themed metric highlight
    metricBoxVerdict: {
      flex: 1,
      padding: spacing.md,
      alignItems: 'center',
      marginRight: spacing.sm,
      borderBottomWidth: 3,
    },
  });
}

export let pdfStyles = buildPdfStyles();

/**
 * Swap PDF color theme before rendering.
 * Call with 'light' before pdf().toBlob(), then restore with 'dark' in a finally block.
 */
export function setPdfThemeMode(mode: 'light' | 'dark') {
  Object.assign(darkTheme, mode === 'light' ? _lightThemeValues : _darkThemeValues);
  pdfStyles = buildPdfStyles();
}

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
    return colors.red[400];
  } else if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    return colors.amber[500];
  }
  return colors.emerald[400];
};

/**
 * Get risk background color based on level (dark tints for dark backgrounds)
 */
export const getRiskBgColor = (level: string): string => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 'critical' || normalizedLevel === 'high') {
    return 'rgba(239, 68, 68, 0.12)';
  } else if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') {
    return 'rgba(212, 168, 67, 0.12)';
  }
  return 'rgba(16, 185, 129, 0.12)';
};
