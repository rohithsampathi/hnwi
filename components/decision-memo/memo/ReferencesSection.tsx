'use client';

/**
 * ReferencesSection - Intelligence Authorities Ledger
 *
 * MFO AUDIT REQUIREMENT (Feb 2026):
 * "Every regulatory/tax claim must be backed by a citation."
 * "At minimum, a references section listing all legal authorities."
 *
 * This component displays all statutes, regulations, and data sources
 * cited throughout the Decision Memo in a professional format.
 */

import { motion } from 'framer-motion';
import { Building, Globe, FileText, Database, Handshake, ExternalLink, ShieldCheck } from 'lucide-react';
import type { LegalReferences, CitationEntry } from '@/lib/pdf/pdf-types';
import { EASE_OUT_EXPO } from '@/lib/animations/motion-variants';

interface ReferencesSectionProps {
  references: LegalReferences;
  developmentsCount?: number;
  precedentCount?: number;
}

interface CitationCategoryProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  citations?: CitationEntry[];
  delay: number;
}

function CitationCategory({ title, description, icon, citations, delay }: CitationCategoryProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="text-sm uppercase tracking-[0.18em] text-foreground/70 font-semibold">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground/60">({citations.length})</span>
        <div className="flex-1 h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent" />
      </div>

      {description && (
        <p className="text-sm text-muted-foreground/70 leading-relaxed pl-7 mb-4">
          {description}
        </p>
      )}

      <div className="space-y-3 pl-7">
        {citations.map((citation, index) => (
          <div
            key={citation.id || index}
            className="rounded-2xl border border-border/25 bg-card/50 px-4 py-4"
          >
            <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
              <span className="font-medium text-gold/90 shrink-0 text-xs uppercase tracking-[0.12em]">
                {citation.short_cite}
              </span>
              <span className="text-foreground font-medium flex-1 min-w-[120px] break-words text-sm leading-relaxed">
                {citation.title}
              </span>
            </div>
            {citation.reference && (
              <div className="text-muted-foreground/80 text-sm mt-2 leading-relaxed">
                {citation.reference}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {citation.effective_date && (
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 border border-border/20 rounded-full px-2.5 py-1">
                  {citation.effective_date}
                </span>
              )}
              {typeof citation.data_year === 'number' && (
                <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 border border-border/20 rounded-full px-2.5 py-1">
                  {citation.data_year}
                </span>
              )}
              {citation.sections_used?.map((section) => (
                <span
                  key={`${citation.id}-${section}`}
                  className="text-[11px] uppercase tracking-[0.12em] text-primary/80 border border-primary/20 rounded-full px-2.5 py-1"
                >
                  {section}
                </span>
              ))}
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold/80 hover:text-gold/90 inline-flex items-center gap-1 transition-colors text-xs uppercase tracking-[0.15em]"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source
                </a>
              )}
            </div>
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
        <p className="text-xs uppercase tracking-[0.22em] text-gold/70 font-medium mb-2">
          HC Intelligence Ledger
        </p>
        <h3 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          Route References
        </h3>
        <p className="text-sm text-muted-foreground/60 mt-1">
          {references.total_count} authorities, briefs, patterns, and intelligence packets used in this analysis
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
        <p className="relative text-sm text-foreground/60 leading-relaxed font-normal">
          <strong className="text-foreground/80 font-medium">Decision Basis:</strong> This memo is backed by HC Tax &amp; Legal Intelligence, HC Compliance Intelligence, HC Market Intelligence, HC Wealth Intelligence, HC Pattern Intelligence Division, and HC Crisis Intelligence
          {developmentsCount > 0 && <> spanning <strong className="text-foreground/70 font-medium">{developmentsCount.toLocaleString()}</strong> HNWI developments</>}
          {precedentCount > 0 && <> and <strong className="text-foreground/70 font-medium">{precedentCount.toLocaleString()}</strong> direct route precedents</>}.
          {' '}Legal and tax claims are anchored to primary guidance. Route judgment is anchored to the exact market briefs, pattern objects, and intelligence packets used in the memo.
        </p>
      </motion.div>

      <div>
        <CitationCategory
          title="HC Tax & Legal Intelligence"
          description="Primary tax, property, and succession authorities used in the memo."
          icon={<Building className="w-3.5 h-3.5 text-gold/70" />}
          citations={[...(references.tax_statutes || []), ...(references.state_tax_laws || []), ...(references.foreign_tax_laws || []), ...(references.treaties || [])]}
          delay={0.1}
        />

        <CitationCategory
          title="HC Compliance Intelligence"
          description="Reporting, onboarding, and regulatory triggers that become active if the route proceeds."
          icon={<FileText className="w-3.5 h-3.5 text-gold/70" />}
          citations={[...(references.regulations || []), ...(references.compliance_forms || [])]}
          delay={0.2}
        />

        <CitationCategory
          title="HC Market Intelligence"
          description="Market authorities and public-safe brief references used in the Dubai witness read."
          icon={<Database className="w-3.5 h-3.5 text-muted-foreground/60" />}
          citations={references.market_data_sources}
          delay={0.3}
        />

        <CitationCategory
          title="HC Pattern Intelligence Division"
          description="Pattern IDs and intelligence packets that directly shaped underwriting, sequence, wealth, and crisis judgment."
          icon={<ShieldCheck className="w-3.5 h-3.5 text-gold/70" />}
          citations={references.guidance}
          delay={0.4}
        />
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
