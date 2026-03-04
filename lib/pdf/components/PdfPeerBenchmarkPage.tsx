/**
 * PdfPeerBenchmarkPage — @react-pdf/renderer equivalent of web PeerBenchmarkTicker
 * "The FOMO Killer" — Pattern Intelligence & Peer Benchmarking for PDF export
 *
 * Maps: components/decision-memo/memo/PeerBenchmarkTicker.tsx
 *
 * Sections:
 *  1. Section header (Pattern Intelligence / Corridor Intelligence Match)
 *  2. System Pattern Match banner (red accent card)
 *  3. Historical Outcome card (verified data with provenance)
 *  4. Peer Movement card (signal direction + narrative)
 *  5. Additional Failure Modes (2-col grid of severity badges)
 *  6. Evidence bar footer (intelligence base + confidence + counts)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';
import { PdfBadge } from './primitives/PdfBadge';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface FailurePattern {
  mode: string;
  severity: string;
  description: string;
  nightmareName?: string;
}

interface PatternIntelligence {
  found: boolean;
  primary_pattern?: {
    pattern_id: string;
    pattern_name: string;
    description: string;
    severity: string;
  };
  historical_outcome?: {
    failure_rate_pct: number | null;
    sample_size: number;
    time_period: string;
    data_source: string;
    provenance?: string;
    source_citation?: string;
    confidence_note?: string;
    note?: string;
  };
  peer_movement?: {
    signal: string;
    velocity_pct: number;
    narrative: string;
    asset_pivot?: string;
  };
  confidence_level?: string;
}

interface PdfPeerBenchmarkPageProps {
  precedentCount: number;
  failurePatterns: FailurePattern[];
  failureModeCount: number;
  totalRiskFlags: number;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  patternIntelligence?: PatternIntelligence;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map severity string to PdfBadge variant */
function getSeverityVariant(severity: string): 'critical' | 'high' | 'medium' | 'low' {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'critical';
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'medium';
    default: return 'low';
  }
}

/** Human-readable failure pattern name (institutional language) */
function getPatternName(mode: string): string {
  const names: Record<string, string> = {
    'LIQUIDITY_PRISON': 'Liquidity Constraint',
    'BEHAVIORAL_EROSION': 'Advisor Misalignment',
    'ILLIQUIDITY_TRAP': 'Illiquidity Trap',
    'CONCENTRATION_RISK': 'Concentration Risk',
    'FORCED_EXECUTION': 'Compressed Timeline Risk',
    'CROSS_COLLATERAL': 'Cross-Collateral Exposure',
    'TITLE_MIRAGE': 'Adverse Title Claim',
    'REGULATORY_LANDMINE': 'Retroactive Regulatory Risk',
    'GOVERNANCE_VACUUM': 'Single-Operator Governance Risk',
    'PHANTOM_SKIN_IN_GAME': 'Promoter Fee Asymmetry',
    'SLEEPING_POINT_BREACH': 'Capital-at-Risk Threshold',
    'PRISONERS_DILEMMA': 'Exit Priority Risk',
    'WATERFALL_TRAP': 'Distribution Waterfall Risk',
    'REGULATORY_TRAP': 'Regulatory Exposure',
    'CURRENCY_EXPOSURE': 'Currency Exposure',
    'STAMP_DUTY_TRAP': 'Stamp Duty Impact',
    'TAX_DRAG': 'Tax Drag',
    'EXPAT_TRAP': 'Expatriate Tax Exposure',
    'STRUCTURE_FAILURE': 'Structure Failure',
    'PFIC_TRAP': 'PFIC Classification Risk',
    'ABSD_BARRIER': 'ABSD Cost Barrier',
    'FOREIGN_OWNERSHIP_PREMIUM': 'Foreign Ownership Premium',
  };
  return names[mode] || mode.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
}

/** Movement signal styling (color + direction text) */
function getMovementStyle(signal: string): { color: string; directionText: string; arrow: string } {
  switch (signal) {
    case 'entering':
      return { color: colors.amber[500], directionText: 'entering', arrow: '\u2191' }; // up arrow
    case 'exiting':
      return { color: colors.red[700], directionText: 'exiting', arrow: '\u2193' }; // down arrow
    case 'cooling':
      return { color: colors.amber[500], directionText: 'cooling on', arrow: '\u2193' };
    default:
      return { color: darkTheme.textPrimary, directionText: 'maintaining positions in', arrow: '\u2192' };
  }
}

/** Provenance badge variant */
function getProvenanceBadgeVariant(provenance: string): 'success' | 'info' | 'gold' {
  switch (provenance) {
    case 'verified': return 'success';
    case 'derived': return 'info';
    case 'estimated': return 'gold';
    default: return 'info';
  }
}

/** Confidence level badge variant */
function getConfidenceBadgeVariant(level: string): 'success' | 'info' | 'gold' {
  switch (level) {
    case 'high': return 'success';
    case 'medium': return 'info';
    default: return 'gold';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PdfPeerBenchmarkPage: React.FC<PdfPeerBenchmarkPageProps> = ({
  precedentCount,
  failurePatterns,
  failureModeCount,
  totalRiskFlags,
  sourceJurisdiction,
  destinationJurisdiction,
  patternIntelligence,
}) => {
  const primaryPattern = failurePatterns?.[0];
  const kgPattern = patternIntelligence?.primary_pattern;

  const patternId = kgPattern?.pattern_id ||
    (primaryPattern?.mode ? `FM_${primaryPattern.mode.slice(0, 3).toUpperCase()}` : null);
  const patternName = kgPattern?.pattern_name ||
    primaryPattern?.nightmareName ||
    getPatternName(primaryPattern?.mode || '');
  const patternDescription = kgPattern?.description || primaryPattern?.description;

  const historicalOutcome = patternIntelligence?.historical_outcome;
  const hasRealData = historicalOutcome?.failure_rate_pct !== null &&
    historicalOutcome?.failure_rate_pct !== undefined;
  const failureRate = historicalOutcome?.failure_rate_pct;
  const sampleSize = historicalOutcome?.sample_size || 0;
  const timePeriod = historicalOutcome?.time_period || '2022-2025';
  const dataSource = historicalOutcome?.data_source;

  const peerMovement = patternIntelligence?.peer_movement;
  const movementStyle = getMovementStyle(peerMovement?.signal || 'stable');

  const corridor = sourceJurisdiction && destinationJurisdiction
    ? `${sourceJurisdiction} \u2192 ${destinationJurisdiction}`
    : 'this corridor';

  return (
    <View style={{ marginBottom: spacing.xl }}>
      {/* 1. Section Header */}
      <PdfSectionHeader
        title="Pattern Intelligence"
        subtitle={`Corridor Intelligence Match \u2014 Pattern-Matched Against ${precedentCount.toLocaleString()}+ Analyzed Corridor Signals`}
      />

      {/* 2. System Pattern Match Banner */}
      <PdfCard variant="bordered">
        {/* Red top accent line */}
        <View style={{
          height: 2,
          backgroundColor: colors.red[700],
          marginBottom: spacing.md,
          marginTop: -spacing.lg,
          marginHorizontal: -spacing.lg,
        }} />

        {/* Status label */}
        <Text style={{
          ...typography.micro,
          color: colors.red[700],
          fontSize: 9,
          letterSpacing: 1.5,
          marginBottom: spacing.md,
        }}>
          SYSTEM PATTERN MATCH DETECTED
        </Text>

        {/* Primary Pattern Match */}
        {(primaryPattern || kgPattern) && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{
              ...typography.body,
              color: darkTheme.textSecondary,
              lineHeight: 1.6,
            }}>
              <Text style={{ color: darkTheme.textPrimary, fontWeight: 700 }}>SYSTEM MATCH: </Text>
              {'This deal structure matches '}
              {patternId && (
                <Text style={{ color: colors.red[700], fontSize: 9, fontWeight: 600 }}>
                  {patternId}
                </Text>
              )}
              {' '}
              <Text style={{ color: darkTheme.textMuted }}>
                (&ldquo;{patternName}&rdquo;)
              </Text>
            </Text>
            {patternDescription && (
              <Text style={{
                ...typography.body,
                color: darkTheme.textMuted,
                marginTop: spacing.xs,
                lineHeight: 1.6,
              }}>
                {patternDescription}
              </Text>
            )}
          </View>
        )}

        {/* Divider */}
        <View style={{
          height: 1,
          backgroundColor: darkTheme.border,
          marginVertical: spacing.md,
        }} />

        {/* 3. Historical Outcome */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{
            ...typography.micro,
            color: darkTheme.textFaint,
            fontSize: 9,
            letterSpacing: 1,
            marginBottom: spacing.sm,
          }}>
            HISTORICAL OUTCOME
          </Text>

          {hasRealData ? (
            <View>
              {historicalOutcome?.note ? (
                <Text style={{
                  ...typography.body,
                  color: darkTheme.textSecondary,
                  lineHeight: 1.6,
                }}>
                  {historicalOutcome.note}
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <Text style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: 24,
                    color: colors.red[700],
                    letterSpacing: -0.5,
                  }}>
                    {failureRate?.toFixed(0)}%
                  </Text>
                  <Text style={{
                    ...typography.body,
                    color: darkTheme.textSecondary,
                    marginLeft: spacing.sm,
                  }}>
                    regulatory enforcement rate in this corridor ({timePeriod})
                  </Text>
                  {sampleSize > 0 && (
                    <Text style={{
                      ...typography.small,
                      color: darkTheme.textFaint,
                      marginLeft: spacing.xs,
                    }}>
                      (n={sampleSize})
                    </Text>
                  )}
                </View>
              )}

              {/* Provenance badge + source citation */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: spacing.sm,
                flexWrap: 'wrap',
              }}>
                {historicalOutcome?.provenance && (
                  <View style={{ marginRight: spacing.sm }}>
                    <PdfBadge
                      label={historicalOutcome.provenance.toUpperCase()}
                      variant={getProvenanceBadgeVariant(historicalOutcome.provenance)}
                    />
                  </View>
                )}
                {historicalOutcome?.source_citation && (
                  <Text style={{
                    ...typography.small,
                    color: darkTheme.textFaint,
                  }}>
                    {historicalOutcome.source_citation}
                  </Text>
                )}
              </View>

              {/* Confidence note */}
              {historicalOutcome?.confidence_note && (
                <Text style={{
                  ...typography.small,
                  color: colors.amber[500],
                  marginTop: spacing.xs,
                  fontStyle: 'normal',
                }}>
                  {historicalOutcome.confidence_note}
                </Text>
              )}
            </View>
          ) : (
            <View>
              <Text style={{
                ...typography.body,
                color: darkTheme.textSecondary,
                lineHeight: 1.6,
              }}>
                <Text style={{ color: colors.amber[500] }}>Corridor-specific data pending. </Text>
                {historicalOutcome?.note || 'Pattern analysis based on failure mode detection.'}
              </Text>
            </View>
          )}

          {/* Data source fallback (when no source_citation exists) */}
          {dataSource &&
            dataSource !== 'INSUFFICIENT_DATA' &&
            dataSource !== 'FALLBACK' &&
            !historicalOutcome?.source_citation && (
            <Text style={{
              ...typography.small,
              color: darkTheme.textFaint,
              marginTop: spacing.xs,
            }}>
              Source: {dataSource}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View style={{
          height: 1,
          backgroundColor: darkTheme.border,
          marginVertical: spacing.md,
        }} />

        {/* 4. Peer Movement */}
        <View>
          <Text style={{
            ...typography.micro,
            color: darkTheme.textFaint,
            fontSize: 9,
            letterSpacing: 1,
            marginBottom: spacing.sm,
          }}>
            PEER MOVEMENT
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Direction arrow */}
            <Text style={{
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: 14,
              color: movementStyle.color,
              marginRight: spacing.sm,
              lineHeight: 1.2,
            }}>
              {movementStyle.arrow}
            </Text>

            <View style={{ flex: 1 }}>
              {peerMovement?.narrative ? (
                <View>
                  <Text style={{
                    ...typography.body,
                    color: darkTheme.textSecondary,
                    lineHeight: 1.6,
                  }}>
                    <Text style={{ color: darkTheme.textPrimary, fontWeight: 700 }}>PEER MOVEMENT: </Text>
                    {peerMovement.narrative}
                    {peerMovement.asset_pivot && (
                      <Text style={{ color: darkTheme.textMuted }}>
                        {' '}Institutional capital pivoting to {peerMovement.asset_pivot}.
                      </Text>
                    )}
                  </Text>
                </View>
              ) : (
                <Text style={{
                  ...typography.body,
                  color: darkTheme.textSecondary,
                  lineHeight: 1.6,
                }}>
                  <Text style={{ color: darkTheme.textPrimary, fontWeight: 700 }}>PEER MOVEMENT: </Text>
                  {'Smart Money is currently '}
                  <Text style={{ color: movementStyle.color, fontWeight: 600 }}>
                    {movementStyle.directionText}
                  </Text>
                  {' '}{corridor}.
                </Text>
              )}

              {/* Velocity */}
              {peerMovement?.velocity_pct !== undefined && peerMovement.velocity_pct !== 0 && (
                <Text style={{
                  ...typography.small,
                  color: darkTheme.textFaint,
                  marginTop: spacing.xs,
                  fontFamily: 'Courier',
                  fontSize: 9,
                  letterSpacing: 0.5,
                }}>
                  Velocity: {peerMovement.velocity_pct > 0 ? '+' : ''}{peerMovement.velocity_pct.toFixed(1)}%
                </Text>
              )}
            </View>
          </View>
        </View>
      </PdfCard>

      {/* 5. Additional Failure Modes (2-col grid) */}
      {failurePatterns.length > 1 && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={{
            ...typography.micro,
            color: darkTheme.textMuted,
            fontSize: 9,
            letterSpacing: 1.2,
            marginBottom: spacing.sm,
          }}>
            ADDITIONAL FAILURE MODES DETECTED ({failureModeCount})
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
            {failurePatterns.slice(1, 5).map((fp, i) => (
              <View
                key={i}
                style={{
                  width: '48%',
                  marginRight: i % 2 === 0 ? '4%' : 0,
                  marginBottom: spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ marginRight: spacing.xs }}>
                  <PdfBadge
                    label={fp.severity?.toUpperCase() || 'LOW'}
                    variant={getSeverityVariant(fp.severity)}
                  />
                </View>
                <Text style={{
                  ...typography.small,
                  color: darkTheme.textSecondary,
                  flex: 1,
                }} numberOfLines={1}>
                  {fp.nightmareName || getPatternName(fp.mode)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 6. Evidence Bar Footer */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: darkTheme.border,
        flexWrap: 'wrap',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Database icon placeholder (small dot) */}
          <View style={{
            width: 5,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: darkTheme.textFaint,
            marginRight: spacing.xs,
          }} />
          <Text style={{
            ...typography.small,
            color: darkTheme.textFaint,
            fontSize: 9,
            marginRight: spacing.sm,
          }}>
            Intelligence Base: {precedentCount.toLocaleString()}+ corridor signals
          </Text>

          {/* Confidence level badge */}
          {patternIntelligence?.confidence_level && (
            <PdfBadge
              label={`${patternIntelligence.confidence_level.toUpperCase()} CONFIDENCE`}
              variant={getConfidenceBadgeVariant(patternIntelligence.confidence_level)}
            />
          )}
        </View>

        <Text style={{
          ...typography.small,
          color: darkTheme.textFaint,
          fontSize: 9,
          fontFamily: 'Courier',
          letterSpacing: 0.3,
        }}>
          {totalRiskFlags} risk flags {'\u00B7'} {failureModeCount} failure modes
        </Text>
      </View>
    </View>
  );
};

export default PdfPeerBenchmarkPage;
