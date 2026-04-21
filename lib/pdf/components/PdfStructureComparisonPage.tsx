/**
 * PdfStructureComparisonPage — @react-pdf/renderer component
 * Maps to the web StructureComparisonMatrix component
 *
 * Displays ownership structure optimization analysis:
 * - Overall verdict card with counts
 * - Optimal structure hero card (highlight variant)
 * - Top 5 structures comparison table
 * - Alternative corridors and strategies (2-column layout)
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { darkTheme, colors, typography, spacing } from "../pdf-styles";
import { PdfSectionHeader } from "./primitives/PdfSectionHeader";
import { PdfCard } from "./primitives/PdfCard";
import { PdfMetricGrid } from "./primitives/PdfMetricGrid";
import { PdfBadge } from "./primitives/PdfBadge";
import { PdfDataTable } from "./primitives/PdfDataTable";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StringOrObject = string | Record<string, unknown>;

interface OptimalStructure {
  name: string;
  type: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  warnings: StringOrObject[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
  anti_avoidance_flags?: string[];
}

interface AnalyzedStructure {
  name: string;
  type: string;
  verdict: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  viable: boolean;
  warnings: StringOrObject[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
}

interface PdfStructureComparisonPageProps {
  structureOptimization: {
    verdict: string;
    verdict_reason: string;
    optimal_structure?: OptimalStructure;
    structures_analyzed: AnalyzedStructure[];
    alternative_corridors: StringOrObject[];
    alternative_strategies: StringOrObject[];
  };
  sourceJurisdiction: string;
  destinationJurisdiction: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDisplay(item: StringOrObject): string {
  if (typeof item === "string") return item;
  if (item.destination && item.reason)
    return `${String(item.destination)} \u2014 ${String(item.reason)}`;
  return Object.values(item).filter(Boolean).map(String).join(" \u2014 ");
}

function formatBenefit(v: number): string {
  const abs = Math.abs(v);
  const sign = v >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs}`;
}

function formatCost(v?: number): string {
  if (!v) return "\u2014";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function formatRate(v?: number): string {
  if (v === undefined || v === null) return "\u2014";
  return `${v.toFixed(1)}%`;
}

function verdictLabel(verdict: string): string {
  switch (verdict) {
    case "PROCEED":
      return "PROCEED";
    case "PROCEED_MODIFIED":
      return "MODIFIED";
    case "PROCEED_DIVERSIFICATION_ONLY":
      return "DIVERSIFY";
    case "DO_NOT_PROCEED":
      return "DNP";
    default:
      return verdict;
  }
}

function verdictTitle(verdict: string): string {
  switch (verdict) {
    case "PROCEED":
      return "Viable Structure Identified";
    case "PROCEED_MODIFIED":
      return "Viable With Modifications";
    case "PROCEED_DIVERSIFICATION_ONLY":
      return "Diversification Pathway Only";
    case "DO_NOT_PROCEED":
      return "No Viable Structure Without Relocation";
    default:
      return "Structure Analysis Complete";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const PdfStructureComparisonPage: React.FC<
  PdfStructureComparisonPageProps
> = ({ structureOptimization, sourceJurisdiction, destinationJurisdiction }) => {
  const {
    verdict,
    verdict_reason,
    optimal_structure,
    structures_analyzed,
    alternative_corridors,
    alternative_strategies,
  } = structureOptimization;

  // Sort: optimal first, then viable, then by benefit desc
  const sorted = [...structures_analyzed].sort((a, b) => {
    if (a.name === optimal_structure?.name) return -1;
    if (b.name === optimal_structure?.name) return 1;
    if (a.viable !== b.viable) return a.viable ? -1 : 1;
    return b.net_benefit_10yr - a.net_benefit_10yr;
  });

  const top5 = sorted.slice(0, 5);
  const viableCount = structures_analyzed.filter(
    (s) =>
      s.viable || s.verdict === "PROCEED" || s.verdict === "PROCEED_MODIFIED"
  ).length;
  const rejectedCount = structures_analyzed.length - viableCount;

  // Determine if the optimal structure has tax rate data worth showing
  const hasOptimalRates =
    optimal_structure &&
    (optimal_structure.rental_income_rate !== undefined ||
      optimal_structure.capital_gains_rate !== undefined ||
      optimal_structure.estate_tax_rate !== undefined);

  const hasOptimalCosts =
    optimal_structure &&
    ((optimal_structure.setup_cost !== undefined &&
      optimal_structure.setup_cost > 0) ||
      (optimal_structure.annual_cost !== undefined &&
        optimal_structure.annual_cost > 0));

  if (structures_analyzed.length === 0) {
    return null;
  }

  // Build table rows
  const tableHeaders = ["#", "STRUCTURE", "10YR BENEFIT", "SETUP", "ANNUAL", "VERDICT"];
  const tableColumnWidths = [0.4, 2.5, 1.2, 0.8, 0.8, 1];
  const tableRows = top5.map((s, i) => {
    const isOptimal = s.name === optimal_structure?.name;
    const benefitColor =
      s.net_benefit_10yr >= 0 ? colors.amber[500] : colors.red[700];
    return [
      { text: isOptimal ? "\u2605" : String(i + 1), bold: isOptimal, color: isOptimal ? colors.amber[500] : darkTheme.textMuted },
      { text: `${s.name} (${s.type})`, bold: isOptimal, color: isOptimal ? colors.amber[500] : darkTheme.textPrimary },
      { text: formatBenefit(s.net_benefit_10yr), bold: true, color: benefitColor },
      { text: formatCost(s.setup_cost), color: darkTheme.textMuted },
      { text: formatCost(s.annual_cost), color: darkTheme.textMuted },
      { text: verdictLabel(s.verdict), color: s.viable ? colors.amber[500] : colors.red[700] },
    ];
  });

  return (
    <View>
      {/* Section Header */}
      <PdfSectionHeader
        title="Ownership Structure Analysis"
        badge="STRUCTURE OPTIMIZATION"
        subtitle={`${sourceJurisdiction} \u2192 ${destinationJurisdiction} \u00B7 ${structures_analyzed.length} structures analyzed`}
      />

      {/* Verdict Card */}
      <PdfCard>
        <Text
          style={{
            ...typography.h3,
            color: darkTheme.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          {verdictTitle(verdict)}
        </Text>
        <Text
          style={{
            ...typography.body,
            color: darkTheme.textMuted,
            marginBottom: spacing.md,
            lineHeight: 1.6,
          }}
        >
          {verdict_reason}
        </Text>

        {/* Inline stats row */}
        <View style={{ flexDirection: "row", gap: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                ...typography.h4,
                color: darkTheme.textPrimary,
                marginRight: 4,
              }}
            >
              {structures_analyzed.length}
            </Text>
            <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
              analyzed
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                ...typography.h4,
                color: colors.amber[500],
                marginRight: 4,
              }}
            >
              {viableCount}
            </Text>
            <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
              viable
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                ...typography.h4,
                color: colors.red[700],
                marginRight: 4,
              }}
            >
              {rejectedCount}
            </Text>
            <Text style={{ ...typography.small, color: darkTheme.textMuted }}>
              rejected
            </Text>
          </View>
        </View>
      </PdfCard>

      {/* Optimal Structure Hero */}
      {optimal_structure && (
        <PdfCard variant="highlight">
          <Text
            style={{
              ...typography.micro,
              color: colors.amber[500],
              marginBottom: spacing.sm,
            }}
          >
            RECOMMENDED STRUCTURE
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: spacing.md,
            }}
          >
            {/* Left: Name, type, costs, rates */}
            <View style={{ flex: 1, marginRight: spacing.lg }}>
              <Text
                style={{
                  ...typography.h1,
                  color: darkTheme.textPrimary,
                  marginBottom: 2,
                }}
              >
                {optimal_structure.name}
              </Text>
              <Text
                style={{
                  ...typography.small,
                  color: darkTheme.textMuted,
                  marginBottom: spacing.md,
                }}
              >
                {optimal_structure.type}
              </Text>

              {/* Implementation Costs */}
              {hasOptimalCosts && (
                <View
                  style={{
                    backgroundColor: darkTheme.cardBg,
                    borderWidth: 1,
                    borderColor: darkTheme.border,
                    borderRadius: 0.01,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      ...typography.micro,
                      color: darkTheme.textMuted,
                      marginBottom: spacing.sm,
                    }}
                  >
                    IMPLEMENTATION COSTS
                  </Text>
                  {optimal_structure.setup_cost !== undefined &&
                    optimal_structure.setup_cost > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <Text
                          style={{
                            ...typography.small,
                            color: darkTheme.textMuted,
                          }}
                        >
                          Setup Cost
                        </Text>
                        <Text
                          style={{
                            ...typography.small,
                            fontWeight: 600,
                            color: darkTheme.textPrimary,
                          }}
                        >
                          {formatCost(optimal_structure.setup_cost)}
                        </Text>
                      </View>
                    )}
                  {optimal_structure.annual_cost !== undefined &&
                    optimal_structure.annual_cost > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            ...typography.small,
                            color: darkTheme.textMuted,
                          }}
                        >
                          Annual Maintenance
                        </Text>
                        <Text
                          style={{
                            ...typography.small,
                            fontWeight: 600,
                            color: darkTheme.textPrimary,
                          }}
                        >
                          {formatCost(optimal_structure.annual_cost)}/yr
                        </Text>
                      </View>
                    )}
                </View>
              )}

              {/* Effective Tax Rates */}
              {hasOptimalRates && (
                <View
                  style={{
                    backgroundColor: darkTheme.cardBg,
                    borderWidth: 1,
                    borderColor: darkTheme.border,
                    borderRadius: 0.01,
                    padding: spacing.md,
                  }}
                >
                  <Text
                    style={{
                      ...typography.micro,
                      color: darkTheme.textMuted,
                      marginBottom: spacing.sm,
                    }}
                  >
                    EFFECTIVE TAX RATES
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    {optimal_structure.rental_income_rate !== undefined && (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            ...typography.micro,
                            color: darkTheme.textFaint,
                            marginBottom: 2,
                            fontSize: 9,
                          }}
                        >
                          RENTAL
                        </Text>
                        <Text
                          style={{
                            ...typography.h4,
                            color: darkTheme.textPrimary,
                          }}
                        >
                          {formatRate(optimal_structure.rental_income_rate)}
                        </Text>
                      </View>
                    )}
                    {optimal_structure.capital_gains_rate !== undefined && (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            ...typography.micro,
                            color: darkTheme.textFaint,
                            marginBottom: 2,
                            fontSize: 9,
                          }}
                        >
                          CGT
                        </Text>
                        <Text
                          style={{
                            ...typography.h4,
                            color: darkTheme.textPrimary,
                          }}
                        >
                          {formatRate(optimal_structure.capital_gains_rate)}
                        </Text>
                      </View>
                    )}
                    {optimal_structure.estate_tax_rate !== undefined && (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            ...typography.micro,
                            color: darkTheme.textFaint,
                            marginBottom: 2,
                            fontSize: 9,
                          }}
                        >
                          ESTATE
                        </Text>
                        <Text
                          style={{
                            ...typography.h4,
                            color: darkTheme.textPrimary,
                          }}
                        >
                          {formatRate(optimal_structure.estate_tax_rate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Right: 10yr benefit hero + tax savings + warnings */}
            <View style={{ flex: 1 }}>
              {/* 10-Year Net Benefit hero */}
              <View
                style={{
                  backgroundColor: darkTheme.cardBg,
                  borderWidth: 1,
                  borderColor: colors.amber[500],
                  borderRadius: 0.01,
                  padding: spacing.lg,
                  alignItems: "center",
                  marginBottom: spacing.sm,
                }}
              >
                <Text
                  style={{
                    ...typography.micro,
                    color: darkTheme.textMuted,
                    marginBottom: spacing.sm,
                  }}
                >
                  10-YEAR NET BENEFIT
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontFamily: "Inter",
                    fontWeight: 700,
                    color:
                      optimal_structure.net_benefit_10yr >= 0
                        ? colors.amber[500]
                        : colors.red[700],
                    marginBottom: spacing.xs,
                  }}
                >
                  {formatBenefit(optimal_structure.net_benefit_10yr)}
                </Text>
                <Text
                  style={{
                    ...typography.small,
                    color: darkTheme.textMuted,
                    textAlign: "center",
                  }}
                >
                  {optimal_structure.tax_savings_pct >= 0 ? "+" : ""}
                  {optimal_structure.tax_savings_pct.toFixed(1)}% tax savings vs.
                  current structure
                </Text>
              </View>

              {/* Anti-avoidance flags */}
              {optimal_structure.anti_avoidance_flags &&
                optimal_structure.anti_avoidance_flags.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      marginBottom: spacing.sm,
                    }}
                  >
                    {optimal_structure.anti_avoidance_flags.map((flag, i) => (
                      <View key={i} style={{ marginRight: 4, marginBottom: 4 }}>
                        <PdfBadge label={flag} variant="gold" />
                      </View>
                    ))}
                  </View>
                )}

              {/* Warnings / Key Requirements */}
              {optimal_structure.warnings &&
                optimal_structure.warnings.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.tints.goldLight,
                      borderWidth: 1,
                      borderColor: colors.tints.goldStrong,
                      borderRadius: 0.01,
                      padding: spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        ...typography.micro,
                        color: colors.amber[400],
                        marginBottom: spacing.sm,
                      }}
                    >
                      KEY REQUIREMENTS
                    </Text>
                    {optimal_structure.warnings.map((warning, idx) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: idx < optimal_structure.warnings.length - 1 ? 3 : 0,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            color: colors.amber[400],
                            marginRight: 5,
                            marginTop: 3,
                          }}
                        >
                          {"\u2022"}
                        </Text>
                        <Text
                          style={{
                            ...typography.small,
                            color: darkTheme.textMuted,
                            flex: 1,
                          }}
                        >
                          {toDisplay(warning)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          </View>
        </PdfCard>
      )}

      {/* Top 5 Structures Table */}
      {top5.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              ...typography.micro,
              color: colors.amber[500],
              marginBottom: spacing.sm,
            }}
          >
            TOP {Math.min(5, sorted.length)} STRUCTURES — COMPARISON MATRIX
          </Text>
          <PdfDataTable
            headers={tableHeaders}
            rows={tableRows}
            columnWidths={tableColumnWidths}
          />
        </View>
      )}

      {/* Alternative Corridors + Strategies (2-column) */}
      {(alternative_corridors.length > 0 ||
        alternative_strategies.length > 0) && (
        <View
          style={{
            flexDirection: "row",
            marginBottom: spacing.lg,
          }}
        >
          {/* Corridors */}
          {alternative_corridors.length > 0 && (
            <View
              style={{
                flex: 1,
                backgroundColor: darkTheme.cardBg,
                borderWidth: 1,
                borderColor: darkTheme.border,
                borderRadius: 0.01,
                padding: spacing.md,
                marginRight: alternative_strategies.length > 0 ? spacing.sm : 0,
              }}
            >
              <Text
                style={{
                  ...typography.micro,
                  color: colors.amber[500],
                  marginBottom: spacing.sm,
                }}
              >
                ALTERNATIVE CORRIDORS
              </Text>
              {alternative_corridors.map((corridor, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom:
                      idx < alternative_corridors.length - 1 ? 4 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: colors.amber[500],
                      marginRight: 5,
                      marginTop: 1,
                    }}
                  >
                    {"\u2192"}
                  </Text>
                  <Text
                    style={{
                      ...typography.small,
                      color: darkTheme.textMuted,
                      flex: 1,
                    }}
                  >
                    {toDisplay(corridor)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Strategies */}
          {alternative_strategies.length > 0 && (
            <View
              style={{
                flex: 1,
                backgroundColor: darkTheme.cardBg,
                borderWidth: 1,
                borderColor: darkTheme.border,
                borderRadius: 0.01,
                padding: spacing.md,
              }}
            >
              <Text
                style={{
                  ...typography.micro,
                  color: colors.amber[500],
                  marginBottom: spacing.sm,
                }}
              >
                ALTERNATIVE STRATEGIES
              </Text>
              {alternative_strategies.map((strategy, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom:
                      idx < alternative_strategies.length - 1 ? 4 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color: colors.amber[400],
                      marginRight: 5,
                      marginTop: 1,
                    }}
                  >
                    {"\u2192"}
                  </Text>
                  <Text
                    style={{
                      ...typography.small,
                      color: darkTheme.textMuted,
                      flex: 1,
                    }}
                  >
                    {toDisplay(strategy)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Footer divider */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: spacing.sm,
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
            ...typography.mono,
            color: darkTheme.textFaint,
            marginHorizontal: spacing.md,
          }}
        >
          Structure Optimization Engine
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

export default PdfStructureComparisonPage;
