// components/profile-page.tsx

"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { User } from "@/types/user"
import { 
  UserIcon, 
  LogOut, 
  Edit2, 
  Save, 
  Key, 
  Loader2, 
  Building2, 
  MapPin, 
  Globe2, 
  Phone, 
  Mail, 
  Linkedin, 
  TrendingUp,
  Briefcase,
  DollarSign,
  Bitcoin,
  Trees,
  X,
  Crown,
  Shield,
  Users,
  Vault,
  ArrowRight,
  Plus,
  CreditCard
} from "lucide-react"
import { OnboardingWizard } from "./onboarding-wizard"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { ChangePasswordPopup } from "./change-password-popup"
import { MetaTags } from "./meta-tags"
import { CrownLoader } from "@/components/ui/crown-loader"
import { motion } from "framer-motion"
import { getCrownVaultStats, getCrownVaultAssets, type CrownVaultStats, type CrownVaultAsset } from "@/lib/api"
import { PortfolioCategoryGrid } from "@/components/ui/portfolio-category-grid"
import { processAssetCategories } from "@/lib/category-utils"
import { secureApi } from "@/lib/secure-api"
import { getVisibleIconColor, getVisibleHeadingColor, getVisibleTextColor, getVisibleSubtextColor, getMatteCardStyle, getMetallicCardStyle, getSubtleCardStyle } from "@/lib/colors"
import { getCurrentUser, getCurrentUserId, updateUser as updateAuthUser } from "@/lib/auth-manager"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { BillingHistory } from "@/components/subscription/billing-history"
import { PlanUpgradeModal } from "@/components/subscription/plan-upgrade-modal"
import { BillingManagementModal } from "@/components/billing/billing-management-modal"
import type { SubscriptionTier } from "@/types/user"

const formatLinkedInUrl = (url: string): string => {
  if (!url) return ""
  url = url.trim()
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}


interface ProfilePageProps {
  user: User | null | undefined
  onUpdateUser: (updatedUser: User) => void
  onLogout?: () => void
}

export function ProfilePage({ user, onUpdateUser, onLogout }: ProfilePageProps) {
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const { showOnboardingWizard, setShowOnboardingWizard } = useOnboarding()
  
  // Guard clause: Return loading state if user is not defined
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CrownLoader size="lg" text="Loading profile..." />
      </div>
    )
  }
  
  // Ensure user data includes necessary properties, especially company info
  const initialCompanyName = user.company || 
                            user.company_info?.name || 
                            user.profile?.company_info?.name || 
                            "";
  
  const enhancedUser = {
    ...user,
    company: initialCompanyName,
    company_info: {
      ...(user.company_info || user.profile?.company_info || {}),
      name: initialCompanyName
    }
  }
  const [editedUser, setEditedUser] = useState(enhancedUser)
  const { toast } = useToast()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isRefreshingRef = useRef(false)
  const lastFetchTimeRef = useRef(0)
  const [activeTab, setActiveTab] = useState("crown-vault")
  const [vaultStats, setVaultStats] = useState<CrownVaultStats | null>(null)
  const [vaultAssets, setVaultAssets] = useState<CrownVaultAsset[]>([])
  const [vaultLoading, setVaultLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showBillingModal, setShowBillingModal] = useState(false)
  
  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'family_office':
        return 'Family Office'
      case 'professional':
        return 'Professional'
      case 'essential':
        return 'Essential'
      default:
        return 'Free'
    }
  }
  const [billingHistory, setBillingHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Enhanced billing history fetch with better error handling
  const fetchBillingHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const response = await secureApi.get('/api/subscriptions/payment-history', true, { 
        enableCache: true, 
        cacheDuration: 300000 // 5 minutes cache
      })
      
      if (response && response.success) {
        // Convert backend format to frontend format
        const formattedTransactions = (response.payments || []).map((payment: any) => ({
          id: payment.transaction_id || payment.id,
          amount: payment.amount, // Keep in original format (INR)
          currency: payment.currency || 'INR',
          description: payment.description || 'Subscription Payment',
          date: payment.date,
          status: payment.status === 'captured' ? 'success' : payment.status,
          invoice_url: payment.invoice_url,
          invoice_number: payment.invoice_number,
          can_download_invoice: payment.can_download_invoice
        }))
        setBillingHistory(formattedTransactions)
      } else {
        // Fallback to empty array if no data
        setBillingHistory([])
      }
    } catch (error) {
      // Don't show error toast, just use empty array
      setBillingHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  // Enhanced download invoice functionality with generation fallback
  const handleDownloadInvoice = useCallback(async (transactionId: string) => {
    try {
      // Find the payment in billing history
      const payment = billingHistory.find((p: any) => p.id === transactionId)
      
      if (payment && payment.invoice_url && payment.can_download_invoice) {
        // Direct download available
        const link = document.createElement('a')
        link.href = payment.invoice_url
        link.download = `invoice-${payment.invoice_number || payment.id}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Download Started",
          description: "Invoice download has started successfully.",
        })
      } else {
        // Try to generate invoice for this transaction
        try {
          toast({
            title: "Generating Invoice",
            description: "Generating invoice, please wait...",
          })

          const response = await secureApi.post('/api/subscriptions/generate-invoice', {
            transaction_id: transactionId
          }, true)
          
          if (response && response.success) {
            toast({
              title: "Invoice Generated!",
              description: "Invoice has been generated. Please refresh to download.",
            })
            
            // Refresh billing history to get updated invoice links
            await fetchBillingHistory()
          } else {
            toast({
              title: "Invoice Not Available",
              description: "Invoice is not available for this transaction.",
              variant: "destructive"
            })
          }
        } catch (generateError) {
          toast({
            title: "Invoice Not Available", 
            description: "Unable to generate invoice for this transaction.",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive"
      })
    }
  }, [billingHistory, toast, fetchBillingHistory])

  const fetchVaultStats = useCallback(async (userIdParam?: string) => {
    try {
      setVaultLoading(true)
      // Get the user ID from parameter or state
      const authUser = getCurrentUser()
      const userIdToUse = userIdParam || userId || authUser?.userId || authUser?.user_id || authUser?.id || getCurrentUserId()
      
      if (!userIdToUse) {
        return
      }
      
      // Fetch both stats and assets like Crown Vault page does, passing the userId
      const [stats, assets] = await Promise.all([
        getCrownVaultStats(userIdToUse),
        getCrownVaultAssets(userIdToUse)
      ])
      setVaultStats(stats)
      setVaultAssets(assets)
    } catch (error) {
      // Don't set fallback data - leave states as null/empty to indicate failure
    } finally {
      setVaultLoading(false)
    }
  }, [userId])

  // Data processing functions like Crown Vault page
  const getTotalValue = () => {
    return vaultStats?.total_value || vaultAssets.reduce((total, asset) => {
      return total + (asset?.asset_data?.value || 0);
    }, 0);
  };

  const getAssetsByCategory = () => {
    return processAssetCategories(vaultAssets);
  };

  const fetchUserData = useCallback(
    async (userId: string) => {
      if (isRefreshingRef.current) {
        return;
      }

      const now = Date.now()
      if (now - lastFetchTimeRef.current < 60000) {
        return; // Prevent fetching more than once per minute
      }

      // Fetching user data
      isRefreshingRef.current = true
      try {
        const userData = await secureApi.get(`/api/users/${userId}`, true, { enableCache: true, cacheDuration: 600000 }); // 10 minutes for user data
        // User data fetched successfully
        
        // Enhance user data with company info handling
        // Priority: company field > company_info.name > profile.company_info.name
        const companyName = userData.company || 
                          userData.company_info?.name || 
                          userData.profile?.company_info?.name || 
                          "";
        
        const enhancedUserData = {
          ...userData,
          company: companyName,
          company_info: {
            ...(userData.company_info || userData.profile?.company_info || {}),
            name: companyName
          }
        };
        
        setEditedUser(enhancedUserData);
        onUpdateUser(enhancedUserData);
        lastFetchTimeRef.current = now;
        // User data fetch complete and state updated;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        isRefreshingRef.current = false
        setIsLoading(false)
      }
    },
    [onUpdateUser, toast],
  )

  useEffect(() => {
    // First check if user data already has the correct ID
    if (user && (user.user_id || user._id)) {
      const userApiId = user.user_id || user._id || user.id
      // Store the user ID from the API using centralized auth
      updateAuthUser({ ...user, userId: userApiId, user_id: userApiId, id: userApiId })
      setUserId(userApiId)
      fetchUserData(userApiId)
      fetchVaultStats(userApiId) // Fetch Crown Vault stats with userId
      fetchBillingHistory() // Fetch billing history
    } else {
      // Fallback to stored ID if available
      const storedUserId = getCurrentUserId()
      if (storedUserId) {
        setUserId(storedUserId)
        fetchUserData(storedUserId)
        fetchVaultStats(storedUserId) // Fetch Crown Vault stats with userId
        fetchBillingHistory() // Fetch billing history
      } else {
        setIsLoading(false)
      }
    }
  }, [fetchUserData, fetchVaultStats, fetchBillingHistory, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value })
  }


  const handleCheckboxChange = (name: string, checked: boolean) => {
    setEditedUser({ ...editedUser, [name]: checked })
  }

  const handleIndustriesChange = (value: string) => {
    setEditedUser({ ...editedUser, industries: value ? value.split(", ") : [] })
  }

  const handleSave = async () => {
    try {
      if (!userId) {
        throw new Error("User ID is not available")
      }

      const formattedLinkedIn = formatLinkedInUrl(editedUser.linkedin)

      // Complete user object for client-side update
      const updatedUserData = {
        ...editedUser,
        name: String(editedUser.name),
        city: String(editedUser.city),
        country: String(editedUser.country),
        industries: editedUser.industries.map(String),
        company: String(editedUser.company),
        phone_number: String(editedUser.phone_number),
        linkedin: formattedLinkedIn,
        office_address: String(editedUser.office_address),
        crypto_investor: Boolean(editedUser.crypto_investor),
        land_investor: Boolean(editedUser.land_investor),
        bio: String(editedUser.bio),
      }
      
      // Simplified payload for API call (like your Postman request)
      const apiPayload = {
        name: String(editedUser.name),
        city: String(editedUser.city),
        country: String(editedUser.country),
        industries: editedUser.industries.map(String),
        phone_number: String(editedUser.phone_number),
        linkedin: formattedLinkedIn,
        office_address: String(editedUser.office_address),
        crypto_investor: Boolean(editedUser.crypto_investor),
        land_investor: Boolean(editedUser.land_investor),
        bio: String(editedUser.bio),
        company: String(editedUser.company || editedUser.company_info?.name || ""), // Add top-level company field
        company_info: {
          name: String(editedUser.company || editedUser.company_info?.name || ""),
          about: editedUser.company_info?.about || ""
        }
      }


      // First try to update via the default handler - if it fails, fall back to direct API
      // First update the UI with the local handler to give immediate feedback
      try {
        await onUpdateUser({ ...user, ...updatedUserData });
      } catch (handlerError) {
      }
      
      // ALWAYS proceed with direct API call regardless of local update success
      // This ensures MongoDB is updated even if the local update succeeded

      // Direct API call as a fallback - using simplified payload like Postman
      
      const responseData = await secureApi.put(`/api/users/${userId}`, apiPayload);
      
      // Create merged user object
      const mergedUser = { 
        ...user, 
        ...updatedUserData,
        ...responseData,
        // Ensure these are carried over
        id: user.id || userId,
        user_id: user.user_id || userId,
        profile: {
          ...(user.profile || {}),
          ...responseData,
          city: updatedUserData.city,
          country: updatedUserData.country,
          bio: updatedUserData.bio,
          industries: updatedUserData.industries,
          phone_number: updatedUserData.phone_number,
          linkedin: formattedLinkedIn,
          office_address: updatedUserData.office_address,
          crypto_investor: updatedUserData.crypto_investor,
          land_investor: updatedUserData.land_investor,
          company_info: {
            ...(user.profile?.company_info || {}),
            name: String(editedUser.company || ""),
            about: editedUser.company_info?.about || ""
          }
        }
      };
      
      
      // Update centralized auth with the latest user object
      updateAuthUser(mergedUser);
      
      // Call the update handler with updated user
      onUpdateUser(mergedUser);
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })

      // Fetch the latest data after saving - adding delay to avoid race condition
      setTimeout(() => {
        fetchUserData(userId);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleOnboardingWizard = () => {
    setShowOnboardingWizard(!showOnboardingWizard)
  }

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return `${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CrownLoader size="lg" text="Loading your profile..." />
      </div>
    )
  }

  return (
    <>
      <MetaTags
        title="Profile | HNWI Chronicles"
        description="Manage your HNWI Chronicles profile. Customize your wealth intelligence experience and preferences."
        image="https://hnwichronicles.com/profile-og-image.jpg"
        url="https://hnwichronicles.com/profile"
      />
      <div className="bg-background">
        {/* User Profile Header - Now main content */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-background" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-2xl" />
          
          <div className="relative container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-8"
            >
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                    {getInitials(editedUser.name || "User")}
                  </AvatarFallback>
                </Avatar>
                {getTotalValue() > 10000000 && (
                  <Badge className={`absolute -bottom-2 -right-2 text-white border-0 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                    Ultra HNWI
                  </Badge>
                )}
              </div>

              {/* User Info Section */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {editedUser.name || "Welcome"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                  {(editedUser.company || editedUser.company_info?.name || editedUser.profile?.company_info?.name) && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{editedUser.company || editedUser.company_info?.name || editedUser.profile?.company_info?.name}</span>
                    </div>
                  )}
                  {editedUser.city && editedUser.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{editedUser.city}, {editedUser.country}</span>
                    </div>
                  )}
                  {getTotalValue() > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {formatCurrency(getTotalValue())}
                      </span>
                      <Badge className="ml-1 bg-green-500/10 text-green-600 text-xs">
                        Secured
                      </Badge>
                    </div>
                  )}
                </div>
                {editedUser.bio && (
                  <p className="text-muted-foreground max-w-2xl">{editedUser.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className={`${theme === 'dark' ? 'bg-primary text-white' : 'bg-primary text-white'} hover:opacity-90`}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="border-border hover:bg-destructive hover:text-white hover:border-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className={`${theme === 'dark' ? 'bg-primary text-white' : 'bg-primary text-white'} hover:opacity-90`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-border"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-4">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-card/50 backdrop-blur">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Edit Profile Information</h2>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <Input
                          name="name"
                          value={editedUser.name}
                          onChange={handleInputChange}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">City</label>
                        <Input
                          name="city"
                          value={editedUser.city}
                          onChange={handleInputChange}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <Input
                          name="country"
                          value={editedUser.country}
                          onChange={handleInputChange}
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <Textarea
                        name="bio"
                        value={editedUser.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-background border-border"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Company</label>
                        <Input
                          name="company"
                          value={editedUser.company_info?.name || editedUser.company || ""}
                          onChange={(e) => {
                            const companyName = e.target.value;
                            setEditedUser({
                              ...editedUser,
                              company: companyName,
                              company_info: {
                                ...editedUser.company_info,
                                name: companyName
                              }
                            });
                          }}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Industries</label>
                        <Input
                          name="industries"
                          value={editedUser.industries.join(", ")}
                          onChange={(e) => handleIndustriesChange(e.target.value)}
                          placeholder="Technology, Finance, Real Estate"
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Office Address</label>
                        <Input
                          name="office_address"
                          value={editedUser.office_address}
                          onChange={handleInputChange}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <Input
                          name="phone_number"
                          value={editedUser.phone_number}
                          onChange={handleInputChange}
                          className="bg-background border-border"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">LinkedIn URL</label>
                        <Input
                          name="linkedin"
                          value={editedUser.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Investment Preferences */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Investment Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="crypto_investor"
                          checked={editedUser.crypto_investor}
                          onCheckedChange={(checked) => handleCheckboxChange("crypto_investor", checked as boolean)}
                        />
                        <label htmlFor="crypto_investor" className="flex items-center gap-2 cursor-pointer">
                          <Bitcoin className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">Cryptocurrency Investor</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="land_investor"
                          checked={editedUser.land_investor}
                          onCheckedChange={(checked) => handleCheckboxChange("land_investor", checked as boolean)}
                        />
                        <label htmlFor="land_investor" className="flex items-center gap-2 cursor-pointer">
                          <Trees className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">Real Estate / Land Investor</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-4xl mx-auto">
                {/* Tab Navigation - Crown Vault Style */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex bg-muted/50 p-1.5 rounded-full shadow-sm border border-border/50">
                    <button
                      onClick={() => setActiveTab('crown-vault')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'crown-vault'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Crown Vault
                    </button>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'overview'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('professional')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'professional'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => setActiveTab('preferences')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'preferences'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Preferences
                    </button>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'subscription'
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Subscription
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === 'crown-vault' && (
                    <div className="space-y-6">
                  {vaultLoading ? (
                    <div className="flex justify-center py-12">
                      <CrownLoader size="md" text="Loading vault data..." />
                    </div>
                  ) : vaultStats && vaultStats.total_assets > 0 ? (
                    <div className="space-y-8">
                      {/* Main Vault Overview */}
                      <Card className={`${getMatteCardStyle(theme).className}`} style={getMatteCardStyle(theme).style}>
                        <CardHeader className="text-center pb-6">
                          <div className="relative inline-block mx-auto">
                            <Crown className={`relative h-16 w-16 ${getVisibleIconColor(theme)} mx-auto mb-4 drop-shadow-lg`} />
                          </div>
                          <h2 className={`text-3xl font-bold ${getVisibleHeadingColor(theme)}`}>
                            Crown Vault Overview
                          </h2>
                          <p className="text-muted-foreground">Your secured legacy with military-grade encryption</p>
                          <Badge className="mx-auto mt-2 bg-green-500/10 text-green-600 border-green-500/20">
                            <Shield className="w-3 h-3 mr-1" />
                            256-bit AES Encrypted
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          {/* Primary Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="group relative">
                              <div className={`${getMetallicCardStyle(theme).className} p-6 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                                <div className="flex justify-center mb-3">
                                  <Vault className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <p className="text-sm text-foreground/80 font-medium mb-2">Total Assets</p>
                                <p className={`text-4xl font-bold ${getVisibleTextColor(theme, 'accent')} mb-2`}>{vaultStats.total_assets}</p>
                                <p className={`text-xs ${getVisibleSubtextColor(theme)} font-medium`}>Items secured</p>
                              </div>
                            </div>

                            <div className="group relative">
                              <div className={`${getMetallicCardStyle(theme).className} p-6 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                                <div className="flex justify-center mb-3">
                                  <DollarSign className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <p className="text-sm text-foreground/80 font-medium mb-2">Total Portfolio Value</p>
                                <p className={`text-4xl font-bold ${getVisibleTextColor(theme, 'accent')} mb-2`}>{formatCurrency(getTotalValue())}</p>
                                <p className={`text-xs ${getVisibleSubtextColor(theme)} font-medium`}>Encrypted & secured</p>
                              </div>
                            </div>

                            <div className="group relative">
                              <div className={`${getMetallicCardStyle(theme).className} p-6 hover:shadow-xl transition-all duration-300 text-center`} style={getMetallicCardStyle(theme).style}>
                                <div className="flex justify-center mb-3">
                                  <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                                </div>
                                <p className="text-sm text-foreground/80 font-medium mb-2">Designated Heirs</p>
                                <p className={`text-4xl font-bold ${getVisibleTextColor(theme, 'accent')} mb-2`}>{vaultStats.total_heirs}</p>
                                <p className={`text-xs ${getVisibleSubtextColor(theme)} font-medium`}>Legacy recipients</p>
                              </div>
                            </div>
                          </div>

                          {/* Portfolio Allocation Overview */}
                          <Card className={getMatteCardStyle(theme).className} style={getMatteCardStyle(theme).style}>
                            <CardHeader className="pb-2">
                              <h3 className={`text-xl font-bold ${getVisibleHeadingColor(theme)}`}>
                                Portfolio Allocation
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Strategic distribution across asset categories
                              </p>
                            </CardHeader>
                            <CardContent>
                              <PortfolioCategoryGrid
                                data={getAssetsByCategory()}
                                className="w-full"
                              />
                            </CardContent>
                          </Card>

                          {/* Recent Activity */}
                          {vaultStats.recent_activity && vaultStats.recent_activity.length > 0 && (
                            <Card className={getMatteCardStyle(theme).className} style={getMatteCardStyle(theme).style}>
                              <CardHeader>
                                <h3 className={`text-xl font-bold ${getVisibleHeadingColor(theme)}`}>
                                  Recent Vault Activity
                                </h3>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {vaultStats.recent_activity.slice(0, 5).map((activity, index) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-start gap-3 p-3 ${getSubtleCardStyle(theme).className}`}
                                    style={getSubtleCardStyle(theme).style}
                                  >
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{activity.details}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(activity.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-4 pt-6 border-t">
                            <Button 
                              className={`flex-1 bg-primary text-white hover:opacity-90`}
                              onClick={() => window.location.href = '/crown-vault'}
                            >
                              <Crown className="w-4 h-4 mr-2 text-white" />
                              Manage Full Vault
                              <ArrowRight className="w-4 h-4 ml-2 text-white" />
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => window.location.href = '/crown-vault'}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Assets
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className={getMatteCardStyle(theme).className} style={getMatteCardStyle(theme).style}>
                      <CardContent className="text-center py-16">
                        <div className="relative inline-block mb-6">
                          <Vault className={`relative h-20 w-20 ${getVisibleIconColor(theme)} mx-auto`} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">Your Crown Vault Awaits</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Start securing your legacy with military-grade encryption. Organize your assets and designate heirs with complete privacy and control.
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button 
                            className="bg-primary text-white hover:opacity-90"
                            onClick={() => window.location.href = '/crown-vault'}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Create Your Vault
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => window.location.href = '/crown-vault'}
                          >
                            Learn More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                    </div>
                  )}

                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Personal Information</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                          <p className="font-medium">{editedUser.name || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location</p>
                          <p className="font-medium">
                            {editedUser.city && editedUser.country ? 
                              `${editedUser.city}, ${editedUser.country}` : 
                              "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {getTotalValue() > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Secured Net Worth</p>
                            <div className="flex items-center gap-2">
                              <p className={`font-medium text-xl ${getVisibleTextColor(theme, 'accent')}`}>
                                {formatCurrency(getTotalValue())}
                              </p>
                              <Badge className="bg-green-500/10 text-green-600 text-xs">
                                Crown Vault
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Email</p>
                          <p className="font-medium">{editedUser.email || user.email || "Not specified"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Account Security</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={handleChangePassword}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                    </div>
                  )}

                  {activeTab === 'professional' && (
                    <div className="space-y-6">
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Professional Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Company</p>
                          <p className="font-medium">{editedUser.company || editedUser.company_info?.name || editedUser.profile?.company_info?.name || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Industries</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {editedUser.industries && editedUser.industries.length > 0 ? (
                              editedUser.industries.map((industry, index) => (
                                <Badge key={index} variant="secondary" className="badge-primary">
                                  {industry}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">Not specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Office Address</p>
                          <p className="font-medium">{editedUser.office_address || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                          <p className="font-medium">{editedUser.phone_number || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">LinkedIn Profile</p>
                          {editedUser.linkedin ? (
                            <a 
                              href={formatLinkedInUrl(editedUser.linkedin)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 ${getVisibleTextColor(theme, 'accent')} hover:underline`}
                            >
                              <Linkedin className="w-4 h-4" />
                              View Profile
                            </a>
                          ) : (
                            <p className="font-medium">Not specified</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </div>
                  )}

                  {activeTab === 'subscription' && (
                    <div className="space-y-6">
                      {/* Subscription Overview */}
                      <SubscriptionCard
                        subscription={editedUser.subscription || {
                          tier: (editedUser.tier || editedUser.subscription_tier || 'family_office') as SubscriptionTier,
                          status: 'active',
                          auto_renew: true,
                          billing_cycle: 'monthly'
                        }}
                        onUpgrade={() => setShowUpgradeModal(true)}
                        onManage={() => setShowBillingModal(true)}
                        onCancel={() => {
                          toast({
                            title: "Cancel Subscription",
                            description: "Please contact support to cancel your subscription.",
                          })
                        }}
                      />
                      
                      {/* Billing History */}
                      <BillingHistory
                        transactions={billingHistory}
                        onDownloadInvoice={handleDownloadInvoice}
                      />
                      
                    </div>
                  )}

                  {activeTab === 'preferences' && (
                    <div className="space-y-6">
                  {/* Investment Preferences */}
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Investment Preferences</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-3">
                          <Bitcoin className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium">Cryptocurrency Investor</span>
                        </div>
                        <Badge variant={editedUser.crypto_investor ? "default" : "secondary"}>
                          {editedUser.crypto_investor ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-background">
                        <div className="flex items-center gap-3">
                          <Trees className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Real Estate / Land Investor</span>
                        </div>
                        <Badge variant={editedUser.land_investor ? "default" : "secondary"}>
                          {editedUser.land_investor ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Notification Preferences */}
                  <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Notification Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure how and when you receive notifications from HNWI Chronicles
                      </p>
                    </CardHeader>
                    <CardContent>
                      <NotificationPreferences />
                    </CardContent>
                  </Card>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Change Password Popup */}
        <ChangePasswordPopup
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userId={editedUser.user_id}
        />
        
        {/* Plan Upgrade Modal */}
        <PlanUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={editedUser.subscription?.tier || editedUser.tier || editedUser.subscription_tier || 'family_office'}
          onSuccess={(tier, billingCycle) => {
            // Update user subscription in state
            const updatedUser = {
              ...editedUser,
              subscription: {
                ...editedUser.subscription,
                tier,
                status: 'active' as const,
                billing_cycle: billingCycle,
                auto_renew: true,
                next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              }
            }
            setEditedUser(updatedUser)
            onUpdateUser(updatedUser)
            
            // Add mock transaction
            const getPlanAmount = () => {
              const amounts = {
                essential: { monthly: 9900, yearly: 99000 },
                professional: { monthly: 29900, yearly: 299000 },
                family_office: { monthly: 59900, yearly: 599000 }
              }
              return amounts[tier as keyof typeof amounts]?.[billingCycle] || 0
            }
            
            const getPlanName = () => {
              return tier === 'family_office' ? 'Family Office' : tier.charAt(0).toUpperCase() + tier.slice(1)
            }
            
            // Refresh billing history after successful upgrade
            fetchBillingHistory()
            
            toast({
              title: "Subscription Updated",
              description: `Successfully upgraded to ${tier} plan!`,
            })
          }}
        />

        {/* Billing Management Modal */}
        <BillingManagementModal
          isOpen={showBillingModal}
          onClose={() => setShowBillingModal(false)}
          user={editedUser}
        />
      </div>
    </>
  )
}