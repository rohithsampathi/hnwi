/**
 * WORLD-CLASS LAST PAGE - Confidentiality & Legal Notice
 * Bridgewater / McKinsey / Goldman Sachs institutional standard
 *
 * Design: Closing impression of a $2,500 document.
 * Must feel premium, authoritative, and complete.
 * Mirrors cover page visual language for bookend consistency.
 *
 * PDF Mobile: All text ≥9pt for readability at 40% effective size.
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, typography, spacing } from '../pdf-styles';
import { getVerdictTheme } from '../pdf-verdict-theme';

/* ─── Local composed styles ─────────────────────────────────────────────── */
const s = {
  // Corner bracket lines
  lnH: { width: 32, height: 1, backgroundColor: darkTheme.border },
  lnV: { width: 1, height: 32, backgroundColor: darkTheme.border },

  // Footer items (caption + letterSpacing override)
  footer: { ...typography.caption, color: darkTheme.textFaint, letterSpacing: 0.5 },

  // Monogram "H" — 32pt bold, custom size between h1 (24) and display (42)
  monogramLetter: { ...typography.h1, fontSize: 32, color: colors.amber[500], letterSpacing: -1 },

  // Brand title pair — h1 with wide tracking
  brandGold: { ...typography.h1, color: colors.amber[500], letterSpacing: 7 },
  brandWhite: { ...typography.h1, color: darkTheme.textPrimary, letterSpacing: 7 },

  // Subtitle — smallBold + wide tracking + uppercase
  subtitle: { ...typography.smallBold, color: darkTheme.textFaint, letterSpacing: 5, textTransform: 'uppercase' as const },

  // Verdict badge — h3 weight bumped to 700, wide tracking, uppercase
  verdictBadge: { ...typography.h3, fontWeight: 700 as const, letterSpacing: 4, textTransform: 'uppercase' as const, textAlign: 'center' as const },

  // Copyright — body weight, muted
  copyright: { ...typography.body, color: darkTheme.textMuted },

  // Via Negativa CTA heading — metricSm + letterSpacing
  ctaHeading: { ...typography.metricSm, color: colors.amber[500], letterSpacing: 1, textAlign: 'center' as const },

  // Via Negativa CTA body — caption + lineHeight override
  ctaBody: { ...typography.caption, color: darkTheme.textMuted, textAlign: 'center' as const, lineHeight: 1.6 },

  // Via Negativa slots label — microBold + wide tracking
  ctaSlots: { ...typography.microBold, color: colors.amber[500], letterSpacing: 2, textTransform: 'uppercase' as const },

  // Via Negativa button text — bodyBold + letterSpacing
  ctaButton: { ...typography.bodyBold, color: darkTheme.contrastText, letterSpacing: 1 },

  // Via Negativa footnote — caption (matches token exactly)
  ctaFootnote: { ...typography.caption, color: darkTheme.textFaint, textAlign: 'center' as const, lineHeight: 1.5 },

  // Confidentiality heading — smallBold + wide tracking + uppercase
  confidentialHeading: { ...typography.smallBold, color: colors.amber[500], letterSpacing: 3, textTransform: 'uppercase' as const, textAlign: 'center' as const },

  // Confidentiality body — small + lineHeight override
  confidentialBody: { ...typography.small, color: darkTheme.textMuted, lineHeight: 1.7, textAlign: 'center' as const },

  // Notice card title — microBold + letterSpacing override
  noticeTitle: { ...typography.microBold, color: darkTheme.textMuted, letterSpacing: 1.5, textTransform: 'uppercase' as const },

  // Notice card body — caption + lineHeight override
  noticeBody: { ...typography.caption, color: darkTheme.textFaint, lineHeight: 1.6 },

  // Document reference label — small, faint
  refLabel: { ...typography.small, color: darkTheme.textFaint },

  // Document reference ID — Courier-Bold mono at h3 size
  refId: { fontFamily: 'Courier-Bold' as const, fontSize: typography.h3.fontSize, letterSpacing: 3, color: darkTheme.textMuted },

  // Generated date — small, faint
  refDate: { ...typography.small, color: darkTheme.textFaint },

  // Website URL — bodyBold + letterSpacing
  urlText: { ...typography.bodyBold, color: colors.amber[500], letterSpacing: 2 },
} as const;

interface PdfLastPageProps {
  intakeId: string;
  precedentCount?: number;
  generatedAt?: string;
  verdict?: string;
  viaNegativa?: { isActive: boolean; dayOneLoss: number; ctaBody: string };
}

export const PdfLastPage: React.FC<PdfLastPageProps> = ({ intakeId, precedentCount = 0, generatedAt, verdict, viaNegativa }) => {
  const yr = new Date().getFullYear();
  const dOpts = { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const };
  const genDate = generatedAt ? new Date(generatedAt).toLocaleDateString('en-US', dOpts) : new Date().toLocaleDateString('en-US', dOpts);
  const vt = getVerdictTheme(viaNegativa?.isActive ? 'ABORT' : verdict);

  return (
    <Page size="A4" style={{ backgroundColor: darkTheme.pageBg, padding: 0, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: colors.amber[500] }} />
      <View style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 2, backgroundColor: vt.primary }} />
      <View style={{ position: 'absolute', top: spacing.xxxl, left: spacing.xxxl }}><View style={s.lnH} /><View style={s.lnV} /></View>
      <View style={{ position: 'absolute', top: spacing.xxxl, right: spacing.xxxl }}><View style={{ ...s.lnH, alignSelf: 'flex-end' }} /><View style={{ ...s.lnV, position: 'absolute', right: 0 }} /></View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80, paddingVertical: 32 }}>
        {/* Monogram */}
        <View style={{ width: 52, height: 52, borderWidth: 2, borderColor: colors.amber[500], alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderWidth: 1, borderColor: colors.amber[600] }} />
          <Text style={{ ...s.monogramLetter, fontSize: 26 }}>H</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
          <Text style={s.brandGold}>HNWI</Text>
          <Text style={s.brandWhite}> CHRONICLES</Text>
        </View>
        <Text style={{ ...s.subtitle, marginBottom: 20 }}>Private Intelligence Division</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: spacing.xxxl, height: 1, backgroundColor: darkTheme.border, marginHorizontal: spacing.sm }} />
          <View style={{ width: 6, height: 6, backgroundColor: colors.amber[500], transform: 'rotate(45deg)' }} />
          <View style={{ width: spacing.xxxl, height: 1, backgroundColor: darkTheme.border, marginHorizontal: spacing.sm }} />
        </View>

        {!!verdict && !viaNegativa?.isActive && (
          <View style={{ marginBottom: 16, paddingVertical: 8, paddingHorizontal: 28, borderWidth: 2, borderColor: vt.primary }}>
            <Text style={{ ...s.verdictBadge, color: vt.primary }}>{verdict}</Text>
          </View>
        )}
        <Text style={{ ...s.copyright, marginBottom: 24 }}>{'\u00A9'} {yr} HNWI Chronicles. All Rights Reserved.</Text>

        {viaNegativa?.isActive && (
          <View style={{ width: '100%', maxWidth: 440, borderWidth: 2, borderColor: colors.amber[500], padding: 20, marginBottom: 20, alignItems: 'center' }}>
            <Text style={{ ...s.ctaHeading, marginBottom: 8 }}>DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?</Text>
            <Text style={{ ...s.ctaBody, marginBottom: 12, maxWidth: 360 }}>{viaNegativa.ctaBody}</Text>
            <Text style={{ ...s.ctaSlots, marginBottom: 10 }}>5 Slots Remaining — February Cycle</Text>
            <View style={{ backgroundColor: colors.amber[500], paddingVertical: 8, paddingHorizontal: 24, marginBottom: 12 }}>
              <Text style={s.ctaButton}>INITIATE YOUR PATTERN AUDIT — $5,000</Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: darkTheme.border, paddingTop: 10, width: '100%' }}>
              <Text style={s.ctaFootnote}>
                {'For Indian Family Offices: This sample analyzes a US > Singapore corridor. The same Pattern Recognition Engine applies to India > Dubai, India > Singapore, India > Portugal, and 50+ other corridors.'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ width: '100%', maxWidth: 440, marginBottom: 24 }}>
          <View style={{ borderWidth: 1.5, borderColor: colors.amber[500], padding: 20, marginBottom: 16 }}>
            <Text style={{ ...s.confidentialHeading, marginBottom: 12 }}>Confidentiality Notice</Text>
            <Text style={s.confidentialBody}>
              This SFO Pattern Audit report is confidential and proprietary to HNWI Chronicles. Unauthorized distribution, reproduction, or disclosure is strictly prohibited. This document is intended solely for the use of the individual or entity to whom it is addressed.
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[
              { title: 'Intelligence Base', text: `Powered by ${precedentCount > 0 ? precedentCount.toLocaleString() : '1,500'}+ analyzed HNWI developments and regulatory precedents from our proprietary KGv3 knowledge graph.` },
              { title: 'Important Notice', text: 'For execution and implementation, consult qualified legal, tax, and financial advisory teams. Past patterns do not guarantee future outcomes.' },
            ].map((n, i) => (
              <View key={i} style={{ flex: 1, borderTopWidth: 2, borderTopColor: darkTheme.surfaceBg, paddingTop: 12, marginRight: i === 0 ? 20 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ width: 6, height: 6, backgroundColor: colors.amber[500], borderRadius: 3, marginRight: spacing.sm }} />
                  <Text style={s.noticeTitle}>{n.title}</Text>
                </View>
                <Text style={s.noticeBody}>{n.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={s.refLabel}>Document Reference: </Text>
            <Text style={s.refId}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={s.refDate}>Generated: {genDate}</Text>
        </View>
        <View style={{ marginTop: 8, borderWidth: 1, borderColor: darkTheme.border, paddingVertical: 10, paddingHorizontal: 24 }}>
          <Text style={s.urlText}>app.hnwichronicles.com</Text>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: spacing.xxxl, left: spacing.xxxl }}><View style={{ ...s.lnV, marginBottom: 0 }} /><View style={s.lnH} /></View>
      <View style={{ position: 'absolute', bottom: spacing.xxxl, right: spacing.xxxl }}><View style={{ ...s.lnV, position: 'absolute', right: 0, bottom: 0 }} /><View style={{ ...s.lnH, alignSelf: 'flex-end' }} /></View>
      <View style={{ position: 'absolute', bottom: 56, left: 80, right: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.footer}>{'\u00A9'} {yr} HNWI Chronicles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginHorizontal: spacing.sm }} />
          <Text style={s.footer}>End of Document</Text>
          <View style={{ width: 4, height: 4, backgroundColor: colors.amber[500], borderRadius: 2, marginHorizontal: spacing.sm }} />
        </View>
        <Text style={s.footer}>Institutional Grade</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: colors.amber[500] }} />
    </Page>
  );
};

export default PdfLastPage;
