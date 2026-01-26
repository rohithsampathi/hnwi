// lib/decision-memo/types.ts
// TypeScript types for Decision Memo

export interface InstantPreview {
  exposure_class: 'HIGH' | 'MEDIUM' | 'LOW';
  exposure_description: string;
  coordination_risk_score: number;
  stop_1: string;
  stop_2: string;
  next_move: string;
  memo_eta: string;
  jurisdictions_analyzed: number;
  advisors_involved: number;
  forcing_events_count: number;
  matched_opportunities?: OpportunityMatch[];
  opportunities_count?: number;
  prevented_loss_estimate: number;
}

export interface OpportunityMatch {
  opportunity: {
    title: string;
    tier: string;
    risk: string;
    location: string | { city: string; country: string };
    minimum_investment?: number;
    expected_returns?: string;
  };
  compatibility: 'JUICY' | 'MODERATE' | 'FAR_FETCHED';
  alignment_score: number;
  matched_preferences: {
    industries: string[];
    categories: string[];
    locations: string[];
  };
  why_matched: string;
}

export interface PreviewData {
  preview_id: string;
  instant_preview: InstantPreview;
  user_id: string;
  created_at: string;
}

export interface PaymentOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  intake_packet_id?: string;
  memo_eta?: string;
  error?: string;
}

export type FlowStage = 'landing' | 'intro' | 'assessment' | 'analyzing' | 'preview' | 'success';
