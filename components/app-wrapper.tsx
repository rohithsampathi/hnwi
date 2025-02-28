

// components/app-wrapper.tsx
"use client"

import { useState, useEffect } from "react"
import { AppContent } from "./app-content"
import { Toaster } from "@/components/ui/toaster"

interface AppWrapperProps {
  initialRoute?: string | null
}

export default function AppWrapper({ initialRoute }: AppWrapperProps) {
  const [currentPage, setCurrentPage] = useState<string>("splash")
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  useEffect(() => {
    // Ensures we're mounted and hydrated before showing content
    setIsInitialized(true)
    
    // Check for token to determine if user is logged in
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    
    // Handle initial route if provided
    if (initialRoute && token && userId) {
      // If we have an initial route and user is logged in, navigate to it immediately
      setCurrentPage(initialRoute)
    } else if (token && userId) {
      // If user is logged in but no initial route, go to dashboard
      setCurrentPage("dashboard")
    }
  }, [initialRoute])

  const handleNavigate = (route: string) => {
    setCurrentPage(route)
  }

  if (!isInitialized) {
    return null // Or a loading spinner component
  }

  return (
    <>
      <AppContent currentPage={currentPage} onNavigate={handleNavigate} />
      <Toaster />
    </>
  )
}
