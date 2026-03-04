/**
 * WORLD-CLASS COVER PAGE - Native PDF Component
 * Ultra-Premium SFO/Family Office Institutional Standard
 *
 * Design Inspiration: Bridgewater Associates, McKinsey & Co., Goldman Sachs
 * First Impression: Sets the tone for a $2,500+ institutional document
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, typography, spacing, cleanJurisdiction, formatDate } from '../pdf-styles';
import { getVerdictTheme } from '../pdf-verdict-theme';

interface PdfCoverPageProps {
  intakeId: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  generatedAt: string;
  exposureClass?: string;
  valueCreation?: string;
  verdict?: string;
  precedentCount?: number;
  viaNegativa?: {
    isActive: boolean;
    badgeLabel: string;
  };
}

/** Dynamic quarter from generated date or current date */
const getQuarterLabel = (dateStr?: string): string => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
};

// =============================================================================
// LOCAL STYLES — composed from centralized typography tokens
// =============================================================================

/** Brand monogram letter (32pt bold) */
const monogramText = {
  ...typography.h1,
  fontSize: 32,
  letterSpacing: -1,
  color: colors.amber[500],
};

/** Brand title (32pt bold, wide tracking) */
const brandTitle = {
  ...typography.h1,
  fontSize: 32,
  letterSpacing: 8,
};

/** Tagline — uppercase 10pt bold, very wide tracking */
const tagline = {
  ...typography.smallBold,
  letterSpacing: 6,
  textTransform: 'uppercase' as const,
  color: darkTheme.textFaint,
};

/** Document classification — uppercase 10pt bold, moderate tracking */
const classification = {
  ...typography.smallBold,
  letterSpacing: 3,
  textTransform: 'uppercase' as const,
  color: darkTheme.textMuted,
};

/** Cover page main title (40pt display) */
const coverTitle = {
  ...typography.display,
  fontSize: 40,
  letterSpacing: -1,
  color: darkTheme.textPrimary,
};

/** Cover page subtitle (15pt regular) */
const coverSubtitle = {
  ...typography.body,
  fontSize: 15,
  fontWeight: 400 as const,
  letterSpacing: 0.5,
  color: darkTheme.textMuted,
};

/** Verdict badge text — uppercase 13pt bold, wide tracking */
const verdictBadge = {
  ...typography.h3,
  fontWeight: 700 as const,
  letterSpacing: 4,
  textTransform: 'uppercase' as const,
};

/** Metric label — uppercase 9pt bold, 1.5 tracking (metric context labels) */
const metricLabelStyle = {
  ...typography.microBold,
  letterSpacing: 1.5,
  color: darkTheme.textFaint,
  marginBottom: 10,
};

/** Jurisdiction name — 20pt bold metric */
const jurisdictionName = {
  ...typography.metricMd,
  fontSize: 20,
  letterSpacing: 0.5,
  color: darkTheme.textPrimary,
};

/** Cover metric value (18pt bold) */
const coverMetricValue = {
  ...typography.metricMd,
  fontSize: 18,
};

/** Provenance line — 10pt regular, subtle tracking */
const provenanceLine = {
  ...typography.small,
  letterSpacing: 0.3,
  color: darkTheme.textFaint,
};

/** Reference label — 10pt regular */
const referenceLabel = {
  ...typography.small,
  color: darkTheme.textFaint,
};

/** Reference ID — mono bold 13pt, wide tracking */
const referenceId = {
  ...typography.mono,
  fontFamily: 'Courier-Bold' as const,
  fontSize: 13,
  letterSpacing: 3,
  color: darkTheme.textMuted,
};

/** Date line — body 11pt regular */
const dateLine = {
  ...typography.body,
  color: darkTheme.textFaint,
};

/** Confidential badge — uppercase 10pt bold, wide tracking */
const confidentialBadge = {
  ...typography.smallBold,
  letterSpacing: 4,
  textTransform: 'uppercase' as const,
  color: colors.amber[500],
};

/** Footer text — 9pt caption with tracking */
const footerText = {
  ...typography.caption,
  letterSpacing: 0.5,
  color: darkTheme.textFaint,
};

/** Watermark — massive 100pt bold, ultra-wide tracking */
const watermark = {
  ...typography.hero,
  fontSize: 100,
  letterSpacing: 20,
  textTransform: 'uppercase' as const,
  color: colors.tints.redStrong,
};

// =============================================================================
// LAYOUT CONSTANTS
// =============================================================================

const cornerLineH = { width: 32, height: 1, backgroundColor: darkTheme.border };
const cornerLineV = { width: 1, height: 32, backgroundColor: darkTheme.border };
const goldBorder = { position: 'absolute' as const, left: 0, right: 0, height: 4, backgroundColor: colors.amber[500] };

export const PdfCoverPage: React.FC<PdfCoverPageProps> = ({
  intakeId, sourceJurisdiction, destinationJurisdiction, generatedAt,
  exposureClass, valueCreation, verdict, precedentCount = 0, viaNegativa,
}) => {
  const currentYear = new Date().getFullYear();
  const verdictTheme = getVerdictTheme(viaNegativa?.isActive ? 'ABORT' : verdict);
  const quarterLabel = getQuarterLabel(generatedAt);

  return (
    <Page size="A4" style={{ backgroundColor: darkTheme.pageBg, padding: 0, position: 'relative' }}>
      {/* Premium gold border - top + verdict color accent */}
      <View style={{ ...goldBorder, top: 0 }} />
      <View style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 2, backgroundColor: verdictTheme.primary }} />

      {/* Refined corner accents */}
      <View style={{ position: 'absolute', top: 48, left: 48 }}>
        <View style={cornerLineH} />
        <View style={cornerLineV} />
      </View>
      <View style={{ position: 'absolute', top: 48, right: 48 }}>
        <View style={{ ...cornerLineH, alignSelf: 'flex-end' }} />
        <View style={{ ...cornerLineV, position: 'absolute', right: 0 }} />
      </View>

      {/* Main content — wrap={false} prevents any overflow to a second page */}
      <View wrap={false} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80, paddingVertical: 28, overflow: 'hidden' }}>
        {/* Premium Monogram Logo */}
        <View style={{ width: 52, height: 52, borderWidth: 2, borderColor: colors.amber[500], alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: colors.amber[600] }} />
          <Text style={{ ...monogramText, fontSize: 26 }}>H</Text>
        </View>

        {/* Brand name */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
          <Text style={{ ...brandTitle, color: colors.amber[500] }}>HNWI</Text>
          <Text style={{ ...brandTitle, color: darkTheme.textPrimary }}> CHRONICLES</Text>
        </View>

        {/* Tagline */}
        <Text style={{ ...tagline, marginBottom: 16 }}>Private Intelligence Division</Text>

        {/* Premium divider with diamond */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ width: 60, height: 1, backgroundColor: darkTheme.border }} />
          <View style={{ width: 8, height: 8, backgroundColor: colors.amber[500], transform: 'rotate(45deg)', marginHorizontal: spacing.lg }} />
          <View style={{ width: 60, height: 1, backgroundColor: darkTheme.border }} />
        </View>

        {/* Document classification */}
        <View style={{ borderWidth: 1, borderColor: darkTheme.border, paddingHorizontal: 18, paddingVertical: 6, marginBottom: 12 }}>
          <Text style={classification}>SFO Decision Memorandum — {quarterLabel}</Text>
        </View>
        <Text style={{ ...coverTitle, marginBottom: 6 }}>Pattern Audit</Text>
        <Text style={{ ...coverSubtitle, marginBottom: 20 }}>Strategic Intelligence Analysis</Text>

        {/* Verdict Preview Badge */}
        {!!verdict && !viaNegativa?.isActive && (
          <View style={{ marginBottom: 16, paddingVertical: 8, paddingHorizontal: spacing.xl, borderWidth: 2, borderColor: verdictTheme.primary }}>
            <Text style={{ ...verdictBadge, color: verdictTheme.primary, textAlign: 'center' }}>{verdict}</Text>
          </View>
        )}

        {/* Jurisdiction corridor */}
        {!!sourceJurisdiction && !!destinationJurisdiction && (
          <View style={{ width: '100%', maxWidth: 400, borderTopWidth: 1, borderBottomWidth: 1, borderColor: darkTheme.border, paddingVertical: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', minWidth: 120, maxWidth: 160 }}>
              <Text style={{ ...metricLabelStyle, marginBottom: 6 }}>Origin</Text>
              <Text style={{ ...jurisdictionName, textAlign: 'center' }}>{cleanJurisdiction(sourceJurisdiction)}</Text>
            </View>
            <View style={{ marginHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 36, height: 2, backgroundColor: colors.amber[500] }} />
                <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 7, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: colors.amber[500] }} />
              </View>
            </View>
            <View style={{ alignItems: 'center', minWidth: 120, maxWidth: 160 }}>
              <Text style={{ ...metricLabelStyle, marginBottom: 6 }}>Destination</Text>
              <Text style={{ ...jurisdictionName, textAlign: 'center' }}>{cleanJurisdiction(destinationJurisdiction)}</Text>
            </View>
          </View>
        )}

        {/* Key metrics */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {!!exposureClass && (
            <View style={{ paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 0, marginRight: spacing.xs }}>
              <Text style={{ ...metricLabelStyle, marginBottom: 6 }}>Risk Profile</Text>
              <Text style={{ ...coverMetricValue, color: colors.amber[500], maxWidth: 150 }}>{exposureClass}</Text>
            </View>
          )}
          {!!valueCreation && (
            <View style={{ paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: darkTheme.border, marginRight: spacing.xs }}>
              <Text style={{ ...metricLabelStyle, marginBottom: 6 }}>Value Creation</Text>
              <Text style={{ ...coverMetricValue, color: colors.amber[500] }}>{valueCreation}</Text>
            </View>
          )}
          {precedentCount > 0 && (
            <View style={{ paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: darkTheme.border, marginRight: spacing.xs }}>
              <Text style={{ ...metricLabelStyle, marginBottom: 6 }}>Intelligence Depth</Text>
              <Text style={{ ...coverMetricValue, color: colors.amber[500] }}>{precedentCount.toLocaleString()}+</Text>
            </View>
          )}
        </View>

        {/* Intelligence provenance */}
        {precedentCount > 0 && (
          <View style={{ marginBottom: spacing.sm, alignItems: 'center' }}>
            <Text style={provenanceLine}>
              Powered by KGv3 — {precedentCount.toLocaleString()} validated developments analyzed
            </Text>
          </View>
        )}

        {/* Reference & Date */}
        <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={referenceLabel}>Reference: </Text>
            <Text style={referenceId}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={dateLine}>{formatDate(generatedAt)}</Text>
        </View>

        {/* Confidential badge */}
        <View style={{ marginTop: 6 }}>
          <View style={{ borderWidth: 1.5, borderColor: colors.amber[500], paddingVertical: 10, paddingHorizontal: 32, position: 'relative' }}>
            <Text style={confidentialBadge}>Confidential</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 52, left: 80, right: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={footerText}>© {currentYear} HNWI Chronicles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginHorizontal: spacing.sm }} />
          <Text style={footerText}>Private Intelligence Division</Text>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginHorizontal: spacing.sm }} />
        </View>
        <Text style={footerText}>Institutional Grade</Text>
      </View>

      {/* Corner accents - bottom */}
      <View style={{ position: 'absolute', bottom: 48, left: 48 }}>
        <View style={{ ...cornerLineV, marginBottom: 0 }} />
        <View style={cornerLineH} />
      </View>
      <View style={{ position: 'absolute', bottom: 48, right: 48 }}>
        <View style={{ ...cornerLineV, position: 'absolute', right: 0, bottom: 0 }} />
        <View style={{ ...cornerLineH, alignSelf: 'flex-end' }} />
      </View>

      {/* Via Negativa: VETOED watermark overlay */}
      {viaNegativa?.isActive && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...watermark, transform: 'rotate(-12deg)' }}>
            {viaNegativa.badgeLabel}
          </Text>
        </View>
      )}

      {/* Premium gold border - bottom */}
      <View style={{ ...goldBorder, bottom: 0 }} />
    </Page>
  );
};

export default PdfCoverPage;
