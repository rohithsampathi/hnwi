"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
      <div className={`relative z-30 flex items-center space-x-1 px-2 py-1 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all ${
        theme === "dark" ? "text-white hover:text-[#22C55E] bg-[#1A1A1A]/80" : "text-gray-800 hover:text-[#059669] bg-white/80"
      }`}>
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <Switch
          checked={theme === "dark"}
          onCheckedChange={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="h-4 w-8 data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  )
}

