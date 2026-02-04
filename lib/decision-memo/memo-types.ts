// lib/decision-memo/memo-types.ts
// TypeScript interfaces for Decision Memo data structure

import type {
  JurisdictionTaxRates,
  TaxDifferentialFull,
  StructureOptimization,
  ValueCreation,
} from './sfo-expert-types';

/** Regulatory citation backing a specific calculation or assertion */
export interface RegulatoryCitation {
  citation_id: string;
  source_type: string;     // "statute", "regulatory", "market_data", "publication"
  title: string;
  jurisdiction: string;
  statute_section?: string;
  effective_date?: string;
  publisher?: string;
  data_point?: string;
  url?: string;
  verified?: boolean;
}

export interface DecisionMemoData {
  success: boolean;
  intake_id: string;
  generated_at: string;
  preview_data: PreviewData;
  memo_data?: MemoData;
  full_memo_url: string;
  message?: string;
}

export interface MemoData {
  // === CORE MEMO TEXT ===
  memo_text: string;
  generated_at: string;

  // === EXECUTIVE SUMMARY (Experts 1-6 synthesized) ===
  executive_verdict?: string;
  definitive_verdict?: 'STOP' | 'GO' | 'PIVOT' | 'GO WITH MODIFICATIONS';

  // === EXPOSURE ANALYSIS (Expert 1) ===
  exposure_summary?: {
    flexibility_collapse_points: string[];
    expensive_to_reverse: string[];
    correlated_under_pressure: string[];
  };

  // === CORRECTED SEQUENCE (Expert 2) - 8 Steps ===
  corrected_sequence?: Array<{
    order: number;
    phase: string;
    action: string;
    executor: string;
    timeline: string;
    dependency: string | null;
    failure_risk: string;
  }>;

  // === STOP LIST (Expert 4) ===
  stop_list?: Array<{
    stop: string;
    cost: string;
    urgency: string;
  }>;

  // === NEXT MOVE MATRIX (Expert 5) ===
  next_move_matrix?: {
    next_action: string;
    executor: string;
    unlocks: string;
    timeline: string;
    script: string;
  };

  // === RISK SYNTHESIS (Expert 6) ===
  risk_synthesis?: string;

  // === IMPLEMENTATION NEEDS ===
  implementation_needs?: string[];

  // === EVIDENCE ANCHORS (KGv2/v3 precedents) ===
  evidence_anchors: EvidenceAnchor[];
  kgv3_intelligence_used: {
    precedents: number;
    failure_modes: number;
    sequencing_rules: number;
    jurisdictions: number;
  };

  // === EXPERT 7: TRANSPARENCY REGIME ===
  transparency_regime_impact?: string;
  transparency_data?: TransparencyData;

  // === EXPERT 8: CRISIS RESILIENCE ===
  crisis_resilience_stress_test?: string;
  crisis_data?: CrisisData;

  // === EXPERT 13: HEIR MANAGEMENT ===
  heir_management_analysis?: string;
  heir_management_data?: HeirManagementData;

  // === EXPERT 14: WEALTH PROJECTION ===
  wealth_projection_analysis?: string;
  wealth_projection_data?: WealthProjectionData;

  // === EXPERT 15: SCENARIO TREE ===
  scenario_tree_analysis?: string;
  scenario_tree_data?: ScenarioTreeData;

  // === MCP DECISION (From Pattern Audit) ===
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcp_decision?: any;

  // === DD CHECKLIST (Can also be in PreviewData) ===
  dd_checklist?: {
    total_items: number;
    items: Array<{
      category: string;
      item: string;
      status: string;
      priority: string;
    }>;
  };

  // === 10-YEAR EXPLICIT PROJECTIONS (Frontend-ready) ===
  ten_year_projections?: {
    portfolio_trajectory: Array<{ year: number; value: number }>;
    tax_savings_cumulative: Array<{ year: number; saved: number }>;
  };
}

export interface EvidenceAnchor {
  dev_id: string;
  title: string;
  exit_complexity?: string;
  liquidity_horizon?: string;
}

export interface PreviewData {
  opportunities_count: number;
  mistakes_count: number;
  intelligence_count: number;
  total_savings: string;
  exposure_class: string;
  all_opportunities: Opportunity[];
  all_mistakes: Mistake[];
  all_intelligence: Intelligence[];

  // Jurisdiction data for tax dashboard
  source_jurisdiction?: string;
  destination_jurisdiction?: string;
  source_city?: string;
  destination_city?: string;
  source_country?: string;
  destination_country?: string;
  is_relocating?: boolean;

  // Destination drivers (Golden Visa, tax benefits, etc.)
  destination_drivers?: DestinationDrivers;

  // Rich verdict from SOTA
  rich_verdict?: {
    what_they_think_safe: string;
    what_is_fragile: string;
    why_fragile: string;
    consequence_if_unchanged: string;
    correct_sequence: string;
  };

  // Executive verdict
  executive_verdict?: string;

  // Execution sequence for timeline
  execution_sequence?: Array<{
    order: number;
    action: string;
    owner: string;
    timeline: string;
    why_this_order: string;
  }>;

  // Stop list
  stop_list?: Array<{
    number: number;
    stop_action: string;
    until_condition: string;
  }>;

  // Investment thesis
  investment_thesis?: {
    why_makes_sense: string[];
    hidden_risks: string[];
  };

  // DD Checklist
  dd_checklist?: {
    total_items: number;
    items: Array<{
      category: string;
      item: string;
      status: string;
      priority: string;
    }>;
  };

  // Return scenarios
  return_scenarios?: {
    base_case: { probability: number; annual_return_pct: string };
    bull_case: { probability: number; annual_return_pct: string };
    bear_case: { probability: number; annual_return_pct: string };
    expected_value: string;
    risk_reward_assessment: string;
  };

  // Deal overview
  deal_overview?: {
    move_type: string;
    target_size: string;
    jurisdictions: string;
    timeline: string;
    risk_pool: string;
    financing: string;
    hold_period: string;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // REAL ASSET AUDIT (KGv3-Verified)
  // ═══════════════════════════════════════════════════════════════════════

  /** Real Asset Audit - Stamp duty, loopholes, dynasty trusts, freeports */
  real_asset_audit?: RealAssetAuditData;

  // ═══════════════════════════════════════════════════════════════════════
  // SFO-GRADE EXPERT DATA (Experts 13-15)
  // ═══════════════════════════════════════════════════════════════════════

  // Expert 13: Heir Management (Raw Analysis)
  heir_management_analysis?: string;
  // Expert 14: Wealth Projection (Raw Analysis)
  wealth_projection_analysis?: string;
  // Expert 15: Scenario Tree (Raw Analysis)
  scenario_tree_analysis?: string;

  // Expert 13: Heir Management (Structured Data)
  heir_management_data?: {
    third_generation_risk: {
      current_probability_of_loss: number;
      with_structure_probability: number;
      improvement: string;
    };
    heirs: Array<{
      name: string;
      role: string;
      involvement_level: "HIGH" | "MODERATE" | "LOW" | "MINIMAL";
      wealth_readiness: "HIGH" | "MODERATE" | "LOW";
      risk_level: "HIGH" | "MEDIUM" | "LOW";
      recommended_actions: string[];
    }>;
    recommended_structure: {
      type: string;
      benefits: string[];
      setup_cost: string;
      annual_cost: string;
      timeline: string;
      third_gen_protection: "HIGH" | "MODERATE" | "LOW";
    };
    governance_framework: {
      family_council_frequency: string;
      decision_threshold: string;
      veto_power: string;
      succession_triggers: string[];
    };
    heir_education_plan: {
      gen_2_actions: string[];
      gen_3_actions: string[];
    };
  };

  // Expert 14: Wealth Projection (Structured Data)
  wealth_projection_data?: {
    starting_position: {
      current_net_worth: number;
      transaction_amount: number;
      remaining_liquid: number;
      annual_income: number;
      current_tax_rate: number;
      target_tax_rate: number;
    };
    scenarios: Array<{
      name: "BASE_CASE" | "STRESS_CASE" | "OPPORTUNITY_CASE";
      probability: number;
      assumptions: string[];
      year_by_year: Array<{
        year: number;
        property_value: number;
        liquid_assets: number;
        income: number;
        tax_saved: number;
        net_worth: number;
      }>;
      ten_year_outcome: {
        property_appreciation: number;
        investment_growth: number;
        tax_savings_cumulative: number;
        total_value_creation: number;
        percentage_gain: number;
      };
    }>;
    cost_of_inaction: {
      year_1: number;
      year_5: number;
      year_10: number;
      primary_driver: string;
      secondary_driver: string;
    };
    probability_weighted_outcome: {
      expected_net_worth: number;
      expected_value_creation: number;
      vs_stay_expected: number;
      net_benefit_of_move: number;
    };
  };

  // Expert 15: Scenario Decision Tree (Structured Data)
  scenario_tree_data?: {
    branches: Array<{
      name: "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED";
      recommendation_strength: number;
      conditions: Array<{
        condition: string;
        status: "MET" | "PENDING" | "BLOCKED";
      }>;
      outcomes: Array<{
        scenario: "BASE_CASE" | "STRESS_CASE" | "OPPORTUNITY_CASE";
        probability: number;
        net_outcome: number;
        description: string;
      }>;
      expected_value: number;
      verdict: string;
      verdict_conditions: string[];
    }>;
    recommended_branch: "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED";
    rationale: string[];
    decision_gates: Array<{
      gate_number: number;
      day: number;
      check: string;
      if_pass: string;
      if_fail: string;
    }>;
    expiry: {
      days: number;
      reassess_triggers: string[];
    };
    decision_matrix: Array<{
      branch: string;
      expected_value: string;
      risk_level: "HIGH" | "MODERATE" | "LOW";
      recommended_if: string;
    }>;
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 7: TRANSPARENCY REGIME (CRS/FATCA/DAC8 2026)
  // ═══════════════════════════════════════════════════════════════════════
  transparency_regime_impact?: string;
  transparency_data?: TransparencyData;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT 8: CRISIS RESILIENCE (Also in memo_data)
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
  programmatic_dd_checklist?: any[];

  // ═══════════════════════════════════════════════════════════════════════
  // PEER COHORT & REGIME INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════
  peer_cohort_stats?: PeerCohortStats;
  capital_flow_data?: any;

  // ═══════════════════════════════════════════════════════════════════════
  // GOLDEN VISA INTELLIGENCE (KGv3)
  // ═══════════════════════════════════════════════════════════════════════
  golden_visa_intelligence?: GoldenVisaIntelligence;

  // ═══════════════════════════════════════════════════════════════════════
  // HNWI TRENDS
  // ═══════════════════════════════════════════════════════════════════════
  hnwi_trends?: string[];
  hnwi_trends_confidence?: number;
  hnwi_trends_data_quality?: HNWITrendsDataQuality;
  hnwi_trends_citations?: HNWITrendsCitation[];
  hnwi_trends_analysis?: string;

  // ═══════════════════════════════════════════════════════════════════════
  // TAX DATA & STRUCTURE OPTIMIZATION (MCP Core)
  // ═══════════════════════════════════════════════════════════════════════
  source_tax_rates?: JurisdictionTaxRates;
  destination_tax_rates?: JurisdictionTaxRates;
  tax_differential?: TaxDifferentialFull;
  value_creation?: ValueCreation;

  // Structure Optimization Engine output
  structure_optimization?: StructureOptimization | null;
  /** Backend flag: false for non-relocation cross-border purchases */
  show_tax_savings?: boolean;

  // Transaction metadata
  transaction_value?: number;
  transaction_value_formatted?: string;

  // Regulatory Citations (institutional-grade footnotes: IRAS, USSFTA, IRC, FinCEN)
  regulatory_citations?: RegulatoryCitation[];

  // Via Negativa (DO_NOT_PROCEED overlay)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  via_negativa?: any;

  // MCP decision context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcp_decision?: any;

  // ═══════════════════════════════════════════════════════════════════════
  // RISK ASSESSMENT (MCP Fields)
  // ═══════════════════════════════════════════════════════════════════════
  risk_assessment?: RiskAssessment;

  // ═══════════════════════════════════════════════════════════════════════
  // DATA QUALITY METRICS
  // ═══════════════════════════════════════════════════════════════════════
  data_quality?: string;
  data_quality_note?: string;
}

// =============================================================================
// EXPERT DATA TYPES
// =============================================================================

export interface TransparencyData {
  reporting_triggers: Array<{
    regime: string;
    threshold: string;
    deadline: string;
    penalty: string;
    applies_to_you: boolean;
  }>;
  compliance_risks?: any[];
  regime_changes_2026?: any[];
  calendar?: any[];
  bottom_line?: {
    total_reports_required: number;
    key_deadlines: string[];
    estimated_compliance_cost: string;
  };
}

export interface CrisisData {
  scenarios: Array<{
    name: string;
    probability: string;
    impact_on_thesis: string;
    portfolio_drawdown: string;
    mitigation: string;
  }>;
  overall_resilience?: {
    score: number;
    rating: string;
    key_vulnerabilities: string[];
  };
  recommendations?: any[];
  key_metrics?: {
    max_drawdown: string;
    recovery_time: string;
    cash_buffer_needed: string;
  };
}

export interface HeirManagementData {
  heirs: Array<{
    name: string;
    relationship: string;
    recommended_allocation_pct?: number;
    recommended_structure?: string;
    third_generation_risk?: string;
    mitigation?: string;
    role?: string;
    involvement_level?: "HIGH" | "MODERATE" | "LOW" | "MINIMAL";
    wealth_readiness?: "HIGH" | "MODERATE" | "LOW";
    risk_level?: "HIGH" | "MEDIUM" | "LOW";
    recommended_actions?: string[];
  }>;
  succession_vehicles?: {
    recommended: string;
    alternatives: string[];
    estimated_setup_cost: string;
    annual_maintenance: string;
  };
  sharia_risk?: {
    applies: boolean;
    forced_heirship_rules: string;
    mitigation: string;
  };
  third_generation_protection?: {
    risk_level: string;
    statistics: string;
    recommendations: string[];
  };
  third_generation_risk?: {
    current_probability_of_loss: number;
    with_structure_probability: number;
    improvement: string;
  };
  recommended_structure?: {
    type: string;
    benefits: string[];
    setup_cost: string;
    annual_cost: string;
    timeline: string;
    third_gen_protection: "HIGH" | "MODERATE" | "LOW";
  };
  governance_framework?: {
    family_council_frequency: string;
    decision_threshold: string;
    veto_power: string;
    succession_triggers: string[];
  };
  heir_education_plan?: {
    gen_2_actions: string[];
    gen_3_actions: string[];
  };
}

export interface WealthProjectionData {
  starting_portfolio?: number;
  currency?: string;
  scenarios?: {
    base?: WealthScenario;
    optimistic?: WealthScenario;
    pessimistic?: WealthScenario;
  };
  tax_savings_vs_us?: {
    year_1: number;
    year_5: number;
    year_10: number;
    breakdown?: {
      income_tax_saved: number;
      cgt_saved: number;
      estate_tax_saved: number;
    };
  };
  key_assumptions?: any[];
  sensitivity_analysis?: any;
  starting_position?: {
    current_net_worth: number;
    transaction_amount: number;
    remaining_liquid: number;
    annual_income: number;
    current_tax_rate: number;
    target_tax_rate: number;
  };
  cost_of_inaction?: {
    year_1: number;
    year_5: number;
    year_10: number;
    primary_driver: string;
    secondary_driver: string;
  };
  probability_weighted_outcome?: {
    expected_net_worth: number;
    expected_value_creation: number;
    vs_stay_expected: number;
    net_benefit_of_move: number;
  };
}

export interface WealthScenario {
  year_1?: number;
  year_3?: number;
  year_5?: number;
  year_10?: number;
  cagr?: string;
  assumptions?: string[];
  name?: string;
  probability?: number;
  year_by_year?: Array<{
    year: number;
    property_value: number;
    liquid_assets: number;
    income: number;
    tax_saved: number;
    net_worth: number;
  }>;
  ten_year_outcome?: {
    property_appreciation: number;
    investment_growth: number;
    tax_savings_cumulative: number;
    total_value_creation: number;
    percentage_gain: number;
  };
}

export interface ScenarioTreeData {
  decision_tree?: {
    root: {
      question: string;
      options: Array<{
        choice: string;
        probability: string;
        outcome?: string;
        expected_value?: string;
        next?: {
          question: string;
          options: Array<{
            choice: string;
            outcome: string;
            expected_value: string;
          }>;
        };
      }>;
    };
  };
  recommended_path?: string[];
  contingency_triggers?: Array<{
    trigger: string;
    action: string;
  }>;
  branches?: Array<{
    name: "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED";
    recommendation_strength: number;
    conditions: Array<{
      condition: string;
      status: "MET" | "PENDING" | "BLOCKED";
    }>;
    outcomes: Array<{
      scenario: "BASE_CASE" | "STRESS_CASE" | "OPPORTUNITY_CASE";
      probability: number;
      net_outcome: number;
      description: string;
    }>;
    expected_value: number;
    verdict: string;
    verdict_conditions: string[];
  }>;
  recommended_branch?: "PROCEED_NOW" | "PROCEED_MODIFIED" | "DO_NOT_PROCEED";
  rationale?: string[];
  decision_gates?: Array<{
    gate_number: number;
    day: number;
    check: string;
    if_pass: string;
    if_fail: string;
  }>;
  expiry?: {
    days: number;
    reassess_triggers: string[];
  };
  decision_matrix?: Array<{
    branch: string;
    expected_value: string;
    risk_level: "HIGH" | "MODERATE" | "LOW";
    recommended_if: string;
  }>;
}

export interface PeerIntelligenceData {
  similar_moves: Array<{
    profile: string;
    move: string;
    outcome: string;
    lessons: string[];
  }>;
  cohort_statistics: {
    total_similar_moves: number;
    success_rate: string;
    average_savings: string;
    common_mistakes: string[];
  };
}

export interface MarketDynamicsData {
  appreciation_forecast: {
    [year: string]: string;
  };
  capital_flows: {
    inbound_2025: string;
    source_countries: string[];
    segment_growth: { [segment: string]: string };
  };
  key_drivers: string[];
  red_flags: string[];
}

export interface ImplementationRoadmapData {
  phases: Array<{
    phase: string;
    tasks: Array<{
      task: string;
      owner: string;
      deadline: string;
    }>;
  }>;
  critical_path: string[];
  professional_team: Array<{
    role: string;
    estimated_cost: string;
  }>;
  total_implementation_cost: string;
}

export interface DueDiligenceDataStructured {
  checklist: Array<{
    category: string;
    items: Array<{
      item: string;
      status: string;
      priority: string;
    }>;
  }>;
  completion_status: {
    critical: { total: number; completed: number };
    high: { total: number; completed: number };
    medium: { total: number; completed: number };
  };
}

export interface PeerCohortStats {
  total_peers?: number;
  data_quality?: string;
  data_quality_note?: string;
  is_relocating?: boolean;
  last_6_months?: number;
  avg_deal_value_m?: number;
  drivers?: string[];
  regime_intelligence?: {
    has_special_regime: boolean;
    regime_name?: string;
    regime_type?: string;
    key_benefits?: Array<string | { benefit: string; detail?: string }>;
    rates?: {
      foreign_income?: number;
      local_income?: number;
      cgt?: number;
      wealth_tax?: number;
      estate_tax?: number;
    };
    qualification?: {
      minimum_investment?: string;
      processing_time?: string;
      duration?: string;
    };
  };
}

export interface TaxRates {
  income_tax?: number;
  cgt?: number;
  wealth_tax?: number;
  estate_tax?: number;
  effective?: number;
}

export interface RiskAssessment {
  risk_level?: string;
  total_exposure_formatted?: string;
  total_exposure?: string;  // Alias for total_exposure_formatted (backend sometimes uses this)
  critical_items?: number;
  high_priority?: number;
  verdict?: string;
  recommendation?: string;
  verdict_note?: string;
  mitigation_timeline?: string;
  is_mcp?: boolean;
}

export interface Opportunity {
  title: string;
  location: string;
  tier: string;
  expected_return: string;
  alignment_score?: number;
  dna_match_score?: number;
  dev_id?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  country?: string;
  minimum_investment?: string;
  industry?: string;
  // Rich analysis fields from Command Centre
  hnwi_analysis?: string;  // Full HNWI-focused analysis with DEVIDs
  opportunity_narrative?: string;  // Narrative summary
  key_insights?: string[];  // Key insight bullets
  risk_level?: string;  // Risk assessment
  source?: string;  // Source attribution (Command Centre, Privé Exchange, etc.)
  // Scientific relevance factors
  relevance_recommendation?: 'highly_relevant' | 'relevant' | 'moderately_relevant' | 'not_relevant';
  relevance_factors?: {
    asset_class_match: number;
    location_match: number;
    tier_alignment: number;
    source_credibility: number;
    data_freshness: number;
  };
  relevance_reasoning?: string[];
}

export interface Mistake {
  title: string;
  cost: string;
  cost_numeric?: number;  // Pre-calculated numeric cost from backend
  urgency: string;
  fix?: string;
  deadline?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  probability?: number;
}

export interface Intelligence {
  title: string;
  impact: string;
  source?: string;
  relevance?: number;
  dev_id?: string;
}

export interface TaxData {
  jurisdiction: string;
  income_tax: number;
  cgt: number;
  wealth_tax: number;
  estate_tax: number;
  effective: number;
}

export interface VerdictData {
  decision: 'APPROVED' | 'CONDITIONAL' | 'STOP';
  emoji: string;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TimelinePhase {
  name: string;
  days: number;
  month: string;
  dependencies?: string[];
}

export interface DueDiligenceItem {
  task: string;
  contact?: string;
  requirements?: string;
  timeline: string;
  advisor?: string;
  checked?: boolean;
}

export interface StrengthItem {
  title: string;
  impact?: string;
  detail?: string;
}

// =============================================================================
// GOLDEN VISA / INVESTMENT MIGRATION TYPES
// =============================================================================

export interface VisaProgram {
  /** Program name (e.g., "UAE Golden Visa") */
  program_name: string;
  /** Minimum investment requirement (e.g., "AED 2,000,000 (~USD 545,000)") */
  minimum_investment: string;
  /** Visa duration (e.g., "10 years renewable") */
  duration?: string;
  /** Processing time (e.g., "30 days (fast-track available)") */
  processing_time?: string;
  /** Key benefits array */
  key_benefits?: string[];
  /** Physical presence requirement (e.g., "None", "183 days/year") */
  physical_presence_required?: string;
  /** Whether there's a path to citizenship */
  path_to_citizenship?: boolean;
  /** Type of investment required (e.g., "Real estate or business") */
  investment_type?: string;
  /** 2025/2026 policy changes */
  "2025_changes"?: string;
  /** Program status (e.g., "Active", "Active (limited)", "Suspended") */
  status?: string;
  /** Data source from KG */
  source?: string;
}

export interface DestinationDrivers {
  /** Golden Visa / Investment Migration programs */
  visa_programs?: VisaProgram[];
  /** Tax regime benefits */
  tax_benefits?: string[];
  /** Lifestyle factors */
  lifestyle_factors?: string[];
  /** Business environment factors */
  business_environment?: string[];
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

// =============================================================================
// GOLDEN VISA INTELLIGENCE (Enhanced)
// =============================================================================

export interface GoldenVisaBenefit {
  benefit: string;
  detail: string;
}

export interface GoldenVisaQualificationRoute {
  route: string;
  requirement: string;
  property_types?: string;
  processing_time: string;
  family_inclusion?: string;
  recommended_for?: boolean;
}

export interface GoldenVisaCriticalConsideration {
  item: string;
  detail: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GoldenVisaApplicationStep {
  step: number;
  action: string;
  timeline: string;
}

export interface GoldenVisaCosts {
  visa_fee?: string;
  emirates_id?: string;
  medical_test?: string;
  insurance_annual?: string;
  total_initial?: string;
  total_range?: string;
}

export interface GoldenVisaIntelligence {
  program_name: string;
  jurisdiction: string;
  status: 'ACTIVE' | 'MODIFIED' | 'ENDED';
  qualifies_based_on_transaction: boolean;
  qualification_summary: string;
  key_benefits: GoldenVisaBenefit[];
  qualification_routes: GoldenVisaQualificationRoute[];
  critical_considerations: GoldenVisaCriticalConsideration[];
  application_process?: GoldenVisaApplicationStep[];
  costs?: GoldenVisaCosts;
  source: string;
}

// =============================================================================
// HNWI TRENDS
// =============================================================================

export interface HNWITrendsCitation {
  source: string;
  date?: string;
  confidence?: string;
  count?: number;
}

export interface HNWITrendsDataQuality {
  scientific_grounding: 'kgv3_primary' | 'kgv3_fallback' | 'no_data' | 'error';
  collections_queried: number;
  data_sources: string[];
  trend_count: number;
}

export interface HNWITrendsData {
  hnwi_trends: string[];
  hnwi_trends_confidence: number;
  hnwi_trends_data_quality: HNWITrendsDataQuality;
  hnwi_trends_citations: HNWITrendsCitation[];
}

// =============================================================================
// REAL ASSET AUDIT TYPES - Stamp Duty, Loopholes, Dynasty Trusts, Freeports
// =============================================================================

export interface RealAssetAuditData {
  [jurisdiction: string]: RealAssetAuditJurisdiction;
}

export interface RealAssetAuditJurisdiction {
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
  found: boolean;
  foreign_buyer_surcharge?: {
    rate_pct: number;
    effective_date?: string;
    description?: string;
    applies_to?: string;
    exemptions?: string[];
  };
  commercial_rates?: {
    base_rate_pct?: number;
    foreign_surcharge_pct: number;
    note?: string;
  };
  residential_rates?: Array<{
    threshold_sgd?: number;
    threshold?: string;
    rate_pct: number;
    description?: string;
  }>;
  statute_citation?: string;
  official_source_url?: string;
}

export interface LoopholeStrategy {
  name: string;
  mechanism?: string;
  description?: string;
  tax_savings_potential: string;
  requirements?: string[];
  risks?: string[];
  timeline?: string;
  official_source_url?: string;
  legal_basis?: string;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface DynastyTrustData {
  found: boolean;
  jurisdictions?: DynastyTrustJurisdiction[];
  best_for_perpetuity?: string;
  recommended?: string;
  rationale?: string;
}

export interface DynastyTrustJurisdiction {
  jurisdiction?: string;
  name?: string;
  perpetuity_period?: string;
  perpetuity_years?: number;
  max_duration?: string;
  asset_protection?: string;
  tax_benefits?: string[];
  setup_cost?: string;
  annual_cost?: string;
  recommended_for?: string;
}

export interface SuccessionVehicle {
  vehicle_type?: string;
  type?: string;
  name: string;
  jurisdiction?: string;
  tax_benefits?: string[];
  benefits?: string[];
  limitations?: string[];
  statute_citation?: string;
  recommended_for?: string;
}

export interface FreeportData {
  found: boolean;
  freeports?: Freeport[];
  recommended?: string;
}

export interface Freeport {
  name: string;
  jurisdiction?: string;
  location?: string;
  asset_types?: string[];
  tax_benefits?: string[];
  storage_costs?: string;
  insurance_available?: boolean;
  minimum_value?: string;
}

// =============================================================================
// VIA NEGATIVA: Pessimistic-but-fair audit mode
// Activates when structure_optimization.verdict === "DO_NOT_PROCEED"
// Strengths acknowledged. Weaknesses stated without qualification.
// Labels are backend-driven via preview_data.via_negativa; frontend falls back
// to defaults below when the backend field is absent.
// =============================================================================

export interface ViaNegativaContext {
  /** Whether Via Negativa mode is active */
  isActive: boolean;

  // ── Computed values ──────────────────────────────────────────────────────
  /** Day-one loss percentage from acquisition costs */
  dayOneLoss: number;
  /** Day-one loss dollar amount */
  dayOneLossAmount: number;
  /** Total FBAR + compliance penalty exposure */
  totalConfiscationExposure: number;
  /** Tax Efficiency pass/fail */
  taxEfficiencyPassed: boolean;
  /** Liquidity pass/fail (day-one loss < 10%) */
  liquidityPassed: boolean;
  /** Structure viability pass/fail */
  structurePassed: boolean;

  // ── Labels (backend-driven, with frontend defaults) ──────────────────────
  /** Posture statement explaining Via Negativa approach */
  analysisPosture: string;
  /** Header badge label (e.g. "ELEVATED RISK") */
  badgeLabel: string;
  /** Title prefix (e.g. "Capital At") */
  titlePrefix: string;
  /** Title highlight word (e.g. "Risk") */
  titleHighlight: string;
  /** Notice box title */
  noticeTitle: string;
  /** Notice box body (template with {dayOneLoss}, {precedentCount}) */
  noticeBody: string;

  // ── Metric labels ────────────────────────────────────────────────────────
  metricLabels: {
    capitalExposure: string;
    structureVerdict: string;
    structureVerdictValue: string;
    structureVerdictDesc: string;
    regulatoryExposure: string;
    regulatoryExposureDesc: string;
  };

  // ── Scenario / projection audit labels ────────────────────────────────────
  scenarioHeader: string;
  expectationLabel: string;
  actualLabel: string;
  commentaryTitle: string;
  commentaryBody: string;

  // ── Tax section labels ────────────────────────────────────────────────────
  taxBadgeLabel: string;
  taxTitleLine1: string;
  taxTitleLine2: string;
  compliancePrefix: string;
  warningPrefix: string;

  // ── Verdict section labels ────────────────────────────────────────────────
  verdictHeader: string;
  verdictBadgeLabel: string;
  stampText: string;
  stampSubtext: string;

  // ── CTA labels ────────────────────────────────────────────────────────────
  ctaHeadline: string;
  ctaBody: string;
  ctaScarcity: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  ctaContextNote: string;
}
