/**
 * PdfHeirManagementPage — Heir Management & Succession page content
 * Extracted from PatternAuditDocument.tsx (Page 8)
 *
 * Renders: Third-gen risk, recommended structure, Hughes Framework,
 * estate tax by heir type, heir allocation cards, top succession risk,
 * next action, and grounded source note.
 *
 * Parent provides: Page, PageHeader, PageFooter, ConfidentialWatermark
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, formatCurrency, pdfStyles, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader, PdfGroundedNote } from './primitives';
import type { HeirManagementData, HeirAllocation } from '../pdf-types';

interface PdfHeirManagementPageProps {
  heirManagement: HeirManagementData;
  intakeId: string;
}

/** Color for Hughes score badges */
const scoreColor = (score: string | undefined, variant: 'border' | 'text'): string => {
  const s = score?.toUpperCase();
  if (s === 'EXCELLENT' || s === 'STRONG') return colors.amber[500];
  if (s === 'MODERATE') return colors.amber[500];
  return colors.red[700];
};

/** Urgency helpers for succession risk timeline */
const getTimelineColor = (days: number | undefined): string => {
  if (days === undefined) return darkTheme.textSecondary;
  if (days <= 45) return colors.red[700];
  if (days <= 60) return colors.amber[500];
  return colors.amber[500];
};

const getUrgencyLabel = (days: number | undefined): string => {
  if (days === undefined) return '';
  if (days <= 45) return 'URGENT';
  if (days <= 60) return 'MODERATE';
  return 'STANDARD';
};

// =============================================================================
// LOCAL STYLE CONSTANTS — composed from typography + darkTheme
// =============================================================================

/** ScoreBadge text style */
const scoreBadgeText = {
  ...typography.microBold,
  textTransform: 'uppercase' as const,
};

/** Provisions bullet */
const provisionsBullet = {
  ...typography.caption,
  color: colors.amber[500],
  width: 10,
};

/** Provisions item text */
const provisionsText = {
  ...typography.caption,
  color: darkTheme.textMuted,
  flex: 1,
};

/** Sub-section title — bodyBold, white */
const subSectionTitle = {
  ...typography.bodyBold,
  color: darkTheme.textPrimary,
};

/** Table cell metric — metricMd inside table cells */
const tableCellMetric = {
  ...typography.metricMd,
};

/** Micro label — uppercase, faint/muted, used for labels above values */
const microLabel = {
  ...typography.micro,
  letterSpacing: 1,
  color: darkTheme.textFaint,
};

/** Micro label muted — uppercase 9pt with 0.5 spacing, used for field labels */
const microLabelMuted = {
  ...typography.micro,
  letterSpacing: 0.5,
  color: darkTheme.textMuted,
};

/** Caption muted — 9pt muted non-uppercase body */
const captionMuted = {
  ...typography.caption,
  color: darkTheme.textMuted,
};

/** Caption faint — 9pt faint text */
const captionFaint = {
  ...typography.caption,
  color: darkTheme.textFaint,
};

/** Small secondary — 10pt secondary text */
const smallSecondary = {
  ...typography.small,
  color: darkTheme.textSecondary,
};

/** Small muted — 10pt muted text */
const smallMuted = {
  ...typography.small,
  color: darkTheme.textMuted,
};

/** Small bold primary — 10pt bold primary text (column headers, values) */
const smallBoldPrimary = {
  ...typography.smallBold,
  color: darkTheme.textPrimary,
};

/** Caption secondary — 9pt secondary text */
const captionSecondary = {
  ...typography.caption,
  color: darkTheme.textSecondary,
};

/** Metric small primary — 14pt bold for structure titles */
const metricSmPrimary = {
  ...typography.metricSm,
  color: darkTheme.textPrimary,
};

/** Heir allocation percentage — 18pt bold */
const heirPercentage = {
  ...typography.metricMd,
  fontSize: 18,
  color: darkTheme.textPrimary,
};

/** Heir name — h4 bold */
const heirName = {
  ...typography.h4,
  fontWeight: 700 as const,
  color: darkTheme.textPrimary,
};

/** Metric medium primary — 16pt bold */
const metricMdPrimary = {
  ...typography.metricMd,
  color: darkTheme.textPrimary,
};

/** Table cell bold — weight-only override (fontSize + fontFamily inherited from pdfStyles.tableCell) */
const tableCellBold = {
  fontWeight: 700 as const,
};

/** Hughes description — caption with muted color + lineHeight */
const hughesDescription = {
  ...typography.caption,
  color: darkTheme.textMuted,
  lineHeight: 1.4,
};

/** Urgency badge text */
const urgencyBadgeText = {
  ...typography.microBold,
};

/** Next action body text */
const nextActionText = {
  ...typography.small,
  color: darkTheme.textPrimary,
  lineHeight: 1.5,
};

/** Risk body text */
const riskBodyText = {
  ...typography.small,
  color: darkTheme.textSecondary,
  lineHeight: 1.5,
};

/** Reusable score badge for Hughes Framework columns */
const ScoreBadge: React.FC<{ score?: string }> = ({ score }) => (
  <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: scoreColor(score, 'border') }}>
    <Text style={{ ...scoreBadgeText, color: scoreColor(score, 'text') }}>
      {score || 'N/A'}
    </Text>
  </View>
);

/** Provisions checklist shared by human capital & governance columns */
const ProvisionsList: React.FC<{ provisions?: string[] }> = ({ provisions }) => (
  <>
    {provisions?.slice(0, 3).map((p, i) => (
      <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
        <Text style={provisionsBullet}>{'\u2022'}</Text>
        <Text style={provisionsText}>{p}</Text>
      </View>
    ))}
  </>
);

export const PdfHeirManagementPage: React.FC<PdfHeirManagementPageProps> = ({ heirManagement }) => {
  // Resolve third_generation_problem from hughes_framework or top-level
  const thirdGenProblem = heirManagement.hughes_framework?.third_generation_problem || heirManagement.third_generation_problem || {};

  // Current risk (loss without structure)
  const currentRisk = ('loss_without_structure_pct' in thirdGenProblem && thirdGenProblem.loss_without_structure_pct != null)
    ? thirdGenProblem.loss_without_structure_pct
    : heirManagement.third_generation_risk?.current_probability_of_loss != null
      ? Math.round(heirManagement.third_generation_risk.current_probability_of_loss * 100)
      : null;

  // With structure risk
  const withStructureRisk = ('loss_with_structure_pct' in thirdGenProblem && thirdGenProblem.loss_with_structure_pct != null)
    ? thirdGenProblem.loss_with_structure_pct
    : heirManagement.third_generation_risk?.with_structure_probability != null
      ? Math.round(heirManagement.third_generation_risk.with_structure_probability * 100)
      : null;

  const improvement = (currentRisk != null && withStructureRisk != null) ? Number(currentRisk) - Number(withStructureRisk) : null;

  // Preservation rate for recommended structure
  const preservationRate = ('preservation_with_structure_pct' in thirdGenProblem && thirdGenProblem.preservation_with_structure_pct != null)
    ? thirdGenProblem.preservation_with_structure_pct
    : null;

  const showThirdGen = !!(heirManagement.third_generation_risk || heirManagement.with_structure || heirManagement.third_generation_problem || heirManagement.hughes_framework?.third_generation_problem);
  const recStructure = heirManagement.with_structure?.recommended_structure || heirManagement.recommended_structure;

  // Estate tax
  const estateTax = heirManagement.estate_tax_by_heir_type;
  const isFlat = estateTax ? (estateTax.spouse_rate !== undefined || estateTax.children_rate !== undefined) : false;
  const spouseRate = estateTax ? (isFlat ? estateTax.spouse_rate : estateTax.spouse?.rate) : undefined;
  const spouseSummary = estateTax ? (isFlat ? estateTax.spouse_summary : estateTax.spouse?.exemption) : undefined;
  const childrenRate = estateTax ? (isFlat ? estateTax.children_rate : estateTax.children?.rate) : undefined;
  const childrenSummary = estateTax ? (isFlat ? estateTax.children_summary : estateTax.children?.exemption) : undefined;
  const nonLinealRate = estateTax ? (isFlat ? estateTax.non_lineal_rate : estateTax.non_lineal?.rate) : undefined;
  const nonLinealSummary = estateTax ? (isFlat ? estateTax.non_lineal_summary : estateTax.non_lineal?.exemption) : undefined;

  // Top succession risk
  const risk = heirManagement.top_succession_trigger || heirManagement.top_succession_risk;
  const riskText = risk ? (('trigger' in risk ? risk.trigger : undefined) || ('risk' in risk ? risk.risk : undefined) || 'Succession risk identified') : '';
  const atRisk = risk ? (('dollars_at_risk' in risk ? risk.dollars_at_risk : undefined) || ('at_risk_amount' in risk ? risk.at_risk_amount : undefined) || 0) : 0;
  const mitigation = risk?.mitigation;
  const mitigationTimeline = risk && 'mitigation_timeline' in risk ? risk.mitigation_timeline : undefined;
  const mitigationDays = risk && 'mitigation_timeline_days' in risk ? risk.mitigation_timeline_days : undefined;

  const hughes = heirManagement.hughes_framework;

  return (
    <View style={{ marginBottom: spacing.xxxl - 16 }}>
      <PdfSectionHeader title="Heir Management & Succession" />

      {/* Third generation risk assessment */}
      {showThirdGen && (
        <View style={{ marginBottom: spacing.xl + 4 }}>
          <Text style={{ ...subSectionTitle, marginBottom: spacing.md - 2 }}>Third Generation Risk Assessment</Text>
          <View style={pdfStyles.table} wrap={false}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.tableCellHeader}>Current Risk</Text>
              <Text style={pdfStyles.tableCellHeader}>With Structure</Text>
              <Text style={pdfStyles.tableCellHeader}>Improvement</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, tableCellMetric]}>{currentRisk != null ? `${currentRisk}%` : '\u2014'}</Text>
              <Text style={[pdfStyles.tableCell, tableCellMetric]}>{withStructureRisk != null ? `${withStructureRisk}%` : '\u2014'}</Text>
              <Text style={[pdfStyles.tableCell, { ...tableCellMetric, color: colors.amber[500] }]}>{improvement != null ? `-${improvement} pts` : '\u2014'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recommended structure */}
      {recStructure && (
        <View style={{ marginBottom: spacing.xl + 4, paddingBottom: spacing.lg - 4, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
          <Text style={{ ...microLabel, marginBottom: 6 }}>Recommended Structure</Text>
          <Text style={metricSmPrimary}>{recStructure}</Text>
          <Text style={{ ...smallMuted, marginTop: spacing.xs }}>Preservation Rate: {preservationRate != null ? `${preservationRate}%` : '\u2014'}</Text>
        </View>
      )}

      {/* Hughes Framework */}
      {hughes && (
        <View style={{ marginBottom: spacing.xl + 4 }} wrap={false}>
          <View style={{ backgroundColor: darkTheme.surfaceBg, padding: spacing.lg, marginBottom: spacing.lg - 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ ...microLabel, letterSpacing: 1.5, marginBottom: 6 }}>Hughes Family Wealth Framework</Text>
                <Text style={metricSmPrimary}>
                  {hughes.third_generation_problem?.headline || 'Third-Generation Wealth Protection'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ ...captionFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs }}>G3 Loss Rate</Text>
                <Text style={{ ...typography.h1, color: colors.amber[500] }}>
                  {Math.round((hughes.third_generation_problem?.loss_rate_without_structure || 0.70) * 100)}%
                </Text>
                <Text style={captionMuted}>without structure</Text>
              </View>
            </View>
          </View>

          {/* Causes */}
          {hughes.third_generation_problem?.causes && hughes.third_generation_problem.causes.length > 0 && (
            <View style={{ marginBottom: spacing.lg - 4 }}>
              <Text style={{ ...smallBoldPrimary, marginBottom: spacing.sm }}>Common Wealth Destruction Causes</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {hughes.third_generation_problem.causes.slice(0, 5).map((cause, i) => (
                  <View key={i} wrap={false} style={{ backgroundColor: darkTheme.cardBg, paddingHorizontal: 10, paddingVertical: 6, borderLeftWidth: 2, borderLeftColor: colors.red[700], marginRight: spacing.sm, marginBottom: spacing.sm }}>
                    <Text style={captionSecondary}>{cause}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Human Capital & Governance — two columns */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.lg - 4 }} wrap={false}>
            {hughes.human_capital_protection && (
              <View style={{ flex: 1, borderWidth: 1, borderColor: darkTheme.border, padding: spacing.lg - 4, marginRight: spacing.lg - 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md - 2 }}>
                  <Text style={smallBoldPrimary}>Human Capital</Text>
                  <ScoreBadge score={hughes.human_capital_protection.score} />
                </View>
                <Text style={{ ...hughesDescription, marginBottom: spacing.sm }}>
                  {hughes.human_capital_protection.description || 'Financial education & stewardship training'}
                </Text>
                <ProvisionsList provisions={hughes.human_capital_protection.provisions} />
              </View>
            )}
            {hughes.governance_insurance && (
              <View style={{ flex: 1, borderWidth: 1, borderColor: darkTheme.border, padding: spacing.lg - 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md - 2 }}>
                  <Text style={smallBoldPrimary}>Governance Insurance</Text>
                  <ScoreBadge score={hughes.governance_insurance.score} />
                </View>
                <Text style={{ ...hughesDescription, marginBottom: spacing.sm }}>
                  {hughes.governance_insurance.description || 'Structural protections against dissipation'}
                </Text>
                <ProvisionsList provisions={hughes.governance_insurance.provisions} />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Estate Tax by Heir Type */}
      {estateTax && (
        <View style={{ marginBottom: spacing.xl + 4 }}>
          <Text style={{ ...subSectionTitle, marginBottom: spacing.sm }}>Estate Tax Impact by Heir Relationship</Text>
          {estateTax.headline && (
            <Text style={{ ...typography.smallBold, color: colors.amber[500], marginBottom: spacing.md - 2 }}>{estateTax.headline}</Text>
          )}
          <View style={pdfStyles.table} wrap={false}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Heir Type</Text>
              <Text style={pdfStyles.tableCellHeader}>Tax Rate</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Status / Exemption</Text>
            </View>
            {(spouseRate !== undefined || spouseSummary) && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...tableCellBold }]}>Spouse</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: spouseRate === 0 ? colors.amber[500] : darkTheme.textSecondary }]}>
                  {spouseRate != null ? (spouseRate === 0 ? 'TAX-FREE' : `${spouseRate}%`) : 'Exempt'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...typography.caption }]}>{spouseSummary || 'Unlimited marital deduction'}</Text>
              </View>
            )}
            {(childrenRate !== undefined || childrenSummary) && (
              <View style={pdfStyles.tableRowAlt}>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...tableCellBold }]}>Children (Lineal)</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: childrenRate === 0 ? colors.amber[500] : darkTheme.textSecondary }]}>
                  {childrenRate != null ? (childrenRate === 0 ? 'TAX-FREE' : `${childrenRate}%`) : 'N/A'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...typography.caption }]}>{childrenSummary || 'Standard exemption applies'}</Text>
              </View>
            )}
            {(nonLinealRate !== undefined || nonLinealSummary) && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...tableCellBold }]}>Non-Lineal Heirs</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: nonLinealRate === 0 ? colors.amber[500] : colors.red[700] }]}>
                  {nonLinealRate != null ? (nonLinealRate === 0 ? 'TAX-FREE' : `${nonLinealRate}%`) : 'N/A'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, ...typography.caption }]}>{nonLinealSummary || 'Generation-skipping tax may apply'}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Heir allocations */}
      {heirManagement.heir_allocations && heirManagement.heir_allocations.length > 0 && (
        <View style={{ marginBottom: spacing.xl + 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg - 4 }}>
            <Text style={subSectionTitle}>Heir Allocations & Structures</Text>
            <Text style={captionMuted}>{heirManagement.heir_allocations.length} beneficiaries</Text>
          </View>
          {heirManagement.heir_allocations.map((heir: HeirAllocation, i: number) => {
            const allocPct = heir.allocation_pct || heir.allocation_percent || 0;
            const displayPercent = allocPct > 1 ? allocPct : Math.round(allocPct * 100);
            const allocValue = heir.allocation_value || heir.allocation_amount || 0;
            const heirStructure = heir.recommended_structure || heir.structure || '';

            return (
              <View key={i} style={{ borderWidth: 1, borderColor: darkTheme.border, marginBottom: spacing.md - 2, padding: spacing.lg - 4 }} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md - 2, paddingBottom: spacing.md - 2, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                  <View>
                    <Text style={heirName}>{heir.name || `Heir ${i + 1}`}</Text>
                    <Text style={{ ...captionMuted, marginTop: 2 }}>
                      {heir.relationship || 'Beneficiary'} · Age {heir.age || 'N/A'} · {heir.generation || 'G2'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={heirPercentage}>{displayPercent}%</Text>
                    <Text style={{ ...typography.small, fontFamily: 'Courier-Bold', color: colors.amber[500] }}>{formatCurrency(allocValue)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 2, marginRight: spacing.xl + 4 }}>
                    <Text style={{ ...microLabelMuted, marginBottom: spacing.xs }}>Recommended Structure</Text>
                    <Text style={smallBoldPrimary}>{heirStructure || 'Standard Distribution'}</Text>
                    {heir.structure_rationale && (
                      <Text style={{ ...captionMuted, marginTop: spacing.xs }}>{heir.structure_rationale}</Text>
                    )}
                  </View>
                  {heir.timing && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...microLabelMuted, marginBottom: spacing.xs }}>Transfer Timing</Text>
                      <Text style={smallSecondary}>{heir.timing}</Text>
                    </View>
                  )}
                </View>
                {heir.special_considerations && heir.special_considerations.length > 0 && (
                  <View style={{ marginTop: spacing.md - 2, paddingTop: spacing.md - 2, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                    <Text style={{ ...microLabelMuted, marginBottom: 6 }}>Key Considerations</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {heir.special_considerations.slice(0, 4).map((consideration, j) => (
                        <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 6 }}>
                          <Text style={{ ...typography.caption, color: colors.amber[500], marginRight: spacing.xs }}>{'>'}</Text>
                          <Text style={captionMuted}>{consideration}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Top succession risk */}
      {risk && (
        <View style={{ marginBottom: spacing.xl + 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md - 2 }}>
            <Text style={subSectionTitle}>Top Succession Risk</Text>
            {mitigationDays !== undefined && (
              <View style={{
                backgroundColor: mitigationDays <= 45 ? colors.tints.redMedium : mitigationDays <= 60 ? colors.tints.goldMedium : colors.tints.goldMedium,
                paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 0.01,
              }}>
                <Text style={{ ...urgencyBadgeText, color: getTimelineColor(mitigationDays) }}>{getUrgencyLabel(mitigationDays)}</Text>
              </View>
            )}
          </View>
          <View style={pdfStyles.card} wrap={false}>
            <Text style={{ ...riskBodyText, marginBottom: spacing.md - 2 }}>{riskText}</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: spacing.xl + 4 }}>
                <Text style={{ ...microLabelMuted, marginBottom: spacing.xs }}>At Risk</Text>
                <Text style={metricMdPrimary}>{formatCurrency(atRisk)}</Text>
              </View>
              {mitigation && (
                <View style={{ flex: 1 }}>
                  <Text style={{ ...microLabelMuted, marginBottom: spacing.xs }}>Mitigation</Text>
                  <Text style={smallSecondary}>{mitigation}</Text>
                </View>
              )}
            </View>
            {mitigationTimeline && (
              <View style={{ marginTop: spacing.md - 2, paddingTop: spacing.md - 2, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={{ ...microLabelMuted, marginBottom: spacing.xs }}>Timeline</Text>
                <Text style={{ ...typography.smallBold, color: getTimelineColor(mitigationDays) }}>{mitigationTimeline}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Next action */}
      {heirManagement.next_action && (
        <View wrap={false} style={{ backgroundColor: darkTheme.surfaceBg, padding: spacing.lg - 4 }}>
          <Text style={{ ...microLabel, marginBottom: 6 }}>Next Action</Text>
          <Text style={nextActionText}>{heirManagement.next_action}</Text>
        </View>
      )}

      <PdfGroundedNote source="HNWI Chronicles KG Succession Framework + Hughes Family Wealth Framework" />
    </View>
  );
};
