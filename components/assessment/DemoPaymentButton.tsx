// components/assessment/DemoPaymentButton.tsx
// Demo payment button for testing without Razorpay configuration

"use client";

import { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface DemoPaymentButtonProps {
  tier: 'operator' | 'observer';
  amount: string;
  onSuccess: () => void;
}

export function DemoPaymentButton({ tier, amount, onSuccess }: DemoPaymentButtonProps) {
  const [processing, setProcessing] = useState(false);

  const handleDemoPayment = () => {
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);

      // Show success message
      const confirmed = confirm(
        `🎉 Demo Payment Successful!\n\n` +
        `Tier: ${tier.charAt(0).toUpperCase() + tier.slice(1)}\n` +
        `Amount: ${amount}\n\n` +
        `This is a demo mode. To enable real payments:\n` +
        `1. Create payment buttons in Razorpay dashboard\n` +
        `2. Add button IDs to .env.local\n\n` +
        `Click OK to continue to dashboard.`
      );

      if (confirmed) {
        onSuccess();
      }
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleDemoPayment}
        disabled={processing}
        className="w-full group inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay {amount} (Demo)
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        🧪 Demo mode - No real payment will be charged
      </p>
    </div>
  );
}
