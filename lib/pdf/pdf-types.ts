/**
 * PDF Data Types - Matches the memoData structure from web UI
 * These types ensure the same data flows to PDF components
 */

// Main memo data structure (same as web UI)
export interface PdfMemoData {
  success: boolean;
  intake_id: string;
  generated_at: string;
  preview_data: PdfPreviewData;
  memo_data: PdfMemoMetadata;
  full_memo_url?: string;
}

export interface PdfPreviewData {
  // Header info
  source_jurisdiction?: string;
  destination_jurisdiction?: string;
  exposure_class?: string;
  value_creation?: string;
  five_year_projection?: string;
  total_tax_benefit?: string;
  precedent_count?: number;
  data_quality?: string;

  // Verdict
  verdict?: string;
  verdict_rationale?: string;
  risk_level?: string;

  // Tax analysis
  tax_differential?: {
    source?: TaxRates;
    destination?: TaxRates;
  };
  source_tax_rates?: TaxRates;
  destination_tax_rates?: TaxRates;

  // Risk factors
  risk_factors?: RiskFactor[];
  due_diligence?: DueDiligenceItem[];

  // Opportunities
  all_opportunities?: Opportunity[];
  execution_sequence?: ExecutionStep[];

  // Peer analysis
  peer_cohort_stats?: PeerCohortStats;
  capital_flow_data?: CapitalFlowData;

  // Expert sections
  transparency_regime_impact?: string;
  crisis_resilience_stress_test?: string;
  wealth_projection_data?: WealthProjectionData;
  wealth_projection_analysis?: string;
  scenario_tree_data?: ScenarioTreeData;
  scenario_tree_analysis?: string;
  heir_management_data?: HeirManagementData;
  heir_management_analysis?: string;
  destination_drivers?: DestinationDrivers;
  hnwi_trends_analysis?: HnwiTrendsData;

  // Raw values for calculations
  value_creation_raw?: {
    annual_tax_savings: number;
    annual_cgt_savings: number;
    total_annual: number;
    five_year_projected: number;
  };
}

export interface PdfMemoMetadata {
  kgv3_intelligence_used?: KGIntelligenceUsed;
}

// KGv3 Intelligence tracking
export interface KGIntelligenceUsed {
  precedents?: number;
  precedents_reviewed?: number;
  failure_modes?: number;
  sequencing_rules?: number;
  sequence_corrections?: number;
  regulatory_anchors?: number;
  jurisdictions?: number;
}

export interface TaxRates {
  income_tax?: number;
  capital_gains?: number;
  estate_tax?: number;
  wealth_tax?: number;
  corporate_tax?: number;
}

export interface RiskFactor {
  id?: string;
  title: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  mitigation?: string;
  exposure_amount?: number;
  // New KGv3 fields
  mitigation_timeline_days?: number;
  mitigation_action_type?: string;
  timeline_source?: 'KGv3' | 'action_estimate' | string;
}

export interface DueDiligenceItem {
  id?: string;
  task: string;
  category: 'tax' | 'legal' | 'financial' | 'compliance';
  timeline?: string;
  responsible?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface Opportunity {
  id?: string;
  dev_id?: string;
  title: string;
  description?: string;
  category?: string;
  rating?: 'juicy' | 'moderate' | 'far-fetched';
  potential_value?: number | string;
  timeline?: string;
}

export interface ExecutionStep {
  id?: string;
  step: number;
  title: string;
  description?: string;
  timeline?: string;
  dependencies?: string[];
}

export interface PeerCohortStats {
  total_hnwis?: number;
  recent_movements?: number;
  average_value?: number | string;
  movement_velocity?: string;
  flow_intensity?: number;
}

export interface CapitalFlowData {
  source?: string;
  destination?: string;
  velocity?: string;
  peers_in_corridor?: number;
}

export interface WealthProjectionData {
  starting_value?: number;
  scenarios?: {
    base?: ProjectionScenario;
    stress?: ProjectionScenario;
    opportunity?: ProjectionScenario;
  };
  cost_of_inaction?: {
    year_1?: number;
    year_5?: number;
    year_10?: number;
  };
  probability_weighted?: {
    expected_net_worth?: number;
    value_creation?: number;
    if_stay?: number;
    net_benefit?: number;
  };
}

export interface ProjectionScenario {
  probability?: number;
  year_10_value?: number;
  growth_rate?: string;
  verdict?: string;
}

export interface ScenarioTreeData {
  branches?: {
    proceed_now?: ScenarioBranch;
    proceed_modified?: ScenarioBranch;
    do_not_proceed?: ScenarioBranch;
  };
  recommended?: string;
  decision_gates?: DecisionGate[];
  decision_matrix?: DecisionMatrixRow[];
  expected_vs_reality?: ExpectedVsReality;
  validity_period?: string;
  reassess_conditions?: string[];
}

export interface ScenarioBranch {
  probability?: number;
  expected_value?: number;
  risk_level?: string;
  conditions?: BranchCondition[];
  recommended_if?: string;
}

export interface BranchCondition {
  status: 'met' | 'pending' | 'blocked';
  condition: string;
}

export interface DecisionGate {
  day: number;
  gate: string;
  if_pass?: string;
  if_fail?: string;
}

export interface DecisionMatrixRow {
  branch: string;
  expected_value: number | string;
  risk_level: string;
  recommended_if: string;
}

export interface ExpectedVsReality {
  confidence?: string;
  comparisons?: {
    metric: string;
    expected: number | string;
    actual: number | string;
    deviation?: string;
  }[];
}

export interface HeirManagementData {
  third_generation_risk?: {
    current?: number;
    with_structure?: number;
    improvement?: number;
    current_probability_of_loss?: number;
    with_structure_probability?: number;
  };
  recommended_structure?: string;
  wealth_transfer?: {
    g1?: GenerationData;
    g2?: GenerationData;
    g3?: GenerationData;
  };
  heir_allocations?: HeirAllocation[];
  estate_tax_by_heir?: {
    spouse?: string;
    children?: string;
    non_lineal?: string;
  };
  // New KGv3 fields
  estate_tax_by_heir_type?: EstateTaxByHeirType;
  hughes_framework?: HughesFramework;
  top_succession_risk?: {
    risk: string;
    at_risk_amount?: number;
    mitigation?: string;
  };
  top_succession_trigger?: {
    trigger: string;
    dollars_at_risk?: number;
    mitigation?: string;
  };
  with_structure?: {
    recommended_structure?: string;
    preservation_percentage?: number;
  };
  g1_position?: {
    current_net_worth?: number;
    projected_estate_value?: number;
  };
  next_action?: string;
}

// Hughes Family Wealth Framework - Third-generation protection
export interface HughesFramework {
  third_generation_problem?: {
    loss_rate_without_structure?: number;
    headline?: string;
    causes?: string[];
  };
  human_capital_protection?: {
    score?: 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCELLENT';
    provisions?: string[];
    description?: string;
  };
  governance_insurance?: {
    score?: 'WEAK' | 'MODERATE' | 'STRONG' | 'EXCELLENT';
    provisions?: string[];
    description?: string;
  };
}

// Estate tax rates by heir relationship type
// Supports both nested format and flat format from backend
export interface EstateTaxByHeirType {
  // Nested format (original design)
  spouse?: {
    rate?: number;
    exemption?: string;
    notes?: string;
  };
  children?: {
    rate?: number;
    exemption?: string;
    notes?: string;
  };
  non_lineal?: {
    rate?: number;
    exemption?: string;
    notes?: string;
  };
  // Flat format (actual backend response)
  spouse_rate?: number;
  children_rate?: number;
  non_lineal_rate?: number;
  spouse_summary?: string;
  children_summary?: string;
  non_lineal_summary?: string;
  headline?: string;
  note?: string;
  source?: string;
}

export interface GenerationData {
  label?: string;
  asset_value?: number;
  projected_value?: number;
  estate_tax_rate?: number;
  tax_hit?: number;
  net_to_generation?: number;
  timeline?: string;
}

export interface HeirAllocation {
  name: string;
  relationship?: string;
  generation?: string;
  age?: number;
  allocation_percent?: number;
  allocation_pct?: number; // Alternative field name from backend
  allocation_amount?: number;
  allocation_value?: number; // Alternative field name from backend
  structure?: string;
  recommended_structure?: string;
  structure_rationale?: string;
  timing?: string;
  notes?: string[];
  special_considerations?: string[];
}

export interface DestinationDrivers {
  visa_programs?: VisaProgram[];
  primary_drivers?: {
    tax_optimization?: number;
    asset_protection?: number;
    lifestyle?: number;
  };
  key_catalyst?: string;
}

export interface VisaProgram {
  name: string;
  investment_min?: string;
  processing_time?: string;
  benefits?: string[];
}

export interface HnwiTrendsData {
  confidence?: number;
  trends_count?: number;
  sources_count?: number;
  insights?: TrendInsight[];
  collections_queried?: string[];
  source_citations?: SourceCitation[];
}

export interface TrendInsight {
  type?: string;
  content: string;
  icon?: string;
}

export interface SourceCitation {
  title: string;
  date?: string;
  reliability?: string;
}

// Crisis Resilience types
export interface CrisisData {
  overall_resilience?: {
    score?: number;
    rating?: string;
    description?: string;
    worst_case_loss?: number;
    recovery_time?: string;
    buffer_required?: number;
  };
  scenarios?: CrisisScenario[];
  recommendations?: CrisisRecommendation[];
  antifragile_opportunity?: AntifragileOpportunity;
}

export interface CrisisScenario {
  name: string;
  severity: 'low' | 'medium' | 'high';
  stress_factor?: string;
  impact?: number;
  recovery?: string;
  verdict?: string;
  icon?: string;
}

export interface CrisisRecommendation {
  priority: 'immediate' | 'short_term' | 'medium_term';
  action: string;
  rationale?: string;
}

export interface AntifragileOpportunity {
  opportunity_capital?: number;
  distressed_buying_power?: number;
  instant_equity_gain?: number;
  position_spectrum?: string[];
  action_required?: string;
  upside_if_crisis?: string;
}

// Transparency Regime types
export interface TransparencyData {
  triggered?: ComplianceItem[];
  not_triggered?: ComplianceItem[];
  compliance_risks?: ComplianceRisk[];
  bottom_line?: {
    total_exposure?: string;
    compliance_cost?: string;
  };
  immediate_actions?: string[];
}

export interface ComplianceItem {
  regime: string;
  threshold?: string;
  your_exposure?: string;
  status: 'triggered' | 'not_triggered';
}

export interface ComplianceRisk {
  rank?: number;
  regime: string;
  consequence?: string;
  trigger?: string;
  fix?: string;
}
