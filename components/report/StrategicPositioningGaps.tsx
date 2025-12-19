// components/report/StrategicPositioningGaps.tsx
// Strategic Positioning Gaps - Shows dollar opportunity cost for closing performance gaps
// Replaces generic percentile metrics with actionable dollar-impact intelligence

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp, Clock, Target, FileText, Zap } from 'lucide-react';
import { CitationText } from '@/components/elite/citation-text';

export interface StrategicGap {
  dimension: string;
  current_score: number;
  peer_average: number;
  top_0_1_benchmark: number;
  gap_to_peer: number;
  gap_to_top10: number;

  // THE VALUE DATA
  estimated_annual_opportunity_cost: number;
  expected_improvement_roi: number;
  time_to_close_gap_months: number;
  recommended_actions: string[];

  // Peer Intelligence
  peers_who_improved: number;
  avg_improvement_value: number;
  success_rate: number;
}

export interface StrategicPositioningGapsData {
  gaps: StrategicGap[];
  total_annual_opportunity_cost: number;
  total_gaps_identified: number;
}

interface StrategicPositioningGapsProps {
  data: StrategicPositioningGapsData;
  gapAnalysis?: string;
  onCitationClick?: (citationId: string) => void;
  citationMap?: Map<string, number>;
}

interface GapCardProps {
  gap: StrategicGap;
  index: number;
}

// Parse gap analysis into sections - optimized for standard format
const parseGapAnalysis = (text: string) => {
  const sections: { title: string; content: string; icon: any; color: string }[] = [];

  // Standard section headers with their styling
  const standardSections = [
    { header: 'STRATEGIC STRENGTHS', displayTitle: 'Strategic Strengths', icon: Target, color: 'text-primary' },
    { header: 'GROWTH OPPORTUNITIES', displayTitle: 'Growth Opportunities', icon: TrendingUp, color: 'text-primary' },
    { header: 'RISK MANAGEMENT', displayTitle: 'Risk Management', icon: AlertCircle, color: 'text-primary' },
    { header: 'NEXT STEPS', displayTitle: 'Next Steps', icon: Zap, color: 'text-primary' }
  ];

  // Split text by the standard section headers
  // More robust approach: split the text and capture the sections
  const headerPattern = /(STRATEGIC STRENGTHS|GROWTH OPPORTUNITIES|RISK MANAGEMENT|NEXT STEPS):\s*/gi;

  // Find all header matches
  const matches = Array.from(text.matchAll(headerPattern));

  if (matches.length > 0) {
    // For each match, extract the content until the next match
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const headerText = match[1].toUpperCase();
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : text.length;
      const content = text.substring(startIndex, endIndex).trim();

      // Find the corresponding section config
      const sectionConfig = standardSections.find(s => s.header === headerText);

      if (sectionConfig && content) {
        sections.push({
          title: sectionConfig.displayTitle,
          content: content,
          icon: sectionConfig.icon,
          color: sectionConfig.color
        });
      }
    }
  }

  // If standard format not found, fall back to markdown headers
  if (sections.length === 0) {
    const headerRegex = /###\s+([^\n]+)/g;
    const parts = text.split(headerRegex);

    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].trim();
      const content = parts[i + 1]?.trim() || '';

      let icon = FileText;
      let color = 'text-primary';

      if (title.includes('STRENGTH') || title.includes('CURRENT STATE')) {
        icon = Target;
      } else if (title.includes('GROWTH') || title.includes('OPPORTUNIT')) {
        icon = TrendingUp;
      } else if (title.includes('RISK') || title.includes('MANAGEMENT')) {
        icon = AlertCircle;
      } else if (title.includes('NEXT') || title.includes('STEPS')) {
        icon = Zap;
      }

      if (title && content) {
        sections.push({ title, content, icon, color });
      }
    }
  }

  return sections;
};

// Extract bullet points from content - optimized for standard format
const extractBulletPoints = (text: string): string[] => {
  const points: string[] = [];

  // First, try to extract bullet points (• or -)
  const bulletMatches = text.match(/(?:^|\n)\s*[•\-]\s*([^\n]+(?:\n(?!\s*[•\-])[^\n]+)*)/gm);
  if (bulletMatches && bulletMatches.length > 0) {
    bulletMatches.forEach(match => {
      const cleaned = match.replace(/^\s*[•\-]\s*/, '').trim();
      if (cleaned.length > 10) {
        points.push(cleaned);
      }
    });
    return points;
  }

  // Try to extract numbered lists (1., 2., etc)
  const numberedMatches = text.match(/(?:^|\n)\s*\d+\.\s*([^\n]+(?:\n(?!\s*\d+\.)[^\n]+)*)/gm);
  if (numberedMatches && numberedMatches.length > 0) {
    numberedMatches.forEach(match => {
      const cleaned = match.replace(/^\s*\d+\.\s*/, '').trim();
      if (cleaned.length > 10) {
        points.push(cleaned);
      }
    });
    return points;
  }

  // If no explicit bullets/numbers, split by line breaks and extract meaningful lines
  const lines = text.split(/\n+/);
  lines.forEach(line => {
    const trimmed = line.trim();
    // Skip empty lines and very short fragments
    if (trimmed.length < 20) return;

    // Look for lines that start with action words or contain substantive content
    if (
      trimmed.match(/^(IMMEDIATE|SHORT|MEDIUM|STRATEGIC|ONGOING|Review|Allocate|Deploy|Layer|Audit|Fix|Tackle|Boost|Model|Check|Scenario|Mental|Structural|Portfolio|Geographic|Tax|Concentration|India)/i) ||
      trimmed.length >= 40
    ) {
      points.push(trimmed);
    }
  });

  // If we still have no points, split by periods and extract sentences
  if (points.length === 0) {
    const sentences = text.split(/\.\s+(?=[A-Z])/);
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length >= 30 && trimmed.length <= 400) {
        points.push(trimmed);
      }
    });
  }

  return points;
};

function GapCard({ gap, index }: GapCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-lg border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {gap.dimension}
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Current: <span className="text-foreground font-semibold">{gap.current_score.toFixed(1)}/10</span>
            </span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-muted-foreground">
              Peer Benchmark: <span className="text-primary font-semibold">{gap.top_0_1_benchmark.toFixed(1)}/10</span>
            </span>
          </div>
        </div>

        {/* THE VALUE METRIC */}
        <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-center flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-1 whitespace-nowrap">Annual Opportunity Cost</p>
          <p className="text-3xl font-bold text-foreground">
            ${(gap.estimated_annual_opportunity_cost / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-muted rounded-full relative">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${(gap.current_score / 10) * 100}%` }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground"
            style={{ left: `${(gap.top_0_1_benchmark / 10) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">You</span>
          <span className="text-xs text-foreground">Peer Benchmark</span>
        </div>
      </div>

      {/* Expected Impact */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Return Improvement</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            +{(gap.expected_improvement_roi * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Time to Close Gap</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {gap.time_to_close_gap_months}mo
          </p>
        </div>
        <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(gap.success_rate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">{gap.peers_who_improved} peers succeeded</p>
        </div>
      </div>

      {/* Recommended Actions */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Recommended Actions
        </h4>
        <ul className="space-y-2">
          {gap.recommended_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-primary font-semibold">{i + 1}</span>
              </div>
              <span className="flex-1">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Peer Success Story */}
      <div className="mt-4 pt-4 border-t border-border bg-muted/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{gap.peers_who_improved} peers</span> improved
          this dimension and gained an average of{' '}
          <span className="font-semibold text-foreground">
            ${(gap.avg_improvement_value / 1000).toFixed(0)}K
          </span>{' '}
          in annual returns
        </p>
      </div>
    </motion.div>
  );
}

interface StrategicGapAnalysisSectionProps {
  sections: { title: string; content: string; icon: any; color: string }[];
  rawText: string;
  onCitationClick?: (citationId: string) => void;
  hasGaps: boolean;
  citationMap?: Map<string, number>;
}

function StrategicGapAnalysisSection({ sections, rawText, onCitationClick, hasGaps, citationMap }: StrategicGapAnalysisSectionProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>(() => {
    // Initialize all sections as collapsed by default
    const initial: { [key: number]: boolean } = {};
    sections.forEach((_, index) => {
      initial[index] = false;
    });
    return initial;
  });

  const toggleSection = (index: number) => {
    const wasExpanded = expandedSections[index];
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));

    // Scroll to section when expanding
    if (!wasExpanded) {
      setTimeout(() => {
        const element = document.getElementById(`gap-section-${index}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="bg-card p-6 border border-border rounded-xl mt-6">
        <CitationText
          text={rawText}
          onCitationClick={onCitationClick}
          citationMap={citationMap}
          className="text-foreground leading-relaxed"
          options={{
            stripMarkdownBold: true,
            convertMarkdownBold: true,
            preserveLineBreaks: true,
            renderParagraphs: true
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Main Heading - Match Digital Twin style */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Gap Analysis Breakdown</h3>
        <span className="text-sm text-muted-foreground ml-2">Detailed Insights</span>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          const bulletPoints = extractBulletPoints(section.content);
          const isExpanded = expandedSections[index] ?? false;

          return (
            <div key={index} id={`gap-section-${index}`} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
              >
                <Icon className={`w-5 h-5 ${section.color} flex-shrink-0`} />
                <span className="text-lg font-bold flex-1 text-left">{section.title}</span>
                <span className={`ml-auto text-sm text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-border/50">
                      <CitationText
                        text={section.content}
                        onCitationClick={onCitationClick}
                        citationMap={citationMap}
                        className="text-foreground leading-relaxed"
                        options={{
                          stripMarkdownBold: true,
                          convertMarkdownBold: true,
                          preserveLineBreaks: true,
                          renderParagraphs: true
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StrategicPositioningGaps({ data, gapAnalysis, onCitationClick, citationMap }: StrategicPositioningGapsProps) {
  // Parse gap analysis if provided
  const gapAnalysisSections = gapAnalysis ? parseGapAnalysis(gapAnalysis) : [];

  // Handle case where no gaps exist but we have gap analysis
  const hasGaps = data.gaps && data.gaps.length > 0;
  const hasGapAnalysis = !!gapAnalysis;

  // If neither gaps nor gap analysis, show nothing
  if (!hasGaps && !hasGapAnalysis) {
    return null;
  }

  return (
    <div>
            <div className="space-y-6">
              {/* Total Opportunity Cost - Only show if multiple gaps */}
              {hasGaps && data.total_gaps_identified > 1 && (
                <div className="bg-muted/30 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-foreground mb-1">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold">
                      ${(data.total_annual_opportunity_cost / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total annual opportunity cost across all dimensions
                  </p>
                </div>
              )}

              {/* Gap Cards - Only show if gaps exist */}
              {hasGaps && (
                <div className="space-y-6">
                  {data.gaps.map((gap, index) => (
                    <GapCard key={gap.dimension} gap={gap} index={index} />
                  ))}
                </div>
              )}

              {/* Strategic Gap Analysis - Integrated */}
              {gapAnalysis && (
                <StrategicGapAnalysisSection
                  sections={gapAnalysisSections}
                  rawText={gapAnalysis}
                  onCitationClick={onCitationClick}
                  hasGaps={hasGaps}
                  citationMap={citationMap}
                />
              )}

              {/* Summary Footer - End of Gap Analysis Breakdown */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  <span className="font-semibold text-primary">Closing these gaps</span> would align your positioning with peer benchmark performance
                </p>
              </div>
            </div>
    </div>
  );
}
