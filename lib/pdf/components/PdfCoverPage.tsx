/**
 * WORLD-CLASS COVER PAGE - Native PDF Component
 * Ultra-Premium SFO/Family Office Institutional Standard
 *
 * Design Inspiration: Bridgewater Associates, McKinsey & Co., Goldman Sachs
 * First Impression: Sets the tone for a $2,500+ institutional document
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, cleanJurisdiction, formatDate } from '../pdf-styles';
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

const cornerLineH = { width: 32, height: 1, backgroundColor: colors.gray[700] };
const cornerLineV = { width: 1, height: 32, backgroundColor: colors.gray[700] };
const goldBorder = { position: 'absolute' as const, left: 0, right: 0, height: 4, backgroundColor: colors.amber[500] };
const metricLabelStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 8.5, color: colors.gray[600], letterSpacing: 1.5, textTransform: 'uppercase' as const, marginBottom: 10 };

export const PdfCoverPage: React.FC<PdfCoverPageProps> = ({
  intakeId, sourceJurisdiction, destinationJurisdiction, generatedAt,
  exposureClass, valueCreation, verdict, precedentCount = 0, viaNegativa,
}) => {
  const currentYear = new Date().getFullYear();
  const verdictTheme = getVerdictTheme(viaNegativa?.isActive ? 'ABORT' : verdict);
  const quarterLabel = getQuarterLabel(generatedAt);

  return (
    <Page size="A4" style={{ backgroundColor: colors.black, padding: 0, position: 'relative' }}>
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

      {/* Main content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80, paddingVertical: 36, overflow: 'hidden' }}>
        {/* Premium Monogram Logo */}
        <View style={{ width: 64, height: 64, borderWidth: 2, borderColor: colors.amber[500], alignItems: 'center', justifyContent: 'center', marginBottom: 24, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: colors.amber[600] }} />
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: colors.amber[500], letterSpacing: -1 }}>H</Text>
        </View>

        {/* Brand name */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: colors.amber[500], letterSpacing: 8 }}>HNWI</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: colors.white, letterSpacing: 8 }}> CHRONICLES</Text>
        </View>

        {/* Tagline */}
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.gray[500], letterSpacing: 6, textTransform: 'uppercase', marginBottom: 20 }}>Private Intelligence Division</Text>

        {/* Premium divider with diamond */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ width: 60, height: 1, backgroundColor: colors.gray[700] }} />
          <View style={{ width: 8, height: 8, backgroundColor: colors.amber[500], transform: 'rotate(45deg)', marginHorizontal: 20 }} />
          <View style={{ width: 60, height: 1, backgroundColor: colors.gray[700] }} />
        </View>

        {/* Document classification */}
        <View style={{ borderWidth: 1, borderColor: colors.gray[600], paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.gray[400], letterSpacing: 3, textTransform: 'uppercase' }}>SFO Decision Memorandum — {quarterLabel}</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 36, color: colors.white, letterSpacing: -1, marginBottom: 8 }}>Pattern Audit</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 14, color: colors.gray[400], letterSpacing: 0.5, marginBottom: 28 }}>Strategic Intelligence Analysis</Text>

        {/* Verdict Preview Badge */}
        {!!verdict && !viaNegativa?.isActive && (
          <View style={{ marginBottom: 20, paddingVertical: 8, paddingHorizontal: 24, borderWidth: 2, borderColor: verdictTheme.primary }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: verdictTheme.primary, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' }}>{verdict}</Text>
          </View>
        )}

        {/* Jurisdiction corridor */}
        {!!sourceJurisdiction && !!destinationJurisdiction && (
          <View style={{ width: '100%', maxWidth: 380, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray[700], paddingVertical: 20, marginBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', minWidth: 120, maxWidth: 150 }}>
              <Text style={metricLabelStyle}>Origin</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: colors.white, letterSpacing: 0.5, maxWidth: 150, textAlign: 'center' }}>{cleanJurisdiction(sourceJurisdiction)}</Text>
            </View>
            <View style={{ marginHorizontal: 32, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 32, height: 1, backgroundColor: colors.amber[500] }} />
                <View style={{ width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: colors.amber[500] }} />
              </View>
            </View>
            <View style={{ alignItems: 'center', minWidth: 120, maxWidth: 150 }}>
              <Text style={metricLabelStyle}>Destination</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: colors.white, letterSpacing: 0.5, maxWidth: 150, textAlign: 'center' }}>{cleanJurisdiction(destinationJurisdiction)}</Text>
            </View>
          </View>
        )}

        {/* Key metrics */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          {!!exposureClass && (
            <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 0, marginRight: 2 }}>
              <Text style={metricLabelStyle}>Risk Profile</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: colors.amber[500], maxWidth: 140 }}>{exposureClass}</Text>
            </View>
          )}
          {!!valueCreation && (
            <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: colors.gray[800], marginRight: 2 }}>
              <Text style={metricLabelStyle}>Value Creation</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: colors.emerald[500] }}>{valueCreation}</Text>
            </View>
          )}
          {precedentCount > 0 && (
            <View style={{ paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: colors.gray[800], marginRight: 2 }}>
              <Text style={metricLabelStyle}>Intelligence Depth</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: colors.amber[500] }}>{precedentCount.toLocaleString()}+</Text>
            </View>
          )}
        </View>

        {/* Intelligence provenance */}
        {precedentCount > 0 && (
          <View style={{ marginBottom: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 9.5, color: colors.gray[500], letterSpacing: 0.3 }}>
              Powered by KGv3 — {precedentCount.toLocaleString()} validated developments analyzed
            </Text>
          </View>
        )}

        {/* Reference & Date */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: colors.gray[600] }}>Reference: </Text>
            <Text style={{ fontFamily: 'Courier-Bold', fontSize: 12, color: colors.gray[300], letterSpacing: 3 }}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 10, color: colors.gray[500] }}>{formatDate(generatedAt)}</Text>
        </View>

        {/* Confidential badge */}
        <View style={{ marginTop: 8 }}>
          <View style={{ borderWidth: 1.5, borderColor: colors.amber[500], paddingVertical: 10, paddingHorizontal: 28, position: 'relative' }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], letterSpacing: 4, textTransform: 'uppercase' }}>Confidential</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 56, left: 80, right: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: colors.gray[700], letterSpacing: 0.5 }}>© {currentYear} HNWI Chronicles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[600], borderRadius: 2, marginHorizontal: 8 }} />
          <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: colors.gray[700], letterSpacing: 0.5 }}>Private Intelligence Division</Text>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[600], borderRadius: 2, marginHorizontal: 8 }} />
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: colors.gray[700], letterSpacing: 0.5 }}>Institutional Grade</Text>
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
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 100, color: 'rgba(239, 68, 68, 0.25)', transform: 'rotate(-12deg)', letterSpacing: 20, textTransform: 'uppercase' }}>
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
