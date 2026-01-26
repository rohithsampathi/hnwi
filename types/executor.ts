// types/executor.ts
// TypeScript interfaces for Trusted Network Directory

// ============================================================================
// REVIEW SYSTEM TYPES
// ============================================================================

export type ReviewSource =
  | "chambers_hnw"      // Chambers High Net Worth - Highest credibility
  | "legal_500"         // Legal 500 - High credibility
  | "trustpilot"        // Trustpilot - Medium credibility
  | "google_reviews"    // Google Reviews - Medium credibility
  | "platform_verified" // HNWI Chronicles verified - High credibility
  | "client_referral";  // Direct client referral - Medium credibility

export type ReviewCredibility = "high" | "medium" | "low";

export interface ReviewSourceMetadata {
  id: ReviewSource;
  name: string;
  credibility: ReviewCredibility;
  color: string;
  description: string;
}

export const REVIEW_SOURCE_METADATA: Record<ReviewSource, ReviewSourceMetadata> = {
  chambers_hnw: {
    id: "chambers_hnw",
    name: "Chambers HNW",
    credibility: "high",
    color: "#059669", // Emerald
    description: "Chambers High Net Worth Guide - Premier legal directory"
  },
  legal_500: {
    id: "legal_500",
    name: "Legal 500",
    credibility: "high",
    color: "#7C3AED", // Purple
    description: "The Legal 500 - Leading legal directory"
  },
  trustpilot: {
    id: "trustpilot",
    name: "Trustpilot",
    credibility: "medium",
    color: "#00B67A", // Trustpilot green
    description: "Trustpilot verified reviews"
  },
  google_reviews: {
    id: "google_reviews",
    name: "Google",
    credibility: "medium",
    color: "#4285F4", // Google blue
    description: "Google Business reviews"
  },
  platform_verified: {
    id: "platform_verified",
    name: "Verified",
    credibility: "high",
    color: "#D4AF37", // Gold
    description: "HNWI Chronicles platform verified"
  },
  client_referral: {
    id: "client_referral",
    name: "Referral",
    credibility: "medium",
    color: "#6B7280", // Gray
    description: "Direct client referral"
  }
};

export interface ExecutorReview {
  review_id: string;
  source: ReviewSource;
  rating: number; // 1-5, supports half stars (e.g., 4.5)
  title?: string;
  text: string;
  reviewer_name?: string; // May be anonymous
  reviewer_title?: string; // e.g., "Family Office Principal"
  reviewer_verified: boolean;
  date: string; // ISO date
  helpful_count?: number;
  response?: {
    text: string;
    date: string;
  };
}

export interface ExecutorReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
  sources: {
    source: ReviewSource;
    count: number;
    average: number;
  }[];
  highlights?: string[]; // Key positive themes
  concerns?: string[]; // Key negative themes (if any)
}

export interface ExecutorFlag {
  type: "warning" | "severe";
  reason: string;
  details?: string;
  source?: string;
  date?: string;
}

// ============================================================================
// EXECUTOR CATEGORY TYPES
// ============================================================================

export type ExecutorCategory =
  | "wealth_planning"
  | "tax_optimization"
  | "legal_services"
  | "alternative_assets"
  | "family_office";

export type ExecutorSubcategory =
  // Wealth Planning
  | "retirement_planning"
  | "estate_planning"
  | "philanthropy"
  | "insurance"
  // Tax Optimization
  | "international_tax"
  | "offshore_structures"
  | "residency_planning"
  | "compliance"
  // Legal Services
  | "corporate_law"
  | "immigration"
  | "trust_formation"
  | "dispute_resolution"
  // Alternative Assets
  | "real_estate"
  | "private_equity"
  | "art_collectibles"
  | "precious_metals"
  | "crypto"
  // Family Office
  | "setup"
  | "governance"
  | "concierge"
  | "education";

export type ExecutorTier = "strategic_partner" | "trusted_network";

export type CurrentCapacity = "available" | "limited" | "unavailable";

export interface Executor {
  executor_id: string;
  first_name: string;
  last_name: string;
  professional_title: string;
  firm_name: string;
  photo_url?: string;
  city: string;
  country: string;
  primary_category: ExecutorCategory;
  primary_subcategory: ExecutorSubcategory;
  jurisdictions: string[];
  languages: string[];
  years_experience: number;
  credentials: string[];
  education?: string;
  bio: string;
  specialization_statement: string;
  professional_memberships?: string[];
  notable_work?: string;
  additional_subcategories?: ExecutorSubcategory[];
  typical_engagement_range?: string;
  typical_timeline?: string;
  consultation_offered: boolean;
  consultation_free?: boolean;
  consultation_duration_minutes?: number;
  current_capacity: CurrentCapacity;
  linkedin_url?: string;
  website_url?: string;
  publications?: string[];
  video_intro_url?: string;
  featured_case_studies?: string;
  tier: ExecutorTier;
  accepting_clients: boolean;
  response_time_commitment?: string;
  platform_join_date?: string;
  // Review system fields
  reviews?: ExecutorReview[];
  review_summary?: ExecutorReviewSummary;
  flags?: ExecutorFlag[];
  is_flagged?: boolean; // Quick check for warning display
}

export interface ExecutorListResponse {
  executors: Executor[];
  total: number;
  limit: number;
  offset: number;
}

export interface IntroductionRequest {
  user_need_description: string;
  urgency?: "low" | "normal" | "high";
  triggered_by?: "manual_request" | "hnwi_world_development" | "crown_vault_alert" | "rohith_recommendation";
  intelligence_context?: string;
  estimated_engagement_value?: string;
  share_crown_vault_assets?: boolean;
  shared_intelligence_brief_id?: string;
}

export interface Introduction {
  intro_id: string;
  executor: {
    executor_id: string;
    first_name: string;
    last_name: string;
    firm_name: string;
    photo_url?: string;
  };
  created_at: string;
  triggered_by: string;
  urgency: string;
  feedback_provided: boolean;
}

export interface IntroductionResponse {
  intro_id: string;
  executor: {
    first_name: string;
    last_name: string;
    firm_name: string;
  };
  intro_sent_at: string;
  expected_response_time?: string;
  message: string;
}

export interface UserIntroductionsResponse {
  introductions: Introduction[];
  total: number;
}

// Category display metadata
export interface CategoryMetadata {
  id: ExecutorCategory;
  name: string;
  description: string;
  icon: string;
  subcategories: { id: ExecutorSubcategory; name: string }[];
}

// Subcategory display names
export const SUBCATEGORY_NAMES: Record<ExecutorSubcategory, string> = {
  // Wealth Planning
  retirement_planning: "Retirement Planning",
  estate_planning: "Estate Planning",
  philanthropy: "Philanthropy & Giving",
  insurance: "Insurance & Risk Management",
  // Tax Optimization
  international_tax: "International Tax",
  offshore_structures: "Offshore Structures",
  residency_planning: "Residency Planning",
  compliance: "Tax Compliance",
  // Legal Services
  corporate_law: "Corporate Law",
  immigration: "Immigration Law",
  trust_formation: "Trust Formation",
  dispute_resolution: "Dispute Resolution",
  // Alternative Assets
  real_estate: "Real Estate",
  private_equity: "Private Equity",
  art_collectibles: "Art & Collectibles",
  precious_metals: "Precious Metals",
  crypto: "Cryptocurrency",
  // Family Office
  setup: "Family Office Setup",
  governance: "Governance & Succession",
  concierge: "Concierge Services",
  education: "Next-Gen Education",
};

// Category metadata with subcategories
export const CATEGORY_METADATA: CategoryMetadata[] = [
  {
    id: "wealth_planning",
    name: "Wealth Planning",
    description: "Strategic wealth advisors for retirement, estate, and generational planning",
    icon: "PiggyBank",
    subcategories: [
      { id: "retirement_planning", name: "Retirement Planning" },
      { id: "estate_planning", name: "Estate Planning" },
      { id: "philanthropy", name: "Philanthropy & Giving" },
      { id: "insurance", name: "Insurance & Risk Management" },
    ],
  },
  {
    id: "tax_optimization",
    name: "Tax Optimization",
    description: "International tax experts for cross-border structures and compliance",
    icon: "Calculator",
    subcategories: [
      { id: "international_tax", name: "International Tax" },
      { id: "offshore_structures", name: "Offshore Structures" },
      { id: "residency_planning", name: "Residency Planning" },
      { id: "compliance", name: "Tax Compliance" },
    ],
  },
  {
    id: "legal_services",
    name: "Legal Services",
    description: "Specialized attorneys for corporate, immigration, and trust matters",
    icon: "Scale",
    subcategories: [
      { id: "corporate_law", name: "Corporate Law" },
      { id: "immigration", name: "Immigration Law" },
      { id: "trust_formation", name: "Trust Formation" },
      { id: "dispute_resolution", name: "Dispute Resolution" },
    ],
  },
  {
    id: "alternative_assets",
    name: "Alternative Assets",
    description: "Specialists in real estate, private equity, art, and digital assets",
    icon: "Gem",
    subcategories: [
      { id: "real_estate", name: "Real Estate" },
      { id: "private_equity", name: "Private Equity" },
      { id: "art_collectibles", name: "Art & Collectibles" },
      { id: "precious_metals", name: "Precious Metals" },
      { id: "crypto", name: "Cryptocurrency" },
    ],
  },
  {
    id: "family_office",
    name: "Family Office",
    description: "Complete family office services for multi-generational wealth",
    icon: "Building2",
    subcategories: [
      { id: "setup", name: "Family Office Setup" },
      { id: "governance", name: "Governance & Succession" },
      { id: "concierge", name: "Concierge Services" },
      { id: "education", name: "Next-Gen Education" },
    ],
  },
];
