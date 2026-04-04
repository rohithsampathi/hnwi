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
import type { LegalReferences, CitationEntry } from '@/lib/pdf/pdf-types';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface ReferencesSectionProps {
  references: LegalReferences;
  developmentsCount?: number;
  precedentCount?: number;
}

interface CitationCategoryProps {
  title: string;
  icon: React.ReactNode;
  citations?: CitationEntry[];
  delay: number;
}

function CitationCategory({ title, icon, citations, delay }: CitationCategoryProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground/60 font-medium">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground/60">({citations.length})</span>
        <div className="flex-1 h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
      </div>

      <div className="space-y-2 pl-7">
        {citations.map((citation, index) => (
          <div
            key={citation.id || index}
            className="text-xs py-1.5"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="font-medium text-gold/70 shrink-0">
                {citation.short_cite}
              </span>
              <span className="text-foreground/60 font-normal flex-1 min-w-[120px] break-words">
                {citation.title}
              </span>
            </div>
            {citation.reference && (
              <div className="text-muted-foreground/60 text-xs font-medium mt-0.5">
                {citation.reference}
              </div>
            )}
            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/70 hover:text-gold/80 inline-flex items-center gap-0.5 transition-colors"
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

export function ReferencesSection({ references, developmentsCount = 0, precedentCount = 0 }: ReferencesSectionProps) {
  if (!references || references.total_count === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      className="mt-4 pt-2"
    >
      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-6" />

      {/* Section Header */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
          Legal Framework
        </p>
        <h3 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          Legal Authorities & Data Sources
        </h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          {references.total_count} citations referenced in this analysis
        </p>
      </div>

      {/* Intelligence Basis */}
      <motion.div
        className="relative rounded-2xl border border-border/30 overflow-hidden px-4 sm:px-8 py-5 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
        <p className="relative text-sm text-foreground/50 leading-relaxed font-normal">
          <strong className="text-foreground/70 font-medium">Intelligence Basis:</strong> This analysis is grounded in HNWI Chronicles&apos; 3-year proprietary knowledge base
          {developmentsCount > 0 && <> spanning <strong className="text-foreground/70 font-medium">{developmentsCount.toLocaleString()}</strong> HNWI developments</>}
          {precedentCount > 0 && <> and <strong className="text-foreground/70 font-medium">{precedentCount.toLocaleString()}</strong> cross-jurisdictional corridor signals</>}.
          {' '}All statutes, treaty provisions, and tax rates cited below were verified against primary sources as of the generation date.
          Engage qualified counsel in each cited jurisdiction before executing any transaction.
        </p>
      </motion.div>

      {/* Citation Categories - Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        {/* Left Column - Tax & Legal */}
        <div>
          <CitationCategory
            title="US Tax Code"
            icon={<Building className="w-3.5 h-3.5 text-gold/70" />}
            citations={references.tax_statutes}
            delay={0.1}
          />

          <CitationCategory
            title="State Tax Laws"
            icon={<Building className="w-3.5 h-3.5 text-amber-500/50" />}
            citations={references.state_tax_laws}
            delay={0.15}
          />

          <CitationCategory
            title="Foreign Tax Authorities"
            icon={<Globe className="w-3.5 h-3.5 text-gold/70" />}
            citations={references.foreign_tax_laws}
            delay={0.2}
          />

          <CitationCategory
            title="Treaties & FTAs"
            icon={<Handshake className="w-3.5 h-3.5 text-emerald-500/50" />}
            citations={references.treaties}
            delay={0.25}
          />
        </div>

        {/* Right Column - Regulations & Data */}
        <div>
          <CitationCategory
            title="Regulations"
            icon={<FileText className="w-3.5 h-3.5 text-gold/70" />}
            citations={references.regulations}
            delay={0.3}
          />

          <CitationCategory
            title="Compliance Forms"
            icon={<FileText className="w-3.5 h-3.5 text-destructive/50" />}
            citations={references.compliance_forms}
            delay={0.35}
          />

          <CitationCategory
            title="Market Data Sources"
            icon={<Database className="w-3.5 h-3.5 text-muted-foreground/60" />}
            citations={references.market_data_sources}
            delay={0.4}
          />

          <CitationCategory
            title="IRS Guidance"
            icon={<BookOpen className="w-3.5 h-3.5 text-gold/70" />}
            citations={references.guidance}
            delay={0.45}
          />
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT_EXPO }}
        className="mt-10 pt-6"
      >
        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-6" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/60">
            Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground/60 tracking-[0.15em]">
            HNWI CHRONICLES | PATTERN INTELLIGENCE DIVISION
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ReferencesSection;
