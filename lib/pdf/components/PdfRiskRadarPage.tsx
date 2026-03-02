/**
 * PdfRiskRadarPage — Capital Allocation Risk Profile
 * Maps to web's RiskRadarChart component
 * Shows: Spider chart SVG, score grid, structural diagnosis
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { darkTheme, colors, typography, spacing } from '../pdf-styles';
import { PdfSectionHeader } from './primitives/PdfSectionHeader';
import { PdfCard } from './primitives/PdfCard';
import { PdfBadge } from './primitives/PdfBadge';
import { RadarChart } from './svg/RadarChart';
import { MiniMetricBar } from './svg/MiniMetricBar';

interface DoctrineScore {
  label: string;
  shortLabel: string;
  score: number;
  maxScore: number;
}

interface PdfRiskRadarPageProps {
  scores: DoctrineScore[];
  antifragilityAssessment?: string;
  failureModeCount?: number;
  totalRiskFlags?: number;
  isVetoed?: boolean;
}

function getScoreColor(score: number): string {
  if (score <= 2) return colors.red[500];
  if (score <= 4) return colors.orange[500];
  if (score <= 6) return colors.yellow[500];
  return colors.emerald[500];
}

export const PdfRiskRadarPage: React.FC<PdfRiskRadarPageProps> = ({
  scores,
  antifragilityAssessment,
  failureModeCount,
  totalRiskFlags,
  isVetoed,
}) => {
  if (!scores || scores.length < 3) return null;

  const avgScore = scores.reduce((s, d) => s + d.score, 0) / scores.length;
  const maxScore = Math.max(...scores.map(s => s.score));
  const minScore = Math.min(...scores.map(s => s.score));
  const imbalance = maxScore - minScore;
  const criticalCount = scores.filter(s => s.score <= 3).length;

  // Diagnosis text
  let diagnosisTitle: string;
  let diagnosisBody: string;
  if (imbalance >= 6) {
    diagnosisTitle = 'Critical Imbalance Detected.';
    diagnosisBody = `The asset quality (${maxScore}/10) is sound, but structural dimensions (${minScore}/10 minimum) expose the deal to systemic risk. The shape reveals a fundamentally broken structure around a viable asset.`;
  } else if (imbalance >= 4) {
    diagnosisTitle = 'Moderate Asymmetry.';
    diagnosisBody = `Select dimensions score well, but gaps in key areas create vulnerability.${failureModeCount ? ` ${failureModeCount} failure modes detected.` : ''}`;
  } else if (avgScore < 5) {
    diagnosisTitle = 'Uniformly Weak Profile.';
    diagnosisBody = 'No dimension scores above average. The deal lacks structural merit across all assessed criteria.';
  } else {
    diagnosisTitle = 'Balanced Structure.';
    diagnosisBody = `Scores are within acceptable ranges across all dimensions.${totalRiskFlags ? ` ${totalRiskFlags} risk flags noted for monitoring.` : ''}`;
  }

  return (
    <View>
      <PdfSectionHeader
        title="Capital Allocation Risk Profile"
        subtitle="Multi-Dimensional Structural Integrity"
      />

      {/* Radar Chart - centered */}
      <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <RadarChart scores={scores} size={200} isVetoed={isVetoed} />
      </View>

      {/* Score Grid: 2 rows × 3 cols */}
      {[0, 3].map((startIdx) => (
        <View key={startIdx} style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
          {scores.slice(startIdx, startIdx + 3).map((s, i) => {
            const color = getScoreColor(s.score);
            const isCritical = s.score <= 3;
            return (
              <View
                key={startIdx + i}
                style={{
                  flex: 1,
                  backgroundColor: darkTheme.cardBg,
                  borderWidth: 1,
                  borderColor: darkTheme.border,
                  borderRadius: 8,
                  padding: spacing.sm,
                  marginRight: i < 2 ? spacing.xs : 0,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ ...typography.micro, color: darkTheme.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', maxWidth: '80%' }} numberOfLines={1}>
                    {s.label}
                  </Text>
                  {isCritical && (
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ef4444' }} />
                  )}
                </View>
                <Text style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: 700, color, marginBottom: 4 }}>
                  {s.score}<Text style={{ fontSize: 9, color: darkTheme.textFaint, fontWeight: 400 }}>/10</Text>
                </Text>
                <MiniMetricBar value={s.score} maxValue={10} color={color} width={80} height={3} />
              </View>
            );
          })}
        </View>
      ))}

      {/* Structural Diagnosis */}
      <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: darkTheme.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <Text style={{ ...typography.micro, color: darkTheme.textFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Structural Diagnosis
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {criticalCount > 0 && (
              <PdfBadge label={`${criticalCount} CRITICAL`} variant="critical" />
            )}
            {antifragilityAssessment && (
              <View style={{ marginLeft: 6 }}>
                <PdfBadge
                  label={antifragilityAssessment.replace(/_/g, ' ')}
                  variant={
                    antifragilityAssessment === 'ANTIFRAGILE' ? 'success' :
                    antifragilityAssessment === 'FRAGILE' ? 'medium' : 'critical'
                  }
                />
              </View>
            )}
          </View>
        </View>
        <Text style={{ fontSize: 8.5, fontFamily: 'Inter', color: darkTheme.textFaint, lineHeight: 1.5 }}>
          <Text style={{ color: darkTheme.textMuted, fontWeight: 600 }}>{diagnosisTitle} </Text>
          {diagnosisBody}
        </Text>
      </View>
    </View>
  );
};
