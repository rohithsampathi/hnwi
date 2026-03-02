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
import { colors, darkTheme, pdfStyles, formatCurrency } from '../pdf-styles';
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
  MET: { bg: 'rgba(16,185,129,0.12)', border: colors.emerald[500], text: colors.emerald[400] },
  met: { bg: 'rgba(16,185,129,0.12)', border: colors.emerald[500], text: colors.emerald[400] },
  CONDITIONAL: { bg: 'rgba(212,168,67,0.12)', border: colors.amber[500], text: colors.amber[500] },
  conditional: { bg: 'rgba(212,168,67,0.12)', border: colors.amber[500], text: colors.amber[500] },
  pending: { bg: 'rgba(212,168,67,0.12)', border: colors.amber[500], text: colors.amber[500] },
  BLOCKED: { bg: 'rgba(239,68,68,0.12)', border: colors.red[500], text: colors.red[400] },
  blocked: { bg: 'rgba(239,68,68,0.12)', border: colors.red[500], text: colors.red[400] },
};

const getStatusStyle = (status: string) =>
  CONDITION_STATUS_COLORS[status] || CONDITION_STATUS_COLORS['CONDITIONAL'];

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

  const costLabelStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 9, color: darkTheme.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 6 };
  const costValueStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 22, color: colors.red[400], letterSpacing: -0.5 };
  const sectionHeadingStyle = { fontFamily: 'Inter' as const, fontWeight: 700 as const, fontSize: 12, color: darkTheme.textPrimary, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: darkTheme.border };

  return (
    <View style={pdfStyles.section}>
      {/* Header */}
      <View style={{ marginBottom: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: darkTheme.border }}>
        <GradientAccentBar width={483} height={4} theme={getVerdictTheme('ABORT')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 10 }}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: darkTheme.textPrimary, letterSpacing: 0.5, textTransform: 'uppercase', flexShrink: 1, maxWidth: '70%' }}>Decision Timeline</Text>
          <View style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: colors.red[500], paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: colors.red[400], textTransform: 'uppercase', letterSpacing: 1 }}>Commandment VIII</Text>
          </View>
        </View>
      </View>

      {/* Cost of Inaction Hero */}
      {hasCost && (
        <View style={{ marginBottom: 24, paddingVertical: 20, paddingHorizontal: 24, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderLeftWidth: 4, borderLeftColor: colors.red[500] }} wrap={false}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Cost of Inaction — Every Day of Delay Costs Money</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(239,68,68,0.25)', paddingHorizontal: 8 }}>
              <Text style={costLabelStyle}>Year 1</Text>
              <Text style={costValueStyle}>-{formatCurrency(Math.abs(costOfInaction?.year_1 || 0))}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted, marginTop: 4 }}>Lost to inaction</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: 'rgba(239,68,68,0.25)', paddingHorizontal: 8 }}>
              <Text style={costLabelStyle}>Year 5</Text>
              <Text style={costValueStyle}>-{formatCurrency(Math.abs(costOfInaction?.year_5 || 0))}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted, marginTop: 4 }}>Compounded loss</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text style={costLabelStyle}>Year 10</Text>
              <Text style={[costValueStyle, { fontSize: 26 }]}>-{formatCurrency(Math.abs(costOfInaction?.year_10 || 0))}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted, marginTop: 4 }}>Total opportunity cost</Text>
            </View>
          </View>
        </View>
      )}

      {/* Urgency Bar */}
      {hasCost && (
        <View style={{ marginBottom: 24, alignItems: 'center' }} wrap={false}>
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Decision Urgency</Text>
          <MiniMetricBar value={urgencyPct} width={400} height={8} color={colors.red[500]} />
        </View>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
       *  SCENARIO BRANCH CARDS
       *  3-column layout: Proceed Now | Proceed Modified | Do Not Proceed
       * ═══════════════════════════════════════════════════════════════════ */}
      {hasBranches && (
        <View style={{ marginBottom: 24 }} wrap={false}>
          <Text style={sectionHeadingStyle}>Scenario Branches</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {branches.slice(0, 3).map((b, idx) => {
              const displayName = BRANCH_DISPLAY_NAMES[b.branch] || b.branch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              const probabilityPct = Math.round((b.probability || 0) * 100);
              const isRecommended = b.branch === 'proceed_now';

              return (
                <View
                  key={idx}
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
                  <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 8 }}>{displayName}</Text>

                  {/* Probability */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6 }}>Probability</Text>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: colors.amber[500] }}>{probabilityPct}%</Text>
                  </View>

                  {/* Expected value */}
                  {b.expected_value !== undefined && b.expected_value !== null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 6 }}>EV</Text>
                      <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: b.expected_value >= 0 ? colors.emerald[400] : colors.red[400] }}>{formatCurrency(b.expected_value)}</Text>
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
                              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 6.5, color: statusStyle.text, textTransform: 'uppercase', letterSpacing: 0.3 }}>{statusLabel}</Text>
                            </View>
                            <Text style={{ fontFamily: 'Inter', fontSize: 8, color: darkTheme.textMuted, flex: 1 }}>{cond.condition}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Verdict text */}
                  {!!b.verdict_text && (
                    <Text style={{ fontFamily: 'Inter', fontSize: 8, color: darkTheme.textFaint, marginTop: 6, lineHeight: 1.5 }}>{b.verdict_text}</Text>
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
          <Text style={sectionHeadingStyle}>Recommended Execution Sequence</Text>
          {executionSequence.slice(0, 6).map((step: any, idx: number) => {
            const isLast = idx === Math.min(executionSequence.length, 6) - 1;
            return (
              <View key={idx} wrap={false}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, padding: 14, backgroundColor: darkTheme.cardBg, borderWidth: 1, borderColor: darkTheme.border }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.amber[500], alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: darkTheme.pageBg }}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: darkTheme.textPrimary, marginBottom: 4 }}>{safeText(step.title || step.action || step.step, `Step ${idx + 1}`)}</Text>
                    {!!(step.description || step.detail) && (
                      <Text style={{ fontFamily: 'Inter', fontSize: 10, color: darkTheme.textMuted, lineHeight: 1.65, marginBottom: 4 }}>{safeText(step.description || step.detail, '')}</Text>
                    )}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {!!step.timeline && <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: colors.amber[500], marginRight: 12 }}>{step.timeline}</Text>}
                      {!!(step.owner || step.executor) && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Owner: {safeText(step.owner || step.executor)}</Text>}
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
          <Text style={sectionHeadingStyle}>Active Decision Gates</Text>
          {decisionGates.slice(0, 5).map((gate, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 12, backgroundColor: 'rgba(212,168,67,0.08)', borderWidth: 1, borderColor: 'rgba(212,168,67,0.25)', borderLeftWidth: 3, borderLeftColor: colors.amber[500] }} wrap={false}>
              <View style={{ marginRight: 14, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 18, color: colors.amber[500], width: 50, textAlign: 'center' }}>{gate.day}</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Day</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 2 }}>{gate.gate}</Text>
                {!!gate.if_pass && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: colors.emerald[400] }}>Pass: {gate.if_pass}</Text>}
                {!!gate.if_fail && <Text style={{ fontFamily: 'Inter', fontSize: 9, color: colors.red[400] }}>Fail: {gate.if_fail}</Text>}
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
          <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Market Validation — Expected vs Reality</Text>
          <View style={{ flexDirection: 'row' }}>
            {/* Appreciation column */}
            <View style={{ flex: 1, paddingRight: 12, borderRightWidth: 1, borderRightColor: darkTheme.border }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 10 }}>Appreciation</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Expected</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary }}>{marketValidation.appreciation.expected.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Actual</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary }}>{marketValidation.appreciation.actual.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Deviation</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: marketValidation.appreciation.deviation_pct >= 0 ? colors.emerald[400] : colors.red[400] }}>
                  {marketValidation.appreciation.deviation_pct >= 0 ? '+' : ''}{marketValidation.appreciation.deviation_pct.toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Rental Yield column */}
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: darkTheme.textPrimary, marginBottom: 10 }}>Rental Yield</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Expected</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary }}>{marketValidation.rental_yield.expected.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: darkTheme.textMuted }}>Actual</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textSecondary }}>{marketValidation.rental_yield.actual.toFixed(1)}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Deviation</Text>
                <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: marketValidation.rental_yield.deviation_pct >= 0 ? colors.emerald[400] : colors.red[400] }}>
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
        <View style={{ marginTop: 16, padding: 14, backgroundColor: 'rgba(212,168,67,0.06)', borderWidth: 1, borderColor: 'rgba(212,168,67,0.2)', borderLeftWidth: 3, borderLeftColor: colors.amber[600] }} wrap={false}>
          {!!validityDays && (
            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: darkTheme.textPrimary, marginBottom: reassessTriggers.length > 0 ? 8 : 0 }}>
              VALIDITY: {validityDays} days from generation date
            </Text>
          )}
          {reassessTriggers.length > 0 && (
            <View>
              <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 8.5, color: darkTheme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Reassess if:</Text>
              {reassessTriggers.map((trigger, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3, paddingLeft: 4 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: colors.amber[500], marginRight: 6, lineHeight: 1.5 }}>{'\u2022'}</Text>
                  <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textMuted, flex: 1, lineHeight: 1.5 }}>{trigger}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 12 }}>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
        <Text style={{ fontFamily: 'Inter', fontSize: 8.5, color: darkTheme.textFaint, letterSpacing: 0.5, marginHorizontal: 12 }}>
          Timeline analysis powered by HNWI Chronicles KGv3
        </Text>
        <GradientDivider width={200} height={1} color={darkTheme.border} />
      </View>
    </View>
  );
};

export default PdfDecisionTimelinePage;
