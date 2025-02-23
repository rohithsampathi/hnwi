// components/dashboard/quick-access-links.tsx

"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { User, Settings } from "lucide-react"

export function QuickAccessLinks({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { theme } = useTheme()

  const handleNavigation = useCallback(
    (route: string) => {
      onNavigate(route)
    },
    [onNavigate],
  )

  const links = [
    { name: "Profile", icon: User, route: "profile" },
    { name: "Settings", icon: Settings, route: "settings" },
  ]

  return (
    <div className="flex justify-center space-x-6">
      {links.map((link, index) => (
        <Button
          key={index}
          variant="outline"
          className={`rounded-full w-20 h-20 p-0 flex flex-col items-center justify-center transition-all duration-300 ${
            theme === "dark"
              ? "bg-[#1A1A1A] text-[#BBDEFB] hover:bg-[#333] hover:text-[#E0E0E0] hover:shadow-[0_0_15px_rgba(66,165,245,0.4)]"
              : "bg-white text-[#1976D2] hover:bg-[#E0E0E0] hover:text-[#0D47A1] hover:shadow-[0_0_15px_rgba(25,118,210,0.4)]"
          }`}
          onClick={() => handleNavigation(link.route)}
        >
          <link.icon className="h-8 w-8 mb-1" />
          <span className="text-xs">{link.name}</span>
        </Button>
      ))}
    </div>
  )
}

