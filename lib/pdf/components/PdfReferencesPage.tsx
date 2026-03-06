/**
 * PdfReferencesPage - Legal Authorities & Data Sources
 *
 * PDF equivalent of the web ReferencesSection component.
 * Displays all statutes, regulations, and data sources cited
 * throughout the Decision Memo in an institutional format.
 *
 * Uses @react-pdf/renderer primitives only (View, Text).
 * Dark theme: #0A0A0A bg, #141414 card, #262626 border, #D4A843 gold.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import type { LegalReferences, CitationEntry } from '../pdf-types';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';
import { PdfBadge } from './primitives/PdfBadge';

interface PdfReferencesPageProps {
  references: LegalReferences;
  developmentsCount?: number;
  precedentCount?: number;
}

// ─── Category Configuration ────────────────────────────────────────────────
interface CategoryConfig {
  key: keyof LegalReferences;
  label: string;
}

const CATEGORY_ORDER: CategoryConfig[] = [
  { key: 'tax_statutes', label: 'TAX STATUTES' },
  { key: 'state_tax_laws', label: 'STATE TAX LAWS' },
  { key: 'foreign_tax_laws', label: 'FOREIGN TAX LAWS' },
  { key: 'treaties', label: 'TREATIES & AGREEMENTS' },
  { key: 'regulations', label: 'REGULATIONS' },
  { key: 'compliance_forms', label: 'COMPLIANCE FORMS' },
  { key: 'market_data_sources', label: 'MARKET DATA SOURCES' },
  { key: 'guidance', label: 'GUIDANCE & RULINGS' },
];

// ─── Citation Entry Row ────────────────────────────────────────────────────
const CitationRow: React.FC<{ citation: CitationEntry; isLast: boolean }> = ({
  citation,
  isLast,
}) => (
  <View
    style={{
      paddingVertical: spacing.xs + 1,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: darkTheme.borderSubtle,
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 6,
      }}
    >
      {citation.short_cite && (
        <Text
          style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 9,
            color: colors.amber[500],
            flexShrink: 0,
          }}
        >
          {citation.short_cite}
        </Text>
      )}
      {citation.title && (
        <Text
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: 9,
            color: darkTheme.textSecondary,
            flex: 1,
            minWidth: 100,
          }}
        >
          {citation.title}
        </Text>
      )}
    </View>
    {citation.reference && (
      <Text
        style={{
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 9,
          color: darkTheme.textMuted,
          marginTop: 2,
        }}
      >
        {citation.reference}
      </Text>
    )}
  </View>
);

// ─── Citation Category Block ───────────────────────────────────────────────
const CitationCategoryBlock: React.FC<{
  label: string;
  citations: CitationEntry[];
}> = ({ label, citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Category sub-header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.sm,
          gap: 8,
        }}
      >
        <Text
          style={{
            ...typography.micro,
            color: colors.amber[500],
            fontSize: 9,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            ...typography.micro,
            color: darkTheme.textFaint,
            fontSize: 9,
          }}
        >
          ({citations.length})
        </Text>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: darkTheme.borderSubtle,
          }}
        />
      </View>

      {/* Citation entries */}
      <View
        style={{
          backgroundColor: darkTheme.cardBg,
          borderWidth: 1,
          borderColor: darkTheme.border,
          borderRadius: 0.01,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        }}
      >
        {citations.map((citation, index) => (
          <CitationRow
            key={citation.id || `${label}-${index}`}
            citation={citation}
            isLast={index === citations.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Guard: check if any category has items ────────────────────────────────
function hasAnyCitations(references: LegalReferences): boolean {
  return CATEGORY_ORDER.some((cat) => {
    const entries = references[cat.key];
    return Array.isArray(entries) && entries.length > 0;
  });
}

// ─── Main Component ────────────────────────────────────────────────────────
export const PdfReferencesPage: React.FC<PdfReferencesPageProps> = ({
  references,
  developmentsCount = 0,
  precedentCount = 0,
}) => {
  // Guard: skip if no meaningful data
  if (
    !references ||
    ((!references.total_count || references.total_count === 0) &&
      !hasAnyCitations(references))
  ) {
    return null;
  }

  const totalCount =
    references.total_count ||
    CATEGORY_ORDER.reduce((sum, cat) => {
      const entries = references[cat.key];
      return sum + (Array.isArray(entries) ? entries.length : 0);
    }, 0);

  return (
    <View>
      {/* Section Header */}
      <PdfSectionHeader
        title="Legal Authorities & Data Sources"
        badge={`${totalCount} CITATIONS`}
      />

      {/* Intelligence Basis Card */}
      <PdfCard variant="highlight">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: spacing.sm,
          }}
        >
          {developmentsCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: 14,
                  color: darkTheme.textPrimary,
                }}
              >
                {developmentsCount.toLocaleString()}
              </Text>
              <Text
                style={{
                  ...typography.micro,
                  color: darkTheme.textMuted,
                  fontSize: 9,
                }}
              >
                LEGAL CITATIONS
              </Text>
            </View>
          )}
          {precedentCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <Text
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: 14,
                  color: darkTheme.textPrimary,
                }}
              >
                {precedentCount.toLocaleString()}
              </Text>
              <Text
                style={{
                  ...typography.micro,
                  color: darkTheme.textMuted,
                  fontSize: 9,
                }}
              >
                PRECEDENTS ANALYZED
              </Text>
            </View>
          )}
        </View>
        <Text
          style={{
            ...typography.small,
            color: darkTheme.textSecondary,
            lineHeight: 1.6,
          }}
        >
          This analysis references {totalCount} legal authorities and data
          sources. All statutes, treaty provisions, and tax rates cited were
          verified against primary sources as of the generation date. Engage
          qualified counsel in each cited jurisdiction before executing any
          transaction.
        </Text>
      </PdfCard>

      {/* Citation Categories */}
      {CATEGORY_ORDER.map((cat) => {
        const entries = references[cat.key];
        if (!Array.isArray(entries) || entries.length === 0) return null;
        return (
          <CitationCategoryBlock
            key={cat.key}
            label={cat.label}
            citations={entries as CitationEntry[]}
          />
        );
      })}
    </View>
  );
};
