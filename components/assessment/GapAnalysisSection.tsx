// components/assessment/GapAnalysisSection.tsx
// Gap analysis results section

"use client";

import { motion } from 'framer-motion';
import { FileText, BookOpen } from 'lucide-react';
import { CitationText } from '@/components/elite/citation-text';

interface GapAnalysisSectionProps {
  gapAnalysis: string;
  briefsCited?: string[];
  onCitationClick: (citationId: string) => void;
}

export function GapAnalysisSection({
  gapAnalysis,
  briefsCited,
  onCitationClick
}: GapAnalysisSectionProps) {
  const displayGapAnalysis = gapAnalysis || 'No gap analysis available.';

  return (
    <>
      {/* Gap Analysis */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
          <FileText className="w-6 h-6 text-primary" strokeWidth={2} />
          <h2 className="text-xl font-bold">Gap Analysis</h2>
        </div>

        <div className="bg-card p-6 border border-border">
          <div className="gap-content">
            {displayGapAnalysis ? (
              <CitationText
                text={displayGapAnalysis}
                onCitationClick={onCitationClick}
                className="text-foreground"
                options={{
                  convertMarkdownBold: true,
                  preserveLineBreaks: true,
                  renderParagraphs: false
                }}
              />
            ) : (
              <p className="text-muted-foreground">Loading gap analysis...</p>
            )}
          </div>

          <style jsx>{`
            .gap-content {
              line-height: 1.8;
              white-space: pre-wrap;
            }
            .gap-content :global(strong) {
              display: inline-block;
              font-weight: 700;
              color: hsl(var(--primary));
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }
          `}</style>
        </div>
      </motion.section>

      {/* HNWI World Briefs Referenced */}
      {briefsCited && briefsCited.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
            <BookOpen className="w-6 h-6 text-primary" strokeWidth={2} />
            <h2 className="text-xl font-bold">Intelligence Sources</h2>
          </div>

          <div className="bg-card p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-4">
              This assessment referenced <span className="font-bold text-foreground">{briefsCited.length} developments</span> from HNWI World intelligence database:
            </p>
            <div className="flex flex-wrap gap-2">
              {briefsCited.map((brief, index) => (
                <button
                  key={index}
                  onClick={() => onCitationClick(brief)}
                  className="inline-flex items-center justify-center px-2 py-1 bg-primary/10 hover:bg-primary/20 text-sm text-primary font-medium rounded transition-colors cursor-pointer"
                >
                  [{index + 1}]
                </button>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </>
  );
}
