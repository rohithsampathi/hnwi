// =============================================================================
// PREVIEW PANEL
// Right side of split view - Shows what user will receive
// =============================================================================

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Scale,
  Zap,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Shield,
  CheckCircle,
  Lock
} from 'lucide-react';
import { AuditSession } from '@/lib/decision-memo/pattern-audit-types';
import { AnalysisLoader } from './AnalysisLoader';

interface PreviewPanelProps {
  session: AuditSession | null;
  isSubmitting: boolean;
}

export function PreviewPanel({ session, isSubmitting }: PreviewPanelProps) {
  // Submitting state - Show sophisticated analysis loader
  if (isSubmitting) {
    return <AnalysisLoader />;
  }

  // Default: Show what the audit includes
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Your IC Artifact Preview
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          What you'll receive after submission
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Artifact Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden mb-6"
        >
          {/* Header */}
          <div className="bg-primary/5 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Decision Posture Audit
                </h3>
                <p className="text-xs text-muted-foreground">
                  IC-Ready Investment Committee Format
                </p>
              </div>
            </div>
          </div>

          {/* Sections Preview */}
          <div className="divide-y divide-border">
            <SectionPreview
              icon={Scale}
              title="1. Executive Verdict"
              description="PROCEED / PROCEED WITH MODIFICATIONS / DO NOT PROCEED"
              locked={false}
            />
            <SectionPreview
              icon={Zap}
              title="2. Sequence Correction"
              description="Step-by-step execution order with owners & timelines"
              locked={true}
            />
            <SectionPreview
              icon={AlertTriangle}
              title="3. Failure Modes"
              description="2 mechanism-driven failure scenarios with mitigations"
              locked={true}
            />
            <SectionPreview
              icon={TrendingUp}
              title="4. Pattern Anchors"
              description="Historical precedents with confidence levels"
              locked={true}
            />
            <SectionPreview
              icon={ArrowRight}
              title="5. Next Step"
              description="Concrete 7-21 day action with executor"
              locked={true}
            />
            <SectionPreview
              icon={Shield}
              title="6. Scope Boundary"
              description="In-scope vs out-of-scope with validity period"
              locked={true}
            />
          </div>
        </motion.div>

        {/* Flow Explanation */}
        <div className="bg-muted/30 rounded-xl p-5">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            How It Works
          </h4>

          <div className="space-y-4">
            <FlowStep
              number={1}
              title="Submit your 3 inputs"
              description="Decision thesis, constraints, and control structure"
              active={true}
            />
            <FlowStep
              number={2}
              title="Preview link generated"
              description="Shareable link for internal SFO approval"
              active={false}
            />
            <FlowStep
              number={3}
              title="Unlock full artifact"
              description="Complete IC memo with all sections + PDF export"
              active={false}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">SLA</span>
              <span className="font-medium text-foreground">24 hours</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Pattern Library</span>
              <span className="font-medium text-foreground">1,875 developments</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium text-primary">$2,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function SectionPreview({
  icon: Icon,
  title,
  description,
  locked
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  locked: boolean;
}) {
  return (
    <div className="px-5 py-4 flex items-start gap-3">
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${locked ? 'bg-muted' : 'bg-primary/10'}
      `}>
        {locked ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Icon className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-sm ${locked ? 'text-muted-foreground' : 'text-foreground'}`}>
            {title}
          </h4>
          {locked && (
            <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
              Preview only
            </span>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${locked ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
  active
}: {
  number: number;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
        ${active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground'
        }
      `}>
        {number}
      </div>
      <div>
        <h5 className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
          {title}
        </h5>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default PreviewPanel;
