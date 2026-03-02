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
import { colors, darkTheme, formatCurrency, pdfStyles } from '../pdf-styles';
import { PdfSectionHeader, PdfGroundedNote } from './primitives';
import type { HeirManagementData, HeirAllocation } from '../pdf-types';

interface PdfHeirManagementPageProps {
  heirManagement: HeirManagementData;
  intakeId: string;
}

/** Color for Hughes score badges */
const scoreColor = (score: string | undefined, variant: 'border' | 'text'): string => {
  const s = score?.toUpperCase();
  if (s === 'EXCELLENT' || s === 'STRONG') return variant === 'border' ? colors.emerald[500] : colors.emerald[400];
  if (s === 'MODERATE') return colors.amber[500];
  return variant === 'border' ? colors.red[500] : colors.red[400];
};

/** Urgency helpers for succession risk timeline */
const getTimelineColor = (days: number | undefined): string => {
  if (days === undefined) return darkTheme.textSecondary;
  if (days <= 45) return colors.red[400];
  if (days <= 60) return colors.amber[500];
  return colors.emerald[400];
};

const getUrgencyLabel = (days: number | undefined): string => {
  if (days === undefined) return '';
  if (days <= 45) return 'URGENT';
  if (days <= 60) return 'MODERATE';
  return 'STANDARD';
};

/** Reusable score badge for Hughes Framework columns */
const ScoreBadge: React.FC<{ score?: string }> = ({ score }) => (
  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: scoreColor(score, 'border') }}>
    <Text style={{ fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: scoreColor(score, 'text'), textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {score || 'N/A'}
    </Text>
  </View>
);

/** Provisions checklist shared by human capital & governance columns */
const ProvisionsList: React.FC<{ provisions?: string[] }> = ({ provisions }) => (
  <>
    {provisions?.slice(0, 3).map((p, i) => (
      <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
        <Text style={{ fontSize: 8.5, color: colors.emerald[500], width: 10 }}>{'✓'}</Text>
        <Text style={{ fontSize: 8.5, color: darkTheme.textMuted, flex: 1 }}>{p}</Text>
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

  const improvement = (currentRisk != null && withStructureRisk != null) ? currentRisk - withStructureRisk : null;

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
    <View style={{ marginBottom: 32 }}>
      <PdfSectionHeader title="Heir Management & Succession" />

      {/* Third generation risk assessment */}
      {showThirdGen && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary, marginBottom: 12 }}>Third Generation Risk Assessment</Text>
          <View style={pdfStyles.table} wrap={false}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.tableCellHeader}>Current Risk</Text>
              <Text style={pdfStyles.tableCellHeader}>With Structure</Text>
              <Text style={pdfStyles.tableCellHeader}>Improvement</Text>
            </View>
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { fontFamily: 'Inter', fontWeight: 700, fontSize: 16 }]}>{currentRisk != null ? `${currentRisk}%` : '\u2014'}</Text>
              <Text style={[pdfStyles.tableCell, { fontFamily: 'Inter', fontWeight: 700, fontSize: 16 }]}>{withStructureRisk != null ? `${withStructureRisk}%` : '\u2014'}</Text>
              <Text style={[pdfStyles.tableCell, { fontFamily: 'Inter', fontWeight: 700, fontSize: 16, color: colors.emerald[400] }]}>{improvement != null ? `-${improvement} pts` : '\u2014'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recommended structure */}
      {recStructure && (
        <View style={{ marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
          <Text style={{ fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Recommended Structure</Text>
          <Text style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>{recStructure}</Text>
          <Text style={{ fontSize: 10, color: darkTheme.textMuted, marginTop: 4 }}>Preservation Rate: {preservationRate != null ? `${preservationRate}%` : '\u2014'}</Text>
        </View>
      )}

      {/* Hughes Framework */}
      {hughes && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <View style={{ backgroundColor: darkTheme.surfaceBg, padding: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontSize: 9, color: darkTheme.textFaint, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Hughes Family Wealth Framework</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>
                  {hughes.third_generation_problem?.headline || 'Third-Generation Wealth Protection'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 9, color: darkTheme.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>G3 Loss Rate</Text>
                <Text style={{ fontSize: 24, fontFamily: 'Inter', fontWeight: 700, color: colors.amber[500] }}>
                  {Math.round((hughes.third_generation_problem?.loss_rate_without_structure || 0.70) * 100)}%
                </Text>
                <Text style={{ fontSize: 8.5, color: darkTheme.textMuted }}>without structure</Text>
              </View>
            </View>
          </View>

          {/* Causes */}
          {hughes.third_generation_problem?.causes && hughes.third_generation_problem.causes.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary, marginBottom: 8 }}>Common Wealth Destruction Causes</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {hughes.third_generation_problem.causes.slice(0, 5).map((cause, i) => (
                  <View key={i} style={{ backgroundColor: darkTheme.cardBg, paddingHorizontal: 10, paddingVertical: 6, borderLeftWidth: 2, borderLeftColor: colors.red[400], marginRight: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 8.5, color: darkTheme.textSecondary }}>{cause}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Human Capital & Governance — two columns */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {hughes.human_capital_protection && (
              <View style={{ flex: 1, borderWidth: 1, borderColor: darkTheme.border, padding: 16, marginRight: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>Human Capital</Text>
                  <ScoreBadge score={hughes.human_capital_protection.score} />
                </View>
                <Text style={{ fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
                  {hughes.human_capital_protection.description || 'Financial education & stewardship training'}
                </Text>
                <ProvisionsList provisions={hughes.human_capital_protection.provisions} />
              </View>
            )}
            {hughes.governance_insurance && (
              <View style={{ flex: 1, borderWidth: 1, borderColor: darkTheme.border, padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>Governance Insurance</Text>
                  <ScoreBadge score={hughes.governance_insurance.score} />
                </View>
                <Text style={{ fontSize: 9, color: darkTheme.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
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
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary, marginBottom: 8 }}>Estate Tax Impact by Heir Relationship</Text>
          {estateTax.headline && (
            <Text style={{ fontSize: 10, color: colors.emerald[400], fontFamily: 'Inter', fontWeight: 700, marginBottom: 12 }}>{estateTax.headline}</Text>
          )}
          <View style={pdfStyles.table} wrap={false}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Heir Type</Text>
              <Text style={pdfStyles.tableCellHeader}>Tax Rate</Text>
              <Text style={[pdfStyles.tableCellHeader, { flex: 2 }]}>Status / Exemption</Text>
            </View>
            {(spouseRate !== undefined || spouseSummary) && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontFamily: 'Inter', fontWeight: 700 }]}>Spouse</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: spouseRate === 0 ? colors.emerald[400] : darkTheme.textSecondary }]}>
                  {spouseRate != null ? (spouseRate === 0 ? 'TAX-FREE' : `${spouseRate}%`) : 'Exempt'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontSize: 9 }]}>{spouseSummary || 'Unlimited marital deduction'}</Text>
              </View>
            )}
            {(childrenRate !== undefined || childrenSummary) && (
              <View style={pdfStyles.tableRowAlt}>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontFamily: 'Inter', fontWeight: 700 }]}>Children (Lineal)</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: childrenRate === 0 ? colors.emerald[400] : darkTheme.textSecondary }]}>
                  {childrenRate != null ? (childrenRate === 0 ? 'TAX-FREE' : `${childrenRate}%`) : 'N/A'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontSize: 9 }]}>{childrenSummary || 'Standard exemption applies'}</Text>
              </View>
            )}
            {(nonLinealRate !== undefined || nonLinealSummary) && (
              <View style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontFamily: 'Inter', fontWeight: 700 }]}>Non-Lineal Heirs</Text>
                <Text style={[pdfStyles.tableCell, { fontFamily: 'Courier-Bold', color: nonLinealRate === 0 ? colors.emerald[400] : colors.red[400] }]}>
                  {nonLinealRate != null ? (nonLinealRate === 0 ? 'TAX-FREE' : `${nonLinealRate}%`) : 'N/A'}
                </Text>
                <Text style={[pdfStyles.tableCell, { flex: 2, fontSize: 9 }]}>{nonLinealSummary || 'Generation-skipping tax may apply'}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Heir allocations */}
      {heirManagement.heir_allocations && heirManagement.heir_allocations.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>Heir Allocations & Structures</Text>
            <Text style={{ fontSize: 9, color: darkTheme.textMuted }}>{heirManagement.heir_allocations.length} beneficiaries</Text>
          </View>
          {heirManagement.heir_allocations.map((heir: HeirAllocation, i: number) => {
            const allocPct = heir.allocation_pct || heir.allocation_percent || 0;
            const displayPercent = allocPct > 1 ? allocPct : Math.round(allocPct * 100);
            const allocValue = heir.allocation_value || heir.allocation_amount || 0;
            const heirStructure = heir.recommended_structure || heir.structure || '';

            return (
              <View key={i} style={{ borderWidth: 1, borderColor: darkTheme.border, marginBottom: 12, padding: 16 }} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
                  <View>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>{heir.name || `Heir ${i + 1}`}</Text>
                    <Text style={{ fontSize: 9, color: darkTheme.textMuted, marginTop: 2 }}>
                      {heir.relationship || 'Beneficiary'} · Age {heir.age || 'N/A'} · {heir.generation || 'G2'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>{displayPercent}%</Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Courier-Bold', color: colors.emerald[400] }}>{formatCurrency(allocValue)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 2, marginRight: 24 }}>
                    <Text style={{ fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Recommended Structure</Text>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>{heirStructure || 'Standard Distribution'}</Text>
                    {heir.structure_rationale && (
                      <Text style={{ fontSize: 8.5, color: darkTheme.textMuted, marginTop: 4 }}>{heir.structure_rationale}</Text>
                    )}
                  </View>
                  {heir.timing && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Transfer Timing</Text>
                      <Text style={{ fontSize: 10, color: darkTheme.textSecondary }}>{heir.timing}</Text>
                    </View>
                  )}
                </View>
                {heir.special_considerations && heir.special_considerations.length > 0 && (
                  <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                    <Text style={{ fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Key Considerations</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {heir.special_considerations.slice(0, 4).map((consideration, j) => (
                        <View key={j} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 6, marginBottom: 6 }}>
                          <Text style={{ fontSize: 8.5, color: colors.amber[500], marginRight: 4 }}>{'>'}</Text>
                          <Text style={{ fontSize: 8.5, color: darkTheme.textMuted }}>{consideration}</Text>
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
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>Top Succession Risk</Text>
            {mitigationDays !== undefined && (
              <View style={{
                backgroundColor: mitigationDays <= 45 ? 'rgba(239, 68, 68, 0.15)' : mitigationDays <= 60 ? 'rgba(212, 168, 67, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
              }}>
                <Text style={{ fontSize: 8.5, fontFamily: 'Inter', fontWeight: 700, color: getTimelineColor(mitigationDays) }}>{getUrgencyLabel(mitigationDays)}</Text>
              </View>
            )}
          </View>
          <View style={pdfStyles.card} wrap={false}>
            <Text style={{ fontSize: 10, color: darkTheme.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{riskText}</Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: 24 }}>
                <Text style={{ fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>At Risk</Text>
                <Text style={{ fontSize: 16, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>{formatCurrency(atRisk)}</Text>
              </View>
              {mitigation && (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Mitigation</Text>
                  <Text style={{ fontSize: 10, color: darkTheme.textSecondary }}>{mitigation}</Text>
                </View>
              )}
            </View>
            {mitigationTimeline && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={{ fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Timeline</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: getTimelineColor(mitigationDays) }}>{mitigationTimeline}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Next action */}
      {heirManagement.next_action && (
        <View style={{ backgroundColor: darkTheme.surfaceBg, padding: 16 }}>
          <Text style={{ fontSize: 9, color: darkTheme.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Next Action</Text>
          <Text style={{ fontSize: 10, color: darkTheme.textPrimary, lineHeight: 1.5 }}>{heirManagement.next_action}</Text>
        </View>
      )}

      <PdfGroundedNote source="HNWI Chronicles KG Succession Framework + Hughes Family Wealth Framework" />
    </View>
  );
};
