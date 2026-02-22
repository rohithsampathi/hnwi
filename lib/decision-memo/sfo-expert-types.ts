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

  // Hughes Framework (NEW nested structure from backend)
  // Backend sends: heir_management_data.hughes_framework.third_generation_problem
  hughes_framework?: HughesFramework;

  // Legacy flat structure (for backwards compatibility)
  third_generation_problem?: ThirdGenerationProblem;
  human_capital_provisions?: HumanCapitalProvision[];
  governance_insurance?: GovernanceInsuranceProvision[];
  structure_specific_provisions?: StructureSpecificProvisions;

  // NEW: Granular Estate Tax by Heir Type (from HNWI Chronicles KG)
  estate_tax_by_heir_type?: EstateTaxByHeirType;

  // NEW: Simplified generational transfers (alternative to g1_to_g2_transfer / g2_to_g3_transfer)
  generational_transfers?: GenerationalTransfer[];
  // NEW: Structure impact (alternative to with_structure)
  structure_impact?: StructureImpact;

  // NEW: State-level estate tax (e.g., New York, Washington, Oregon)
  /** State estate tax rate (e.g., 0.16 for NY 16%) */
  state_estate_tax_rate?: number;
  /** Whether a state estate tax applies in the source jurisdiction */
  state_estate_tax_applies?: boolean;
  /** State name (e.g., "New York") */
  state_estate_tax_jurisdiction?: string;
}

/** Hughes Framework - Nested container for third generation protection data */
export interface HughesFramework {
  third_generation_problem?: ThirdGenerationProblem;
  human_capital_provisions?: HumanCapitalProvision[];
  governance_insurance?: GovernanceInsuranceProvision[];
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

// NEW: Simplified Generational Transfer (unified G1→G2 and G2→G3)
export interface GenerationalTransfer {
  /** Label (e.g., "G1→G2", "G2→G3") */
  label: string;
  /** Years until transfer */
  years_out: number;
  /** Future value at appreciation rate */
  projected_value: number;
  /** $ lost to estate tax */
  estate_tax_hit: number;
  /** $ lost to state estate tax (if applicable) */
  state_estate_tax_hit?: number;
  /** What heir actually receives */
  net_to_heir: number;
}

// NEW: Structure Impact (replaces WithStructure for new backend)
export interface StructureImpact {
  /** Structure type (e.g., "DIFC Foundation", "Family Trust") */
  recommended_structure: string;
  /** What G3 receives WITH structure */
  net_to_g3_with_structure: number;
  /** Difference vs unstructured */
  wealth_preserved: number;
  /** % wealth preserved */
  preservation_percentage: number;
  /** Setup cost estimate */
  setup_cost?: string;
  /** Annual maintenance cost estimate */
  annual_cost?: string;
}

// NEW: With Structure (Recommended) - legacy interface
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
  /** Human-readable mitigation timeline (e.g., "45 days (DIFC Foundation registration)") */
  mitigation_timeline?: string;
  /** Numeric days for sorting/urgency calculation */
  mitigation_timeline_days?: number;
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
  /** Explicit loss percentage without structure (e.g., 61 for Dubai) */
  loss_without_structure_pct?: number;
  /** Explicit loss percentage with structure (e.g., 40) */
  loss_with_structure_pct?: number;
  /** Explicit preservation percentage without structure (e.g., 39) */
  preservation_without_structure_pct?: number;
  /** Explicit preservation percentage with structure (e.g., 60) */
  preservation_with_structure_pct?: number;
  /** Improvement in percentage points (e.g., 21 = 61% - 40%) */
  improvement_pts?: number;
  /** Display string for loss arrow (e.g., "61%→40%") */
  display_loss_arrow?: string;
  /** Display string for preservation arrow (e.g., "39%→60%") */
  display_preservation_arrow?: string;
  /** Headline summary (e.g., "61% wealth erosion by G3 (tax: 0% + behavioral: 61%)") */
  headline?: string;
  /** Methodology used (e.g., "institutional_v2_jurisdiction_specific") */
  methodology?: string;
  /** Source citation (e.g., "UAE Family Business Council - 61% lack succession plan") */
  citation?: string;
  /** Component breakdown of estate tax vs behavioral factors */
  components?: {
    estate_tax?: {
      rate_used: number;
      retained_without_structure: number;
      retained_with_structure: number;
    };
    behavioral?: {
      jurisdiction: string;
      base_failure_rate: number;
      governance_mitigation: number;
      source: string;
    };
  };
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
  /** Transaction value in USD (alias for transaction_amount) */
  transaction_value?: number;
  /** Remaining liquid assets after transaction */
  remaining_liquid: number;
  /** Annual income in USD */
  annual_income: number;
  /** Current tax rate as percentage (e.g., 30 for 30%) */
  current_tax_rate: number;
  /** Target tax rate after move (e.g., 0 for 0%) */
  target_tax_rate: number;
  /** Appreciation rate percentage (e.g., 3.4 for 3.4%) */
  appreciation_rate_pct?: number;
  /** Rental yield percentage (e.g., 3.3 for 3.3%) */
  rental_yield_pct?: number;
  /** Net rental yield after taxes (e.g., 4.83 for 4.83%) */
  net_rental_yield_pct?: number;
  /** Annual rental income in USD */
  annual_rental?: number;
  /** Selected ownership structure and its tax rates */
  selected_structure?: {
    structure_name?: string;
    net_rental_rate_pct?: number;
    net_cgt_rate_pct?: number;
    net_estate_rate_pct?: number;
    stamp_duty_rate_pct?: number;
  };
  /** Cross-border tax audit summary (for non-relocation purchases) */
  cross_border_audit?: CrossBorderAuditSummary;
  /** Backend uses this key name */
  cross_border_audit_summary?: CrossBorderAuditSummary;
}

// =============================================================================
// CROSS-BORDER TAX AUDIT (For non-relocation property purchases)
// Aligned with backend field names from programmatic_sfo_calculator.py
// =============================================================================

/** Cross-border tax audit summary showing source/destination tax treatment */
export interface CrossBorderAuditSummary {
  /** Executive summary of the cross-border tax situation */
  executive_summary: string;
  /** Acquisition cost breakdown (Property + BSD + ABSD = Total) */
  acquisition_audit: AcquisitionAudit;
  /** Rental income tax treatment */
  rental_income_audit: RentalIncomeAudit;
  /** Capital gains tax treatment */
  capital_gains_audit: CapitalGainsAudit;
  /** Estate tax treatment */
  estate_tax_audit: EstateTaxAudit;
  /** Net yield calculation */
  net_yield_audit: NetYieldAudit;
  /** PFIC audit (US taxpayers investing in foreign passive entities) */
  pfic_audit?: PFICAudit;
  /** Total tax savings percentage (0 for non-relocating) */
  total_tax_savings_pct?: number;
  /** Compliance flags */
  compliance_flags?: string[];
  /** Important warnings (PFIC, worldwide taxation, etc.) */
  warnings?: string[];
  /** Data sources used for tax rates */
  data_sources?: string[];
}

/** Acquisition cost breakdown */
export interface AcquisitionAudit {
  /** Base property value */
  property_value: number;
  /** Buyer's Stamp Duty amount */
  bsd_stamp_duty: number;
  /** Additional Buyer's Stamp Duty amount */
  absd_additional_stamp_duty: number;
  /** Total stamp duties (BSD + ABSD) */
  total_stamp_duties?: number;
  /** Total acquisition cost (property + BSD + ABSD) */
  total_acquisition_cost: number;
  /** Day-one loss percentage from stamp duties */
  day_one_loss_pct?: number;
  /** Whether FTA benefit was applied (e.g., US-Singapore FTA) */
  fta_benefit_applied?: boolean;
  /** Buyer category (foreigner, pr, citizen, us_national_fta) */
  buyer_category?: string;
}

/** Rental income tax treatment */
export interface RentalIncomeAudit {
  /** Gross rental yield percentage */
  gross_yield_pct: number;
  /** Destination country tax rate on rental income */
  destination_tax_rate_pct: number;
  /** Source country tax rate on rental income (e.g., US worldwide taxation) */
  source_tax_rate_pct: number;
  /** Whether Foreign Tax Credit (FTC) is available */
  ftc_available: boolean;
  /** Net tax rate after FTC (backend field name) */
  net_tax_rate_pct?: number;
  /** Tax savings percentage (0 if worldwide taxation applies) */
  tax_savings_pct?: number;
  /** Human-readable explanation of tax treatment */
  explanation: string;
}

/** Capital gains tax treatment */
export interface CapitalGainsAudit {
  /** Destination country capital gains tax rate (backend: destination_cgt_pct) */
  destination_cgt_pct: number;
  /** Source country capital gains tax rate (backend: source_cgt_pct) */
  source_cgt_pct: number;
  /** Whether Foreign Tax Credit (FTC) is available */
  ftc_available: boolean;
  /** Net CGT rate after FTC (backend: net_cgt_rate_pct) */
  net_cgt_rate_pct?: number;
  /** Tax savings percentage */
  tax_savings_pct?: number;
  /** Human-readable explanation */
  explanation: string;
}

/** Estate tax treatment */
export interface EstateTaxAudit {
  /** Destination country estate tax rate (backend: destination_estate_pct) */
  destination_estate_pct: number;
  /** Source country estate tax rate (backend: source_estate_pct) */
  source_estate_pct: number;
  /** Whether worldwide taxation applies */
  worldwide_applies?: boolean;
  /** Net estate tax rate (backend: net_estate_rate_pct) */
  net_estate_rate_pct?: number;
  /** Tax savings percentage */
  tax_savings_pct?: number;
  /** Human-readable explanation */
  explanation: string;
}

/** Net yield calculation */
export interface NetYieldAudit {
  /** Gross rental yield */
  gross_yield_pct: number;
  /** Tax rate applied (backend: tax_rate_applied_pct) */
  tax_rate_applied_pct?: number;
  /** Net yield after taxes */
  net_yield_pct: number;
  /** Annual gross income */
  annual_gross_income?: number;
  /** Annual tax paid */
  annual_tax_paid?: number;
  /** Annual net income */
  annual_net_income?: number;
  /** Property tax rate percentage (e.g., Singapore 10-20% for non-occupied) */
  property_tax_rate_pct?: number;
  /** Annual property tax amount */
  property_tax_annual?: number;
  /** Human-readable explanation */
  explanation: string;
}

// =============================================================================
// PFIC AUDIT (Passive Foreign Investment Company - US taxpayers)
// =============================================================================

/** PFIC audit for US taxpayers investing in foreign REITs/funds */
export interface PFICAudit {
  /** Whether PFIC rules apply */
  pfic_applies: boolean;
  /** Type of entity triggering PFIC (e.g., "Singapore REIT", "Foreign Fund") */
  entity_type?: string;
  /** PFIC tax regime (e.g., "Excess Distribution", "QEF", "Mark-to-Market") */
  tax_regime?: string;
  /** Effective tax rate under PFIC rules */
  effective_rate_pct?: number;
  /** Whether QEF election is available */
  qef_election_available?: boolean;
  /** Whether Mark-to-Market election is available */
  mtm_election_available?: boolean;
  /** Human-readable explanation */
  explanation: string;
  /** Warning text for the investor */
  warning?: string;
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
  /** Via Negativa doctrine label */
  doctrine_label?: string;
  /** Cost of not proceeding - Year 1 */
  year_1: number;
  /** Cost of not proceeding - Year 5 */
  year_5: number;
  /** Cost of not proceeding - Year 10 */
  year_10: number;
  /** Primary driver of cost (e.g., "Tax arbitrage") */
  primary_driver: string;
  /** Secondary driver (e.g., "Appreciation differential") */
  secondary_driver?: string;
  /** Via Negativa framing: what exposure remains from inaction */
  via_negativa_framing?: string;
  /** Whether structure is blocked (DO_NOT_PROCEED) */
  structure_blocked?: boolean;
  /** Context note when structure is blocked */
  context_note?: string;
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
  /** Market validation - Expected vs Reality (legacy) */
  market_validation?: MarketValidation;
  /** Kahneman Delusion Buster: Expected vs Base Rate Reality */
  hallucination_gap?: HallucinationGap;
  /** 6-Book Doctrine metadata (stress calibration, antifragility, failure modes) */
  doctrine_metadata?: DoctrineMetadata;
  /** Conditional Yes: "Reject at $X. Approve at $Y." — negotiation leverage */
  conditional_verdict?: ConditionalVerdict;
  /** External Veto: "My auditors killed it" — relationship insurance */
  external_veto?: ExternalVeto;
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
  /** Hypothetical expected value note (shown when structure is blocked) */
  expected_value_note?: string;
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

export type ConditionStatus = "MET" | "PENDING" | "BLOCKED" | "CONDITIONAL" | "CONFIRMED" | "MODELED";

export interface BranchOutcome {
  /** Which scenario this outcome is for */
  scenario: ScenarioName | "CAPITAL_PRESERVED" | "COST_OF_VULNERABILITY";
  /** 6-Book Doctrine label for this outcome */
  doctrine_label?: string;
  /** Probability of this scenario */
  probability: number;
  /** Net financial outcome in USD */
  net_outcome: number;
  /** Description of outcome */
  description: string;
  /** Base rate data source citation */
  base_rate_source?: string;
  /** Stress calibration citation (for STRESS_CASE) */
  stress_calibration?: string;
  /** Survival advantage (for DO_NOT_PROCEED: capital preserved) */
  survival_advantage?: {
    survives_2008_scenario: boolean;
    survives_regulatory_shock: boolean;
    zero_ruin_probability: boolean;
    key_advantage: string;
  };
  /** Unmitigated exposure (Via Negativa: cost of NOT acting) */
  unmitigated_exposure?: {
    estate_tax_cliff: number;
    estate_tax_cliff_note: string;
    inflation_erosion_10yr: number;
    inflation_erosion_note: string;
    foregone_structuring: number;
    foregone_structuring_note: string;
  };
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
// KAHNEMAN DELUSION BUSTER: Hallucination Gap (Jan 2026)
// User Expectation vs Market Base Rate
// =============================================================================

/** Kahneman Delusion Buster: User Expectation vs Market Base Rate */
export interface HallucinationGap {
  doctrine_label: string;
  hallucination_gap: {
    appreciation: HallucinationGapEntry;
    rental_yield: HallucinationGapEntry;
  };
  /** Legacy field for backwards compatibility */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected_vs_reality?: Record<string, any>;
  overall_confidence: string;
  antifragility_assessment: string;
  recommendation?: string;
  data_sources_used: string[];
}

export interface HallucinationGapEntry {
  user_expectation: string;
  user_expectation_raw: number | null;
  market_base_rate: string | null;
  market_base_rate_raw: number | null;
  base_rate_source: string | null;
  deviation_pct: number | null;
  /** ALIGNED = within 25%, CAUTION = 25-50%, OUTSIDE_COMPETENCE_CIRCLE = >50% */
  hallucination_flag: "ALIGNED" | "CAUTION" | "OUTSIDE_COMPETENCE_CIRCLE" | null;
}

// =============================================================================
// 6-BOOK DOCTRINE METADATA (Jan 2026)
// =============================================================================

/** 6-Book Doctrine Metadata */
export interface DoctrineMetadata {
  /** Historical stress calibration source (e.g., "Dubai 2009 crisis -56%") */
  stress_calibration: string;
  /** Stress multipliers used */
  stress_multipliers: {
    appreciation: number;
    income: number;
  };
  /** Dalio Machine Stress-Test score (0-100) */
  antifragility_score: number | null;
  /** ANTIFRAGILE (>=70), FRAGILE (50-69), RUIN_EXPOSED (<50) */
  antifragility_assessment: "ANTIFRAGILE" | "FRAGILE" | "RUIN_EXPOSED" | "NOT_SCORED";
  /** Detected failure modes per Taleb Antifragility Filter */
  failure_modes: DoctrineFailureMode[];
  failure_mode_count: number;
  risk_flags_total: number;
  /** Which doctrine books were applied */
  doctrine_books_applied: string[];
}

export type FailureModeSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "ADVISORY";

export interface DoctrineFailureMode {
  /** Doctrine failure mode name (e.g., LIQUIDITY_PRISON, BEHAVIORAL_EROSION) */
  mode: string;
  /** Which doctrine book detected this (e.g., "Game Theory (Exit Mapper)") */
  doctrine_book: string;
  description: string;
  severity: FailureModeSeverity;
  /** How this failure mode was detected */
  detection_type?: "DETERMINISTIC" | "ADVISORY" | "CONFIRMED";
  /** Human-readable nightmare name (e.g., "The Dragnet", "Genealogy Risk") */
  nightmare_name?: string;
}

// =============================================================================
// CONDITIONAL VERDICT & EXTERNAL VETO (Jan 2026)
// =============================================================================

/** Conditional Yes: "Reject at $X. Approve at $Y." — negotiation leverage */
export interface ConditionalVerdict {
  type: "CONDITIONAL_YES";
  /** Current ask price (transaction_value) */
  reject_at: number;
  /** Stress-case threshold at which the deal becomes acceptable */
  approve_at: number;
  /** Human-readable statement: "Reject at $10M. Approve at $7M." */
  statement: string;
  /** Calculation basis (e.g., "Stress-case expected value (Dalio Machine Test)") */
  basis: string;
  /** Discount percentage from ask to threshold */
  discount_pct: number;
}

/** External Veto: Relationship insurance statement for CIO to use verbatim */
export interface ExternalVeto {
  /** Ready-to-use statement: "My independent auditors flagged structural risks..." */
  statement: string;
  /** Context explaining the purpose of this statement */
  context: string;
  /** Usage instructions */
  usage: string;
}

// =============================================================================
// VIA NEGATIVA DATA CONTRACT (Jan 2026)
// Only present when structure_optimization.verdict === "DO_NOT_PROCEED"
// Contains all labels, computed values, and tone-shifted copy.
// Frontend reads from via_negativa.* instead of hardcoding ~45 strings.
// =============================================================================

export interface ViaNegativaMetric {
  label: string;
  /** Field name to resolve from via_negativa computed values */
  value_field?: string;
  /** Static value (used when no dynamic field) */
  value?: string;
  value_prefix?: string;
  value_fallback?: string;
  /** Template string with {variable} placeholders */
  description_template?: string;
  description?: string;
  highlight: boolean;
  is_destructive: boolean;
}

export interface ViaNegativaCheck {
  label: string;
  /** Boolean field name to resolve from via_negativa computed values */
  field: string;
}

export interface ViaNegativaData {
  verdict_label: string;
  /** Via Negativa posture statement: strengths acknowledged, weaknesses stated without qualification */
  analysis_posture: string;

  // Computed values for template substitution
  day_one_loss_pct: number;
  day_one_loss_amount: number;
  total_regulatory_exposure: number;
  precedent_count: number;
  tax_efficiency_passed: boolean;
  liquidity_passed: boolean;
  structure_passed: boolean;

  header: {
    badge_label: string;
    title_prefix: string;
    title_highlight: string;
    notice_title: string;
    /** Template with {dayOneLoss}, {precedentCount} placeholders */
    notice_body: string;
  };

  metrics: ViaNegativaMetric[];

  /** Reality Gap visualization: expected vs actual side-by-side */
  reality_gap_visual?: RealityGapVisual;

  scenario_section: {
    header: string;
    expectation_label: string;
    actual_label: string;
    commentary_title: string;
    commentary_body: string;
  };

  tax_section: {
    badge_label: string;
    title_line1: string;
    title_line2: string;
    compliance_prefix: string;
    warning_prefix: string;
  };

  verdict_section: {
    header: string;
    badge_label: string;
    checks: ViaNegativaCheck[];
    stamp_text: string;
    stamp_subtext: string;
  };

  cta: {
    headline: string;
    /** Template with {dayOneLoss} placeholder */
    body_template: string;
    scarcity_text: string;
    button_text: string;
    button_url: string;
    context_note: string;
    /** Structured actions (new backend format) */
    actions?: CTAAction[];
    /** Form fields for consultation booking */
    form_fields?: CTAFormField[];
  };
}

// =============================================================================
// VIA NEGATIVA THEME (WCAG AA Compliant)
// =============================================================================

/** Via Negativa theme colors for light and dark mode */
export interface ViaNegativaTheme {
  /** Background colors */
  bg: {
    primary: string;
    secondary: string;
    card: string;
    badge: string;
  };
  /** Text colors */
  text: {
    primary: string;
    secondary: string;
    muted: string;
    badge: string;
  };
  /** Border colors */
  border: {
    primary: string;
    card: string;
    accent: string;
  };
  /** Accent/highlight colors */
  accent: {
    glow: string;
    highlight: string;
    destructive: string;
  };
}

/** Get Via Negativa theme for current color mode */
export function getViaNegativaTheme(isDark: boolean): ViaNegativaTheme {
  if (isDark) {
    return {
      bg: {
        primary: "bg-red-950/30",
        secondary: "bg-red-950/20",
        card: "bg-red-950/40",
        badge: "bg-red-500/20",
      },
      text: {
        primary: "text-red-400",
        secondary: "text-red-300",
        muted: "text-red-400/60",
        badge: "text-red-300",
      },
      border: {
        primary: "border-red-500/30",
        card: "border-red-500/20",
        accent: "border-red-500/40",
      },
      accent: {
        glow: "shadow-red-500/10",
        highlight: "bg-red-500/10",
        destructive: "text-red-500",
      },
    };
  }
  return {
    bg: {
      primary: "bg-red-50",
      secondary: "bg-red-100/50",
      card: "bg-red-100",
      badge: "bg-red-200",
    },
    text: {
      primary: "text-red-700",
      secondary: "text-red-600",
      muted: "text-red-600/70",
      badge: "text-red-800",
    },
    border: {
      primary: "border-red-200",
      card: "border-red-200",
      accent: "border-red-300",
    },
    accent: {
      glow: "shadow-red-200/30",
      highlight: "bg-red-200/50",
      destructive: "text-red-600",
    },
  };
}

// =============================================================================
// REALITY GAP VISUAL (Via Negativa)
// =============================================================================

/** Reality gap row: expected vs actual for a metric */
export interface RealityGapRow {
  /** Metric label (e.g., "Appreciation", "Rental Yield") */
  label: string;
  /** What the user expects (e.g., "16%") */
  expected: string;
  /** Market base rate (e.g., "3.4%") */
  actual: string;
  /** Deviation description (e.g., "-78%") */
  deviation: string;
  /** Warning level */
  severity: "none" | "moderate" | "high" | "extreme";
}

/** Reality gap visualization container */
export interface RealityGapVisual {
  /** Section title */
  title: string;
  /** Rows of expected vs actual comparisons */
  rows: RealityGapRow[];
  /** Overall assessment */
  overall_assessment: string;
  /** Data sources used */
  data_sources: string[];
}

// =============================================================================
// CTA ACTIONS & FORM FIELDS (Via Negativa / Consultation)
// =============================================================================

/** Structured CTA action */
export interface CTAAction {
  /** Action type */
  type: "primary" | "secondary" | "link";
  /** Button/link text */
  label: string;
  /** URL or action identifier */
  url: string;
  /** Additional context */
  description?: string;
}

/** Form field for consultation booking CTA */
export interface CTAFormField {
  /** Field name */
  name: string;
  /** Field label */
  label: string;
  /** Input type */
  type: "text" | "email" | "tel" | "select" | "textarea";
  /** Whether field is required */
  required: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Options (for select type) */
  options?: string[];
}

// =============================================================================
// RADAR CHART CONFIG (Layout Contract)
// =============================================================================

/** Radar chart axis definition */
export interface RadarAxis {
  /** Axis key (e.g., "tax_efficiency", "liquidity") */
  key: string;
  /** Display label */
  label: string;
  /** Maximum value for this axis */
  max: number;
}

/** Radar chart layout configuration */
export const RADAR_CHART_CONFIG = {
  /** SVG viewBox dimensions */
  viewBox: { width: 380, height: 380 },
  /** Center point */
  center: { x: 190, y: 190 },
  /** Maximum radius for the polygon */
  maxRadius: 120,
  /** Padding for labels beyond polygon edge */
  labelPadding: 40,
  /** Number of concentric grid rings */
  gridRings: 5,
  /** Default axes for Capital Allocation Risk Profile */
  defaultAxes: [
    { key: "tax_efficiency", label: "Tax Efficiency", max: 100 },
    { key: "liquidity", label: "Liquidity", max: 100 },
    { key: "structure", label: "Structure", max: 100 },
    { key: "estate_planning", label: "Estate Planning", max: 100 },
    { key: "regulatory", label: "Regulatory", max: 100 },
    { key: "market_alignment", label: "Market Alignment", max: 100 },
  ] as RadarAxis[],
} as const;

/**
 * Calculate label position for radar chart axis
 * Returns {x, y, anchor} for SVG text positioning
 */
export function getRadarLabelPosition(
  index: number,
  total: number,
  center: { x: number; y: number },
  radius: number,
  padding: number = 40
): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = radius + padding;
  const x = center.x + r * Math.cos(angle);
  const y = center.y + r * Math.sin(angle);

  // Determine text anchor based on position
  let anchor: "start" | "middle" | "end" = "middle";
  if (Math.cos(angle) > 0.1) anchor = "start";
  else if (Math.cos(angle) < -0.1) anchor = "end";

  return { x, y, anchor };
}

/**
 * Calculate polygon points for radar chart
 * Returns SVG points string for <polygon>
 */
export function getRadarPolygonPoints(
  values: number[],
  maxValues: number[],
  center: { x: number; y: number },
  maxRadius: number
): string {
  return values
    .map((val, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const ratio = Math.min(val / (maxValues[i] || 100), 1);
      const r = ratio * maxRadius;
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");
}

// =============================================================================
// JURISDICTION TAX RATES & TAX DIFFERENTIAL (Centralized)
// =============================================================================

/** Tax rates for a single jurisdiction (source or destination) */
export interface JurisdictionTaxRates {
  income_tax?: number;
  cgt?: number;
  wealth_tax?: number;
  estate_tax?: number;
  effective?: number;
}

/** Which tax category drives the most value in the corridor */
export interface PrimaryValueDriver {
  /** Tax category (e.g., "Income Tax", "CGT", "Estate Tax") */
  category: string;
  /** Differential percentage */
  differential_pct: number;
  /** Impact direction */
  impact: "saved" | "cost" | "neutral";
}

/** Full tax differential between source and destination jurisdictions */
export interface TaxDifferentialFull {
  source: JurisdictionTaxRates;
  destination: JurisdictionTaxRates;
  /** Income tax differential (source - destination) */
  income_tax_differential_pct: number;
  /** Capital gains tax differential */
  cgt_differential_pct: number;
  /** Estate tax differential */
  estate_tax_differential_pct: number;
  /** Weighted differential (by HNWI exposure: 60% estate, 25% income, 15% CGT) */
  weighted_tax_differential_pct?: number;
  /** Methodology for weighting */
  weighting_methodology?: string;
  /** Cumulative (sum of all differentials) */
  cumulative_tax_differential_pct?: number;
  /** Cumulative impact: "saved" | "cost" | "none_without_relocation" */
  cumulative_impact?: "saved" | "cost" | "none_without_relocation";
  /** Which tax category drives the most value */
  primary_value_driver?: PrimaryValueDriver;
  /** Headline savings string (e.g., "N/A (Requires Relocation)") */
  headline_tax_savings?: string;
  /** Whether the buyer is relocating to the destination */
  is_relocating?: boolean;
  /** Note explaining tax savings context */
  tax_savings_note?: string;
}

// =============================================================================
// STRUCTURE OPTIMIZATION (Centralized)
// =============================================================================

/** Structure optimization verdict */
export type StructureVerdict =
  | "PROCEED"
  | "PROCEED_MODIFIED"
  | "PROCEED_DIVERSIFICATION_ONLY"
  | "DO_NOT_PROCEED";

/** Individual structure in structures_analyzed[] */
export interface StructureAnalysisItem {
  name: string;
  type: string;
  verdict: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  viable: boolean;
  warnings: (string | Record<string, unknown>)[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
  estate_tax_exposure?: number;
  is_nra?: boolean;
}

/** Optimal structure recommendation (extends StructureAnalysisItem with anti-avoidance) */
export interface OptimalStructure {
  name: string;
  type: string;
  net_benefit_10yr: number;
  tax_savings_pct: number;
  warnings: (string | Record<string, unknown>)[];
  setup_cost?: number;
  annual_cost?: number;
  rental_income_rate?: number;
  capital_gains_rate?: number;
  estate_tax_rate?: number;
  estate_tax_exposure?: number;
  is_nra?: boolean;
  anti_avoidance_flags?: string[];
}

/** Full structure optimization output from MCP engine */
export interface StructureOptimization {
  verdict: StructureVerdict;
  verdict_reason: string;
  optimal_structure?: OptimalStructure;
  structures_analyzed: StructureAnalysisItem[];
  alternative_corridors: (string | Record<string, unknown>)[];
  alternative_strategies: (string | Record<string, unknown>)[];
  confidence_level?: string;
}

// =============================================================================
// VALUE CREATION (Centralized)
// =============================================================================

/** Value creation breakdown — supports both relocation (tax savings) and non-relocation (rental/appreciation) */
export interface ValueCreation {
  /** Non-relocation format: rental + appreciation */
  annual?: {
    rental?: number;
    rental_formatted?: string;
    appreciation?: number;
    appreciation_formatted?: string;
    tax_savings?: number;
    total?: number;
    total_formatted?: string;
  };
  /** Five-year projection */
  five_year?: {
    rental?: number;
    rental_formatted?: string;
    appreciation?: number;
    appreciation_formatted?: string;
    tax_savings?: number;
    total?: number;
    total_formatted?: string;
  };
  /** Relocation format: tax savings breakdown */
  annual_tax_savings?: number;
  annual_cgt_savings?: number;
  annual_estate_benefit?: number;
  total_annual?: number;
  formatted?: {
    annual_tax_savings?: string;
    annual_cgt_savings?: string;
    annual_estate_benefit?: string;
    total_annual?: string;
  };
  /** Delta between user projections and market rates */
  user_vs_market_delta?: number;
  /** Warnings about projection assumptions */
  warnings?: string[];
  /** Legacy flat format */
  amount?: number;
  description?: string;
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
    case "CONFIRMED": return "✓";
    case "CONDITIONAL": return "⟳";
    case "MODELED": return "◎";
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
    case "CONFIRMED": return "text-green-600 dark:text-green-400";
    case "CONDITIONAL": return "text-blue-600 dark:text-blue-400";
    case "MODELED": return "text-purple-600 dark:text-purple-400";
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
