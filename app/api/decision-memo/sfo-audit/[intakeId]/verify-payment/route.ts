// app/api/decision-memo/sfo-audit/[intakeId]/verify-payment/route.ts
// Verify Razorpay payment and return full IC Artifact

import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://hnwi-uwind-p8oqb.ondigitalocean.app';

export async function POST(
  request: Request,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    // Call backend to verify payment and get full artifact
    const backendResponse = await fetch(
      `${API_BASE_URL}/api/decision-memo/sfo-audit/${intakeId}/verify-payment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error verifying payment:', errorText);
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: backendResponse.status }
      );
    }

    const verificationData = await backendResponse.json();
    return NextResponse.json(verificationData);
  } catch (error) {
    console.error('Error verifying SFO audit payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
