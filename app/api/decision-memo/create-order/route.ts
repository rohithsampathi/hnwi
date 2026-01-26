// app/api/decision-memo/create-order/route.ts
// Create Razorpay order for Decision Memo payment

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { preview_id, user_id, email } = body;

    // Validate required fields
    if (!preview_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call backend to create Razorpay order
    const backendResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:8000'}/api/decision-memo/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preview_id,
        user_id,
        email,
      }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment order' },
        { status: backendResponse.status }
      );
    }

    const orderData = await backendResponse.json();
    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
