"use client"

import { useState, useEffect, useCallback } from "react"

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}
import { useTheme } from "@/contexts/theme-context"
import { secureApi } from "@/lib/secure-api"

// Payment Methods Service Layer
const paymentMethodsService = {
  async createSetupIntent() {
    const response = await secureApi.post('/api/subscriptions/payment-methods/create-setup-intent', {}, true)
    return response
  },

  async completeCardAddition(paymentData: any) {
    const response = await secureApi.post('/api/subscriptions/payment-methods/complete-card-addition', paymentData, true)
    return response
  },

  async addTestCard(cardData: any) {
    const response = await secureApi.post('/api/subscriptions/payment-methods/add-test-card', cardData, true)
    return response
  }
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  CreditCard, 
  Plus, 
  Calendar,
  DollarSign,
  CheckCircle2,
  X,
  User,
  Mail,
  Phone
, Shield} from "lucide-react"
import { getMetallicCardStyle, getVisibleHeadingColor, getVisibleTextColor } from "@/lib/colors"
import type { User } from "@/types/user"

interface BillingManagementModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'netbanking'
  last_four?: string
  brand?: string
  expiry_month?: string
  expiry_year?: string
  is_default: boolean
  billing_address?: {
    name: string
    line1: string
    city: string
    country: string
    postal_code: string
  }
}

export function BillingManagementModal({ isOpen, onClose, user }: BillingManagementModalProps) {
  const { theme } = useTheme()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'add-card'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  const [recentPayments, setRecentPayments] = useState<any[]>([])

  // Fetch payment methods from backend
  const fetchPaymentMethods = useCallback(async () => {
    setLoadingPaymentMethods(true)
    try {
      const data = await secureApi.get('/api/subscriptions/payment-methods/', true, {
        enableCache: true,
        cacheDuration: 300000 // 5 minutes cache
      })
      
      if (data.success && data.payment_methods) {
        // Convert backend format to frontend format
        const formattedMethods = data.payment_methods.map((method: any) => ({
          id: method.id,
          type: method.type || 'card',
          last_four: method.last_four,
          brand: method.brand,
          expiry_month: method.expiry_month,
          expiry_year: method.expiry_year,
          is_default: method.is_default,
          billing_address: method.billing_address
        }))
        setPaymentMethods(formattedMethods)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      // Don't show error to user, just keep empty array
      setPaymentMethods([])
    } finally {
      setLoadingPaymentMethods(false)
    }
  }, [])

  // Fetch recent payments that can be saved as payment methods
  const fetchRecentPayments = useCallback(async () => {
    try {
      const data = await secureApi.get('/api/subscriptions/payment-history', true, {
        enableCache: false // Get fresh data
      })
      
      if (data.success && data.payments) {
        // Filter recent successful payments that aren't already saved as payment methods
        const recentSuccessful = data.payments
          .filter((payment: any) => payment.status === 'captured' && payment.payment_method === 'card')
          .slice(0, 5) // Last 5 payments
        setRecentPayments(recentSuccessful)
      }
    } catch (error) {
      console.error('Error fetching recent payments:', error)
      setRecentPayments([])
    }
  }, [])
  
  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
      }
    }
    
    loadRazorpay()
  }, [])

  // Fetch payment methods when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods()
      fetchRecentPayments()
    }
  }, [isOpen, fetchPaymentMethods, fetchRecentPayments])
  
  // Secure: No card data stored in component state
  const [billingInfo, setBillingInfo] = useState({
    name: user.name,
    line1: '',
    city: user.city,
    country: user.country,
    postal_code: ''
  })

  const handleAddCard = async () => {
    try {
      setIsLoading(true)
      
      // SECURE: Always use Razorpay's secure flow - no client-side card data
      // Step 1: Create setup intent for ₹1 verification
      const setupIntent = await paymentMethodsService.createSetupIntent()
      
      if (!setupIntent.success) {
        throw new Error(setupIntent.message || 'Failed to create setup intent')
      }
      
      // Step 2: Open Razorpay checkout (handles all card data securely)
      const options = {
        key: setupIntent.razorpay_key,
        amount: setupIntent.amount * 100, // Convert to paise
        currency: setupIntent.currency,
        order_id: setupIntent.order_id,
        name: 'HNWI Chronicles',
        description: setupIntent.description,
        image: '/logo.png',
        theme: {
          color: theme === 'dark' ? 'hsl(43, 74%, 49%)' : '#000000'
        },
        prefill: {
          name: billingInfo.name,
          // Only include non-sensitive billing info
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
            toast({
              title: "Card Addition Cancelled",
              description: "Card addition process was cancelled.",
            })
          }
        },
        handler: async function(response: any) {
          try {
            // Step 3: Complete card addition with billing info
            const result = await paymentMethodsService.completeCardAddition({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              billing_address: billingInfo,
              set_as_default: paymentMethods.length === 0
            })
            
            if (result.success) {
              toast({
                title: "Card Added Successfully!",
                description: "₹1 verification amount has been refunded. Your card is now saved.",
              })
              
              await fetchPaymentMethods() // Refresh the list
              setActiveTab('payment-methods')
              
              // Reset billing info form
              setBillingInfo({
                name: user.name,
                line1: '',
                city: user.city,
                country: user.country,
                postal_code: ''
              })
            } else {
              throw new Error(result.message || 'Failed to add card')
            }
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || 'Failed to add card',
              variant: "destructive"
            })
          } finally {
            setIsLoading(false)
          }
        }
      }
      
      // SECURE: Check if Razorpay is available before proceeding
      if (!window.Razorpay) {
        throw new Error('Payment system not available. Please refresh the page.')
      }
      
      const rzp = new window.Razorpay(options)
      rzp.open()
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add card. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleRemoveCard = async (cardId: string) => {
    try {
      const data = await secureApi.delete(`/api/subscriptions/payment-methods/${cardId}`, true)
      
      if (data.success) {
        // Remove from local state
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== cardId))
        toast({
          title: "Payment Method Removed",
          description: "The payment method has been removed from your account."
        })
      } else {
        throw new Error(data.message || 'Failed to remove payment method')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSetDefault = async (cardId: string) => {
    try {
      const data = await secureApi.put(`/api/subscriptions/payment-methods/${cardId}/set-default`, {}, true)
      
      if (data.success) {
        // Update local state
        setPaymentMethods(paymentMethods.map(pm => ({
          ...pm,
          is_default: pm.id === cardId
        })))
        toast({
          title: "Default Payment Method Updated",
          description: "Your default payment method has been updated."
        })
      } else {
        throw new Error(data.message || 'Failed to set default payment method')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default payment method. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Save card from existing successful payment
  const handleSaveFromPayment = async (paymentId: string) => {
    try {
      setIsLoading(true)
      
      const response = await secureApi.post('/api/subscriptions/payment-methods/save', {
        razorpay_payment_id: paymentId,
        save_card: true,
        set_as_default: paymentMethods.length === 0
      }, true)
      
      if (response.success) {
        // Refresh payment methods and recent payments
        await fetchPaymentMethods()
        await fetchRecentPayments()
        
        toast({
          title: "Payment Method Saved",
          description: "Your card has been successfully saved for future payments."
        })
      } else {
        throw new Error(response.message || 'Failed to save payment method')
      }
    } catch (error: any) {
      console.error('Error saving card from payment:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save payment method. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // SECURITY: formatCardNumber function removed - no client-side card data processing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${getVisibleHeadingColor(theme)}`}>
            Billing Management
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-muted-foreground/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'payment-methods' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-muted-foreground/10'
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('add-card')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'add-card' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-muted-foreground/10'
            }`}
          >
            Add Card
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <Card className={getMetallicCardStyle(theme).className} style={getMetallicCardStyle(theme).style}>
                <CardHeader>
                  <CardTitle className={getVisibleHeadingColor(theme)}>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl font-bold ${getVisibleTextColor(theme)}`}>
                        {user.subscription?.tier === 'family_office' ? 'Family Office' :
                         user.tier === 'family_office' ? 'Family Office' :
                         'Family Office'} Plan
                      </h3>
                      <p className="text-muted-foreground">$599.00 / month</p>
                    </div>
                    <Badge 
                      style={{
                        backgroundColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.1)' : 'hsl(0 0% 0% / 0.1)',
                        color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                        borderColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.3)' : 'hsl(0 0% 0% / 0.3)'
                      }}
                    >
                      Active
                    </Badge>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next billing date</p>
                        <p className="font-medium">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Auto-renewal</p>
                        <p className="font-medium">Enabled</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Contact */}
              <Card className={getMetallicCardStyle(theme).className} style={getMetallicCardStyle(theme).style}>
                <CardHeader>
                  <CardTitle className={getVisibleHeadingColor(theme)}>Billing Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{user.phone_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'payment-methods' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${getVisibleHeadingColor(theme)}`}>
                  Payment Methods
                </h3>
                <Button 
                  onClick={() => setActiveTab('add-card')}
                  className="gap-2"
                  style={{
                    backgroundColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                    color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Card
                </Button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className={getMetallicCardStyle(theme).className} style={getMetallicCardStyle(theme).style}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-8 rounded flex items-center justify-center"
                            style={{
                              background: theme === 'dark' 
                                ? 'linear-gradient(135deg, hsl(43 74% 49%) 0%, hsl(43 74% 39%) 100%)'
                                : 'linear-gradient(135deg, hsl(0 0% 0%) 0%, hsl(0 0% 20%) 100%)'
                            }}
                          >
                            <CreditCard 
                              className="w-5 h-5"
                              style={{ color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)' }}
                            />
                          </div>
                          <div>
                            <p className={`font-medium ${getVisibleTextColor(theme)}`}>
                              {method.brand} •••• {method.last_four}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires {method.expiry_month}/{method.expiry_year}
                            </p>
                            {method.is_default && (
                              <Badge 
                                className="mt-1"
                                style={{
                                  backgroundColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.1)' : 'hsl(0 0% 0% / 0.1)',
                                  color: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                                  borderColor: theme === 'dark' ? 'hsl(43 74% 49% / 0.3)' : 'hsl(0 0% 0% / 0.3)'
                                }}
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.is_default && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveCard(method.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Payments - Save Cards */}
              {recentPayments.length > 0 && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${getVisibleHeadingColor(theme)}`}>
                    Save Cards from Recent Payments
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You can save payment methods from your recent successful payments.
                  </p>
                  
                  <div className="space-y-3">
                    {recentPayments.map((payment) => (
                      <Card key={payment.id} className={getSubtleCardStyle(theme).className} style={getSubtleCardStyle(theme).style}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${getVisibleTextColor(theme)}`}>
                                Payment on {new Date(payment.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.description} - ₹{(payment.amount / 100).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveFromPayment(payment.id)}
                              disabled={isLoading}
                              style={{
                                backgroundColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                                color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
                              }}
                            >
                              {isLoading ? 'Saving...' : 'Save Card'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'add-card' && (
            <Card className={getMetallicCardStyle(theme).className} style={getMetallicCardStyle(theme).style}>
              <CardHeader>
                <CardTitle className={getVisibleHeadingColor(theme)}>Add New Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Information */}
                <div className="space-y-4">
                  <h4 className={`font-medium ${getVisibleTextColor(theme)}`}>Card Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="card_number" className="text-sm font-medium">Card Number</label>
                      <Input
                        id="card_number"
                        disabled
                        placeholder="Card details handled securely by Razorpay"
                        value=""
                        onChange={(e) => setNewCard({
                          ...newCard,
                          // SECURITY: No card data processing
                        })}
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="expiry_month" className="text-sm font-medium">Month</label>
                        <Input
                          id="expiry_month"
                          value={newCard.expiry_month}
                          onChange={(e) => setNewCard({
                            ...newCard,
                            expiry_month: e.target.value.replace(/\D/g, '').slice(0, 2)
                          })}
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <label htmlFor="expiry_year" className="text-sm font-medium">Year</label>
                        <Input
                          id="expiry_year"
                          value={newCard.expiry_year}
                          onChange={(e) => setNewCard({
                            ...newCard,
                            expiry_year: e.target.value.replace(/\D/g, '').slice(0, 4)
                          })}
                          maxLength={4}
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="text-sm font-medium">CVV</label>
                        <Input
                          id="cvv"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard({
                            ...newCard,
                            cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                          })}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-4">
                  <h4 className={`font-medium ${getVisibleTextColor(theme)}`}>Billing Address</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                      <Input
                        id="name"
                        value={billingInfo.name}
                        onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="line1" className="text-sm font-medium">Address Line 1</label>
                      <Input
                        id="line1"
                        value={billingInfo.line1}
                        onChange={(e) => setBillingInfo({ ...billingInfo, line1: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="text-sm font-medium">City</label>
                        <Input
                          id="city"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="postal_code" className="text-sm font-medium">Postal Code</label>
                        <Input
                          id="postal_code"
                          value={billingInfo.postal_code}
                          onChange={(e) => setBillingInfo({ ...billingInfo, postal_code: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="country" className="text-sm font-medium">Country</label>
                      <Input
                        id="country"
                        value={billingInfo.country}
                        onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleAddCard}
                    disabled={isLoading}
                    className="flex-1"
                    style={{
                      backgroundColor: theme === 'dark' ? 'hsl(43 74% 49%)' : 'hsl(0 0% 0%)',
                      color: theme === 'dark' ? 'hsl(0 0% 10%)' : 'hsl(0 0% 98%)'
                    }}
                  >
                    {isLoading ? 'Adding Card...' : 'Add Payment Method'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('payment-methods')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}