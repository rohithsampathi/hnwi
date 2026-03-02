/**
 * PdfTransparencyRegimePage — Transparency Regime Impact section
 * Extracted from PatternAuditDocument.tsx (lines 1434-1573)
 */
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { colors, darkTheme, pdfStyles, cleanJurisdiction } from "../pdf-styles";
import { safeText } from "../helpers/pdf-utils";
import { PdfSectionHeader, PdfGroundedNote } from "./primitives";
import { TransparencyData } from "../pdf-types";

interface PdfTransparencyRegimePageProps {
  transparencyData: TransparencyData;
  sourceJurisdiction: string;
  destinationJurisdiction: string;
}

const cellBold = { fontFamily: "Inter", fontWeight: 700 as const } as const;

const regimeName = (item: { framework?: string; regime?: string }): string =>
  ("framework" in item ? item.framework : undefined) || item.regime || "-";

export const PdfTransparencyRegimePage: React.FC<PdfTransparencyRegimePageProps> = ({
  transparencyData, sourceJurisdiction, destinationJurisdiction,
}) => {
  const bold10 = { fontSize: 10, fontFamily: "Inter", fontWeight: 700 as const, color: darkTheme.textPrimary, marginBottom: 8 } as const;
  const label9 = { fontSize: 9, color: darkTheme.textMuted, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 4 } as const;

  const frontendTriggered = transparencyData.reporting_triggers?.filter((t) => t.status === "TRIGGERED") ?? [];
  const triggeredItems = frontendTriggered.length > 0 ? frontendTriggered : (transparencyData.triggered ?? []);
  const frontendNot = transparencyData.reporting_triggers?.filter(
    (t) => t.status === "NOT_TRIGGERED" || t.status === "NOT TRIGGERED"
  ) ?? [];
  const notTriggeredItems = frontendNot.length > 0 ? frontendNot : (transparencyData.not_triggered ?? []);
  const bottomLine = transparencyData.bottom_line;
  const actions = bottomLine?.immediate_actions ?? transparencyData.immediate_actions ?? [];

  return (
    <View style={pdfStyles.section}>
      <PdfSectionHeader title="Transparency Regime Impact" />
      <Text style={{ fontSize: 10, color: darkTheme.textMuted, marginBottom: 16 }}>
        {cleanJurisdiction(sourceJurisdiction)} &gt; {cleanJurisdiction(destinationJurisdiction)} compliance analysis (CRS / FATCA / DAC8)
      </Text>

      <Text style={bold10}>Triggered Regimes ({triggeredItems.length})</Text>
      {triggeredItems.length > 0 ? (
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Regime</Text>
            <Text style={[pdfStyles.tableCellHeader, { flex: 1 }]}>Threshold</Text>
            <Text style={[pdfStyles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Your Exposure</Text>
          </View>
          {triggeredItems.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
              <Text style={[pdfStyles.tableCell, { flex: 2 }, cellBold]}>{regimeName(item)}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.threshold || "-"}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "right" }, cellBold]}>{item.your_exposure || "-"}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 10, color: darkTheme.textMuted, marginBottom: 16 }}>No regimes triggered</Text>
      )}

      {notTriggeredItems.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={bold10}>Not Triggered ({notTriggeredItems.length})</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Regime</Text>
              <Text style={[pdfStyles.tableCellHeader, { textAlign: "right" }]}>Your Exposure</Text>
            </View>
            {notTriggeredItems.slice(0, 3).map((item, i) => (
              <View key={i} style={i % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt}>
                <Text style={[pdfStyles.tableCell, { flex: 2 }]}>{regimeName(item)}</Text>
                <Text style={[pdfStyles.tableCell, { textAlign: "right" }]}>{item.your_exposure || "-"}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {transparencyData.compliance_risks && transparencyData.compliance_risks.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={bold10}>Top Compliance Risks</Text>
          {transparencyData.compliance_risks.slice(0, 3).map((risk, i) => (
            <View key={i} style={{ marginBottom: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.amber[500] }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 10, ...cellBold, color: darkTheme.textPrimary }}>{risk.framework || risk.regime}</Text>
                <Text style={{ fontSize: 10, ...cellBold, color: colors.amber[500] }}>{risk.exposure}</Text>
              </View>
              <Text style={{ fontSize: 9, color: darkTheme.textMuted, marginBottom: 2 }}>Trigger: {risk.trigger}</Text>
              <Text style={{ fontSize: 9, color: darkTheme.textSecondary }}>Fix: {risk.fix}</Text>
            </View>
          ))}
        </View>
      )}

      {bottomLine && (
        <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 2, borderTopColor: darkTheme.textPrimary }}>
          <Text style={{ ...bold10, marginBottom: 12 }}>Bottom Line Assessment</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{ marginRight: 48 }}>
              <Text style={label9}>Total Exposure</Text>
              <Text style={{ fontSize: 14, ...cellBold, color: colors.amber[500] }}>
                {safeText(bottomLine.total_exposure_if_noncompliant || bottomLine.total_exposure, "\u2014")}
              </Text>
            </View>
            <View>
              <Text style={label9}>Compliance Cost</Text>
              <Text style={{ fontSize: 14, ...cellBold, color: darkTheme.textPrimary }}>
                {safeText(bottomLine.estimated_compliance_cost || bottomLine.compliance_cost, "\u2014")}
              </Text>
            </View>
          </View>
          {actions.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ ...label9, marginBottom: 6 }}>Immediate Actions</Text>
              {actions.slice(0, 3).map((action, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
                  <Text style={{ fontSize: 9, color: colors.amber[500], marginRight: 6 }}>&gt;</Text>
                  <Text style={{ fontSize: 9, color: darkTheme.textSecondary, flex: 1 }}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <PdfGroundedNote source="HNWI Chronicles KG Regulatory Intelligence" />
    </View>
  );
};

export default PdfTransparencyRegimePage;
