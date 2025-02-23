// components/layout/header.tsx

"use client"

import type React from "react"

import { useCallback } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Heading1 } from "@/components/ui/typography"

interface HeaderProps {
  showBackButton?: boolean
  onNavigate: (route: string) => void
  children?: React.ReactNode
}

export function Header({ showBackButton = false, onNavigate, children }: HeaderProps) {
  const handleBackClick = useCallback(() => {
    onNavigate("back")
  }, [onNavigate])

  const { theme } = useTheme()

  return (
    <header
      className={`p-2 md:p-4 flex justify-between items-center relative z-20 ${
        theme === "dark"
          ? "bg-[#121212] shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1),_0_2px_4px_-1px_rgba(255,255,255,0.06)]"
          : "bg-[#F5F5F5] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="flex items-center">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className={`mr-2 ${
              theme === "dark"
                ? "text-[#BBDEFB] hover:text-white hover:bg-[#1A1A1A]"
                : "text-[#424242] hover:text-[#212121] hover:bg-[#E0E0E0]"
            }`}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        )}
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate("dashboard")}>
          <motion.div
            className="mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tNPttW3utosqgVlbJRBssjJUTRJPM6.png"
              alt="HNWI Chronicles Globe"
              width={24}
              height={24}
              className="md:w-8 md:h-8"
            />
          </motion.div>
          <Heading1 className={`text-base md:text-lg font-bold ${theme === "dark" ? "text-white" : "text-black"}`}>
            HNWI Chronicles
          </Heading1>
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">{children}</div>
    </header>
  )
}

