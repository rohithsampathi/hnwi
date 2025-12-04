// lib/razorpay.ts
// Razorpay payment integration utilities

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Tier pricing in USD cents
export const TIER_PRICING = {
  operator: {
    amount: 59900, // $599 in cents
    currency: 'USD',
    name: 'HNWI Chronicles - Operator Tier',
    description: 'Lifetime access to Operator tier intelligence'
  },
  observer: {
    amount: 19900, // $199 in cents
    currency: 'USD',
    name: 'HNWI Chronicles - Observer Tier',
    description: 'Lifetime access to Observer tier intelligence'
  }
};

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  tier: 'operator' | 'observer',
  userEmail?: string,
  userName?: string,
  onSuccess?: (response: RazorpayResponse) => void,
  onFailure?: () => void
): Promise<void> => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    alert('Failed to load payment gateway. Please try again.');
    onFailure?.();
    return;
  }

  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!razorpayKey) {
    console.error('Razorpay key not configured');
    alert('Payment gateway not configured. Please contact support.');
    onFailure?.();
    return;
  }

  const pricing = TIER_PRICING[tier];

  const options: RazorpayOptions = {
    key: razorpayKey,
    amount: pricing.amount,
    currency: pricing.currency,
    name: pricing.name,
    description: pricing.description,
    prefill: {
      email: userEmail,
      name: userName,
    },
    theme: {
      color: '#DAA520' // Primary color (gold)
    },
    handler: (response: RazorpayResponse) => {
      console.log('Payment successful:', response);
      onSuccess?.(response);
    },
    modal: {
      ondismiss: () => {
        console.log('Payment cancelled by user');
        onFailure?.();
      }
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.open();
};

// Verify payment signature (call this from backend)
export const verifyPaymentSignature = async (
  paymentId: string,
  orderId?: string,
  signature?: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_id: paymentId,
        order_id: orderId,
        signature: signature
      })
    });

    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
};
