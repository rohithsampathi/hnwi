// components/profile-page.tsx

"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
  Plus
} from "lucide-react"
import { OnboardingWizard } from "./onboarding-wizard"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { ChangePasswordPopup } from "./change-password-popup"
import { MetaTags } from "./meta-tags"
import { motion } from "framer-motion"
import { getCrownVaultStats, getCrownVaultAssets, type CrownVaultStats, type CrownVaultAsset } from "@/lib/api"
import { PortfolioCategoryGrid } from "@/components/ui/portfolio-category-grid"
import { processAssetCategories } from "@/lib/category-utils"
import { secureApi } from "@/lib/secure-api"

const formatLinkedInUrl = (url: string): string => {
  if (!url) return ""
  url = url.trim()
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}


interface ProfilePageProps {
  user: User
  onUpdateUser: (updatedUser: User) => void
  onLogout?: () => void
}

export function ProfilePage({ user, onUpdateUser, onLogout }: ProfilePageProps) {
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const { showOnboardingWizard, setShowOnboardingWizard } = useOnboarding()
  // Ensure user data includes necessary properties, especially company info
  const enhancedUser = {
    ...user,
    company: user.company || (user.profile?.company_info?.name || ""),
    company_info: user.company_info || user.profile?.company_info || { name: user.company || "" },
  }
  const [editedUser, setEditedUser] = useState(enhancedUser)
  const { toast } = useToast()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [activeTab, setActiveTab] = useState("crown-vault")
  const [vaultStats, setVaultStats] = useState<CrownVaultStats | null>(null)
  const [vaultAssets, setVaultAssets] = useState<CrownVaultAsset[]>([])
  const [vaultLoading, setVaultLoading] = useState(false)

  const fetchVaultStats = useCallback(async () => {
    try {
      setVaultLoading(true)
      // Fetch both stats and assets like Crown Vault page does
      const [stats, assets] = await Promise.all([
        getCrownVaultStats(),
        getCrownVaultAssets()
      ])
      setVaultStats(stats)
      setVaultAssets(assets)
    } catch (error) {
      console.error("Error fetching Crown Vault data:", error)
    } finally {
      setVaultLoading(false)
    }
  }, [])

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
      if (isRefreshing) {
        console.log("Skipping fetchUserData - already refreshing");
        return;
      }

      const now = Date.now()
      if (now - lastFetchTime < 60000) {
        console.log("Skipping fetchUserData - called within last minute");
        return; // Prevent fetching more than once per minute
      }

      // Fetching user data
      setIsRefreshing(true)
      try {
        const userData = await secureApi.get(`/api/users/${userId}`, true, { enableCache: true, cacheDuration: 300000 }); // 5 minutes for user data
        // User data fetched successfully
        
        // Enhance user data with company info handling
        const enhancedUserData = {
          ...userData,
          company: userData.company || (userData.profile?.company_info?.name || ""),
          company_info: userData.company_info || userData.profile?.company_info || { name: userData.company || "" },
        };
        
        setEditedUser(enhancedUserData);
        onUpdateUser(enhancedUserData);
        setLastFetchTime(now);
        // User data fetch complete and state updated;
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsRefreshing(false)
        setIsLoading(false)
      }
    },
    [onUpdateUser, toast, isRefreshing, lastFetchTime],
  )

  useEffect(() => {
    // First check if user data already has the correct ID
    if (user && (user.user_id || user._id)) {
      const userApiId = user.user_id || user._id
      // Store the user ID from the API
      localStorage.setItem("userId", userApiId)
      setUserId(userApiId)
      fetchUserData(userApiId)
      fetchVaultStats() // Fetch Crown Vault stats
    } else {
      // Fallback to stored ID if available
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
        fetchUserData(storedUserId)
        fetchVaultStats() // Fetch Crown Vault stats
      } else {
        console.error("User ID is not available in user data or localStorage")
        setIsLoading(false)
      }
    }
  }, [fetchUserData, fetchVaultStats, user])

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
        company_info: {
          name: String(editedUser.company || ""),
          about: editedUser.company_info?.about || ""
        }
      }

      console.log("=== PROFILE UPDATE DEBUGGING ===");
      console.log("User ID being used:", userId);
      console.log("Full update payload:", JSON.stringify(updatedUserData));
      console.log("API payload:", JSON.stringify(apiPayload));

      // First try to update via the default handler - if it fails, fall back to direct API
      // First update the UI with the local handler to give immediate feedback
      console.log("Attempting to use onUpdateUser handler for local state...");
      try {
        await onUpdateUser({ ...user, ...updatedUserData });
        console.log("onUpdateUser handler succeeded for local state!");
      } catch (handlerError) {
        console.log("Local profile update handler failed:", handlerError);
      }
      
      // ALWAYS proceed with direct API call regardless of local update success
      // This ensures MongoDB is updated even if the local update succeeded

      // Direct API call as a fallback - using simplified payload like Postman
      console.log("Making secure API PUT request to update user profile");
      
      const responseData = await secureApi.put(`/api/users/${userId}`, apiPayload);
      console.log("API response data:", JSON.stringify(responseData));
      
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
      
      console.log("Merged user object:", JSON.stringify(mergedUser));
      
      // Update local storage with the latest user object
      localStorage.setItem("userObject", JSON.stringify(mergedUser));
      console.log("Updated localStorage userObject");
      
      // Call the update handler with updated user
      console.log("Calling onUpdateUser with merged data");
      onUpdateUser(mergedUser);
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })

      console.log("About to fetch latest user data");
      // Fetch the latest data after saving - adding delay to avoid race condition
      setTimeout(() => {
        fetchUserData(userId);
      }, 1000);
    } catch (error) {
      console.error("Error updating user profile:", error)
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
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      <div className="min-h-screen bg-background">
        {/* Modern Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-2xl" />
          
          <div className="relative container mx-auto px-4 py-12">
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
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                    {getInitials(editedUser.name || "User")}
                  </AvatarFallback>
                </Avatar>
                {getTotalValue() > 10000000 && (
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
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
                  {editedUser.company && (
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{editedUser.company}</span>
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
                      className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="border-border"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90"
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
        <div className="container mx-auto px-4 py-8">
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
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Crown Vault
                    </button>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'overview'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('professional')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'professional'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Professional
                    </button>
                    <button
                      onClick={() => setActiveTab('preferences')}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                        activeTab === 'preferences'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                          : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
                      }`}
                    >
                      Preferences
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {activeTab === 'crown-vault' && (
                    <div className="space-y-6">
                  {vaultLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : vaultStats && vaultStats.total_assets > 0 ? (
                    <div className="space-y-8">
                      {/* Main Vault Overview */}
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5">
                        <CardHeader className="text-center pb-6">
                          <div className="relative inline-block mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-30" />
                            <Crown className="relative h-16 w-16 text-primary mx-auto mb-4 drop-shadow-lg" />
                          </div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                              <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-primary/10 rounded-xl">
                                    <Vault className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="text-right">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  </div>
                                </div>
                                <p className="text-sm text-foreground/80 font-semibold mb-2">Total Assets</p>
                                <p className="text-3xl font-bold text-primary mb-1">{vaultStats.total_assets}</p>
                                <p className="text-xs text-foreground/60 font-semibold">Items secured</p>
                              </div>
                            </div>

                            <div className="group relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                              <div className="relative bg-background/80 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 hover:border-secondary/40 transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-secondary/10 rounded-xl">
                                    <DollarSign className="h-8 w-8 text-secondary" />
                                  </div>
                                  <div className="text-right">
                                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                                  </div>
                                </div>
                                <p className="text-sm text-foreground/80 font-semibold mb-2">Total Portfolio Value</p>
                                <p className="text-3xl font-bold text-secondary mb-1">{formatCurrency(getTotalValue())}</p>
                                <p className="text-xs text-foreground/60 font-semibold">Encrypted & secured</p>
                              </div>
                            </div>

                            <div className="group relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300" />
                              <div className="relative bg-background/80 backdrop-blur-sm border border-accent/20 rounded-2xl p-6 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="p-3 bg-accent/10 rounded-xl">
                                    <Users className="h-8 w-8 text-accent" />
                                  </div>
                                  <div className="text-right">
                                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                  </div>
                                </div>
                                <p className="text-sm text-foreground/80 font-semibold mb-2">Designated Heirs</p>
                                <p className="text-3xl font-bold text-accent mb-1">{vaultStats.total_heirs}</p>
                                <p className="text-xs text-purple-600 font-semibold">Legacy recipients</p>
                              </div>
                            </div>
                          </div>

                          {/* Portfolio Allocation Overview */}
                          <Card className="bg-gradient-to-br from-background to-muted/10 border border-primary/20">
                            <CardHeader className="text-center pb-2">
                              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                            <Card className="bg-gradient-to-br from-background to-muted/20 border-2 border-secondary/10">
                              <CardHeader>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                                  Recent Vault Activity
                                </h3>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {vaultStats.recent_activity.slice(0, 5).map((activity, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
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
                              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                              onClick={() => window.location.href = '/crown-vault'}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Manage Full Vault
                              <ArrowRight className="w-4 h-4 ml-2" />
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
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5">
                      <CardContent className="text-center py-16">
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-20" />
                          <Vault className="relative h-20 w-20 text-muted-foreground mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">Your Crown Vault Awaits</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          Start securing your legacy with military-grade encryption. Organize your assets and designate heirs with complete privacy and control.
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button 
                            className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
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
                              <p className="font-medium text-xl text-primary">
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
                          <p className="font-medium">{editedUser.company || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Industries</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {editedUser.industries && editedUser.industries.length > 0 ? (
                              editedUser.industries.map((industry, index) => (
                                <Badge key={index} variant="secondary">
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
                              className="inline-flex items-center gap-1 text-primary hover:underline"
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

                  {activeTab === 'preferences' && (
                    <div className="space-y-6">
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
      </div>
    </>
  )
}