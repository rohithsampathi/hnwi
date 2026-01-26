/**
 * TypeScript Type Definitions for SFO-Grade Experts (13-15)
 * For $2,500 Decision Memo Audits
 */

// =============================================================================
// EXPERT 13: HEIR MANAGEMENT (Updated with G1→G2→G3 Transfer Flow)
// =============================================================================

export interface HeirManagementData {
  // Legacy fields (for backwards compatibility)
  third_generation_risk?: ThirdGenerationRisk;
  heirs?: Heir[];
  recommended_structure?: RecommendedStructure;
  governance_framework?: GovernanceFramework;
  heir_education_plan?: HeirEducationPlan;

  // NEW: G1→G2→G3 Transfer Flow
  g1_position?: G1Position;
  g1_to_g2_transfer?: G1ToG2Transfer;
  g2_to_g3_transfer?: G2ToG3Transfer;
  with_structure?: WithStructure;
  top_succession_trigger?: TopSuccessionTrigger;
  next_action?: string;
  heir_allocations?: HeirAllocation[];

  // Hughes Framework: Third Generation Problem + Governance Insurance
  third_generation_problem?: ThirdGenerationProblem;
  human_capital_provisions?: HumanCapitalProvision[];
  governance_insurance?: GovernanceInsuranceProvision[];
  structure_specific_provisions?: StructureSpecificProvisions;

  // NEW: Granular Estate Tax by Heir Type (from HNWI Chronicles KG)
  estate_tax_by_heir_type?: EstateTaxByHeirType;
}

/** Granular estate tax rates by heir relationship type */
export interface EstateTaxByHeirType {
  /** Estate tax rate for spouse (often 0% due to marital exemption) */
  spouse_rate: number;
  /** Estate tax rate for children/direct descendants */
  children_rate: number;
  /** Estate tax rate for non-lineal heirs (highest rate) */
  non_lineal_rate: number;
  /** Explanatory note from HNWI Chronicles KG (e.g., "Spouse: FULLY EXEMPT. Children: 40% above £325K") */
  note?: string;
  /** Source attribution */
  source?: string;
  /** Display summary for spouse (e.g., "TAX-FREE") */
  spouse_summary?: string;
  /** Display summary for children (e.g., "40%") */
  children_summary?: string;
  /** Headline summary (e.g., "Spouse inherits TAX-FREE; children pay 40%") */
  headline?: string;
}

// NEW: G1 Position (Current Generation - Principal)
export interface G1Position {
  /** Transaction value (e.g., $500,000) */
  asset_value: number;
  /** Estate tax rate (0.0 = 0%, 0.40 = 40%) */
  estate_tax_rate: number;
  /** $ lost if G1 dies today without structure */
  unplanned_loss: number;
}

// NEW: G1→G2 Transfer (20 years out)
export interface G1ToG2Transfer {
  /** Years until transfer (typically 20) */
  years_out: number;
  /** Future value at appreciation rate */
  projected_value: number;
  /** $ lost to estate tax */
  estate_tax_hit: number;
  /** What G2 actually receives */
  net_to_g2: number;
}

// NEW: G2→G3 Transfer (40 years out)
export interface G2ToG3Transfer {
  /** Years until transfer (typically 40) */
  years_out: number;
  /** Future value */
  projected_value: number;
  /** $ lost to estate tax */
  estate_tax_hit: number;
  /** What G3 receives WITHOUT structure */
  net_to_g3_without_structure: number;
}

// NEW: With Structure (Recommended)
export interface WithStructure {
  /** Structure type (e.g., "DIFC Foundation", "Family Trust") */
  recommended_structure: string;
  /** What G3 receives WITH structure */
  net_to_g3_with_structure: number;
  /** Difference vs unstructured */
  wealth_preserved: number;
  /** % wealth preserved (target: 70%+ vs 30% typical) */
  preservation_percentage: number;
}

// NEW: Top Succession Risk
export interface TopSuccessionTrigger {
  /** Risk description */
  trigger: string;
  /** $ exposure */
  dollars_at_risk: number;
  /** Recommended action */
  mitigation: string;
}

// NEW: Per-Heir Allocation
export interface HeirAllocation {
  /** Heir name (e.g., "Daughter (G2)", "Son (G2)", "Grandchild (G3)") */
  name: string;
  /** Relationship type */
  relationship: HeirRelationship;
  /** Age of heir */
  age: number;
  /** Allocation percentage (0.40 = 40%) */
  allocation_pct: number;
  /** $ amount allocated */
  allocation_value: number;
  /** Structure for this heir */
  recommended_structure: string;
  /** Why this structure */
  structure_rationale: string;
  /** Timing (e.g., "Immediate", "Trust funded now; distributions begin in 10 years") */
  timing: string;
  /** Array of important notes */
  special_considerations: string[];
}

export type HeirRelationship = "daughter" | "son" | "grandchild" | "spouse" | "other";

// =============================================================================
// HUGHES FRAMEWORK: Third Generation Problem + Governance Insurance
// =============================================================================

/** Third Generation Problem statistics and context */
export interface ThirdGenerationProblem {
  /** "70% of wealthy families lose wealth by 2nd generation" */
  statistic: string;
  /** Primary causes: entitlement, lack of education, poor governance */
  causes: string[];
  /** Why this family is at risk */
  risk_factors: string[];
}

/** Human Capital Provisions - Financial education requirements */
export interface HumanCapitalProvision {
  /** Provision name (e.g., "Financial Literacy Requirement") */
  name: string;
  /** Description of the provision */
  description: string;
  /** When it applies (e.g., "Before age 25 distributions") */
  trigger: string;
  /** Structure type this applies to */
  structure_type?: string;
}

/** Governance Insurance - Spendthrift clauses, distribution gates, etc. */
export interface GovernanceInsuranceProvision {
  /** Provision type (e.g., "Spendthrift Clause", "Distribution Gate") */
  type: "spendthrift_clause" | "trustee_oversight" | "distribution_gate" | "lifestyle_cap" | "incentive_distribution" | "other";
  /** Provision name */
  name: string;
  /** What it does */
  description: string;
  /** Why it matters */
  rationale: string;
}

/** Structure-specific provisions (DIFC, Singapore VCC, Dynasty Trust, etc.) */
export interface StructureSpecificProvisions {
  /** Structure name (e.g., "DIFC Foundation", "Singapore VCC", "Nevada Dynasty Trust") */
  structure_name: string;
  /** Jurisdiction */
  jurisdiction: string;
  /** Human capital provisions for this structure */
  human_capital: HumanCapitalProvision[];
  /** Governance insurance provisions */
  governance_insurance: GovernanceInsuranceProvision[];
}

// Legacy interfaces (kept for backwards compatibility)
export interface ThirdGenerationRisk {
  /** Current probability of wealth loss by 3rd generation (e.g., 0.70 for 70%) */
  current_probability_of_loss: number;
  /** Probability with recommended structure (e.g., 0.15 for 15%) */
  with_structure_probability: number;
  /** Human-readable improvement (e.g., "55 percentage points") */
  improvement: string;
}

export interface Heir {
  /** Heir identifier (e.g., "Eldest Son (45)") */
  name: string;
  /** Role in family (e.g., "Business Successor") */
  role: string;
  /** Current involvement level */
  involvement_level: InvolvementLevel;
  /** Readiness to manage wealth */
  wealth_readiness: ReadinessLevel;
  /** Overall risk level */
  risk_level: RiskLevel;
  /** Recommended actions for this heir */
  recommended_actions: string[];
}

export type InvolvementLevel = "HIGH" | "MODERATE" | "LOW" | "MINIMAL";
export type ReadinessLevel = "HIGH" | "MODERATE" | "LOW";
export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RecommendedStructure {
  /** Structure type (e.g., "Multi-Generation Trust (DIFC)") */
  type: string;
  /** List of benefits */
  benefits: string[];
  /** One-time setup cost (e.g., "$15K") */
  setup_cost: string;
  /** Annual maintenance cost (e.g., "$5K") */
  annual_cost: string;
  /** Time to establish (e.g., "6-12 months") */
  timeline: string;
  /** Level of protection for 3rd generation */
  third_gen_protection: ProtectionLevel;
}

export type ProtectionLevel = "HIGH" | "MODERATE" | "LOW";

export interface GovernanceFramework {
  /** Meeting frequency (e.g., "Quarterly") */
  family_council_frequency: string;
  /** Required majority (e.g., "2/3 majority") */
  decision_threshold: string;
  /** Veto power holder (e.g., "Patriarch until death/incapacity") */
  veto_power: string;
  /** Events that trigger succession */
  succession_triggers: string[];
}

export interface HeirEducationPlan {
  /** Actions for Generation 2 (current heirs) */
  gen_2_actions: string[];
  /** Actions for Generation 3 (grandchildren) */
  gen_3_actions: string[];
}

// =============================================================================
// EXPERT 14: WEALTH PROJECTION
// =============================================================================

export interface WealthProjectionData {
  starting_position: StartingPosition;
  scenarios: ProjectionScenario[];
  cost_of_inaction: CostOfInaction;
  probability_weighted_outcome: ProbabilityWeightedOutcome;
}

export interface StartingPosition {
  /** Current total net worth in USD */
  current_net_worth: number;
  /** Amount being deployed in this transaction */
  transaction_amount: number;
  /** Remaining liquid assets after transaction */
  remaining_liquid: number;
  /** Annual income in USD */
  annual_income: number;
  /** Current tax rate as percentage (e.g., 30 for 30%) */
  current_tax_rate: number;
  /** Target tax rate after move (e.g., 0 for 0%) */
  target_tax_rate: number;
}

export interface ProjectionScenario {
  /** Scenario name */
  name: ScenarioName;
  /** Probability of this scenario (e.g., 0.60 for 60%) */
  probability: number;
  /** Key assumptions for this scenario */
  assumptions: string[];
  /** Year-by-year projections */
  year_by_year: YearProjection[];
  /** 10-year summary outcome */
  ten_year_outcome: TenYearOutcome;
}

export type ScenarioName = "BASE_CASE" | "STRESS_CASE" | "OPPORTUNITY_CASE";

export interface YearProjection {
  /** Year number (0, 1, 3, 5, 10) */
  year: number;
  /** Property value at this year */
  property_value: number;
  /** Liquid assets at this year */
  liquid_assets: number;
  /** Annual income at this year */
  income: number;
  /** Cumulative tax saved to this year */
  tax_saved: number;
  /** Total net worth at this year */
  net_worth: number;
}

export interface TenYearOutcome {
  /** Total property appreciation in USD */
  property_appreciation: number;
  /** Total investment growth in USD */
  investment_growth: number;
  /** Cumulative tax savings in USD */
  tax_savings_cumulative: number;
  /** Total value created in USD */
  total_value_creation: number;
  /** Percentage gain (e.g., 125 for 125%) */
  percentage_gain: number;
  /** Final portfolio value at Year 10 in USD (new field) */
  final_value?: number;
  /** Final total value at Year 10 in USD (legacy field - use final_value) */
  final_total_value?: number;
}

export interface CostOfInaction {
  /** Cost of not proceeding - Year 1 */
  year_1: number;
  /** Cost of not proceeding - Year 5 */
  year_5: number;
  /** Cost of not proceeding - Year 10 */
  year_10: number;
  /** Primary driver of cost (e.g., "Tax arbitrage") */
  primary_driver: string;
  /** Secondary driver (e.g., "Appreciation differential") */
  secondary_driver: string;
}

export interface ProbabilityWeightedOutcome {
  /** Expected net worth (probability-weighted across scenarios) */
  expected_net_worth: number;
  /** Expected value creation */
  expected_value_creation: number;
  /** Expected value if staying (not proceeding) */
  vs_stay_expected: number;
  /** Net benefit of proceeding vs staying */
  net_benefit_of_move: number;
}

// =============================================================================
// EXPERT 15: SCENARIO DECISION TREE
// =============================================================================

export interface ScenarioTreeData {
  /** All decision branches */
  branches: DecisionBranch[];
  /** Which branch is recommended */
  recommended_branch: BranchName;
  /** Reasons for recommendation */
  rationale: string[];
  /** Decision gates/checkpoints */
  decision_gates: DecisionGate[];
  /** Expiry information */
  expiry: TreeExpiry;
  /** Summary matrix for quick reference */
  decision_matrix: DecisionMatrixEntry[];
  /** Market validation - Expected vs Reality */
  market_validation?: MarketValidation;
}

// =============================================================================
// MARKET VALIDATION (Expected vs Reality)
// =============================================================================

export interface MarketValidationMetric {
  your_expectation: string;
  market_actual: string | null;
  market_source: string | null;
  deviation: string | null;
  warning: string | null;
  warning_level: 'none' | 'moderate' | 'high' | 'extreme';
}

export interface MarketValidation {
  expected_vs_reality: {
    appreciation: MarketValidationMetric;
    rental_yield: MarketValidationMetric;
  };
  overall_confidence: 'high' | 'moderate' | 'low' | 'unknown';
  recommendation: string | null;
  data_sources_used: string[];
}

export interface DecisionBranch {
  /** Branch identifier */
  name: BranchName;
  /** How strongly this is recommended (e.g., 0.60 for 60%) */
  recommendation_strength: number;
  /** Conditions for this branch */
  conditions: BranchCondition[];
  /** Outcomes under different scenarios */
  outcomes: BranchOutcome[];
  /** Expected value of this branch */
  expected_value: number;
  /** Brief verdict */
  verdict: string;
  /** When to choose this branch */
  verdict_conditions: string[];
}

export type BranchName = "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED";

export interface BranchCondition {
  /** Condition description */
  condition: string;
  /** Current status */
  status: ConditionStatus;
}

export type ConditionStatus = "MET" | "PENDING" | "BLOCKED";

export interface BranchOutcome {
  /** Which scenario this outcome is for */
  scenario: ScenarioName;
  /** Probability of this scenario */
  probability: number;
  /** Net financial outcome in USD */
  net_outcome: number;
  /** Description of outcome */
  description: string;
}

export interface DecisionGate {
  /** Gate number (1, 2, 3...) */
  gate_number: number;
  /** Day to check this gate */
  day: number;
  /** What to check */
  check: string;
  /** Action if gate passes */
  if_pass: string;
  /** Action if gate fails */
  if_fail: string;
}

export interface TreeExpiry {
  /** Days until decision tree expires */
  days: number;
  /** Events that trigger reassessment */
  reassess_triggers: string[];
}

export interface DecisionMatrixEntry {
  /** Branch name */
  branch: string;
  /** Expected value as string (e.g., "+$890K") */
  expected_value: string;
  /** Risk level */
  risk_level: RiskLevel;
  /** When to choose this option */
  recommended_if: string;
}

// =============================================================================
// COMBINED SFO EXPERT DATA (for API response)
// =============================================================================

export interface SFOExpertData {
  // Raw analysis text
  heir_management_analysis?: string;
  wealth_projection_analysis?: string;
  scenario_tree_analysis?: string;

  // Structured data
  heir_management_data?: HeirManagementData | null;
  wealth_projection_data?: WealthProjectionData | null;
  scenario_tree_data?: ScenarioTreeData | null;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get color class for risk level
 */
export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case "HIGH": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    case "MEDIUM": return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950";
    case "LOW": return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950";
    default: return "text-muted-foreground bg-muted";
  }
}

/**
 * Get color class for branch
 */
export function getBranchColorClass(branch: BranchName): string {
  switch (branch) {
    case "PROCEED_NOW": return "border-green-500 bg-green-50 dark:bg-green-950/30";
    case "PROCEED_MODIFIED": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
    case "DO_NOT_PROCEED": return "border-red-500 bg-red-50 dark:bg-red-950/30";
    default: return "border-border bg-muted";
  }
}

/**
 * Get icon for condition status
 */
export function getConditionStatusIcon(status: ConditionStatus): string {
  switch (status) {
    case "MET": return "✓";
    case "PENDING": return "⚠";
    case "BLOCKED": return "✗";
    default: return "?";
  }
}

/**
 * Get color class for condition status
 */
export function getConditionStatusClass(status: ConditionStatus): string {
  switch (status) {
    case "MET": return "text-green-600 dark:text-green-400";
    case "PENDING": return "text-yellow-600 dark:text-yellow-400";
    case "BLOCKED": return "text-red-600 dark:text-red-400";
    default: return "text-muted-foreground";
  }
}

/**
 * Get scenario display name
 */
export function getScenarioDisplayName(name: ScenarioName): string {
  switch (name) {
    case "BASE_CASE": return "Base Case";
    case "STRESS_CASE": return "Stress Case";
    case "OPPORTUNITY_CASE": return "Opportunity Case";
    default: return name;
  }
}

/**
 * Get branch display name
 */
export function getBranchDisplayName(name: BranchName): string {
  switch (name) {
    case "PROCEED_NOW": return "Proceed Now";
    case "PROCEED_MODIFIED": return "Proceed Modified";
    case "DO_NOT_PROCEED": return "Do Not Proceed";
    default: return name;
  }
}
