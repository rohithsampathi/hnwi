/**
 * PdfMemoHeaderPage — Executive Summary / Verdict Header
 * Maps to web's MemoHeader component
 * Shows: Verdict badge, hero value creation, key metrics, returns analysis
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing, formatCurrency } from '../pdf-styles';
import { getVerdictTheme, getVerdictColor } from '../pdf-verdict-theme';
import { PdfCard } from './primitives/PdfCard';
import { PdfBadge } from './primitives/PdfBadge';
import type { PdfViaNegativa } from '../helpers/pdf-data-transformer';

interface PdfMemoHeaderPageProps {
  intakeId: string;
  generatedAt: string;
  exposureClass: string;
  totalSavings: string;
  precedentCount: number;
  verdict: string;
  optimalStructure?: { name?: string; type?: string; net_benefit_10yr?: number };
  valueCreation?: {
    annual?: {
      rental?: number;
      rental_formatted?: string;
      appreciation?: number;
      appreciation_formatted?: string;
      tax_savings?: number;
      total?: number;
      total_formatted?: string;
    };
    annual_tax_savings?: number;
    annual_cgt_savings?: number;
    annual_estate_benefit?: number;
    formatted?: {
      annual_tax_savings?: string;
      annual_cgt_savings?: string;
      annual_estate_benefit?: string;
    };
  };
  viaNegativa?: PdfViaNegativa;
}

type VerdictTier = 'approved' | 'conditional' | 'vetoed';

const TIER_LABELS: Record<VerdictTier, string> = {
  approved: 'APPROVED',
  conditional: 'UNDER REVIEW',
  vetoed: 'ELEVATED RISK',
};

function getTier(verdict: string, viaNegativa?: PdfViaNegativa): VerdictTier {
  if (viaNegativa?.isActive) return 'vetoed';
  const v = (verdict || '').toUpperCase();
  if (v.includes('REVIEW REQUIRED') || v === 'DO_NOT_PROCEED' || v.includes('NOT_RECOMMENDED')) return 'vetoed';
  if (v === 'APPROVED' || v === 'PROCEED') return 'approved';
  return 'conditional';
}

function getTierColor(tier: VerdictTier): string {
  switch (tier) {
    case 'approved': return colors.amber[500];
    case 'vetoed': return colors.red[700];
    default: return colors.amber[500];
  }
}

const verdictDisplay: Record<string, { line1: string; line2: string }> = {
  'PROCEED': { line1: 'Decision Memo', line2: 'Proceed' },
  'PROCEED_MODIFIED': { line1: 'Decision Memo', line2: 'Proceed Modified' },
  'PROCEED_DIVERSIFICATION_ONLY': { line1: 'Decision Memo', line2: 'Diversification Only' },
  'DO_NOT_PROCEED': { line1: 'Decision Memo', line2: 'Do Not Proceed' },
};

export const PdfMemoHeaderPage: React.FC<PdfMemoHeaderPageProps> = ({
  intakeId,
  generatedAt,
  exposureClass,
  totalSavings,
  precedentCount,
  verdict,
  optimalStructure,
  valueCreation,
  viaNegativa,
}) => {
  const tier = getTier(verdict, viaNegativa);
  const tierColor = getTierColor(tier);
  const tierLabel = TIER_LABELS[tier];
  const vd = verdictDisplay[verdict];
  const heroText = vd?.line2 || vd?.line1 || 'Decision Memo';
  const subtitle = vd?.line2 ? vd.line1 : undefined;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Build value creation items
  const vcItems: Array<{ value: string; label: string; color: string }> = [];
  if (valueCreation) {
    const annual = valueCreation.annual;
    if (annual) {
      if (annual.rental !== undefined) {
        vcItems.push({
          value: annual.rental_formatted || formatCurrency(annual.rental),
          label: 'Rental Income',
          color: annual.rental > 0 ? colors.amber[500] : darkTheme.textMuted,
        });
      }
      if (annual.appreciation !== undefined) {
        vcItems.push({
          value: annual.appreciation_formatted || formatCurrency(annual.appreciation),
          label: 'Appreciation',
          color: annual.appreciation > 0 ? colors.amber[500] : darkTheme.textMuted,
        });
      }
    }
    if (typeof valueCreation.annual_tax_savings === 'number') {
      const v = valueCreation.annual_tax_savings;
      vcItems.push({
        value: valueCreation.formatted?.annual_tax_savings || formatCurrency(Math.abs(v)),
        label: v < 0 ? 'Tax Cost' : 'Tax Savings',
        color: v > 0 ? colors.amber[500] : v < 0 ? colors.red[700] : darkTheme.textMuted,
      });
    }
    if (typeof valueCreation.annual_cgt_savings === 'number') {
      const v = valueCreation.annual_cgt_savings;
      vcItems.push({
        value: valueCreation.formatted?.annual_cgt_savings || formatCurrency(Math.abs(v)),
        label: v < 0 ? 'CGT Cost' : 'CGT Savings',
        color: v > 0 ? colors.amber[500] : v < 0 ? colors.red[700] : darkTheme.textMuted,
      });
    }
    if (typeof valueCreation.annual_estate_benefit === 'number') {
      const v = valueCreation.annual_estate_benefit;
      vcItems.push({
        value: valueCreation.formatted?.annual_estate_benefit || formatCurrency(Math.abs(v)),
        label: v < 0 ? 'Estate Cost' : 'Estate Benefit',
        color: v > 0 ? colors.amber[500] : v < 0 ? colors.red[700] : darkTheme.textMuted,
      });
    }
  }

  return (
    <View>
      {/* Top row: Status dot + label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tierColor, marginRight: 8 }} />
        <Text style={{ ...typography.micro, color: tierColor, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          Decision Memo
        </Text>
        <View style={{ width: 1, height: 10, backgroundColor: darkTheme.border, marginHorizontal: 8 }} />
        <Text style={{ ...typography.micro, color: tierColor, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          {tierLabel}
        </Text>
      </View>

      {/* Hero verdict text */}
      <Text style={{ fontSize: 42, fontFamily: 'Inter', fontWeight: 700, color: tierColor, letterSpacing: -0.5, marginBottom: 4 }}>
        {heroText}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, fontFamily: 'Inter', color: darkTheme.textMuted, letterSpacing: 0.5, marginBottom: spacing.sm }}>
          {subtitle}
        </Text>
      )}

      {/* Date + Reference */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.xs }}>
        <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textMuted }}>{formatDate(generatedAt)}</Text>
        <View style={{ width: 1, height: 10, backgroundColor: darkTheme.border, marginHorizontal: 8 }} />
        <Text style={{ fontSize: 9, fontFamily: 'Courier', color: darkTheme.textFaint, letterSpacing: 1.5 }}>
          {intakeId.slice(10, 22).toUpperCase()}
        </Text>
      </View>

      {/* Key Metrics Row */}
      <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
        {/* Total Value Creation */}
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            Total Value Creation
          </Text>
          <Text style={{ fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: tierColor }}>
            {totalSavings}
          </Text>
          <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textFaint, marginTop: 4 }}>
            {valueCreation?.annual ? 'Projected annual returns' : 'Annual tax-optimized savings'}
          </Text>
        </View>

        {/* Optimal Structure / Strategy */}
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            {optimalStructure ? 'Optimal Structure' : 'Strategy Classification'}
          </Text>
          <Text style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>
            {optimalStructure ? optimalStructure.name || '—' : exposureClass}
          </Text>
          {optimalStructure?.net_benefit_10yr && (
            <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textFaint, marginTop: 4 }}>
              {(optimalStructure.net_benefit_10yr / 1_000_000).toFixed(2)}M 10-yr benefit
            </Text>
          )}
        </View>

        {/* Intelligence Depth */}
        <View style={{ flex: 1 }}>
          <Text style={{ ...typography.micro, color: darkTheme.textMuted, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>
            Intelligence Depth
          </Text>
          <Text style={{ fontSize: 28, fontFamily: 'Inter', fontWeight: 700, color: darkTheme.textPrimary }}>
            {precedentCount > 0 ? precedentCount.toLocaleString() : '—'}
          </Text>
          <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textFaint, marginTop: 4 }}>
            Corridor signals analyzed
          </Text>
        </View>
      </View>

      {/* Returns Analysis */}
      {vcItems.length > 0 && (
        <View>
          <View style={{ height: 1, backgroundColor: darkTheme.borderSubtle, marginBottom: spacing.md }} />
          <Text style={{ ...typography.micro, color: colors.amber[500], marginBottom: spacing.sm, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
            Returns Analysis
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {vcItems.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'baseline', marginRight: spacing.lg, marginBottom: spacing.xs }}>
                <Text style={{ fontSize: 12, fontFamily: 'Inter', fontWeight: 700, color: item.color, marginRight: 4 }}>
                  {item.value}
                </Text>
                <Text style={{ ...typography.micro, color: darkTheme.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Advisory Disclosure */}
      <View style={{ marginTop: spacing.lg, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: darkTheme.borderSubtle }}>
        <Text style={{ fontSize: 9, fontFamily: 'Inter', color: darkTheme.textFaint, lineHeight: 1.5 }}>
          Pattern & Market Intelligence Report based on {precedentCount > 0 ? precedentCount.toLocaleString() : '0'}+ analyzed corridor signals. This report provides strategic intelligence and pattern analysis for informed decision-making. For execution and implementation, consult your legal, tax, and financial advisory teams.
        </Text>
      </View>
    </View>
  );
};
