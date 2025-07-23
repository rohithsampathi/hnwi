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
import type { User } from "@/types/user"
import { UserIcon, LogOut, Edit2, Save, HelpCircle, Key, Loader2 } from "lucide-react"
import { OnboardingWizard } from "./onboarding-wizard"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useToast } from "@/components/ui/use-toast"
import { ChangePasswordPopup } from "./change-password-popup"
import { Heading2, Heading3, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"

const formatLinkedInUrl = (url: string): string => {
  if (!url) return ""
  url = url.trim()
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

const API_BASE_URL = "https://uwind.onrender.com"

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
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: {
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        });
        
        if (!response.ok) {
          console.error("User data fetch failed with status:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const userData = await response.json();
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
    } else {
      // Fallback to stored ID if available
      const storedUserId = localStorage.getItem("userId")
      if (storedUserId) {
        setUserId(storedUserId)
        fetchUserData(storedUserId)
      } else {
        console.error("User ID is not available in user data or localStorage")
        setIsLoading(false)
      }
    }
  }, [fetchUserData, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value })
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: Number.parseFloat(e.target.value) })
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
        net_worth: Number(editedUser.net_worth),
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
        net_worth: Number(editedUser.net_worth),
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
      console.log("Making direct API PUT request to:", `${API_BASE_URL}/api/users/${userId}`);
      const token = localStorage.getItem("token");
      console.log("Using authentication token:", token ? "Yes (token exists)" : "No (token missing)");
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        console.error("API request failed with status:", response.status);
        try {
          const errorText = await response.text();
          console.error("Error response:", errorText);
        } catch (e) {
          console.error("Couldn't read error response");
        }
        throw new Error(`Failed to update user profile: ${response.status} ${response.statusText}`);
      }

      console.log("API response status:", response.status);
      const responseData = await response.json();
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
          net_worth: updatedUserData.net_worth,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
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
      <div className="container mx-auto px-4 py-8">
        <Card
          className="w-full max-w-4xl mx-auto overflow-hidden relative bg-card text-card-foreground"
        >
          <CardHeader className="flex flex-row items-center justify-between p-6 bg-primary text-primary-foreground">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-foreground rounded-full">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <Heading2 className="text-3xl font-bold font-heading text-primary-foreground">
                {isEditing ? "Edit Profile" : `${editedUser.name}`}
              </Heading2>
            </div>
            {/* Onboarding wizard button removed */}
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Full Name
                      </label>
                      <Input
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Net Worth
                      </label>
                      <Input
                        name="net_worth"
                        type="number"
                        value={editedUser.net_worth}
                        onChange={handleNumberInputChange}
                        placeholder="Net Worth"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        City
                      </label>
                      <Input
                        name="city"
                        value={editedUser.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Country
                      </label>
                      <Input
                        name="country"
                        value={editedUser.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Industries
                      </label>
                      <Input
                        name="industries"
                        value={editedUser.industries.join(", ")}
                        onChange={(e) => handleIndustriesChange(e.target.value)}
                        placeholder="Industries (comma-separated)"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Company Name
                      </label>
                      <Input
                        name="company"
                        value={editedUser.company_info?.name || editedUser.company || ""}
                        onChange={(e) => {
                          // Update both company field and company_info.name
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
                        placeholder="Company Name"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Phone Number
                      </label>
                      <Input
                        name="phone_number"
                        value={editedUser.phone_number}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        LinkedIn URL
                      </label>
                      <Input
                        name="linkedin"
                        value={editedUser.linkedin}
                        onChange={handleInputChange}
                        placeholder="LinkedIn URL"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Office Address
                      </label>
                      <Input
                        name="office_address"
                        value={editedUser.office_address}
                        onChange={handleInputChange}
                        placeholder="Office Address"
                        className="w-full bg-input text-foreground border border-border"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Crypto Investor
                      </label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="crypto_investor"
                          checked={editedUser.crypto_investor}
                          onCheckedChange={(checked) => handleCheckboxChange("crypto_investor", checked)}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold font-body mb-2 text-card-foreground"
                      >
                        Land Investor
                      </label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="land_investor"
                          checked={editedUser.land_investor}
                          onCheckedChange={(checked) => handleCheckboxChange("land_investor", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                    >
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={editedUser.bio}
                      onChange={handleInputChange}
                      placeholder="Bio"
                      className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} style={{ background: theme === "dark" ? "hsl(165, 46%, 45%)" : "hsl(165, 46%, 75%)", color: "white" }}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Heading3 className="text-lg font-semibold font-heading mb-2">Personal Information</Heading3>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Name:</span> {editedUser.name}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Net Worth:</span> {editedUser.net_worth && typeof editedUser.net_worth === 'number' ? `$${editedUser.net_worth.toLocaleString()}` : 'Not specified'}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">City:</span> {editedUser.city || 'Not specified'}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Country:</span> {editedUser.country || 'Not specified'}
                      </Paragraph>
                    </div>
                    <div>
                      <Heading3 className="text-lg font-semibold font-heading mb-2">Professional Information</Heading3>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Industries:</span> {editedUser.industries && editedUser.industries.length > 0 ? editedUser.industries.join(", ") : 'Not specified'}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Company:</span> {editedUser.company_info?.name || editedUser.company || "Not specified"}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Phone:</span> {editedUser.phone_number || "Not specified"}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">LinkedIn:</span> {editedUser.linkedin || "Not specified"}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Office Address:</span> {editedUser.office_address || "Not specified"}
                      </Paragraph>
                    </div>
                  </div>
                  <div>
                    <Heading3 className="text-lg font-semibold font-heading mb-2">Investment Preferences</Heading3>
                    <Paragraph className="text-sm font-body">
                      <span className="font-medium">Crypto Investor:</span> {editedUser.crypto_investor ? "Yes" : "No"}
                    </Paragraph>
                    <Paragraph className="text-sm font-body">
                      <span className="font-medium">Land Investor:</span> {editedUser.land_investor ? "Yes" : "No"}
                    </Paragraph>
                  </div>
                  <div>
                    <Heading3 className="text-lg font-semibold font-heading mb-2">Bio</Heading3>
                    <Paragraph className="text-sm font-body">{editedUser.bio || "No bio provided"}</Paragraph>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="mt-6" style={{ background: theme === "dark" ? "hsl(165, 46%, 45%)" : "hsl(165, 46%, 75%)", color: "white", borderColor: theme === "dark" ? "hsl(165, 46%, 45%)" : "hsl(165, 46%, 75%)" }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="mt-6 ml-4"
                    style={{ background: theme === "dark" ? "hsl(43, 50%, 55%)" : "hsl(43, 50%, 75%)", color: "white" }}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <div className="mt-6">
                    <Button
                      variant="ghost"
                      onClick={onLogout}
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          {/* Removed absolute positioned logout button to prevent overlap */}
        </Card>
        {/* Onboarding wizard disabled */}
        <ChangePasswordPopup
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userId={editedUser.user_id}
        />
      </div>
    </>
  )
}

