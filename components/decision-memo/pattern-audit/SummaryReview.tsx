// =============================================================================
// SUMMARY REVIEW — Premium Review Page
// Two-column layout: data review (left) + payment card (right, sticky)
// Matches intake page visual standard
// =============================================================================

"use client";

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Check,
  Loader2,
  Lock,
  Target,
  Users,
  Mail,
  Building,
  Clock,
  Scale
} from 'lucide-react';
import { SFOPatternAuditIntake } from '@/lib/decision-memo/pattern-audit-types';

interface SummaryReviewProps {
  intake: Partial<SFOPatternAuditIntake>;
  onBack: () => void;
  onProceedToPayment: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export function SummaryReview({
  intake,
  onBack,
  onProceedToPayment,
  isSubmitting,
  error
}: SummaryReviewProps) {
  const [patternCount, setPatternCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/developments/counts')
      .then(res => res.json())
      .then(data => {
        const count = data.developments?.total_count || data.total || data.count || data.total_count;
        if (count) setPatternCount(count);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Sticky header — matches intake page */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">HC</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                Review Submission
              </h1>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">
                Decision Posture Audit
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Inputs
          </button>
        </div>
      </div>

      {/* Content: Review + Payment sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Left column: Data review */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Contact & Identity */}
            <ReviewSection icon={Mail} title="Contact & Identity">
              <ReviewGrid>
                <ReviewField label="Email" value={intake.email} />
                <ReviewField label="Tax Jurisdiction" value={intake.nationality} />
              </ReviewGrid>
            </ReviewSection>

            {/* Decision Thesis */}
            <ReviewSection icon={Target} title="Decision Thesis">
              <div className="space-y-4">
                <ReviewField label="Move Description" value={intake.thesis?.moveDescription} fullWidth />
                <ReviewField label="Expected Outcome" value={intake.thesis?.expectedOutcome} fullWidth />
                {(intake.thesis?.moveType || intake.thesis?.timeline) && (
                  <ReviewGrid>
                    {intake.thesis?.moveType && <ReviewField label="Move Type" value={intake.thesis.moveType} />}
                    {intake.thesis?.timeline && <ReviewField label="Timeline" value={intake.thesis.timeline} />}
                  </ReviewGrid>
                )}
                {((intake.thesis?.targetLocations?.length || 0) > 0 || intake.thesis?.sourceJurisdiction || intake.thesis?.destinationJurisdiction) && (
                  <ReviewGrid>
                    {(intake.thesis?.targetLocations?.length || 0) > 0 && (
                      <ReviewField label="Target Locations" value={intake.thesis!.targetLocations!.join(', ')} />
                    )}
                    {intake.thesis?.sourceJurisdiction && (
                      <ReviewField
                        label="Source Jurisdiction"
                        value={`${intake.thesis.sourceJurisdiction}${intake.thesis.sourceState ? ` — ${intake.thesis.sourceState}` : ''}`}
                      />
                    )}
                    {intake.thesis?.destinationJurisdiction && (
                      <ReviewField
                        label="Destination"
                        value={`${intake.thesis.destinationJurisdiction}${intake.thesis.destinationState ? ` — ${intake.thesis.destinationState}` : ''}`}
                      />
                    )}
                  </ReviewGrid>
                )}
              </div>
            </ReviewSection>

            {/* Constraints */}
            <ReviewSection icon={Lock} title="Constraints">
              <div className="space-y-4">
                <ReviewGrid>
                  {intake.constraints?.liquidityHorizon && (
                    <ReviewField label="Liquidity Horizon" value={intake.constraints.liquidityHorizon} />
                  )}
                  {intake.constraints?.destinationPropertyCount != null && (
                    <ReviewField label="Properties at Destination" value={String(intake.constraints.destinationPropertyCount)} />
                  )}
                  {intake.constraints?.purchaseVehicle && (
                    <ReviewField label="Purchase Vehicle" value={intake.constraints.purchaseVehicle} />
                  )}
                </ReviewGrid>

                {(intake.constraints?.currentJurisdictions?.length || 0) > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">Current Jurisdictions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {intake.constraints!.currentJurisdictions!.map(j => (
                        <span key={j} className="px-2.5 py-1 bg-primary/5 text-primary text-xs rounded-full border border-primary/10">
                          {j}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <TagGroup label="Forcing Events" items={intake.constraints?.liquidityEvents} color="amber" />
                <TagGroup label="Prohibitions" items={intake.constraints?.prohibitions} color="red" />
                <TagGroup label="Deal Breakers" items={intake.constraints?.dealBreakers} color="orange" />

                {(intake.constraints?.prohibitedJurisdictions?.length || 0) > 0 && (
                  <ReviewField label="Prohibited Jurisdictions" value={intake.constraints!.prohibitedJurisdictions!.join(', ')} fullWidth />
                )}
              </div>
            </ReviewSection>

            {/* Control & Rails */}
            <ReviewSection icon={Users} title="Control & Rails">
              <div className="space-y-4">
                <ReviewGrid>
                  {intake.controlAndRails?.finalDecisionMaker && (
                    <ReviewField label="Final Decision Maker" value={intake.controlAndRails.finalDecisionMaker} />
                  )}
                  {intake.controlAndRails?.approvalRequiredAbove && (
                    <ReviewField label="Approval Threshold" value={intake.controlAndRails.approvalRequiredAbove} />
                  )}
                </ReviewGrid>

                {(intake.controlAndRails?.vetoHolders?.length || 0) > 0 && (
                  <ReviewField label="Veto Holders" value={intake.controlAndRails!.vetoHolders!.join(', ')} fullWidth />
                )}

                {(intake.controlAndRails?.advisors?.length || 0) > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Advisor Stack</span>
                    <div className="grid gap-2">
                      {intake.controlAndRails!.advisors!.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-foreground">{a.type}</span>
                          {a.name && <span className="text-xs text-muted-foreground">{a.name}</span>}
                          <span className="text-xs text-muted-foreground ml-auto">{a.jurisdiction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(intake.controlAndRails?.existingEntities?.length || 0) > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Existing Entities</span>
                    <div className="grid gap-2">
                      {intake.controlAndRails!.existingEntities!.map((e, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-foreground">{e.type}</span>
                          <span className="text-xs text-muted-foreground">{e.jurisdiction}</span>
                          {e.purpose && <span className="text-xs text-muted-foreground ml-auto">{e.purpose}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(intake.controlAndRails?.bankingRails?.length || 0) > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Banking Rails</span>
                    <div className="grid gap-2">
                      {intake.controlAndRails!.bankingRails!.map((b, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-foreground">{b.bank}</span>
                          <span className="text-xs text-muted-foreground">{b.jurisdiction}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${
                            b.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                            b.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {intake.controlAndRails?.hasFormalIPS && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Check className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-foreground">Formal IPS on file</span>
                    </div>
                    {intake.controlAndRails.ipsNotes && (
                      <p className="text-xs text-muted-foreground pl-4.5">{intake.controlAndRails.ipsNotes}</p>
                    )}
                  </div>
                )}

                {(intake.controlAndRails?.heirs?.length || 0) > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Heirs / Succession</span>
                    <div className="grid gap-2">
                      {intake.controlAndRails!.heirs!.map((h, i) => (
                        <div key={i} className="bg-muted/30 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-foreground">{h.name}</span>
                            <span className="text-xs text-muted-foreground">{h.relationship}, age {h.age}</span>
                            <span className="text-xs font-medium text-primary ml-auto">{Math.round(h.allocationPct * 100)}%</span>
                          </div>
                          {h.notes && (
                            <p className="text-[10px] text-muted-foreground mt-1">{h.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ReviewSection>

            {/* Asset Details */}
            {(intake.assetDetails?.estimatedValue || 0) > 0 && (
              <ReviewSection icon={Building} title="Asset Details">
                <ReviewGrid>
                  <ReviewField label="Estimated Value" value={`$${Number(intake.assetDetails!.estimatedValue || 0).toLocaleString()}`} />
                  {/* Real Estate */}
                  {intake.assetDetails!.propertyType && <ReviewField label="Property Type" value={intake.assetDetails!.propertyType} />}
                  {intake.assetDetails!.locationPreference && <ReviewField label="Location" value={intake.assetDetails!.locationPreference} />}
                  {(intake.assetDetails!.sizeSqft || 0) > 0 && <ReviewField label="Size" value={`${intake.assetDetails!.sizeSqft} sq ft`} />}
                  {(intake.assetDetails!.bedrooms || 0) > 0 && <ReviewField label="Bedrooms" value={String(intake.assetDetails!.bedrooms)} />}
                  {(intake.assetDetails!.rentalYieldPct || 0) > 0 && <ReviewField label="Expected Yield" value={`${intake.assetDetails!.rentalYieldPct}%`} />}
                  {(intake.assetDetails!.appreciationPct || 0) > 0 && <ReviewField label="Expected Appreciation" value={`${intake.assetDetails!.appreciationPct}%`} />}
                  {/* Art */}
                  {intake.assetDetails!.artCategory && <ReviewField label="Category" value={intake.assetDetails!.artCategory} />}
                  {intake.assetDetails!.artist && <ReviewField label="Artist" value={intake.assetDetails!.artist} />}
                  {intake.assetDetails!.period && <ReviewField label="Period" value={intake.assetDetails!.period} />}
                  {intake.assetDetails!.medium && <ReviewField label="Medium" value={intake.assetDetails!.medium} />}
                  {/* Jewellery */}
                  {intake.assetDetails!.jewelleryType && <ReviewField label="Type" value={intake.assetDetails!.jewelleryType} />}
                  {intake.assetDetails!.primaryMaterial && <ReviewField label="Material" value={intake.assetDetails!.primaryMaterial} />}
                  {intake.assetDetails!.certification && <ReviewField label="Certification" value={intake.assetDetails!.certification} />}
                  {/* Metals */}
                  {intake.assetDetails!.metalType && <ReviewField label="Metal" value={intake.assetDetails!.metalType} />}
                  {intake.assetDetails!.metalForm && <ReviewField label="Form" value={intake.assetDetails!.metalForm} />}
                  {intake.assetDetails!.weight && <ReviewField label="Weight" value={intake.assetDetails!.weight} />}
                  {intake.assetDetails!.storageMethod && <ReviewField label="Storage" value={intake.assetDetails!.storageMethod} />}
                  {/* Collectibles */}
                  {intake.assetDetails!.collectibleCategory && <ReviewField label="Category" value={intake.assetDetails!.collectibleCategory} />}
                  {intake.assetDetails!.description && <ReviewField label="Description" value={intake.assetDetails!.description} fullWidth />}
                  {/* Automotive */}
                  {intake.assetDetails!.vehicleType && <ReviewField label="Vehicle Type" value={intake.assetDetails!.vehicleType} />}
                  {intake.assetDetails!.makeModel && <ReviewField label="Make & Model" value={intake.assetDetails!.makeModel} />}
                  {(intake.assetDetails!.year || 0) > 0 && <ReviewField label="Year" value={String(intake.assetDetails!.year)} />}
                  {intake.assetDetails!.mileage && <ReviewField label="Mileage" value={intake.assetDetails!.mileage} />}
                  {/* Shared */}
                  {intake.assetDetails!.brand && <ReviewField label="Brand" value={intake.assetDetails!.brand} />}
                  {intake.assetDetails!.condition && <ReviewField label="Condition" value={intake.assetDetails!.condition} />}
                  {intake.assetDetails!.provenance && <ReviewField label="Provenance" value={intake.assetDetails!.provenance} />}
                </ReviewGrid>
              </ReviewSection>
            )}
          </div>

          {/* Right column: Payment card (sticky) */}
          <div className="hidden lg:block w-[380px] shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Payment Card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Card header */}
                <div className="px-5 py-4 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        Decision Posture Audit
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        SFO Pattern Intelligence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="px-5 py-5">
                  <div className="text-3xl font-bold text-foreground tracking-tight">
                    $5,000
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    One-time engagement fee
                  </p>
                </div>

                {/* Deliverables */}
                <div className="px-5 pb-4">
                  <div className="space-y-2.5">
                    {[
                      'Executive Verdict & Risk Profile',
                      'Regulatory Exposure Analysis',
                      'Structure Optimization',
                      'Precedent Intelligence Match',
                      '10-Year Wealth Projection',
                      'Crisis Stress Test',
                      'Market Intelligence & Peer Analysis',
                      'Decision Scenario Tree',
                      'Real Asset Audit Intelligence',
                      'Heir Management & Succession',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SLA + Pattern count */}
                <div className="px-5 py-3 border-t border-border bg-muted/20">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      48-hour SLA
                    </span>
                    <span>{patternCount ? patternCount.toLocaleString() : '...'} pattern library</span>
                  </div>
                </div>

                {/* Consent confirmation */}
                <div className="px-5 py-3 border-t border-border">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {intake.ndaConsent ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />
                      )}
                      <a href="/decision-memo/nda" target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-primary hover:underline transition-colors">NDA acknowledged</a>
                    </div>
                    <div className="flex items-center gap-2">
                      {intake.privacyConsent ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground" />
                      )}
                      <a href="/decision-memo/privacy" target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-primary hover:underline transition-colors">Privacy consent granted</a>
                    </div>
                  </div>
                </div>

                {/* Payment button */}
                <div className="px-5 py-4 border-t border-border">
                  <button
                    onClick={onProceedToPayment}
                    disabled={isSubmitting}
                    className={`
                      w-full py-3.5 px-4 rounded-xl font-semibold
                      flex items-center justify-center gap-2 transition-all
                      ${!isSubmitting
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </button>

                  {/* Trust badge */}
                  <div className="flex items-center gap-2 justify-center mt-3 text-[10px] text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>256-bit encrypted via Razorpay</span>
                  </div>
                </div>
              </div>

              {/* Back to edit */}
              <button
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-center"
              >
                Edit Inputs
              </button>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Payment section (visible on small screens) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-md border-t border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-lg font-bold text-foreground">$5,000</div>
                <div className="text-[10px] text-muted-foreground">Decision Posture Audit</div>
              </div>
              <button
                onClick={onProceedToPayment}
                disabled={isSubmitting}
                className={`
                  py-3 px-6 rounded-xl font-semibold
                  flex items-center gap-2 transition-all
                  ${!isSubmitting
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ReviewSection({
  icon: Icon,
  title,
  children
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-xl border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function ReviewGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {children}
    </div>
  );
}

function ReviewField({
  label,
  value,
  fullWidth
}: {
  label: string;
  value: string | undefined;
  fullWidth?: boolean;
}) {
  if (!value) return null;

  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
        {label}
      </span>
      <span className="text-sm text-foreground leading-relaxed">
        {value}
      </span>
    </div>
  );
}

function TagGroup({
  label,
  items,
  color
}: {
  label: string;
  items: string[] | undefined;
  color: 'amber' | 'red' | 'orange';
}) {
  if (!items || items.length === 0) return null;

  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    red: 'bg-red-500/10 text-red-700 dark:text-red-400',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  };

  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`px-2.5 py-1 text-xs rounded-full ${colorMap[color]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SummaryReview;
