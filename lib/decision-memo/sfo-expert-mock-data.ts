/**
 * Mock Data for SFO-Grade Experts (13-15)
 * Use this to test frontend components before backend integration
 *
 * Based on: New York → Sadashivpet, $120K investment
 */

import {
  HeirManagementData,
  WealthProjectionData,
  ScenarioTreeData
} from './sfo-expert-types';

// =============================================================================
// EXPERT 13: HEIR MANAGEMENT MOCK DATA
// =============================================================================

export const mockHeirManagementData: HeirManagementData = {
  third_generation_risk: {
    current_probability_of_loss: 0.70,
    with_structure_probability: 0.15,
    improvement: "55 percentage points"
  },

  heirs: [
    {
      name: "Eldest Son (42)",
      role: "Business Successor",
      involvement_level: "HIGH",
      wealth_readiness: "MODERATE",
      risk_level: "MEDIUM",
      recommended_actions: [
        "Complete family office governance training",
        "Shadow current investment committee decisions",
        "Establish personal advisory relationship with tax counsel"
      ]
    },
    {
      name: "Daughter (38)",
      role: "Portfolio Oversight",
      involvement_level: "MODERATE",
      wealth_readiness: "HIGH",
      risk_level: "LOW",
      recommended_actions: [
        "Formalize role in real estate asset management",
        "Lead Sadashivpet property oversight",
        "Join quarterly family council meetings"
      ]
    },
    {
      name: "Youngest Son (35)",
      role: "Passive Beneficiary",
      involvement_level: "LOW",
      wealth_readiness: "LOW",
      risk_level: "HIGH",
      recommended_actions: [
        "Enroll in wealth management fundamentals program",
        "Assign mentor from family office",
        "Gradual exposure to investment decisions over 24 months",
        "Consider structured distribution schedule"
      ]
    }
  ],

  recommended_structure: {
    type: "Multi-Generation Trust (Delaware Dynasty Trust)",
    benefits: [
      "Perpetual existence - no forced termination",
      "Asset protection from creditors and divorce",
      "Estate tax elimination for future generations",
      "Flexibility to modify for changing circumstances",
      "Professional trustee oversight option"
    ],
    setup_cost: "$25,000",
    annual_cost: "$8,000",
    timeline: "4-6 months",
    third_gen_protection: "HIGH"
  },

  governance_framework: {
    family_council_frequency: "Quarterly",
    decision_threshold: "2/3 majority for distributions over $50K",
    veto_power: "Principal until death/incapacity, then eldest heir",
    succession_triggers: [
      "Death of principal",
      "Incapacity determination by 2 physicians",
      "Voluntary step-down with 90-day notice",
      "Felony conviction of current decision-maker"
    ]
  },

  heir_education_plan: {
    gen_2_actions: [
      "Quarterly investment committee participation",
      "Annual tax strategy review with advisors",
      "Real estate asset management training (Sadashivpet focus)",
      "Cross-border compliance workshop (US-India)",
      "Family constitution drafting participation"
    ],
    gen_3_actions: [
      "Financial literacy program starting age 16",
      "Summer internship at family office age 18+",
      "Trust structure education at age 21",
      "Mentorship pairing with Gen 2 member",
      "Gradual board observer role by age 25"
    ]
  }
};

// =============================================================================
// EXPERT 14: WEALTH PROJECTION MOCK DATA
// =============================================================================

export const mockWealthProjectionData: WealthProjectionData = {
  starting_position: {
    current_net_worth: 2500000,
    transaction_amount: 120000,
    remaining_liquid: 900000,
    annual_income: 350000,
    current_tax_rate: 37,
    target_tax_rate: 30
  },

  scenarios: [
    {
      name: "BASE_CASE",
      probability: 0.60,
      assumptions: [
        "Sadashivpet appreciation: 20% annually",
        "Rental yield: 6.7% ($8K/year)",
        "INR/USD stable within 5%",
        "No major regulatory changes"
      ],
      year_by_year: [
        { year: 0, property_value: 120000, liquid_assets: 900000, income: 350000, tax_saved: 0, net_worth: 2500000 },
        { year: 1, property_value: 144000, liquid_assets: 945000, income: 358000, tax_saved: 24500, net_worth: 2689000 },
        { year: 3, property_value: 207360, liquid_assets: 1039050, income: 374780, tax_saved: 73500, net_worth: 3046410 },
        { year: 5, property_value: 298598, liquid_assets: 1143955, income: 392354, tax_saved: 122500, net_worth: 3442553 },
        { year: 10, property_value: 743008, liquid_assets: 1488142, income: 453158, tax_saved: 245000, net_worth: 4731150 }
      ],
      ten_year_outcome: {
        property_appreciation: 623008,
        investment_growth: 588142,
        tax_savings_cumulative: 245000,
        total_value_creation: 2231150,
        percentage_gain: 89
      }
    },
    {
      name: "STRESS_CASE",
      probability: 0.25,
      assumptions: [
        "Sadashivpet appreciation: 8% annually",
        "Rental yield: 4% (tenant issues)",
        "INR depreciates 15% vs USD",
        "Property tax increase in Telangana"
      ],
      year_by_year: [
        { year: 0, property_value: 120000, liquid_assets: 900000, income: 350000, tax_saved: 0, net_worth: 2500000 },
        { year: 1, property_value: 110160, liquid_assets: 927000, income: 353500, tax_saved: 24500, net_worth: 2537160 },
        { year: 3, property_value: 128470, liquid_assets: 982539, income: 360570, tax_saved: 73500, net_worth: 2711009 },
        { year: 5, property_value: 149837, liquid_assets: 1041295, income: 367782, tax_saved: 122500, net_worth: 2913632 },
        { year: 10, property_value: 220248, liquid_assets: 1203346, income: 389467, tax_saved: 245000, net_worth: 3423594 }
      ],
      ten_year_outcome: {
        property_appreciation: 100248,
        investment_growth: 303346,
        tax_savings_cumulative: 245000,
        total_value_creation: 923594,
        percentage_gain: 37
      }
    },
    {
      name: "OPPORTUNITY_CASE",
      probability: 0.15,
      assumptions: [
        "Sadashivpet appreciation: 35% annually (Pharma City boom)",
        "Rental yield: 10% (wellness resort lease)",
        "INR appreciates 5% vs USD",
        "TS-iPASS infrastructure multiplier"
      ],
      year_by_year: [
        { year: 0, property_value: 120000, liquid_assets: 900000, income: 350000, tax_saved: 0, net_worth: 2500000 },
        { year: 1, property_value: 162000, liquid_assets: 963000, income: 362000, tax_saved: 24500, net_worth: 2825000 },
        { year: 3, property_value: 295245, liquid_assets: 1096363, income: 386420, tax_saved: 73500, net_worth: 3491608 },
        { year: 5, property_value: 538067, liquid_assets: 1246473, income: 412560, tax_saved: 122500, net_worth: 4407040 },
        { year: 10, property_value: 2427836, liquid_assets: 1712765, income: 493580, tax_saved: 245000, net_worth: 7140601 }
      ],
      ten_year_outcome: {
        property_appreciation: 2307836,
        investment_growth: 812765,
        tax_savings_cumulative: 245000,
        total_value_creation: 4640601,
        percentage_gain: 186
      }
    }
  ],

  cost_of_inaction: {
    year_1: 32400,
    year_5: 189000,
    year_10: 567000,
    primary_driver: "Missed appreciation in high-growth Sadashivpet corridor",
    secondary_driver: "Continued exposure to NY state tax burden"
  },

  probability_weighted_outcome: {
    expected_net_worth: 4298115,
    expected_value_creation: 1798115,
    vs_stay_expected: 3150000,
    net_benefit_of_move: 1148115
  }
};

// =============================================================================
// EXPERT 15: SCENARIO DECISION TREE MOCK DATA
// =============================================================================

export const mockScenarioTreeData: ScenarioTreeData = {
  branches: [
    {
      name: "PROCEED_NOW",
      recommendation_strength: 0.60,
      conditions: [
        { condition: "Banking rails established in India", status: "MET" },
        { condition: "Tax advisor sign-off on structure", status: "PENDING" },
        { condition: "Legal title verification complete", status: "PENDING" },
        { condition: "Liquidity buffer of $200K+ maintained", status: "MET" }
      ],
      outcomes: [
        {
          scenario: "BASE_CASE",
          probability: 0.60,
          net_outcome: 1798115,
          description: "Strong appreciation + tax savings deliver $1.8M value creation"
        },
        {
          scenario: "STRESS_CASE",
          probability: 0.25,
          net_outcome: 423594,
          description: "Modest gains despite headwinds, tax savings preserved"
        },
        {
          scenario: "OPPORTUNITY_CASE",
          probability: 0.15,
          net_outcome: 4140601,
          description: "Pharma City boom delivers exceptional returns"
        }
      ],
      expected_value: 1798115,
      verdict: "Proceed with standard execution timeline",
      verdict_conditions: [
        "Tax advisor confirms structure within 14 days",
        "Title search clear",
        "No INR volatility >10% in next 30 days"
      ]
    },
    {
      name: "PROCEED_MODIFIED",
      recommendation_strength: 0.30,
      conditions: [
        { condition: "Banking rails established in India", status: "MET" },
        { condition: "Tax advisor sign-off on structure", status: "BLOCKED" },
        { condition: "Legal title verification complete", status: "PENDING" },
        { condition: "Liquidity buffer of $200K+ maintained", status: "MET" }
      ],
      outcomes: [
        {
          scenario: "BASE_CASE",
          probability: 0.50,
          net_outcome: 1200000,
          description: "Delayed entry reduces appreciation capture by 6 months"
        },
        {
          scenario: "STRESS_CASE",
          probability: 0.35,
          net_outcome: 280000,
          description: "Delayed entry plus headwinds compress returns"
        },
        {
          scenario: "OPPORTUNITY_CASE",
          probability: 0.15,
          net_outcome: 3500000,
          description: "Still capture most of upside despite delay"
        }
      ],
      expected_value: 1122500,
      verdict: "Proceed after resolving tax structure concerns",
      verdict_conditions: [
        "Tax advisor requires >14 days",
        "Title issues need resolution",
        "Wait for INR stabilization"
      ]
    },
    {
      name: "DO_NOT_PROCEED",
      recommendation_strength: 0.10,
      conditions: [
        { condition: "Banking rails established in India", status: "BLOCKED" },
        { condition: "Tax advisor sign-off on structure", status: "BLOCKED" },
        { condition: "Legal title verification complete", status: "BLOCKED" },
        { condition: "Liquidity buffer of $200K+ maintained", status: "BLOCKED" }
      ],
      outcomes: [
        {
          scenario: "BASE_CASE",
          probability: 0.60,
          net_outcome: 0,
          description: "Preserve capital, miss opportunity"
        },
        {
          scenario: "STRESS_CASE",
          probability: 0.25,
          net_outcome: 50000,
          description: "Avoided downside, modest liquid gains"
        },
        {
          scenario: "OPPORTUNITY_CASE",
          probability: 0.15,
          net_outcome: -500000,
          description: "Opportunity cost of missing boom"
        }
      ],
      expected_value: -62500,
      verdict: "Abort - fundamental blockers present",
      verdict_conditions: [
        "Multiple critical conditions blocked",
        "Regulatory environment hostile",
        "Personal circumstances changed"
      ]
    }
  ],

  recommended_branch: "PROCEED_NOW",

  rationale: [
    "63 KGv3 precedents show 78% success rate for similar NY→Telangana moves",
    "Sadashivpet corridor appreciation outpacing Hyderabad metro by 1.4x",
    "Tax structure is favorable with proper US-India treaty utilization",
    "Liquidity position supports $120K deployment without forcing events",
    "Wellness real estate sector showing structural tailwinds through 2028"
  ],

  decision_gates: [
    {
      gate_number: 1,
      day: 7,
      check: "Tax advisor confirms no exit tax liability from NY position",
      if_pass: "Proceed to Gate 2",
      if_fail: "Engage secondary tax counsel, delay 14 days"
    },
    {
      gate_number: 2,
      day: 14,
      check: "Legal title search clear on Sadashivpet parcels",
      if_pass: "Proceed to Gate 3",
      if_fail: "Identify alternative parcels, restart due diligence"
    },
    {
      gate_number: 3,
      day: 21,
      check: "Wire transfer test successful via established rails",
      if_pass: "Execute full transaction",
      if_fail: "Escalate to compliance team, identify backup rails"
    },
    {
      gate_number: 4,
      day: 30,
      check: "Property registration complete with Telangana authorities",
      if_pass: "Transaction complete - begin monitoring",
      if_fail: "Engage local legal counsel for expedited processing"
    }
  ],

  expiry: {
    days: 90,
    reassess_triggers: [
      "INR/USD moves >10%",
      "Telangana property tax policy change",
      "US-India tax treaty modification",
      "Personal liquidity event",
      "Sadashivpet zoning reclassification"
    ]
  },

  decision_matrix: [
    {
      branch: "Proceed Now",
      expected_value: "+$1.8M",
      risk_level: "MODERATE",
      recommended_if: "All conditions MET or PENDING with clear path"
    },
    {
      branch: "Proceed Modified",
      expected_value: "+$1.1M",
      risk_level: "MODERATE",
      recommended_if: "1-2 conditions BLOCKED but resolvable"
    },
    {
      branch: "Do Not Proceed",
      expected_value: "-$63K",
      risk_level: "LOW",
      recommended_if: "Multiple critical BLOCKED conditions"
    }
  ]
};

// =============================================================================
// COMBINED MOCK DATA GENERATOR
// =============================================================================

/**
 * Generate mock SFO expert data for testing
 * Call this to inject test data into preview_data
 */
export function generateMockSFOExpertData() {
  return {
    // Raw analysis text (would come from LLM)
    heir_management_analysis: "Third generation wealth preservation analysis indicates 70% probability of wealth erosion without structured intervention. Recommended Delaware Dynasty Trust structure with quarterly family council governance.",
    wealth_projection_analysis: "10-year projection shows probability-weighted expected value creation of $1.8M with base case achieving 89% portfolio gain. Cost of inaction: $567K over 10 years.",
    scenario_tree_analysis: "Decision tree recommends PROCEED NOW with 60% confidence. Four decision gates over 30-day execution timeline. 90-day validity with 5 reassessment triggers.",

    // Structured data
    heir_management_data: mockHeirManagementData,
    wealth_projection_data: mockWealthProjectionData,
    scenario_tree_data: mockScenarioTreeData
  };
}

/**
 * Check if we should inject mock data (for development/testing)
 */
export function shouldUseMockData(): boolean {
  // Enable mock data in development when backend doesn't return SFO expert data
  return process.env.NODE_ENV === 'development' &&
         process.env.NEXT_PUBLIC_USE_MOCK_SFO_DATA === 'true';
}
