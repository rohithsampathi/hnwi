// components/onboarding-page.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/contexts/theme-context"
import { ThemeToggle } from "./theme-toggle"
import type { User } from "@/types/user"
import { ParticlesBackground } from "./particles-background"
import { Header } from "./layout/header"
import { Heading2, Heading3, Paragraph, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://uwind.onrender.com"

const slides = [
  {
    title: "Welcome to HNWI Chronicles",
    subtitle: "Your Strategic Edge in Global HNWI Strategy Intelligence",
    description: "Tailored playbooks and actionable insights designed to fuel your growth ambitions.",
  },
  {
    title: "Unlock Powerful HNWI Strategies",
    sections: [
      {
        title: "Actionable Playbooks",
        description: "Step-by-step frameworks to penetrate HNWI markets with precision.",
      },
      {
        title: "Global Market Insights",
        description: "Track wealth flows, trends, and opportunities across industries.",
      },
      {
        title: "Orange Strategy Engine",
        description: "Ask complex questions and receive data-backed insights to drive strategic decisions.",
      },
    ],
  },
  {
    title: "Personalize Your Experience",
    form: true,
  },
]

const primaryInterests = ["Real Estate", "Collectibles", "Fashion", "Wealth Management"]

export function OnboardingPage({
  onComplete,
  onLogin,
  onBack,
}: { onComplete: (user: User & { user_id: string }) => void; onLogin: () => void; onBack: () => void }) {
  const { theme } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isCryptoInvestor, setIsCryptoInvestor] = useState(false)
  const [isLandInvestor, setIsLandInvestor] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      onBack()
    }
  }

  const handleGetStarted = async () => {
    const userData = {
      email,
      password,
      name: `${firstName} ${lastName}`,
      net_worth: 0,
      city: "Edit This Data",
      country: "Edit This Data",
      bio: "Edit This Data",
      industries: selectedInterests,
      company: "Edit This Data",
      phone_number: "Edit This Data",
      linkedin: "Edit This Data",
      office_address: "Edit This Data",
      crypto_investor: isCryptoInvestor,
      land_investor: isLandInvestor,
    }

    try {
      // Make sure we have complete data
      if (!email || !password || !firstName) {
        setError("Please fill in all required fields (email, password, first name)");
        return;
      }
      
      // Password validation - at least 8 chars with 1 uppercase, 1 lowercase, 1 number
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter");
        return;
      }
      
      if (!/[a-z]/.test(password)) {
        setError("Password must contain at least one lowercase letter");
        return;
      }
      
      if (!/[0-9]/.test(password)) {
        setError("Password must contain at least one number");
        return;
      }
      
      // Send data to the FastAPI backend
      console.log("Sending user data to:", `${API_BASE_URL}/api/users/profile`);
      console.log("User data:", JSON.stringify({
        email,
        name: `${firstName} ${lastName}`,
        // Password is masked for logging
      }, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
          net_worth: 0,
          city: "Edit This Data",
          country: "Edit This Data",
          bio: "Edit This Data",
          industries: selectedInterests,
          phone_number: "Edit This Data",
          office_address: "Edit This Data",
          crypto_investor: isCryptoInvestor,
          land_investor: isLandInvestor,
          company_info: {
            name: "Edit This Data",
            about: "",
            industry: "",
            product_focus: "",
            total_employees: 0,
            locations: []
          },
          linkedin: "Edit This Data"
        }),
      });

      console.log("API Response status:", response.status);
      
      // Get the raw response for better debugging
      const responseText = await response.text();
      console.log("API Response text:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("API Response data:", data);
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`)
      }

      if (data.status === "success" && data.user_id) {
        console.log("User created successfully with ID:", data.user_id);
        onComplete({
          ...userData,
          user_id: data.user_id,
        });
      } else {
        throw new Error("Unexpected response from server: " + JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error creating user profile:", error)
      setError(`Error creating user profile: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  const renderForm = () => (
    <div className="space-y-4 mb-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          First Name
        </label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={`w-full ${theme === "dark" ? "bg-[#121212] text-[#E0E0E0]" : "bg-white text-[#212121]"}`}
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          Last Name
        </label>
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={`w-full ${theme === "dark" ? "bg-[#121212] text-[#E0E0E0]" : "bg-white text-[#212121]"}`}
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full ${theme === "dark" ? "bg-[#121212] text-[#E0E0E0]" : "bg-white text-[#212121]"}`}
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full ${theme === "dark" ? "bg-[#121212] text-[#E0E0E0]" : "bg-white text-[#212121]"}`}
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          What are your primary interests?
        </label>
        <div className="space-y-2">
          {primaryInterests.map((interest) => (
            <div key={interest} className="flex items-center">
              <Checkbox
                id={interest}
                checked={selectedInterests.includes(interest)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedInterests([...selectedInterests, interest])
                  } else {
                    setSelectedInterests(selectedInterests.filter((i) => i !== interest))
                  }
                }}
              />
              <label
                htmlFor={interest}
                className={`ml-2 text-sm ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}
              >
                {interest}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          What are your investment interests?
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cryptoInvestor"
              checked={isCryptoInvestor}
              onCheckedChange={(checked) => setIsCryptoInvestor(checked as boolean)}
            />
            <label
              htmlFor="cryptoInvestor"
              className={`text-sm ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}
            >
              Crypto
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="landInvestor"
              checked={isLandInvestor}
              onCheckedChange={(checked) => setIsLandInvestor(checked as boolean)}
            />
            <label
              htmlFor="landInvestor"
              className={`text-sm ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}
            >
              Land
            </label>
          </div>
        </div>
      </div>
      {error && <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
    </div>
  )

  return (
    <>
      <MetaTags
        title="Sign Up | HNWI Chronicles"
        description="Join HNWI Chronicles and gain access to exclusive wealth intelligence, strategic insights, and powerful tools for high-net-worth individuals."
        image="https://hnwichronicles.com/signup-og-image.jpg" // Replace with actual image URL
        url="https://hnwichronicles.com/signup" // Replace with actual URL
      />
      <div
        className={`min-h-screen flex flex-col transition-colors duration-300 ${
          theme === "dark" ? "bg-[#121212]" : "bg-[#F5F5F5]"
        }`}
      >
        <ParticlesBackground />
        <Header title="Onboarding" showBackButton={true} onNavigate={handleBack}>
          <ThemeToggle />
        </Header>
        <main className="flex-grow flex items-center justify-center p-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="max-w-md w-full z-10"
            >
              {slides[currentSlide].title && (
                <Heading2 className={`text-3xl mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
                  {slides[currentSlide].title}
                </Heading2>
              )}

              {slides[currentSlide].subtitle && (
                <Lead className={`text-xl mb-6 ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                  {slides[currentSlide].subtitle}
                </Lead>
              )}

              {slides[currentSlide].description && (
                <Paragraph className={`mb-6 ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                  {slides[currentSlide].description}
                </Paragraph>
              )}

              {slides[currentSlide].sections && (
                <div className="space-y-4 mb-6">
                  {slides[currentSlide].sections.map((section, index) => (
                    <div key={index}>
                      <Heading3 className={`text-lg ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
                        {section.title}
                      </Heading3>
                      <p className={`${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                        {section.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {slides[currentSlide].form && (
                <>
                  {renderForm()}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={() => {
                        setError(null)
                        handleGetStarted()
                      }}
                      className="gradient-button w-full h-12 text-lg rounded-full mt-6"
                      disabled={!firstName || !lastName || !email || !password || selectedInterests.length === 0}
                    >
                      Let's Get Started
                    </Button>
                  </motion.div>
                </>
              )}

              {currentSlide < slides.length - 1 && !slides[currentSlide].form && (
                <Button onClick={handleNext} className="gradient-button w-full h-12 text-lg rounded-full mt-6">
                  Next
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer
          className={`text-[10px] leading-tight text-center py-4 font-body ${
            theme === "dark" ? "text-[#666]" : "text-[#999]"
          }`}
        >
          <p>© 2025 All Rights Reserved. HNWI Chronicles.</p>
        </footer>
      </div>
    </>
  )
}

