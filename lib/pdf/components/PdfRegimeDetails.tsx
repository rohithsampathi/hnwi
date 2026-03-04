/**
 * PdfRegimeDetails — Benefits, routes, considerations, process, actions sub-component
 * Extracted from PdfRegimeIntelligenceSection for Commandment VII (150-line max)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme } from '../pdf-styles';

interface QualificationRoute { route: string; minimum_investment: string; processing_time: string }
interface CriticalConsideration { item: string; detail: string; priority: "HIGH" | "MEDIUM" | "LOW" }
interface ApplicationStep { step: number; action: string; timeline: string }

interface PdfRegimeDetailsProps {
  keyBenefits?: string[];
  qualificationRoutes?: QualificationRoute[];
  criticalConsiderations?: CriticalConsideration[];
  applicationProcess?: ApplicationStep[];
  actionRequired?: string;
  successorRegime?: string;
  regimeWarnings?: Array<{ regime: string; status: string; warning: string; critical_dates?: Array<{ date: string; event: string }> }>;
}

export const PdfRegimeDetails: React.FC<PdfRegimeDetailsProps> = ({
  keyBenefits, qualificationRoutes, criticalConsiderations,
  applicationProcess, actionRequired, successorRegime, regimeWarnings,
}) => {
  const sl = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 12 };
  const th = { flex: 1 as const, fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5 };
  const priorityMap = (p: string) => {
    const h = p.toLowerCase() === 'high';
    return { color: h ? colors.amber[500] : darkTheme.textMuted, bg: h ? colors.tints.goldMedium : darkTheme.surfaceBg, border: h ? colors.amber[500] : darkTheme.border };
  };
  const AlertBox: React.FC<{ bg: string; border: string; icon: string; iconBg: string; title: string; titleColor: string; children: React.ReactNode }> = ({ bg, border, icon, iconBg, title, titleColor, children }) => (
    <View style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: border, padding: 16, marginBottom: 24, flexDirection: 'row' }}>
      <View style={{ width: 24, height: 24, backgroundColor: iconBg, borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: darkTheme.contrastText }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: titleColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{title}</Text>
        {children}
      </View>
    </View>
  );
  const bodyText = { fontFamily: 'Inter' as const, fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5 };

  return (
  <>
    {keyBenefits && keyBenefits.length > 0 && (
      <View style={{ marginBottom: 24 }}>
        <Text style={sl}>Key Benefits</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {keyBenefits.slice(0, 6).map((b, i) => (
            <View key={i} style={{ width: '48%', flexDirection: 'row', alignItems: 'flex-start', backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border, padding: 12, marginRight: 8, marginBottom: 8 }} wrap={false}>
              <View style={{ width: 16, height: 16, backgroundColor: colors.tints.goldMedium, borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: colors.amber[500] }}>{'\u2713'}</Text>
              </View>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, flex: 1, lineHeight: 1.5 }}>{b}</Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {qualificationRoutes && qualificationRoutes.length > 0 && (
      <View style={{ marginBottom: 24 }}>
        <Text style={sl}>Qualification Routes</Text>
        <View style={{ marginBottom: 24, borderWidth: 1, borderColor: darkTheme.border }} wrap={false}>
          <View style={{ flexDirection: 'row', backgroundColor: darkTheme.surfaceBg, paddingVertical: 10, paddingHorizontal: 12 }}>
            <Text style={[th, { flex: 2 }]}>Route</Text><Text style={th}>Min. Investment</Text><Text style={th}>Processing</Text>
          </View>
          {qualificationRoutes.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border, backgroundColor: i % 2 === 0 ? darkTheme.pageBg : darkTheme.cardBg }}>
              <Text style={{ flex: 2, fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary }}>{r.route}</Text>
              <Text style={{ flex: 1, fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary }}>{r.minimum_investment}</Text>
              <Text style={{ flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: colors.amber[500] }}>{r.processing_time}</Text>
            </View>
          ))}
        </View>
      </View>
    )}

    {criticalConsiderations && criticalConsiderations.length > 0 && (
      <View style={{ marginBottom: 24 }}>
        <Text style={sl}>Critical Considerations</Text>
        {criticalConsiderations.slice(0, 4).map((c, i) => {
          const pm = priorityMap(c.priority);
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 8, borderWidth: 1, borderColor: darkTheme.border, backgroundColor: darkTheme.cardBg }} wrap={false}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, marginRight: 12, backgroundColor: pm.bg, borderWidth: 1, borderColor: pm.border }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: pm.color }}>{c.priority}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, marginBottom: 4 }}>{c.item}</Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.5 }}>{c.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    )}

    {applicationProcess && applicationProcess.length > 0 && (
      <View style={{ marginBottom: 24 }}>
        <Text style={sl}>Application Process</Text>
        {applicationProcess.slice(0, 5).map((s, i) => (
          <View key={i} wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, padding: 12, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }}>
            <View style={{ width: 24, height: 24, backgroundColor: colors.amber[500], borderRadius: 0.01, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.contrastText }}>{s.step}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textSecondary, flex: 1 }}>{s.action}</Text>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500] }}>{s.timeline}</Text>
            </View>
          </View>
        ))}
      </View>
    )}

    {actionRequired && (
      <AlertBox bg={colors.tints.goldLight} border={colors.amber[500]} icon="!" iconBg={colors.amber[500]} title="Action Required" titleColor={colors.amber[500]}>
        <Text style={bodyText}>{actionRequired}</Text>
      </AlertBox>
    )}

    {successorRegime && (
      <AlertBox bg={colors.tints.goldLight} border={colors.amber[500]} icon=">" iconBg={colors.amber[500]} title="Successor Program" titleColor={colors.amber[500]}>
        <Text style={bodyText}>{successorRegime}</Text>
      </AlertBox>
    )}

    {regimeWarnings && regimeWarnings.length > 0 && (
      <View style={{ marginTop: 16 }}>
        {regimeWarnings.map((w, i) => (
          <AlertBox key={i} bg={colors.tints.redLight} border={colors.red[700]} icon="!" iconBg={colors.red[700]} title="Warning" titleColor={colors.red[700]}>
            <Text style={bodyText}>{w.warning}</Text>
            {w.critical_dates && w.critical_dates.length > 0 && (
              <View style={{ marginTop: 8 }}>
                {w.critical_dates.map((cd, j) => (
                  <Text key={j} style={{ fontSize: 9, color: darkTheme.textMuted, marginBottom: 2 }}>{cd.date}: {cd.event}</Text>
                ))}
              </View>
            )}
          </AlertBox>
        ))}
      </View>
    )}
  </>
  );
};
