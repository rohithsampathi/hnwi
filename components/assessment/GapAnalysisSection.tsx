// components/assessment/GapAnalysisSection.tsx
// Gap analysis results section - redesigned for better readability

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, TrendingUp, AlertCircle, Target, Zap, ChevronDown } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const displayGapAnalysis = gapAnalysis || 'No gap analysis available.';

  // Parse gap analysis into sections and extract key points
  const parseGapAnalysis = (text: string) => {
    const sections: { title: string; content: string; icon: any; color: string }[] = [];

    // Split by markdown headers (### HEADER)
    const headerRegex = /###\s+([^\n]+)/g;
    const parts = text.split(headerRegex);

    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i].trim();
      const content = parts[i + 1]?.trim() || '';

      // Assign icons and colors based on section
      let icon = FileText;
      let color = 'text-foreground';

      if (title.includes('CURRENT STATE')) {
        icon = Target;
        color = 'text-blue-500';
      } else if (title.includes('COMPARE')) {
        icon = TrendingUp;
        color = 'text-purple-500';
      } else if (title.includes('GAPS')) {
        icon = AlertCircle;
        color = 'text-orange-500';
      } else if (title.includes('MISSING')) {
        icon = Zap;
        color = 'text-yellow-500';
      } else if (title.includes('NEXT STEPS')) {
        icon = Target;
        color = 'text-green-500';
      }

      if (title && content) {
        sections.push({ title, content, icon, color });
      }
    }

    return sections;
  };

  const sections = parseGapAnalysis(displayGapAnalysis);

  // Extract bullet points from content
  const extractBulletPoints = (text: string): string[] => {
    const points: string[] = [];

    // Split by sentences and get key points
    const sentences = text.split(/\. (?=[A-Z])/);

    sentences.forEach(sentence => {
      // Look for key indicators: "First,", "Second,", numbered points, or action verbs
      if (
        sentence.match(/^(First|Second|Third|Fourth|1\.|2\.|3\.|Fix|Tackle|Boost|Allocate|Model|Check|Dive)/i) ||
        sentence.length > 50 && sentence.length < 200
      ) {
        points.push(sentence.trim());
      }
    });

    return points.slice(0, 5); // Limit to 5 key points per section
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 mb-4 pb-3 border-b border-border hover:opacity-80 transition-opacity"
      >
        <FileText className="w-6 h-6 text-primary flex-shrink-0" strokeWidth={2} />
        <h2 className="text-xl font-bold">Strategic Gap Analysis</h2>
        <span className="text-sm text-muted-foreground ml-2">Actionable Insights</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const bulletPoints = extractBulletPoints(section.content);

            return (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-muted/50 to-muted/30 px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${section.color}`} />
                    <h3 className="text-lg font-bold">{section.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  {bulletPoints.length > 0 ? (
                    <div className="space-y-3">
                      {bulletPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                          <div className={`mt-1 w-2 h-2 rounded-full ${section.color.replace('text-', 'bg-')} flex-shrink-0`} />
                          <div className="flex-1">
                            <CitationText
                              text={point}
                              onCitationClick={onCitationClick}
                              className="text-foreground text-sm leading-relaxed"
                              options={{
                                convertMarkdownBold: true,
                                preserveLineBreaks: false,
                                renderParagraphs: false
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <CitationText
                      text={section.content}
                      onCitationClick={onCitationClick}
                      className="text-foreground text-sm leading-relaxed"
                      options={{
                        convertMarkdownBold: true,
                        preserveLineBreaks: true,
                        renderParagraphs: true
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card p-6 border border-border rounded-xl">
          <CitationText
            text={displayGapAnalysis}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
