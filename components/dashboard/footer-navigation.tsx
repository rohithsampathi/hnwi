// components/dashboard/footer-navigation.tsx

import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { Home, Shield, CalendarIcon, Crown, UserCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FooterNavigation({
  onNavigate,
}: {
  onNavigate: (route: string) => void
}) {
  const { theme } = useTheme()

  const navItems = [
    { name: "Home", icon: Home, route: "dashboard" },
    { name: "War Room", icon: Shield, route: "war-room" },
    { name: "Calendar", icon: CalendarIcon, route: "calendar-page" },
    { name: "Privé Exchange", icon: Crown, route: "prive-exchange", beta: true },
    { name: "Profile", icon: UserCircle2, route: "profile" },
  ]

  const handleNavigate = (e: React.MouseEvent, route: string) => {
    e.preventDefault()
    // Fix the route path if needed
    const correctedRoute = route === "dashboard" ? "/" : route
    onNavigate(correctedRoute)
  }

  return (
    <footer
      className={`${
        theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
      } py-2 md:py-4 px-2 md:px-4 border-t ${theme === "dark" ? "border-[#333]" : "border-[#E0E0E0]"}`}
    >
      <nav className="flex justify-around mt-1 md:mt-2">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`flex flex-col items-center transition-all duration-300 p-1 md:p-2 ${
              theme === "dark"
                ? "text-[#E0E0E0] hover:text-[#BBDEFB] hover:bg-[#333]"
                : "text-[#424242] hover:text-[#1976D2] hover:bg-[#F5F5F5]"
            }`}
            onClick={(e) => handleNavigate(e, item.route)}
          >
            <>
              <div className="flex items-center mb-1">
                <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                {(item.beta || item.live) && (
                  <Badge variant="secondary" className="ml-1 text-[6px] md:text-[8px] px-1 py-0">
                    {item.beta ? "Beta" : "Live"}
                  </Badge>
                )}
              </div>
              <span className="text-[8px] md:text-xs">{item.name}</span>
            </>
          </Button>
        ))}
      </nav>
    </footer>
  )
}