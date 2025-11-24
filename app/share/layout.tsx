// app/share/layout.tsx
// Minimal layout for public share pages - bypasses auth providers

import type React from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import '../globals.css'

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
