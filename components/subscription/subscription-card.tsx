"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import type { Subscription } from "@/types/user"
import { 
  Crown, 
  Zap, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  X
} from "lucide-react"
import { getVisibleHeadingColor, getVisibleTextColor, getMatteCardStyle, getMetallicCardStyle } from "@/lib/colors"

interface SubscriptionCardProps {
  subscription?: Subscription
  onUpgrade?: () => void
  onManage?: () => void
  onCancel?: () => void
}

const PLAN_FEATURES = {
  observer: [
    "\"Watch HNWI's\" - Market Intelligence Dashboard",
    "HNWI World tracking 140,000+ wealth movements",
    "Daily intelligence briefs (6 AM UTC)",
    "30-day archive access",
    "Elite Pulse market intelligence",
    "Pattern recognition insights"
  ],
  operator: [
    "\"Think Like HNWI\" - Strategic Intelligence",
    "Everything in Observer",
    "Privé Exchange - off-market opportunities",
    "Crown Vault - succession planning (10 assets)",
    "Ask Rohith - 24/7 AI intelligence ally",
    "90-day archive access",
    "Monthly strategy call",
    "WhatsApp updates for urgent intelligence"
  ],
  architect: [
    "\"Build HNWI Chronicles\" - Complete Intelligence Ecosystem",
    "Everything in Operator",
    "Unlimited Crown Vault storage",
    "Social Hub - elite networking events",
    "Direct WhatsApp access to analysts",
    "Custom portfolio impact analysis",
    "Full historical archive (1,562 briefs)",
    "Priority intelligence alerts",
    "Quarterly wealth defense review"
  ]
}

const PLAN_PRICING = {
  observer: { monthly: 199, yearly: 1990 },
  operator: { monthly: 599, yearly: 5990 },
  architect: { monthly: 1499, yearly: 14990 }
}

export function SubscriptionCard({ 
  subscription, 
  onUpgrade, 
  onManage,
  onCancel 
}: SubscriptionCardProps) {
  const { theme } = useTheme()
  
  const currentTier = subscription?.tier || 'observer'

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'architect':
        return 'Architect'
      case 'operator':
        return 'Operator'
      case 'observer':
        return 'Observer'
      default:
        return 'Observer'
    }
  }
  const status = subscription?.status || 'active'
  const billing_cycle = subscription?.billing_cycle || 'monthly'

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'architect':
        return <Crown className="w-5 h-5" />
      case 'operator':
        return <Zap className="w-5 h-5" />
      case 'observer':
        return <Shield className="w-5 h-5" />
      default:
        return <Shield className="w-5 h-5" />
    }
  }
  
  const getTierMetallicStyle = () => {
    const metallicStyle = getMetallicCardStyle(theme)
    return {
      className: metallicStyle.className + " border-2",
      style: {
        ...metallicStyle.style,
        borderColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
        color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'
      }
    }
  }
  
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
      case 'trial':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Trial</Badge>
      case 'expired':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Expired</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Cancelled</Badge>
      default:
        return null
    }
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className={`${getMatteCardStyle(theme).className}`} style={getMatteCardStyle(theme).style}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`text-2xl font-bold ${getVisibleHeadingColor(theme)}`}>
            Your Subscription
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div 
          className={`p-6 rounded-xl ${getTierMetallicStyle().className}`}
          style={getTierMetallicStyle().style}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTierIcon(currentTier)}
              <div>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)' }}
                >
                  {getTierDisplayName(currentTier)} Plan
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    color: theme === 'dark' ? 'hsl(43 74% 49% / 0.8)' : 'hsl(0 0% 0% / 0.7)',
                    opacity: 0.9 
                  }}
                >
                  ${PLAN_PRICING[currentTier as keyof typeof PLAN_PRICING][billing_cycle]} / {billing_cycle === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
            </div>
            {subscription?.auto_renew && (
              <Badge 
                className="border"
                style={{
                  backgroundColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.1)' : 'hsl(0 0% 0% / 0.1)',
                  color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                  borderColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.3)' : 'hsl(0 0% 0% / 0.3)'
                }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Auto-renew
              </Badge>
            )}
          </div>
          
          {/* Billing Details */}
          <div 
            className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-lg border"
            style={{
              backgroundColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.05)' : 'hsl(0 0% 0% / 0.05)',
              borderColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.2)' : 'hsl(0 0% 0% / 0.2)'
            }}
          >
            <div>
              <p 
                className="text-xs"
                style={{ color: theme === 'dark' ? 'hsl(43 74% 49% / 0.7)' : 'hsl(0 0% 0% / 0.6)' }}
              >
                Next Billing Date
              </p>
              <p 
                className="text-sm font-semibold"
                style={{ color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)' }}
              >
                {formatDate(subscription?.next_billing_date)}
              </p>
            </div>
            <div>
              <p 
                className="text-xs"
                style={{ color: theme === 'dark' ? 'hsl(43 74% 49% / 0.7)' : 'hsl(0 0% 0% / 0.6)' }}
              >
                Payment Method
              </p>
              <div 
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)' }}
              >
                <CreditCard className="w-3 h-3" />
                {subscription?.payment_method ? 
                  `•••• ${subscription.payment_method.last_four}` : 
                  'Not set'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Plan Features */}
        <div>
          <h4 className={`text-lg font-semibold mb-3 ${getVisibleTextColor(theme)}`}>
            Plan Features
          </h4>
          <ul className="space-y-2">
            {PLAN_FEATURES[currentTier as keyof typeof PLAN_FEATURES].map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Important Dates */}
        {(subscription?.end_date || subscription?.trial_end_date) && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {subscription.trial_end_date ? 
                  `Trial ends: ${formatDate(subscription.trial_end_date)}` :
                  `Subscription ends: ${formatDate(subscription.end_date)}`
                }
              </span>
            </div>
            {status === 'expired' && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Your subscription has expired. Renew to continue accessing premium features.</span>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div 
          className="flex gap-3 pt-4 border-t"
          style={{ borderColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.2)' : 'hsl(0 0% 0% / 0.2)' }}
        >
          {currentTier !== 'architect' && (
            <Button
              onClick={onUpgrade}
              className="flex-1 hover:opacity-90"
              style={{
                backgroundColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
              }}
            >
              Upgrade Plan
            </Button>
          )}
          <Button
            onClick={onManage}
            variant="outline"
            className="flex-1 hover:text-white dark:hover:text-black transition-colors"
            style={{
              borderColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
              color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'
              e.currentTarget.style.color = theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)'
            }}
          >
            Manage Billing
          </Button>
          {status === 'active' && (
            <Button 
              onClick={onCancel}
              variant="outline"
              className="border-red-500/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}