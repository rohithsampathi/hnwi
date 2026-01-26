// app/api/decision-memo/payment/initiate/route.ts
// Create Razorpay order for Decision Memo payment ($1,000)

import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intake_id } = body;

    // Validate required fields
    if (!intake_id) {
      return NextResponse.json(
        { success: false, error: 'Missing intake_id' },
        { status: 400 }
      );
    }

    // Call Python backend to create Razorpay order
    const response = await fetch(`${API_BASE_URL}/api/decision-memo/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intake_id }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Backend returns: { success: true, order_id, amount, currency, key }
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment. Please try again.' },
      { status: 500 }
    );
  }
}
