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
      icon: Crown,
      price: '$1,499',
      priceSubtext: 'per month • Building infrastructure together',
      gradient: 'from-primary/10 to-primary/5',
      borderColor: 'border-primary',
      iconColor: 'text-primary',
      features: [
        'Access $500K+ investment deals',
        'Get 3-7 day early warnings on regulations',
        'Build your network with other Architects',
        'Vote on new platform features',
        'Use AI tools for wealth planning',
        'Priority support from our team'
      ],
      ctaText: 'Join Architect Collective',
      highlighted: currentTier === 'architect'
    },
    {
      id: 'operator',
      name: 'Operator',
      icon: TrendingUp,
      price: '$599',
      priceSubtext: 'per month • Strategic partnership',
      gradient: 'from-muted/50 to-muted/20',
      borderColor: 'border-border',
      iconColor: 'text-foreground',
      features: [
        'Get daily market intelligence briefs',
        'Access investment opportunities $100K+',
        'Connect with other Operators',
        'Early warnings on tax changes',
        'Ask Rohith AI unlimited questions',
        'Track your wealth with Crown Vault'
      ],
      ctaText: 'Join Operator Network',
      highlighted: currentTier === 'operator'
    },
    {
      id: 'observer',
      name: 'Observer',
      icon: AlertTriangle,
      price: '$199',
      priceSubtext: 'per month • Protecting together',
      gradient: 'from-muted/50 to-muted/20',
      borderColor: 'border-border',
      iconColor: 'text-foreground',
      features: [
        'Receive weekly intelligence updates',
        'Get notified of major regulatory changes',
        'Basic access to Ask Rohith AI',
        'Store assets in Crown Vault',
        'Join Observer community network',
        'View HNWI World developments'
      ],
      ctaText: 'Support Defense Collective',
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

  return (
    <section className="py-12">
      <div className="text-center mb-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-3">Your Access Options</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your assessment, you qualify for the <span className="font-bold text-foreground">{currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span> tier.
          See all available tiers below to understand the complete intelligence ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {tiers.map((tier, index) => {
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
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-card rounded-lg`}>
                    <Icon className={`w-6 h-6 ${tier.iconColor}`} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold">{tier.name}</h3>
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
                          No payment required. We'll contact you within 24h.
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
                            WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            value={architectWhatsapp}
                            onChange={(e) => setArchitectWhatsapp(e.target.value)}
                            required
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

                        <p className="text-xs text-muted-foreground text-center">
                          No payment required. We'll contact you within 24h.
                        </p>
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

      {/* Bottom note - Purpose-driven mission */}
      <div className="text-center mt-8 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-3">
          All tiers include access to HNWI World intelligence, Ask Rohith AI advisor, and Crown Vault digital asset management.
          Higher tiers unlock exclusive opportunities and personalized strategic support.
        </p>
        <p className="text-xs text-muted-foreground/70 max-w-xl mx-auto italic">
          Your annual funding supports the collective mission: building peer intelligence, preserving wealth legacy,
          and architecting permissionless financial sovereignty together.
        </p>
      </div>
    </section>
  );
}
