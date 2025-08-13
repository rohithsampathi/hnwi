// components/dashboard/sidebar-navigation.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"
import { useBusinessMode } from "@/contexts/business-mode-context"
import { Home, Crown, UserCircle2, Globe, Store, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function SidebarNavigation({
  onNavigate,
  headerHeight = 0,
}: {
  onNavigate: (route: string) => void
  headerHeight?: number
}) {
  const { theme } = useTheme()
  const { isBusinessMode } = useBusinessMode()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const navItems = [
    { name: "Home", icon: Home, route: "dashboard" },
    { name: "HNWI World", icon: Globe, route: "strategy-vault" },
    { name: "Crown Vault", icon: Crown, route: "crown-vault" },
    { name: "Privé Exchange", icon: Store, route: "prive-exchange" },
    { name: "Profile", icon: UserCircle2, route: "profile" },
  ]

  const handleNavigate = (route: string) => {
    onNavigate(route)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 bg-background border-r border-border shadow-xl transition-all duration-300 z-40",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{
          top: `${Math.max(headerHeight, 80)}px`,
          height: `calc(100vh - ${Math.max(headerHeight, 80)}px)`
        }}
      >
        <div className="flex flex-col h-full">
          {/* Toggle button */}
          <div className="p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full h-12 flex items-center justify-center hover:bg-muted rounded-lg transition-all duration-200"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </Button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-3">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.route}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-4 h-12 px-4 font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-all duration-200",
                    isCollapsed && "justify-center px-0 gap-0"
                  )}
                  onClick={() => handleNavigate(item.route)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                  )}
                </Button>
              ))}
            </div>
          </nav>

          {/* Bottom branding */}
          {!isCollapsed && (
            <div className="p-4 border-t border-border bg-card">
              <div className="text-xs text-muted-foreground font-medium tracking-wide text-center">
                HNWI CHRONICLES
              </div>
              <div className="text-xs text-muted-foreground/70 text-center mt-1">
                Premium Edition
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay when sidebar is open */}
      {!isCollapsed && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}