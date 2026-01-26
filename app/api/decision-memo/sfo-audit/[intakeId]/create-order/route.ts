// app/api/decision-memo/sfo-audit/[intakeId]/create-order/route.ts
// Create Razorpay order for SFO Pattern Audit payment

import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app';

export async function POST(
  request: Request,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    const body = await request.json();
    const { currency = 'INR' } = body;

    // Call backend to create Razorpay order
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/create-order`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error creating order:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment order' },
        { status: backendResponse.status }
      );
    }

    const orderData = await backendResponse.json();
    console.log('📦 [SFO Create Order] Backend response:', JSON.stringify(orderData, null, 2));
    console.log('📦 [SFO Create Order] Keys present:', Object.keys(orderData));
    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error creating SFO audit order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
