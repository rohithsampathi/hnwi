export type SubscriptionTier = 'observer' | 'operator' | 'architect'
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial'

export interface BillingTransaction {
  id: string
  amount: number
  currency: string
  description: string
  date: string
  status: 'success' | 'failed' | 'pending'
  invoice_url?: string
}

export interface Subscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  start_date?: string
  end_date?: string
  trial_end_date?: string
  auto_renew: boolean
  payment_method?: {
    type: 'card' | 'upi' | 'netbanking'
    last_four?: string
    brand?: string
  }
  next_billing_date?: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface User {
  user_id: string
  email: string
  name: string
  net_worth: number
  city: string
  country: string
  industries?: string[]
  company: string
  phone_number: string
  linkedin: string
  office_address: string
  crypto_investor: boolean
  land_investor: boolean
  bio: string
  subscribedDate?: string
  subscription?: Subscription
  billing_history?: BillingTransaction[]
  razorpay_customer_id?: string
  tier?: SubscriptionTier
  subscription_tier?: SubscriptionTier
  role?: string
}

