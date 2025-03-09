"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type BusinessModeContextType = {
  isBusinessMode: boolean
  toggleBusinessMode: () => void
  showBanner: boolean
}

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined)

export function BusinessModeProvider({ children }: { children: React.ReactNode }) {
  const [isBusinessMode, setIsBusinessMode] = useState<boolean>(true)
  const [showBanner, setShowBanner] = useState<boolean>(false)

  const toggleBusinessMode = () => {
    setIsBusinessMode((prev) => !prev)
    setShowBanner(true)
    
    // Hide banner after 5 seconds
    setTimeout(() => {
      setShowBanner(false)
    }, 5000)
  }

  return (
    <BusinessModeContext.Provider value={{ isBusinessMode, toggleBusinessMode, showBanner }}>
      {children}
    </BusinessModeContext.Provider>
  )
}

export const useBusinessMode = () => {
  const context = useContext(BusinessModeContext)
  if (context === undefined) {
    throw new Error("useBusinessMode must be used within a BusinessModeProvider")
  }
  return context
}