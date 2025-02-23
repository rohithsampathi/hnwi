

// components/app-wrapper.tsx
"use client"

import { useState, useEffect } from "react"
import { AppContent } from "./app-content"

interface AppWrapperProps {
  // Add any props if needed
}

export default function AppWrapper(props: AppWrapperProps) {
  const [currentPage, setCurrentPage] = useState<string>("splash")
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  useEffect(() => {
    // Ensures we're mounted and hydrated before showing content
    setIsInitialized(true)
  }, [])

  const handleNavigate = (route: string) => {
    setCurrentPage(route)
  }

  if (!isInitialized) {
    return null // Or a loading spinner component
  }

  return <AppContent currentPage={currentPage} onNavigate={handleNavigate} />
}
