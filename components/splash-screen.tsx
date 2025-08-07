"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"
import { OnboardingPage } from "./onboarding-page"

export function SplashScreen({ onLogin }: { onLogin: () => void }) {
  const { theme } = useTheme()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleCreateAccount = () => {
    setShowOnboarding(true)
  }

  const handleBack = () => {
    console.log("Going back to splash screen")
    setShowOnboarding(false)
  }

  const handleOnboardingComplete = (userData) => {
    // Handle successful registration
    console.log("User registered:", userData)
    
    // Instead of redirecting to login, automatically log the user in
    const authData = {
      userId: userData.user_id,
      email: userData.email,
      firstName: userData.firstName || userData.name?.split(' ')[0] || "User",
      lastName: userData.lastName || (userData.name?.split(' ').slice(1).join(' ') || ""),
      profile: userData.profile || {},
      token: userData.token || "auto-login-token"
    }
    
    // Store auth data in localStorage (same pattern as login-page.tsx)
    localStorage.setItem("userId", authData.userId);
    localStorage.setItem("userEmail", authData.email);
    localStorage.setItem("token", authData.token);
    
    // Store user object for recovery if needed
    localStorage.setItem("userObject", JSON.stringify(authData));
    
    // Set skipSplash flag to bypass login screen on page refresh
    sessionStorage.setItem("skipSplash", "true");
    sessionStorage.setItem("currentPage", "dashboard");
    
    // Navigate to dashboard after signup
    window.location.href = "/";
  }

  if (showOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} onLogin={onLogin} onBack={handleBack} />
  }

  return (
    <>
      <MetaTags
        title="HNWI Chronicles – Your Gateway to Global Wealth Intelligence"
        description="Unlock exclusive insights, playbooks, and strategic intelligence tailored for High-Net-Worth and Ultra-High-Net-Worth Individuals. HNWI Chronicles empowers you with data-driven strategies, industry trends, and actionable frameworks to navigate the world of wealth and influence."
        image="https://hnwichronicles.com/og-image.jpg" // Replace with actual image URL
        url="https://montaigne.co/hnwichronicles"
      />
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-background`}
      >
        <ParticlesBackground />

        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="z-10 text-center"
          >
            {/* Globe animation */}
            <motion.div
              className="globe-container relative w-48 h-48 sm:w-64 sm:h-64 mb-6 mx-auto"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            >
              <Image
                src="/logo.png"
                alt="HNWI Chronicles"
                width={256}
                height={256}
                className="w-full h-full"
                style={{ height: "auto" }}
                priority
              />
            </motion.div>

            <Heading1 className="text-3xl sm:text-5xl mb-4 text-foreground">
              <span className="text-primary">HNWI</span>{" "}
              <span className="text-secondary">CHRONICLES</span>
            </Heading1>

            <Lead className="mb-8 text-muted-foreground">Your Private HNWI Intelligence Ally</Lead>

            <div className="flex space-x-4 justify-center">
              {/* Login button */}
              <Button
                onClick={onLogin}
                className="w-[200px] h-[50px] text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Log In
              </Button>

              {/* Join HNWI button */}
              <Button
                onClick={() => window.open('https://www.hnwichronicles.com/hnwi-world#pricing', '_blank')}
                className="w-[200px] h-[50px] text-lg rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Join HNWI
              </Button>
            </div>
          </motion.div>
        </div>

        <footer className="w-full py-4 px-4 text-center z-10 absolute bottom-0">
          <Paragraph className="text-xs text-muted-foreground">
            © 2025 All Rights Reserved. HNWI Chronicles.
          </Paragraph>
        </footer>
      </div>
    </>
  )
}

