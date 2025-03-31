// components/dashboard/footer-navigation.tsx

import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Home, Shield, CalendarIcon, Crown, UserCircle2, Users2, Globe, Store } from "lucide-react"
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
    // { name: "Calendar", icon: CalendarIcon, route: "calendar-page", alwaysShow: true },
    { name: "HNWI World", icon: Globe, route: "strategy-vault", live: true, alwaysShow: true },
    { name: "Social Hub", icon: Users2, route: "social-hub", beta: true, alwaysShow: true },
    { name: "Privé Exchange", icon: Store, route: "prive-exchange", beta: true, alwaysShow: true },
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
      <div className="max-w-7xl mx-auto w-full">
        <nav className="flex justify-around mt-1 md:mt-2">
          {visibleNavItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center transition-all duration-300 p-1 md:p-2 cursor-pointer ${
                theme === "dark"
                  ? "text-[#E0E0E0] hover:text-[#BBDEFB]"
                  : "text-[#424242] hover:text-[#1976D2]"
              }`}
              onClick={(e) => handleNavigate(e, item.route)}
              style={{ boxShadow: "none !important" }}
            >
              <>
                <div className="flex items-center mb-1">
                  <item.icon className="h-4 w-4 md:h-5 md:w-5 font-bold" />
                  {(item.beta || item.live) && (
                    <Badge variant="secondary" className="ml-1 text-[6px] md:text-[8px] px-1 py-0 badge-beta">
                      {item.beta ? "Beta" : "Live"}
                    </Badge>
                  )}
                </div>
                <span className="text-[8px] md:text-xs font-bold">{item.name}</span>
              </>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  )
}