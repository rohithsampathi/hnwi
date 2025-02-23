// app/api/verify-payment/route.ts

import { NextResponse } from "next/server"
import { createHmac } from "crypto"

const secret = process.env.RAZORPAY_WEBHOOK_SECRET

export async function POST(req: Request) {
  const body = await req.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  const text = `${razorpay_order_id}|${razorpay_payment_id}`
  const generated_signature = createHmac("sha256", secret!).update(text).digest("hex")

  if (generated_signature === razorpay_signature) {
    // Payment is verified
    // TODO: Update user's profile to include the purchased playbook
    // This would typically involve a database operation
    // For demonstration purposes, we'll just return a success response
    return NextResponse.json({ success: true, message: "Payment verified and playbook added to profile" })
  } else {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
  }
}

