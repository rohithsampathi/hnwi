// lib/razorpay-checkout.ts
// Razorpay programmatic checkout integration

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  remember_customer?: boolean;
  send_sms_hash?: boolean;
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color?: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentUserData {
  name?: string;
  email?: string;
  phone?: string;
}

// Load Razorpay SDK script
export const loadRazorpaySDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create payment order
export const createPaymentOrder = async (
  tier: 'operator' | 'observer',
  sessionId: string,
  userData: PaymentUserData
): Promise<any> => {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        tier,
        session_id: sessionId,
        user_email: userData.email || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to create order');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (
  paymentResponse: RazorpayResponse,
  tier: 'operator' | 'observer',
  sessionId: string,
  userEmail?: string
): Promise<any> => {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature,
        tier,
        session_id: sessionId,
        user_email: userEmail
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Payment verification failed');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    throw error;
  }
};

// Open Razorpay checkout
export const openRazorpayCheckout = async (
  tier: 'operator' | 'observer',
  sessionId: string,
  userData: PaymentUserData,
  onSuccess: (data: any) => void,
  onFailure: (error: Error) => void
): Promise<void> => {
  try {
    // Load Razorpay SDK
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const orderData = await createPaymentOrder(tier, sessionId, userData);

    // Product names for display
    const productNames = {
      operator: 'Assessment Report - Operator Tier',
      observer: 'Assessment Report - Observer Tier'
    };

    // Build prefill with only non-empty values to avoid Razorpay validation errors
    const prefillData: { name?: string; email?: string; contact?: string } = {};
    if (userData.name?.trim()) prefillData.name = userData.name.trim();
    if (userData.email?.trim()) prefillData.email = userData.email.trim();
    if (userData.phone?.trim()) prefillData.contact = userData.phone.trim();

    // Razorpay checkout options
    const options: RazorpayOptions = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'HNWI Chronicles',
      description: productNames[tier],
      order_id: orderData.order_id,
      // Force fresh form - don't save or use saved customer data
      remember_customer: false,
      send_sms_hash: true,
      // Only include prefill if we have non-empty data
      ...(Object.keys(prefillData).length > 0 ? { prefill: prefillData } : {}),
      theme: {
        color: '#DAA520' // Primary gold color
      },
      handler: async (response: RazorpayResponse) => {
        try {
          // Verify payment
          const verifyData = await verifyPayment(response, tier, sessionId, userData.email);
          onSuccess(verifyData);

        } catch (error) {
          onFailure(error instanceof Error ? error : new Error('Verification failed'));
        }
      },
      modal: {
        ondismiss: () => {
          onFailure(new Error('Payment cancelled'));
        }
      }
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (error) {
    onFailure(error instanceof Error ? error : new Error('Failed to open checkout'));
  }
};
