"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/theme-context"
import { RazorpayButton } from "@/components/razorpay-button"
import type { SubscriptionTier } from "@/types/user"
import { 
  Crown, 
  Zap, 
  Shield, 
  Check,
  Star,
  TrendingUp,
  Users,
  Lock,
  Sparkles
} from "lucide-react"
import { getVisibleHeadingColor, getVisibleTextColor } from "@/lib/colors"

interface PlanUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier?: SubscriptionTier
  onSuccess?: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly') => void
}

const PLANS = [
  {
    tier: 'essential' as SubscriptionTier,
    name: 'Essential',
    icon: Shield,
    monthlyPrice: 99,
    yearlyPrice: 990,
    color: 'from-blue-500 to-cyan-600',
    tagline: 'Perfect for staying informed',
    features: [
      'Daily intelligence briefs (6 AM UTC)',
      'Intelligence from 140,000+ wealth movements',
      '30-day archive access'
    ],
    limitations: [
      'No Privé Exchange access',
      'No Crown Vault access',
      'No WhatsApp updates'
    ]
  },
  {
    tier: 'professional' as SubscriptionTier,
    name: 'Professional',
    icon: Zap,
    monthlyPrice: 299,
    yearlyPrice: 2990,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Most Popular',
    tagline: 'For active wealth management',
    features: [
      'Everything in Essential',
      'Privé Exchange - off-market opportunities',
      'Crown Vault - succession planning (10 assets)',
      '90-day archive access',
      'Monthly strategy call',
      'WhatsApp updates for urgent intelligence'
    ],
    limitations: []
  },
  {
    tier: 'family_office' as SubscriptionTier,
    name: 'Family Office',
    icon: Crown,
    monthlyPrice: 599,
    yearlyPrice: 5990,
    color: 'from-yellow-500 to-amber-600',
    tagline: 'For complex portfolios',
    features: [
      'Everything in Professional',
      'Unlimited Crown Vault storage',
      'Direct WhatsApp access to analysts',
      'Custom portfolio impact analysis',
      'Full historical archive (1,562 briefs)',
      'Priority intelligence alerts',
      'Quarterly wealth defense review'
    ],
    limitations: []
  }
]

// Razorpay payment button IDs (these should be configured in your Razorpay dashboard)
const PAYMENT_BUTTON_IDS = {
  essential_monthly: 'pl_essential_monthly',
  essential_yearly: 'pl_essential_yearly',
  professional_monthly: 'pl_professional_monthly',
  professional_yearly: 'pl_professional_yearly',
  family_office_monthly: 'pl_family_office_monthly',
  family_office_yearly: 'pl_family_office_yearly'
}

export function PlanUpgradeModal({ 
  isOpen, 
  onClose, 
  currentTier = 'free',
  onSuccess 
}: PlanUpgradeModalProps) {
  const { theme } = useTheme()
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('professional')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const selectedPlan = PLANS.find(p => p.tier === selectedTier)
  const currentPlanIndex = PLANS.findIndex(p => p.tier === currentTier)
  const selectedPlanIndex = PLANS.findIndex(p => p.tier === selectedTier)
  const isDowngrade = selectedPlanIndex < currentPlanIndex
  
  const getPrice = () => {
    if (!selectedPlan) return 0
    return billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice
  }
  
  const getSavings = () => {
    if (!selectedPlan || billingCycle === 'monthly') return 0
    const yearlyTotal = selectedPlan.monthlyPrice * 12
    return yearlyTotal - selectedPlan.yearlyPrice
  }
  
  const getPaymentButtonId = () => {
    if (selectedTier === 'free') return null
    // Map tier names to match payment button IDs
    const tierKey = selectedTier === 'family_office' ? 'family_office' : selectedTier
    return PAYMENT_BUTTON_IDS[`${tierKey}_${billingCycle}` as keyof typeof PAYMENT_BUTTON_IDS]
  }
  
  const handlePaymentSuccess = () => {
    setIsProcessing(false)
    onSuccess?.(selectedTier, billingCycle)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black/95 border-gray-800">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl font-bold text-white">
            Membership Options
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-lg mt-2">
            Intelligence designed for serious wealth. No applications. No committees.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Billing Cycle Toggle - Hidden for now as per screenshot */}
          {false && (
            <div className="flex items-center justify-center gap-4 p-1 bg-gray-900 rounded-lg">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('monthly')}
                className="flex-1"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('yearly')}
                className="flex-1"
              >
                Yearly
                {getSavings() > 0 && (
                  <Badge className="ml-2 bg-green-500/10 text-green-600">
                    Save ${getSavings()}
                  </Badge>
                )}
              </Button>
            </div>
          )}
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const isSelected = selectedTier === plan.tier
              const isCurrent = currentTier === plan.tier
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
              
              return (
                <div key={plan.tier} className="relative">
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-yellow-500 text-black font-bold">
                      {plan.badge}
                    </Badge>
                  )}
                  
                  <div className={`
                    relative overflow-hidden rounded-lg border p-6 transition-all
                    ${plan.tier === 'professional' ? 'border-yellow-500 bg-gray-900' : 'border-gray-700 bg-gray-900/50'}
                  `}>
                      
                      {/* Plan Header */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name.toUpperCase()}</h3>
                        {'tagline' in plan && plan.tagline && (
                          <p className="text-sm text-gray-400">{plan.tagline}</p>
                        )}
                      </div>
                      
                      {isCurrent && (
                        <Badge className="absolute top-4 right-4 bg-blue-500/10 text-blue-600">
                          Current
                        </Badge>
                      )}
                      
                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-yellow-500">${price}</span>
                          <span className="text-gray-400">/month</span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Start Button */}
                      <Button
                        onClick={() => setSelectedTier(plan.tier)}
                        className={`w-full ${
                          plan.tier === 'professional' 
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-bold' 
                            : 'bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
                        }`}
                      >
                        Start {plan.name} →
                      </Button>
                      
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Remove detailed plan section for cleaner look like screenshot */}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            
            {selectedTier !== 'free' && getPaymentButtonId() ? (
              <div className="flex-1">
                <RazorpayButton
                  playbookId={`subscription_${selectedTier}_${billingCycle}`}
                  onSuccess={handlePaymentSuccess}
                  paymentButtonId={getPaymentButtonId()!}
                />
              </div>
            ) : selectedTier === 'free' && currentTier !== 'free' ? (
              <Button
                onClick={() => {
                  onSuccess?.(selectedTier, billingCycle)
                  onClose()
                }}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                Downgrade to Free
              </Button>
            ) : (
              <Button
                disabled
                className="flex-1"
              >
                {currentTier === selectedTier ? 'Current Plan' : 'Select a Plan'}
              </Button>
            )}
          </div>
          
          {isDowngrade && (
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-600">
                <strong>Note:</strong> Downgrading will take effect at the end of your current billing period. 
                You'll continue to have access to {currentTier} features until then.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}