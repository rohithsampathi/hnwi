'use client';

/**
 * ReferencesSection - Legal Authorities & Data Sources
 *
 * MFO AUDIT REQUIREMENT (Feb 2026):
 * "Every regulatory/tax claim must be backed by a citation."
 * "At minimum, a references section listing all legal authorities."
 *
 * This component displays all statutes, regulations, and data sources
 * cited throughout the Decision Memo in a professional format.
 */

import { motion } from 'framer-motion';
import { Scale, Building, Globe, FileText, Database, Handshake, BookOpen, ExternalLink } from 'lucide-react';
import type { LegalReferences, CitationEntry } from '@/lib/decision-memo/memo-types';

interface ReferencesSectionProps {
  references: LegalReferences;
}

interface CitationCategoryProps {
  title: string;
  icon: React.ReactNode;
  citations: CitationEntry[];
  delay: number;
}

function CitationCategory({ title, icon, citations, delay }: CitationCategoryProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground">({citations.length})</span>
      </div>

      <div className="space-y-2 pl-8">
        {citations.map((citation, index) => (
          <div
            key={citation.id || index}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-xs border-l-2 border-primary/20 pl-3 py-1"
          >
            <span className="font-mono font-semibold text-primary whitespace-nowrap">
              {citation.short_cite}
            </span>
            <span className="text-foreground/80 flex-1">
              {citation.title}
            </span>
            <span className="text-muted-foreground text-[10px] font-mono">
              {citation.reference}
            </span>
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function ReferencesSection({ references }: ReferencesSectionProps) {
  if (!references || references.total_count === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mt-12 pt-8 border-t border-border"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Legal Authorities & Data Sources
          </h3>
          <p className="text-xs text-muted-foreground">
            {references.total_count} citations referenced in this analysis
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Disclaimer:</strong> This memo cites authoritative sources for informational purposes only.
          Tax laws change frequently. Verify all citations with primary sources and consult qualified legal/tax counsel
          before making decisions. Data sources reflect publication dates indicated.
        </p>
      </div>

      {/* Citation Categories - Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        {/* Left Column - Tax & Legal */}
        <div>
          <CitationCategory
            title="US Tax Code"
            icon={<Building className="w-3.5 h-3.5 text-primary" />}
            citations={references.tax_statutes}
            delay={0.1}
          />

          <CitationCategory
            title="State Tax Laws"
            icon={<Building className="w-3.5 h-3.5 text-amber-500" />}
            citations={references.state_tax_laws}
            delay={0.15}
          />

          <CitationCategory
            title="Foreign Tax Authorities"
            icon={<Globe className="w-3.5 h-3.5 text-blue-500" />}
            citations={references.foreign_tax_laws}
            delay={0.2}
          />

          <CitationCategory
            title="Treaties & FTAs"
            icon={<Handshake className="w-3.5 h-3.5 text-green-500" />}
            citations={references.treaties}
            delay={0.25}
          />
        </div>

        {/* Right Column - Regulations & Data */}
        <div>
          <CitationCategory
            title="Regulations"
            icon={<FileText className="w-3.5 h-3.5 text-orange-500" />}
            citations={references.regulations}
            delay={0.3}
          />

          <CitationCategory
            title="Compliance Forms"
            icon={<FileText className="w-3.5 h-3.5 text-red-500" />}
            citations={references.compliance_forms}
            delay={0.35}
          />

          <CitationCategory
            title="Market Data Sources"
            icon={<Database className="w-3.5 h-3.5 text-purple-500" />}
            citations={references.market_data_sources}
            delay={0.4}
          />

          <CitationCategory
            title="IRS Guidance"
            icon={<BookOpen className="w-3.5 h-3.5 text-cyan-500" />}
            citations={references.guidance}
            delay={0.45}
          />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 pt-4 border-t border-border/50"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono">
            HNWI CHRONICLES | PATTERN INTELLIGENCE DIVISION
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ReferencesSection;
