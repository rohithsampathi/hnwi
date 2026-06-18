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

type RichCitationEntry = CitationEntry & {
  institution?: string;
  claim_supported?: string;
  date?: string;
  supports?: string[];
  route_relevance?: string;
  source_signal?: string;
  why_it_matters?: string;
  source_boundary?: string;
};

type PatternWitnessEntry = {
  id?: string;
  title?: string;
  pattern?: string;
  decision_use?: string;
  source_basis?: string;
};

function citationText(citation: RichCitationEntry): string {
  return [
    citation.id,
    citation.short_cite,
    citation.institution,
    citation.title,
    citation.reference,
    citation.claim_supported,
    ...(citation.supports || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

function internalCitation(id: string, title: string, reference: string, sections: string[]): CitationEntry {
  return {
    id,
    short_cite: 'Private evidence',
    title,
    reference,
    sections_used: sections,
  };
}

function patternWitnessCitation(witness: PatternWitnessEntry, index: number): CitationEntry {
  return {
    id: witness.id || `pattern_witness_${index + 1}`,
    short_cite: `Route signal ${index + 1}`,
    title: witness.title || `Route-pattern source record ${index + 1}`,
    reference: [witness.pattern, witness.decision_use].filter(Boolean).join(' Decision use: '),
    sections_used: ['Route-pattern source record', 'Release readiness'],
  };
}

function citationDetailRows(citation: CitationEntry) {
  const rich = citation as RichCitationEntry;
  return [
    { label: 'Signal', value: rich.source_signal },
    { label: 'Route relevance', value: rich.route_relevance },
    { label: 'Why it matters', value: rich.why_it_matters },
    { label: 'Boundary', value: rich.source_boundary },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value && row.value.trim()));
}

function buildReferenceGroups(references: LegalReferences, developmentsCount: number, precedentCount: number) {
  const sourceRegister = ((references.sources || []) as RichCitationEntry[]).filter(Boolean);
  const patternWitnesses = ((references as LegalReferences & { pattern_witnesses?: PatternWitnessEntry[] }).pattern_witnesses || [])
    .filter((item): item is PatternWitnessEntry => Boolean(item && (item.title || item.pattern)));
  const patternEvidenceRecords = ((references as LegalReferences & { pattern_evidence_records?: RichCitationEntry[] }).pattern_evidence_records || [])
    .filter((item): item is RichCitationEntry => Boolean(item && (item.title || item.reference || item.claim_supported)));
  const oldTaxLegal = [
    ...(references.tax_statutes || []),
    ...(references.state_tax_laws || []),
    ...(references.foreign_tax_laws || []),
    ...(references.treaties || []),
  ];
  const oldCompliance = [
    ...(references.regulations || []),
    ...(references.compliance_forms || []),
  ];

  const sourceTaxLegal: CitationEntry[] = [];
  const sourceFamily: CitationEntry[] = [];
  const sourceGovernance: CitationEntry[] = [];
  const sourceStructures: CitationEntry[] = [];
  const sourceMarket: CitationEntry[] = [];
  const sourceBanking: CitationEntry[] = [];
  const sourcePatterns: CitationEntry[] = [];

  sourceRegister.forEach((citation) => {
    const text = citationText(citation);

    if (hasAny(text, ['rightmove', 'savills', 'wise', 'council tax', 'westminster', 'market', 'listing', 'guide price'])) {
      sourceMarket.push(citation);
      return;
    }

    if (hasAny(text, ['child student', 'parent of a child', 'school', 'education', 'boarding', 'guardian', 'family move'])) {
      sourceFamily.push(citation);
      return;
    }

    if (hasAny(text, ['overseas entity', 'beneficial owner', 'corporate bodies', 'ated', 'company', 'non-natural', 'enveloped'])) {
      sourceStructures.push(citation);
      return;
    }

    if (hasAny(text, ['managed and controlled', 'central management', 'control', 'source-side board', 'u.s.-situated', 'estate tax'])) {
      sourceGovernance.push(citation);
      return;
    }

    if (hasAny(text, ['bank', 'source of wealth', 'source of funds', 'compliance', 'kyc', 'sanctions', 'reporting'])) {
      sourceBanking.push(citation);
      return;
    }

    if (hasAny(text, ['pattern', 'brief', 'precedent', 'corridor signal', 'hnwi'])) {
      sourcePatterns.push(citation);
      return;
    }

    if (hasAny(text, ['sdlt', 'stamp duty', 'hmrc', 'inheritance tax', 'fig', 'vat', 'tax', 'non-resident', 'foreign income'])) {
      sourceTaxLegal.push(citation);
      return;
    }

    sourceTaxLegal.push(citation);
  });

  const familyEvidence = [
    internalCitation(
      'private_family_document_pack',
      'Family purpose, authority, use-boundary, and fairness minutes',
      'Private document class. The memo requires these records before release; they are not public-source citations.',
      ['Family documents', 'G1 / G2 / G3', 'Decision memory'],
    ),
  ];

  const governanceEvidence = [
    internalCitation(
      'private_governance_packet',
      'Stop authority, veto map, absence readiness, and report circulation',
      'Private governance class. The memo requires owner, stop, signer, retrieval, and explanation responsibility before release.',
      ['Governance', 'Operator control', '72-hour absence'],
    ),
  ];

  const structuresEvidence = [
    internalCitation(
      'private_ownership_structure_packet',
      'Buyer-capacity, title-holder, ownership-route, and disclosure evidence',
      'Private structure class. The memo requires the proposed ownership route to match tax, title, authority, disclosure, and succession consequences before release.',
      ['Ownership route', 'Disclosure', 'Structure comparison'],
    ),
  ];

  const bankingEvidence = [
    internalCitation(
      'private_source_funds_pack',
      'SoW / SoF, bank rail, and signer-authority file',
      'Private banking class. The memo requires corroborated source and movement evidence before bank or seller timing can govern the route.',
      ['Bank readiness', 'Authority map', 'Release evidence'],
    ),
  ];

  const patternEvidence: CitationEntry[] = [
    ...(references.guidance || []),
    ...patternEvidenceRecords,
    ...patternWitnesses.map(patternWitnessCitation),
  ];

  if (!patternWitnesses.length && (developmentsCount > 0 || precedentCount > 0)) {
    patternEvidence.push({
      id: 'hc_route_pattern_library',
      short_cite: 'Route source file',
      title: 'Route-pattern source records used for release-readiness judgment',
      reference: [
        developmentsCount > 0 ? `${developmentsCount.toLocaleString()} source records` : '',
        precedentCount > 0 ? `${precedentCount.toLocaleString()} route-pattern source records` : '',
      ].filter(Boolean).join(' and ') || 'Route-pattern source file used for route judgment.',
      sections_used: ['Route-pattern methodology', 'Failure modes', 'Release routes'],
    });
  }

  return [
    {
      title: 'Legal & Tax Authorities',
      description: 'Primary law, tax, and duty authorities behind the route economics and residence treatment.',
      icon: <Building className="w-4 h-4 text-gold" />,
      citations: [...oldTaxLegal, ...sourceTaxLegal],
    },
    {
      title: 'Family Documents & Succession Evidence',
      description: 'Private evidence classes and public family-move authorities that govern purpose, use, education, succession, and fairness.',
      icon: <FileText className="w-4 h-4 text-gold" />,
      citations: [...sourceFamily, ...familyEvidence],
    },
    {
      title: 'Governance, Authority & Control',
      description: 'Control, management, estate, veto, absence, and decision-memory references used to decide whether responsibility can carry the move.',
      icon: <ShieldCheck className="w-4 h-4 text-gold" />,
      citations: [...sourceGovernance, ...governanceEvidence],
    },
    {
      title: 'Structures, Ownership & Disclosure',
      description: 'Entity, trustee, beneficial-owner, ATED, register, and ownership-route authorities.',
      icon: <Handshake className="w-4 h-4 text-gold" />,
      citations: [...sourceStructures, ...structuresEvidence],
    },
    {
      title: 'Banking, Compliance & Movement Rails',
      description: 'Bank acceptance, SoW/SoF, KYC, reporting, FX, and transfer-readiness references.',
      icon: <Globe className="w-4 h-4 text-gold" />,
      citations: [...oldCompliance, ...sourceBanking, ...bankingEvidence],
    },
    {
      title: 'Market, Property & Carrying Cost',
      description: 'Property listing, comparable, FX, local charge, and carrying-cost sources.',
      icon: <Database className="w-4 h-4 text-gold" />,
      citations: [...(references.market_data_sources || []), ...sourceMarket],
    },
    {
      title: 'Route Pattern Methodology',
      description: 'Route-pattern source records used to interpret why a gate matters. They do not prove legal status, bank acceptance, title, tax treatment, or family authority.',
      icon: <ShieldCheck className="w-4 h-4 text-gold" />,
      citations: [...sourcePatterns, ...patternEvidence],
    },
  ];
}

function CitationCategory({ title, description, icon, citations, delay }: CitationCategoryProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      className="mb-8 rounded-2xl border border-border/45 bg-background/80 p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h4 className="text-sm uppercase tracking-[0.18em] text-foreground font-semibold">
          {title}
        </h4>
        <span className="text-xs text-foreground/70">({citations.length})</span>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/25 via-border/30 to-transparent" />
      </div>

      {description && (
        <p className="text-sm text-foreground/75 leading-relaxed pl-7 mb-4">
          {description}
        </p>
      )}

      <div className="space-y-3 pl-7">
        {citations.map((citation, index) => {
          const detailRows = citationDetailRows(citation);
          return (
            <div
              key={citation.id || index}
              className="rounded-2xl border border-border/25 bg-card/50 px-4 py-4"
            >
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
                <span className="font-medium text-gold/90 shrink-0 text-xs uppercase tracking-[0.12em]">
                  {citation.short_cite || (citation as RichCitationEntry).institution || citation.id}
                </span>
                <span className="text-foreground font-medium flex-1 min-w-[120px] break-words text-sm leading-relaxed">
                  {citation.title}
                </span>
              </div>
              {(citation.reference || (citation as RichCitationEntry).claim_supported) && (
                <div className="text-muted-foreground/80 text-sm mt-2 leading-relaxed">
                  {citation.reference || (citation as RichCitationEntry).claim_supported}
                </div>
              )}
              {detailRows.length > 0 && (
                <div className="mt-3 grid gap-2 border-t border-border/20 pt-3">
                  {detailRows.map((row) => (
                    <div key={`${citation.id}-${row.label}`} className="grid gap-1 sm:grid-cols-[140px_1fr]">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                        {row.label}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/80">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {(citation.effective_date || (citation as RichCitationEntry).date) && (
                  <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 border border-border/20 rounded-full px-2.5 py-1">
                    {citation.effective_date || (citation as RichCitationEntry).date}
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
          );
        })}
      </div>
    </motion.div>
  );
}

export function ReferencesSection({ references, developmentsCount = 0, precedentCount = 0 }: ReferencesSectionProps) {
  const patternWitnessCount = references?.pattern_witnesses?.length || 0;
  const publicAuthorityCount =
    references?.total_count ??
    [
      ...(references?.sources || []),
      ...(references?.tax_statutes || []),
      ...(references?.state_tax_laws || []),
      ...(references?.foreign_tax_laws || []),
      ...(references?.treaties || []),
      ...(references?.regulations || []),
      ...(references?.compliance_forms || []),
      ...(references?.market_data_sources || []),
      ...(references?.guidance || []),
    ].length;

  if (!references || publicAuthorityCount === 0) {
    return null;
  }

  const referenceGroups = buildReferenceGroups(references, developmentsCount, precedentCount);

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
        <p className="text-xs uppercase tracking-[0.22em] text-gold font-semibold mb-2">
          HC Intelligence Ledger
        </p>
        <h3 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          References And Evidence Authority
        </h3>
        <p className="text-sm text-foreground/75 mt-2 max-w-3xl leading-relaxed">
          {publicAuthorityCount} public authorities
          {patternWitnessCount ? <> and {patternWitnessCount} named route-pattern source records</> : null}
          {' '}plus private evidence classes and governance rails used to separate source-backed claims from signed release conditions.
        </p>
      </div>

      {/* Intelligence Basis */}
      <motion.div
        className="relative rounded-2xl border border-gold/25 overflow-hidden px-4 sm:px-8 py-5 mb-6 bg-background/80"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />
        <p className="relative text-sm text-foreground/80 leading-relaxed font-normal">
          <strong className="text-foreground font-medium">Evidence Boundary:</strong> This memo separates public authorities, market/listing sources, private evidence classes, and route-pattern source records
          {developmentsCount > 0 && <> spanning <strong className="text-foreground/70 font-medium">{developmentsCount.toLocaleString()}</strong> source records</>}
          {precedentCount > 0 && <> and <strong className="text-foreground/70 font-medium">{precedentCount.toLocaleString()}</strong> route-pattern source records</>}.
          {' '}Legal, tax, and market claims are source-backed. Bank acceptance, title state, seller terms, family authority, and adviser sign-off remain release conditions until signed. Route-pattern records explain the decision risk; they do not replace counsel, bank, title, or family evidence.
          {patternWitnessCount ? <> The route-methodology ledger below lists all <strong className="text-foreground/70 font-medium">{patternWitnessCount}</strong> route-pattern source records rather than collapsing them into a count.</> : null}
        </p>
      </motion.div>

      <div>
        {referenceGroups.map((group, index) => (
          <CitationCategory
            key={group.title}
            title={group.title}
            description={group.description}
            icon={group.icon}
            citations={group.citations}
            delay={0.1 + index * 0.05}
          />
        ))}
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
            HNWI CHRONICLES | RELEASE READINESS EVIDENCE LEDGER
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ReferencesSection;
