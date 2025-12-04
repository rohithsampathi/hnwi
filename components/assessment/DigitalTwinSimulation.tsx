// components/assessment/DigitalTwinSimulation.tsx
// Digital twin simulation results section

"use client";

import { motion } from 'framer-motion';
import { Activity, Target, AlertCircle, XCircle } from 'lucide-react';
import { CitationText } from '@/components/elite/citation-text';

interface DigitalTwinSimulationProps {
  outcome: 'SURVIVED' | 'DAMAGED' | 'DESTROYED';
  narrative: string;
  onCitationClick: (citationId: string) => void;
}

const OUTCOME_CONFIG = {
  SURVIVED: {
    icon: Target,
    label: 'SURVIVED',
    description: 'Positioned defensively and capitalized on distress opportunities',
  },
  DAMAGED: {
    icon: AlertCircle,
    label: 'DAMAGED',
    description: 'Sustained losses but maintained core wealth infrastructure',
  },
  DESTROYED: {
    icon: XCircle,
    label: 'DESTROYED',
    description: 'Significant wealth erosion due to structural vulnerabilities',
  },
};

export function DigitalTwinSimulation({
  outcome,
  narrative,
  onCitationClick
}: DigitalTwinSimulationProps) {
  const outcomeConfig = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.DAMAGED;
  const OutcomeIcon = outcomeConfig.icon;

  // Format narrative with special markers for step headings and sections
  const formatWithStepHeadings = (text: string): string => {
    let formatted = text;

    // Remove "### Reasoning Process" header
    formatted = formatted.replace('### Reasoning Process', '').trim();

    // Format "Step by Step" section header
    formatted = formatted.replace(/\*\*Step by Step:?\*\*/gi, '<span class="section-heading">**Step by Step:**</span>');

    // Format "Simulation Output" section header
    formatted = formatted.replace(/\*\*Simulation Output:?\*\*/gi, '<span class="section-heading">**Simulation Output:**</span>');

    // Format individual step numbers (Step 1:, Step 2:, etc.)
    formatted = formatted.replace(/\*\*(Step \d+:)\*\*/g, '<span class="step-heading">**$1**</span>');

    // Format numbered sections (1., 2., 3., etc. at start of line)
    formatted = formatted.replace(/^(\d+\.)\s+/gm, '<span class="numbered-heading">**$1**</span> ');

    return formatted;
  };

  const displayNarrative = narrative ? formatWithStepHeadings(narrative) : 'No simulation narrative available.';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
        <Activity className="w-6 h-6 text-primary" strokeWidth={2} />
        <h2 className="text-xl font-bold">Digital Twin Simulation</h2>
      </div>

      <div className="bg-card p-6 border border-border space-y-6">
        {/* Outcome Badge */}
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="p-2 bg-primary/10">
            <OutcomeIcon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {outcomeConfig.label}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {outcomeConfig.description}
            </p>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="narrative-content">
          {displayNarrative ? (
            <CitationText
              text={displayNarrative}
              onCitationClick={onCitationClick}
              className="text-foreground"
              options={{
                convertMarkdownBold: true,
                preserveLineBreaks: true,
                renderParagraphs: false
              }}
            />
          ) : (
            <p className="text-muted-foreground">Loading simulation narrative...</p>
          )}
        </div>

        <style jsx>{`
          .narrative-content {
            line-height: 1.8;
            white-space: pre-wrap;
          }

          /* Section headings (Step by Step, Simulation Output) - Large prominent headers */
          .narrative-content :global(.section-heading) {
            display: block;
            margin-top: 2.5rem;
            margin-bottom: 1.5rem;
          }
          .narrative-content :global(.section-heading strong) {
            display: inline-block;
            font-size: 1.5rem;
            font-weight: 800;
            color: hsl(var(--primary));
            padding: 0.75rem 1.5rem;
            background: hsl(var(--primary) / 0.1);
            border-left: 6px solid hsl(var(--primary));
            border-radius: 4px;
          }

          /* Step headings (Step 1:, Step 2:, etc.) - Medium prominent headers */
          .narrative-content :global(.step-heading) {
            display: block;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .narrative-content :global(.step-heading strong) {
            display: inline-block;
            font-size: 1.25rem;
            font-weight: 700;
            color: hsl(var(--primary));
            padding: 0.5rem 1rem;
            background: hsl(var(--muted) / 0.5);
            border-left: 4px solid hsl(var(--primary));
          }

          /* Numbered headings (1., 2., 3., etc.) - Small sub-headers */
          .narrative-content :global(.numbered-heading) {
            display: inline-block;
            margin-top: 1rem;
          }
          .narrative-content :global(.numbered-heading strong) {
            font-size: 1.1rem;
            font-weight: 700;
            color: hsl(var(--primary));
          }

          /* Regular bold text */
          .narrative-content :global(strong) {
            font-weight: 700;
            color: hsl(var(--foreground));
          }
        `}</style>
      </div>
    </motion.section>
  );
}
