/**
 * PdfCrossBorderTaxAudit — @react-pdf/renderer equivalent of CrossBorderTaxAudit
 *
 * Sections:
 *   1. Section header with badge
 *   2. Executive summary paragraph
 *   3. Metric grid (Tax Savings %, Day-One Loss %, Total Acquisition Cost)
 *   4. Compliance flags (PdfBadge, gold variant)
 *   5. Warnings (PdfCard with red left accent border)
 *   6. Acquisition Cost Breakdown card (4-col metric row + day-one loss)
 *   7. Tax Treatment cards (2x2 grid): rate bars, FTC badge, savings, explanation
 *   8. Net Yield card: 3 metrics + income breakdown rows
 *
 * Design: "Money Talking" dark theme — Commandment III
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { Svg, Rect, Text as SvgText } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing, formatCurrency } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';
import { PdfMetricGrid } from './primitives/PdfMetricGrid';
import { PdfBadge } from './primitives/PdfBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AcquisitionAudit {
  property_value: number;
  bsd_stamp_duty: number;
  absd_additional_stamp_duty: number;
  total_stamp_duties: number;
  total_acquisition_cost: number;
  day_one_loss_pct: number;
  fta_benefit_applied?: boolean;
  buyer_category?: string;
}

interface RentalIncomeAudit {
  destination_tax_rate_pct: number;
  source_tax_rate_pct: number;
  ftc_available: boolean;
  net_tax_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface CapitalGainsAudit {
  destination_cgt_pct: number;
  source_cgt_pct: number;
  ftc_available: boolean;
  net_cgt_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface EstateTaxAudit {
  destination_estate_pct: number;
  source_estate_pct: number;
  worldwide_applies: boolean;
  net_estate_rate_pct: number;
  tax_savings_pct: number;
  explanation: string;
}

interface NetYieldAudit {
  gross_yield_pct: number;
  tax_rate_applied_pct: number;
  net_yield_pct: number;
  annual_gross_income: number;
  annual_tax_paid: number;
  annual_net_income: number;
  explanation: string;
}

interface CrossBorderAuditData {
  executive_summary: string;
  acquisition_audit?: AcquisitionAudit;
  rental_income_audit?: RentalIncomeAudit;
  capital_gains_audit?: CapitalGainsAudit;
  estate_tax_audit?: EstateTaxAudit;
  net_yield_audit?: NetYieldAudit;
  total_tax_savings_pct: number;
  compliance_flags?: string[];
  warnings?: string[];
}

interface PdfCrossBorderTaxAuditProps {
  audit: CrossBorderAuditData | null | undefined;
  sourceJurisdiction: string;
  destinationJurisdiction: string;
}

// ---------------------------------------------------------------------------
// Inline SVG: Three-row rate bar (destination / source / net)
// ---------------------------------------------------------------------------

interface RateBarProps {
  label: string;
  value: number;
  maxValue: number;
  barColor: string;
  labelColor?: string;
  width?: number;
}

const RateBarRow: React.FC<RateBarProps> = ({
  label,
  value,
  maxValue,
  barColor,
  labelColor = darkTheme.textMuted,
  width = 200,
}) => {
  const barH = 6;
  const totalH = 14;
  const barW = maxValue > 0 ? Math.max((value / maxValue) * width, 2) : 2;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
      <Text
        style={{
          width: 60,
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 7,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: labelColor,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, marginRight: 6 }}>
        <Svg width={width} height={totalH} viewBox={`0 0 ${width} ${totalH}`}>
          <Rect
            x="0"
            y={String((totalH - barH) / 2)}
            width={String(width)}
            height={String(barH)}
            rx="3"
            fill={darkTheme.surfaceBg}
          />
          <Rect
            x="0"
            y={String((totalH - barH) / 2)}
            width={String(barW)}
            height={String(barH)}
            rx="3"
            fill={barColor}
          />
        </Svg>
      </View>
      <Text
        style={{
          width: 36,
          textAlign: 'right',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 8,
          color: labelColor,
        }}
      >
        {value.toFixed(1)}%
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// FTC Badge (inline)
// ---------------------------------------------------------------------------

const FtcIndicator: React.FC<{ available: boolean }> = ({ available }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: available ? 'rgba(212, 168, 67, 0.25)' : darkTheme.border,
      borderRadius: 10,
    }}
  >
    <Text
      style={{
        fontFamily: 'Inter',
        fontWeight: 600,
        fontSize: 7,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: available ? colors.amber[500] : darkTheme.textFaint,
      }}
    >
      {available ? 'FTC CREDIT' : 'NO FTC'}
    </Text>
  </View>
);

// ---------------------------------------------------------------------------
// Tax Treatment Card
// ---------------------------------------------------------------------------

interface TaxCardProps {
  title: string;
  destRate: number;
  sourceRate: number;
  netRate: number;
  ftcAvailable: boolean;
  savingsPct: number;
  explanation: string;
}

const TaxTreatmentCard: React.FC<TaxCardProps> = ({
  title,
  destRate,
  sourceRate,
  netRate,
  ftcAvailable,
  savingsPct,
  explanation,
}) => {
  const maxRate = Math.max(destRate, sourceRate, netRate, 50);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkTheme.cardBg,
        borderWidth: 1,
        borderColor: darkTheme.border,
        borderRadius: 10,
        padding: spacing.md,
      }}
    >
      {/* Header row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ ...typography.h4, color: darkTheme.textPrimary, marginBottom: 0 }}>
          {title}
        </Text>
        <FtcIndicator available={ftcAvailable} />
      </View>

      {/* Rate bars */}
      <View style={{ marginBottom: spacing.sm }}>
        <RateBarRow
          label="Dest."
          value={destRate}
          maxValue={maxRate}
          barColor={darkTheme.textFaint}
          labelColor={darkTheme.textFaint}
        />
        <RateBarRow
          label="Source"
          value={sourceRate}
          maxValue={maxRate}
          barColor="rgba(212, 168, 67, 0.4)"
          labelColor={darkTheme.textFaint}
        />
        <RateBarRow
          label="Net"
          value={netRate}
          maxValue={maxRate}
          barColor={colors.amber[500]}
          labelColor={colors.amber[500]}
        />
      </View>

      {/* Savings row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: darkTheme.surfaceBg,
          borderWidth: 1,
          borderColor: darkTheme.border,
          borderRadius: 8,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={{
            ...typography.micro,
            color: darkTheme.textFaint,
            fontSize: 7,
            marginBottom: 0,
          }}
        >
          TAX SAVINGS
        </Text>
        <Text
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 10,
            color:
              savingsPct > 0
                ? colors.amber[500]
                : savingsPct < 0
                ? colors.red[500]
                : darkTheme.textFaint,
          }}
        >
          {savingsPct > 0 ? '+' : ''}
          {savingsPct.toFixed(0)}%
        </Text>
      </View>

      {/* Explanation */}
      <Text
        style={{
          ...typography.small,
          color: darkTheme.textMuted,
          lineHeight: 1.5,
        }}
      >
        {explanation}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const PdfCrossBorderTaxAudit: React.FC<PdfCrossBorderTaxAuditProps> = ({
  audit,
  sourceJurisdiction,
  destinationJurisdiction,
}) => {
  if (!audit) return null;

  const hasComplianceFlags =
    audit.compliance_flags && audit.compliance_flags.length > 0;
  const hasWarnings = audit.warnings && audit.warnings.length > 0;
  const isZeroSavings = audit.total_tax_savings_pct === 0;

  // Build the top-level metric grid items
  const topMetrics: Array<{
    label: string;
    value: string;
    color?: string;
  }> = [
    {
      label: 'Tax Savings',
      value: `${audit.total_tax_savings_pct.toFixed(1)}%`,
      color: isZeroSavings ? colors.red[500] : colors.emerald[500],
    },
  ];

  if (audit.acquisition_audit) {
    topMetrics.push({
      label: 'Day-One Loss',
      value: `${audit.acquisition_audit.day_one_loss_pct.toFixed(2)}%`,
      color: colors.red[500],
    });
    topMetrics.push({
      label: 'Total Acquisition Cost',
      value: formatCurrency(audit.acquisition_audit.total_acquisition_cost),
      color: colors.amber[500],
    });
  }

  // Collect tax treatment cards data
  const taxCards: TaxCardProps[] = [];

  if (audit.rental_income_audit) {
    const r = audit.rental_income_audit;
    taxCards.push({
      title: 'Rental Income Tax',
      destRate: r.destination_tax_rate_pct,
      sourceRate: r.source_tax_rate_pct,
      netRate: r.net_tax_rate_pct,
      ftcAvailable: r.ftc_available,
      savingsPct: r.tax_savings_pct,
      explanation: r.explanation,
    });
  }

  if (audit.capital_gains_audit) {
    const c = audit.capital_gains_audit;
    taxCards.push({
      title: 'Capital Gains Tax',
      destRate: c.destination_cgt_pct,
      sourceRate: c.source_cgt_pct,
      netRate: c.net_cgt_rate_pct,
      ftcAvailable: c.ftc_available,
      savingsPct: c.tax_savings_pct,
      explanation: c.explanation,
    });
  }

  if (audit.estate_tax_audit) {
    const e = audit.estate_tax_audit;
    taxCards.push({
      title: 'Estate Tax',
      destRate: e.destination_estate_pct,
      sourceRate: e.source_estate_pct,
      netRate: e.net_estate_rate_pct,
      ftcAvailable: !e.worldwide_applies,
      savingsPct: e.tax_savings_pct,
      explanation: e.explanation,
    });
  }

  return (
    <View style={{ marginBottom: spacing.xl }}>
      {/* 1. Section Header */}
      <PdfSectionHeader title="Cross-Border Tax Audit" badge="TAX INTELLIGENCE" />

      {/* 2. Executive Summary */}
      <PdfCard>
        <Text
          style={{
            ...typography.body,
            color: darkTheme.textSecondary,
            lineHeight: 1.65,
          }}
        >
          {audit.executive_summary}
        </Text>
      </PdfCard>

      {/* 3. Metric Grid: Tax Savings / Day-One Loss / Total Cost */}
      <PdfMetricGrid
        metrics={topMetrics}
        columns={topMetrics.length as 2 | 3}
      />

      {/* 4. Compliance Flags */}
      {hasComplianceFlags && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: spacing.md,
          }}
        >
          {audit.compliance_flags!.map((flag, i) => (
            <View key={i} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }}>
              <PdfBadge label={flag.replace(/_/g, ' ')} variant="gold" />
            </View>
          ))}
        </View>
      )}

      {/* 5. Warnings */}
      {hasWarnings && (
        <View style={{ marginBottom: spacing.md }}>
          {audit.warnings!.map((warning, i) => {
            // Parse severity prefix if present (e.g., "CRITICAL: ...")
            const severityMatch = warning.match(/^(CRITICAL|HIGH|MEDIUM|LOW):\s/);
            const severityLabel = severityMatch ? severityMatch[1] : null;
            const warningBody = severityLabel
              ? warning.substring(warning.indexOf(': ') + 2)
              : warning;

            return (
              <View
                key={i}
                style={{
                  backgroundColor: darkTheme.cardBg,
                  borderWidth: 1,
                  borderColor: darkTheme.border,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.red[500],
                  borderRadius: 6,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ ...typography.small, color: darkTheme.textSecondary, lineHeight: 1.5 }}>
                  {severityLabel && (
                    <Text
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 700,
                        color: colors.red[400],
                      }}
                    >
                      {severityLabel}:{' '}
                    </Text>
                  )}
                  {warningBody}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 6. Acquisition Cost Breakdown */}
      {audit.acquisition_audit && (
        <View wrap={false}>
          <Text
            style={{
              ...typography.micro,
              color: colors.amber[500],
              marginBottom: spacing.sm,
            }}
          >
            ACQUISITION COST BREAKDOWN
          </Text>

          <PdfCard>
            {/* 4-col metric row */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: spacing.md,
              }}
            >
              {[
                {
                  label: 'Property Value',
                  value: formatCurrency(audit.acquisition_audit.property_value),
                  color: darkTheme.textPrimary,
                },
                {
                  label: 'BSD Stamp Duty',
                  value: formatCurrency(audit.acquisition_audit.bsd_stamp_duty),
                  color: colors.amber[500],
                },
                {
                  label: 'ABSD (Foreign)',
                  value: formatCurrency(audit.acquisition_audit.absd_additional_stamp_duty),
                  color: colors.red[500],
                },
                {
                  label: 'Total Acquisition',
                  value: formatCurrency(audit.acquisition_audit.total_acquisition_cost),
                  color: colors.amber[500],
                },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginRight: idx < 3 ? spacing.sm : 0,
                  }}
                >
                  <Text
                    style={{
                      ...typography.micro,
                      color: darkTheme.textMuted,
                      fontSize: 7,
                      textAlign: 'center',
                      marginBottom: spacing.xs,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: 14,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: darkTheme.border,
                marginBottom: spacing.md,
              }}
            />

            {/* Day-One Loss row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: darkTheme.surfaceBg,
                borderWidth: 1,
                borderColor: darkTheme.border,
                borderRadius: 8,
                padding: spacing.md,
              }}
            >
              <View>
                <Text
                  style={{
                    ...typography.body,
                    color: darkTheme.textPrimary,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  Day-One Transaction Loss
                </Text>
                <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
                  Immediate cost as percentage of property value
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: 22,
                  color: colors.red[500],
                }}
              >
                {audit.acquisition_audit.day_one_loss_pct.toFixed(2)}%
              </Text>
            </View>

            {/* FTA Benefit indicator */}
            {audit.acquisition_audit.fta_benefit_applied && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: spacing.sm,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 8,
                    color: colors.emerald[400],
                  }}
                >
                  FTA benefit applied
                  {audit.acquisition_audit.buyer_category
                    ? ` (${audit.acquisition_audit.buyer_category})`
                    : ''}
                </Text>
              </View>
            )}
          </PdfCard>
        </View>
      )}

      {/* 7. Tax Treatment Cards (2x2 grid) */}
      {taxCards.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              ...typography.micro,
              color: colors.amber[500],
              marginBottom: spacing.sm,
            }}
          >
            TAX TREATMENT BY CATEGORY
          </Text>

          {/* Render cards in rows of 2 */}
          {Array.from({ length: Math.ceil(taxCards.length / 2) }).map(
            (_, rowIdx) => {
              const first = taxCards[rowIdx * 2];
              const second = taxCards[rowIdx * 2 + 1];
              return (
                <View
                  key={rowIdx}
                  style={{
                    flexDirection: 'row',
                    marginBottom: spacing.sm,
                  }}
                  wrap={false}
                >
                  <TaxTreatmentCard {...first} />
                  {second ? (
                    <>
                      <View style={{ width: spacing.sm }} />
                      <TaxTreatmentCard {...second} />
                    </>
                  ) : (
                    /* Spacer to keep single card at 50% width */
                    <View style={{ flex: 1 }} />
                  )}
                </View>
              );
            }
          )}
        </View>
      )}

      {/* 8. Net Yield Card */}
      {audit.net_yield_audit && (
        <View wrap={false}>
          <Text
            style={{
              ...typography.micro,
              color: colors.amber[500],
              marginBottom: spacing.sm,
            }}
          >
            NET YIELD ANALYSIS
          </Text>

          <PdfCard>
            {/* 3 yield metrics */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: spacing.md,
              }}
            >
              {[
                {
                  label: 'Gross Yield',
                  value: `${Number(audit.net_yield_audit.gross_yield_pct).toFixed(2)}%`,
                  color: darkTheme.textPrimary,
                },
                {
                  label: 'Tax Rate',
                  value: `${Number(audit.net_yield_audit.tax_rate_applied_pct).toFixed(2)}%`,
                  color: darkTheme.textSecondary,
                },
                {
                  label: 'Net Yield',
                  value: `${audit.net_yield_audit.net_yield_pct.toFixed(2)}%`,
                  color: colors.amber[500],
                },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    marginRight: idx < 2 ? spacing.sm : 0,
                  }}
                >
                  <Text
                    style={{
                      ...typography.micro,
                      color: darkTheme.textMuted,
                      fontSize: 7,
                      textAlign: 'center',
                      marginBottom: spacing.xs,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 700,
                      fontSize: 16,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Income breakdown rows */}
            <View style={{ marginBottom: spacing.sm }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                }}
              >
                <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
                  Annual Gross Income
                </Text>
                <Text
                  style={{
                    ...typography.small,
                    fontWeight: 600,
                    color: darkTheme.textPrimary,
                  }}
                >
                  {formatCurrency(audit.net_yield_audit.annual_gross_income)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                }}
              >
                <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
                  Annual Tax Paid
                </Text>
                <Text
                  style={{
                    ...typography.small,
                    fontWeight: 600,
                    color: colors.red[500],
                  }}
                >
                  -{formatCurrency(audit.net_yield_audit.annual_tax_paid)}
                </Text>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: 'rgba(212, 168, 67, 0.2)',
                  marginVertical: 3,
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    ...typography.small,
                    fontWeight: 600,
                    color: darkTheme.textPrimary,
                  }}
                >
                  Annual Net Income
                </Text>
                <Text
                  style={{
                    ...typography.small,
                    fontWeight: 700,
                    color: colors.amber[500],
                  }}
                >
                  {formatCurrency(audit.net_yield_audit.annual_net_income)}
                </Text>
              </View>
            </View>

            {/* Explanation */}
            <Text
              style={{
                ...typography.small,
                color: darkTheme.textMuted,
                lineHeight: 1.5,
              }}
            >
              {audit.net_yield_audit.explanation}
            </Text>
          </PdfCard>
        </View>
      )}

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.md,
          paddingTop: spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: darkTheme.border,
          }}
        />
        <Text
          style={{
            fontFamily: 'Inter',
            fontSize: 7.5,
            color: darkTheme.textFaint,
            letterSpacing: 0.5,
            marginHorizontal: spacing.sm,
          }}
        >
          Cross-Border Tax Audit  |  FTC Analysis
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: darkTheme.border,
          }}
        />
      </View>
    </View>
  );
};

export default PdfCrossBorderTaxAudit;
