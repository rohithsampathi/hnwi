// =============================================================================
// NDA PAGE — Non-Disclosure Agreement for Decision Posture Audit
// Premium card-based layout matching the HC design system
// =============================================================================

"use client";

import React from 'react';
import {
  Shield,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Users,
  FileCheck,
  Scale,
  Clock,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NDAPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-card/95 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">HC</span>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm sm:text-base tracking-wide">
                  Non-Disclosure Agreement
                </p>
                <p className="text-muted-foreground text-[10px] sm:text-xs tracking-wider uppercase">
                  Decision Posture Audit
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  window.close();
                }
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">

        {/* Title Card */}
        <div className="border border-border rounded-xl bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Mutual Non-Disclosure Agreement
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                HNWI Chronicles, a Montaigne Smart Business Solutions company
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Effective upon engagement &middot; Last updated February 2026
              </p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <PolicySection icon={Users} title="1. Parties">
          <p>
            This Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into between{' '}
            <strong className="text-foreground">HNWI Chronicles</strong>, a product of{' '}
            <strong className="text-foreground">Montaigne Smart Business Solutions Private Limited</strong>{' '}
            (&ldquo;Service Provider&rdquo;,
            &ldquo;we&rdquo;, &ldquo;us&rdquo;) and the individual or entity submitting a Decision Posture Audit
            intake form (&ldquo;Client&rdquo;, &ldquo;you&rdquo;, &ldquo;your&rdquo;), collectively referred to as
            the &ldquo;Parties&rdquo;.
          </p>
        </PolicySection>

        {/* Purpose */}
        <PolicySection icon={FileCheck} title="2. Purpose">
          <p>
            The purpose of this Agreement is to protect the confidential and proprietary information exchanged
            between the Parties in connection with the <strong className="text-foreground">Decision Posture Audit</strong> engagement,
            including but not limited to: financial data, asset details, jurisdictional information, estate
            structures, succession plans, advisor details, banking relationships, and any strategic intelligence
            derived from the engagement.
          </p>
        </PolicySection>

        {/* Definition of Confidential Information */}
        <PolicySection icon={Lock} title="3. Confidential Information">
          <p>
            &ldquo;Confidential Information&rdquo; means all information disclosed by either Party to the other,
            whether orally, in writing, or electronically, that is designated as confidential or that reasonably
            should be understood to be confidential given the nature of the information and the circumstances
            of disclosure. This includes, without limitation:
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mt-3">
            {[
              'Client intake submissions and supporting documents',
              'Financial information, asset valuations, and portfolio structures',
              'Personal and family details, including heir information',
              'Jurisdictional strategies, tax structures, and entity configurations',
              'Advisor relationships, banking rails, and partnerships',
              'The Decision Posture Audit report and all analyses',
              'HNWI Chronicles\' proprietary pattern library and methodologies',
              'All correspondence, notes, and work product from the engagement',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Service Provider Obligations */}
        <PolicySection icon={Shield} title="4. Service Provider Obligations">
          {/* 4.1 */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                4.1 Restricted Disclosure
              </h4>
              <p>
                Client intake data, financial details, asset information, and all submitted materials shall{' '}
                <strong className="text-foreground">not be disclosed, shared, sold, licensed, or otherwise made available</strong> to
                any third party, except:
              </p>
              <div className="mt-3 space-y-2">
                <DisclosureItem
                  label="The Primary Paid Party"
                  description="The individual or entity that initiated and paid for the Decision Posture Audit engagement."
                />
                <DisclosureItem
                  label="Designated Board Members"
                  description="Members of the Client's board, investment committee, or family council expressly authorized by the Client."
                />
                <DisclosureItem
                  label="Internal Analysts"
                  description="HNWI Chronicles personnel directly involved in producing the audit report, bound by internal confidentiality obligations."
                />
              </div>
            </div>

            {/* Explicit exclusions callout */}
            <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="w-4 h-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Never Shared With</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Marketing partners, data brokers, affiliate networks, third-party analytics providers, or any
                entity not expressly listed above.
              </p>
            </div>

            {/* 4.2 */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                4.2 Data Protection Standards
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  '256-bit AES encryption at rest, TLS 1.3 in transit',
                  'Role-based access limited to engagement personnel',
                  'Audit logging of all data access events',
                  'SOC 2 compliant infrastructure',
                  'Automatic data retention policies with scheduled purge',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                    <Lock className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4.3 */}
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                4.3 Anonymization
              </h4>
              <p>
                HNWI Chronicles may use anonymized, de-identified, and aggregated data derived from engagements
                to improve its pattern library and analytical models. Such data shall be stripped of all personally
                identifiable information, entity names, specific financial figures, and jurisdictional details that
                could reasonably be used to identify the Client.
              </p>
            </div>
          </div>
        </PolicySection>

        {/* Client Reference & Branding */}
        <PolicySection icon={BadgeCheck} title="5. Client Reference & Branding Rights">
          <p>
            By entering into this engagement, the Client grants HNWI Chronicles a limited, non-exclusive right to:
          </p>
          <div className="mt-3 space-y-2">
            <DisclosureItem
              label="Display Client Name / Logo"
              description="On HNWI Chronicles' website, marketing materials, pitch decks, and client rosters for the sole purpose of identifying the Client as a past or current engagement partner."
            />
            <DisclosureItem
              label="Reference the Engagement"
              description='In general terms (e.g., "Conducted a Decision Posture Audit for a Singapore-based Single Family Office") without disclosing specific financial details, strategies, or outcomes.'
            />
          </div>
          <p className="mt-3">
            This right does not extend to disclosing any Confidential Information. The Client may revoke this
            permission at any time by providing written notice to{' '}
            <a href="mailto:hnwi@montaigne.co" className="text-primary hover:underline">hnwi@montaigne.co</a>.
          </p>
        </PolicySection>

        {/* Client Obligations */}
        <PolicySection icon={Scale} title="6. Client Obligations">
          <p>The Client agrees to:</p>
          <div className="mt-3 space-y-2">
            {[
              'Treat the Decision Posture Audit report and all deliverables as confidential, and not distribute, reproduce, or share them beyond authorized board members and advisors without prior written consent.',
              'Not reverse-engineer, replicate, or attempt to extract HNWI Chronicles\' proprietary methodologies, pattern matching algorithms, or intelligence frameworks from the deliverables.',
              'Acknowledge that the intelligence and analyses provided constitute professional advisory opinion and do not constitute legal, tax, or investment advice.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-muted/30 rounded-lg">
                <span className="text-xs font-bold text-primary mt-0.5 shrink-0">{String.fromCharCode(97 + i)}.</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Exclusions */}
        <PolicySection icon={AlertTriangle} title="7. Exclusions">
          <p>Confidential Information does not include information that:</p>
          <div className="mt-3 space-y-2">
            {[
              'Is or becomes publicly available through no fault of the receiving Party',
              'Was already known to the receiving Party prior to disclosure, as documented in writing',
              'Is independently developed by the receiving Party without reference to the Confidential Information',
              'Is required to be disclosed by law, regulation, or court order, provided that the disclosing Party is given reasonable prior notice to seek protective relief',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Term & Remedies */}
        <div className="grid sm:grid-cols-2 gap-6">
          <PolicySection icon={Clock} title="8. Term & Survival">
            <p>
              This Agreement becomes effective upon the Client&apos;s acknowledgment during the intake process and
              remains in effect for <strong className="text-foreground">five (5) years</strong> from the date of the last
              disclosure of Confidential Information. The obligations regarding trade secrets shall survive
              indefinitely.
            </p>
          </PolicySection>

          <PolicySection icon={Scale} title="9. Remedies">
            <p>
              Each Party acknowledges that a breach of this Agreement may cause irreparable harm for which monetary
              damages would be inadequate. The non-breaching Party shall be entitled to seek equitable relief,
              including injunctive relief and specific performance, in addition to all other remedies available
              at law or in equity.
            </p>
          </PolicySection>
        </div>

        {/* Governing Law */}
        <PolicySection icon={FileCheck} title="10. Governing Law & Jurisdiction">
          <p>
            This Agreement shall be governed by and construed in accordance with the{' '}
            <strong className="text-foreground">laws of India</strong>, including but not limited to the Indian
            Contract Act, 1872, the Information Technology Act, 2000, and all applicable rules and regulations
            thereunder.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or in connection with this Agreement shall be
            subject to the exclusive jurisdiction of the courts at{' '}
            <strong className="text-foreground">Hyderabad, Telangana, India</strong>, with appellate jurisdiction
            vesting in the <strong className="text-foreground">Hon&apos;ble High Court of Telangana</strong> and
            the <strong className="text-foreground">Hon&apos;ble Supreme Court of India</strong>.
          </p>
          <p>
            Prior to initiating litigation, the Parties agree to attempt resolution through good-faith
            negotiation for a period of thirty (30) days, followed by mediation under the Mediation Act, 2023,
            if negotiation fails.
          </p>
        </PolicySection>

        {/* Contact */}
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">11. Contact</h3>
          <p className="text-xs text-muted-foreground mb-4">
            For questions regarding this Agreement or to request data handling documentation:
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:hnwi@montaigne.co"
              className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground">Email:</span>
              <span className="text-primary font-medium">hnwi@montaigne.co</span>
            </a>
            <a
              href="https://wa.me/919700500900"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground">WhatsApp:</span>
              <span className="text-primary font-medium">+91 9700 500 900</span>
            </a>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center py-4">
          <p className="text-[11px] text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
            By checking the NDA acknowledgment box on the Decision Posture Audit intake form, you confirm
            that you have read, understood, and agree to the terms set forth in this Non-Disclosure Agreement.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function PolicySection({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-5 sm:px-6 py-3 border-b border-border bg-muted/20 flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="px-5 sm:px-6 py-5 text-xs text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}

function DisclosureItem({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg">
      <Eye className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <div>
        <span className="text-xs font-semibold text-foreground block">{label}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
      </div>
    </div>
  );
}
