/**
 * WORLD-CLASS LAST PAGE - Confidentiality & Legal Notice
 * Bridgewater / McKinsey / Goldman Sachs institutional standard
 */

import React from 'react';
import { Page, View, Text } from '@react-pdf/renderer';
import { colors } from '../pdf-styles';
import { getVerdictTheme } from '../pdf-verdict-theme';

const c = colors;
const lnH = { width: 32, height: 1, backgroundColor: c.gray[700] };
const lnV = { width: 1, height: 32, backgroundColor: c.gray[700] };
const ft = { fontFamily: 'Inter' as const, fontSize: 8.5, color: c.gray[700], letterSpacing: 0.5 };

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
    <Page size="A4" style={{ backgroundColor: c.gray[950], padding: 0, position: 'relative' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: c.amber[500] }} />
      <View style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 2, backgroundColor: vt.primary }} />
      <View style={{ position: 'absolute', top: 48, left: 48 }}><View style={lnH} /><View style={lnV} /></View>
      <View style={{ position: 'absolute', top: 48, right: 48 }}><View style={[lnH, { alignSelf: 'flex-end' }]} /><View style={[lnV, { position: 'absolute', right: 0 }]} /></View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 80, paddingVertical: 72 }}>
        {/* Monogram */}
        <View style={{ width: 64, height: 64, borderWidth: 2, borderColor: c.amber[500], alignItems: 'center', justifyContent: 'center', marginBottom: 32, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderWidth: 1, borderColor: c.amber[600] }} />
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, color: c.amber[500], letterSpacing: -1 }}>H</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: c.amber[500], letterSpacing: 7 }}>HNWI</Text>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 24, color: c.white, letterSpacing: 7 }}> CHRONICLES</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: c.gray[500], letterSpacing: 5, textTransform: 'uppercase', marginBottom: 48 }}>Private Intelligence Division</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 48, height: 1, backgroundColor: c.gray[700], marginHorizontal: 8 }} />
          <View style={{ width: 6, height: 6, backgroundColor: c.amber[500], transform: 'rotate(45deg)' }} />
          <View style={{ width: 48, height: 1, backgroundColor: c.gray[700], marginHorizontal: 8 }} />
        </View>

        {!!verdict && !viaNegativa?.isActive && (
          <View style={{ marginBottom: 24, paddingVertical: 10, paddingHorizontal: 28, borderWidth: 2, borderColor: vt.primary }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: vt.primary, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' }}>{verdict}</Text>
          </View>
        )}
        <Text style={{ fontFamily: 'Inter', fontSize: 10, color: c.gray[400], marginBottom: 40 }}>{'\u00A9'} {yr} HNWI Chronicles. All Rights Reserved.</Text>

        {viaNegativa?.isActive && (
          <View style={{ width: '100%', maxWidth: 440, borderWidth: 2, borderColor: c.amber[500], padding: 24, marginBottom: 32, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: c.amber[500], letterSpacing: 1, textAlign: 'center', marginBottom: 10 }}>DOES YOUR CURRENT DEAL SURVIVE THIS FILTER?</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 8, color: c.gray[400], textAlign: 'center', lineHeight: 1.6, marginBottom: 16, maxWidth: 360 }}>{viaNegativa.ctaBody}</Text>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: c.amber[600], letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>5 Slots Remaining — February Cycle</Text>
            <View style={{ backgroundColor: c.amber[500], paddingVertical: 10, paddingHorizontal: 24, marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: c.gray[950], letterSpacing: 1 }}>INITIATE YOUR PATTERN AUDIT — $5,000</Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: c.gray[700], paddingTop: 12, width: '100%' }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 7, color: c.gray[500], textAlign: 'center', lineHeight: 1.5 }}>
                {'For Indian Family Offices: This sample analyzes a US > Singapore corridor. The same Pattern Recognition Engine applies to India > Dubai, India > Singapore, India > Portugal, and 50+ other corridors.'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ width: '100%', maxWidth: 440, marginBottom: 40 }}>
          <View style={{ borderWidth: 1.5, borderColor: c.amber[500], padding: 28, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: c.amber[500], letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>Confidentiality Notice</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 10, color: c.gray[400], lineHeight: 1.7, textAlign: 'center' }}>
              This SFO Pattern Audit report is confidential and proprietary to HNWI Chronicles. Unauthorized distribution, reproduction, or disclosure is strictly prohibited. This document is intended solely for the use of the individual or entity to whom it is addressed.
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {[
              { title: 'Intelligence Base', text: `Powered by ${precedentCount > 0 ? precedentCount.toLocaleString() : '1,500'}+ analyzed HNWI developments and regulatory precedents from our proprietary KGv3 knowledge graph.` },
              { title: 'Important Notice', text: 'For execution and implementation, consult qualified legal, tax, and financial advisory teams. Past patterns do not guarantee future outcomes.' },
            ].map((n, i) => (
              <View key={i} style={{ flex: 1, borderTopWidth: 2, borderTopColor: c.gray[800], paddingTop: 16, marginRight: i === 0 ? 24 : 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ width: 6, height: 6, backgroundColor: c.amber[600], borderRadius: 3, marginRight: 8 }} />
                  <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: c.gray[400], letterSpacing: 1.5, textTransform: 'uppercase' }}>{n.title}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: c.gray[500], lineHeight: 1.6 }}>{n.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: c.gray[600] }}>Document Reference: </Text>
            <Text style={{ fontFamily: 'Courier-Bold', fontSize: 12, color: c.gray[300], letterSpacing: 3 }}>{intakeId.slice(10, 22).toUpperCase()}</Text>
          </View>
          <Text style={{ fontFamily: 'Inter', fontSize: 9, color: c.gray[600] }}>Generated: {genDate}</Text>
        </View>
        <View style={{ marginTop: 20, borderWidth: 1, borderColor: c.gray[700], paddingVertical: 12, paddingHorizontal: 24 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: c.amber[500], letterSpacing: 2 }}>app.hnwichronicles.com</Text>
        </View>
      </View>

      <View style={{ position: 'absolute', bottom: 48, left: 48 }}><View style={[lnV, { marginBottom: 0 }]} /><View style={lnH} /></View>
      <View style={{ position: 'absolute', bottom: 48, right: 48 }}><View style={[lnV, { position: 'absolute', right: 0, bottom: 0 }]} /><View style={[lnH, { alignSelf: 'flex-end' }]} /></View>
      <View style={{ position: 'absolute', bottom: 56, left: 80, right: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={ft}>{'\u00A9'} {yr} HNWI Chronicles</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 4, height: 4, backgroundColor: c.amber[600], borderRadius: 2, marginHorizontal: 8 }} />
          <Text style={ft}>End of Document</Text>
          <View style={{ width: 4, height: 4, backgroundColor: c.amber[600], borderRadius: 2, marginHorizontal: 8 }} />
        </View>
        <Text style={ft}>Institutional Grade</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: c.amber[500] }} />
    </Page>
  );
};

export default PdfLastPage;
