// =============================================================================
// DECISION MEMO REVIEW PAGE
// Flow: Intake → Create Order (backend) → Razorpay → Verify (backend) → Done
// Backend handles: validation, Razorpay, emails (Resend), background generation
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SummaryReview } from '@/components/decision-memo/pattern-audit/SummaryReview';
import { PaymentSuccessDialog } from '@/components/decision-memo/pattern-audit/PaymentSuccessDialog';
import { usePageTitle } from '@/hooks/use-page-title';
import { STORAGE_KEY } from '@/components/decision-memo/pattern-audit/PatternAuditPage';
import { SFOPatternAuditIntake } from '@/lib/decision-memo/pattern-audit-types';

const PAYMENT_SUCCESS_KEY = 'hc-audit-payment-success';

// Razorpay type
declare global {
  interface Window { Razorpay: any; }
}

// =============================================================================
// Transform camelCase intake → snake_case API payload for backend
// =============================================================================
function transformIntakeToPayload(intake: Partial<SFOPatternAuditIntake>) {
  return {
    email: intake.email || '',
    nationality: intake.nationality || undefined,
    nda_consent: intake.ndaConsent ?? false,
    privacy_consent: intake.privacyConsent ?? false,
    urgency: intake.urgency || 'standard',

    thesis: {
      move_description: intake.thesis?.moveDescription || '',
      expected_outcome: intake.thesis?.expectedOutcome || '',
      move_type: intake.thesis?.moveType || undefined,
      target_locations: intake.thesis?.targetLocations || undefined,
      timeline: intake.thesis?.timeline || undefined,
      buyer_citizenship: intake.thesis?.buyerCitizenship || undefined,
      source_jurisdiction: intake.thesis?.sourceJurisdiction || undefined,
      source_state: intake.thesis?.sourceState || undefined,
      destination_jurisdiction: intake.thesis?.destinationJurisdiction || undefined,
      destination_state: intake.thesis?.destinationState || undefined,
    },

    constraints: intake.constraints ? {
      liquidity_horizon: intake.constraints.liquidityHorizon || '',
      liquidity_events: intake.constraints.liquidityEvents || [],
      current_jurisdictions: intake.constraints.currentJurisdictions || [],
      prohibited_jurisdictions: intake.constraints.prohibitedJurisdictions || [],
      prohibitions: intake.constraints.prohibitions || [],
      deal_breakers: intake.constraints.dealBreakers || [],
      destination_property_count: intake.constraints.destinationPropertyCount ?? undefined,
      purchase_vehicle: intake.constraints.purchaseVehicle || undefined,
    } : undefined,

    control_and_rails: intake.controlAndRails ? {
      final_decision_maker: intake.controlAndRails.finalDecisionMaker || 'principal',
      decision_makers_count: intake.controlAndRails.decisionMakersCount || 1,
      veto_holders: intake.controlAndRails.vetoHolders || [],
      approval_required_above: intake.controlAndRails.approvalRequiredAbove || undefined,
      advisors: (intake.controlAndRails.advisors || []).map(a => ({
        type: a.type || '',
        name: a.name || undefined,
        jurisdiction: a.jurisdiction || '',
      })),
      existing_entities: (intake.controlAndRails.existingEntities || []).map(e => ({
        type: e.type || '',
        jurisdiction: e.jurisdiction || '',
        purpose: e.purpose || undefined,
      })),
      banking_rails: (intake.controlAndRails.bankingRails || []).map(r => ({
        bank: r.bank || '',
        jurisdiction: r.jurisdiction || '',
        status: r.status || 'active',
      })),
      has_formal_ips: intake.controlAndRails.hasFormalIPS ?? false,
      ips_notes: intake.controlAndRails.ipsNotes || undefined,
      heirs: intake.controlAndRails.heirs?.map(h => ({
        name: h.name,
        relationship: h.relationship,
        age: h.age,
        allocation_pct: h.allocationPct,
        notes: h.notes || undefined,
      })) || undefined,
    } : undefined,

    asset_details: intake.assetDetails ? {
      estimated_value: intake.assetDetails.estimatedValue || undefined,
      // Real Estate
      property_type: intake.assetDetails.propertyType || undefined,
      location_preference: intake.assetDetails.locationPreference || undefined,
      size_sqft: intake.assetDetails.sizeSqft || undefined,
      bedrooms: intake.assetDetails.bedrooms || undefined,
      rental_yield_pct: intake.assetDetails.rentalYieldPct || undefined,
      appreciation_pct: intake.assetDetails.appreciationPct || undefined,
      // Art
      art_category: intake.assetDetails.artCategory || undefined,
      artist: intake.assetDetails.artist || undefined,
      medium: intake.assetDetails.medium || undefined,
      period: intake.assetDetails.period || undefined,
      // Jewellery
      jewellery_type: intake.assetDetails.jewelleryType || undefined,
      primary_material: intake.assetDetails.primaryMaterial || undefined,
      certification: intake.assetDetails.certification || undefined,
      // Metals
      metal_type: intake.assetDetails.metalType || undefined,
      metal_form: intake.assetDetails.metalForm || undefined,
      weight: intake.assetDetails.weight || undefined,
      storage_method: intake.assetDetails.storageMethod || undefined,
      // Collectibles
      collectible_category: intake.assetDetails.collectibleCategory || undefined,
      description: intake.assetDetails.description || undefined,
      // Automotive
      vehicle_type: intake.assetDetails.vehicleType || undefined,
      make_model: intake.assetDetails.makeModel || undefined,
      year: intake.assetDetails.year || undefined,
      mileage: intake.assetDetails.mileage || undefined,
      // Shared
      condition: intake.assetDetails.condition || undefined,
      provenance: intake.assetDetails.provenance || undefined,
      brand: intake.assetDetails.brand || undefined,
    } : undefined,
  };
}

export default function DecisionMemoReviewPage() {
  const router = useRouter();
  usePageTitle('Pattern Audit - Review', 'Confirm your submission details');

  const [intake, setIntake] = useState<Partial<SFOPatternAuditIntake> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [completedIntakeId, setCompletedIntakeId] = useState('');

  const hasSubmittedRef = useRef(false);
  const intakeRef = useRef(intake);
  intakeRef.current = intake;

  // Load intake from localStorage on mount — or restore payment success state
  useEffect(() => {
    try {
      // Check if payment was already completed (survives refresh)
      const successData = localStorage.getItem(PAYMENT_SUCCESS_KEY);
      if (successData) {
        const { intakeId } = JSON.parse(successData);
        setCompletedIntakeId(intakeId);
        setShowSuccessDialog(true);
        setIntake({}); // non-null so loading spinner doesn't show
        return;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setIntake(JSON.parse(saved));
      } else {
        router.replace('/decision-memo/intake');
      }
    } catch {
      router.replace('/decision-memo/intake');
    }
  }, [router]);

  /** Navigate back to form (data is preserved in localStorage) */
  const handleBack = useCallback(() => {
    router.push('/decision-memo/intake');
  }, [router]);

  /**
   * Unified payment flow:
   * 1. Send full intake to backend → backend validates + creates Razorpay order
   * 2. Open Razorpay checkout → user pays
   * 3. Send payment callback to backend → backend verifies + sends emails + generates report
   * 4. Show success dialog → redirect to audit page
   */
  const handleProceedToPayment = useCallback(async () => {
    if (hasSubmittedRef.current) return;
    const currentIntake = intakeRef.current;
    if (!currentIntake) return;

    hasSubmittedRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Load Razorpay SDK
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load payment SDK'));
          document.body.appendChild(script);
        });
      }

      // 2. Send full intake to backend → create Razorpay order
      const payload = transformIntakeToPayload(currentIntake);
      const orderRes = await fetch('/api/decision-memo/audit-payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.detail || orderData.error || 'Failed to create payment order');
      }

      const intakeId = orderData.intake_id;

      // 3. Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'HNWI Chronicles',
        description: 'Decision Posture Audit — SFO Pattern Intelligence',
        order_id: orderData.order_id,
        remember_customer: false,
        prefill: {
          email: currentIntake.email || undefined,
        },
        theme: { color: '#DAA520' },
        handler: async (response: any) => {
          // 4. Verify payment via backend (also sends emails + triggers generation)
          try {
            const verifyRes = await fetch('/api/decision-memo/audit-payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                intake_id: intakeId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.detail || verifyData.error || 'Payment verification failed');
            }

            setIsSubmitting(false);
            setCompletedIntakeId(intakeId);
            setShowSuccessDialog(true);
            try {
              localStorage.setItem(PAYMENT_SUCCESS_KEY, JSON.stringify({ intakeId }));
              localStorage.removeItem(STORAGE_KEY);
            } catch { /* ignore */ }
          } catch (err) {
            setIsSubmitting(false);
            hasSubmittedRef.current = false;
            setError(err instanceof Error ? err.message : 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            hasSubmittedRef.current = false;
            // Don't show error for user-cancelled payments
          },
        },
      });

      razorpay.open();
    } catch (err) {
      console.error('Payment flow failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsSubmitting(false);
      hasSubmittedRef.current = false;
    }
  }, []);

  /** Success dialog close → clear persisted state → redirect home */
  const handleSuccessDialogClose = useCallback(() => {
    setShowSuccessDialog(false);
    try { localStorage.removeItem(PAYMENT_SUCCESS_KEY); } catch { /* ignore */ }
    router.push('/');
  }, [router]);

  // Loading state while reading localStorage
  if (!intake) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <SummaryReview
          intake={intake}
          onBack={handleBack}
          onProceedToPayment={handleProceedToPayment}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>

      <PaymentSuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        intakeId={completedIntakeId}
      />
    </>
  );
}
