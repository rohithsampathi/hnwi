// app/api/webhooks/razorpay/route.ts
// Razorpay webhook handler for payment events

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        email: string;
        contact: string;
        created_at: number;
        notes?: {
          tier?: string;
          session_id?: string;
          user_email?: string;
        };
      };
    };
  };
  created_at: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    console.log('[Webhook] Received Razorpay webhook');

    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error('[Webhook] Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error('[Webhook] Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload: RazorpayWebhookPayload = JSON.parse(body);
    console.log('[Webhook] Event type:', payload.event);

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      case 'order.paid':
        await handleOrderPaid(payload);
        break;

      default:
        console.log('[Webhook] Unhandled event type:', payload.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  console.log('[Webhook] Payment captured:', {
    payment_id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount / 100, // Convert from paise to dollars
    status: payment.status
  });

  try {
    // Record payment in backend
    const backendResponse = await fetch(`${API_BASE_URL}/api/payments/webhook-capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        tier: payment.notes?.tier,
        session_id: payment.notes?.session_id,
        captured_at: new Date(payment.created_at * 1000).toISOString()
      })
    });

    if (!backendResponse.ok) {
      console.error('[Webhook] Failed to record payment capture in backend');
    } else {
      console.log('[Webhook] Payment capture recorded successfully');
    }
  } catch (error) {
    console.error('[Webhook] Error recording payment capture:', error);
  }
}

async function handlePaymentFailed(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  console.log('[Webhook] Payment failed:', {
    payment_id: payment.id,
    order_id: payment.order_id,
    status: payment.status
  });

  try {
    // Notify backend of failed payment
    const backendResponse = await fetch(`${API_BASE_URL}/api/payments/webhook-failed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_id: payment.id,
        order_id: payment.order_id,
        status: payment.status,
        tier: payment.notes?.tier,
        session_id: payment.notes?.session_id,
        failed_at: new Date(payment.created_at * 1000).toISOString()
      })
    });

    if (!backendResponse.ok) {
      console.error('[Webhook] Failed to record payment failure in backend');
    }
  } catch (error) {
    console.error('[Webhook] Error recording payment failure:', error);
  }
}

async function handleOrderPaid(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  console.log('[Webhook] Order paid:', {
    payment_id: payment.id,
    order_id: payment.order_id
  });

  // Additional logic for order paid event if needed
}
