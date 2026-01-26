// lib/decision-memo/schemas.ts
// Zod validation schemas for Decision Memo stress test

import { z } from 'zod';

// Pre-gate qualification schema (legacy)
export const preGateSchema = z.object({
  q0a_moves: z.string().min(20, 'Please be specific. Include amounts, jurisdictions, and timelines.'),
  q0b_timeline: z.enum(['90', '180', '365', '730']),
});

// =============================================================================
// NEW: 3 Smart Questions Schema
// Premium streamlined intake consolidating 10 questions into 3 strategic sections
// =============================================================================

export const smartQuestionsSchema = z.object({
  // Q1: Your Next Wealth Moves (combines old Q1 + Q5 asset intents)
  q1_primary_move: z.string().min(10, 'Please describe your primary move in detail'),
  q1_secondary_move: z.string().optional(),
  q1_asset_focus: z.array(z.enum(['real_estate', 'private_equity', 'offshore_capital', 'crypto', 'art_collectibles'])).min(1, 'Select at least one asset category'),
  q1_move_size: z.enum(['under_500k', '500k_2m', '2m_10m', '10m_plus']).optional(),

  // Q2: Your Wealth Geography (combines old Q2 + Q3 + Q4 + Q7)
  q2_current_residency: z.string().min(1, 'Current residency is required'),
  q2_tax_residence: z.string().min(1, 'Tax residence is required'),
  q2_asset_jurisdictions: z.array(z.string()).min(1, 'Select at least one asset location'),
  q2_planning_move: z.boolean().default(false),
  q2_target_jurisdiction: z.string().optional(),
  q2_existing_structures: z.array(z.string()).optional(),

  // Q3: Timeline & Forcing Events (combines old Q6 + Q8 + Q9 + Q10)
  q3_liquidity_timeline: z.number().min(90, 'Timeline must be at least 90 days'),
  q3_forcing_events: z.array(z.string()).optional(),
  q3_advisor_count: z.number().min(0).max(10).optional(),
  q3_decision_style: z.enum(['deliberate', 'opportunistic', 'deadline_driven']).optional(),
  q3_non_negotiable: z.string().optional(),
});

export type SmartQuestionsFormData = z.infer<typeof smartQuestionsSchema>;

// Main stress test schema
export const stressTestSchema = z.object({
  // Q1: Next Moves (1-3 moves)
  q1_move1: z.string().min(10, 'Please provide more detail (at least 10 characters)'),
  q1_move2: z.string().optional(),
  q1_move3: z.string().optional(),

  // Q2: Current Position
  q2_residency: z.string().min(1, 'Current residency is required'),
  q2_tax_residence: z.string().min(1, 'Tax residence is required'),

  // Q3: Jurisdictions
  q3_asset_jurisdictions: z.array(z.string()).min(1, 'Select at least one asset location'),
  q3_entity_jurisdictions: z.array(z.string()).optional(),

  // Q4: Jurisdiction Changes
  q4_planning_move: z.enum(['yes', 'no']).optional(),
  q4_from: z.string().optional(),
  q4_to: z.string().optional(),
  q4_timeline: z.string().optional(),
  q4_reason: z.string().optional(),

  // Q5: Asset Buckets
  q5_real_estate_intent: z.enum(['hold', 'add', 'reduce', 'hold_add']).optional(),
  q5_real_estate_liquidity: z.enum(['low', 'medium', 'high']).optional(),
  q5_private_equity_intent: z.enum(['hold', 'add', 'reduce', 'hold_add']).optional(),
  q5_private_equity_liquidity: z.enum(['low', 'medium', 'high']).optional(),
  q5_public_markets_intent: z.enum(['hold', 'add', 'reduce', 'hold_add']).optional(),
  q5_public_markets_liquidity: z.enum(['low', 'medium', 'high']).optional(),
  q5_offshore_capital_intent: z.enum(['hold', 'add', 'reduce', 'hold_add']).optional(),
  q5_offshore_capital_liquidity: z.enum(['low', 'medium', 'high']).optional(),

  // Q6: Liquidity Timeline (THE KILLER QUESTION)
  q6_timeline: z.number().min(90, 'Timeline must be at least 90 days'),
  q6_forcing_events: z.array(z.string()).optional(),

  // Q7: Structures
  q7_structures: z.array(z.string()).optional(),

  // Q8: Advisors (COORDINATION RISK)
  q8_advisors: z.array(z.string()).optional(),
  q8_following_playbook: z.boolean().optional(),

  // Q9: Behavioral
  q9_uncertainty: z.enum(['wait', 'act']).default('wait'),
  q9_past_burns: z.string().optional(),

  // Q10: Non-Negotiables
  q10_non_negotiable: z.string().optional(),
});

export type PreGateFormData = z.infer<typeof preGateSchema>;
export type StressTestFormData = z.infer<typeof stressTestSchema>;
