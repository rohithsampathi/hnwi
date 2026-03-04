/**
 * WORLD-CLASS UHNWI PDF STYLES - @react-pdf/renderer
 * Standards: Family Office / Private Bank / Institutional Quality
 * Target: $2,500+ Decision Audits for Ultra-High-Net-Worth ($30M+)
 *
 * Design Thinking:
 * WHO: 45-60yr UHNWIs or CIO/advisors reading on mobile (iPad/iPhone)
 * CONTEXT: $2,500 document — must feel premium, trustworthy, scannable
 * READING: Pinch-to-zoom on specific sections. Effective font ~40% of PDF pt.
 *
 * Principles:
 * 1. SCANNABLE IN 3 SECONDS — key message per page at a glance
 * 2. MOBILE-FIRST — 11pt min body (≈6.6pt effective on mobile)
 * 3. PREMIUM FEEL — generous whitespace, strong hierarchy
 * 4. PDF-OPTIMIZED CONTRAST — no subpixel smoothing, need bigger color gaps
 * 5. DATA FIRST — numbers dominate, text supports
 * 6. GOLD AS POWER — strategic accents, not everywhere
 *
 * Built-in fonts:
 * - Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
 * - Times-Roman, Times-Bold, Times-Italic, Times-BoldItalic
 * - Courier, Courier-Bold, Courier-Oblique, Courier-BoldOblique
 */

import { StyleSheet } from '@react-pdf/renderer';

// =============================================================================
// INSTITUTIONAL COLOR PALETTE
// Bridgewater / Goldman Sachs / McKinsey / Family Office Standards
// =============================================================================
export const colors = {
  // Primary Brand Gold — warm institutional, not garish
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
  // Success — Deep Emerald (wealth, growth)
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Alert — Sophisticated Red (urgency without alarm)
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Premium Neutrals
  white: '#ffffff',
  offWhite: '#fafaf9',
  black: '#0A0A0A',
  dark: '#141414',
  gray: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#262626',
    900: '#141414',
    950: '#0A0A0A',
  },
  // Warning — Orange (risk threshold 3–4)
  orange: {
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
  },
  // Caution — Yellow (risk threshold 5–6)
  yellow: {
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
  },
  // Trust — Deep Blue
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Background tints — AGGRESSIVELY boosted for dark-mode PDF clarity.
  // On dark backgrounds (#0C0C0C), rgba() tints must be strong enough
  // to create visible colored regions, not near-black rectangles.
  tints: {
    goldLight: 'rgba(212, 168, 67, 0.20)',
    goldMedium: 'rgba(212, 168, 67, 0.30)',
    goldStrong: 'rgba(212, 168, 67, 0.40)',
    goldHeavy: 'rgba(212, 168, 67, 0.55)',
    goldSubtle: 'rgba(212, 168, 67, 0.12)',       // Radar chart fill — subtle gold
    goldMutedSubtle: 'rgba(139, 117, 50, 0.15)',  // Radar chart fill — muted gold
    emeraldLight: 'rgba(16, 185, 129, 0.20)',
    emeraldMedium: 'rgba(16, 185, 129, 0.30)',
    emeraldStrong: 'rgba(16, 185, 129, 0.40)',
    redLight: 'rgba(239, 68, 68, 0.20)',
    redMedium: 'rgba(239, 68, 68, 0.30)',
    redStrong: 'rgba(239, 68, 68, 0.40)',
    // Deep red tints — uses red[700] (#b91c1c) for institutional severity
    redDeepSubtle: 'rgba(185, 28, 28, 0.15)',     // Severity background, barrier zones
    redDeepLight: 'rgba(185, 28, 28, 0.20)',      // Severity badge background
    redDeepStrong: 'rgba(185, 28, 28, 0.40)',     // Barrier zone accent
    blueLight: 'rgba(59, 130, 246, 0.20)',
    blueMedium: 'rgba(59, 130, 246, 0.30)',
    orangeMedium: 'rgba(249, 115, 22, 0.30)',
    yellowMedium: 'rgba(234, 179, 8, 0.30)',
  },
};

// =============================================================================
// DARK THEME — "Money Talking" Design Language
// KEY INSIGHT: PDF needs MORE contrast than screen.
// Screen: #0A0A0A → #141414 = 4pt gap (fine with subpixel smoothing)
// PDF:    #0C0C0C → #1C1C1C = 7pt gap (visible without smoothing)
// =============================================================================
export const darkTheme: Record<string, string> = {
  pageBg: '#0C0C0C',        // Page background — lifted from pure black for print safety
  cardBg: '#1C1C1C',        // Card background — 7pt gap from page (visible in PDF)
  surfaceBg: '#272727',     // Elevated surface — clear third layer
  border: '#3A3A3A',        // Border — actually visible on dark backgrounds
  borderSubtle: '#2E2E2E',  // Subtle border — still perceptible
  textPrimary: '#FFFFFF',   // Primary text — pure white for max contrast
  textSecondary: '#E8E8E8', // Body text — bright, comfortable to read
  textMuted: '#B0B0B0',     // Labels/captions — clearly readable
  textFaint: '#999999',     // Footnotes — boosted for PDF readability (was #808080)
  gold: '#D4A843',          // Primary gold accent
  goldMuted: '#8B7532',     // Muted gold
  goldTint: colors.tints.goldLight,
  contrastText: '#FFFFFF',  // Text on colored backgrounds (buttons, badges) — always white
};

// Snapshot for restoration after light-mode export
const _darkThemeValues = { ...darkTheme };

// Light theme — match web UI globals.css :root
// White bg, dark text, same gold accents. Institutional light = crisp, not pastel.
const _lightThemeValues: Record<string, string> = {
  pageBg: '#FFFFFF',
  cardBg: '#FAFAFA',
  surfaceBg: '#F5F5F5',
  border: '#D4D4D4',
  borderSubtle: '#E5E5E5',
  textPrimary: '#0A0A0A',
  textSecondary: '#262626',
  textMuted: '#525252',
  textFaint: '#737373',
  gold: '#D4A843',
  goldMuted: '#8B7532',
  goldTint: 'rgba(212, 168, 67, 0.10)', // Softer on white backgrounds
  contrastText: '#FFFFFF',  // Text on colored backgrounds — always white regardless of theme
};

// =============================================================================
// TYPOGRAPHY — Mobile-First Sizing
// A4 on iPhone: effective size ≈ 40% of PDF pt
// 11pt PDF → ~6.6pt effective. Below 6pt is unreadable.
// Every size chosen with mobile viewing in mind.
// =============================================================================
export const typography = {
  // Hero — Impact numbers (verdict scores, tax savings)
  hero: {
    fontSize: 52,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -1.5,
    lineHeight: 1.0,
  },
  // Display — Cover page title, major page headings
  display: {
    fontSize: 42,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
  // H1 — Page titles (one per page)
  h1: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.3,
    lineHeight: 1.2,
  },
  // H2 — Section headers (commands attention)
  h2: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.2,
    lineHeight: 1.3,
  },
  // H3 — Subsection headers
  h3: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 0,
    lineHeight: 1.35,
  },
  // H4 — Card titles, inline headers
  h4: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 0,
    lineHeight: 1.4,
  },
  // Body — Primary content (11pt = readable on mobile)
  body: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 400 as const,
    lineHeight: 1.65,
  },
  // Small — Secondary content, table cells
  small: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  // Micro — Labels, badges, captions (uppercase helps readability at small size)
  micro: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 600 as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    lineHeight: 1.4,
  },
  // Bold body — Section sub-titles, emphasized body text
  bodyBold: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    lineHeight: 1.4,
  },
  // Bold small — Emphasized table cells, metric values, secondary titles
  smallBold: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    lineHeight: 1.4,
  },
  // Bold micro — Metric labels, uppercase badges (bolder than micro's 600)
  microBold: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    lineHeight: 1.4,
  },
  // Caption — 9pt non-uppercase body (footnotes, secondary info)
  caption: {
    fontSize: 9,
    fontFamily: 'Inter',
    fontWeight: 400 as const,
    lineHeight: 1.5,
  },
  // Metric large — Hero-style metrics (22pt)
  metricLg: {
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
    letterSpacing: -0.5,
  },
  // Metric medium — Card metrics (16pt)
  metricMd: {
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
  },
  // Metric small — Inline metrics (14pt)
  metricSm: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: 700 as const,
  },
  // Mono — Citations, reference IDs
  mono: {
    fontSize: 9,
    fontFamily: 'Courier',
    letterSpacing: 0.5,
  },
  // Mono small — Footnotes
  monoSmall: {
    fontSize: 8.5,
    fontFamily: 'Courier',
    letterSpacing: 0.3,
  },
};

// =============================================================================
// SPACING — Premium Whitespace
// "More whitespace = more expensive" principle
// Previous: xs:3 sm:6 md:10 lg:14 — felt cramped, cheap
// New: generous gaps that say "$2,500 document"
// =============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 48,
};

// =============================================================================
// SHARED STYLES — rebuilt on theme swap via buildPdfStyles()
// =============================================================================
function buildPdfStyles() {
  return StyleSheet.create({
    // ─── Page Layouts ──────────────────────────────────────────────
    page: {
      fontFamily: 'Inter',
      fontSize: 11,
      paddingTop: 52,
      paddingBottom: 60,
      paddingHorizontal: 52,
      backgroundColor: darkTheme.pageBg,
      color: darkTheme.textSecondary,
    },
    pageDark: {
      fontFamily: 'Inter',
      fontSize: 11,
      padding: 0,
      backgroundColor: darkTheme.pageBg,
      color: darkTheme.textSecondary,
    },
    coverPage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 60,
    },

    // ─── Typography ────────────────────────────────────────────────
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
      color: darkTheme.textSecondary,
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

    // ─── Extended Typography (composition of typography + color) ────
    // Section sub-title — bold uppercase 11pt within pages
    sectionTitle: {
      ...typography.bodyBold,
      color: darkTheme.textPrimary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: spacing.md,
    },
    // Caption — 9pt non-uppercase muted text
    caption: {
      ...typography.caption,
      color: darkTheme.textMuted,
    },
    captionFaint: {
      ...typography.caption,
      color: darkTheme.textFaint,
    },
    // Inline metric label — bold 9pt uppercase muted (no textAlign: center)
    inlineMetricLabel: {
      ...typography.microBold,
      color: darkTheme.textMuted,
    },
    // Inline metric value — bold 12pt primary
    inlineMetricValue: {
      ...typography.h4,
      fontWeight: 700,
      color: darkTheme.textPrimary,
    },
    // Large metric — 22pt primary
    metricLg: {
      ...typography.metricLg,
      color: darkTheme.textPrimary,
    },
    // Footer center text — used in all page footers
    footerCenter: {
      ...typography.caption,
      color: darkTheme.textFaint,
      letterSpacing: 0.5,
    },

    // ─── Layout ────────────────────────────────────────────────────
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

    // ─── Cards ─────────────────────────────────────────────────────
    // Key: cardBg (#1C1C1C) is 7 brightness points above pageBg (#0C0C0C)
    // Visible boundary without needing aggressive borders
    card: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 0.01,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardBordered: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 0.01,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardDark: {
      backgroundColor: darkTheme.surfaceBg,
      borderRadius: 0.01,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardHighlight: {
      backgroundColor: darkTheme.goldTint,
      borderWidth: 1.5,
      borderColor: colors.amber[500],
      borderRadius: 0.01,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },

    // ─── Metrics Grid ──────────────────────────────────────────────
    // Numbers are THE thing UHNWIs scan for. Make them BIG.
    metricsGrid: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    metricBox: {
      flex: 1,
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 0.01,
      padding: spacing.md,
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    metricValue: {
      fontSize: 26,
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

    // ─── Badges ────────────────────────────────────────────────────
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 0.01,
    },
    badgeAmber: {
      backgroundColor: colors.tints.goldMedium,
    },
    badgeGreen: {
      backgroundColor: colors.tints.emeraldMedium,
    },
    badgeRed: {
      backgroundColor: colors.tints.redMedium,
    },
    badgeGray: {
      backgroundColor: darkTheme.surfaceBg,
    },
    badgeText: {
      ...typography.micro,
    },

    // ─── Tables ────────────────────────────────────────────────────
    table: {
      width: '100%',
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderRadius: 0.01,
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

    // ─── Special Elements ──────────────────────────────────────────
    divider: {
      height: 1,
      backgroundColor: darkTheme.border,
      marginVertical: spacing.lg,
    },
    accentLine: {
      width: 6,
      height: 24,
      backgroundColor: colors.amber[500],
      borderRadius: 3,
      marginRight: spacing.sm,
    },

    // Verdict box
    verdictBox: {
      backgroundColor: darkTheme.cardBg,
      borderRadius: 0.01,
      padding: spacing.xl,
      marginBottom: spacing.lg,
    },
    verdictTitle: {
      ...typography.display,
      color: darkTheme.textPrimary,
      marginBottom: spacing.sm,
    },

    // ─── Risk Indicators ───────────────────────────────────────────
    riskHigh: {
      color: colors.red[700],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
    },
    riskMedium: {
      color: colors.amber[500],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
    },
    riskLow: {
      color: colors.emerald[600],
      fontFamily: 'Inter',
      fontWeight: 700 as const,
    },

    // ─── Footer ────────────────────────────────────────────────────
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 52,
      right: 52,
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
      fontSize: 9,
    },

    // ─── Intelligence Note ─────────────────────────────────────────
    groundedNote: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: darkTheme.cardBg,
      borderRadius: 0.01,
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
      fontSize: 9,
    },

    // Hero number display
    heroValue: {
      ...typography.hero,
      color: darkTheme.textPrimary,
    },

    // ─── Verdict-themed variants ───────────────────────────────────
    tableHeaderVerdict: {
      flexDirection: 'row',
      backgroundColor: darkTheme.surfaceBg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderTopWidth: 3,
    },
    cardVerdict: {
      backgroundColor: darkTheme.cardBg,
      borderWidth: 1,
      borderColor: darkTheme.border,
      borderLeftWidth: 3,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
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
 */
export const formatCurrency = (value: number | string | undefined | null | Record<string, unknown>): string => {
  if (value === undefined || value === null) return '$0';

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
 * Format large numbers with K/M/B abbreviations
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
 * Clean jurisdiction name
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
 * Format date in short format
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
  if (normalizedLevel === 'critical') return colors.red[700];
  if (normalizedLevel === 'high') return colors.amber[600];
  if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') return colors.amber[500];
  return colors.emerald[600];
};

/**
 * Get risk background color — boosted opacity for PDF visibility
 */
export const getRiskBgColor = (level: string): string => {
  const normalizedLevel = level.toLowerCase();
  if (normalizedLevel === 'critical') return colors.tints.redDeepSubtle;
  if (normalizedLevel === 'high') return colors.tints.redDeepSubtle;
  if (normalizedLevel === 'medium' || normalizedLevel === 'moderate') return colors.tints.goldLight;
  return colors.tints.emeraldLight;
};
