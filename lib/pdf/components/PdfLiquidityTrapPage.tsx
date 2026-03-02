/**
 * PdfLiquidityTrapPage — PDF equivalent of web LiquidityTrapFlowchart
 * "The Liquidity Prison" vertical flowchart showing capital trapped by barriers
 *
 * Uses @react-pdf/renderer Svg/Path primitives for down-arrow triangles.
 * Dark theme: #0A0A0A bg, #141414 card, #262626 border, Inter font throughout.
 */

import React from 'react';
import { View, Text, Svg, Path } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PdfLiquidityTrapPageProps {
  capitalIn: number;
  capitalOut: number;
  primaryBarrier: string;
  primaryBarrierCost: number;
  secondaryBarrier?: string;
  secondaryBarrierCost?: number;
  dayOneLossPct: number;
  assetLabel?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtCurrency(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

/**
 * Down-arrow triangle rendered via @react-pdf/renderer Svg primitives.
 * 12x8 equilateral-ish triangle pointing down, centered in a 12x8 viewBox.
 */
const DownArrow: React.FC<{ color?: string }> = ({
  color = darkTheme.textFaint,
}) => (
  <View style={{ alignItems: 'center', paddingVertical: 6 }}>
    <Svg width={12} height={8} viewBox="0 0 12 8">
      <Path d="M0 0 L6 8 L12 0 Z" fill={color} />
    </Svg>
  </View>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const PdfLiquidityTrapPage: React.FC<PdfLiquidityTrapPageProps> = ({
  capitalIn,
  capitalOut,
  primaryBarrier,
  primaryBarrierCost,
  secondaryBarrier,
  secondaryBarrierCost,
  dayOneLossPct,
  assetLabel = 'Singapore Residential Property',
}) => {
  const totalLoss = capitalIn - capitalOut;
  const lossPct = dayOneLossPct > 0 ? dayOneLossPct : (totalLoss / capitalIn) * 100;

  return (
    <View>
      {/* Section header */}
      <PdfSectionHeader title="The Liquidity Prison" badge="LIQUIDITY ANALYSIS" />

      <PdfCard variant="default">
        {/* BOX 1 — CAPITAL DEPLOYED (emerald border) */}
        <View
          style={{
            borderWidth: 1,
            borderColor: `${colors.emerald[500]}33`, // ~20% opacity
            borderRadius: 8,
            backgroundColor: `${darkTheme.cardBg}80`,
            padding: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...typography.micro,
              color: darkTheme.textFaint,
              letterSpacing: 2,
              marginBottom: 6,
            }}
          >
            CAPITAL DEPLOYED
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              color: colors.emerald[500],
              letterSpacing: -0.3,
            }}
          >
            {fmtCurrency(capitalIn)}
          </Text>
        </View>

        {/* Arrow */}
        <DownArrow color={darkTheme.textFaint} />

        {/* Asset label box */}
        <View
          style={{
            borderWidth: 1,
            borderColor: `${darkTheme.border}33`,
            borderRadius: 8,
            backgroundColor: `${darkTheme.cardBg}80`,
            padding: spacing.sm,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...typography.small,
              color: darkTheme.textFaint,
            }}
          >
            {assetLabel}
          </Text>
        </View>

        {/* Arrow */}
        <DownArrow color={darkTheme.textFaint} />

        {/* BARRIER ZONE (red border) */}
        <View
          style={{
            borderWidth: 1,
            borderColor: `${colors.red[500]}33`, // ~20% opacity
            borderRadius: 8,
            backgroundColor: `${darkTheme.cardBg}80`,
            padding: spacing.md,
          }}
        >
          {/* Red gradient-ish accent line */}
          <View
            style={{
              height: 1,
              backgroundColor: `${colors.red[500]}4D`, // ~30% opacity
              marginBottom: spacing.md,
            }}
          />

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: spacing.sm }}>
            <Text
              style={{
                ...typography.micro,
                color: `${colors.red[500]}CC`, // ~80% opacity
                letterSpacing: 2.5,
              }}
            >
              BARRIER ZONE
            </Text>
          </View>

          {/* Primary barrier row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderWidth: 1,
              borderColor: `${colors.red[500]}26`, // ~15% opacity
              borderRadius: 8,
              backgroundColor: `${colors.red[500]}08`, // ~3% opacity
              marginBottom: spacing.xs,
            }}
          >
            <Text
              style={{
                ...typography.small,
                color: darkTheme.textPrimary,
              }}
            >
              {primaryBarrier}
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: 'Inter',
                fontWeight: 500,
                color: colors.red[500],
              }}
            >
              -{fmtCurrency(primaryBarrierCost)}
            </Text>
          </View>

          {/* Secondary barrier row (optional) */}
          {secondaryBarrier && !!secondaryBarrierCost && secondaryBarrierCost > 0 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 1,
                borderColor: `${colors.red[500]}26`,
                borderRadius: 8,
                backgroundColor: `${colors.red[500]}08`,
                marginBottom: spacing.xs,
              }}
            >
              <Text
                style={{
                  ...typography.small,
                  color: darkTheme.textPrimary,
                }}
              >
                {secondaryBarrier}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  color: colors.red[500],
                }}
              >
                -{fmtCurrency(secondaryBarrierCost)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: `${darkTheme.border}4D`, // ~30% opacity
              marginVertical: spacing.sm,
            }}
          />

          {/* Capital Destroyed total */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderWidth: 1,
              borderColor: `${colors.red[500]}40`, // ~25% opacity
              borderRadius: 8,
              backgroundColor: `${colors.red[500]}0D`, // ~5% opacity
            }}
          >
            <Text
              style={{
                ...typography.micro,
                color: `${colors.red[500]}CC`, // ~80% opacity
                letterSpacing: 1.5,
              }}
            >
              CAPITAL DESTROYED
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Inter',
                fontWeight: 500,
                color: colors.red[500],
              }}
            >
              -{fmtCurrency(totalLoss)}
            </Text>
          </View>
        </View>

        {/* Arrow */}
        <DownArrow color={darkTheme.textFaint} />

        {/* BOX 2 — RECOVERABLE CAPITAL */}
        <View
          style={{
            borderWidth: 1,
            borderColor: `${darkTheme.border}33`,
            borderRadius: 8,
            backgroundColor: `${darkTheme.cardBg}80`,
            padding: spacing.md,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...typography.micro,
              color: darkTheme.textFaint,
              letterSpacing: 2,
              marginBottom: 6,
            }}
          >
            RECOVERABLE CAPITAL
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontFamily: 'Inter',
              fontWeight: 700,
              color: darkTheme.textMuted,
              letterSpacing: -0.3,
            }}
          >
            {fmtCurrency(capitalOut)}
          </Text>
          <Text
            style={{
              ...typography.small,
              color: `${colors.red[500]}B3`, // ~70% opacity
              marginTop: 4,
            }}
          >
            {lossPct.toFixed(2)}% trapped on Day One
          </Text>
        </View>

        {/* Footer label */}
        <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
          <Text
            style={{
              ...typography.micro,
              color: `${colors.red[500]}99`, // ~60% opacity
              letterSpacing: 2.5,
            }}
          >
            IMMEDIATE EQUITY DESTRUCTION UPON ACQUISITION
          </Text>
        </View>
      </PdfCard>
    </View>
  );
};
