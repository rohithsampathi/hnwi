/**
 * DECISION TIMELINE PAGE — Commandment VIII
 * Execution steps, cost of inaction, scenario branches, and regulatory windows
 *
 * Features:
 * - Cost of inaction: Year 1 / Year 5 / Year 10 dollar amounts
 * - Scenario branch cards: proceed_now / proceed_modified / do_not_proceed
 * - Execution sequence with step numbers, timelines, responsible parties
 * - Active regulatory windows with specific dates
 * - Market validation: expected vs reality comparison
 * - Validity / expiry notice with reassess triggers
 * - GradientAccentBar highlighting urgency
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { colors, darkTheme, pdfStyles, typography, spacing, formatCurrency } from '../pdf-styles';
import { ExecutionStep, ScenarioBranch, BranchCondition } from '../pdf-types';
import { getVerdictTheme } from '../pdf-verdict-theme';
import {
  GradientAccentBar,
  GradientDivider,
  MiniMetricBar,
} from './svg';

const safeText = (val: any, fallback: string = '\u2014'): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
};

// ─── Branch display name mapping ────────────────────────────────────────────
const BRANCH_DISPLAY_NAMES: Record<string, string> = {
  proceed_now: 'Proceed Now',
  proceed_modified: 'Proceed Modified',
  do_not_proceed: 'Do Not Proceed',
};

// ─── Condition status colors ────────────────────────────────────────────────
const CONDITION_STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  MET: { bg: colors.tints.goldLight, border: colors.amber[500], text: colors.amber[500] },
  met: { bg: colors.tints.goldLight, border: colors.amber[500], text: colors.amber[500] },
  CONDITIONAL: { bg: colors.tints.goldLight, border: colors.amber[500], text: colors.amber[500] },
  conditional: { bg: colors.tints.goldLight, border: colors.amber[500], text: colors.amber[500] },
  pending: { bg: colors.tints.goldLight, border: colors.amber[500], text: colors.amber[500] },
  BLOCKED: { bg: colors.tints.redLight, border: colors.red[700], text: colors.red[700] },
  blocked: { bg: colors.tints.redLight, border: colors.red[700], text: colors.red[700] },
};

const getStatusStyle = (status: string) =>
  CONDITION_STATUS_COLORS[status] || CONDITION_STATUS_COLORS['CONDITIONAL'];

// ─── Local typography compositions ──────────────────────────────────────────
const styles = {
  // Page title: "Decision Timeline" — 16pt bold uppercase
  pageTitle: { ...typography.h2, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: darkTheme.textPrimary },
  // Badge text
  badgeText: { ...typography.microBold, letterSpacing: 1, color: darkTheme.textMuted },
  // Section headings (12pt bold uppercase with border-bottom)
  sectionHeading: { ...typography.h4, fontWeight: 700 as const, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border },
  // Cost of inaction section label
  costSectionLabel: { ...typography.microBold, letterSpacing: 1.5, color: darkTheme.textMuted },
  // Cost column labels (Year 1, Year 5, Year 10)
  costLabel: { ...typography.microBold, color: darkTheme.textMuted, marginBottom: 6 },
  // Cost dollar values
  costValue: { ...typography.metricLg, fontSize: 26, color: colors.red[700] },
  // Cost sublabel ("Lost to inaction", "Compounded loss", etc.)
  costSublabel: { ...typography.caption, color: darkTheme.textMuted },
  // Urgency bar label
  urgencyLabel: { ...typography.microBold, letterSpacing: 1, color: darkTheme.textMuted },
  // Branch card name
  branchName: { ...typography.smallBold, color: darkTheme.textPrimary },
  // Branch probability label
  branchProbLabel: { ...typography.microBold, marginRight: 6, color: darkTheme.textMuted },
  // Branch probability value
  branchProbValue: { ...typography.metricSm, color: colors.amber[500] },
  // Branch EV label
  branchEvLabel: { ...typography.microBold, marginRight: 6, color: darkTheme.textMuted },
  // Branch EV value
  branchEvValue: { ...typography.bodyBold, color: darkTheme.textPrimary },
  // Condition status badge text
  conditionStatus: { ...typography.microBold, letterSpacing: 0.3 },
  // Condition description text
  conditionText: { ...typography.caption, color: darkTheme.textMuted },
  // Branch verdict text
  branchVerdict: { ...typography.caption, color: darkTheme.textFaint, lineHeight: 1.5 },
  // Execution step number
  stepNumber: { ...typography.h4, fontWeight: 700 as const, color: darkTheme.contrastText },
  // Execution step title
  stepTitle: { ...typography.bodyBold, color: darkTheme.textPrimary },
  // Execution step description
  stepDescription: { ...typography.small, color: darkTheme.textMuted, lineHeight: 1.65 },
  // Step timeline value
  stepTimeline: { ...typography.microBold, color: colors.amber[500] },
  // Step owner text
  stepOwner: { ...typography.caption, color: darkTheme.textMuted },
  // Gate day number
  gateDay: { ...typography.metricMd, fontSize: 18, color: colors.amber[500], width: 50, textAlign: 'center' as const },
  // Gate "Day" label
  gateDayLabel: { ...typography.microBold, color: darkTheme.textMuted, textAlign: 'center' as const },
  // Gate name
  gateName: { ...typography.smallBold, color: darkTheme.textPrimary },
  // Gate pass/fail text
  gatePass: { ...typography.caption, color: colors.amber[500] },
  gateFail: { ...typography.caption, color: colors.red[700] },
  // Market validation section label
  marketSectionLabel: { ...typography.microBold, letterSpacing: 1.5, color: darkTheme.textMuted },
  // Market column title (Appreciation / Rental Yield)
  marketColumnTitle: { ...typography.smallBold, color: darkTheme.textPrimary },
  // Market row label (Expected / Actual)
  marketRowLabel: { ...typography.caption, color: darkTheme.textMuted },
  // Market row value
  marketRowValue: { ...typography.microBold, color: darkTheme.textSecondary },
  // Market deviation label
  marketDeviationLabel: { ...typography.microBold, color: darkTheme.textMuted },
  // Market deviation value
  marketDeviationValue: { ...typography.bodyBold },
  // Validity text
  validityText: { ...typography.microBold, color: darkTheme.textPrimary },
  // Reassess label
  reassessLabel: { ...typography.microBold, color: darkTheme.textMuted },
  // Reassess bullet
  reassessBullet: { ...typography.caption, color: colors.amber[500], lineHeight: 1.5 },
  // Reassess trigger text
  reassessTrigger: { ...typography.caption, color: darkTheme.textMuted, lineHeight: 1.5 },
};

// ─── Props ──────────────────────────────────────────────────────────────────
interface PdfDecisionTimelinePageProps {
  costOfInaction?: {
    year_1?: number;
    year_5?: number;
    year_10?: number;
  };
  executionSequence?: ExecutionStep[];
  decisionGates?: Array<{
    day: number;
    gate: string;
    if_pass?: string;
    if_fail?: string;
  }>;
  verdict?: string;
  branches?: Array<{
    branch: string;
    probability: number;
    expected_value?: number;
    conditions?: Array<{ condition: string; status: string }>;
    verdict_text?: string;
  }>;
  marketValidation?: {
    appreciation: { expected: number; actual: number; deviation_pct: number };
    rental_yield: { expected: number; actual: number; deviation_pct: number };
  };
  validityDays?: number;
  reassessTriggers?: string[];
}

export const PdfDecisionTimelinePage: React.FC<PdfDecisionTimelinePageProps> = ({
  costOfInaction,
  executionSequence = [],
  decisionGates = [],
  verdict,
  branches = [],
  marketValidation,
  validityDays,
  reassessTriggers = [],
}) => {
  const theme = getVerdictTheme(verdict);
  const hasCost = costOfInaction && (costOfInaction.year_1 || costOfInaction.year_5 || costOfInaction.year_10);
  const hasSteps = executionSequence.length > 0;
  const hasGates = decisionGates.length > 0;
  const hasBranches = branches.length > 0;
  const hasMarketValidation = !!marketValidation;
  const hasExpiry = !!validityDays || reassessTriggers.length > 0;

  if (!hasCost && !hasSteps && !hasGates && !hasBranches && !hasMarketValidation && !hasExpiry) return null;

  const year10Cost = Math.abs(costOfInaction?.year_10 || 0);
  const urgencyPct = year10Cost > 0 ? Math.min(100, Math.round((year10Cost / 5000000) * 100)) : 50;

  return (
    <View style={pdfStyles.section}>
      {/* Header */}
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={getVerdictTheme('ABORT')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={[styles.pageTitle, { flexShrink: 1, maxWidth: '70%' }]}>Decision Timeline</Text>
          <View style={{ backgroundColor: colors.tints.redMedium, borderWidth: 1, borderColor: colors.red[700], paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={styles.badgeText}>TIMELINE</Text>
          </View>
        </View>
      </View>

      {/* Cost of Inaction Hero + Urgency Bar (single wrap block to prevent orphan page break) */}
      {hasCost && (
        <View wrap={false}>
          <View style={{ marginBottom: 24, paddingVertical: 20, paddingHorizontal: 24, backgroundColor: colors.tints.redLight, borderWidth: 1, borderColor: colors.tints.redStrong, borderLeftWidth: 4, borderLeftColor: colors.red[700] }}>
            <Text style={[styles.costSectionLabel, { marginBottom: 12 }]}>Cost of Inaction — Every Day of Delay Costs Money</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.tints.redStrong, paddingHorizontal: 8 }}>
                <Text style={styles.costLabel}>Year 1</Text>
                <Text style={styles.costValue}>-{formatCurrency(Math.abs(costOfInaction?.year_1 || 0))}</Text>
                <Text style={[styles.costSublabel, { marginTop: 4 }]}>Lost to inaction</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.tints.redStrong, paddingHorizontal: 8 }}>
                <Text style={styles.costLabel}>Year 5</Text>
                <Text style={styles.costValue}>-{formatCurrency(Math.abs(costOfInaction?.year_5 || 0))}</Text>
                <Text style={[styles.costSublabel, { marginTop: 4 }]}>Compounded loss</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
                <Text style={styles.costLabel}>Year 10</Text>
                <Text style={styles.costValue}>-{formatCurrency(Math.abs(costOfInaction?.year_10 || 0))}</Text>
                <Text style={[styles.costSublabel, { marginTop: 4 }]}>Total opportunity cost</Text>
              </View>
            </View>
          </View>

          {/* Urgency Bar */}
          <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <Text style={[styles.urgencyLabel, { marginBottom: 8 }]}>Decision Urgency</Text>
            <MiniMetricBar value={urgencyPct} width={400} height={8} color={colors.red[700]} />
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
       *  SCENARIO BRANCH CARDS
       *  3-column layout: Proceed Now | Proceed Modified | Do Not Proceed
       * ═══════════════════════════════════════════════════════════════════ */}
      {hasBranches && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <Text style={styles.sectionHeading}>Scenario Branches</Text>
          <View style={{ flexDirection: 'row', columnGap: 8 }}>
            {branches.slice(0, 3).map((b, idx) => {
              const displayName = BRANCH_DISPLAY_NAMES[b.branch] || b.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              const probabilityPct = Math.round((b.probability || 0) * 100);
              const isRecommended = b.branch === 'proceed_now';

              return (
                <View
                  key={idx}
                  wrap={false}
                  style={{
                    flex: 1,
                    backgroundColor: darkTheme.cardBg,
                    borderWidth: 1,
                    borderColor: isRecommended ? colors.amber[500] : darkTheme.border,
                    borderTopWidth: 3,
                    borderTopColor: isRecommended ? colors.amber[500] : darkTheme.border,
                    padding: 12,
                    marginRight: idx < 2 ? 6 : 0,
                  }}
                >
                  {/* Branch name */}
                  <Text style={[styles.branchName, { marginBottom: 8 }]}>{displayName}</Text>

                  {/* Probability */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.branchProbLabel}>Probability</Text>
                    <Text style={styles.branchProbValue}>{probabilityPct}%</Text>
                  </View>

                  {/* Expected value */}
                  {b.expected_value !== undefined && b.expected_value !== null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={styles.branchEvLabel}>EV</Text>
                      <Text style={[styles.branchEvValue, { color: b.expected_value >= 0 ? colors.amber[500] : colors.red[700] }]}>{formatCurrency(b.expected_value)}</Text>
                    </View>
                  )}

                  {/* Conditions list */}
                  {b.conditions && b.conditions.length > 0 && (
                    <View style={{ marginTop: 4, borderTopWidth: 1, borderTopColor: darkTheme.border, paddingTop: 6 }}>
                      {b.conditions.slice(0, 4).map((cond, ci) => {
                        const statusStyle = getStatusStyle(cond.status);
                        const statusLabel = cond.status.toUpperCase();
                        return (
                          <View key={ci} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ backgroundColor: statusStyle.bg, borderWidth: 1, borderColor: statusStyle.border, paddingHorizontal: 4, paddingVertical: 1, marginRight: 6, minWidth: 38, alignItems: 'center' }}>
                              <Text style={[styles.conditionStatus, { color: statusStyle.text }]}>{statusLabel}</Text>
                            </View>
                            <Text style={[styles.conditionText, { flex: 1 }]}>{cond.condition}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Verdict text */}
                  {!!b.verdict_text && (
                    <Text style={[styles.branchVerdict, { marginTop: 6 }]}>{b.verdict_text}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Execution Sequence */}
      {hasSteps && (
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.sectionHeading}>Recommended Execution Sequence</Text>
          {executionSequence.slice(0, 6).map((step: any, idx: number) => {
            const isLast = idx === Math.min(executionSequence.length, 6) - 1;
            return (
              <View key={idx} wrap={false}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, padding: 14, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }}>
                  <View style={{ width: 28, height: 28, borderRadius: 0.01, backgroundColor: colors.amber[500], alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Text style={styles.stepNumber}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepTitle, { marginBottom: 4 }]}>{safeText(step.title || step.action || step.step, `Step ${idx + 1}`)}</Text>
                    {!!(step.description || step.detail) && (
                      <Text style={[styles.stepDescription, { marginBottom: 4 }]}>{safeText(step.description || step.detail, '')}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {!!step.timeline && <Text style={[styles.stepTimeline, { marginRight: 12 }]}>{step.timeline}</Text>}
                      {!!(step.owner || step.executor) && <Text style={styles.stepOwner}>Owner: {safeText(step.owner || step.executor)}</Text>}
                    </View>
                  </View>
                </View>
                {!isLast && (
                  <View style={{ alignItems: 'center', marginVertical: -4 }}>
                    <View style={{ width: 2, height: 16, backgroundColor: colors.amber[500] }} />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Decision Gates */}
      {hasGates && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionHeading}>Active Decision Gates</Text>
          {decisionGates.slice(0, 5).map((gate, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 12, backgroundColor: colors.tints.goldLight, borderWidth: 1, borderColor: colors.tints.goldStrong, borderLeftWidth: 3, borderLeftColor: colors.amber[500] }} wrap={false}>
              <View style={{ marginRight: 14, alignItems: 'center' }}>
                <Text style={styles.gateDay}>{gate.day}</Text>
                <Text style={styles.gateDayLabel}>Day</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gateName, { marginBottom: 2 }]}>{gate.gate}</Text>
                {!!gate.if_pass && <Text style={styles.gatePass}>Pass: {gate.if_pass}</Text>}
                {!!gate.if_fail && <Text style={styles.gateFail}>Fail: {gate.if_fail}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
       *  MARKET VALIDATION — Expected vs Reality
       * ═══════════════════════════════════════════════════════════════════ */}
      {hasMarketValidation && marketValidation && (
        <View style={{ marginTop: 24, padding: 16, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }} wrap={false}>
          <Text style={[styles.marketSectionLabel, { marginBottom: 14 }]}>Market Validation — Expected vs Reality</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* Appreciation column */}
            <View style={{ flex: 1, paddingRight: 12, borderRightWidth: 1, borderRightColor: darkTheme.border }}>
              <Text style={[styles.marketColumnTitle, { marginBottom: 10 }]}>Appreciation</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.marketRowLabel}>Expected</Text>
                <Text style={styles.marketRowValue}>{marketValidation.appreciation.expected.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.marketRowLabel}>Actual</Text>
                <Text style={styles.marketRowValue}>{marketValidation.appreciation.actual.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={styles.marketDeviationLabel}>Deviation</Text>
                <Text style={[styles.marketDeviationValue, { color: marketValidation.appreciation.deviation_pct >= 0 ? colors.amber[500] : colors.red[700] }]}>
                  {marketValidation.appreciation.deviation_pct >= 0 ? '+' : ''}{marketValidation.appreciation.deviation_pct.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Rental Yield column */}
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={[styles.marketColumnTitle, { marginBottom: 10 }]}>Rental Yield</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.marketRowLabel}>Expected</Text>
                <Text style={styles.marketRowValue}>{marketValidation.rental_yield.expected.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.marketRowLabel}>Actual</Text>
                <Text style={styles.marketRowValue}>{marketValidation.rental_yield.actual.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={styles.marketDeviationLabel}>Deviation</Text>
                <Text style={[styles.marketDeviationValue, { color: marketValidation.rental_yield.deviation_pct >= 0 ? colors.amber[500] : colors.red[700] }]}>
                  {marketValidation.rental_yield.deviation_pct >= 0 ? '+' : ''}{marketValidation.rental_yield.deviation_pct.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
       *  EXPIRY / VALIDITY NOTICE
       * ═══════════════════════════════════════════════════════════════════ */}
      {hasExpiry && (
        <View style={{ marginTop: 16, padding: 14, backgroundColor: colors.tints.goldLight, borderWidth: 1, borderColor: colors.tints.goldMedium, borderLeftWidth: 3, borderLeftColor: colors.amber[500] }} wrap={false}>
          {!!validityDays && (
            <Text style={[styles.validityText, { marginBottom: reassessTriggers.length > 0 ? 8 : 0 }]}>
              VALIDITY: {validityDays} days from generation date
            </Text>
          )}
          {reassessTriggers.length > 0 && (
            <View>
              <Text style={[styles.reassessLabel, { marginBottom: 6 }]}>Reassess if:</Text>
              {reassessTriggers.map((trigger, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3, paddingLeft: 4 }}>
                  <Text style={[styles.reassessBullet, { marginRight: 6 }]}>{'\u2022'}</Text>
                  <Text style={[styles.reassessTrigger, { flex: 1 }]}>{trigger}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={[pdfStyles.footerCenter, { marginHorizontal: 12 }]}>
          Timeline analysis powered by HNWI Chronicles KGv3
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfDecisionTimelinePage;
