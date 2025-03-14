"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { ParticlesBackground } from "./particles-background"
import { ThemeToggle } from "./theme-toggle"
import { Heading1, Lead, Paragraph } from "@/components/ui/typography"
import { MetaTags } from "./meta-tags"

export function SplashScreen({ onLogin }: { onLogin: () => void }) {
  const { theme } = useTheme()

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

            <Heading1 className={`text-3xl sm:text-5xl mb-4`}>
              <span style={{ color: theme === "dark" ? "#e6d5c1" : "#5b4d4a" }}>HNWI</span>{" "}
              <span style={{ color: theme === "dark" ? "#ffffff" : "#121212" }}>CHRONICLES</span>
            </Heading1>

            <Lead className="mb-8">Your Private HNWI Intelligence Ally</Lead>

            <div className="flex space-x-4 justify-center">
              {/* Login button */}
              <Button
                onClick={onLogin}
                className="gradient-button w-[200px] h-[50px] text-lg rounded-full shadow-[0_8px_20px_rgba(156,163,175,0.5)] hover:shadow-[0_12px_25px_rgba(156,163,175,0.7)] dark:shadow-[0_8px_20px_rgba(156,163,175,0.5)] dark:hover:shadow-[0_12px_25px_rgba(156,163,175,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5"
              >
                Log In
              </Button>

              {/* Subscribe button with gold gradient */}
              <Link href="https://www.hnwichronicles.com/hnwi-world#pricing" target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-[200px] h-[50px] text-lg rounded-full bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 hover:from-amber-400 hover:via-yellow-600 hover:to-amber-700 text-black font-bold shadow-[0_8px_20px_rgba(251,191,36,0.5)] hover:shadow-[0_12px_25px_rgba(251,191,36,0.7)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0.5 border border-amber-300/30"
                >
                  Subscribe
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <footer className={`w-full py-4 px-4 text-center z-10 absolute bottom-0`}>
          <Paragraph className={`text-xs ${theme === "dark" ? "text-[#666]" : "text-[#999]"}`}>
            © 2025 All Rights Reserved. HNWI Chronicles.
          </Paragraph>
        </footer>
      </div>
    </>
  )
}

