// components/decision-memo/memo/OverviewSection.tsx
// Overview Section - Decision Memo Executive Summary
// Shows verdict, value creation, optimal structure, and intelligence depth

"use client";

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/motion-variants';

interface OverviewSectionProps {
  verdict?: 'PROCEED' | 'RESTRUCTURE' | 'ABORT';
  generatedAt: string;
  intakeId: string;
  totalValueCreation?: string;
  optimalStructure?: {
    name: string;
    net_benefit?: string;
    net_benefit_formatted?: string;
  };
  intelligenceDepth: number;
  returnsAnalysis?: {
    rentalIncome?: string;
    appreciation?: string;
    taxSavings?: string;
    taxSavingsNote?: string;
  };
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
}

export function OverviewSection({
  verdict = 'PROCEED',
  generatedAt,
  intakeId,
  totalValueCreation,
  optimalStructure,
  intelligenceDepth,
  returnsAnalysis,
  sourceJurisdiction,
  destinationJurisdiction
}: OverviewSectionProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVerdictConfig = () => {
    switch (verdict) {
      case 'PROCEED':
        return {
          label: 'APPROVED',
          sublabel: 'Proceed',
          icon: CheckCircle,
          color: 'text-verdict-proceed',
          bgColor: 'bg-verdict-proceed/10',
          borderColor: 'border-verdict-proceed/20'
        };
      case 'RESTRUCTURE':
        return {
          label: 'CONDITIONAL',
          sublabel: 'Restructure',
          icon: AlertTriangle,
          color: 'text-verdict-restructure',
          bgColor: 'bg-verdict-restructure/10',
          borderColor: 'border-verdict-restructure/20'
        };
      case 'ABORT':
        return {
          label: 'REJECTED',
          sublabel: 'Abort',
          icon: XCircle,
          color: 'text-verdict-abort',
          bgColor: 'bg-verdict-abort/10',
          borderColor: 'border-verdict-abort/20'
        };
      default:
        return {
          label: 'APPROVED',
          sublabel: 'Proceed',
          icon: CheckCircle,
          color: 'text-verdict-proceed',
          bgColor: 'bg-verdict-proceed/10',
          borderColor: 'border-verdict-proceed/20'
        };
    }
  };

  const verdictConfig = getVerdictConfig();
  const VerdictIcon = verdictConfig.icon;

  return (
    <motion.div
      className="space-y-6"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
    >
      {/* Decision Memo Card */}
      <div className={`p-8 rounded-xl border-2 ${verdictConfig.borderColor} ${verdictConfig.bgColor}`}>
        {/* Header with Verdict Badge */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Decision Memo</h2>
            <p className="text-sm text-muted-foreground">{formatDate(generatedAt)}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {intakeId.slice(10, 22).toUpperCase()}
            </p>
          </div>
          <div className={`flex flex-col items-end gap-2`}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${verdictConfig.bgColor} ${verdictConfig.borderColor} border`}>
              <VerdictIcon className={`w-5 h-5 ${verdictConfig.color}`} />
              <span className={`font-bold text-sm ${verdictConfig.color}`}>{verdictConfig.label}</span>
            </div>
            <span className={`text-xs font-medium ${verdictConfig.color}`}>{verdictConfig.sublabel}</span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Total Value Creation */}
          {totalValueCreation && (
            <div className="p-4 rounded-lg bg-surface border border-border">
              <p className="text-xs text-muted-foreground mb-1">Total Value Creation</p>
              <p className="text-2xl font-bold text-gold">{totalValueCreation}</p>
              <p className="text-xs text-muted-foreground mt-1">Projected annual returns</p>
            </div>
          )}

          {/* Optimal Structure */}
          {optimalStructure && (
            <div className="p-4 rounded-lg bg-surface border border-border">
              <p className="text-xs text-muted-foreground mb-1">Optimal Structure</p>
              <p className="text-base font-bold text-foreground">{optimalStructure.name}</p>
              {(optimalStructure.net_benefit_formatted || optimalStructure.net_benefit) && (
                <p className="text-xs text-gold mt-1">
                  {optimalStructure.net_benefit_formatted || optimalStructure.net_benefit} 10-yr benefit
                </p>
              )}
            </div>
          )}
        </div>

        {/* Intelligence Depth */}
        <div className="p-4 rounded-lg bg-surface border border-border mb-6">
          <p className="text-xs text-muted-foreground mb-1">Intelligence Depth</p>
          <p className="text-xl font-bold text-foreground">{intelligenceDepth.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Corridor signals analyzed</p>
        </div>

        {/* Returns Analysis */}
        {returnsAnalysis && (
          <div className="p-4 rounded-lg bg-surface border border-border">
            <p className="text-xs font-bold text-muted-foreground mb-3">Returns Analysis</p>
            <div className="space-y-2">
              {returnsAnalysis.rentalIncome && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rental Income</span>
                  <span className="text-sm font-bold text-foreground">{returnsAnalysis.rentalIncome}</span>
                </div>
              )}
              {returnsAnalysis.appreciation && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Appreciation</span>
                  <span className="text-sm font-bold text-foreground">{returnsAnalysis.appreciation}</span>
                </div>
              )}
              {returnsAnalysis.taxSavings && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tax Savings</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gold">{returnsAnalysis.taxSavings}</span>
                    {returnsAnalysis.taxSavingsNote && (
                      <p className="text-xs text-muted-foreground/60">{returnsAnalysis.taxSavingsNote}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pattern & Market Intelligence Report based on {intelligenceDepth}+ analyzed corridor signals.{' '}
            This report provides strategic intelligence and pattern analysis for informed decision-making.{' '}
            For execution and implementation, consult your legal, tax, and financial advisory teams.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default OverviewSection;
