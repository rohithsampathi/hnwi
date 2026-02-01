// =============================================================================
// SFO PATTERN AUDIT TYPES
// 3 Inputs → IC Artifact Output
// =============================================================================

// =============================================================================
// INPUT TYPES - The 3 SFO-Grade Inputs
// =============================================================================

export interface DecisionThesis {
  // The move being contemplated
  moveDescription: string;        // "Acquire $2M apartment in Dubai for Golden Visa"
  expectedOutcome: string;        // "8-12% annual returns with tax-free income"

  // Optional structured fields (auto-inferred if not provided)
  moveType?: 'real_estate' | 'relocation' | 'private_equity' | 'entity_restructure' | 'crypto' | 'exit_liquidity' | 'other';
  targetAmount?: string;          // "$1M-5M"
  targetLocations?: string[];     // ["Dubai", "UAE"]
  timeline?: string;              // "6 months"
  // Buyer citizenship (passport nationality) — determines FTA stamp duty benefits
  // USSFTA: US citizens get 0% ABSD in Singapore. Green Card ≠ US Citizen.
  buyerCitizenship?: string;      // "United States", "India", "Switzerland"
}

export interface Constraints {
  // Liquidity
  liquidityHorizon: string;       // "6 months", "12+ months"
  liquidityAmountNeeded?: string; // "$500K"
  liquidityEvents: string[];      // ["School fees Aug 2025"]

  // Jurisdictions
  currentJurisdictions: string[];
  prohibitedJurisdictions: string[];

  // Hard prohibitions
  prohibitions: string[];         // ["No off-plan", "No leverage >60%"]
  dealBreakers: string[];         // ["Developer with incomplete projects"]
}

export interface Advisor {
  type: 'tax' | 'legal' | 'wealth' | 'immigration' | 'banker' | '';
  name?: string;
  jurisdiction: string;
}

export interface ExistingEntity {
  type: string;                 // "LLC", "Trust"
  jurisdiction: string;
  purpose?: string;
}

export interface BankingRail {
  bank: string;
  jurisdiction: string;
  status: 'active' | 'pending' | 'planned';
}

export interface ControlAndRails {
  // Decision authority
  finalDecisionMaker: 'principal' | 'spouse_partner' | 'family_committee' | 'board';
  decisionMakersCount: number;
  vetoHolders: string[];
  approvalRequiredAbove?: string; // "$500K requires spouse"

  // Advisors
  advisors: Advisor[];

  // Existing rails
  existingEntities: ExistingEntity[];
  bankingRails: BankingRail[];

  hasFormalIPS: boolean;
  ipsNotes?: string;
}

export interface SFOPatternAuditIntake {
  intakeId?: string;
  principalId?: string;
  submittedAt?: string;

  thesis: DecisionThesis;
  constraints: Constraints;
  controlAndRails: ControlAndRails;

  urgency: 'standard' | 'urgent' | 'priority';
}

// =============================================================================
// STATUS FLOW (SFO Motion: 48-hour audit → preview → payment → full artifact)
// =============================================================================

export type AuditStatus =
  | 'SUBMITTED'      // User submitted, audit in queue
  | 'IN_REVIEW'      // MOEv5 + pattern matching in progress
  | 'PREVIEW_READY'  // Preview available, awaiting payment
  | 'PAID'           // Payment received, generating full artifact
  | 'FULL_READY';    // Complete artifact available

export interface AuditSession {
  intakeId: string;
  principalId: string;
  status: AuditStatus;
  submittedAt: string;
  previewReadyAt?: string;
  paidAt?: string;
  fullReadyAt?: string;
  previewUrl: string;         // Shareable link
  expiresAt: string;          // Preview expires 7 days after generation
  price: number;              // $2,500 or $10,000 for SOTA
  unlockAt?: string;          // Backend-provided unlock timestamp (24h SLA)
  isUnlocked?: boolean;       // Whether the 24h SLA period has passed
}

// =============================================================================
// OUTPUT TYPES - IC Artifact
// =============================================================================

export interface ICVerdict {
  verdict: 'PROCEED' | 'PROCEED WITH MODIFICATIONS' | 'DO NOT PROCEED';
  singleSentence: string;
  thesisSurvives: boolean;
}

export interface ICSequenceStep {
  order: number;
  action: string;
  owner: string;
  timeline: string;
  whyThisOrder: string;
}

export interface ICFailureMode {
  trigger: string;
  mechanism: string;
  damage: string;
  mitigation: string;
}

export interface ICPatternAnchor {
  patternName: string;
  patternClass: string;
  historicalBehavior: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ICNextStep {
  action: string;
  executor: string;
  timeline: string;
  unlocks: string;
  ifBlocked: string;
}

export interface ICScope {
  inScope: string[];
  outOfScope: string[];
  validUntil: string;
}

// =============================================================================
// PREVIEW ARTIFACT (shown before payment - enough for internal approval)
// =============================================================================

export interface SequencePreview {
  total_steps: number;
  first_step: string;
  implied_vs_corrected: boolean;
  message: string;
}

export interface FailureModesPreview {
  count: number;
  triggers: string[];
  has_governance_failure: boolean;
  has_economic_failure: boolean;
  message: string;
}

export interface PatternAnchorsPreview {
  count: number;
  pattern_names: string[];
  message: string;
}

export interface NextStepPreview {
  action_headline: string;
  timeline: string;
  message: string;
}

export interface ScopePreview {
  valid_until: string;
  in_scope_count: number;
  out_of_scope_count: number;
}

export interface IntelligencePreview {
  developments_analyzed: number;
  regulatory_patterns: number;
  failure_modes_identified: number;
  message: string;
}

export interface CallToAction {
  headline: string;
  subheadline: string;
  button_text: string;
  payment_url: string;
}

export interface PreviewArtifact {
  intakeId: string;
  principalId: string;
  thesisSummary: string;
  generatedAt: string;
  status: 'PREVIEW_READY';

  // Visible in preview
  verdict: ICVerdict;                      // Complete verdict (don't redact)
  whyThisMatters: string;                  // 1 paragraph explaining significance

  // Titles only (locked details) - for legacy compatibility
  sequenceTitles: string[];                // Just the action titles, no details
  failureModeTitles: string[];             // Just the triggers, no mechanisms
  patternAnchorTitles: string[];           // Just the pattern names

  // Single line teaser
  nextActionHeadline: string;              // One line: "First: Open UAE bank account"

  // Locked message
  lockedSections: string[];                // ["Full sequence", "Failure mechanisms", "Pattern table", "PDF"]

  // Pricing
  price: number;
  priceDisplay: string;                    // "$2,500"

  intelligenceSources: {
    developmentsMatched: number;
    failurePatternsMatched: number;
    sequencingRulesApplied: number;
  };

  // New structured preview data from backend
  sequencePreview?: SequencePreview;
  failureModesPreview?: FailureModesPreview;
  patternAnchorsPreview?: PatternAnchorsPreview;
  nextStepPreview?: NextStepPreview;
  scopePreview?: ScopePreview;
  intelligencePreview?: IntelligencePreview;
  callToAction?: CallToAction;
}

// =============================================================================
// FULL ARTIFACT (unlocked after payment)
// =============================================================================

// =============================================================================
// SOTA COMPONENTS - Harvard/Stanford OG Standard
// =============================================================================

export interface ImpliedIPS {
  primaryObjective: string;
  secondaryObjectives: string[];
  riskTolerance: string;
  riskCapacity: string;
  volatilityTolerance: string;
  liquidityHorizon: string;
  minimumLiquidBuffer: string;
  liquidityConstraints: string[];
  maxSinglePositionPct: number;
  maxSingleJurisdictionPct: number;
  maxIlliquidPct: number;
  currentConcentrationRisk: string;
  assetClassTargets: Record<string, string>;
  geographicTargets: Record<string, string>;
  prohibitedInvestments: string[];
  restrictedInvestments: string[];
  investmentHorizon: string;
  reviewFrequency: string;
  decisionAuthority: string;
  approvalThresholds: Record<string, string>;
  taxOptimizationPriority: string;
  preferredStructures: string[];
  taxJurisdictions: string[];
  confidenceScore: number;
  missingDataPoints: string[];
}

export interface ReturnScenarioCase {
  name: string;
  probability: number;
  annualReturnPct: string;
  irrEstimate: number | null;
  moicEstimate: number | null;
  annualTaxSavings?: string;
  totalTaxSavings?: string;
  totalValueCreation: string;
  exitTimeline: string;
  exitMethod: string;
  exitHaircut?: string;
  assumptions: string[];
}

export interface ReturnScenarios {
  baseCase: ReturnScenarioCase;
  bullCase: ReturnScenarioCase;
  bearCase: ReturnScenarioCase;
  expectedValue: string;
  riskRewardAssessment: string;
  keySensitivities: string[];
}

export interface DDChecklistItem {
  category: string;
  item: string;
  status: string;
  owner: string;
  notes: string;
  priority: string;
}

export interface DDChecklist {
  moveType: string;
  totalItems: number;
  completedItems: number;
  highPriorityItems: number;
  jurisdictionsCovered: string[];
  assetClassesCovered: string[];
  items: DDChecklistItem[];
}

export interface AlternativeConsidered {
  alternative: string;
  whyNotSelected: string;
  comparativeMetrics: Record<string, string>;
}

export interface ICArtifact {
  intakeId: string;
  principalId: string;
  thesisSummary: string;
  generatedAt: string;
  status: 'FULL_READY';

  verdict: ICVerdict;
  whyThisMatters: string;
  sequence: ICSequenceStep[];
  failureModes: ICFailureMode[];      // Always exactly 2
  patternAnchors: ICPatternAnchor[];  // 1-3 patterns
  nextStep: ICNextStep;
  scope: ICScope;

  intelligenceSources: {
    developmentsMatched: number;
    failurePatternsMatched: number;
    sequencingRulesApplied: number;
  };

  // SOTA Components (Harvard/Stanford OG Standard)
  impliedIps?: ImpliedIPS | null;
  returnScenarios?: ReturnScenarios | null;
  ddChecklist?: DDChecklist | null;
  alternativesConsidered?: AlternativeConsidered[];

  // Shareable after payment
  shareableUrl: string;
  pdfUrl: string;
}

// =============================================================================
// FORM STATE TYPES
// =============================================================================

export type IntakeSection = 'thesis' | 'constraints' | 'controlAndRails';

export interface PatternAuditFormState {
  intake: Partial<SFOPatternAuditIntake>;
  artifact: ICArtifact | null;
  isGenerating: boolean;
  expandedSection: 1 | 2 | 3;
  errors: Record<string, string>;
}

// =============================================================================
// API PAYLOAD TYPES (snake_case for backend)
// =============================================================================

export interface PatternAuditAPIPayload {
  thesis: {
    move_description: string;
    expected_outcome: string;
    move_type?: string;
    target_amount?: string;
    target_locations?: string[];
    timeline?: string;
    buyer_citizenship?: string;
  };
  constraints: {
    liquidity_horizon: string;
    liquidity_amount_needed?: string;
    liquidity_events: string[];
    current_jurisdictions: string[];
    prohibited_jurisdictions: string[];
    prohibitions: string[];
    deal_breakers: string[];
  };
  control_and_rails: {
    final_decision_maker: string;
    decision_makers_count: number;
    veto_holders: string[];
    approval_required_above?: string;
    advisors: Array<{
      type: string;
      name?: string;
      jurisdiction: string;
    }>;
    existing_entities: Array<{
      type: string;
      jurisdiction: string;
      purpose?: string;
    }>;
    banking_rails: Array<{
      bank: string;
      jurisdiction: string;
      status: string;
    }>;
    has_formal_ips: boolean;
    ips_notes?: string;
  };
  urgency: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const MOVE_TYPES = [
  { id: 'real_estate', label: 'Real Estate Acquisition' },
  { id: 'relocation', label: 'Residency/Tax Relocation' },
  { id: 'private_equity', label: 'Private Equity Investment' },
  { id: 'entity_restructure', label: 'Entity Restructuring' },
  { id: 'crypto', label: 'Crypto/Digital Assets' },
  { id: 'exit_liquidity', label: 'Exit/Liquidity Event' },
  { id: 'other', label: 'Other' }
] as const;

export const AMOUNT_RANGES = [
  { id: '$100K-500K', label: '$100K - $500K' },
  { id: '$500K-1M', label: '$500K - $1M' },
  { id: '$1M-5M', label: '$1M - $5M' },
  { id: '$5M-10M', label: '$5M - $10M' },
  { id: '$10M-25M', label: '$10M - $25M' },
  { id: '$25M+', label: '$25M+' }
] as const;

export const LIQUIDITY_HORIZONS = [
  { id: 'Immediate (<30 days)', label: 'Immediate (<30 days)' },
  { id: '30 days', label: '30 days' },
  { id: '90 days', label: '90 days' },
  { id: '6 months', label: '6 months' },
  { id: '12+ months', label: '12+ months (can be illiquid)' }
] as const;

export const TIMELINES = [
  { id: '30 days', label: '30 days' },
  { id: '90 days', label: '90 days' },
  { id: '6 months', label: '6 months' },
  { id: '12 months', label: '12 months' },
  { id: '12+ months', label: '12+ months' }
] as const;

export const DECISION_MAKERS = [
  { id: 'principal', label: 'Principal (sole authority)' },
  { id: 'spouse_partner', label: 'Joint with spouse/partner' },
  { id: 'family_committee', label: 'Family committee' },
  { id: 'board', label: 'Board / Trustees' }
] as const;

export const ADVISOR_TYPES = [
  { id: 'tax', label: 'Tax Advisor' },
  { id: 'legal', label: 'Legal Counsel' },
  { id: 'wealth', label: 'Family Office' },
  { id: 'immigration', label: 'Immigration' },
  { id: 'banker', label: 'Private Banker' }
] as const;

export const JURISDICTIONS = [
  'United States', 'United Kingdom', 'Singapore', 'UAE', 'Switzerland',
  'Hong Kong', 'Cayman Islands', 'BVI', 'Luxembourg', 'Netherlands',
  'India', 'Australia', 'Canada', 'Germany', 'France', 'Portugal',
  'Malta', 'Cyprus', 'Mauritius', 'Bahamas', 'Dubai'
] as const;

// FTA-eligible countries for Singapore stamp duty remission (USSFTA, ESFTA, EFTA)
export const FTA_ELIGIBLE_COUNTRIES = [
  { id: 'United States', label: 'United States', fta: 'USSFTA', note: '0% ABSD (1st property)' },
  { id: 'Switzerland', label: 'Switzerland', fta: 'ESFTA', note: '0% ABSD (1st property)' },
  { id: 'Liechtenstein', label: 'Liechtenstein', fta: 'EFTA', note: '0% ABSD (1st property)' },
  { id: 'Norway', label: 'Norway', fta: 'EFTA', note: '0% ABSD (1st property)' },
  { id: 'Iceland', label: 'Iceland', fta: 'EFTA', note: '0% ABSD (1st property)' },
] as const;

// Full citizenship options for intake form
export const CITIZENSHIP_OPTIONS = [
  { id: 'India', label: 'India' },
  { id: 'United Kingdom', label: 'United Kingdom' },
  { id: 'China', label: 'China' },
  { id: 'Australia', label: 'Australia' },
  { id: 'Canada', label: 'Canada' },
  { id: 'Germany', label: 'Germany' },
  { id: 'France', label: 'France' },
  { id: 'Japan', label: 'Japan' },
  { id: 'South Korea', label: 'South Korea' },
  { id: 'Indonesia', label: 'Indonesia' },
  { id: 'Malaysia', label: 'Malaysia' },
  { id: 'Singapore', label: 'Singapore' },
  { id: 'Thailand', label: 'Thailand' },
  { id: 'Philippines', label: 'Philippines' },
  { id: 'Saudi Arabia', label: 'Saudi Arabia' },
  { id: 'Brazil', label: 'Brazil' },
  { id: 'Mexico', label: 'Mexico' },
  { id: 'Russia', label: 'Russia' },
  { id: 'South Africa', label: 'South Africa' },
  { id: 'Nigeria', label: 'Nigeria' },
  { id: 'Italy', label: 'Italy' },
  { id: 'Spain', label: 'Spain' },
  { id: 'Netherlands', label: 'Netherlands' },
  { id: 'Sweden', label: 'Sweden' },
  { id: 'Israel', label: 'Israel' },
  { id: 'Taiwan', label: 'Taiwan' },
  { id: 'Hong Kong', label: 'Hong Kong (SAR)' },
] as const;
