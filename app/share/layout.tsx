// app/share/layout.tsx
// Minimal layout for public share pages - bypasses auth providers

import type React from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { NotificationProvider } from "@/contexts/notification-context"
import '../globals.css'

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <BusinessModeProvider>
        <NotificationProvider
          enablePolling={false}
          pollInterval={30000}
          enableSounds={false}
          enableBrowserNotifications={false}
        >
          {children}
        </NotificationProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}
