// components/layout/header.tsx

"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

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
  const [showHeartbeat, setShowHeartbeat] = useState(false)

  // Trigger heartbeat animation every 10 seconds (after each rotation at 6 RPM)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowHeartbeat(true)
      setTimeout(() => setShowHeartbeat(false), 1000) // Heartbeat lasts 1 second
    }, 10000) // Every 10 seconds (6 RPM = 1 rotation per 10 seconds)

    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className={`py-1 px-2 md:py-2 md:px-3 flex justify-between items-center relative z-20 h-12 ${
        theme === "dark"
          ? "bg-[#121212] shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1),_0_2px_4px_-1px_rgba(255,255,255,0.06)]"
          : "bg-[#F5F5F5] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center px-2">
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
              animate={{ 
                rotate: 360,
                scale: showHeartbeat ? [1, 1.2, 1, 1.15, 1] : 1
              }}
              transition={{ 
                rotate: { 
                  duration: 10, // 6 RPM = 1 rotation per 10 seconds
                  repeat: Number.POSITIVE_INFINITY, 
                  ease: "linear" 
                },
                scale: showHeartbeat ? {
                  duration: 1,
                  times: [0, 0.3, 0.5, 0.8, 1],
                  ease: "easeInOut"
                } : {
                  duration: 0
                }
              }}
            >
              <Image
                src="/logo.png"
                alt="HNWI Chronicles Globe"
                width={24}
                height={24}
                className="w-auto h-auto"
                style={{ width: '24px', height: '24px' }}
                priority
              />
            </motion.div>
            <div className={`text-lg md:text-xl font-bold font-heading tracking-tight`}>
              <span style={{ color: theme === "dark" ? "#e6d5c1" : "#5b4d4a" }}>HNWI</span>{" "}
              <span style={{ color: theme === "dark" ? "#ffffff" : "#121212" }}>CHRONICLES</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">{children}</div>
      </div>
    </header>
  )
}

