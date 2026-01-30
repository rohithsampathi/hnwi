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

  // MCP fields from unified endpoint (top-level)
  mitigationTimeline?: string;
  risk_assessment?: RiskAssessment;
  all_mistakes?: Mistake[];
  identified_risks?: any[];
}

export interface PdfPreviewData {
  // Header info
  source_jurisdiction?: string;
  destination_jurisdiction?: string;
  exposure_class?: string;
  value_creation?: string | { amount?: number; formatted?: string; description?: string };
  five_year_projection?: string;
  total_tax_benefit?: string;
  total_savings?: string;
  precedent_count?: number;
  data_quality?: string;

  // Verdict
  verdict?: string;
  verdict_rationale?: string;
  risk_level?: string;
  definitive_verdict?: 'STOP' | 'GO' | 'PIVOT' | 'GO WITH MODIFICATIONS';
  executive_verdict?: string;

  // Tax analysis
  tax_differential?: {
    source?: TaxRates;
    destination?: TaxRates;
    savings?: string;
  };
  source_tax_rates?: TaxRates;
  destination_tax_rates?: TaxRates;

  // Risk factors & mistakes
  risk_factors?: RiskFactor[];
  all_mistakes?: Mistake[];
  due_diligence?: DueDiligenceItem[];
  dd_checklist?: {
    total_items: number;
    items: Array<{
      category: string;
      item: string;
      status: string;
      priority: string;
    }>;
  };

  // Opportunities
  all_opportunities?: Opportunity[];
  opportunities_count?: number;
  execution_sequence?: ExecutionStep[];

  // Peer analysis
  peer_cohort_stats?: PeerCohortStats;
  capital_flow_data?: CapitalFlowData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 7: TRANSPARENCY REGIME
  // ═══════════════════════════════════════════════════════════════════════
  transparency_regime_impact?: string;
  transparency_data?: TransparencyData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 8: CRISIS RESILIENCE
  // ═══════════════════════════════════════════════════════════════════════
  crisis_resilience_stress_test?: string;
  crisis_data?: CrisisData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 9: PEER INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════
  peer_intelligence_analysis?: string;
  peer_intelligence_data?: PeerIntelligenceData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 10: MARKET DYNAMICS
  // ═══════════════════════════════════════════════════════════════════════
  market_dynamics_analysis?: string;
  market_dynamics_data?: MarketDynamicsData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 11: IMPLEMENTATION ROADMAP
  // ═══════════════════════════════════════════════════════════════════════
  implementation_roadmap_data?: ImplementationRoadmapData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 12: DUE DILIGENCE (Programmatic)
  // ═══════════════════════════════════════════════════════════════════════
  due_diligence_data?: DueDiligenceDataStructured;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 13-15: WEALTH & SUCCESSION
  // ═══════════════════════════════════════════════════════════════════════
  wealth_projection_data?: WealthProjectionData;
  wealth_projection_analysis?: string;
  scenario_tree_data?: ScenarioTreeData;
  scenario_tree_analysis?: string;
  heir_management_data?: HeirManagementData;
  heir_management_analysis?: string;

  // ═══════════════════════════════════════════════════════════════════════
  // GOLDEN VISA & HNWI TRENDS
  // ═══════════════════════════════════════════════════════════════════════
  destination_drivers?: DestinationDrivers;
  golden_visa_intelligence?: GoldenVisaIntelligence;
  hnwi_trends?: string[];
  hnwi_trends_confidence?: number;
  hnwi_trends_analysis?: string | HnwiTrendsData;
  hnwi_trends_data_quality?: {
    scientific_grounding?: string;
    collections_queried?: number;
    data_sources?: string[];
    trend_count?: number;
  };
  hnwi_trends_citations?: Array<{
    source: string;
    date?: string;
    confidence?: string;
    count?: number;
  }>;

  // ═══════════════════════════════════════════════════════════════════════
  // RISK ASSESSMENT (MCP Fields)
  // ═══════════════════════════════════════════════════════════════════════
  risk_assessment?: RiskAssessment;

  // Raw values for calculations
  value_creation_raw?: {
    annual_tax_savings: number;
    annual_cgt_savings: number;
    total_annual: number;
    five_year_projected: number;
  };

  // Real Asset Audit - Stamp duty, loopholes, trusts, freeports
  real_asset_audit?: RealAssetAuditData;

  // Deal overview
  deal_overview?: {
    move_type?: string;
    target_size?: string;
    jurisdictions?: string;
    timeline?: string;
    risk_pool?: string;
    financing?: string;
    hold_period?: string;
  };
}

// Mistake type for risk display
export interface Mistake {
  title: string;
  cost: string;
  cost_numeric?: number;
  urgency: string;
  fix?: string;
  deadline?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  probability?: number;
}

// Risk Assessment from unified endpoint (MCP fields)
export interface RiskAssessment {
  risk_level?: string;
  total_exposure_formatted?: string;
  critical_items?: number;
  high_priority?: number;
  verdict?: string;
  recommendation?: string;
  is_mcp?: boolean;
}

// Expert 9: Peer Intelligence
export interface PeerIntelligenceData {
  similar_moves?: Array<{
    profile: string;
    move: string;
    outcome: string;
    lessons: string[];
  }>;
  cohort_statistics?: {
    total_similar_moves: number;
    success_rate: string;
    average_savings: string;
    common_mistakes: string[];
  };
}

// Expert 10: Market Dynamics
export interface MarketDynamicsData {
  appreciation_forecast?: { [year: string]: string };
  capital_flows?: {
    inbound_2025?: string;
    source_countries?: string[];
    segment_growth?: { [segment: string]: string };
  };
  key_drivers?: string[];
  red_flags?: string[];
}

// Expert 11: Implementation Roadmap
export interface ImplementationRoadmapData {
  phases?: Array<{
    phase: string;
    tasks: Array<{
      task: string;
      owner: string;
      deadline: string;
    }>;
  }>;
  critical_path?: string[];
  professional_team?: Array<{
    role: string;
    estimated_cost: string;
  }>;
  total_implementation_cost?: string;
}

// Expert 12: Due Diligence (Structured)
export interface DueDiligenceDataStructured {
  checklist?: Array<{
    category: string;
    items: Array<{
      item: string;
      status: string;
      priority: string;
    }>;
  }>;
  completion_status?: {
    critical: { total: number; completed: number };
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
  };
}

// Golden Visa Intelligence
export interface GoldenVisaIntelligence {
  program_name?: string;
  jurisdiction?: string;
  status?: 'ACTIVE' | 'MODIFIED' | 'ENDED';
  qualifies_based_on_transaction?: boolean;
  qualification_summary?: string;
  key_benefits?: Array<{ benefit: string; detail?: string } | string>;
  qualification_routes?: Array<{
    route: string;
    requirement: string;
    property_types?: string;
    processing_time: string;
    family_inclusion?: string;
    recommended_for?: boolean;
  }>;
  critical_considerations?: Array<{
    item: string;
    detail: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  application_process?: Array<{
    step: number;
    action: string;
    timeline: string;
  }>;
  costs?: {
    visa_fee?: string;
    emirates_id?: string;
    medical_test?: string;
    insurance_annual?: string;
    total_initial?: string;
    total_range?: string;
  };
  source?: string;
}

export interface PdfMemoMetadata {
  // Core
  memo_text?: string;
  generated_at?: string;

  // Executive Summary (Experts 1-6)
  executive_verdict?: string;
  definitive_verdict?: 'STOP' | 'GO' | 'PIVOT' | 'GO WITH MODIFICATIONS';
  risk_synthesis?: string;

  // Expert 1: Exposure Analysis
  exposure_summary?: {
    flexibility_collapse_points?: string[];
    expensive_to_reverse?: string[];
    correlated_under_pressure?: string[];
  };

  // Expert 2: Corrected Sequence
  corrected_sequence?: Array<{
    order: number;
    phase: string;
    action: string;
    executor: string;
    timeline: string;
    dependency?: string | null;
    failure_risk: string;
  }>;

  // Expert 4: Stop List
  stop_list?: Array<{
    stop: string;
    cost: string;
    urgency: string;
  }>;

  // Expert 5: Next Move Matrix
  next_move_matrix?: {
    next_action: string;
    executor: string;
    unlocks: string;
    timeline: string;
    script: string;
  };

  // Implementation needs
  implementation_needs?: string[];

  // Evidence anchors (KGv2/v3)
  evidence_anchors?: Array<{
    dev_id: string;
    title: string;
    exit_complexity?: string;
    liquidity_horizon?: string;
    relevance_score?: number;
  }>;

  // KGv3 Intelligence tracking
  kgv3_intelligence_used?: KGIntelligenceUsed;

  // Expert 7: Transparency Regime
  transparency_regime_impact?: string;
  transparency_data?: TransparencyData;

  // Expert 8: Crisis Resilience
  crisis_resilience_stress_test?: string;
  crisis_data?: CrisisData;

  // Expert 13: Heir Management
  heir_management_analysis?: string;
  heir_management_data?: HeirManagementData;

  // Expert 14: Wealth Projection
  wealth_projection_analysis?: string;
  wealth_projection_data?: WealthProjectionData;

  // Expert 15: Scenario Tree
  scenario_tree_analysis?: string;
  scenario_tree_data?: ScenarioTreeData;

  // 10-Year Projections (Frontend-ready)
  ten_year_projections?: {
    portfolio_trajectory?: Array<{ year: number; value: number }>;
    tax_savings_cumulative?: Array<{ year: number; saved: number }>;
  };
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
  cgt?: number;  // Alternative field name from backend (Capital Gains Tax)
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
  // Raw cost string for display (matches frontend which shows raw cost)
  cost_display?: string;
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
    mitigation_timeline?: string;
    mitigation_timeline_days?: number;
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
  // Primary field name from memo-types
  program_name?: string;
  // Fallback name field
  name?: string;
  // Investment fields (memo-types uses minimum_investment)
  minimum_investment?: string;
  investment_min?: string;
  // Duration
  duration?: string;
  // Processing time
  processing_time?: string;
  // Benefits (memo-types uses key_benefits)
  key_benefits?: string[];
  benefits?: string[];
  // Presence requirement
  physical_presence_required?: string;
  // Citizenship path
  path_to_citizenship?: boolean;
  // Investment type
  investment_type?: string;
  // 2025/2026 changes
  "2025_changes"?: string;
  // Status
  status?: string;
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
    summary?: string;
    worst_case_loss?: number | string;  // Can be number or formatted string like "$1,350,000"
    recovery_time?: string;
    buffer_required?: number | string;  // Can be number or formatted string like "$450,000"
  };
  // Backend also provides key_metrics with string values
  key_metrics?: {
    worst_case_loss?: string;   // e.g., "$1,350,000"
    recovery_time?: string;     // e.g., "3 years"
    required_buffer?: string;   // e.g., "$450,000" (note: "required_buffer" not "buffer_required")
  };
  scenarios?: CrisisScenario[];
  recommendations?: CrisisRecommendation[];
  antifragile_opportunity?: AntifragileOpportunity;
}

export interface CrisisScenario {
  name: string;
  id?: string;
  position?: string;
  severity?: 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';  // Alternative to severity
  stress_factor?: string;
  impact?: number | string;  // Can be number or formatted string like "$540,000"
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

// Transparency Regime types - supports both PDF format and frontend format
export interface TransparencyData {
  // PDF format (legacy)
  triggered?: ComplianceItem[];
  not_triggered?: ComplianceItem[];
  // Frontend format - reporting_triggers with status field
  reporting_triggers?: ReportingTrigger[];
  compliance_risks?: ComplianceRisk[];
  regime_changes_2026?: RegimeChange[];
  calendar?: CalendarItem[];
  bottom_line?: {
    // PDF format fields
    total_exposure?: string;
    compliance_cost?: string;
    // Frontend format fields
    total_exposure_if_noncompliant?: string;
    estimated_compliance_cost?: string;
    immediate_actions?: string[];
  };
  immediate_actions?: string[];
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Frontend format reporting trigger
export interface ReportingTrigger {
  framework: string;
  status: 'TRIGGERED' | 'NOT_TRIGGERED' | 'NOT TRIGGERED';
  threshold: string;
  your_exposure: string;
  deadline?: string;
  penalty?: string;
}

export interface RegimeChange {
  regime: string;
  change: string;
  impact_on_you: string;
}

export interface CalendarItem {
  date: string;
  action: string;
  penalty_if_missed: string;
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
  // Frontend uses 'framework' instead of 'regime'
  framework?: string;
  consequence?: string;
  // Frontend uses 'exposure' for the exposure amount
  exposure?: string;
  trigger?: string;
  fix?: string;
}

// =============================================================================
// REAL ASSET AUDIT TYPES - Stamp Duty, Loopholes, Dynasty Trusts, Freeports
// =============================================================================

export interface RealAssetAuditData {
  [jurisdiction: string]: JurisdictionAssetAudit;
}

export interface JurisdictionAssetAudit {
  stamp_duty?: StampDutyData;
  loophole_strategies?: LoopholeStrategy[];
  dynasty_trusts?: DynastyTrustData;
  succession_vehicles?: SuccessionVehicle[];
  freeport_options?: FreeportData;
  data_completeness?: {
    total_sources?: number;
    confidence?: string;
  };
}

export interface StampDutyData {
  found?: boolean;
  foreign_buyer_surcharge?: {
    rate_pct?: number;
    applies_to?: string;
    exemptions?: string[];
  };
  commercial_rates?: {
    base_rate_pct?: number;
    foreign_surcharge_pct?: number;
    notes?: string;
  };
  residential_rates?: StampDutyTier[];
  statute_citation?: string;
  official_source_url?: string;
}

export interface StampDutyTier {
  threshold?: string;
  rate_pct?: number;
  description?: string;
}

export interface LoopholeStrategy {
  name: string;
  description?: string;
  tax_savings_potential?: string;
  risk_level?: 'low' | 'medium' | 'high';
  requirements?: string[];
  timeline?: string;
  legal_basis?: string;
}

export interface DynastyTrustData {
  found?: boolean;
  jurisdictions?: DynastyTrustJurisdiction[];
  recommended?: string;
  rationale?: string;
}

export interface DynastyTrustJurisdiction {
  name: string;
  max_duration?: string;
  tax_benefits?: string[];
  asset_protection?: string;
  setup_cost?: string;
  annual_cost?: string;
  recommended_for?: string;
}

export interface SuccessionVehicle {
  name: string;
  type?: string;
  jurisdiction?: string;
  benefits?: string[];
  limitations?: string[];
  recommended_for?: string;
}

export interface FreeportData {
  found?: boolean;
  freeports?: Freeport[];
  recommended?: string;
}

export interface Freeport {
  name: string;
  location?: string;
  asset_types?: string[];
  tax_benefits?: string[];
  storage_costs?: string;
  insurance_available?: boolean;
  minimum_value?: string;
}
