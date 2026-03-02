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
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface RegulatorySourcesSectionProps {
  citations: RegulatoryCitation[];
}

const SOURCE_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  statute: { label: 'Statutory Authorities', icon: Scale, color: 'text-amber-500' },
  regulatory: { label: 'Regulatory Guidance', icon: Shield, color: 'text-primary' },
  market_data: { label: 'Market Data Sources', icon: BarChart3, color: 'text-emerald-500' },
  publication: { label: 'Research Publications', icon: BookOpen, color: 'text-muted-foreground' },
  advisory: { label: 'Advisory Sources', icon: FileText, color: 'text-muted-foreground' },
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      className="mt-4 mb-6"
    >
      {/* Section Header */}
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
          Regulatory Framework
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          Sources & Citations
        </h2>
        <p className="text-sm text-muted-foreground/60 mt-1">
          {citations.length} verified regulatory reference{citations.length !== 1 ? 's' : ''} backing this analysis
        </p>
      </div>

      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-5" />

      {/* Citations by Group */}
      <div className="space-y-8 sm:space-y-12">
        {sortedTypes.map((sourceType, groupIndex) => {
          const config = SOURCE_TYPE_CONFIG[sourceType] || {
            label: sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: FileText,
            color: 'text-slate-500',
          };
          const Icon = config.icon;
          const items = grouped[sourceType];

          return (
            <motion.div
              key={sourceType}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 * groupIndex, ease: EASE_OUT_EXPO }}
            >
              {/* Group Label */}
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
                  {config.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
              </div>

              {/* Citation Cards */}
              <div className="space-y-3">
                {items.map((citation) => (
                  <div
                    key={citation.citation_id}
                    className="group relative pl-10 py-3 pr-4 rounded-xl border border-border/20
                               bg-card/50 hover:border-gold/20 transition-colors duration-300 overflow-hidden"
                  >
                    {/* Citation Number */}
                    <div className="absolute left-3.5 top-3.5 w-5 h-5 rounded-full
                                    flex items-center justify-center border border-gold/20">
                      <span className="text-xs text-gold/70">
                        {citation.citation_id}
                      </span>
                    </div>

                    {/* Citation Content */}
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-normal text-foreground leading-tight">
                          {citation.title}
                        </h4>
                        {citation.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      {citation.statute_section && (
                        <p className="text-xs text-muted-foreground/60 font-medium">
                          {citation.statute_section}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/60">
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
                        <p className="text-sm text-foreground/60 mt-1.5 rounded-xl border border-border/20
                                      bg-card/30 px-3 py-2 font-medium leading-relaxed">
                          {citation.data_point}
                        </p>
                      )}

                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-gold/70
                                     hover:text-gold/80 transition-colors mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-xs uppercase tracking-[0.15em]">Source</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer Footer */}
      <div className="mt-10 pt-6">
        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-6" />
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          All statutory rates and regulatory requirements are subject to change.
          This analysis is based on verified data as of the generation date.
          Verify with qualified local counsel before execution.
        </p>
      </div>
    </motion.section>
  );
}

export default RegulatorySourcesSection;
