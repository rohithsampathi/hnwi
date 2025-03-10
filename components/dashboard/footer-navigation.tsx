// components/dashboard/footer-navigation.tsx

import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Home, Shield, CalendarIcon, Crown, UserCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FooterNavigation({
  onNavigate,
}: {
  onNavigate: (route: string) => void
}) {
  const { theme } = useTheme()
  const { isBusinessMode } = useBusinessMode()

  const navItems = [
    { name: "Home", icon: Home, route: "dashboard", alwaysShow: true },
    { name: "War Room", icon: Shield, route: "war-room", alwaysShow: false },
    { name: "Calendar", icon: CalendarIcon, route: "calendar-page", alwaysShow: true },
    { name: "Privé Exchange", icon: Crown, route: "prive-exchange", beta: true, alwaysShow: true },
    { name: "Profile", icon: UserCircle2, route: "profile", alwaysShow: true },
  ]

  // Filter items based on business mode
  const visibleNavItems = navItems.filter(item => isBusinessMode || item.alwaysShow)

  const handleNavigate = (e: React.MouseEvent, route: string) => {
    e.preventDefault()
    // Always use the actual route name, don't convert to "/"
    // console.log("Footer navigation: navigating to", route);
    onNavigate(route)
  }

  return (
    <footer
      className={`${
        theme === "dark" ? "bg-[#1A1A1A]" : "bg-white"
      } py-2 md:py-4 px-2 md:px-4 border-t ${theme === "dark" ? "border-[#333]" : "border-[#E0E0E0]"}`}
    >
      <nav className="flex justify-around mt-1 md:mt-2">
        {visibleNavItems.map((item, index) => (
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