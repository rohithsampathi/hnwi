"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative z-30 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.25)] transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 ${
        theme === "dark" ? "text-white hover:text-[#22C55E] bg-[#1A1A1A]/80" : "text-gray-800 hover:text-[#059669] bg-white/80"
      }`}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

