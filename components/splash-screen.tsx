"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"

export function SplashScreen({ onLogin, onSignUp }: { onLogin: () => void; onSignUp: () => void }) {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <MetaTags
        title="HNWI Chronicles – Your Gateway to Global Wealth Intelligence"
        description="Unlock exclusive insights, playbooks, and strategic intelligence tailored for High-Net-Worth and Ultra-High-Net-Worth Individuals. HNWI Chronicles empowers you with data-driven strategies, industry trends, and actionable frameworks to navigate the world of wealth and influence."
        image="https://hnwichronicles.com/og-image.jpg" // Replace with actual image URL
        url="https://montaigne.co/hnwichronicles"
      />
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${
          theme === "dark" ? "bg-[#121212]" : "bg-[#F5F5F5]"
        }`}
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"
                alt="HNWI Chronicles Globe"
                width={256}
                height={256}
                className="w-full h-full"
                priority
              />
            </motion.div>

            <Heading1 className={`text-3xl sm:text-5xl mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
              HNWI CHRONICLES
            </Heading1>

            <Lead className="mb-8">Your Gateway to Global Wealth Intelligence</Lead>

            <div className="space-y-4">
              <Button
                onClick={onLogin}
                className="gradient-button w-[200px] h-[50px] text-lg rounded-full shadow-[0_0_15px_rgba(66,165,245,0.5)] hover:shadow-[0_0_20px_rgba(66,165,245,0.7)] transition-shadow duration-300"
              >
                Log In
              </Button>

              {!isLoading && (
                <Button
                  onClick={onSignUp}
                  variant="outline"
                  className={`w-[200px] h-[50px] text-lg rounded-full shadow-[0_0_15px_rgba(66,165,245,0.3)] hover:shadow-[0_0_20px_rgba(66,165,245,0.5)] transition-shadow duration-300 ${
                    theme === "dark"
                      ? "text-[#BBDEFB] border-[#BBDEFB] hover:bg-[#BBDEFB]/10"
                      : "text-[#424242] border-[#424242] hover:bg-[#424242]/10"
                  }`}
                >
                  Sign Up
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        {isLoading && (
          <motion.div
            className="absolute inset-x-0 bottom-16 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              className={`w-16 h-16 ${theme === "dark" ? "text-[#42A5F5]" : "text-[#1976D2]"}`}
              animate={{
                rotateY: 360,
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        <footer className={`w-full py-4 px-4 text-center z-10 absolute bottom-0`}>
          <Paragraph className={`text-xs ${theme === "dark" ? "text-[#666]" : "text-[#999]"}`}>
            © 2025 All Rights Reserved. HNWI Chronicles.
          </Paragraph>
        </footer>
      </div>
    </>
  )
}

