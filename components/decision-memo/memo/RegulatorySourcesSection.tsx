// components/decision-memo/memo/RegulatorySourcesSection.tsx
// Institutional-grade regulatory citations section for Decision Memo
// Displays numbered references grouped by source type (Statutory, Regulatory, Market Data)

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Shield,
  BarChart3,
  FileText,
} from 'lucide-react';
import type { RegulatoryCitation } from '@/lib/decision-memo/memo-types';

interface RegulatorySourcesSectionProps {
  citations: RegulatoryCitation[];
}

const SOURCE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  statute: { label: 'Statutory Authorities', icon: Scale, color: 'text-amber-500' },
  regulatory: { label: 'Regulatory Guidance', icon: Shield, color: 'text-blue-500' },
  market_data: { label: 'Market Data Sources', icon: BarChart3, color: 'text-emerald-500' },
  publication: { label: 'Research Publications', icon: BookOpen, color: 'text-purple-500' },
  advisory: { label: 'Advisory Sources', icon: FileText, color: 'text-slate-500' },
};

export function RegulatorySourcesSection({ citations }: RegulatorySourcesSectionProps) {
  if (!citations || citations.length === 0) return null;

  // Group citations by source_type
  const grouped: Record<string, RegulatoryCitation[]> = {};
  for (const c of citations) {
    const key = c.source_type || 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  }

  // Order: statute → regulatory → market_data → publication → advisory → other
  const typeOrder = ['statute', 'regulatory', 'market_data', 'publication', 'advisory'];
  const sortedTypes = [
    ...typeOrder.filter(t => grouped[t]),
    ...Object.keys(grouped).filter(t => !typeOrder.includes(t)),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 mb-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Sources & Citations
          </h2>
          <p className="text-xs text-muted-foreground">
            {citations.length} verified regulatory reference{citations.length !== 1 ? 's' : ''} backing this analysis
          </p>
        </div>
      </div>

      {/* Citations by Group */}
      <div className="space-y-6">
        {sortedTypes.map(sourceType => {
          const config = SOURCE_TYPE_CONFIG[sourceType] || {
            label: sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: FileText,
            color: 'text-slate-500',
          };
          const Icon = config.icon;
          const items = grouped[sourceType];

          return (
            <div key={sourceType}>
              {/* Group Label */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Citation Cards */}
              <div className="space-y-2">
                {items.map((citation) => (
                  <div
                    key={citation.citation_id}
                    className="group relative pl-10 py-2.5 pr-4 rounded-lg border border-border/50
                               bg-card/30 hover:bg-card/60 transition-colors"
                  >
                    {/* Citation Number */}
                    <div className="absolute left-3 top-3 w-5 h-5 rounded-full bg-primary/10
                                    flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {citation.citation_id}
                      </span>
                    </div>

                    {/* Citation Content */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground leading-tight">
                          {citation.title}
                        </h4>
                        {citation.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      {citation.statute_section && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {citation.statute_section}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {citation.jurisdiction && (
                          <span>Jurisdiction: {citation.jurisdiction}</span>
                        )}
                        {citation.publisher && (
                          <span>Authority: {citation.publisher}</span>
                        )}
                        {citation.effective_date && (
                          <span>Effective: {citation.effective_date}</span>
                        )}
                      </div>

                      {citation.data_point && (
                        <p className="text-xs text-foreground/80 mt-1 bg-muted/30
                                      rounded px-2 py-1 font-mono leading-relaxed">
                          {citation.data_point}
                        </p>
                      )}

                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary
                                     hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          All statutory rates and regulatory requirements are subject to change.
          This analysis is based on verified data as of the generation date.
          Verify with qualified local counsel before execution.
        </p>
      </div>
    </motion.section>
  );
}

export default RegulatorySourcesSection;
