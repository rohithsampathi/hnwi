// =============================================================================
// PRIVACY POLICY PAGE — Data Processing Policy for Decision Posture Audit
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
  Database,
  FileCheck,
  Clock,
  Trash2,
  Globe,
  CreditCard,
  BadgeCheck,
  HardDrive,
  Fingerprint
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
                  Privacy &amp; Data Processing
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
              <Fingerprint className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Privacy &amp; Data Processing Policy
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                HNWI Chronicles, a Montaigne Smart Business Solutions company
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Decision Posture Audit &middot; Last updated February 2026
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <PolicySection icon={Shield} title="1. Introduction">
          <p>
            HNWI Chronicles, a product of Montaigne Smart Business Solutions Private Limited
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), is committed to protecting the privacy and
            security of information provided by clients engaging our Decision Posture Audit service.
          </p>
          <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 mt-3">
            <p className="text-xs text-foreground leading-relaxed">
              We recognize that the information you entrust to us is among the most sensitive data any individual
              or family office can share. We treat this responsibility with the{' '}
              <strong>highest care, institutional rigor, and deliberate intention</strong>.
            </p>
          </div>
        </PolicySection>

        {/* Information We Collect */}
        <PolicySection icon={Database} title="2. Information We Collect">
          <p className="mb-4">Through the Decision Posture Audit intake process, we collect:</p>

          <div className="space-y-3">
            <DataCategory
              label="Identity & Contact"
              items={[
                'Email address (for report delivery and engagement correspondence)',
                'Primary benefactor tax jurisdiction / nationality',
              ]}
            />
            <DataCategory
              label="Decision Thesis"
              items={[
                'Description of the contemplated financial move',
                'Expected outcomes and investment objectives',
                'Move type, target locations, and timeline',
                'Source and destination jurisdictions (including state-level detail)',
                'Buyer citizenship information (for treaty and stamp duty analysis)',
              ]}
            />
            <DataCategory
              label="Constraints & Structure"
              items={[
                'Liquidity horizons and forcing events',
                'Current jurisdictional footprint',
                'Prohibitions, deal breakers, and prohibited jurisdictions',
                'Property ownership counts and purchase vehicle preferences',
              ]}
            />
            <DataCategory
              label="Control & Governance"
              items={[
                'Decision-making authority structure (final decision maker, veto holders)',
                'Advisor stack (type, name, jurisdiction)',
                'Existing entity structures (type, jurisdiction, purpose)',
                'Banking rails (institution, jurisdiction, status)',
                'Investment Policy Statement status',
                'Heir and succession information (names, relationships, ages, allocations)',
              ]}
            />
            <DataCategory
              label="Asset Details"
              items={[
                'Estimated asset values',
                'Asset-specific attributes (property type, art category, metal type, etc.)',
                'Condition, provenance, certification, and storage information',
                'Expected yields and appreciation metrics',
              ]}
            />
          </div>

          {/* Payment callout */}
          <div className="mt-4 border border-border bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Payment Information</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <p>Payment is processed exclusively through <strong className="text-foreground">Razorpay</strong>, a PCI DSS Level 1 certified processor.</p>
              <p>We do <strong className="text-foreground">not</strong> store, process, or have access to your credit card numbers, bank account details, or payment credentials.</p>
              <p>We retain only the transaction reference ID for reconciliation.</p>
            </div>
          </div>
        </PolicySection>

        {/* How We Use Your Information */}
        <PolicySection icon={FileCheck} title="3. How We Use Your Information">
          <p className="mb-4">Your data is used exclusively for the following purposes:</p>
          <div className="space-y-2">
            {[
              { purpose: 'Produce the Decision Posture Audit', data: 'All intake data (thesis, constraints, control, assets)' },
              { purpose: 'Pattern matching against intelligence library', data: 'Jurisdictional data, move type, structural details' },
              { purpose: 'Deliver audit report', data: 'Email address' },
              { purpose: 'Engagement correspondence', data: 'Email address' },
              { purpose: 'Payment processing', data: 'Email (prefill only), processed by Razorpay' },
              { purpose: 'Improve analytical models', data: 'Anonymized, de-identified, aggregated data only' },
            ].map((row) => (
              <div key={row.purpose} className="flex items-start gap-3 px-4 py-3 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">{row.purpose}</span>
                  <span className="text-[11px] text-muted-foreground">{row.data}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border border-destructive/20 bg-destructive/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <EyeOff className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Not Used For</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Advertising, marketing to third parties, behavioral profiling, or any purpose beyond producing
              and delivering your engagement deliverables.
            </p>
          </div>
        </PolicySection>

        {/* Who Has Access */}
        <PolicySection icon={Users} title="4. Who Has Access to Your Data">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            Authorized Recipients
          </h4>
          <div className="space-y-2 mb-4">
            <AccessItem
              label="You (the Primary Paid Party)"
              description="The individual or entity that initiated and paid for the engagement receives the complete audit report and all deliverables."
            />
            <AccessItem
              label="Your Designated Board / Committee"
              description="If you authorize specific board members, investment committee members, or family council members, we will provide access as directed by you."
            />
            <AccessItem
              label="HNWI Chronicles Engagement Team"
              description="A limited number of analysts and intelligence specialists directly involved in producing your audit. All operate under binding confidentiality obligations."
            />
          </div>

          <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff className="w-4 h-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Never Shared With</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {[
                'Third-party marketing or advertising platforms',
                'Data brokers or data aggregation services',
                'Affiliate networks or referral partners',
                'Other clients or engagement parties',
                'Government agencies (unless compelled by valid legal process)',
                'AI training datasets in identifiable form',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 px-2 py-1">
                  <div className="w-1 h-1 rounded-full bg-destructive/60 mt-1.5 shrink-0" />
                  <span className="text-[11px] text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </PolicySection>

        {/* Security Measures */}
        <PolicySection icon={Lock} title="5. Data Security Measures">
          <p className="mb-4">We implement institutional-grade security controls:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <SecurityCard
              icon={Lock}
              title="Encryption"
              items={[
                'TLS 1.3 for data in transit',
                'AES-256 for data at rest',
                'PCI DSS Level 1 (via Razorpay)',
              ]}
            />
            <SecurityCard
              icon={Fingerprint}
              title="Access Controls"
              items={[
                'Role-based, engagement-specific access',
                'Multi-factor authentication required',
                'Principle of least privilege enforced',
              ]}
            />
            <SecurityCard
              icon={Eye}
              title="Monitoring & Audit"
              items={[
                'Comprehensive audit logging',
                'Automated anomaly detection',
                'Regular vulnerability scanning',
              ]}
            />
            <SecurityCard
              icon={HardDrive}
              title="Infrastructure"
              items={[
                'SOC 2 Type II compliant cloud',
                'Encrypted automated backups',
                'Disaster recovery procedures',
              ]}
            />
          </div>
        </PolicySection>

        {/* Data Retention */}
        <PolicySection icon={Trash2} title="6. Data Retention & Deletion">
          <div className="space-y-2">
            {[
              {
                label: 'Active Engagement',
                detail: 'Data retained for the duration of the engagement and 12 months following delivery of the final audit report, to support follow-up queries.',
              },
              {
                label: 'Post-Engagement',
                detail: 'After the retention period, identifiable data is securely purged. Anonymized analytical data may be retained indefinitely for pattern library improvement.',
              },
              {
                label: 'Deletion Requests',
                detail: 'You may request early deletion at any time by contacting us. Processed within 30 business days, subject to legal retention obligations.',
              },
              {
                label: 'Payment Records',
                detail: 'Transaction reference IDs retained for 7 years in compliance with financial record-keeping requirements.',
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 px-4 py-3 bg-muted/30 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Client Reference Rights */}
        <PolicySection icon={BadgeCheck} title="7. Client Reference Rights">
          <p>
            As described in our Non-Disclosure Agreement, HNWI Chronicles retains a limited right to display
            the Client&apos;s name and/or logo as a past or current engagement partner. This right:
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              'Does not extend to disclosing any Confidential Information, financial details, or audit outcomes',
              'Is limited to identifying the existence of the engagement relationship',
              'May be revoked at any time by written notice',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Browser Storage */}
        <PolicySection icon={HardDrive} title="8. Cookies & Browser Storage">
          <p>
            During the intake process, we use browser <strong className="text-foreground">localStorage</strong> to
            preserve your form progress so you can resume where you left off. This data:
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              'Is stored entirely on your device and is not transmitted to any third party',
              'Is automatically cleared upon successful submission and payment',
              'Can be manually cleared by clearing your browser data at any time',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Your Rights */}
        <PolicySection icon={Shield} title="9. Your Rights">
          <p className="mb-3">You have the right to:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { right: 'Access', detail: 'Request a copy of all personal data we hold' },
              { right: 'Correction', detail: 'Request correction of inaccurate or incomplete data' },
              { right: 'Deletion', detail: 'Request deletion, subject to legal retention' },
              { right: 'Restriction', detail: 'Limit processing to specific purposes' },
              { right: 'Portability', detail: 'Receive data in structured, machine-readable format' },
              { right: 'Withdraw Consent', detail: 'Withdraw processing consent at any time' },
            ].map((item) => (
              <div key={item.right} className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg">
                <BadgeCheck className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-foreground block">{item.right}</span>
                  <span className="text-[11px] text-muted-foreground">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            To exercise any of these rights, contact{' '}
            <a href="mailto:hnwi@montaigne.co" className="text-primary hover:underline">hnwi@montaigne.co</a>.
            We will respond within 30 business days.
          </p>
        </PolicySection>

        {/* International Transfers */}
        <PolicySection icon={Globe} title="10. International Data Transfers">
          <p>
            Given the cross-jurisdictional nature of our intelligence services, your data may be processed in
            jurisdictions outside your country of residence. In all cases:
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              'Data transfers protected by the same encryption and access control standards',
              'Appropriate safeguards in place for all international transfers',
              'Processing personnel in all jurisdictions bound by equivalent confidentiality obligations',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                <Globe className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Changes */}
        <PolicySection icon={FileCheck} title="11. Changes to This Policy">
          <p>
            We may update this Policy from time to time to reflect changes in our practices, technology, or legal
            requirements. Material changes will be communicated via email to active engagement parties. The
            &ldquo;Last updated&rdquo; date indicates when the Policy was last revised.
          </p>
        </PolicySection>

        {/* Contact */}
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">12. Contact</h3>
          <p className="text-xs text-muted-foreground mb-4">
            For questions, concerns, or requests related to this Policy or your data:
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
            By checking the privacy consent box on the Decision Posture Audit intake form, you confirm
            that you have read, understood, and consent to the data processing practices described in this Policy.
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

function DataCategory({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bg-muted/20 rounded-lg p-4">
      <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{label}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/50 mt-1.5 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccessItem({ label, description }: { label: string; description: string }) {
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

function SecurityCard({
  icon: Icon,
  title,
  items
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
}) {
  return (
    <div className="bg-muted/20 border border-border/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <Lock className="w-2.5 h-2.5 text-primary/60 mt-0.5 shrink-0" />
            <span className="text-[11px] text-muted-foreground leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
