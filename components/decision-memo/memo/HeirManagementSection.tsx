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
  StructureSpecificProvisions,
  EstateTaxByHeirType,
  formatPercentage,
  formatCurrency
} from '@/lib/decision-memo/sfo-expert-types';
import type { HeirManagementData as PdfHeirManagementData } from '@/lib/pdf/pdf-types';

interface HeirManagementSectionProps {
  data?: HeirManagementData | PdfHeirManagementData | Record<string, never>;
  rawAnalysis?: string;
}

// Helper function to parse markdown bold (**text**) and render as bold spans
function parseMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, index) => {
    // Odd indices are the bold parts (captured groups)
    if (index % 2 === 1) {
      return <span key={index} className="font-medium text-foreground">{part}</span>;
    }
    return part;
  });
}

// Format large currency values safely for partial report payloads.
function formatLargeCurrency(amount?: number | null): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return 'N/A';
  }

  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function titleCaseLabel(value?: string | null): string {
  if (!value) return '';
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

// Urgency color based on mitigation timeline days
function getUrgencyColor(days: number | undefined): string {
  if (days === undefined) return 'text-muted-foreground/60';
  if (days <= 45) return 'text-red-500/80';      // Urgent - needs immediate attention
  if (days <= 60) return 'text-amber-500/80';   // Moderate urgency
  return 'text-emerald-500/80';                     // Standard timeline
}

// Urgency badge styling based on days
function getUrgencyBadgeStyle(days: number | undefined): string {
  if (days === undefined) return 'border-border/20 text-muted-foreground/80';
  if (days <= 45) return 'border-red-500/20 text-red-500/80';      // Urgent
  if (days <= 60) return 'border-amber-500/20 text-amber-500/80';  // Moderate
  return 'border-emerald-500/20 text-emerald-500/80';                 // Standard
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
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs tracking-[0.15em] uppercase font-medium ${isActive
      ? 'bg-gold/10 text-gold/80 border border-gold/30'
      : 'border border-border/20 text-muted-foreground/60'
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

  return (
    <span className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
      {(normalized * 100).toFixed(0)}% Preserved
    </span>
  );
}

// Risk gauge component (semi-circular) - using gold accent
// Arc fills clockwise: gold = improved risk (kept), grey gap = reduction achieved
function RiskGauge({ current, improved, label }: { current: number; improved: number; label: string }) {
  const reduction = current - improved;
  const cx = 80;
  const cy = 70;
  const arcR = 65;
  const sw = 10;
  const arcHalfC = Math.PI * arcR;
  const arcCurrentLen = arcHalfC * current / 100;
  const arcImprovedLen = arcHalfC * improved / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-[120px]">
        <svg viewBox="0 0 160 90" className="w-full h-full">
          {/* Background arc (full track) */}
          <path d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${cy}`} fill="none" stroke="currentColor" strokeWidth={sw} className="text-border/20" />
          {/* Current risk arc (grey -- shows total risk zone) */}
          <path d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${cy}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray={`${arcCurrentLen} ${arcHalfC}`} strokeLinecap="round" className="text-muted-foreground/20" />
          {/* Improved risk arc (gold -- shows remaining risk after structure) */}
          <path d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${cx + arcR} ${cy}`} fill="none" stroke="currentColor" strokeWidth={sw} strokeDasharray={`${arcImprovedLen} ${arcHalfC}`} strokeLinecap="round" className="text-gold/70" />
          {/* Current % -- top line inside arc */}
          <text x={cx} y={cy - 26} textAnchor="middle" className="fill-foreground" style={{ fontSize: '22px', fontWeight: 400, fontFamily: 'monospace' }}>{Math.round(current)}%</text>
          {/* Arrow + Improved % -- second line inside arc */}
          <text x={cx} y={cy - 6} textAnchor="middle">
            <tspan className="fill-muted-foreground/60" style={{ fontSize: '12px' }}>→ </tspan>
            <tspan className="fill-gold/80" style={{ fontSize: '17px', fontWeight: 400, fontFamily: 'monospace' }}>{Math.round(improved)}%</tspan>
          </text>
        </svg>
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-medium -mt-3">{label}</p>
      <p className="text-sm font-medium text-gold/80">↓ {Math.round(reduction)} pts</p>
    </div>
  );
}

// Involvement level indicator
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
          <div key={i} className={`w-1.5 h-4 rounded-sm ${i <= bars ? 'bg-gold/60' : 'bg-border/20'}`} />
        ))}
      </div>
      <span className="text-xs font-normal text-muted-foreground/60">{label}</span>
    </div>
  );
}

// Readiness badge
function ReadinessBadge({ level }: { level: ReadinessLevel }) {
  const config: Record<ReadinessLevel, { border: string; text: string; icon: React.ReactNode }> = {
    HIGH: { border: 'border-gold/20', text: 'text-gold/80', icon: <UserCheck className="w-3 h-3" /> },
    MODERATE: { border: 'border-border/20', text: 'text-muted-foreground/80', icon: <Scale className="w-3 h-3" /> },
    LOW: { border: 'border-amber-500/20', text: 'text-amber-500/80', icon: <AlertTriangle className="w-3 h-3" /> }
  };

  const { border, text, icon } = config[level] || config.MODERATE;

  return (
    <span className={`inline-flex items-center gap-1 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${border} ${text}`}>
      {icon}
      {level}
    </span>
  );
}

// Legacy Heir card component
function HeirCard({ heir, index }: { heir: NonNullable<HeirManagementData['heirs']>[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border/20 bg-card/50 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h4 className="text-base font-normal text-foreground">{heir.name}</h4>
          <p className="text-sm text-muted-foreground/60 font-normal">{heir.role}</p>
        </div>
        <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${
          heir.risk_level === 'HIGH' ? 'border-red-500/20 text-red-500/80' :
          heir.risk_level === 'MEDIUM' ? 'border-amber-500/20 text-amber-500/80' :
            'border-border/20 text-muted-foreground/80'
        }`}>
          {heir.risk_level} RISK
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Involvement</p>
          <InvolvementIndicator level={heir.involvement_level} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Wealth Readiness</p>
          <ReadinessBadge level={heir.wealth_readiness} />
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="pt-4">
        <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Recommended Actions</p>
        <div className="space-y-2">
          {heir.recommended_actions.slice(0, 3).map((action, i) => (
            <div key={i} className="flex items-start gap-2">
              <ArrowRight className="w-3 h-3 text-gold/70 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground/60 font-normal">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HeirSpecificReadCard({
  item,
  index,
}: {
  item: NonNullable<HeirManagementData['heir_specific_read']>[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border/20 bg-card/50 p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base font-normal text-foreground">{item.name}</h4>
          {item.status ? (
            <p className="text-sm text-muted-foreground/60 font-normal">{item.status}</p>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
          <Scale className="w-3 h-3" />
          House Read
        </span>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
          <p className="text-sm text-foreground leading-loose sm:leading-relaxed">
            {item.headline}
          </p>
        </div>

        <div className="rounded-xl border border-border/20 bg-background/40 p-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-gold/70 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground/75 leading-loose sm:leading-relaxed">
              {item.detail}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// NEW: Heir Allocation Card
function HeirAllocationCard({
  allocation,
  index,
  fallbackStructure,
  fallbackTiming,
  totalAssetValue,
}: {
  allocation: HeirAllocation;
  index: number;
  fallbackStructure?: string;
  fallbackTiming?: string;
  totalAssetValue?: number;
}) {
  const relationshipLabel = titleCaseLabel(allocation.relationship);
  const ageLabel = typeof allocation.age === 'number' ? `Age ${allocation.age}` : '';
  const metaLine = [relationshipLabel, ageLabel].filter(Boolean).join(' · ');
  const allocationValue =
    toFiniteNumber(allocation.allocation_value) ??
    (toFiniteNumber(totalAssetValue) !== undefined && typeof allocation.allocation_pct === 'number'
      ? toFiniteNumber(totalAssetValue)! * allocation.allocation_pct
      : undefined);
  const structureText = allocation.recommended_structure || fallbackStructure;
  const timingText = allocation.timing || fallbackTiming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-border/20 bg-card/50 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h4 className="text-base font-normal text-foreground">{allocation.name}</h4>
          <p className="text-sm text-muted-foreground/60 font-normal">
            {metaLine || 'Allocation under route governance'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold tabular-nums tracking-tight text-gold/80">{(allocation.allocation_pct * 100).toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground/60 font-normal">{formatLargeCurrency(allocationValue)}</p>
        </div>
      </div>

      {/* Structure Info */}
      {structureText && (
        <div className="rounded-xl border border-border/20 bg-card/50 p-4 mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Structure</p>
          <p className="text-sm font-normal text-foreground">{structureText}</p>
        </div>
      )}

      {/* Timing */}
      {timingText && (
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Timing</p>
          <p className="text-xs text-muted-foreground/60 font-normal">{timingText}</p>
        </div>
      )}

      {/* Special Considerations */}
      {allocation.special_considerations && allocation.special_considerations.length > 0 && (
        <div className="pt-4">
          <div className="h-px bg-gradient-to-r from-border/30 via-border/10 to-transparent mb-4" />
          <div className="space-y-2">
            {allocation.special_considerations.map((consideration, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-gold/70 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground/60 font-normal">{consideration}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Protection level badge
function ProtectionBadge({ level }: { level: ProtectionLevel }) {
  const config: Record<ProtectionLevel, { border: string; text: string; label: string }> = {
    HIGH: { border: 'border-gold/20', text: 'text-gold/80', label: 'HIGH PROTECTION' },
    MODERATE: { border: 'border-border/20', text: 'text-muted-foreground/80', label: 'MODERATE' },
    LOW: { border: 'border-border/20', text: 'text-muted-foreground/60', label: 'LOW' }
  };

  const { border, text, label } = config[level] || config.MODERATE;

  return (
    <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${border} ${text}`}>
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

  // Check for NEW data structure (G1->G2->G3 transfer flow)
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
  // NEW: RENDER G1->G2->G3 TRANSFER FLOW LAYOUT
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
    const beneficiaryMapAuthority = (typedData as any).beneficiary_map_authority;
    const beneficiaryMapNote = (typedData as any).beneficiary_map_note;
    const successionLockItems = Array.isArray((typedData as any).succession_lock_items)
      ? (typedData as any).succession_lock_items.filter(Boolean)
      : [];
    const governanceUpliftClaimed = Boolean(
      (typedData as any).governance_uplift_claimed ??
      (withStructure && (
        (toFiniteNumber(withStructure.wealth_preserved) || 0) > 0 ||
        (
          toFiniteNumber(withStructure.net_to_g3_with_structure) !== undefined &&
          toFiniteNumber(g2ToG3?.net_to_g3_without_structure) !== undefined &&
          toFiniteNumber(withStructure.net_to_g3_with_structure) !== toFiniteNumber(g2ToG3?.net_to_g3_without_structure)
        )
      ))
    );
    const governanceUpliftNote =
      (typedData as any).governance_uplift_note ||
      'No additional governance uplift is being credited yet; this route only gets stronger once the succession rail is evidenced and documented.';
    const authoritativeHeirAllocations =
      beneficiaryMapAuthority === 'authoritative'
        ? heirAllocations
        : [];
    const heirSpecificRead = Array.isArray((typedData as any).heir_specific_read)
      ? ((typedData as any).heir_specific_read as NonNullable<HeirManagementData['heir_specific_read']>)
      : [];

    // Hughes Framework: Third Generation Problem + Governance Insurance
    const hughesFramework = typedData.hughes_framework;
    const thirdGenProblem = hughesFramework?.third_generation_problem ?? typedData.third_generation_problem;
    const humanCapitalProvisions = hughesFramework?.human_capital_provisions ?? typedData.human_capital_provisions;
    const governanceInsurance = hughesFramework?.governance_insurance ?? typedData.governance_insurance;
    const structureProvisions = Array.isArray(typedData.structure_specific_provisions)
      ? typedData.structure_specific_provisions
      : typedData.structure_specific_provisions
        ? [typedData.structure_specific_provisions]
        : [];
    const governanceFramework = typedData.governance_framework;
    const heirEducationPlan = typedData.heir_education_plan;
    const hasGovernanceFramework = Boolean(
      governanceFramework?.family_council_frequency ||
      governanceFramework?.decision_threshold ||
      governanceFramework?.veto_power ||
      (governanceFramework?.succession_triggers || []).length
    );
    const hasHeirEducationPlan = Boolean(
      (heirEducationPlan?.gen_2_actions || []).length ||
      (heirEducationPlan?.gen_3_actions || []).length
    );

    // NEW: Granular Estate Tax by Heir Type (from HNWI Chronicles KG)
    const estateTaxByHeirType = typedData.estate_tax_by_heir_type;

    // Preservation metrics - prefer explicit backend values
    const preservationWithoutStructure = thirdGenProblem?.preservation_without_structure_pct;
    const preservationWithStructure = thirdGenProblem?.preservation_with_structure_pct;

    // Loss risk metrics - use explicit backend values (jurisdiction-specific)
    const thirdGenCurrentRisk = thirdGenProblem?.loss_without_structure_pct ??
      (preservationWithoutStructure !== undefined ? (100 - preservationWithoutStructure) : undefined);
    const thirdGenImprovedRisk = thirdGenProblem?.loss_with_structure_pct ??
      (preservationWithStructure !== undefined ? (100 - preservationWithStructure) : undefined);
    const routeControlScore = toFiniteNumber(g1.route_control_score);
    const g1RetentionScore = toFiniteNumber(g1.retention_score);
    const g2RetentionScore = toFiniteNumber(g1ToG2?.retention_score);
    const g3RetentionWithoutStructure = toFiniteNumber(g2ToG3?.retention_score_without_structure);
    const g3RetentionWithStructure = toFiniteNumber(withStructure?.retention_score);
    const forcedSaleHaircut = toFiniteNumber(g2ToG3?.forced_sale_haircut_pct);
    const successionDollarsAtRisk =
      toFiniteNumber(topRisk?.dollars_at_risk) ??
      toFiniteNumber(g1ToG2?.estate_tax_hit) ??
      toFiniteNumber(g1?.unplanned_loss);
    const g3Status =
      titleCaseLabel((hughesFramework?.components as any)?.g3?.status) ||
      titleCaseLabel(withStructure?.preservation_rating) ||
      (g3RetentionWithStructure !== undefined
        ? g3RetentionWithStructure >= 75
          ? 'Durable'
          : g3RetentionWithStructure >= 60
            ? 'Guarded'
            : 'Fragile'
        : '');
    const hasThirdGenerationRiskModel = thirdGenCurrentRisk !== undefined && thirdGenImprovedRisk !== undefined;
    const hasRouteSuccessionRead =
      routeControlScore !== undefined ||
      forcedSaleHaircut !== undefined ||
      successionDollarsAtRisk !== undefined ||
      Boolean(g3Status);

    // Improvement points (backend-calculated)
    const improvementPts = thirdGenProblem?.improvement_pts;

    // Pre-formatted display strings from backend
    const displayLossArrow = thirdGenProblem?.display_loss_arrow;
    const displayPreservationArrow = thirdGenProblem?.display_preservation_arrow;
    const derivedThirdGenHeadline =
      thirdGenProblem?.headline ||
      (displayPreservationArrow
        ? `Modeled retained value at G3 improves ${displayPreservationArrow} only if succession, beneficiary routing, and governance are locked before close.`
        : undefined) ||
      (displayLossArrow
        ? `Modeled third-generation loss risk remains ${displayLossArrow} until the house converts the asset from a purchase into a governed continuity route.`
        : undefined);
    const derivedThirdGenStatistic =
      thirdGenProblem?.statistic ||
      (displayLossArrow
        ? `Third-generation loss risk moves ${displayLossArrow} once the house locks succession and governance before close.`
        : undefined);
    const derivedThirdGenCauses =
      Array.isArray(thirdGenProblem?.causes) && thirdGenProblem.causes.length
        ? thirdGenProblem.causes
        : [
            'Succession rail left open until or after closing',
            'Beneficiary map not fixed before expectations harden',
            'Governance duties left to post-close cleanup',
          ];
    const derivedThirdGenRiskFactors =
      Array.isArray(thirdGenProblem?.risk_factors) && thirdGenProblem.risk_factors.length
        ? thirdGenProblem.risk_factors
        : [
            'UK estate-tax exposure still depends on named residence and allowance confirmation.',
            'Heirs do not yet inherit a clean governed seat until succession documents and veto logic are signed.',
            'Banking, title, and succession still live inside one closing window, so route quality is what the family is really inheriting.',
          ];
    const rawContinuityProvisions = (typedData as any).continuity_provisions || {};
    const continuityPreCloseLocks = Array.isArray(rawContinuityProvisions.pre_close_locks) && rawContinuityProvisions.pre_close_locks.length
      ? rawContinuityProvisions.pre_close_locks
      : successionLockItems;
    const continuityHumanCapital = Array.isArray(rawContinuityProvisions.human_capital) && rawContinuityProvisions.human_capital.length
      ? rawContinuityProvisions.human_capital
      : (humanCapitalProvisions || []);
    const continuityGovernanceInsurance =
      Array.isArray(rawContinuityProvisions.governance_insurance) && rawContinuityProvisions.governance_insurance.length
        ? rawContinuityProvisions.governance_insurance
        : (governanceInsurance || []);
    const continuityStructureSpecific =
      Array.isArray(rawContinuityProvisions.structure_specific) && rawContinuityProvisions.structure_specific.length
        ? rawContinuityProvisions.structure_specific
        : structureProvisions;
    const continuityBeneficiaryDiscipline =
      typeof rawContinuityProvisions.beneficiary_discipline === 'string' && rawContinuityProvisions.beneficiary_discipline.trim()
        ? rawContinuityProvisions.beneficiary_discipline.trim()
        : beneficiaryMapNote;
    const continuityHeadline =
      typeof rawContinuityProvisions.headline === 'string' && rawContinuityProvisions.headline.trim()
        ? rawContinuityProvisions.headline.trim()
        : 'Continuity survives only when succession, beneficiary routing, banking authority, and heir preparation are locked before closing.';
    const continuityNextAction =
      typeof rawContinuityProvisions.next_action === 'string' && rawContinuityProvisions.next_action.trim()
        ? rawContinuityProvisions.next_action.trim()
        : nextAction;

    return (
      <div ref={sectionRef}>
        {/* Premium Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Heir Management & Succession
          </h2>
          <div className="h-px bg-border" />
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          {/* Third Generation Risk Assessment */}
          {withStructure && hasThirdGenerationRiskModel && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Third Generation Risk Assessment
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">
                  {thirdGenCurrentRisk !== undefined && thirdGenImprovedRisk !== undefined && (
                    <RiskGauge
                      current={thirdGenCurrentRisk}
                      improved={thirdGenImprovedRisk}
                      label="Probability of Wealth Loss"
                    />
                  )}

                  <div className="flex-1 w-full">
                    {/* Loss Risk Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Loss Risk</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{thirdGenCurrentRisk !== undefined ? `${thirdGenCurrentRisk}%` : '\u2014'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">With Structure</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{thirdGenImprovedRisk !== undefined ? `${thirdGenImprovedRisk}%` : '\u2014'}</p>
                      </div>
                      <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Risk Reduction</p>
                        {displayLossArrow ? (
                          <p className="text-lg font-medium text-gold/80">{displayLossArrow}</p>
                        ) : improvementPts !== undefined ? (
                          <p className="text-xl font-medium text-gold/80">↓{improvementPts} pts</p>
                        ) : thirdGenCurrentRisk !== undefined && thirdGenImprovedRisk !== undefined ? (
                          <p className="text-xl font-medium text-gold/80">↓{thirdGenCurrentRisk - thirdGenImprovedRisk} pts</p>
                        ) : (
                          <p className="text-xl font-bold text-muted-foreground/60">\u2014</p>
                        )}
                      </div>
                    </div>

                    {/* Preservation Metrics - Show when data available */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center rounded-xl border border-border/20 bg-card/50 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Preservation</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-muted-foreground/60">{preservationWithoutStructure !== undefined ? `${preservationWithoutStructure}%` : '\u2014'}</p>
                      </div>
                      <div className="text-center rounded-xl border border-border/20 bg-card/50 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">With Structure</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{preservationWithStructure !== undefined ? `${preservationWithStructure}%` : '\u2014'}</p>
                      </div>
                      <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Protection Gain</p>
                        {displayPreservationArrow ? (
                          <p className="text-lg font-medium text-gold/80">{displayPreservationArrow}</p>
                        ) : preservationWithStructure !== undefined && preservationWithoutStructure !== undefined ? (
                          <p className="text-xl font-medium text-gold/80">↑{preservationWithStructure - preservationWithoutStructure} pts</p>
                        ) : (
                          <p className="text-xl font-bold text-muted-foreground/60">\u2014</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {withStructure && !hasThirdGenerationRiskModel && hasRouteSuccessionRead && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Third Generation Route Read
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Route Control</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">
                      {routeControlScore !== undefined ? `${routeControlScore.toFixed(0)} / 100` : '\u2014'}
                    </p>
                  </div>
                  <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Forced-Sale Pressure</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">
                      {forcedSaleHaircut !== undefined ? `${forcedSaleHaircut.toFixed(0)}%` : '\u2014'}
                    </p>
                  </div>
                  <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Dollars At Risk</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">
                      {successionDollarsAtRisk !== undefined ? formatLargeCurrency(successionDollarsAtRisk) : '\u2014'}
                    </p>
                  </div>
                  <div className="text-center rounded-xl border border-border/20 bg-card/50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">G3 Durability Read</p>
                    <p className="text-xl font-medium tracking-tight text-foreground">
                      {g3Status || '\u2014'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Why This Matters</p>
                  <p className="text-sm text-foreground leading-loose sm:leading-relaxed">
                    {topRisk?.trigger || withStructure?.recommended_structure || nextAction || 'Succession discipline must lock before capital moves.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recommended Structure */}
          {withStructure && (
            <motion.div
              className="relative rounded-xl border border-gold/20 bg-gold/[0.03] p-6 sm:p-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium">
                  Recommended Structure
                </p>
                {preservationWithStructure !== undefined && (
                  <PreservationIndicator percentage={preservationWithStructure} />
                )}
              </div>
              <p className="text-xl font-normal text-foreground tracking-tight">{withStructure.recommended_structure}</p>
            </motion.div>
          )}

          {/* G1 -> G2 -> G3 Wealth Transfer Flow */}
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-8">
                G1 → G2 → G3 Wealth Transfer
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* G1 Position */}
                <div className="relative rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <GenerationBadge gen="G1" isActive />
                    <div>
                      <p className="text-sm font-normal text-foreground">Principal</p>
                      <p className="text-sm text-muted-foreground/60 font-normal">Today</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Asset Value</p>
                      <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{formatLargeCurrency(g1.asset_value)}</p>
                    </div>
                    {g1.estate_tax_rate > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Estate Tax Rate</p>
                        <p className="text-base font-medium tabular-nums text-foreground">{(g1.estate_tax_rate * 100).toFixed(0)}%</p>
                      </div>
                    )}
                    {g1RetentionScore !== undefined && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Retained Value</p>
                        <p className="text-base font-medium tabular-nums text-gold/80">{g1RetentionScore.toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                  {/* Arrow connector */}
                  <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center">
                    <div className="w-2 h-2 rounded-full bg-gold/40" />
                    <div className="w-3 h-px bg-gold/20" />
                    <ArrowRight className="w-4 h-4 text-gold/70" />
                  </div>
                </div>

                {/* G2 Transfer */}
                {g1ToG2 && (
                  <div className="relative rounded-xl border border-border/20 bg-card/50 p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <GenerationBadge gen="G2" />
                      <div>
                        <p className="text-sm font-normal text-foreground">Children</p>
                        <p className="text-sm text-muted-foreground/60 font-normal">{g1ToG2.years_out} years</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Projected Value</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{formatLargeCurrency(g1ToG2.projected_value)}</p>
                      </div>
                      {g1ToG2.estate_tax_hit > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Tax Hit</p>
                          <p className="text-base font-medium tabular-nums text-muted-foreground/60">-{formatLargeCurrency(g1ToG2.estate_tax_hit)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Net to G2</p>
                        <p className="text-base font-medium tabular-nums text-gold/80">{formatLargeCurrency(g1ToG2.net_to_g2)}</p>
                      </div>
                      {g2RetentionScore !== undefined && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Retained Value</p>
                          <p className="text-base font-medium tabular-nums text-gold/80">{g2RetentionScore.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                    {/* Arrow connector */}
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center">
                      <div className="w-2 h-2 rounded-full bg-gold/40" />
                      <div className="w-3 h-px bg-gold/20" />
                      <ArrowRight className="w-4 h-4 text-gold/70" />
                    </div>
                  </div>
                )}

                {/* G3 Transfer */}
                {g2ToG3 && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <GenerationBadge gen="G3" />
                      <div>
                        <p className="text-sm font-normal text-foreground">Grandchildren</p>
                        <p className="text-sm text-muted-foreground/60 font-normal">{g2ToG3.years_out} years</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Projected Value</p>
                        <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{formatLargeCurrency(g2ToG3.projected_value)}</p>
                      </div>
                      {g2ToG3.estate_tax_hit > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Tax Hit</p>
                          <p className="text-base font-medium tabular-nums text-muted-foreground/60">-{formatLargeCurrency(g2ToG3.estate_tax_hit)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Net to G3</p>
                        <p className="text-base font-medium tabular-nums text-gold/80">{formatLargeCurrency(g2ToG3.net_to_g3_without_structure)}</p>
                      </div>
                      {g3RetentionWithoutStructure !== undefined && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Retained Value</p>
                          <p className="text-base font-medium tabular-nums text-gold/80">{g3RetentionWithoutStructure.toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* With Structure Comparison */}
              {withStructure && governanceUpliftClaimed ? (
                <div className="mt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8" />
                  <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="min-w-[500px]">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Without Structure</p>
                          <p className="text-xl font-bold tabular-nums tracking-tight text-muted-foreground/60">
                            {g2ToG3 ? formatLargeCurrency(g2ToG3.net_to_g3_without_structure) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">With Structure</p>
                          <p className="text-xl font-bold tabular-nums tracking-tight text-gold/80">{formatLargeCurrency(withStructure.net_to_g3_with_structure)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Wealth Preserved</p>
                          <p className={`text-xl font-bold tabular-nums tracking-tight ${withStructure.wealth_preserved >= 0 ? 'text-gold/80' : 'text-muted-foreground/60'}`}>
                            {withStructure.wealth_preserved >= 0 ? '+' : ''}{formatLargeCurrency(withStructure.wealth_preserved)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Governance Uplift</p>
                          <p className="text-xl font-bold tabular-nums tracking-tight text-foreground">
                            {toFiniteNumber(withStructure.preservation_percentage) !== undefined
                              ? `+${toFiniteNumber(withStructure.preservation_percentage)?.toFixed(1)}%`
                              : '\u2014'}
                          </p>
                          {g3RetentionWithStructure !== undefined && (
                            <p className="text-xs text-muted-foreground/60 mt-2">
                              G3 retained value with governance: {g3RetentionWithStructure.toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8" />
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Governance Uplift Read</p>
                    <p className="text-sm text-foreground leading-loose sm:leading-relaxed">
                      {governanceUpliftNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* NEW: Granular Estate Tax by Heir Type */}
          {estateTaxByHeirType && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Destination Estate Tax by Heir Type
                </p>

                {/* Headline */}
                {estateTaxByHeirType.headline && (
                  <div className="mb-6 rounded-xl border border-gold/20 bg-gold/[0.03] p-4">
                    <p className="text-sm font-normal text-foreground">{estateTaxByHeirType.headline}</p>
                  </div>
                )}

                {/* Tax Rates Grid */}
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-[400px]">
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
                      {/* Spouse Rate */}
                      <div className="text-center">
                        <Heart className="w-5 h-5 text-gold/70 mx-auto mb-3" />
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Spouse</p>
                        <p className={`text-xl md:text-2xl font-bold tabular-nums tracking-tight ${estateTaxByHeirType.spouse_rate === 0 ? 'text-emerald-500/80' : 'text-foreground'}`}>
                          {estateTaxByHeirType.spouse_summary || `${(estateTaxByHeirType.spouse_rate * 100).toFixed(0)}%`}
                        </p>
                      </div>

                      {/* Children Rate */}
                      <div className="text-center">
                        <User className="w-5 h-5 text-gold/70 mx-auto mb-3" />
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Children</p>
                        <p className={`text-xl md:text-2xl font-bold tabular-nums tracking-tight ${estateTaxByHeirType.children_rate === 0 ? 'text-emerald-500/80' : estateTaxByHeirType.children_rate > 0.3 ? 'text-amber-500/80' : 'text-foreground'}`}>
                          {estateTaxByHeirType.children_summary || `${(estateTaxByHeirType.children_rate * 100).toFixed(0)}%`}
                        </p>
                      </div>

                      {/* Non-Lineal Rate */}
                      <div className="text-center">
                        <Users className="w-5 h-5 text-muted-foreground/60 mx-auto mb-3" />
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Non-Lineal</p>
                        <p className={`text-xl md:text-2xl font-bold tabular-nums tracking-tight ${estateTaxByHeirType.non_lineal_rate > 0.3 ? 'text-amber-500/80' : 'text-foreground'}`}>
                          {(estateTaxByHeirType.non_lineal_rate * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanatory Note */}
                {estateTaxByHeirType.note && (
                  <div className="text-sm text-muted-foreground/60 font-normal rounded-xl border border-border/20 bg-card/50 p-4">
                    <p>{estateTaxByHeirType.note}</p>
                  </div>
                )}

                {/* Source Attribution */}
                <div className="flex items-center justify-center gap-3 pt-6 mt-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
                  <p className="text-xs text-muted-foreground/60 leading-relaxed">
                    Source: {estateTaxByHeirType.source || 'HNWI Chronicles KG'}
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Heir Allocations */}
          {authoritativeHeirAllocations && authoritativeHeirAllocations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Heir Allocations
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authoritativeHeirAllocations.map((allocation, index) => (
                  <HeirAllocationCard
                    key={allocation.name}
                    allocation={allocation}
                    index={index}
                    fallbackStructure={withStructure?.recommended_structure}
                    fallbackTiming={topRisk?.mitigation_timeline || 'before_close'}
                    totalAssetValue={toFiniteNumber(g1.asset_value)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {heirSpecificRead.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
                    Heir-Specific Legal, Tax, And Education Read
                  </p>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-4xl">
                    This is the family-facing consequence map. It shows what each named heir actually inherits into, what tax and legal drag can sit in front of them, and what the house should teach before expectations harden.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {heirSpecificRead.map((item: NonNullable<HeirManagementData['heir_specific_read']>[number], index: number) => (
                  <HeirSpecificReadCard key={`${item.name}-${index}`} item={item} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Succession Risk */}
          {topRisk && (
            <motion.div
              className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-6 sm:p-8"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium">
                  Top Succession Risk
                </p>
                {/* Urgency Badge */}
                {topRisk.mitigation_timeline_days !== undefined && (
                  <span className={`text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border ${getUrgencyBadgeStyle(topRisk.mitigation_timeline_days)}`}>
                    {topRisk.mitigation_timeline_days <= 45 ? 'URGENT' : topRisk.mitigation_timeline_days <= 60 ? 'MODERATE' : 'STANDARD'}
                  </span>
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                  <p className="text-sm text-foreground font-normal mb-3">{parseMarkdownBold(topRisk.trigger)}</p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">At Risk</p>
                    <p className="text-xl font-bold tabular-nums tracking-tight text-foreground">{formatLargeCurrency(topRisk.dollars_at_risk)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Mitigation</p>
                  <p className="text-sm text-muted-foreground/60 font-normal">{parseMarkdownBold(topRisk.mitigation)}</p>

                  {/* Mitigation Timeline */}
                  {topRisk.mitigation_timeline && (
                    <div className="mt-4 pt-4">
                      <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent mb-4" />
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-2">Timeline</p>
                      <p className={`text-sm font-normal ${getUrgencyColor(topRisk.mitigation_timeline_days)}`}>
                        {topRisk.mitigation_timeline}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Third-Generation Continuity Risk */}
          {(thirdGenProblem || derivedThirdGenHeadline || derivedThirdGenStatistic) && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Third-Generation Continuity Risk
                </p>

                {derivedThirdGenHeadline && (
                  <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5 mb-5">
                    <p className="text-sm font-normal text-foreground leading-loose sm:leading-relaxed">
                      {derivedThirdGenHeadline}
                    </p>
                  </div>
                )}

                {derivedThirdGenStatistic && (
                  <div className="rounded-xl border border-border/20 bg-card/50 p-5 mb-5">
                    <p className="text-xl font-bold text-foreground tracking-tight">{derivedThirdGenStatistic}</p>
                  </div>
                )}

                {derivedThirdGenCauses.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Why This Degrades The House</p>
                    <div className="flex flex-wrap gap-2">
                      {derivedThirdGenCauses.map((cause, i) => (
                        <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/60">
                          {cause}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {derivedThirdGenRiskFactors.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Live Family Consequences</p>
                    <div className="space-y-2">
                      {derivedThirdGenRiskFactors.map((factor, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground/60 font-normal">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {(continuityPreCloseLocks.length > 0 ||
            continuityBeneficiaryDiscipline ||
            continuityHumanCapital.length > 0 ||
            continuityGovernanceInsurance.length > 0 ||
            continuityStructureSpecific.length > 0 ||
            continuityNextAction) && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-2">
                  House Continuity Provisions
                </p>
                <p className="text-sm text-foreground leading-loose sm:leading-relaxed mb-8">
                  {continuityHeadline}
                </p>

                <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6 mb-6">
                  {continuityPreCloseLocks.length > 0 && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">Pre-Close Continuity Locks</p>
                      <div className="space-y-3">
                        {continuityPreCloseLocks.map((item: string, index: number) => (
                          <div key={`${item}-${index}`} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-gold/70 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground leading-loose sm:leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {continuityBeneficiaryDiscipline && (
                    <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">Beneficiary Discipline</p>
                      <p className="text-sm text-foreground leading-loose sm:leading-relaxed">
                        {continuityBeneficiaryDiscipline}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid xl:grid-cols-2 gap-6">
                  {continuityHumanCapital.length > 0 && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">Human Capital Provisions</p>
                      <div className="space-y-4">
                        {continuityHumanCapital.map((provision: HumanCapitalProvision, i: number) => (
                          <div key={i} className="rounded-lg border border-border/15 bg-background/60 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                              <p className="text-sm font-medium text-foreground">{provision.name}</p>
                              {provision.structure_type && (
                                <span className="text-[11px] tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/70">
                                  {provision.structure_type}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground/70 leading-relaxed mb-3">{provision.description}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gold/70" />
                              <span className="text-xs text-gold/80 font-normal">{provision.trigger}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {continuityGovernanceInsurance.length > 0 && (
                    <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-4">Governance Insurance</p>
                      <div className="space-y-4">
                        {continuityGovernanceInsurance.map((provision: GovernanceInsuranceProvision, i: number) => (
                          <div key={i} className="rounded-lg border border-border/15 bg-background/60 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                              <p className="text-sm font-medium text-foreground">{provision.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground/70 leading-relaxed mb-2">{provision.description}</p>
                            <p className="text-xs text-gold/80 leading-relaxed">{provision.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {continuityStructureSpecific.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70">Structure-Specific Provisions</p>
                    {continuityStructureSpecific.map((provisionGroup: StructureSpecificProvisions, groupIndex: number) => (
                      <div key={`${provisionGroup.structure_name}-${groupIndex}`} className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gold/70 flex-shrink-0" />
                            <p className="text-sm font-medium text-foreground">{provisionGroup.structure_name}</p>
                          </div>
                          <span className="text-[11px] tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                            {provisionGroup.jurisdiction}
                          </span>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-5">
                          {provisionGroup.human_capital && provisionGroup.human_capital.length > 0 && (
                            <div className="rounded-lg border border-border/15 bg-background/70 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Human Capital Requirements</p>
                              <div className="space-y-3">
                                {provisionGroup.human_capital.map((provision: HumanCapitalProvision, i: number) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-gold/70 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-foreground">{provision.name}</p>
                                      <p className="text-xs text-muted-foreground/70 leading-relaxed">{provision.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {provisionGroup.governance_insurance && provisionGroup.governance_insurance.length > 0 && (
                            <div className="rounded-lg border border-border/15 bg-background/70 p-4">
                              <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Governance Insurance</p>
                              <div className="space-y-3">
                                {provisionGroup.governance_insurance.map((provision: GovernanceInsuranceProvision, i: number) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <Shield className="w-3.5 h-3.5 text-gold/70 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm text-foreground">{provision.name}</p>
                                      <p className="text-xs text-muted-foreground/70 leading-relaxed">{provision.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {continuityNextAction && (
                  <div className="mt-6 rounded-xl border border-gold/20 bg-background/70 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold/70 mb-3">Next Continuity Action</p>
                    <p className="text-base text-foreground font-normal leading-relaxed">{parseMarkdownBold(continuityNextAction)}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {hasGovernanceFramework && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Governance Framework
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Family Council</p>
                    <p className="text-sm font-normal text-foreground">{governanceFramework?.family_council_frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Decision Threshold</p>
                    <p className="text-sm font-normal text-foreground">{governanceFramework?.decision_threshold}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Veto Power</p>
                    <p className="text-sm font-normal text-foreground">{governanceFramework?.veto_power}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Succession Triggers</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(governanceFramework?.succession_triggers || []).map((trigger: string, i: number) => (
                        <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {hasHeirEducationPlan && (
            <motion.div
              className="relative rounded-2xl border border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                  Heir Education Plan
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <GenerationBadge gen="G2" isActive />
                      <p className="text-sm font-normal text-foreground">Generation 2 (Current Heirs)</p>
                    </div>
                    <div className="space-y-2">
                      {(heirEducationPlan?.gen_2_actions || []).map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-gold/70 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <GenerationBadge gen="G3" />
                      <p className="text-sm font-normal text-foreground">Generation 3 (Grandchildren)</p>
                    </div>
                    <div className="space-y-2">
                      {(heirEducationPlan?.gen_3_actions || []).map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Intelligence Source Footer */}
          <motion.div
            className="flex items-center justify-center gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Grounded in HNWI Chronicles succession, tax, governance, and continuity intelligence
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
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
  const extractThirdGenRisk = (text: string): {
    currentRisk: number | undefined;
    improvedRisk: number | undefined;
    improvement: string;
  } => {
    const riskMatch = text.match(/(?:3rd|third)\s*(?:gen|generation)[^0-9]*(\d+)%/i) ||
      text.match(/probability[^0-9]*(\d+)%/i) ||
      text.match(/risk[^0-9]*(\d+)%/i);
    const currentRisk = riskMatch ? parseInt(riskMatch[1]) : undefined;

    const improvedMatch = text.match(/(?:improved|with\s*structure|reduced)[^0-9]*(\d+)%/i);
    const improvedRisk = improvedMatch
      ? parseInt(improvedMatch[1])
      : (currentRisk !== undefined ? Math.round(currentRisk * 0.4) : undefined);

    const improvement = (currentRisk !== undefined && improvedRisk !== undefined)
      ? `${currentRisk - improvedRisk} pts`
      : '\u2014';

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

  // Premium Narrative Fallback with VISUAL dashboard
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
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
            Heir Management & Succession
          </h2>
          <div className="h-px bg-border" />
        </motion.div>

        <div className="space-y-8 sm:space-y-12">
          {/* Key Wealth Metrics Grid */}
          {keyMetrics.length > 0 && (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">{metric.label}</p>
                  <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{metric.value}</p>
                  {metric.subtext && <p className="text-xs text-muted-foreground/60 font-normal mt-1">{metric.subtext}</p>}
                </div>
              ))}
            </motion.div>
          )}

          {/* Third Generation Risk Card */}
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Third Generation Risk Assessment
              </p>

              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Current Risk</p>
                      <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{thirdGenRisk.currentRisk}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">With Structure</p>
                      <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{thirdGenRisk.improvedRisk}%</p>
                    </div>
                    <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Improvement</p>
                      <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{thirdGenRisk.improvement}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommended Structure Card */}
          <motion.div
            className="rounded-xl border border-gold/20 bg-gold/[0.03] p-6 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium">
                Recommended Structure
              </p>
              <ProtectionBadge level={recommendedStructure.protection} />
            </div>

            <div className="mb-6">
              <p className="text-xl font-normal text-foreground tracking-tight mb-4">{recommendedStructure.type}</p>
              <div className="flex flex-wrap gap-2">
                {recommendedStructure.benefits.map((benefit, i) => (
                  <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/60">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Setup Cost</p>
                <p className="text-base font-medium tabular-nums text-foreground">{recommendedStructure.setupCost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Annual Cost</p>
                <p className="text-base font-medium tabular-nums text-foreground">{recommendedStructure.annualCost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Timeline</p>
                <p className="text-base font-medium tabular-nums text-foreground">{recommendedStructure.timeline}</p>
              </div>
            </div>
          </motion.div>

          {/* Governance Framework */}
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Governance Framework
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Family Council</p>
                  <p className="text-sm font-normal text-foreground">{governance.councilFrequency}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Decision Threshold</p>
                  <p className="text-sm font-normal text-foreground">{governance.decisionThreshold}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Veto Power</p>
                  <p className="text-sm font-normal text-foreground">{governance.vetoPower}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Succession Triggers</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {governance.triggers.map((trigger, i) => (
                      <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Heir Education Plan */}
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Heir Education Plan
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Generation 2 */}
                <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GenerationBadge gen="G2" isActive />
                    <p className="text-sm font-normal text-foreground">Generation 2 (Current Heirs)</p>
                  </div>
                  <div className="space-y-2">
                    {educationPlan.gen2Actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-gold/70 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generation 3 */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GenerationBadge gen="G3" />
                    <p className="text-sm font-normal text-foreground">Generation 3 (Grandchildren)</p>
                  </div>
                  <div className="space-y-2">
                    {educationPlan.gen3Actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-8"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Grounded in HNWI Chronicles succession, tax, governance, and continuity intelligence
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
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
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-3">
          Heir Management & Succession
        </h2>
        <div className="h-px bg-border" />
      </motion.div>

      <div className="space-y-8 sm:space-y-12">
        {/* Third Generation Risk Card */}
        <motion.div
          className="relative rounded-2xl border border-border/30 overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
              Third Generation Risk Assessment
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">
              <RiskGauge
                current={currentRiskPercent}
                improved={improvedRiskPercent}
                label="Probability of Wealth Loss"
              />

              <div className="flex-1 text-center md:text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Current Risk</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-foreground">{formatPercentage(typedData.third_generation_risk!.current_probability_of_loss)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">With Structure</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{formatPercentage(typedData.third_generation_risk!.with_structure_probability)}</p>
                  </div>
                  <div className="text-center rounded-xl border border-gold/20 bg-gold/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">Improvement</p>
                    <p className="text-xl md:text-2xl font-bold tabular-nums tracking-tight text-gold/80">{typedData.third_generation_risk!.improvement}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Heir Cards Grid */}
        {typedData.heirs && typedData.heirs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
              Heir Assessment
            </p>

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
            className="rounded-xl border border-gold/20 bg-gold/[0.03] p-6 sm:p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start justify-between mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium">
                Recommended Structure
              </p>
              <ProtectionBadge level={typedData.recommended_structure.third_gen_protection} />
            </div>

            <div className="mb-6">
              <p className="text-xl font-normal text-foreground tracking-tight mb-4">{typedData.recommended_structure.type}</p>
              <div className="flex flex-wrap gap-2">
                {typedData.recommended_structure.benefits.map((benefit, i) => (
                  <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-border/20 text-muted-foreground/60">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Setup Cost</p>
                <p className="text-base font-medium tabular-nums text-foreground">{typedData.recommended_structure.setup_cost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Annual Cost</p>
                <p className="text-base font-medium tabular-nums text-foreground">{typedData.recommended_structure.annual_cost}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Timeline</p>
                <p className="text-base font-medium tabular-nums text-foreground">{typedData.recommended_structure.timeline}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Governance Framework */}
        {typedData.governance_framework && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Governance Framework
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Family Council</p>
                  <p className="text-sm font-normal text-foreground">{typedData.governance_framework.family_council_frequency}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Decision Threshold</p>
                  <p className="text-sm font-normal text-foreground">{typedData.governance_framework.decision_threshold}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Veto Power</p>
                  <p className="text-sm font-normal text-foreground">{typedData.governance_framework.veto_power}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Succession Triggers</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {typedData.governance_framework.succession_triggers.map((trigger, i) => (
                      <span key={i} className="text-xs tracking-[0.15em] uppercase font-medium rounded-full px-3 py-1 border border-gold/20 text-gold/80">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heir Education Plan */}
        {typedData.heir_education_plan && (
          <motion.div
            className="relative rounded-2xl border border-border/30 overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 sm:px-8 md:px-12 py-10 md:py-12">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70 font-medium mb-6">
                Heir Education Plan
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Generation 2 */}
                <div className="rounded-xl border border-gold/20 bg-gold/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GenerationBadge gen="G2" isActive />
                    <p className="text-sm font-normal text-foreground">Generation 2 (Current Heirs)</p>
                  </div>
                  <div className="space-y-2">
                    {typedData.heir_education_plan.gen_2_actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-gold/70 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generation 3 */}
                <div className="rounded-xl border border-border/20 bg-card/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <GenerationBadge gen="G3" />
                    <p className="text-sm font-normal text-foreground">Generation 3 (Grandchildren)</p>
                  </div>
                  <div className="space-y-2">
                    {typedData.heir_education_plan.gen_3_actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 font-normal">{parseMarkdownBold(action)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Intelligence Source Footer */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-6"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/30" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Grounded in HNWI Chronicles succession, tax, governance, and continuity intelligence
          </p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/30" />
        </motion.div>
      </div>
    </div>
  );
};

export default HeirManagementSection;
