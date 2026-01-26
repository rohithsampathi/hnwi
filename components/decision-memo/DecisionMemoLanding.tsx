// =============================================================================
// DECISION MEMO LANDING PAGE
// SFO Pattern Audit - Professional document-style design matching output pages
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  TrendingUp,
  Scale,
  Zap,
  Crown,
  Lock,
  Building2,
  Users
} from 'lucide-react';

interface DecisionMemoLandingProps {
  onContinue: () => void;
}

export const DecisionMemoLanding: React.FC<DecisionMemoLandingProps> = ({ onContinue }) => {
  const [briefCount, setBriefCount] = useState<number>(1875);

  useEffect(() => {
    async function fetchBriefCount() {
      try {
        const response = await fetch('/api/developments/counts');
        if (response.ok) {
          const data = await response.json();
          const count = data.developments?.total_count || data.total || data.count || 1875;
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
      {/* Sticky Header - Matching report output */}
      <div className="sticky top-0 z-50 bg-card/95 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">HC</span>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm sm:text-base">HNWI CHRONICLES</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs tracking-wider uppercase">
                  Pattern Intelligence Division
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Bank-Grade Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Document Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Document Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold tracking-wide">
              SFO PATTERN AUDIT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Decision Posture Audit
          </h1>

          {/* Elegant divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <div className="w-2 h-2 bg-primary rounded-full" />
            <div className="w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            IC-ready artifact for high-stakes allocation decisions.
            <br className="hidden sm:block" />
            <span className="text-foreground font-medium">
              3 inputs. 24-hour SLA. Investment committee format.
            </span>
          </p>
        </motion.div>

        {/* Elegant Section Divider */}
        <div className="my-8 sm:my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-50" />
          <div className="mx-4 sm:mx-6 w-2 h-2 bg-primary rounded-full" />
          <div className="flex-1 h-px bg-border opacity-50" />
        </div>

        {/* What This Audits Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">
            What This Audit Covers
          </h2>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <InputCard
              number={1}
              icon={Target}
              title="Decision Thesis"
              description="Your contemplated move, expected outcome, target amount and locations"
              example="Acquire $2M Dubai apartment for Golden Visa + 8-12% yield"
            />
            <InputCard
              number={2}
              icon={Lock}
              title="Constraints"
              description="Liquidity horizons, forcing events, hard prohibitions, deal breakers"
              example="$500K liquid within 6 months, no off-plan, no leverage >60%"
            />
            <InputCard
              number={3}
              icon={Users}
              title="Control & Rails"
              description="Decision authority, advisor stack, existing entities and banking"
              example="Joint decision with spouse, tax advisor in Singapore"
            />
          </div>
        </motion.section>

        {/* Elegant Section Divider */}
        <div className="my-8 sm:my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* IC Artifact Output Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 text-center">
            Your IC Artifact Contains
          </h2>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              <OutputItem
                icon={Scale}
                title="Executive Verdict"
                description="PROCEED / PROCEED WITH MODIFICATIONS / DO NOT PROCEED with single-sentence rationale"
              />
              <OutputItem
                icon={Zap}
                title="Sequence Correction"
                description="Step-by-step execution order with owners, timelines, and dependencies"
              />
              <OutputItem
                icon={AlertTriangle}
                title="Failure Modes"
                description="2 mechanism-driven failure scenarios with triggers, damage, and mitigations"
              />
              <OutputItem
                icon={TrendingUp}
                title="Pattern Anchors"
                description="Historical precedents from 1,875 HNWI patterns with confidence levels"
              />
              <OutputItem
                icon={ArrowRight}
                title="Next Step"
                description="Concrete 7-21 day action with executor, dependencies, and if-blocked plan"
              />
              <OutputItem
                icon={Shield}
                title="Scope Boundary"
                description="Clear in-scope vs out-of-scope definition with validity period"
              />
            </div>
          </div>
        </motion.section>

        {/* Elegant Section Divider */}
        <div className="my-8 sm:my-12 flex items-center">
          <div className="flex-1 h-px bg-border opacity-30" />
        </div>

        {/* Intelligence Foundation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12 sm:mb-16"
        >
          <div className="bg-muted/30 border border-border rounded-2xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-6 text-center">
              Built on Pattern Intelligence
            </h3>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center mb-6">
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {briefCount.toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  HNWI Developments
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  159
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  Failure Patterns
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  47
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                  Sequencing Rules
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              Every audit matches your decision against our pattern library built from
              real HNWI allocation failures, regulatory changes, and successful exits since 2023.
            </p>
          </div>
        </motion.section>

        {/* Premium CTA Section - Matching report output footer style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-card via-card to-muted/20 border border-primary/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-bl from-primary to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-primary to-transparent rounded-full blur-2xl" />
            </div>

            {/* Animated Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-12 text-center">
              {/* Seal/Badge */}
              <motion.div
                className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 mb-4 sm:mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 rounded-full"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
              >
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </motion.div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-3 sm:mb-4">
                Start Your Pattern Audit
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
                3 SFO-grade inputs. IC-ready artifact in 24 hours. Shareable preview for internal approval.
              </p>

              {/* Flow Summary */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  Complete inputs
                </span>
                <ArrowRight className="w-4 h-4 hidden sm:block" />
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  Preview link (shareable)
                </span>
                <ArrowRight className="w-4 h-4 hidden sm:block" />
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  Unlock full artifact
                </span>
              </div>

              <button
                onClick={onContinue}
                className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-12 py-3 sm:py-4 bg-primary text-primary-foreground text-sm sm:text-base font-semibold tracking-wider rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
              >
                <span>BEGIN AUDIT</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  24-hour SLA
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
          <p className="text-xs text-muted-foreground tracking-wider">
            CONFIDENTIAL | HNWI CHRONICLES | PATTERN INTELLIGENCE DIVISION
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            All audit submissions are encrypted and processed in compliance with international privacy standards
          </p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function InputCard({
  number,
  icon: Icon,
  title,
  description,
  example
}: {
  number: number;
  icon: React.ElementType;
  title: string;
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
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">Example:</span> {example}
        </p>
      </div>
    </div>
  );
}

function OutputItem({
  icon: Icon,
  title,
  description
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 sm:p-5 border-b sm:border-r border-border last:border-b-0 sm:last:border-r-0 [&:nth-child(3n)]:sm:border-r-0">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TierCard({
  tier,
  title,
  price,
  selected,
  onSelect,
  badge,
  features,
  ideal
}: {
  tier: 'basic' | 'sota';
  title: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
  features: string[];
  ideal: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative text-left p-6 rounded-2xl border-2 transition-all
        ${selected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card hover:border-primary/30'
        }
      `}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-6">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />
            {badge}
          </span>
        </div>
      )}

      {/* Selection indicator */}
      <div className={`
        absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
        ${selected ? 'border-primary bg-primary' : 'border-border'}
      `}>
        {selected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-primary">{price}</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Ideal for:</span> {ideal}
        </p>
      </div>
    </button>
  );
}
