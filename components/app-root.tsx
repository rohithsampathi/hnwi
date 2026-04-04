// LEGACY APP SHELL STACK
// This file belongs to the pre-App Router navigation/auth architecture.
// The live application now enters through `app/` route layouts instead.
// Keep this file only as a legacy reference until the old stack is archived.

"use client"

import { AppStateProvider } from "@/contexts/app-state-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { BusinessModeProvider } from "@/contexts/business-mode-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { AuthPopupProvider } from "@/contexts/auth-popup-context"
import { StepUpMfaProvider } from "@/contexts/step-up-mfa-context"
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
            <StepUpMfaProvider>
              <AppStateProvider initialPage={initialPage}>
                <AppShell />
              </AppStateProvider>
            </StepUpMfaProvider>
          </AuthPopupProvider>
        </OnboardingProvider>
      </BusinessModeProvider>
    </ThemeProvider>
  )
}

export default AppRoot
