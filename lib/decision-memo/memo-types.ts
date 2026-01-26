// lib/decision-memo/memo-types.ts
// TypeScript interfaces for Decision Memo data structure

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
  memo_text: string;
  evidence_anchors: EvidenceAnchor[];
  kgv3_intelligence_used: {
    precedents: number;
    failure_modes: number;
    sequencing_rules: number;
    jurisdictions: number;
  };
  generated_at: string;
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
