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
  moveType?: 'real_estate' | 'art' | 'jewellery' | 'metals' | 'collectibles' | 'automotive';
  targetAmount?: string;          // "$1M-5M"
  targetLocations?: string[];     // ["Dubai", "UAE"]
  timeline?: string;              // "6 months"
  // Buyer citizenship (passport nationality) — determines FTA stamp duty benefits
  // USSFTA: US citizens get 0% ABSD in Singapore. Green Card ≠ US Citizen.
  buyerCitizenship?: string;      // "United States", "India", "Switzerland"

  // Jurisdiction detail fields (backend uses for tax corridor analysis)
  sourceJurisdiction?: string;       // Where capital currently sits
  sourceState?: string;              // US state if applicable
  destinationJurisdiction?: string;  // Where capital is going
  destinationState?: string;         // US state if applicable
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

  // Property-specific (backend uses for ABSD tier calculations)
  destinationPropertyCount?: number;  // How many properties at destination
  purchaseVehicle?: string;           // "personal" | "entity" | "optimize"
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

export interface Heir {
  name: string;
  relationship: string;   // "daughter", "son", "grandchild"
  age: number;
  allocationPct: number;  // 0-1 (e.g. 0.4 = 40%)
  notes?: string;
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

  // Succession planning
  heirs?: Heir[];
}

export interface AssetDetails {
  // Common to all asset types
  estimatedValue: number;           // 6160000

  // Real Estate
  propertyType?: string;            // "residential_apartment", "villa", "commercial"
  locationPreference?: string;      // "Dubai Marina", "Downtown"
  sizeSqft?: number;                // 1500
  bedrooms?: number;                // 2
  rentalYieldPct?: number;          // 6.5
  appreciationPct?: number;         // 4.0

  // Art
  artCategory?: string;             // "painting", "sculpture", "photography"
  artist?: string;                  // "Anish Kapoor"
  medium?: string;                  // "oil_on_canvas", "bronze"
  period?: string;                  // "contemporary", "modern"

  // Jewellery
  jewelleryType?: string;           // "ring", "necklace", "watch"
  primaryMaterial?: string;         // "gold", "platinum", "diamond"
  certification?: string;           // "GIA", "HRD"

  // Precious Metals
  metalType?: string;               // "gold", "silver", "platinum"
  metalForm?: string;               // "bars", "coins", "etf_backed"
  weight?: string;                  // "100 oz", "5 kg"
  storageMethod?: string;           // "self", "vault", "allocated"

  // Collectibles
  collectibleCategory?: string;     // "wine", "watches", "stamps"
  description?: string;             // Free text

  // Automotive
  vehicleType?: string;             // "classic_car", "supercar", "vintage_motorcycle"
  makeModel?: string;               // "1963 Ferrari 250 GTO"
  year?: number;                    // 1963
  mileage?: string;                 // "12,000 miles"

  // Shared across types
  condition?: string;               // "mint", "excellent", "good", "fair"
  provenance?: string;              // "known", "partial", "unknown"
  brand?: string;                   // "Cartier", "Ferrari" — jewellery, automotive
}

export interface SFOPatternAuditIntake {
  intakeId?: string;
  principalId?: string;
  submittedAt?: string;

  // Identity & consent (required by backend)
  email: string;
  nationality?: string;
  ndaConsent: boolean;
  privacyConsent: boolean;

  thesis: DecisionThesis;
  constraints: Constraints;
  controlAndRails: ControlAndRails;
  assetDetails?: AssetDetails;

  urgency: 'standard' | 'urgent' | 'priority';
  format?: 'full_audit' | 'executive_summary';
}

// Flow phase for the intake page
export type IntakeFlowPhase = 'form' | 'summary' | 'processing';

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

export type IntakeSection = 'thesis' | 'constraints' | 'controlAndRails' | 'assetDetails';

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
  // Top-level identity & consent
  email: string;
  nationality?: string;
  nda_consent: boolean;
  privacy_consent: boolean;

  thesis: {
    move_description: string;
    expected_outcome: string;
    move_type?: string;
    target_amount?: string;
    target_locations?: string[];
    timeline?: string;
    buyer_citizenship?: string;
    source_jurisdiction?: string;
    source_state?: string;
    destination_jurisdiction?: string;
    destination_state?: string;
  };
  constraints: {
    liquidity_horizon: string;
    liquidity_amount_needed?: string;
    liquidity_events: string[];
    current_jurisdictions: string[];
    prohibited_jurisdictions: string[];
    prohibitions: string[];
    deal_breakers: string[];
    destination_property_count?: number;
    purchase_vehicle?: string;
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
    heirs?: Array<{
      name: string;
      relationship: string;
      age: number;
      allocation_pct: number;
      notes?: string;
    }>;
  };
  asset_details?: {
    estimated_value: number;
    // Real Estate
    property_type?: string;
    location_preference?: string;
    size_sqft?: number;
    bedrooms?: number;
    rental_yield_pct?: number;
    appreciation_pct?: number;
    // Art
    art_category?: string;
    artist?: string;
    medium?: string;
    period?: string;
    // Jewellery
    jewellery_type?: string;
    primary_material?: string;
    certification?: string;
    // Metals
    metal_type?: string;
    metal_form?: string;
    weight?: string;
    storage_method?: string;
    // Collectibles
    collectible_category?: string;
    description?: string;
    // Automotive
    vehicle_type?: string;
    make_model?: string;
    year?: number;
    mileage?: string;
    // Shared
    condition?: string;
    provenance?: string;
    brand?: string;
  };
  urgency: string;
  format?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const MOVE_TYPES = [
  { id: 'real_estate', label: 'Real Estate' },
  { id: 'art', label: 'Art' },
  { id: 'jewellery', label: 'Jewellery' },
  { id: 'metals', label: 'Precious Metals' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'automotive', label: 'Automotive' },
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

export const PROPERTY_TYPES = [
  { id: 'residential_apartment', label: 'Residential Apartment' },
  { id: 'villa', label: 'Villa / House' },
  { id: 'commercial', label: 'Commercial Property' },
  { id: 'land', label: 'Land / Plot' },
  { id: 'mixed_use', label: 'Mixed Use' },
  { id: 'hospitality', label: 'Hospitality / Hotel' },
  { id: 'other', label: 'Other' }
] as const;

export const ART_CATEGORIES = [
  { id: 'painting', label: 'Painting' },
  { id: 'sculpture', label: 'Sculpture' },
  { id: 'photography', label: 'Photography' },
  { id: 'mixed_media', label: 'Mixed Media' },
  { id: 'print', label: 'Print / Edition' },
  { id: 'installation', label: 'Installation' },
] as const;

export const ART_PERIODS = [
  { id: 'contemporary', label: 'Contemporary' },
  { id: 'modern', label: 'Modern' },
  { id: 'post_war', label: 'Post-War' },
  { id: 'impressionist', label: 'Impressionist' },
  { id: 'old_masters', label: 'Old Masters' },
] as const;

export const ART_MEDIUMS = [
  { id: 'oil_on_canvas', label: 'Oil on Canvas' },
  { id: 'acrylic', label: 'Acrylic' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'bronze', label: 'Bronze' },
  { id: 'marble', label: 'Marble' },
  { id: 'mixed', label: 'Mixed Media' },
  { id: 'digital', label: 'Digital' },
] as const;

export const JEWELLERY_TYPES = [
  { id: 'ring', label: 'Ring' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'bracelet', label: 'Bracelet' },
  { id: 'watch', label: 'Watch' },
  { id: 'brooch', label: 'Brooch' },
  { id: 'earrings', label: 'Earrings' },
  { id: 'set', label: 'Complete Set' },
] as const;

export const JEWELLERY_MATERIALS = [
  { id: 'gold', label: 'Gold' },
  { id: 'platinum', label: 'Platinum' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'ruby', label: 'Ruby' },
  { id: 'sapphire', label: 'Sapphire' },
] as const;

export const METAL_TYPES = [
  { id: 'gold', label: 'Gold' },
  { id: 'silver', label: 'Silver' },
  { id: 'platinum', label: 'Platinum' },
  { id: 'palladium', label: 'Palladium' },
] as const;

export const METAL_FORMS = [
  { id: 'bars', label: 'Bars / Ingots' },
  { id: 'coins', label: 'Coins' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'etf_backed', label: 'ETF-Backed' },
] as const;

export const STORAGE_METHODS = [
  { id: 'self', label: 'Self-Stored' },
  { id: 'vault', label: 'Private Vault' },
  { id: 'allocated', label: 'Allocated (Third Party)' },
  { id: 'unallocated', label: 'Unallocated (Pool)' },
] as const;

export const COLLECTIBLE_CATEGORIES = [
  { id: 'wine', label: 'Wine / Spirits' },
  { id: 'watches', label: 'Watches' },
  { id: 'stamps', label: 'Stamps' },
  { id: 'coins', label: 'Numismatic Coins' },
  { id: 'memorabilia', label: 'Memorabilia' },
  { id: 'rare_books', label: 'Rare Books / Manuscripts' },
  { id: 'other', label: 'Other' },
] as const;

export const VEHICLE_TYPES = [
  { id: 'classic_car', label: 'Classic Car' },
  { id: 'supercar', label: 'Supercar' },
  { id: 'hypercar', label: 'Hypercar' },
  { id: 'vintage_motorcycle', label: 'Vintage Motorcycle' },
  { id: 'limited_edition', label: 'Limited Edition' },
] as const;

export const ASSET_CONDITIONS = [
  { id: 'mint', label: 'Mint / Concours' },
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
] as const;

export const PROVENANCE_OPTIONS = [
  { id: 'known', label: 'Fully Documented' },
  { id: 'partial', label: 'Partially Known' },
  { id: 'unknown', label: 'Unknown' },
] as const;

export const PURCHASE_VEHICLES = [
  { id: 'personal', label: 'Personal Name' },
  { id: 'entity', label: 'Through Entity (LLC, Trust, etc.)' },
  { id: 'optimize', label: 'Optimize for me (let audit recommend)' }
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
