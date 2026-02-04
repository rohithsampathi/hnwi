// =============================================================================
// USE PATTERN AUDIT HOOK
// API calls, state management, PDF export for SFO Pattern Audit
// =============================================================================

import { useCallback } from 'react';

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}
import {
  SFOPatternAuditIntake,
  ICArtifact,
  PreviewArtifact,
  AuditSession,
  PatternAuditAPIPayload
} from '@/lib/decision-memo/pattern-audit-types';
import { exportInstitutionalPDF } from './usePremiumPDFExport';

const API_BASE = '/api/decision-memo';

/** Thrown when the backend returns 401 — caller should show ReportAuthPopup */
export class ReportAuthRequiredError extends Error {
  constructor() {
    super('Report authentication required')
    this.name = 'ReportAuthRequiredError'
  }
}

/** Build headers with optional report auth token */
function buildHeaders(authToken?: string | null, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

export function usePatternAudit() {
  // ==========================================================================
  // SUBMIT INTAKE
  // Returns session with preview URL (audit takes 48 hours)
  // ==========================================================================

  const submitIntake = useCallback(async (
    intake: SFOPatternAuditIntake
  ): Promise<{ session: AuditSession; preview?: PreviewArtifact }> => {
    const payload = transformIntakeToAPI(intake);
    
    const response = await fetch(`${API_BASE}/submit-sfo-intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [SFO Submit] Failed:', response.status, errorText);
      throw new Error('Failed to submit intake');
    }

    const data = await response.json();

    // Handle different response formats
    const sessionData = data.session || data;
    if (!sessionData || !sessionData.intake_id) {
      console.error('❌ [SFO Submit] Invalid response - missing intake_id:', data);
      throw new Error('Invalid response from server');
    }

    const session = transformSessionFromAPI(sessionData);

    // If backend returns preview data directly, transform it
    let preview: PreviewArtifact | undefined;
    if (data.is_preview && data.preview) {
      preview = transformPreviewFromAPI({
        intake_id: data.intake_id,
        generated_at: data.generated_at,
        ...data.preview,
        call_to_action: data.call_to_action
      });
    }

    return { session, preview };
  }, []);

  // ==========================================================================
  // GET SESSION STATUS
  // Check current status of an audit
  // ==========================================================================

  const getSession = useCallback(async (intakeId: string, authToken?: string | null): Promise<AuditSession> => {
    const response = await fetch(`${API_BASE}/session/${intakeId}`, {
      headers: buildHeaders(authToken)
    });

    if (response.status === 401) {
      throw new ReportAuthRequiredError();
    }

    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }

    const data = await response.json();

    // Handle different response formats
    const sessionData = data.session || data;
    if (!sessionData || !sessionData.intake_id) {
      throw new Error('Invalid session data received');
    }

    return transformSessionFromAPI(sessionData);
  }, []);

  // ==========================================================================
  // GET PREVIEW ARTIFACT
  // Fetch from unified endpoint - returns preview data + MCP fields
  // ==========================================================================

  const getPreviewArtifact = useCallback(async (
    intakeId: string,
    authToken?: string | null
  ): Promise<PreviewArtifact> => {
    // Use unified endpoint
    const response = await fetch(`${API_BASE}/${intakeId}`, {
      headers: buildHeaders(authToken)
    });

    if (response.status === 401) {
      throw new ReportAuthRequiredError();
    }

    if (!response.ok) {
      throw new Error('Preview not ready');
    }

    const data = await response.json();

    // Handle unified endpoint response format
    const previewData = data.preview || data;

    if (!previewData || !previewData.intake_id) {
      throw new Error('Invalid preview data received');
    }

    return transformPreviewFromAPI(previewData);
  }, []);

  // ==========================================================================
  // GENERATE AUDIT (Legacy - for immediate generation without 48h wait)
  // ==========================================================================

  const generateAudit = useCallback(async (
    intake: SFOPatternAuditIntake
  ): Promise<ICArtifact> => {
    const payload = transformIntakeToAPI(intake);

    const response = await fetch(`${API_BASE}/generate-ic-artifact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Audit generation failed');
    }

    const data = await response.json();
    return transformArtifactFromAPI(data.artifact);
  }, []);

  // ==========================================================================
  // CREATE PAYMENT ORDER
  // Create Razorpay order for SFO audit
  // ==========================================================================

  const createPaymentOrder = useCallback(async (
    intakeId: string,
    currency: 'INR' | 'USD' = 'INR'
  ) => {
    const response = await fetch(`${API_BASE}/sfo-audit/${intakeId}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment order');
    }

    return response.json();
  }, []);

  // ==========================================================================
  // INITIATE PAYMENT
  // Create payment order with tier selection support
  // ==========================================================================

  const initiatePayment = useCallback(async (
    intakeId: string,
    options?: { tier?: string; amount?: number; currency?: 'INR' | 'USD' }
  ) => {
    const response = await fetch(`${API_BASE}/sfo-audit/${intakeId}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: options?.currency || 'USD',
        tier: options?.tier || 'single',
        amount: options?.amount
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to create payment order');
    }

    const data = await response.json();

    // Check if backend returned success: false
    if (data.success === false) {
      // Special case: already paid - signal to fetch full artifact
      if (data.error === 'already_paid') {
        return { already_paid: true, intake_id: data.intake_id };
      }
      throw new Error(data.error || data.message || 'Backend rejected payment order');
    }

    // Extract order details - handle different response formats
    const orderId = data.order_id || data.orderId;
    const amount = data.amount;
    const currency = data.currency;
    const key = data.key_id || data.key || data.razorpay_key;

    if (!orderId || !key) {
      throw new Error('Invalid payment order response - missing order_id or key');
    }

    return {
      order_id: orderId,
      amount: amount,
      currency: currency,
      key: key
    };
  }, []);

  // ==========================================================================
  // VERIFY PAYMENT
  // Verify Razorpay payment and get full artifact
  // ==========================================================================

  const verifyPayment = useCallback(async (
    intakeId: string,
    razorpayResponse: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<ICArtifact> => {
    const response = await fetch(`${API_BASE}/sfo-audit/${intakeId}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(razorpayResponse)
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    if (!data.success || !data.artifact) {
      throw new Error(data.message || 'Failed to unlock artifact');
    }

    return transformArtifactFromAPI(data.artifact);
  }, []);

  // ==========================================================================
  // CHECK PAYMENT STATUS
  // Check if audit has been paid for
  // ==========================================================================

  const checkPaymentStatus = useCallback(async (intakeId: string) => {
    const response = await fetch(`${API_BASE}/sfo-audit/${intakeId}/payment-status`);

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    return response.json();
  }, []);

  // ==========================================================================
  // OPEN RAZORPAY CHECKOUT
  // Full payment flow: create order -> open checkout -> verify -> get artifact
  // ==========================================================================

  const openPaymentCheckout = useCallback(async (
    intakeId: string,
    options: {
      currency?: 'INR' | 'USD';
      prefill?: { name?: string; email?: string; phone?: string };
      onSuccess: (artifact: ICArtifact) => void;
      onFailure: (error: Error) => void;
    }
  ) => {
    try {
      // Load Razorpay SDK if not loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      // Create order
      const orderData = await createPaymentOrder(intakeId, options.currency || 'INR');

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      // Build prefill data
      const prefillData: { name?: string; email?: string; contact?: string } = {};
      if (options.prefill?.name?.trim()) prefillData.name = options.prefill.name.trim();
      if (options.prefill?.email?.trim()) prefillData.email = options.prefill.email.trim();
      if (options.prefill?.phone?.trim()) prefillData.contact = options.prefill.phone.trim();

      // Open Razorpay checkout
      const razorpayOptions = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HNWI Chronicles',
        description: orderData.description || 'SFO Pattern Audit - IC Artifact',
        order_id: orderData.order_id,
        remember_customer: false,
        ...(Object.keys(prefillData).length > 0 ? { prefill: prefillData } : {}),
        theme: { color: '#DAA520' },
        handler: async (response: any) => {
          try {
            const artifact = await verifyPayment(intakeId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            options.onSuccess(artifact);
          } catch (error) {
            options.onFailure(error instanceof Error ? error : new Error('Verification failed'));
          }
        },
        modal: {
          ondismiss: () => {
            options.onFailure(new Error('Payment cancelled'));
          }
        }
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();

    } catch (error) {
      options.onFailure(error instanceof Error ? error : new Error('Failed to open checkout'));
    }
  }, [createPaymentOrder, verifyPayment]);

  // ==========================================================================
  // GET FULL ARTIFACT
  // Fetch from unified endpoint - returns full artifact when unlocked + MCP fields
  // ==========================================================================

  const getFullArtifact = useCallback(async (
    intakeId: string,
    authToken?: string | null
  ): Promise<ICArtifact> => {
    // Use unified endpoint
    const response = await fetch(`${API_BASE}/${intakeId}`, {
      headers: buildHeaders(authToken)
    });

    if (response.status === 401) {
      throw new ReportAuthRequiredError();
    }

    if (!response.ok) {
      throw new Error('Artifact not available');
    }

    const data = await response.json();

    // Backend sends data at TOP LEVEL (preview_data, memo_data), NOT nested under 'artifact'
    // Handle both formats for backwards compatibility
    const artifactData = data.artifact || data;

    return transformArtifactFromAPI(artifactData);
  }, []);

  // ==========================================================================
  // EXPORT PDF
  // Client-side PDF generation - each section on new page
  // ==========================================================================

  const exportPDF = useCallback(async (artifact: ICArtifact) => {
    // Use institutional-grade PDF export for $2,500 audits
    return await exportInstitutionalPDF(artifact as any);
  }, []);

  // Old PDF generation code removed - now using institutional-grade export

  // ==========================================================================
  // SHARE ARTIFACT
  // Generate shareable link or send to advisor
  // ==========================================================================

  const shareArtifact = useCallback(async (
    intakeId: string,
    options: { email?: string; copyLink?: boolean }
  ): Promise<{ shareUrl: string }> => {
    const response = await fetch(`${API_BASE}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intake_id: intakeId,
        advisor_email: options.email
      })
    });

    if (!response.ok) {
      throw new Error('Sharing failed');
    }

    const data = await response.json();

    if (options.copyLink && data.share_url) {
      await navigator.clipboard.writeText(data.share_url);
    }

    return { shareUrl: data.share_url };
  }, []);

  return {
    submitIntake,
    getSession,
    getPreviewArtifact,
    generateAudit,
    // Payment methods
    createPaymentOrder,
    initiatePayment,
    verifyPayment,
    checkPaymentStatus,
    openPaymentCheckout,
    // Artifact methods
    getFullArtifact,
    exportPDF,
    shareArtifact
  };
}

// =============================================================================
// TRANSFORM FUNCTIONS
// =============================================================================

function transformIntakeToAPI(intake: SFOPatternAuditIntake): PatternAuditAPIPayload {
  return {
    // Top-level identity & consent
    email: intake.email,
    nationality: intake.nationality,
    nda_consent: intake.ndaConsent,
    privacy_consent: intake.privacyConsent,

    thesis: {
      move_description: intake.thesis.moveDescription,
      expected_outcome: intake.thesis.expectedOutcome,
      move_type: intake.thesis.moveType,
      target_amount: intake.thesis.targetAmount,
      target_locations: intake.thesis.targetLocations,
      timeline: intake.thesis.timeline,
      buyer_citizenship: intake.thesis.buyerCitizenship,
      source_jurisdiction: intake.thesis.sourceJurisdiction,
      source_state: intake.thesis.sourceState,
      destination_jurisdiction: intake.thesis.destinationJurisdiction,
      destination_state: intake.thesis.destinationState,
    },
    constraints: {
      liquidity_horizon: intake.constraints.liquidityHorizon,
      liquidity_amount_needed: intake.constraints.liquidityAmountNeeded,
      liquidity_events: intake.constraints.liquidityEvents,
      current_jurisdictions: intake.constraints.currentJurisdictions,
      prohibited_jurisdictions: intake.constraints.prohibitedJurisdictions,
      prohibitions: intake.constraints.prohibitions,
      deal_breakers: intake.constraints.dealBreakers,
      destination_property_count: intake.constraints.destinationPropertyCount,
      purchase_vehicle: intake.constraints.purchaseVehicle,
      is_relocating: intake.constraints.isRelocating,
    },
    control_and_rails: {
      final_decision_maker: intake.controlAndRails.finalDecisionMaker,
      decision_makers_count: intake.controlAndRails.decisionMakersCount,
      veto_holders: intake.controlAndRails.vetoHolders,
      approval_required_above: intake.controlAndRails.approvalRequiredAbove,
      advisors: intake.controlAndRails.advisors.map(a => ({
        type: a.type,
        name: a.name,
        jurisdiction: a.jurisdiction
      })),
      existing_entities: intake.controlAndRails.existingEntities.map(e => ({
        type: e.type,
        jurisdiction: e.jurisdiction,
        purpose: e.purpose
      })),
      banking_rails: intake.controlAndRails.bankingRails.map(b => ({
        bank: b.bank,
        jurisdiction: b.jurisdiction,
        status: b.status
      })),
      has_formal_ips: intake.controlAndRails.hasFormalIPS,
      ips_notes: intake.controlAndRails.ipsNotes,
      heirs: intake.controlAndRails.heirs?.map(h => ({
        name: h.name,
        relationship: h.relationship,
        age: h.age,
        allocation_pct: h.allocationPct,
        notes: h.notes,
      })),
    },
    asset_details: intake.assetDetails ? {
      property_type: intake.assetDetails.propertyType,
      estimated_value: intake.assetDetails.estimatedValue,
      rental_yield_pct: intake.assetDetails.rentalYieldPct,
      appreciation_pct: intake.assetDetails.appreciationPct,
      location_preference: intake.assetDetails.locationPreference,
      size_sqft: intake.assetDetails.sizeSqft,
      bedrooms: intake.assetDetails.bedrooms,
    } : undefined,
    urgency: intake.urgency,
    format: intake.format
  };
}

function transformSessionFromAPI(data: any): AuditSession & { fullArtifact?: ICArtifact; preview_data?: any; memo_data?: any } {
  // Map backend status to frontend status
  // Backend may return: SUBMITTED, IN_REVIEW, PREVIEW_READY, PAID, FULL_READY
  const status = data.status || data.payment_status || 'PREVIEW_READY';

  // Check if paid/unlocked - backend might use different field names
  const isPaid = data.is_paid || data.paid || data.is_unlocked || status === 'PAID' || status === 'FULL_READY';

  const session: AuditSession & { fullArtifact?: ICArtifact; preview_data?: any; memo_data?: any } = {
    intakeId: data.intake_id,
    principalId: 'sfo_audit',
    status: isPaid ? 'PAID' : status,
    submittedAt: data.generated_at || data.submitted_at,
    previewReadyAt: data.generated_at || data.preview_ready_at,
    paidAt: data.paid_at,
    fullReadyAt: data.full_ready_at,
    previewUrl: `/decision-memo/audit/${data.intake_id}`,
    expiresAt: data.expires_at || '',
    price: data.price || 2500,
    unlockAt: data.unlock_at,
    isUnlocked: data.is_unlocked || isPaid || false
  };

  // If session includes full_artifact (from unlocked state), transform and include it
  if (data.full_artifact) {
    session.fullArtifact = transformArtifactFromAPI(data.full_artifact);
  }

  // Pass through preview_data and memo_data for peer cohort stats, capital flow data
  // These are generated by the session API route for unlocked sessions
  if (data.preview_data) {
    session.preview_data = data.preview_data;
  }
  if (data.memo_data) {
    session.memo_data = data.memo_data;
  }

  return session;
}

function transformPreviewFromAPI(data: any): PreviewArtifact {
  // Handle both old backend format (flat arrays) and new format (structured *_preview objects)
  const hasNewFormat = data.sequence_preview || data.failure_modes_preview;

  // Build sequence_preview from old format if needed
  const sequencePreview = data.sequence_preview || (data.sequence_titles?.length ? {
    total_steps: data.sequence_titles.length,
    first_step: data.sequence_titles[0],
    implied_vs_corrected: true,
    message: data.why_this_matters || 'Sequence has been optimized for execution.'
  } : undefined);

  // Build failure_modes_preview from old format if needed
  const failureModesPreview = data.failure_modes_preview || (data.failure_mode_titles?.length ? {
    count: data.failure_mode_titles.length,
    triggers: data.failure_mode_titles,
    has_governance_failure: data.failure_mode_titles.some((t: string) =>
      t.toLowerCase().includes('governance') || t.toLowerCase().includes('entity') || t.toLowerCase().includes('structure')
    ),
    has_economic_failure: data.failure_mode_titles.some((t: string) =>
      t.toLowerCase().includes('economic') || t.toLowerCase().includes('timing') || t.toLowerCase().includes('liquidity')
    ),
    message: 'Mechanism-driven failure modes identified with mitigation strategies.'
  } : undefined);

  // Build pattern_anchors_preview from old format if needed
  const patternAnchorsPreview = data.pattern_anchors_preview || (data.pattern_anchor_titles?.length ? {
    count: data.pattern_anchor_titles.length,
    pattern_names: data.pattern_anchor_titles,
    message: 'Historical patterns matched from intelligence library.'
  } : undefined);

  // Build next_step_preview from old format if needed
  const nextStepPreview = data.next_step_preview || (data.next_action_headline ? {
    action_headline: data.next_action_headline,
    timeline: '7-14 days',
    message: 'Critical path item that unlocks subsequent steps.'
  } : undefined);

  // Build intelligence_preview from old format if needed
  const intelligencePreview = data.intelligence_preview || (data.intelligence_sources ? {
    developments_analyzed: data.intelligence_sources.precedents_reviewed || 0,
    regulatory_patterns: data.intelligence_sources.regulatory_anchors || 0,
    failure_modes_identified: data.intelligence_sources.failure_modes || 0,
    message: `Analysis based on ${data.intelligence_sources.precedents_reviewed || 0} precedents and ${data.intelligence_sources.sequence_corrections || 0} sequence corrections.`
  } : undefined);

  // Build scope_preview (may not exist in old format)
  const scopePreview = data.scope_preview || {
    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
    in_scope_count: 5,
    out_of_scope_count: 3
  };

  // Build call_to_action from old format if needed
  const callToAction = data.call_to_action || {
    headline: 'Unlock Full IC Artifact',
    subheadline: 'Get complete sequence, failure mechanisms, and pattern analysis',
    button_text: `Unlock for ${data.price_display || '$2,500'}`,
    payment_url: `/api/decision-memo/payment/${data.intake_id}`
  };

  return {
    intakeId: data.intake_id || '',
    principalId: 'sfo_audit',
    thesisSummary: data.thesis_summary,
    generatedAt: data.generated_at || new Date().toISOString(),
    status: 'PREVIEW_READY',

    verdict: {
      verdict: data.verdict?.verdict || 'PROCEED WITH MODIFICATIONS',
      // Handle both old (single_sentence) and new (single_sentence_preview) field names
      singleSentence: data.verdict?.single_sentence_preview || data.verdict?.single_sentence || '',
      thesisSurvives: data.verdict?.thesis_survives ?? true
    },
    whyThisMatters: data.why_this_matters || sequencePreview?.message || 'This decision requires careful sequencing.',

    // Legacy array fields (for backwards compatibility)
    sequenceTitles: data.sequence_titles || (sequencePreview?.first_step
      ? [`${sequencePreview.first_step} (+${(sequencePreview.total_steps || 1) - 1} more steps)`]
      : []),
    failureModeTitles: data.failure_mode_titles || failureModesPreview?.triggers || [],
    patternAnchorTitles: data.pattern_anchor_titles || patternAnchorsPreview?.pattern_names || [],
    nextActionHeadline: data.next_action_headline || nextStepPreview?.action_headline || '',
    lockedSections: data.locked_sections || ['Full sequence details', 'Failure mechanisms', 'Pattern analysis', 'PDF export'],

    price: data.price || 2500,
    priceDisplay: data.price_display || '$2,500',

    intelligenceSources: {
      developmentsMatched: intelligencePreview?.developments_analyzed || data.intelligence_sources?.precedents_reviewed || 0,
      failurePatternsMatched: intelligencePreview?.failure_modes_identified || data.intelligence_sources?.failure_modes || 0,
      sequencingRulesApplied: intelligencePreview?.regulatory_patterns || data.intelligence_sources?.regulatory_anchors || 0
    },

    // Structured preview data (built from either format)
    sequencePreview,
    failureModesPreview,
    patternAnchorsPreview,
    nextStepPreview,
    scopePreview,
    intelligencePreview,
    callToAction
  };
}

function transformArtifactFromAPI(data: any): ICArtifact {
  // Handle new backend format (preview_data + memo_data at top level)
  // vs old format (artifact fields at top level)
  const hasNewFormat = data.preview_data && data.memo_data;

  // Extract intelligence sources from correct location
  // New format: data.memo_data.kgv3_intelligence_used
  // Old format: data.intelligence_sources
  const kgv3Intel = data.memo_data?.kgv3_intelligence_used || {};
  const oldIntel = data.intelligence_sources || {};

  return {
    intakeId: data.intake_id,
    principalId: data.principal_id || 'sfo_audit',
    thesisSummary: data.thesis_summary || '',
    generatedAt: data.generated_at || data.memo_data?.generated_at || new Date().toISOString(),
    status: 'FULL_READY',

    verdict: data.verdict ? {
      verdict: data.verdict.verdict,
      singleSentence: data.verdict.single_sentence,
      thesisSurvives: data.verdict.thesis_survives
    } : {
      verdict: 'PROCEED WITH MODIFICATIONS',
      singleSentence: '',
      thesisSurvives: true
    },
    whyThisMatters: data.why_this_matters || '',

    sequence: (data.sequence || []).map((s: any) => ({
      order: s.order,
      action: s.action,
      owner: s.owner,
      timeline: s.timeline,
      whyThisOrder: s.why_this_order
    })),

    failureModes: (data.failure_modes || []).map((m: any) => ({
      trigger: m.trigger,
      mechanism: m.mechanism,
      damage: m.damage,
      mitigation: m.mitigation
    })),

    patternAnchors: (data.pattern_anchors || []).map((a: any) => ({
      patternName: a.pattern_name,
      patternClass: a.pattern_class,
      historicalBehavior: a.historical_behavior,
      confidence: a.confidence
    })),

    nextStep: {
      action: data.next_step?.action || '',
      executor: data.next_step?.executor || '',
      timeline: data.next_step?.timeline || '',
      unlocks: data.next_step?.unlocks || '',
      ifBlocked: data.next_step?.if_blocked || ''
    },

    scope: {
      inScope: data.scope?.in_scope || [],
      outOfScope: data.scope?.out_of_scope || [],
      validUntil: data.scope?.valid_until || ''
    },

    // Intelligence sources - handle both new and old formats
    // New format: memo_data.kgv3_intelligence_used.precedents/failure_modes/sequencing_rules
    // Old format: intelligence_sources.developments_matched/precedents_reviewed
    intelligenceSources: {
      developmentsMatched: kgv3Intel.precedents || oldIntel.developments_matched || oldIntel.precedents_reviewed || 0,
      failurePatternsMatched: kgv3Intel.failure_modes || oldIntel.failure_patterns_matched || oldIntel.failure_modes || 0,
      sequencingRulesApplied: kgv3Intel.sequencing_rules || oldIntel.sequencing_rules_applied || oldIntel.sequence_corrections || 0
    },

    // SOTA Components (Harvard/Stanford OG Standard)
    impliedIps: data.implied_ips ? {
      primaryObjective: data.implied_ips.primary_objective || '',
      secondaryObjectives: data.implied_ips.secondary_objectives || [],
      riskTolerance: data.implied_ips.risk_tolerance || '',
      riskCapacity: data.implied_ips.risk_capacity || '',
      volatilityTolerance: data.implied_ips.volatility_tolerance || '',
      liquidityHorizon: data.implied_ips.liquidity_horizon || '',
      minimumLiquidBuffer: data.implied_ips.minimum_liquid_buffer || '',
      liquidityConstraints: data.implied_ips.liquidity_constraints || [],
      maxSinglePositionPct: data.implied_ips.max_single_position_pct || 25,
      maxSingleJurisdictionPct: data.implied_ips.max_single_jurisdiction_pct || 50,
      maxIlliquidPct: data.implied_ips.max_illiquid_pct || 40,
      currentConcentrationRisk: data.implied_ips.current_concentration_risk || '',
      assetClassTargets: data.implied_ips.asset_class_targets || {},
      geographicTargets: data.implied_ips.geographic_targets || {},
      prohibitedInvestments: data.implied_ips.prohibited_investments || [],
      restrictedInvestments: data.implied_ips.restricted_investments || [],
      investmentHorizon: data.implied_ips.investment_horizon || '',
      reviewFrequency: data.implied_ips.review_frequency || 'Quarterly',
      decisionAuthority: data.implied_ips.decision_authority || '',
      approvalThresholds: data.implied_ips.approval_thresholds || {},
      taxOptimizationPriority: data.implied_ips.tax_optimization_priority || '',
      preferredStructures: data.implied_ips.preferred_structures || [],
      taxJurisdictions: data.implied_ips.tax_jurisdictions || [],
      confidenceScore: data.implied_ips.confidence_score || 0,
      missingDataPoints: data.implied_ips.missing_data_points || []
    } : null,

    returnScenarios: data.return_scenarios ? {
      baseCase: {
        name: data.return_scenarios.base_case?.name || 'Base Case',
        probability: data.return_scenarios.base_case?.probability || 0.6,
        annualReturnPct: data.return_scenarios.base_case?.annual_return_pct || '',
        irrEstimate: data.return_scenarios.base_case?.irr_estimate,
        moicEstimate: data.return_scenarios.base_case?.moic_estimate,
        annualTaxSavings: data.return_scenarios.base_case?.annual_tax_savings || '',
        totalTaxSavings: data.return_scenarios.base_case?.total_tax_savings || '',
        totalValueCreation: data.return_scenarios.base_case?.total_value_creation || '',
        exitTimeline: data.return_scenarios.base_case?.exit_timeline || '',
        exitMethod: data.return_scenarios.base_case?.exit_method || '',
        exitHaircut: data.return_scenarios.base_case?.exit_haircut || '',
        assumptions: data.return_scenarios.base_case?.assumptions || []
      },
      bullCase: {
        name: data.return_scenarios.bull_case?.name || 'Bull Case',
        probability: data.return_scenarios.bull_case?.probability || 0.25,
        annualReturnPct: data.return_scenarios.bull_case?.annual_return_pct || '',
        irrEstimate: data.return_scenarios.bull_case?.irr_estimate,
        moicEstimate: data.return_scenarios.bull_case?.moic_estimate,
        totalValueCreation: data.return_scenarios.bull_case?.total_value_creation || '',
        exitTimeline: data.return_scenarios.bull_case?.exit_timeline || '',
        exitMethod: data.return_scenarios.bull_case?.exit_method || '',
        assumptions: data.return_scenarios.bull_case?.assumptions || []
      },
      bearCase: {
        name: data.return_scenarios.bear_case?.name || 'Bear Case',
        probability: data.return_scenarios.bear_case?.probability || 0.15,
        annualReturnPct: data.return_scenarios.bear_case?.annual_return_pct || '',
        irrEstimate: data.return_scenarios.bear_case?.irr_estimate,
        moicEstimate: data.return_scenarios.bear_case?.moic_estimate,
        totalValueCreation: data.return_scenarios.bear_case?.total_value_creation || '',
        exitTimeline: data.return_scenarios.bear_case?.exit_timeline || '',
        exitMethod: data.return_scenarios.bear_case?.exit_method || '',
        exitHaircut: data.return_scenarios.bear_case?.exit_haircut || '',
        assumptions: data.return_scenarios.bear_case?.assumptions || []
      },
      expectedValue: data.return_scenarios.expected_value || '',
      riskRewardAssessment: data.return_scenarios.risk_reward_assessment || '',
      keySensitivities: data.return_scenarios.key_sensitivities || []
    } : null,

    ddChecklist: data.dd_checklist ? {
      moveType: data.dd_checklist.move_type || '',
      totalItems: data.dd_checklist.total_items || 0,
      completedItems: data.dd_checklist.completed_items || 0,
      highPriorityItems: data.dd_checklist.high_priority_items || 0,
      jurisdictionsCovered: data.dd_checklist.jurisdictions_covered || [],
      assetClassesCovered: data.dd_checklist.asset_classes_covered || [],
      items: (data.dd_checklist.items || []).map((item: any) => ({
        category: item.category || '',
        item: item.item || '',
        status: item.status || 'pending',
        owner: item.owner || '',
        notes: item.notes || '',
        priority: item.priority || 'medium'
      }))
    } : null,

    alternativesConsidered: (data.alternatives_considered || []).map((alt: any) => ({
      alternative: alt.alternative || '',
      whyNotSelected: alt.why_not_selected || '',
      comparativeMetrics: alt.comparative_metrics || {}
    })),

    // Deal overview with jurisdiction info
    dealOverview: data.deal_overview ? {
      moveType: data.deal_overview.move_type || '',
      targetSize: data.deal_overview.target_size || '',
      jurisdictions: data.deal_overview.jurisdictions || '',
      timeline: data.deal_overview.timeline || '',
      riskPool: data.deal_overview.risk_pool || '',
      financing: data.deal_overview.financing || '',
      holdPeriod: data.deal_overview.hold_period || ''
    } : null,

    // Investment thesis
    investmentThesis: data.investment_thesis ? {
      whyMakesSense: data.investment_thesis.why_makes_sense || [],
      hiddenRisks: data.investment_thesis.hidden_risks || []
    } : null,

    // Rich verdict for executive summary
    richVerdict: data.rich_verdict ? {
      whatTheyThinkSafe: data.rich_verdict.what_they_think_safe || '',
      whatIsFragile: data.rich_verdict.what_is_fragile || '',
      whyFragile: data.rich_verdict.why_fragile || '',
      consequenceIfUnchanged: data.rich_verdict.consequence_if_unchanged || '',
      correctSequence: data.rich_verdict.correct_sequence || ''
    } : null,

    // Stop list
    stopList: (data.stop_list || []).map((item: any) => ({
      number: item.number || 0,
      stopAction: item.stop_action || '',
      untilCondition: item.until_condition || ''
    })),

    // Matched opportunities
    matchedOpportunities: (data.matched_opportunities || []).map((opp: any) => ({
      title: opp.title || '',
      whyRelevant: opp.why_relevant || '',
      timing: opp.timing || '',
      opportunityId: opp.opportunity_id || ''
    })),

    shareableUrl: data.shareable_url || '',
    pdfUrl: data.pdf_url || ''
  };
}

export default usePatternAudit;
