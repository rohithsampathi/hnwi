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
  const [isBusinessMode, setIsBusinessMode] = useState<boolean>(false)
  const [showBanner, setShowBanner] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  
  // Load business mode from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBusinessMode = localStorage.getItem('businessMode');
      if (savedBusinessMode !== null) {
        setIsBusinessMode(savedBusinessMode === 'true');
      } else {
        // Set default if no saved value
        localStorage.setItem('businessMode', 'true');
        setIsBusinessMode(true);
      }
      setIsInitialized(true);
    }
  }, []);
  
  // Save business mode state to localStorage whenever it changes
  // Only save after initial load is complete
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('businessMode', isBusinessMode.toString());
    }
  }, [isBusinessMode, isInitialized]);

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