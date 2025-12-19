// components/assessment/DigitalTwinSimulation.tsx
// Digital twin simulation results section

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, AlertCircle, XCircle, User, Calendar, TrendingUp, Zap } from 'lucide-react';
import { CitationText } from '@/components/elite/citation-text';
import { useState } from 'react';

interface DigitalTwinSimulationProps {
  outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
  narrative: string;
  confidence?: number;
  onCitationClick: (citationId: string) => void;
}

const OUTCOME_CONFIG = {
  SURVIVED: {
    icon: Target,
    label: 'SURVIVED',
    description: 'Positioned defensively and capitalized on distress opportunities',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  },
  DAMAGED: {
    icon: AlertCircle,
    label: 'DAMAGED',
    description: 'Sustained losses but maintained core wealth infrastructure',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  },
  DESTROYED: {
    icon: XCircle,
    label: 'DESTROYED',
    description: 'Significant wealth erosion due to structural vulnerabilities',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30'
  },
};

export function DigitalTwinSimulation({
  outcome,
  narrative,
  confidence,
  onCitationClick
}: DigitalTwinSimulationProps) {
  const outcomeConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.DAMAGED;
  const OutcomeIcon = outcomeConfig.icon;

  // Parse narrative into sections
  const parseNarrative = (text: string) => {
    const sections = {
      psychologicalDNA: '',
      timeline: '',
      decisions: '',
      evidence: '',
      outcome: ''
    };

    // Simple parsing - split by headers
    const psychMatch = text.match(/\*\*Psychological DNA:?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const timelineMatch = text.match(/\*\*(?:Behavioral Timeline|Timeline):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const decisionsMatch = text.match(/\*\*(?:Critical Decision Points?|Decisions):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const evidenceMatch = text.match(/\*\*(?:HNWI World Evidence|Evidence):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
    const outcomeMatch = text.match(/\*\*(?:Final Outcome|Outcome):?\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

    if (psychMatch) sections.psychologicalDNA = psychMatch[1].trim();
    if (timelineMatch) sections.timeline = timelineMatch[1].trim();
    if (decisionsMatch) sections.decisions = decisionsMatch[1].trim();
    if (evidenceMatch) sections.evidence = evidenceMatch[1].trim();
    if (outcomeMatch) sections.outcome = outcomeMatch[1].trim();

    return sections;
  };

  const sections = parseNarrative(narrative);
  const [expandedSections, setExpandedSections] = useState({
    psychological: false,
    timeline: false,
    decisions: false,
    evidence: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <h2 className="text-3xl font-bold">Digital Twin Simulation</h2>
        <span className="text-sm text-muted-foreground ml-2">
          16-Month Crisis Projection
        </span>
      </div>

      <div className="space-y-3">
        {/* Outcome Card - Prominent */}
        <div className={`${outcomeConfig.bg} ${outcomeConfig.border} border-2 rounded-xl p-6`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${outcomeConfig.bg}`}>
              <OutcomeIcon className={`w-8 h-8 ${outcomeConfig.color}`} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className={`text-2xl font-bold ${outcomeConfig.color}`}>
                {outcomeConfig.label}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {outcomeConfig.description}
              </p>
            </div>
            {confidence && (
              <div className="text-right">
                <div className="text-xl font-bold">{(confidence * 100).toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            )}
          </div>
        </div>

        {/* Psychological DNA */}
        {sections.psychologicalDNA && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('psychological')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <User className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-lg font-bold">Psychological DNA</span>
              <span className={`ml-auto transition-transform ${expandedSections.psychological ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.psychological && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50">
                <CitationText
                  text={sections.psychologicalDNA}
                  onCitationClick={onCitationClick}
                  className="text-foreground leading-relaxed"
                  options={{
                    convertMarkdownBold: true,
                    preserveLineBreaks: true,
                    renderParagraphs: true
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Behavioral Timeline */}
        {sections.timeline && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('timeline')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-lg font-bold">Behavioral Timeline</span>
              <span className="text-sm text-muted-foreground ml-2">(Month-by-Month)</span>
              <span className={`ml-auto transition-transform ${expandedSections.timeline ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.timeline && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50">
                <CitationText
                  text={sections.timeline}
                  onCitationClick={onCitationClick}
                  className="text-foreground leading-relaxed"
                  options={{
                    convertMarkdownBold: true,
                    preserveLineBreaks: true,
                    renderParagraphs: true
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Critical Decisions */}
        {sections.decisions && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('decisions')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-lg font-bold">Critical Decision Points</span>
              <span className={`ml-auto transition-transform ${expandedSections.decisions ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.decisions && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50">
                <CitationText
                  text={sections.decisions}
                  onCitationClick={onCitationClick}
                  className="text-foreground leading-relaxed"
                  options={{
                    convertMarkdownBold: true,
                    preserveLineBreaks: true,
                    renderParagraphs: true
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* HNWI World Evidence */}
        {sections.evidence && (
          <div className="bg-card border border-primary/30 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('evidence')}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
            >
              <Zap className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-lg font-bold">HNWI World Intelligence Evidence</span>
              <span className={`ml-auto transition-transform ${expandedSections.evidence ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.evidence && (
              <div className="px-6 pb-6 pt-2 border-t border-border/50 bg-primary/5">
                <CitationText
                  text={sections.evidence}
                  onCitationClick={onCitationClick}
                  className="text-foreground leading-relaxed"
                  options={{
                    convertMarkdownBold: true,
                    preserveLineBreaks: true,
                    renderParagraphs: true
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* If no sections parsed, show full narrative as fallback */}
        {!sections.psychologicalDNA && !sections.timeline && !sections.decisions && (
          <div className="bg-card border border-border rounded-xl p-6">
            <CitationText
              text={narrative}
              onCitationClick={onCitationClick}
              className="text-foreground leading-relaxed"
              options={{
                convertMarkdownBold: true,
                preserveLineBreaks: true,
                renderParagraphs: true
              }}
            />
          </div>
        )}

        {/* Summary Footer - End of Digital Twin Section */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-semibold text-primary">This simulation</span> projects your strategic behavior under extreme market stress based on your psychological DNA
          </p>
        </div>
      </div>
    </motion.section>
  );
}
