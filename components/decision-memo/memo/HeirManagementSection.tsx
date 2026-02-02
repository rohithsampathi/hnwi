"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  Building2,
  Clock,
  ArrowRight,
  DollarSign,
  Calendar,
  UserCheck,
  Scale,
  TrendingDown,
  User,
  Baby,
  Heart
} from 'lucide-react';
import {
  HeirManagementData,
  HeirAllocation,
  HeirRelationship,
  RiskLevel,
  InvolvementLevel,
  ReadinessLevel,
  ProtectionLevel,
  HumanCapitalProvision,
  GovernanceInsuranceProvision,
  EstateTaxByHeirType,
  formatPercentage,
  formatCurrency
} from '@/lib/decision-memo/sfo-expert-types';

interface HeirManagementSectionProps {
  data?: HeirManagementData | Record<string, never>;
  rawAnalysis?: string;
}

// Helper function to parse markdown bold (**text**) and render as bold spans
function parseMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    // Odd indices are the bold parts (captured groups)
    if (index % 2 === 1) {
      return <span key={index} className="font-bold text-foreground">{part}</span>;
    }
    return part;
  });
}

// Format large currency values
function formatLargeCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

// Urgency color based on mitigation timeline days
function getUrgencyColor(days: number | undefined): string {
  if (days === undefined) return 'text-muted-foreground';
  if (days <= 45) return 'text-red-600';      // Urgent - needs immediate attention
  if (days <= 60) return 'text-yellow-600';   // Moderate urgency
  return 'text-green-600';                     // Standard timeline
}

// Urgency badge styling based on days
function getUrgencyBadgeStyle(days: number | undefined): string {
  if (days === undefined) return 'bg-muted text-muted-foreground';
  if (days <= 45) return 'bg-red-100 text-red-700 border-red-200';      // Urgent
  if (days <= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';  // Moderate
  return 'bg-green-100 text-green-700 border-green-200';                 // Standard
}

// Heir icon by relationship
function HeirIcon({ relationship, className = "w-6 h-6" }: { relationship: HeirRelationship; className?: string }) {
  switch (relationship) {
    case 'daughter':
    case 'son':
      return <User className={className} />;
    case 'grandchild':
      return <Baby className={className} />;
    case 'spouse':
      return <Heart className={className} />;
    default:
      return <Users className={className} />;
  }
}

// Generation badge component
function GenerationBadge({ gen, isActive = false }: { gen: string; isActive?: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground'
    }`}>
      {gen}
    </div>
  );
}

// Normalize preservation percentage - handle both decimal (0.95) and percentage (95) formats
function normalizePercentage(value: number): number {
  if (value > 1 && value <= 100) {
    // Already a percentage (e.g., 95 for 95%)
    return value / 100;
  } else if (value > 100) {
    // Likely an error or very large value - cap at 100%
    return 1;
  }
  // Already a decimal (e.g., 0.95 for 95%)
  return value;
}

// Preservation indicator
function PreservationIndicator({ percentage }: { percentage: number }) {
  const normalized = normalizePercentage(percentage);
  const isGood = normalized >= 0.70;
  const isModerate = normalized >= 0.50 && normalized < 0.70;

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
      isGood ? 'bg-primary/20 text-primary' :
      isModerate ? 'bg-muted text-muted-foreground' :
      'bg-muted text-muted-foreground'
    }`}>
      {(normalized * 100).toFixed(0)}% Preserved
    </div>
  );
}

// Risk gauge component (semi-circular) - using primary colors only
function RiskGauge({ current, improved, label }: { current: number; improved: number; label: string }) {
  const reduction = current - improved;
  const r = 50;
  const strokeW = 8;
  const halfC = Math.PI * r;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-[76px] mb-2">
        <svg viewBox="0 0 120 68" className="w-full h-full overflow-visible">
          {/* Background arc */}
          <path d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`} fill="none" stroke="currentColor" strokeWidth={strokeW} className="text-muted" />
          {/* Current risk arc */}
          <path d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`} fill="none" stroke="currentColor" strokeWidth={strokeW} strokeDasharray={halfC} strokeDashoffset={halfC - (halfC * current / 100)} strokeLinecap="round" className="text-muted-foreground/50" />
          {/* Improved risk arc */}
          <path d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60`} fill="none" stroke="currentColor" strokeWidth={strokeW} strokeDasharray={halfC} strokeDashoffset={halfC - (halfC * improved / 100)} strokeLinecap="round" className="text-primary" />
        </svg>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <span className="text-2xl font-bold text-foreground">{Math.round(current)}%</span>
          <span className="text-xs text-muted-foreground ml-1">→</span>
          <span className="text-lg font-bold text-primary ml-1">{Math.round(improved)}%</span>
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
      <p className="text-sm font-bold text-primary">↓ {Math.round(reduction)} pts</p>
    </div>
  );
}

// Involvement level indicator - using primary colors
function InvolvementIndicator({ level }: { level: InvolvementLevel }) {
  const config: Record<InvolvementLevel, { bars: number; label: string }> = {
    HIGH: { bars: 4, label: 'High' },
    MODERATE: { bars: 3, label: 'Moderate' },
    LOW: { bars: 2, label: 'Low' },
    MINIMAL: { bars: 1, label: 'Minimal' }
  };

  const { bars, label } = config[level] || config.MODERATE;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`w-1.5 h-4 rounded-sm ${i <= bars ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
    </div>
  );
}

// Readiness badge - using primary colors
function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  const config: Record<ReadinessLevel, { opacity: string; icon: React.ReactNode }> = {
    HIGH: { opacity: 'bg-primary/20 text-primary', icon: <UserCheck className="w-3 h-3" /> },
    MODERATE: { opacity: 'bg-primary/10 text-primary', icon: <Scale className="w-3 h-3" /> },
    LOW: { opacity: 'bg-muted text-muted-foreground', icon: <AlertTriangle className="w-3 h-3" /> }
  };

  const { opacity, icon } = config[level] || config.MODERATE;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${opacity}`}>
      {icon}
      {level}
    </span>
  );
}

// Legacy Heir card component - using primary colors only
function HeirCard({ heir, index }: { heir: NonNullable<HeirManagementData['heirs']>[0]; index: number }) {
  const riskOpacity: Record<RiskLevel, string> = {
    HIGH: 'border-primary/60 bg-primary/5',
    MEDIUM: 'border-primary/40 bg-primary/5',
    LOW: 'border-border bg-card'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`border-2 rounded-xl p-5 ${riskOpacity[heir.risk_level] || 'border-border bg-card'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">{heir.name}</h4>
            <p className="text-xs text-muted-foreground">{heir.role}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[9px] font-bold ${
          heir.risk_level === 'HIGH' ? 'bg-primary/20 text-primary' :
          heir.risk_level === 'MEDIUM' ? 'bg-primary/10 text-primary' :
          'bg-muted text-muted-foreground'
        }`}>
          {heir.risk_level} RISK
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Involvement</p>
          <InvolvementIndicator level={heir.involvement_level} />
        </div>
        <div className="bg-card rounded-lg p-3 border border-border">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Wealth Readiness</p>
          <ReadinessBadge level={heir.wealth_readiness} />
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="pt-4 border-t border-border">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Recommended Actions</p>
        <div className="space-y-2">
          {heir.recommended_actions.slice(0, 3).map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// NEW: Heir Allocation Card
function HeirAllocationCard({ allocation, index }: { allocation: HeirAllocation; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="border border-border bg-card rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <HeirIcon relationship={allocation.relationship} className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-bold text-foreground">{allocation.name}</h4>
            <p className="text-xs text-muted-foreground">Age: {allocation.age}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{(allocation.allocation_pct * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">{formatLargeCurrency(allocation.allocation_value)}</p>
        </div>
      </div>

      {/* Structure Info */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Structure</p>
        <p className="text-sm font-bold text-foreground">{allocation.recommended_structure}</p>
      </div>

      {/* Timing */}
      <div className="mb-4">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Timing</p>
        <p className="text-xs text-muted-foreground">{allocation.timing}</p>
      </div>

      {/* Special Considerations */}
      {allocation.special_considerations && allocation.special_considerations.length > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="space-y-2">
            {allocation.special_considerations.map((consideration, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{consideration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Protection level badge - primary colors only
function ProtectionBadge({ level }: { level: ProtectionLevel }) {
  const config: Record<ProtectionLevel, { color: string; label: string }> = {
    HIGH: { color: 'bg-primary text-primary-foreground', label: 'HIGH PROTECTION' },
    MODERATE: { color: 'bg-primary/50 text-primary-foreground', label: 'MODERATE' },
    LOW: { color: 'bg-muted text-muted-foreground', label: 'LOW' }
  };

  const { color, label } = config[level] || config.MODERATE;

  return (
    <span className={`px-3 py-1 rounded text-[10px] font-bold ${color}`}>
      {label}
    </span>
  );
}

export const HeirManagementSection: React.FC<HeirManagementSectionProps> = ({
  data,
  rawAnalysis
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Check for NEW data structure (G1→G2→G3 transfer flow)
  const hasNewDataStructure = data && 'g1_position' in data && data.g1_position;

  // Check for legacy structured data
  const hasLegacyStructuredData = data && 'third_generation_risk' in data && 'heirs' in data && Array.isArray(data.heirs) && data.heirs.length > 0;

  const hasNarrativeAnalysis = rawAnalysis && rawAnalysis.trim().length > 0;

  // Filter out JSON blocks from markdown content
  const filterJsonFromMarkdown = (markdown: string): string => {
    let filtered = markdown.replace(/```(?:json)?[\s\S]*?```/gi, '');
    filtered = filtered.replace(/\n\s*\{[\s\S]*?"[a-z_]+"[\s\S]*\}\s*$/i, '');
    filtered = filtered.replace(/^\s*[\[\]{}",:\d]+\s*$/gm, '');
    return filtered.trim();
  };

  // ============================================================================
  // NEW: RENDER G1→G2→G3 TRANSFER FLOW LAYOUT
  // ============================================================================
  if (hasNewDataStructure) {
    const typedData = data as HeirManagementData;
    const g1 = typedData.g1_position!;
    const g1ToG2 = typedData.g1_to_g2_transfer;
    const g2ToG3 = typedData.g2_to_g3_transfer;
    const withStructure = typedData.with_structure;
    const topRisk = typedData.top_succession_trigger;
    const nextAction = typedData.next_action;
    const heirAllocations = typedData.heir_allocations;

    // Hughes Framework: Third Generation Problem + Governance Insurance
    // NEW: Backend now sends at hughes_framework.third_generation_problem
    // Fallback to legacy flat structure for backwards compatibility
    const hughesFramework = typedData.hughes_framework;
    const thirdGenProblem = hughesFramework?.third_generation_problem ?? typedData.third_generation_problem;
    const humanCapitalProvisions = hughesFramework?.human_capital_provisions ?? typedData.human_capital_provisions;
    const governanceInsurance = hughesFramework?.governance_insurance ?? typedData.governance_insurance;
    const structureProvisions = typedData.structure_specific_provisions;

    // NEW: Granular Estate Tax by Heir Type (from HNWI Chronicles KG)
    const estateTaxByHeirType = typedData.estate_tax_by_heir_type;

    // Use explicit backend fields for third generation risk display
    // IMPORTANT: Values are JURISDICTION-SPECIFIC (e.g., Dubai=61% behavioral, UK=40% estate tax)
    // DO NOT hardcode fallback values - use backend data only
    // Backend provides: loss_without_structure_pct, loss_with_structure_pct
    // Backend provides: preservation_without_structure_pct, preservation_with_structure_pct
    // Backend provides: improvement_pts, display_loss_arrow, display_preservation_arrow

    // Preservation metrics - prefer explicit backend values
    const preservationWithoutStructure = thirdGenProblem?.preservation_without_structure_pct;
    const preservationWithStructure = thirdGenProblem?.preservation_with_structure_pct;

    // Loss risk metrics - use explicit backend values (jurisdiction-specific)
    const thirdGenCurrentRisk = thirdGenProblem?.loss_without_structure_pct ??
      (preservationWithoutStructure !== undefined ? (100 - preservationWithoutStructure) : undefined);
    const thirdGenImprovedRisk = thirdGenProblem?.loss_with_structure_pct ??
      (preservationWithStructure !== undefined ? (100 - preservationWithStructure) : undefined);

    // Improvement points (backend-calculated)
    const improvementPts = thirdGenProblem?.improvement_pts;

    // Pre-formatted display strings from backend
    const displayLossArrow = thirdGenProblem?.display_loss_arrow;
    const displayPreservationArrow = thirdGenProblem?.display_preservation_arrow;

    return (
      <div ref={sectionRef}>
        {/* Premium Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              HEIR MANAGEMENT & SUCCESSION
            </h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              3rd Gen Protection
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            Multi-generational wealth preservation with structured governance
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Third Generation Risk Assessment */}
          {withStructure && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Third Generation Risk Assessment
                </h3>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                {thirdGenCurrentRisk !== undefined && thirdGenImprovedRisk !== undefined && (
                  <RiskGauge
                    current={thirdGenCurrentRisk}
                    improved={thirdGenImprovedRisk}
                    label="Probability of Wealth Loss"
                  />
                )}

                <div className="flex-1 w-full">
                  {/* Loss Risk Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Loss Risk</p>
                      <p className="text-xl font-bold text-foreground">{thirdGenCurrentRisk !== undefined ? `${thirdGenCurrentRisk}%` : '—'}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">With Structure</p>
                      <p className="text-xl font-bold text-primary">{thirdGenImprovedRisk !== undefined ? `${thirdGenImprovedRisk}%` : '—'}</p>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/30">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Risk Reduction</p>
                      {displayLossArrow ? (
                        <p className="text-lg font-bold text-primary">{displayLossArrow}</p>
                      ) : improvementPts !== undefined ? (
                        <p className="text-xl font-bold text-primary">↓{improvementPts} pts</p>
                      ) : thirdGenCurrentRisk !== undefined && thirdGenImprovedRisk !== undefined ? (
                        <p className="text-xl font-bold text-primary">↓{thirdGenCurrentRisk - thirdGenImprovedRisk} pts</p>
                      ) : (
                        <p className="text-xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>

                  {/* Preservation Metrics - Show when data available */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Preservation</p>
                      <p className="text-xl font-bold text-muted-foreground">{preservationWithoutStructure !== undefined ? `${preservationWithoutStructure}%` : '—'}</p>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">With Structure</p>
                      <p className="text-xl font-bold text-primary">{preservationWithStructure !== undefined ? `${preservationWithStructure}%` : '—'}</p>
                    </div>
                    <div className="bg-primary/15 rounded-lg p-4 text-center border border-primary/40">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Protection Gain</p>
                      {displayPreservationArrow ? (
                        <p className="text-lg font-bold text-primary">{displayPreservationArrow}</p>
                      ) : preservationWithStructure !== undefined && preservationWithoutStructure !== undefined ? (
                        <p className="text-xl font-bold text-primary">↑{preservationWithStructure - preservationWithoutStructure} pts</p>
                      ) : (
                        <p className="text-xl font-bold text-muted-foreground">—</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommended Structure */}
          {withStructure && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Recommended Structure
                  </h3>
                </div>
                {preservationWithStructure !== undefined && (
                  <PreservationIndicator percentage={preservationWithStructure} />
                )}
              </div>
              <p className="text-lg font-bold text-foreground">{withStructure.recommended_structure}</p>
            </motion.div>
          )}

          {/* G1 → G2 → G3 Wealth Transfer Flow */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                G1 → G2 → G3 Wealth Transfer
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* G1 Position */}
              <div className="relative bg-primary/5 border border-primary/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <GenerationBadge gen="G1" isActive />
                  <div>
                    <p className="text-sm font-bold text-foreground">Principal</p>
                    <p className="text-[10px] text-muted-foreground">Today</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Asset Value</p>
                    <p className="text-xl font-bold text-foreground">{formatLargeCurrency(g1.asset_value)}</p>
                  </div>
                  {g1.estate_tax_rate > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estate Tax Rate</p>
                      <p className="text-sm font-bold text-foreground">{(g1.estate_tax_rate * 100).toFixed(0)}%</p>
                    </div>
                  )}
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* G2 Transfer */}
              {g1ToG2 && (
                <div className="relative bg-muted/30 border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <GenerationBadge gen="G2" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Children</p>
                      <p className="text-[10px] text-muted-foreground">{g1ToG2.years_out} years</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected Value</p>
                      <p className="text-xl font-bold text-foreground">{formatLargeCurrency(g1ToG2.projected_value)}</p>
                    </div>
                    {g1ToG2.estate_tax_hit > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax Hit</p>
                        <p className="text-sm font-bold text-muted-foreground">-{formatLargeCurrency(g1ToG2.estate_tax_hit)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net to G2</p>
                      <p className="text-sm font-bold text-primary">{formatLargeCurrency(g1ToG2.net_to_g2)}</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* G3 Transfer */}
              {g2ToG3 && (
                <div className="bg-muted/30 border border-border rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <GenerationBadge gen="G3" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Grandchildren</p>
                      <p className="text-[10px] text-muted-foreground">{g2ToG3.years_out} years</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected Value</p>
                      <p className="text-xl font-bold text-foreground">{formatLargeCurrency(g2ToG3.projected_value)}</p>
                    </div>
                    {g2ToG3.estate_tax_hit > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax Hit</p>
                        <p className="text-sm font-bold text-muted-foreground">-{formatLargeCurrency(g2ToG3.estate_tax_hit)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Net to G3</p>
                      <p className="text-sm font-bold text-primary">{formatLargeCurrency(g2ToG3.net_to_g3_without_structure)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* With Structure Comparison */}
            {withStructure && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Without Structure</p>
                    <p className="text-lg font-bold text-muted-foreground">
                      {g2ToG3 ? formatLargeCurrency(g2ToG3.net_to_g3_without_structure) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">With Structure</p>
                    <p className="text-lg font-bold text-primary">{formatLargeCurrency(withStructure.net_to_g3_with_structure)}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Wealth Preserved</p>
                    <p className={`text-lg font-bold ${withStructure.wealth_preserved >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {withStructure.wealth_preserved >= 0 ? '+' : ''}{formatLargeCurrency(withStructure.wealth_preserved)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Preservation Rate</p>
                    <p className="text-lg font-bold text-foreground">{preservationWithStructure !== undefined ? `${preservationWithStructure}%` : '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* NEW: Granular Estate Tax by Heir Type */}
          {estateTaxByHeirType && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.22 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Destination Estate Tax by Heir Type
                </h3>
              </div>

              {/* Headline */}
              {estateTaxByHeirType.headline && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground">{estateTaxByHeirType.headline}</p>
                </div>
              )}

              {/* Tax Rates Grid */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Spouse Rate */}
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Spouse</p>
                  <p className={`text-xl font-bold ${estateTaxByHeirType.spouse_rate === 0 ? 'text-green-500' : 'text-foreground'}`}>
                    {estateTaxByHeirType.spouse_summary || `${(estateTaxByHeirType.spouse_rate * 100).toFixed(0)}%`}
                  </p>
                </div>

                {/* Children Rate */}
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Children</p>
                  <p className={`text-xl font-bold ${estateTaxByHeirType.children_rate === 0 ? 'text-green-500' : estateTaxByHeirType.children_rate > 0.3 ? 'text-amber-500' : 'text-foreground'}`}>
                    {estateTaxByHeirType.children_summary || `${(estateTaxByHeirType.children_rate * 100).toFixed(0)}%`}
                  </p>
                </div>

                {/* Non-Lineal Rate */}
                <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Non-Lineal</p>
                  <p className={`text-xl font-bold ${estateTaxByHeirType.non_lineal_rate > 0.3 ? 'text-amber-500' : 'text-foreground'}`}>
                    {(estateTaxByHeirType.non_lineal_rate * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Explanatory Note */}
              {estateTaxByHeirType.note && (
                <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border">
                  <p>{estateTaxByHeirType.note}</p>
                </div>
              )}

              {/* Source Attribution */}
              <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-border">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-[10px] text-muted-foreground">
                  Source: {estateTaxByHeirType.source || 'HNWI Chronicles KG'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Heir Allocations */}
          {heirAllocations && heirAllocations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Heir Allocations
                </h3>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {heirAllocations.map((allocation, index) => (
                  <HeirAllocationCard key={allocation.name} allocation={allocation} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Succession Risk */}
          {topRisk && (
            <motion.div
              className="bg-muted/50 border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Top Succession Risk
                  </h3>
                </div>
                {/* Urgency Badge */}
                {topRisk.mitigation_timeline_days !== undefined && (
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getUrgencyBadgeStyle(topRisk.mitigation_timeline_days)}`}>
                    {topRisk.mitigation_timeline_days <= 45 ? 'URGENT' : topRisk.mitigation_timeline_days <= 60 ? 'MODERATE' : 'STANDARD'}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground font-medium mb-2">{parseMarkdownBold(topRisk.trigger)}</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">At Risk</p>
                      <p className="text-lg font-bold text-foreground">{formatLargeCurrency(topRisk.dollars_at_risk)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-2">Mitigation</p>
                  <p className="text-sm text-muted-foreground">{parseMarkdownBold(topRisk.mitigation)}</p>

                  {/* Mitigation Timeline */}
                  {topRisk.mitigation_timeline && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Timeline</p>
                      </div>
                      <p className={`text-sm font-medium mt-1 ${getUrgencyColor(topRisk.mitigation_timeline_days)}`}>
                        {topRisk.mitigation_timeline}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Hughes Framework: Third Generation Problem */}
          {thirdGenProblem && (
            <motion.div
              className="bg-muted/30 border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Third Generation Problem
                </h3>
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-bold rounded-full">
                  HUGHES FRAMEWORK
                </span>
              </div>

              {thirdGenProblem.statistic && (
                <div className="bg-card rounded-lg p-4 border border-border mb-4">
                  <p className="text-lg font-bold text-foreground">{thirdGenProblem.statistic}</p>
                </div>
              )}

              {thirdGenProblem.causes && thirdGenProblem.causes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Primary Causes</p>
                  <div className="flex flex-wrap gap-2">
                    {thirdGenProblem.causes.map((cause, i) => (
                      <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-xs text-muted-foreground">
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {thirdGenProblem.risk_factors && thirdGenProblem.risk_factors.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Your Risk Factors</p>
                  <div className="space-y-2">
                    {thirdGenProblem.risk_factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Hughes Framework: Human Capital Provisions */}
          {humanCapitalProvisions && humanCapitalProvisions.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Human Capital Provisions
                </h3>
              </div>

              <p className="text-xs text-muted-foreground mb-4 italic">
                Financial education and stewardship requirements to protect wealth across generations
              </p>

              <div className="space-y-3">
                {humanCapitalProvisions.map((provision, i) => (
                  <div key={i} className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-bold text-foreground">{provision.name}</p>
                      {provision.structure_type && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-bold rounded">
                          {provision.structure_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{provision.description}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-[10px] text-primary font-medium">{provision.trigger}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Hughes Framework: Governance Insurance */}
          {governanceInsurance && governanceInsurance.length > 0 && (
            <motion.div
              className="bg-card border border-border rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Governance Insurance
                </h3>
              </div>

              <p className="text-xs text-muted-foreground mb-4 italic">
                Structural protections: spendthrift clauses, trustee oversight, distribution gates, lifestyle caps
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {governanceInsurance.map((provision, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        provision.type === 'spendthrift_clause' ? 'bg-primary' :
                        provision.type === 'distribution_gate' ? 'bg-primary' :
                        provision.type === 'lifestyle_cap' ? 'bg-muted-foreground' :
                        'bg-primary'
                      }`} />
                      <p className="text-xs font-bold text-foreground">{provision.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{provision.description}</p>
                    <p className="text-[9px] text-primary italic">{provision.rationale}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Structure-Specific Provisions (if applicable) */}
          {structureProvisions && (
            <motion.div
              className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {structureProvisions.structure_name} Provisions
                  </h3>
                </div>
                <span className="px-2 py-1 bg-primary/20 text-primary text-[9px] font-bold rounded">
                  {structureProvisions.jurisdiction}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Human Capital for this structure */}
                {structureProvisions.human_capital && structureProvisions.human_capital.length > 0 && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-3">Human Capital Requirements</p>
                    <div className="space-y-2">
                      {structureProvisions.human_capital.map((provision, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <GraduationCap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{provision.name}: {provision.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Governance Insurance for this structure */}
                {structureProvisions.governance_insurance && structureProvisions.governance_insurance.length > 0 && (
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-3">Governance Insurance</p>
                    <div className="space-y-2">
                      {structureProvisions.governance_insurance.map((provision, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Shield className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{provision.name}: {provision.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Next Action */}
          {nextAction && (
            <motion.div
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Next Action
                </h3>
              </div>
              <p className="text-base text-foreground font-medium">{parseMarkdownBold(nextAction)}</p>
            </motion.div>
          )}

          {/* Intelligence Source Footer */}
          <motion.div
            className="flex items-center justify-center gap-2 pt-6"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <p className="text-[10px] text-muted-foreground">
              Grounded in HNWI Chronicles KG Succession Framework + Hughes Family Wealth Framework
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LEGACY: NARRATIVE FALLBACK (for backwards compatibility)
  // ============================================================================

  // Extract wealth preservation metrics
  const extractWealthMetrics = (text: string) => {
    const metrics: { label: string; value: string; subtext?: string }[] = [];
    const y40Match = text.match(/40[- ]?YEAR.*?:\s*\$?([\d,]+(?:\.\d+)?[KMB]?)/i);
    if (y40Match) metrics.push({ label: '40-Year Wealth', value: `$${y40Match[1]}`, subtext: 'Protected' });
    const preservedMatch = text.match(/preserved.*?:\s*\$?([\d,]+[KMB]?)/i);
    if (preservedMatch) metrics.push({ label: 'Preserved', value: `$${preservedMatch[1]}` });
    const cagrMatch = text.match(/CAGR[:\s]+([\d.]+%)/i);
    if (cagrMatch) metrics.push({ label: 'CAGR', value: cagrMatch[1] });
    return metrics;
  };

  // Extract 3rd generation risk data from narrative text
  // NOTE: This is a FALLBACK only - prefer structured data from backend
  // DO NOT use hardcoded defaults (the "70% rule" is academically discredited)
  const extractThirdGenRisk = (text: string): {
    currentRisk: number | undefined;
    improvedRisk: number | undefined;
    improvement: string;
  } => {
    const riskMatch = text.match(/(?:3rd|third)\s*(?:gen|generation)[^0-9]*(\d+)%/i) ||
                     text.match(/probability[^0-9]*(\d+)%/i) ||
                     text.match(/risk[^0-9]*(\d+)%/i);
    // DO NOT hardcode fallback - return undefined if not found
    const currentRisk = riskMatch ? parseInt(riskMatch[1]) : undefined;

    const improvedMatch = text.match(/(?:improved|with\s*structure|reduced)[^0-9]*(\d+)%/i);
    // Only calculate improved if we have a current risk value
    const improvedRisk = improvedMatch
      ? parseInt(improvedMatch[1])
      : (currentRisk !== undefined ? Math.round(currentRisk * 0.4) : undefined);

    const improvement = (currentRisk !== undefined && improvedRisk !== undefined)
      ? `${currentRisk - improvedRisk} pts`
      : '—';

    return { currentRisk, improvedRisk, improvement };
  };

  // Extract governance framework
  const extractGovernance = (text: string): {
    councilFrequency: string;
    decisionThreshold: string;
    vetoPower: string;
    triggers: string[];
  } => {
    const councilMatch = text.match(/council[^,.\n]*(?:meet|frequency)[:\s]+([^\n,]+)/i) ||
                        text.match(/(quarterly|monthly|annually|bi-annually)\s*(?:meeting|council)/i);
    const councilFrequency = councilMatch ? councilMatch[1].trim() : 'Quarterly';

    const thresholdMatch = text.match(/(?:threshold|majority|consensus)[:\s]+([^\n,]+)/i);
    const decisionThreshold = thresholdMatch ? thresholdMatch[1].trim() : '75% consensus required';

    const vetoMatch = text.match(/veto[:\s]+([^\n,]+)/i);
    const vetoPower = vetoMatch ? vetoMatch[1].trim() : 'Principal retains veto';

    const triggers: string[] = [];
    if (text.match(/death|incapacity/i)) triggers.push('Death/Incapacity');
    if (text.match(/retir|age\s*\d+/i)) triggers.push('Retirement');
    if (text.match(/divorce|separation/i)) triggers.push('Divorce');
    if (triggers.length === 0) triggers.push('Age 65', 'Incapacity', 'Death');

    return { councilFrequency, decisionThreshold, vetoPower, triggers };
  };

  // Extract education plan
  const extractEducationPlan = (text: string): {
    gen2Actions: string[];
    gen3Actions: string[];
  } => {
    const gen2Actions: string[] = [];
    const gen3Actions: string[] = [];

    const gen2Section = text.match(/(?:G2|Generation\s*2)[:\s]*([\s\S]*?)(?:G3|Generation\s*3|$)/i);
    if (gen2Section) {
      const bullets = gen2Section[1].match(/[•\-✓]\s*([^\n]+)/g);
      if (bullets) {
        bullets.slice(0, 4).forEach(b => gen2Actions.push(b.replace(/^[•\-✓]\s*/, '')));
      }
    }

    const gen3Section = text.match(/(?:G3|Generation\s*3)[:\s]*([\s\S]*?)(?:G4|$)/i);
    if (gen3Section) {
      const bullets = gen3Section[1].match(/[•\-✓]\s*([^\n]+)/g);
      if (bullets) {
        bullets.slice(0, 4).forEach(b => gen3Actions.push(b.replace(/^[•\-✓]\s*/, '')));
      }
    }

    if (gen2Actions.length === 0) {
      gen2Actions.push('Formal board seat on family holdings', 'Quarterly financial review participation', 'Investment committee membership');
    }
    if (gen3Actions.length === 0) {
      gen3Actions.push('Financial literacy curriculum (age 12+)', 'Trust education sessions', 'Gradual responsibility exposure');
    }

    return { gen2Actions, gen3Actions };
  };

  // Extract recommended structure
  const extractRecommendedStructure = (text: string): {
    type: string;
    benefits: string[];
    setupCost: string;
    annualCost: string;
    timeline: string;
    protection: 'HIGH' | 'MODERATE' | 'LOW';
  } => {
    const typeMatch = text.match(/(?:recommend|structure)[:\s]*([A-Z][^.\n]+(?:Trust|LLC|Foundation|Office))/i) ||
                     text.match(/(Family\s*(?:Trust|Office|LLC|Foundation)[^.\n]*)/i);
    const type = typeMatch ? typeMatch[1].trim() : 'Family Trust with Governance Charter';

    const benefits: string[] = [];
    if (text.match(/asset\s*protection/i)) benefits.push('Asset Protection');
    if (text.match(/tax\s*(?:efficient|benefit)/i)) benefits.push('Tax Efficiency');
    if (text.match(/succession|transfer/i)) benefits.push('Smooth Succession');
    if (text.match(/liability|protect/i)) benefits.push('Liability Shield');
    if (benefits.length === 0) benefits.push('Asset Protection', 'Tax Efficiency', 'Succession Planning');

    const setupMatch = text.match(/setup[^$]*\$?([\d,]+[KM]?)/i);
    const setupCost = setupMatch ? `$${setupMatch[1]}` : '$15-25K';

    const annualMatch = text.match(/annual[^$]*\$?([\d,]+[KM]?)/i);
    const annualCost = annualMatch ? `$${annualMatch[1]}` : '$5-10K';

    const timelineMatch = text.match(/timeline[:\s]+([^\n,]+)/i) ||
                         text.match(/(\d+[-–]\d+\s*(?:months|weeks))/i);
    const timeline = timelineMatch ? timelineMatch[1].trim() : '60-90 days';

    const protectionLevel = text.match(/high\s*protection/i) ? 'HIGH' :
                           text.match(/low\s*protection/i) ? 'LOW' : 'MODERATE';

    return {
      type,
      benefits,
      setupCost,
      annualCost,
      timeline,
      protection: protectionLevel as 'HIGH' | 'MODERATE' | 'LOW'
    };
  };

  // Premium Narrative Fallback with VISUAL dashboard - primary colors only
  if (!hasLegacyStructuredData && hasNarrativeAnalysis) {
    const cleanedAnalysis = filterJsonFromMarkdown(rawAnalysis);
    const keyMetrics = extractWealthMetrics(cleanedAnalysis);
    const thirdGenRisk = extractThirdGenRisk(cleanedAnalysis);
    const governance = extractGovernance(cleanedAnalysis);
    const educationPlan = extractEducationPlan(cleanedAnalysis);
    const recommendedStructure = extractRecommendedStructure(cleanedAnalysis);

    return (
      <div ref={sectionRef}>
        {/* Premium Header */}
        <motion.div
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2 sm:mb-3">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
              HEIR MANAGEMENT & SUCCESSION
            </h2>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              3rd Gen Protection
            </span>
          </div>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
          <p className="text-sm text-muted-foreground mt-3">
            Multi-generational wealth preservation with structured governance
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Key Wealth Metrics Grid */}
          {keyMetrics.length > 0 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="rounded-xl p-5 text-center bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{metric.label}</p>
                  <p className="text-xl font-bold text-primary">{metric.value}</p>
                  {metric.subtext && <p className="text-[10px] text-muted-foreground">{metric.subtext}</p>}
                </div>
              ))}
            </motion.div>
          )}

          {/* Third Generation Risk Card */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Third Generation Risk Assessment
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Risk Gauge */}
              {thirdGenRisk.currentRisk !== undefined && thirdGenRisk.improvedRisk !== undefined && (
                <RiskGauge
                  current={thirdGenRisk.currentRisk}
                  improved={thirdGenRisk.improvedRisk}
                  label="Probability of Wealth Loss"
                />
              )}

              {/* Risk Metrics */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Current Risk</p>
                    <p className="text-xl font-bold text-foreground">{thirdGenRisk.currentRisk}%</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">With Structure</p>
                    <p className="text-xl font-bold text-primary">{thirdGenRisk.improvedRisk}%</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Improvement</p>
                    <p className="text-xl font-bold text-primary">{thirdGenRisk.improvement}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommended Structure Card */}
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Recommended Structure
                </h3>
              </div>
              <ProtectionBadge level={recommendedStructure.protection} />
            </div>

            <div className="mb-5">
              <p className="text-lg font-bold text-foreground mb-3">{recommendedStructure.type}</p>
              <div className="flex flex-wrap gap-2">
                {recommendedStructure.benefits.map((benefit, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-card rounded-lg text-xs text-muted-foreground border border-border">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Setup Cost</p>
                <p className="text-sm font-bold text-foreground">{recommendedStructure.setupCost}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Annual Cost</p>
                <p className="text-sm font-bold text-foreground">{recommendedStructure.annualCost}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Timeline</p>
                <p className="text-sm font-bold text-foreground">{recommendedStructure.timeline}</p>
              </div>
            </div>
          </motion.div>

          {/* Governance Framework */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Governance Framework
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Family Council</p>
                <p className="text-sm font-bold text-foreground">{governance.councilFrequency}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Decision Threshold</p>
                <p className="text-sm font-bold text-foreground">{governance.decisionThreshold}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Veto Power</p>
                <p className="text-sm font-bold text-foreground">{governance.vetoPower}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Succession Triggers</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {governance.triggers.map((trigger, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Heir Education Plan */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Heir Education Plan
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Generation 2 */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    G2
                  </div>
                  <p className="text-sm font-bold text-foreground">Generation 2 (Current Heirs)</p>
                </div>
                <div className="space-y-2">
                  {educationPlan.gen2Actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{parseMarkdownBold(action)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generation 3 */}
              <div className="bg-muted/30 border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-muted-foreground text-background flex items-center justify-center text-xs font-bold">
                    G3
                  </div>
                  <p className="text-sm font-bold text-foreground">Generation 3 (Grandchildren)</p>
                </div>
                <div className="space-y-2">
                  {educationPlan.gen3Actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{parseMarkdownBold(action)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-8"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Succession Framework + Family Office Best Practices
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // LEGACY: STRUCTURED DATA RENDER (old format)
  // ============================================================================
  if (!hasLegacyStructuredData) {
    return null;
  }

  const typedData = data as HeirManagementData;
  const currentRiskPercent = typedData.third_generation_risk!.current_probability_of_loss * 100;
  const improvedRiskPercent = typedData.third_generation_risk!.with_structure_probability * 100;

  return (
    <div ref={sectionRef}>
      {/* Premium Header */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground tracking-wide">
            HEIR MANAGEMENT & SUCCESSION
          </h2>
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
            3rd Gen Protection
          </span>
        </div>
        <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/30" />
        <p className="text-sm text-muted-foreground mt-3">
          Multi-generational wealth preservation with structured governance
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Third Generation Risk Card */}
        <motion.div
          className="bg-card border border-border rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Third Generation Risk Assessment
            </h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <RiskGauge
              current={currentRiskPercent}
              improved={improvedRiskPercent}
              label="Probability of Wealth Loss"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Current Risk</p>
                  <p className="text-xl font-bold text-foreground">{formatPercentage(typedData.third_generation_risk!.current_probability_of_loss)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">With Structure</p>
                  <p className="text-xl font-bold text-primary">{formatPercentage(typedData.third_generation_risk!.with_structure_probability)}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/30">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Improvement</p>
                  <p className="text-xl font-bold text-primary">{typedData.third_generation_risk!.improvement}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Heir Cards Grid */}
        {typedData.heirs && typedData.heirs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Heir Assessment
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {typedData.heirs.map((heir, index) => (
                <HeirCard key={heir.name} heir={heir} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommended Structure Card */}
        {typedData.recommended_structure && (
          <motion.div
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Recommended Structure
                </h3>
              </div>
              <ProtectionBadge level={typedData.recommended_structure.third_gen_protection} />
            </div>

            <div className="mb-5">
              <p className="text-lg font-bold text-foreground mb-3">{typedData.recommended_structure.type}</p>
              <div className="flex flex-wrap gap-2">
                {typedData.recommended_structure.benefits.map((benefit, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-card rounded-lg text-xs text-muted-foreground border border-border">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Setup Cost</p>
                <p className="text-sm font-bold text-foreground">{typedData.recommended_structure.setup_cost}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Annual Cost</p>
                <p className="text-sm font-bold text-foreground">{typedData.recommended_structure.annual_cost}</p>
              </div>
              <div className="bg-card rounded-lg p-4 text-center border border-border">
                <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Timeline</p>
                <p className="text-sm font-bold text-foreground">{typedData.recommended_structure.timeline}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Governance Framework */}
        {typedData.governance_framework && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Scale className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Governance Framework
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Family Council</p>
                <p className="text-sm font-bold text-foreground">{typedData.governance_framework.family_council_frequency}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Decision Threshold</p>
                <p className="text-sm font-bold text-foreground">{typedData.governance_framework.decision_threshold}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Veto Power</p>
                <p className="text-sm font-bold text-foreground">{typedData.governance_framework.veto_power}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Succession Triggers</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {typedData.governance_framework.succession_triggers.map((trigger, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heir Education Plan */}
        {typedData.heir_education_plan && (
          <motion.div
            className="bg-card border border-border rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Heir Education Plan
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Generation 2 */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    G2
                  </div>
                  <p className="text-sm font-bold text-foreground">Generation 2 (Current Heirs)</p>
                </div>
                <div className="space-y-2">
                  {typedData.heir_education_plan.gen_2_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{parseMarkdownBold(action)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generation 3 */}
              <div className="bg-muted/30 border border-border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-muted-foreground text-background flex items-center justify-center text-xs font-bold">
                    G3
                  </div>
                  <p className="text-sm font-bold text-foreground">Generation 3 (Grandchildren)</p>
                </div>
                <div className="space-y-2">
                  {typedData.heir_education_plan.gen_3_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{parseMarkdownBold(action)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] text-muted-foreground">
            Grounded in HNWI Chronicles KG Succession Framework + Family Office Best Practices
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeirManagementSection;
