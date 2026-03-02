// components/decision-memo/memo/InvestmentCommitteeSection.tsx
// Investment Committee Section - Risk Assessment & Capital Allocation
// Shows risk assessment, due diligence requirements, and liquidity analysis

"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { fadeInUp } from '@/lib/animations/motion-variants';

interface RiskFactor {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  category?: string;
}

interface DueDiligenceItem {
  id: string;
  priority: 'Critical' | 'High' | 'Medium';
  timeline: string;
  advisor: string;
  task: string;
  category: string;
}

interface LiquidityAnalysis {
  capitalDeployed: string;
  barrierCosts: string;
  recoverableCapital: string;
  trappedPercentage: string;
  description: string;
}

interface InvestmentCommitteeSectionProps {
  verdict?: 'PROCEED' | 'RESTRUCTURE' | 'ABORT';
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  criticalItemsCount: number;
  opportunitiesCount: number;
  riskFactorsCount: number;
  dataQuality: string;
  intelligenceDepth: number;
  totalExposure: string;
  highPriorityCount: number;
  mitigationTimeline: string;
  sourceJurisdiction?: string;
  destinationJurisdiction?: string;
  riskFactors?: RiskFactor[];
  dueDiligence?: DueDiligenceItem[];
  liquidityAnalysis?: LiquidityAnalysis;
}

export function InvestmentCommitteeSection({
  verdict = 'PROCEED',
  riskLevel,
  criticalItemsCount,
  opportunitiesCount,
  riskFactorsCount,
  dataQuality,
  intelligenceDepth,
  totalExposure,
  highPriorityCount,
  mitigationTimeline,
  sourceJurisdiction,
  destinationJurisdiction,
  riskFactors = [],
  dueDiligence = [],
  liquidityAnalysis
}: InvestmentCommitteeSectionProps) {

  const getVerdictConfig = () => {
    switch (verdict) {
      case 'PROCEED':
        return {
          label: 'APPROVED',
          sublabel: `Address ${criticalItemsCount} critical items before proceeding.`,
          icon: CheckCircle,
          color: 'text-verdict-proceed',
          bgColor: 'bg-verdict-proceed/10'
        };
      case 'RESTRUCTURE':
        return {
          label: 'CONDITIONAL',
          sublabel: 'Requires restructuring before approval.',
          icon: AlertTriangle,
          color: 'text-verdict-restructure',
          bgColor: 'bg-verdict-restructure/10'
        };
      case 'ABORT':
        return {
          label: 'REJECTED',
          sublabel: 'Critical risks identified.',
          icon: AlertCircle,
          color: 'text-verdict-abort',
          bgColor: 'bg-verdict-abort/10'
        };
      default:
        return {
          label: 'APPROVED',
          sublabel: `Address ${criticalItemsCount} critical items before proceeding.`,
          icon: CheckCircle,
          color: 'text-verdict-proceed',
          bgColor: 'bg-verdict-proceed/10'
        };
    }
  };

  const getRiskLevelColor = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'text-red-500';
      case 'HIGH':
        return 'text-amber-500';
      case 'MODERATE':
        return 'text-yellow-500';
      case 'LOW':
        return 'text-emerald-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Risk Assessment & Investment Verdict</h2>
        <p className="text-sm text-muted-foreground">Investment Committee Decision</p>
      </div>

      {/* Verdict Card */}
      <div className={`p-6 rounded-xl border-2 ${verdictConfig.bgColor} border-border`}>
        <div className="flex items-start gap-3 mb-3">
          <VerdictIcon className={`w-6 h-6 ${verdictConfig.color} mt-0.5`} />
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${verdictConfig.color} mb-1`}>{verdictConfig.label}</h3>
            <p className="text-sm text-foreground">{verdictConfig.sublabel}</p>
          </div>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
          <p className={`text-xl font-bold ${getRiskLevelColor()}`}>{riskLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">Overall assessment</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">Opportunities</p>
          <p className="text-xl font-bold text-emerald-500">{opportunitiesCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Identified windows</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">Risk Factors</p>
          <p className="text-xl font-bold text-amber-500">{riskFactorsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Items flagged</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border col-span-2 sm:col-span-3">
          <p className="text-xs text-muted-foreground mb-1">Data Quality</p>
          <p className="text-base font-bold text-foreground">{dataQuality}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {intelligenceDepth.toLocaleString()} KGv3 corridor signals analyzed for {sourceJurisdiction}→{destinationJurisdiction}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Exposure</p>
          <p className="text-xl font-bold text-foreground">{totalExposure}</p>
          <p className="text-xs text-muted-foreground mt-1">Aggregate risk value</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">Critical Items</p>
          <p className="text-xl font-bold text-red-500">{criticalItemsCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-muted-foreground mb-1">High Priority</p>
          <p className="text-xl font-bold text-amber-500">{highPriorityCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Priority mitigation needed</p>
        </div>

        <div className="p-4 rounded-lg bg-surface border border-border col-span-2 sm:col-span-3">
          <p className="text-xs text-muted-foreground mb-1">Mitigation Timeline</p>
          <p className="text-base font-bold text-foreground">{mitigationTimeline}</p>
          <p className="text-xs text-muted-foreground mt-1">Resolution window</p>
        </div>
      </div>

      {/* Risk Intelligence */}
      {riskFactors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Risk Intelligence</h3>
          <div className="p-4 rounded-lg bg-surface border border-border">
            <p className="text-sm font-bold text-muted-foreground mb-3">Identified Risk Factors</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm">
                <span className="text-red-500 font-bold">{riskFactors.filter(r => r.severity === 'Critical').length} Critical</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm">
                <span className="text-amber-500 font-bold">{riskFactors.filter(r => r.severity === 'High').length} High</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{totalExposure} Total</span>
            </div>
            <div className="space-y-3">
              {riskFactors.slice(0, 3).map((risk, index) => (
                <div key={risk.id} className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xs font-bold text-muted-foreground">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getSeverityColor(risk.severity)}`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                      {risk.category && (
                        <p className="text-xs text-muted-foreground/60 mt-1">{risk.category}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Due Diligence Requirements */}
      {dueDiligence.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Compliance Framework</h3>
          <div className="p-4 rounded-lg bg-surface border border-border">
            <p className="text-sm font-bold text-muted-foreground mb-1">Due Diligence Requirements</p>
            <p className="text-xs text-muted-foreground mb-4">
              {dueDiligence.filter(d => d.priority === 'Critical').length} Critical · {dueDiligence.filter(d => d.priority === 'High').length} High
            </p>
            <div className="space-y-2">
              {dueDiligence.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-border bg-background flex items-start gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-bold ${item.category === 'TAX' ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-500'}`}>
                    {item.category}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.timeline}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{item.advisor}</span>
                    </div>
                    <p className="text-sm text-foreground">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Liquidity Prison */}
      {liquidityAnalysis && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">The Liquidity Prison</h3>
          <div className="p-6 rounded-xl border border-border bg-surface">
            <div className="space-y-4">
              {/* Capital Flow */}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground mb-1">Capital Deployed</p>
                  <p className="text-xl font-bold text-foreground">{liquidityAnalysis.capitalDeployed}</p>
                  <p className="text-xs text-muted-foreground mt-1">{liquidityAnalysis.description}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>

              {/* Barrier Zone */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-bold text-red-500 mb-2">Barrier Zone</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Stamp Duties</span>
                    <span className="text-sm font-bold text-red-500">{liquidityAnalysis.barrierCosts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Capital Destroyed</span>
                    <span className="text-sm font-bold text-red-500">{liquidityAnalysis.barrierCosts}</span>
                  </div>
                </div>
              </div>

              {/* Recoverable Capital */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Recoverable Capital</p>
                <p className="text-2xl font-bold text-foreground">{liquidityAnalysis.recoverableCapital}</p>
                <p className="text-sm text-red-500 font-medium mt-1">{liquidityAnalysis.trappedPercentage} trapped on Day One</p>
              </div>

              {/* Impact Statement */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold">Immediate Equity Destruction Upon Acquisition</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default InvestmentCommitteeSection;
