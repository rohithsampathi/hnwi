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
import { ChevronLeft, Shield, Globe, Users } from "lucide-react"
import { Heading2, Heading3, Paragraph, Lead } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { secureApi } from "@/lib/secure-api"

const slides = [
  {
    title: "Welcome to HNWI Chronicles",
    subtitle: "Your Strategic Edge in Global HNWI Strategy Intelligence",
    description: "Tailored playbooks and actionable insights designed to fuel your growth ambitions.",
  },
  {
    title: "Be one with the HNWI Ecosystem",
    description: "Your gateway to an exclusive world of private intelligence, global networks, and strategic resources.",
    sections: [
      {
        title: "War Room",
        icon: "Shield",
        description: "Access your private strategic playbooks and tactical resources designed exclusively for wealth strategists and financial leaders.",
        color: "#7f6e6b",
      },
      {
        title: "HNWI World",
        icon: "Globe",
        description: "Explore global wealth insights and exclusive market intelligence curated specifically for high-net-worth individuals and their advisors.",
        color: "#695d7e",
      },
      {
        title: "Social Hub",
        icon: "Users",
        description: "Connect with fellow elite investors, family offices, and wealth managers in our private network designed for high-value relationship building and deal flow.",
        color: "#877773",
      },
    ],
  },
  {
    title: "Personalize Your Experience",
    form: true,
  },
]

const primaryInterests = ["Real Estate", "Collectibles", "Fashion", "Wealth Management", "Other"]

export function OnboardingPage({
  onComplete,
  onLogin,
  onBack,
}: { onComplete: (user: User & { user_id: string }) => void; onLogin: () => void; onBack: () => void }) {
  const { theme } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [otherInterest, setOtherInterest] = useState("")
  const [isCryptoInvestor, setIsCryptoInvestor] = useState(false)
  const [isLandInvestor, setIsLandInvestor] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else {
      // Make sure onBack is properly passed from parent
      if (typeof onBack === 'function') {
        onBack()
      }
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
      industries: selectedInterests.includes("Other") && otherInterest 
        ? [...selectedInterests.filter(i => i !== "Other"), otherInterest] 
        : selectedInterests,
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
      
      // Send data to the FastAPI backend using secure API
      
      const data = await secureApi.post('/api/users/profile', {
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        net_worth: 0,
        city: "Edit This Data",
        country: "Edit This Data",
        bio: "Edit This Data",
        industries: selectedInterests.includes("Other") && otherInterest 
          ? [...selectedInterests.filter(i => i !== "Other"), otherInterest] 
          : selectedInterests,
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
      });
      

      if (data.status === "success" && data.user_id) {
        onComplete({
          ...userData,
          user_id: data.user_id,
        });
      } else {
        throw new Error("Unexpected response from server: " + JSON.stringify(data))
      }
    } catch (error) {
      setError(`Error creating user profile: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    }
  }

  const renderForm = () => (
    <div className="space-y-6 mb-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          First Name
        </label>
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
            theme === "dark"
              ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
              : "bg-white text-[#212121] border-[#DDD]"
          } focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all focus:shadow-[0_4px_10px_rgba(5,150,105,0.25)]`}
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
          className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
            theme === "dark"
              ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
              : "bg-white text-[#212121] border-[#DDD]"
          } focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all focus:shadow-[0_4px_10px_rgba(5,150,105,0.25)]`}
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
          className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
            theme === "dark"
              ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
              : "bg-white text-[#212121] border-[#DDD]"
          } focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all focus:shadow-[0_4px_10px_rgba(5,150,105,0.25)]`}
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          Password
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 rounded-3xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
              theme === "dark"
                ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
                : "bg-white text-[#212121] border-[#DDD]"
            } focus:outline-none focus:ring-2 focus:ring-[#059669] transition-all focus:shadow-[0_4px_10px_rgba(5,150,105,0.25)] pr-10`}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          What are your primary interests?
        </label>
        <div className="space-y-2 pl-1">
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
                className={`${theme === "dark" ? "border-[#666]" : "border-[#999]"}`}
              />
              <label
                htmlFor={interest}
                className={`ml-2 text-sm ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}
              >
                {interest}
              </label>
              {interest === "Other" && selectedInterests.includes("Other") && (
                <Input
                  className={`ml-3 p-2 w-32 text-sm rounded-xl font-body shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
                    theme === "dark"
                      ? "bg-[#1A1A1A] text-[#E0E0E0] border-[#333]"
                      : "bg-white text-[#212121] border-[#DDD]"
                  } focus:outline-none focus:ring-1 focus:ring-[#059669]`}
                  placeholder="Please specify"
                  value={otherInterest}
                  onChange={(e) => setOtherInterest(e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
          What are your investment interests?
        </label>
        <div className="space-y-2 pl-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cryptoInvestor"
              checked={isCryptoInvestor}
              onCheckedChange={(checked) => setIsCryptoInvestor(checked as boolean)}
              className={`${theme === "dark" ? "border-[#666]" : "border-[#999]"}`}
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
              className={`${theme === "dark" ? "border-[#666]" : "border-[#999]"}`}
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
      {error && (
        <div className="mt-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
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
        
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            onClick={handleBack}
            type="button"
            className={`text-sm rounded-full shadow-[0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0.5 ${
              theme === "dark"
                ? "text-[#BBDEFB] hover:text-white hover:bg-[#1A1A1A]"
                : "text-[#424242] hover:text-[#212121] hover:bg-[#E0E0E0]"
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <main className="flex-grow flex items-center justify-center p-4 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className={`max-w-md w-full z-10 rounded-3xl p-8 backdrop-blur-sm ${
                theme === "dark"
                  ? "bg-[#121212]/80 shadow-[0_15px_35px_rgba(156,163,175,0.3)]"
                  : "bg-[#F5F5F5]/80 shadow-[0_15px_35px_rgba(75,85,99,0.3)]"
              }`}
              style={{
                boxShadow:
                  theme === "dark"
                    ? "0 15px 35px rgba(156,163,175,0.3), 0 8px 20px rgba(156,163,175,0.2), 0 4px 10px rgba(156,163,175,0.1)"
                    : "0 15px 35px rgba(75,85,99,0.3), 0 8px 20px rgba(75,85,99,0.2), 0 4px 10px rgba(75,85,99,0.1)",
              }}
            >
              {slides[currentSlide].title && (
                <Heading2 
                  className={`text-3xl font-bold font-heading mb-4 text-center ${
                    theme === "dark" ? "text-white" : "text-black"
                  } ${
                    slides[currentSlide].title === "Be one with the HNWI Ecosystem" ? 
                    "relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-24 after:h-1 after:bg-gradient-to-r after:from-[#695d7e] after:to-[#7f6e6b] after:rounded-full" : ""
                  }`}
                >
                  {slides[currentSlide].title}
                </Heading2>
              )}

              {slides[currentSlide].subtitle && (
                <Lead className={`text-xl mb-6 text-center ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                  {slides[currentSlide].subtitle}
                </Lead>
              )}

              {slides[currentSlide].description && (
                <Paragraph className={`mb-6 text-center ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                  {slides[currentSlide].description}
                </Paragraph>
              )}

              {slides[currentSlide].sections && (
                <div className="space-y-6 mb-6">
                  {slides[currentSlide].sections.map((section, index) => {
                    // Get the icon component based on the icon name
                    let IconComponent;
                    switch(section.icon) {
                      case 'Shield': IconComponent = Shield; break;
                      case 'Globe': IconComponent = Globe; break;
                      case 'Users': IconComponent = Users; break;
                      default: IconComponent = Shield;
                    }
                    
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className={`p-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-102 hover:shadow-lg ${
                          theme === "dark" ? "bg-opacity-20 bg-white/5" : "bg-opacity-20 bg-black/5"
                        }`}
                        style={{
                          borderLeft: `4px solid ${section.color}`,
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div 
                            className="p-2 rounded-full"
                            style={{ 
                              backgroundColor: theme === "dark" ? `${section.color}40` : `${section.color}30`,
                              color: section.color 
                            }}
                            whileHover={{ scale: 1.1 }}
                            animate={{ 
                              scale: [1, 1.05, 1],
                              opacity: [1, 0.9, 1] 
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: index * 0.5,
                              ease: "easeInOut"
                            }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </motion.div>
                          <div className="flex-1">
                            <Heading3 className={`text-lg font-semibold ${theme === "dark" ? "text-[#BBDEFB]" : "text-[#212121]"}`}>
                              {section.title}
                            </Heading3>
                            <p className={`mt-1 text-sm ${theme === "dark" ? "text-[#E0E0E0]" : "text-[#424242]"}`}>
                              {section.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
                      className="gradient-button w-full h-12 text-lg rounded-full mt-6 shadow-[0_8px_20px_rgba(75,85,99,0.5)] hover:shadow-[0_12px_25px_rgba(75,85,99,0.7)] dark:shadow-[0_8px_20px_rgba(156,163,175,0.5)] dark:hover:shadow-[0_12px_25px_rgba(156,163,175,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5"
                      disabled={!firstName || !lastName || !email || !password || selectedInterests.length === 0 || (selectedInterests.includes("Other") && !otherInterest)}
                    >
                      Let's Get Started
                    </Button>
                  </motion.div>
                </>
              )}

              {currentSlide < slides.length - 1 && !slides[currentSlide].form && (
                <Button 
                  onClick={handleNext} 
                  className="gradient-button w-full h-12 text-lg rounded-full mt-6 shadow-[0_8px_20px_rgba(75,85,99,0.5)] hover:shadow-[0_12px_25px_rgba(75,85,99,0.7)] dark:shadow-[0_8px_20px_rgba(156,163,175,0.5)] dark:hover:shadow-[0_12px_25px_rgba(156,163,175,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5"
                >
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

