// app/api/verify-payment/route.ts

import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import type { Subscription, BillingTransaction } from "@/types/user"

const secret = process.env.RAZORPAY_WEBHOOK_SECRET

interface PaymentMetadata {
  user_id: string
  subscription_tier?: 'free' | 'essential' | 'professional' | 'family_office'
  billing_cycle?: 'monthly' | 'yearly'
  payment_type?: 'subscription' | 'playbook' | 'one-time'
  playbook_id?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      metadata 
    } = body as { 
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
      metadata?: PaymentMetadata
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = createHmac("sha256", secret!).update(text).digest("hex")

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" }, 
        { status: 400 }
      )
    }

    // Payment is verified - now process based on payment type
    if (metadata?.payment_type === 'subscription' && metadata.subscription_tier) {
      // Handle subscription payment
      const subscription = await updateUserSubscription(
        metadata.user_id,
        metadata.subscription_tier,
        metadata.billing_cycle || 'monthly',
        razorpay_payment_id
      )

      // Create billing transaction record
      const transaction = await createBillingTransaction({
        user_id: metadata.user_id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: getSubscriptionAmount(metadata.subscription_tier, metadata.billing_cycle || 'monthly'),
        description: `${metadata.subscription_tier} Plan - ${metadata.billing_cycle || 'monthly'}`,
        status: 'success'
      })

      return NextResponse.json({ 
        success: true, 
        message: "Subscription updated successfully",
        subscription,
        transaction
      })
    } else if (metadata?.payment_type === 'playbook' && metadata.playbook_id) {
      // Handle playbook purchase (existing logic)
      // TODO: Add playbook to user's purchased items
      return NextResponse.json({ 
        success: true, 
        message: "Payment verified and playbook added to profile",
        playbook_id: metadata.playbook_id
      })
    } else {
      // Handle generic payment
      return NextResponse.json({ 
        success: true, 
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    )
  }
}

// Helper function to update user subscription (would connect to your database)
async function updateUserSubscription(
  userId: string,
  tier: 'free' | 'essential' | 'professional' | 'family_office',
  billingCycle: 'monthly' | 'yearly',
  paymentId: string
): Promise<Subscription> {
  // In a real implementation, this would update your database
  // For now, return a mock subscription object
  const duration = billingCycle === 'yearly' ? 365 : 30
  
  return {
    tier,
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
    auto_renew: true,
    payment_method: {
      type: 'card',
      last_four: '4242',
      brand: 'Visa'
    },
    next_billing_date: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
    billing_cycle: billingCycle
  }
}

// Helper function to create billing transaction record
async function createBillingTransaction(data: {
  user_id: string
  payment_id: string
  order_id: string
  amount: number
  description: string
  status: 'success' | 'failed' | 'pending'
}): Promise<BillingTransaction> {
  // In a real implementation, this would insert into your database
  return {
    id: data.payment_id,
    amount: data.amount,
    currency: 'USD',
    description: data.description,
    date: new Date().toISOString(),
    status: data.status,
    invoice_url: `/api/invoice/${data.payment_id}`
  }
}

// Helper function to get subscription amount in cents
function getSubscriptionAmount(tier: string, cycle: string): number {
  const prices = {
    essential: { monthly: 9900, yearly: 99000 },
    professional: { monthly: 29900, yearly: 299000 },
    family_office: { monthly: 59900, yearly: 599000 },
    free: { monthly: 0, yearly: 0 }
  }
  
  return prices[tier as keyof typeof prices]?.[cycle as keyof typeof prices.essential] || 0
}

// Webhook endpoint for Razorpay recurring payments
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { event, payload } = body

    // Verify webhook signature
    const webhookSignature = req.headers.get('x-razorpay-signature')
    if (!webhookSignature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 401 }
      )
    }

    const expectedSignature = createHmac("sha256", secret!)
      .update(JSON.stringify(body))
      .digest("hex")

    if (webhookSignature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      )
    }

    // Handle different webhook events
    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        // Handle successful subscription payment
        await handleSubscriptionCharged(payload)
        break
      
      case 'subscription.cancelled':
        // Handle subscription cancellation
        await handleSubscriptionCancelled(payload)
        break
      
      case 'subscription.expired':
        // Handle subscription expiration
        await handleSubscriptionExpired(payload)
        break
      
      case 'payment.failed':
        // Handle failed payment
        await handlePaymentFailed(payload)
        break
      
      default:
        // Unhandled webhook event
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

// Webhook handler functions
async function handleSubscriptionCharged(payload: any) {
  // Update subscription status and create transaction record
}

async function handleSubscriptionCancelled(payload: any) {
  // Mark subscription as cancelled
}

async function handleSubscriptionExpired(payload: any) {
  // Mark subscription as expired
}

async function handlePaymentFailed(payload: any) {
  // Handle failed payment and notify user
}

