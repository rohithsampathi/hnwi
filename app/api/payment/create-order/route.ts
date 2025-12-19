// app/api/payment/create-order/route.ts
// Create Razorpay order for payment processing

import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const TIER_PRICING = {
  operator: {
    amount: 59900, // $599 monthly in cents
    currency: 'USD',
    receipt_prefix: 'HNWI_OP_'
  },
  observer: {
    amount: 19900, // $199 monthly in cents
    currency: 'USD',
    receipt_prefix: 'HNWI_OB_'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, session_id, user_email } = body;

    if (!tier || !['operator', 'observer'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    const pricing = TIER_PRICING[tier as keyof typeof TIER_PRICING];

    // Create receipt ID that's under 40 characters
    // Extract last 8 chars of session_id (unique part) + timestamp in base36 (8 chars)
    const sessionShort = session_id.slice(-8);
    const timestampShort = Date.now().toString(36).slice(-8);
    const receiptId = `${pricing.receipt_prefix}${sessionShort}_${timestampShort}`;
    // Result: HNWI_OP_ea3007_abc12345 = ~26 chars (well under 40)

    // Create Razorpay order
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: pricing.amount,
        currency: pricing.currency,
        receipt: receiptId,
        notes: {
          tier,
          session_id,
          user_email: user_email || 'unknown'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Failed to create order');
    }

    const order = await response.json();

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
