/**
 * PdfRegulatorySourcesPage — Sources & Citations section for PDF Decision Memo
 * Maps to the web RegulatorySourcesSection component.
 *
 * Displays regulatory citations grouped by source_type with verified badges,
 * statute sections, metadata rows, and data point highlights.
 *
 * Uses: @react-pdf/renderer, darkTheme, typography, spacing, colors from pdf-styles
 */

import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { darkTheme, typography, spacing, colors } from "../pdf-styles";
import { RegulatoryCitation } from "../pdf-types";
import { PdfSectionHeader } from "./primitives/PdfSectionHeader";
import { PdfBadge } from "./primitives/PdfBadge";

interface PdfRegulatorySourcesPageProps {
  citations: RegulatoryCitation[];
}

/** Canonical ordering and human-readable labels for source types */
const SOURCE_TYPE_ORDER = [
  "statute",
  "regulatory",
  "market_data",
  "publication",
  "advisory",
] as const;

const SOURCE_TYPE_LABELS: Record<string, string> = {
  statute: "STATUTORY AUTHORITIES",
  regulatory: "REGULATORY GUIDANCE",
  market_data: "MARKET DATA SOURCES",
  publication: "RESEARCH PUBLICATIONS",
  advisory: "ADVISORY SOURCES",
};

export const PdfRegulatorySourcesPage: React.FC<PdfRegulatorySourcesPageProps> = ({
  citations,
}) => {
  if (!citations || citations.length === 0) return null;

  const verifiedCount = citations.filter((c) => c.verified === true).length;

  // Group citations by source_type
  const grouped: Record<string, RegulatoryCitation[]> = {};
  for (const c of citations) {
    const key = c.source_type || "other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  // Order: statute -> regulatory -> market_data -> publication -> advisory -> any remaining
  const sortedTypes = [
    ...SOURCE_TYPE_ORDER.filter((t) => grouped[t]),
    ...Object.keys(grouped).filter(
      (t) => !(SOURCE_TYPE_ORDER as readonly string[]).includes(t)
    ),
  ];

  return (
    <View style={{ marginBottom: spacing.xl }}>
      {/* Section Header */}
      <PdfSectionHeader
        title="Sources & Citations"
        badge={`${verifiedCount} VERIFIED`}
      />

      {/* Citation Groups */}
      {sortedTypes.map((sourceType) => {
        const items = grouped[sourceType];
        const label =
          SOURCE_TYPE_LABELS[sourceType] ||
          sourceType
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .toUpperCase();

        return (
          <View key={sourceType} style={{ marginBottom: spacing.lg }}>
            {/* Group Sub-Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing.sm,
              }}
              minPresenceAhead={80}
            >
              <Text
                style={{
                  ...typography.micro,
                  color: darkTheme.textMuted,
                  letterSpacing: 1.5,
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  ...typography.micro,
                  color: colors.amber[500],
                  fontSize: 9,
                  marginLeft: spacing.sm,
                }}
              >
                {items.length}
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: darkTheme.borderSubtle,
                  marginLeft: spacing.sm,
                }}
              />
            </View>

            {/* Citation Entries */}
            {items.map((citation, idx) => (
              <View
                key={citation.citation_id ?? idx}
                style={{
                  flexDirection: "row",
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                  borderBottomColor: darkTheme.borderSubtle,
                }}
                wrap={false}
              >
                {/* Numbered Circle */}
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 0.01,
                    borderWidth: 1,
                    borderColor: colors.amber[500],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: spacing.sm,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 600 as const,
                      fontSize: 9,
                      color: colors.amber[500],
                    }}
                  >
                    {citation.citation_id ?? idx + 1}
                  </Text>
                </View>

                {/* Citation Content */}
                <View style={{ flex: 1 }}>
                  {/* Title Row + Verified Badge */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter",
                        fontWeight: 700 as const,
                        fontSize: 9.5,
                        color: darkTheme.textPrimary,
                        lineHeight: 1.4,
                        flex: 1,
                        marginRight: spacing.sm,
                      }}
                    >
                      {citation.title || "Untitled Reference"}
                    </Text>
                    {citation.verified === true && (
                      <PdfBadge label="VERIFIED" variant="success" />
                    )}
                  </View>

                  {/* Statute Section (mono text) */}
                  {citation.statute_section && (
                    <Text
                      style={{
                        ...typography.mono,
                        color: darkTheme.textMuted,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {citation.statute_section}
                    </Text>
                  )}

                  {/* Metadata Row: jurisdiction + publisher + effective_date */}
                  {(citation.jurisdiction ||
                    citation.publisher ||
                    citation.effective_date) && (
                    <Text
                      style={{
                        ...typography.small,
                        fontSize: 9,
                        color: darkTheme.textFaint,
                        marginBottom: citation.data_point
                          ? spacing.xs
                          : 0,
                      }}
                    >
                      {[
                        citation.jurisdiction,
                        citation.publisher,
                        citation.effective_date,
                      ]
                        .filter(Boolean)
                        .join(" \u00B7 ")}
                    </Text>
                  )}

                  {/* Data Point Highlight */}
                  {citation.data_point && (
                    <View
                      style={{
                        backgroundColor: darkTheme.cardBg,
                        borderWidth: 1,
                        borderColor: darkTheme.border,
                        borderRadius: 0.01,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs + 1,
                        marginTop: spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          ...typography.small,
                          color: darkTheme.textSecondary,
                          lineHeight: 1.5,
                        }}
                      >
                        {citation.data_point}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        );
      })}

      {/* Footer Disclaimer */}
      <View
        style={{
          marginTop: spacing.lg,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: darkTheme.borderSubtle,
        }}
      >
        <Text
          style={{
            ...typography.mono,
            fontSize: 9,
            color: darkTheme.textFaint,
            lineHeight: 1.6,
          }}
        >
          All statutory rates and regulatory requirements are subject to change.
          This analysis is based on verified data as of the generation date.
          Verify with qualified local counsel before execution.
        </Text>
      </View>
    </View>
  );
};

export default PdfRegulatorySourcesPage;
