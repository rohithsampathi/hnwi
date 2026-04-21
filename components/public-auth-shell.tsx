"use client"

import type React from "react"

import { OnboardingProvider } from "@/contexts/onboarding-context"
import { ThemeProvider } from "@/contexts/theme-context"

export function PublicAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>{children}</OnboardingProvider>
    </ThemeProvider>
  )
}
