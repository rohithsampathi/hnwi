// components/assessment/TierPricingComparison.tsx
// Three-column tier pricing comparison with embedded form for Architect

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, AlertTriangle, Check, Mail, Phone, ArrowRight } from 'lucide-react';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';

interface TierPricingComparisonProps {
  currentTier: 'architect' | 'operator' | 'observer';
  sessionId: string;
  onArchitectSubmit: (email: string, whatsapp: string) => Promise<void>;
  onPaymentSuccess: (tier: 'operator' | 'observer', userData?: any) => void;
}

export function TierPricingComparison({
  currentTier,
  sessionId,
  onArchitectSubmit,
  onPaymentSuccess
}: TierPricingComparisonProps) {
  // Architect form state
  const [architectEmail, setArchitectEmail] = useState('');
  const [architectWhatsapp, setArchitectWhatsapp] = useState('');
  const [architectSubmitting, setArchitectSubmitting] = useState(false);
  const [architectSubmitted, setArchitectSubmitted] = useState(false);
  const [showArchitectForm, setShowArchitectForm] = useState(false);

  // Operator & Observer payment state
  const [processingPaymentTier, setProcessingPaymentTier] = useState<'operator' | 'observer' | null>(null);

  const handleArchitectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArchitectSubmitting(true);
    try {
      await onArchitectSubmit(architectEmail, architectWhatsapp);
      setArchitectSubmitted(true);
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setArchitectSubmitting(false);
    }
  };

  const handlePayment = async (tier: 'operator' | 'observer') => {
    setProcessingPaymentTier(tier);

    try {
      // Open Razorpay with empty userData - user fills details in Razorpay modal
      await openRazorpayCheckout(
        tier,
        sessionId,
        {
          name: '',
          email: '',
          phone: ''
        },
        (verifyData) => {
          // Payment successful and verified
          setProcessingPaymentTier(null);
          onPaymentSuccess(tier, verifyData);
        },
        (error) => {
          // Payment failed or cancelled
          setProcessingPaymentTier(null);
          if (error.message !== 'Payment cancelled') {
            alert(error.message || 'Payment failed. Please try again.');
          }
        }
      );
    } catch (error) {
      setProcessingPaymentTier(null);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const allTiers = [
    {
      id: 'architect',
      name: 'Architect',
      subtitle: 'Principal Infrastructure',
      icon: Crown,
      price: '$1,499',
      priceSubtext: 'per month',
      gradient: 'from-primary/10 to-primary/5',
      borderColor: 'border-primary',
      iconColor: 'text-primary',
      features: [
        'Everything in Operator',
        'Signal Coverage Map tracking matched + gap signals with month-over-month analysis',
        'Executor Directory + warm-intro workflow for signals (where available): jurisdiction-tagged operators who can execute diligence / structuring / sourcing',
        'Monthly Peer Signal Packet + Gap Closure Packet (structured, forwardable)',
        'Quarterly drill + private debrief session',
        'Request tracking on specific structures',
        'Priority inbox for principal-level intelligence'
      ],
      ctaText: 'Request Principal Access',
      highlighted: currentTier === 'architect'
    },
    {
      id: 'operator',
      name: 'Operator',
      subtitle: 'Active Coverage',
      icon: TrendingUp,
      price: '$599',
      priceSubtext: 'per month',
      gradient: 'from-muted/50 to-muted/20',
      borderColor: 'border-border',
      iconColor: 'text-foreground',
      features: [
        'Everything in Observer',
        'Set custom coverage: pick jurisdictions + asset arenas (personalized feed)',
        'Daily intelligence briefs for your coverage',
        'Access to $100K+ opportunity packets + case notes',
        'Analysis assistant (unlimited AI queries)',
        'Full Crown Vault asset tracking + heir management'
      ],
      ctaText: 'Activate Coverage',
      highlighted: currentTier === 'operator'
    },
    {
      id: 'observer',
      name: 'Observer',
      subtitle: 'Monitoring',
      icon: AlertTriangle,
      price: '$199',
      priceSubtext: 'per month',
      gradient: 'from-muted/50 to-muted/20',
      borderColor: 'border-border',
      iconColor: 'text-foreground',
      features: [
        'Save your baseline posture map + gap list',
        'Weekly "delta" updates for signals matching your profile',
        'View pinned signals + briefs (read-only access)',
        'Re-run quarterly drill to track drift',
        'Basic Crown Vault access',
        'Observer community network'
      ],
      ctaText: 'Start Monitoring',
      highlighted: currentTier === 'observer'
    }
  ];

  // Show all tiers to everyone, but lock appropriately to show "what they're missing"
  // Observer: Sees all 3 tiers - only Observer unlocked (Architect/Operator locked to show what's available at higher tiers)
  // Operator: Sees all 3 tiers - Operator AND Observer unlocked (Architect locked as upgrade)
  // Architect: Sees all 3 tiers - ALL unlocked (highest tier gets access to everything)
  const tiers = allTiers.map(tier => ({
    ...tier,
    // Lock tiers based on hierarchical access
    isLocked:
      // Observer can only access Observer tier
      (currentTier === 'observer' && tier.id !== 'observer')
      // Operator can access Operator AND Observer (not Architect)
      || (currentTier === 'operator' && tier.id === 'architect')
      // Architect can access all tiers (nothing locked)
      || (currentTier === 'architect' && false),
    // Add lock reason for better messaging
    lockReason:
      // Observer viewing higher tiers
      (currentTier === 'observer' && (tier.id === 'operator' || tier.id === 'architect'))
        ? 'Upgrade Required'
      // Operator viewing Architect
      : (currentTier === 'operator' && tier.id === 'architect')
        ? 'Upgrade Available'
      : undefined
  }));

  // If user is Architect, show Architect as main tier and collapse others
  const isArchitectUser = currentTier === 'architect';
  const [showTeamTiers, setShowTeamTiers] = useState(false);

  // For Architect users: only show Architect tier by default, others under "Team access tiers"
  const displayTiers = isArchitectUser && !showTeamTiers
    ? tiers.filter(t => t.id === 'architect')
    : tiers;

  return (
    <section className="py-12">
      <div className="text-center mb-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-3">
          {isArchitectUser ? 'Your Principal Access' : 'Your Access Options'}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isArchitectUser ? (
            <>
              You qualify for <span className="font-bold text-primary">Architect</span> — principal-level infrastructure.
              This is the highest tier with complete platform access.
            </>
          ) : (
            <>
              Based on your assessment, you qualify for the <span className="font-bold text-foreground">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span> tier.
              See all available tiers below to understand the complete intelligence ecosystem.
            </>
          )}
        </p>
      </div>

      <div className={`grid grid-cols-1 ${!isArchitectUser || showTeamTiers ? 'lg:grid-cols-3' : ''} gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
        {displayTiers.map((tier, index) => {
          const Icon = tier.icon;
          const isArchitect = tier.id === 'architect';
          const isPaymentTier = tier.id === 'operator' || tier.id === 'observer';

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card rounded-lg border-2 ${tier.borderColor} ${
                tier.highlighted ? 'ring-2 ring-primary/50 shadow-xl' : 'shadow-lg'
              } ${tier.isLocked ? 'opacity-70' : ''} overflow-hidden`}
            >
              {/* Highlighted badge */}
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  YOUR TIER
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-br ${tier.gradient} p-6 border-b border-border`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 bg-card rounded-lg`}>
                    <Icon className={`w-6 h-6 ${tier.iconColor}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    {tier.subtitle && (
                      <p className="text-xs text-muted-foreground">{tier.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tier.priceSubtext}</p>
              </div>

              {/* Features */}
              <div className="p-6 space-y-3 min-h-[300px]">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="p-6 pt-0">
                {tier.isLocked ? (
                  // Locked tier - Show what they're missing
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3 opacity-50">
                      <Icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1 text-muted-foreground">
                      {tier.lockReason || 'Tier Unavailable'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentTier === 'observer' && (tier.id === 'operator' || tier.id === 'architect')
                        ? 'Contact us to discuss upgrading your tier'
                        : currentTier === 'operator' && tier.id === 'architect'
                        ? 'Contact us to upgrade to Architect tier'
                        : 'This tier is not available for your assessment result'}
                    </p>
                  </div>
                ) : isArchitect ? (
                  // Architect: Button first, then form
                  <>
                    {architectSubmitted ? (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mb-3">
                          <Check className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-sm font-medium mb-1">Request Submitted!</p>
                        <p className="text-xs text-muted-foreground">
                          We'll reach out within 24 hours.
                        </p>
                      </div>
                    ) : !showArchitectForm ? (
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowArchitectForm(true)}
                          className="w-full group inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all"
                        >
                          {tier.ctaText}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-muted-foreground text-center">
                          Request onboarding — billing after activation.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleArchitectSubmit} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-primary" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={architectEmail}
                            onChange={(e) => setArchitectEmail(e.target.value)}
                            required
                            placeholder="your@email.com"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-primary" />
                            WhatsApp Number <span className="text-muted-foreground font-normal">(optional)</span>
                          </label>
                          <input
                            type="tel"
                            value={architectWhatsapp}
                            onChange={(e) => setArchitectWhatsapp(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={architectSubmitting}
                          className="w-full group inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {architectSubmitting ? 'Submitting...' : 'Submit Request'}
                          {!architectSubmitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground text-center">
                            Request onboarding — billing after activation.
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 text-center italic">
                            Executors are listed for operational convenience; not investment advice. Relationship status is disclosed per executor.
                          </p>
                        </div>
                      </form>
                    )}
                  </>
                ) : tier.id === 'operator' || tier.id === 'observer' ? (
                  // Operator & Observer: Direct Razorpay payment
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePayment(tier.id as 'operator' | 'observer')}
                      disabled={processingPaymentTier === tier.id}
                      className="w-full group inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPaymentTier === tier.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Opening Payment...
                        </>
                      ) : (
                        <>
                          {tier.ctaText}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      Monthly subscription • Build peer intelligence together • Lifetime wealth legacy
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Other access levels for Architect users */}
      {isArchitectUser && !showTeamTiers && (
        <div className="text-center mt-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowTeamTiers(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-muted/50 hover:bg-muted border border-border rounded-lg transition-all text-sm font-medium text-foreground"
          >
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            View Other Access Levels
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            Operator ($599) and Observer ($199) also available
          </p>
        </div>
      )}

      {/* Bottom note - Purpose-driven mission */}
      <div className="text-center mt-8 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-3">
          All tiers include access to HNWI World intelligence, Ask Rohith AI advisor, and Crown Vault digital asset management.
          Higher tiers unlock exclusive opportunities and personalized strategic support.
        </p>
        <p className="text-xs text-muted-foreground/70 max-w-xl mx-auto italic">
          Your funding supports the collective mission: building peer intelligence, preserving wealth legacy,
          and architecting permissionless financial sovereignty together.
        </p>
      </div>
    </section>
  );
}
