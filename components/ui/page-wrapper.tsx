// components/ui/page-wrapper.tsx
// Universal wrapper to ensure consistent top spacing for all pages

"use client"

import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="pt-20">
      {children}
    </div>
  )
}