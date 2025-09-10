import { NextRequest, NextResponse } from "next/server"
import type { BillingTransaction } from "@/types/user"

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || req.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // In a real implementation, this would fetch from your database
    // For now, we'll return mock transaction history
    const mockTransactions: BillingTransaction[] = [
      {
        id: 'tx_001',
        amount: 9900, // in cents
        currency: 'USD',
        description: 'Premium Plan - Monthly Subscription',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        invoice_url: '/api/invoice/tx_001'
      },
      {
        id: 'tx_002',
        amount: 9900,
        currency: 'USD',
        description: 'Premium Plan - Monthly Subscription',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        invoice_url: '/api/invoice/tx_002'
      },
      {
        id: 'tx_003',
        amount: 9900,
        currency: 'USD',
        description: 'Premium Plan - Monthly Subscription',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        invoice_url: '/api/invoice/tx_003'
      },
      {
        id: 'tx_004',
        amount: 9900,
        currency: 'USD',
        description: 'Premium Plan - Monthly Subscription (Failed)',
        date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'failed'
      }
    ]

    // Filter by status if provided
    const status = req.nextUrl.searchParams.get('status')
    const filteredTransactions = status 
      ? mockTransactions.filter(tx => tx.status === status)
      : mockTransactions

    return NextResponse.json({
      success: true,
      transactions: filteredTransactions,
      total: filteredTransactions.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, amount, description, payment_method_id } = body

    if (!userId || !amount || !payment_method_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // In a real implementation, this would:
    // 1. Create a payment intent with Razorpay
    // 2. Process the payment
    // 3. Store the transaction in the database
    
    const newTransaction: BillingTransaction = {
      id: `tx_${Date.now()}`,
      amount,
      currency: 'USD',
      description: description || 'Subscription Payment',
      date: new Date().toISOString(),
      status: 'pending',
      invoice_url: `/api/invoice/tx_${Date.now()}`
    }

    // Simulate payment processing
    setTimeout(() => {
      // This would be handled by Razorpay webhook in production
      newTransaction.status = 'success'
    }, 2000)

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: "Payment initiated successfully"
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}