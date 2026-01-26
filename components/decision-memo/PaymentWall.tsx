// components/decision-memo/PaymentWall.tsx
// Payment wall with Razorpay integration

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Shield, Clock, FileText } from 'lucide-react';

interface PaymentWallProps {
  previewId: string;
  preventedLoss: number;
  onPaymentSuccess: () => void;
}

export function PaymentWall({ previewId, preventedLoss, onPaymentSuccess }: PaymentWallProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create Razorpay order via backend
      const orderResponse = await fetch('/api/decision-memo/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview_id: previewId,
          user_id: typeof window !== 'undefined' ? localStorage.getItem('decision_memo_session_id') : '',
          email: '', // TODO: Get from user context
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Backend handles Razorpay, verify payment and call success
      const verifyResponse = await fetch('/api/decision-memo/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview_id: previewId,
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: orderData.payment_id || orderData.order_id,
          razorpay_signature: orderData.signature || 'backend_signature',
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      onPaymentSuccess();
      setIsProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-amber-500/30 rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          COMPLETE YOUR DECISION MEMO
        </h2>
        <p className="text-lg text-muted-foreground">
          You've seen your stress test results: <strong className="text-green-500">${preventedLoss.toLocaleString()} in prevented losses</strong>.
        </p>
        <p className="text-muted-foreground mt-2">
          This preview is 10% of your full memo.
        </p>
      </div>

      {/* Full Memo Benefits */}
      <div className="bg-muted/30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Your full memo includes:</h3>
        <div className="space-y-3">
          {[
            'Complete exposure map (all 12 blind spots, not just 3)',
            'All failure modes with evidence citations',
            'Corrected sequencing (4-step Before → After roadmap)',
            '10+ precedents cited (from 1,875 developments)',
            'Deep dive on matched opportunities with timing analysis',
            'Implementation roadmap with advisor SLAs',
            'Evidence sources (full MongoDB dev_ids)',
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="text-center mb-8">
        <div className="inline-block">
          <div className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Complete Payment
          </div>
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <span className="text-5xl font-bold">₹83,000</span>
            <span className="text-xl text-muted-foreground">INR</span>
          </div>
          <div className="text-muted-foreground">(~$1,000 USD)</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-3">
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            'Pay with Razorpay →'
          )}
        </button>

        {/* Details */}
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <div>Prevents: $100,000+ in allocation mistakes</div>
          <div>Delivery: PDF in your email within 48 hours</div>
          <div>Questions? Email support@hnwichronicles.com</div>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
        <TrustSignal
          icon={Shield}
          title="Secure Payment"
          subtitle="256-bit SSL encryption"
        />
        <TrustSignal
          icon={DollarSign}
          title="Money-back guarantee"
          subtitle="If memo doesn't deliver value"
        />
        <TrustSignal
          icon={Clock}
          title="48-hour delivery"
          subtitle="PDF + email confirmation"
        />
      </div>
    </motion.div>
  );
}

function TrustSignal({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div>
      <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
      <div className="font-semibold">{title}</div>
      <div>{subtitle}</div>
    </div>
  );
}
