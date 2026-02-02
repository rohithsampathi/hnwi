// =============================================================================
// DECISION MEMO LANDING PAGE
// "Intelligence Bureau" / "Command Console" aesthetic
// Bridges LinkedIn red team messaging → payment flow
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  Scale,
  Lock,
  Users,
  Crosshair,
  FileWarning,
  Map,
  Anchor,
  Zap
} from 'lucide-react';

interface DecisionMemoLandingProps {
  onContinue: () => void;
}

export const DecisionMemoLanding: React.FC<DecisionMemoLandingProps> = ({ onContinue }) => {
  const [briefCount, setBriefCount] = useState<number>(1900);

  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total || data.count || 1900;
          setBriefCount(count);
        }
      } catch {
        // Use fallback
      }
    }
    fetchBriefCount();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">HC</span>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm sm:text-base tracking-wide">HNWI CHRONICLES</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs tracking-wider uppercase">
                  Pattern Intelligence Division
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Bank-Grade Encryption
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>48-Hour Turnaround</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>Zero-Knowledge Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 tracking-tight">
            RED TEAM TRANSACTION AUDIT
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            The &ldquo;Stop-Loss&rdquo; for High-Stakes Allocations.
          </p>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Don&rsquo;t just diligence the asset. Stress-test the structure. We validate your deal against{' '}
            <span className="text-foreground font-medium">{briefCount.toLocaleString()}+ HNWI precedents</span> to strip out
            regulatory friction, tax drag, and hidden ruin pathways.
          </p>

          {/* Spec Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="px-3 py-1.5 border border-border rounded-full bg-card">
              <span className="text-foreground font-medium">Format:</span> IC Decision Memo
            </span>
            <span className="px-3 py-1.5 border border-border rounded-full bg-card">
              <span className="text-foreground font-medium">Turnaround:</span> 48 Hours
            </span>
            <span className="px-3 py-1.5 border border-border rounded-full bg-card">
              <span className="text-foreground font-medium">Asset Class:</span> Agnostic
            </span>
          </div>
        </motion.div>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="my-10 sm:my-14 flex items-center">
          <div className="flex-1 h-px bg-border opacity-50" />
          <div className="mx-4 sm:mx-6">
            <Crosshair className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 h-px bg-border opacity-50" />
        </div>

        {/* ── The Mandate Logic ─────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-widest text-center mb-2">
            The Mandate Logic
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 text-center">
            What This Audit Covers
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-8">
            We analyze the three dimensions that actually kill deals.
          </p>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <MandateCard
              number={1}
              icon={Target}
              label="THE MECHANICS"
              sublabel="The &ldquo;What&rdquo;"
              description="Your target asset, jurisdiction, and entry price."
              example="Acquire $6M Singapore Penthouse via US Trust structure."
            />
            <MandateCard
              number={2}
              icon={Scale}
              label="THE THESIS"
              sublabel="The &ldquo;Why&rdquo;"
              description="Your specific objective (Yield, Tax Efficiency, Residency, Privacy)."
              example="100% Privacy + Zero Estate Tax Exposure."
            />
            <MandateCard
              number={3}
              icon={Lock}
              label="THE CONSTRAINTS"
              sublabel="The &ldquo;No-Go&rdquo;"
              description="Your liquidity horizons, regulatory red lines, and governance requirements."
              example="Must remain liquid within 6 months; No FATCA triggers."
            />
          </div>
        </motion.section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="my-10 sm:my-14 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* ── The Deliverable ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-widest text-center mb-2">
            The Deliverable
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-8 text-center">
            Your Decision Memo Contains
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
            <DeliverableCard
              icon={Scale}
              title="THE EXECUTIVE VERDICT"
              description="A binary, unbiased assessment: PROCEED, PROCEED WITH MODIFICATIONS, or VETO. No consulting fluff."
            />
            <DeliverableCard
              icon={FileWarning}
              title="THE RUIN PATHWAYS"
              description="Identification of specific failure modes (regulatory, tax, or legal) that could cause >20% capital destruction."
            />
            <DeliverableCard
              icon={Map}
              title='THE "MODIFIED" MAP'
              description='If a "Veto" is triggered, we map the structural pivot required to turn it into a "Proceed" (if one exists).'
            />
            <DeliverableCard
              icon={Anchor}
              title="PRECEDENT ANCHORS"
              description={`Data-backed confidence levels derived from ${briefCount.toLocaleString()}+ similar patterns since 2023.`}
            />
          </div>
        </motion.section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="my-10 sm:my-14 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* ── Trust Bar / Engine Stats ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-muted/30 border border-border rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-bold text-primary uppercase tracking-widest text-center mb-1">
              Built on Pattern Intelligence
            </p>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center my-6 sm:my-8">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {briefCount.toLocaleString()}+
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  HNWI Developments<br />Analyzed
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  159
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  Confirmed Failure<br />Patterns
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  $4M+
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  Avg. Savings on<br />&ldquo;Proceed Modified&rdquo;
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              Every mandate is matched against our live pattern library of regulatory changes,
              tax treaties, and historical failures.
            </p>
          </div>
        </motion.section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="my-10 sm:my-14 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* ── The Cockpit / Action Area ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="relative bg-gradient-to-br from-card via-card to-muted/20 border-2 border-primary/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Animated Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-12 text-center">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                Initiate Red Team Audit
              </p>

              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
                Secure your slot for the current cycle. 48-hour SLA begins upon data submission.
              </p>

              {/* Steps */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
                <StepBadge number={1} text="Upload Details" sub="Encrypted Portal" />
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <StepBadge number={2} text="Secure Brief" sub="One-Time Fee" />
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <StepBadge number={3} text="Receive Audit" sub="IC Decision Memo" />
              </div>

              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 sm:gap-3 px-10 sm:px-14 py-3.5 sm:py-4 bg-primary text-primary-foreground text-sm sm:text-base font-bold tracking-wider rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              >
                <span>INITIATE AUDIT MANDATE</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  48-hour SLA
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Bank-grade encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" />
                  IC-ready format
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confidentiality Footer */}
        <div className="mt-12 text-center pb-8">
          <p className="text-xs text-muted-foreground tracking-wider uppercase">
            Confidential | HNWI Chronicles
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 max-w-lg mx-auto">
            All audit submissions are encrypted. We do not sell data. We do not provide legal advice; we provide pattern intelligence.
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function MandateCard({
  number,
  icon: Icon,
  label,
  sublabel,
  description,
  example
}: {
  number: number;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  description: string;
  example: string;
}) {
  return (
    <div className="relative bg-card border border-border rounded-xl p-5 sm:p-6">
      {/* Number badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">{number}</span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm tracking-wide">{label}</h4>
          <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: sublabel }} />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground italic">{example}</p>
      </div>
    </div>
  );
}

function DeliverableCard({
  icon: Icon,
  title,
  description
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h4 className="font-bold text-foreground text-xs tracking-wide uppercase mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepBadge({
  number,
  text,
  sub
}: {
  number: number;
  text: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
        <span className="text-primary text-sm font-bold">{number}</span>
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-foreground">{text}</p>
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
