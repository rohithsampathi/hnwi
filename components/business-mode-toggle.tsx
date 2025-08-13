"use client"

import { User, Briefcase } from "lucide-react"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { useTheme } from "@/contexts/theme-context"
import { Switch } from "@/components/ui/switch"

export function BusinessModeToggle() {
  const { isBusinessMode, toggleBusinessMode } = useBusinessMode()
  const { theme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
        {isBusinessMode ? "Business" : "Personal"}
      </span>
      <div className={`relative z-30 flex items-center space-x-1 px-2 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all ${
        theme === "dark" ? "text-white hover:text-[#BBDEFB] bg-[#1A1A1A]/80" : "text-gray-800 hover:text-[#1976D2] bg-white/80"
      }`}>
        {isBusinessMode ? (
          <Briefcase className={`h-4 w-4 ${isBusinessMode ? "text-yellow-400" : ""}`} />
        ) : (
          <User className={`h-4 w-4`} />
        )}
        <Switch
          checked={isBusinessMode}
          onCheckedChange={toggleBusinessMode}
          aria-label={`Switch to ${isBusinessMode ? "personal" : "business"} mode`}
          className="h-4 w-8 data-[state=checked]:bg-yellow-400"
        />
      </div>
    </div>
  )
}