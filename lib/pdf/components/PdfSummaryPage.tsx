import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { colors, darkTheme, formatCurrency, cleanJurisdiction, pdfStyles } from "../pdf-styles";

interface PdfSummaryPageProps {
  verdict: string;
  verdictTheme: { primary: string };
  sourceJurisdiction: string;
  destinationJurisdiction: string;
  totalTaxBenefit: string;
  showTaxSavings: boolean;
  totalExposure: number;
  totalExposureFormatted?: string;
  precedentCount: number;
  riskFactorCount: number;
  failureModes?: number;
  sequencingRules?: number;
  intakeId: string;
}

const PdfSummaryPage: React.FC<PdfSummaryPageProps> = ({
  verdict,
  verdictTheme,
  sourceJurisdiction,
  destinationJurisdiction,
  totalTaxBenefit,
  showTaxSavings,
  totalExposure,
  totalExposureFormatted,
  precedentCount,
  riskFactorCount,
  failureModes = 2,
  sequencingRules = 2,
  intakeId,
}) => {
  const labelStyle = {
    fontSize: 9,
    fontFamily: "Inter" as const,
    fontWeight: 700 as const,
    color: darkTheme.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  };
  const valueStyle = {
    fontSize: 18,
    fontFamily: "Inter" as const,
    fontWeight: 700 as const,
  };
  return (
  <View style={{ flex: 1, justifyContent: "center" }}>
    {/* Verdict-colored accent bar */}
    <View style={{ width: 48, height: 4, backgroundColor: verdictTheme.primary, marginBottom: 16 }} />
    <Text style={{ fontSize: 24, fontFamily: "Inter", fontWeight: 700, color: darkTheme.textPrimary, marginBottom: 8 }}>
      Pattern Intelligence Complete
    </Text>
    <Text style={{ fontSize: 10, fontFamily: "Inter", color: darkTheme.textMuted, marginBottom: 32 }}>
      {cleanJurisdiction(sourceJurisdiction)} &gt; {cleanJurisdiction(destinationJurisdiction)} Strategic Analysis
    </Text>

    {/* Key Outcomes — 4-column grid */}
    <View style={{ flexDirection: "row", marginBottom: 32, borderTopWidth: 2, borderTopColor: darkTheme.textPrimary }} wrap={false}>
      <View style={{ flex: 1.3, paddingVertical: 16, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: darkTheme.border, borderBottomWidth: 3, borderBottomColor: verdictTheme.primary }}>
        <Text style={labelStyle}>Verdict</Text>
        <Text style={{ ...valueStyle, fontSize: verdict.length > 10 ? 14 : 18, color: verdictTheme.primary }}>{verdict}</Text>
      </View>
      <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: darkTheme.border }}>
        <Text style={labelStyle}>Tax Impact</Text>
        <Text style={{ ...valueStyle, color: showTaxSavings ? colors.amber[500] : darkTheme.textFaint }}>{totalTaxBenefit}</Text>
      </View>
      <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: darkTheme.border }}>
        <Text style={labelStyle}>Exposure</Text>
        <Text style={{ ...valueStyle, color: colors.red[700] }}>{totalExposureFormatted || formatCurrency(totalExposure)}</Text>
      </View>
      <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12 }}>
        <Text style={labelStyle}>Precedents</Text>
        <Text style={{ ...valueStyle, color: colors.amber[500] }}>{precedentCount.toLocaleString()}</Text>
      </View>
    </View>

    {/* Intelligence Depth Table */}
    <View style={[pdfStyles.table, { marginBottom: 32 }]} wrap={false}>
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.tableCellHeader}>Precedents Analyzed</Text>
        <Text style={pdfStyles.tableCellHeader}>Failure Modes</Text>
        <Text style={pdfStyles.tableCellHeader}>Sequencing Rules</Text>
        <Text style={pdfStyles.tableCellHeader}>Risk Factors</Text>
      </View>
      <View style={pdfStyles.tableRow}>
        <Text style={[pdfStyles.tableCell, { fontFamily: "Inter", fontWeight: 700, fontSize: 20 }]}>{precedentCount}</Text>
        <Text style={[pdfStyles.tableCell, { fontFamily: "Inter", fontWeight: 700, fontSize: 20 }]}>{failureModes}</Text>
        <Text style={[pdfStyles.tableCell, { fontFamily: "Inter", fontWeight: 700, fontSize: 20 }]}>{sequencingRules}</Text>
        <Text style={[pdfStyles.tableCell, { fontFamily: "Inter", fontWeight: 700, fontSize: 20, color: colors.red[700] }]}>{riskFactorCount}</Text>
      </View>
    </View>

    {/* Premium Dark Reference Box */}
    <View style={{ backgroundColor: darkTheme.surfaceBg, padding: 24, marginBottom: 32 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 9, color: darkTheme.textFaint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Document Reference</Text>
          <Text style={{ fontSize: 18, fontFamily: "Courier-Bold", color: darkTheme.textPrimary, letterSpacing: 1 }}>
            SFO_AUDIT_{intakeId.slice(10, 22).toUpperCase()}
          </Text>
        </View>
        <View style={{ borderWidth: 2, borderColor: verdictTheme.primary, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 10, fontFamily: "Inter", fontWeight: 700, color: verdictTheme.primary, textTransform: "uppercase", letterSpacing: 2 }}>Complete</Text>
        </View>
      </View>
    </View>

    {/* Legal footer */}
    <View style={{ paddingTop: 24, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
      <Text style={{ fontFamily: "Inter", fontSize: 10, color: darkTheme.textMuted, lineHeight: 1.6 }}>
        Pattern &amp; Market Intelligence Report based on {precedentCount}+ analyzed precedents.
        This report provides strategic intelligence and pattern analysis for informed decision-making.
        For execution and implementation, consult your qualified legal, tax, and financial advisory teams.
      </Text>
    </View>
  </View>
  );
};

export default PdfSummaryPage;
