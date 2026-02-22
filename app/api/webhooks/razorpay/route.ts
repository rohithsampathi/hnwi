// app/api/webhooks/razorpay/route.ts
// Razorpay webhook handler for payment events

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/secure-logger';
import { safeError } from '@/lib/security/api-response';

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

    logger.info('Received Razorpay webhook');

    if (!RAZORPAY_WEBHOOK_SECRET) {
      logger.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    if (!signature) {
      logger.error('Webhook missing signature header');
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
      logger.error('Webhook invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload: RazorpayWebhookPayload = JSON.parse(body);
    logger.info('Webhook event type', { event: payload.event });

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
        logger.info('Webhook unhandled event type', { event: payload.event });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Error processing webhook', { error: error instanceof Error ? error.message : String(error) });
    return safeError(error);
  }
}

async function handlePaymentCaptured(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  logger.info('Webhook payment captured', { paymentId: payment.id, orderId: payment.order_id });

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
      logger.error('Failed to record payment capture in backend');
    } else {
      logger.info('Payment capture recorded successfully');
    }
  } catch (error) {
    logger.error('Error recording payment capture', { error: error instanceof Error ? error.message : String(error) });
  }
}

async function handlePaymentFailed(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  logger.info('Webhook payment failed', { paymentId: payment.id, orderId: payment.order_id });

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
      logger.error('Failed to record payment failure in backend');
    }
  } catch (error) {
    logger.error('Error recording payment failure', { error: error instanceof Error ? error.message : String(error) });
  }
}

async function handleOrderPaid(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment.entity;

  logger.info('Webhook order paid', { paymentId: payment.id, orderId: payment.order_id });

  // Additional logic for order paid event if needed
}
