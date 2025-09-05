// components/app-root.tsx - World-Class App Root with Centralized State

"use client"

import { AppStateProvider } from "@/contexts/app-state-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import AppShell from "./app-shell"

interface AppRootProps {
  initialPage?: string
}

export function AppRoot({ initialPage }: AppRootProps) {
  return (
    <ThemeProvider>
      <BusinessModeProvider>
        <OnboardingProvider>
          <AuthPopupProvider>
            <AppStateProvider initialPage={initialPage}>
              <AppShell />
            </AppStateProvider>
          </AuthPopupProvider>
        </OnboardingProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}

export default AppRoot