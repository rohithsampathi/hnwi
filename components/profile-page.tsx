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
  const [editedUser, setEditedUser] = useState(user)
  const { toast } = useToast()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  const fetchUserData = useCallback(
    async (userId: string) => {
      if (isRefreshing) return

      const now = Date.now()
      if (now - lastFetchTime < 60000) return // Prevent fetching more than once per minute

      setIsRefreshing(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const userData = await response.json()
        setEditedUser(userData)
        onUpdateUser(userData)
        setLastFetchTime(now)
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

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUserData),
      })

      if (!response.ok) {
        throw new Error("Failed to update user profile")
      }

      const responseData = await response.json()
      onUpdateUser({ ...user, ...responseData })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })

      // Fetch the latest data after saving
      await fetchUserData(userId)
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
          className={`w-full max-w-4xl mx-auto overflow-hidden relative ${
            theme === "dark" ? "bg-[#1A1A1A] text-white" : "bg-white text-[#212121]"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white rounded-full">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <Heading2 className="text-3xl font-bold font-heading text-white">
                {isEditing ? "Edit Profile" : `${editedUser.name}`}
              </Heading2>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={toggleOnboardingWizard}>
                <HelpCircle className="w-5 h-5 mr-2" />
                Onboarding Wizard
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Full Name
                      </label>
                      <Input
                        name="name"
                        value={editedUser.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Net Worth
                      </label>
                      <Input
                        name="net_worth"
                        type="number"
                        value={editedUser.net_worth}
                        onChange={handleNumberInputChange}
                        placeholder="Net Worth"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        City
                      </label>
                      <Input
                        name="city"
                        value={editedUser.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Country
                      </label>
                      <Input
                        name="country"
                        value={editedUser.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Industries
                      </label>
                      <Input
                        name="industries"
                        value={editedUser.industries.join(", ")}
                        onChange={(e) => handleIndustriesChange(e.target.value)}
                        placeholder="Industries (comma-separated)"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Company Name
                      </label>
                      <Input
                        name="company"
                        value={editedUser.company}
                        onChange={handleInputChange}
                        placeholder="Company Name"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Phone Number
                      </label>
                      <Input
                        name="phone_number"
                        value={editedUser.phone_number}
                        onChange={handleInputChange}
                        placeholder="Phone Number"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        LinkedIn URL
                      </label>
                      <Input
                        name="linkedin"
                        value={editedUser.linkedin}
                        onChange={handleInputChange}
                        placeholder="LinkedIn URL"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
                      >
                        Office Address
                      </label>
                      <Input
                        name="office_address"
                        value={editedUser.office_address}
                        onChange={handleInputChange}
                        placeholder="Office Address"
                        className={`w-full ${theme === "dark" ? "bg-[#2A2A2A] text-white" : "bg-white text-[#212121]"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
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
                        className={`block text-sm font-semibold font-body mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}
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
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                        <span className="font-medium">Net Worth:</span> ${editedUser.net_worth.toLocaleString()}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">City:</span> {editedUser.city}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Country:</span> {editedUser.country}
                      </Paragraph>
                    </div>
                    <div>
                      <Heading3 className="text-lg font-semibold font-heading mb-2">Professional Information</Heading3>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Industries:</span> {editedUser.industries.join(", ")}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Company:</span> {editedUser.company}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Phone:</span> {editedUser.phone_number}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">LinkedIn:</span> {editedUser.linkedin}
                      </Paragraph>
                      <Paragraph className="text-sm font-body">
                        <span className="font-medium">Office Address:</span> {editedUser.office_address}
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
                    <Paragraph className="text-sm font-body">{editedUser.bio}</Paragraph>
                  </div>
                  <Button onClick={() => setIsEditing(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white ml-4"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <div className="absolute bottom-4 right-4">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-primary hover:text-primary-foreground hover:bg-primary"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
        {showOnboardingWizard && <OnboardingWizard />}
        <ChangePasswordPopup
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          userId={editedUser.user_id}
        />
      </div>
    </>
  )
}

