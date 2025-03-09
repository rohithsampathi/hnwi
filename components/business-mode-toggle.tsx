"use client"

import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { useTheme } from "@/contexts/theme-context"

export function BusinessModeToggle() {
  const { isBusinessMode, toggleBusinessMode } = useBusinessMode()
  const { theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBusinessMode}
      aria-label={`Switch to ${isBusinessMode ? "standard" : "business"} mode`}
      className={`relative z-30 ${
        theme === "dark" ? "text-white hover:text-[#BBDEFB]" : "text-gray-800 hover:text-[#1976D2]"
      }`}
    >
      <Zap className={`h-5 w-5 ${isBusinessMode ? "text-yellow-400" : ""}`} />
    </Button>
  )
}